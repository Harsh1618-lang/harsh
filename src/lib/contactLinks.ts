// Shared helpers so WhatsApp / UPI links are built from ONE source of truth
// (the admin-entered phone number / UPI ID in Settings) instead of drifting
// out of sync between the display text and the actual clickable link — which
// was the root cause of the WhatsApp button appearing to "not redirect"
// (the link kept pointing at a stale/placeholder number while the displayed
// text showed the admin's newly-updated number).

/** Strips everything except digits from a phone number string. */
export function digitsOnly(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

/**
 * Builds a valid `https://wa.me/<digits>` deep link from any admin-entered
 * phone number format (e.g. "+91 98765 43210", "919876543210", "9876543210").
 * If the number looks like a 10-digit Indian mobile without a country code,
 * "91" is prefixed automatically.
 */
export function buildWhatsAppLink(rawNumber: string | null | undefined): string {
  let digits = digitsOnly(rawNumber);
  if (digits.length === 10) digits = `91${digits}`;
  if (!digits) digits = "919999999999";
  return `https://wa.me/${digits}`;
}

/** Builds a `upi://pay` deep link used both for the QR code image and as a mobile "Pay" link. */
export function buildUpiPayLink(params: {
  upiId: string;
  payeeName?: string;
  amount?: number;
  note?: string;
}): string {
  const { upiId, payeeName = "Harsh Dev", amount, note = "Support HarshDev" } = params;
  const query = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    cu: "INR",
  });
  if (amount && amount > 0) query.set("am", String(amount));
  if (note) query.set("tn", note);
  return `upi://pay?${query.toString()}`;
}

/** Builds a scannable QR code image URL (via the free qrserver.com API) for any payload. */
export function buildQrCodeUrl(data: string, size = 220): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}

/** Ensures an email always renders as a clickable `mailto:` link, never a broken relative URL. */
export function buildMailtoLink(rawEmail: string | null | undefined, fallback = "contact@harshdev.io"): string {
  const email = (rawEmail || "").trim();
  if (!email) return `mailto:${fallback}`;
  return email.startsWith("mailto:") ? email : `mailto:${email.replace(/^mailto:/, "")}`;
}
