import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Calendar,
  CreditCard,
  Shield,
  ChevronRight,
  LogOut,
  HelpCircle,
  FileText,
  Camera,
} from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Profile() {
  const navigate = useNavigate();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleLogout = () => {
    toast.success("Déconnexion réussie");
    navigate("/login");
  };

  return (
    <MobileLayout>
      {/* Header with profile info */}
      <div className="header-gradient px-4 pt-8 pb-16 safe-top text-center">
        <div className="relative inline-block animate-scale-in">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto border-4 border-white/30">
            <User className="w-12 h-12 text-white" />
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg">
            <Camera className="w-4 h-4 text-accent-foreground" />
          </button>
        </div>
        <h1 className="text-xl font-bold text-white mt-4 animate-fade-in">
          Utilisateur Test
        </h1>
        <p className="text-white/80 text-sm animate-fade-in">
          utilisateur@gmail.com
        </p>
      </div>

      {/* Profile sections */}
      <div className="px-4 -mt-8 pb-6">
        {/* Personal Info Card */}
        <div className="bg-card rounded-2xl shadow-lg overflow-hidden mb-4 animate-slide-up">
          <div className="px-4 py-3 bg-secondary/50 border-b border-border">
            <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">
              Informations Personnelles
            </h2>
          </div>
          <div className="divide-y divide-border">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Date de naissance</p>
                <p className="font-medium text-foreground">15 Mars 1990</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Numéro CNI</p>
                <p className="font-medium text-foreground">123456789012</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">utilisateur@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings Card */}
        <div className="bg-card rounded-2xl shadow-lg overflow-hidden mb-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="px-4 py-3 bg-secondary/50 border-b border-border">
            <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">
              Paramètres du Compte
            </h2>
          </div>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">
                    Authentification 2FA
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Protection renforcée
                  </p>
                </div>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={setTwoFactorEnabled}
              />
            </div>
            <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-info" />
                </div>
                <span className="font-medium text-foreground text-sm">
                  Changer le mot de passe
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Help & Policies Card */}
        <div className="bg-card rounded-2xl shadow-lg overflow-hidden mb-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="divide-y divide-border">
            <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-warning" />
                </div>
                <span className="font-medium text-foreground text-sm">
                  Aide & Support
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="font-medium text-foreground text-sm">
                  Conditions d'utilisation
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="w-full bg-destructive/10 text-destructive font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-destructive/20 transition-colors animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <LogOut className="w-5 h-5" />
              Se déconnecter
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-xs mx-auto rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Se déconnecter?</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir vous déconnecter de votre compte?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row gap-3">
              <AlertDialogCancel className="flex-1 m-0">Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="flex-1 bg-destructive hover:bg-destructive/90"
              >
                Se déconnecter
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MobileLayout>
  );
}
