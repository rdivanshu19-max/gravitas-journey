import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import StarField from "@/components/StarField";
import OrbitalLogo from "@/components/OrbitalLogo";

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 chars").max(60),
  email: z.string().trim().email().max(255),
  password: z.string().min(6, "Min 6 characters").max(100),
});

const signInSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(100),
});

export default function Auth() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) nav("/dashboard");
  }, [user, nav]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signUpSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { display_name: parsed.data.name },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome to Gravitas. Initializing your orbit…");
    nav("/onboarding");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back, traveller.");
    nav("/dashboard");
  };

  return (
    <div className="min-h-screen relative grid place-items-center p-6 overflow-hidden bg-black text-white">
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(255,140,60,0.15), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(80,120,255,0.18), transparent 60%), #000",
        }}
      />
      <div className="absolute inset-0"><StarField /></div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-5xl tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
              GRAVITAS
            </h1>
          </Link>
          <p className="text-[10px] text-white/50 tracking-[0.4em] mt-2">FOCUS · ANALYZE · IMPROVE · RISE</p>
        </div>

        <div className="liquid-glass rounded-3xl p-8">
          <h2 className="text-3xl text-center mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Enter your <em className="italic">orbit</em>
          </h2>
          <p className="text-center text-xs text-white/55 mb-6">Sign in or create your account to begin</p>

          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full mb-6 bg-white/5 border border-white/10">
              <TabsTrigger value="signin" className="data-[state=active]:bg-white data-[state=active]:text-black text-white/70">Sign in</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-black text-white/70">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label className="text-white/80">Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="bg-white/5 border-white/15 text-white placeholder:text-white/40" />
                </div>
                <div>
                  <Label className="text-white/80">Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="bg-white/5 border-white/15 text-white placeholder:text-white/40" />
                </div>
                <Button type="submit" className="w-full bg-white text-black hover:bg-white/90 rounded-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enter Orbit"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label className="text-white/80">Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required
                    className="bg-white/5 border-white/15 text-white placeholder:text-white/40" />
                </div>
                <div>
                  <Label className="text-white/80">Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="bg-white/5 border-white/15 text-white placeholder:text-white/40" />
                </div>
                <div>
                  <Label className="text-white/80">Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="bg-white/5 border-white/15 text-white placeholder:text-white/40" />
                </div>
                <Button type="submit" className="w-full bg-white text-black hover:bg-white/90 rounded-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Begin Ascent"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
        <p className="text-center text-xs text-white/45 mt-6">
          By continuing you join the next generation of aspirants.
        </p>
      </div>
    </div>
  );
}
