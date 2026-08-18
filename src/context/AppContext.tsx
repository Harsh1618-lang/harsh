"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { PRESET_THEMES, ThemeConfig } from "@/lib/themes";

export interface Song {
  id: number;
  title: string;
  artist: string;
  album?: string;
  category: string;
  coverUrl: string;
  audioUrl: string;
  duration: string;
  plays: number;
  isTrending?: boolean;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  thumbnail: string;
  duration: string;
  level: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  views: number;
  isFeatured?: boolean;
}

export interface AppAPK {
  id: number;
  name: string;
  version: string;
  category: string;
  icon: string;
  description: string;
  size: string;
  downloads: number;
  apkUrl: string;
  telegramUrl?: string;
  websiteUrl?: string;
  playstoreUrl?: string;
  rating?: number;
}

interface AppContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Theme & Fonts
  activeThemeName: string;
  themeConfig: ThemeConfig;
  setThemeName: (name: string) => void;
  setUserTheme: (name: string) => void;
  resetToDefaultTheme: () => void;
  hasUserThemeOverride: boolean;
  activeFont: string;
  setFont: (font: string) => void;
  applyCustomTheme: (config: Partial<ThemeConfig> & Record<string, any>) => void;

  // Light / Dark Mode Toggle (Header)
  colorMode: "dark" | "light";
  toggleColorMode: () => void;
  setColorMode: (mode: "dark" | "light") => void;

  // Site Default Text/Font Color (admin-set) with an optional personal
  // per-visitor override — same "site default until the user picks their
  // own" pattern used for themes.
  activeFontColor: string | null;
  setUserFontColor: (color: string) => void;
  resetUserFontColor: () => void;
  hasUserFontColorOverride: boolean;

  // Music Player
  currentSong: Song | null;
  isPlaying: boolean;
  songList: Song[];
  setSongList: (songs: Song[]) => void;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  isShuffle: boolean;
  toggleShuffle: () => void;
  isRepeat: boolean;
  toggleRepeat: () => void;
  isQueueOpen: boolean;
  setIsQueueOpen: (open: boolean) => void;
  
  // Video Modal
  activeVideoCourse: Course | null;
  setActiveVideoCourse: (course: Course | null) => void;

  // Donation Modal
  isDonationOpen: boolean;
  setIsDonationOpen: (open: boolean) => void;

  // Bottom Sheet Apps Modal/Drawer
  isAppsDrawerOpen: boolean;
  setIsAppsDrawerOpen: (open: boolean) => void;

  // Admin Auth
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (status: boolean) => void;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  // Signed session token from /api/admin/login, required by every admin-only
  // write endpoint (sent as `Authorization: Bearer <token>`). Kept in memory
  // only — cleared on logout/refresh, matching isAdminLoggedIn's lifetime.
  adminToken: string | null;
  setAdminToken: (token: string | null) => void;

  // Profile data
  profile: any;
  reloadProfile: () => void;
  settings: any;
  reloadSettings: () => void;

  // Social Links
  socialLinksList: any[];
  reloadSocialLinks: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [activeThemeName, setActiveThemeName] = useState<string>("Cyber Green");
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(
    PRESET_THEMES["Cyber Green"]
  );
  const [activeFont, setActiveFont] = useState<string>("Outfit");
  const [colorMode, setColorModeState] = useState<"dark" | "light">("dark");
  const [hasUserThemeOverride, setHasUserThemeOverride] = useState<boolean>(false);
  const [activeFontColor, setActiveFontColor] = useState<string | null>(null);
  const [hasUserFontColorOverride, setHasUserFontColorOverride] = useState<boolean>(false);

  // Audio Player State
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [songList, setSongList] = useState<Song[]>([]);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);

  // Modals
  const [activeVideoCourse, setActiveVideoCourse] = useState<Course | null>(null);
  const [isDonationOpen, setIsDonationOpen] = useState<boolean>(false);
  const [isAppsDrawerOpen, setIsAppsDrawerOpen] = useState<boolean>(false);

  // Admin
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Profile & Settings
  const [profile, setProfile] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [socialLinksList, setSocialLinksList] = useState<any[]>([]);

  const reloadProfile = async () => {
    try {
      const res = await fetch("/api/profile", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const reloadSettings = async () => {
    try {
      // `no-store` guarantees every call (including the one fired right
      // after an admin saves a new custom background / theme / avatar) hits
      // the server fresh instead of a browser-cached response, which was
      // another reason admin edits could appear to "not take effect" until
      // a hard refresh.
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);

        // The admin's chosen theme (settings.activeTheme) is the SITE DEFAULT
        // shown to every new visitor. If this specific browser has already
        // picked its own personal theme preference (via the Navbar theme
        // switcher), that personal choice takes priority instead — exactly
        // like "site default until the user picks their own".
        let userOverride: string | null = null;
        try {
          userOverride = window.localStorage.getItem("harshdev_user_theme");
        } catch {
          // localStorage unavailable — ignore, fall back to site default
        }

        const hasOverride = !!(userOverride && PRESET_THEMES[userOverride]);
        setHasUserThemeOverride(hasOverride);
        const themeToApply = hasOverride ? (userOverride as string) : data.activeTheme;

        if (themeToApply && PRESET_THEMES[themeToApply]) {
          setActiveThemeName(themeToApply);
          setThemeConfig(PRESET_THEMES[themeToApply]);
        }
        if (data.activeFont) {
          setActiveFont(data.activeFont);
        }
        if (themeToApply === "Custom Theme" && data.customThemeConfig) {
          setThemeConfig((prev) => ({ ...prev, ...data.customThemeConfig }));
        }

        // Same "site default until the user personally overrides it" pattern
        // for the font/text color set in Admin > Theme & Fonts.
        let userFontColor: string | null = null;
        try {
          userFontColor = window.localStorage.getItem("harshdev_user_font_color");
        } catch {
          // localStorage unavailable — ignore, fall back to site default
        }
        const hasFontOverride = !!userFontColor;
        setHasUserFontColorOverride(hasFontOverride);
        setActiveFontColor(hasFontOverride ? userFontColor : data.defaultFontColor || null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const reloadSocialLinks = async () => {
    try {
      const res = await fetch("/api/social-links");
      if (res.ok) {
        setSocialLinksList(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    reloadProfile();
    reloadSettings();
    reloadSocialLinks();
    // Record page view
    fetch("/api/analytics", { method: "POST" }).catch(() => {});

    // Restore saved Light/Dark mode preference (falls back to system preference)
    try {
      const saved = window.localStorage.getItem("harshdev_color_mode");
      if (saved === "light" || saved === "dark") {
        setColorModeState(saved);
      } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        setColorModeState("light");
      }
    } catch {
      // localStorage unavailable — default to dark
    }
  }, []);

  // Apply the color-mode class to <html> so the global light-mode CSS overrides
  // (see globals.css) actually take effect across every page/component.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (colorMode === "light") {
      root.classList.add("light-mode");
      root.style.colorScheme = "light";
    } else {
      root.classList.remove("light-mode");
      root.style.colorScheme = "dark";
    }
    try {
      window.localStorage.setItem("harshdev_color_mode", colorMode);
    } catch {
      // ignore persistence errors
    }
  }, [colorMode]);

  const setColorMode = (mode: "dark" | "light") => setColorModeState(mode);
  const toggleColorMode = () => setColorModeState((prev) => (prev === "dark" ? "light" : "dark"));

  const setThemeName = (name: string) => {
    setActiveThemeName(name);
    if (PRESET_THEMES[name]) {
      setThemeConfig(PRESET_THEMES[name]);
    }
  };

  // Used by the public-facing theme switcher (Navbar dropdown, visible to every
  // visitor). Applies the theme instantly for this browser session AND
  // remembers the choice in localStorage so it survives reloads — without
  // ever touching the admin's site-wide default theme stored in the database.
  const setUserTheme = (name: string) => {
    setThemeName(name);
    setHasUserThemeOverride(true);
    try {
      window.localStorage.setItem("harshdev_user_theme", name);
    } catch {
      // ignore persistence errors
    }
  };

  // Clears this browser's personal theme override so the visitor goes back
  // to seeing whatever theme the admin currently has set as the site default.
  const resetToDefaultTheme = () => {
    try {
      window.localStorage.removeItem("harshdev_user_theme");
    } catch {
      // ignore
    }
    setHasUserThemeOverride(false);
    if (settings?.activeTheme && PRESET_THEMES[settings.activeTheme]) {
      setActiveThemeName(settings.activeTheme);
      setThemeConfig(PRESET_THEMES[settings.activeTheme]);
      if (settings.activeTheme === "Custom Theme" && settings.customThemeConfig) {
        setThemeConfig((prev) => ({ ...prev, ...settings.customThemeConfig }));
      }
    } else {
      setThemeName("Cyber Green");
    }
  };

  // Lets an individual visitor pick their own personal text/font color for
  // their own browsing session, without ever touching the admin's site-wide
  // default stored in the database.
  const setUserFontColor = (color: string) => {
    setActiveFontColor(color);
    setHasUserFontColorOverride(true);
    try {
      window.localStorage.setItem("harshdev_user_font_color", color);
    } catch {
      // ignore persistence errors
    }
  };

  const resetUserFontColor = () => {
    try {
      window.localStorage.removeItem("harshdev_user_font_color");
    } catch {
      // ignore
    }
    setHasUserFontColorOverride(false);
    setActiveFontColor(settings?.defaultFontColor || null);
  };

  const setFont = (font: string) => {
    setActiveFont(font);
  };

  const applyCustomTheme = (config: Partial<ThemeConfig> & Record<string, any>) => {
    setActiveThemeName("Custom Theme");
    setThemeConfig((prev) => ({ ...prev, ...config }));
  };

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    // Log play counter
    fetch("/api/music/play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId: song.id }),
    }).catch(() => {});
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const toggleShuffle = () => setIsShuffle((prev) => !prev);
  const toggleRepeat = () => setIsRepeat((prev) => !prev);

  const nextSong = () => {
    if (!songList.length || !currentSong) return;
    if (isShuffle && songList.length > 1) {
      let randomIndex = Math.floor(Math.random() * songList.length);
      const currentIndex = songList.findIndex((s) => s.id === currentSong.id);
      while (randomIndex === currentIndex) {
        randomIndex = Math.floor(Math.random() * songList.length);
      }
      playSong(songList[randomIndex]);
      return;
    }
    const currentIndex = songList.findIndex((s) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songList.length;
    playSong(songList[nextIndex]);
  };

  const prevSong = () => {
    if (!songList.length || !currentSong) return;
    const currentIndex = songList.findIndex((s) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songList.length) % songList.length;
    playSong(songList[prevIndex]);
  };

  // Apply Theme CSS Custom Variables to DOM root
  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty("--primary", themeConfig.primary);
      root.style.setProperty("--secondary", themeConfig.secondary);
      // The page background must flip to a light surface in Light Mode
      // regardless of which of the 20 accent-color theme presets is active.
      root.style.setProperty("--bg-dark", colorMode === "light" ? "#f6f8fa" : themeConfig.bgDark);
      root.style.setProperty(
        "--bg-card",
        colorMode === "light" ? "rgba(255, 255, 255, 0.75)" : themeConfig.bgCard
      );
      root.style.setProperty("--border-glow", themeConfig.borderGlow);
      root.style.setProperty("--glow-color", themeConfig.glow);
      root.style.setProperty("--font-active", activeFont);
      root.style.setProperty("--radius-scale", settings?.radiusScale || "1.5rem");
      root.style.setProperty("--shadow-intensity", settings?.shadowIntensity || "0.4");
      root.style.setProperty("--anim-speed", settings?.animationSpeed || "1");
      // Font/text color: personal override > admin site default > theme's
      // built-in off-white — never overridden in Light Mode, which already
      // computes its own dark-on-white text colors.
      if (colorMode !== "light") {
        root.style.setProperty("--text-color", activeFontColor || "#f3f4f6");
      } else {
        root.style.removeProperty("--text-color");
      }
    }
  }, [themeConfig, activeFont, settings, colorMode, activeFontColor]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeThemeName,
        themeConfig,
        setThemeName,
        setUserTheme,
        resetToDefaultTheme,
        hasUserThemeOverride,
        activeFont,
        setFont,
        applyCustomTheme,
        colorMode,
        toggleColorMode,
        setColorMode,
        activeFontColor,
        setUserFontColor,
        resetUserFontColor,
        hasUserFontColorOverride,
        currentSong,
        isPlaying,
        songList,
        setSongList,
        playSong,
        togglePlay,
        nextSong,
        prevSong,
        isShuffle,
        toggleShuffle,
        isRepeat,
        toggleRepeat,
        isQueueOpen,
        setIsQueueOpen,
        activeVideoCourse,
        setActiveVideoCourse,
        isDonationOpen,
        setIsDonationOpen,
        isAppsDrawerOpen,
        setIsAppsDrawerOpen,
        isAdminLoggedIn,
        setIsAdminLoggedIn,
        adminToken,
        setAdminToken,
        isAdminModalOpen,
        setIsAdminModalOpen,
        profile,
        reloadProfile,
        settings,
        reloadSettings,
        socialLinksList,
        reloadSocialLinks,
      }}
    >
      <div style={{ fontFamily: `'${activeFont}', 'Outfit', sans-serif` }}>
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
