export type ArticleSource = {
  id: string;
  label: string;
  text: string;
};

export const officialGrundgesetzUrl = "https://www.gesetze-im-internet.de/gg/";
export const supportedSourceIds = ["1", "3", "5", "20", "79", "146"] as const;

const sourceTexts: Record<string, string> = {
  "1": "Die Würde des Menschen ist unantastbar. Sie zu achten und zu schützen ist Verpflichtung aller staatlichen Gewalt.",
  "3": "Alle Menschen sind vor dem Gesetz gleich. Männer und Frauen sind gleichberechtigt.",
  "5": "Jeder hat das Recht, seine Meinung in Wort, Schrift und Bild frei zu äußern und zu verbreiten.",
  "20": "Die Bundesrepublik Deutschland ist ein demokratischer und sozialer Bundesstaat. Alle Staatsgewalt geht vom Volke aus.",
  "79": "Dieses Grundgesetz kann nur durch ein Gesetz geändert werden, das den Wortlaut des Grundgesetzes ausdrücklich ändert oder ergänzt.",
  "146": "Dieses Grundgesetz, das nach Vollendung der Einheit und Freiheit Deutschlands für das gesamte deutsche Volk gilt, verliert seine Gültigkeit an dem Tage, an dem eine Verfassung in Kraft tritt.",
};

export function getArticleSource(articleId: string, label: string): ArticleSource {
  return {
    id: articleId,
    label,
    text: sourceTexts[articleId] || "Der vollständige amtliche Wortlaut ist über die offizielle Quelle abrufbar. Der Vergleich zeigt hier den Artikelbezug und verweist für den Originaltext auf die amtliche Fassung.",
  };
}

export function getArticleSourceUrl(articleId: string) {
  return `${officialGrundgesetzUrl}art_${articleId}.html`;
}
