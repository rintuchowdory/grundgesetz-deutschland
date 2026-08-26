# Grundgesetz-GPT: Einrichtung und Nutzung

Diese Anleitung beschreibt, wie **Grundgesetz Deutschland** lokal eingerichtet, konfiguriert, getestet und betrieben wird. Das Projekt ist eine deutschsprachige Webanwendung zur dialogorientierten Recherche rund um das Grundgesetz.

> **Rechtlicher und fachlicher Hinweis:** Grundgesetz-GPT ist ein Informations- und Recherchewerkzeug. KI-Antworten können unvollständig, veraltet oder falsch sein und ersetzen weder Gesetzestexte noch eine qualifizierte Rechtsberatung. Für konkrete Fälle müssen die Originalquellen geprüft werden.

## 1. Voraussetzungen

Für die lokale Entwicklung werden folgende Komponenten benötigt:

| Komponente | Zweck | Empfehlung |
|---|---|---|
| Node.js | Laufzeit für Server und Build | Version 24 oder kompatible LTS-Version |
| pnpm | Paketverwaltung | Version 10.4.1 |
| Git | Versionsverwaltung | aktuelle Version |
| MySQL/TiDB | persistente Datenbank | nur erforderlich, wenn Datenbankfunktionen genutzt werden |

Das Repository wird zunächst geklont und anschließend betreten:

```bash
git clone https://github.com/rintuchowdory/grundgesetz-deutschland.git
cd grundgesetz-deutschland
```

## 2. Abhängigkeiten installieren

Installiere die JavaScript-Abhängigkeiten mit dem festgeschriebenen Lockfile:

```bash
pnpm install --frozen-lockfile
```

`--frozen-lockfile` stellt sicher, dass die installierten Versionen nicht stillschweigend verändert werden. Für wiederholbare Builds sollte dieser Modus auch in der CI verwendet werden.

## 3. Umgebungsvariablen konfigurieren

Lege für die lokale Entwicklung eine Datei `.env` im Projektstamm an. Sie wird durch `.gitignore` ausgeschlossen und darf keine Geheimnisse in Git enthalten.

```dotenv
NODE_ENV=development
PORT=3000
VITE_APP_ID=lokale-app-id
JWT_SECRET=ein-langes-zufaelliges-geheimnis
DATABASE_URL=mysql://user:passwort@localhost:3306/grundgesetz
OAUTH_SERVER_URL=
OWNER_OPEN_ID=
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
```

Die Variablen haben folgende Bedeutung:

| Variable | Erforderlich | Bedeutung |
|---|---:|---|
| `VITE_APP_ID` | je nach Auth-Konfiguration | Kennung der Anwendung |
| `JWT_SECRET` | für Sessions | Geheimnis zum Signieren von Sitzungen; nie veröffentlichen |
| `DATABASE_URL` | für Datenbankfunktionen | MySQL-/TiDB-Verbindungs-URL |
| `OAUTH_SERVER_URL` | bei OAuth | URL des OAuth-Servers |
| `OWNER_OPEN_ID` | bei Betreiberfunktionen | OpenID des verantwortlichen Kontos |
| `BUILT_IN_FORGE_API_URL` | bei integrierten Diensten | Basis-URL des bereitgestellten API-Dienstes |
| `BUILT_IN_FORGE_API_KEY` | bei integrierten Diensten | geheimer API-Schlüssel; nur serverseitig verwenden |
| `PORT` | nein | bevorzugter HTTP-Port; Standard ist `3000` |
| `NODE_ENV` | nein | Entwicklungs- oder Produktionsmodus |

Leere Werte sind nur dann sinnvoll, wenn die betreffende Funktion im Projekt nicht verwendet wird. Produktivwerte gehören ausschließlich in die Secrets- oder Environment-Konfiguration des jeweiligen Hosting-Anbieters.

## 4. Datenbank vorbereiten

Wenn das Projekt Datenbankfunktionen verwendet, muss eine MySQL-kompatible Datenbank erreichbar sein. Setze zuerst `DATABASE_URL` und führe danach die Drizzle-Migrationen aus:

```bash
pnpm db:push
```

Prüfe vor dem produktiven Einsatz, welche Tabellen und Seed-Daten durch die Migrationen angelegt werden. Produktionsdatenbanken sollten vor Migrationen gesichert werden.

## 5. Entwicklungsserver starten

Starte die Anwendung im Entwicklungsmodus:

```bash
pnpm dev
```

Der Server läuft standardmäßig unter `http://localhost:3000/`. Falls der Port belegt ist, sucht die Anwendung automatisch einen freien Port im folgenden Bereich. Die genaue URL wird im Terminal ausgegeben.

Beende den Entwicklungsserver mit `Ctrl+C`.

## 6. Anwendung nutzen

Öffne die im Terminal ausgegebene URL im Browser. Formuliere Fragen möglichst präzise und gib den gewünschten Kontext an. Gute Fragen nennen beispielsweise den einschlägigen Artikel, das Thema und die gewünschte Erklärungstiefe:

```text
Erkläre Art. 5 GG in verständlicher Sprache und trenne Wortlaut,
allgemeine Einordnung und offene juristische Streitfragen.
```

Für eine zuverlässige Nutzung gelten diese Grundsätze:

