const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'LEMMEL_fixed_v44.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
const debugHtmlPath = path.join(root, 'debug.html');
const debugHtml = fs.existsSync(debugHtmlPath) ? fs.readFileSync(debugHtmlPath, 'utf8') : '';
const debugScripts = debugHtml
  ? [...debugHtml.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1])
  : [];

if (scripts.length === 0) throw new Error('No script tags found in LEMMEL_fixed_v44.html');

const runtimeScripts = ['js/07_game.js','js/07_rope.js','js/07_save_state.js','js/07_manual_control.js','js/07_living_world.js','js/07_cutscenes.js','js/07_cutscene_scenes.js'];
for (let i = 0; i < runtimeScripts.length; i++) {
  const idx = scripts.indexOf(runtimeScripts[i]);
  if (idx < 0) throw new Error(`Missing script tag: ${runtimeScripts[i]}`);
  if (i > 0 && idx <= scripts.indexOf(runtimeScripts[i - 1])) {
    throw new Error(`Script order is wrong around ${runtimeScripts[i]}`);
  }
}

if (debugHtml) {
  if (debugScripts.includes('js/13_boot.js')) throw new Error('debug.html must not load js/13_boot.js');
  if (!debugScripts.includes('js/debug_page.js')) throw new Error('debug.html does not load js/debug_page.js');
  for (const src of debugScripts) {
    if (!fs.existsSync(path.join(root, src))) throw new Error(`debug.html references missing script: ${src}`);
  }
  const debugGameIdx = debugScripts.indexOf('js/07_game.js');
  const debugRopeIdx = debugScripts.indexOf('js/07_rope.js');
  const debugLivingIdx = debugScripts.indexOf('js/07_living_world.js');
  const debugCutsceneIdx = debugScripts.indexOf('js/07_cutscenes.js');
  const debugCutsceneScenesIdx = debugScripts.indexOf('js/07_cutscene_scenes.js');
  const debugPageIdx = debugScripts.indexOf('js/debug_page.js');
  if (debugGameIdx < 0 || debugRopeIdx <= debugGameIdx || debugLivingIdx <= debugRopeIdx || debugCutsceneIdx <= debugLivingIdx || debugCutsceneScenesIdx <= debugCutsceneIdx || debugPageIdx <= debugCutsceneScenesIdx) {
    throw new Error('debug.html script order is wrong');
  }
  const requiredDebugActions = [
    'animFishRing','animFishRingRope','animClimb','animFloat','animBomb','animBlock','animBuild','animDownbuild',
    'animBash','animMine','animDig','animRope','animJet','animFlame','animBazooka'
  ];
  for (const action of requiredDebugActions) {
    if (!debugHtml.includes(`data-action="${action}"`)) {
      throw new Error(`debug.html is missing debug action: ${action}`);
    }
  }
  if (!debugHtml.includes('id="cutsceneButtons"')) {
    throw new Error('debug.html is missing the dynamic cutscene button container');
  }
  for (const id of ['cutsceneMode','cutsceneLight','cutsceneWeather','cutsceneMaterial']) {
    if (!debugHtml.includes(`id="${id}"`)) throw new Error(`debug.html is missing ${id}`);
  }
  for (const action of ['waterClimb','fishRing','dolphin']) {
    if (!debugHtml.includes(`data-cutscene-test="${action}"`)) {
      throw new Error(`debug.html is missing cutscene variant action: ${action}`);
    }
  }
  const debugPageCode = fs.readFileSync(path.join(root, 'js/debug_page.js'), 'utf8');
  for (const token of ['setupFishRingAnimation','setupFishRingRopeAnimation','setupRopeAnimation','ensureWaterLevelForFishRing','buildCutsceneButtons','playDebugCutscene','playDebugRescueCutscene','debugCutsceneWorldContext']) {
    if (!debugPageCode.includes(token)) throw new Error(`debug_page.js is missing ${token}`);
  }
}

function makeContext2d(){
  return {
    imageSmoothingEnabled:false,
    globalAlpha:1,
    globalCompositeOperation:'source-over',
    fillStyle:'#000',
    strokeStyle:'#000',
    lineWidth:1,
    font:'',
    textAlign:'left',
    textBaseline:'top',
    fillRect(){},
    clearRect(){},
    strokeRect(){},
    beginPath(){},
    arc(){},
    fill(){},
    stroke(){},
    moveTo(){},
    lineTo(){},
    closePath(){},
    save(){},
    restore(){},
    translate(){},
    scale(){},
    rotate(){},
    drawImage(){},
    fillText(){},
    strokeText(){},
    measureText(s){return {width:String(s).length*6}},
    createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4),width:w,height:h}},
    getImageData(x,y,w,h){return {data:new Uint8ClampedArray(w*h*4),width:w,height:h}},
    putImageData(){},
    createLinearGradient(){return {addColorStop(){}}},
    createRadialGradient(){return {addColorStop(){}}}
  };
}

function makeCanvas(){
  return {
    width:480,
    height:300,
    style:{},
    getContext(){return makeContext2d()},
    addEventListener(){},
    removeEventListener(){},
    getBoundingClientRect(){return {left:0,top:0,width:480,height:300}}
  };
}

const mainCanvas = makeCanvas();
const sandbox = {
  console,
  Uint8Array,
  Uint8ClampedArray,
  ArrayBuffer,
  Math,
  Date,
  JSON,
  Number,
  String,
  Boolean,
  setInterval(){return 0},
  clearInterval(){},
  setTimeout(){return 0},
  clearTimeout(){},
  requestAnimationFrame(){return 0},
  cancelAnimationFrame(){},
  performance:{now(){return 0}},
  Image:function(){},
  AudioContext:function(){},
  webkitAudioContext:function(){},
  window:{
    location:{search:''},
    localStorage:{getItem(){return null},setItem(){},removeItem(){}},
    addEventListener(){},
    removeEventListener(){},
    innerWidth:480,
    innerHeight:300
  },
  document:{
    getElementById(){return mainCanvas},
    createElement(){return makeCanvas()},
    addEventListener(){},
    removeEventListener(){},
    fullscreenElement:null,
    documentElement:{style:{},requestFullscreen(){}}
  }
};

