import { NextResponse } from "next/server";
import { getSingletonSettings, updateSingletonSettings } from "@/lib/singleton";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/apiError";

// This route must always reflect the very latest admin edits (theme, custom
// background, nav labels, etc.), so it opts out of any HTTP/CDN caching.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getSingletonSettings();
    return NextResponse.json(
      data || {
        activeTheme: "Cyber Green",
        activeFont: "Outfit",
        githubUrl: "https://github.com",
        linkedinUrl: "https://linkedin.com",
        telegramUrl: "https://t.me",
        instagramUrl: "https://instagram.com",
        whatsappUrl: "https://wa.me/919999999999",
        // Always include the "mailto:" scheme — a bare email address here
        // previously rendered as a broken relative link on the Contact page.
        emailUrl: "mailto:contact@harshdev.io",
        facebookUrl: "https://facebook.com",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241316.86016195315!2d72.7410992!3d19.0821978!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000",
        contactPhone: "+91 99999 99999",
        contactLocation: "Mumbai / Remote, India",
        footerText:
          "Premium Full Stack Developer Portfolio, Free Masterclasses, Android APK Utilities & Cyber Audio Soundtracks.",
        navbarLogoText: "HarshDev",
        buttonStyle: "rounded-full",
        radiusScale: "1.5rem",
        shadowIntensity: "0.4",
        animationSpeed: "1",
        pwaEnabled: true,
        navLabels: {
          home: "Home",
          about: "About",
          courses: "Courses",
          apps: "Apps",
          music: "Music",
          contact: "Contact",
        },
        customBackgroundUrl: null,
        customBackgroundOpacity: "0.35",
        defaultFontColor: null,
        whatsappNumber: "919999999999",
        upiId: "63925516@ybl",
        donationMobileNumber: "+91 6392551618",
      }
    );
  } catch (error: any) {
    return apiError(error, "GET /api/settings");
  }
}

export async function PUT(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    // Never let a client-supplied `id` or `singletonKey` redirect the update
    // to a different row than the one true settings row.
    delete body.id;
    delete body.singletonKey;

    const updated = await updateSingletonSettings({ ...body, updatedAt: new Date() });
    return NextResponse.json(updated);
  } catch (error: any) {
    return apiError(error, "PUT /api/settings");
  }
}
