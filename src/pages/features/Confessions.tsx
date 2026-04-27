import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skull, Heart, Trash2, MessageCircle, Crown, Send, Ghost } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface C { id: string; content: string; votes: number; created_at: string; user_id: string; }
interface R { id: string; confession_id: string; content: string; created_at: string; user_id: string; }

export default function Confessions() {
  const { user, isAdmin } = useAuth();
  const [content, setContent] = useState("");
  const [list, setList] = useState<C[]>([]);
  const [replies, setReplies] = useState<Record<string, R[]>>({});
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [openReplies, setOpenReplies] = useState<Set<string>>(new Set());
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const load = async () => {
    const { data: cs } = await supabase
      .from("confessions_public")
      .select("*")
      .order("votes", { ascending: false })
      .limit(60);
    const all = (cs as C[]) || [];
    setList(all);

    if (all.length) {
      const ids = all.map(c => c.id);
      const { data: rs } = await supabase
        .from("confession_replies_public")
        .select("*")
        .in("confession_id", ids)
        .order("created_at", { ascending: true });
      const grouped: Record<string, R[]> = {};
      ((rs as R[]) || []).forEach(r => {
        (grouped[r.confession_id] ||= []).push(r);
      });
      setReplies(grouped);
    }

    if (user) {
      const { data: lk } = await supabase
        .from("confession_likes")
        .select("confession_id")
        .eq("user_id", user.id);
      setLikedIds(new Set((lk || []).map((x: any) => x.confession_id)));
    }
  };

  useEffect(() => { load(); }, [user]);

  const post = async () => {
    if (!user || !content.trim()) return;
    const { error } = await supabase.from("confessions").insert({ user_id: user.id, content });
    if (error) return toast.error(error.message);
    setContent("");
    toast.success("Whispered into the void.");
    load();
  };

  const toggleLike = async (c: C) => {
    if (!user) return;
    const liked = likedIds.has(c.id);
    if (liked) {
      await supabase.from("confession_likes").delete().eq("confession_id", c.id).eq("user_id", user.id);
      await supabase.from("confessions").update({ votes: Math.max(0, c.votes - 1) }).eq("id", c.id);
    } else {
      const { error } = await supabase.from("confession_likes").insert({ confession_id: c.id, user_id: user.id });
      if (error) return;
      await supabase.from("confessions").update({ votes: c.votes + 1 }).eq("id", c.id);
    }
    load();
  };

  const deleteConfession = async (c: C) => {
    if (!confirm("Bury this confession forever?")) return;
    const { error } = await supabase.from("confessions").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Confession laid to rest.");
    load();
  };

  const sendReply = async (cid: string) => {
    const text = (replyText[cid] || "").trim();
    if (!user || !text) return;
    const { error } = await supabase.from("confession_replies").insert({ confession_id: cid, user_id: user.id, content: text });
    if (error) return toast.error(error.message);
    setReplyText(p => ({ ...p, [cid]: "" }));
    load();
  };

  const deleteReply = async (rid: string) => {
    const { error } = await supabase.from("confession_replies").delete().eq("id", rid);
    if (error) return toast.error(error.message);
    load();
  };

  const toggleReplies = (id: string) => {
    setOpenReplies(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const top = useMemo(() => list[0], [list]);

  return (
    <div className="min-h-screen relative" style={{
      background: "radial-gradient(ellipse at top, hsl(0 80% 8% / 0.6), transparent 60%), radial-gradient(ellipse at bottom, hsl(280 60% 6% / 0.5), transparent 60%)",
    }}>
      <AppHeader />
      <main className="container py-10 max-w-2xl">
        <p className="font-mono text-xs tracking-widest text-destructive mb-2">// THE CRYPT</p>
        <h1 className="font-display text-4xl mb-1 flex items-center gap-3">
          <Skull className="text-destructive animate-pulse" />
          <span className="bg-gradient-to-r from-destructive via-orbit-purple to-destructive bg-clip-text text-transparent">Confession Crypt</span>
        </h1>
        <p className="text-muted-foreground mb-6 italic">"In the dark, no one knows your name. Only your truth."</p>

        {top && (
          <Card className="p-5 mb-6 border-2 border-destructive/60 relative overflow-hidden" style={{
            background: "linear-gradient(135deg, hsl(0 80% 8% / 0.8), hsl(280 50% 8% / 0.6))",
          }}>
            <div className="absolute top-2 right-2"><Crown className="h-5 w-5 text-orbit-orange animate-pulse" /></div>
            <p className="font-mono text-[10px] tracking-widest text-orbit-orange mb-2">CONFESSION OF THE DAY</p>
            <p className="text-base italic leading-relaxed">"{top.content}"</p>
            <p className="text-xs text-destructive mt-3">🩸 {top.votes} souls felt this</p>
          </Card>
        )}

        <Card className="p-5 mb-8 border-destructive/30" style={{ background: "hsl(0 30% 6% / 0.6)" }}>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={400}
            rows={3}
            className="bg-black/40 border-destructive/30"
            placeholder="Whisper your darkest study truth into the crypt…"
          />
          <Button onClick={post} className="mt-3 bg-gradient-to-r from-destructive to-orbit-purple" disabled={!content.trim()}>
            <Ghost className="h-4 w-4 mr-2" />Confess anonymously
          </Button>
        </Card>

        <div className="space-y-3">
          <AnimatePresence>
            {list.map((c) => {
              const mine = c.user_id === user?.id;
              const liked = likedIds.has(c.id);
              const cReplies = replies[c.id] || [];
              const open = openReplies.has(c.id);
              return (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Card className="p-4 border-destructive/20" style={{ background: "hsl(230 20% 5% / 0.7)" }}>
                    <p className="text-sm italic leading-relaxed">"{c.content}"</p>
                    <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                      <span className="text-[10px] text-muted-foreground font-mono">{new Date(c.created_at).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => toggleLike(c)}>
                          <Heart className={`h-3.5 w-3.5 mr-1 ${liked ? "fill-destructive text-destructive" : "text-destructive"}`} />
                          {c.votes}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => toggleReplies(c.id)}>
                          <MessageCircle className="h-3.5 w-3.5 mr-1" />{cReplies.length}
                        </Button>
                        {(mine || isAdmin) && (
                          <Button size="sm" variant="ghost" onClick={() => deleteConfession(c)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {open && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="mt-4 pl-3 border-l-2 border-destructive/30 space-y-2">
                            {cReplies.map(r => (
                              <div key={r.id} className="flex justify-between items-start gap-2 text-xs">
                                <p className="italic text-muted-foreground">"{r.content}"</p>
                                {(r.user_id === user?.id || isAdmin) && (
                                  <button onClick={() => deleteReply(r.id)} className="opacity-50 hover:opacity-100">
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <div className="flex gap-2 mt-2">
                              <Textarea
                                rows={1}
                                maxLength={250}
                                value={replyText[c.id] || ""}
                                onChange={(e) => setReplyText(p => ({ ...p, [c.id]: e.target.value }))}
                                placeholder="Reply anonymously…"
                                className="bg-black/40 text-xs min-h-0 py-2"
                              />
                              <Button size="sm" onClick={() => sendReply(c.id)} disabled={!(replyText[c.id] || "").trim()}>
                                <Send className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {list.length === 0 && <p className="text-center text-muted-foreground py-10 italic">The crypt is silent… be the first whisper.</p>}
        </div>
      </main>
    </div>
  );
}
