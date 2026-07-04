import jsPDF from "jspdf";
import { generateQrDataUrl } from "./qr";

export interface AttestationData {
  attestation_number: string;   // e.g. 8735501EAAB3
  reference: string;
  qr_token: string;
  holder_name: string;
  birth_date: string | null;    // ISO
  birth_place: string | null;
  diploma_type: string;
  specialization: string | null;
  institution: string;
  year: string;                 // e.g. 2025/2026
  mention: string | null;
  issued_at: string;            // ISO
  pdf_hash?: string;            // optional footer trace
}

const BLUE = [10, 45, 110] as const;
const GOLD = [212, 175, 55] as const;
const RED = [192, 32, 45] as const;
const GREY = [110, 110, 110] as const;
const ROW_ALT = [244, 246, 250] as const;

function setColor(doc: jsPDF, kind: "text" | "fill" | "draw", rgb: readonly [number, number, number]) {
  const [r, g, b] = rgb;
  if (kind === "text") doc.setTextColor(r, g, b);
  else if (kind === "fill") doc.setFillColor(r, g, b);
  else doc.setDrawColor(r, g, b);
}

/**
 * Build the official CDAS attestation PDF as an ArrayBuffer.
 * Byte-deterministic (creation date + file id fixed) so its SHA-256 is stable.
 */
