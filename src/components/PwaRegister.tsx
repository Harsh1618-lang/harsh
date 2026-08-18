"use client";

import { useEffect } from "react";

/**
 * Registers the service worker for offline caching / PWA install support.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {
          // silent fail - PWA is progressive enhancement only
        });
      });
    }
  }, []);

  return null;
}
