import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Ban, Trash2, Check, Loader2 } from "lucide-react";

interface Row {
  id: string;
  email: string;
  display_name: string | null;
  is_banned: boolean;
  created_at: string;
}

export default function Admin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("id,email,display_name,is_banned,created_at").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Row[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setBan = async (id: string, banned: boolean) => {
    const { error } = await supabase.rpc("admin_set_ban", { _target: id, _banned: banned });
    if (error) return toast.error(error.message);
    toast.success(banned ? "User banned" : "User unbanned");
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Permanently delete this user? Their email will be blocked from re-registering.")) return;
    const { error } = await supabase.rpc("admin_delete_user", { _target: id });
    if (error) return toast.error(error.message);
    toast.success("User deleted");
    load();
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10">
        <p className="font-mono text-xs tracking-widest text-orbit-orange mb-2">// ADMIN COMMAND</p>
        <h1 className="font-display text-3xl mb-6 orbit-text">Mission Control</h1>

        <Card className="glass-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-lg">All users · {rows.length}</h2>
            <Button variant="outline" size="sm" onClick={load}>Refresh</Button>
          </div>
          {loading ? (
            <div className="grid place-items-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.display_name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{r.email}</TableCell>
                      <TableCell>
                        {r.is_banned ? <Badge variant="destructive">Banned</Badge> : <Badge variant="secondary">Active</Badge>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right space-x-1">
                        {r.is_banned ? (
                          <Button size="sm" variant="outline" onClick={() => setBan(r.id, false)}><Check className="h-3 w-3 mr-1" />Unban</Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setBan(r.id, true)}><Ban className="h-3 w-3 mr-1" />Ban</Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => del(r.id)}><Trash2 className="h-3 w-3" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
