# LEMMEL script layout

Koden ar uppdelad i vanliga browser-script, inte ES-moduler. Det ar medvetet:
befintlig kod delar globala `const`, `class` och funktioner mellan filerna.

Behall laddningsordningen i `LEMMEL.html`:

1. `00_util.js` - canvas, konstanter, hjalpfunktioner och felrapportering
2. `01_pixelfont.js` - pixeltext
3. `02_audio.js` - ljud och musik (`AU`)
4. `03_themes.js` - terrangteman (`THEMES`)
5. `04_terrain.js` - destruerbar terrang (`Terrain`)
6. `05_lemming.js` - lemminglogik (`Lemming`)
7. `06_levels.js` - bandata (`LEVELS`)
8. `07_game.js` - spelmotor och state (`G`)
9. `07_rope.js` - repkrok/rephantering for `G`
10. `07_save_state.js` - spara/ladda-metoder for `G`
11. `07_manual_control.js` - direktstyrning och manual-skill helpers
12. `07_waterfall_cave.js` - vattenfallsgrottans state, input, scenbyten och loot
13. `07_living_world.js` - levande varld-effekter som svamp, mumier och meteorer
14. `07_cutscenes.js` - cutscene-API, tidslinjer och overlayrendering
15. `07_cutscene_scenes.js` - registrerade cutscene-scener och pixelart-innehall
16. `08_render.js` - varlds- och figur-rendering
17. `09_hud.js` - HUD och knappar
18. `10_screens.js` - titel, meny, briefing och overlays
19. `11_waterfall_cave_render.js` - rendering for vattenfallsgrottans scener
20. `11_play_render.js` - huvudrendering for spelvyn
21. `12_input.js` - mus, touch och tangentbord
22. `13_boot.js` - initiering och huvudloop

Om en fil flyttas tidigare kan den sakna globala bindningar fran filerna ovanfor.

Efter storre andringar, kor:

```powershell
node tools/verify-game.js
```

Det laddar samma script-taggar som HTML-filen, kontrollerar runtime-moduler,
bygger alla banor och gor en render-/save-smoketest.

## Praktiska noter for fortsatt utveckling

- `07_game.js` ar fortfarande navet for globalt spelstate, men flera delar ar
  brutna till tillaggsfiler som monterar metoder pa `G`: rep i `07_rope.js`,
  save/load i `07_save_state.js`, direktstyrning i `07_manual_control.js`,
  vattenfallsgrottan i `07_waterfall_cave.js` och levande varld-effekter i
  `07_living_world.js`.
- Cutscene-motorn monteras i `07_cutscenes.js`; sceninnehall och registrering
  ligger i `07_cutscene_scenes.js`. Anvand `G.registerCutscene(...)` for
  ateranvandbara scener och `G.playCutscene(spec)` for engangsscener. `mode:
  'box'` ritar i en ruta och `mode: 'fullscreen'` tacker hela canvasen.
  Registrerade scener med `debug !== false` visas automatiskt i `debug.html`
  via `G.cutsceneList({debug:true})`.
- Om du lagger till en ny `G`-metod som maste finnas efter script-splitten,
  uppdatera `requiredRuntimeMethods` i `tools/verify-game.js`.
- `debug.html` ska ladda samma relevanta runtime-script men inte `13_boot.js`.
  Nya synliga mekaniker bor fa en knapp i `debug.html` och ett setup-flode i
  `debug_page.js`, sa de kan testas utan att spela fram situationen manuellt.
- Lemming-tillstand finns i `05_lemming.js`. Nar ett nytt tillstand eller en ny
  overstyrande skill laggs till, kontrollera `canApplySkill` i `07_game.js`,
  rendering i `08_render.js`, debugscener och save/load-konsekvenser.
- Vatten/lava-regler ligger huvudsakligen i `07_game.js` (`liquidAt`,
  `lemmingLiquidHazard`, `checkLiquid`). Badring anvander `SWIM`, skyddar bara
  mot vatten och ska kunna ga vidare till bade `CLIMB` och `ROPE`.
- Repflodet ligger i bade `07_rope.js` och `05_lemming.js`: sikta/skjut/ankra i
  `07_rope.js`, sjalva klattringstillstandet i `Lemming.startRopeClimb` och
  `Lemming.ropeClimb`.
