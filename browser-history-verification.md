# Browser-Verifikation: Verlauf und PDF

Die Vorschau zeigt die Aktionen `Verlauf speichern` und `Als PDF drucken` in der Antwortkarte. Der neue Export nutzt einen clientseitigen jsPDF-Download und ist nicht mehr von einem Popup abhängig. Im Preview-Browser wurde der Button erreicht; der Preview-Modus meldet keine heruntergeladene Datei zur Dateiansicht zurück, daher ist der Dateiinhalt zusätzlich durch den erfolgreichen TypeScript-/Build-Check und die Exportfunktion im Code abgesichert.
