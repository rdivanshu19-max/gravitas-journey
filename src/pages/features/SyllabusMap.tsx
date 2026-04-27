import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Map, Flame, Star, Lock, Sparkles, Trophy, Swords, BookOpen, Plus, Minus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type State = "mastered" | "burning" | "neutral" | "locked";

interface Chapter {
  name: string; subject: string; state: State; x: number; y: number; level: number;
  description: string; quests: string[]; weight: number; biome: "ice" | "fire" | "forest" | "desert" | "ocean";
}

const INITIAL_CHAPTERS: Chapter[] = [
  // Physics realm — north (ice & sky)
  { name: "Mechanics",       subject: "Physics",   state: "mastered", x: 14, y: 22, level: 9, weight: 12, biome: "ice",    description: "The bedrock of physics. Newton himself bows here.", quests: ["Solve 30 PYQs", "Master pseudo forces", "Crack circular motion"] },
  { name: "Electrostatics",  subject: "Physics",   state: "burning",  x: 36, y: 14, level: 4, weight: 10, biome: "fire",   description: "Volcano zone. Most students burn here.", quests: ["Re-derive Gauss law", "20 capacitor problems", "Watch dipole video"] },
  { name: "Optics",          subject: "Physics",   state: "neutral",  x: 58, y: 22, level: 5, weight: 6,  biome: "ocean",  description: "Untouched land. Easy marks await.", quests: ["Geometric optics PYQs", "Wave optics formulas"] },
  { name: "Modern Physics",  subject: "Physics",   state: "mastered", x: 82, y: 14, level: 8, weight: 8,  biome: "ice",    description: "Photoelectric, Bohr, nuclei. You own this.", quests: ["Quick PYQ revision"] },
  { name: "Thermodynamics",  subject: "Physics",   state: "locked",   x: 24, y: 38, level: 0, weight: 7,  biome: "fire",   description: "Locked region. Master Mechanics first.", quests: ["Unlock by completing Mechanics quests"] },
  { name: "Magnetism",       subject: "Physics",   state: "neutral",  x: 50, y: 36, level: 4, weight: 7,  biome: "ocean",  description: "Magnetic forest. Lenz's law guards the path.", quests: ["Biot-Savart practice", "AC circuit problems"] },

  // Chemistry realm — middle (forest & desert)
  { name: "Organic",         subject: "Chemistry", state: "burning",  x: 16, y: 56, level: 3, weight: 14, biome: "fire",   description: "Dragon's lair. The most feared chapter in JEE.", quests: ["Reaction map", "GOC concepts", "Named reactions"] },
  { name: "Inorganic",       subject: "Chemistry", state: "neutral",  x: 38, y: 60, level: 5, weight: 8,  biome: "forest", description: "Memory kingdom. Periodic patrols.", quests: ["Periodic trends", "Coordination compounds"] },
  { name: "Physical",        subject: "Chemistry", state: "mastered", x: 60, y: 56, level: 9, weight: 10, biome: "ice",    description: "Mole concept ruler. Equations bow to you.", quests: ["Maintain with weekly drills"] },
  { name: "Coordination",    subject: "Chemistry", state: "neutral",  x: 82, y: 50, level: 4, weight: 6,  biome: "desert", description: "Crystal palace. Ligands as servants.", quests: ["CFT theory", "Isomerism practice"] },

  // Math realm — south (desert & mountain)
  { name: "Calculus",        subject: "Math",      state: "neutral",  x: 22, y: 80, level: 6, weight: 12, biome: "desert", description: "The infinite plain. Limits stretch forever.", quests: ["Integration techniques", "Differential equations"] },
  { name: "Algebra",         subject: "Math",      state: "mastered", x: 50, y: 84, level: 8, weight: 10, biome: "ice",    description: "Symbol citadel. Quadratics are your subjects.", quests: ["Complex numbers refresh"] },
  { name: "Coord Geom",      subject: "Math",      state: "burning",  x: 78, y: 78, level: 3, weight: 9,  biome: "fire",   description: "Conic chaos. Hyperbolas haunt you.", quests: ["Parabola PYQs", "Ellipse mastery", "3D geometry"] },
  { name: "Vectors & 3D",    subject: "Math",      state: "neutral",  x: 90, y: 90, level: 4, weight: 7,  biome: "ocean",  description: "Direction fields. Cross products navigate.", quests: ["Plane equations", "Distance formula"] },
];