1. **Originalquellen prüfen:** Vergleiche wichtige Aussagen mit dem aktuellen amtlichen Gesetzestext.
2. **Antworten nicht als Bescheid verstehen:** Eine KI-Antwort ist keine behördliche oder anwaltliche Auskunft.
3. **Unsicherheit sichtbar machen:** Bitte das Modell um Quellen, Abgrenzungen und eine Kennzeichnung nicht sicher belegter Aussagen.
4. **Keine vertraulichen Daten eingeben:** Übermittle keine personenbezogenen, geheimen oder besonders sensiblen Informationen.
5. **Aktualität beachten:** Verfassungsrechtliche Rechtsprechung und redaktionelle Inhalte können sich ändern.

## 7. Qualitätssicherung

Vor jedem Pull Request und vor einer Veröffentlichung sollen mindestens diese Befehle erfolgreich sein:

```bash
pnpm check
pnpm test
pnpm build
```

`pnpm check` führt die TypeScript-Prüfung aus. `pnpm test` startet die automatisierten Tests. `pnpm build` erstellt den Produktions-Build für Frontend und Server. Derselbe Ablauf wird bei Pushes auf `main` und bei Pull Requests durch GitHub Actions ausgeführt.

## 8. Produktionsbetrieb

Erzeuge den Build und starte anschließend den gebündelten Server:

```bash
pnpm build
pnpm start
```

Setze in der Produktionsumgebung mindestens `NODE_ENV=production`, ein starkes `JWT_SECRET` und die tatsächlich benötigten Integrations- und Datenbankvariablen. Der Hosting-Anbieter muss HTTPS, sichere Secret-Speicherung, Backups, Logs und eine geeignete Zugriffskontrolle bereitstellen.

Die vorhandene Pages-Konfiguration baut das Frontend für die Veröffentlichung auf GitHub Pages. Das Backend und die API müssen separat betrieben werden, sofern die Anwendung serverseitige Funktionen benötigt. Die im Workflow hinterlegte API-Basis-URL muss vor einer eigenen Veröffentlichung auf die tatsächlich verwendete Adresse angepasst werden.

## 9. GitHub Actions

Der Workflow [`ci.yml`](./.github/workflows/ci.yml) wird bei Pushes auf `main` und bei Pull Requests gegen `main` ausgeführt. Er installiert die Abhängigkeiten reproduzierbar, führt TypeScript-Prüfung und Tests aus und validiert den Produktions-Build.

Der Workflow verwendet nur `contents: read`. Er benötigt daher keine Schreibrechte auf das Repository. Fehlgeschlagene Prüfungen sollten vor dem Merge behoben werden. Die Deployment-Automation in [`deploy-pages.yml`](./.github/workflows/deploy-pages.yml) ist davon getrennt und sollte vor einer öffentlichen Nutzung hinsichtlich Ziel-URL, Pages-Konfiguration und Schreibrechten geprüft werden.

## 10. Datenschutz und Sicherheit

Vor dem öffentlichen Betrieb müssen `datenschutz.html` und `impressum.html` an den tatsächlichen Betreiber, die verwendeten Dienste und die konkreten Datenflüsse angepasst werden. Prüfe insbesondere:

- welche Eingaben an externe KI- oder API-Dienste übertragen werden,
- ob Sitzungs-, Analyse- oder Protokolldaten gespeichert werden,
- ob Nutzerkonten und Löschprozesse korrekt funktionieren,
- ob API-Schlüssel ausschließlich serverseitig verfügbar sind,
- ob CORS, Cookies, HTTPS und Rate-Limits angemessen konfiguriert sind.

Committe niemals `.env`-Dateien, private Schlüssel, Zugangsdaten, Datenbankexporte oder personenbezogene Produktionsdaten. Bei einem versehentlich veröffentlichten Geheimnis muss der Schlüssel sofort widerrufen und ersetzt werden.

## 11. Lizenz und No-AI-Regel

Dokumentation und ausdrücklich gekennzeichnete Originalinhalte stehen unter [CC BY-NC-ND 4.0](./LICENSE). Der Quellcode ist in `package.json` derzeit als MIT gekennzeichnet. Drittinhalte, amtliche Gesetzestexte und Abhängigkeiten können eigenen Bedingungen unterliegen.

Für kontrollierte Originalinhalte gilt zusätzlich die [No-AI-Nutzungsrichtlinie](./NO-AI-POLICY.md). Sie untersagt, soweit gesetzlich zulässig, die Nutzung zum Training, Finetuning, Evaluieren oder anderweitigen Verbessern von KI-/ML-Modellen. Diese Richtlinie ist eine zusätzliche Nutzungsbedingung und keine eigenständige Standardlizenz.

## 12. Fehlerbehebung

Wenn `pnpm install --frozen-lockfile` fehlschlägt, prüfe die Node- und pnpm-Versionen sowie die Integrität von `pnpm-lock.yaml`. Bei einem fehlgeschlagenen `pnpm db:push` müssen `DATABASE_URL`, Netzwerkzugriff, Datenbankname und Berechtigungen geprüft werden. Wenn der Server startet, aber KI- oder Authentifizierungsfunktionen fehlen, kontrolliere die jeweils zugehörigen Environment-Variablen und die Server-Logs.

Bei Fehlern in der Anwendung sollte zuerst ein reproduzierbarer Testfall erstellt werden. Issues sollten die verwendete Version, den Startbefehl, eine anonymisierte Fehlermeldung und — sofern unkritisch — die relevanten Konfigurationsbedingungen enthalten.
