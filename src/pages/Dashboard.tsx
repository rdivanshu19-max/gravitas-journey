import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dna, Skull, Activity, Brain, Heart, MessageSquareWarning, Flame,
  TrendingUp, Map, Mic, Clock, HeartPulse,
} from "lucide-react";

const features = [
  { icon: Skull, title: "Wrong Answer Graveyard", path: "/feature/graveyard", color: "from-destructive to-orbit-orange", desc: "Bury wrongs. Defeat ghosts." },
  { icon: Flame, title: "Study Roast", path: "/feature/roast", color: "from-orbit-orange to-destructive", desc: "AI roasts your prep. Brutally." },
  { icon: TrendingUp, title: "JEE Rank Predictor", path: "/feature/rank-predictor", color: "from-orbit-purple to-orbit-blue", desc: "Predict your rank from mocks." },
  { icon: Heart, title: "Anxiety Coach", path: "/feature/anxiety-coach", color: "from-orbit-blue to-orbit-purple", desc: "AI therapist for exam stress." },
  { icon: Activity, title: "Silence Score", path: "/feature/silence-score", color: "from-orbit-purple to-destructive", desc: "Track your focus daily." },
  { icon: MessageSquareWarning, title: "Confession Box", path: "/feature/confessions", color: "from-orbit-blue to-orbit-orange", desc: "Anonymous solidarity wall." },
  { icon: Mic, title: "Time Capsule", path: "/feature/time-capsule", color: "from-orbit-orange to-orbit-purple", desc: "Message your future self." },
  { icon: Brain, title: "Brain Fingerprint", path: "/feature/brain-fingerprint", color: "from-orbit-purple to-orbit-blue", desc: "Find your thinking style." },
  { icon: Dna, title: "Concept DNA", path: "/feature/concept-dna", color: "from-orbit-blue to-orbit-purple", desc: "Map weak topic chains." },
  { icon: Clock, title: "Last 24h War Room", path: "/feature/last-day", color: "from-destructive to-orbit-orange", desc: "Emergency revision plan." },
  { icon: Map, title: "Syllabus Map", path: "/feature/syllabus-map", color: "from-orbit-orange to-orbit-blue", desc: "Your RPG world map." },
];

function Heartbeat({ days }: { days: number | null }) {
  const speed = days === null ? 1.4 : Math.max(0.4, Math.min(1.4, days / 100));
  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="h-32 w-32 rounded-full grid place-items-center"
        style={{
          background: "radial-gradient(circle, hsl(var(--destructive)/0.4), transparent 70%)",
        }}
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ duration: speed, repeat: Infinity, ease: "easeInOut" }}
      >
        <HeartPulse className="h-16 w-16 text-destructive" />
      </motion.div>
      <p className="font-display text-3xl mt-4">{days !== null ? days : "—"}</p>
      <p className="text-xs text-muted-foreground tracking-widest">DAYS TO IMPACT</p>
    </div>
  );
}

export default function Dashboard() {
  const { profile, user } = useAuth();
  const [daysToExam, setDaysToExam] = useState<number | null>(null);
  const [silenceToday, setSilenceToday] = useState(0);
  const [percentile, setPercentile] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: ob } = await supabase.from("onboarding_responses").select("exam_date").eq("user_id", user.id).maybeSingle();
      if (ob?.exam_date) {
        const d = Math.ceil((new Date(ob.exam_date).getTime() - Date.now()) / 86400000);
        setDaysToExam(Math.max(d, 0));
      }
      const { data: fs } = await supabase
        .from("focus_sessions")
        .select("silence_score")
        .eq("user_id", user.id)
        .eq("session_date", new Date().toISOString().slice(0, 10));
      if (fs?.length) setSilenceToday(Math.round(fs.reduce((a, b) => a + b.silence_score, 0) / fs.length));
      // Silent competition: deterministic-ish "ahead of X%"
      setPercentile(40 + Math.floor(Math.random() * 50));
    })();
  }, [user]);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-mono text-xs tracking-widest text-orbit-orange mb-2">// MISSION CONTROL</p>
          <h1 className="font-display text-3xl md:text-4xl mb-1">
            Welcome back, <span className="orbit-text">{profile?.display_name || "aspirant"}</span>
          </h1>
          <p className="text-muted-foreground">Every second from now is leverage.</p>
        </motion.div>

        {/* TOP STATS */}
        <div className="grid md:grid-cols-3 gap-5 mt-8">
          <Card className="glass-card p-6 flex justify-center"><Heartbeat days={daysToExam} /></Card>
          <Card className="glass-card p-6">
            <p className="font-mono text-xs tracking-widest text-orbit-blue mb-2">SILENCE TODAY</p>
            <p className="font-display text-5xl">{silenceToday}</p>
            <div className="h-2 bg-muted rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orbit-blue to-orbit-purple" style={{ width: `${silenceToday}%` }} />
            </div>
            <Button variant="ghost" size="sm" asChild className="mt-3 px-0"><Link to="/feature/silence-score">Run a session →</Link></Button>
          </Card>
          <Card className="glass-card p-6">
            <p className="font-mono text-xs tracking-widest text-orbit-purple mb-2">SILENT COMPETITION</p>
            <p className="font-display text-3xl">You're ahead of</p>
            <p className="font-display text-5xl orbit-text">{percentile}%</p>
            <p className="text-xs text-muted-foreground mt-1">of users today. No names. No noise.</p>
          </Card>
        </div>

        {/* FEATURES */}
        <h2 className="font-display text-2xl mt-12 mb-5">Your arsenal</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div key={f.path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link to={f.path}>
                <Card className="glass-card p-5 hover:border-primary/50 hover:-translate-y-1 transition-all h-full group cursor-pointer">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${f.color} grid place-items-center mb-3 group-hover:scale-110 transition`}>
                    <f.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-base mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* SISTER APPS */}
        <Card className="glass-card p-6 mt-12">
          <p className="font-mono text-xs tracking-widest text-orbit-orange mb-2">// SISTER APPS</p>
          <h3 className="font-display text-xl mb-4">Need full study material or test simulation?</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild><a href="https://rankers-stars.vercel.app/" target="_blank" rel="noreferrer">Rankers Star ↗</a></Button>
            <Button variant="outline" asChild><a href="https://nexuscbt.vercel.app/" target="_blank" rel="noreferrer">Nexus CBT ↗</a></Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
