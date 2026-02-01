import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Shield, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    
    // Simulate login - replace with actual auth
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Connexion réussie!");
      navigate("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="header-gradient px-6 pt-12 pb-8 safe-top">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <span className="text-white font-bold text-lg">CDAS</span>
        </div>
        <p className="text-white/80 text-xs uppercase tracking-wider">
          CAMEROON DIPLOMA AUTHENTICATION SYSTEM
        </p>
      </div>

      {/* Login Form */}
      <div className="flex-1 px-6 pt-8">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6 animate-slide-up">
          <h1 className="text-2xl font-bold text-foreground text-center mb-6">
            Connexion
          </h1>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="h-12 rounded-xl border-input bg-background pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-xl border-input bg-background pl-10 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                className="text-sm text-primary hover:underline font-medium"
              >
                Mot passe oublié ?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? "Connexion..." : "SE CONNECTER"}
            </Button>

            <div className="flex items-center justify-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                Se souvenir de moi
              </label>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <button className="text-primary font-semibold hover:underline">
                S'inscrire
              </button>
            </p>
          </div>
        </div>

        {/* Help Link */}
        <div className="mt-6 text-center pb-8">
          <button className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <HelpCircle className="w-4 h-4" />
            Aide & Support
          </button>
        </div>
      </div>
    </div>
  );
}
