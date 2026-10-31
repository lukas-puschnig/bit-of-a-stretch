# Übungsbilder – Briefing

> Automatisch erzeugt aus `src/data/catalog.json` mit `npm run docs:images`. Nicht von Hand
> bearbeiten, sondern das Skript `scripts/image-briefing.mjs` anpassen.

Dieses Dokument ist als Auftrag für eine separate Claude-Instanz (oder ein anderes Bildwerkzeug)
gedacht. Es beschreibt, wie die Bilder aussehen sollen, und listet alle 49
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
| Größe | **1024 × 1024 px**, quadratisch (SVG: `viewBox="0 0 1024 1024"`) |
| Dateigröße | möglichst unter 150 KB (WebP-Qualität ca. 80) |
| Farbraum | sRGB |
| Dateiname | exakt die **ID** aus der Liste, z. B. `pigeon.webp` |
| Ablage | `src/assets/exercises/` – die App ordnet die Bilder beim Build automatisch zu |

Kann die Instanz keine Rasterbilder erzeugen, sind **SVG-Illustrationen** ausdrücklich
erwünscht: Sie bleiben klein, scharf und werden ebenfalls automatisch erkannt.

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
- Zuerst ein Referenzbild erstellen (Vorschlag: `childs-pose`) und alle weiteren daran
  ausrichten: gleiche Figur, gleiche Strichstärke, gleiche Farben.

## Rechtliches

- Die Bilder werden mit der App unter der MIT-Lizenz veröffentlicht. Es dürfen nur Bilder
  verwendet werden, an denen wir diese Rechte haben: selbst erstellt, für dieses Projekt
  generiert (mit einem Werkzeug, dessen Nutzungsbedingungen das erlauben) oder ausdrücklich frei
  lizenziert (CC0; CC BY nur mit Namensnennung).
- Keine Vorlagen aus anderen Apps (z. B. Bend), Büchern oder Stockfoto-Seiten nachzeichnen.

## Übungen

### 1. Seitliche Nackendehnung / Lateral neck stretch

- **Datei:** `neck-side-stretch.webp`
- **Kategorie:** Nacken
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Aufrecht sitzen, Ohr Richtung Schulter neigen, die Hand zieht sanft am Kopf. Gegenüberliegende Schulter nach unten schieben.
- **Description:** Sit tall, tilt your ear towards your shoulder and let the hand gently pull the head. Push the opposite shoulder down.

### 2. Nackenrotation / Neck rotations

- **Datei:** `neck-rotation.webp`
- **Kategorie:** Nacken
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Kopf langsam von einer Seite zur anderen drehen, Blick führt, Schultern bleiben ruhig.
- **Description:** Slowly turn the head from side to side, leading with your eyes. Keep the shoulders still.

### 3. Chin Tucks / Chin tucks

- **Datei:** `chin-tuck.webp`
- **Kategorie:** Nacken
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Kinn waagerecht nach hinten schieben (Doppelkinn), kurz halten, lösen. Hinterkopf wird lang.
- **Description:** Glide the chin straight back (double chin), hold briefly, release. Lengthen the back of the neck.

### 4. Brustdehnung im Türrahmen / Doorway chest stretch

- **Datei:** `doorway-pec.webp`
- **Kategorie:** Schultern & Brust
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Unterarm am Rahmen, Ellbogen auf Schulterhöhe, Körper sanft nach vorne lehnen.
- **Description:** Forearm on the door frame, elbow at shoulder height, gently lean your body forward.

### 5. Schulter-Querdehnung / Cross-body shoulder stretch

- **Datei:** `cross-body-shoulder.webp`
- **Kategorie:** Schultern & Brust
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Gestreckten Arm vor der Brust zur Gegenseite ziehen, Schulter bleibt unten.
- **Description:** Pull the straight arm across your chest towards the other side, keeping the shoulder down.

### 6. Sleeper Stretch / Sleeper stretch

- **Datei:** `sleeper-stretch.webp`
- **Kategorie:** Schultern & Brust
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Seitlage auf der zu dehnenden Schulter, Ellbogen 90°, Unterarm mit der anderen Hand sanft Richtung Boden drücken.
- **Description:** Lie on the shoulder you want to stretch, elbow at 90°, gently press the forearm towards the floor with the other hand.

