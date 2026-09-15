# LEMMEL script layout

Koden är uppdelad i vanliga browser-script, inte ES-moduler. Det är medvetet:
befintlig kod delar globala `const`, `class` och funktioner mellan filerna.

Behåll laddningsordningen i `LEMMEL.html`:

1. `00_util.js` - canvas, konstanter, hjälpfunktioner och felrapportering
2. `01_pixelfont.js` - pixeltext
3. `02_audio.js` - ljud och musik (`AU`)
4. `03_themes.js` - terrängteman (`THEMES`)
5. `04_terrain.js` - destruerbar terräng (`Terrain`)
6. `05_lemming.js` - lemminglogik (`Lemming`)
7. `06_levels.js` - bandata (`LEVELS`)
8. `07_game.js` - spelmotor och state (`G`)
9. `07_rope.js` - repkrok/rephantering för `G`
10. `07_save_state.js` - spara/ladda-metoder för `G`
11. `07_manual_control.js` - direktstyrning och manual-skill helpers
12. `07_waterfall_cave_scenes.js` - scenregister, bounds, exits och objekt för vattenfallsgrottan
13. `07_underwater_cave_scenes.js` - scenregister, bounds, exits, objekt och djuprunor för undervattensgrottan
14. `07_runes.js` - runkatalog, profilprogression och runbaserad fullbordad-status
15. `07_progression.js` - kampanj/fritt banval och upplåsningsregler
16. `07_portal_stone.js` - portalstenens gameplaylogik
17. `07_waterfall_cave.js` - vattenfallsgrottans runtime-state, input och loot
18. `07_underwater_cave.js` - undervattensgrottans runtime-state, input, ljud och hot
19. `07_living_world.js` - levande värld-effekter som svamp, mumier och meteorer
20. `07_cutscenes.js` - cutscene-API, tidslinjer och overlayrendering
21. `07_cutscene_scenes.js` - registrerade cutscene-scener och pixelart-innehåll
22. `08_render.js` - världs- och figur-rendering
23. `09_hud.js` - HUD och knappar
24. `10_screens.js` - titel, meny, briefing och overlays
25. `11_waterfall_cave_render.js` - rendering för vattenfallsgrottans scener
26. `11_underwater_cave_render.js` - rendering för undervattensgrottans scener
27. `11_play_render.js` - huvudrendering för spelvyn
28. `12_input.js` - mus, touch och tangentbord
29. `13_boot.js` - initiering och huvudloop

Om en fil flyttas tidigare kan den sakna globala bindningar från filerna ovanför.

Efter större ändringar, kör:

```powershell
node tools/verify-game.js
```

Det laddar samma script-taggar som HTML-filen, kontrollerar runtime-moduler,
bygger alla banor och gör en render-/save-smoketest.

## Praktiska noter för fortsatt utveckling

### Berättelsens röda tråd

Flocken söker hem till lämmelhimlen sedan en storm brutit den gamla molnvägen.
Runorna är spår efter tidigare vandrare, inte fristående lösenord. De 32 runorna
på land berättar om hemmet, flocken och utrustningen; de tio i djuparkivet
beskriver den förlorade fortsättningen upp till molnen. Himmelsbanornas `story`
för resan vidare till hemkomsten efter bana 40. Himlen är ett hem att nå levande,
inte en belöning för att förlora lämlar.

Behåll runornas ID:n och fördelningen 5/5/5/5/4/4/4 när texter ändras.
Upplåsningen kräver fortfarande bana 30, 32 runor på land och 10 djuprunor.
Slutbilden i `10_screens.js` är presentation i resultatläget, utan egen progression
eller ändringar av räddningsantal. `Hemkomsten` i debugpanelens filmsamling
förhandsvisar samma grafik. Tacktexterna på samlarkorten är separata från berättelsen.

### Spelmoduler

- `07_game.js` är fortfarande navet för globalt spelstate, men flera delar är
  brutna till tilläggsfiler som monterar metoder på `G`: rep i `07_rope.js`,
  save/load i `07_save_state.js`, direktstyrning i `07_manual_control.js`,
  vattenfallsgrottans scen-data i `07_waterfall_cave_scenes.js`,
  undervattensgrottans scen-data i `07_underwater_cave_scenes.js`, runor i
  `07_runes.js`, progression i `07_progression.js`, portalstenen i
  `07_portal_stone.js`, vattenfallsgrottans runtime i `07_waterfall_cave.js`,
  undervattensgrottans runtime i `07_underwater_cave.js` och levande
  värld-effekter i `07_living_world.js`.
- Vattenfallsgrottan är förberedd som ett eget litet adventure-läge. Nya rum
  bör i `WATERFALL_CAVE_SCENES` med `bounds`, `spawns`, `exits` och `objects`.
  Runtime-koden ska i första hand använda `G.setWaterfallCaveScene(...)`,
  `G.waterfallCaveSceneObjects(...)` och `G.waterfallCaveHitObject(...)`
  istället för att hårdkoda scenbyten i update-loopen.
- Undervattensgrottan är ett separat overlay-läge med egen scenkarta,
  simlogik, ljussättning, musik och bläckfiskhot. Nya rum bör läggas i
  `UNDERWATER_CAVE_SCENES` och gå via `G.setUnderwaterCaveScene(...)` så att
  exits, mörker, objekt och ljud fortsätter följa samma struktur.
- Save/load blockerar just nu aktiv vattenfallsgrotta, undervattensgrotta och
  cutscenes. Det är säkrare än att delvis återställa overlay-state. Om
  grottsparning införs behöver både scenstate, transient input, musik/duckning,
  väderresume och hotsekvenser få explicita restore-tester i
  `tools/verify-game.js`.
- Cutscene-motorn monteras i `07_cutscenes.js`; sceninnehåll och registrering
  ligger i `07_cutscene_scenes.js`. Använd `G.registerCutscene(...)` för
  återanvändbara scener och `G.playCutscene(spec)` för engångsscener. `mode:
  'box'` ritar i en ruta och `mode: 'fullscreen'` täcker hela canvasen.
  Registrerade scener med `debug !== false` visas automatiskt i `debug.html`
  via `G.cutsceneList({debug:true})`.
- Om du lägger till en ny `G`-metod som måste finnas efter script-splitten,
  uppdatera `requiredRuntimeMethods` i `tools/verify-game.js`.
- `debug.html` ska ladda samma relevanta runtime-script men inte `13_boot.js`.
  Nya synliga mekaniker bör få en knapp i `debug.html` och ett setup-flöde i
  `debug_page.js`, så de kan testas utan att spela fram situationen manuellt.
- Lemming-tillstånd finns i `05_lemming.js`. När ett nytt tillstånd eller en ny
  överstyrande skill läggs till, kontrollera `canApplySkill` i `07_game.js`,
  rendering i `08_render.js`, debugscener och save/load-konsekvenser.
- Vatten/lava-regler ligger huvudsakligen i `07_game.js` (`liquidAt`,
  `lemmingLiquidHazard`, `checkLiquid`). Badring använder `SWIM`, skyddar bara
  mot vatten och ska kunna gå vidare till både `CLIMB` och `ROPE`.
- Repflödet ligger i både `07_rope.js` och `05_lemming.js`: sikta/skjut/ankra i
  `07_rope.js`, själva klättringstillståndet i `Lemming.startRopeClimb` och
  `Lemming.ropeClimb`.