sandbox.globalThis = sandbox;
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);

for (const src of scripts) {
  const code = fs.readFileSync(path.join(root, src), 'utf8');
  vm.runInContext(code, sandbox, {filename:src, timeout:10000});
}

vm.runInContext(
  'globalThis.__verify={G,LEVELS,THEMES,AU,SKILLS,Lemming,drawPlayWorld,drawMenu,drawCutsceneOverlay,WCTX,menuChapters,DOLPHIN_RESCUE_CHANCE,FISH_RING_CHANCE,TORCH_WARM_CHANCE,TICK};',
  sandbox,
  {timeout:10000}
);

const {G, LEVELS, THEMES, AU, SKILLS, Lemming, drawPlayWorld, drawMenu, drawCutsceneOverlay, WCTX, menuChapters, DOLPHIN_RESCUE_CHANCE, FISH_RING_CHANCE, TORCH_WARM_CHANCE, TICK} = sandbox.__verify;

if (!Array.isArray(LEVELS) || LEVELS.length === 0) throw new Error('LEVELS is empty');
if (!Array.isArray(SKILLS) || SKILLS.length === 0) throw new Error('SKILLS is empty');
if (Math.abs(DOLPHIN_RESCUE_CHANCE - 0.15) > 0.0001) throw new Error('Dolphin rescue chance should be 15%');
if (Math.abs(FISH_RING_CHANCE - 0.20) > 0.0001) throw new Error('Fish swim ring chance should be 20%');
if (Math.abs(TORCH_WARM_CHANCE - 0.09) > 0.0001) throw new Error('Torch warming chance should be 9%');
const maxGameplayCutsceneTicks = Math.max(1, Math.floor(3000 / TICK));
const minGameplayCutsceneTicks = Math.max(1, Math.floor(2400 / TICK));

