"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useApp } from "@/context/AppContext";
import { buildUpiPayLink, buildQrCodeUrl } from "@/lib/contactLinks";
import {
  X,
  Heart,
  QrCode,
  CreditCard,
  Sparkles,
  CheckCircle2,
  Users,
  Copy,
  Check,
  Phone,
  Smartphone
} from "lucide-react";

// Razorpay's checkout.js attaches a global `Razorpay` constructor to
// `window`. It's loaded lazily (only when the user actually picks the
// Razorpay payment method) instead of on every page load.
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, any>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function DonationModal() {
  const { isDonationOpen, setIsDonationOpen, themeConfig, settings } = useApp();
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [donorName, setDonorName] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "Razorpay">("UPI");
  const [donationsList, setDonationsList] = useState<any[]>([]);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [successPopup, setSuccessPopup] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Real UPI ID + mobile number come from Admin Panel > Website Builder >
  // Donation Settings — a single source of truth so the QR code always
  // encodes the creator's ACTUAL UPI ID instead of a hardcoded placeholder.
  const upiId = settings?.upiId || "harshdev@upi";
  const donationMobile = settings?.donationMobileNumber || "+91 99999 99999";

  const presetAmounts = [50, 100, 250, 500, 1000];

  const fetchDonations = async () => {
    try {
      const res = await fetch("/api/donations");
      if (res.ok) {
        const data = await res.json();
        setDonationsList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isDonationOpen) {
      fetchDonations();
    }
  }, [isDonationOpen]);

  const activeAmount = customAmount ? parseInt(customAmount) || 50 : selectedAmount;

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // UPI path: this remains a self-reported entry, same as before — we have
  // no programmatic way to confirm a UPI QR/deep-link payment actually
  // landed. It's saved with status "unverified" on the server and shown as
  // such on the Wall of Supporters, rather than presented with the same
  // confidence as a verified payment.
  const handleUpiDonate = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: donorName || "Anonymous Supporter",
          donorEmail: donorEmail || null,
          amount: activeAmount,
          message: message || "Keep up the awesome work Harsh Dev!",
        }),
      });

      if (res.ok) {
        triggerConfetti();
        setSuccessPopup(true);
        fetchDonations();
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Something went wrong. Please try again.");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Razorpay path: real order creation -> checkout.js -> server-side
  // signature verification. Nothing is marked "confirmed" client-side —
  // /api/donations/verify recomputes the HMAC signature with the secret
  // key, which the client never has access to.
  const handleRazorpayDonate = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const orderRes = await fetch("/api/donations/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: donorName || "Anonymous Supporter",
          donorEmail: donorEmail || null,
          amount: activeAmount,
          message: message || "Keep up the awesome work Harsh Dev!",
        }),
      });

      const orderData = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok) {
        setErrorMsg(orderData.error || "Could not start payment. Please try UPI instead.");
        setLoading(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        setErrorMsg("Could not load the payment checkout. Please check your connection and try again.");
        setLoading(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: "Harsh Dev",
        description: "Support Harsh Dev Platform",
        order_id: orderData.orderId,
        prefill: {
          name: donorName || undefined,
          email: donorEmail || undefined,
        },
        theme: { color: themeConfig.primary },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/donations/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            if (verifyRes.ok) {
              triggerConfetti();
              setSuccessPopup(true);
              fetchDonations();
            } else {
              setErrorMsg("Payment succeeded but verification failed. Please contact support with your payment ID.");
            }
          } catch (e) {
            console.error(e);
            setErrorMsg("Payment succeeded but verification failed. Please contact support with your payment ID.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      });

      razorpay.open();
    } catch (e) {
      console.error(e);
      setErrorMsg("Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleDonate = async () => {
    if (activeAmount < 10) {
      alert("Please enter a valid amount (minimum ₹10).");
      return;
    }

    if (paymentMethod === "UPI") {
      await handleUpiDonate();
    } else {
      await handleRazorpayDonate();
    }
  };

  if (!isDonationOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl overflow-hidden border border-emerald-500/40 shadow-[0_0_50px_rgba(0,255,136,0.3)] bg-[#071318] my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-emerald-500/20 bg-emerald-950/40">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400 fill-pink-400 animate-bounce" />
            <h3 className="text-lg font-bold text-white">Support Harsh Dev</h3>
          </div>

          <button
            onClick={() => {
              setIsDonationOpen(false);
              setSuccessPopup(false);
            }}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {successPopup ? (
          <div className="p-8 text-center space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(0,255,136,0.5)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-white">
                Thank You, {donorName || "Awesome Supporter"}! ❤️
              </h3>
              <p className="text-gray-300 text-sm max-w-md mx-auto">
                Your contribution of <span className="font-bold text-emerald-400">₹{activeAmount}</span> directly supports free high-quality coding courses, open-source tools, and music tracks for developers!
              </p>
            </div>

            <button
              onClick={() => {
                setSuccessPopup(false);
                setIsDonationOpen(false);
              }}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-black shadow-lg"
              style={{ backgroundColor: themeConfig.primary }}
            >
              Done & Close
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Tagline */}
            <div className="text-center space-y-1">
              <p className="text-xs text-emerald-400 font-mono">
                ALL COURSES & TOOLS REMAIN 100% FREE ALWAYS
              </p>
              <p className="text-xs text-gray-300">
                If you find value in my work, buy me a coffee or support server hosting!
              </p>
            </div>

            {/* Amount Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Select Amount (INR)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount("");
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedAmount === amt && !customAmount
                        ? "text-black shadow-[0_0_15px_rgba(0,255,136,0.4)] font-extrabold"
                        : "text-gray-300 bg-emerald-950/30 border-emerald-500/20 hover:border-emerald-400/40"
                    }`}
                    style={
                      selectedAmount === amt && !customAmount
                        ? { backgroundColor: themeConfig.primary, borderColor: themeConfig.primary }
                        : {}
                    }
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <input
                type="number"
                placeholder="Or enter custom amount in ₹"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full mt-2 px-4 py-2 rounded-xl glass-card text-xs text-white border border-emerald-500/30 focus:border-emerald-400 focus:outline-none placeholder-gray-500"
              />

              {/* Direct deep link — on a phone this opens the installed UPI
                  app (GPay/PhonePe/Paytm/etc.) with the payee, amount and
                  note already filled in, no QR scan needed. */}
              <a
                href={buildUpiPayLink({ upiId, amount: activeAmount, note: "Support HarshDev" })}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border border-emerald-500/30 text-emerald-300 bg-emerald-950/30 hover:border-emerald-400/60 hover:bg-emerald-900/40 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>Pay via UPI App</span>
              </a>
            </div>

            {/* Payment Method Toggle: UPI vs Razorpay */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod("UPI")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all ${
                  paymentMethod === "UPI"
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                    : "bg-slate-900/50 border-slate-700 text-gray-400"
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>UPI QR / ID</span>
              </button>

              <button
                onClick={() => setPaymentMethod("Razorpay")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all ${
                  paymentMethod === "Razorpay"
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                    : "bg-slate-900/50 border-slate-700 text-gray-400"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Razorpay / Cards</span>
              </button>
            </div>

            {/* UPI QR Display — encodes the admin's REAL UPI ID + live amount,
                so scanning it in any UPI app pays the creator directly. */}
            {paymentMethod === "UPI" && (
              <div className="p-4 rounded-2xl glass-card border border-emerald-500/30 flex flex-col sm:flex-row items-center gap-4 bg-emerald-950/20">
                <div className="p-2 rounded-xl shadow-lg flex-shrink-0" style={{ backgroundColor: "#ffffff" }}>
                  <img
                    src={buildQrCodeUrl(
                      buildUpiPayLink({ upiId, amount: activeAmount, note: "Support HarshDev" }),
                      140
                    )}
                    alt="UPI QR Code"
                    className="w-28 h-28"
                  />
                </div>
                <div className="space-y-2 text-center sm:text-left flex-grow">
                  <p className="text-xs font-bold text-white">
                    Scan with Google Pay, PhonePe, Paytm or Cred
                  </p>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-mono text-emerald-300">
                    <span>{upiId}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(upiId);
                        setCopiedUpi(true);
                        setTimeout(() => setCopiedUpi(false), 2000);
                      }}
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>Or pay directly to: {donationMobile}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Donor Information Form */}
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Your Name (Optional)"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-card text-xs text-white border border-emerald-500/30 focus:border-emerald-400 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Your Email (Optional)"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-card text-xs text-white border border-emerald-500/30 focus:border-emerald-400 focus:outline-none"
              />
              <textarea
                placeholder="Leave an encouraging message for Harsh Dev..."
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-card text-xs text-white border border-emerald-500/30 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-400 bg-red-950/30 border border-red-500/30 rounded-xl px-3 py-2 text-center">
                {errorMsg}
              </p>
            )}

            {/* Donate Trigger Button */}
            <button
              onClick={handleDonate}
              disabled={loading}
              className="w-full py-3 rounded-full text-xs font-extrabold text-black transition-all hover:scale-102 shadow-[0_0_20px_rgba(0,255,136,0.4)] flex items-center justify-center gap-2"
              style={{ backgroundColor: themeConfig.primary }}
            >
              <Heart className="w-4 h-4 fill-black" />
              <span>
                {loading ? "Processing..." : `Complete Donation of ₹${activeAmount}`}
              </span>
            </button>

            {/* Wall of Supporters */}
            <div className="pt-4 border-t border-emerald-500/20 space-y-3">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" /> Wall of Recent Supporters
              </h4>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {donationsList.slice(0, 5).map((d) => (
                  <div
                    key={d.id}
                    className="p-2.5 rounded-xl glass-card border border-emerald-500/15 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{d.donorName}</span>
                        {d.status === "confirmed" ? (
                          <span
                            title="Payment cryptographically verified via Razorpay"
                            className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-1.5 py-0.5"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                          </span>
                        ) : (
                          <span
                            title="Self-reported UPI payment — not independently verified"
                            className="text-[9px] font-medium text-gray-500 bg-gray-500/10 border border-gray-500/20 rounded-full px-1.5 py-0.5"
                          >
                            Unverified
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 italic">"{d.message}"</p>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">
                      ₹{d.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
