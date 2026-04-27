import { useMemo, useState, useEffect, useRef } from "react";
import AppHeader from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dna, AlertTriangle, Check, X, Brain, Search, Atom, FlaskConical, Calculator, Leaf, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Subject = "Physics" | "Chemistry" | "Math" | "Biology";
type ExamTrack = "JEE" | "NEET";
type Class = "11" | "12";

interface Chapter {
  id: string;
  subject: Subject;
  cls: Class;
  exam: ExamTrack[];          // which exams cover it
  chains: string[];           // failure-chain — topics it secretly affects
  difficulty: 1 | 2 | 3;      // 3 = highest
}

// JEE + NEET full chapter library (Class 11 & 12)
const CHAPTERS: Chapter[] = [
  // ── PHYSICS 11 ──
  { id: "Units & Measurements", subject: "Physics", cls: "11", exam: ["JEE", "NEET"], difficulty: 1, chains: ["Dimensional Analysis", "Significant Figures", "Error Propagation"] },
  { id: "Kinematics", subject: "Physics", cls: "11", exam: ["JEE", "NEET"], difficulty: 2, chains: ["Projectile Motion", "Relative Motion", "Newton's Laws", "Circular Motion"] },
  { id: "Newton's Laws", subject: "Physics", cls: "11", exam: ["JEE", "NEET"], difficulty: 3, chains: ["Friction", "Pseudo Forces", "Circular Motion", "Work-Energy Theorem", "Momentum"] },
  { id: "Work, Energy & Power", subject: "Physics", cls: "11", exam: ["JEE", "NEET"], difficulty: 2, chains: ["Conservation of Energy", "Collisions", "Power Calculations", "SHM"] },
  { id: "Rotational Motion", subject: "Physics", cls: "11", exam: ["JEE", "NEET"], difficulty: 3, chains: ["Moment of Inertia", "Angular Momentum", "Rolling without Slipping", "Torque"] },
  { id: "Gravitation", subject: "Physics", cls: "11", exam: ["JEE", "NEET"], difficulty: 2, chains: ["Kepler's Laws", "Escape Velocity", "Satellite Orbits"] },
  { id: "Properties of Matter", subject: "Physics", cls: "11", exam: ["JEE", "NEET"], difficulty: 2, chains: ["Elasticity", "Surface Tension", "Viscosity", "Bernoulli"] },
  { id: "Thermodynamics", subject: "Physics", cls: "11", exam: ["JEE", "NEET"], difficulty: 3, chains: ["Heat Engines", "Entropy", "PV Diagrams", "Kinetic Theory"] },
  { id: "Oscillations", subject: "Physics", cls: "11", exam: ["JEE", "NEET"], difficulty: 2, chains: ["SHM", "Damped Oscillations", "Resonance", "Waves"] },
  { id: "Waves", subject: "Physics", cls: "11", exam: ["JEE", "NEET"], difficulty: 2, chains: ["Sound", "Doppler Effect", "Standing Waves", "Wave Optics"] },
  // ── PHYSICS 12 ──
  { id: "Electrostatics", subject: "Physics", cls: "12", exam: ["JEE", "NEET"], difficulty: 3, chains: ["Capacitors", "Gauss Law", "Current Electricity", "EM Induction"] },
  { id: "Current Electricity", subject: "Physics", cls: "12", exam: ["JEE", "NEET"], difficulty: 2, chains: ["Kirchhoff's Laws", "Wheatstone Bridge", "Magnetic Effects"] },
  { id: "Magnetism", subject: "Physics", cls: "12", exam: ["JEE", "NEET"], difficulty: 2, chains: ["Biot-Savart", "Ampere's Law", "EM Induction", "AC Circuits"] },
  { id: "EM Induction & AC", subject: "Physics", cls: "12", exam: ["JEE", "NEET"], difficulty: 3, chains: ["Faraday's Law", "LCR Circuits", "Transformers", "EM Waves"] },
  { id: "Optics", subject: "Physics", cls: "12", exam: ["JEE", "NEET"], difficulty: 2, chains: ["Ray Optics", "Wave Optics", "Polarization", "Interference"] },
  { id: "Modern Physics", subject: "Physics", cls: "12", exam: ["JEE", "NEET"], difficulty: 2, chains: ["Photoelectric Effect", "Bohr Model", "Nuclei", "Radioactivity"] },
  { id: "Semiconductors", subject: "Physics", cls: "12", exam: ["JEE", "NEET"], difficulty: 2, chains: ["Diodes", "Transistors", "Logic Gates"] },

  // ── CHEMISTRY 11 ──
  { id: "Mole Concept", subject: "Chemistry", cls: "11", exam: ["JEE", "NEET"], difficulty: 3, chains: ["Stoichiometry", "Limiting Reagent", "Solutions", "Electrochemistry"] },
  { id: "Atomic Structure", subject: "Chemistry", cls: "11", exam: ["JEE", "NEET"], difficulty: 2, chains: ["Quantum Numbers", "Periodic Trends", "Chemical Bonding"] },
  { id: "Periodic Table", subject: "Chemistry", cls: "11", exam: ["JEE", "NEET"], difficulty: 1, chains: ["s-block", "p-block", "Periodic Trends", "Inorganic"] },
  { id: "Chemical Bonding", subject: "Chemistry", cls: "11", exam: ["JEE", "NEET"], difficulty: 3, chains: ["Hybridisation", "VSEPR", "MOT", "Inorganic Reactions"] },
  { id: "Thermochemistry", subject: "Chemistry", cls: "11", exam: ["JEE", "NEET"], difficulty: 2, chains: ["Enthalpy", "Hess's Law", "Bond Energy", "Equilibrium"] },
  { id: "Equilibrium", subject: "Chemistry", cls: "11", exam: ["JEE", "NEET"], difficulty: 3, chains: ["Le Chatelier", "Ionic Equilibrium", "Buffer Solutions", "pH"] },
  { id: "Redox Reactions", subject: "Chemistry", cls: "11", exam: ["JEE", "NEET"], difficulty: 2, chains: ["Oxidation Numbers", "Electrochemistry", "Balancing"] },
  { id: "Hydrocarbons", subject: "Chemistry", cls: "11", exam: ["JEE", "NEET"], difficulty: 2, chains: ["Alkanes", "Alkenes", "Aromatic Compounds", "GOC"] },
  { id: "GOC", subject: "Chemistry", cls: "11", exam: ["JEE", "NEET"], difficulty: 3, chains: ["Reaction Mechanisms", "Stereochemistry", "Inductive Effect", "Resonance"] },
  // ── CHEMISTRY 12 ──
  { id: "Solid State", subject: "Chemistry", cls: "12", exam: ["JEE", "NEET"], difficulty: 2, chains: ["Crystal Lattice", "Packing Efficiency", "Defects"] },
  { id: "Solutions", subject: "Chemistry", cls: "12", exam: ["JEE", "NEET"], difficulty: 2, chains: ["Colligative Properties", "Raoult's Law", "Mole Fraction"] },
  { id: "Electrochemistry", subject: "Chemistry", cls: "12", exam: ["JEE", "NEET"], difficulty: 3, chains: ["Nernst Equation", "Galvanic Cells", "Conductivity"] },
  { id: "Chemical Kinetics", subject: "Chemistry", cls: "12", exam: ["JEE", "NEET"], difficulty: 2, chains: ["Rate Law", "Order of Reaction", "Arrhenius"] },
  { id: "Coordination Compounds", subject: "Chemistry", cls: "12", exam: ["JEE", "NEET"], difficulty: 3, chains: ["CFT", "Isomerism", "IUPAC Naming", "Magnetic Behavior"] },
  { id: "p-block (12)", subject: "Chemistry", cls: "12", exam: ["JEE", "NEET"], difficulty: 2, chains: ["Group 15-18", "Oxoacids", "Interhalogens"] },
  { id: "d & f block", subject: "Chemistry", cls: "12", exam: ["JEE", "NEET"], difficulty: 2, chains: ["Transition Metals", "Lanthanides", "Coordination"] },
  { id: "Haloalkanes", subject: "Chemistry", cls: "12", exam: ["JEE", "NEET"], difficulty: 2, chains: ["SN1/SN2", "E1/E2", "Grignard"] },
  { id: "Alcohols & Ethers", subject: "Chemistry", cls: "12", exam: ["JEE", "NEET"], difficulty: 2, chains: ["Williamson Synthesis", "Oxidation", "Dehydration"] },
  { id: "Aldehydes & Ketones", subject: "Chemistry", cls: "12", exam: ["JEE", "NEET"], difficulty: 3, chains: ["Nucleophilic Addition", "Aldol", "Cannizzaro"] },
  { id: "Amines", subject: "Chemistry", cls: "12", exam: ["JEE", "NEET"], difficulty: 2, chains: ["Hofmann", "Diazonium", "Basicity"] },
  { id: "Biomolecules", subject: "Chemistry", cls: "12", exam: ["JEE", "NEET"], difficulty: 1, chains: ["Carbohydrates", "Proteins", "Nucleic Acids"] },

  // ── MATH (JEE only) 11 ──
  { id: "Sets & Functions", subject: "Math", cls: "11", exam: ["JEE"], difficulty: 1, chains: ["Relations", "Functions", "Domain & Range"] },
  { id: "Trigonometry", subject: "Math", cls: "11", exam: ["JEE"], difficulty: 2, chains: ["Identities", "Inverse Trig", "Heights & Distances"] },
  { id: "Complex Numbers", subject: "Math", cls: "11", exam: ["JEE"], difficulty: 2, chains: ["Argand Plane", "De Moivre", "Roots of Unity"] },
  { id: "Quadratic Equations", subject: "Math", cls: "11", exam: ["JEE"], difficulty: 2, chains: ["Discriminant", "Sum & Product of Roots", "Inequalities"] },
  { id: "Sequences & Series", subject: "Math", cls: "11", exam: ["JEE"], difficulty: 2, chains: ["AP", "GP", "Sigma Sums"] },
  { id: "Permutations & Combinations", subject: "Math", cls: "11", exam: ["JEE"], difficulty: 3, chains: ["Probability", "Binomial Theorem", "Counting"] },
  { id: "Binomial Theorem", subject: "Math", cls: "11", exam: ["JEE"], difficulty: 2, chains: ["General Term", "Middle Term", "Multinomial"] },
  { id: "Straight Lines", subject: "Math", cls: "11", exam: ["JEE"], difficulty: 2, chains: ["Slope", "Family of Lines", "Conic Sections"] },
  { id: "Conic Sections", subject: "Math", cls: "11", exam: ["JEE"], difficulty: 3, chains: ["Parabola", "Ellipse", "Hyperbola", "3D Geometry"] },
  { id: "Limits", subject: "Math", cls: "11", exam: ["JEE"], difficulty: 2, chains: ["Continuity", "Differentiability", "Derivatives", "Integration"] },
  { id: "Statistics", subject: "Math", cls: "11", exam: ["JEE"], difficulty: 1, chains: ["Mean", "Variance", "Probability"] },
  // ── MATH 12 ──
  { id: "Matrices", subject: "Math", cls: "12", exam: ["JEE"], difficulty: 2, chains: ["Determinants", "Linear Equations", "Inverse Matrices"] },
  { id: "Determinants", subject: "Math", cls: "12", exam: ["JEE"], difficulty: 2, chains: ["Cramer's Rule", "Area of Triangle", "Properties"] },
  { id: "Continuity & Differentiability", subject: "Math", cls: "12", exam: ["JEE"], difficulty: 2, chains: ["Derivatives", "MVT", "Rolle's Theorem"] },
  { id: "Application of Derivatives", subject: "Math", cls: "12", exam: ["JEE"], difficulty: 2, chains: ["Maxima-Minima", "Tangents", "Rate of Change"] },
  { id: "Integration", subject: "Math", cls: "12", exam: ["JEE"], difficulty: 3, chains: ["Definite Integrals", "Area Under Curve", "Differential Equations", "Substitution"] },
  { id: "Differential Equations", subject: "Math", cls: "12", exam: ["JEE"], difficulty: 2, chains: ["Separation of Variables", "Linear DE", "Homogeneous"] },
  { id: "Vectors", subject: "Math", cls: "12", exam: ["JEE"], difficulty: 2, chains: ["Dot Product", "Cross Product", "3D Geometry"] },
  { id: "3D Geometry", subject: "Math", cls: "12", exam: ["JEE"], difficulty: 3, chains: ["Plane Equations", "Line in Space", "Distance Formula"] },
  { id: "Probability", subject: "Math", cls: "12", exam: ["JEE"], difficulty: 2, chains: ["Bayes' Theorem", "Random Variables", "Binomial Distribution"] },

  // ── BIOLOGY (NEET only) 11 ──
  { id: "Diversity in Living World", subject: "Biology", cls: "11", exam: ["NEET"], difficulty: 1, chains: ["Taxonomy", "Five Kingdoms", "Plant Kingdom"] },
  { id: "Plant Anatomy & Morphology", subject: "Biology", cls: "11", exam: ["NEET"], difficulty: 2, chains: ["Tissues", "Root System", "Photosynthesis"] },
  { id: "Cell Structure", subject: "Biology", cls: "11", exam: ["NEET"], difficulty: 2, chains: ["Organelles", "Cell Cycle", "Biomolecules"] },
  { id: "Biomolecules (Bio)", subject: "Biology", cls: "11", exam: ["NEET"], difficulty: 2, chains: ["Enzymes", "Proteins", "Metabolism"] },
  { id: "Plant Physiology", subject: "Biology", cls: "11", exam: ["NEET"], difficulty: 3, chains: ["Photosynthesis", "Respiration", "Transport in Plants"] },
  { id: "Human Physiology", subject: "Biology", cls: "11", exam: ["NEET"], difficulty: 3, chains: ["Digestion", "Breathing", "Circulation", "Excretion", "Neural Control"] },
  // ── BIOLOGY 12 ──
  { id: "Reproduction", subject: "Biology", cls: "12", exam: ["NEET"], difficulty: 3, chains: ["Sexual Reproduction in Plants", "Human Reproduction", "Reproductive Health"] },
  { id: "Genetics & Evolution", subject: "Biology", cls: "12", exam: ["NEET"], difficulty: 3, chains: ["Mendelian Inheritance", "DNA", "Evolution Theories"] },
  { id: "Biology in Human Welfare", subject: "Biology", cls: "12", exam: ["NEET"], difficulty: 1, chains: ["Health & Disease", "Microbes", "Food Production"] },
  { id: "Biotechnology", subject: "Biology", cls: "12", exam: ["NEET"], difficulty: 2, chains: ["Recombinant DNA", "PCR", "Gene Therapy"] },
  { id: "Ecology", subject: "Biology", cls: "12", exam: ["NEET"], difficulty: 2, chains: ["Ecosystem", "Biodiversity", "Environmental Issues"] },
];

