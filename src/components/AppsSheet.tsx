"use client";

import React, { useState, useEffect } from "react";
import { useApp, AppAPK } from "@/context/AppContext";
import {
  X,
  Search,
  Download,
  Smartphone,
  ExternalLink,
  Send,
  Star,
  CheckCircle,
  Sparkles,
  ArrowUpRight
} from "lucide-react";

export function AppsSheet() {
  const { isAppsDrawerOpen, setIsAppsDrawerOpen, themeConfig } = useApp();
  const [appsList, setAppsList] = useState<AppAPK[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const loadApps = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/apps");
      if (res.ok) {
        const data = await res.json();
        setAppsList(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAppsDrawerOpen) {
      loadApps();
    }
  }, [isAppsDrawerOpen]);

  const appCategories = [
    "All",
    "Developer Tools",
    "Customization",
    "Music & Audio",
    "AI Tools",
    "Utility",
  ];

  const filteredApps = appsList.filter((a) => {
    const matchesCategory =
      selectedCategory === "All" ||
      a.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDownload = async (app: AppAPK) => {
    try {
      await fetch("/api/apps/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId: app.id }),
      });
      window.open(app.apkUrl, "_blank");
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAppsDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in slide-in-from-bottom duration-300">
      <div className="relative w-full max-w-4xl glass-panel rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col border border-emerald-500/40 shadow-[0_0_50px_rgba(0,255,136,0.3)] bg-[#071318]">
        
        {/* Top Drag Handle / Header */}
        <div className="p-4 border-b border-emerald-500/20 bg-emerald-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">HarshDev APK App Store</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Verified Clean APKs
            </span>
          </div>

          <button
            onClick={() => setIsAppsDrawerOpen(false)}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-4 border-b border-emerald-500/15 space-y-3 bg-[#0a181d]">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
            <input
              type="text"
              placeholder="Search APKs, tools, launchers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full glass-card text-xs text-white border border-emerald-500/30 focus:border-emerald-400 focus:outline-none placeholder-gray-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 justify-start sm:justify-center">
            {appCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "text-black shadow-[0_0_12px_rgba(0,255,136,0.4)]"
                    : "text-gray-300 bg-emerald-950/20 border border-emerald-500/20 hover:text-white"
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

        {/* APK List Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[60vh]">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 glass-card rounded-2xl animate-pulse bg-emerald-950/20" />
              ))}
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              No APK applications found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="glass-card rounded-2xl p-4 border border-emerald-500/25 flex flex-col justify-between gap-3 group hover:border-emerald-400/50 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                      {app.icon || "📱"}
                    </div>

                    <div className="space-y-1 flex-grow">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-300">
                          {app.name}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/80 text-emerald-400 border border-emerald-500/30">
                          {app.version}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {app.rating || 4.9}
                        </span>
                        <span>•</span>
                        <span>{app.size}</span>
                        <span>•</span>
                        <span>{app.downloads.toLocaleString()} downloads</span>
                      </div>

                      <p className="text-xs text-gray-300 leading-relaxed line-clamp-2 pt-1">
                        {app.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-emerald-500/15">
                    <div className="flex items-center gap-2">
                      {app.telegramUrl && (
                        <a
                          href={app.telegramUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors"
                          title="Telegram Channel"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {app.playstoreUrl && (
                        <a
                          href={app.playstoreUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          title="Google Play Store"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {app.websiteUrl && (
                        <a
                          href={app.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                          title="Official Website"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => handleDownload(app)}
                      className="px-4 py-1.5 rounded-full text-xs font-bold text-black flex items-center gap-1.5 transition-all hover:scale-105 shadow-[0_0_12px_rgba(0,255,136,0.3)]"
                      style={{ backgroundColor: themeConfig.primary }}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download APK</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
