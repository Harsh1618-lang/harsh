"use client";

import React from "react";
import { CustomBackgroundLayer } from "@/components/CustomBackgroundLayer";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { CoursesSection } from "@/components/CoursesSection";
import { MusicModule } from "@/components/MusicModule";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { BottomFloatingNav } from "@/components/BottomFloatingNav";
import { GlobalAudioPlayer } from "@/components/GlobalAudioPlayer";
import { VideoPlayerModal } from "@/components/VideoPlayerModal";
import { DonationModal } from "@/components/DonationModal";
import { AppsSheet } from "@/components/AppsSheet";
import { AdminPanel } from "@/components/AdminPanel";
import { AiChatWidget } from "@/components/AiChatWidget";

export default function Home() {
  return (
    <main className="min-h-screen relative selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Admin-configurable custom background image (behind the aurora layer) */}
      <CustomBackgroundLayer />
      {/* Background Animated Atmosphere */}
      <ParticlesBackground />

      {/* Top Navbar */}
      <Navbar />
      {/* Spacer — Navbar is position:fixed (removed from document flow), so
          this reserves the space it used to occupy back when it was
          position:sticky. Height covers the navbar's own visual height
          (padding + icon size) plus its top-3 offset, across breakpoints. */}
      <div className="h-[68px] sm:h-[76px]" aria-hidden="true" />

      {/* Main Sections */}
      <div className="relative z-10 space-y-12">
        <HeroSection />
        <AboutSection />
        <CoursesSection />
        <MusicModule />
        <ContactSection />
      </div>

      {/* Footer */}
      <Footer />

      {/* Floating Elements & Modals */}
      <BottomFloatingNav />
      <GlobalAudioPlayer />
      <VideoPlayerModal />
      <DonationModal />
      <AppsSheet />
      <AdminPanel />
      <AiChatWidget />
    </main>
  );
}