const requiredRuntimeMethods = [
  'makeSaveState','restoreSaveState','promptSaveGame','promptLoadGame',
  'setMusicVolume','setSfxVolume',
  'clearRopeAim','handleRopeClick','fireRopeHook','updateHooksAndRopes','findClimbableRope',
  'ropeAnchorIntact','detachRope','pruneDetachedRopes',
  'restoreGoalBase',
  'registerCutscene','cutsceneById','cutsceneList','playCutscene','stopCutscene','clearCutscene',
  'advanceCutscene','updateCutscene','cutsceneActive','cutsceneRect','currentCutsceneShot',
  'handleCutsceneInput','handleCutsceneKey','makeCutscenePreviewSpec',
  'applyRescueCutsceneText',
  'makeFishRingCutsceneSpec','playFishRingCutscene',
  'makeDolphinRescueCutsceneSpec','playDolphinRescueCutscene',
  'makeWaterClimbCutsceneSpec','playWaterClimbCutscene','toggleCutscenes',
  'hitDecorTargetAt',
  'findNearbyRingFish','makeRescueRingFish','tryFishSwimRing',
  'rescueToastText',
  'rebindAmbientFishZones',
  'trollScale','makeTroll','findTrollTransformTarget','transformLemmingToTrollAt','pickSupplyPlaneForTroll','hitSupplyPlaneAt',
  'damageSupplyPlane','finishSupplyPlaneCrash','updateWreckedSupplyPlane','tryTrollThrowAtMonkey','throwTrollRock',
  'clearTrollWallHeadroom',
  'isManualActive','startManualControl','stopManualControl','manualAimFor','releaseManualForSkill',
  'updateDolphins','updateMeteors','updateMushroomEatingEffects','canTrollEatMushroom','growTrollFromMushroom','updateMummyScareEffects',
  'canWarmAtTorch','startTorchWarm','finishTorchWarm','updateTorchWarmEffects',
  'updateRandomJumpEvents','updateLemmingChatter','updateWaterfallHeadSplashes'
];
for (const name of requiredRuntimeMethods) {
  if (typeof G[name] !== 'function') throw new Error(`Missing G method after script split: ${name}`);
}
for (const name of ['setMusicVolume','setSfxVolume','applyVolumes']) {
  if (typeof AU[name] !== 'function') throw new Error(`Missing AU volume method: ${name}`);
}
for (const name of ['sLemShiver','sLemWarmSigh']) {
  if (typeof AU[name] !== 'function') throw new Error(`Missing AU lemming warmth sfx method: ${name}`);
}
if (!AU.PAT || !AU.PAT.menu || !Array.isArray(AU.PAT.menu.mel) || !Array.isArray(AU.PAT.menu.bass)) {
  throw new Error('Missing menu music pattern');
}
G.setMusicVolume(0.42);
G.setSfxVolume(0.37);
if (Math.abs(AU.musicVol - 0.42) > 0.001 || Math.abs(AU.sfxVol - 0.37) > 0.001) {
  throw new Error('Audio volume setters failed');
}
if (typeof drawCutsceneOverlay !== 'function') throw new Error('Missing drawCutsceneOverlay');
{
  const registeredCutscenes = G.cutsceneList({debug:true});
  const registeredIds = new Set(registeredCutscenes.map(s => s.id));
  for (const id of ['cutscene-preview-box','cutscene-preview-fullscreen','fish-ring-closeup','dolphin-rescue-closeup','water-climb-closeup']) {
    if (!registeredIds.has(id)) throw new Error(`Cutscene registry is missing debug scene: ${id}`);
  }
  const fishMeta = registeredCutscenes.find(s => s.id === 'fish-ring-closeup');
  if (!fishMeta || fishMeta.group !== 'Raddningar' || !fishMeta.label) {
    throw new Error('Fish ring cutscene metadata is incomplete');
  }
  const fallbackFishSpec = G.makeFishRingCutsceneSpec('fullscreen');
  fallbackFishSpec.event = {rescueOnly:true, levelName:'VERIFY', themeKey:'dirt', weatherKind:'rain', lemX:20, lemY:128};
  G.applyRescueCutsceneText(fallbackFishSpec, 'fish');
  if (!fallbackFishSpec.shots[0].text.join(' ').includes('FISK') || fallbackFishSpec.shots[0].title === 'FISKEN HJALPER TILL') {
    throw new Error('Fallback fish cutscene text was not specialized');
  }
  if (typeof G.rescueToastText('dolphin', {x:80, y:120}) !== 'string' || !G.rescueToastText('climb', {x:80, y:120})) {
    throw new Error('Rescue toast text helper is incomplete');
  }
}
{
  const prevState = G.state;
  const prevPaused = G.paused;
  const prevCutscene = G.cutscene;
  const prevDoor = G.doorT;
  const prevManual = G.manual;
  const prevRopeAim = G.ropeAim;
  const prevCutscenesOn = G.cutscenesOn;
  G.state = 'PLAY';
  G.paused = false;
  G.doorT = 123;
  G.cutscene = null;
  G.cutscenesOn = true;
  G.manual = {keys:{left:true,right:true,down:true,run:true,aim:true}};
  const scene = G.playCutscene({
    id:'verify-cutscene-box',
    mode:'box',
    pauseGame:true,
    shots:[
      {duration:3,title:'VERIFY',text:'BOX'},
      {duration:3,title:'VERIFY',text:'NEXT'}
    ]
  });
  if (!scene || !G.cutsceneActive() || G.currentCutsceneShot().text[0] !== 'BOX') {
    throw new Error('Box cutscene did not start');
  }
  const box = G.cutsceneRect('box');
  if (box.full || box.w >= 480 || box.h >= 300) throw new Error('Box cutscene rect is not boxed');
  G.tick();
  if (G.doorT !== 123) throw new Error('Cutscene did not stop gameplay tick');
  drawCutsceneOverlay(WCTX, 1);
  G.handleCutsceneInput({x:240,y:120}, 'click');
  if (!G.cutsceneActive() || G.cutscene.shotIdx !== 1) throw new Error('Cutscene click did not advance to next shot');
  G.handleCutsceneKey('Escape');
  if (G.cutsceneActive()) throw new Error('Cutscene escape did not skip');
  G.playCutscene(G.makeCutscenePreviewSpec('fullscreen'));
  const full = G.cutsceneRect('fullscreen');
  if (!full.full || full.x !== 0 || full.y !== 0 || full.w !== 480 || full.h !== 300) {
    throw new Error('Fullscreen cutscene rect is wrong');
  }
  drawCutsceneOverlay(WCTX, 2);
  G.clearCutscene('verify');
  G.cutscenesOn = false;
  const skippedScene = G.playCutscene({id:'verify-disabled-cutscene',mode:'box',shots:[{duration:3,text:'SKIP'}]});
  if (skippedScene || G.cutsceneActive()) throw new Error('Disabled cutscenes preference did not skip playback');
  const skippedRegisteredScene = G.playCutscene('fish-ring-closeup');
  if (skippedRegisteredScene || G.cutsceneActive()) throw new Error('Registered gameplay cutscene did not respect disabled preference');
  const forcedScene = G.playCutscene({id:'verify-forced-cutscene',mode:'box',respectPrefs:false,shots:[{duration:3,text:'FORCE'}]});
  if (!forcedScene || !G.cutsceneActive()) throw new Error('Forced cutscene did not ignore disabled preference');
  G.clearCutscene('verify-forced');
  G.cutscenesOn = true;
  const fishScene = G.playCutscene(G.makeFishRingCutsceneSpec('fullscreen'));
  if (!fishScene || !G.cutsceneActive() || fishScene.id !== 'fish-ring-closeup') {
    throw new Error('Fish ring cutscene did not start');
  }
  if (G.currentCutsceneShot().duration < minGameplayCutsceneTicks || G.currentCutsceneShot().duration > maxGameplayCutsceneTicks) {
    throw new Error('Fish ring cutscene should be at most 3 seconds long');
  }
  drawCutsceneOverlay(WCTX, 3);
  G.clearCutscene('verify-fish-ring');
  const dolphinScene = G.playCutscene(G.makeDolphinRescueCutsceneSpec('fullscreen'));
  if (!dolphinScene || !G.cutsceneActive() || dolphinScene.id !== 'dolphin-rescue-closeup') {
    throw new Error('Dolphin rescue cutscene did not start');
  }
  if (G.currentCutsceneShot().duration < minGameplayCutsceneTicks || G.currentCutsceneShot().duration > maxGameplayCutsceneTicks) {
    throw new Error('Dolphin rescue cutscene should be at most 3 seconds long');
  }
  drawCutsceneOverlay(WCTX, 4);
  G.clearCutscene('verify-dolphin-rescue');
  const waterClimbScene = G.playCutscene(G.makeWaterClimbCutsceneSpec('fullscreen'));
  if (!waterClimbScene || !G.cutsceneActive() || waterClimbScene.id !== 'water-climb-closeup') {
    throw new Error('Water climb cutscene did not start');
  }
  if (G.currentCutsceneShot().duration < minGameplayCutsceneTicks || G.currentCutsceneShot().duration > maxGameplayCutsceneTicks) {
    throw new Error('Water climb cutscene should be at most 3 seconds long');
  }
  drawCutsceneOverlay(WCTX, 5);
  G.clearCutscene('verify-water-climb');
  G.state = prevState;
  G.paused = prevPaused;
  G.cutscene = prevCutscene;
  G.doorT = prevDoor;
  G.manual = prevManual;
  G.ropeAim = prevRopeAim;
  G.cutscenesOn = prevCutscenesOn;
}
{
  const prevLevel = G.level;
  const prevTerrain = G.T;
  const prevLems = G.lems;
  const prevFish = G.ambientFish;
  const prevRopes = G.ropes;
  const prevParts = G.parts;
  const prevToasts = G.toasts;
  const prevRand = G.rand;
  const prevCache = G.liquidCache;
  const prevCutscene = G.cutscene;
  const prevCutscenesOn = G.cutscenesOn;
  const prevWeatherKind = G.weatherKind;
  const water = {x:80, y:120, w:90, lava:false};
  G.level = {W:240, theme:'dirt', night:true, materialZones:[{x:120,w:120,theme:'desert'}], hatch:{x:20,y:80}, exit:{x:220,y:180}, water:[water]};
  G.weatherKind = 'snow';
  G.liquidCache = null;
  G.T = {
    W:240,
    H:240,
    solid(x,y){return y >= 190 || (x >= 150 && y >= 90 && y <= 190)},
    solidBox(){return false}
  };
  G.ambientFish = [{zone:water, x:100, y:128, baseY:128, dir:1, p:0, s:0, spd:0, size:1, col:'#ffd060'}];
  G.parts = [];
  G.toasts = [];
  G.rand = () => 0.0;
  G.cutscene = null;
  G.cutscenesOn = true;
  const lem = new Lemming(100, 128);
  lem.state = 'FALL';
  lem.fall = 12;
  G.lems = [lem];
  const liquid = G.lemmingLiquidHazard(lem);
  if (!liquid || !G.tryFishSwimRing(lem, liquid) || lem.state !== 'SWIM' || !lem.swimRing) {
    throw new Error('Nearby fish did not grant a swim ring when chance succeeded');
  }
  if (!G.cutsceneActive() || !G.cutscene || G.cutscene.id !== 'fish-ring-closeup') {
    throw new Error('Fish ring rescue did not start the fish ring cutscene');
  }
  G.clearCutscene('verify-fish-ring-event');
  G.checkLiquid(lem);
  if (lem.state === 'DROWN' || lem.dead) throw new Error('Swim ring did not protect lemming from water');
  if (!G.canApplySkill(lem, 'rope')) throw new Error('Swim ring lemming could not use rope hook');
  const rope = {id: 9101, x1: lem.x, y1: lem.y, x2: lem.x + 42, y2: lem.y - 44, hookX: lem.x + 42, hookY: lem.y - 44, active: true, exitDir: 1, len: 61};
  G.ropes = [rope];
  lem.ropeCooldown = 0;
  if (!lem.startRopeClimb(rope, 0) || lem.state !== 'ROPE' || lem.swimRing) {
    throw new Error('Swim ring lemming did not switch cleanly into rope climbing');
  }
  const secondSwimmer = new Lemming(rope.x1, rope.y1);
  secondSwimmer.state = 'SWIM';
  secondSwimmer.swimRing = true;
  secondSwimmer.fishRingTried = true;
  secondSwimmer.ropeCooldown = 0;
  G.lems = [lem, secondSwimmer];
  if (!G.findClimbableRope(secondSwimmer)) {
    throw new Error('Second swim ring lemming could not find an existing rope from water');
  }
  secondSwimmer.swim(G.T);
  if (secondSwimmer.state !== 'ROPE' || secondSwimmer.ropeId !== rope.id || secondSwimmer.swimRing) {
    throw new Error('Second swim ring lemming did not grab the existing rope from water');
  }
  G.lems = [lem];
  lem.state = 'SWIM';
  lem.swimRing = true;
  lem.climber = true;
  lem.x = 149;
  lem.y = 125;
  lem.dir = 1;
  lem.swim(G.T);
  if (lem.state !== 'CLIMB' || lem.swimRing) {
    throw new Error('Swim ring lemming did not transition into climbing at a wall');
  }
  if (!G.cutsceneActive() || !G.cutscene || G.cutscene.id !== 'water-climb-closeup') {
    throw new Error('Swim ring climbing transition did not start the water climb cutscene');
  }
  if (!G.cutscene.spec || !G.cutscene.spec.event || G.cutscene.spec.event.themeKey !== 'desert') {
    throw new Error('Water climb cutscene did not inherit material zone theme');
  }
  if (G.cutscene.spec.event.night !== true || G.cutscene.spec.event.weatherKind !== 'snow') {
    throw new Error('Water climb cutscene did not inherit night/weather context');
  }
  G.clearCutscene('verify-water-climb-event');
  G.ambientFish = [];
  G.cutscene = null;
  const hiddenWaterLem = new Lemming(20, water.y + 8);
  hiddenWaterLem.state = 'FALL';
  const hiddenLiquid = G.lemmingLiquidHazard(hiddenWaterLem);
  if (!hiddenLiquid || G.findNearbyRingFish(hiddenWaterLem, hiddenLiquid)) {
    throw new Error('Hidden-water fish rescue fixture is invalid');
  }
  if (!G.tryFishSwimRing(hiddenWaterLem, hiddenLiquid) || hiddenWaterLem.state !== 'SWIM' || !hiddenWaterLem.swimRing) {
    throw new Error('Fish rescue did not work away from an ambient fish');
  }
  if (!G.cutsceneActive() || !G.cutscene || G.cutscene.id !== 'fish-ring-closeup') {
    throw new Error('Fallback fish rescue did not start the fish ring cutscene');
  }
  G.clearCutscene('verify-fallback-fish-event');
  G.level = prevLevel;
  G.T = prevTerrain;
  G.lems = prevLems;
  G.ambientFish = prevFish;
  G.ropes = prevRopes;
  G.parts = prevParts;
  G.toasts = prevToasts;
  G.rand = prevRand;
  G.liquidCache = prevCache;
  G.cutscene = prevCutscene;
  G.cutscenesOn = prevCutscenesOn;
  G.weatherKind = prevWeatherKind;
}
{
  const prevLevel = G.level;
  const prevTerrain = G.T;
  const prevLems = G.lems;
  const prevDolphins = G.dolphins;
  const prevParts = G.parts;
  const prevToasts = G.toasts;
  const prevRand = G.rand;
  const prevCache = G.liquidCache;
  const prevCutscene = G.cutscene;
  const prevCutscenesOn = G.cutscenesOn;
  const water = {x:72, y:130, w:100, lava:false};
  G.level = {W:260, hatch:{x:20,y:80}, exit:{x:235,y:180}, water:[water]};
  G.liquidCache = null;
  G.T = {
    W:260,
    H:240,
    solid(x,y){return ((x < 70 || x > 174) && y >= 124) || y >= 198},
    solidBox(){return false}
  };
  G.lems = [];
  G.dolphins = [];
  G.parts = [];
  G.toasts = [];
  G.rand = () => 0.0;
  G.cutscene = null;
  G.cutscenesOn = true;
  const lem = new Lemming(112, 138);
  lem.state = 'FALL';
  G.lems = [lem];
  if (!G.tryDolphinRescue(lem, water) || lem.state !== 'WALK' || G.dolphins.length !== 1) {
    throw new Error('Dolphin rescue did not move the lemming to safety');
  }
  if (!G.cutsceneActive() || !G.cutscene || G.cutscene.id !== 'dolphin-rescue-closeup') {
    throw new Error('Dolphin rescue did not start the dolphin cutscene');
  }
  G.clearCutscene('verify-dolphin-event');
  G.level = prevLevel;
  G.T = prevTerrain;
  G.lems = prevLems;
  G.dolphins = prevDolphins;
  G.parts = prevParts;
  G.toasts = prevToasts;
  G.rand = prevRand;
  G.liquidCache = prevCache;
  G.cutscene = prevCutscene;
  G.cutscenesOn = prevCutscenesOn;
}
{
  const prevLevel = G.level;
  const prevLems = G.lems;
  const prevLamp = G.lamp;
  const exitLem = {id:9001,x:96,y:200,scale:2,state:'WALK',dead:false,alive(){return !this.dead}};
  G.level = {exit:{x:100,y:200}};
  G.lems = [exitLem];
  G.lamp = null;
  G.checkExit(exitLem);
  if (exitLem.state !== 'EXITING' || exitLem.x !== 100) {
    throw new Error('Scaled lemming exit is not centered on goal');
  }
  G.level = prevLevel;
  G.lems = prevLems;
  G.lamp = prevLamp;
}
{
  const prevLevel = G.level;
  const prevTerrain = G.T;
  const prevLems = G.lems;
  const prevTrolls = G.trolls;
  const prevParts = G.parts;
  const prevToasts = G.toasts;
  const prevManual = G.manual;
  const prevSel = G.selSkill;
  const prevUsed = G.trollUsed;
  const prevTrees = G.trees;
  const prevRocks = G.trollRocks;
  const prevMonkeys = G.monkeys;
  const prevPlanes = G.planes;
  const prevMegaBoom = G.megaBoom;
  const prevMegaArmed = G.megaArmed;
  const prevTrollEvents = G.trollEvents;
  const prevTrollMax = G.trollMax;
  G.level = {W:300, hatch:{x:20,y:180}, water:[]};
  G.T = {W:300, H:240, solid:(x,y)=>y>=200, solidBox:()=>false};
  const lem = {id:42, x:100, y:199, dir:-1, scale:1, dead:false, state:'WALK', alive(){return !this.dead}};
  G.lems = [lem];
  G.trolls = [];
  G.parts = [];
  G.toasts = [];
  G.manual = {active:false, lemId:null};
  G.selSkill = 'troll';
  G.trollUsed = false;
  if (!G.transformLemmingToTrollAt(100, 193) || !lem.dead || G.trolls.length !== 1 || G.trolls[0].dir !== -1 || !G.trollUsed || G.selSkill !== null) {
    throw new Error('Troll transform ability did not replace a lemming with a troll');
  }
  const darkLem = {id:43, x:120, y:199, dir:1, scale:1, dead:false, state:'WALK', alive(){return !this.dead}};
  G.level = {W:300, hatch:{x:20,y:180}, water:[], night:true};
  G.T = {W:300, H:240, solid:(x,y)=>y>=200, solidBox:()=>false, clearDisc(){}, clearRect(){}};
  G.lems = [darkLem];
  G.trolls = [];
  G.trollRocks = [];
  G.trees = [];
  G.monkeys = [];
  G.planes = [];
  G.megaBoom = null;
  G.megaArmed = null;
  G.trollEvents = 0;
  G.trollMax = 0;
  G.selSkill = 'troll';
  G.trollUsed = false;
  if (!G.transformLemmingToTrollAt(120, 193) || !darkLem.dead || G.trolls.length !== 1 || !G.trolls[0].playerMade) {
    throw new Error('Troll transform did not create a player-made troll on a dark level');
  }
  G.updateTrollEvents();
  if (G.trolls.length !== 1 || !G.trolls[0].playerMade) {
    throw new Error('Player-made troll was removed by dark-level troll cleanup');
  }
  G.level = prevLevel;
  G.T = prevTerrain;
  G.lems = prevLems;
  G.trolls = prevTrolls;
  G.trollRocks = prevRocks;
  G.trees = prevTrees;
  G.monkeys = prevMonkeys;
  G.planes = prevPlanes;
  G.parts = prevParts;
  G.toasts = prevToasts;
  G.manual = prevManual;
  G.selSkill = prevSel;
  G.trollUsed = prevUsed;
  G.megaBoom = prevMegaBoom;
  G.megaArmed = prevMegaArmed;
  G.trollEvents = prevTrollEvents;
  G.trollMax = prevTrollMax;
}
{
  G.startLevel(0);
  G.T.clearRect(0, 0, G.T.W, G.T.H);
  const wallTroll = {x:100, y:200, dir:1, scale:1};
  G.T.setRect(102, 165, 34, 36, 1);
  if (!G.T.solid(110, 168)) throw new Error('Troll headroom fixture was not solid before clearing');
  G.parts = [];
  G.clearTrollWallMouth(wallTroll);
  if (G.T.solid(110, 168)) {
    throw new Error('Troll wall clearing left a low ceiling lip above the tunnel');
  }
  if (G.T.solid(110, 176)) {
    throw new Error('Troll wall clearing did not open the main tunnel');
  }
}
{
  const prevDecor = G.decor;
  const prevTrolls = G.trolls;
  const prevParts = G.parts;
  const prevFlashes = G.flashes;
  const prevToasts = G.toasts;
  const mushroom = {t:'mush', x:100, y:180, v:0.4};
  const troll = {x:104, y:180, life:100, scale:1, dir:1, chewT:0};
  G.decor = [mushroom];
  G.trolls = [troll];
  G.parts = [];
  G.flashes = [];
  G.toasts = [];
  G.updateMushroomEatingEffects();
  if (troll.scale !== 2 || !mushroom.eaten || !mushroom.remove) {
    throw new Error('Troll did not eat mushroom and grow to scale 2');
  }
  G.decor = prevDecor;
  G.trolls = prevTrolls;
  G.parts = prevParts;
  G.flashes = prevFlashes;
  G.toasts = prevToasts;
}

