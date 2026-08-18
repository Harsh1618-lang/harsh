"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";

export function ParticlesBackground() {
  const { themeConfig } = useApp();
  const [particles, setParticles] = useState<Array<{ id: number; top: number; left: number; size: number; duration: number; delay: number }>>([]);

  useEffect(() => {
    const pts = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 3,
    }));
    setParticles(pts);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Background Aurora Radial Glows */}
      <div
        className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 transition-all duration-700 pointer-events-none"
        style={{ background: themeConfig.primary }}
      />
      <div
        className="absolute top-[40%] -right-[15%] w-[700px] h-[700px] rounded-full blur-[160px] opacity-20 transition-all duration-700 pointer-events-none"
        style={{ background: themeConfig.secondary }}
      />
      <div
        className="absolute -bottom-[20%] left-[20%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 transition-all duration-700 pointer-events-none"
        style={{ background: themeConfig.accent }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />

      {/* Floating Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle opacity-60"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: themeConfig.primary,
            boxShadow: `0 0 10px ${themeConfig.primary}`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
