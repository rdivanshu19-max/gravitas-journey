import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function LastDay() {
  const [history, setHistory] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true); setPlan("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { mode: "last-day", prompt: history },
      });
      if (error) throw error;
      setPlan(data.text);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 max-w-3xl">
        <p className="font-mono text-xs tracking-widest text-destructive mb-2">// LAST 24 HOURS</p>
        <h1 className="font-display text-3xl mb-1 flex items-center gap-3"><Clock className="text-destructive" />War Room</h1>
        <p className="text-muted-foreground mb-8">Exam tomorrow? Drop your history. Get the only revision plan that matters.</p>

        <Card className="glass-card p-6 mb-6">
          <Textarea value={history} onChange={(e) => setHistory(e.target.value)} rows={5} maxLength={1500}
            placeholder="My weak topics: Electrostatics, Organic Chemistry, 3D Geometry. Mock score 175/300. Strong in Mechanics, Inorganic. 12 hours till JEE Mains shift 1." />
          <Button onClick={generate} disabled={loading || !history.trim()} className="mt-4 bg-gradient-to-r from-destructive to-orbit-orange">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "🚨 Build my war-room plan"}
          </Button>
        </Card>

        {plan && (
          <Card className="glass-card p-6 border-destructive/40">
            <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{plan}</ReactMarkdown></div>
          </Card>
        )}
      </main>
    </div>
  );
}
