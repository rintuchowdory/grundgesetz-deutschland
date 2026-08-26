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
