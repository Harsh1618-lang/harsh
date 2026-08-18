import { NextResponse } from "next/server";
import { db } from "@/db";
import { aiChatLogs } from "@/db/schema";
import {
  searchWeb,
  tryEvaluateMath,
  synthesizeWithLlm,
  formatFallbackAnswer,
  getAvailableProvider,
} from "@/lib/aiSearch";

// Basic in-memory rate limiting per IP to protect the free search/LLM backend from abuse.
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 5 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (bucket.count >= RATE_LIMIT) return true;
  bucket.count += 1;
  return false;
}

const GREETING_RE = /^(hi+|hello+|hey+|hola|namaste|yo|sup|good\s?(morning|afternoon|evening))[\s!.,]*$/i;
const THANKS_RE = /^(thanks?|thank\s?you|thx|ty|shukriya|dhanyavad|dhanyawad)(\s+(a\s?lot|so\s?much|very\s?much|buddy|bro|dear|man|bhai|dost))?[\s!.,]*$/i;

export async function GET() {
  return NextResponse.json({
    status: "ok",
    provider: getAvailableProvider()?.name || "free-search-only",
    message:
      "HarshDev AI Assistant is live. Uses free DuckDuckGo + Wikipedia web search for real-time answers, with optional LLM synthesis if an API key (GROQ_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY / OPENROUTER_API_KEY) is configured.",
  });
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "You're sending messages a bit too fast. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const query: string = (body.message || "").toString().trim().slice(0, 1000);
    const history: { role: "user" | "assistant"; content: string }[] = Array.isArray(body.history)
      ? body.history.slice(-10)
      : [];

    if (!query) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    // Instant conversational replies (no need to hit the network for these)
    if (GREETING_RE.test(query)) {
      const answer = "Hey there! 👋 I'm **HarshDev AI** — ask me anything and I'll search the web in real-time to find you an answer, just like ChatGPT!";
      await logChat(query, answer, "instant");
      return NextResponse.json({ answer, source: "instant", sources: [] });
    }
    if (THANKS_RE.test(query)) {
      const answer = "You're welcome! 😊 Ask me anything else — I'm always here.";
      await logChat(query, answer, "instant");
      return NextResponse.json({ answer, source: "instant", sources: [] });
    }

    // Quick, exact arithmetic without needing web search or an LLM call
    const mathAnswer = tryEvaluateMath(query);
    if (mathAnswer) {
      await logChat(query, mathAnswer, "math");
      return NextResponse.json({ answer: mathAnswer, source: "math", sources: [] });
    }

    // Real-time free web knowledge retrieval (DuckDuckGo Instant Answers + Wikipedia)
    const results = await searchWeb(query);

    // If an LLM API key is configured, synthesize a natural, ChatGPT-style answer
    // grounded in the search results. Otherwise, gracefully format the raw results.
    const llmAnswer = await synthesizeWithLlm(query, history, results);
    const answer = llmAnswer || formatFallbackAnswer(query, results);
    const source = llmAnswer ? "llm" : results.length > 0 ? "search" : "search";

    await logChat(query, answer, source, results.map((r) => ({ title: r.title, url: r.url })));

    return NextResponse.json({
      answer,
      source,
      sources: results.map((r) => ({ title: r.title, url: r.url })),
    });
  } catch (error: any) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "Something went wrong while fetching an answer. Please try again." },
      { status: 500 }
    );
  }
}

async function logChat(
  query: string,
  answer: string,
  source: string,
  sourcesUsed?: { title: string; url: string }[]
) {
  try {
    await db.insert(aiChatLogs).values({
      query,
      answer: answer.slice(0, 4000),
      source,
      sourcesUsed: sourcesUsed || null,
    });
  } catch {
    // logging is best-effort; never block the chat response on DB issues
  }
}
