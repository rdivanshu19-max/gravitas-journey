import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function RankPredictor() {
  const [scores, setScores] = useState("");
  const [strong, setStrong] = useState("");
  const [weak, setWeak] = useState("");
  const [hours, setHours] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

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
        <h1 className="font-display text-3xl mb-1 flex items-center gap-3"><TrendingUp className="text-orbit-purple" />Predict Your JEE Rank</h1>
        <p className="text-muted-foreground mb-8">Drop your numbers. Get a rank range, confidence and exactly what to fix.</p>

        <Card className="glass-card p-6 space-y-4 mb-6">
          <div>
            <Label>Recent mock scores (comma separated, /300)</Label>
            <Input value={scores} onChange={(e) => setScores(e.target.value)} placeholder="180, 195, 175, 210" />
          </div>
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
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "🚀 Predict my rank"}
          </Button>
        </Card>

        {result && (
          <Card className="glass-card p-6">
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
