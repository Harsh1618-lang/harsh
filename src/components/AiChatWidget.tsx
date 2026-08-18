"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import {
  Bot,
  Sparkles,
  Send,
  X,
  Loader2,
  User,
  ExternalLink,
  Trash2,
  RotateCcw,
  Globe2,
  MessageCircle,
  Heart,
} from "lucide-react";

// Shared sizing constants for the floating action-button stack (AI Assistant +
// Support/Donate). Both buttons are stacked VERTICALLY, right-aligned, one
// directly above the other: AI Assistant sits at the very bottom (closest to
// the bottom nav / audio player), and the Heart/Donate button sits directly
// above it — sharing the exact same width, height, and right offset so the
// two form one clean, perfectly right-aligned vertical column (never
// side-by-side, and never drifting to the left).
const FAB_SIZE = 56; // w-14 h-14
const FAB_GAP = 14; // vertical gap between the two stacked buttons
const FAB_MARGIN = 16; // gap above the bottom nav / audio player safe area

// Robust, measurement-based bottom offset — reads the real, JS-reported
// height of whichever bottom bar is currently visible (audio player takes
// priority over the bottom nav when a song is playing) instead of guessing
// with hardcoded Tailwind breakpoint classes.
const SAFE_AREA = "var(--safe-area-audio-player, var(--safe-area-bottom-nav, 96px))";
// AI Assistant button — bottom-most of the pair.
const AI_BUTTON_BOTTOM = `calc(${SAFE_AREA} + ${FAB_MARGIN}px)`;
// Heart/Donate button — stacked directly above the AI Assistant button.
const HEART_BUTTON_BOTTOM = `calc(${SAFE_AREA} + ${FAB_MARGIN}px + ${FAB_SIZE}px + ${FAB_GAP}px)`;
// Chat panel opens above both floating buttons.
const CHAT_PANEL_BOTTOM = `calc(${SAFE_AREA} + ${FAB_MARGIN}px + ${(FAB_SIZE + FAB_GAP) * 2}px)`;

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; url: string }[];
  isError?: boolean;
}

const STORAGE_KEY = "harshdev_ai_chat_history_v1";
const SUGGESTED_PROMPTS = [
  "Who is the Prime Minister of India?",
  "What is the capital of Japan?",
  "Explain React vs Next.js",
  "What is 45 * 12 + 8?",
];

/** Very small markdown-lite renderer: bold, links, line breaks, bullet points. */
function renderFormatted(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*)|(\[(.+?)\]\((.+?)\))/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) parts.push(line.slice(lastIndex, match.index));
      if (match[2]) {
        parts.push(
          <strong key={key++} className="font-bold text-white">
            {match[2]}
          </strong>
        );
      } else if (match[4] && match[5]) {
        parts.push(
          <a
            key={key++}
            href={match[5]}
            target="_blank"
            rel="noreferrer"
            className="text-emerald-400 underline hover:text-emerald-300 inline-flex items-center gap-0.5"
          >
            {match[4]}
            <ExternalLink className="w-3 h-3" />
          </a>
        );
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < line.length) parts.push(line.slice(lastIndex));

    const trimmed = line.trim();
    if (trimmed.startsWith("• ")) {
      return (
        <div key={i} className="flex gap-2 pl-1">
          <span className="text-emerald-400">•</span>
          <span>{parts.length ? parts : line.replace("• ", "")}</span>
        </div>
      );
    }
    if (trimmed === "---") {
      return <hr key={i} className="border-emerald-500/15 my-2" />;
    }
    if (trimmed.length === 0) return <div key={i} className="h-2" />;
    return <p key={i}>{parts.length ? parts : line}</p>;
  });
}

