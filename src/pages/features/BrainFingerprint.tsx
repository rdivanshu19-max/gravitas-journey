import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Save, RefreshCw, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
  { q: "After a wrong answer, you usually:", opts: [
    { t: "Re-draw the situation", v: "visual" },
    { t: "Trace logical errors line by line", v: "logical" },
    { t: "Look for a similar solved problem", v: "pattern" },
    { t: "Re-memorize the formula", v: "formula" },
  ]},
  { q: "In a 3-hour mock, you peak when:", opts: [
    { t: "Questions have figures", v: "visual" },
    { t: "Questions need multi-step proofs", v: "logical" },
    { t: "Questions resemble PYQs", v: "pattern" },
    { t: "Questions are direct application", v: "formula" },
  ]},
];

const PROFILES: Record<string, { title: string; desc: string; method: string; tools: string[]; weakness: string }> = {
  visual:  { title: "Visual Thinker", desc: "Your brain converts everything into images and spaces.",
    method: "Use diagrams, color-coded notes and concept maps. Watch lectures at 1.25x. Avoid raw text.",
    tools: ["Concept maps", "Color-coded notes", "Whiteboard practice", "Animated lectures"],
    weakness: "You may rush through abstract derivations. Slow down on pure-symbol questions." },
  logical: { title: "Logical Deducer", desc: "You build understanding by chaining cause and effect.",
    method: "Derive every formula yourself. Use proof-based books. Solve PYQs in chronological reasoning order.",
    tools: ["Derivation notebook", "Proof-based texts", "First-principle solving"],
    weakness: "You spend too long on each question. Build a 'guess-and-check' mode for mocks." },
  pattern: { title: "Pattern Recogniser", desc: "You learn by spotting structure across examples.",
    method: "Drill problem sets by type. Build a 'pattern bank'. Skip theory; jump to problems.",
    tools: ["Pattern bank notebook", "Problem-set drills", "Quick PYQ skim"],
    weakness: "Unseen pattern = panic. Spend 20% of time on novel/twisted problems." },
  formula: { title: "Formula Memoriser", desc: "You retain facts and apply them with speed.",
    method: "Build flashcards. Use spaced repetition. Solve standard problems on repeat.",
    tools: ["Flashcards", "Spaced repetition app", "Formula sheets"],
    weakness: "Conceptual twists trip you. Spend one day a week on 'why' instead of 'what'." },
};

export default function BrainFingerprint() {
  const { user } = useAuth();
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const [saved, setSaved] = useState<{ profile_type: string; notes: string | null } | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("brain_fingerprints").select("profile_type, notes").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) { setSaved(data as any); setNotes(data.notes || ""); }
      });
  }, [user]);

  const pick = (v: string) => {
    const next = [...picks, v];
    setPicks(next);
    if (idx + 1 < QUESTIONS.length) setIdx(idx + 1);
  };

  const counts: Record<string, number> = {};
  picks.forEach(p => counts[p] = (counts[p] || 0) + 1);
  const result = picks.length === QUESTIONS.length
    ? Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0]
    : null;

  const reset = () => { setIdx(0); setPicks([]); };

  const save = async () => {
    if (!user || !result) return;
    const scores = ["visual","logical","pattern","formula"].reduce((acc, k) => ({ ...acc, [k]: counts[k] || 0 }), {});
    const { error } = await supabase.from("brain_fingerprints").upsert({
      user_id: user.id, profile_type: result, scores, notes,
    }, { onConflict: "user_id" });
    if (error) return toast.error(error.message);
    setSaved({ profile_type: result, notes });
    toast.success("🧠 Fingerprint saved");
  };

  const display = result || saved?.profile_type || null;
  const profile = display ? PROFILES[display] : null;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 max-w-2xl">
        <p className="font-mono text-xs tracking-widest text-orbit-purple mb-2">// BRAIN FINGERPRINT</p>
        <h1 className="font-display text-3xl mb-1 flex items-center gap-3"><Brain className="text-orbit-purple" />How do you think?</h1>
        <p className="text-muted-foreground mb-6">5 quick questions. We map your cognitive style and prescribe what fits.</p>

        {saved && !result && (
          <Card className="glass-card p-4 mb-6 border-orbit-purple/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">YOUR SAVED FINGERPRINT</p>
                <p className="font-display text-xl orbit-text">{PROFILES[saved.profile_type].title}</p>
              </div>
              <Button size="sm" variant="outline" onClick={reset}><RefreshCw className="h-3 w-3 mr-1" />Retake</Button>
            </div>
          </Card>
        )}

        {!result && !saved && (
          <Card className="glass-card p-6">
            <p className="text-xs tracking-widest text-muted-foreground mb-3">QUESTION {idx + 1}/{QUESTIONS.length}</p>
            <div className="h-1 bg-muted rounded-full overflow-hidden mb-5">
              <div className="h-full bg-gradient-to-r from-orbit-purple to-orbit-blue transition-all" style={{ width: `${((idx)/QUESTIONS.length)*100}%` }} />
            </div>
            <h2 className="font-display text-xl mb-5">{QUESTIONS[idx].q}</h2>
            <div className="grid gap-2">
              {QUESTIONS[idx].opts.map(o => (
                <Button key={o.v} variant="outline" className="justify-start h-auto py-3 text-left" onClick={() => pick(o.v)}>{o.t}</Button>
              ))}
            </div>
          </Card>
        )}

        {!result && idx > 0 && !saved && (
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => { setPicks(picks.slice(0,-1)); setIdx(idx-1); }}>← Previous</Button>
        )}

        {profile && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card p-8 text-center mb-4 border-orbit-purple/40">
              <Sparkles className="h-8 w-8 mx-auto text-orbit-purple mb-2" />
              <p className="font-mono text-xs text-orbit-orange mb-1">YOUR PROFILE</p>
              <h2 className="font-display text-3xl orbit-text mb-3">{profile.title}</h2>
              <p className="text-muted-foreground">{profile.desc}</p>
            </Card>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Card className="glass-card p-5">
                <p className="text-xs uppercase tracking-widest text-orbit-blue mb-2">Method</p>
                <p className="text-sm">{profile.method}</p>
              </Card>
              <Card className="glass-card p-5">
                <p className="text-xs uppercase tracking-widest text-destructive mb-2">Watch out</p>
                <p className="text-sm">{profile.weakness}</p>
              </Card>
            </div>

            <Card className="glass-card p-5 mb-4">
              <p className="text-xs uppercase tracking-widest text-orbit-orange mb-3">Your toolkit</p>
              <div className="flex flex-wrap gap-2">
                {profile.tools.map(t => (
                  <span key={t} className="px-3 py-1.5 rounded-full bg-gradient-to-r from-orbit-purple/20 to-orbit-blue/20 border border-orbit-purple/30 text-xs">{t}</span>
                ))}
              </div>
            </Card>

            <Card className="glass-card p-5 mb-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Personal space — your reflections</p>
              <Textarea rows={4} value={notes} maxLength={1000} onChange={(e) => setNotes(e.target.value)}
                placeholder="What clicked for you? What study patterns will you change?" />
            </Card>

            <div className="flex gap-2">
              <Button onClick={save} className="bg-gradient-to-r from-orbit-purple to-orbit-blue"><Save className="h-4 w-4 mr-2" />Save fingerprint</Button>
              <Button variant="outline" onClick={reset}><RefreshCw className="h-4 w-4 mr-2" />Retake</Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
