import { useState, useCallback } from "react";
import { Shield, X } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { ScannerView } from "@/components/scanner/ScannerView";
import { DiplomaResult, DiplomaData } from "@/components/scanner/DiplomaResult";
import { PaymentFlow } from "@/components/scanner/PaymentFlow";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type ScannerStep = "scanning" | "result" | "payment";

// Simulated diploma data
const mockDiploma: DiplomaData = {
  id: "CAM-2024-LIC-00847",
  type: "Diplôme de Licence",
  holder: "MBARGA Jean Pierre",
  institution: "Université de Yaoundé I",
  year: "2023",
  specialization: "Informatique",
  isValid: true,
  verificationStatus: "pending",
  verificationFee: 30000,
};

export default function Scanner() {
  const navigate = useNavigate();
  const [step, setStep] = useState<ScannerStep>("scanning");
  const [isScanning, setIsScanning] = useState(false);
  const [diploma, setDiploma] = useState<DiplomaData | null>(null);

  const handleStartScan = useCallback(() => {
    setIsScanning(true);
  }, []);

  const handleScanComplete = useCallback(() => {
    setIsScanning(false);
    setDiploma(mockDiploma);
    setStep("result");
    toast.success("QR Code détecté!", {
      description: "Analyse du diplôme terminée",
    });
  }, []);

  const handleProceedToPayment = useCallback(() => {
    setStep("payment");
  }, []);

  const handleNewScan = useCallback(() => {
    setStep("scanning");
    setDiploma(null);
    setIsScanning(false);
  }, []);

  const handlePaymentComplete = useCallback(() => {
    toast.success("Vérification terminée!", {
      description: "Le diplôme a été vérifié avec succès",
    });
    navigate("/");
  }, [navigate]);

  const handleBack = useCallback(() => {
    if (step === "payment") {
      setStep("result");
    } else {
      navigate(-1);
    }
  }, [step, navigate]);

  return (
    <MobileLayout showNav={step === "scanning"}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="header-gradient px-4 py-4 safe-top">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-accent" />
              </div>
              <span className="text-white font-bold text-sm">CDAS</span>
            </div>
            {step !== "payment" && (
              <button
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content based on step */}
        {step === "scanning" && (
          <>
            <ScannerView isScanning={isScanning} onScanComplete={handleScanComplete} />
            {!isScanning && (
              <div className="p-4 pb-24">
                <button
                  onClick={handleStartScan}
                  className="w-full h-12 bg-info text-info-foreground rounded-xl font-semibold transition-all hover:bg-info/90"
                >
                  Démarrer le scan
                </button>
              </div>
            )}
          </>
        )}

        {step === "result" && diploma && (
          <DiplomaResult
            diploma={diploma}
            onProceedToPayment={handleProceedToPayment}
            onNewScan={handleNewScan}
          />
        )}

        {step === "payment" && diploma && (
          <PaymentFlow
            diploma={diploma}
            onBack={handleBack}
            onPaymentComplete={handlePaymentComplete}
          />
        )}
      </div>
    </MobileLayout>
  );
}
