import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Flame, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function StudyRoast() {
  const [input, setInput] = useState("");
  const [roast, setRoast] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setRoast("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          mode: "roast",
          prompt: input,
        },
      });
      if (error) throw error;
      setRoast(data.text || "The AI was speechless.");
    } catch (e: any) {
      toast.error(e.message || "Roast failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 max-w-3xl">
        <p className="font-mono text-xs tracking-widest text-destructive mb-2">// STUDY ROAST</p>
        <h1 className="font-display text-3xl mb-1 flex items-center gap-3"><Flame className="text-orbit-orange" />Get Roasted</h1>
        <p className="text-muted-foreground mb-8">Tell me your study schedule and scores. I will be brutal. And funny. Mostly brutal.</p>

        <Card className="glass-card p-6 mb-6">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={1500}
            rows={6}
            placeholder="e.g. I study 4 hours a day, mostly Instagram. Last mock: 78/300. Watching lectures since March but haven't solved a single question…"
          />
          <Button onClick={generate} disabled={loading || !input.trim()} className="mt-4 bg-gradient-to-r from-destructive to-orbit-orange">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "🔥 Roast me"}
          </Button>
        </Card>

        {roast && (
          <Card className="glass-card p-6 border-destructive/40">
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{roast}</ReactMarkdown>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                navigator.clipboard.writeText(roast);
                toast.success("Copied — share it on Instagram");
              }}
            >
              <Share2 className="h-3 w-3 mr-1" />Copy roast
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}
