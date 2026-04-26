import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import OrbitalLogo from "@/components/OrbitalLogo";
import StarField from "@/components/StarField";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dna, Skull, Activity, Brain, Heart, MessageSquareWarning, Flame,
  TrendingUp, HeartPulse, Map, Lock, EyeOff, Trophy, Mic, Clock, Ghost
} from "lucide-react";

const features = [
  { icon: Dna, title: "Concept DNA", desc: "Every JEE/NEET concept mapped as a DNA strand. See which weak topics drag down 7 others." , color: "text-orbit-blue" },
  { icon: Clock, title: "Last 24 Hours Mode", desc: "Emergency war-room revision plan based on your entire test history. Maximum marks, minimum time.", color: "text-orbit-orange" },
  { icon: Activity, title: "Silence Score", desc: "Detects every distraction. Daily focus score. Leaderboard among friends. Peer pressure that works.", color: "text-orbit-purple" },
  { icon: Skull, title: "Wrong Answer Graveyard", desc: "Wrong questions get buried. They return as ghosts in 7 days. Defeat them. Gamified spaced repetition.", color: "text-destructive" },
  { icon: Brain, title: "Brain Fingerprint", desc: "10-min test that reveals HOW you think — visual, pattern, formula or logic. Get your personal study method.", color: "text-orbit-blue" },
  { icon: Mic, title: "Time Capsule", desc: "Record a message to your future self on Day 1. Auto-delivered on JEE day. Track your whole journey.", color: "text-orbit-orange" },
  { icon: Flame, title: "Study Roast", desc: "AI roasts your schedule like a brutally funny strict teacher. Brutally honest. Insanely shareable.", color: "text-destructive" },
  { icon: TrendingUp, title: "JEE Rank Predictor 2.0", desc: "Inputs your mocks → predicts rank range with confidence + tells you what 3 fixes unlock the next tier.", color: "text-orbit-purple" },
  { icon: Heart, title: "Exam Anxiety Coach", desc: "AI therapist for exam stress. Detects panic. Breathing drills. Real motivation grounded in your data.", color: "text-orbit-blue" },
  { icon: Ghost, title: "Mistake DNA Profiling", desc: "Not 'weak topics' — a cognitive error fingerprint. Conceptual? Calculation? Misreading? We map it.", color: "text-orbit-orange" },
  { icon: HeartPulse, title: "Heartbeat Countdown", desc: "Days to exam shown as a living pulse. Faster as it nears. Visceral urgency, no words needed.", color: "text-destructive" },
  { icon: Map, title: "Syllabus as RPG Map", desc: "The whole syllabus as a world. Mastered chapters glow. Weak ones burn. You're the character.", color: "text-orbit-purple" },
  { icon: MessageSquareWarning, title: "Confession Box", desc: "Anonymous space for your darkest prep truths. Top confessions go on the live wall. Solidarity.", color: "text-orbit-blue" },
  { icon: EyeOff, title: "Silent Competition", desc: "No names. No profiles. Just: 'You're ahead of 68% today.' Drive without toxicity.", color: "text-orbit-orange" },
  { icon: Lock, title: "The Obituary", desc: "Quit? Get a one-page obituary of your prep journey. Most students never close that tab.", color: "text-destructive" },
  { icon: Trophy, title: "Always Improving", desc: "Every interaction trains your personal model. Gravitas only gets sharper.", color: "text-orbit-purple" },
];

