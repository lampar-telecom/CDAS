import { useState } from "react";
import { ChevronDown, CheckCircle2, XCircle, Clock, Filter } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  title: string;
  amount: number;
  status: "success" | "expired" | "pending" | "free";
  date: string;
}

const payments: Payment[] = [
  {
    id: "1",
    title: "Vérification Diplôme Licence",
    amount: 30000,
    status: "expired",
    date: "15 Oct 2024",
  },
  {
    id: "2",
    title: "Vérification Diplôme Master",
    amount: 0,
    status: "free",
    date: "12 Oct 2024",
  },
  {
    id: "3",
    title: "Réabonnement Service Premium",
    amount: 10000,
    status: "pending",
    date: "10 Oct 2024",
  },
  {
    id: "4",
    title: "Vérification Diplôme BTS",
    amount: 15000,
    status: "success",
    date: "08 Oct 2024",
  },
  {
    id: "5",
    title: "Vérification Diplôme Licence",
    amount: 30000,
    status: "success",
    date: "05 Oct 2024",
  },
];

const statusConfig = {
  success: {
    icon: CheckCircle2,
    label: "Payé",
    className: "bg-success/10 text-success",
  },
  expired: {
    icon: XCircle,
    label: "Expiré",
    className: "bg-destructive/10 text-destructive",
  },
  pending: {
    icon: Clock,
    label: "En cours",
    className: "bg-warning/10 text-warning",
  },
  free: {
    icon: CheckCircle2,
    label: "Gratuit",
    className: "bg-info/10 text-info",
  },
};

export default function Payments() {
  const [selectedPeriod, setSelectedPeriod] = useState("Octobre 2024");

  const stats = {
    paid: 95,
    pending: 3,
    expired: 2,
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="header-gradient px-4 pt-8 pb-6 safe-top">
        <h1 className="text-xl font-bold text-white mb-4 animate-fade-in">
          Historique des Paiements
        </h1>

        {/* Stats Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 animate-slide-up">
          <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-white text-sm font-medium">{stats.paid}% Payés</span>
          </div>
          <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-white text-sm font-medium">{stats.pending}% En cours</span>
          </div>
          <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-white text-sm font-medium">{stats.expired}% Expirés</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm font-medium text-foreground">
            <span>{selectedPeriod}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className="p-2 bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Payment List */}
      <div className="px-4 py-4 space-y-3">
        {payments.map((payment, index) => {
          const config = statusConfig[payment.status];
          const Icon = config.icon;

          return (
            <div
              key={payment.id}
              className="bg-card rounded-xl p-4 shadow-sm border border-border animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm truncate">
                    {payment.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {payment.date}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-foreground">
                    {payment.amount > 0
                      ? `${payment.amount.toLocaleString()} XAF`
                      : "Gratuit"}
                  </p>
                  <div
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1",
                      config.className
                    )}
                  >
                    <Icon className="w-3 h-3" />
                    {config.label}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </MobileLayout>
  );
}
