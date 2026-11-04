# Plan: Grundgesetz Deutschland erneut veröffentlichen

## Ziel
Den geprüften Stand aus `rintuchowdory/grundgesetz-deutschland` in einer aktiven Manus-Webdev-Veröffentlichung bereitstellen, ohne die bestehende deutschsprachige Rechercheoberfläche oder den serverseitig geschützten KI-/Verlaufsumfang zu verändern.

## Umsetzung
- Bestehenden Vite-/Express-/React-/tRPC-Stand vollständig übernehmen.
- Server für eingebettete HTTPS-Vorschau und Containerbetrieb korrigieren: kein blockierendes `X-Frame-Options: DENY`, unauthentifizierter `/healthz`-Endpunkt.
- Statisches `/manus-routes.json` für `/` und die explizite `/404`-Route bereitstellen.
- Favicon auf die im Repository vorhandene SVG-Datei umstellen und Projektlogo-Metadaten ergänzen.
- Produktions-Build mit pnpm und Dockerfile deklarieren; `/api/*` und `/healthz` an den Server, übrige Seiten an den statischen SPA-Build routen.
- TypeScript, Vitest, Produktions-Build, Preview-Start und veröffentlichte HTTP-Erreichbarkeit prüfen.

## Bestehendes Design
Die vorhandene Verfassungsblatt-Gestaltung bleibt erhalten: editoriale Schweizer Typografie, warme Papierflächen, Verfassungsblau, eine Ziegelrot-Akzentlinie und quellorientierte asymmetrische Navigation. Die Überarbeitung ist eine Stabilitäts- und Veröffentlichungsreparatur, kein Redesign.

## Projektstruktur
- `client/`: React-Oberfläche, Routen, Styles und öffentliche Webassets.
- `server/`: Express-Server, tRPC-Router, OAuth, Datenbank- und Manus-LLM-Anbindung.
- `shared/`: gemeinsam verwendete Typen, Konstanten und Artikelquellen.
- `Dockerfile` und Webdev-Konfiguration: reproduzierbarer Produktionsbuild und Veröffentlichungsrouting.
