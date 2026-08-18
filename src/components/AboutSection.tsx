"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import {
  Briefcase,
  GraduationCap,
  Award,
  Download,
  ExternalLink,
  Code2,
  CheckCircle2,
  Calendar,
  Building,
  FileText,
  Sparkles
} from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

export function AboutSection() {
  const { profile, themeConfig, setIsAdminModalOpen } = useApp();

  const skills = [
    { name: "Frontend Development", items: ["React.js", "Next.js 15", "TypeScript", "Tailwind CSS", "Framer Motion", "HTML5/CSS3"] },
    { name: "Backend Architecture", items: ["Node.js", "Express.js", "PostgreSQL", "Drizzle ORM", "Supabase", "REST & GraphQL"] },
    { name: "Mobile & Hybrid", items: ["Flutter", "Dart", "Android APK", "Progressive Web Apps (PWA)"] },
    { name: "Tools & Cloud", items: ["Git / GitHub", "Docker", "Cloudinary CDN", "Vercel / Netlify", "Razorpay Payment API"] },
  ];

  const experienceTimeline = [
    {
      role: "Lead Full Stack Developer",
      company: "HarshDev Digital Solutions",
      period: "2023 - Present",
      description: "Architected and delivered 30+ full stack web and mobile products using Next.js, Supabase, and PostgreSQL.",
    },
    {
      role: "Frontend Engineer & UI Specialist",
      company: "CyberVerse Labs",
      period: "2022 - 2023",
      description: "Crafted high performance glassmorphism web applications with Tailwind CSS, Framer Motion, and WebGL animations.",
    },
    {
      role: "Software Developer Intern",
      company: "TechNova Systems",
      period: "2021 - 2022",
      description: "Developed backend REST APIs, authentication pipelines, and database optimization algorithms.",
    },
  ];

  const education = [
    {
      degree: "Bachelor of Technology in Computer Science & Engineering",
      institution: "State Technological University",
      year: "2020 - 2024",
      score: "8.9 CGPA",
    },
  ];

  const achievements = [
    "Winner - National Level Web Development Hackathon 2024",
    "Published 5+ Popular Android APK Utilities with 50K+ combined downloads",
    "Built open-source UI libraries with 1,000+ GitHub stars",
    "Top Rated Freelance Developer with 100% Client Satisfaction",
  ];

  return (
    <section id="about" className="py-12 px-4 md:px-8 max-w-6xl mx-auto space-y-12">
      {/* Section Header */}
      <ScrollReveal className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-400">
          <Sparkles className="w-3.5 h-3.5" /> MY JOURNEY & SKILLS
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          About <span style={{ color: themeConfig.primary }}>Harsh Dev</span>
        </h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Delivering end-to-end digital experiences through robust backend infrastructure and breathtaking glass UI interfaces.
        </p>
      </ScrollReveal>

      {/* Main Grid: Biography & Interactive Resume Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Bio & Skills */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-emerald-500/25 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5" style={{ color: themeConfig.primary }} />
              Developer Biography
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {profile?.bio ||
                "I'm a passionate Full Stack Developer who loves building scalable, beautiful and high performance web applications."}
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              With expertise in modern JavaScript frameworks, cloud databases, audio player engines, and mobile application engineering, I turn complex ideas into seamless user experiences.
            </p>
          </div>

          {/* Skills Matrix Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skills.map((cat, idx) => (
              <div key={idx} className="glass-card rounded-2xl p-4 border border-emerald-500/20 space-y-3">
                <h4 className="text-sm font-bold text-white border-b border-emerald-500/20 pb-2" style={{ color: themeConfig.primary }}>
                  {cat.name}
                </h4>
                <ul className="space-y-1.5">
                  {cat.items.map((skill, sIdx) => (
                    <li key={sIdx} className="flex items-center gap-2 text-xs text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Resume Card & Timeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Resume Quick Action Card */}
          <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 space-y-4 relative overflow-hidden bg-gradient-to-br from-emerald-950/40 to-slate-900/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <FileText className="w-6 h-6" style={{ color: themeConfig.primary }} />
                <h3 className="text-lg font-bold text-white">Interactive Resume</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PDF Ready
              </span>
            </div>

            <p className="text-xs text-gray-300">
              Download the official full stack developer resume or view details online.
            </p>

            <div className="flex flex-col gap-2">
              <a
                href={profile?.resumeUrl || "/resume/Harsh_Dev_Resume.pdf"}
                target="_blank"
                rel="noreferrer"
                download
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-black flex items-center justify-center gap-2 transition-all hover:scale-102 shadow-[0_0_15px_rgba(0,255,136,0.3)]"
                style={{ backgroundColor: themeConfig.primary }}
              >
                <Download className="w-4 h-4" />
                <span>Download Resume (PDF)</span>
              </a>

              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="w-full py-2 px-4 rounded-xl text-[11px] font-medium text-gray-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-center"
              >
                Admin: Upload / Update Resume Link
              </button>
            </div>
          </div>

          {/* Achievements Card */}
          <div className="glass-card rounded-3xl p-6 border border-emerald-500/20 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Achievements & Recognition
            </h3>
            <ul className="space-y-2">
              {achievements.map((ach, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                  <span className="text-amber-400 font-bold">★</span>
                  <span>{ach}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Experience & Education Timeline */}
      <div className="space-y-6 pt-4">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <Briefcase className="w-6 h-6" style={{ color: themeConfig.primary }} />
          <span>Work Experience Timeline</span>
        </h3>

        <div className="space-y-4 relative border-l-2 border-emerald-500/30 pl-6 ml-3">
          {experienceTimeline.map((exp, idx) => (
            <div key={idx} className="relative group">
              <div
                className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-emerald-400 bg-slate-900 group-hover:scale-125 transition-transform"
                style={{ borderColor: themeConfig.primary }}
              />
              <div className="glass-card rounded-2xl p-5 border border-emerald-500/20 space-y-1 hover:border-emerald-400/40 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-base font-bold text-white">{exp.role}</h4>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    {exp.period}
                  </span>
                </div>
                <p className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  {exp.company}
                </p>
                <p className="text-xs text-gray-300 pt-1 leading-relaxed">
                  {exp.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
