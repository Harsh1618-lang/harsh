"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Heart,
  Code2,
  ExternalLink,
  Camera,
  Users,
  Send,
  Mail,
  Globe,
  MessageCircle,
} from "lucide-react";
import { LegalModal, LegalDoc } from "./LegalModal";

const ICONS: Record<string, React.ElementType> = {
  Github: Code2,
  Linkedin: ExternalLink,
  Send,
  Instagram: Camera,
  Facebook: Users,
  MessageCircle,
  Mail,
  Globe,
};

export function Footer() {
  const { setActiveTab, themeConfig, settings, socialLinksList } = useApp();
  const [legalDoc, setLegalDoc] = useState<LegalDoc>(null);

  const visibleSocials = socialLinksList.filter((s) => s.isVisible !== false);

  return (
    <footer className="border-t border-emerald-500/20 bg-[#040a0c]/90 text-gray-400 text-xs py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        {/* Brand */}
        <div className="space-y-4 md:col-span-1">
          <div className="font-extrabold text-lg text-emerald-400 font-mono">
            &lt;&lt;{settings?.navbarLogoText || "HarshDev"}/&gt;&gt;
          </div>
          <p className="text-gray-400 leading-relaxed">
            {settings?.footerText ||
              "Premium Full Stack Developer Portfolio, Free Masterclasses, Android APK Utilities & Cyber Audio Soundtracks."}
          </p>

          {/* Animated glow social icon row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {visibleSocials.map((s) => {
              const Icon = ICONS[s.icon] || Globe;
              return (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 hover:-translate-y-1"
                  style={{
                    borderColor: `${s.color}55`,
                    backgroundColor: `${s.color}12`,
                    color: s.color,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 16px ${s.color}80`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                  title={s.label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">
            Platform Navigation
          </h4>
          <ul className="space-y-1.5">
            {["home", "about", "courses", "apps", "music", "contact"].map((nav) => (
              <li key={nav}>
                <button
                  onClick={() => {
                    setActiveTab(nav);
                    const el = document.getElementById(nav);
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-emerald-300 capitalize transition-colors"
                >
                  {nav}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources & Policies */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">
            Resources & Legal
          </h4>
          <ul className="space-y-1.5">
            <li>
              <a href={settings?.resumeUrl || "/resume/Harsh_Dev_Resume.pdf"} download className="hover:text-emerald-300">
                Official Resume PDF
              </a>
            </li>
            <li>
              <button onClick={() => setLegalDoc("privacy")} className="hover:text-emerald-300">
                Privacy Policy
              </button>
            </li>
            <li>
              <button onClick={() => setLegalDoc("terms")} className="hover:text-emerald-300">
                Terms of Service
              </button>
            </li>
            <li>
              <button onClick={() => setLegalDoc("cookies")} className="hover:text-emerald-300">
                Cookie Policy
              </button>
            </li>
          </ul>
        </div>

        {/* Tech Stack Badge */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">
            Tech Architecture
          </h4>
          <p className="text-gray-400">
            Powered by Next.js 15, PostgreSQL, Drizzle ORM, Tailwind CSS, Cloudinary & Razorpay.
          </p>
          <p className="text-[10px] text-emerald-500/70 font-mono pt-1">
            PWA Ready • SEO Optimized • Lighthouse 95+
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-6 border-t border-emerald-500/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
        <p>© 2026 {settings?.navbarLogoText || "Harsh Dev"}. All rights reserved.</p>
        <p className="flex items-center gap-1 text-gray-400">
          Crafted with <Heart className="w-3 h-3 text-emerald-400 fill-emerald-400" /> for developers worldwide.
        </p>
      </div>

      <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />
    </footer>
  );
}
