// Free, no-API-key web knowledge retrieval + optional LLM synthesis.
// Used by /api/ai-chat to power the "Ask AI" ChatGPT-style assistant that
// can answer "anything" by pulling real-time facts from the open web
// (DuckDuckGo Instant Answers + Wikipedia) — no paid Google/OpenAI key required.

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

/** Strip any stray HTML tags DuckDuckGo sometimes includes in text fields. */
function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * DuckDuckGo Instant Answer API — free, no key, no signup.
 * Great for definitions, quick facts, disambiguation & "who/what is" queries.
 */
async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  try {
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1&t=harshdev-ai`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return results;
    const data = await res.json();

    if (data.AbstractText) {
      results.push({
        title: data.Heading || query,
        snippet: stripHtml(data.AbstractText),
        url: data.AbstractURL || "",
      });
    }
    if (data.Answer) {
      results.push({
        title: "Direct Answer",
        snippet: stripHtml(String(data.Answer)),
        url: data.AbstractURL || "",
      });
    }
    if (data.Definition) {
      results.push({
        title: `Definition${data.DefinitionSource ? ` (${data.DefinitionSource})` : ""}`,
        snippet: stripHtml(data.Definition),
        url: data.DefinitionURL || "",
      });
    }
    if (Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics.slice(0, 5)) {
        if (topic.Text) {
          results.push({
            title: topic.Text.split(" - ")[0].slice(0, 80),
            snippet: stripHtml(topic.Text),
            url: topic.FirstURL || "",
          });
        } else if (Array.isArray(topic.Topics)) {
          for (const sub of topic.Topics.slice(0, 2)) {
            if (sub.Text) {
              results.push({
                title: sub.Text.split(" - ")[0].slice(0, 80),
                snippet: stripHtml(sub.Text),
                url: sub.FirstURL || "",
              });
            }
          }
        }
      }
    }
  } catch {
    // network hiccup / timeout — degrade gracefully to other sources
  }
  return results;
}

/**
 * Wikipedia full-text search + intro extract — free, no key.
 * Covers the long tail of "general knowledge" queries DuckDuckGo's
 * Instant Answer API doesn't have a boxed answer for.
 */
async function searchWikipedia(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  try {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query
      )}&format=json&origin=*&srlimit=3`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!searchRes.ok) return results;
    const searchData = await searchRes.json();
    const titles: string[] = (searchData?.query?.search || []).map((s: any) => s.title);
    if (titles.length === 0) return results;

    const extractRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&format=json&origin=*&titles=${encodeURIComponent(
        titles.join("|")
      )}`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!extractRes.ok) return results;
    const extractData = await extractRes.json();
    const pages = extractData?.query?.pages || {};

    for (const key of Object.keys(pages)) {
      const page = pages[key];
      if (page?.extract) {
        results.push({
          title: page.title,
          snippet: page.extract.slice(0, 700),
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`,
        });
      }
    }
  } catch {
    // ignore — Wikipedia is a supplement, not a hard dependency
  }
  return results;
}

/** Runs both free sources in parallel and de-dupes near-identical snippets. */
export async function searchWeb(query: string): Promise<SearchResult[]> {
  const [ddg, wiki] = await Promise.all([searchDuckDuckGo(query), searchWikipedia(query)]);
  const combined = [...ddg, ...wiki].filter((r) => r.snippet && r.snippet.length > 0);

  const seen = new Set<string>();
  const deduped: SearchResult[] = [];
  for (const r of combined) {
    const key = r.snippet.slice(0, 60).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(r);
    }
  }
  return deduped.slice(0, 6);
}

/** Safe arithmetic evaluator (no eval) for quick "what is 24*7+3" style queries. */
export function tryEvaluateMath(query: string): string | null {
  const cleaned = query
    .trim()
    .replace(/^(what is|calculate|solve|compute)\s+/i, "")
    .replace(/[?!.\s]+$/, "")
    .trim();
  if (!/^[0-9+\-*/().\s%^]+$/.test(cleaned) || !/[0-9]/.test(cleaned)) return null;
  if (!/[+\-*/^%]/.test(cleaned)) return null;

  try {
    const sanitized = cleaned.replace(/\^/g, "**");
    const tokens = sanitized.match(/(\d+\.?\d*|\*\*|[+\-*/().%])/g);
    if (!tokens || tokens.join("") !== sanitized.replace(/\s+/g, "")) return null;

    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${sanitized});`)();
    if (typeof result === "number" && Number.isFinite(result)) {
      return `**${cleaned.trim()} = ${result}**`;
    }
  } catch {
    return null;
  }
  return null;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface LlmProvider {
  name: string;
  envKey: string;
  call: (apiKey: string, messages: ChatMessage[]) => Promise<string>;
}

async function callOpenAiCompatible(
  baseUrl: string,
  model: string,
  apiKey: string,
  messages: ChatMessage[]
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.6,
      max_tokens: 700,
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`LLM provider error: ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || "";
}

