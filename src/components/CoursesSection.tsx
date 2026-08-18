"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useApp, Course } from "@/context/AppContext";
import {
  Play,
  Eye,
  Clock,
  Sparkles,
  Search,
  Filter,
  GraduationCap
} from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";
import { getProgress, shouldResume } from "@/lib/videoProgress";

export function CoursesSection() {
  const { setActiveVideoCourse, themeConfig } = useApp();
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/courses");
      if (res.ok) {
        const data = await res.json();
        setCoursesList(data.courses || []);
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const defaultCategories = [
    "All",
    "Programming",
    "React",
    "JavaScript",
    "HTML",
    "CSS",
    "Firebase",
    "Supabase",
    "Flutter",
    "Android",
    "AI",
  ];

  const filteredCourses = coursesList.filter((c) => {
    const matchesCategory =
      selectedCategory === "All" ||
      c.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="courses" className="py-12 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      {/* Section Title */}
      <ScrollReveal className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-400">
          <GraduationCap className="w-3.5 h-3.5" /> FREE FULL STACK COURSES
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          Master Modern <span style={{ color: themeConfig.primary }}>Engineering</span>
        </h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          100% Free high-yield video masterclasses. Watch inside the website without ads or interruptions.
        </p>
      </ScrollReveal>

      {/* Search & Category Filter Pills */}
      <div className="space-y-4">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
          <input
            type="text"
            placeholder="Search courses by topic (React, AI, Supabase...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-full glass-card text-xs sm:text-sm text-white border border-emerald-500/30 focus:border-emerald-400 focus:outline-none placeholder-gray-400"
          />
        </div>

        {/* Scrollable Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center">
          {defaultCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "text-black shadow-[0_0_15px_rgba(0,255,136,0.4)]"
                  : "text-gray-300 bg-emerald-950/20 border border-emerald-500/20 hover:border-emerald-400/40 hover:text-white"
              }`}
              style={
                selectedCategory === cat
                  ? { backgroundColor: themeConfig.primary }
                  : {}
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-3xl p-4 h-80 animate-pulse bg-emerald-950/20" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-3xl border border-emerald-500/20">
          <p className="text-gray-400 text-sm">No courses found matching "{searchQuery}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const progress = getProgress(course.id);
            const isResumable = progress && shouldResume(progress.time, progress.duration);
            return (
            <div
              key={course.id}
              className="glass-card rounded-3xl overflow-hidden border border-emerald-500/25 flex flex-col justify-between group hover:border-emerald-400/50 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
            >
              <div>
                {/* Thumbnail Container with Play Overlay */}
                <div
                  onClick={() => setActiveVideoCourse(course)}
                  className="relative aspect-video w-full overflow-hidden cursor-pointer bg-slate-900 group"
                >
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-black shadow-lg group-hover:scale-115 transition-transform"
                      style={{ backgroundColor: themeConfig.primary }}
                    >
                      <Play className="w-6 h-6 fill-black ml-0.5" />
                    </div>
                  </div>

                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-black/70 backdrop-blur-md text-emerald-300 border border-emerald-400/30">
                    {course.category}
                  </span>

                  {isResumable && (
                    <span
                      className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md border"
                      style={{ color: themeConfig.primary, borderColor: `${themeConfig.primary}50` }}
                    >
                      ▶ Continue Watching
                    </span>
                  )}

                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-white flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    {course.duration}
                  </span>

                  {/* Remember Progress bar */}
                  {isResumable && progress!.duration > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                      <div
                        className="h-full"
                        style={{
                          width: `${Math.min(100, (progress!.time / progress!.duration) * 100)}%`,
                          backgroundColor: themeConfig.primary,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-white line-clamp-2 group-hover:text-emerald-300 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="px-5 pb-5 pt-2 border-t border-emerald-500/15 flex items-center justify-between">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  {course.views.toLocaleString()} views
                </span>

                <button
                  onClick={() => setActiveVideoCourse(course)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-400/30 hover:bg-emerald-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Play className="w-3 h-3 fill-emerald-300" />
                  <span>Watch Now</span>
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
