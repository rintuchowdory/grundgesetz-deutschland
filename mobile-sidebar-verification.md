# Mobile Sidebar-Verifikation

Am 27. August 2026 wurde die Vorschau im mobilen Viewport mit 375 × 812 Pixeln geprüft. Der vertikale Button „Artikel-Navigation“ öffnet die linke Sidebar sichtbar. Die Sidebar nutzt eine mobile Breite, einen eigenen Scrollbereich, einen hervorgehobenen Schrittzähler sowie touchfreundliche Artikelbuttons. Der sichtbare Schließen-Button beendet den Drawer wieder. Die aktuelle Artikelauswahl und die nächste Artikelaktion bleiben im geöffneten Zustand erreichbar.

Die CSS-Optimierung umfasst Safe-Area-Abstände, Touch-Scrolling, größere Bedienziele, Overlay-Schließen, Fokusrahmen, Escape-Unterstützung und gesperrtes Body-Scrolling bei geöffneter Sidebar.
Zusatztest: Die Sidebar wurde erneut im mobilen Viewport geöffnet und mit der Escape-Taste geschlossen. Nach dem Schließen war die normale Startseitenansicht wieder sichtbar.
Im 375 × 812-Viewport wurde der Drawer erneut geöffnet. Der Artikelzähler, die Navigationstasten und die scrollbare Artikelliste sind sichtbar; die Sidebar belegt nicht die gesamte Breite, und der Hintergrund bleibt als Overlay erkennbar.
End-to-End-Test im mobilen Viewport: Art. 5 wurde per Touch ausgewählt. Der Artikelzähler zeigt 5/203, der Drawer bleibt offen, und die sichtbare KI-Antwort „Einordnung“ erklärt Art. 5 mit Schrittüberschriften. Die Vor-/Zurück-Steuerung ist im Drawer verfügbar.
Mobiler Schrittwechsel: Nach Auswahl von Art. 5 wurde „Nächster Artikel“ touch-basiert ausgelöst. Der Zähler wechselte sichtbar auf Art. 6/203; der Drawer blieb geöffnet und die Antwortkarte wechselte in den Lade-/Erklärzustand für Art. 6.
