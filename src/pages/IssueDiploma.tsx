import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, Plus, GraduationCap, Calendar, FileText, QrCode } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { generateQrDataUrl } from "@/lib/qr";
import { z } from "zod";

const schema = z.object({
  reference: z.string().trim().min(3).max(60),
  holder_name: z.string().trim().min(2).max(120),
  holder_email: z.string().trim().email().optional().or(z.literal("")),
  diploma_type: z.string().trim().min(2).max(80),
  specialization: z.string().trim().max(120).optional(),
  institution: z.string().trim().min(2).max(120),
  year: z.string().trim().regex(/^\d{4}$/, "Année à 4 chiffres"),
  verification_fee: z.coerce.number().int().min(0).max(1_000_000),
});

interface Diploma {
  id: string;
  reference: string;
  qr_token: string;
  holder_name: string;
  diploma_type: string;
  specialization: string | null;
  institution: string;
  year: string;
  status: string;
  verification_fee: number;
  created_at: string;
}

export default function IssueDiploma() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [qrPreview, setQrPreview] = useState<{ token: string; dataUrl: string; reference: string } | null>(null);

  const [form, setForm] = useState({
    reference: "",
    holder_name: "",
    holder_email: "",
    diploma_type: "",
    specialization: "",
    institution: "",
    year: new Date().getFullYear().toString(),
    verification_fee: "5000",
  });

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("diplomas")
      .select("*")
      .eq("issued_by", user.id)
      .order("created_at", { ascending: false });
    setDiplomas((data ?? []) as Diploma[]);
  };

  useEffect(() => { load(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ ...form, verification_fee: form.verification_fee });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase
      .from("diplomas")
      .insert({
        issued_by: user!.id,
        reference: parsed.data.reference,
        holder_name: parsed.data.holder_name,
        holder_email: parsed.data.holder_email || null,
        diploma_type: parsed.data.diploma_type,
        specialization: parsed.data.specialization || null,
        institution: parsed.data.institution,
        year: parsed.data.year,
        verification_fee: parsed.data.verification_fee,
      })
      .select()
      .single();
    setSubmitting(false);

    if (error) {
      toast.error(error.message.includes("duplicate") ? "Ce numéro de référence existe déjà" : error.message);
      return;
    }
    toast.success("Diplôme émis avec succès");
    const dataUrl = await generateQrDataUrl(data.qr_token, 320);
    setQrPreview({ token: data.qr_token, dataUrl, reference: data.reference });
    setOpen(false);
    setForm({
      reference: "",
      holder_name: "",
      holder_email: "",
      diploma_type: "",
      specialization: "",
      institution: form.institution,
      year: new Date().getFullYear().toString(),
      verification_fee: "5000",
    });
    load();
  };

  return (
    <MobileLayout>
      <div className="header-gradient px-4 pt-6 pb-6 safe-top">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate("/")} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Shield className="w-5 h-5 text-accent" />
          <span className="text-white font-bold">Émission de diplômes</span>
        </div>
        <p className="text-white/70 text-xs">Créez un diplôme officiel avec QR code unique</p>
      </div>

      <div className="px-4 -mt-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-xl gap-2">
              <Plus className="w-5 h-5" /> Nouveau diplôme
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Émettre un diplôme</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Field label="Numéro de référence" v={form.reference}
                onChange={(v) => setForm({ ...form, reference: v })} placeholder="CAM-2024-LIC-00001" />
              <Field label="Nom du titulaire" v={form.holder_name}
                onChange={(v) => setForm({ ...form, holder_name: v })} placeholder="MBARGA Jean Pierre" />
              <Field label="Email du titulaire (optionnel)" v={form.holder_email}
                onChange={(v) => setForm({ ...form, holder_email: v })} placeholder="email@exemple.cm" type="email" />
              <Field label="Type de diplôme" v={form.diploma_type}
                onChange={(v) => setForm({ ...form, diploma_type: v })} placeholder="Licence" />
              <Field label="Spécialisation" v={form.specialization}
                onChange={(v) => setForm({ ...form, specialization: v })} placeholder="Informatique" />
              <Field label="Institution" v={form.institution}
                onChange={(v) => setForm({ ...form, institution: v })} placeholder="Université de Yaoundé I" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Année" v={form.year} onChange={(v) => setForm({ ...form, year: v })} placeholder="2024" />
                <Field label="Frais (XAF)" v={form.verification_fee}
                  onChange={(v) => setForm({ ...form, verification_fee: v })} type="number" placeholder="5000" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full h-11 bg-primary text-primary-foreground">
                {submitting ? "Émission..." : "Émettre le diplôme"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {qrPreview && (
        <div className="mx-4 mt-4 bg-success/10 border border-success/30 rounded-xl p-4 text-center animate-fade-in">
          <p className="text-xs text-muted-foreground uppercase">QR Code généré</p>
          <p className="font-bold text-foreground mb-3">{qrPreview.reference}</p>
          <img src={qrPreview.dataUrl} alt="QR" className="mx-auto w-40 h-40 rounded-lg border border-border" />
          <a href={qrPreview.dataUrl} download={`qr_${qrPreview.reference}.png`}
            className="text-xs text-primary font-medium underline mt-2 inline-block">
            Télécharger le QR
          </a>
        </div>
      )}

      <div className="px-4 mt-6 pb-24 space-y-3">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
          Diplômes émis ({diplomas.length})
        </h3>
        {diplomas.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-xl">
            Aucun diplôme émis pour le moment.
          </div>
        )}
        {diplomas.map((d) => (
          <div key={d.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <p className="font-semibold text-foreground truncate">{d.diploma_type} {d.specialization && `· ${d.specialization}`}</p>
                </div>
                <p className="text-sm text-foreground">{d.holder_name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <FileText className="w-3 h-3" /> {d.reference}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {d.year} · {d.institution}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                d.status === "active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              }`}>
                {d.status === "active" ? "Actif" : "Révoqué"}
              </span>
            </div>
            <button
              onClick={async () => {
                const url = await generateQrDataUrl(d.qr_token, 320);
                setQrPreview({ token: d.qr_token, dataUrl: url, reference: d.reference });
              }}
              className="text-xs text-primary font-medium mt-2 flex items-center gap-1"
            >
              <QrCode className="w-3 h-3" /> Voir le QR code
            </button>
          </div>
        ))}
      </div>
    </MobileLayout>
  );
}

function Field({ label, v, onChange, placeholder, type = "text" }: {
  label: string; v: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input value={v} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type} className="h-10" />
    </div>
  );
}