{
  const prevRocks = G.trollRocks;
  const prevRand = G.rand;
  G.trollRocks = [];
  G.rand = () => 0.5;
  const troll = { x: 100, y: 190, scale: 2, dir: 1 };
  const monkey = { x: 180, y: 110, vx: 0 };
  if (!G.throwTrollRock(troll, monkey) || !G.trollRocks[0] || G.trollRocks[0].scale !== 2) {
    throw new Error('Giant troll rock did not inherit troll scale');
  }
  G.trollRocks = prevRocks;
  G.rand = prevRand;
}
{
  const prevLevel = G.level;
  const prevTerrain = G.T;
  const prevPlanes = G.planes;
  const prevPackages = G.packages;
  const prevRocks = G.trollRocks;
  const prevParts = G.parts;
  const prevFlashes = G.flashes;
  const prevToasts = G.toasts;
  const prevRand = G.rand;
  G.level = {W:320, hatch:{x:20,y:180}, water:[]};
  G.T = {W:320, H:240, solid:(x,y)=>y>=210, solidBox:(x,y,r)=>y+(r||0)>=210};
  G.planes = [{x:150,y:42,vx:1.4,targetX:190,kind:'skill',skill:'baz',dropped:false}];
  G.packages = [];
  G.trollRocks = [];
  G.parts = [];
  G.flashes = [];
  G.toasts = [];
  G.rand = () => 0.35;
  const troll = {x:100,y:200,scale:2,dir:1,rockT:1,chewT:0,rageT:0};
  if (!G.pickSupplyPlaneForTroll(troll)) throw new Error('Giant troll did not target supply plane');
  if (!G.tryTrollThrowAtMonkey(troll) || !G.trollRocks[0] || G.trollRocks[0].scale !== 2) {
    throw new Error('Giant troll did not throw a scaled rock at supply plane');
  }
  const plane = G.planes[0];
  if (!G.damageSupplyPlane(plane, plane.x, plane.y) || !plane.crashing) {
    throw new Error('Supply plane did not enter crashing state');
  }
  if (!G.finishSupplyPlaneCrash(plane) || !plane.wrecked || G.packages.length !== 3) {
    throw new Error('Supply plane crash did not create a wreck with three packages');
  }
  const lootSkills = new Set(G.packages.map(p => p.skill));
  if (lootSkills.size !== 3) throw new Error('Supply plane crash packages were not three different skills');
  G.parts = [];
  plane.wreckT = 0;
  for (let i = 0; i < 60; i++) G.updateWreckedSupplyPlane(plane);
  if (plane.wreckT !== 60 || G.parts.filter(p => p && p.smoke).length < 2) {
    throw new Error('Wrecked supply plane did not emit slow smoke/fire particles');
  }
  G.level = prevLevel;
  G.T = prevTerrain;
  G.planes = prevPlanes;
  G.packages = prevPackages;
  G.trollRocks = prevRocks;
  G.parts = prevParts;
  G.flashes = prevFlashes;
  G.toasts = prevToasts;
  G.rand = prevRand;
}
G.state = 'MENU';
drawMenu(WCTX, 1);
if (!G.menuSettings || !G.menuSettings.musicVol || !G.menuSettings.sfxVol || !G.menuSettings.cutscenes) {
  throw new Error('Menu volume controls were not created');
}

