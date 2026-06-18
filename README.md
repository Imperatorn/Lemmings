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
LEMMEL.html
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
- I banmenyn: klicka på musik- och SFX-reglagen för att ändra volym.
- I banmenyn: klicka på FILMER-knappen för att slå på/av cutscenes.
- K: byt spelläge i titel/meny/briefing.
- V: växla mellan kampanjläge och fritt banval i titel/meny.
- `+` / `-`: ändra tempo innan en bana startas.

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

## Ban- och grafikdesign

När banor eller dekor ändras ska det visuella stödja banans namn, tema och
spelidé. Det här är de designregler vi har sett tydliga exempel på i spelet:

- Banans namn ska synas i banan. En ravinbana ska ha en tydlig ravin, en
  marmorgrotta ska visa marmor och en bana under rötterna ska ha rötter som
  känns förankrade i marken.
- Byt inte gameplay-geometri när ändringen bara gäller material eller stil. Om
  en bana bygger på en vägg, ett gap eller en platå ska den formen bevaras.
- Materialeffekter ska vara sammanhängande över sammanhängande terräng. Undvik
  höjd-/djupgradienter som startar om från varje separat toppyta, eftersom det
  ger synliga färgband mellan pelare, väggar och plattformar. Använd hellre
  mönster, ådror, sprickor och ythighlights, eller en globalt konsekvent
  ljussättning.
- Dekor ska vara fysiskt rimlig. Rötter ska sitta i mark, skyltar ska stå på
  något, pyramider och stenar ska inte sväva och fordon ska inte klippas på ett
  sätt som ser oavsiktligt ut.
- Dekor ska också passa materialet. Grottdetaljer som stalagmiter kan fungera i
  grottor men se fel ut i glas- eller kristallbanor, särskilt om de hamnar nära
  väggar eller pelare. Byt färg/stil eller ersätt dem med mer tematiska objekt.
- Otydliga pixelart-detaljer ska förenklas, flyttas eller tas bort. En detalj
  som inte läses som det den föreställer gör banan mindre polerad.
- Banor som delar grundtema bör ändå få egen visuell identitet. Skilj dem med
  materialvariant, dekorplacering och tydliga motiv, inte genom att ändra
  spelidén eller lägga in objekt som inte hör hemma.
- All grafik, väder och alla effekter ska hålla samma retro/DOS-känsla. Undvik
  animationer eller former som ser för moderna, mjuka eller stilmässigt
  avvikande ut.
- Objekt som påverkas av terräng ska bete sig logiskt när terrängen ändras.
  Rep, facklor, figurer och dekor får inte bli kvar svävande när deras stöd
  sprängs eller grävs bort.
- Lägg gärna objektiva designregler i `tools/verify-game.js` när de går att
  testa, till exempel att en viss bana har en öppen ravin eller att root-dekor
  sitter i terräng.

## Projektstruktur

