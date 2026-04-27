import { useRef, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Flame, Loader2, Share2, Download, Skull, Heart, Drama, MessageCircle, Instagram } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { toPng } from "html-to-image";
import { motion } from "framer-motion";

const PERSONAS = [
  { id: "akash", label: "Akash Sir Mode", icon: Flame, color: "from-destructive to-orbit-orange",
    suffix: "Roast in the style of a strict but loving Indian coaching teacher." },
  { id: "savage", label: "Savage Mom", icon: Skull, color: "from-orbit-purple to-destructive",
    suffix: "Roast like a brutally honest Indian mom who saw the report card." },
  { id: "drama", label: "Bollywood Drama", icon: Drama, color: "from-orbit-orange to-orbit-purple",
    suffix: "Roast with pure Bollywood drama, dialogues and over-the-top emotions." },
  { id: "soft", label: "Gentle Roast", icon: Heart, color: "from-orbit-blue to-orbit-purple",
    suffix: "Be playful and gentle but still honest. Suitable for a fragile day." },
];

export default function StudyRoast() {
  const [input, setInput] = useState("");
  const [roast, setRoast] = useState("");
  const [persona, setPersona] = useState(PERSONAS[0]);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true); setRoast("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { mode: "roast", prompt: `${input}\n\nStyle: ${persona.suffix}` },
      });
      if (error) throw error;
      setRoast(data.text || "The AI was speechless.");
    } catch (e: any) {
      toast.error(e.message || "Roast failed");
    } finally { setLoading(false); }
  };

  const buildPng = async () => {
    if (!cardRef.current) return null;
    return await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: "#0a0a14" });
  };

  const exportImage = async () => {
    try {
      const dataUrl = await buildPng();
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.download = `gravitas-roast-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Saved! Now post it on Instagram 🔥");
    } catch { toast.error("Export failed"); }
  };

  const shareWhatsApp = async () => {
    try {
      const dataUrl = await buildPng();
      if (!dataUrl) return;
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "gravitas-roast.png", { type: "image/png" });
      const text = `Just got roasted by GRAVITAS 🔥\n\n"${roast.slice(0, 140)}..."\n\nTry it: gravitas.app`;
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text, title: "GRAVITAS Roast" });
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
        await exportImage();
        toast.info("Image saved — attach it in WhatsApp");
      }
    } catch { toast.error("Share failed"); }
  };

  const shareInstagram = async () => {
    try {
      const dataUrl = await buildPng();
      if (!dataUrl) return;
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "gravitas-roast.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "GRAVITAS Roast" });
      } else {
        await exportImage();
        toast.info("Image saved! Open Instagram → Story → upload from gallery 📸");
      }
    } catch { toast.error("Share failed"); }
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 max-w-3xl">
        <p className="font-mono text-xs tracking-widest text-destructive mb-2">// ROAST CHAMBER</p>
        <h1 className="font-display text-4xl mb-1 flex items-center gap-3">
          <Flame className="text-orbit-orange animate-pulse" />
          <span className="bg-gradient-to-r from-orbit-orange to-destructive bg-clip-text text-transparent">Get Roasted</span>
        </h1>
        <p className="text-muted-foreground mb-6">Pick your flavor of pain. Drop your stats. Brace yourself.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {PERSONAS.map(p => (
            <button key={p.id} onClick={() => setPersona(p)}
              className={`p-3 rounded-lg border text-left transition-all ${persona.id === p.id
                ? `bg-gradient-to-br ${p.color} text-primary-foreground border-transparent shadow-lg`
                : "border-border hover:border-primary/50"}`}>
              <p.icon className="h-4 w-4 mb-1" />
              <p className="text-xs font-medium">{p.label}</p>
            </button>
          ))}
        </div>

        <Card className="glass-card p-6 mb-6">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={1500}
            rows={6}
            placeholder="e.g. I study 4 hours a day, mostly Instagram. Last mock: 78/300. Watching lectures since March but haven't solved a single question…"
          />
          <Button onClick={generate} disabled={loading || !input.trim()} className={`mt-4 bg-gradient-to-r ${persona.color}`}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Flame className="h-4 w-4 mr-2" />Roast me</>}
          </Button>
        </Card>

        {roast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div ref={cardRef} className="p-8 rounded-2xl border border-destructive/40 relative overflow-hidden" style={{
              background: "linear-gradient(135deg, hsl(230 35% 4%) 0%, hsl(0 50% 8%) 50%, hsl(280 40% 8%) 100%)",
            }}>
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full opacity-30" style={{ background: "radial-gradient(circle, hsl(var(--destructive)), transparent)" }} />
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full opacity-20" style={{ background: "radial-gradient(circle, hsl(var(--orbit-orange)), transparent)" }} />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-mono text-[10px] tracking-[0.3em] text-orbit-orange">// GRAVITAS ROAST</p>
                  <p className="font-display text-xs text-muted-foreground">{persona.label}</p>
                </div>
                <div className="prose prose-invert prose-sm max-w-none text-white [&_p]:text-white/95 [&_strong]:text-orbit-orange [&_li]:text-white/90">
                  <ReactMarkdown>{roast}</ReactMarkdown>
                </div>
                <div className="mt-6 pt-4 border-t border-destructive/20 flex items-center justify-between">
                  <p className="font-display text-sm orbit-text">GRAVITAS</p>
                  <p className="font-mono text-[10px] text-muted-foreground">gravitas.app</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              <Button size="sm" onClick={exportImage} className="bg-gradient-to-r from-orbit-purple to-orbit-blue">
                <Download className="h-3 w-3 mr-1" />Save PNG card
              </Button>
              <Button size="sm" onClick={shareWhatsApp} className="bg-[#25D366] hover:bg-[#20bd5a] text-white">
                <MessageCircle className="h-3 w-3 mr-1" />WhatsApp
              </Button>
              <Button size="sm" onClick={shareInstagram} className="bg-gradient-to-r from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white">
                <Instagram className="h-3 w-3 mr-1" />Instagram Story
              </Button>
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(roast); toast.success("Copied"); }}>
                <Share2 className="h-3 w-3 mr-1" />Copy text
              </Button>
              <Button variant="outline" size="sm" onClick={generate} disabled={loading}>
                <Flame className="h-3 w-3 mr-1" />Roast again
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
