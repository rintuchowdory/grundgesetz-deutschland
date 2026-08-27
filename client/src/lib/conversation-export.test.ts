import { describe, expect, it } from "vitest";
import { createConversationPdf } from "./conversation-export";

describe("conversation PDF export", () => {
  it("creates a non-empty PDF for a question and answer", () => {
    const pdf = createConversationPdf("Artikel 5 GG", [
      { role: "user", content: "Was schützt Artikel 5 GG?" },
      { role: "assistant", content: "## Einordnung\nDie Meinungsfreiheit ist geschützt.\n\n## Quelle und Grenze\nArt. 5 GG prüfen." },
    ]);

    const bytes = pdf.output("arraybuffer");
    expect(pdf.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    expect(bytes.byteLength).toBeGreaterThan(500);
  });
});