```text
LEMMEL.html             HTML-skalet som laddar spelet
assets/                 bildassets, till exempel pixelart-versioner av uppladdade bilder
js/00_util.js           canvas, konstanter, hjälpmetoder, prefs
js/01_pixelfont.js      pixeltext
js/02_audio.js          procedurella ljud och musik
js/03_themes.js         terrängteman och material
js/04_terrain.js        destruerbar terrängmask
js/05_lemming.js        lemmel-tillstånd och skill-logik
js/06_levels.js         banor
js/07_game.js           spelmotor, state, events och huvudflöde
js/07_runes.js          runor, hemligheter och fullbordad-status
js/07_progression.js    kampanj/fritt banval och upplåsningsregler
js/07_portal_stone.js   teleportstenens gameplaylogik
js/07_save_state.js     spara/ladda-logik för spelstate
js/07_manual_control.js direktstyrning, sikte och manual-skill helpers
js/07_waterfall_cave_scenes.js scenregister, bounds, exits och objekt för vattenfallsgrottan
js/07_waterfall_cave.js vattenfallsgrottans runtime-state, input och loot
js/07_living_world.js   svamp, mumier, meteorer och andra levande värld-effekter
js/07_cutscenes.js      cutscene-API, tidslinjer och overlayrendering
js/07_cutscene_scenes.js registrerade cutscene-scener och pixelart-innehåll
js/08_render.js         rendering av värld, figurer, dekor och väder
js/09_hud.js            HUD, knappar och minikarta
js/10_screens.js        titel, meny, briefing, resultat och hjälp
js/11_waterfall_cave_render.js rendering för vattenfallsgrottans scener
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

Verifieringen laddar samma script som HTML-filen, kontrollerar runtime-moduler,
bygger banorna, gör ett enkelt render-smoketest och provar spara/återställ.

## Överlämning till ny agent

Det här är de viktigaste sakerna att känna till innan du fortsätter utveckla:

- Börja med `README.md`, `js/README.md` och `tools/verify-game.js`. De ger bäst
  bild av struktur, scriptordning och vilka antaganden som redan verifieras.
- `debug.html` är en separat testsida som inte laddar `js/13_boot.js`. Den är
  avsedd för snabb test av animationer, ljud, väder, paket, flygplanskrasch,
  skills och specialfall som fisk/badring. När en ny synlig mekanik läggs till
  bör den helst få en debugknapp.
- Cutscene-motorn ligger i `js/07_cutscenes.js`; själva scenerna ligger i
  `js/07_cutscene_scenes.js`. Lägg normalt nya scener i scenmodulen och
  registrera dem med `G.registerCutscene(...)`, så dyker de upp i debugvyn via
  `G.cutsceneList({debug:true})`. `G.playCutscene(spec)` kan fortfarande spela
  en engångsscen. Modulen stöder `mode: 'box'` och `mode: 'fullscreen'` och
  stoppar gameplay när `pauseGame` inte satts till `false`. Spelarens menyval
  `FILMER` sparas som `cutscenesOn` och respekteras av `G.playCutscene(...)`
  som standard.
- `tools/verify-game.js` är projektets viktigaste skyddsnät. Lägg till små
  objektiva tester där det går, särskilt för regler som annars lätt glöms bort:
  stöd för dekor, nivågeometri, specialskills, scriptordning och debugknappar.
- Spelet använder globala browser-script, inte importer. Om en funktion flyttas
  mellan filer måste scriptordningen i både `LEMMEL.html` och
  `debug.html` fortfarande fungera.
- Nya fält på `Lemming`, `G` eller dekorobjekt bör få rimliga defaultvärden.
  Spara/ladda använder mycket `Object.assign`, så enkla datafält följer ofta
  med automatiskt, men tillstånd som kräver återinitiering måste kontrolleras.
- Vatten och lava har olika regler. Vatten tolererar några pixlars kontakt innan
  drunkning, medan lava ska vara farligt nästan direkt. En fisk nära en lemmel i
  vatten kan ge badring med 20% chans per vattenkontakt. Badring ger `SWIM`,
  skyddar mot vatten, kan gå över till `CLIMB` om lemmeln är klättrare och kan
  även använda repkrok för att komma upp. Lava ska fortfarande döda även om
  lemmeln har badring.
- Repkrok är delad mellan `js/07_rope.js`, `js/05_lemming.js` och
  `js/07_game.js`. Repet ska lossna om ankarmaterialet sprängs bort, och när en
  lemmel börjar klättra i rep ska tidigare sim-/fallskärmsliknande status inte
  ligga kvar och störa.
- Apor, flygplan och missiler har ett särskilt flöde: om spelaren använder bomb
  på en apa när ett flygplan är aktivt skjuter planet en missil mot apan. Finns
  inget aktivt flygplan köas flygstöd till nästa flygplanspassage, och planet
  kan då skjuta alla apor som finns under överflygningen. Grottbanor ska inte
  skapa apor eller flygplan.
- Trollstenar som landar på vanlig mark kan bli kvar som små hinder. De ska inte
  landa på trappor, inte staplas för tätt, och lemlar ska alltid kunna ta sig
  över dem med den korta `VAULT`-animationen i `js/05_lemming.js`.
- Räddningsburar ska öppnas utan att ta bort terräng under buren. Buren bör
  hänga en bit ovanför marken, knappen ska stå på stöd, och den öppna grafiken
  ritas i `js/08_render.js`.
- Det finns ett experimentellt radio-/taltest i `debug.html` under
  `Ljudeffekter -> Radio`. Det använder webbläsarens Web Speech API och är bara
  en prototyp; för konsekvent basröst/komradio i själva spelet bör man hellre
  använda förgenererade ljudfiler via en riktig ljudasset-laddare.
- Håll debugscener kontrollerade. Bygg gärna en liten temporär testplattform
  eller vägg i debugläget, men ändra inte nivådata bara för att en debuganimation
  ska fungera.

## Utvecklingsnoteringar

- Spelet använder inte ES-moduler. Det är avsiktligt för att bevara den enkla
  fristående HTML-strukturen.
- All grafik är kodritad pixelart via Canvas.
- Ljud och musik är procedurella via Web Audio API.
- Terrängen består av en mask som kan ändras av bomber, bazooka, eld, grävning,
  hackning och andra händelser.
- När du ändrar banor, terräng eller rendering bör du alltid köra verifieringen.
