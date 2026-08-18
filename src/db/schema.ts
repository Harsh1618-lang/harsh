import { pgTable, text, serial, timestamp, integer, boolean, jsonb, real } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  // Guarantees this is truly a singleton row: seeding/updating always targets
  // the exact same row via this unique key, instead of a fragile, unordered
  // `.limit(1)` query that could silently return a different duplicate row
  // (which previously caused admin edits — avatar, background, bio, etc. —
  // to appear "not saved" because reads/writes hit different rows).
  singletonKey: text("singleton_key").notNull().unique().default("default"),
  name: text("name").notNull().default("Harsh Dev"),
  roleTitle: text("role_title").notNull().default("Full Stack Developer."),
  tagline: text("tagline").notNull().default("I design and build complete web products — from database to pixel with clean code and fast, reliable interfaces."),
  bio: text("bio").notNull().default("I'm a passionate Full Stack Developer who loves building scalable, beautiful and high performance web applications."),
  avatarUrl: text("avatar_url").notNull().default("/images/harsh-dev-profile.jpg"),
  availability: text("availability").notNull().default("Available for work"),
  resumeUrl: text("resume_url").notNull().default("/resume/Harsh_Dev_Resume.pdf"),
  projectsCompleted: integer("projects_completed").notNull().default(50),
  happyClients: integer("happy_clients").notNull().default(30),
  yearsExperience: text("years_experience").notNull().default("2+"),
  cupsOfCode: text("cups_of_code").notNull().default("500+"),
  location: text("location").default("Mumbai / Remote, India"),
  email: text("email").default("contact@harshdev.io"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull().default("Programming"),
  description: text("description").notNull(),
  thumbnail: text("thumbnail").notNull(),
  duration: text("duration").notNull().default("2h 30m"),
  level: text("level").notNull().default("Beginner to Advanced"),
  youtubeUrl: text("youtube_url").notNull(),
  youtubeVideoId: text("youtube_video_id").notNull(),
  views: integer("views").notNull().default(1250),
  isFeatured: boolean("is_featured").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courseCategories = pgTable("course_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").default("Code"),
});

export const apps = pgTable("apps", {
  id: serial("id").primaryKey(),
  // Nullable + unique: only ever populated for the built-in seed rows, so
  // re-running the seeder (e.g. under a startup race) can safely use
  // onConflictDoNothing instead of blindly re-inserting duplicates. Admin
  // Panel-created apps leave this null (Postgres allows unlimited NULLs in
  // a unique column), so they never collide with anything.
  seedSlug: text("seed_slug").unique(),
  name: text("name").notNull(),
  version: text("version").notNull().default("1.0.0"),
  category: text("category").notNull().default("Utility"),
  icon: text("icon").notNull(),
  description: text("description").notNull(),
  size: text("size").notNull().default("15 MB"),
  downloads: integer("downloads").notNull().default(3400),
  apkUrl: text("apk_url").notNull(),
  telegramUrl: text("telegram_url"),
  websiteUrl: text("website_url"),
  playstoreUrl: text("playstore_url"),
  rating: real("rating").default(4.9),
  createdAt: timestamp("created_at").defaultNow(),
});

