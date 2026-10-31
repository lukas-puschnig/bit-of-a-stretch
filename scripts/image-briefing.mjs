// Generates docs/exercise-images.md from the exercise catalog.
// Run with `npm run docs:images` after changing src/data/catalog.json.
import { readFileSync, writeFileSync } from 'node:fs'

const root = new URL('..', import.meta.url)
const catalog = JSON.parse(readFileSync(new URL('src/data/catalog.json', root), 'utf8'))

const CATEGORY = {
  neck: 'Nacken',
  shoulders: 'Schultern & Brust',
  arms: 'Arme & Handgelenke',
  spine: 'Rücken & Wirbelsäule',
  hips: 'Hüfte & Gesäß',
  quads: 'Oberschenkel vorne',
  hamstrings: 'Beinrückseite',
  adductors: 'Adduktoren',
  calves: 'Waden & Füße',
  fullBody: 'Ganzkörper',
}

const intro = `# Übungsbilder – Briefing

> Automatisch erzeugt aus \`src/data/catalog.json\` mit \`npm run docs:images\`. Nicht von Hand
> bearbeiten, sondern das Skript \`scripts/image-briefing.mjs\` anpassen.

Dieses Dokument ist als Auftrag für eine separate Claude-Instanz (oder ein anderes Bildwerkzeug)
gedacht. Es beschreibt, wie die Bilder aussehen sollen, und listet alle ${catalog.exercises.length}
Übungen mit Erklärung.

## Wo die Bilder erscheinen

- **Im Timer-Ring:** kreisförmig beschnitten, mit 50 % Schwarz abgedunkelt; darüber stehen
  große Countdown-Ziffern. Das Motiv muss also auch abgedunkelt und hinter Ziffern erkennbar bleiben.
- **In Listen:** als kleines Vorschaubild, 48 × 48 px, mit abgerundeten Ecken.
- Die App läuft im hellen und im dunklen Modus.

## Technische Vorgaben

| | |
|---|---|
| Format | **WebP** (bevorzugt) oder PNG; alternativ **SVG** |
| Größe | **1024 × 1024 px**, quadratisch (SVG: \`viewBox="0 0 1024 1024"\`) |
| Dateigröße | möglichst unter 150 KB (WebP-Qualität ca. 80) |
| Farbraum | sRGB |
| Dateiname | exakt die **ID** aus der Liste, z. B. \`pigeon.webp\` |
| Ablage | \`src/assets/exercises/\` – die App ordnet die Bilder beim Build automatisch zu |

Kann die Instanz keine Rasterbilder erzeugen, sind **SVG-Illustrationen** ausdrücklich
erwünscht: Sie bleiben klein, scharf und werden ebenfalls automatisch erkannt.

Derzeit liegen dort generierte Piktogramme als Platzhalter (\`<id>.svg\`, erzeugt mit
\`npm run images\` aus \`scripts/figures/poses.mjs\`). Ein Rasterbild mit gleicher ID
(\`.webp\`, \`.png\`, \`.jpg\`) hat Vorrang; die Platzhalter müssen also nicht gelöscht werden.
In der App sind Bilder unter *Daten & Einstellungen → Übungsbilder anzeigen* schaltbar.

## Bildgestaltung

**Komposition**
- Eine einzelne Person, zentriert. Alles Wichtige liegt **innerhalb eines Kreises mit 80 %
  Durchmesser** um die Bildmitte, denn außen wird abgeschnitten.
- Perspektive so wählen, dass die Haltung eindeutig ist; meist **Seitenansicht**, bei Übungen
  am Boden auch leicht von schräg oben.
- Gleicher Abstand und gleiche Figurgröße über alle Bilder, damit die Serie einheitlich wirkt.

**Stil**
- Flache, moderne Vektor-Illustration, ruhige, leicht abgerundete Formen, keine Fotos.
- Neutrale, geschlechtsneutrale Figur ohne Gesichtsdetails, schlichte Sportkleidung.
- Keine Texte, Zahlen, Pfeile, Logos oder Marken im Bild.

**Farben** (passend zur App)
- Hintergrund: einfarbig **#1D2230** (dunkles Blaugrau), füllt das ganze Quadrat.
- Figur: helles Grau **#E8EAF0** mit dezenter Schattierung **#8B93A7**.
- Gedehnter Bereich: weicher Akzent in **#F43F5E** (Rot der App), z. B. als Leuchten über dem
  Muskel. Nur dort Farbe einsetzen.
- Hilfsmittel (Matte, Wand, Türrahmen, Band, Stab) im Ton **#2A3040** bis **#3A4256**, flach
  und zurückhaltend.

**Beidseitige Übungen**
- Immer die **linke Seite** zeigen: Das linke Bein bzw. der linke Arm ist das gedehnte bzw.
  vordere Glied. Die App spiegelt das Bild für die rechte Seite automatisch – deshalb nichts
  Seitenabhängiges wie Text, Uhren oder asymmetrische Logos einbauen.

**Einheitlichkeit**
- Zuerst ein Referenzbild erstellen (Vorschlag: \`childs-pose\`) und alle weiteren daran
  ausrichten: gleiche Figur, gleiche Strichstärke, gleiche Farben.

## Rechtliches

- Die Bilder werden mit der App unter der MIT-Lizenz veröffentlicht. Es dürfen nur Bilder
  verwendet werden, an denen wir diese Rechte haben: selbst erstellt, für dieses Projekt
  generiert (mit einem Werkzeug, dessen Nutzungsbedingungen das erlauben) oder ausdrücklich frei
  lizenziert (CC0; CC BY nur mit Namensnennung).
- Keine Vorlagen aus anderen Apps (z. B. Bend), Büchern oder Stockfoto-Seiten nachzeichnen.

## Übungen
`

const rows = catalog.exercises.map((e, i) => {
  const lines = [
    `### ${i + 1}. ${e.name.de} / ${e.name.en}`,
    '',
    `- **Datei:** \`${e.id}.webp\``,
    `- **Kategorie:** ${CATEGORY[e.category] ?? e.category}`,
    `- **Seiten:** ${e.bilateral ? 'beidseitig – linke Seite zeigen' : 'symmetrisch bzw. beidseitig gleichzeitig'}`,
    `- **Beschreibung:** ${e.notes.de}`,
    `- **Description:** ${e.notes.en}`,
  ]
  return lines.join('\n')
})

writeFileSync(new URL('docs/exercise-images.md', root), `${intro}\n${rows.join('\n\n')}\n`)
console.log(`docs/exercise-images.md: ${catalog.exercises.length} exercises`)