const PATHS: [string, string][] = [
  ["Mechanics", "Electrostatics"],
  ["Mechanics", "Thermodynamics"],
  ["Electrostatics", "Modern Physics"],
  ["Electrostatics", "Magnetism"],
  ["Optics", "Modern Physics"],
  ["Magnetism", "Optics"],
  ["Thermodynamics", "Organic"],
  ["Organic", "Inorganic"],
  ["Inorganic", "Physical"],
  ["Physical", "Coordination"],
  ["Calculus", "Algebra"],
  ["Algebra", "Coord Geom"],
  ["Coord Geom", "Vectors & 3D"],
  ["Inorganic", "Calculus"],
];

const STATE_STYLE: Record<State, { color: string; ring: string; label: string; icon: any }> = {
  mastered: { color: "from-orbit-blue to-orbit-purple", ring: "shadow-[0_0_24px_hsl(var(--orbit-blue)/0.6)]", label: "Mastered", icon: Star },
  burning:  { color: "from-destructive to-orbit-orange", ring: "shadow-[0_0_28px_hsl(var(--destructive)/0.7)] animate-pulse", label: "On Fire", icon: Flame },
  neutral:  { color: "from-muted-foreground/60 to-muted-foreground/40", ring: "border border-border", label: "Untouched", icon: Sparkles },
  locked:   { color: "from-muted to-muted", ring: "opacity-60 border border-border", label: "Locked", icon: Lock },
};

const FEATURE_LINK: Record<string, string> = {
  Physics: "/feature/concept-dna",
  Chemistry: "/feature/concept-dna",
  Math: "/feature/concept-dna",
};

