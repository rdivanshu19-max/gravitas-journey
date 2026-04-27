import { useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, Loader2, Trophy, Target, Zap } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

export default function RankPredictor() {
  const [scores, setScores] = useState("");
  const [strong, setStrong] = useState("");
  const [weak, setWeak] = useState("");
  const [hours, setHours] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    const arr = scores.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (!arr.length) return null;
    const avg = Math.round(arr.reduce((a,b)=>a+b,0)/arr.length);
    const best = Math.max(...arr);
    const worst = Math.min(...arr);
    const trend = arr.length >= 2 ? arr[arr.length-1] - arr[0] : 0;
    return { avg, best, worst, trend, count: arr.length };
  }, [scores]);

  const predict = async () => {
    setLoading(true); setResult("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          mode: "rank-predictor",
          prompt: `Mock scores (out of 300): ${scores}\nStrong chapters: ${strong}\nWeak chapters: ${weak}\nStudy hours/day: ${hours}`,
        },
      });
      if (error) throw error;
      setResult(data.text || "");
    } catch (e: any) {
      toast.error(e.message || "Prediction failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 max-w-3xl">
        <p className="font-mono text-xs tracking-widest text-orbit-purple mb-2">// RANK PREDICTOR 2.0</p>
        <h1 className="font-display text-4xl mb-1 flex items-center gap-3">
          <TrendingUp className="text-orbit-purple" />
          <span className="bg-gradient-to-r from-orbit-purple to-orbit-blue bg-clip-text text-transparent">Predict Your Rank</span>
        </h1>
        <p className="text-muted-foreground mb-8">Drop your numbers. Get a rank range, confidence and the 3 fixes that unlock the next tier.</p>

        <Card className="glass-card p-6 space-y-4 mb-6">
          <div>
            <Label>Recent mock scores (comma separated, /300)</Label>
            <Input value={scores} onChange={(e) => setScores(e.target.value)} placeholder="180, 195, 175, 210" />
          </div>
          {stats && (
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-lg bg-muted/40"><p className="text-[10px] text-muted-foreground">AVG</p><p className="font-display text-lg">{stats.avg}</p></div>
              <div className="p-2 rounded-lg bg-muted/40"><p className="text-[10px] text-muted-foreground">BEST</p><p className="font-display text-lg text-orbit-blue">{stats.best}</p></div>
              <div className="p-2 rounded-lg bg-muted/40"><p className="text-[10px] text-muted-foreground">WORST</p><p className="font-display text-lg text-destructive">{stats.worst}</p></div>
              <div className="p-2 rounded-lg bg-muted/40"><p className="text-[10px] text-muted-foreground">TREND</p><p className={`font-display text-lg ${stats.trend>=0?"text-orbit-blue":"text-destructive"}`}>{stats.trend>0?"+":""}{stats.trend}</p></div>
            </div>
          )}
          <div>
            <Label>Strong chapters</Label>
            <Textarea value={strong} onChange={(e) => setStrong(e.target.value)} rows={2} placeholder="Mechanics, Coordination Compounds, Calculus…" />
          </div>
          <div>
            <Label>Weak chapters</Label>
            <Textarea value={weak} onChange={(e) => setWeak(e.target.value)} rows={2} placeholder="Electrostatics, Organic, 3D Geometry…" />
          </div>
          <div>
            <Label>Hours studied per day</Label>
            <Input type="number" value={hours} onChange={(e) => setHours(e.target.value)} />
          </div>
          <Button onClick={predict} disabled={loading || !scores} className="bg-gradient-to-r from-orbit-purple to-orbit-blue">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Zap className="h-4 w-4 mr-2" />Predict my rank</>}
          </Button>
        </Card>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-8 relative overflow-hidden border-orbit-purple/40" style={{
              background: "linear-gradient(135deg, hsl(230 35% 4%) 0%, hsl(280 40% 8%) 50%, hsl(222 50% 8%) 100%)",
            }}>
              <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full opacity-30" style={{ background: "radial-gradient(circle, hsl(var(--orbit-purple)), transparent)" }} />
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full opacity-20" style={{ background: "radial-gradient(circle, hsl(var(--orbit-blue)), transparent)" }} />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orbit-purple to-orbit-blue grid place-items-center">
                    <Trophy className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.3em] text-orbit-orange">PREDICTION COMPLETE</p>
                    <p className="font-display text-lg">Your rank trajectory</p>
                  </div>
                </div>
                <div className="prose prose-invert prose-sm max-w-none
                  prose-headings:font-display prose-headings:orbit-text
                  prose-strong:text-orbit-orange
                  prose-li:text-foreground/90">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
                <div className="mt-6 pt-4 border-t border-orbit-purple/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Target className="h-3 w-3" />Powered by GRAVITAS AI</div>
                  <p className="font-display text-sm orbit-text">GRAVITAS</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