### 7. Puppy Pose / Puppy pose

- **Datei:** `puppy-pose.webp`
- **Kategorie:** Schultern & Brust
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Aus dem Vierfüßlerstand Hände weit nach vorne wandern, Hüfte über den Knien, Brust Richtung Boden sinken lassen.
- **Description:** From all fours walk the hands far forward, keep hips over knees and let the chest sink towards the floor.

### 8. Wall Angels / Wall angels

- **Datei:** `wall-angels.webp`
- **Kategorie:** Schultern & Brust
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Rücken und Arme an der Wand, Arme langsam wie beim Schneeengel hoch und runter gleiten lassen.
- **Description:** Back and arms against the wall, slowly slide the arms up and down like a snow angel.

### 9. Schulterkreisen mit Band / Band pass-throughs

- **Datei:** `band-pass-through.webp`
- **Kategorie:** Schultern & Brust
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Band oder Stab breit greifen, gestreckte Arme über den Kopf nach hinten und zurück führen.
- **Description:** Hold a band or stick wide, move the straight arms over your head to behind your back and return.

### 10. Trizepsdehnung über Kopf / Overhead triceps stretch

- **Datei:** `overhead-triceps.webp`
- **Kategorie:** Arme & Handgelenke
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Arm hinter den Kopf, Hand zwischen die Schulterblätter, andere Hand zieht den Ellbogen sanft.
- **Description:** Reach the hand down between your shoulder blades, the other hand gently pulls the elbow.

### 11. Bizepsdehnung an der Wand / Wall biceps stretch

- **Datei:** `biceps-wall.webp`
- **Kategorie:** Arme & Handgelenke
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Handfläche auf Schulterhöhe an die Wand, Arm gestreckt, Körper langsam von der Wand wegdrehen.
- **Description:** Palm on the wall at shoulder height, arm straight, slowly rotate your body away from the wall.

### 12. Handgelenk-Beuger-Dehnung / Wrist flexor stretch

- **Datei:** `wrist-flexor.webp`
- **Kategorie:** Arme & Handgelenke
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Vierfüßlerstand, Finger zeigen Richtung Knie, Handflächen flach, Gewicht langsam nach hinten verlagern.
- **Description:** On all fours with fingers pointing towards your knees and palms flat, slowly shift your weight back.

### 13. Handrücken-Dehnung / Wrist extensor stretch

- **Datei:** `wrist-extensor.webp`
- **Kategorie:** Arme & Handgelenke
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Vierfüßlerstand, Handrücken auf dem Boden, Finger zeigen zu den Knien, vorsichtig nach hinten lehnen.
- **Description:** On all fours with the backs of your hands on the floor and fingers towards the knees, carefully lean back.

### 14. Katze-Kuh / Cat-cow

- **Datei:** `cat-cow.webp`
- **Kategorie:** Rücken & Wirbelsäule
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Im Vierfüßlerstand langsam zwischen Rundrücken und Hohlkreuz wechseln, Atmung mitführen.
- **Description:** On all fours, slowly alternate between rounding and arching your back, moving with your breath.

### 15. Open Book / Open book

- **Datei:** `thoracic-rotation.webp`
- **Kategorie:** Rücken & Wirbelsäule
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Seitlage, Knie angewinkelt, oberen Arm weit nach hinten aufdrehen, Blick folgt der Hand.
- **Description:** Lie on your side with knees bent, open the top arm wide behind you and follow the hand with your eyes.

### 16. Thread the Needle / Thread the needle

- **Datei:** `thread-the-needle.webp`
- **Kategorie:** Rücken & Wirbelsäule
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Im Vierfüßlerstand einen Arm unter dem Körper durchfädeln, Schulter und Schläfe ablegen.
- **Description:** On all fours, thread one arm under your body and rest the shoulder and temple on the floor.

### 17. Kindhaltung / Child's pose

