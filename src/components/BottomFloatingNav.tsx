"use client";

import React, { useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { Home, GraduationCap, LayoutGrid, Music2 } from "lucide-react";

export function BottomFloatingNav() {
  const { activeTab, setActiveTab, setIsAppsDrawerOpen, themeConfig, settings } = useApp();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Admin-editable tab labels (Admin Panel > Website Builder > Navbar Labels)
  const navLabels = {
    home: settings?.navLabels?.home || "Home",
    courses: settings?.navLabels?.courses || "Course",
    apps: settings?.navLabels?.apps || "Apps",
    music: settings?.navLabels?.music || "Music",
  };

  // Report this nav's real, measured height (distance from viewport bottom to
  // its top edge) as a CSS variable so other fixed floating elements (AI
  // assistant button, Support/Donate button) can stack reliably above it
  // instead of relying on hardcoded/guessed Tailwind breakpoint offsets.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const distanceFromBottom = Math.round(window.innerHeight - rect.top + 12);
      document.documentElement.style.setProperty("--safe-area-bottom-nav", `${distanceFromBottom}px`);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  const bottomItems = [
    { id: "home", label: navLabels.home, icon: Home },
    { id: "courses", label: navLabels.courses, icon: GraduationCap },
    {
      id: "apps",
      label: navLabels.apps,
      icon: LayoutGrid,
      action: () => setIsAppsDrawerOpen(true),
    },
    { id: "music", label: navLabels.music, icon: Music2 },
  ];

  return (
    <div ref={containerRef} className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 px-3 w-full max-w-md pointer-events-auto">
      <div
        className="rounded-[2rem] px-3 pt-2 pb-1.5 backdrop-blur-2xl bg-[#07131a]/92"
        style={{
          border: `1px solid ${themeConfig.primary}30`,
          boxShadow: `0 0 30px ${themeConfig.primary}18, inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        <div className="flex items-center justify-around">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.action) {
                    item.action();
                  } else {
                    const el = document.getElementById(item.id);
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="flex flex-col items-center gap-0.5 py-1 transition-all duration-300 relative"
              >
                {/* Icon wrapper - active gets rounded outline box like reference */}
                <span
                  className="flex flex-col items-center justify-center px-5 py-1.5 rounded-2xl transition-all duration-300"
                  style={
                    isActive
                      ? {
                          border: `1.5px solid ${themeConfig.primary}70`,
                          backgroundColor: `${themeConfig.primary}0d`,
                          boxShadow: `0 0 14px ${themeConfig.primary}30`,
                        }
                      : { border: "1.5px solid transparent" }
                  }
                >
                  <Icon
                    className="w-5 h-5"
                    strokeWidth={1.8}
                    style={{ color: isActive ? themeConfig.primary : "#d1d5db" }}
                  />
                </span>

                <span
                  className="text-[11px] font-semibold"
                  style={{ color: isActive ? "#ffffff" : "#9ca3af" }}
                >
                  {item.label}
                </span>

                {/* Active green dot below */}
                <span
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{
                    backgroundColor: isActive ? themeConfig.primary : "transparent",
                    boxShadow: isActive ? `0 0 6px ${themeConfig.primary}` : "none",
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* iOS-style home indicator line */}
        <div className="flex justify-center mt-0.5">
          <span className="w-24 h-1 rounded-full bg-gray-500/50" />
        </div>
      </div>
    </div>
  );
}
