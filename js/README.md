# LEMMEL script layout

Koden ar uppdelad i vanliga browser-script, inte ES-moduler. Det ar medvetet:
befintlig kod delar globala `const`, `class` och funktioner mellan filerna.

Behall laddningsordningen i `LEMMEL_fixed_v44.html`:

1. `00_util.js` - canvas, konstanter, hjalpfunktioner och felrapportering
2. `01_pixelfont.js` - pixeltext
3. `02_audio.js` - ljud och musik (`AU`)
4. `03_themes.js` - terrangteman (`THEMES`)
5. `04_terrain.js` - destruerbar terrang (`Terrain`)
6. `05_lemming.js` - lemminglogik (`Lemming`)
7. `06_levels.js` - bandata (`LEVELS`)
8. `07_game.js` - spelmotor och state (`G`)
9. `07_save_state.js` - spara/ladda-metoder for `G`
10. `07_manual_control.js` - direktstyrning och manual-skill helpers
11. `07_living_world.js` - levande varld-effekter som svamp, mumier och meteorer
12. `08_render.js` - varlds- och figur-rendering
13. `09_hud.js` - HUD och knappar
14. `10_screens.js` - titel, meny, briefing och overlays
15. `11_play_render.js` - huvudrendering for spelvyn
16. `12_input.js` - mus, touch och tangentbord
17. `13_boot.js` - initiering och huvudloop

Om en fil flyttas tidigare kan den sakna globala bindningar fran filerna ovanfor.

Efter storre andringar, kor:

```powershell
node tools/verify-game.js
```

Det laddar samma script-taggar som HTML-filen, kontrollerar runtime-moduler,
bygger alla banor och gor en render-/save-smoketest.