- **Datei:** `childs-pose.webp`
- **Kategorie:** Rücken & Wirbelsäule
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Gesäß zu den Fersen, Arme lang nach vorne, ruhig in den Rücken atmen.
- **Description:** Sit back onto your heels, arms long in front, breathe calmly into your back.

### 18. Kobra / Cobra

- **Datei:** `cobra.webp`
- **Kategorie:** Rücken & Wirbelsäule
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Bauchlage, Hände unter den Schultern, Oberkörper sanft aufrichten, Becken bleibt am Boden.
- **Description:** Lie on your stomach with hands under your shoulders, gently lift the chest while the pelvis stays down.

### 19. Kamel / Camel pose

- **Datei:** `camel.webp`
- **Kategorie:** Rücken & Wirbelsäule
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Kniestand, Hände an die Fersen oder ins Kreuz, Hüfte nach vorne schieben, Brustbein hebt sich.
- **Description:** Kneel upright, hands on heels or lower back, push the hips forward and lift the breastbone.

### 20. Liegende Drehung / Supine twist

- **Datei:** `supine-twist.webp`
- **Kategorie:** Rücken & Wirbelsäule
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Rückenlage, ein Knie zur Gegenseite ablegen, Arme ausgebreitet, beide Schultern bleiben am Boden.
- **Description:** Lie on your back, drop one knee across to the other side, arms wide, both shoulders stay down.

### 21. Seitneigung im Stand / Standing side bend

- **Datei:** `standing-side-bend.webp`
- **Kategorie:** Rücken & Wirbelsäule
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Hüftbreiter Stand, einen Arm über den Kopf, Oberkörper zur Seite neigen, nicht nach vorne kippen.
- **Description:** Stand hip-width apart, reach one arm overhead and bend sideways without tipping forward.

### 22. Knie zur Brust / Knees to chest

- **Datei:** `knees-to-chest.webp`
- **Kategorie:** Rücken & Wirbelsäule
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Rückenlage, beide Knie umarmen und sanft zur Brust ziehen, unterer Rücken entspannt.
- **Description:** Lie on your back, hug both knees and gently draw them to your chest, lower back relaxed.

### 23. Jefferson Curl / Jefferson curl

- **Datei:** `jefferson-curl.webp`
- **Kategorie:** Rücken & Wirbelsäule
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Im Stand Wirbel für Wirbel nach unten rollen, Beine gestreckt, langsam wieder aufrollen. Ohne oder mit leichtem Gewicht.
- **Description:** Standing, roll down one vertebra at a time with straight legs, then slowly roll back up. Bodyweight or a light weight.

### 24. Taube / Pigeon pose

- **Datei:** `pigeon.webp`
- **Kategorie:** Hüfte & Gesäß
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Vorderes Schienbein möglichst parallel zur Mattenkante, hinteres Bein lang, Hüfte gerade halten.
- **Description:** Front shin as parallel to the front of the mat as possible, back leg long, keep the hips square.

### 25. 90/90 Hip Switch / 90/90 hip switch

- **Datei:** `90-90.webp`
- **Kategorie:** Hüfte & Gesäß
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Beide Knie im 90°-Winkel am Boden, kontrolliert von einer Seite zur anderen kippen.
- **Description:** Sit with both knees bent at 90° on the floor and rotate from side to side with control.

### 26. Liegende Vier / Figure-four stretch

- **Datei:** `figure-four.webp`
- **Kategorie:** Hüfte & Gesäß
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Rückenlage, Knöchel auf das gegenüberliegende Knie, Oberschenkel sanft zur Brust ziehen.
- **Description:** Lie on your back, cross one ankle over the opposite knee and gently pull the thigh towards your chest.

### 27. Eidechse / Lizard pose

- **Datei:** `lizard.webp`
- **Kategorie:** Hüfte & Gesäß
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Tiefer Ausfallschritt, beide Hände innen neben dem vorderen Fuß, Hüfte sinken lassen. Optional auf die Unterarme.
- **Description:** Deep lunge with both hands inside the front foot, let the hips sink. Optionally lower to the forearms.

### 28. Hüftkreisen im Vierfüßler / Quadruped hip circles

