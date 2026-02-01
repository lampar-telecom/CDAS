import { Home, QrCode, CreditCard, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Accueil", path: "/" },
  { icon: QrCode, label: "Scanner", path: "/scanner" },
  { icon: CreditCard, label: "Paiements", path: "/payments" },
  { icon: User, label: "Profil", path: "/profile" },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="bottom-nav safe-bottom">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "animate-scale-in")} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
