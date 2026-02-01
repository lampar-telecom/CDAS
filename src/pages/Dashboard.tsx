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
  XCircle,
  Wallet,
} from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { StatCard } from "@/components/ui/stat-card";
import { ActionButton } from "@/components/ui/action-button";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      {/* Header */}
      <div className="header-gradient px-4 pt-8 pb-12 safe-top">
        <div className="flex items-center gap-3 mb-4 animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs">Bienvenue sur</p>
            <h1 className="text-white font-bold text-lg">CDAS</h1>
          </div>
        </div>
        <p className="text-white/90 text-sm font-medium animate-fade-in">
          Système de Vérification des Diplômes du Cameroun
        </p>
      </div>

      {/* Stats Grid */}
      <div className="px-4 -mt-6">
        <div className="grid grid-cols-2 gap-3 animate-slide-up">
          <StatCard
            title="Diplômes vérifiés"
            value="1,254"
            subtitle="Ce mois"
            icon={<CheckCircle2 className="w-5 h-5" />}
            variant="success"
          />
          <StatCard
            title="En attente"
            value="48"
            subtitle="En traitement"
            icon={<AlertCircle className="w-5 h-5" />}
            variant="warning"
          />
          <StatCard
            title="Rejetés"
            value="12"
            subtitle="Non conformes"
            icon={<XCircle className="w-5 h-5" />}
            variant="destructive"
          />
          <StatCard
            title="Paiements"
            value="27"
            subtitle="7 derniers jours"
            icon={<Wallet className="w-5 h-5" />}
            variant="info"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
          Actions rapides
        </h2>
        <div className="grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <ActionButton
            label="Scanner un diplôme"
            icon={<QrCode className="w-5 h-5" />}
            variant="success"
            onClick={() => navigate("/scanner")}
          />
          <ActionButton
            label="Vérifier diplôme"
            icon={<Shield className="w-5 h-5" />}
            variant="info"
            onClick={() => navigate("/scanner")}
          />
          <ActionButton
            label="Paiement"
            icon={<CreditCard className="w-5 h-5" />}
            variant="accent"
            onClick={() => navigate("/payments")}
          />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <ActionButton
            label="Historique"
            icon={<Clock className="w-5 h-5" />}
            variant="primary"
            onClick={() => navigate("/payments")}
          />
          <ActionButton
            label="Vérifications"
            icon={<History className="w-5 h-5" />}
            variant="warning"
            onClick={() => navigate("/payments")}
          />
          <ActionButton
            label="Paramètres"
            icon={<Settings className="w-5 h-5" />}
            variant="primary"
            onClick={() => navigate("/profile")}
          />
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="px-4 mt-6 pb-4">
        <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
          Notifications récentes
        </h2>
        <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="bg-card rounded-xl p-3 flex items-center gap-3 shadow-sm border border-border">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                Diplôme de Licence vérifié
              </p>
              <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
            </div>
          </div>
          <div className="bg-card rounded-xl p-3 flex items-center gap-3 shadow-sm border border-border">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                Demande en cours de traitement
              </p>
              <p className="text-xs text-muted-foreground">Il y a 5 heures</p>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
