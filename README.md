# Grundgesetz Deutschland

Grundgesetz Deutschland ist ein deutschsprachiges Recherchefenster für Fragen zum deutschen Grundgesetz. Die Startseite verbindet eine editoriale Oberfläche mit einem serverseitig geschützten Manus-LLM-Aufruf.

## Wo ist die KI geschützt?

Das Browserformular ruft ausschließlich den typisierten tRPC-Endpunkt `ai.ask` unter `/api/trpc` auf. Der Manus-API-Schlüssel wird **nicht** an den Browser übertragen und liegt ausschließlich in der serverseitigen Variable `BUILT_IN_FORGE_API_KEY`. Der Modellaufruf erfolgt in `server/routers.ts` über `invokeLLM` aus `server/_core/llm.ts`.

Der Endpunkt validiert Fragen auf dem Server, begrenzt deren Länge und drosselt wiederholte Anfragen pro Client. Die Systemanweisung verpflichtet das Modell, auf Deutsch zu antworten, keine Artikel oder Fundstellen zu erfinden, Unsicherheit kenntlich zu machen und keine individuelle Rechtsberatung auszugeben.

> Die KI ist ein Recherchewerkzeug, keine Rechtsberatung. Antworten müssen mit dem aktuellen amtlichen Gesetzestext geprüft werden. Bitte keine vertraulichen oder personenbezogenen Daten eingeben.

## Lokal starten

```bash
pnpm install
pnpm dev
```

Für Qualitätssicherung und Produktions-Build:

```bash
pnpm check
pnpm test
pnpm build
```

Die automatisch bereitgestellten Manus-Umgebungsvariablen werden serverseitig injiziert. `.env`-Dateien und API-Schlüssel gehören nicht in Git.

## Projektstruktur

| Bereich | Zweck |
|---|---|
| `client/src/pages/Home.tsx` | Oberfläche, Formular, Lade- und Fehlerzustände |
| `server/routers.ts` | Validierter `ai.ask`-Endpunkt und Systemanweisung |
| `server/_core/llm.ts` | Serverseitiger Manus-LLM-Client |
| `server/ai.test.ts` | Tests für Validierung, Antwortmapping und Drosselung |
| `client/src/index.css` | Verfassungsblatt-Designsystem |

## Lizenz

Dokumentation und ausdrücklich gekennzeichnete Originalinhalte stehen unter CC BY-NC-ND 4.0. Für kontrollierte Originalinhalte gilt zusätzlich die `NO-AI-POLICY.md`. Der Quellcode kann eigene Lizenzhinweise und die Lizenzen seiner Abhängigkeiten enthalten.

## Datenschutz

Die Anwendung verarbeitet Fragen für die Antwortgenerierung über den serverseitigen `ai.ask`-Endpunkt. Geheimnisse und API-Schlüssel bleiben im Serverprozess; der Client erhält nur die Antwort. Der Vergleichsmodus verwendet ausschließlich validierte Artikel-IDs, Bezeichnungen und kurze, fest im Projekt hinterlegte Quellen-Auszüge. Freie Artikeltexte werden nicht als Vergleichseingabe akzeptiert.

Angemeldete Verläufe werden ausschließlich über die authentifizierte Nutzer-ID gelesen, gespeichert und gelöscht. Nicht angemeldete lokale Verläufe liegen nur im `localStorage` des jeweiligen Browsers und können über „Lokalen Verlauf löschen“ entfernt werden. Die Anwendung setzt für API-Antworten `Cache-Control: no-store`, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` und eine restriktive `Permissions-Policy`.

Bitte gib niemals besondere Kategorien personenbezogener Daten, Zugangsdaten, Gesundheitsdaten oder vertrauliche Mandats-/Geschäftsinformationen ein. Browser- und Infrastruktur-Logs können technische Metadaten enthalten; produktive Log-Retention und Auftragsverarbeitung müssen durch den jeweiligen Hosting-/KI-Dienst geprüft und vertraglich geregelt werden. Diese Hinweise ersetzen keine individuelle Datenschutzprüfung oder Datenschutzerklärung.

## Vergleichsmodus

Über „Artikel vergleichen“ lassen sich zwei unterschiedliche Artikel, Buchstabenartikel oder weggefallene Einträge auswählen. Die Oberfläche zeigt beide Artikel nebeneinander, verlinkt auf die amtliche Grundgesetz-Quelle und bietet anschließend eine serverseitige KI-Einordnung mit Gemeinsamkeiten, Unterschieden, Schutzrichtung sowie Grenzen. Für nicht hinterlegte Artikel wird ausdrücklich auf den vollständigen amtlichen Wortlaut verwiesen. Vergleichsergebnisse werden nicht automatisch im persönlichen Verlauf gespeichert.
