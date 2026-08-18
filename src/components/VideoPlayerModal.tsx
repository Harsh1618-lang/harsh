"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useApp, Course } from "@/context/AppContext";
import { X, Play, Eye, Clock, Share2, ListVideo, SkipForward, History } from "lucide-react";
import { getProgress, saveProgress, clearProgress, shouldResume } from "@/lib/videoProgress";

// Minimal typing for the YouTube IFrame Player API (loaded dynamically at runtime).
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve) => {
    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prevCallback?.();
      resolve();
    };
    if (!document.getElementById("youtube-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
  return apiLoadPromise;
}

export function VideoPlayerModal() {
  const { activeVideoCourse, setActiveVideoCourse, themeConfig } = useApp();
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [autoNextCountdown, setAutoNextCountdown] = useState<number | null>(null);
  const [resumeToast, setResumeToast] = useState<string | null>(null);

  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const relatedCoursesRef = useRef<Course[]>([]);

  useEffect(() => {
    relatedCoursesRef.current = relatedCourses;
  }, [relatedCourses]);

  useEffect(() => {
    if (!activeVideoCourse) return;
    fetch(`/api/courses?category=${encodeURIComponent(activeVideoCourse.category)}`)
      .then((res) => res.json())
      .then((data) => {
        const list: Course[] = (data.courses || []).filter(
          (c: Course) => c.id !== activeVideoCourse.id
        );
        setRelatedCourses(list.slice(0, 6));
      })
      .catch(() => {});
  }, [activeVideoCourse]);

  const persistCurrentProgress = useCallback((courseId: number) => {
    const player = playerRef.current;
    if (!player || typeof player.getCurrentTime !== "function") return;
    try {
      const time = player.getCurrentTime();
      const duration = player.getDuration?.() || 0;
      if (time > 0) saveProgress(courseId, time, duration);
    } catch {
      // player may be mid-teardown — ignore
    }
  }, []);

  const startAutoNextCountdown = useCallback(() => {
    if (relatedCoursesRef.current.length === 0) return;
    setAutoNextCountdown(5);
    countdownTimer.current = setInterval(() => {
      setAutoNextCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (countdownTimer.current) clearInterval(countdownTimer.current);
          setActiveVideoCourse(relatedCoursesRef.current[0]);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [setActiveVideoCourse]);

  const cancelAutoNext = () => {
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    setAutoNextCountdown(null);
  };

  // Initialize a real YouTube IFrame Player (gives reliable getCurrentTime/seekTo
  // for the "Remember Progress" + Auto Next requirements).
  useEffect(() => {
    if (!activeVideoCourse) return;
    let destroyed = false;
    setResumeToast(null);

    loadYouTubeApi().then(() => {
      if (destroyed || !playerContainerRef.current) return;

      const savedProgress = getProgress(activeVideoCourse.id);

      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId: activeVideoCourse.youtubeVideoId,
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: (e: any) => {
            if (savedProgress && shouldResume(savedProgress.time, savedProgress.duration)) {
              e.target.seekTo(savedProgress.time, true);
              const mins = Math.floor(savedProgress.time / 60);
              const secs = Math.floor(savedProgress.time % 60).toString().padStart(2, "0");
              setResumeToast(`Resumed from ${mins}:${secs}`);
              setTimeout(() => setResumeToast(null), 4000);
            }
            e.target.playVideo();
          },
          onStateChange: (e: any) => {
            // 0 = ended, 2 = paused, 1 = playing
            if (e.data === 0) {
              clearProgress(activeVideoCourse.id);
              startAutoNextCountdown();
            } else if (e.data === 2) {
              persistCurrentProgress(activeVideoCourse.id);
            }
          },
        },
      });
    });

    // Periodically persist watch position while the modal is open.
    saveIntervalRef.current = setInterval(() => {
      persistCurrentProgress(activeVideoCourse.id);
    }, 5000);

    return () => {
      destroyed = true;
      persistCurrentProgress(activeVideoCourse.id);
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      if (countdownTimer.current) clearInterval(countdownTimer.current);
      try {
        playerRef.current?.destroy?.();
      } catch {
        // ignore teardown errors
      }
      playerRef.current = null;
      setAutoNextCountdown(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVideoCourse, persistCurrentProgress, startAutoNextCountdown]);

  if (!activeVideoCourse) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3 my-4">
        {/* Main Player Column */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-emerald-500/40 shadow-[0_0_50px_rgba(0,255,136,0.3)] bg-[#071318]">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-emerald-500/20 bg-emerald-950/30">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-red-500 fill-red-500" />
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                {activeVideoCourse.category} Course Video
              </span>
            </div>

            <button
              onClick={() => {
                cancelAutoNext();
                setActiveVideoCourse(null);
              }}
              className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* YouTube Player (official IFrame API — enables reliable progress tracking) */}
          <div className="relative w-full aspect-video bg-black">
            <div key={activeVideoCourse.id} ref={playerContainerRef} className="w-full h-full" />

            {/* Resume toast */}
            {resumeToast && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-black/80 border border-emerald-400/40 text-xs font-semibold text-emerald-300 animate-in fade-in slide-in-from-top-2">
                <History className="w-3.5 h-3.5" />
                {resumeToast}
              </div>
            )}

            {/* Auto-next overlay countdown */}
            {autoNextCountdown !== null && relatedCourses[0] && (
              <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-4 p-6 text-center animate-in fade-in">
                <p className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                  Playing Next in {autoNextCountdown}s
                </p>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-emerald-400/40">
                    <Image src={relatedCourses[0].thumbnail} alt={relatedCourses[0].title} fill className="object-cover" />
                  </div>
                  <h4 className="text-sm font-bold text-white max-w-xs text-left">
                    {relatedCourses[0].title}
                  </h4>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      cancelAutoNext();
                      setActiveVideoCourse(relatedCourses[0]);
                    }}
                    className="px-5 py-2 rounded-full text-xs font-bold text-black flex items-center gap-2"
                    style={{ backgroundColor: themeConfig.primary }}
                  >
                    <SkipForward className="w-3.5 h-3.5" /> Play Now
                  </button>
                  <button
                    onClick={cancelAutoNext}
                    className="px-5 py-2 rounded-full text-xs font-bold text-gray-300 border border-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Course Info & Details Footer */}
          <div className="p-6 space-y-3 bg-[#0a1b20]/90">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-white">
                {activeVideoCourse.title}
              </h3>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {activeVideoCourse.level}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {activeVideoCourse.description}
            </p>

            <div className="flex flex-wrap items-center justify-between text-xs text-gray-400 pt-2 border-t border-emerald-500/20">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  {activeVideoCourse.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  {activeVideoCourse.views.toLocaleString()} views
                </span>
              </div>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: activeVideoCourse.title,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Course</span>
              </button>
            </div>
          </div>
        </div>

        {/* Up Next Playlist Sidebar */}
        <div className="glass-panel rounded-3xl border border-emerald-500/30 bg-[#071318] p-4 space-y-3 max-h-[80vh] overflow-y-auto hidden lg:block">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-emerald-500/15">
            <ListVideo className="w-4 h-4 text-emerald-400" /> Up Next Playlist
          </h4>
          {relatedCourses.length === 0 ? (
            <p className="text-xs text-gray-500">No related courses found.</p>
          ) : (
            relatedCourses.map((c) => {
              const progress = getProgress(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    cancelAutoNext();
                    setActiveVideoCourse(c);
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-all text-left"
                >
                  <div className="relative w-20 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-emerald-500/20">
                    <Image src={c.thumbnail} alt={c.title} fill className="object-cover" />
                    {progress && shouldResume(progress.time, progress.duration) && progress.duration > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                        <div
                          className="h-full"
                          style={{
                            width: `${Math.min(100, (progress.time / progress.duration) * 100)}%`,
                            backgroundColor: themeConfig.primary,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white line-clamp-2">{c.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{c.duration}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
