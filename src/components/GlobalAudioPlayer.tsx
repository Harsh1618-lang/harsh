"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Music2,
  ListMusic,
  X,
} from "lucide-react";

export function GlobalAudioPlayer() {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    nextSong,
    prevSong,
    themeConfig,
    isShuffle,
    toggleShuffle,
    isRepeat,
    toggleRepeat,
    isQueueOpen,
    setIsQueueOpen,
    songList,
    playSong,
  } = useApp();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Report this bar's real, measured top edge as a CSS variable whenever it's
  // visible, so floating action buttons (AI assistant, Support/Donate) can
  // reliably stack above it — and clear it the moment playback stops, so
  // those buttons fall back to sitting above the bottom nav instead.
  useEffect(() => {
    if (!currentSong) {
      document.documentElement.style.removeProperty("--safe-area-audio-player");
      return;
    }
    const el = wrapperRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const distanceFromBottom = Math.round(window.innerHeight - rect.top + 12);
      document.documentElement.style.setProperty("--safe-area-audio-player", `${distanceFromBottom}px`);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      document.documentElement.style.removeProperty("--safe-area-audio-player");
    };
  }, [currentSong, isQueueOpen]);

  if (!currentSong) return null;

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  return (
    <>
      <div ref={wrapperRef} className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-4xl animate-in slide-in-from-bottom duration-300">
        <audio
          ref={audioRef}
          src={currentSong.audioUrl}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
              setDuration(audioRef.current.duration || 0);
            }
          }}
          onEnded={() => {
            if (isRepeat && audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play();
            } else {
              nextSong();
            }
          }}
        />

        <div className="glass-panel rounded-3xl p-3 sm:p-4 border border-emerald-500/40 shadow-[0_0_30px_rgba(0,255,136,0.2)] bg-[#07151a]/95 backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Track Info */}
          <div className="flex items-center gap-3 w-full sm:w-1/3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-emerald-400/40 flex-shrink-0">
              <Image
                src={currentSong.coverUrl}
                alt={currentSong.title}
                fill
                className={`object-cover ${isPlaying ? "animate-spin" : ""}`}
                style={{ animationDuration: "8s" }}
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                {currentSong.title}
              </h4>
              <p className="text-[11px] text-emerald-400 truncate">
                {currentSong.artist}
              </p>
            </div>
          </div>

          {/* Player Controls & Scrubber */}
          <div className="flex flex-col items-center gap-1.5 w-full sm:w-2/5">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleShuffle}
                className="p-1 text-xs"
                style={{ color: isShuffle ? themeConfig.primary : "#6b7280" }}
                title="Shuffle"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={prevSong}
                className="p-1.5 rounded-full text-gray-300 hover:text-white"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full flex items-center justify-center text-black shadow-md transition-transform hover:scale-110"
                style={{ backgroundColor: themeConfig.primary }}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-black" />
                ) : (
                  <Play className="w-4 h-4 fill-black ml-0.5" />
                )}
              </button>

              <button
                onClick={nextSong}
                className="p-1.5 rounded-full text-gray-300 hover:text-white"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={toggleRepeat}
                className="p-1 text-xs"
                style={{ color: isRepeat ? themeConfig.primary : "#6b7280" }}
                title="Repeat"
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Time Scrubber */}
            <div className="w-full flex items-center gap-2 text-[10px] font-mono text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume + Queue */}
          <div className="flex items-center gap-2 w-full sm:w-1/4 justify-end">
            <button
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className="p-1.5 rounded-full transition-colors"
              style={{ color: isQueueOpen ? themeConfig.primary : "#9ca3af" }}
              title="Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setIsMuted((prev) => !prev)}
                className="text-gray-400 hover:text-white"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Queue Drawer (Up Next tracks) */}
        {isQueueOpen && (
          <div className="absolute bottom-full mb-3 right-0 w-full sm:w-80 max-h-72 overflow-y-auto rounded-2xl border border-emerald-500/30 bg-[#07151a]/98 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,255,136,0.2)] p-3 space-y-1.5 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between px-1 pb-2 border-b border-emerald-500/15">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Music2 className="w-3.5 h-3.5 text-emerald-400" /> Up Next Queue
              </span>
              <button onClick={() => setIsQueueOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {songList.map((s) => {
              const active = s.id === currentSong.id;
              return (
                <button
                  key={s.id}
                  onClick={() => playSong(s)}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                    active ? "bg-emerald-500/15 border border-emerald-400/40" : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={s.coverUrl} alt={s.title} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold truncate ${active ? "text-emerald-300" : "text-white"}`}>
                      {s.title}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">{s.artist}</p>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">{s.duration}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
