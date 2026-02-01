import { useState } from "react";
import { Focus, Flashlight, FlashlightOff, X } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Scanner() {
  const navigate = useNavigate();
  const [flashOn, setFlashOn] = useState(false);

  const handleScan = () => {
    // Simulate scan result
    toast.success("QR Code scanné avec succès!", {
      description: "Diplôme de Licence en Informatique - Université de Yaoundé I",
    });
  };

  return (
    <MobileLayout>
      <div className="min-h-screen bg-foreground relative overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 safe-top">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h1 className="text-white font-semibold">Scanner QR Code</h1>
            <button
              onClick={() => setFlashOn(!flashOn)}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white"
            >
              {flashOn ? (
                <Flashlight className="w-5 h-5 text-accent" />
              ) : (
                <FlashlightOff className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Simulated Camera View */}
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/90 via-foreground/70 to-foreground/90">
          {/* Camera placeholder pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: `radial-gradient(circle, hsl(var(--muted-foreground)) 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }} />
          </div>
        </div>

        {/* QR Frame */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative animate-pulse-soft">
            {/* Frame corners */}
            <div className="w-64 h-64 relative">
              {/* Top left */}
              <div className="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-primary rounded-tl-xl" />
              {/* Top right */}
              <div className="absolute top-0 right-0 w-12 h-12 border-r-4 border-t-4 border-primary rounded-tr-xl" />
              {/* Bottom left */}
              <div className="absolute bottom-0 left-0 w-12 h-12 border-l-4 border-b-4 border-primary rounded-bl-xl" />
              {/* Bottom right */}
              <div className="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-primary rounded-br-xl" />
              
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                  <Focus className="w-8 h-8 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-32 left-0 right-0 text-center px-6">
          <div className="inline-block bg-black/50 backdrop-blur-md rounded-full px-6 py-3">
            <p className="text-white text-sm font-medium">
              CADREZ LE QR CODE DU DIPLÔME
            </p>
            <p className="text-white/70 text-xs mt-1">
              Alignez le cadre avec le QR code
            </p>
          </div>
        </div>

        {/* Manual scan button (for demo) */}
        <div className="absolute bottom-24 left-0 right-0 px-6">
          <Button 
            onClick={handleScan}
            className="w-full h-12 bg-primary text-primary-foreground font-semibold"
          >
            Simuler un scan
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
