# Bit of a Stretch

Timer für Mobility- und Dehnroutinen als installierbare Web-App (PWA). Läuft komplett im Browser,
ohne Backend, und wird über GitHub Pages ausgeliefert.

## Entwicklung

```sh
npm install
npm run dev        # Dev-Server, mit --host auch im LAN erreichbar
npm test           # Vitest
npm run check      # svelte-check + TypeScript
npm run lint       # ESLint + Prettier
npm run format     # Prettier schreibt Formatierung
npm run build      # Produktions-Build nach dist/
```

Für einen Build unter einem Unterpfad (wie auf GitHub Pages) `BASE_PATH=/bit-of-a-stretch/ npm run build`.

## Deployment

`.github/workflows/deploy.yml` prüft bei jedem Push (Lint, Typen, Tests) und veröffentlicht `main`
auf GitHub Pages. Einmalig in den Repo-Einstellungen unter *Settings → Pages → Source*
„GitHub Actions“ auswählen.

## Aufbau

```
src/
  data/seed.json          Beispielübungen und -routinen für den ersten Start
  lib/model/              Typen, Auflösung Routine → Phasen (plan.ts), Validierung, Backup
  lib/timer/engine.ts     Reine Timer-Zustandsmaschine über die Phasenliste
  lib/timer/player.svelte.ts   Reaktive Hülle, treibt die Engine per requestAnimationFrame
  lib/storage/db.ts       IndexedDB-Zugriff
  lib/stores/             App-Zustand (Bibliothek, Einstellungen, UI)
  lib/audio/beeper.ts     Signaltöne über die Web Audio API
  components/, views/     Svelte-Oberfläche
```

Eine Routine verweist nur auf Übungen der Bibliothek; jeder Eintrag darf Dauer, Pause danach und
Seitenwechsel überschreiben. Beim Abspielen wird sie in eine flache Liste von Phasen aufgelöst
(Vorbereitung, Übung bzw. Links/Wechsel/Rechts, Pause). Der Timer arbeitet nur diese Liste ab.

### Bilder

Übungen haben ein optionales Feld `image`. Relative Pfade werden gegen die Basis-URL aufgelöst,
Bilder können also z. B. unter `public/images/` abgelegt und als `images/pancake.webp` eingetragen
werden. Das Bild erscheint dann in der Mitte des Timer-Rings.

## Daten

Eigene Übungen und Routinen liegen in IndexedDB, also nur in diesem Browser auf diesem Gerät.
Export und Import als JSON (Menü → Daten & Einstellungen) dienen als Backup und zum Übertragen
zwischen Geräten.

## Lizenz

[MIT](LICENSE) © 2026 Lukas Puschnig

Alle mitgelieferten Abhängigkeiten stehen unter freien Lizenzen (MIT bzw. ISC). Ihre Lizenztexte
erzeugt der Build als `third-party-licenses.md`; die App verlinkt sie unter
*Daten & Einstellungen → Über & Lizenzen*. Die App liefert keine eigenen Schriften aus, sondern
nutzt die Systemschrift. Bilder für Übungen nur verwenden, wenn sie selbst erstellt oder frei
lizenziert sind (z. B. CC0, CC BY mit Namensnennung).