export function AiChatWidget() {
  const { themeConfig, setIsDonationOpen } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Restore chat history from localStorage
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch {
      // ignore corrupted storage
    }
  }, []);

  // Persist chat history
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      // storage unavailable — non-critical
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
      const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, history }),
        });
        const data = await res.json();

        if (!res.ok) {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: data.error || "Something went wrong. Please try again.",
              isError: true,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: data.answer,
              sources: data.sources || [],
            },
          ]);
          if (!isOpen) setHasUnread(true);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Network error — please check your connection and try again.",
            isError: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, isOpen]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <>
      {/* Heart / Support / Donate button — stacked directly ABOVE the AI
          Assistant button. Both share the identical `right` offset (right-4
          sm:right-6) and identical width, so this sits perfectly aligned
          with the button below it — never drifting to the left. */}
      <button
        onClick={() => setIsDonationOpen(true)}
        className="fixed z-[70] right-4 sm:right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          bottom: HEART_BUTTON_BOTTOM,
          background: "rgba(7, 19, 24, 0.9)",
          border: "1.5px solid rgba(244, 63, 94, 0.5)",
          boxShadow: "0 0 20px rgba(244, 63, 94, 0.35), 0 4px 20px rgba(0,0,0,0.4)",
        }}
        title="Support the Creator — send a donation"
      >
        <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
      </button>

      {/* AI Assistant Launcher Button — bottom-most, docked just above the
          bottom nav / audio player. */}
      <button
        onClick={() => {
          setIsOpen((prev) => !prev);
          setHasUnread(false);
        }}
        className="fixed z-[70] right-4 sm:right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          bottom: AI_BUTTON_BOTTOM,
          background: `linear-gradient(135deg, ${themeConfig.primary}, ${themeConfig.secondary})`,
          boxShadow: `0 0 25px ${themeConfig.primary}66, 0 4px 20px rgba(0,0,0,0.4)`,
        }}
        title="Ask HarshDev AI — free web-powered chat assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-black" />
        ) : (
          <Bot className="w-6 h-6 text-black" />
        )}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-[#060d0f] animate-pulse" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed z-[65] right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] max-w-[400px] flex flex-col rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{
            bottom: CHAT_PANEL_BOTTOM,
            // Height is capped dynamically instead of a flat `65vh` class:
            // on short mobile viewports, a flat vh value plus this panel's
            // own (fairly large) bottom offset could push its top edge up
            // into/behind the sticky header. Subtracting the bottom offset
            // and a fixed header-clearance allowance from the real viewport
            // height guarantees the top edge always stays below the header,
            // no matter the device height or which bottom bar is showing.
            height: "min(560px, 65vh)",
            maxHeight: `calc(100dvh - ${CHAT_PANEL_BOTTOM} - 96px)`,
            background: "rgba(7, 19, 24, 0.97)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${themeConfig.primary}35`,
            boxShadow: `0 0 50px ${themeConfig.primary}22, 0 20px 60px rgba(0,0,0,0.6)`,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
            style={{ borderColor: `${themeConfig.primary}25`, background: "rgba(0,255,136,0.04)" }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: `${themeConfig.primary}20`, border: `1px solid ${themeConfig.primary}50` }}
              >
                <Bot className="w-4.5 h-4.5" style={{ color: themeConfig.primary }} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  HarshDev AI
                  <Sparkles className="w-3 h-3" style={{ color: themeConfig.primary }} />
                </h3>
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Globe2 className="w-2.5 h-2.5" /> Free • Searches the web live
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Clear conversation"
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-6 space-y-4">
                <div
                  className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
                  style={{ background: `${themeConfig.primary}12`, border: `1px solid ${themeConfig.primary}35` }}
                >
                  <MessageCircle className="w-6 h-6" style={{ color: themeConfig.primary }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Ask me anything!</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                    I'm a free AI assistant that searches the live web (DuckDuckGo + Wikipedia) to answer your questions — just like ChatGPT.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center pt-1">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-[11px] px-3 py-1.5 rounded-full text-gray-300 transition-all hover:text-white"
                      style={{
                        background: "rgba(0,255,136,0.05)",
                        border: `1px solid ${themeConfig.primary}25`,
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={
                    msg.role === "user"
                      ? { background: "rgba(255,255,255,0.08)" }
                      : { background: `${themeConfig.primary}20`, border: `1px solid ${themeConfig.primary}40` }
                  }
                >
                  {msg.role === "user" ? (
                    <User className="w-3.5 h-3.5 text-gray-300" />
                  ) : (
                    <Bot className="w-3.5 h-3.5" style={{ color: themeConfig.primary }} />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed space-y-1 ${
                    msg.role === "user" ? "text-white" : msg.isError ? "text-red-300" : "text-gray-200"
                  }`}
                  style={
                    msg.role === "user"
                      ? { background: `${themeConfig.primary}20`, border: `1px solid ${themeConfig.primary}35` }
                      : msg.isError
                      ? { background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.25)" }
                      : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }
                  }
                >
                  {renderFormatted(msg.content)}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5 mt-1.5 border-t border-white/10">
                      {msg.sources.slice(0, 3).map((s, i) =>
                        s.url ? (
                          <a
                            key={i}
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 text-gray-400 hover:text-emerald-300 transition-colors"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                          >
                            <Globe2 className="w-2.5 h-2.5" />
                            {s.title.slice(0, 22)}
                            {s.title.length > 22 ? "…" : ""}
                          </a>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${themeConfig.primary}20`, border: `1px solid ${themeConfig.primary}40` }}
                >
                  <Bot className="w-3.5 h-3.5" style={{ color: themeConfig.primary }} />
                </div>
                <div
                  className="rounded-2xl px-4 py-3 flex items-center gap-2 text-xs text-gray-400"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: themeConfig.primary }} />
                  Searching the web...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t flex items-center gap-2 flex-shrink-0"
            style={{ borderColor: `${themeConfig.primary}20` }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              maxLength={1000}
              className="flex-1 px-4 py-2.5 rounded-full text-xs text-white bg-white/5 border focus:outline-none placeholder-gray-500"
              style={{ borderColor: `${themeConfig.primary}25` }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
              style={{ backgroundColor: themeConfig.primary }}
            >
              <Send className="w-4 h-4 text-black" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
