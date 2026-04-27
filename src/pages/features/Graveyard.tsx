import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skull, Ghost, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Wrong {
  id: string;
  question: string;
  subject: string | null;
  buried_at: string;
  defeated: boolean;
  resurrected_at: string | null;
}

export default function Graveyard() {
  const { user } = useAuth();
  const [items, setItems] = useState<Wrong[]>([]);
  const [q, setQ] = useState("");
  const [s, setS] = useState("");

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("wrong_answers").select("*").eq("user_id", user.id).order("buried_at", { ascending: false });
    setItems((data as Wrong[]) || []);
  };
  useEffect(() => { load(); }, [user]);

  const bury = async () => {
    if (!user || !q.trim()) return;
    const { error } = await supabase.from("wrong_answers").insert({ user_id: user.id, question: q, subject: s || null });
    if (error) return toast.error(error.message);
    setQ(""); setS("");
    toast.success("☠️ Buried in the graveyard");
    load();
  };

  const defeat = async (id: string) => {
    await supabase.from("wrong_answers").update({ defeated: true, resurrected_at: new Date().toISOString() }).eq("id", id);
    toast.success("👻 Ghost defeated");
    load();
  };

  const isHaunted = (buried: string, defeated: boolean) =>
    !defeated && (Date.now() - new Date(buried).getTime()) > 7 * 86400000;

  // 7-day review schedule: distribute non-defeated questions across 7 buckets by buried date hash
  const schedule = useMemo(() => {
    const days: { date: Date; items: Wrong[] }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() + i);
      days.push({ date: d, items: [] });
    }
    items.filter(it => !it.defeated).forEach((it) => {
      // schedule = 7 days after buried, then weekly. Earliest revision shown today if overdue.
      const buried = new Date(it.buried_at).getTime();
      const due = buried + 7 * 86400000;
      const today = days[0].date.getTime();
      let bucket: number;
      if (due <= today) bucket = 0;
      else bucket = Math.min(6, Math.floor((due - today) / 86400000));
      days[bucket].items.push(it);
    });
    return days;
  }, [items]);

  const totalActive = items.filter(i => !i.defeated).length;
  const defeated = items.filter(i => i.defeated).length;
  const completionPct = items.length === 0 ? 0 : Math.round((defeated / items.length) * 100);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 max-w-4xl">
        <p className="font-mono text-xs tracking-widest text-destructive mb-2">// GRAVEYARD</p>
        <h1 className="font-display text-3xl mb-1 flex items-center gap-3"><Skull className="text-destructive" />Wrong Answer Graveyard</h1>
        <p className="text-muted-foreground mb-6">Bury wrongs. Ghosts return in 7 days. Defeat them or be haunted.</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="glass-card p-4 text-center"><p className="text-xs text-muted-foreground">BURIED</p><p className="font-display text-2xl">{items.length}</p></Card>
          <Card className="glass-card p-4 text-center"><p className="text-xs text-muted-foreground">HAUNTING</p><p className="font-display text-2xl text-destructive">{totalActive}</p></Card>
          <Card className="glass-card p-4 text-center"><p className="text-xs text-muted-foreground">DEFEATED</p><p className="font-display text-2xl text-orbit-blue">{defeated}</p></Card>
        </div>

        <Card className="glass-card p-4 mb-6">
          <div className="flex items-center justify-between mb-2 text-xs"><span className="text-muted-foreground">CONQUEST PROGRESS</span><span>{completionPct}%</span></div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-destructive via-orbit-orange to-orbit-blue" style={{ width: `${completionPct}%` }} />
          </div>
        </Card>

        <Card className="glass-card p-6 mb-8">
          <h2 className="font-display text-lg mb-4">Bury a new mistake</h2>
          <div className="space-y-3">
            <div>
              <Label>The question that haunted you</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Integration of x·sin(x)" maxLength={300} />
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={s} onChange={(e) => setS(e.target.value)} placeholder="Physics / Chemistry / Math / Bio" maxLength={40} />
            </div>
            <Button onClick={bury} className="bg-gradient-to-r from-destructive to-orbit-orange">⚰️ Bury it</Button>
          </div>
        </Card>

        {/* 7-DAY REVIEW CALENDAR */}
        <h2 className="font-display text-xl mb-3 flex items-center gap-2"><Calendar className="h-5 w-5 text-orbit-blue" />Next 7 days · Ghost review</h2>
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 mb-8">
          {schedule.map((d, i) => (
            <Card key={i} className="glass-card p-3 min-h-[110px]">
              <p className="text-[10px] tracking-widest text-muted-foreground">{d.date.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase()}</p>
              <p className="font-display text-lg">{d.date.getDate()}</p>
              {d.items.length === 0 ? (
                <p className="text-[10px] text-muted-foreground mt-2 italic">Calm.</p>
              ) : (
                <div className="mt-1">
                  <p className="text-xs font-medium text-destructive">{d.items.length} ghost{d.items.length>1?"s":""}</p>
                  <p className="text-[10px] text-muted-foreground">{i === 0 ? "Review today" : `In ${i}d`}</p>
                </div>
              )}
            </Card>
          ))}
        </div>

        <h2 className="font-display text-xl mb-3">Your tombs</h2>
        <div className="space-y-3">
          {items.length === 0 && <p className="text-center text-muted-foreground py-10">The graveyard is silent… for now.</p>}
          {items.map((it) => {
            const haunted = isHaunted(it.buried_at, it.defeated);
            return (
              <motion.div key={it.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <Card className={`glass-card p-4 flex justify-between items-center gap-4 ${haunted ? "border-destructive animate-pulse" : ""} ${it.defeated ? "opacity-60" : ""}`}>
                  <div className="flex-1">
                    <p className="font-medium">{haunted && <Ghost className="inline h-4 w-4 text-destructive mr-2" />}{it.question}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {it.subject || "Unknown"} · buried {new Date(it.buried_at).toLocaleDateString()}
                      {it.defeated && " · ✅ defeated"}
                      {haunted && " · 👻 HAUNTING YOU"}
                    </p>
                  </div>
                  {!it.defeated && (
                    <Button size="sm" variant="outline" onClick={() => defeat(it.id)}>
                      <CheckCircle2 className="h-3 w-3 mr-1" />Defeat
                    </Button>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