const levelNames = new Set();
function rootDecorHasSupport(T, x, y) {
  x = Math.round(x); y = Math.round(y);
  for (let yy = y - 2; yy <= y + 2; yy++) {
    if (yy < 0 || yy >= T.H) continue;
    for (let xx = x - 4; xx <= x + 4; xx++) {
      if (xx >= 0 && xx < T.W && T.solid(xx, yy)) return true;
    }
  }
  return false;
}

for (let idx = 0; idx < LEVELS.length; idx++) {
  const L = LEVELS[idx];
  if (levelNames.has(L.name)) throw new Error(`Duplicate level name: ${L.name}`);
  levelNames.add(L.name);
  if (!THEMES[L.theme]) throw new Error(`${L.name}: missing theme ${L.theme}`);

  G.startLevel(idx);
  const musicKind = G.musicKindForLevel(idx);
  if (!AU.PAT[musicKind]) throw new Error(`${L.name}: missing music pattern ${musicKind}`);
  if (!G.T || G.T.W !== L.W) throw new Error(`${L.name}: terrain was not built`);
  const decorTypes = new Set((G.decor || []).map(d => d && d.t).filter(Boolean));
  if (L.name === 'UNDER RÖTTERNA' && !decorTypes.has('root')) {
    throw new Error(`${L.name}: expected visible roots in decor`);
  }
  if (L.name === 'BAZOOKA-SKOLAN' && !decorTypes.has('target')) {
    throw new Error(`${L.name}: expected practice targets in decor`);
  }
  if (L.name === 'BAZOOKA-SKOLAN' && L.theme !== 'crystal') {
    throw new Error(`${L.name}: expected regular crystal theme`);
  }
  if (L.name === 'KRISTALLSCHAKTET' && L.theme !== 'glass') {
    throw new Error(`${L.name}: expected glass crystal shaft theme`);
  }
  if (L.name === 'KRISTALLSCHAKTET' && decorTypes.has('stal')) {
    throw new Error(`${L.name}: expected crystal clusters instead of cave stalagmites`);
  }
  if (L.name === 'JETPACK-KLIPPAN' && L.theme !== 'rock') {
    throw new Error(`${L.name}: expected rock theme`);
  }
  if (L.name === 'MÖRK SKOG') {
    const roots = (G.decor || []).filter(d => d && d.t === 'root');
    if (roots.length < 3) throw new Error(`${L.name}: expected forest floor root details`);
  }
  if (L.name === 'SKOGSRAVINEN') {
    const ravine = (L.water || []).find(z => z && !z.lava && z.w >= 160);
    if (!ravine) throw new Error(`${L.name}: expected a wider ravine water zone`);
    const mid = Math.round(ravine.x + ravine.w / 2);
    if (G.T.solid(mid, 170) || G.T.solid(mid, 206) || G.T.solid(mid, 226)) {
      throw new Error(`${L.name}: ravine center should be open`);
    }
  }
  for (const root of (G.decor || []).filter(d => d && d.t === 'root')) {
    if (!rootDecorHasSupport(G.T, root.x, root.y)) {
      throw new Error(`${L.name}: root decor at ${root.x},${root.y} is not attached to terrain`);
    }
  }
  for (const torch of (G.decor || []).filter(d => d && d.t === 'torch')) {
    for (const z of L.water || []) {
      if (torch.x >= z.x - 4 && torch.x <= z.x + z.w + 4) {
        throw new Error(`${L.name}: torch at ${torch.x},${torch.y} is over ${z.lava ? 'lava' : 'water'}`);
      }
    }
  }
  for (const d of (G.decor || []).filter(d => d && (d.t === 'mush' || d.t === 'rock'))) {
    const liquid = G.liquidAt(d.x, Math.round((d.y || 0) + 6), 2);
    if (liquid) {
      throw new Error(`${L.name}: ${d.t} at ${d.x},${d.y} spawned in ${liquid.lava ? 'lava' : 'water'}`);
    }
  }

  for (const road of (G.decor || []).filter(d => d && d.t === 'road')) {
    const rx0 = Math.round(road.x - 44);
    const rx1 = Math.round(road.x + (road.w || 220) + 44);
    for (const z of L.water || []) {
      const wx0 = Math.round(z.x);
      const wx1 = Math.round(z.x + z.w);
      const ox0 = Math.max(rx0, wx0);
      const ox1 = Math.min(rx1, wx1);
      if (ox0 >= ox1) continue;
      let unsupported = false;
      for (let x = ox0; x < ox1; x += 8) {
        if (!G.T.solid(x, road.y) && !G.T.solid(x, road.y + 10)) {
          unsupported = true;
          break;
        }
      }
      if (unsupported) {
        throw new Error(`${L.name}: road decor overlaps open liquid at x=${ox0}-${ox1}`);
      }
    }
  }

  const sx = Math.round(L.hatch.x);
  const sy = Math.round(L.hatch.y + 6);
  if (G.T.solid(sx, sy)) throw new Error(`${L.name}: hatch spawn is blocked`);

  let hatchGround = false;
  for (let y = sy; y < Math.min(G.T.H - 2, sy + 110); y++) {
    if (!G.T.solid(sx, y) && G.T.solid(sx, y + 1)) {
      hatchGround = true;
      break;
    }
  }
  if (!hatchGround) throw new Error(`${L.name}: no ground below hatch`);

  const ex = Math.round(L.exit.x);
  const ey = Math.round(L.exit.y + 1);
  if (ex < 0 || ex >= L.W || L.exit.y < 0 || L.exit.y > 240) {
    throw new Error(`${L.name}: exit outside bounds`);
  }
  if (!G.T.solid(ex, ey)) throw new Error(`${L.name}: exit is not grounded`);

  drawPlayWorld(WCTX, L, 0, 20);
  drawPlayWorld(WCTX, L, Math.max(0, L.W / 2 - 240), 50);
  drawPlayWorld(WCTX, L, Math.max(0, L.W - 480), 80);
  for (let t = 0; t < 12; t++) G.tick();
}

