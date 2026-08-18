"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Code2,
  ExternalLink,
  Camera,
  Users,
  MessageCircle,
  Globe,
} from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";
import { buildWhatsAppLink, buildMailtoLink } from "@/lib/contactLinks";

// Map SRD platform names -> available lucide icon components
// (this lucide-react build ships lucide's generic icon set only,
// so brand glyphs are represented with the closest matching icon.)
const ICONS: Record<string, React.ElementType> = {
  Github: Code2,
  Linkedin: ExternalLink,
  Send,
  Instagram: Camera,
  Facebook: Users,
  MessageCircle,
  Mail,
  Globe,
};

export function ContactSection() {
  const { settings, themeConfig, socialLinksList } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setError(data.error || "Failed to send message. Please try again.");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const visibleSocials = socialLinksList.filter((s) => s.isVisible !== false);

  return (
    <section id="contact" className="py-12 px-4 md:px-8 max-w-6xl mx-auto space-y-8 pb-28">
      {/* Section Title */}
      <ScrollReveal className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-400">
          <Mail className="w-3.5 h-3.5" /> GET IN TOUCH
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          Let's Build Something <span style={{ color: themeConfig.primary }}>Extraordinary</span>
        </h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Have a project in mind, custom app request, or collaboration opportunity? Drop a message below!
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Contact & Social Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card rounded-3xl p-6 border border-emerald-500/25 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Direct Connectivity
            </h3>

            <div className="space-y-3 text-xs">
              <a
                href={buildMailtoLink(settings?.emailUrl)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 hover:border-emerald-400 transition-all text-gray-300 hover:text-white"
              >
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>{(settings?.emailUrl || "contact@harshdev.io").replace(/^mailto:/, "")}</span>
              </a>

              {/* WhatsApp link is derived directly from the admin's dedicated
                  "WhatsApp Number" field (Website Builder > Contact Info) —
                  a single source of truth, so the button always opens the
                  CURRENT real number instead of a stale/placeholder link. */}
              <a
                href={buildWhatsAppLink(settings?.whatsappNumber || settings?.contactPhone)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 hover:border-emerald-400 transition-all text-gray-300 hover:text-white"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>{settings?.contactPhone || "+91 99999 99999"} (WhatsApp Available)</span>
              </a>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-gray-300">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{settings?.contactLocation || "Mumbai / Remote, India"}</span>
              </div>
            </div>
          </div>

          {/* Social Links List — animated glow icons */}
          <div className="glass-card rounded-3xl p-6 border border-emerald-500/20 space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Social Media Handles
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {(visibleSocials.length > 0
                ? visibleSocials
                : [
                    { platform: "whatsapp", label: "WhatsApp", url: buildWhatsAppLink(settings?.whatsappNumber), icon: "MessageCircle", color: "#25D366" },
                    { platform: "telegram", label: "Telegram", url: "https://t.me", icon: "Send", color: "#229ED9" },
                    { platform: "instagram", label: "Instagram", url: "https://instagram.com", icon: "Instagram", color: "#E1306C" },
                    { platform: "facebook", label: "Facebook", url: "https://facebook.com", icon: "Facebook", color: "#1877F2" },
                    { platform: "github", label: "GitHub", url: "https://github.com", icon: "Github", color: "#e2e8f0" },
                    { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com", icon: "Linkedin", color: "#0A66C2" },
                  ]
              ).map((s, idx) => {
                const Icon = ICONS[s.icon] || Globe;
                // Force the WhatsApp tile specifically to always use the
                // live, admin-configured number — even if the `social_links`
                // table still has an old/placeholder URL saved — so there is
                // exactly one source of truth for "does WhatsApp redirect
                // correctly" across the whole page.
                const href =
                  s.platform === "whatsapp"
                    ? buildWhatsAppLink(settings?.whatsappNumber || settings?.contactPhone)
                    : s.url;
                return (
                  <a
                    key={s.platform + idx}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-400 transition-all text-xs text-gray-300 hover:text-white group"
                    style={{ boxShadow: `0 0 0px transparent` }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 16px ${s.color}55`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: s.color }} />
                    <span className="font-semibold truncate">{s.label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Google Map Embed */}
          <div className="glass-card rounded-3xl p-3 border border-emerald-500/20 overflow-hidden">
            <div className="rounded-2xl overflow-hidden h-48">
              <iframe
                src={settings?.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(92%) hue-rotate(180deg) contrast(0.9)" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/30 space-y-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xl font-bold text-white">Send Direct Message</h3>
            </div>

            {submitted ? (
              <div className="p-8 text-center space-y-3 bg-emerald-950/30 rounded-2xl border border-emerald-500/30 animate-in fade-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">Message Sent Successfully!</h4>
                <p className="text-xs text-gray-300">
                  Thank you for reaching out. Harsh Dev will respond to your email within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-bold text-emerald-400 underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl glass-card text-xs text-white border border-emerald-500/30 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl glass-card text-xs text-white border border-emerald-500/30 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Subject</label>
                  <input
                    type="text"
                    placeholder="Project Inquiry / Course Question"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl glass-card text-xs text-white border border-emerald-500/30 focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Type your message here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl glass-card text-xs text-white border border-emerald-500/30 focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                {error && (
                  <p className="text-xs font-semibold text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full text-xs font-bold text-black flex items-center justify-center gap-2 transition-all hover:scale-102 shadow-[0_0_20px_rgba(0,255,136,0.4)]"
                  style={{ backgroundColor: themeConfig.primary }}
                >
                  <Send className="w-4 h-4 fill-black" />
                  <span>{loading ? "Sending..." : "Send Message"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
