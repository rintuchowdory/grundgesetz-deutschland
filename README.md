# Grundgesetz Deutschland

**Grundgesetz Deutschland** ist ein deutschsprachiges Grundgesetz-GPT-Projekt. Es stellt eine moderne Webanwendung bereit, mit der Inhalte rund um das deutsche Grundgesetz strukturiert erschlossen und in verständlicher Form recherchiert werden können.

> **Wichtiger Hinweis:** Die Anwendung ist ein Informations- und Recherchewerkzeug. Antworten können unvollständig oder fehlerhaft sein und stellen keine Rechtsberatung dar. Für verbindliche Auskünfte und konkrete Fälle ist eine qualifizierte juristische Beratung erforderlich.

## Projektumfang

Das Repository enthält eine React-/Vite-Frontend-Anwendung, einen Node.js-/Express-Server sowie gemeinsam genutzte TypeScript-Module. Zum Projekt gehören außerdem Datenbank- und Migrationsdateien, Referenzmaterialien, Datenschutz- und Impressumsseiten sowie Konfigurationsdateien für die Bereitstellung.

Die Anwendung kann als Ausgangspunkt für eine verständliche, dialogorientierte Aufbereitung verfassungsrechtlicher Inhalte dienen. Bei jeder Weiterentwicklung sollte die Herkunft der Inhalte nachvollziehbar dokumentiert und zwischen amtlichen Texten, redaktionellen Erläuterungen und KI-generierten Antworten klar unterschieden werden.

## Technischer Stack

| Bereich | Technologie |
|---|---|
| Benutzeroberfläche | React, TypeScript, Vite, Tailwind CSS |
| Server | Node.js, Express, tRPC |
| Datenzugriff | Drizzle ORM, MySQL-kompatible Datenbank |
| Qualitätssicherung | TypeScript, Prettier, Vitest |
| Bereitstellung | Konfigurationen für Railway und Render |

## Voraussetzungen

Für die lokale Entwicklung werden Node.js sowie pnpm benötigt. Abhängigkeiten werden mit folgendem Befehl installiert:

```bash
pnpm install
```

Danach kann der Entwicklungsserver gestartet werden:

```bash
pnpm dev
```

Für die wichtigsten Prüfungen stehen diese Befehle zur Verfügung:

```bash
pnpm check
pnpm test
pnpm build
```

Die produktive Konfiguration benötigt die in der jeweiligen Bereitstellungsumgebung vorgesehenen Umgebungsvariablen. Geheimnisse wie API-Schlüssel, Datenbankpasswörter oder Sitzungsschlüssel dürfen niemals committed werden.

## Datenschutz und Verantwortlichkeit

Vor einer öffentlichen Bereitstellung müssen `datenschutz.html`, `impressum.html`, die Datenflüsse der Anwendung und die eingesetzten externen Dienste geprüft und an den tatsächlichen Betreiber angepasst werden. Die enthaltenen Seiten sind keine automatisch vollständige rechtliche Prüfung.

## Lizenz und KI-Nutzung

Die von den Projektautorinnen und Projektautoren erstellte Dokumentation und sonstige ausdrücklich als Originalinhalte gekennzeichnete Material wird unter der **Creative Commons Namensnennung-NichtKommerziell-KeineBearbeitungen 4.0 International Lizenz (CC BY-NC-ND 4.0)** bereitgestellt. Der vollständige Lizenztext befindet sich in [`LICENSE`](./LICENSE).

Der Quellcode ist im Projekt derzeit in `package.json` als **MIT** gekennzeichnet. Diese Kennzeichnung bleibt für den Quellcode maßgeblich, soweit einzelne Dateien oder Beiträge keine abweichenden Hinweise enthalten. Inhalte Dritter, amtliche Gesetzestexte und Open-Source-Abhängigkeiten können eigenen Bedingungen unterliegen; deren Rechte werden durch diese Hinweise nicht erweitert.

Zusätzlich gilt für die von den Projektbetreibenden kontrollierten Originalinhalte die ergänzende [`No-AI-Nutzungsrichtlinie`](./NO-AI-POLICY.md). Sie untersagt, soweit gesetzlich zulässig, die Nutzung zum Training, Finetuning, Evaluieren oder anderweitigen Verbessern von KI-/ML-Modellen.

## Mitwirken

Fehlerberichte und Verbesserungsvorschläge können als GitHub Issue eingereicht werden. Änderungen sollten nachvollziehbar begründet, auf Datenschutz- und Sicherheitsfolgen geprüft und mit passenden Tests oder Dokumentation ergänzt werden.

## Haftungshinweis

Dieses Projekt wird ohne Gewähr bereitgestellt. Die Maintainer übernehmen keine Garantie für Richtigkeit, Vollständigkeit, Aktualität oder die Eignung der Antworten für einen bestimmten Zweck. Die Nutzung erfolgt in eigener Verantwortung.