// Quick quiz bank — one auto-question per chapter family, fallback for any chapter
const QUIZ_BANK: Record<string, { q: string; opts: string[]; correct: number }> = {
  "Newton's Laws": { q: "On a frictionless surface, force F on block of mass m gives acceleration:", opts: ["F", "F·m", "F/m", "m/F"], correct: 2 },
  "Mole Concept": { q: "Number of moles in 22 g of CO₂ (M=44):", opts: ["1", "0.5", "2", "0.25"], correct: 1 },
  "Limits": { q: "lim(x→0) sin(x)/x =", opts: ["0", "1", "∞", "undefined"], correct: 1 },
  "Vectors": { q: "If a·b = 0 and neither is zero, then:", opts: ["parallel", "perpendicular", "equal", "opposite"], correct: 1 },
  "Electrostatics": { q: "Electric field inside a hollow conductor is:", opts: ["non-zero", "infinite", "zero", "depends on charge"], correct: 2 },
  "Rotational Motion": { q: "Moment of inertia of solid sphere about diameter:", opts: ["MR²", "(2/5)MR²", "(2/3)MR²", "(1/2)MR²"], correct: 1 },
  "Chemical Bonding": { q: "Hybridisation of central atom in BF₃:", opts: ["sp", "sp²", "sp³", "sp³d"], correct: 1 },
  "GOC": { q: "Most stable carbocation:", opts: ["Methyl", "Primary", "Secondary", "Tertiary"], correct: 3 },
  "Integration": { q: "∫ x·sin(x) dx = ?", opts: ["sin(x) − x·cos(x) + C", "−x·cos(x) + sin(x) + C", "x·cos(x) + sin(x) + C", "−sin(x) + C"], correct: 1 },
  "Kinematics": { q: "A particle moves with v = 3t² m/s. Distance from t=0 to t=2:", opts: ["6 m", "8 m", "12 m", "24 m"], correct: 1 },
  "Thermodynamics": { q: "Efficiency of Carnot engine between 600K and 300K:", opts: ["25%", "50%", "75%", "100%"], correct: 1 },
  "Optics": { q: "Critical angle for glass-air (μ=1.5):", opts: ["30°", "41.8°", "60°", "90°"], correct: 1 },
  "Modern Physics": { q: "Threshold frequency means:", opts: ["max KE = 0", "min freq for photoemission", "freq of photon = energy", "wavelength = ∞"], correct: 1 },
  "Equilibrium": { q: "Adding inert gas at constant V to gas equilibrium:", opts: ["shifts forward", "shifts back", "no change", "stops reaction"], correct: 2 },
  "Coordination Compounds": { q: "Geometry of [Ni(CO)₄]:", opts: ["square planar", "tetrahedral", "octahedral", "trigonal"], correct: 1 },
  "Genetics & Evolution": { q: "Mendel's law of segregation involves:", opts: ["one gene", "two genes", "linked genes", "polygenic"], correct: 0 },
  "Human Physiology": { q: "Pacemaker of heart is located in:", opts: ["AV node", "SA node", "Purkinje fibers", "Bundle of His"], correct: 1 },
  "Cell Structure": { q: "Powerhouse of cell:", opts: ["Nucleus", "Mitochondria", "Ribosome", "Golgi"], correct: 1 },
};

