# LEMMEL!

LEMMEL! är ett retro/DOS-inspirerat lemming-spel byggt som en fristående
HTML5 Canvas-applikation. Spelet ligger i en enda HTML-fil som laddar vanliga
browser-script från `js/`, utan byggsteg och utan externa beroenden.

Målet är att rädda tillräckligt många lemlar genom banor med destruerbar
terräng, vatten, lava, nattmörker, grottor, ökenmiljöer, stadsmiljöer,
slumphändelser och olika verktyg.

## Starta spelet

Öppna:

```text
LEMMEL_fixed_v44.html
```

i en modern webbläsare.

Spelet använder bara lokala script och bör fungera direkt från filsystemet.
Ljud startar först efter en användarinteraktion, vilket är normalt i moderna
webbläsare.

## Kontroller

- Vänsterklicka på en skill i HUD:en och klicka sedan på en lemmel för att använda den.
- Högerklicka på en lemmel: direktstyr en lemmel en gång per bana.
- Piltangenter: styr direktstyrd lemmel.
- Shift: spring när en lemmel direktstyrs.
- Ctrl: visa sikte i direktstyrt läge och justera skjutvinkel med vänster/höger.
- L: tänd/släck handlampa i direktstyrt läge.
- Mellanslag: paus.
- Escape eller B: tillbaka till banmenyn.
- R: starta om aktuell bana.
- H: visa/dölj hjälp.
- F: helskärm.
- M: musik på/av.
- S: ljudeffekter på/av.
- K: byt spelläge i titel/meny/briefing.

## Skills

Spelet innehåller bland annat:

- Klättrare
- Fallskärm
- Bombare
- Blockerare
- Bygg upp
- Bygg ned
- Hackare
- Tunnelgrävare
- Grävare
- Bazooka
- Jetpack
- Eldkastare
- Repkrok
- Megabomb
- Spara/ladda läge

Vissa skills kan också komma via paket som släpps från flygplan eller hittas som
loot i banorna.

## Banor och innehåll

Banorna definieras i `js/06_levels.js`. Spelet innehåller 30 banor uppdelade i
tre kapitel på banmenyn.

Miljöer som används:

- Jord och skog
- Lava/helvetesmiljö
- Kristall och marmor
- Nattbanor med lykta, facklor och meteorer
- Grå stengrottor med droppar och mörker
- Ökenbanor med pyramider, mumier, oaser och ruiner
- Stadsbanor med tak, tunnelbana, bussar och taxibilar

Det finns även bonusmål i vissa banor, till exempel fångade lemlar som kan
släppas fria med knappar.

## Projektstruktur

```text
LEMMEL_fixed_v44.html   HTML-skalet som laddar spelet
js/00_util.js           canvas, konstanter, hjälpmetoder, prefs
js/01_pixelfont.js      pixeltext
js/02_audio.js          procedurella ljud och musik
js/03_themes.js         terrängteman och material
js/04_terrain.js        destruerbar terrängmask
js/05_lemming.js        lemmel-tillstånd och skill-logik
js/06_levels.js         banor
js/07_game.js           spelmotor, state, events och objektlogik
js/08_render.js         rendering av värld, figurer, dekor och väder
js/09_hud.js            HUD, knappar och minikarta
js/10_screens.js        titel, meny, briefing, resultat och hjälp
js/11_play_render.js    huvudrendering för spelvyn
js/12_input.js          mus, touch och tangentbord
js/13_boot.js           initiering och huvudloop
tools/verify-game.js    smoke test/validering
```

`js/README.md` beskriver scriptens laddningsordning mer tekniskt. Behåll den
ordningen i HTML-filen, eftersom filerna delar globala objekt och funktioner.

## Verifiering

Kör syntaxkontroll för alla script:

```powershell
Get-ChildItem js -Filter *.js | ForEach-Object { node --check $_.FullName }
```

Kör spelets verifiering:

```powershell
node tools\verify-game.js
```

Verifieringen laddar samma script som HTML-filen, bygger banorna och gör ett
enkelt render-smoketest.

## Utvecklingsnoteringar

- Spelet använder inte ES-moduler. Det är avsiktligt för att bevara den enkla
  fristående HTML-strukturen.
- All grafik är kodritad pixelart via Canvas.
- Ljud och musik är procedurella via Web Audio API.
- Terrängen består av en mask som kan ändras av bomber, bazooka, eld, grävning,
  hackning och andra händelser.
- När du ändrar banor, terräng eller rendering bör du alltid köra verifieringen.
