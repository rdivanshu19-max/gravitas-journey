import { useEffect, useRef, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Play, Square, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function SilenceScore() {
  const { user } = useAuth();
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distractions, setDistractions] = useState(0);
  const [history, setHistory] = useState<{ silence_score: number; created_at: string }[]>([]);
  const startTime = useRef<number>(0);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("focus_sessions").select("silence_score,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
    setHistory(data || []);
  };
  useEffect(() => { load(); }, [user]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    const onHide = () => {
      if (document.hidden) {
        setDistractions((d) => d + 1);
        toast.warning("👀 Distraction detected. Silence broken.");
      }
    };
    document.addEventListener("visibilitychange", onHide);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", onHide); };
  }, [running]);

  const start = () => {
    setSeconds(0); setDistractions(0); setRunning(true); startTime.current = Date.now();
    toast.success("🎯 Focus session started. Stay in the app.");
  };

  const stop = async () => {
    setRunning(false);
    const minutes = Math.max(1, Math.round(seconds / 60));
    const score = Math.max(0, Math.min(100, 100 - distractions * 15));
    if (user) {
      await supabase.from("focus_sessions").insert({
        user_id: user.id, duration_minutes: minutes, distractions, silence_score: score,
      });
    }
    toast.success(`Silence Score: ${score}/100`);
    load();
  };

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 max-w-2xl">
        <p className="font-mono text-xs tracking-widest text-orbit-purple mb-2">// SILENCE SCORE</p>
        <h1 className="font-display text-3xl mb-1 flex items-center gap-3"><Activity className="text-orbit-purple" />Focus Session</h1>
        <p className="text-muted-foreground mb-8">Stay in this tab. Switch apps and we count it. Daily score. Real accountability.</p>

        <Card className="glass-card p-10 text-center mb-6">
          <p className="font-display text-7xl mb-4">{fmt(seconds)}</p>
          <p className="text-xs tracking-widest text-muted-foreground mb-6">DISTRACTIONS · {distractions}</p>
          {!running ? (
            <Button size="lg" onClick={start} className="bg-gradient-to-r from-orbit-blue to-orbit-purple"><Play className="h-4 w-4 mr-2" />Start Session</Button>
          ) : (
            <Button size="lg" variant="destructive" onClick={stop}><Square className="h-4 w-4 mr-2" />End Session</Button>
          )}
          {running && (
            <p className="mt-6 flex items-center justify-center gap-2 text-xs text-orbit-orange"><AlertTriangle className="h-3 w-3" />Don't switch tabs. Don't minimize. Just study.</p>
          )}
        </Card>

        <Card className="glass-card p-6">
          <h2 className="font-display text-lg mb-3">Recent sessions</h2>
          {history.length === 0 && <p className="text-sm text-muted-foreground">No sessions yet.</p>}
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{new Date(h.created_at).toLocaleString()}</span>
                <span className="font-display">{h.silence_score}/100</span>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
