import jsPDF from "jspdf";
import { generateQrDataUrl } from "./qr";

export interface AttestationData {
  reference: string;
  qr_token: string;
  holder_name: string;
  diploma_type: string;
  specialization: string | null;
  institution: string;
  year: string;
  issued_at: string;
}

export async function generateAttestationPdf(data: AttestationData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(10, 35, 66);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("CDAS", 15, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Cameroon Diploma Authentication System", 15, 25);
  doc.setFontSize(8);
  doc.text("Attestation Numérique Officielle", 15, 30);

  // Title
  doc.setTextColor(10, 35, 66);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("ATTESTATION DE DIPLÔME", pageWidth / 2, 55, { align: "center" });

  doc.setDrawColor(218, 165, 32);
  doc.setLineWidth(0.6);
  doc.line(40, 60, pageWidth - 40, 60);

  // Body
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const lines: [string, string][] = [
    ["Numéro de référence", data.reference],
    ["Titulaire", data.holder_name],
    ["Type de diplôme", data.diploma_type],
    ["Spécialisation", data.specialization ?? "—"],
    ["Institution", data.institution],
    ["Année d'obtention", data.year],
    ["Délivré le", new Date(data.issued_at).toLocaleDateString("fr-FR")],
  ];

  let y = 80;
  lines.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label} :`, 25, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, 80, y);
    y += 10;
  });

  // QR code
  const qrDataUrl = await generateQrDataUrl(data.qr_token, 400);
  doc.addImage(qrDataUrl, "PNG", pageWidth - 65, 80, 45, 45);
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Scannez pour vérifier", pageWidth - 42.5, 130, { align: "center" });

  // Footer
  doc.setDrawColor(218, 165, 32);
  doc.line(15, 270, pageWidth - 15, 270);
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Ce document peut être vérifié sur l'application CDAS via le QR code ou le numéro de référence.",
    pageWidth / 2,
    278,
    { align: "center" }
  );
  doc.text(
    `Code de sécurité : ${data.qr_token.slice(0, 8).toUpperCase()}`,
    pageWidth / 2,
    284,
    { align: "center" }
  );

  doc.save(`attestation_${data.reference}.pdf`);
}