export default function Index() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AppHeader />

      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-center">
        <div className="absolute inset-0"><StarField /></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background pointer-events-none" />
        <div className="container relative grid md:grid-cols-2 gap-12 items-center py-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="font-mono text-xs tracking-[0.3em] text-orbit-orange mb-4">FOCUS · ANALYZE · IMPROVE · RISE</p>
            <h1 className="font-display font-black text-5xl md:text-7xl leading-[0.95] mb-6">
              <span className="orbit-text">GRAVITAS</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 mb-3 max-w-xl">
              The space between where you are and where you need to be.
            </p>
            <p className="text-muted-foreground mb-8 max-w-xl">
              A next-generation JEE & NEET preparation OS. We don't just track scores — we map how you think,
              where you fail, how you focus, and how you improve.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild className="bg-gradient-to-r from-orbit-orange to-destructive text-primary-foreground shadow-[var(--shadow-fire)] font-semibold">
                <Link to="/auth">Begin Your Ascent →</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#features">Explore the System</a>
              </Button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="flex justify-center">
            <OrbitalLogo size={360} />
          </motion.div>
        </div>
      </section>

      {/* MISSION */}
      <section className="container py-20 relative">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-orbit-blue mb-4">// OUR GOAL</p>
          <h2 className="font-display text-4xl md:text-5xl mb-6">Preparation, re-engineered.</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Traditional platforms give you content, tests and scores. Gravitas combines AI, behavioral analytics
            and immersive design to understand your <span className="text-foreground">complete cognitive profile</span> — turning
            passive studying into an intelligent, adaptive experience built for the cruellest exams in the world.
          </p>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="container py-16">
        <div className="text-center mb-14">
          <p className="font-mono text-xs tracking-[0.3em] text-orbit-orange mb-3">// THE ARSENAL</p>
          <h2 className="font-display text-4xl md:text-5xl">16 weapons. One mission.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <Card className="glass-card p-6 h-full hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 group">
                <f.icon className={`h-9 w-9 ${f.color} mb-4 group-hover:scale-110 transition-transform`} />
                <h3 className="font-display text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SISTER APPS */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <p className="font-mono text-xs tracking-[0.3em] text-orbit-purple mb-3">// THE ECOSYSTEM</p>
          <h2 className="font-display text-4xl md:text-5xl">Built alongside</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Gravitas is part of a wider system for serious aspirants.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass-card p-8 hover:border-orbit-blue/50 transition-all">
            <h3 className="font-display text-2xl mb-2 orbit-text">Rankers Star</h3>
            <p className="text-sm text-muted-foreground mb-4">
              All-in-one JEE prep. Free lectures from every coaching, 700+ JEE materials, AI tests, CBT mode,
              AI mentor and AI doubt — one structured ecosystem instead of 20 tabs.
            </p>
            <Button variant="outline" asChild><a href="https://rankers-stars.vercel.app/" target="_blank" rel="noreferrer">Open Rankers Star ↗</a></Button>
          </Card>
          <Card className="glass-card p-8 hover:border-orbit-orange/50 transition-all">
            <h3 className="font-display text-2xl mb-2 orbit-text">Nexus CBT</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The CBT engine inside Rankers Star. Real exam-like interface, timed tests, performance analytics,
              PDF→test converter, flashcards, AI doubt support and a special revision section.
            </p>
            <Button variant="outline" asChild><a href="https://nexuscbt.vercel.app/" target="_blank" rel="noreferrer">Open Nexus CBT ↗</a></Button>
          </Card>
        </div>
      </section>

      {/* DEVELOPER */}
      <section className="container py-20 border-t border-border">
        <div className="max-w-3xl mx-auto glass-card p-8 md:p-12 rounded-2xl">
          <p className="font-mono text-xs tracking-[0.3em] text-orbit-orange mb-3">// BUILT BY</p>
          <h3 className="font-display text-3xl mb-4">Divyanshu</h3>
          <p className="text-foreground/80 mb-4">
            I design and develop high-impact digital products — not just good-looking websites, but fast, scalable systems that solve real problems.
          </p>
          <p className="text-muted-foreground mb-6">
            From coaching platforms and AI tools to modern UI websites and 3D experiences, everything I build is focused on performance, usability and results.
          </p>
          <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground mb-6">
            <div>• Full-stack web development</div>
            <div>• AI-powered tools & automation</div>
            <div>• 3D animated websites</div>
            <div>• Complete EdTech platforms</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild><a href="https://divyanshuportfolio-beta.vercel.app/" target="_blank" rel="noreferrer">View Portfolio ↗</a></Button>
            <Button variant="outline" asChild><a href="mailto:studyspacerankers@gmail.com">Work with me</a></Button>
          </div>
        </div>
      </section>

      <footer className="container py-10 text-center text-xs text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} GRAVITAS · Crafted by Divyanshu · For the dreamers chasing 99 percentile.
      </footer>
    </div>
  );
}
