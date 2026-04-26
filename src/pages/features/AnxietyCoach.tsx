import { useState, useRef, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Msg { role: "user" | "assistant"; content: string; }

export default function AnxietyCoach() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "I'm here. Tell me what's heavy right now — the exam, a topic, comparisons, anything. No judgment." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: input };
    const next = [...messages, userMsg];
    setMessages(next); setInput(""); setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { mode: "anxiety-coach", messages: next },
      });
      if (error) throw error;
      setMessages([...next, { role: "assistant", content: data.text }]);
    } catch (e: any) {
      toast.error(e.message || "The coach is taking a breath…");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 max-w-2xl">
        <p className="font-mono text-xs tracking-widest text-orbit-blue mb-2">// ANXIETY COACH</p>
        <h1 className="font-display text-3xl mb-1 flex items-center gap-3"><Heart className="text-orbit-blue" />A safe room</h1>
        <p className="text-muted-foreground mb-6">An AI trained to listen, breathe with you, and pull you back to centre.</p>

        <Card className="glass-card p-4 h-[60vh] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${m.role === "user" ? "ml-auto bg-primary/20 border border-primary/30" : "bg-muted/40 border border-border"}`}>
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            ))}
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <div ref={endRef} />
          </div>
          <div className="flex gap-2 mt-3 pt-3 border-t border-border">
            <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="What's on your mind?" disabled={loading} maxLength={500} />
            <Button onClick={send} disabled={loading} size="icon"><Send className="h-4 w-4" /></Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
