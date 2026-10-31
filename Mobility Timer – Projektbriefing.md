# Mobility Timer – Projektbriefing für Claude Code

## Ziel

Eine eigene Web-App als Ersatz für die App "Bend" (Timer für Mobility- und Dehnübungen). Die App liegt als Git-Repo auf GitHub und wird über GitHub Pages ausgeliefert. Sie muss auf Handy, Tablet und Laptop responsiv und modern aussehen. Zunächst nur zur Eigennutzung, soll aber auch für andere Nutzer robust funktionieren.

## Tech-Stack

- **Svelte** mit **Vite** und **TypeScript**
- **Tailwind CSS** für das Styling
- **PWA** (Vite-PWA-Plugin): installierbar und offlinefähig
- **Linter** (ESLint, Prettier) und **Tests** (Vitest) für die Timer-Logik
- **GitHub Action**: bei jedem Push bauen und auf GitHub Pages veröffentlichen (Base-Path für Pages beachten)
- Code soll sauber und wartbar sein, so wie ein professioneller Entwickler ihn schreiben würde. Das Projekt dient auch als Test dafür.

## Datenmodell

Zwei Sammlungen: eine **Übungsbibliothek** und **Routinen**, die nur auf Übungen verweisen.

### Übung (Exercise)

- `id` (eindeutig)
- `name` (z. B. "Pancake Stretch")
- `notes` (optionale Hinweise)
- `image` (optional; Bilder existieren noch nicht, Feld und Anzeige sollen aber vorbereitet sein)
- `duration` in Sekunden (Standarddauer; bei beidseitigen Übungen gilt sie pro Seite)
- `bilateral` (boolean): einseitig oder beidseitig
- `switchTime` in Sekunden (nur bei beidseitig): Zeit zum Seitenwechsel, **pro Übung einstellbar**; ein globaler Standardwert springt ein, wenn nichts eingetragen ist

Die Gesamtdauer einer beidseitigen Übung berechnet die App selbst: 2 × Dauer + Wechselzeit.

### Routine

- `name` (dient als Schlüssel, eine eigene ID ist nicht zwingend nötig; in einer Datenbank kann es optional eine ID geben)
- optional `description`
- Standardwerte: `prepTime` (Vorbereitungszeit vor dem Start) und `restTime` (Pause nach jeder Übung)
- `entries`: **lose, geordnete Liste** von Einträgen. Jeder Eintrag enthält eine Übungs-ID und darf überschreiben: Dauer, Pause danach (und ggf. Wechselzeit)

Änderungen an einer Übung in der Bibliothek wirken sich auf alle Routinen aus; ein Eintrag kann sie lokal überschreiben.

### Ablauf als Phasen

Beim Abspielen wird eine Routine in eine **flache Liste von Phasen** aufgelöst: Vorbereitung, Seite 1 (links), Wechsel, Seite 2 (rechts), Pause. Der Timer arbeitet nur diese Liste ab. Das hält die Logik einfach und gut testbar. Jede Phase kennt ihren Typ (Übung, Pause, Wechsel, Vorbereitung), ihre Dauer, die zugehörige Übung und ggf. die Seite.

## Speicherung

- Startdaten als JSON-Datei im Repo (Beispielübungen und Beispielroutinen)
- Eigene Änderungen und neue Routinen werden im Browser gespeichert (**IndexedDB** oder localStorage), sodass sie beim nächsten Aufruf noch da sind
- **Export und Import als JSON-Datei** als Backup und für manuellen Geräte-Sync
- **Persistenten Speicher anfragen** (`navigator.storage.persist()`), damit der Browser die Daten nicht automatisch löscht
- Hinweis in der App: Daten liegen nur in diesem Browser auf diesem Gerät; bei gelöschten Website-Daten, privatem Modus oder Gerätewechsel sind sie weg, daher Export nutzen
- Keine Datenbank und kein Backend nötig (GitHub Pages liefert nur statische Dateien)

## Oberfläche – Handy im Hochformat (von oben nach unten)

