import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, AlertTriangle, Skull, Flame, Brain, MessageSquareWarning, Mic, Activity, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface Journey {
  buried: number; defeated: number;
  silenceAvg: number; sessions: number;
  confessions: number; capsules: number;
  mocks: number; bestMock: number | null;
  joinedAt: string | null; brainType: string | null;
}

export default function Account() {
  const { profile, user, signOut } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [j, setJ] = useState<Journey | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [wa, fs, cf, tc, ms, bf, pr] = await Promise.all([
        supabase.from("wrong_answers").select("defeated").eq("user_id", user.id),
        supabase.from("focus_sessions").select("silence_score").eq("user_id", user.id),
        supabase.from("confessions").select("id").eq("user_id", user.id),
        supabase.from("time_capsules").select("id").eq("user_id", user.id),
        supabase.from("mock_scores").select("total").eq("user_id", user.id),
        supabase.from("brain_fingerprints").select("profile_type").eq("user_id", user.id).maybeSingle(),
        supabase.from("profiles").select("created_at").eq("id", user.id).maybeSingle(),
      ]);
      const sessions = fs.data || [];
      setJ({
        buried: wa.data?.length || 0,
        defeated: wa.data?.filter((x: any) => x.defeated).length || 0,
        silenceAvg: sessions.length ? Math.round(sessions.reduce((a: number, b: any) => a + b.silence_score, 0) / sessions.length) : 0,
        sessions: sessions.length,
        confessions: cf.data?.length || 0,
        capsules: tc.data?.length || 0,
        mocks: ms.data?.length || 0,
        bestMock: ms.data?.length ? Math.max(...ms.data.map((x: any) => x.total || 0)) : null,
        joinedAt: pr.data?.created_at || null,
        brainType: bf.data?.profile_type || null,
      });
    })();
  }, [user]);

  const deleteAccount = async () => {
    if (!confirm("⚠️ This permanently deletes your account, all data, and your obituary. You CAN sign up again with this email later. Continue?")) return;
    setBusy(true);
    const { error } = await supabase.rpc("delete_own_account");
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Your journey has been sealed. Farewell.");
    await signOut();
    nav("/");
  };

  const days = j?.joinedAt ? Math.max(1, Math.floor((Date.now() - new Date(j.joinedAt).getTime()) / 86400000)) : 0;

  const stats = [
    { icon: Skull, label: "Mistakes buried", value: j?.buried ?? 0, color: "text-destructive" },
    { icon: Flame, label: "Ghosts defeated", value: j?.defeated ?? 0, color: "text-orbit-orange" },
    { icon: Activity, label: "Focus sessions", value: j?.sessions ?? 0, color: "text-orbit-blue" },
    { icon: TrendingUp, label: "Avg silence score", value: `${j?.silenceAvg ?? 0}%`, color: "text-orbit-purple" },
    { icon: MessageSquareWarning, label: "Confessions made", value: j?.confessions ?? 0, color: "text-orbit-blue" },
    { icon: Mic, label: "Time capsules", value: j?.capsules ?? 0, color: "text-orbit-orange" },
  ];

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 max-w-3xl">
        <h1 className="font-display text-3xl mb-1 orbit-text">Your Journey</h1>
        <p className="text-muted-foreground mb-6">{days} day{days!==1?"s":""} on GRAVITAS · every step, recorded.</p>

        <Card className="glass-card p-6 mb-6">
          <h2 className="font-display text-lg mb-4">Profile</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {profile?.display_name}</p>
            <p><span className="text-muted-foreground">Email:</span> {user?.email}</p>
            {j?.brainType && <p><span className="text-muted-foreground">Brain type:</span> <span className="orbit-text font-medium">{j.brainType}</span></p>}
            {j?.bestMock !== null && j?.bestMock !== undefined && <p><span className="text-muted-foreground">Best mock:</span> {j.bestMock}/300</p>}
          </div>
        </Card>

        <h2 className="font-display text-xl mb-3">Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="glass-card p-4 text-center h-full">
                <s.icon className={`h-5 w-5 mx-auto mb-2 ${s.color}`} />
                <p className="font-display text-2xl">{s.value}</p>
                <p className="text-[10px] text-muted-foreground tracking-widest mt-1">{s.label.toUpperCase()}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="glass-card p-6 border-destructive/40">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="font-display text-lg text-destructive">Danger Zone</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Quitting? Gravitas writes a one-page obituary of everything you built. Then it's gone forever.
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Your email <strong>can</strong> be used to create a new Gravitas account later.
          </p>
          <Button variant="destructive" onClick={deleteAccount} disabled={busy}>
            <Trash2 className="h-4 w-4 mr-2" />Delete my account
          </Button>
        </Card>
      </main>
    </div>
  );
}
