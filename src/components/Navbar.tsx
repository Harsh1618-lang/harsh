"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PRESET_THEMES } from "@/lib/themes";
import {
  User,
  Briefcase,
  Code2,
  Mail,
  Menu,
  X,
  Palette,
  ShieldCheck,
  Heart,
  Sparkles,
  Music2,
  GraduationCap,
  Smartphone,
  Sun,
  Moon,
  Type
} from "lucide-react";

export function Navbar() {
  const {
    activeTab,
    setActiveTab,
    activeThemeName,
    setUserTheme,
    resetToDefaultTheme,
    hasUserThemeOverride,
    activeFontColor,
    setUserFontColor,
    resetUserFontColor,
    hasUserFontColorOverride,
    setIsAdminModalOpen,
    isAdminLoggedIn,
    setIsDonationOpen,
    setIsAppsDrawerOpen,
    themeConfig,
    settings,
    colorMode,
    toggleColorMode,
  } = useApp();

  const [fontColorPickerOpen, setFontColorPickerOpen] = useState(false);

  const logoText = settings?.navbarLogoText || "HarshDev";
  // Admin-editable tab labels (Admin Panel > Website Builder > Navbar Labels),
  // with sensible defaults so the site works even before any settings are saved.
  const navLabels = {
    home: settings?.navLabels?.home || "Home",
    about: settings?.navLabels?.about || "About",
    courses: settings?.navLabels?.courses || "Courses",
    apps: settings?.navLabels?.apps || "Apps",
    music: settings?.navLabels?.music || "Music",
    contact: settings?.navLabels?.contact || "Contact",
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);

  const handleLogoClick = () => {
    setActiveTab("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
    const count = logoClickCount + 1;
    setLogoClickCount(count);
    if (count >= 3) {
      setIsAdminModalOpen(true);
      setLogoClickCount(0);
    }
  };

  const goTo = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Icon-only buttons like the reference image (person, briefcase, code, mail)
  const iconButtons = [
    { id: "about", icon: User, title: navLabels.about },
    { id: "courses", icon: Briefcase, title: navLabels.courses },
    { id: "apps", icon: Code2, title: navLabels.apps, action: () => setIsAppsDrawerOpen(true) },
    { id: "contact", icon: Mail, title: navLabels.contact },
  ];

  const menuItems = [
    { id: "about", label: navLabels.about, icon: User },
    { id: "courses", label: navLabels.courses, icon: GraduationCap },
    { id: "apps", label: navLabels.apps, icon: Smartphone, action: () => setIsAppsDrawerOpen(true) },
    { id: "music", label: navLabels.music, icon: Music2 },
    { id: "contact", label: navLabels.contact, icon: Mail },
  ];

  return (
    <header className="fixed top-3 left-0 right-0 z-50 px-3 sm:px-4 md:px-8 max-w-7xl mx-auto">
      {/* Liquid Glass Rounded Pill Navbar - exactly like reference */}
      <div
        className="rounded-full pl-4 pr-2 sm:pl-6 sm:pr-3 py-2.5 sm:py-3 flex items-center justify-between backdrop-blur-2xl bg-[#08141a]/85 border shadow-[0_0_30px_rgba(0,255,136,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]"
        style={{ borderColor: `${themeConfig.primary}35` }}
      >
        {/* Logo — editable via Admin > Website Builder > Navbar Logo Text */}
        <button
          onClick={handleLogoClick}
          className="flex items-center font-extrabold text-base sm:text-xl tracking-tight focus:outline-none whitespace-nowrap"
          title={`${logoText} (tap 3x for Admin)`}
        >
          <span style={{ color: themeConfig.primary }}>&lt;&lt;</span>
          <span className="text-white">{logoText}</span>
          <span style={{ color: themeConfig.primary }}>/&gt;</span>
        </button>

        {/* Right side: icon buttons + hamburger (Home is available in the bottom nav) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Icon-only nav buttons (like reference: person, briefcase, code, mail) */}
          {iconButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = activeTab === btn.id;
            return (
              <button
                key={btn.id}
                title={btn.title}
                onClick={() => {
                  if (btn.action) {
                    setActiveTab(btn.id);
                    btn.action();
                  } else {
                    goTo(btn.id);
                  }
                }}
                className={`hidden xs:flex sm:flex p-2 sm:p-2.5 rounded-full transition-all duration-300 hover:scale-110 ${
                  isActive ? "" : "text-gray-200 hover:text-white"
                }`}
                style={isActive ? { color: themeConfig.primary } : {}}
              >
                <Icon className="w-[18px] h-[18px] sm:w-5 sm:h-5" strokeWidth={1.8} />
              </button>
            );
          })}

          {/* Light / Dark Theme Toggle */}
          <button
            onClick={toggleColorMode}
            title={colorMode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="relative p-2 sm:p-2.5 rounded-full text-gray-200 hover:text-white transition-all hover:scale-110"
          >
            {colorMode === "dark" ? (
              <Moon className="w-[18px] h-[18px] sm:w-5 sm:h-5" strokeWidth={1.8} style={{ color: themeConfig.primary }} />
            ) : (
              <Sun className="w-[18px] h-[18px] sm:w-5 sm:h-5" strokeWidth={1.8} style={{ color: "#f59e0b" }} />
            )}
          </button>

          {/* Hamburger Menu */}
          <button
            onClick={() => {
              setMenuOpen((p) => !p);
              setThemeOpen(false);
            }}
            className="p-2 sm:p-2.5 rounded-full text-gray-200 hover:text-white transition-all"
          >
            {menuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.8} />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.8} />
            )}
          </button>
        </div>
      </div>

      {/* Dropdown Menu (hamburger) */}
      {menuOpen && (
        <div className="absolute right-3 sm:right-8 mt-2 w-64 rounded-3xl p-3 z-50 backdrop-blur-2xl bg-[#08141a]/95 border shadow-2xl space-y-1 animate-in fade-in slide-in-from-top-2"
          style={{ borderColor: `${themeConfig.primary}35` }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setMenuOpen(false);
                  if (item.action) {
                    setActiveTab(item.id);
                    item.action();
                  } else {
                    goTo(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                  isActive ? "" : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: `${themeConfig.primary}18`,
                        color: themeConfig.primary,
                        border: `1px solid ${themeConfig.primary}50`,
                      }
                    : {}
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="border-t my-1" style={{ borderColor: `${themeConfig.primary}25` }} />

          {/* Support Creator */}
          <button
            onClick={() => {
              setMenuOpen(false);
              setIsDonationOpen(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium text-pink-400 hover:bg-pink-500/10 transition-all"
          >
            <Heart className="w-4 h-4 fill-pink-400" />
            <span>Support Creator</span>
          </button>

          {/* Light / Dark Mode toggle */}
          <button
            onClick={toggleColorMode}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-all"
          >
            <span className="flex items-center gap-3">
              {colorMode === "dark" ? (
                <Moon className="w-4 h-4" style={{ color: themeConfig.primary }} />
              ) : (
                <Sun className="w-4 h-4" style={{ color: "#f59e0b" }} />
              )}
              <span>{colorMode === "dark" ? "Dark Mode" : "Light Mode"}</span>
            </span>
            <span
              className="w-9 h-5 rounded-full relative transition-all"
              style={{ backgroundColor: colorMode === "dark" ? "rgba(255,255,255,0.15)" : themeConfig.primary }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                style={{ left: colorMode === "dark" ? "2px" : "18px", backgroundColor: "#ffffff" }}
              />
            </span>
          </button>

          {/* Theme selector toggle */}
          <button
            onClick={() => setThemeOpen((p) => !p)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-all"
          >
            <span className="flex items-center gap-3">
              <Palette className="w-4 h-4" style={{ color: themeConfig.primary }} />
              <span>Themes ({activeThemeName})</span>
            </span>
            <Sparkles className="w-3.5 h-3.5" style={{ color: themeConfig.primary }} />
          </button>

          {themeOpen && (
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 px-3 pt-1">
                {hasUserThemeOverride ? "Your personal theme choice" : "Showing site default theme"}
              </p>
              <div className="max-h-52 overflow-y-auto space-y-0.5 px-1">
                {Object.keys(PRESET_THEMES).map((tName) => (
                  <button
                    key={tName}
                    onClick={() => setUserTheme(tName)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-left transition-all ${
                      activeThemeName === tName
                        ? "bg-white/10 text-white font-bold"
                        : "text-gray-400 hover:bg-white/5"
                    }`}
                  >
                    <span>{tName}</span>
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: PRESET_THEMES[tName].primary }}
                    />
                  </button>
                ))}
              </div>
              {hasUserThemeOverride && (
                <button
                  onClick={resetToDefaultTheme}
                  className="w-full text-center text-[11px] font-semibold py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  ↺ Reset to Site Default
                </button>
              )}
            </div>
          )}

          {/* Personal Font/Text Color — every visitor can pick their own,
              independent of the admin's site-wide default color. */}
          <button
            onClick={() => setFontColorPickerOpen((p) => !p)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-all"
          >
            <span className="flex items-center gap-3">
              <Type className="w-4 h-4" style={{ color: activeFontColor || themeConfig.primary }} />
              <span>Font Color</span>
            </span>
            <span
              className="w-4 h-4 rounded-full border border-white/30"
              style={{ backgroundColor: activeFontColor || "#f3f4f6" }}
            />
          </button>

          {fontColorPickerOpen && (
            <div className="space-y-2 px-3 pb-1">
              <p className="text-[10px] text-gray-500">
                {hasUserFontColorOverride ? "Your personal font color" : "Showing site default font color"}
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={activeFontColor || "#f3f4f6"}
                  onChange={(e) => setUserFontColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                />
                <span className="text-[11px] font-mono text-gray-400">{activeFontColor || "#f3f4f6"}</span>
              </div>
              {hasUserFontColorOverride && (
                <button
                  onClick={resetUserFontColor}
                  className="w-full text-center text-[11px] font-semibold py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  ↺ Reset to Site Default
                </button>
              )}
            </div>
          )}

          {/* Admin */}
          <button
            onClick={() => {
              setMenuOpen(false);
              setIsAdminModalOpen(true);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
              isAdminLoggedIn
                ? "text-emerald-300 bg-emerald-500/10"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isAdminLoggedIn ? "Admin Dashboard" : "Admin Login"}</span>
          </button>
        </div>
      )}
    </header>
  );
}
