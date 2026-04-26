import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { motion } from "framer-motion";
import StarField from "@/components/StarField";
import { Loader2 } from "lucide-react";

const SUBJECTS = ["Physics", "Chemistry", "Math", "Biology"];

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [exam, setExam] = useState("JEE");
  const [klass, setKlass] = useState("Class 12");
  const [coaching, setCoaching] = useState("");
  const [marks, setMarks] = useState("");
  const [target, setTarget] = useState("Top 10000");
  const [weak, setWeak] = useState<string[]>([]);
  const [strong, setStrong] = useState<string[]>([]);
  const [hours, setHours] = useState("6");
  const [examDate, setExamDate] = useState("");

  const toggle = (arr: string[], setArr: (s: string[]) => void, v: string) =>
    setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const submit = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("onboarding_responses").upsert({
      user_id: user.id,
      target_exam: exam,
      class_level: klass,
      coaching: coaching || null,
      current_marks: marks ? parseInt(marks) : null,
      target_rank: target,
      weak_subjects: weak,
      strong_subjects: strong,
      study_hours: parseInt(hours),
      exam_date: examDate || null,
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    await supabase.from("profiles").update({ onboarding_complete: true }).eq("id", user.id);
    await refreshProfile();
    toast.success("Mission parameters locked in. Welcome aboard.");
    nav("/dashboard");
  };

  const steps = [
    {
      title: "Which exam are you targeting?",
      content: (
        <RadioGroup value={exam} onValueChange={setExam} className="grid grid-cols-3 gap-3">
          {["JEE", "NEET", "Both"].map((v) => (
            <label key={v} className={`glass-card p-4 cursor-pointer text-center rounded-lg ${exam === v ? "border-primary" : ""}`}>
              <RadioGroupItem value={v} className="sr-only" />
              <span className="font-display">{v}</span>
            </label>
          ))}
        </RadioGroup>
      ),
    },
    {
      title: "Your current class & coaching",
      content: (
        <div className="space-y-4">
          <div>
            <Label>Class</Label>
            <RadioGroup value={klass} onValueChange={setKlass} className="grid grid-cols-3 gap-2 mt-2">
              {["Class 11", "Class 12", "Dropper"].map((v) => (
                <label key={v} className={`glass-card p-3 cursor-pointer text-center rounded-lg text-sm ${klass === v ? "border-primary" : ""}`}>
                  <RadioGroupItem value={v} className="sr-only" />
                  {v}
                </label>
              ))}
            </RadioGroup>
          </div>
          <div>
            <Label>Coaching (optional)</Label>
            <Input placeholder="Allen, FIITJEE, Aakash, Self-study…" value={coaching} onChange={(e) => setCoaching(e.target.value)} maxLength={60} />
          </div>
        </div>
      ),
    },
    {
      title: "Your numbers",
      content: (
        <div className="space-y-4">
          <div>
            <Label>Current mock score (out of 300)</Label>
            <Input type="number" min={0} max={360} value={marks} onChange={(e) => setMarks(e.target.value)} placeholder="e.g. 180" />
          </div>
          <div>
            <Label>Target rank</Label>
            <RadioGroup value={target} onValueChange={setTarget} className="grid grid-cols-2 gap-2 mt-2">
              {["Top 100", "Top 1000", "Top 10000", "Top 50000"].map((v) => (
                <label key={v} className={`glass-card p-3 cursor-pointer text-center rounded-lg text-sm ${target === v ? "border-primary" : ""}`}>
                  <RadioGroupItem value={v} className="sr-only" />
                  {v}
                </label>
              ))}
            </RadioGroup>
          </div>
          <div>
            <Label>Hours studied per day</Label>
            <Input type="number" min={1} max={18} value={hours} onChange={(e) => setHours(e.target.value)} />
          </div>
        </div>
      ),
    },
    {
      title: "Subjects: strong vs weak",
      content: (
        <div className="space-y-4">
          <div>
            <Label className="text-orbit-blue">Strong subjects</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {SUBJECTS.map((s) => (
                <label key={s} className="flex items-center gap-2 glass-card p-3 rounded-lg cursor-pointer">
                  <Checkbox checked={strong.includes(s)} onCheckedChange={() => toggle(strong, setStrong, s)} />{s}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-orbit-orange">Weak subjects</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {SUBJECTS.map((s) => (
                <label key={s} className="flex items-center gap-2 glass-card p-3 rounded-lg cursor-pointer">
                  <Checkbox checked={weak.includes(s)} onCheckedChange={() => toggle(weak, setWeak, s)} />{s}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label>Exam date (optional — powers the heartbeat)</Label>
            <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen relative grid place-items-center p-6 overflow-hidden">
      <div className="absolute inset-0"><StarField /></div>
      <Card className="glass-card relative w-full max-w-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <p className="font-mono text-xs tracking-widest text-orbit-orange">CALIBRATION · {step + 1}/{steps.length}</p>
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 w-6 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </div>
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="font-display text-2xl mb-6">{steps[step].title}</h2>
          {steps[step].content}
        </motion.div>
        <div className="flex justify-between mt-8">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Continue →</Button>
          ) : (
            <Button onClick={submit} disabled={loading} className="bg-gradient-to-r from-orbit-orange to-destructive">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Launch Gravitas →"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
