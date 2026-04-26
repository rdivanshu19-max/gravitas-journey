import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

const QUESTIONS = [
  { q: "When learning a new concept, you prefer:", opts: [
    { t: "Diagrams and visualizations", v: "visual" },
    { t: "Step-by-step derivation", v: "logical" },
    { t: "Spotting patterns in examples", v: "pattern" },
    { t: "Memorizing key formulas", v: "formula" },
  ]},
  { q: "On a hard problem you tend to:", opts: [
    { t: "Draw it out first", v: "visual" },
    { t: "Break it into sub-problems", v: "logical" },
    { t: "Recall a similar problem", v: "pattern" },
    { t: "Apply a remembered formula", v: "formula" },
  ]},
  { q: "Your strongest skill:", opts: [
    { t: "Spatial reasoning", v: "visual" },
    { t: "Pure logic / proofs", v: "logical" },
    { t: "Pattern recognition", v: "pattern" },
    { t: "Memory and recall", v: "formula" },
  ]},
];

const PROFILES: Record<string, { title: string; desc: string; method: string }> = {
  visual: { title: "Visual Thinker", desc: "Your brain converts everything into images and spaces.", method: "Use diagrams, color-coded notes, and concept maps. Watch lecture videos at 1.25x. Avoid raw text textbooks." },
  logical: { title: "Logical Deducer", desc: "You build understanding by chaining cause and effect.", method: "Derive every formula yourself. Use proof-based books. Solve PYQs in chronological reasoning order." },
  pattern: { title: "Pattern Recogniser", desc: "You learn by spotting structure across examples.", method: "Drill problem sets by type. Make a 'pattern bank' notebook. Skip theory after first read; jump to problems." },
  formula: { title: "Formula Memoriser", desc: "You retain facts and apply them with speed.", method: "Build flashcards. Use spaced repetition. Solve standard problems on repeat. Pair with a friend who derives." },
};

export default function BrainFingerprint() {
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);

  const pick = (v: string) => {
    const next = [...picks, v];
    setPicks(next);
    if (idx + 1 < QUESTIONS.length) setIdx(idx + 1);
  };

  const result = picks.length === QUESTIONS.length ? (() => {
    const counts: Record<string, number> = {};
    picks.forEach(p => counts[p] = (counts[p] || 0) + 1);
    return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];
  })() : null;

  const reset = () => { setIdx(0); setPicks([]); };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 max-w-2xl">
        <p className="font-mono text-xs tracking-widest text-orbit-purple mb-2">// BRAIN FINGERPRINT</p>
        <h1 className="font-display text-3xl mb-1 flex items-center gap-3"><Brain className="text-orbit-purple" />How do you think?</h1>
        <p className="text-muted-foreground mb-8">3 quick questions. We map your cognitive style and prescribe the study method that fits.</p>

        {!result ? (
          <Card className="glass-card p-6">
            <p className="text-xs tracking-widest text-muted-foreground mb-3">QUESTION {idx + 1}/{QUESTIONS.length}</p>
            <h2 className="font-display text-xl mb-5">{QUESTIONS[idx].q}</h2>
            <div className="grid gap-2">
              {QUESTIONS[idx].opts.map(o => (
                <Button key={o.v} variant="outline" className="justify-start h-auto py-3" onClick={() => pick(o.v)}>{o.t}</Button>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="glass-card p-8 text-center">
            <p className="font-mono text-xs text-orbit-orange mb-2">YOUR PROFILE</p>
            <h2 className="font-display text-3xl orbit-text mb-3">{PROFILES[result].title}</h2>
            <p className="text-muted-foreground mb-5">{PROFILES[result].desc}</p>
            <div className="text-left bg-muted/30 p-4 rounded-lg">
              <p className="text-xs uppercase tracking-widest text-orbit-blue mb-2">Recommended method</p>
              <p className="text-sm">{PROFILES[result].method}</p>
            </div>
            <Button variant="outline" onClick={reset} className="mt-6">Take it again</Button>
          </Card>
        )}
      </main>
    </div>
  );
}
