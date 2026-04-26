import AppHeader from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Map } from "lucide-react";
import { motion } from "framer-motion";

const CHAPTERS = [
  { name: "Mechanics", state: "mastered", x: 15, y: 30 },
  { name: "Electrostatics", state: "burning", x: 40, y: 20 },
  { name: "Optics", state: "neutral", x: 65, y: 35 },
  { name: "Modern Physics", state: "mastered", x: 85, y: 25 },
  { name: "Organic", state: "burning", x: 25, y: 65 },
  { name: "Inorganic", state: "neutral", x: 50, y: 70 },
  { name: "Physical", state: "mastered", x: 75, y: 60 },
  { name: "Calculus", state: "neutral", x: 30, y: 85 },
  { name: "Algebra", state: "mastered", x: 60, y: 90 },
  { name: "Coordinate Geom", state: "burning", x: 85, y: 80 },
];

export default function SyllabusMap() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 max-w-5xl">
        <p className="font-mono text-xs tracking-widest text-orbit-orange mb-2">// SYLLABUS RPG MAP</p>
        <h1 className="font-display text-3xl mb-1 flex items-center gap-3"><Map className="text-orbit-orange" />Your World</h1>
        <p className="text-muted-foreground mb-8">Mastered chapters glow. Weak ones burn. Travel to a city to study it.</p>

        <Card className="glass-card relative overflow-hidden h-[60vh]" style={{
          background: "radial-gradient(ellipse at 30% 40%, hsl(var(--orbit-blue)/0.15), transparent 50%), radial-gradient(ellipse at 70% 60%, hsl(var(--orbit-purple)/0.15), transparent 50%)",
        }}>
          {CHAPTERS.map((ch, i) => (
            <motion.div
              key={ch.name}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${ch.x}%`, top: `${ch.y}%` }}
            >
              <div className={`relative h-12 w-12 rounded-full grid place-items-center transition-transform group-hover:scale-125 ${
                ch.state === "mastered" ? "bg-orbit-blue shadow-[0_0_30px_hsl(var(--orbit-blue))]" :
                ch.state === "burning" ? "bg-destructive shadow-[0_0_30px_hsl(var(--destructive))] animate-pulse" :
                "bg-muted border border-border"
              }`}>
                <span className="text-xs font-display">{ch.name[0]}</span>
              </div>
              <p className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] whitespace-nowrap font-mono">{ch.name}</p>
            </motion.div>
          ))}
        </Card>

        <div className="grid grid-cols-3 gap-3 mt-4 text-xs text-center">
          <div className="glass-card p-3"><span className="inline-block h-3 w-3 rounded-full bg-orbit-blue mr-2" />Mastered</div>
          <div className="glass-card p-3"><span className="inline-block h-3 w-3 rounded-full bg-muted mr-2" />Untouched</div>
          <div className="glass-card p-3"><span className="inline-block h-3 w-3 rounded-full bg-destructive mr-2" />Burning</div>
        </div>
      </main>
    </div>
  );
}