- **Datei:** `hip-cars.webp`
- **Kategorie:** Hüfte & Gesäß
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Im Vierfüßlerstand ein Knie langsam in möglichst großem Kreis führen, Rumpf bleibt ruhig.
- **Description:** On all fours, move one knee in the largest circle you can control while the torso stays still.

### 29. Happy Baby / Happy baby

- **Datei:** `happy-baby.webp`
- **Kategorie:** Hüfte & Gesäß
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Rückenlage, Füße außen greifen, Knie Richtung Achseln ziehen, Kreuzbein bleibt am Boden.
- **Description:** Lie on your back, hold the outside of your feet and draw the knees towards your armpits, tailbone down.

### 30. Tiefe Hocke / Deep squat

- **Datei:** `deep-squat.webp`
- **Kategorie:** Hüfte & Gesäß
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Fersen am Boden, Ellbogen drücken die Knie sanft nach außen, Brust aufrecht.
- **Description:** Heels down, elbows gently press the knees outwards, chest up.

### 31. Hüftbeuger-Dehnung / Kneeling hip flexor stretch

- **Datei:** `hip-flexor.webp`
- **Kategorie:** Oberschenkel vorne
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Kniender Ausfallschritt, Becken aufrichten, Gesäß des hinteren Beins anspannen.
- **Description:** Half-kneeling lunge, tuck the pelvis and squeeze the glute of the back leg.

### 32. Couch Stretch / Couch stretch

- **Datei:** `couch-stretch.webp`
- **Kategorie:** Oberschenkel vorne
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Hinteres Knie an die Wand, Schienbein an der Wand hoch. Oberkörper langsam aufrichten.
- **Description:** Back knee against the wall, shin up the wall. Slowly bring your torso upright.

### 33. Oberschenkeldehnung im Stand / Standing quad stretch

- **Datei:** `standing-quad.webp`
- **Kategorie:** Oberschenkel vorne
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Ferse zum Gesäß ziehen, Knie zeigen nach unten und bleiben nebeneinander, Becken leicht aufrichten.
- **Description:** Pull the heel towards your glutes, knees point down and stay together, tuck the pelvis slightly.

### 34. Sitzende Vorbeuge / Seated forward fold

- **Datei:** `seated-forward-fold.webp`
- **Kategorie:** Beinrückseite
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Beine gestreckt, Bauch Richtung Oberschenkel, aus der Hüfte kippen statt den Rücken zu runden.
- **Description:** Legs straight, bring your belly towards your thighs by hinging at the hips rather than rounding the back.

### 35. Stehende Vorbeuge / Standing forward fold

- **Datei:** `standing-forward-fold.webp`
- **Kategorie:** Beinrückseite
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Aus dem Stand nach vorne hängen lassen, Knie leicht gebeugt erlaubt, Kopf und Nacken locker.
- **Description:** Hang forward from standing, slightly bent knees are fine, head and neck relaxed.

### 36. Halber Spagat / Half split

- **Datei:** `half-split.webp`
- **Kategorie:** Beinrückseite
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Aus dem Kniestand vorderes Bein strecken, Fußspitze zeigt hoch, Hüfte nach hinten, Oberkörper lang nach vorne.
- **Description:** From kneeling, straighten the front leg with toes up, shift the hips back and lengthen forward.

### 37. Einbeinige Vorbeuge / Head-to-knee forward fold

- **Datei:** `head-to-knee.webp`
- **Kategorie:** Beinrückseite
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Sitzend ein Bein gestreckt, die andere Fußsohle innen am Oberschenkel, über das gestreckte Bein nach vorne beugen.
- **Description:** Seated with one leg straight and the other sole against the inner thigh, fold forward over the straight leg.

### 38. Beinrückseite liegend mit Band / Supine hamstring stretch

- **Datei:** `supine-hamstring.webp`
- **Kategorie:** Beinrückseite
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Rückenlage, Band um den Fuß, gestrecktes Bein Richtung Decke ziehen, anderes Bein bleibt am Boden.
- **Description:** Lie on your back with a band around one foot, pull the straight leg towards the ceiling, other leg stays down.

### 39. Pancake / Pancake stretch

