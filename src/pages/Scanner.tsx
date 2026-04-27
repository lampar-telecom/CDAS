import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Shield, X, Search, Camera, Keyboard } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { DiplomaResult, DiplomaData } from "@/components/scanner/DiplomaResult";
import { PaymentFlow } from "@/components/scanner/PaymentFlow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { parseQrPayload } from "@/lib/qr";
import { useAuth } from "@/contexts/AuthContext";

type Step = "scan" | "result" | "payment";
type Mode = "camera" | "manual";

const SCANNER_ELEMENT_ID = "cdas-qr-reader";

export default function Scanner() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [step, setStep] = useState<Step>("scan");
  const [mode, setMode] = useState<Mode>("camera");
  const [manualValue, setManualValue] = useState("");
  const [diploma, setDiploma] = useState<DiplomaData | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
  }, []);

  const lookupDiploma = useCallback(
    async (rawValue: string, queryType: "qr" | "reference") => {
      if (!user || isProcessingRef.current) return;
      isProcessingRef.current = true;
      setSearching(true);

      let token: string | null = null;
      if (queryType === "qr") token = parseQrPayload(rawValue);

      let query = supabase.from("diplomas").select("*").limit(1);
      if (queryType === "qr" && token) {
        query = query.eq("qr_token", token);
      } else {
        query = query.eq("reference", rawValue.trim());
      }

      const { data, error } = await query.maybeSingle();

      let result: "authentic" | "invalid" | "not_found";
      let diplomaData: DiplomaData | null = null;

      if (error || !data) {
        result = "not_found";
        toast.error("Diplôme introuvable", { description: "Aucune correspondance dans la base officielle." });
      } else if (data.status === "revoked") {
        result = "invalid";
        diplomaData = mapToDiploma(data);
        toast.warning("Diplôme révoqué");
      } else {
        result = "authentic";
        diplomaData = mapToDiploma(data);
        toast.success("Diplôme authentique");
      }

      // Log verification (only verifiers can insert per RLS)
      if (role === "verifier") {
        const { data: ins } = await supabase
          .from("verifications")
          .insert({
            verifier_id: user.id,
            diploma_id: data?.id ?? null,
            query_value: rawValue,
            query_type: queryType,
            result,
            amount: data?.verification_fee ?? 0,
          })
          .select()
          .single();
        if (ins) setVerificationId(ins.id);
      }

      setSearching(false);
      isProcessingRef.current = false;

      if (diplomaData) {
        setDiploma(diplomaData);
        setStep("result");
        await stopScanner();
      } else {
        // Reset to allow another attempt
        setTimeout(() => { isProcessingRef.current = false; }, 1500);
      }
    },
    [user, role, stopScanner]
  );

  // Camera scanner
  useEffect(() => {
    if (step !== "scan" || mode !== "camera") return;

    const start = async () => {
      try {
        const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            if (!isProcessingRef.current) lookupDiploma(decoded, "qr");
          },
          () => {}
        );
      } catch (err) {
        console.error("Camera error:", err);
        toast.error("Caméra inaccessible", {
          description: "Utilisez la saisie manuelle.",
        });
        setMode("manual");
      }
    };
    start();

    return () => {
      stopScanner();
    };
  }, [step, mode, lookupDiploma, stopScanner]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualValue.trim()) return;
    lookupDiploma(manualValue, "reference");
  };

  const handleProceedToPayment = () => setStep("payment");

  const handleNewScan = () => {
    setDiploma(null);
    setVerificationId(null);
    setStep("scan");
    isProcessingRef.current = false;
  };

  const handlePaymentComplete = async () => {
    if (verificationId) {
      await supabase.from("verifications").update({ paid: true, payment_method: "mobile_money" }).eq("id", verificationId);
    }
    toast.success("Vérification finalisée !");
    navigate("/history");
  };

  const handleBack = () => {
    if (step === "payment") setStep("result");
    else navigate(-1);
  };

  return (
    <MobileLayout showNav={step === "scan"}>
      <div className="min-h-screen bg-background flex flex-col">
        <div className="header-gradient px-4 py-4 safe-top">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-accent" />
              </div>
              <span className="text-white font-bold text-sm">CDAS — Vérification</span>
            </div>
            {step !== "payment" && (
              <button onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {step === "scan" && (
          <div className="flex-1 flex flex-col">
            {/* Mode tabs */}
            <div className="px-4 pt-4">
              <div className="grid grid-cols-2 gap-2 bg-secondary p-1 rounded-xl">
                <button onClick={() => setMode("camera")}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === "camera" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                  }`}>
                  <Camera className="w-4 h-4" /> Scanner QR
                </button>
                <button onClick={() => setMode("manual")}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === "manual" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                  }`}>
                  <Keyboard className="w-4 h-4" /> Saisir l'ID
                </button>
              </div>
            </div>

            {mode === "camera" ? (
              <div className="flex-1 flex flex-col items-center justify-start p-4">
                <div className="relative w-full max-w-xs aspect-square rounded-2xl overflow-hidden bg-black">
                  <div id={SCANNER_ELEMENT_ID} className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />
                  <div className="pointer-events-none absolute inset-6 border-2 border-info rounded-xl" />
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  {searching ? "Analyse en cours..." : "Cadrez le QR code du diplôme"}
                </p>
              </div>
            ) : (
              <form onSubmit={handleManualSubmit} className="flex-1 flex flex-col p-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Numéro de référence du diplôme
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input value={manualValue} onChange={(e) => setManualValue(e.target.value)}
                      placeholder="Ex : CAM-2024-LIC-00847" className="h-12 pl-10 rounded-xl" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Saisissez le numéro de référence imprimé sur le diplôme.
                  </p>
                </div>
                <Button type="submit" disabled={searching || !manualValue.trim()}
                  className="h-12 bg-primary text-primary-foreground font-semibold rounded-xl">
                  {searching ? "Recherche..." : "Vérifier"}
                </Button>
              </form>
            )}

            {role !== "verifier" && (
              <div className="mx-4 mb-24 p-3 bg-warning/10 border border-warning/30 rounded-xl text-xs text-foreground">
                Astuce : pour enregistrer vos vérifications dans l'historique, créez un compte avec le rôle « Vérificateur ».
              </div>
            )}
          </div>
        )}

        {step === "result" && diploma && (
          <DiplomaResult diploma={diploma} onProceedToPayment={handleProceedToPayment} onNewScan={handleNewScan} />
        )}

        {step === "payment" && diploma && (
          <PaymentFlow diploma={diploma} onBack={handleBack} onPaymentComplete={handlePaymentComplete} />
        )}
      </div>
    </MobileLayout>
  );
}

function mapToDiploma(d: any): DiplomaData {
  return {
    id: d.reference,
    type: d.diploma_type,
    holder: d.holder_name,
    institution: d.institution,
    year: d.year,
    specialization: d.specialization ?? "",
    isValid: d.status === "active",
    verificationStatus: d.status === "active" ? "pending" : "rejected",
    verificationFee: d.verification_fee ?? 5000,
  };
}
