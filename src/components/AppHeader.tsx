import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Shield, LogOut, User, Home } from "lucide-react";
import logo from "@/assets/gravitas-logo.png";

export default function AppHeader() {
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <img src={logo} alt="Gravitas" className="h-9 w-9 animate-float" />
          <span className="font-display font-bold text-lg tracking-widest hidden sm:inline">GRAVITAS</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {user && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard"><Home className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Dashboard</span></Link>
            </Button>
          )}
          {isAdmin && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin"><Shield className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Admin</span></Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild><Link to="/account"><User className="h-4 w-4" /></Link></Button>
              <Button variant="ghost" size="icon" onClick={async () => { await signOut(); nav("/"); }}><LogOut className="h-4 w-4" /></Button>
            </>
          ) : (
            <Button variant="default" size="sm" asChild><Link to="/auth">Launch</Link></Button>
          )}
        </nav>
      </div>
    </header>
  );
}
