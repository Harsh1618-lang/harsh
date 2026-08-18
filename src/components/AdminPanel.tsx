"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { PRESET_THEMES, FONT_COLLECTION } from "@/lib/themes";
import {
  X,
  Lock,
  LayoutDashboard,
  Palette,
  GraduationCap,
  Smartphone,
  Music2,
  MessageSquare,
  Heart,
  Edit3,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  LogOut,
  Share2,
  FileText,
  Upload,
  Download,
  Activity,
  Pencil,
  KeyRound,
  Eye,
  EyeOff,
  Link2,
  ImagePlus,
  Navigation,
  XCircle,
  ExternalLink,
  AlertTriangle,
  Type,
} from "lucide-react";

type AdminTab =
  | "analytics"
  | "website"
  | "theme"
  | "courses"
  | "apps"
  | "music"
  | "messages"
  | "donations"
  | "social"
  | "resume"
  | "security";

const inputClass =
  "w-full px-3 py-2 rounded-xl glass-card text-xs text-white border border-emerald-500/30 focus:border-emerald-400 focus:outline-none";

export function AdminPanel() {
  const {
    isAdminModalOpen,
    setIsAdminModalOpen,
    isAdminLoggedIn,
    setIsAdminLoggedIn,
    adminToken,
    setAdminToken,
    themeConfig,
    activeThemeName,
    setThemeName,
    applyCustomTheme,
    activeFont,
    setFont,
    reloadProfile,
    reloadSettings,
    reloadSocialLinks,
  } = useApp();

  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");

  // State forms
  const [profileForm, setProfileForm] = useState<any>({});
  const [settingsForm, setSettingsForm] = useState<any>({});
  const [navLabelsForm, setNavLabelsForm] = useState({
    home: "Home",
    about: "About",
    courses: "Courses",
    apps: "Apps",
    music: "Music",
    contact: "Contact",
  });
  const [analyticsData, setAnalyticsData] = useState<any>({});
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [appsList, setAppsList] = useState<any[]>([]);
  const [musicList, setMusicList] = useState<any[]>([]);
  const [messagesList, setMessagesList] = useState<any[]>([]);
  const [donationsList, setDonationsList] = useState<any[]>([]);
  const [socialList, setSocialList] = useState<any[]>([]);
  const [resumeHistory, setResumeHistory] = useState<any[]>([]);

  // Add / Edit item forms (editingId === null means "creating new")
  const emptyCourse = { title: "", category: "Programming", youtubeUrl: "", description: "", duration: "2h 15m", level: "Beginner" };
  const emptyApp = { name: "", version: "v1.0.0", category: "Utility", icon: "⚡", description: "", size: "15 MB", apkUrl: "", telegramUrl: "", websiteUrl: "", playstoreUrl: "" };
  const emptyTrack = { title: "", artist: "Harsh Dev Studio", album: "Vibes Collection", category: "LoFi", coverUrl: "", audioUrl: "", duration: "3:30" };
  const emptySocial = { platform: "", label: "", url: "", icon: "Globe", color: "#00ff88" };

  const [courseForm, setCourseForm] = useState<any>(emptyCourse);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [appForm, setAppForm] = useState<any>(emptyApp);
  const [editingAppId, setEditingAppId] = useState<number | null>(null);
  const [trackForm, setTrackForm] = useState<any>(emptyTrack);
  const [editingTrackId, setEditingTrackId] = useState<number | null>(null);
  const [socialForm, setSocialForm] = useState<any>(emptySocial);
  const [editingSocialId, setEditingSocialId] = useState<number | null>(null);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrlInput, setResumeUrlInput] = useState("");
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [customColors, setCustomColors] = useState({
    primary: themeConfig.primary,
    secondary: themeConfig.secondary,
    bgDark: themeConfig.bgDark,
    radiusScale: "1.5rem",
    shadowIntensity: "0.4",
    animationSpeed: "1",
  });

  // Security / change password
  const [currentAdminUsername, setCurrentAdminUsername] = useState("admin");
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNewUsername, setPwNewUsername] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwShow, setPwShow] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Font Color customization (site default)
  const [fontColorForm, setFontColorForm] = useState<string>("#ffffff");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Setting isAdminLoggedIn triggers the effect below, which calls
        // loadAllAdminData() on the next render — by which point adminToken
        // has actually been committed, so authenticated fetches (e.g.
        // /api/messages) use the real token instead of a stale null.
        setAdminToken(data.token);
        setIsAdminLoggedIn(true);
      } else {
        setLoginError(data.error || "Invalid Admin Credentials. (Default: admin / admin123)");
      }
    } catch (err) {
      setLoginError("Network error. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  // Every admin-only write/read endpoint requires this Bearer token — merge
  // it into a request's headers alongside any other headers already set.
  const authHeaders = (extra: Record<string, string> = {}): Record<string, string> => ({
    ...extra,
    ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
  });

  const loadAllAdminData = async () => {
    try {
      const [profRes, analyticsRes, coursesRes, appsRes, musicRes, msgRes, donRes, socialRes, resumeRes, adminInfoRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/analytics"),
        fetch("/api/courses"),
        fetch("/api/apps"),
        fetch("/api/music"),
        fetch("/api/messages", { headers: authHeaders() }),
        fetch("/api/donations"),
        fetch("/api/social-links"),
        fetch("/api/resume"),
        fetch("/api/admin/change-password"),
      ]);

      if (profRes.ok) setProfileForm(await profRes.json());
      if (analyticsRes.ok) setAnalyticsData(await analyticsRes.json());
      if (coursesRes.ok) {
        const cData = await coursesRes.json();
        setCoursesList(cData.courses || []);
      }
      if (appsRes.ok) setAppsList(await appsRes.json());
      if (musicRes.ok) {
        const mData = await musicRes.json();
        setMusicList(mData.music || []);
      }
      if (msgRes.ok) setMessagesList(await msgRes.json());
      if (donRes.ok) setDonationsList(await donRes.json());
      if (socialRes.ok) setSocialList(await socialRes.json());
      if (resumeRes.ok) {
        const rData = await resumeRes.json();
        setResumeHistory(rData.history || []);
      }
      if (adminInfoRes.ok) {
        const aData = await adminInfoRes.json();
        setCurrentAdminUsername(aData.username || "admin");
      }

      const settingsRes = await fetch("/api/settings", { cache: "no-store" });
      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        setSettingsForm(sData);
        setNavLabelsForm({
          home: sData.navLabels?.home || "Home",
          about: sData.navLabels?.about || "About",
          courses: sData.navLabels?.courses || "Courses",
          apps: sData.navLabels?.apps || "Apps",
          music: sData.navLabels?.music || "Music",
          contact: sData.navLabels?.contact || "Contact",
        });
        setCustomColors({
          primary: sData.customThemeConfig?.primary || themeConfig.primary,
          secondary: sData.customThemeConfig?.secondary || themeConfig.secondary,
          bgDark: sData.customThemeConfig?.bgDark || themeConfig.bgDark,
          radiusScale: sData.radiusScale || "1.5rem",
          shadowIntensity: sData.shadowIntensity || "0.4",
          animationSpeed: sData.animationSpeed || "1",
        });
        setFontColorForm(sData.defaultFontColor || "#ffffff");
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      loadAllAdminData();
    }
  }, [isAdminLoggedIn]);

  const flashSuccess = (msg: string) => {
    setErrorMsg("");
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Shown whenever any save/upload/submit fails — previously these failures
  // were completely silent (only logged to the browser console), which made
  // buttons like "Save & Publish Live" look totally dead to the admin
  // whenever the server rejected a request for any reason.
  const flashError = (msg: string) => {
    setSuccessMsg("");
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 5000);
  };

  // Reads a JSON error message out of a failed fetch Response, falling back
  // to a generic message if the body isn't valid JSON or has no `error` key.
  const extractError = async (res: Response, fallback: string) => {
    try {
      const data = await res.json();
      return data?.error || fallback;
    } catch {
      return fallback;
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        flashSuccess("Website profile updated live!");
        reloadProfile();
      } else {
        flashError(await extractError(res, "Failed to save profile. Please try again."));
      }
    } catch (e) {
      flashError("Network error — could not reach the server. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const saveSiteSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ...settingsForm, navLabels: navLabelsForm }),
      });
      if (res.ok) {
        flashSuccess("Navbar / Footer / Contact settings published live!");
        reloadSettings();
      } else {
        flashError(await extractError(res, "Failed to save settings. Please try again."));
      }
    } catch (e) {
      flashError("Network error — could not reach the server. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const uploadBackground = async () => {
    if (!backgroundFile) return;
    setUploadingBackground(true);
    try {
      const formData = new FormData();
      formData.append("file", backgroundFile);
      formData.append("folder", "backgrounds");
      const res = await fetch("/api/upload", { method: "POST", headers: authHeaders(), body: formData });
      const data = await res.json();
      if (res.ok) {
        const updated = { ...settingsForm, customBackgroundUrl: data.url };
        setSettingsForm(updated);
        await fetch("/api/settings", {
          method: "PUT",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ customBackgroundUrl: data.url }),
        });
        setBackgroundFile(null);
        reloadSettings();
        flashSuccess("Custom background uploaded & applied live!");
      } else {
        flashError(data.error || "Background upload failed. Please try a smaller image (max 8MB, PNG/JPG/WEBP).");
      }
    } catch (e) {
      flashError("Network error while uploading background. Please try again.");
    } finally {
      setUploadingBackground(false);
    }
  };

  const removeBackground = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ customBackgroundUrl: null }),
      });
      if (res.ok) {
        setSettingsForm({ ...settingsForm, customBackgroundUrl: null });
        reloadSettings();
        flashSuccess("Custom background removed.");
      } else {
        flashError(await extractError(res, "Failed to remove background."));
      }
    } catch (e) {
      flashError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", avatarFile);
      formData.append("folder", "avatars");
      const res = await fetch("/api/upload", { method: "POST", headers: authHeaders(), body: formData });
      const data = await res.json();
      if (res.ok) {
        setProfileForm({ ...profileForm, avatarUrl: data.url });
        setAvatarFile(null);
        flashSuccess("Photo uploaded! Click 'Save Hero / About' to publish it live.");
      } else {
        flashError(data.error || "Photo upload failed. Please try a smaller image (max 8MB, PNG/JPG/WEBP).");
      }
    } catch (e) {
      flashError("Network error while uploading photo. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const saveThemeAndFont = async (tName: string, fontName: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          activeTheme: tName,
          activeFont: fontName,
        }),
      });
      if (res.ok) {
        setThemeName(tName);
        setFont(fontName);
        reloadSettings();
        flashSuccess("Theme & Fonts saved as the SITE DEFAULT for every visitor!");
      } else {
        flashError(await extractError(res, "Failed to save theme. Please try again."));
      }
    } catch (e) {
      flashError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const saveCustomTheme = async () => {
    setSaving(true);
    try {
      const config = {
        primary: customColors.primary,
        secondary: customColors.secondary,
        accent: customColors.primary,
        glow: `${customColors.primary}66`,
        bgDark: customColors.bgDark,
        bgCard: "rgba(10, 25, 28, 0.75)",
        borderGlow: `${customColors.primary}55`,
        textGlow: `0 0 12px ${customColors.primary}99`,
      };
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          activeTheme: "Custom Theme",
          customThemeConfig: config,
          radiusScale: customColors.radiusScale,
          shadowIntensity: customColors.shadowIntensity,
          animationSpeed: customColors.animationSpeed,
        }),
      });
      if (res.ok) {
        applyCustomTheme(config);
        reloadSettings();
        flashSuccess("Custom theme saved as site default & applied live!");
      } else {
        flashError(await extractError(res, "Failed to save custom theme. Please try again."));
      }
    } catch (e) {
      flashError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Font Color: saved as part of Site Settings, applied live to every visitor.
  const saveFontColor = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ defaultFontColor: fontColorForm }),
      });
      if (res.ok) {
        setSettingsForm({ ...settingsForm, defaultFontColor: fontColorForm });
        reloadSettings();
        flashSuccess("Site-wide font color saved as the default for every visitor!");
      } else {
        flashError(await extractError(res, "Failed to save font color. Please try again."));
      }
    } catch (e) {
      flashError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const resetFontColor = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ defaultFontColor: null }),
      });
      if (res.ok) {
        setFontColorForm("#ffffff");
        setSettingsForm({ ...settingsForm, defaultFontColor: null });
        reloadSettings();
        flashSuccess("Font color reset to theme default.");
      } else {
        flashError(await extractError(res, "Failed to reset font color."));
      }
    } catch (e) {
      flashError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ---- Courses CRUD ----
  const startEditCourse = (c: any) => {
    setEditingCourseId(c.id);
    setCourseForm({
      title: c.title,
      category: c.category,
      youtubeUrl: c.youtubeUrl,
      description: c.description,
      duration: c.duration,
      level: c.level,
    });
  };
  const cancelEditCourse = () => {
    setEditingCourseId(null);
    setCourseForm(emptyCourse);
  };
  const submitCourse = async () => {
    if (!courseForm.title || !courseForm.youtubeUrl) return;
    setSaving(true);
    try {
      const res = editingCourseId
        ? await fetch(`/api/courses/${editingCourseId}`, {
            method: "PUT",
            headers: authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(courseForm),
          })
        : await fetch("/api/courses", {
            method: "POST",
            headers: authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(courseForm),
          });
      if (res.ok) {
        cancelEditCourse();
        loadAllAdminData();
        flashSuccess(editingCourseId ? "Course updated live!" : "Course added & YouTube ID auto-parsed!");
      } else {
        flashError(await extractError(res, "Failed to save course. Please check the YouTube URL and try again."));
      }
    } catch (e) {
      flashError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  const deleteCourse = async (id: number) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await fetch(`/api/courses?id=${id}`, { method: "DELETE", headers: authHeaders() });
      if (res.ok) {
        if (editingCourseId === id) cancelEditCourse();
        loadAllAdminData();
        flashSuccess("Course deleted.");
      } else {
        flashError(await extractError(res, "Failed to delete course."));
      }
    } catch (e) {
      flashError("Network error. Please try again.");
    }
  };

  // ---- Apps CRUD ----
  const startEditApp = (a: any) => {
    setEditingAppId(a.id);
    setAppForm({
      name: a.name,
      version: a.version,
      category: a.category,
      icon: a.icon,
      description: a.description,
      size: a.size,
      apkUrl: a.apkUrl,
      telegramUrl: a.telegramUrl || "",
      websiteUrl: a.websiteUrl || "",
      playstoreUrl: a.playstoreUrl || "",
    });
  };
  const cancelEditApp = () => {
    setEditingAppId(null);
    setAppForm(emptyApp);
  };
  const submitApp = async () => {
    if (!appForm.name || !appForm.apkUrl) return;
    setSaving(true);
    try {
      const res = editingAppId
        ? await fetch(`/api/apps/${editingAppId}`, {
            method: "PUT",
            headers: authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(appForm),
          })
        : await fetch("/api/apps", {
            method: "POST",
            headers: authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(appForm),
          });
      if (res.ok) {
        cancelEditApp();
        loadAllAdminData();
        flashSuccess(editingAppId ? "App updated live!" : "APK app published!");
      } else {
        flashError(await extractError(res, "Failed to save app. Please check the APK URL and try again."));
      }
    } catch (e) {
      flashError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  const deleteApp = async (id: number) => {
    if (!confirm("Are you sure you want to delete this app?")) return;
    try {
      const res = await fetch(`/api/apps?id=${id}`, { method: "DELETE", headers: authHeaders() });
      if (res.ok) {
        if (editingAppId === id) cancelEditApp();
        loadAllAdminData();
        flashSuccess("App deleted.");
      } else {
        flashError(await extractError(res, "Failed to delete app."));
      }
    } catch (e) {
      flashError("Network error. Please try again.");
    }
  };

  // ---- Music CRUD ----
  const startEditTrack = (m: any) => {
    setEditingTrackId(m.id);
    setTrackForm({
      title: m.title,
      artist: m.artist,
      album: m.album,
      category: m.category,
      coverUrl: m.coverUrl,
      audioUrl: m.audioUrl,
      duration: m.duration,
    });
  };
  const cancelEditTrack = () => {
    setEditingTrackId(null);
    setTrackForm(emptyTrack);
  };
  const submitTrack = async () => {
    if (!trackForm.title || !trackForm.audioUrl) return;
    setSaving(true);
    try {
      const res = editingTrackId
        ? await fetch(`/api/music/${editingTrackId}`, {
            method: "PUT",
            headers: authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(trackForm),
          })
        : await fetch("/api/music", {
            method: "POST",
            headers: authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(trackForm),
          });
      if (res.ok) {
        cancelEditTrack();
        loadAllAdminData();
        flashSuccess(editingTrackId ? "Track updated live!" : "Music track added!");
      } else {
        flashError(await extractError(res, "Failed to save track. Please check the audio URL and try again."));
      }
    } catch (e) {
      flashError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  const deleteMusic = async (id: number) => {
    if (!confirm("Are you sure you want to delete this track?")) return;
    try {
      const res = await fetch(`/api/music?id=${id}`, { method: "DELETE", headers: authHeaders() });
      if (res.ok) {
        if (editingTrackId === id) cancelEditTrack();
        loadAllAdminData();
        flashSuccess("Track deleted.");
      } else {
        flashError(await extractError(res, "Failed to delete track."));
      }
    } catch (e) {
      flashError("Network error. Please try again.");
    }
  };

  const deleteMessage = async (id: number) => {
    try {
      const res = await fetch(`/api/messages?id=${id}`, { method: "DELETE", headers: authHeaders() });
      if (res.ok) {
        loadAllAdminData();
        flashSuccess("Message deleted.");
      } else {
        flashError(await extractError(res, "Failed to delete message."));
      }
    } catch (e) {
      flashError("Network error. Please try again.");
    }
  };

  // ---- Social Links CRUD ----
  const startEditSocial = (s: any) => {
    setEditingSocialId(s.id);
    setSocialForm({ platform: s.platform, label: s.label, url: s.url, icon: s.icon, color: s.color });
  };
  const cancelEditSocial = () => {
    setEditingSocialId(null);
    setSocialForm(emptySocial);
  };
  const submitSocial = async () => {
    if (!socialForm.platform || !socialForm.url) return;
    setSaving(true);
    try {
      const res = editingSocialId
        ? await fetch("/api/social-links", {
            method: "PUT",
            headers: authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({ id: editingSocialId, ...socialForm }),
          })
        : await fetch("/api/social-links", {
            method: "POST",
            headers: authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(socialForm),
          });
      if (res.ok) {
        cancelEditSocial();
        loadAllAdminData();
        reloadSocialLinks();
        flashSuccess(editingSocialId ? "Social link updated live!" : "Social link added & live on footer/contact!");
      } else {
        flashError(await extractError(res, "Failed to save connection. Please check the URL and try again."));
      }
    } catch (e) {
      flashError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSocialVisibility = async (link: any) => {
    try {
      const res = await fetch("/api/social-links", {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ...link, isVisible: !link.isVisible }),
      });
      if (res.ok) {
        loadAllAdminData();
        reloadSocialLinks();
      } else {
        flashError(await extractError(res, "Failed to update visibility."));
      }
    } catch (e) {
      flashError("Network error. Please try again.");
    }
  };

  const deleteSocialLink = async (id: number) => {
    try {
      const res = await fetch(`/api/social-links?id=${id}`, { method: "DELETE", headers: authHeaders() });
      if (res.ok) {
        if (editingSocialId === id) cancelEditSocial();
        loadAllAdminData();
        reloadSocialLinks();
        flashSuccess("Connection deleted.");
      } else {
        flashError(await extractError(res, "Failed to delete connection."));
      }
    } catch (e) {
      flashError("Network error. Please try again.");
    }
  };

  const uploadResume = async () => {
    if (!resumeFile) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      formData.append("label", "Resume");
      const res = await fetch("/api/resume", { method: "POST", headers: authHeaders(), body: formData });
      if (res.ok) {
        setResumeFile(null);
        loadAllAdminData();
        reloadProfile();
        flashSuccess("Resume PDF uploaded from your device & instantly live!");
      } else {
        flashError(await extractError(res, "Failed to upload resume. Please try again."));
      }
    } catch (e) {
      flashError("Network error while uploading resume. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const saveResumeLink = async () => {
    if (!resumeUrlInput.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ resumeUrl: resumeUrlInput.trim(), label: "Resume (External Link)" }),
      });
      if (res.ok) {
        setResumeUrlInput("");
        loadAllAdminData();
        reloadProfile();
        flashSuccess("External resume link saved & instantly live!");
      } else {
        flashError(await extractError(res, "Failed to save resume link. Please try again."));
      }
    } catch (e) {
      flashError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setPwError("");
    if (!pwCurrent || !pwNew) {
      setPwError("Please fill in your current and new password.");
      return;
    }
    if (pwNew.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwError("New password and confirmation do not match.");
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          currentPassword: pwCurrent,
          newUsername: pwNewUsername || undefined,
          newPassword: pwNew,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentAdminUsername(data.username);
        setPwCurrent("");
        setPwNewUsername("");
        setPwNew("");
        setPwConfirm("");
        flashSuccess("Admin credentials updated! Use the new password next time you log in.");
      } else {
        setPwError(data.error || "Failed to change password.");
      }
    } catch (e) {
      setPwError("Network error. Please try again.");
    } finally {
      setPwSaving(false);
    }
  };

  if (!isAdminModalOpen) return null;

  const sidebarTabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: "analytics", label: "Analytics", icon: LayoutDashboard },
    { id: "website", label: "Website Builder", icon: Edit3 },
    { id: "theme", label: "Theme & Fonts", icon: Palette },
    { id: "courses", label: "Courses", icon: GraduationCap },
    { id: "apps", label: "APKs / Apps", icon: Smartphone },
    { id: "music", label: "Music Studio", icon: Music2 },
    { id: "social", label: "Connections", icon: Share2 },
    { id: "resume", label: "Resume", icon: FileText },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "donations", label: "Donations", icon: Heart },
    { id: "security", label: "Security / Password", icon: KeyRound },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-6xl glass-panel rounded-3xl border border-emerald-500/40 shadow-[0_0_60px_rgba(0,255,136,0.3)] bg-[#071318] my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-emerald-500/20 bg-emerald-950/40">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">HarshDev Admin Control Center</h3>
          </div>

          <div className="flex items-center gap-2">
            {isAdminLoggedIn && (
              <button
                onClick={() => {
                  setIsAdminLoggedIn(false);
                  setAdminToken(null);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1 hover:bg-red-500/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}

            <button
              onClick={() => setIsAdminModalOpen(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isAdminLoggedIn ? (
          /* Login Form */
          <div className="p-8 max-w-md mx-auto my-auto space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_30px_rgba(0,255,136,0.4)]">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Admin Authentication</h3>
              <p className="text-xs text-gray-400">
                Secure server-verified login. Manage content, themes, courses & analytics.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                placeholder="Username (default: admin)"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl glass-card text-sm text-white text-center border border-emerald-500/30 focus:border-emerald-400 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Password (default: admin123)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl glass-card text-sm text-white text-center border border-emerald-500/30 focus:border-emerald-400 focus:outline-none"
              />

              {loginError && (
                <p className="text-xs font-semibold text-red-400">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-3 rounded-full text-xs font-bold text-black shadow-lg transition-all hover:scale-102"
                style={{ backgroundColor: themeConfig.primary }}
              >
                {loggingIn ? "Verifying..." : "Unlock Dashboard"}
              </button>
            </form>
          </div>
        ) : (
          /* Logged In Dashboard Layout */
          <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-56 p-3 border-r border-emerald-500/20 bg-[#09171c] space-y-1 overflow-x-auto flex md:flex-col gap-1">
              {sidebarTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-emerald-400" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Admin Content Body */}
            <div className="p-4 sm:p-6 flex-grow overflow-y-auto space-y-6">
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/20 text-red-300 border border-red-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Tab: Analytics */}
              {activeTab === "analytics" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-emerald-400" />
                    Live Visitor & Download Analytics
                  </h3>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 text-center space-y-1">
                      <p className="text-xs text-gray-400">Total Pageviews</p>
                      <h4 className="text-2xl font-black text-emerald-400">
                        {analyticsData.pageviews?.toLocaleString() || "18,450"}
                      </h4>
                    </div>

                    <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 text-center space-y-1">
                      <p className="text-xs text-gray-400">APK Downloads</p>
                      <h4 className="text-2xl font-black text-cyan-400">
                        {analyticsData.downloads?.toLocaleString() || "5,230"}
                      </h4>
                    </div>

                    <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 text-center space-y-1">
                      <p className="text-xs text-gray-400">Music Plays</p>
                      <h4 className="text-2xl font-black text-purple-400">
                        {analyticsData.musicPlays?.toLocaleString() || "24,100"}
                      </h4>
                    </div>

                    <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 text-center space-y-1">
                      <p className="text-xs text-gray-400">Total Donations</p>
                      <h4 className="text-2xl font-black text-pink-400">
                        ₹{analyticsData.totalDonations?.toLocaleString() || "34,500"}
                      </h4>
                    </div>
                  </div>

                  <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 space-y-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" /> Security Status
                    </h4>
                    <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                      <li>Admin login is server-verified (rate limited to 8 attempts / 5 min per IP)</li>
                      <li>Admin password is securely hashed (scrypt) — change it anytime in the Security tab</li>
                      <li>Contact form rate limited to 5 messages / 10 min per IP</li>
                      <li>Donation endpoint rate limited & amount-validated server-side</li>
                      <li>All public inputs sanitized and length-capped before database writes</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab: Website Builder */}
              {activeTab === "website" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-emerald-400" />
                    Edit Every Section of the Website
                  </h3>

                  {/* Hero / About */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase">Hero / About Content</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-300 font-semibold">Your Name</label>
                        <input
                          type="text"
                          value={profileForm.name || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-gray-300 font-semibold">Role Title</label>
                        <input
                          type="text"
                          value={profileForm.roleTitle || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, roleTitle: e.target.value })}
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs text-gray-300 font-semibold">Hero Tagline</label>
                        <input
                          type="text"
                          value={profileForm.tagline || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs text-gray-300 font-semibold">Biography Text</label>
                        <textarea
                          rows={3}
                          value={profileForm.bio || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-gray-300 font-semibold">Availability Status</label>
                        <input
                          type="text"
                          value={profileForm.availability || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, availability: e.target.value })}
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-gray-300 font-semibold">Contact Email</label>
                        <input
                          type="text"
                          value={profileForm.email || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Avatar Upload */}
                    <div className="p-3 rounded-xl glass-card border border-emerald-500/20 space-y-2 mt-2">
                      <label className="text-xs text-gray-300 font-semibold flex items-center gap-1.5">
                        <ImagePlus className="w-3.5 h-3.5 text-emerald-400" /> Profile Photo / Avatar
                      </label>
                      <div className="flex flex-wrap items-center gap-3">
                        {profileForm.avatarUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profileForm.avatarUrl} alt="avatar preview" className="w-12 h-12 rounded-xl object-cover border border-emerald-500/30" />
                        )}
                        <input
                          type="text"
                          placeholder="Or paste an image URL"
                          value={profileForm.avatarUrl || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                          className={`${inputClass} flex-1 min-w-[160px]`}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                          className="flex-1 text-[11px] text-gray-300 file:mr-2 file:px-2.5 file:py-1.5 file:rounded-lg file:border-0 file:bg-emerald-500/20 file:text-emerald-300 file:text-[11px] file:font-bold"
                        />
                        <button
                          onClick={uploadAvatar}
                          disabled={!avatarFile || uploadingAvatar}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-black disabled:opacity-40 flex items-center gap-1 whitespace-nowrap"
                          style={{ backgroundColor: themeConfig.primary }}
                        >
                          <Upload className="w-3 h-3" /> {uploadingAvatar ? "Uploading..." : "Upload from Device"}
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400">Projects Completed</label>
                        <input
                          type="number"
                          value={profileForm.projectsCompleted ?? ""}
                          onChange={(e) => setProfileForm({ ...profileForm, projectsCompleted: parseInt(e.target.value) || 0 })}
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400">Happy Clients</label>
                        <input
                          type="number"
                          value={profileForm.happyClients ?? ""}
                          onChange={(e) => setProfileForm({ ...profileForm, happyClients: parseInt(e.target.value) || 0 })}
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400">Years Experience</label>
                        <input
                          type="text"
                          value={profileForm.yearsExperience || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, yearsExperience: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400">Cups of Code</label>
                        <input
                          type="text"
                          value={profileForm.cupsOfCode || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, cupsOfCode: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="px-6 py-2.5 rounded-full text-xs font-bold text-black shadow-lg"
                      style={{ backgroundColor: themeConfig.primary }}
                    >
                      <Save className="w-4 h-4 inline mr-1" />
                      <span>Save Hero / About</span>
                    </button>
                  </div>

                  {/* Navbar Tab Labels */}
                  <div className="space-y-2 pt-4 border-t border-emerald-500/20">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5" /> Navbar / Bottom-Nav Tab Names
                    </h4>
                    <p className="text-[11px] text-gray-500">Rename any navigation tab label shown across the header and bottom mobile nav.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(["home", "about", "courses", "apps", "music", "contact"] as const).map((key) => (
                        <div key={key} className="space-y-1">
                          <label className="text-[10px] text-gray-400 capitalize">{key} Tab Label</label>
                          <input
                            type="text"
                            value={navLabelsForm[key]}
                            onChange={(e) => setNavLabelsForm({ ...navLabelsForm, [key]: e.target.value })}
                            className={inputClass}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Background */}
                  <div className="space-y-2 pt-4 border-t border-emerald-500/20">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                      <ImagePlus className="w-3.5 h-3.5" /> Custom Site Background
                    </h4>
                    <p className="text-[11px] text-gray-500">Upload a custom background image shown behind the whole website (subtle overlay behind the glass cards).</p>
                    <div className="flex flex-wrap items-center gap-3">
                      {settingsForm.customBackgroundUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={settingsForm.customBackgroundUrl} alt="background preview" className="w-20 h-14 rounded-lg object-cover border border-emerald-500/30" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBackgroundFile(e.target.files?.[0] || null)}
                        className="flex-1 min-w-[180px] text-[11px] text-gray-300 file:mr-2 file:px-2.5 file:py-1.5 file:rounded-lg file:border-0 file:bg-emerald-500/20 file:text-emerald-300 file:text-[11px] file:font-bold"
                      />
                      <button
                        onClick={uploadBackground}
                        disabled={!backgroundFile || uploadingBackground}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-black disabled:opacity-40 flex items-center gap-1 whitespace-nowrap"
                        style={{ backgroundColor: themeConfig.primary }}
                      >
                        <Upload className="w-3 h-3" /> {uploadingBackground ? "Uploading..." : "Upload & Apply"}
                      </button>
                      {settingsForm.customBackgroundUrl && (
                        <button
                          onClick={removeBackground}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-300 bg-red-500/10 border border-red-500/30 flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" /> Remove
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 max-w-xs">
                      <label className="text-[10px] text-gray-400 whitespace-nowrap">
                        Opacity ({Math.round(parseFloat(settingsForm.customBackgroundOpacity || "0.35") * 100)}%)
                      </label>
                      <input
                        type="range"
                        min={0.05}
                        max={0.9}
                        step={0.01}
                        value={parseFloat(settingsForm.customBackgroundOpacity || "0.35")}
                        onChange={async (e) => {
                          const val = e.target.value;
                          setSettingsForm({ ...settingsForm, customBackgroundOpacity: val });
                          await fetch("/api/settings", {
                            method: "PUT",
                            headers: authHeaders({ "Content-Type": "application/json" }),
                            body: JSON.stringify({ customBackgroundOpacity: val }),
                          });
                          reloadSettings();
                        }}
                        className="flex-1 accent-emerald-400"
                      />
                    </div>
                  </div>

                  {/* Navbar & Footer */}
                  <div className="space-y-2 pt-4 border-t border-emerald-500/20">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase">Navbar Logo & Footer</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-300 font-semibold">Navbar Logo Text</label>
                        <input
                          type="text"
                          value={settingsForm.navbarLogoText || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, navbarLogoText: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs text-gray-300 font-semibold">Footer Description</label>
                        <textarea
                          rows={2}
                          value={settingsForm.footerText || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, footerText: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 pt-4 border-t border-emerald-500/20">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase">Contact Info</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-300 font-semibold">Phone / WhatsApp Number (Display)</label>
                        <input
                          type="text"
                          value={settingsForm.contactPhone || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                          className={inputClass}
                          placeholder="+91 99999 99999"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-300 font-semibold">Location</label>
                        <input
                          type="text"
                          value={settingsForm.contactLocation || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, contactLocation: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs text-gray-300 font-semibold flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Number (digits, with country code — used for the real WhatsApp redirect link)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.whatsappNumber || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value.replace(/[^0-9]/g, "") })}
                          className={inputClass}
                          placeholder="919876543210"
                        />
                        <p className="text-[10px] text-gray-500">
                          Preview link: {(() => {
                            let d = (settingsForm.whatsappNumber || "").replace(/\D/g, "");
                            if (d.length === 10) d = `91${d}`;
                            return `https://wa.me/${d || "919999999999"}`;
                          })()}
                        </p>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs text-gray-300 font-semibold">Google Maps Embed URL</label>
                        <input
                          type="text"
                          value={settingsForm.mapEmbedUrl || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, mapEmbedUrl: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <button
                      onClick={saveSiteSettings}
                      disabled={saving}
                      className="px-6 py-2.5 rounded-full text-xs font-bold text-black shadow-lg disabled:opacity-50"
                      style={{ backgroundColor: themeConfig.primary }}
                    >
                      <Save className="w-4 h-4 inline mr-1" />
                      <span>{saving ? "Saving..." : "Save & Publish Live"}</span>
                    </button>
                  </div>

                  {/* Donation Settings: UPI ID / QR / Mobile Number */}
                  <div className="space-y-2 pt-4 border-t border-emerald-500/20">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5" /> Donation Settings (UPI / QR Code)
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      This UPI ID generates the real, scannable QR code shown in the Donation popup on your website.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-300 font-semibold">Your UPI ID</label>
                        <input
                          type="text"
                          value={settingsForm.upiId || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, upiId: e.target.value })}
                          className={inputClass}
                          placeholder="yourname@upi"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-300 font-semibold">Donation Mobile Number (shown to donors)</label>
                        <input
                          type="text"
                          value={settingsForm.donationMobileNumber || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, donationMobileNumber: e.target.value })}
                          className={inputClass}
                          placeholder="+91 99999 99999"
                        />
                      </div>
                    </div>
                    {settingsForm.upiId && (
                      <div className="flex items-center gap-3 pt-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(
                            `upi://pay?pa=${settingsForm.upiId}&pn=Harsh%20Dev&cu=INR`
                          )}`}
                          alt="UPI QR preview"
                          className="w-20 h-20 rounded-lg bg-white p-1"
                        />
                        <p className="text-[11px] text-gray-400">
                          Live QR preview — donors will scan this exact code to pay <strong className="text-emerald-400">{settingsForm.upiId}</strong> directly.
                        </p>
                      </div>
                    )}
                    <button
                      onClick={saveSiteSettings}
                      disabled={saving}
                      className="px-6 py-2.5 rounded-full text-xs font-bold text-black shadow-lg disabled:opacity-50"
                      style={{ backgroundColor: themeConfig.primary }}
                    >
                      <Save className="w-4 h-4 inline mr-1" />
                      <span>{saving ? "Saving..." : "Save Donation Settings"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab: Theme & Fonts */}
              {activeTab === "theme" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Palette className="w-5 h-5 text-emerald-400" />
                    20 Glassmorphism Themes & Google Fonts
                  </h3>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-[11px] text-emerald-300">
                    ✓ Whatever theme you select here becomes the <strong>default theme</strong> every new visitor sees
                    when they open your website. Visitors can still pick their own theme for their own browsing
                    session from the Navbar — that never changes your site-wide default.
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-300 uppercase">Select Site Default Theme</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.keys(PRESET_THEMES).map((tName) => (
                        <button
                          key={tName}
                          onClick={() => saveThemeAndFont(tName, activeFont)}
                          className={`p-3 rounded-2xl glass-card border text-left flex items-center justify-between text-xs font-bold ${
                            activeThemeName === tName
                              ? "border-emerald-400 text-emerald-300 bg-emerald-500/20"
                              : "border-emerald-500/20 text-gray-300 hover:text-white"
                          }`}
                        >
                          <span>{tName}</span>
                          <span
                            className="w-4 h-4 rounded-full border border-white/30"
                            style={{ backgroundColor: PRESET_THEMES[tName].primary }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-emerald-500/20">
                    <label className="text-xs font-bold text-gray-300 uppercase">Custom Theme Builder</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400">Primary Color</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={customColors.primary} onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })} className="w-9 h-9 rounded-lg border border-emerald-500/30 bg-transparent cursor-pointer" />
                          <span className="text-[10px] font-mono text-gray-400">{customColors.primary}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400">Secondary Color</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={customColors.secondary} onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })} className="w-9 h-9 rounded-lg border border-emerald-500/30 bg-transparent cursor-pointer" />
                          <span className="text-[10px] font-mono text-gray-400">{customColors.secondary}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400">Background Color</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={customColors.bgDark} onChange={(e) => setCustomColors({ ...customColors, bgDark: e.target.value })} className="w-9 h-9 rounded-lg border border-emerald-500/30 bg-transparent cursor-pointer" />
                          <span className="text-[10px] font-mono text-gray-400">{customColors.bgDark}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400">Border Radius: {customColors.radiusScale}</label>
                        <input type="range" min={0} max={2.5} step={0.1} value={parseFloat(customColors.radiusScale)} onChange={(e) => setCustomColors({ ...customColors, radiusScale: `${e.target.value}rem` })} className="w-full accent-emerald-400" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400">Shadow / Glow: {customColors.shadowIntensity}</label>
                        <input type="range" min={0} max={1} step={0.05} value={parseFloat(customColors.shadowIntensity)} onChange={(e) => setCustomColors({ ...customColors, shadowIntensity: e.target.value })} className="w-full accent-emerald-400" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400">Animation Speed: {customColors.animationSpeed}x</label>
                        <input type="range" min={0.5} max={2} step={0.1} value={parseFloat(customColors.animationSpeed)} onChange={(e) => setCustomColors({ ...customColors, animationSpeed: e.target.value })} className="w-full accent-emerald-400" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex-1 h-12 rounded-xl border flex items-center px-4 text-xs font-bold" style={{ backgroundColor: customColors.bgDark, borderColor: `${customColors.primary}55`, color: customColors.primary, boxShadow: `0 0 ${parseFloat(customColors.shadowIntensity) * 40}px ${customColors.primary}55` }}>
                        Live Preview
                      </div>
                      <button
                        onClick={saveCustomTheme}
                        disabled={saving}
                        className="px-5 py-3 rounded-xl text-xs font-bold text-black whitespace-nowrap"
                        style={{ backgroundColor: customColors.primary }}
                      >
                        <Save className="w-3.5 h-3.5 inline mr-1" /> Save Custom Theme
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-emerald-500/20">
                    <label className="text-xs font-bold text-gray-300 uppercase">Select Active Google Font ({FONT_COLLECTION.length} Available)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {FONT_COLLECTION.map((fName) => (
                        <button
                          key={fName}
                          onClick={() => saveThemeAndFont(activeThemeName, fName)}
                          className={`p-2.5 rounded-xl glass-card border text-xs font-bold text-center ${
                            activeFont === fName
                              ? "border-emerald-400 text-emerald-300 bg-emerald-500/20"
                              : "border-emerald-500/20 text-gray-300 hover:text-white"
                          }`}
                          style={{ fontFamily: `'${fName}', sans-serif` }}
                        >
                          {fName}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Site-wide Font / Text Color */}
                  <div className="space-y-3 pt-4 border-t border-emerald-500/20">
                    <label className="text-xs font-bold text-gray-300 uppercase flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-emerald-400" /> Site Default Text / Font Color
                    </label>
                    <p className="text-[11px] text-gray-500">
                      Sets the default heading/body text color shown to every visitor. Just like themes, each
                      visitor can still use the Navbar's own theme switcher for their personal session — this only
                      controls what everyone sees by default.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="color"
                        value={fontColorForm}
                        onChange={(e) => setFontColorForm(e.target.value)}
                        className="w-11 h-11 rounded-lg border border-emerald-500/30 bg-transparent cursor-pointer"
                      />
                      <span className="text-xs font-mono text-gray-400">{fontColorForm}</span>
                      <div
                        className="px-4 py-2 rounded-xl border text-sm font-bold"
                        style={{ color: fontColorForm, borderColor: "rgba(0,255,136,0.2)", background: "rgba(0,0,0,0.3)" }}
                      >
                        Live Preview Text
                      </div>
                      <button
                        onClick={saveFontColor}
                        disabled={saving}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-black disabled:opacity-50"
                        style={{ backgroundColor: themeConfig.primary }}
                      >
                        <Save className="w-3.5 h-3.5 inline mr-1" /> Save Font Color
                      </button>
                      {settingsForm.defaultFontColor && (
                        <button
                          onClick={resetFontColor}
                          disabled={saving}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-gray-300 border border-gray-600 hover:text-white"
                        >
                          Reset to Theme Default
                        </button>
                      )}
                    </div>
                    {settingsForm.defaultFontColor && (
                      <p className="text-[11px] text-emerald-400">
                        ✓ Currently live: {settingsForm.defaultFontColor}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Courses Manager */}
              {activeTab === "courses" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-400" />
                    Manage Courses (YouTube URL Auto-Parser)
                  </h3>

                  <div className="p-4 rounded-2xl glass-card border border-emerald-500/30 space-y-3 bg-emerald-950/20">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase">
                        {editingCourseId ? `Editing Course #${editingCourseId}` : "Add New YouTube Course"}
                      </h4>
                      {editingCourseId && (
                        <button onClick={cancelEditCourse} className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Cancel Edit
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Course Title"
                        value={courseForm.title}
                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="YouTube Video URL (e.g. https://www.youtube.com/watch?v=...)"
                        value={courseForm.youtubeUrl}
                        onChange={(e) => setCourseForm({ ...courseForm, youtubeUrl: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                        className={inputClass}
                      />
                      <select
                        value={courseForm.category}
                        onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                        className={`${inputClass} bg-slate-900`}
                      >
                        {["Programming", "React", "JavaScript", "HTML", "CSS", "Firebase", "Supabase", "Flutter", "Android", "AI"].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Duration (e.g. 2h 15m)"
                        value={courseForm.duration}
                        onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                        className={inputClass}
                      />
                      <select
                        value={courseForm.level}
                        onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                        className={`${inputClass} bg-slate-900`}
                      >
                        {["Beginner", "Intermediate", "Advanced", "Beginner to Advanced"].map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={submitCourse}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-black flex items-center gap-1.5"
                      style={{ backgroundColor: themeConfig.primary }}
                    >
                      {editingCourseId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{editingCourseId ? "Update Course" : "Publish Course"}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {coursesList.map((c) => (
                      <div key={c.id} className="p-3 rounded-xl glass-card border border-emerald-500/20 flex items-center justify-between text-xs gap-2">
                        <div className="min-w-0">
                          <span className="font-bold text-white">{c.title}</span>
                          <span className="text-emerald-400 font-mono text-[10px] ml-2">[{c.category}]</span>
                          <div className="text-gray-500 text-[10px] truncate max-w-[280px]">{c.youtubeUrl}</div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <a href={c.youtubeUrl} target="_blank" rel="noreferrer" title="Test link" className="text-gray-400 hover:text-emerald-300 p-1.5">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button onClick={() => startEditCourse(c)} title="Edit" className="text-emerald-400 hover:text-emerald-300 p-1.5">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteCourse(c.id)} title="Delete" className="text-red-400 hover:text-red-300 p-1.5">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {coursesList.length === 0 && <p className="text-xs text-gray-500">No courses yet.</p>}
                  </div>
                </div>
              )}

              {/* Tab: APK Apps Manager */}
              {activeTab === "apps" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    Manage APK Downloads
                  </h3>

                  <div className="p-4 rounded-2xl glass-card border border-emerald-500/30 space-y-3 bg-emerald-950/20">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase">
                        {editingAppId ? `Editing App #${editingAppId}` : "Add New APK Application"}
                      </h4>
                      {editingAppId && (
                        <button onClick={cancelEditApp} className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Cancel Edit
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="App Name"
                        value={appForm.name}
                        onChange={(e) => setAppForm({ ...appForm, name: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Direct APK Download URL"
                        value={appForm.apkUrl}
                        onChange={(e) => setAppForm({ ...appForm, apkUrl: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Version (e.g. v1.0.0)"
                        value={appForm.version}
                        onChange={(e) => setAppForm({ ...appForm, version: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Telegram Link"
                        value={appForm.telegramUrl}
                        onChange={(e) => setAppForm({ ...appForm, telegramUrl: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Website Link"
                        value={appForm.websiteUrl}
                        onChange={(e) => setAppForm({ ...appForm, websiteUrl: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Play Store Link"
                        value={appForm.playstoreUrl}
                        onChange={(e) => setAppForm({ ...appForm, playstoreUrl: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={appForm.description}
                        onChange={(e) => setAppForm({ ...appForm, description: e.target.value })}
                        className={`${inputClass} sm:col-span-2`}
                      />
                    </div>

                    <button
                      onClick={submitApp}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-black flex items-center gap-1.5"
                      style={{ backgroundColor: themeConfig.primary }}
                    >
                      {editingAppId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{editingAppId ? "Update App" : "Add APK"}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {appsList.map((a) => (
                      <div key={a.id} className="p-3 rounded-xl glass-card border border-emerald-500/20 flex items-center justify-between text-xs gap-2">
                        <div className="min-w-0">
                          <span className="font-bold text-white">{a.name}</span>
                          <span className="text-emerald-400 font-mono text-[10px] ml-2">{a.version}</span>
                          <span className="text-gray-500 text-[10px] ml-2">{a.downloads} downloads</span>
                          <div className="text-gray-500 text-[10px] truncate max-w-[280px]">{a.apkUrl}</div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <a href={a.apkUrl} target="_blank" rel="noreferrer" title="Test APK link" className="text-gray-400 hover:text-emerald-300 p-1.5">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button onClick={() => startEditApp(a)} title="Edit" className="text-emerald-400 hover:text-emerald-300 p-1.5">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteApp(a.id)} title="Delete" className="text-red-400 hover:text-red-300 p-1.5">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {appsList.length === 0 && <p className="text-xs text-gray-500">No apps yet.</p>}
                  </div>
                </div>
              )}

              {/* Tab: Music Manager */}
              {activeTab === "music" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Music2 className="w-5 h-5 text-emerald-400" />
                    Manage Music Tracks
                  </h3>

                  <div className="p-4 rounded-2xl glass-card border border-emerald-500/30 space-y-3 bg-emerald-950/20">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase">
                        {editingTrackId ? `Editing Track #${editingTrackId}` : "Add New Song / Track"}
                      </h4>
                      {editingTrackId && (
                        <button onClick={cancelEditTrack} className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Cancel Edit
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Song Title"
                        value={trackForm.title}
                        onChange={(e) => setTrackForm({ ...trackForm, title: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Artist"
                        value={trackForm.artist}
                        onChange={(e) => setTrackForm({ ...trackForm, artist: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Audio Stream MP3 / Cloudinary URL"
                        value={trackForm.audioUrl}
                        onChange={(e) => setTrackForm({ ...trackForm, audioUrl: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Cover Image URL"
                        value={trackForm.coverUrl}
                        onChange={(e) => setTrackForm({ ...trackForm, coverUrl: e.target.value })}
                        className={inputClass}
                      />
                      <select
                        value={trackForm.category}
                        onChange={(e) => setTrackForm({ ...trackForm, category: e.target.value })}
                        className={`${inputClass} bg-slate-900`}
                      >
                        {["Bus Songs", "Truck Songs", "Salon Songs", "DJ Remix", "Bhakti", "LoFi", "Sad Songs", "Romantic", "Trending", "Latest"].map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Duration (e.g. 3:30)"
                        value={trackForm.duration}
                        onChange={(e) => setTrackForm({ ...trackForm, duration: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    <button
                      onClick={submitTrack}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-black flex items-center gap-1.5"
                      style={{ backgroundColor: themeConfig.primary }}
                    >
                      {editingTrackId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{editingTrackId ? "Update Track" : "Add Audio Track"}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {musicList.map((m) => (
                      <div key={m.id} className="p-3 rounded-xl glass-card border border-emerald-500/20 flex items-center justify-between text-xs gap-2">
                        <div className="min-w-0">
                          <span className="font-bold text-white">{m.title}</span>
                          <span className="text-emerald-400 font-mono text-[10px] ml-2">[{m.category}]</span>
                          <span className="text-gray-500 text-[10px] ml-2">{m.plays} plays</span>
                          <div className="text-gray-500 text-[10px] truncate max-w-[280px]">{m.audioUrl}</div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <a href={m.audioUrl} target="_blank" rel="noreferrer" title="Test audio link" className="text-gray-400 hover:text-emerald-300 p-1.5">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button onClick={() => startEditTrack(m)} title="Edit" className="text-emerald-400 hover:text-emerald-300 p-1.5">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteMusic(m.id)} title="Delete" className="text-red-400 hover:text-red-300 p-1.5">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {musicList.length === 0 && <p className="text-xs text-gray-500">No tracks yet.</p>}
                  </div>
                </div>
              )}

              {/* Tab: Social Links / Connections Manager */}
              {activeTab === "social" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-emerald-400" />
                    Manage All Website Connections (Footer, Contact, Navbar)
                  </h3>

                  <div className="p-4 rounded-2xl glass-card border border-emerald-500/30 space-y-3 bg-emerald-950/20">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase">
                        {editingSocialId ? `Editing Connection #${editingSocialId}` : "Add New Connection"}
                      </h4>
                      {editingSocialId && (
                        <button onClick={cancelEditSocial} className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Cancel Edit
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Platform key (e.g. youtube)"
                        value={socialForm.platform}
                        onChange={(e) => setSocialForm({ ...socialForm, platform: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Display Label (e.g. YouTube)"
                        value={socialForm.label}
                        onChange={(e) => setSocialForm({ ...socialForm, label: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Full URL (WhatsApp / Telegram / Instagram / GitHub / etc.)"
                        value={socialForm.url}
                        onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                        className={`${inputClass} sm:col-span-2`}
                      />
                      <select
                        value={socialForm.icon}
                        onChange={(e) => setSocialForm({ ...socialForm, icon: e.target.value })}
                        className={`${inputClass} bg-slate-900`}
                      >
                        {["Github", "Linkedin", "Send", "Instagram", "Facebook", "MessageCircle", "Mail", "Globe"].map((ic) => (
                          <option key={ic} value={ic}>{ic}</option>
                        ))}
                      </select>
                      <input
                        type="color"
                        value={socialForm.color}
                        onChange={(e) => setSocialForm({ ...socialForm, color: e.target.value })}
                        className="w-full h-9 rounded-lg border border-emerald-500/30 bg-transparent cursor-pointer"
                      />
                    </div>

                    <button
                      onClick={submitSocial}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-black flex items-center gap-1.5"
                      style={{ backgroundColor: themeConfig.primary }}
                    >
                      {editingSocialId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{editingSocialId ? "Update Connection" : "Add Connection"}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {socialList.map((s) => (
                      <div key={s.id} className="p-3 rounded-xl glass-card border border-emerald-500/20 flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                          <span className="font-bold text-white flex-shrink-0">{s.label}</span>
                          <span className="text-gray-500 text-[10px] truncate">{s.url}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <a href={s.url} target="_blank" rel="noreferrer" title="Test link" className="text-gray-400 hover:text-emerald-300 p-1.5">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => toggleSocialVisibility(s)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold ${s.isVisible ? "text-emerald-300 bg-emerald-500/10" : "text-gray-500 bg-gray-800"}`}
                          >
                            {s.isVisible ? "Visible" : "Hidden"}
                          </button>
                          <button onClick={() => startEditSocial(s)} title="Edit" className="text-emerald-400 hover:text-emerald-300 p-1.5">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteSocialLink(s.id)} title="Delete" className="text-red-400 hover:text-red-300 p-1.5">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {socialList.length === 0 && <p className="text-xs text-gray-500">No connections yet.</p>}
                  </div>
                </div>
              )}

              {/* Tab: Resume Manager */}
              {activeTab === "resume" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    Resume Upload & Version History
                  </h3>

                  <div className="p-4 rounded-2xl glass-card border border-emerald-500/30 space-y-3 bg-emerald-950/20">
                    <h4 className="text-xs font-bold text-white uppercase">Option 1: Upload PDF From Your Device</h4>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-gray-300 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-emerald-500/20 file:text-emerald-300 file:text-xs file:font-bold"
                    />
                    <button
                      onClick={uploadResume}
                      disabled={!resumeFile || saving}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-black flex items-center gap-2 disabled:opacity-40"
                      style={{ backgroundColor: themeConfig.primary }}
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload & Publish Instantly</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl glass-card border border-emerald-500/30 space-y-3 bg-emerald-950/20">
                    <h4 className="text-xs font-bold text-white uppercase">Option 2: Paste an External Link</h4>
                    <p className="text-[11px] text-gray-500">Google Drive, Dropbox, or any hosted PDF link.</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://drive.google.com/... or any PDF URL"
                        value={resumeUrlInput}
                        onChange={(e) => setResumeUrlInput(e.target.value)}
                        className={`${inputClass} flex-1`}
                      />
                      <button
                        onClick={saveResumeLink}
                        disabled={!resumeUrlInput.trim() || saving}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-black flex items-center gap-2 disabled:opacity-40 whitespace-nowrap"
                        style={{ backgroundColor: themeConfig.primary }}
                      >
                        <Link2 className="w-4 h-4" />
                        <span>Save Link</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Current live resume: <a href={profileForm.resumeUrl} target="_blank" rel="noreferrer" className="text-emerald-400 underline">{profileForm.resumeUrl}</a>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-300 uppercase">Version History</h4>
                    {resumeHistory.length === 0 ? (
                      <p className="text-xs text-gray-500">No uploaded versions yet — using default resume link.</p>
                    ) : (
                      resumeHistory.map((r) => (
                        <div key={r.id} className="p-3 rounded-xl glass-card border border-emerald-500/20 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Download className="w-3.5 h-3.5 text-emerald-400" />
                            <a href={r.url} target="_blank" rel="noreferrer" className="text-white hover:text-emerald-300 truncate max-w-[220px]">{r.url}</a>
                          </div>
                          {r.isActive && <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">Active</span>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Messages */}
              {activeTab === "messages" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                    Received User Messages ({messagesList.length})
                  </h3>

                  <div className="space-y-3">
                    {messagesList.length === 0 ? (
                      <p className="text-xs text-gray-400">No contact messages received yet.</p>
                    ) : (
                      messagesList.map((msg) => (
                        <div key={msg.id} className="p-4 rounded-2xl glass-card border border-emerald-500/20 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{msg.name} ({msg.email})</span>
                            <div className="flex items-center gap-2">
                              <a href={`mailto:${msg.email}`} title="Reply via email" className="text-emerald-400 hover:text-emerald-300">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button onClick={() => deleteMessage(msg.id)} className="text-red-400">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-emerald-300 font-semibold">{msg.subject}</p>
                          <p className="text-gray-300 leading-relaxed">{msg.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Donations */}
              {activeTab === "donations" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    Supporter Donations History
                  </h3>

                  <div className="space-y-2">
                    {donationsList.map((d) => (
                      <div key={d.id} className="p-3 rounded-2xl glass-card border border-emerald-500/20 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white">{d.donorName}</span>
                          <p className="text-gray-400 text-[11px]">"{d.message}"</p>
                        </div>
                        <span className="font-mono font-bold text-emerald-400">₹{d.amount}</span>
                      </div>
                    ))}
                    {donationsList.length === 0 && <p className="text-xs text-gray-500">No donations yet.</p>}
                  </div>
                </div>
              )}

              {/* Tab: Security / Change Password */}
              {activeTab === "security" && (
                <div className="space-y-6 max-w-lg">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-emerald-400" />
                    Admin Security
                  </h3>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-[11px] text-emerald-300">
                    Current admin username: <strong>{currentAdminUsername}</strong>
                  </div>

                  <div className="p-4 rounded-2xl glass-card border border-emerald-500/30 space-y-3 bg-emerald-950/20">
                    <h4 className="text-xs font-bold text-white uppercase">Change Admin Password</h4>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-300 font-semibold">Current Password *</label>
                      <div className="relative">
                        <input
                          type={pwShow ? "text" : "password"}
                          value={pwCurrent}
                          onChange={(e) => setPwCurrent(e.target.value)}
                          className={`${inputClass} pr-9`}
                          placeholder="Enter your current password"
                        />
                        <button type="button" onClick={() => setPwShow((p) => !p)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                          {pwShow ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-300 font-semibold">New Username (optional)</label>
                      <input
                        type="text"
                        value={pwNewUsername}
                        onChange={(e) => setPwNewUsername(e.target.value)}
                        className={inputClass}
                        placeholder={currentAdminUsername}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-300 font-semibold">New Password *</label>
                      <input
                        type={pwShow ? "text" : "password"}
                        value={pwNew}
                        onChange={(e) => setPwNew(e.target.value)}
                        className={inputClass}
                        placeholder="At least 6 characters"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-300 font-semibold">Confirm New Password *</label>
                      <input
                        type={pwShow ? "text" : "password"}
                        value={pwConfirm}
                        onChange={(e) => setPwConfirm(e.target.value)}
                        className={inputClass}
                        placeholder="Re-enter new password"
                      />
                    </div>

                    {pwError && <p className="text-xs font-semibold text-red-400">{pwError}</p>}

                    <button
                      onClick={changePassword}
                      disabled={pwSaving}
                      className="px-5 py-2.5 rounded-full text-xs font-bold text-black shadow-lg disabled:opacity-50"
                      style={{ backgroundColor: themeConfig.primary }}
                    >
                      <KeyRound className="w-4 h-4 inline mr-1" />
                      {pwSaving ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
