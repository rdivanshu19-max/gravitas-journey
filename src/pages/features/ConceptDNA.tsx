import { useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dna, AlertTriangle, Check, X, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Node { id: string; subject: string; chains: string[]; }

const GRAPH: Node[] = [
  { id: "Limits", subject: "Math", chains: ["Continuity", "Differentiability", "Derivatives", "Integration"] },
  { id: "Integration", subject: "Math", chains: ["Definite Integrals", "Area Under Curve", "Differential Equations", "Inverse Trig", "Substitution"] },
  { id: "Vectors", subject: "Math", chains: ["3D Geometry", "Cross Product Mechanics", "Plane Equations"] },
  { id: "Newton's Laws", subject: "Physics", chains: ["Friction", "Circular Motion", "Work-Energy", "Momentum", "Pseudo Forces"] },
  { id: "Electrostatics", subject: "Physics", chains: ["Capacitors", "Current Electricity", "EM Induction", "Gauss Law"] },
  { id: "Rotational Motion", subject: "Physics", chains: ["Moment of Inertia", "Angular Momentum", "Rolling", "Torque"] },
  { id: "Mole Concept", subject: "Chemistry", chains: ["Stoichiometry", "Gaseous State", "Solutions", "Electrochemistry", "Solid State"] },
  { id: "Chemical Bonding", subject: "Chemistry", chains: ["Hybridisation", "VSEPR", "MOT", "Periodic Trends"] },
  { id: "GOC", subject: "Chemistry", chains: ["Reaction Mechanisms", "Stereochemistry", "Aromatic Reactions", "Carbonyl Chemistry"] },
];

const QUIZ: Record<string, { q: string; opts: string[]; correct: number }[]> = {
  Integration: [{ q: "∫ x·sin(x) dx = ?", opts: ["sin(x) − x·cos(x) + C", "−x·cos(x) + sin(x) + C", "x·cos(x) + sin(x) + C", "−sin(x) + C"], correct: 1 }],
  "Newton's Laws": [{ q: "On a frictionless surface, applying force F on block of mass m gives acceleration:", opts: ["F", "F·m", "F/m", "m/F"], correct: 2 }],
  "Mole Concept": [{ q: "Number of moles in 22 g of CO₂ (M=44):", opts: ["1", "0.5", "2", "0.25"], correct: 1 }],
  Limits: [{ q: "lim(x→0) sin(x)/x =", opts: ["0", "1", "∞", "undefined"], correct: 1 }],
  Vectors: [{ q: "If a·b = 0 and neither is zero, then:", opts: ["parallel", "perpendicular", "equal", "opposite"], correct: 1 }],
  Electrostatics: [{ q: "Electric field inside a hollow conductor is:", opts: ["non-zero", "infinite", "zero", "depends on charge"], correct: 2 }],
  "Rotational Motion": [{ q: "Moment of inertia of solid sphere about diameter:", opts: ["MR²", "(2/5)MR²", "(2/3)MR²", "(1/2)MR²"], correct: 1 }],
  "Chemical Bonding": [{ q: "Hybridisation of central atom in BF₃:", opts: ["sp", "sp²", "sp³", "sp³d"], correct: 1 }],
  GOC: [{ q: "Most stable carbocation:", opts: ["Methyl", "Primary", "Secondary", "Tertiary"], correct: 3 }],
};

export default function ConceptDNA() {
  const [selected, setSelected] = useState<Node | null>(null);
  const [mode, setMode] = useState<"map" | "quiz">("map");
  const [answer, setAnswer] = useState<number | null>(null);

  const subjects = useMemo(() => ["All", ...Array.from(new Set(GRAPH.map(n => n.subject)))], []);
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? GRAPH : GRAPH.filter(n => n.subject === filter);

  const startQuiz = (n: Node) => { setSelected(n); setMode("quiz"); setAnswer(null); };
  const currentQ = selected ? QUIZ[selected.id]?.[0] : null;
  const wrong = answer !== null && currentQ && answer !== currentQ.correct;
  const right = answer !== null && currentQ && answer === currentQ.correct;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 max-w-5xl">
        <p className="font-mono text-xs tracking-widest text-orbit-blue mb-2">// CONCEPT DNA</p>
        <h1 className="font-display text-3xl mb-1 flex items-center gap-3"><Dna className="text-orbit-blue" />Knowledge Graph</h1>
        <p className="text-muted-foreground mb-6">Click a concept to see what topics it secretly poisons. Take the quiz — fail and watch the failure-chain ignite.</p>

        <div className="flex flex-wrap gap-2 mb-5">
          {subjects.map(s => (
            <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>{s}</Button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* NODES */}
          <Card className="glass-card p-5">
            <p className="font-mono text-xs text-muted-foreground mb-3">// SELECT A CONCEPT</p>
            <div className="grid grid-cols-2 gap-2">
              {filtered.map(n => (
                <button
                  key={n.id}
                  onClick={() => { setSelected(n); setMode("map"); setAnswer(null); }}
                  className={`p-3 rounded-lg border text-left text-sm transition-all ${
                    selected?.id === n.id
                      ? "bg-gradient-to-br from-orbit-blue/30 to-orbit-purple/30 border-orbit-blue shadow-[0_0_20px_hsl(var(--orbit-blue)/0.3)]"
                      : "border-border hover:border-orbit-blue/50"
                  }`}
                >
                  <p className="font-medium">{n.id}</p>
                  <p className="text-[10px] text-muted-foreground">{n.subject} · affects {n.chains.length}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* DETAIL */}
          <Card className="glass-card p-5 min-h-[300px]">
            {!selected ? (
              <div className="h-full grid place-items-center text-center text-muted-foreground">
                <div>
                  <Brain className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>Select a concept to reveal its DNA chain.</p>
                </div>
              </div>
            ) : mode === "map" ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl orbit-text">{selected.id}</h3>
                  {QUIZ[selected.id] && (
                    <Button size="sm" onClick={() => startQuiz(selected)}>Test me →</Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3">→ Weakness here silently affects:</p>
                <div className="flex flex-wrap gap-2">
                  {selected.chains.map((t, i) => (
                    <motion.span
                      key={t}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-3 py-1.5 rounded-full bg-gradient-to-r from-orbit-blue/20 to-orbit-purple/20 border border-orbit-blue/30 text-xs"
                    >{t}</motion.span>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="font-mono text-[10px] tracking-widest text-orbit-orange mb-2">QUIZ · {selected.id}</p>
                <h3 className="font-display text-lg mb-4">{currentQ?.q}</h3>
                <div className="grid gap-2">
                  {currentQ?.opts.map((o, i) => (
                    <button key={o} disabled={answer !== null}
                      onClick={() => setAnswer(i)}
                      className={`p-3 rounded-lg border text-left text-sm transition ${
                        answer === null ? "border-border hover:border-primary/50" :
                        i === currentQ.correct ? "border-orbit-blue bg-orbit-blue/10" :
                        i === answer ? "border-destructive bg-destructive/10" : "border-border opacity-60"
                      }`}>
                      {o}
                    </button>
                  ))}
                </div>
                <AnimatePresence>
                  {right && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 rounded-lg bg-orbit-blue/10 border border-orbit-blue/30 flex gap-2 items-center text-sm">
                      <Check className="h-4 w-4 text-orbit-blue" />Strand intact. Connected topics safe.
                    </motion.div>
                  )}
                  {wrong && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/40">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <p className="text-sm font-medium">Failure chain triggered</p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">This concept silently weakens:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.chains.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-full bg-destructive/20 border border-destructive/40 text-[10px]">{t}</span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => { setMode("map"); setAnswer(null); }}>← Back to map</Button>
                  {answer !== null && <Button size="sm" onClick={() => setAnswer(null)}><X className="h-3 w-3 mr-1" />Retry</Button>}
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
