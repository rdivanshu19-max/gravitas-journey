import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Lock, Unlock, Trash2, Sparkles, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Capsule { id: string; message: string; unlock_date: string; unlocked: boolean; created_at: string; }

const PRESETS = [
  { label: "Day before exam", days: 0, computeFromExam: true },
  { label: "1 week", days: 7 },
  { label: "1 month", days: 30 },
  { label: "3 months", days: 90 },
  { label: "Result day", days: 120 },
];

export default function TimeCapsule() {
  const { user } = useAuth();
  const [msg, setMsg] = useState("");
  const [date, setDate] = useState("");
  const [list, setList] = useState<Capsule[]>([]);
  const [examDate, setExamDate] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("time_capsules").select("*").eq("user_id", user.id).order("unlock_date", { ascending: true });
    setList((data as Capsule[]) || []);
    const { data: ob } = await supabase.from("onboarding_responses").select("exam_date").eq("user_id", user.id).maybeSingle();
    setExamDate(ob?.exam_date || null);
  };
  useEffect(() => { load(); }, [user]);

  const seal = async () => {
    if (!user || !msg.trim() || !date) return toast.error("Write something + pick a date");
    const { error } = await supabase.from("time_capsules").insert({ user_id: user.id, message: msg, unlock_date: date });
    if (error) return toast.error(error.message);
    setMsg(""); setDate("");
    toast.success("🔒 Capsule sealed in time");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Destroy this capsule? This cannot be undone.")) return;
    const { error } = await supabase.from("time_capsules").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Capsule destroyed");
    load();
  };

  const setPreset = (days: number, fromExam = false) => {
    const base = fromExam && examDate ? new Date(examDate) : new Date();
    base.setDate(base.getDate() + (fromExam ? -1 : days));
    setDate(base.toISOString().slice(0, 10));
  };

  const isUnlockable = (d: string) => new Date(d) <= new Date();
  const daysUntil = (d: string) => Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / 86400000));

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 max-w-2xl">
        <p className="font-mono text-xs tracking-widest text-orbit-orange mb-2">// TIME CAPSULES</p>
        <h1 className="font-display text-3xl mb-1 flex items-center gap-3"><Mic className="text-orbit-orange" />Messages to your future self</h1>
        <p className="text-muted-foreground mb-6">Seal as many as you want. We deliver each one on its unlock date.</p>

        <Card className="glass-card p-5 mb-8">
          <div className="space-y-3">
            <div>
              <Label>Your message</Label>
              <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={5} maxLength={1500} placeholder="Dear future me, today I scored 78. By the time you read this…" />
              <p className="text-[10px] text-muted-foreground mt-1">{msg.length}/1500</p>
            </div>
            <div>
              <Label>Unlock date</Label>
              <Input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} />
              <div className="flex flex-wrap gap-2 mt-2">
                {PRESETS.map(p => (
                  <Button key={p.label} type="button" size="sm" variant="outline"
                    disabled={p.computeFromExam && !examDate}
                    onClick={() => setPreset(p.days, p.computeFromExam)}>
                    <Sparkles className="h-3 w-3 mr-1" />{p.label}
                  </Button>
                ))}
              </div>
            </div>
            <Button onClick={seal} className="bg-gradient-to-r from-orbit-orange to-orbit-purple"><Lock className="h-4 w-4 mr-2" />Seal capsule</Button>
          </div>
        </Card>

        <h2 className="font-display text-lg mb-3">Your capsules ({list.length})</h2>
        <div className="space-y-3">
          <AnimatePresence>
            {list.map((c) => {
              const open = isUnlockable(c.unlock_date);
              const left = daysUntil(c.unlock_date);
              return (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <Card className={`glass-card p-5 ${!open ? "opacity-90" : "border-orbit-orange/50"}`}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {open ? <Unlock className="h-4 w-4 text-orbit-orange" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                        <span className="text-xs text-muted-foreground">
                          {open ? "Unlocked" : `Unlocks in ${left}d`} · {new Date(c.unlock_date).toLocaleDateString()}
                        </span>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => remove(c.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    {!open && (
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-gradient-to-r from-orbit-orange to-orbit-purple"
                          style={{ width: `${Math.max(5, 100 - (left / Math.max(1, daysUntil(c.created_at) || left + 30)) * 100)}%` }} />
                      </div>
                    )}
                    {open ? (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{c.message}</p>
                    ) : (
                      <p className="text-sm italic text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />Sealed. Future you knows what's inside.
                      </p>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {list.length === 0 && <p className="text-center text-muted-foreground py-10">No capsules yet. Plant your first message.</p>}
        </div>
      </main>
    </div>
  );
}
