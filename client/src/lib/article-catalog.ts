export type ArticleEntry = {
  id: string;
  label: string;
  section: string;
  title: string;
  fallen?: boolean;
};

const sectionFor = (number: number, label = String(number)) => {
  if (label === "53a") return "IVa · Gemeinsamer Ausschuss";
  if (/^91[a-z]/.test(label)) return "VIIIa · Gemeinschaftsaufgaben";
  if (/^104[a-z]/.test(label)) return "X · Das Finanzwesen";
  if (/^115[a-z]/.test(label)) return "Xa · Verteidigungsfall";
  if (number <= 19) return "I · Die Grundrechte";
  if (number <= 37) return "II · Der Bund und die Länder";
  if (number <= 49) return "III · Der Bundestag";
  if (number <= 53) return "IV · Der Bundesrat";
  if (number <= 61) return "V · Der Bundespräsident";
  if (number <= 69) return "VI · Die Bundesregierung";
  if (number <= 82) return "VII · Die Gesetzgebung des Bundes";
  if (number <= 91) return "VIII · Bundesverwaltung";
  if (number <= 104) return "IX · Die Rechtsprechung";
  if (number <= 115) return "X · Das Finanzwesen";
  return "XI · Übergangs- und Schlussbestimmungen";
};

const knownTitles: Record<number, string> = {
  1: "Menschenwürde und Grundbindung",
  2: "Freie Entfaltung und körperliche Unversehrtheit",
  3: "Gleichheit vor dem Gesetz",
  4: "Glaubens-, Gewissens- und Bekenntnisfreiheit",
  5: "Meinungs-, Presse- und Informationsfreiheit",
  6: "Schutz von Ehe und Familie",
  7: "Schulwesen",
  8: "Versammlungsfreiheit",
  9: "Vereinigungs- und Koalitionsfreiheit",
  10: "Brief-, Post- und Fernmeldegeheimnis",
  11: "Freizügigkeit",
  12: "Berufsfreiheit",
  13: "Unverletzlichkeit der Wohnung",
  14: "Eigentum und Erbrecht",
  15: "Vergesellschaftung",
  16: "Staatsangehörigkeit und Auslieferung",
  17: "Petitionsrecht",
  18: "Verwirkung von Grundrechten",
  19: "Einschränkung von Grundrechten",
  20: "Verfassungsgrundsätze und Widerstandsrecht",
  21: "Parteien",
  22: "Bundeshauptstadt und Bundesflagge",
  23: "Europäische Union",
  24: "Übertragung von Hoheitsrechten",
  25: "Völkerrecht und Bundesrecht",
  26: "Friedenssicherung und Angriffskrieg",
  27: "Handelsschiffe",
  28: "Verfassungsmäßige Ordnung der Länder",
  29: "Neugliederung des Bundesgebietes",
  30: "Zuständigkeit der Länder",
  31: "Vorrang des Bundesrechts",
  32: "Auswärtige Beziehungen",
  33: "Staatsbürgerliche Rechte und öffentlicher Dienst",
  34: "Amtshaftung",
  35: "Rechtshilfe und Katastrophenhilfe",
  36: "Bundeswehr und Streitkräfte",
  37: "Bundeszwang",
};

