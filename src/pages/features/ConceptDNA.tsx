import AppHeader from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Dna } from "lucide-react";
import { motion } from "framer-motion";

const CONNECTIONS = [
  { from: "Integration", to: ["Definite Integrals", "Area Under Curve", "Differential Equations", "Inverse Trig", "Substitution Methods"] },
  { from: "Newton's Laws", to: ["Friction", "Circular Motion", "Work Energy", "Momentum", "Pseudo Forces"] },
  { from: "Mole Concept", to: ["Stoichiometry", "Gaseous State", "Solutions", "Electrochemistry"] },
];

export default function ConceptDNA() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 max-w-3xl">
        <p className="font-mono text-xs tracking-widest text-orbit-blue mb-2">// CONCEPT DNA</p>
        <h1 className="font-display text-3xl mb-1 flex items-center gap-3"><Dna className="text-orbit-blue" />Knowledge Graph</h1>
        <p className="text-muted-foreground mb-8">Every JEE/NEET concept is connected. Weakness in one chapter quietly poisons others.</p>

        <div className="space-y-6">
          {CONNECTIONS.map((c, idx) => (
            <motion.div key={c.from} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.15 }}>
              <Card className="glass-card p-6">
                <h3 className="font-display text-xl mb-4">
                  <span className="orbit-text">{c.from}</span>
                  <span className="text-muted-foreground text-sm ml-2">→ affects</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {c.to.map((t, i) => (
                    <motion.span
                      key={t}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.15 + i * 0.05 }}
                      className="px-3 py-1.5 rounded-full bg-gradient-to-r from-orbit-blue/20 to-orbit-purple/20 border border-orbit-blue/30 text-xs"
                    >
                      {t}
                    </motion.span>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="glass-card p-6 mt-8 border-orbit-orange/40">
          <p className="text-sm text-muted-foreground">
            🧬 The full Concept DNA is being trained on your test history.
            As you submit mocks, the graph adapts — showing exactly which weak chapter is silently sabotaging 7 others.
          </p>
        </Card>
      </main>
    </div>
  );
}