export const music = pgTable("music", {
  id: serial("id").primaryKey(),
  // See apps.seedSlug above for why this exists.
  seedSlug: text("seed_slug").unique(),
  title: text("title").notNull(),
  artist: text("artist").notNull().default("Harsh Dev Studio"),
  album: text("album").default("Vibes Collection"),
  category: text("category").notNull().default("LoFi"),
  coverUrl: text("cover_url").notNull(),
  audioUrl: text("audio_url").notNull(),
  duration: text("duration").notNull().default("3:45"),
  plays: integer("plays").notNull().default(890),
  isTrending: boolean("is_trending").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const musicCategories = pgTable("music_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  donorName: text("donor_name").notNull().default("Anonymous Supporter"),
  donorEmail: text("donor_email"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("INR"),
  message: text("message"),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  paymentMethod: text("payment_method").default("UPI / QR / Razorpay"),
  // "pending" = order created, payment not yet confirmed (or UPI manual entry).
  // "confirmed" = Razorpay webhook verified the payment signature — only
  // "confirmed" rows are meant to be shown on the public Wall of Supporters.
  // "failed" = Razorpay reported the payment failed/was cancelled.
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  // See profiles.singletonKey above — same fix applied here so admin theme,
  // background, nav-label, and other site-settings edits always read/write
  // the one true settings row instead of a random duplicate.
  singletonKey: text("singleton_key").notNull().unique().default("default"),
  activeTheme: text("active_theme").notNull().default("Cyber Green"),
  activeFont: text("active_font").notNull().default("Outfit"),
  customThemeConfig: jsonb("custom_theme_config"),
  githubUrl: text("github_url").default("https://github.com"),
  linkedinUrl: text("linkedin_url").default("https://linkedin.com"),
  telegramUrl: text("telegram_url").default("https://t.me"),
  instagramUrl: text("instagram_url").default("https://instagram.com"),
  whatsappUrl: text("whatsapp_url").default("https://wa.me/919999999999"),
  emailUrl: text("email_url").default("mailto:contact@harshdev.io"),
  facebookUrl: text("facebook_url").default("https://facebook.com"),
  mapEmbedUrl: text("map_embed_url").default(
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241316.86016195315!2d72.7410992!3d19.0821978!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000"
  ),
  contactPhone: text("contact_phone").default("+91 99999 99999"),
  contactLocation: text("contact_location").default("Mumbai / Remote, India"),
  footerText: text("footer_text").default(
    "Premium Full Stack Developer Portfolio, Free Masterclasses, Android APK Utilities & Cyber Audio Soundtracks."
  ),
  navbarLogoText: text("navbar_logo_text").default("HarshDev"),
  buttonStyle: text("button_style").default("rounded-full"),
  radiusScale: text("radius_scale").default("1.5rem"),
  shadowIntensity: text("shadow_intensity").default("0.4"),
  animationSpeed: text("animation_speed").default("1"),
  pwaEnabled: boolean("pwa_enabled").default(true),
  // Customizable Navbar / Bottom-Nav tab labels, e.g.
  // { "home": "Home", "about": "About", "courses": "Courses", "apps": "Apps", "music": "Music", "contact": "Contact" }
  navLabels: jsonb("nav_labels"),
  // Site-wide custom background image (behind the aurora/particle layer)
  customBackgroundUrl: text("custom_background_url"),
  customBackgroundOpacity: text("custom_background_opacity").default("0.35"),
  // Site-wide default text/font color (admin-set). Null means "use the
  // active theme's default off-white". Individual visitors can still choose
  // their own personal override (stored client-side), same pattern as themes.
  defaultFontColor: text("default_font_color"),
  // Dedicated WhatsApp number (digits only, with country code, e.g.
  // "919876543210") — single source of truth so the WhatsApp button in
  // Contact/Donation always opens a real, correctly-formatted wa.me link
  // instead of drifting out of sync with the human-readable "contactPhone".
  whatsappNumber: text("whatsapp_number").default("919999999999"),
  // Donation settings: real UPI ID + mobile number shown in the Donation
  // modal, and used to generate a live, scannable UPI QR code.
  upiId: text("upi_id").default("63925516@ybl"),
  donationMobileNumber: text("donation_mobile_number").default("+91 6392551618"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  // See profiles.singletonKey above — same fix applied here.
  singletonKey: text("singleton_key").notNull().unique().default("default"),
  pageviews: integer("pageviews").notNull().default(15420),
  downloads: integer("downloads").notNull().default(4230),
  musicPlays: integer("music_plays").notNull().default(12890),
  totalDonations: integer("total_donations").notNull().default(24500),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Assistant chat logs — powers the "Ask AI" free chat + web search feature
export const aiChatLogs = pgTable("ai_chat_logs", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  answer: text("answer"),
  source: text("source").notNull().default("search"), // "llm" | "search" | "instant" | "math"
  sourcesUsed: jsonb("sources_used"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin / secure users table
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("owner"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Structured social links (footer + contact + navbar)
export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  icon: text("icon").notNull().default("Globe"),
  color: text("color").default("#00ff88"),
  sortOrder: integer("sort_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
});

// Resume version history / admin uploads
export const resumeVersions = pgTable("resume_versions", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  label: text("label").notNull().default("Resume"),
  isActive: boolean("is_active").notNull().default(true),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// APK download event log (for analytics feed)
export const downloadLogs = pgTable("download_logs", {
  id: serial("id").primaryKey(),
  appId: integer("app_id"),
  appName: text("app_name"),
  ip: text("ip"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Music play event log (for analytics feed)
export const playLogs = pgTable("play_logs", {
  id: serial("id").primaryKey(),
  trackId: integer("track_id"),
  trackTitle: text("track_title"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin-created / saved custom theme presets (Theme Builder)
export const customThemes = pgTable("custom_themes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  config: jsonb("config").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Navbar / Footer / Homepage editable website-builder content blocks
export const siteContent = pgTable("site_content", {
  id: serial("id").primaryKey(),
  section: text("section").notNull().unique(), // navbar | footer | homepage
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
