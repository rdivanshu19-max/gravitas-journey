import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Shield, LogOut, User, Home, Globe } from "lucide-react";

export default function AppHeader() {
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-40 pl-6 pr-6 py-4 bg-transparent">
      <div className="liquid-glass rounded-full px-5 py-2.5 flex items-center justify-between max-w-6xl mx-auto">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 text-white font-semibold text-lg">
          <Globe size={22} />
          <span className="font-serif-display text-xl tracking-wide">GRAVITAS</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {user && (
            <Button variant="ghost" size="sm" asChild className="text-white/80 hover:text-white hover:bg-white/5 rounded-full">
              <Link to="/dashboard"><Home className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Dashboard</span></Link>
            </Button>
          )}
          {isAdmin && (
            <Button variant="ghost" size="sm" asChild className="text-white/80 hover:text-white hover:bg-white/5 rounded-full">
              <Link to="/admin"><Shield className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Admin</span></Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme" className="text-white/80 hover:text-white hover:bg-white/5 rounded-full">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild className="text-white/80 hover:text-white hover:bg-white/5 rounded-full">
                <Link to="/account"><User className="h-4 w-4" /></Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={async () => { await signOut(); nav("/"); }} className="text-white/80 hover:text-white hover:bg-white/5 rounded-full">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth" className="liquid-glass rounded-full px-5 py-1.5 text-white text-sm font-medium ml-1">
              Launch
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
