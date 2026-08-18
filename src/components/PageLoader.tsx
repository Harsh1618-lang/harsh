"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";

/**
 * Premium branded loading screen shown on first mount.
 * Displays logo + animated progress bar, then fades out.
 */
export function PageLoader() {
  const { themeConfig } = useApp();
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 22;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => setHidden(true), 350);
          return 100;
        }
        return next;
      });
    }, 140);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || hidden) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#050b0d] transition-opacity duration-500"
      style={{
        opacity: progress >= 100 ? 0 : 1,
        // Stop capturing clicks the instant the fade-out starts, rather
        // than waiting for the 350ms timeout + unmount below. An
        // opacity:0 element is still fully present for hit-testing — a
        // full-viewport, z-[999] div sitting invisibly on top of the page
        // for even a brief window would silently block every click across
        // the entire site (nav, header, floating buttons, everything).
        pointerEvents: progress >= 100 ? "none" : "auto",
      }}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-50 animate-pulse"
            style={{ backgroundColor: themeConfig.primary }}
          />
          <span
            className="relative font-black text-2xl sm:text-3xl tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span style={{ color: themeConfig.primary }}>&lt;&lt;</span>
            <span className="text-white">Harsh</span>
            <span style={{ color: themeConfig.primary }}>Dev/&gt;</span>
          </span>
        </div>

        <div className="w-48 sm:w-64 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-150 ease-out"
            style={{
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: themeConfig.primary,
              boxShadow: `0 0 12px ${themeConfig.primary}`,
            }}
          />
        </div>

        <p className="text-[11px] font-mono tracking-widest text-gray-500 uppercase">
          Loading premium experience...
        </p>
      </div>
    </div>
  );
}
