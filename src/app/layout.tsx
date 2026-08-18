import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { CursorGlow } from "@/components/CursorGlow";
import { PageLoader } from "@/components/PageLoader";
import { PwaRegister } from "@/components/PwaRegister";

export const metadata: Metadata = {
  metadataBase: new URL("https://harshdev.io"),
  title: "Harsh Dev | Full Stack Developer & Creator Platform",
  description:
    "Premium Full Stack Portfolio, Free Courses, APK Apps, Music Platform & Admin Control Center by Harsh Dev.",
  applicationName: "HarshDev Platform",
  keywords: [
    "Harsh Dev",
    "Full Stack Developer",
    "React Developer",
    "Next.js Portfolio",
    "Free Programming Courses",
    "APK Downloads",
    "Music Streaming Platform",
  ],
  authors: [{ name: "Harsh Dev" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    title: "Harsh Dev | Full Stack Developer & Creator Platform",
    description:
      "Premium Full Stack Portfolio, Free Courses, APK Apps & Music Platform by Harsh Dev.",
    url: "https://harshdev.io",
    siteName: "HarshDev Platform",
    type: "website",
    images: ["/images/harsh-dev-profile.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Harsh Dev | Full Stack Developer",
    description: "Premium Full Stack Portfolio, Free Courses, APK Apps & Music Platform.",
    images: ["/images/harsh-dev-profile.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#060d0f",
  width: "device-width",
  initialScale: 1,
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Harsh Dev",
  jobTitle: "Full Stack Developer",
  url: "https://harshdev.io",
  sameAs: [
    "https://github.com",
    "https://linkedin.com",
    "https://t.me/harshdev_official",
    "https://instagram.com/harshdev_official",
  ],
  description:
    "Full Stack Developer building premium web platforms, free courses, APK apps and music streaming experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Manrope:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Nunito:wght@400;600;700&family=Outfit:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@400;500;700&family=Sora:wght@400;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Urbanist:wght@400;500;600;700&family=Rubik:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Work+Sans:wght@400;500;600;700&family=Lexend:wght@400;500;600;700&family=Archivo:wght@400;500;600;700&family=Josefin+Sans:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&family=Karla:wght@400;500;600;700&family=Barlow:wght@400;500;600;700&family=Syne:wght@500;600;700&family=Chakra+Petch:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {/* Apply saved Light/Dark mode before paint to avoid a theme flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('harshdev_color_mode');if(!m){m=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}if(m==='light'){document.documentElement.classList.add('light-mode');document.documentElement.style.colorScheme='light';}else{document.documentElement.style.colorScheme='dark';}}catch(e){}})();`,
          }}
        />
      </head>
      {/*
        Background color is intentionally applied via inline style (not a
        Tailwind bg-[...] utility class). Tailwind's `utilities` layer is
        declared after `base`, so a class-based background here would always
        beat the CSS-variable-driven `body { background-color: var(--bg-dark) }`
        rule in globals.css regardless of specificity — which silently broke
        both theme-preset switching AND Light/Dark Mode. Inline style always
        wins the cascade, so this keeps the page background correctly in sync
        with the live --bg-dark custom property set from AppContext.
      */}
      <body
        className="antialiased selection:bg-emerald-500/30 selection:text-emerald-300 min-h-screen relative"
        style={{ backgroundColor: "var(--bg-dark)" }}
        suppressHydrationWarning
      >
        <AppProvider>
          <PageLoader />
          <CursorGlow />
          <PwaRegister />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