export async function buildAttestationPdf(data: AttestationData): Promise<ArrayBuffer> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  // Force deterministic metadata
  (doc as any).setCreationDate?.(new Date(0));
  (doc as any).setFileId?.("CDAS0000000000000000000000000001");

  const pw = doc.internal.pageSize.getWidth();

  // ============ Trilingual header ============
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setColor(doc, "text", BLUE);
  doc.text("REPUBLIQUE DU CAMEROUN", 30, 12);
  doc.text("REPUBLIC OF CAMEROON", pw - 30, 12, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  setColor(doc, "text", [40, 40, 40]);
  doc.text("Paix - Travail - Patrie", 30, 16);
  doc.text("Peace - Work - Fatherland", pw - 30, 16, { align: "right" });

  // Small underline decoration
  setColor(doc, "draw", [40, 40, 40]);
  doc.setLineWidth(0.2);
  doc.line(25, 18, 55, 18);
  doc.line(pw - 55, 18, pw - 25, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("MINISTERE DE L'ENSEIGNEMENT SUPERIEUR", 30, 22);
  doc.text("MINISTRY OF HIGHER EDUCATION", pw - 30, 22, { align: "right" });
  doc.text("UNIVERSITE DE DOUALA", 30, 26);
  doc.text("THE UNIVERSITY OF DOUALA", pw - 30, 26, { align: "right" });

  // Center institution
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setColor(doc, "text", BLUE);
  doc.text("IUT", pw / 2, 12, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  setColor(doc, "text", [40, 40, 40]);
  doc.text("THE UNIVERSITY INSTITUTE OF TECHNOLOGY", pw / 2, 16, { align: "center" });
  doc.text(data.institution, pw / 2, 20, { align: "center" });
  doc.text("Tel/Fax: (237) 33 40 24 82  E-mail: infos.iut@univ-douala.com", pw / 2, 24, { align: "center" });

  // Blue top rule
  setColor(doc, "fill", BLUE);
  doc.rect(15, 32, pw - 30, 1, "F");

  // ============ Title ============
  setColor(doc, "text", BLUE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("ATTESTATION DE REUSSITE", pw / 2, 46, { align: "center" });
  doc.setFont("helvetica", "italic");
  doc.setFontSize(14);
  doc.text("ATTESTATION", pw / 2, 54, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setColor(doc, "text", [40, 40, 40]);
  doc.text(`N°   ${data.attestation_number}`, pw / 2, 61, { align: "center" });

  // Gold rule
  setColor(doc, "fill", GOLD);
  doc.rect(15, 65, pw - 30, 0.7, "F");

  // ============ Body intro ============
  setColor(doc, "text", [30, 30, 30]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Je soussigné(e), Directeur de l'Institut, atteste que :", 20, 74);
  doc.setFont("helvetica", "italic");
  setColor(doc, "text", GREY);
  doc.setFontSize(9);
  doc.text("I undersigned, the Director of the University Institute of Technology, certify that:", 20, 79);

  // ============ Info rows (alternating background) ============
  const startY = 84;
  const rowH = 12;
  const labelX = 20;
  const valueX = 75;

  const rows: Array<{ fr: string; en: string; value: string; alt?: boolean; valueColor?: readonly [number, number, number]; bold?: boolean }> = [
    { fr: "M. / Mlle :", en: "Mr. / Mrs :", value: data.holder_name.toUpperCase(), alt: true, bold: true },
    {
      fr: "Né(e) le :",
      en: "Born on the :",
      value: formatBirth(data.birth_date, data.birth_place),
    },
    {
      fr: "Pour le compte de l'Année Académique :",
      en: "Academic Year :",
      value: data.year,
      alt: true,
    },
    {
      fr: "A obtenu(e) le Diplôme :",
      en: "Has obtained the Diploma :",
      value: data.diploma_type,
      bold: true,
    },
    {
      fr: "Spécialité :",
      en: "Speciality :",
      value: (data.specialization ?? "—").toUpperCase(),
      alt: true,
      bold: true,
    },
    {
      fr: "Mention :",
      en: "Grade :",
      value: (data.mention ?? "PASSABLE").toUpperCase(),
      valueColor: RED,
      bold: true,
    },
  ];

  let y = startY;
  rows.forEach((row) => {
    if (row.alt) {
      setColor(doc, "fill", ROW_ALT);
      doc.rect(15, y - 4, pw - 30, rowH, "F");
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setColor(doc, "text", [30, 30, 30]);
    doc.text(row.fr, labelX, y);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    setColor(doc, "text", GREY);
    doc.text(row.en, labelX, y + 4);

    doc.setFont("helvetica", row.bold ? "bold" : "normal");
    doc.setFontSize(row.bold ? 12 : 11);
    setColor(doc, "text", row.valueColor ?? [15, 15, 15]);
    doc.text(row.value, valueX, y + 2);
    y += rowH;
  });

  // Gold rule
  setColor(doc, "fill", GOLD);
  doc.rect(15, y + 4, pw - 30, 0.5, "F");

  // ============ Closing ============
  y += 14;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  setColor(doc, "text", [30, 30, 30]);
  doc.text("En foi de quoi, la présente attestation lui est délivrée pour servir et valoir ce que de droit.", pw / 2, y, { align: "center" });
  doc.setFontSize(9);
  setColor(doc, "text", GREY);
  doc.text("In witness whereof, this attestation is issued to serve the purpose for which it is intended.", pw / 2, y + 5, { align: "center" });

  // Date + signature
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setColor(doc, "text", [30, 30, 30]);
  const issued = new Date(data.issued_at);
  const dateLine = `Douala, le ${issued.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`;
  doc.text(dateLine, pw - 25, y, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Le Directeur", pw - 40, y + 10, { align: "center" });
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  setColor(doc, "text", GREY);
  doc.text("The Director", pw - 40, y + 15, { align: "center" });
  setColor(doc, "draw", [50, 50, 50]);
  doc.setLineWidth(0.3);
  doc.line(pw - 65, y + 30, pw - 15, y + 30);

  // ============ QR code ============
  const qrDataUrl = await generateQrDataUrl(data.qr_token, 400);
  doc.addImage(qrDataUrl, "PNG", 18, y + 5, 30, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setColor(doc, "text", [40, 40, 40]);
  doc.text("Scanner pour vérifier", 33, y + 39, { align: "center" });

  // Footer: hash & signature trace (small)
  setColor(doc, "text", [150, 150, 150]);
  doc.setFontSize(6);
  doc.text(
    `CDAS · Ref ${data.reference} · Empreinte ${(data.pdf_hash ?? "").slice(0, 16)}...`,
    pw / 2,
    290,
    { align: "center" }
  );

  return doc.output("arraybuffer");
}

function formatBirth(iso: string | null, place: string | null): string {
  if (!iso && !place) return "—";
  const d = iso ? new Date(iso).toISOString().slice(0, 10) : "—";
  return `${d}     A :  ${place ?? "—"}`;
}

/** Trigger a browser download for a PDF ArrayBuffer. */
export function downloadPdf(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
