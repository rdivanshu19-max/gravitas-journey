import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, Flame, Star, Lock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type State = "mastered" | "burning" | "neutral" | "locked";

interface Chapter {
  name: string; subject: string; state: State; x: number; y: number; level: number;
  description: string; quests: string[]; weight: number;
}

const CHAPTERS: Chapter[] = [
  { name: "Mechanics",       subject: "Physics",   state: "mastered", x: 18, y: 28, level: 9, weight: 12, description: "The bedrock of physics. Newton himself bows here.", quests: ["Solve 30 PYQs", "Master pseudo forces", "Crack circular motion"] },
  { name: "Electrostatics",  subject: "Physics",   state: "burning",  x: 38, y: 18, level: 4, weight: 10, description: "Volcano zone. Most students burn here.", quests: ["Re-derive Gauss law", "20 capacitor problems", "Watch dipole video"] },
  { name: "Optics",          subject: "Physics",   state: "neutral",  x: 60, y: 30, level: 5, weight: 6,  description: "Untouched land. Easy marks await.", quests: ["Geometric optics PYQs", "Wave optics formulas"] },
  { name: "Modern Physics",  subject: "Physics",   state: "mastered", x: 82, y: 22, level: 8, weight: 8,  description: "Photoelectric, Bohr, nuclei. You own this.", quests: ["Quick PYQ revision"] },
  { name: "Thermodynamics",  subject: "Physics",   state: "locked",   x: 50, y: 48, level: 0, weight: 7,  description: "Locked region. Master Mechanics first.", quests: ["Unlock by completing Mechanics quests"] },
  { name: "Organic",         subject: "Chemistry", state: "burning",  x: 28, y: 62, level: 3, weight: 14, description: "Dragon's lair. The most feared chapter in JEE.", quests: ["Reaction map", "GOC concepts", "Named reactions"] },
  { name: "Inorganic",       subject: "Chemistry", state: "neutral",  x: 50, y: 70, level: 5, weight: 8,  description: "Memory kingdom. Periodic patrols.", quests: ["Periodic trends", "Coordination compounds"] },
  { name: "Physical",        subject: "Chemistry", state: "mastered", x: 72, y: 60, level: 9, weight: 10, description: "Mole concept ruler. Equations bow to you.", quests: ["Maintain with weekly drills"] },
  { name: "Calculus",        subject: "Math",      state: "neutral",  x: 30, y: 86, level: 6, weight: 12, description: "The infinite plain. Limits stretch forever.", quests: ["Integration techniques", "Differential equations"] },
  { name: "Algebra",         subject: "Math",      state: "mastered", x: 56, y: 90, level: 8, weight: 10, description: "Symbol citadel. Quadratics are your subjects.", quests: ["Complex numbers refresh"] },
  { name: "Coord Geom",      subject: "Math",      state: "burning",  x: 82, y: 84, level: 3, weight: 9,  description: "Conic chaos. Hyperbolas haunt you.", quests: ["Parabola PYQs", "Ellipse mastery", "3D geometry"] },
];

const PATHS: [string, string][] = [
  ["Mechanics", "Electrostatics"],
  ["Mechanics", "Thermodynamics"],
  ["Electrostatics", "Modern Physics"],
  ["Optics", "Modern Physics"],
  ["Organic", "Inorganic"],
  ["Inorganic", "Physical"],
  ["Calculus", "Algebra"],
  ["Algebra", "Coord Geom"],
];

const STATE_STYLE: Record<State, { color: string; ring: string; label: string; icon: any }> = {
  mastered: { color: "from-orbit-blue to-orbit-purple", ring: "shadow-[0_0_30px_hsl(var(--orbit-blue)/0.6)]", label: "Mastered", icon: Star },
  burning:  { color: "from-destructive to-orbit-orange", ring: "shadow-[0_0_30px_hsl(var(--destructive)/0.7)] animate-pulse", label: "On Fire", icon: Flame },
  neutral:  { color: "from-muted to-muted", ring: "border border-border", label: "Untouched", icon: Sparkles },
  locked:   { color: "from-muted/30 to-muted/30", ring: "opacity-50 border border-border", label: "Locked", icon: Lock },
};

