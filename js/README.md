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
9. `08_render.js` - varlds- och figur-rendering
10. `09_hud.js` - HUD och knappar
11. `10_screens.js` - titel, meny, briefing och overlays
12. `11_play_render.js` - huvudrendering for spelvyn
13. `12_input.js` - mus, touch och tangentbord
14. `13_boot.js` - initiering och huvudloop

Om en fil flyttas tidigare kan den sakna globala bindningar fran filerna ovanfor.

Efter storre andringar, kor:

```powershell
node tools/verify-game.js
```

Det laddar samma script-taggar som HTML-filen, bygger alla banor och gor en
render-smoketest.
