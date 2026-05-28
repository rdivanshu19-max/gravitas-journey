import { Link } from "react-router-dom";
import { useEffect, useRef, useState, FormEvent } from "react";
import { ArrowRight, Globe, Instagram, Twitter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4";

const FADE_MS = 500;
const FADE_OUT_TRIGGER = 0.55; // seconds before end

export default function Index() {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const fadingOutRef = useRef(false);
  const [email, setEmail] = useState("");

  const cancelRaf = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const animateOpacity = (target: number, onDone?: () => void) => {
    const el = videoRef.current;
    if (!el) return;
    cancelRaf();
    const start = performance.now();
    const from = parseFloat(el.style.opacity || "0") || 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / FADE_MS);
      const v = from + (target - from) * t;
      el.style.opacity = String(v);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        onDone?.();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.style.opacity = "0";

    const handleLoaded = () => {
      fadingOutRef.current = false;
      animateOpacity(1);
    };
    const handleTimeUpdate = () => {
      if (fadingOutRef.current) return;
      const remaining = el.duration - el.currentTime;
      if (isFinite(remaining) && remaining <= FADE_OUT_TRIGGER) {
        fadingOutRef.current = true;
        animateOpacity(0);
      }
    };
    const handleEnded = () => {
      el.style.opacity = "0";
      window.setTimeout(() => {
        el.currentTime = 0;
        fadingOutRef.current = false;
        el.play().catch(() => {});
        animateOpacity(1);
      }, 100);
    };

    el.addEventListener("loadeddata", handleLoaded);
    el.addEventListener("timeupdate", handleTimeUpdate);
    el.addEventListener("ended", handleEnded);
    el.play().catch(() => {});

    return () => {
      cancelRaf();
      el.removeEventListener("loadeddata", handleLoaded);
      el.removeEventListener("timeupdate", handleTimeUpdate);
      el.removeEventListener("ended", handleEnded);
    };
  }, []);

  const onSubscribe = (e: FormEvent) => {
    e.preventDefault();
    // intentionally minimal — routes to auth with prefilled intent
    window.location.href = `/auth?email=${encodeURIComponent(email)}`;
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col">
      {/* Background video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover translate-y-[17%] pointer-events-none"
        src={VIDEO_URL}
        muted
        playsInline
        autoPlay
        preload="auto"
        style={{ opacity: 0 }}
      />
      {/* subtle vignette for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/80 pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-20 pl-6 pr-6 py-6">
        <div className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-white font-semibold text-lg">
              <Globe size={24} />
              <span>GRAVITAS</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Features</a>
              <a href="#ecosystem" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Ecosystem</a>
              <a href="#about" className="text-white/80 hover:text-white transition-colors text-sm font-medium">About</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="text-white text-sm font-medium">Dashboard</Link>
            ) : (
              <Link to="/auth" className="text-white text-sm font-medium">Sign Up</Link>
            )}
            <Link to="/auth" className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[10%]">
        <h1
          className="text-5xl md:text-6xl lg:text-7xl text-white mb-8 tracking-tight whitespace-nowrap"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Built for the curious
        </h1>

        <div className="max-w-xl w-full space-y-4">
          <form onSubmit={onSubscribe} className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-transparent outline-none border-none text-white placeholder:text-white/40 text-base"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="bg-white rounded-full p-3 text-black hover:scale-105 transition-transform"
            >
              <ArrowRight size={20} />
            </button>
          </form>

          <p className="text-white text-sm leading-relaxed px-4">
            The space between where you are and where you need to be. Map your mind, defeat your mistakes, and rise toward JEE & NEET — guided by AI built for the curious.
          </p>

          <div className="flex justify-center pt-2">
            <Link
              to="/auth"
              className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors inline-block"
            >
              Read the Manifesto
            </Link>
          </div>
        </div>
      </main>

      {/* Social footer */}
      <footer className="relative z-10 flex justify-center gap-4 pb-12">
        <a href="#" aria-label="Instagram" className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all">
          <Instagram size={20} />
        </a>
        <a href="#" aria-label="Twitter" className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all">
          <Twitter size={20} />
        </a>
        <a href="https://divyanshuportfolio-beta.vercel.app/" target="_blank" rel="noreferrer" aria-label="Website" className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all">
          <Globe size={20} />
        </a>
      </footer>
    </div>
  );
}