const chapters = menuChapters();
if (chapters.length !== 3) throw new Error(`Expected 3 menu chapters, got ${chapters.length}`);
if (Math.max(...chapters.map(ch => ch.to - ch.from)) > 10) {
  throw new Error('Too many rows in a menu chapter');
}

G.startLevel(0);
const savedState = G.makeSaveState('VERIFY');
if (!savedState || savedState.levelIdx !== 0 || !savedState.terrain || !savedState.fields || !savedState.arrays) {
  throw new Error('Save-state smoke test failed');
}
if (!G.restoreSaveState(savedState) || G.state !== 'PLAY' || !G.T || G.levelIdx !== 0) {
  throw new Error('Restore-state smoke test failed');
}

const fishSaveLevelIdx = LEVELS.findIndex(L => Array.isArray(L.water) && L.water.some(z => z && !z.lava));
if (fishSaveLevelIdx < 0) throw new Error('Missing water level for fish save-state test');
G.startLevel(fishSaveLevelIdx);
const fishSaveState = G.makeSaveState('VERIFY FISH ZONES');
if (!fishSaveState || !fishSaveState.arrays || !fishSaveState.arrays.ambientFish.length) {
  throw new Error('Fish save-state fixture was not created');
}
for (const fish of fishSaveState.arrays.ambientFish) delete fish.zoneIdx;
if (!G.restoreSaveState(fishSaveState)) throw new Error('Fish save-state restore failed');
const reboundFish = G.ambientFish.find(f => f && G.level.water.includes(f.zone));
if (!reboundFish) throw new Error('Ambient fish zone was not rebound after restore');
const reboundLiquid = G.liquidAt(reboundFish.x, reboundFish.y, 0);
const probeFishLem = new Lemming(reboundFish.x, reboundFish.y);
if (!reboundLiquid || G.findNearbyRingFish(probeFishLem, reboundLiquid) !== reboundFish) {
  throw new Error('Ambient fish could not be found after save-state restore');
}

