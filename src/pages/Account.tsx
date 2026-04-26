import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, AlertTriangle } from "lucide-react";

export default function Account() {
  const { profile, user, signOut } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);

  const deleteAccount = async () => {
    if (!confirm("⚠️ This permanently deletes your account, all data, and your obituary. This email cannot be reused. Continue?")) return;
    setBusy(true);
    const { error } = await supabase.rpc("delete_own_account");
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Your journey has been sealed. Farewell.");
    await signOut();
    nav("/");
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 max-w-2xl">
        <h1 className="font-display text-3xl mb-6 orbit-text">Account</h1>

        <Card className="glass-card p-6 mb-6">
          <h2 className="font-display text-lg mb-4">Profile</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {profile?.display_name}</p>
            <p><span className="text-muted-foreground">Email:</span> {user?.email}</p>
          </div>
        </Card>

        <Card className="glass-card p-6 border-destructive/40">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="font-display text-lg text-destructive">Danger Zone</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Quitting? Gravitas writes a one-page obituary of everything you built. Then it's gone forever.
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Once deleted, your email is permanently blocked from creating a new Gravitas account.
          </p>
          <Button variant="destructive" onClick={deleteAccount} disabled={busy}>
            <Trash2 className="h-4 w-4 mr-2" />Delete my account
          </Button>
        </Card>
      </main>
    </div>
  );
}