export default function SyllabusMap() {
  const [chapters, setChapters] = useState<Chapter[]>(INITIAL_CHAPTERS);
  const [selected, setSelected] = useState<Chapter | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const totalLevel = useMemo(() => chapters.reduce((a, c) => a + c.level, 0), [chapters]);
  const maxLevel = chapters.length * 10;
  const progress = (totalLevel / maxLevel) * 100;
  const heroTitle = progress > 75 ? "Grandmaster" : progress > 50 ? "Champion" : progress > 25 ? "Ranger" : "Novice";

  const findPos = (name: string) => chapters.find(c => c.name === name);

  const adjustLevel = (name: string, delta: number) => {
    setChapters(cs => cs.map(c => {
      if (c.name !== name) return c;
      const nl = Math.max(0, Math.min(10, c.level + delta));
      const newState: State = c.state === "locked" ? "locked" : nl >= 7 ? "mastered" : nl <= 3 ? "burning" : "neutral";
      return { ...c, level: nl, state: newState };
    }));
  };

  const travel = (ch: Chapter) => {
    if (ch.state === "locked") {
      toast.error("Region locked. Master a prerequisite first.");
      return;
    }
    setSelected(ch);
    setOpen(true);
  };

  const completeQuest = (chName: string) => {
    adjustLevel(chName, 1);
    toast.success(`+1 XP · ${chName}`);
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-8 max-w-6xl">
        <p className="font-mono text-xs tracking-widest text-orbit-orange mb-2">// SYLLABUS RPG · v2</p>
        <h1 className="font-display text-3xl mb-1 flex items-center gap-3"><Map className="text-orbit-orange" />The World of Aspirantia</h1>
        <p className="text-muted-foreground mb-4">A living realm. Click any city to travel, study, and conquer.</p>

        {/* Hero bar */}
        <Card className="glass-card p-4 mb-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orbit-orange to-orbit-purple grid place-items-center shadow-lg">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground tracking-widest">{heroTitle.toUpperCase()}</p>
              <p className="font-display text-xl orbit-text">Hero Level {totalLevel} / {maxLevel}</p>
            </div>
          </div>
          <div className="flex-1 max-w-md min-w-[200px]">
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-orbit-blue via-orbit-purple to-orbit-orange"
                initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1 }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{progress.toFixed(0)}% world conquered</p>
          </div>
        </Card>

        {/* The Map — works in light & dark */}
        <Card className="relative overflow-hidden h-[65vh] border-orbit-purple/30 mb-4"
          style={{
            background: `
              radial-gradient(ellipse at 25% 25%, hsl(var(--orbit-blue)/0.15), transparent 45%),
              radial-gradient(ellipse at 70% 60%, hsl(var(--orbit-purple)/0.15), transparent 45%),
              radial-gradient(ellipse at 50% 90%, hsl(var(--orbit-orange)/0.12), transparent 45%),
              hsl(var(--card))
            `,
          }}
        >
          {/* Topographic grid */}
          <div className="absolute inset-0 opacity-[0.12] pointer-events-none" style={{
            backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />

          {/* Compass */}
          <div className="absolute top-3 right-3 h-12 w-12 rounded-full border-2 border-orbit-orange/40 grid place-items-center bg-card/60 backdrop-blur-sm font-display text-orbit-orange text-xs pointer-events-none">N</div>

          {/* Region labels */}
          <div className="absolute top-[8%] left-[8%] font-display text-xs tracking-widest text-orbit-blue/50 pointer-events-none">PHYSICS REALM</div>
          <div className="absolute top-[48%] left-[8%] font-display text-xs tracking-widest text-orbit-orange/50 pointer-events-none">CHEMISTRY REALM</div>
          <div className="absolute bottom-[2%] left-[8%] font-display text-xs tracking-widest text-orbit-purple/50 pointer-events-none">MATH REALM</div>

          {/* Connection paths */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--orbit-blue) / 0.5)" />
              </marker>
            </defs>
            {PATHS.map(([a, b], i) => {
              const A = findPos(a); const B = findPos(b);
              if (!A || !B) return null;
              return (
                <line key={i} x1={`${A.x}%`} y1={`${A.y}%`} x2={`${B.x}%`} y2={`${B.y}%`}
                  stroke="hsl(var(--orbit-blue) / 0.35)" strokeWidth={1.5} strokeDasharray="5 4" />
              );
            })}
          </svg>

          {/* Cities */}
          {chapters.map((ch, i) => {
            const style = STATE_STYLE[ch.state];
            const Icon = style.icon;
            const isSelected = selected?.name === ch.name;
            return (
              <motion.button
                key={ch.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }}
                onMouseEnter={() => setHovered(ch.name)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => travel(ch)}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${ch.x}%`, top: `${ch.y}%`, zIndex: hovered === ch.name ? 20 : 1 }}
              >
                <div className={`relative h-12 w-12 sm:h-14 sm:w-14 rounded-2xl grid place-items-center bg-gradient-to-br ${style.color} ${style.ring} transition-transform group-hover:scale-125 ${isSelected ? "ring-2 ring-orbit-orange scale-125" : ""}`}>
                  <Icon className="h-5 w-5 text-primary-foreground" />
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-background border border-border grid place-items-center text-[9px] font-display">{ch.level}</span>
                </div>
                <p className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] whitespace-nowrap font-mono bg-background/85 backdrop-blur-sm px-1.5 py-0.5 rounded border border-border">{ch.name}</p>
                <AnimatePresence>
                  {hovered === ch.name && !isSelected && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-popover border border-border text-[10px] whitespace-nowrap shadow-lg text-popover-foreground">
                      {style.label} · Lv {ch.level} · Tap to travel
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </Card>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs">
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

        {/* City Travel Modal */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg">
            {selected && (
              <>
                <DialogHeader>
                  <p className="font-mono text-[10px] tracking-widest text-muted-foreground">{selected.subject.toUpperCase()} · LV {selected.level} · {selected.biome.toUpperCase()} BIOME</p>
                  <DialogTitle className="font-display text-2xl orbit-text">{selected.name}</DialogTitle>
                  <DialogDescription className="italic">"{selected.description}"</DialogDescription>
                </DialogHeader>

                <div className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r ${STATE_STYLE[selected.state].color} text-primary-foreground w-fit`}>
                  {STATE_STYLE[selected.state].label}
                </div>

                {/* XP control */}
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                  <span className="text-xs text-muted-foreground">Adjust XP:</span>
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => adjustLevel(selected.name, -1)}><Minus className="h-3 w-3" /></Button>
                  <span className="font-display text-lg w-8 text-center">{findPos(selected.name)?.level ?? selected.level}</span>
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => adjustLevel(selected.name, 1)}><Plus className="h-3 w-3" /></Button>
                  <span className="text-[10px] text-muted-foreground ml-auto">/ 10</span>
                </div>

                <div>
                  <p className="text-[10px] tracking-widest text-orbit-orange mb-2">QUESTS</p>
                  <ul className="space-y-1.5 text-sm">
                    {selected.quests.map((q, i) => (
                      <li key={i} className="flex items-start gap-2 group">
                        <button onClick={() => completeQuest(selected.name)} className="mt-0.5 h-4 w-4 rounded border border-orbit-orange/50 grid place-items-center hover:bg-orbit-orange/20 transition shrink-0">
                          <Check className="h-2.5 w-2.5 text-orbit-orange opacity-0 group-hover:opacity-100" />
                        </button>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-[10px] tracking-widest text-orbit-blue mb-1">EXAM WEIGHT</p>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orbit-blue to-orbit-purple" style={{ width: `${selected.weight * 7}%` }} />
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap pt-2">
                  <Button asChild size="sm" className="bg-gradient-to-r from-orbit-orange to-orbit-purple flex-1">
                    <Link to={FEATURE_LINK[selected.subject] || "/feature/concept-dna"}>
                      <BookOpen className="h-3 w-3 mr-1" />Study {selected.name}
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/feature/graveyard">
                      <Swords className="h-3 w-3 mr-1" />Battle wrong answers
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
