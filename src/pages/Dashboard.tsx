import { useNavigate } from "react-router-dom";
import {
  Shield,
  QrCode,
  CreditCard,
  Clock,
  History,
  Settings,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  User,
} from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { CircularProgress } from "@/components/ui/circular-progress";
import { BarChart, Bar, XAxis, ResponsiveContainer } from "recharts";

const monthlyData = [
  { month: "Jan", value: 30 },
  { month: "Fev", value: 45 },
  { month: "Mar", value: 35 },
  { month: "Avr", value: 50 },
  { month: "Mai", value: 40 },
  { month: "Jun", value: 60 },
  { month: "Jul", value: 55 },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      {/* Header */}
      <div className="header-gradient px-4 pt-6 pb-8 safe-top">
        <div className="flex items-center justify-between mb-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <span className="text-white font-bold">CDAS</span>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          >
            <User className="w-5 h-5 text-white" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 bg-success/20 text-success-foreground text-xs font-medium px-3 py-1 rounded-full border border-success/30">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Connecté
          </span>
          <span className="text-white/80 text-sm">Accueil</span>
        </div>
        
        <h1 className="text-white font-bold text-lg animate-fade-in">
          BIENVENUE, UTILISATEUR
        </h1>
      </div>

      {/* Statistics Section */}
      <div className="px-4 -mt-4">
        <div className="bg-card rounded-xl border border-border shadow-sm p-4 animate-slide-up">
          <h2 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">
            Statistiques des Diplômes
          </h2>
          
          {/* Circular Progress Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <CircularProgress
              value={95}
              color="success"
              sublabel="Vérifiés"
            />
            <CircularProgress
              value={3}
              color="warning"
              sublabel="En Attente"
            />
            <CircularProgress
              value={2}
              color="destructive"
              sublabel="Non Vérifiés"
            />
          </div>

          {/* Monthly Chart */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase">
              Vérifications par Mois
            </h3>
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(45, 95%, 55%)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="px-4 mt-4">
        <div className="bg-card rounded-xl border border-border shadow-sm p-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">
              Notifications Récentes
            </h2>
            <span className="text-xs text-primary font-medium">Voir tout</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0" />
              <p className="text-sm text-foreground">
                Votre diplôme de Licence a été vérifié.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-info mt-2 flex-shrink-0" />
              <p className="text-sm text-foreground">
                Raoul : Vérifiez votre nouveau diplôme.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-4 pb-4">
        <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <button
            onClick={() => navigate("/scanner")}
            className="flex items-center gap-3 bg-success text-success-foreground rounded-xl p-4 transition-all hover:opacity-90"
          >
            <QrCode className="w-6 h-6" />
            <span className="text-sm font-semibold">Scanner</span>
          </button>
          
          <button
            onClick={() => navigate("/scanner")}
            className="flex items-center gap-3 bg-info text-info-foreground rounded-xl p-4 transition-all hover:opacity-90"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span className="text-sm font-semibold">Vérifier</span>
          </button>
          
          <button
            onClick={() => navigate("/payments")}
            className="flex items-center gap-3 bg-primary text-primary-foreground rounded-xl p-4 transition-all hover:opacity-90"
          >
            <CreditCard className="w-6 h-6" />
            <span className="text-sm font-semibold">Paiement</span>
          </button>
          
          <button
            onClick={() => navigate("/payments")}
            className="flex items-center gap-3 bg-warning text-warning-foreground rounded-xl p-4 transition-all hover:opacity-90"
          >
            <Clock className="w-6 h-6" />
            <span className="text-sm font-semibold">Historique</span>
          </button>
          
          <button
            onClick={() => navigate("/payments")}
            className="flex items-center gap-3 bg-secondary text-secondary-foreground rounded-xl p-4 transition-all hover:opacity-90"
          >
            <History className="w-6 h-6" />
            <span className="text-sm font-semibold">Vérifications</span>
          </button>
          
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 bg-muted text-foreground rounded-xl p-4 transition-all hover:opacity-90"
          >
            <Settings className="w-6 h-6" />
            <span className="text-sm font-semibold">Paramètres</span>
          </button>
        </div>
      </div>

      {/* Help Button */}
      <div className="px-4 pb-24">
        <button className="w-full flex items-center justify-center gap-2 bg-destructive text-destructive-foreground rounded-xl p-3 font-semibold transition-all hover:opacity-90">
          <HelpCircle className="w-5 h-5" />
          AIDE & SUPPORT
        </button>
      </div>
    </MobileLayout>
  );
}
