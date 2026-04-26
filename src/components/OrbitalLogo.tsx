import { motion } from "framer-motion";
import logo from "@/assets/gravitas-logo.png";

export default function OrbitalLogo({ size = 200 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--orbit-blue)/0.25), transparent 70%)",
          filter: "blur(20px)",
        }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.img
        src={logo}
        alt="Gravitas"
        className="relative w-full h-full"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
