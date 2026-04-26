import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skull, Ghost } from "lucide-react";
import { toast } from "sonner";

interface Wrong {
  id: string;
  question: string;
  subject: string | null;
  buried_at: string;
  defeated: boolean;
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
    await supabase.from("wrong_answers").update({ defeated: true }).eq("id", id);
    toast.success("👻 Ghost defeated");
    load();
  };

  const isHaunted = (buried: string, defeated: boolean) =>
    !defeated && (Date.now() - new Date(buried).getTime()) > 7 * 86400000;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 max-w-3xl">
        <p className="font-mono text-xs tracking-widest text-destructive mb-2">// GRAVEYARD</p>
        <h1 className="font-display text-3xl mb-1 flex items-center gap-3"><Skull className="text-destructive" />Wrong Answer Graveyard</h1>
        <p className="text-muted-foreground mb-8">Bury wrong questions. They return as ghosts in 7 days. Defeat them.</p>

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

        <div className="space-y-3">
          {items.length === 0 && <p className="text-center text-muted-foreground py-10">The graveyard is silent… for now.</p>}
          {items.map((it) => {
            const haunted = isHaunted(it.buried_at, it.defeated);
            return (
              <Card key={it.id} className={`glass-card p-4 flex justify-between items-center gap-4 ${haunted ? "border-destructive animate-pulse" : ""} ${it.defeated ? "opacity-50" : ""}`}>
                <div className="flex-1">
                  <p className="font-medium">{haunted && <Ghost className="inline h-4 w-4 text-destructive mr-2" />}{it.question}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {it.subject || "Unknown"} · buried {new Date(it.buried_at).toLocaleDateString()}
                    {it.defeated && " · ✅ defeated"}
                    {haunted && " · 👻 HAUNTING YOU"}
                  </p>
                </div>
                {!it.defeated && (
                  <Button size="sm" variant="outline" onClick={() => defeat(it.id)}>Defeat</Button>
                )}
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
