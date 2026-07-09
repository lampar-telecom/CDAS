import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Shield, X, Search, Camera, Keyboard, FileUp, Loader2 } from "lucide-react";
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
import { sha256File } from "@/lib/crypto";
import { buildAttestationPdf, downloadPdf } from "@/lib/pdf";

type Step = "scan" | "result" | "payment" | "certified";
type Mode = "camera" | "manual" | "upload";

const SCANNER_ELEMENT_ID = "cdas-qr-reader";

export default function Scanner() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [step, setStep] = useState<Step>("scan");
  const [mode, setMode] = useState<Mode>("camera");
  const [manualValue, setManualValue] = useState("");
  const [diploma, setDiploma] = useState<DiplomaData | null>(null);
  const [diplomaRow, setDiplomaRow] = useState<any | null>(null);
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
    async (rawValue: string, queryType: "qr" | "reference" | "pdf_hash") => {
      if (!user || isProcessingRef.current) return;
      isProcessingRef.current = true;
      setSearching(true);

      let token: string | null = null;
      if (queryType === "qr") token = parseQrPayload(rawValue);

      let query = supabase.from("diplomas").select("*").limit(1);
      if (queryType === "qr" && token) query = query.eq("qr_token", token);
      else if (queryType === "pdf_hash") query = query.eq("pdf_hash", rawValue);
      else query = query.eq("reference", rawValue.trim());

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
        setDiplomaRow(data);
        setStep("result");
        await stopScanner();
      } else {
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
          { fps: 15, qrbox: { width: 260, height: 260 }, aspectRatio: 1.0 },
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
    setDiplomaRow(null);
    setVerificationId(null);
    setStep("scan");
    isProcessingRef.current = false;
  };

  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handlePaymentComplete = async () => {
    if (verificationId) {
      supabase.from("verifications").update({ paid: true, payment_method: "mobile_money" }).eq("id", verificationId).then(() => {});
    }
    setStep("certified");
  };

  const handleDownloadCertified = async () => {
    if (!diplomaRow || generatingPdf) return;
    setGeneratingPdf(true);
    try {
      const d = diplomaRow;
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const { data: verifierProfile } = await supabase
        .from("profiles").select("full_name").eq("id", authUser?.id ?? "").maybeSingle();
      const pdfBuf = await buildAttestationPdf(
        {
          attestation_number: d.attestation_number ?? d.qr_token?.slice(0, 12) ?? "",
          reference: d.reference,
          sub_reference: d.sub_reference,
          qr_token: d.qr_token,
          holder_name: d.holder_name,
          sexe: d.sexe,
          matricule: d.matricule,
          birth_date: d.birth_date,
          birth_place: d.birth_place,
          diploma_type: d.diploma_type,
          specialization: d.specialization,
          institution: d.institution,
          year: d.year,
          mention: d.mention,
          grade_letter: d.grade_letter,
          credits: d.credits,
          jury_session: d.jury_session,
          director_name: d.director_name,
          issued_at: d.validated_at ?? d.created_at,
          pdf_hash: d.pdf_hash ?? "",
        },
        {
          verifier_name: verifierProfile?.full_name ?? "Vérificateur CDAS",
          verifier_email: authUser?.email ?? null,
          verified_at: new Date().toISOString(),
          transaction_id: verificationId ?? "cdas",
          amount: d.verification_fee ?? 10000,
          pdf_hash: d.pdf_hash ?? "",
        }
      );
      downloadPdf(pdfBuf, `certificat_${d.reference}.pdf`);
      toast.success("Certificat téléchargé", { description: "Diplôme avec cachet VÉRIFIÉ · CDAS." });
    } catch (e) {
      console.error(e);
      toast.error("Impossible de générer le certificat");
    } finally {
      setGeneratingPdf(false);
    }
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
              <div className="grid grid-cols-3 gap-2 bg-secondary p-1 rounded-xl">
                <button onClick={() => setMode("camera")}
                  className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    mode === "camera" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                  }`}>
                  <Camera className="w-4 h-4" /> QR
                </button>
                <button onClick={() => setMode("manual")}
                  className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    mode === "manual" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                  }`}>
                  <Keyboard className="w-4 h-4" /> ID
                </button>
                <button onClick={() => setMode("upload")}
                  className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    mode === "upload" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                  }`}>
                  <FileUp className="w-4 h-4" /> PDF
                </button>
              </div>
            </div>

            {mode === "camera" && (
              <div className="flex-1 flex flex-col items-center justify-start p-4">
                <div className="relative w-full max-w-xs aspect-square rounded-2xl overflow-hidden bg-black">
                  <div id={SCANNER_ELEMENT_ID} className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />
                  <div className="pointer-events-none absolute inset-6 border-2 border-info rounded-xl" />
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  {searching ? "Analyse en cours..." : "Cadrez le QR code du diplôme"}
                </p>
              </div>
            )}

            {mode === "manual" && (
              <form onSubmit={handleManualSubmit} className="flex-1 flex flex-col p-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Numéro de référence du diplôme
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input value={manualValue} onChange={(e) => setManualValue(e.target.value)}
                      placeholder="Ex : IUT-2026-ATT-00847" className="h-12 pl-10 rounded-xl" />
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

            {mode === "upload" && (
              <div className="flex-1 flex flex-col p-4 gap-4">
                <div className="border-2 border-dashed border-primary/30 rounded-2xl p-6 text-center bg-primary/5">
                  <FileUp className="w-10 h-10 text-primary mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground mb-1">Téléverser un PDF</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Le fichier est haché (SHA-256) puis comparé au registre CDAS.
                  </p>
                  <label className="inline-block">
                    <input type="file" accept="application/pdf" className="hidden"
                      disabled={searching}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setSearching(true);
                        try {
                          const hash = await sha256File(file);
                          toast.info("Empreinte calculée", { description: hash.slice(0, 24) + "..." });
                          await lookupDiploma(hash, "pdf_hash");
                        } catch (err) {
                          toast.error("Impossible de hacher le fichier");
                          setSearching(false);
                        }
                        e.target.value = "";
                      }} />
                    <span className="inline-flex items-center gap-2 px-4 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold cursor-pointer">
                      {searching ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyse...</> : <>Choisir un fichier</>}
                    </span>
                  </label>
                </div>
                <div className="text-xs text-muted-foreground bg-info/5 border border-info/20 rounded-xl p-3">
                  <p className="font-semibold text-foreground mb-1">Comment ça marche ?</p>
                  1. On calcule l'empreinte SHA-256 du PDF.<br />
                  2. On l'interroge dans le registre blockchain CDAS.<br />
                  3. Si l'empreinte correspond, le diplôme est authentique.
                </div>
              </div>
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
