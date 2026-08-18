"use client";

import React from "react";
import { X, ShieldCheck, FileText, Cookie } from "lucide-react";
import { useApp } from "@/context/AppContext";

export type LegalDoc = "privacy" | "terms" | "cookies" | null;

const CONTENT: Record<
  Exclude<LegalDoc, null>,
  { title: string; icon: React.ElementType; body: string[] }
> = {
  privacy: {
    title: "Privacy Policy",
    icon: ShieldCheck,
    body: [
      "HarshDev Platform respects your privacy. We only collect the information you voluntarily submit through the contact form, donation form, or admin dashboard (name, email, message, donation amount).",
      "We never sell, rent, or share your personal data with third parties for marketing purposes.",
      "Basic analytics (page views, download counts, music play counts) are collected anonymously to improve the platform experience.",
      "Payment information for donations is processed securely via Razorpay/UPI and is never stored on our servers.",
      "You may request deletion of any personal data you've submitted by contacting us via the Contact section.",
    ],
  },
  terms: {
    title: "Terms of Service",
    icon: FileText,
    body: [
      "All courses, APK applications, and music tracks provided on the HarshDev platform are made available free of charge for personal and educational use.",
      "Donations are voluntary contributions to support the creator and do not unlock any paid/premium tier — all content remains free for everyone.",
      "APK files are provided as-is; users should verify permissions before installing on their devices. HarshDev is not liable for third-party app behavior.",
      "Course video content is embedded from YouTube and subject to YouTube's own Terms of Service.",
      "We reserve the right to update, modify, or remove content at any time without prior notice.",
    ],
  },
  cookies: {
    title: "Cookie Policy",
    icon: Cookie,
    body: [
      "This platform uses minimal cookies and local storage strictly for essential functionality — such as remembering your selected theme, font, and music queue.",
      "We do not use third-party advertising or tracking cookies.",
      "Basic, anonymized analytics (page views, downloads, plays) are stored server-side and are not tied to individual cookies.",
      "You can clear your browser's local storage at any time to reset all saved preferences.",
    ],
  },
};

export function LegalModal({ doc, onClose }: { doc: LegalDoc; onClose: () => void }) {
  const { themeConfig } = useApp();
  if (!doc) return null;

  const { title, icon: Icon, body } = CONTENT[doc];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-emerald-500/40 shadow-[0_0_50px_rgba(0,255,136,0.25)] bg-[#071318] max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-emerald-500/20 bg-emerald-950/30">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5" style={{ color: themeConfig.primary }} />
            <h3 className="text-base font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto text-xs text-gray-300 leading-relaxed">
          {body.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
          <p className="text-[10px] text-gray-500 pt-2 border-t border-emerald-500/10">
            Last updated: 2026 • HarshDev Platform
          </p>
        </div>

        <div className="p-4 border-t border-emerald-500/15">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full text-xs font-bold text-black"
            style={{ backgroundColor: themeConfig.primary }}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