export default function SyllabusMap() {
  const [selected, setSelected] = useState<Chapter | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const totalLevel = CHAPTERS.reduce((a, c) => a + c.level, 0);
  const maxLevel = CHAPTERS.length * 10;

  const findPos = (name: string) => CHAPTERS.find(c => c.name === name);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 max-w-6xl">
        <p className="font-mono text-xs tracking-widest text-orbit-orange mb-2">// SYLLABUS RPG</p>
        <h1 className="font-display text-3xl mb-1 flex items-center gap-3"><Map className="text-orbit-orange" />The World of Aspirantia</h1>
        <p className="text-muted-foreground mb-4">A living realm. Every chapter is a city. Travel, train, conquer.</p>

        <Card className="glass-card p-4 mb-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-muted-foreground tracking-widest">HERO LEVEL</p>
            <p className="font-display text-2xl orbit-text">{totalLevel} / {maxLevel}</p>
          </div>
          <div className="flex-1 max-w-md">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orbit-blue via-orbit-purple to-orbit-orange transition-all" style={{ width: `${(totalLevel/maxLevel)*100}%` }} />
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* MAP */}
          <Card className="lg:col-span-2 relative overflow-hidden h-[70vh] border-orbit-purple/30" style={{
            background: `
              radial-gradient(ellipse at 25% 25%, hsl(var(--orbit-blue)/0.18), transparent 45%),
              radial-gradient(ellipse at 70% 60%, hsl(var(--orbit-purple)/0.18), transparent 45%),
              radial-gradient(ellipse at 50% 90%, hsl(var(--orbit-orange)/0.15), transparent 45%),
              linear-gradient(180deg, hsl(230 35% 6%) 0%, hsl(230 35% 4%) 100%)
            `,
          }}>
            {/* Grid texture */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }} />

            {/* Connection paths */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
              {PATHS.map(([a, b], i) => {
                const A = findPos(a)!; const B = findPos(b)!;
                return (
                  <line key={i} x1={`${A.x}%`} y1={`${A.y}%`} x2={`${B.x}%`} y2={`${B.y}%`}
                    stroke="hsl(var(--orbit-blue) / 0.3)" strokeWidth={1.5} strokeDasharray="4 4" />
                );
              })}
            </svg>

            {/* Cities */}
            {CHAPTERS.map((ch, i) => {
              const style = STATE_STYLE[ch.state];
              const Icon = style.icon;
              const isSelected = selected?.name === ch.name;
              return (
                <motion.button
                  key={ch.name}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06, type: "spring" }}
                  onMouseEnter={() => setHovered(ch.name)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(ch)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${ch.x}%`, top: `${ch.y}%` }}
                >
                  <div className={`relative h-14 w-14 rounded-2xl grid place-items-center bg-gradient-to-br ${style.color} ${style.ring} transition-all group-hover:scale-125 ${isSelected ? "ring-2 ring-orbit-orange scale-125" : ""}`}>
                    <Icon className="h-5 w-5 text-primary-foreground" />
                    <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-background border border-border grid place-items-center text-[9px] font-display">{ch.level}</span>
                  </div>
                  <p className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] whitespace-nowrap font-mono bg-background/80 px-1.5 py-0.5 rounded">{ch.name}</p>
                  <AnimatePresence>
                    {hovered === ch.name && !isSelected && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-card border border-border text-[10px] whitespace-nowrap shadow-lg z-10">
                        {style.label} · Lv {ch.level}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </Card>

          {/* CITY DETAIL */}
          <Card className="glass-card p-5 h-fit lg:sticky lg:top-20">
            {!selected ? (
              <div className="text-center py-10 text-muted-foreground">
                <Map className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Tap a city to enter.</p>
              </div>
            ) : (
              <motion.div key={selected.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="font-mono text-[10px] tracking-widest text-muted-foreground">{selected.subject.toUpperCase()} · LV {selected.level}</p>
                <h3 className="font-display text-2xl orbit-text mb-1">{selected.name}</h3>
                <div className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full mb-3 bg-gradient-to-r ${STATE_STYLE[selected.state].color} text-primary-foreground`}>
                  {STATE_STYLE[selected.state].label}
                </div>
                <p className="text-sm text-muted-foreground italic mb-4">"{selected.description}"</p>
                <p className="text-[10px] tracking-widest text-orbit-orange mb-2">QUESTS</p>
                <ul className="space-y-1.5 text-sm mb-4">
                  {selected.quests.map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-orbit-orange mt-0.5">◆</span><span>{q}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] tracking-widest text-orbit-blue mb-1">EXAM WEIGHT</p>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-gradient-to-r from-orbit-blue to-orbit-purple" style={{ width: `${selected.weight * 7}%` }} />
                </div>
                <Button size="sm" className="w-full bg-gradient-to-r from-orbit-orange to-orbit-purple" disabled={selected.state === "locked"}>
                  {selected.state === "locked" ? "Locked" : "Travel here & study →"}
                </Button>
              </motion.div>
            )}
          </Card>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 text-xs">
          {(Object.entries(STATE_STYLE) as [State, typeof STATE_STYLE.mastered][]).map(([k, v]) => {
            const Icon = v.icon;
            return (
              <div key={k} className="glass-card p-2 flex items-center gap-2">
                <div className={`h-6 w-6 rounded grid place-items-center bg-gradient-to-br ${v.color}`}><Icon className="h-3 w-3 text-primary-foreground" /></div>
                <span>{v.label}</span>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
