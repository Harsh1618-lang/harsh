"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useApp, Song } from "@/context/AppContext";
import {
  Play,
  Pause,
  Music2,
  Disc,
  Radio,
  Flame,
  Volume2,
  Sparkles,
  ListMusic
} from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

export function MusicModule() {
  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    setSongList,
    themeConfig,
  } = useApp();

  const [tracks, setTracks] = useState<Song[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);

  const musicCategories = [
    "All",
    "Trending",
    "Bus Songs",
    "Truck Songs",
    "Salon Songs",
    "DJ Remix",
    "Bhakti",
    "LoFi",
    "Sad Songs",
    "Romantic",
    "Latest",
  ];

  const loadMusic = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/music");
      if (res.ok) {
        const data = await res.json();
        const musicData: Song[] = data.music || [];
        setTracks(musicData);
        setSongList(musicData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMusic();
  }, []);

  const filteredTracks = tracks.filter((t) => {
    if (selectedCategory === "All") return true;
    if (selectedCategory.toLowerCase() === "trending") return t.isTrending;
    return t.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <section id="music" className="py-12 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <ScrollReveal className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-400">
          <Music2 className="w-3.5 h-3.5" /> HARSHDEV VIBES MUSIC STUDIO
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          Coding & Driving <span style={{ color: themeConfig.primary }}>Soundtracks</span>
        </h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          From Bus & Truck Highway Beats to Cyberpunk LoFi & Bhakti Chill. Stream unlimited HQ audio tracks.
        </p>
      </ScrollReveal>

      {/* Category Filter Horizontal Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center">
        {musicCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? "text-black shadow-[0_0_15px_rgba(0,255,136,0.4)]"
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

      {/* Featured Track Hero Card */}
      {tracks.length > 0 && (
        <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-teal-950/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(0,255,136,0.15)]">
          <div className="flex items-center gap-5">
            {/* Vinyl Spinning Artwork */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-emerald-400/40 shadow-xl flex-shrink-0 group">
              <Image
                src={tracks[0].coverUrl}
                alt={tracks[0].title}
                fill
                className={`object-cover ${isPlaying && currentSong?.id === tracks[0].id ? "animate-spin" : ""}`}
                style={{ animationDuration: "10s" }}
              />
              <div className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-slate-900 border border-emerald-400/50" />
            </div>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ★ FEATURED TRACK
              </span>
              <h3 className="text-lg font-bold text-white">
                {tracks[0].title}
              </h3>
              <p className="text-xs text-emerald-400 font-medium">
                {tracks[0].artist} • {tracks[0].album}
              </p>
              <p className="text-[11px] text-gray-400">
                {tracks[0].plays.toLocaleString()} plays • Category: {tracks[0].category}
              </p>
            </div>
          </div>

          <button
            onClick={() => playSong(tracks[0])}
            className="px-6 py-3 rounded-full text-xs font-bold text-black flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all hover:scale-105"
            style={{ backgroundColor: themeConfig.primary }}
          >
            {isPlaying && currentSong?.id === tracks[0].id ? (
              <>
                <Pause className="w-4 h-4 fill-black" />
                <span>Pause Track</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black" />
                <span>Play Now</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Tracks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 glass-card rounded-2xl animate-pulse bg-emerald-950/20" />
          ))}
        </div>
      ) : filteredTracks.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-3xl text-gray-400 text-xs">
          No songs found in category "{selectedCategory}".
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTracks.map((song) => {
            const isSelected = currentSong?.id === song.id;
            const isThisPlaying = isSelected && isPlaying;

            return (
              <div
                key={song.id}
                className={`glass-card rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between group ${
                  isSelected
                    ? "border-emerald-400 shadow-[0_0_20px_rgba(0,255,136,0.25)] bg-emerald-950/30"
                    : "border-emerald-500/20 hover:border-emerald-400/40"
                }`}
              >
                <div>
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 group">
                    <Image
                      src={song.coverUrl}
                      alt={song.title}
                      fill
                      className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
                        isThisPlaying ? "animate-pulse" : ""
                      }`}
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <button
                        onClick={() => {
                          if (isSelected) {
                            togglePlay();
                          } else {
                            playSong(song);
                          }
                        }}
                        className="w-12 h-12 rounded-full flex items-center justify-center text-black shadow-lg hover:scale-110 transition-transform"
                        style={{ backgroundColor: themeConfig.primary }}
                      >
                        {isThisPlaying ? (
                          <Pause className="w-5 h-5 fill-black" />
                        ) : (
                          <Play className="w-5 h-5 fill-black ml-0.5" />
                        )}
                      </button>
                    </div>

                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/70 text-emerald-300 border border-emerald-500/30">
                      {song.category}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-emerald-300">
                    {song.title}
                  </h4>
                  <p className="text-xs text-gray-400">{song.artist}</p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-emerald-500/15 text-[11px] text-gray-400 font-mono">
                  <span>{song.duration}</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Radio className="w-3 h-3" />
                    {song.plays.toLocaleString()} plays
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