- **Datei:** `pancake.webp`
- **Kategorie:** Adduktoren
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Gegrätschter Sitz, aus der Hüfte nach vorne kippen, Rücken lang, Kniescheiben zeigen nach oben.
- **Description:** Straddle sit, tilt forward from the hips with a long back, kneecaps pointing up.

### 40. Frosch / Frog stretch

- **Datei:** `frog.webp`
- **Kategorie:** Adduktoren
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Knie weit auseinander, Unterschenkel parallel, Hüfte langsam Richtung Fersen schieben.
- **Description:** Knees wide apart, shins parallel, slowly push the hips back towards your heels.

### 41. Schmetterling / Butterfly stretch

- **Datei:** `butterfly.webp`
- **Kategorie:** Adduktoren
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Fußsohlen zusammen, Knie fallen nach außen, mit langem Rücken leicht nach vorne kippen.
- **Description:** Soles of the feet together, knees fall outwards, tilt slightly forward with a long back.

### 42. Kosakenkniebeuge / Cossack squat

- **Datei:** `cossack-squat.webp`
- **Kategorie:** Adduktoren
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Breiter Stand, abwechselnd tief über ein Bein absenken, das andere Bein gestreckt, Fußspitze hoch.
- **Description:** Wide stance, alternately sink deep over one leg while the other stays straight with toes up.

### 43. Seitlicher Ausfallschritt / Side lunge stretch

- **Datei:** `side-lunge.webp`
- **Kategorie:** Adduktoren
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Breiter Stand, ein Knie beugen und Gewicht darüber verlagern, anderes Bein gestreckt, Füße flach.
- **Description:** Wide stance, bend one knee and shift your weight over it, other leg straight, feet flat.

### 44. Wadendehnung an der Wand / Wall calf stretch

- **Datei:** `wall-calf.webp`
- **Kategorie:** Waden & Füße
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Hände an der Wand, hinteres Bein gestreckt, Ferse bleibt am Boden, Hüfte Richtung Wand schieben.
- **Description:** Hands on the wall, back leg straight with the heel down, push the hips towards the wall.

### 45. Knöchelmobilisation kniend / Kneeling ankle rocks

- **Datei:** `ankle-rocks.webp`
- **Kategorie:** Waden & Füße
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Halbkniestand, vorderes Knie langsam über die Zehen nach vorne schieben, Ferse bleibt unten.
- **Description:** Half-kneeling, slowly drive the front knee forward over the toes while the heel stays down.

### 46. Zehensitz / Toe squat

- **Datei:** `toe-squat.webp`
- **Kategorie:** Waden & Füße
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Kniend auf die aufgestellten Zehen setzen, Gewicht langsam nach hinten verlagern.
- **Description:** Kneel with your toes tucked under and slowly sit your weight back onto your heels.

### 47. World's Greatest Stretch / World's greatest stretch

- **Datei:** `worlds-greatest.webp`
- **Kategorie:** Ganzkörper
- **Seiten:** beidseitig – linke Seite zeigen
- **Beschreibung:** Ausfallschritt, Ellbogen Richtung Fußgewölbe, dann Arm zur Decke aufdrehen.
- **Description:** Lunge, bring the elbow towards the arch of the front foot, then rotate the arm up to the ceiling.

### 48. Herabschauender Hund / Downward dog

- **Datei:** `downward-dog.webp`
- **Kategorie:** Ganzkörper
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Hände und Füße am Boden, Hüfte hoch und nach hinten, Rücken lang, Fersen Richtung Boden.
- **Description:** Hands and feet on the floor, hips high and back, long spine, heels reaching towards the floor.

### 49. Squat to Stand / Squat to stand

- **Datei:** `squat-to-stand.webp`
- **Kategorie:** Ganzkörper
- **Seiten:** symmetrisch bzw. beidseitig gleichzeitig
- **Beschreibung:** Zehenspitzen greifen, Gesäß in die Hocke sinken lassen, Brust hoch, dann Beine strecken. Im Wechsel.
- **Description:** Hold your toes, sink into a squat with the chest up, then straighten the legs. Alternate.