const specialArticles: Array<[string, number, string, boolean?]> = [
  ["12a", 12, "Wehr- und Dienstpflicht", false], ["16a", 16, "Asylrecht", false], ["17a", 17, "Einschränkung von Grundrechten bei Dienstpflichten", false],
  ["20a", 20, "Schutz der natürlichen Lebensgrundlagen", false], ["45a", 45, "Ausschüsse für Auswärtiges und Verteidigung", false], ["45b", 45, "Wehrbeauftragte oder Wehrbeauftragter", false], ["45c", 45, "Petitionsausschuss", false], ["45d", 45, "Parlamentarisches Kontrollgremium", false], ["53a", 53, "Gemeinsamer Ausschuss", false],
  ["65a", 65, "Befehls- und Kommandogewalt", false], ["80a", 80, "Spannungsfall", false], ["87a", 87, "Aufstellung und Einsatz der Streitkräfte", false], ["87b", 87, "Bundeswehrverwaltung", false], ["87c", 87, "Atomenergieverwaltung", false], ["87d", 87, "Luftverkehrsverwaltung", false], ["87e", 87, "Eisenbahnverkehrsverwaltung", false], ["87f", 87, "Post und Telekommunikation", false],
  ["91a", 91, "Gemeinschaftsaufgaben", false], ["91b", 91, "Bildungs- und Forschungsförderung", false], ["91c", 91, "Informationstechnik", false], ["91d", 91, "Vergleichsstudien", false], ["91e", 91, "Grundsicherung für Arbeitsuchende", false],
  ["104a", 104, "Ausgabenverteilung", false], ["104b", 104, "Finanzhilfen des Bundes", false], ["104c", 104, "Finanzhilfen für kommunale Bildungsinfrastruktur", false], ["104d", 104, "Finanzhilfen für den sozialen Wohnungsbau", false], ["106a", 106, "Finanzausgleich im öffentlichen Personennahverkehr", false], ["106b", 106, "Kompensation der Kraftfahrzeugsteuer", false], ["109a", 109, "Haushaltsnotlagen", false],
  ["115a", 115, "Feststellung des Verteidigungsfalls", false], ["115b", 115, "Übergang der Befehls- und Kommandogewalt", false], ["115c", 115, "Gesetzgebung im Verteidigungsfall", false], ["115d", 115, "Verkürztes Gesetzgebungsverfahren", false], ["115e", 115, "Gemeinsamer Ausschuss im Verteidigungsfall", false], ["115f", 115, "Rechte der Bundesregierung im Verteidigungsfall", false], ["115g", 115, "Bundesverfassungsgericht im Verteidigungsfall", false], ["115h", 115, "Wahlperioden und Amtszeiten im Verteidigungsfall", false], ["115i", 115, "Maßnahmen der Landesregierungen", false], ["115k", 115, "Geltungsdauer von Maßnahmen", false], ["115l", 115, "Beendigung des Verteidigungsfalls", false],
  ["118a", 118, "Neugliederung von Berlin und Brandenburg", false], ["120a", 120, "Lastenausgleich", false], ["125a", 125, "Fortgeltung von Bundesrecht", false], ["125b", 125, "Fortgeltung von Rahmengesetzen", false], ["125c", 125, "Fortgeltung von Hochschul- und Gemeindeverkehrsrecht", false], ["135a", 135, "Alte Verbindlichkeiten", false], ["143a", 143, "Ausschließliche Gesetzgebung bei Bundesautobahnen", false], ["143b", 143, "Umwandlung der Deutschen Bundespost", false], ["143c", 143, "Übergangsbestimmungen zu Finanzhilfen", false], ["143d", 143, "Übergangsbestimmungen zur Haushaltswirtschaft", false], ["143e", 143, "Bundesautobahnen", false], ["143f", 143, "Neuordnung der Finanzbeziehungen", false], ["143g", 143, "Fortgeltung von Artikel 107", false], ["143h", 143, "Sondervermögen", false], ["142a", 142, "Weggefallen", true], ["142", 142, "Grundrechte in den Ländern", false], ["49", 49, "Weggefallen", true], ["59a", 59, "Weggefallen", true], ["74a", 74, "Weggefallen", true], ["75", 75, "Weggefallen", true], ["142a", 142, "Weggefallen", true],
];

const baseArticles: ArticleEntry[] = Array.from({ length: 146 }, (_, index) => {
  const number = index + 1;
  return { id: String(number), label: `Art. ${number}`, section: sectionFor(number), title: knownTitles[number] || `Artikel ${number}`, fallen: [49, 59, 74, 75].includes(number) };
});

export const articleCatalog: ArticleEntry[] = [...baseArticles, ...specialArticles.map(([label, number, title, fallen]) => ({ id: label, label: `Art. ${label}`, section: sectionFor(number, label), title, fallen }))]
  .filter((entry, index, all) => all.findIndex(candidate => candidate.id === entry.id) === index)
  .sort((a, b) => Number.parseInt(a.id) - Number.parseInt(b.id) || a.id.localeCompare(b.id, "de"));

export const articleSections = Array.from(new Set(articleCatalog.map(article => article.section)));

export const officialGrundgesetzUrl = "https://www.gesetze-im-internet.de/gg/";
