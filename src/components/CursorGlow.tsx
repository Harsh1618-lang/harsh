"use client";

import React, { useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";

/**
 * Premium cursor-glow effect (desktop only) — a soft radial light
 * that follows the mouse for that "liquid glass" premium feel.
 */
export function CursorGlow() {
  const { themeConfig } = useApp();
  const glowRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const handleMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMove);

    let raf: number;
    const animate = () => {
      current.current.x += (pos.current.x - current.current.x) * 0.15;
      current.current.y += (pos.current.y - current.current.y) * 0.15;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${current.current.x - 200}px, ${current.current.y - 200}px, 0)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="hidden md:block fixed top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-[5] opacity-[0.06] blur-3xl transition-opacity duration-500"
      style={{ backgroundColor: themeConfig.primary, willChange: "transform" }}
      aria-hidden
    />
  );
}
