"use client";

import React from "react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import {
  ArrowRight,
  Code2,
  Users,
  Rocket,
  Music2,
  UserRound,
  Download,
  ExternalLink,
  Camera,
  Send,
  MessageCircle,
  Globe,
} from "lucide-react";

// Map SRD platform names -> available lucide icon components
const SOCIAL_ICONS: Record<string, React.ElementType> = {
  Github: Code2,
  Linkedin: ExternalLink,
  Send,
  Instagram: Camera,
  MessageCircle,
  Mail: Globe,
  Globe,
};

/* ── Brand tech icons (small SVG glyphs like reference image) ── */
function JsIcon() {
  return (
    <span className="w-6 h-6 rounded-md bg-[#f7df1e] text-black font-black text-[10px] flex items-center justify-center flex-shrink-0">
      JS
    </span>
  );
}

function ReactIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0" fill="none">
      <circle cx="12" cy="12" r="2" fill="#61dafb" />
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61dafb" strokeWidth="1.2" />
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61dafb" strokeWidth="1.2" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61dafb" strokeWidth="1.2" transform="rotate(120 12 12)" />
    </svg>
  );
}

function NodeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0">
      <path
        d="M12 1.5 21.5 7v10L12 22.5 2.5 17V7L12 1.5Z"
        fill="none"
        stroke="#68a063"
        strokeWidth="1.6"
      />
      <text x="12" y="15" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#68a063">
        node
      </text>
    </svg>
  );
}

function MongoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0">
      <path
        d="M12 2c3 4 5 7 5 11 0 4.5-3 7.5-5 9-2-1.5-5-4.5-5-9 0-4 2-7 5-11Z"
        fill="#47a248"
      />
      <path d="M12 8v13" stroke="#2d6a30" strokeWidth="1" />
    </svg>
  );
}

function TailwindIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0" fill="#38bdf8">
      <path d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35C13.39 10.85 14.55 12 17 12c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.31-.74-1.91-1.35C15.61 7.15 14.45 6 12 6ZM7 12c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35C8.39 16.85 9.55 18 12 18c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.31-.74-1.91-1.35C10.61 13.15 9.45 12 7 12Z" />
    </svg>
  );
}

function PostgresIcon() {
  return (
    <span className="w-6 h-6 rounded-full bg-[#336791]/30 border border-[#336791] text-[11px] flex items-center justify-center flex-shrink-0">
      🐘
    </span>
  );
}

