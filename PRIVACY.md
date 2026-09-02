# Datenschutz und Datenfluss

## Zweck und Umfang

Verfassungsblatt ist ein Recherchewerkzeug. Diese technische Notiz beschreibt die im Projekt umgesetzten Schutzmaßnahmen; sie ist keine vollständige Datenschutzerklärung und ersetzt keine Prüfung nach DSGVO, TDDDG oder den Verträgen der eingesetzten Dienste.

## Datenflüsse

| Datenart | Verarbeitung | Speicherung | Schutzmaßnahme |
|---|---|---|---|
| Freie Frage | Server-Endpunkt `ai.ask` und Manus-LLM | Nicht automatisch im Serververlauf | Eingabevalidierung, Längenlimit, Rate-Limit, API-Schlüssel nur serverseitig |
| Vergleichsauswahl | Artikel-IDs und Labels an `compare.articles` | Nicht automatisch gespeichert | Zod-Validierung, nur Katalogwerte, keine freien Quelltexte |
| Lokaler Verlauf | Browser-`localStorage` | Nur im jeweiligen Browser | Nutzer kann „Lokalen Verlauf löschen“ ausführen |
| Angemeldeter Verlauf | tRPC-Verlauf mit Nutzer-ID | Datenbank | Jede Liste-/Lade-/Löschoperation ist nutzergebunden |
| Authentifizierung | HttpOnly-Session-Cookie bzw. notwendiger Preview-Fallback | Sessiondauer | `Secure`, `SameSite=None`, `__Host-` OAuth-State-Cookie, keine API-Geheimnisse im Client |
| Technische Metadaten | Hosting-/Browser-/Analytics-Infrastruktur | Dienstabhängig | API-Responses `no-store`, `no-referrer`; produktive Retention muss separat geprüft werden |

## Umgesetzte Maßnahmen

Der aktive Express-Server deaktiviert `x-powered-by`, setzt `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` und eine restriktive `Permissions-Policy`. Antworten unter `/api` werden nicht gecacht; JSON- und URL-encoded-Eingaben sind auf 64 KB begrenzt. Die KI-Systemanweisung verhindert individuelle Rechtsberatung und weist auf den amtlichen Wortlaut hin.

Private Verläufe werden im Datenbankzugriff immer gemeinsam mit der authentifizierten Nutzer-ID abgefragt. Sichtbare Verläufe sind technisch auf die letzten 90 Tage seit der letzten Aktualisierung begrenzt (`CONVERSATION_RETENTION_DAYS`); ältere Datensätze werden nicht gelistet oder geladen und können weiterhin gezielt gelöscht werden. Der Vergleichsmodus ist bewusst stateless: Auswahl und Ergebnis werden nicht automatisch im persönlichen Verlauf gespeichert. Exportierte PDFs entstehen lokal im Browser und müssen vom Nutzer selbst geschützt oder gelöscht werden.

## Grenzen und Nutzerhinweis

Fragen werden zur Generierung einer Antwort an den serverseitigen KI-Dienst übertragen. Deshalb dürfen keine vertraulichen oder personenbezogenen Daten eingegeben werden. Entwicklungs- und Infrastruktur-Logs können technische Metadaten enthalten; der Anwendungscode protokolliert KI-/Verlaufsfehler nur generisch. Log-Retention, Analytics-Konfiguration, Auftragsverarbeitung und Löschfristen des jeweiligen Betriebs müssen vor einem produktiven Einsatz separat festgelegt werden. Für einen öffentlich betriebenen Dienst sind zusätzlich eine aktuelle Datenschutzerklärung, ein Verzeichnis der Verarbeitungstätigkeiten und gegebenenfalls ein Einwilligungs-/Widerspruchskonzept zu erstellen.
