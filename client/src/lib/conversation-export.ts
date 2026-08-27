import jsPDF from "jspdf";

export type ExportMessage = { role: "user" | "assistant"; content: string };

export function createConversationPdf(title: string, messages: ExportMessage[]) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  let y = 24;
  const addWrapped = (text: string, fontSize: number, color: [number, number, number], gap = 7) => {
    pdf.setFontSize(fontSize);
    pdf.setTextColor(...color);
    const lines = pdf.splitTextToSize(text, pageWidth - margin * 2) as string[];
    if (y + lines.length * gap > pageHeight - 20) {
      pdf.addPage();
      y = 22;
    }
    pdf.text(lines, margin, y);
    y += lines.length * gap;
  };

  pdf.setDrawColor(184, 75, 61);
  pdf.setLineWidth(1.2);
  pdf.line(margin, 14, pageWidth - margin, 14);
  addWrapped("Grundgesetz Deutschland", 20, [24, 50, 75], 9);
  addWrapped(title, 12, [184, 75, 61], 7);
  y += 6;
  messages.forEach(message => {
    addWrapped(message.role === "user" ? "FRAGE" : "ANTWORT", 9, [184, 75, 61], 5);
    addWrapped(message.content, 11, [35, 45, 50], 6);
    y += 7;
  });
  addWrapped("Quelle und Grenze", 9, [184, 75, 61], 5);
  addWrapped("KI-Einordnung, keine Rechtsberatung. Antworten mit dem aktuellen amtlichen Gesetzestext prüfen. Keine vertraulichen oder personenbezogenen Informationen eingeben.", 9, [100, 105, 105], 5);
  return pdf;
}

export function downloadConversationPdf(title: string, messages: ExportMessage[]) {
  const safeName = title.toLowerCase().replace(/[^a-z0-9äöüß]+/gi, "-").replace(/^-|-$/g, "") || "grundgesetz-gespraech";
  createConversationPdf(title, messages).save(`${safeName}.pdf`);
}