export function HeroSection() {
  const { profile, setActiveTab, themeConfig, socialLinksList } = useApp();

  const techStack = [
    { name: "JavaScript", icon: <JsIcon /> },
    { name: "React", icon: <ReactIcon /> },
    { name: "Node.js", icon: <NodeIcon /> },
    { name: "MongoDB", icon: <MongoIcon /> },
    { name: "Tailwind", icon: <TailwindIcon /> },
    { name: "PostgreSQL", icon: <PostgresIcon /> },
  ];

  const stats = [
    {
      value: profile?.projectsCompleted ? `${profile.projectsCompleted}+` : "50+",
      label: "Projects Completed",
      icon: Code2,
    },
    {
      value: profile?.happyClients ? `${profile.happyClients}+` : "30+",
      label: "Happy Clients",
      icon: Users,
    },
    {
      value: profile?.yearsExperience || "2+",
      label: "Years of Experience",
      icon: Rocket,
    },
    {
      value: profile?.cupsOfCode || "500+",
      label: "Cups of Code",
      icon: Music2,
    },
  ];

  const name = profile?.name || "Harsh Dev";
  // Split role title: "Full Stack Developer." → "Full Stack" (gradient) + "Developer." (white)
  const roleTitle: string = profile?.roleTitle || "Full Stack Developer.";
  const roleWords = roleTitle.replace(/\.+$/, "").split(" ");
  const lastWord = roleWords.pop() || "Developer";
  const gradientPart = roleWords.join(" ");

  const tagline =
    profile?.tagline ||
    "I design and build complete web products — from database to pixel with clean code and fast, reliable interfaces.";
  const avatar = profile?.avatarUrl || "/images/harsh-dev-profile.jpg";
  const availability = profile?.availability || "Available for work";

  const goTo = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="pt-8 pb-10 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
      {/* ── TOP ROW: Heading (left) + Circular Photo (right) - side by side like reference ── */}
      <div className="flex flex-row items-start justify-between gap-3 sm:gap-8">
        {/* Left: PORTFOLIO tag + Big Heading */}
        <div className="flex-1 min-w-0 pt-2">
          <div
            className="font-mono text-xs sm:text-sm font-bold tracking-[0.25em] mb-4 sm:mb-6"
            style={{ color: themeConfig.primary }}
          >
            // PORTFOLIO
          </div>

          <h1 className="font-black tracking-tight leading-[1.05] text-white text-[9vw] sm:text-5xl lg:text-6xl">
            <span className="block">{name}</span>
            {gradientPart && (
              <span
                className="block bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(to right, ${themeConfig.primary}, ${themeConfig.secondary})`,
                  filter: `drop-shadow(0 0 14px ${themeConfig.primary}50)`,
                }}
              >
                {gradientPart}
              </span>
            )}
            <span className="block">
              {lastWord}
              <span style={{ color: themeConfig.primary }}>.</span>
            </span>
          </h1>
        </div>

        {/* Right: Circular Photo with Animated Glowing Ring + Available badge */}
        <div className="flex flex-col items-center flex-shrink-0 pt-4 sm:pt-2">
          <div className="relative w-[38vw] h-[38vw] max-w-[170px] max-h-[170px] sm:max-w-[260px] sm:max-h-[260px] sm:w-64 sm:h-64 lg:w-72 lg:h-72">
            {/* Soft glow behind */}
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-45 animate-pulse"
              style={{ backgroundColor: themeConfig.primary }}
            />
            {/* Spinning conic gradient ring */}
            <div className="ring-animated" />
            {/* Static glow ring */}
            <div
              className="absolute -inset-1.5 rounded-full"
              style={{ boxShadow: `0 0 34px ${themeConfig.primary}66, inset 0 0 22px ${themeConfig.primary}33` }}
            />
            {/* Photo */}
            <div
              className="relative w-full h-full rounded-full overflow-hidden p-1 bg-[#09181c]"
              style={{ border: `2px solid ${themeConfig.primary}66` }}
            >
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src={avatar}
                  alt={name}
                  fill
                  priority
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>

          {/* Available for work badge */}
          <div
            className="mt-3 sm:-mt-4 z-10 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full flex items-center gap-2 backdrop-blur-xl bg-[#0a1b20]/90 whitespace-nowrap"
            style={{
              border: `1px solid ${themeConfig.primary}55`,
              boxShadow: `0 0 16px ${themeConfig.primary}30`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: themeConfig.primary, boxShadow: `0 0 8px ${themeConfig.primary}` }}
            />
            <span className="text-[10px] sm:text-sm font-semibold text-gray-100">
              {availability}
            </span>
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      <p className="text-gray-400 text-sm sm:text-lg max-w-md leading-relaxed mt-5 sm:mt-2">
        {tagline}
      </p>

      {/* ── Buttons: Get In Touch (filled) + Download Resume + View Work (glass outline) ── */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-7">
        <button
          onClick={() => goTo("contact")}
          className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl font-bold text-black flex items-center gap-2.5 text-sm sm:text-base transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: themeConfig.primary,
            boxShadow: `0 0 24px ${themeConfig.primary}55`,
          }}
        >
          <span>Get In Touch</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <a
          href={profile?.resumeUrl || "/resume/Harsh_Dev_Resume.pdf"}
          download
          target="_blank"
          rel="noreferrer"
          className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl font-semibold text-white flex items-center gap-2.5 text-sm sm:text-base backdrop-blur-md bg-white/[0.03] transition-all duration-300 hover:bg-white/[0.08] hover:scale-105"
          style={{ border: `1px solid ${themeConfig.primary}40` }}
        >
          <Download className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: themeConfig.primary }} />
          <span>Download Resume</span>
        </a>

        <button
          onClick={() => goTo("courses")}
          className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl font-semibold text-white flex items-center gap-2.5 text-sm sm:text-base backdrop-blur-md bg-white/[0.03] transition-all duration-300 hover:bg-white/[0.08] hover:scale-105"
          style={{ border: `1px solid ${themeConfig.primary}40` }}
        >
          <span>View Work</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* ── Social Icons Row (GitHub, LinkedIn, Telegram, Instagram, WhatsApp) ── */}
      <div className="flex items-center gap-2.5 sm:gap-3 mt-5">
        {(socialLinksList.length > 0
          ? socialLinksList.filter((s) => s.isVisible !== false)
          : [
              { platform: "github", label: "GitHub", url: "https://github.com", icon: "Github", color: "#e2e8f0" },
              { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com", icon: "Linkedin", color: "#0A66C2" },
              { platform: "telegram", label: "Telegram", url: "https://t.me", icon: "Send", color: "#229ED9" },
              { platform: "instagram", label: "Instagram", url: "https://instagram.com", icon: "Instagram", color: "#E1306C" },
              { platform: "whatsapp", label: "WhatsApp", url: "https://wa.me/919999999999", icon: "MessageCircle", color: "#25D366" },
            ]
        ).map((s, idx) => {
          const Icon = SOCIAL_ICONS[s.icon] || Globe;
          return (
            <a
              key={s.platform + idx}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              title={s.label}
              className="w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 hover:-translate-y-1 backdrop-blur-md"
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
            >
              <Icon className="w-4 h-4" />
            </a>
          );
        })}
      </div>

      {/* ── Tech Stack Pills Card (brand icons like reference) ── */}
      <div
        className="mt-8 sm:mt-10 p-4 sm:p-6 rounded-[2rem] backdrop-blur-xl bg-white/[0.02]"
        style={{ border: `1px solid ${themeConfig.primary}20` }}
      >
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-base font-semibold text-gray-100 backdrop-blur-md bg-[#0b1a20]/80 transition-all hover:scale-105"
              style={{
                border: `1px solid ${themeConfig.primary}22`,
                boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
              }}
            >
              {tech.icon}
              <span>{tech.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats Cards (2x2 mobile, 4 cols desktop) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="rounded-[1.75rem] p-5 sm:p-6 text-center space-y-3 backdrop-blur-xl bg-white/[0.02] transition-all duration-300 hover:-translate-y-1"
              style={{ border: `1px solid ${themeConfig.primary}20` }}
            >
              <div
                className="inline-flex p-3 rounded-full"
                style={{
                  backgroundColor: `${themeConfig.primary}10`,
                  border: `1px solid ${themeConfig.primary}35`,
                }}
              >
                <Icon
                  className="w-6 h-6 sm:w-7 sm:h-7"
                  strokeWidth={1.6}
                  style={{ color: themeConfig.primary }}
                />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {stat.value}
              </div>
              <p className="text-xs sm:text-sm text-gray-400 font-medium leading-snug">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── About Me Card (like reference bottom card) ── */}
      <div
        className="mt-4 sm:mt-6 rounded-[2rem] p-5 sm:p-7 backdrop-blur-xl bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden"
        style={{ border: `1px solid ${themeConfig.primary}22` }}
      >
        {/* Decorative dotted wave (right side) */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden sm:block"
          style={{
            backgroundImage: `radial-gradient(${themeConfig.primary} 1px, transparent 1px)`,
            backgroundSize: "12px 12px",
            maskImage: "linear-gradient(to left, black, transparent)",
            WebkitMaskImage: "linear-gradient(to left, black, transparent)",
          }}
        />

        <div className="flex items-start sm:items-center gap-4 sm:gap-5">
          {/* Circular user icon */}
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: `${themeConfig.primary}0d`,
              border: `1.5px solid ${themeConfig.primary}45`,
            }}
          >
            <UserRound
              className="w-7 h-7 sm:w-8 sm:h-8"
              strokeWidth={1.5}
              style={{ color: themeConfig.primary }}
            />
          </div>

          <div>
            <h3
              className="text-lg sm:text-xl font-bold mb-1"
              style={{ color: themeConfig.primary }}
            >
              About Me
            </h3>
            <p className="text-sm sm:text-base text-gray-300 max-w-lg leading-relaxed">
              {profile?.bio ||
                "I'm a passionate Full Stack Developer who loves building scalable, beautiful and high performance web applications."}
            </p>
          </div>
        </div>

        <button
          onClick={() => goTo("about")}
          className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm font-semibold text-white flex items-center gap-2 whitespace-nowrap transition-all hover:scale-105 self-end sm:self-auto relative z-10 backdrop-blur-md"
          style={{ border: `1.5px solid ${themeConfig.primary}55`, backgroundColor: `${themeConfig.primary}0a` }}
        >
          <span>More About Me</span>
          <ArrowRight className="w-4 h-4" style={{ color: themeConfig.primary }} />
        </button>
      </div>
    </section>
  );
}