1. **Kopfzeile**: oben **links der Audio-Schalter** (an/aus), oben **rechts das Hamburger-Menü**. Das Menü wird häufiger gebraucht und liegt deshalb rechts.
2. **Gesamtfortschritt**: ein horizontaler Balken über die ganze Breite, links die verstrichene Zeit (elapsed), rechts die Gesamtzeit (total).
3. **Runder Timer** in der Mitte: ein Ring (SVG-Kreis mit animiertem Strich), darin der **Countdown der aktuellen Phase in sehr großen Ziffern** (wie bei einem Tabata-Timer). Optional kann in der Mitte des Kreises ein Bild der Übung angezeigt werden (Bilder gibt es noch nicht, das Layout soll beides erlauben). Ein Tipp auf den Ring schaltet Play und Pause um.
4. **Name der aktuellen Übung** groß, dazu die eingestellte Dauer in Sekunden. Bei beidseitigen Übungen ein **großes "Links" oder "Rechts"** direkt unter dem Namen.
5. **Positionsanzeige**: z. B. "13 von 15", neben oder unter dem Übungsnamen.
6. **Timeline** unter dem Ring (siehe unten).
7. **Vorschau der nächsten Übungen**: eine Liste, in der nur die nächsten drei bis vier Einträge sichtbar sind, die aber **scrollbar** ist. **Pausen erscheinen in dieser Liste nicht.**
8. **Steuerung unten**: Previous, Play/Pause, Next. Große Buttons im **Daumenbereich**.

## Timeline

Ein horizontaler Streifen unter dem Ring, dessen Blöcke in der **Breite proportional zur Dauer** sind:

- Übungen in **Rot**, Pausen in **Grau**, Seitenwechsel in einer **eigenen Hervorhebungsfarbe** (z. B. Gelb oder Orange)
- Ein **blauer Marker** steht in der Mitte des Bildschirms, der Streifen darunter **wandert nach links** durch
- Am **Anfang** startet der Marker ganz links am Bildschirmrand und bewegt sich zur Mitte; am **Ende** wandert er von der Mitte ganz nach rechts an den Rand
- Umsetzung z. B. mit CSS-Transform; die Phasenliste liefert alle nötigen Daten

## Phasenfarben und Design

- Sehr **modern und clean**, Farben nur als Akzente
- **Feste Farben pro Phase** (Übung, Pause, Wechsel, Vorbereitung); Ring und ggf. Hintergrund zeigen die Phase an, damit man es auch aus zwei Metern Abstand auf der Matte erkennt
- Genauere Farbwahl darf Claude Code zunächst selbst entscheiden und wird später gemeinsam angepasst

## Weitere Funktionen

- **Wake Lock API**: Display bleibt während der Routine an
- **Audio**: kurzer Ton in den letzten drei Sekunden jeder Phase, außerdem Signale bei Phasenwechsel; global ein- und ausschaltbar
- **Hamburger-Menü** (rechts oben): Routine verlassen, ins Hauptmenü, Routinen auswählen, wechseln, anlegen und bearbeiten; Übungsbibliothek verwalten; Export und Import
- **Routinen-Editor** über die Weboberfläche: Routinen aus Übungen der Bibliothek zusammenstellen, Reihenfolge ändern, Dauer und Pausen pro Eintrag überschreiben

## Responsive Verhalten

- **Handy Hochformat**: Layout wie oben beschrieben
- **Tablet und Laptop (Querformat)**: Die **Übungsliste steht links daneben** (scrollbar, dort sind meist viele Einträge sichtbar), der **Timer bleibt groß rechts**
- Muss in allen Größen sauber aussehen

## Vorschlag für die Reihenfolge der Umsetzung

1. Repo-Grundgerüst: Svelte, Vite, TypeScript, Tailwind, Lint, Tests, GitHub Action für Pages
2. Datenmodell und Typen, Beispiel-JSON, Auflösung von Routine in Phasen (mit Tests)
3. Timer-Engine (Play, Pause, Previous, Next, Fortschritt)
4. Timer-Oberfläche mit Ring, Timeline, Vorschau, Steuerung
5. Audio und Wake Lock
6. Speicherung (IndexedDB), Export und Import
7. Menü, Routinen-Editor, Übungsbibliothek
8. PWA (Manifest, Service Worker, Icons)
9. Feinschliff: Farben, responsives Layout, Bilder in der Ringmitte

## Offene Punkte

- Bilder der Übungen existieren noch und werden später ergänzt
- Farbschema wird nach dem ersten Prototyp gemeinsam angepasst
- Weitere Ideen von Lukas folgen
