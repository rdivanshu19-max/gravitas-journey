import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";

interface Capsule { id: string; message: string; unlock_date: string; unlocked: boolean; created_at: string; }

export default function TimeCapsule() {
  const { user } = useAuth();
  const [msg, setMsg] = useState("");
  const [date, setDate] = useState("");
  const [list, setList] = useState<Capsule[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("time_capsules").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setList((data as Capsule[]) || []);
  };
  useEffect(() => { load(); }, [user]);

  const seal = async () => {
    if (!user || !msg || !date) return;
    const { error } = await supabase.from("time_capsules").insert({ user_id: user.id, message: msg, unlock_date: date });
    if (error) return toast.error(error.message);
    setMsg(""); setDate("");
    toast.success("🔒 Capsule sealed");
    load();
  };

  const isUnlockable = (d: string) => new Date(d) <= new Date();

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 max-w-2xl">
        <p className="font-mono text-xs tracking-widest text-orbit-orange mb-2">// TIME CAPSULE</p>
        <h1 className="font-display text-3xl mb-1 flex items-center gap-3"><Mic className="text-orbit-orange" />Message your future self</h1>
        <p className="text-muted-foreground mb-6">Write a message. We seal it. Future you opens it on the date you choose.</p>

        <Card className="glass-card p-5 mb-8">
          <div className="space-y-3">
            <div>
              <Label>Your message to future you</Label>
              <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={5} maxLength={1000} placeholder="Dear future me, today I scored 78. I promise…" />
            </div>
            <div>
              <Label>Unlock date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <Button onClick={seal} className="bg-gradient-to-r from-orbit-orange to-orbit-purple"><Lock className="h-4 w-4 mr-2" />Seal capsule</Button>
          </div>
        </Card>

        <div className="space-y-3">
          {list.map((c) => {
            const open = isUnlockable(c.unlock_date);
            return (
              <Card key={c.id} className={`glass-card p-5 ${!open && "opacity-70"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {open ? <Unlock className="h-4 w-4 text-orbit-orange" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-xs text-muted-foreground">Unlocks {new Date(c.unlock_date).toLocaleDateString()}</span>
                </div>
                {open ? <p className="text-sm whitespace-pre-wrap">{c.message}</p> : <p className="text-sm italic text-muted-foreground">🔒 Sealed until unlock date</p>}
              </Card>
            );
          })}
          {list.length === 0 && <p className="text-center text-muted-foreground py-10">No capsules yet.</p>}
        </div>
      </main>
    </div>
  );
}
