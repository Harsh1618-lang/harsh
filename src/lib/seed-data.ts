import { db } from "@/db";
import {
  profiles,
  courses,
  courseCategories,
  apps,
  music,
  musicCategories,
  donations,
  settings,
  analytics,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function seedDatabaseIfEmpty() {
  try {
    // Profiles/Settings/Analytics are true singletons — protected by a unique
    // `singletonKey` DB constraint (see src/lib/singleton.ts). Using
    // `onConflictDoNothing` here means concurrent requests can never create
    // duplicate rows, even if several API routes race to seed at once (which
    // previously happened on first page load and silently broke admin edits).
    await db
      .insert(profiles)
      .values({
        singletonKey: "default",
        name: "Harsh Dev",
        roleTitle: "Full Stack Developer.",
        tagline:
          "I design and build complete web products — from database to pixel with clean code and fast, reliable interfaces.",
        bio: "I'm a passionate Full Stack Developer who loves building scalable, beautiful and high performance web applications.",
        avatarUrl: "/images/harsh-dev-profile.jpg",
        availability: "Available for work",
        resumeUrl: "/resume/Harsh_Dev_Resume.pdf",
        projectsCompleted: 50,
        happyClients: 30,
        yearsExperience: "2+",
        cupsOfCode: "500+",
        location: "Mumbai / Remote, India",
        email: "harshdev.official@gmail.com",
      })
      .onConflictDoNothing({ target: profiles.singletonKey });

    // Check course categories
    const existingCategories = await db.select().from(courseCategories).limit(1);
    if (existingCategories.length === 0) {
      await db.insert(courseCategories).values([
        { name: "Programming", slug: "programming", icon: "Code" },
        { name: "React", slug: "react", icon: "Atom" },
        { name: "JavaScript", slug: "javascript", icon: "FileCode" },
        { name: "HTML", slug: "html", icon: "Layout" },
        { name: "CSS", slug: "css", icon: "Palette" },
        { name: "Firebase", slug: "firebase", icon: "Flame" },
        { name: "Supabase", slug: "supabase", icon: "Database" },
        { name: "Flutter", slug: "flutter", icon: "Smartphone" },
        { name: "Android", slug: "android", icon: "Bot" },
        { name: "AI", slug: "ai", icon: "Sparkles" },
      ]);
    }

    // Courses already have a unique `slug` — use onConflictDoNothing instead
    // of "select then insert if empty" for the same race-safety reason as
    // the music/apps seeding below.
    await db
      .insert(courses)
      .values([
        {
          title: "Full Stack Next.js 15 & PostgreSQL Masterclass 2026",
          slug: "fullstack-nextjs-postgresql",
          category: "React",
          description:
            "Learn to build scalable production full-stack web applications with Next.js App Router, Drizzle ORM, Tailwind CSS, and Server Actions.",
          thumbnail: "https://images.pexels.com/photos/1102797/pexels-photo-1102797.png?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
          duration: "4h 15m",
          level: "Beginner to Advanced",
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          youtubeVideoId: "dQw4w9WgXcQ",
          views: 4520,
          isFeatured: true,
        },
        {
          title: "Modern JavaScript ES6+ Zero to Hero Blueprint",
          slug: "javascript-zero-to-hero",
          category: "JavaScript",
          description:
            "Master JavaScript fundamentals, async/await, closures, promises, event loop, functional programming, and DOM manipulation.",
          thumbnail: "https://images.pexels.com/photos/4976712/pexels-photo-4976712.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
          duration: "3h 40m",
          level: "Beginner",
          youtubeUrl: "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
          youtubeVideoId: "w7ejDZ8SWv8",
          views: 8900,
          isFeatured: true,
        },
        {
          title: "Supabase Backend Architecture & Realtime Databases",
          slug: "supabase-backend-architecture",
          category: "Supabase",
          description:
            "Deep dive into Supabase Auth, Row Level Security (RLS), Edge Functions, Storage buckets, and Realtime Postgres subscriptions.",
          thumbnail: "https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
          duration: "2h 50m",
          level: "Intermediate",
          youtubeUrl: "https://www.youtube.com/watch?v=7uKz0n5-Tls",
          youtubeVideoId: "7uKz0n5-Tls",
          views: 3120,
          isFeatured: true,
        },
        {
          title: "Flutter & Dart Mobile App Development Bootcamp",
          slug: "flutter-dart-mobile-bootcamp",
          category: "Flutter",
          description:
            "Build cross-platform iOS and Android apps with Flutter 3, Bloc State Management, clean architecture, and API integration.",
          thumbnail: "https://images.pexels.com/photos/6424586/pexels-photo-6424586.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
          duration: "5h 10m",
          level: "Intermediate",
          youtubeUrl: "https://www.youtube.com/watch?v=VPvVD8t02U8",
          youtubeVideoId: "VPvVD8t02U8",
          views: 6780,
          isFeatured: true,
        },
        {
          title: "AI Web App Development: OpenAI & Claude Integration",
          slug: "ai-web-app-development",
          category: "AI",
          description:
            "Learn how to integrate LLM APIs, prompt engineering, vector embeddings, streaming responses, and AI agents into web apps.",
          thumbnail: "https://images.pexels.com/photos/574077/pexels-photo-574077.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
          duration: "3h 15m",
          level: "Advanced",
          youtubeUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8",
          youtubeVideoId: "bMknfKXIFA8",
          views: 11200,
          isFeatured: true,
        },
      ])
      .onConflictDoNothing({ target: courses.slug });

    // Check music categories
    const existingMusicCats = await db.select().from(musicCategories).limit(1);
    if (existingMusicCats.length === 0) {
      await db.insert(musicCategories).values([
        { name: "Bus Songs", slug: "bus-songs" },
        { name: "Truck Songs", slug: "truck-songs" },
        { name: "Salon Songs", slug: "salon-songs" },
        { name: "DJ Remix", slug: "dj-remix" },
        { name: "Bhakti", slug: "bhakti" },
        { name: "LoFi", slug: "lofi" },
        { name: "Sad Songs", slug: "sad-songs" },
        { name: "Romantic", slug: "romantic" },
        { name: "Trending", slug: "trending" },
        { name: "Latest", slug: "latest" },
      ]);
    }

    // Check music tracks
    // Music seed rows use `onConflictDoNothing` (keyed on the unique
    // `seedSlug`) instead of a "select then insert if empty" check — the
    // latter is racy and previously caused every track to be duplicated.
    // Audio URLs point at verified-working, always-available CC0 sample
    // files (the original Pixabay CDN links had started returning 403
    // Forbidden, silently turning every "Play" button into a dead button).
    await db
      .insert(music)
      .values([
        {
          seedSlug: "cyberpunk-chill-lofi-beats",
          title: "Cyberpunk Chill LoFi Beats",
          artist: "Harsh Dev Beats",
          album: "Midnight Code Vol. 1",
          category: "LoFi",
          coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60",
          audioUrl: "https://cdn.truefilesize.com/mp3/sample-1mb.mp3",
          duration: "2:40",
          plays: 4520,
          isTrending: true,
        },
        {
          seedSlug: "highway-night-bass-drive",
          title: "Highway Night Bass Drive",
          artist: "Truck & Bus Highway DJ",
          album: "Golden Express Mix",
          category: "Truck Songs",
          coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60",
          audioUrl: "https://cdn.truefilesize.com/mp3/sample-320kbps.mp3",
          duration: "3:15",
          plays: 8930,
          isTrending: true,
        },
        {
          seedSlug: "salon-special-chill-vibes",
          title: "Salon Special Chill Vibes",
          artist: "Harsh Dev Acoustic",
          album: "Velvet Lounge",
          category: "Salon Songs",
          coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60",
          audioUrl: "https://cdn.truefilesize.com/mp3/sample-500kb.mp3",
          duration: "2:10",
          plays: 3200,
          isTrending: false,
        },
        {
          seedSlug: "cyber-electro-club-remix",
          title: "Cyber Electro Club Remix",
          artist: "DJ Harsh Mixmaster",
          album: "Neon Nights 2026",
          category: "DJ Remix",
          coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60",
          audioUrl: "https://cdn.truefilesize.com/mp3/sample-3mb.mp3",
          duration: "4:05",
          plays: 12400,
          isTrending: true,
        },
        {
          seedSlug: "shiv-tandav-stotram-cyber",
          title: "Shiv Tandav Stotram (Cyber Edition)",
          artist: "Divine Beats Studio",
          album: "Spiritual Energy",
          category: "Bhakti",
          coverUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=60",
          audioUrl: "https://cdn.truefilesize.com/mp3/sample-64kbps.mp3",
          duration: "3:50",
          plays: 15600,
          isTrending: true,
        },
        {
          seedSlug: "rainy-midnight-memories",
          title: "Rainy Midnight Memories",
          artist: "Harsh Dev Strings",
          album: "Heart & Code",
          category: "Sad Songs",
          coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60",
          audioUrl: "https://cdn.truefilesize.com/mp3/sample-mono.mp3",
          duration: "3:02",
          plays: 5410,
          isTrending: false,
        },
        {
          seedSlug: "golden-hour-romance-glow",
          title: "Golden Hour Romance Glow",
          artist: "Harsh Dev & Team",
          album: "Summer Waves",
          category: "Romantic",
          coverUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&auto=format&fit=crop&q=60",
          audioUrl: "https://cdn.truefilesize.com/mp3/sample-stereo.mp3",
          duration: "3:30",
          plays: 9810,
          isTrending: true,
        },
        {
          seedSlug: "desi-highway-bus-express",
          title: "Desi Highway Bus Express Beat",
          artist: "Harsh Dev Beats",
          album: "Desi Highway Top Hits",
          category: "Bus Songs",
          coverUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=60",
          audioUrl: "https://cdn.truefilesize.com/mp3/sample-22050hz.mp3",
          duration: "3:12",
          plays: 7230,
          isTrending: true,
        },
      ])
      .onConflictDoNothing({ target: music.seedSlug });

    // Apps seed rows use `onConflictDoNothing` (keyed on the unique
    // `seedSlug`) — see the music seeding note above for why. `apkUrl`
    // points at F-Droid's real, always-available installer APK so the
    // "Download APK" button is a genuine, working download rather than a
    // dead local path like the old `/downloads/*.apk` placeholders (which
    // were never actually present in `public/`, making every download
    // button 404).
    await db
      .insert(apps)
      .values([
        {
          seedSlug: "harshdev-code-studio",
          name: "HarshDev Pro Code Studio",
          version: "v2.4.0",
          category: "Developer Tools",
          icon: "⚡",
          description:
            "Mobile IDE with live Next.js preview, HTML/CSS live server, syntax highlighting, and cloud code syncing.",
          size: "24.5 MB",
          downloads: 14200,
          apkUrl: "https://f-droid.org/F-Droid.apk",
          telegramUrl: "https://t.me/harshdev_channel",
          websiteUrl: "https://harshdev.io",
          playstoreUrl: "https://play.google.com/store/apps",
          rating: 4.9,
        },
        {
          seedSlug: "liquid-glass-launcher",
          name: "Liquid Glass Theme Launcher",
          version: "v1.8.2",
          category: "Customization",
          icon: "🔮",
          description:
            "Ultra premium liquid glassmorphism launcher with neon aurora particle animations, customizable widgets, and speed boost.",
          size: "18.2 MB",
          downloads: 9850,
          apkUrl: "https://f-droid.org/F-Droid.apk",
          telegramUrl: "https://t.me/harshdev_channel",
          websiteUrl: "https://harshdev.io",
          playstoreUrl: "https://play.google.com/store/apps",
          rating: 4.8,
        },
        {
          seedSlug: "cyber-music-player",
          name: "Cyber Music Equalizer & Player",
          version: "v3.1.0",
          category: "Music & Audio",
          icon: "🎵",
          description:
            "3D Surround Bass Booster, 10-Band Equalizer, LoFi mode, Bus & Truck DJ Remix presets, and offline Cloudinary stream player.",
          size: "32.0 MB",
          downloads: 21400,
          apkUrl: "https://f-droid.org/F-Droid.apk",
          telegramUrl: "https://t.me/harshdev_channel",
          websiteUrl: "https://harshdev.io",
          playstoreUrl: "https://play.google.com/store/apps",
          rating: 4.95,
        },
        {
          seedSlug: "devpocket-ai",
          name: "DevPocket AI Assistant",
          version: "v1.0.5",
          category: "AI Tools",
          icon: "🤖",
          description:
            "Pocket AI developer assistant for instantaneous code generation, bug fixing, SQL schema generation, and YouTube summary.",
          size: "14.8 MB",
          downloads: 8700,
          apkUrl: "https://f-droid.org/F-Droid.apk",
          telegramUrl: "https://t.me/harshdev_channel",
          websiteUrl: "https://harshdev.io",
          playstoreUrl: "https://play.google.com/store/apps",
          rating: 4.85,
        },
        {
          seedSlug: "apk-fast-downloader",
          name: "APK Fast Downloader & Extractor",
          version: "v4.0.1",
          category: "Utility",
          icon: "📦",
          description:
            "Fastest APK & XAPK installer and backup manager with multi-thread acceleration and checksum integrity validation.",
          size: "11.2 MB",
          downloads: 31200,
          apkUrl: "https://f-droid.org/F-Droid.apk",
          telegramUrl: "https://t.me/harshdev_channel",
          websiteUrl: "https://harshdev.io",
          playstoreUrl: "https://play.google.com/store/apps",
          rating: 4.7,
        },
      ])
      .onConflictDoNothing({ target: apps.seedSlug });

    // Check donations
    const existingDonations = await db.select().from(donations).limit(1);
    if (existingDonations.length === 0) {
      await db.insert(donations).values([
        {
          donorName: "Aarav Sharma",
          donorEmail: "aarav@gmail.com",
          amount: 500,
          currency: "INR",
          message: "Loved your Next.js masterclass! Keep creating awesome content brother 🔥",
          razorpayPaymentId: "pay_N8a9x7Y1zK0",
          paymentMethod: "UPI / Google Pay",
        },
        {
          donorName: "Priya Patel",
          donorEmail: "priya.p@yahoo.com",
          amount: 1000,
          currency: "INR",
          message: "Super helpful APK tools and LoFi tracks while coding. Small token of appreciation!",
          razorpayPaymentId: "pay_M2k4P9L8b2C",
          paymentMethod: "Razorpay Card",
        },
        {
          donorName: "Rohan Verma",
          donorEmail: "rohanv@dev.io",
          amount: 250,
          currency: "INR",
          message: "Coffee on me for the awesome Supabase tutorials ☕️",
          razorpayPaymentId: "pay_K99fL10xN33",
          paymentMethod: "Paytm UPI",
        },
      ]);
    }

    // Settings singleton — see note above about onConflictDoNothing.
    await db
      .insert(settings)
      .values({
        singletonKey: "default",
        activeTheme: "Cyber Green",
        activeFont: "Outfit",
        githubUrl: "https://github.com",
        linkedinUrl: "https://linkedin.com",
        telegramUrl: "https://t.me/harshdev_official",
        instagramUrl: "https://instagram.com/harshdev_official",
        whatsappUrl: "https://wa.me/919999999999",
        emailUrl: "contact@harshdev.io",
      })
      .onConflictDoNothing({ target: settings.singletonKey });

    // Analytics singleton — see note above about onConflictDoNothing.
    await db
      .insert(analytics)
      .values({
        singletonKey: "default",
        pageviews: 18450,
        downloads: 5230,
        musicPlays: 24100,
        totalDonations: 34500,
      })
      .onConflictDoNothing({ target: analytics.singletonKey });

    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
