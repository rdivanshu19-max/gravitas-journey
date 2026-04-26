import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquareWarning, Heart } from "lucide-react";
import { toast } from "sonner";

interface C { id: string; content: string; votes: number; created_at: string; }

export default function Confessions() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [list, setList] = useState<C[]>([]);

  const load = async () => {
    const { data } = await supabase.from("confessions_public").select("*").order("votes", { ascending: false }).limit(50);
    setList((data as C[]) || []);
  };
  useEffect(() => { load(); }, []);

  const post = async () => {
    if (!user || !content.trim()) return;
    const { error } = await supabase.from("confessions").insert({ user_id: user.id, content });
    if (error) return toast.error(error.message);
    setContent("");
    toast.success("Confessed. Anonymously.");
    load();
  };

  const vote = async (id: string, current: number) => {
    await supabase.from("confessions").update({ votes: current + 1 }).eq("id", id);
    load();
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 max-w-2xl">
        <p className="font-mono text-xs tracking-widest text-orbit-blue mb-2">// CONFESSION BOX</p>
        <h1 className="font-display text-3xl mb-1 flex items-center gap-3"><MessageSquareWarning className="text-orbit-blue" />Confess. Anonymously.</h1>
        <p className="text-muted-foreground mb-6">No names. No shame. Just solidarity.</p>

        <Card className="glass-card p-5 mb-6">
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} maxLength={400} rows={3} placeholder="I haven't opened Physics in 3 weeks…" />
          <Button onClick={post} className="mt-3" disabled={!content.trim()}>Confess anonymously</Button>
        </Card>

        <div className="space-y-3">
          {list.map((c) => (
            <Card key={c.id} className="glass-card p-4">
              <p className="text-sm">{c.content}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                <Button size="sm" variant="ghost" onClick={() => vote(c.id, c.votes)}>
                  <Heart className="h-3 w-3 mr-1 text-destructive" />{c.votes}
                </Button>
              </div>
            </Card>
          ))}
          {list.length === 0 && <p className="text-center text-muted-foreground py-10">Be the first to confess.</p>}
        </div>
      </main>
    </div>
  );
}