G.startLevel(0);
{
  const e = G.level.exit;
  G.explode(e.x, e.y + 4, 22, false, 'verify');
  if (!G.T.solid(e.x, e.y + 1)) {
    throw new Error('Explosion under goal removed the protected exit base');
  }
  const goalLem = new Lemming(e.x, e.y);
  goalLem.state = 'WALK';
  G.lems = [goalLem];
  G.checkExit(goalLem);
  if (goalLem.state !== 'EXITING') {
    throw new Error('Lemming could not enter goal after blast under exit');
  }
}

G.startLevel(0);
G.T.setRect(118, 118, 5, 5, 1);
const rope = {id: 9001, x1: 80, y1: 180, x2: 130, y2: 120, hookX: 120, hookY: 120, active: true, age: 0};
const ropeLem = {ropeId: rope.id, state: 'ROPE', fall: 7, ropeCooldown: 0};
G.ropes = [rope];
G.lems = [ropeLem];
if (!G.ropeAnchorIntact(rope)) throw new Error('Rope anchor fixture was not solid before blast');
G.explode(120, 120, 8, false, 'verify');
if (G.ropes.length !== 0 || rope.active) throw new Error('Rope survived after its anchor terrain was removed');
if (ropeLem.state !== 'FALL' || ropeLem.ropeId !== null || ropeLem.fall !== 0) {
  throw new Error('Lemming was not released when rope anchor disappeared');
}

