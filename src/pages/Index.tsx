import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import {
  Dna, Skull, Activity, Brain, Heart, MessageSquareWarning, Flame,
  TrendingUp, HeartPulse, Map, Lock, EyeOff, Trophy, Mic, Clock, Ghost, ArrowRight,
} from "lucide-react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4";

const FADE_MS = 500;
const FADE_OUT_TRIGGER = 0.55;

const features = [
  { icon: Dna, title: "Concept DNA", desc: "Every JEE/NEET concept mapped as a DNA strand. See which weak topics drag down 7 others." },
  { icon: Clock, title: "Last 24 Hours Mode", desc: "Emergency war-room revision plan based on your entire test history." },
  { icon: Activity, title: "Silence Score", desc: "Detects every distraction. Daily focus score. Peer pressure that works." },
  { icon: Skull, title: "Wrong Answer Graveyard", desc: "Wrong questions get buried. They return as ghosts in 7 days. Defeat them." },
  { icon: Brain, title: "Brain Fingerprint", desc: "A 10-min test that reveals HOW you think — visual, pattern, formula or logic." },
  { icon: Mic, title: "Time Capsule", desc: "Record a message to your future self on Day 1. Auto-delivered on exam day." },
  { icon: Flame, title: "Study Roast", desc: "AI roasts your schedule like a brutally funny strict teacher. Insanely shareable." },
  { icon: TrendingUp, title: "Rank Predictor 2.0", desc: "Predicts rank range with confidence + 3 fixes that unlock the next tier." },
  { icon: Heart, title: "Anxiety Coach", desc: "AI therapist for exam stress. Detects panic. Real motivation from your data." },
  { icon: Ghost, title: "Mistake DNA Profiling", desc: "A cognitive error fingerprint — conceptual, calculation, or misreading." },
  { icon: HeartPulse, title: "Heartbeat Countdown", desc: "Days to exam shown as a living pulse. Faster as it nears." },
  { icon: Map, title: "Syllabus as RPG Map", desc: "The whole syllabus as a world. Mastered chapters glow. Weak ones burn." },
  { icon: MessageSquareWarning, title: "Confession Box", desc: "Anonymous space for your darkest prep truths. Solidarity wall." },
  { icon: EyeOff, title: "Silent Competition", desc: "No names. Just 'You're ahead of 68% today.' Drive without toxicity." },
  { icon: Lock, title: "The Obituary", desc: "Quit? Get a one-page obituary of your prep journey. Most never close that tab." },
  { icon: Trophy, title: "Always Improving", desc: "Every interaction trains your personal model. Gravitas only gets sharper." },
];

