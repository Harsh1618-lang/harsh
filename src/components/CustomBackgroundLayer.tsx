"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

/**
 * Renders the admin-configured custom background image (Admin Panel >
 * Website Builder > Custom Background) behind the aurora/particle layer.
 * Renders nothing if no custom background has been set.
 *
 * Deliberately uses z-0 (NOT a negative z-index) and relies on being mounted
 * before <ParticlesBackground> in page.tsx: two `position: fixed` siblings
 * with the same z-index paint in DOM order, so this still ends up behind the
 * aurora/particle layer. A negative z-index looks tempting but is a classic
 * CSS trap here — since <body> has its own opaque background-color, a
 * negative-z-index fixed child can end up painted BEHIND that body
 * background too and disappear completely.
 */
export function CustomBackgroundLayer() {
  const { settings } = useApp();
  const url = settings?.customBackgroundUrl;
  if (!url) return null;

  const opacity = parseFloat(settings?.customBackgroundOpacity ?? "0.35") || 0.35;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: `url(${url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        opacity,
      }}
      aria-hidden
    />
  );
}