const bazookaSchoolIdx = LEVELS.findIndex(L => L.name === 'BAZOOKA-SKOLAN');
if (bazookaSchoolIdx < 0) throw new Error('Missing BAZOOKA-SKOLAN');
G.startLevel(bazookaSchoolIdx);
const target = G.decor.find(d => d && d.t === 'target');
if (!target) throw new Error('BAZOOKA-SKOLAN target fixture missing');
G.rockets = [{x: target.x - 14, y: target.y, vx: 6.4, vy: 0, g: 0, life: 20, dir: 1, scale: 1}];
G.tick();
if (G.decor.some(d => d === target || d.remove)) {
  throw new Error('Bazooka rocket did not remove target decor');
}

const directTarget = G.decor.find(d => d && d.t === 'target');
if (!directTarget) throw new Error('BAZOOKA-SKOLAN second target fixture missing');
if (!G.hitDecorTargetAt(directTarget.x, directTarget.y, 3) || !directTarget.remove) {
  throw new Error('Direct target hit helper did not mark target as removed');
}
G.updateDecorPhysics();
if (G.decor.some(d => d === directTarget || d.remove)) {
  throw new Error('Directly broken bazooka target was not removed from decor');
}

G.startLevel(0);
G.T.setRect(92, 181, 24, 5, 1);
const oldRand = G.rand;
G.rand = () => 0.05;
const warmLem = {
  id: 777, x: 100, y: 180, dir: 1, state: 'WALK', bombT: -1, busyT: 0, fall: 0, scale: 1,
  alive(){ return !this.dead && this.state !== 'EXITING'; }
};
G.lems = [warmLem];
G.decor = [{t: 'torch', x: 102, y: 178}];
G.updateTorchWarmEffects();
G.rand = oldRand;
if (warmLem.state !== 'WARM' || warmLem.busyT < 40) {
  throw new Error('Torch warming did not start when chance succeeded');
}
G.finishTorchWarm(warmLem, G.T);
if (warmLem.state !== 'WALK' || warmLem.busyT !== 0) {
  throw new Error('Torch warming did not return lemming to walking state');
}

console.log(`verify-game ok: ${LEVELS.length} levels, ${scripts.length} scripts`);