async function callGemini(apiKey: string, messages: ChatMessage[]): Promise<string> {
  const systemMsg = messages.find((m) => m.role === "system")?.content || "";
  const conversation = messages.filter((m) => m.role !== "system");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemMsg }] },
        contents: conversation.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: { temperature: 0.6, maxOutputTokens: 700 },
      }),
      signal: AbortSignal.timeout(20000),
    }
  );
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

// Ordered by generosity of free tier. Any ONE of these env vars, if set,
// unlocks full conversational LLM answers synthesized from the search context.
const PROVIDERS: LlmProvider[] = [
  {
    name: "groq",
    envKey: "GROQ_API_KEY",
    call: (key, msgs) => callOpenAiCompatible("https://api.groq.com/openai/v1", "llama-3.3-70b-versatile", key, msgs),
  },
  {
    name: "openai",
    envKey: "OPENAI_API_KEY",
    call: (key, msgs) => callOpenAiCompatible("https://api.openai.com/v1", "gpt-4o-mini", key, msgs),
  },
  {
    name: "gemini",
    envKey: "GEMINI_API_KEY",
    call: (key, msgs) => callGemini(key, msgs),
  },
  {
    name: "openrouter",
    envKey: "OPENROUTER_API_KEY",
    call: (key, msgs) =>
      callOpenAiCompatible("https://openrouter.ai/api/v1", "meta-llama/llama-3.3-70b-instruct:free", key, msgs),
  },
];

export function getAvailableProvider(): LlmProvider | null {
  for (const provider of PROVIDERS) {
    const key = process.env[provider.envKey];
    if (key) return provider;
  }
  return null;
}

export async function synthesizeWithLlm(
  userQuery: string,
  history: ChatMessage[],
  results: SearchResult[]
): Promise<string | null> {
  const provider = getAvailableProvider();
  if (!provider) return null;
  const apiKey = process.env[provider.envKey]!;

  const context = results
    .map((r, i) => `[${i + 1}] ${r.title}: ${r.snippet}${r.url ? ` (${r.url})` : ""}`)
    .join("\n\n");

  const systemPrompt = `You are HarshDev AI — a free, friendly, ChatGPT-style assistant embedded on Harsh Dev's developer portfolio website. Answer the user's question naturally and conversationally, like ChatGPT does.

You have been given real-time web search results below. Use them to ground your answer in current, accurate facts whenever relevant, and cite sources inline like [1], [2] where helpful. If the search results are irrelevant or empty, just answer from your own knowledge. Keep answers concise but complete, use markdown (bold, bullet points) where useful, and never say you "cannot browse the internet" — you already have the search results provided.

Web search results for "${userQuery}":
${context || "(no relevant results found)"}`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...history.slice(-8),
    { role: "user", content: userQuery },
  ];

  try {
    const answer = await provider.call(apiKey, messages);
    return answer || null;
  } catch {
    return null;
  }
}

/** Formats raw search results into a helpful, ChatGPT-like reply when no LLM key is configured. */
export function formatFallbackAnswer(query: string, results: SearchResult[]): string {
  if (results.length === 0) {
    return `I looked this up but couldn't find a confident answer for **"${query}"** right now. Try rephrasing your question, or ask something more specific — I'm best at facts, definitions, "what is/who is" questions, and general knowledge lookups. 🔍`;
  }

  const top = results[0];
  let answer = `**${top.title}**\n\n${top.snippet}`;
  if (top.url) answer += `\n\n🔗 [Read more](${top.url})`;

  if (results.length > 1) {
    answer += `\n\n---\n**Related:**\n`;
    for (const r of results.slice(1, 4)) {
      answer += `\n• ${r.snippet.slice(0, 140)}${r.snippet.length > 140 ? "…" : ""}${r.url ? ` — [source](${r.url})` : ""}`;
    }
  }
  return answer;
}