export default function Index() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const fadingOutRef = useRef(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.style.opacity = "0";

    const cancelRaf = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    const animateOpacity = (target: number) => {
      cancelRaf();
      const start = performance.now();
      const from = parseFloat(el.style.opacity || "0") || 0;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / FADE_MS);
        el.style.opacity = String(from + (target - from) * t);
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
        else rafRef.current = null;
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    const onLoaded = () => { fadingOutRef.current = false; animateOpacity(1); };
    const onTime = () => {
      if (fadingOutRef.current) return;
      const remaining = el.duration - el.currentTime;
      if (isFinite(remaining) && remaining <= FADE_OUT_TRIGGER) {
        fadingOutRef.current = true;
        animateOpacity(0);
      }
    };
    const onEnded = () => {
      el.style.opacity = "0";
      window.setTimeout(() => {
        el.currentTime = 0;
        fadingOutRef.current = false;
        el.play().catch(() => {});
        animateOpacity(1);
      }, 100);
    };

    el.addEventListener("loadeddata", onLoaded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnded);
    el.play().catch(() => {});

    return () => {
      cancelRaf();
      el.removeEventListener("loadeddata", onLoaded);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-x-hidden text-white">
      {/* HERO with video */}
      <section className="relative min-h-screen overflow-hidden flex flex-col">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black pointer-events-none" />

        <div className="relative z-20">
          <AppHeader />
        </div>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[6%]">
          <p className="font-mono text-[10px] tracking-[0.4em] text-white/60 mb-6">FOCUS · ANALYZE · IMPROVE · RISE</p>
          <h1
            className="text-6xl md:text-7xl lg:text-8xl text-white mb-6 tracking-tight leading-[0.95]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Built for the <em className="italic text-white/90">curious</em>
          </h1>
          <p className="max-w-2xl text-white/75 text-base md:text-lg mb-10 leading-relaxed">
            GRAVITAS — the space between where you are and where you need to be.
            A next-generation OS for JEE & NEET aspirants. We map how you think,
            where you fail, how you focus and how you improve.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/auth" className="liquid-glass rounded-full px-7 py-3 text-white text-sm font-medium inline-flex items-center gap-2">
              Begin Your Ascent <ArrowRight size={16} />
            </Link>
            <a href="#features" className="liquid-glass rounded-full px-7 py-3 text-white/85 text-sm font-medium">
              Explore the System
            </a>
          </div>
        </main>

        <div className="relative z-10 pb-10 text-center text-xs text-white/50 tracking-widest">
          SCROLL TO DISCOVER ↓
        </div>
      </section>

      {/* MISSION */}
      <section id="about" className="relative py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-[10px] tracking-[0.4em] text-white/50 mb-4">// OUR GOAL</p>
          <h2 className="text-4xl md:text-6xl mb-6" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Preparation, <em className="italic">re-engineered.</em>
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Traditional platforms give you content, tests and scores. Gravitas combines AI,
            behavioral analytics and immersive design to understand your{" "}
            <span className="text-white">complete cognitive profile</span> — turning passive
            studying into an intelligent, adaptive experience built for the cruellest exams in the world.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-mono text-[10px] tracking-[0.4em] text-white/50 mb-4">// THE ARSENAL</p>
            <h2 className="text-4xl md:text-6xl" style={{ fontFamily: "'Instrument Serif', serif" }}>
              16 weapons. <em className="italic">One mission.</em>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
                className="liquid-glass rounded-3xl p-6 hover:-translate-y-1 transition-transform"
              >
                <f.icon className="h-8 w-8 text-white/90 mb-4" />
                <h3 className="text-2xl mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>{f.title}</h3>
                <p className="text-sm text-white/65 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section id="ecosystem" className="relative py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-[10px] tracking-[0.4em] text-white/50 mb-4">// THE ECOSYSTEM</p>
            <h2 className="text-4xl md:text-6xl" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Built <em className="italic">alongside</em>
            </h2>
            <p className="text-white/65 mt-4 max-w-xl mx-auto">
              Gravitas is part of a wider system for serious aspirants.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="liquid-glass rounded-3xl p-8">
              <h3 className="text-3xl mb-3" style={{ fontFamily: "'Instrument Serif', serif" }}>Rankers Star</h3>
              <p className="text-sm text-white/70 mb-5 leading-relaxed">
                All-in-one JEE prep. Free lectures from every coaching, 700+ JEE materials,
                AI tests, CBT mode, AI mentor and AI doubt — one structured ecosystem instead of 20 tabs.
              </p>
              <a href="https://rankers-stars.vercel.app/" target="_blank" rel="noreferrer"
                 className="liquid-glass rounded-full px-5 py-2 text-sm inline-block">Open Rankers Star ↗</a>
            </div>
            <div className="liquid-glass rounded-3xl p-8">
              <h3 className="text-3xl mb-3" style={{ fontFamily: "'Instrument Serif', serif" }}>Nexus CBT</h3>
              <p className="text-sm text-white/70 mb-5 leading-relaxed">
                The CBT engine inside Rankers Star. Real exam-like interface, timed tests, analytics,
                PDF→test converter, flashcards, AI doubt support and a special revision section.
              </p>
              <a href="https://nexuscbt.vercel.app/" target="_blank" rel="noreferrer"
                 className="liquid-glass rounded-full px-5 py-2 text-sm inline-block">Open Nexus CBT ↗</a>
            </div>
          </div>
        </div>
      </section>

      {/* DEVELOPER */}
      <section className="relative py-28 px-6">
        <div className="max-w-3xl mx-auto liquid-glass rounded-3xl p-10 md:p-14">
          <p className="font-mono text-[10px] tracking-[0.4em] text-white/50 mb-3">// BUILT BY</p>
          <h3 className="text-5xl mb-5" style={{ fontFamily: "'Instrument Serif', serif" }}>
            <em className="italic">Divyanshu</em>
          </h3>
          <p className="text-white/80 mb-4">
            I design and develop high-impact digital products — not just good-looking websites,
            but fast, scalable systems that solve real problems.
          </p>
          <p className="text-white/65 mb-6">
            From coaching platforms and AI tools to modern UI websites and 3D experiences,
            everything I build is focused on performance, usability and results.
          </p>
          <div className="grid sm:grid-cols-2 gap-2 text-sm text-white/65 mb-7">
            <div>• Full-stack web development</div>
            <div>• AI-powered tools & automation</div>
            <div>• 3D animated websites</div>
            <div>• Complete EdTech platforms</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="https://divyanshuportfolio-beta.vercel.app/" target="_blank" rel="noreferrer"
               className="liquid-glass rounded-full px-6 py-3 text-sm">View Portfolio ↗</a>
            <a href="mailto:studyspacerankers@gmail.com"
               className="liquid-glass rounded-full px-6 py-3 text-sm">Work with me</a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6 text-center">
        <h2 className="text-4xl md:text-6xl mb-6" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Ready to <em className="italic">rise?</em>
        </h2>
        <p className="text-white/65 mb-8 max-w-xl mx-auto">
          Your orbit is waiting. Sign in, complete the onboarding ritual, and watch your prep transform.
        </p>
        <Link to="/auth" className="liquid-glass rounded-full px-8 py-4 inline-flex items-center gap-2 text-white">
          Launch GRAVITAS <ArrowRight size={18} />
        </Link>
      </section>

      <footer className="relative py-10 px-6 text-center text-xs text-white/40 border-t border-white/10">
        © {new Date().getFullYear()} GRAVITAS · Crafted by Divyanshu · For the dreamers chasing 99 percentile.
      </footer>
    </div>
  );
}