const SUBJECT_META: Record<Subject, { color: string; icon: any; hsl: string }> = {
  Physics:   { color: "from-orbit-blue to-orbit-purple",      icon: Atom,         hsl: "var(--orbit-blue)" },
  Chemistry: { color: "from-orbit-orange to-destructive",     icon: FlaskConical, hsl: "var(--orbit-orange)" },
  Math:      { color: "from-orbit-purple to-orbit-blue",      icon: Calculator,   hsl: "var(--orbit-purple)" },
  Biology:   { color: "from-emerald-500 to-orbit-blue",       icon: Leaf,         hsl: "152 60% 50%" },
};

export default function ConceptDNA() {
  const [exam, setExam] = useState<ExamTrack>("JEE");
  const [cls, setCls] = useState<Class | "All">("All");
  const [subj, setSubj] = useState<Subject | "All">("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Chapter | null>(null);
  const [mode, setMode] = useState<"map" | "quiz">("map");
  const [answer, setAnswer] = useState<number | null>(null);
  const [history, setHistory] = useState<{ chapter: string; correct: boolean }[]>([]);

  const filtered = useMemo(() => CHAPTERS.filter(c =>
    c.exam.includes(exam)
    && (cls === "All" || c.cls === cls)
    && (subj === "All" || c.subject === subj)
    && (!search || c.id.toLowerCase().includes(search.toLowerCase()))
  ), [exam, cls, subj, search]);

  const subjectsForExam = useMemo(() => {
    const all = Array.from(new Set(CHAPTERS.filter(c => c.exam.includes(exam)).map(c => c.subject)));
    return ["All", ...all] as const;
  }, [exam]);

  useEffect(() => { setSubj("All"); setSelected(null); }, [exam]);

  const startQuiz = (n: Chapter) => { setSelected(n); setMode("quiz"); setAnswer(null); };
  const currentQ = selected ? (QUIZ_BANK[selected.id] || {
    q: `Conceptual: which best describes ${selected.id}?`,
    opts: ["Foundational concept", "Niche topic", "Not in syllabus", "Removed chapter"],
    correct: 0,
  }) : null;
  const wrong = answer !== null && currentQ && answer !== currentQ.correct;
  const right = answer !== null && currentQ && answer === currentQ.correct;

  const submitAnswer = (i: number) => {
    setAnswer(i);
    if (selected && currentQ) {
      setHistory(h => [{ chapter: selected.id, correct: i === currentQ.correct }, ...h].slice(0, 8));
    }
  };

  // Knowledge graph SVG: selected chapter at center, chains around
  const GraphView = ({ chapter, ignite }: { chapter: Chapter; ignite: boolean }) => {
    const ref = useRef<SVGSVGElement>(null);
    const N = chapter.chains.length;
    const meta = SUBJECT_META[chapter.subject];
    return (
      <div className="relative w-full aspect-square max-w-md mx-auto">
        <svg ref={ref} viewBox="0 0 400 400" className="w-full h-full">
          <defs>
            <radialGradient id="centerGlow">
              <stop offset="0%" stopColor={`hsl(${meta.hsl} / 0.6)`} />
              <stop offset="100%" stopColor={`hsl(${meta.hsl} / 0)`} />
            </radialGradient>
            <radialGradient id="dangerGlow">
              <stop offset="0%" stopColor="hsl(var(--destructive) / 0.7)" />
              <stop offset="100%" stopColor="hsl(var(--destructive) / 0)" />
            </radialGradient>
          </defs>
          {/* center halo */}
          <circle cx={200} cy={200} r={120} fill={ignite ? "url(#dangerGlow)" : "url(#centerGlow)"} />
          {/* connection lines */}
          {chapter.chains.map((_, i) => {
            const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
            const x = 200 + Math.cos(angle) * 140;
            const y = 200 + Math.sin(angle) * 140;
            return (
              <motion.line
                key={i}
                x1={200} y1={200} x2={x} y2={y}
                stroke={ignite ? "hsl(var(--destructive))" : `hsl(${meta.hsl})`}
                strokeWidth={ignite ? 2 : 1.2}
                strokeDasharray={ignite ? "0" : "4 4"}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              />
            );
          })}
          {/* outer chain nodes */}
          {chapter.chains.map((c, i) => {
            const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
            const x = 200 + Math.cos(angle) * 140;
            const y = 200 + Math.sin(angle) * 140;
            return (
              <motion.g key={c} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.06, type: "spring" }}>
                <circle cx={x} cy={y} r={26} fill={ignite ? "hsl(var(--destructive) / 0.25)" : "hsl(var(--card))"} stroke={ignite ? "hsl(var(--destructive))" : `hsl(${meta.hsl} / 0.6)`} strokeWidth={1.5} />
                <text x={x} y={y} textAnchor="middle" dy="0.35em" fontSize="9" fill="hsl(var(--foreground))" className="font-medium">
                  {c.length > 14 ? c.slice(0, 13) + "…" : c}
                </text>
              </motion.g>
            );
          })}
          {/* center node */}
          <circle cx={200} cy={200} r={44} fill={`hsl(${meta.hsl})`} />
          <text x={200} y={200} textAnchor="middle" dy="0.35em" fontSize="11" fill="hsl(var(--primary-foreground))" fontWeight="700">
            {chapter.id.length > 16 ? chapter.id.slice(0, 15) + "…" : chapter.id}
          </text>
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-8 max-w-6xl">
        <p className="font-mono text-xs tracking-widest text-orbit-blue mb-2">// CONCEPT DNA · v2</p>
        <h1 className="font-display text-3xl mb-1 flex items-center gap-3"><Dna className="text-orbit-blue" />Knowledge Graph & Failure Chain</h1>
        <p className="text-muted-foreground mb-6">Pick any chapter from JEE / NEET (Class 11 & 12). Take a test. Watch your weak link ignite the failure chain.</p>

        {/* Filters */}
        <Card className="glass-card p-4 mb-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] tracking-widest text-muted-foreground">EXAM</span>
            {(["JEE", "NEET"] as const).map(e => (
              <Button key={e} size="sm" variant={exam === e ? "default" : "outline"} onClick={() => setExam(e)}>{e}</Button>
            ))}
            <span className="text-[10px] tracking-widest text-muted-foreground ml-3">CLASS</span>
            {(["All", "11", "12"] as const).map(c => (
              <Button key={c} size="sm" variant={cls === c ? "default" : "outline"} onClick={() => setCls(c)}>{c === "All" ? "All" : `Class ${c}`}</Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] tracking-widest text-muted-foreground">SUBJECT</span>
            {subjectsForExam.map(s => (
              <Button key={s} size="sm" variant={subj === s ? "default" : "outline"} onClick={() => setSubj(s as any)}>{s}</Button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chapter (e.g. Optics, Mole Concept, Genetics)" className="pl-8" />
          </div>
        </Card>

        <div className="grid lg:grid-cols-5 gap-5">
          {/* CHAPTER LIST */}
          <Card className="glass-card p-4 lg:col-span-2 max-h-[70vh] overflow-y-auto">
            <p className="font-mono text-xs text-muted-foreground mb-3">// {filtered.length} CHAPTERS</p>
            <div className="grid grid-cols-1 gap-2">
              {filtered.map(n => {
                const M = SUBJECT_META[n.subject];
                const Icon = M.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => { setSelected(n); setMode("map"); setAnswer(null); }}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selected?.id === n.id
                        ? "border-primary shadow-[0_0_20px_hsl(var(--primary)/0.25)] bg-primary/5"
                        : "border-border hover:border-primary/50 bg-card/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-md bg-gradient-to-br ${M.color} grid place-items-center`}>
                        <Icon className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{n.id}</p>
                        <p className="text-[10px] text-muted-foreground">{n.subject} · Class {n.cls} · affects {n.chains.length}</p>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < n.difficulty ? "bg-orbit-orange" : "bg-muted"}`} />
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-6">No chapter matches.</p>
              )}
            </div>
          </Card>

          {/* DETAIL / GRAPH / QUIZ */}
          <Card className="glass-card p-5 lg:col-span-3 min-h-[400px]">
            {!selected ? (
              <div className="h-full grid place-items-center text-center text-muted-foreground py-16">
                <div>
                  <Brain className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>Pick a chapter to reveal its DNA chain.</p>
                  <p className="text-xs mt-1">Then "Test me" to see how your weakness ripples outward.</p>
                </div>
              </div>
            ) : mode === "map" ? (
              <div>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <p className="font-mono text-[10px] tracking-widest text-muted-foreground">{selected.subject.toUpperCase()} · CLASS {selected.cls} · {selected.exam.join(" + ")}</p>
                    <h3 className="font-display text-2xl orbit-text">{selected.id}</h3>
                  </div>
                  <Button size="sm" onClick={() => startQuiz(selected)} className="bg-gradient-to-r from-orbit-orange to-destructive">
                    <Sparkles className="h-3 w-3 mr-1" />Test me →
                  </Button>
                </div>
                <GraphView chapter={selected} ignite={false} />
                <p className="text-xs text-muted-foreground text-center mt-2">A weakness here silently affects the {selected.chains.length} surrounding topics.</p>
              </div>
            ) : (
              <div>
                <p className="font-mono text-[10px] tracking-widest text-orbit-orange mb-2">QUIZ · {selected.id}</p>
                <h3 className="font-display text-lg mb-4">{currentQ?.q}</h3>
                <div className="grid gap-2 mb-4">
                  {currentQ?.opts.map((o, i) => (
                    <button key={o} disabled={answer !== null}
                      onClick={() => submitAnswer(i)}
                      className={`p-3 rounded-lg border text-left text-sm transition ${
                        answer === null ? "border-border hover:border-primary/50 bg-card/40" :
                        i === currentQ.correct ? "border-orbit-blue bg-orbit-blue/10" :
                        i === answer ? "border-destructive bg-destructive/10" : "border-border opacity-60"
                      }`}>
                      {o}
                    </button>
                  ))}
                </div>
                <AnimatePresence>
                  {right && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 rounded-lg bg-orbit-blue/10 border border-orbit-blue/40 flex gap-2 items-center text-sm">
                      <Check className="h-4 w-4 text-orbit-blue" />Strand intact. Connected topics safe.
                    </motion.div>
                  )}
                  {wrong && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/40">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <p className="text-sm font-medium">Failure chain triggered</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Watch the connected topics ignite below 🔥</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                {answer !== null && <GraphView chapter={selected} ignite={!!wrong} />}
                <div className="flex gap-2 mt-4 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => { setMode("map"); setAnswer(null); }}>← Back to graph</Button>
                  {answer !== null && <Button size="sm" onClick={() => setAnswer(null)}><X className="h-3 w-3 mr-1" />Retry</Button>}
                </div>
              </div>
            )}
          </Card>
        </div>

        {history.length > 0 && (
          <Card className="glass-card p-4 mt-5">
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground mb-2">// RECENT TESTS</p>
            <div className="flex flex-wrap gap-2">
              {history.map((h, i) => (
                <span key={i} className={`px-2.5 py-1 rounded-full text-xs border ${h.correct ? "border-orbit-blue/40 bg-orbit-blue/10 text-orbit-blue" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
                  {h.correct ? "✓" : "✗"} {h.chapter}
                </span>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
