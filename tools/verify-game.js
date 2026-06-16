const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'LEMMEL.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
const debugHtmlPath = path.join(root, 'debug.html');
const debugHtml = fs.existsSync(debugHtmlPath) ? fs.readFileSync(debugHtmlPath, 'utf8') : '';
const debugScripts = debugHtml
  ? [...debugHtml.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1])
  : [];

if (scripts.length === 0) throw new Error('No script tags found in LEMMEL.html');

const runtimeScripts = ['js/07_game.js','js/07_rope.js','js/07_save_state.js','js/07_manual_control.js','js/07_waterfall_cave_scenes.js','js/07_waterfall_cave.js','js/07_living_world.js','js/07_cutscenes.js','js/07_cutscene_scenes.js'];
for (let i = 0; i < runtimeScripts.length; i++) {
  const idx = scripts.indexOf(runtimeScripts[i]);
  if (idx < 0) throw new Error(`Missing script tag: ${runtimeScripts[i]}`);
  if (i > 0 && idx <= scripts.indexOf(runtimeScripts[i - 1])) {
    throw new Error(`Script order is wrong around ${runtimeScripts[i]}`);
  }
}
const waterfallRenderIdx = scripts.indexOf('js/11_waterfall_cave_render.js');
const playRenderIdx = scripts.indexOf('js/11_play_render.js');
if (waterfallRenderIdx < 0 || playRenderIdx < 0 || waterfallRenderIdx >= playRenderIdx) {
  throw new Error('Waterfall cave render script must load before js/11_play_render.js');
}

if (debugHtml) {
  if (debugScripts.includes('js/13_boot.js')) throw new Error('debug.html must not load js/13_boot.js');
  if (!debugScripts.includes('js/debug_page.js')) throw new Error('debug.html does not load js/debug_page.js');
  for (const src of debugScripts) {
    if (!fs.existsSync(path.join(root, src))) throw new Error(`debug.html references missing script: ${src}`);
  }
  const debugGameIdx = debugScripts.indexOf('js/07_game.js');
  const debugRopeIdx = debugScripts.indexOf('js/07_rope.js');
  const debugManualIdx = debugScripts.indexOf('js/07_manual_control.js');
  const debugWaterfallScenesIdx = debugScripts.indexOf('js/07_waterfall_cave_scenes.js');
  const debugWaterfallIdx = debugScripts.indexOf('js/07_waterfall_cave.js');
  const debugLivingIdx = debugScripts.indexOf('js/07_living_world.js');
  const debugCutsceneIdx = debugScripts.indexOf('js/07_cutscenes.js');
  const debugCutsceneScenesIdx = debugScripts.indexOf('js/07_cutscene_scenes.js');
  const debugWaterfallRenderIdx = debugScripts.indexOf('js/11_waterfall_cave_render.js');
  const debugPlayRenderIdx = debugScripts.indexOf('js/11_play_render.js');
  const debugPageIdx = debugScripts.indexOf('js/debug_page.js');
  if (debugGameIdx < 0 || debugRopeIdx <= debugGameIdx || debugManualIdx <= debugRopeIdx || debugWaterfallScenesIdx <= debugManualIdx || debugWaterfallIdx <= debugWaterfallScenesIdx || debugLivingIdx <= debugWaterfallIdx || debugCutsceneIdx <= debugLivingIdx || debugCutsceneScenesIdx <= debugCutsceneIdx || debugWaterfallRenderIdx <= debugCutsceneScenesIdx || debugPlayRenderIdx <= debugWaterfallRenderIdx || debugPageIdx <= debugPlayRenderIdx) {
    throw new Error('debug.html script order is wrong');
  }
  const requiredDebugActions = [
    'animFishRing','animFishRingRope','animWaterfallCave','animClimb','animFloat','animBomb','animBlock','animBuild','animDownbuild',
    'animBash','animMine','animDig','animRope','animJet','animFlame','animBazooka'
  ];
  requiredDebugActions.push('spawnMushroom','spawnTree');
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
  for (const action of ['waterClimb','climb','fishRing','dolphin']) {
    if (!debugHtml.includes(`data-cutscene-test="${action}"`)) {
      throw new Error(`debug.html is missing cutscene variant action: ${action}`);
    }
  }
  const debugPageCode = fs.readFileSync(path.join(root, 'js/debug_page.js'), 'utf8');
  for (const token of ['setupFishRingAnimation','setupFishRingRopeAnimation','setupWaterfallCaveAnimation','setupRopeAnimation','ensureWaterLevelForFishRing','buildCutsceneButtons','playDebugCutscene','playDebugRescueCutscene','debugRescueKindForCutsceneId','debugCutsceneWorldContext','spawnMushroom','spawnTree']) {
    if (!debugPageCode.includes(token)) throw new Error(`debug_page.js is missing ${token}`);
  }
}
const hudCode = fs.readFileSync(path.join(root, 'js/09_hud.js'), 'utf8');
if (!hudCode.includes("'UTE '+G.out+'/'+L.lem")) {
  throw new Error('HUD active lemming counter must show active/total');
}
if (!fs.existsSync(path.join(root, 'assets/lands-of-lore-pixel.png'))) {
  throw new Error('Missing Lands of Lore pixel-art asset');
}
const utilCode = fs.readFileSync(path.join(root, 'js/00_util.js'), 'utf8');
if (!utilCode.includes("assets/lands-of-lore-pixel.png")) {
  throw new Error('Lands of Lore pixel-art asset is not registered');
}
const gameCode = fs.readFileSync(path.join(root, 'js/07_game.js'), 'utf8');
const manualControlCode = fs.readFileSync(path.join(root, 'js/07_manual_control.js'), 'utf8');
const waterfallScenesCode = fs.readFileSync(path.join(root, 'js/07_waterfall_cave_scenes.js'), 'utf8');
const waterfallRuntimeCode = fs.readFileSync(path.join(root, 'js/07_waterfall_cave.js'), 'utf8');
if (!waterfallRuntimeCode.includes('enterWaterfallCave') || manualControlCode.includes('enterWaterfallCave') || gameCode.includes('collectWaterfallCaveChest')) {
  throw new Error('Waterfall cave runtime code should live in js/07_waterfall_cave.js');
}
for (const token of ['WATERFALL_CAVE_SCENES','main:{','deep:{','camp:{','emberPassage:{','crystalGallery:{','mirrorPool:{','glyphArchive:{','rootSanctum:{','toCrystalGalleryUp','exits:[','objects:[','waterfallCaveSceneDef','waterfallCaveSceneRenderKey','waterfallCaveObjectDefault']) {
  if (!waterfallScenesCode.includes(token)) {
    throw new Error(`Waterfall cave scene registry is missing ${token}`);
  }
}
for (const token of ['setWaterfallCaveScene','tryWaterfallCaveSceneExit','waterfallCaveSceneRenderKey','waterfallCaveSceneObjects','waterfallCaveHitObject']) {
  if (!waterfallRuntimeCode.includes(token)) {
    throw new Error(`Waterfall cave runtime is missing scene-system method ${token}`);
  }
}
if (!gameCode.includes('clearTransientText') || !waterfallRuntimeCode.includes('clearTransientText') || waterfallRuntimeCode.includes('BAKOM VATTENFALLET')) {
  throw new Error('Entering the waterfall cave should clear existing text instead of showing cave instruction toasts');
}
const cutsceneScenesCode = fs.readFileSync(path.join(root, 'js/07_cutscene_scenes.js'), 'utf8');
if (!cutsceneScenesCode.includes('function cutsceneLemmingRingScale') || cutsceneScenesCode.includes('Math.round(sc*0.58)') || cutsceneScenesCode.includes('Math.round(sc*0.54)')) {
  throw new Error('Fish ring cutscene should use the larger lemming-fit swim ring scale');
}
const caveRenderCode = fs.readFileSync(path.join(root, 'js/11_waterfall_cave_render.js'), 'utf8');
if (!caveRenderCode.includes('ASSETS.landsOfLoreCover') || caveRenderCode.includes('THE THRONE OF CHAOS')) {
  throw new Error('Waterfall cave cover should use the image asset instead of the old hand-drawn cover');
}
if (caveRenderCode.includes('#f0d080')) {
  throw new Error('Deep cave game item should not render the old yellow hitbox highlight');
}
if (!caveRenderCode.includes('drawWaterfallCaveLemmingFireLight') || caveRenderCode.includes('function flameLayer') || caveRenderCode.includes('fireX-72') || caveRenderCode.includes('fireX-50')) {
  throw new Error('Campfire cave render should use pixel-frame fire and lemming side-lighting instead of old rectangular light panels');
}
if (!caveRenderCode.includes('drawWaterfallCaveLemmingShadow') || caveRenderCode.includes('fillRect(x-54,y+13,108,8)') || caveRenderCode.includes('fillRect(lx-Math.round(8*lemScale)')) {
  throw new Error('Campfire cave shadows should avoid the old hard rectangular shadow blocks');
}
if (!caveRenderCode.includes('const fallH=oh+8') || caveRenderCode.includes('oh+32')) {
  throw new Error('Deep waterfall cave opening should not drop the waterfall too far down');
}
if (!caveRenderCode.includes('faceLit') || !caveRenderCode.includes("globalCompositeOperation='lighter'")) {
  throw new Error('Campfire cave lemming should use subtle fire-side rim lighting');
}
const audioCode = fs.readFileSync(path.join(root, 'js/02_audio.js'), 'utf8');
if (audioCode.includes('4300,0.46') || audioCode.includes('900+Math.random()*850') || !audioCode.includes('0.65+Math.random()*1.55')) {
  throw new Error('Campfire audio should use softer, less sharp crackles');
}
const playRenderCode = fs.readFileSync(path.join(root, 'js/11_play_render.js'), 'utf8');
if (!caveRenderCode.includes('function drawWaterfallCaveView') || !caveRenderCode.includes('waterfallCaveRenderKey') || !caveRenderCode.includes('drawWaterfallCaveAdventureView') || !caveRenderCode.includes('drawWaterfallCaveStoneInspect') || !caveRenderCode.includes('RISTAD STEN') || playRenderCode.includes('function drawWaterfallCaveView')) {
  throw new Error('Waterfall cave rendering should live in js/11_waterfall_cave_render.js');
}
if (/drawWaterfallCaveView\(ctx,tickCount\);\s*drawToastStack\(ctx\);/.test(playRenderCode)) {
  throw new Error('Waterfall cave view should not render gameplay toast text on top');
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

function makeRecordingContext2d(){
  const c = makeContext2d();
  const fillStyles = [];
  const strokeStyles = [];
  c.fillStyles = fillStyles;
  c.strokeStyles = strokeStyles;
  c._fillStyle = c.fillStyle;
  c._strokeStyle = c.strokeStyle;
  Object.defineProperty(c, 'fillStyle', {
    get(){return this._fillStyle},
    set(v){this._fillStyle = v; fillStyles.push(String(v))}
  });
  Object.defineProperty(c, 'strokeStyle', {
    get(){return this._strokeStyle},
    set(v){this._strokeStyle = v; strokeStyles.push(String(v))}
  });
  return c;
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
  'globalThis.__verify={G,LEVELS,THEMES,AU,SKILLS,Lemming,drawPlayWorld,drawMenu,drawCutsceneOverlay,drawWaterfallCaveView,waterfallCaveLemmingScale,drawWaterfallCaveLemming,WCTX,menuChapters,DOLPHIN_RESCUE_CHANCE,FISH_RING_CHANCE,TORCH_WARM_CHANCE,TICK};',
  sandbox,
  {timeout:10000}
);

const {G, LEVELS, THEMES, AU, SKILLS, Lemming, drawPlayWorld, drawMenu, drawCutsceneOverlay, drawWaterfallCaveView, waterfallCaveLemmingScale, drawWaterfallCaveLemming, WCTX, menuChapters, DOLPHIN_RESCUE_CHANCE, FISH_RING_CHANCE, TORCH_WARM_CHANCE, TICK} = sandbox.__verify;

if (!Array.isArray(LEVELS) || LEVELS.length === 0) throw new Error('LEVELS is empty');
if (!Array.isArray(SKILLS) || SKILLS.length === 0) throw new Error('SKILLS is empty');
if (Math.abs(DOLPHIN_RESCUE_CHANCE - 0.20) > 0.0001) throw new Error('Dolphin rescue chance should be 20%');
if (Math.abs(FISH_RING_CHANCE - 0.33) > 0.0001) throw new Error('Fish swim ring chance should be 33%');
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
  'makeWaterClimbCutsceneSpec','playWaterClimbCutscene',
  'makeClimbCutsceneSpec','playClimbCutscene','shouldPlayClimbCutscene','toggleCutscenes',
  'hitDecorTargetAt',
  'findNearbyRingFish','makeRescueRingFish','tryFishSwimRing',
  'rescueToastText',
  'initLevelRescues','openRescue','releaseRescueLemming','updateLevelRescues',
  'canUseSupplyPlanes',
  'rebindAmbientFishZones',
  'findMonkeyById','monkeyHasIncomingMissile','pickMonkeyMissilePlane','queueMonkeyAirSupport','requestMonkeyAirSupport','launchPlaneMissileAtMonkey','updateMonkeyAirSupportPlane',
  'steerMonkeyMissile','updateMonkeyMissile','updateBazookaRocket','updateRockets',
  'trollScale','makeTroll','findTrollTransformTarget','transformLemmingToTrollAt','pickSupplyPlaneForTroll','hitSupplyPlaneAt',
  'damageSupplyPlane','finishSupplyPlaneCrash','updateWreckedSupplyPlane','tryTrollThrowAtMonkey','throwTrollRock',
  'trollWallHasStairs','trollRockLandingSurface','nearbySettledTrollRock','settleTrollRock','findSettledTrollRockForLemming',
  'clearTrollWallEntry','clearTrollWallHeadroom',
  'isManualActive','startManualControl','stopManualControl','manualAimFor','releaseManualForSkill',
  'waterfallCaveActive','waterfallCaveEntryBlocked','releaseWaterfallCaveEntryBlock','cloneWaterfallCaveData','waterfallCaveObjectDefaultData','waterfallCaveSceneIds','waterfallCaveSceneDef','waterfallCaveSceneRenderKey','waterfallCaveSceneBounds','waterfallCaveRuntimeObject','waterfallCaveSceneObjects','waterfallCaveObjectContains','waterfallCaveHitObject','waterfallCaveSceneBlockerAt','waterfallCaveNearestObject','interactWaterfallCaveObject','updateWaterfallCaveSceneObjects','ensureWaterfallCaveSceneState','setWaterfallCaveScene','waterfallCaveExitReady','tryWaterfallCaveSceneExit','findWaterfallCaveEntrance','tryEnterWaterfallCaveFromManual','enterWaterfallCave','exitWaterfallCave','startWeatherAfterWaterfallCave','setWaterfallCaveSceneAudio','waterfallCaveMovementHeld','closeWaterfallCaveDeepItem','setWaterfallCaveMoveKey','toggleWaterfallCaveDeepItemCover','waterfallCaveCoverRect','waterfallCaveCampFire','waterfallCaveCampFireBlocked','updateWaterfallCave','handleWaterfallCaveInput','handleWaterfallCaveKey','handleWaterfallCaveKeyUp','waterfallCaveLootKey','collectWaterfallCaveChest',
  'normalizePendingSkillBonus','shopOptions','pendingBonusForLevel','briefShopSkillBonus','buyBriefShopSkill','handleBriefShopInput','applyPendingSkillBonus',
  'updateDolphins','updateMeteors','updateMushroomEatingEffects','canTrollEatMushroom','growTrollFromMushroom','updateMummyScareEffects',
  'canWarmAtTorch','startTorchWarm','finishTorchWarm','updateTorchWarmEffects',
  'updateRandomJumpEvents','updateLemmingChatter','updateWaterfallHeadSplashes'
];
for (const name of requiredRuntimeMethods) {
  if (typeof G[name] !== 'function') throw new Error(`Missing G method after script split: ${name}`);
}
for (const name of ['setMusicVolume','setSfxVolume','applyVolumes','startWaterfallCave','stopWaterfallCave','setWaterfallCaveWaterLevel','startWaterfallCaveFire','stopWaterfallCaveFire','updateWaterfallCaveCampfire','silenceMusicForWaterfallCave','sWaterfallCaveStep']) {
  if (typeof AU[name] !== 'function') throw new Error(`Missing AU volume method: ${name}`);
}
for (const name of ['sLemShiver','sLemWarmSigh','sMissileLaunch']) {
  if (typeof AU[name] !== 'function') throw new Error(`Missing AU lemming warmth sfx method: ${name}`);
}
{
  const prevT = G.T;
  const prevParts = G.parts;
  const prevToasts = G.toasts;
  const prevSavedSfx = AU.sSaved;
  let terrainCleared = false;
  G.T = {
    clearRect(){terrainCleared = true},
    clearDisc(){terrainCleared = true}
  };
  G.parts = [];
  G.toasts = [];
  AU.sSaved = () => {};
  const rescue = {buttonX:40,buttonY:120,openX:80,openY:150,openW:14,openH:30,opened:false,releaseT:0};
  if (!G.openRescue(rescue) || !rescue.opened || rescue.releaseT !== 1) {
    throw new Error('Rescue cage did not open and schedule release');
  }
  if (terrainCleared) {
    throw new Error('Opening a rescue cage should not clear terrain below it');
  }
  G.T = prevT;
  G.parts = prevParts;
  G.toasts = prevToasts;
  AU.sSaved = prevSavedSfx;
}
{
  const prevLevel = G.level;
  const prevTerrain = G.T;
  const prevRockets = G.rockets;
  const prevMonkeys = G.monkeys;
  const prevPlanes = G.planes;
  const prevPackages = G.packages;
  const prevParts = G.parts;
  const prevFlashes = G.flashes;
  const prevToasts = G.toasts;
  const prevQueued = G.queuedEvents;
  const prevWarnings = G.warnings;
  const prevEventLock = G.eventLockT;
  const prevMonkeyEvents = G.monkeyEvents;
  const prevMonkeyT = G.monkeyT;
  const prevMonkeySeq = G.monkeySeq;
  const prevAirSupportPending = G.monkeyAirSupportPending;
  const prevAirSupportTarget = G.monkeyAirSupportTargetX;
  const prevSupplyT = G.supplyT;
  const prevSupplyDrops = G.supplyDrops;
  const prevSupplyMax = G.supplyMax;
  const prevMissileSfx = AU.sMissileLaunch;
  const prevBazookaExplosion = AU.sBazookaExplosion;
  const prevLemmingExplosion = AU.sLemmingExplosion;
  let launched = false, exploded = false;
  G.level = {W:300, hatch:{x:20,y:180}, water:[]};
  G.T = {W:300,H:240,solidBox(){return false}};
  G.rockets = [];
  G.monkeys = [
    {id:1,x:160,y:80,dir:1,vx:0,age:0,throwSchedule:[],throwIndex:0,bananaCount:0,travelFrames:100,endX:360},
    {id:2,x:210,y:72,dir:1,vx:0,age:0,throwSchedule:[],throwIndex:0,bananaCount:0,travelFrames:100,endX:360}
  ];
  G.planes = [{x:80,y:45,vx:1,targetX:140,kind:'skill',skill:'build',dropped:false}];
  G.packages = [];
  G.parts = [];
  G.flashes = [];
  G.toasts = [];
  G.queuedEvents = [];
  G.warnings = [];
  G.eventLockT = 0;
  G.monkeyEvents = 2;
  G.monkeyT = 0;
  G.monkeySeq = 2;
  G.monkeyAirSupportPending = false;
  G.monkeyAirSupportTargetX = null;
  G.supplyT = 999;
  G.supplyDrops = 0;
  G.supplyMax = 0;
  AU.sMissileLaunch = () => { launched = true; };
  AU.sBazookaExplosion = () => { exploded = true; };
  AU.sLemmingExplosion = () => {};
  if (!G.bombMonkeyAt(160,80) || !launched || G.monkeys[0].gone) {
    throw new Error('Bombing a monkey while a plane is active should launch a missile instead of exploding immediately');
  }
  if (G.rockets.length !== 1 || G.rockets[0].kind !== 'monkeyMissile' || G.rockets[0].targetMonkeyId !== 1) {
    throw new Error('Monkey bomb did not create a plane missile targeting the monkey');
  }
  for (let i = 0; i < 80 && G.monkeys.some(m => !m.gone); i++) {
    G.updateSupplyDrops();
    G.updateRockets();
  }
  if (G.monkeys.some(m => !m.gone) || G.rockets.length !== 0 || !exploded) {
    throw new Error('Air-support plane did not missile all monkeys during its flyover');
  }
  launched = false;
  exploded = false;
  G.rockets = [];
  G.monkeys = [
    {id:3,x:120,y:70,dir:1,vx:0,age:0,throwSchedule:[],throwIndex:0,bananaCount:0,travelFrames:100,endX:360},
    {id:4,x:190,y:82,dir:1,vx:0,age:0,throwSchedule:[],throwIndex:0,bananaCount:0,travelFrames:100,endX:360}
  ];
  G.planes = [];
  G.queuedEvents = [];
  G.warnings = [];
  G.eventLockT = 0;
  if (!G.bombMonkeyAt(120,70) || G.monkeys.some(m => m.gone) || G.rockets.length !== 0) {
    throw new Error('Bombing a monkey without an active plane should queue air support instead of exploding immediately');
  }
  const supportEvent = G.queuedEvents.find(q => q.kind === 'supplyPlane' && q.data && q.data.payload && q.data.payload.monkeyAirSupport);
  if (!supportEvent || !G.monkeyAirSupportPending) {
    throw new Error('Bombing a monkey without an active plane did not queue future air support');
  }
  G.executeQueuedEvent(supportEvent);
  if (!G.planes[0] || !G.planes[0].monkeyAirSupport || !G.planes[0].dropped) {
    throw new Error('Queued monkey air support did not spawn a support plane');
  }
  for (let i = 0; i < 120 && G.monkeys.some(m => !m.gone); i++) {
    G.updateSupplyDrops();
    G.updateRockets();
  }
  if (G.monkeys.some(m => !m.gone)) {
    throw new Error('Future support plane did not missile all monkeys during its flyover');
  }
  G.level = prevLevel;
  G.T = prevTerrain;
  G.rockets = prevRockets;
  G.monkeys = prevMonkeys;
  G.planes = prevPlanes;
  G.packages = prevPackages;
  G.parts = prevParts;
  G.flashes = prevFlashes;
  G.toasts = prevToasts;
  G.queuedEvents = prevQueued;
  G.warnings = prevWarnings;
  G.eventLockT = prevEventLock;
  G.monkeyEvents = prevMonkeyEvents;
  G.monkeyT = prevMonkeyT;
  G.monkeySeq = prevMonkeySeq;
  G.monkeyAirSupportPending = prevAirSupportPending;
  G.monkeyAirSupportTargetX = prevAirSupportTarget;
  G.supplyT = prevSupplyT;
  G.supplyDrops = prevSupplyDrops;
  G.supplyMax = prevSupplyMax;
  AU.sMissileLaunch = prevMissileSfx;
  AU.sBazookaExplosion = prevBazookaExplosion;
  AU.sLemmingExplosion = prevLemmingExplosion;
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
  for (const id of ['cutscene-preview-box','cutscene-preview-fullscreen','fish-ring-closeup','dolphin-rescue-closeup','water-climb-closeup','wall-climb-closeup']) {
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
  const climbScene = G.playCutscene(G.makeClimbCutsceneSpec('fullscreen'));
  if (!climbScene || !G.cutsceneActive() || climbScene.id !== 'wall-climb-closeup') {
    throw new Error('Wall climb cutscene did not start');
  }
  if (G.currentCutsceneShot().duration < minGameplayCutsceneTicks || G.currentCutsceneShot().duration > maxGameplayCutsceneTicks) {
    throw new Error('Wall climb cutscene should be at most 3 seconds long');
  }
  drawCutsceneOverlay(WCTX, 6);
  G.clearCutscene('verify-wall-climb');
  const desertSpec = G.makeWaterClimbCutsceneSpec('fullscreen');
  desertSpec.event = {themeKey:'desert', fromWater:true, lemX:140, lemY:130, waterY:120};
  const desertCtx = makeRecordingContext2d();
  desertSpec.shots[0].draw(desertCtx, {x:0,y:0,w:480,h:300}, 0.5, {spec:desertSpec}, 7);
  if (!desertCtx.fillStyles.includes('#9a6131') || !desertCtx.fillStyles.includes('#b87938')) {
    throw new Error('Water climb cutscene did not render the selected desert material');
  }
  const crystalSpec = G.makeClimbCutsceneSpec('fullscreen');
  crystalSpec.event = {themeKey:'crystal', fromWater:false, lemX:140, lemY:130, waterY:120};
  const crystalCtx = makeRecordingContext2d();
  crystalSpec.shots[0].draw(crystalCtx, {x:0,y:0,w:480,h:300}, 0.5, {spec:crystalSpec}, 8);
  if (!crystalCtx.fillStyles.includes('#5ea4cc') || !crystalCtx.fillStyles.includes('#6cb6d8')) {
    throw new Error('Wall climb cutscene did not render the selected crystal material');
  }
  G.state = prevState;
  G.paused = prevPaused;
  G.cutscene = prevCutscene;
  G.doorT = prevDoor;
  G.manual = prevManual;
  G.ropeAim = prevRopeAim;
  G.cutscenesOn = prevCutscenesOn;
}
{
  const prevStartWaterfall = AU.startWaterfallCave;
  const prevStopWaterfall = AU.stopWaterfallCave;
  const prevStartMusic = AU.startMusic;
  const prevStopMusic = AU.stopMusic;
  const prevSilenceMusic = AU.silenceMusicForWaterfallCave;
  const prevStartWeather = AU.startWeather;
  const prevStopWeather = AU.stopWeather;
  const prevCaveStep = AU.sWaterfallCaveStep;
  const prevWaterLevel = AU.setWaterfallCaveWaterLevel;
  const prevStartFire = AU.startWaterfallCaveFire;
  const prevStopFire = AU.stopWaterfallCaveFire;
  const prevUpdateFire = AU.updateWaterfallCaveCampfire;
  const prevMusicOn = AU.musicOn;
  const prevSfxOn = AU.sfxOn;
  const prevMoney = G.money;
  const prevPendingSkillBonus = G.pendingSkillBonus;
  const prevWaterfallLooted = G.waterfallCaveLooted;
  const prevToasts = G.toasts;
  const prevMsg = G.msg;
  const prevMsgT = G.msgT;
  let started = 0, stopped = 0, musicStopped = 0, weatherStopped = 0, firesStarted = 0, firesStopped = 0, fireUpdates = 0;
  const musicStarted = [], weatherStarted = [], musicFadeDurations = [], caveSteps = [], waterLevels = [];
  AU.startWaterfallCave = () => { started++; };
  AU.stopWaterfallCave = () => { stopped++; };
  AU.startMusic = kind => { musicStarted.push(kind); };
  AU.stopMusic = () => { musicStopped++; };
  AU.silenceMusicForWaterfallCave = fade => { musicFadeDurations.push(fade); AU.stopMusic(); };
  AU.startWeather = kind => { weatherStarted.push(kind); };
  AU.stopWeather = () => { weatherStopped++; };
  AU.sWaterfallCaveStep = depth => { caveSteps.push(depth); };
  AU.setWaterfallCaveWaterLevel = (level, fade) => { waterLevels.push({level, fade}); };
  AU.startWaterfallCaveFire = () => { firesStarted++; };
  AU.stopWaterfallCaveFire = () => { firesStopped++; };
  AU.updateWaterfallCaveCampfire = () => { fireUpdates++; };
  AU.musicOn = true;
  AU.sfxOn = true;
  const waterfallIdx = LEVELS.findIndex(L => L && L.name === 'BYGG EN BRO');
  if (waterfallIdx < 0) throw new Error('Missing waterfall cave fixture level');
  G.startLevel(waterfallIdx);
  const wf = (G.decor || []).find(d => d && d.t === 'waterfall');
  if (!wf) throw new Error('Waterfall cave fixture is missing waterfall decor');
  const caveLem = new Lemming(wf.x, wf.y + wf.h - 6);
  caveLem.state = 'MANUAL';
  caveLem.fall = 12;
  G.lems = [caveLem];
  G.manual = {used:true, active:true, lemId:caveLem.id, lampOn:false, keys:{left:false,right:false,down:false,run:false,aim:false}, jumpQueued:{super:false}, aimAngle:0};
  const oldTime = G.timeT;
  const musicStoppedBeforeCave = musicStopped;
  const weatherStoppedBeforeCave = weatherStopped;
  G.toasts = [{text:'PAKET HÄMTAT: +1 REPKROK', t:90, maxT:90}];
  G.msg = 'PAKET HÄMTAT: +1 REPKROK';
  G.msgT = 90;
  if (!G.findWaterfallCaveEntrance(caveLem)) throw new Error('Manual lemming did not find waterfall cave entrance');
  if (!G.tryEnterWaterfallCaveFromManual() || !G.waterfallCaveActive()) {
    throw new Error('Manual up near a waterfall did not enter the waterfall cave');
  }
  const caveSceneIds = G.waterfallCaveSceneIds();
  for (const id of ['main','deep','camp','emberPassage','crystalGallery','mirrorPool','glyphArchive','rootSanctum']) {
    if (!caveSceneIds.includes(id)) throw new Error(`Waterfall cave scene registry is missing scene ${id}`);
  }
  if (G.waterfallCaveSceneDef('main').render !== 'main' || G.waterfallCaveSceneDef('camp').audio !== 'campfire') {
    throw new Error('Waterfall cave scene registry did not expose scene metadata');
  }
  if (G.waterfallCaveSceneRenderKey(G.waterfallCave) !== 'main') {
    throw new Error('Waterfall cave scene render key did not come from the active scene');
  }
  if (G.waterfallCaveSceneBounds(G.waterfallCave).maxY !== G.waterfallCave.bounds.maxY) {
    throw new Error('Waterfall cave scene bounds helper did not return the active scene bounds');
  }
  if (!G.waterfallCaveSceneObjects(G.waterfallCave).some(hit => hit && hit.def && hit.def.id === 'chest')) {
    throw new Error('Waterfall cave scene objects did not expose the main cave chest');
  }
  G.handleWaterfallCaveInput({x:G.waterfallCave.chest.x,y:G.waterfallCave.chest.y}, 'click');
  if (G.waterfallCave.hoverObject !== 'chest') {
    throw new Error('Waterfall cave object hit testing did not find the chest');
  }
  if ((G.toasts && G.toasts.length) || G.msgT > 0 || G.msg) {
    throw new Error('Entering waterfall cave did not clear existing toast text');
  }
  if (G.manual.jumpQueued || caveLem.fall !== 0 || caveLem.manualVy !== 0 || started !== 1) {
    throw new Error('Entering waterfall cave did not clear manual jump/fall state or start audio');
  }
  if (musicStopped !== musicStoppedBeforeCave + 1 || weatherStopped !== weatherStoppedBeforeCave + 1) {
    throw new Error(`Entering waterfall cave should stop level music and weather ambient, got music=${musicStopped - musicStoppedBeforeCave} weather=${weatherStopped - weatherStoppedBeforeCave}`);
  }
  if (musicFadeDurations.length !== 1 || musicFadeDurations[0] < 0.99) {
    throw new Error('Entering waterfall cave should fade music out over about one second');
  }
  G.tick();
  if (G.timeT !== oldTime || !G.waterfallCaveActive() || G.waterfallCave.t !== 1) {
    throw new Error('Waterfall cave should block gameplay ticking while it is active');
  }
  if (typeof drawWaterfallCaveView !== 'function' || !drawWaterfallCaveView(WCTX, 9)) {
    throw new Error('Waterfall cave view did not render');
  }
  if (typeof waterfallCaveLemmingScale !== 'function') {
    throw new Error('Waterfall cave lemming scale helper is missing');
  }
  if (typeof drawWaterfallCaveLemming !== 'function') {
    throw new Error('Waterfall cave lemming renderer is missing');
  }
  const farScale = waterfallCaveLemmingScale(Object.assign({}, G.waterfallCave, {lemY:G.waterfallCave.bounds.exitY}));
  const nearScale = waterfallCaveLemmingScale(Object.assign({}, G.waterfallCave, {lemY:G.waterfallCave.bounds.maxY}));
  if (!(nearScale > farScale && farScale > 1 && nearScale >= 2.3 && nearScale <= 2.6)) {
    throw new Error('Waterfall cave lemming scale does not grow toward the foreground');
  }
  if (G.waterfallCave.bounds.exitY < 210 || G.waterfallCave.bounds.maxY < 300) {
    throw new Error('Waterfall cave bounds should allow a lower exit edge and deeper cave movement');
  }
  const startCaveX = G.waterfallCave.lemX;
  if (!G.handleWaterfallCaveKey('ArrowRight')) throw new Error('Waterfall cave did not accept ArrowRight');
  for (let i = 0; i < 4; i++) G.tick();
  G.handleWaterfallCaveKeyUp('ArrowRight');
  if (caveSteps.length < 1 || caveSteps.some(d => d < 0 || d > 1)) {
    throw new Error('Waterfall cave walking did not trigger bounded footstep sounds');
  }
  if (!G.waterfallCaveActive() || G.waterfallCave.lemX <= startCaveX) {
    throw new Error('Waterfall cave lemming did not move with arrow keys');
  }
  const rightAnim = G.waterfallCave.walkAnim;
  if (G.waterfallCave.facing !== 'right' || !G.waterfallCave.walking || rightAnim <= 0) {
    throw new Error('Waterfall cave lemming did not face right and animate while walking right');
  }
  G.tick();
  if (G.waterfallCave.walking || G.waterfallCave.walkAnim !== rightAnim) {
    throw new Error('Waterfall cave lemming legs should stop animating when idle');
  }
  G.waterfallCave.lemX = G.waterfallCave.bounds.minX;
  G.waterfallCave.lemY = 220;
  G.handleWaterfallCaveKey('ArrowUp');
  G.tick();
  if (!G.waterfallCaveActive() || G.waterfallCave.facing !== 'back' || !G.waterfallCave.walking) {
    throw new Error('Waterfall cave lemming should face away/back when walking up');
  }
  G.handleWaterfallCaveKeyUp('ArrowUp');
  for (const facing of ['left','right','front','back']) {
    drawWaterfallCaveLemming(WCTX, Object.assign({}, G.waterfallCave, {facing, walking:false}), 240, 210, 2.2);
  }
  G.handleWaterfallCaveKey('ArrowDown');
  for (let i = 0; i < 18; i++) G.tick();
  G.handleWaterfallCaveKeyUp('ArrowDown');
  if (!G.waterfallCaveActive() || G.waterfallCave.lemY <= 232) {
    throw new Error('Waterfall cave lemming cannot walk deeper into the cave');
  }
  const caveMoney = Math.max(0, G.money | 0);
  G.waterfallCave.lemX = G.waterfallCave.chest.x;
  G.waterfallCave.lemY = G.waterfallCave.chest.y;
  G.tick();
  if (!G.waterfallCave.chest.opened || G.waterfallCave.chest.glowT !== 70 || !G.waterfallCave.chest.collected || G.money !== caveMoney + G.waterfallCave.chest.coins) {
    throw new Error('Waterfall cave chest did not open and award money when approached');
  }
  const afterChestMoney = G.money;
  G.waterfallCave.lemX = G.waterfallCave.chest.x - 100;
  G.waterfallCave.lemY = G.waterfallCave.chest.y;
  G.tick();
  if (G.waterfallCave.chest.opened || G.waterfallCave.chest.glowT !== 0) {
    throw new Error('Waterfall cave chest should close and stop glowing when the lemming leaves it');
  }
  G.waterfallCave.lemX = G.waterfallCave.chest.x - 28;
  G.waterfallCave.lemY = G.waterfallCave.chest.y;
  G.tick();
  if (G.waterfallCave.chest.opened || G.waterfallCave.chest.glowT !== 0) {
    throw new Error('Waterfall cave chest should only open at close range');
  }
  G.waterfallCave.lemX = G.waterfallCave.chest.x;
  G.waterfallCave.lemY = G.waterfallCave.chest.y;
  G.tick();
  if (!G.waterfallCave.chest.opened || G.money !== afterChestMoney) {
    throw new Error('Waterfall cave chest did not reopen without awarding money again');
  }
  G.waterfallCave.chest.opened = false;
  G.waterfallCave.lemX = 240;
  G.waterfallCave.lemY = G.waterfallCave.bounds.deepY + 1;
  G.handleWaterfallCaveKey('ArrowDown');
  G.tick();
  G.handleWaterfallCaveKeyUp('ArrowDown');
  if (!G.waterfallCaveActive() || G.waterfallCave.scene !== 'deep') {
    throw new Error('Waterfall cave did not enter the deeper cave scene from the bottom');
  }
  if (typeof drawWaterfallCaveView !== 'function' || !drawWaterfallCaveView(WCTX, 17)) {
    throw new Error('Deep waterfall cave view did not render');
  }
  const deepItem = G.waterfallCave.deepItem;
  if (!deepItem) throw new Error('Deep waterfall cave is missing the game item');
  G.waterfallCave.lemX = deepItem.x + 34;
  G.waterfallCave.lemY = deepItem.y + 10;
  G.tick();
  if (deepItem.coverOpen || deepItem.near) {
    throw new Error('Deep cave game cover opens before the lemmel reaches the item');
  }
  G.waterfallCave.lemX = deepItem.x + 18;
  G.waterfallCave.lemY = deepItem.y + 8;
  G.tick();
  if (!deepItem.coverOpen || !deepItem.near) {
    throw new Error('Deep cave game cover did not open near the item');
  }
  G.handleWaterfallCaveInput({x:240,y:150}, 'click');
  if (!deepItem.coverOpen || deepItem.coverSide !== 'back') {
    throw new Error('Deep cave game cover did not flip when clicking the visible cover');
  }
  G.handleWaterfallCaveInput({x:20,y:20}, 'click');
  if (deepItem.coverOpen || !deepItem.dismissedNear) {
    throw new Error('Deep cave game cover did not close on an outside click');
  }
  G.waterfallCave.lemX = deepItem.x - 72;
  G.waterfallCave.lemY = deepItem.y;
  G.tick();
  if (deepItem.dismissedNear) {
    throw new Error('Deep cave game item did not reset after walking away');
  }
  G.handleWaterfallCaveKey('ArrowRight');
  for (let i = 0; i < 40 && !deepItem.coverOpen; i++) G.tick();
  if (!deepItem.coverOpen || deepItem.coverCloseArmed) {
    throw new Error('Deep cave game cover should open unarmed while arrival movement is still held');
  }
  const heldCoverX = G.waterfallCave.lemX;
  G.tick();
  if (!deepItem.coverOpen || G.waterfallCave.lemX !== heldCoverX) {
    throw new Error('Deep cave game cover should stay open and freeze arrival movement until key release');
  }
  G.handleWaterfallCaveKey('ArrowRight');
  G.tick();
  if (!deepItem.coverOpen) {
    throw new Error('Deep cave game cover closed before the arrival key was released');
  }
  G.handleWaterfallCaveKeyUp('ArrowRight');
  if (!deepItem.coverCloseArmed) {
    throw new Error('Deep cave game cover did not arm closing after movement key release');
  }
  G.handleWaterfallCaveKey('ArrowRight');
  if (deepItem.coverOpen || !G.waterfallCave.keys.right) {
    throw new Error('Deep cave game cover should close and begin movement on the first movement key after release');
  }
  G.handleWaterfallCaveKeyUp('ArrowRight');
  G.waterfallCave.lemX = deepItem.x + 70;
  G.waterfallCave.lemY = deepItem.y;
  G.tick();
  if (deepItem.coverOpen) {
    throw new Error('Deep cave game cover did not close when walking away');
  }
  G.waterfallCave.lemX = deepItem.x + 10;
  G.waterfallCave.lemY = deepItem.y;
  G.tick();
  if (!deepItem.coverOpen || deepItem.coverSide !== 'front') {
    throw new Error('Deep cave game cover did not reopen on a later visit');
  }
  G.handleWaterfallCaveKey('v');
  if (!deepItem.coverOpen || deepItem.coverSide !== 'back') {
    throw new Error('Deep cave game cover did not flip with the V key');
  }
  G.handleWaterfallCaveKey('v');
  if (!deepItem.coverOpen || deepItem.coverSide !== 'front') {
    throw new Error('Deep cave game cover did not flip back with the V key');
  }
  G.handleWaterfallCaveKey('Enter');
  if (!deepItem.coverOpen || deepItem.coverSide !== 'back') {
    throw new Error('Deep cave game cover did not flip to the back side');
  }
  G.handleWaterfallCaveKey(' ');
  if (!deepItem.coverOpen || deepItem.coverSide !== 'front') {
    throw new Error('Deep cave game cover did not flip back to the front side');
  }
  G.handleWaterfallCaveInput({x:20,y:20}, 'click');
  G.waterfallCave.lemX = 240;
  G.waterfallCave.lemY = G.waterfallCave.deepBounds.campY + 1;
  G.handleWaterfallCaveKey('ArrowDown');
  G.tick();
  G.handleWaterfallCaveKeyUp('ArrowDown');
  if (!G.waterfallCaveActive() || G.waterfallCave.scene !== 'camp') {
    throw new Error('Deep waterfall cave did not continue into the campfire scene');
  }
  if (!G.waterfallCave.campBounds || G.waterfallCave.campBounds.maxY < 300) {
    throw new Error('Campfire cave scene is missing walkable camp bounds');
  }
  if (firesStarted < 1 || !waterLevels.some(w => w.level <= 0.30)) {
    throw new Error('Campfire cave scene did not start fire audio and lower the waterfall level');
  }
  if (typeof drawWaterfallCaveView !== 'function' || !drawWaterfallCaveView(WCTX, 23)) {
    throw new Error('Campfire waterfall cave view did not render');
  }
  G.tick();
  if (fireUpdates < 1) {
    throw new Error('Campfire cave scene did not update fire crackles while active');
  }
  const campFire = G.waterfallCave.campFire;
  if (!campFire || !G.waterfallCaveCampFireBlocked(G.waterfallCave, campFire.x, campFire.y + 8)) {
    throw new Error('Campfire cave scene is missing a blocking fire zone');
  }
  G.waterfallCave.lemX = campFire.x - campFire.rx - 8;
  G.waterfallCave.lemY = campFire.y + 8;
  G.handleWaterfallCaveKey('ArrowRight');
  for (let i = 0; i < 24; i++) G.tick();
  G.handleWaterfallCaveKeyUp('ArrowRight');
  if (G.waterfallCaveCampFireBlocked(G.waterfallCave, G.waterfallCave.lemX, G.waterfallCave.lemY) || G.waterfallCave.lemX > campFire.x - campFire.rx + 1) {
    throw new Error('Campfire cave lemmel can walk into the fire');
  }
  G.waterfallCave.lemX = G.waterfallCave.campBounds.minX;
  G.waterfallCave.lemY = 226;
  G.handleWaterfallCaveKey('ArrowLeft');
  G.tick();
  G.handleWaterfallCaveKeyUp('ArrowLeft');
  if (!G.waterfallCaveActive() || G.waterfallCave.scene !== 'emberPassage') {
    throw new Error('Campfire cave did not reveal the left secret passage');
  }
  if (typeof drawWaterfallCaveView !== 'function' || !drawWaterfallCaveView(WCTX, 31)) {
    throw new Error('Ember passage waterfall cave view did not render');
  }
  if (!waterLevels.some(w => w.level <= 0.20)) {
    throw new Error('Secret ember passage should lower the waterfall sound level');
  }
  const emberStone = G.waterfallCaveSceneObjects(G.waterfallCave).find(hit => hit && hit.def && hit.def.id === 'looseStone');
  if (!emberStone) throw new Error('Ember passage is missing its loose stone object');
  G.waterfallCave.lemX = emberStone.obj.x;
  G.waterfallCave.lemY = emberStone.obj.y;
  G.tick();
  G.handleWaterfallCaveKey('Enter');
  if (!emberStone.obj.activated || !emberStone.obj.shifted) {
    throw new Error('Ember passage loose stone did not react to interaction');
  }
  if (!drawWaterfallCaveView(WCTX, 33)) {
    throw new Error('Ember passage stone inspection view did not render');
  }
  G.waterfallCave.lemX = 240;
  G.waterfallCave.lemY = G.waterfallCaveSceneBounds(G.waterfallCave).minY;
  G.handleWaterfallCaveKey('ArrowUp');
  G.tick();
  G.handleWaterfallCaveKeyUp('ArrowUp');
  if (!G.waterfallCaveActive() || G.waterfallCave.scene !== 'crystalGallery') {
    throw new Error(`Secret passage did not continue upward into the crystal gallery, scene=${G.waterfallCave && G.waterfallCave.scene} x=${G.waterfallCave && G.waterfallCave.lemX} y=${G.waterfallCave && G.waterfallCave.lemY}`);
  }
  if (!drawWaterfallCaveView(WCTX, 37)) throw new Error('Crystal gallery view did not render');
  const songCrystal = G.waterfallCaveSceneObjects(G.waterfallCave).find(hit => hit && hit.def && hit.def.id === 'songCrystal');
  if (!songCrystal) throw new Error('Crystal gallery is missing the song crystal');
  G.waterfallCave.lemX = songCrystal.obj.x;
  G.waterfallCave.lemY = songCrystal.obj.y;
  G.tick();
  if (!songCrystal.obj.activated || songCrystal.obj.pulseT <= 0) {
    throw new Error('Song crystal did not glow when approached');
  }
  G.waterfallCave.lemX = 240;
  G.waterfallCave.lemY = G.waterfallCaveSceneBounds(G.waterfallCave).maxY;
  G.handleWaterfallCaveKey('ArrowDown');
  G.tick();
  G.handleWaterfallCaveKeyUp('ArrowDown');
  if (!G.waterfallCaveActive() || G.waterfallCave.scene !== 'mirrorPool') {
    throw new Error('Crystal gallery did not lead down to the mirror pool');
  }
  if (!drawWaterfallCaveView(WCTX, 43)) throw new Error('Mirror pool view did not render');
  const mirrorPool = G.waterfallCaveSceneObjects(G.waterfallCave).find(hit => hit && hit.def && hit.def.id === 'mirrorPool');
  if (!mirrorPool || !G.waterfallCaveSceneBlockerAt(G.waterfallCave, mirrorPool.obj.x, mirrorPool.obj.y)) {
    throw new Error('Mirror pool should be a blocking cave object');
  }
  G.waterfallCave.lemX = mirrorPool.obj.x;
  G.waterfallCave.lemY = mirrorPool.obj.y;
  G.tick();
  if (!mirrorPool.obj.activated || mirrorPool.obj.rippleT <= 0) {
    throw new Error('Mirror pool did not ripple when approached');
  }
  G.waterfallCave.lemX = G.waterfallCaveSceneBounds(G.waterfallCave).minX;
  G.waterfallCave.lemY = 230;
  G.handleWaterfallCaveKey('ArrowLeft');
  G.tick();
  G.handleWaterfallCaveKeyUp('ArrowLeft');
  if (!G.waterfallCaveActive() || G.waterfallCave.scene !== 'glyphArchive') {
    throw new Error('Mirror pool did not lead to the glyph archive');
  }
  if (!drawWaterfallCaveView(WCTX, 49)) throw new Error('Glyph archive view did not render');
  const runeWall = G.waterfallCaveSceneObjects(G.waterfallCave).find(hit => hit && hit.def && hit.def.id === 'runeWall');
  if (!runeWall) throw new Error('Glyph archive is missing the rune wall');
  G.waterfallCave.lemX = runeWall.obj.x;
  G.waterfallCave.lemY = runeWall.obj.y;
  G.tick();
  if (!runeWall.obj.activated) {
    throw new Error('Rune wall did not light up when approached');
  }
  G.waterfallCave.lemX = 240;
  G.waterfallCave.lemY = G.waterfallCaveSceneBounds(G.waterfallCave).maxY;
  G.handleWaterfallCaveKey('ArrowDown');
  G.tick();
  G.handleWaterfallCaveKeyUp('ArrowDown');
  if (!G.waterfallCaveActive() || G.waterfallCave.scene !== 'rootSanctum') {
    throw new Error('Glyph archive did not lead down to the root sanctum');
  }
  if (!drawWaterfallCaveView(WCTX, 55)) throw new Error('Root sanctum view did not render');
  const rootHeart = G.waterfallCaveSceneObjects(G.waterfallCave).find(hit => hit && hit.def && hit.def.id === 'rootHeart');
  if (!rootHeart) throw new Error('Root sanctum is missing the root heart');
  G.waterfallCave.lemX = rootHeart.obj.x;
  G.waterfallCave.lemY = rootHeart.obj.y;
  G.tick();
  if (!rootHeart.obj.activated || rootHeart.obj.pulseT <= 0) {
    throw new Error('Root heart did not react when approached');
  }
  G.waterfallCave.lemX = 240;
  G.waterfallCave.lemY = G.waterfallCaveSceneBounds(G.waterfallCave).minY;
  G.handleWaterfallCaveKey('ArrowUp');
  G.tick();
  G.handleWaterfallCaveKeyUp('ArrowUp');
  if (!G.waterfallCaveActive() || G.waterfallCave.scene !== 'glyphArchive') {
    throw new Error('Root sanctum did not return to the glyph archive');
  }
  G.waterfallCave.lemX = G.waterfallCaveSceneBounds(G.waterfallCave).maxX;
  G.waterfallCave.lemY = 228;
  G.handleWaterfallCaveKey('ArrowRight');
  G.tick();
  G.handleWaterfallCaveKeyUp('ArrowRight');
  if (!G.waterfallCaveActive() || G.waterfallCave.scene !== 'mirrorPool') {
    throw new Error('Glyph archive did not return to the mirror pool');
  }
  G.waterfallCave.lemX = 240;
  G.waterfallCave.lemY = G.waterfallCaveSceneBounds(G.waterfallCave).minY;
  G.handleWaterfallCaveKey('ArrowUp');
  G.tick();
  G.handleWaterfallCaveKeyUp('ArrowUp');
  if (!G.waterfallCaveActive() || G.waterfallCave.scene !== 'crystalGallery') {
    throw new Error('Mirror pool did not return to the crystal gallery');
  }
  G.waterfallCave.lemX = G.waterfallCaveSceneBounds(G.waterfallCave).maxX;
  G.waterfallCave.lemY = 232;
  G.handleWaterfallCaveKey('ArrowRight');
  G.tick();
  G.handleWaterfallCaveKeyUp('ArrowRight');
  if (!G.waterfallCaveActive() || G.waterfallCave.scene !== 'emberPassage') {
    throw new Error('Crystal gallery did not return to the ember passage');
  }
  G.waterfallCave.lemX = G.waterfallCaveSceneBounds(G.waterfallCave).maxX;
  G.waterfallCave.lemY = 226;
  G.handleWaterfallCaveKey('ArrowRight');
  G.tick();
  G.handleWaterfallCaveKeyUp('ArrowRight');
  if (!G.waterfallCaveActive() || G.waterfallCave.scene !== 'camp') {
    throw new Error('Ember passage did not return to the campfire cave');
  }
  G.waterfallCave.lemX = 240;
  G.waterfallCave.lemY = G.waterfallCave.campBounds.exitY + 1;
  G.handleWaterfallCaveKey('ArrowUp');
  G.tick();
  if (!G.waterfallCaveActive() || G.waterfallCave.scene !== 'deep') {
    throw new Error('Campfire cave scene did not return to the deep cave when walking up');
  }
  if (firesStopped < 1 || !waterLevels.some(w => w.level >= 0.70)) {
    throw new Error('Leaving campfire cave did not stop fire audio and restore waterfall level');
  }
  for (let i = 0; i < 18; i++) G.tick();
  if (deepItem.coverOpen) {
    throw new Error('Deep cave game cover opened automatically while returning from the campfire scene');
  }
  G.handleWaterfallCaveKeyUp('ArrowUp');
  G.waterfallCave.lemX = 240;
  G.waterfallCave.lemY = G.waterfallCave.deepBounds.exitY + 1;
  G.handleWaterfallCaveKey('ArrowUp');
  G.tick();
  G.handleWaterfallCaveKeyUp('ArrowUp');
  if (!G.waterfallCaveActive() || G.waterfallCave.scene !== 'main') {
    throw new Error('Deep waterfall cave did not return to the main cave when walking back toward the water');
  }
  G.waterfallCave.lemX = 240;
  G.waterfallCave.lemY = G.waterfallCave.bounds.exitY;
  G.tick();
  if (!G.waterfallCaveActive()) {
    throw new Error('Waterfall cave should not exit from edge position without active upward input');
  }
  G.waterfallCave.lemY = G.waterfallCave.bounds.exitY + 1;
  G.handleWaterfallCaveKey('ArrowUp');
  G.tick();
  if (G.waterfallCaveActive() || stopped < 1) {
    throw new Error('Waterfall cave did not exit when walking up to the water');
  }
  if (musicStarted.length < 2 || weatherStarted.length < 2) {
    throw new Error('Leaving waterfall cave should resume level music and weather ambient');
  }
  if (!G.waterfallCaveEntryBlocked()) {
    throw new Error('Waterfall cave should block immediate re-entry until ArrowUp is released');
  }
  if (G.tryEnterWaterfallCaveFromManual() || G.waterfallCaveActive()) {
    throw new Error('Waterfall cave re-entered while ArrowUp was still held after exit');
  }
  G.releaseWaterfallCaveEntryBlock('ArrowUp');
  if (G.waterfallCaveEntryBlocked()) {
    throw new Error('Waterfall cave re-entry block did not clear on ArrowUp release');
  }
  if (!G.tryEnterWaterfallCaveFromManual() || !G.waterfallCaveActive()) {
    throw new Error('Waterfall cave did not allow re-entry after ArrowUp was released');
  }
  const musicBeforeSilentExit = musicStarted.length;
  const weatherBeforeSilentExit = weatherStarted.length;
  G.exitWaterfallCave('silent');
  if (musicStarted.length !== musicBeforeSilentExit || weatherStarted.length !== weatherBeforeSilentExit) {
    throw new Error('Silent waterfall cave exit should not restart music or weather');
  }
  AU.startWaterfallCave = prevStartWaterfall;
  AU.stopWaterfallCave = prevStopWaterfall;
  AU.startMusic = prevStartMusic;
  AU.stopMusic = prevStopMusic;
  AU.silenceMusicForWaterfallCave = prevSilenceMusic;
  AU.startWeather = prevStartWeather;
  AU.stopWeather = prevStopWeather;
  AU.sWaterfallCaveStep = prevCaveStep;
  AU.setWaterfallCaveWaterLevel = prevWaterLevel;
  AU.startWaterfallCaveFire = prevStartFire;
  AU.stopWaterfallCaveFire = prevStopFire;
  AU.updateWaterfallCaveCampfire = prevUpdateFire;
  AU.musicOn = prevMusicOn;
  AU.sfxOn = prevSfxOn;
  G.money = prevMoney;
  G.pendingSkillBonus = prevPendingSkillBonus;
  G.waterfallCaveLooted = prevWaterfallLooted;
  G.toasts = prevToasts;
  G.msg = prevMsg;
  G.msgT = prevMsgT;
}
{
  const prevMoney = G.money;
  const prevPendingSkillBonus = G.pendingSkillBonus;
  const prevBriefButtons = G.briefShopButtons;
  const shopIdx = Math.min(1, LEVELS.length - 1);
  G.levelIdx = shopIdx;
  G.money = SKILLS.length + 2;
  G.pendingSkillBonus = {};
  G.briefShopButtons = [{x:10,y:10,w:40,h:18,k:'rope'}];
  const optionKeys = new Set(G.shopOptions().map(o => o.k));
  for (const s of SKILLS) {
    if (!optionKeys.has(s.k)) throw new Error(`Briefing shop is missing skill option: ${s.k}`);
  }
  for (const s of SKILLS) {
    if (!G.buyBriefShopSkill(s.k) || G.briefShopSkillBonus(shopIdx, s.k) !== 1) {
      throw new Error(`Briefing shop could not buy skill: ${s.k}`);
    }
  }
  G.money = 2;
  G.pendingSkillBonus = {};
  if (!G.buyBriefShopSkill('build') || G.money !== 1 || G.briefShopSkillBonus(shopIdx, 'build') !== 1) {
    throw new Error('Briefing shop did not buy a direct skill bonus');
  }
  if (!G.handleBriefShopInput({x:18,y:14}) || G.money !== 0 || G.briefShopSkillBonus(shopIdx, 'rope') !== 1) {
    throw new Error('Briefing shop click did not buy the selected skill bonus');
  }
  const baseBuild = (LEVELS[shopIdx].skills && LEVELS[shopIdx].skills.build) || 0;
  const baseRope = (LEVELS[shopIdx].skills && Object.prototype.hasOwnProperty.call(LEVELS[shopIdx].skills, 'rope')) ? LEVELS[shopIdx].skills.rope : 2;
  G.startLevel(shopIdx);
  if ((G.skills.build || 0) !== baseBuild + 1 || (G.skills.rope || 0) !== baseRope + 1) {
    throw new Error('Pending briefing shop bonuses were not applied when the level started');
  }
  if (G.briefShopSkillBonus(shopIdx, 'build') !== 0 || G.briefShopSkillBonus(shopIdx, 'rope') !== 0) {
    throw new Error('Briefing shop bonuses were not cleared after starting the level');
  }
  G.money = prevMoney;
  G.pendingSkillBonus = prevPendingSkillBonus;
  G.briefShopButtons = prevBriefButtons;
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
  const prevManual = G.manual;
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
  lem.state = 'SWIM';
  lem.swimRing = true;
  lem.climber = true;
  lem.x = 149;
  lem.y = 125;
  lem.dir = 1;
  lem.swim(G.T);
  if (G.cutsceneActive()) {
    throw new Error('Water climb cutscene restarted immediately for the same lemming and wall');
  }
  G.ropes = [];
  G.cutscene = null;
  const wallLem = new Lemming(149, 125);
  wallLem.state = 'WALK';
  wallLem.climber = true;
  wallLem.dir = 1;
  G.lems = [wallLem];
  wallLem.walk(G.T);
  if (wallLem.state !== 'CLIMB') {
    throw new Error('Regular climber lemming did not start climbing at a wall');
  }
  if (!G.cutsceneActive() || !G.cutscene || G.cutscene.id !== 'wall-climb-closeup') {
    throw new Error('Regular climbing transition did not start the wall climb cutscene');
  }
  if (!G.cutscene.spec || !G.cutscene.spec.event || G.cutscene.spec.event.fromWater !== false || G.cutscene.spec.event.themeKey !== 'desert') {
    throw new Error('Wall climb cutscene did not inherit dry wall material context');
  }
  if (G.cutscene.spec.event.night !== true || G.cutscene.spec.event.weatherKind !== 'snow') {
    throw new Error('Wall climb cutscene did not inherit night/weather context');
  }
  G.clearCutscene('verify-wall-climb-event');
  wallLem.state = 'WALK';
  wallLem.x = 149;
  wallLem.y = 125;
  wallLem.dir = 1;
  wallLem.walk(G.T);
  if (G.cutsceneActive()) {
    throw new Error('Wall climb cutscene restarted immediately for the same lemming and wall');
  }
  G.cutscene = null;
  G.manual = {used:true, active:true, lemId:wallLem.id, keys:{left:false,right:false,down:false,run:false,aim:false}};
  const manualWallLem = new Lemming(149, 125);
  manualWallLem.state = 'WALK';
  manualWallLem.climber = true;
  manualWallLem.dir = 1;
  G.manual.lemId = manualWallLem.id;
  G.lems = [manualWallLem];
  manualWallLem.walk(G.T);
  if (manualWallLem.state !== 'CLIMB' || G.cutsceneActive()) {
    throw new Error('Manual-controlled climber should climb without starting wall climb cutscene');
  }
  G.manual = {used:false, active:false, lemId:null, keys:{}};
  G.cutscene = null;
  const recentManualLem = new Lemming(149, 125);
  recentManualLem.state = 'WALK';
  recentManualLem.climber = true;
  recentManualLem.dir = 1;
  recentManualLem.skipClimbCutsceneT = 3;
  G.lems = [recentManualLem];
  recentManualLem.walk(G.T);
  if (recentManualLem.state !== 'CLIMB' || G.cutsceneActive()) {
    throw new Error('Recently manual-controlled climber should climb without starting wall climb cutscene');
  }
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
  G.manual = prevManual;
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
  G.T.setRect(99, 172, 5, 29, 1);
  if (!G.T.solid(110, 168)) throw new Error('Troll headroom fixture was not solid before clearing');
  if (!G.T.solid(100, 190)) throw new Error('Troll entry lip fixture was not solid before clearing');
  G.parts = [];
  G.clearTrollWallMouth(wallTroll);
  if (G.T.solid(100, 190) || G.T.solid(101, 188)) {
    throw new Error('Troll wall clearing left a blocking lip next to the troll');
  }
  if (G.T.solid(110, 168)) {
    throw new Error('Troll wall clearing left a low ceiling lip above the tunnel');
  }
  if (G.T.solid(110, 176)) {
    throw new Error('Troll wall clearing did not open the main tunnel');
  }
}
{
  G.startLevel(0);
  G.T.clearRect(0, 0, G.T.W, G.T.H);
  const stairTroll = {x:100, y:200, dir:1, scale:1};
  G.T.brick(108, 176, 16, 24, '#c8a050');
  if (!G.trollWallAhead(stairTroll)) throw new Error('Troll stair fixture was not detected as a wall');
  if (!G.trollWallHasStairs(stairTroll)) throw new Error('Troll stair fixture was not detected as stairs');
  if (G.startTrollWallRage(stairTroll)) {
    throw new Error('Troll started smashing a built stair');
  }
  if (!G.T.solid(112, 184) || !G.T.stairBox(112, 184, 2)) {
    throw new Error('Troll changed a built stair while checking wall rage');
  }
  stairTroll.rageT = 2;
  stairTroll.rageMax = 2;
  G.updateTrollWallRage(stairTroll);
  if (!G.T.solid(112, 184) || !G.T.stairBox(112, 184, 2)) {
    throw new Error('Troll wall rage cleared a built stair');
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
  const prevRocks = G.trollRocks;
  const prevSettled = G.settledTrollRocks;
  const prevSettledSeq = G.settledTrollRockSeq;
  const prevParts = G.parts;
  const prevMonkeys = G.monkeys;
  const prevPlanes = G.planes;
  const prevLiquidCache = G.liquidCache;
  const cleared = [];
  G.level = {W:300, hatch:{x:20,y:180}, water:[]};
  G.T = {
    W:300,H:240,
    solid:(x,y)=>y>=200,
    solidBox:(x,y,r)=>y+(r||0)>=200,
    stair:()=>false,
    stairBox:()=>false,
    clearDisc(x,y,r){cleared.push({x,y,r})}
  };
  G.trollRocks = [{x:120,y:194,vx:0,vy:4,g:0,life:10,spin:1,hit:false,scale:1}];
  G.settledTrollRocks = [];
  G.settledTrollRockSeq = 0;
  G.parts = [];
  G.monkeys = [];
  G.planes = [];
  G.liquidCache = null;
  G.updateTrollRocks();
  if (G.trollRocks.length !== 0 || G.settledTrollRocks.length !== 1) {
    throw new Error('Troll rock did not settle into regular ground');
  }
  if (cleared.length !== 0) {
    throw new Error('Settled troll rock should not carve a visible hole below itself');
  }
  if (!G.settledTrollRocks[0].settled || G.settledTrollRocks[0].groundY !== 199) {
    throw new Error('Settled troll rock did not store a stable surface');
  }
  if (!(G.settledTrollRocks[0].buriedPx > 0) || G.settledTrollRocks[0].y >= G.settledTrollRocks[0].groundY) {
    throw new Error('Settled troll rock was not marked as pressed into the ground');
  }
  G.level = prevLevel;
  G.T = prevTerrain;
  G.trollRocks = prevRocks;
  G.settledTrollRocks = prevSettled;
  G.settledTrollRockSeq = prevSettledSeq;
  G.parts = prevParts;
  G.monkeys = prevMonkeys;
  G.planes = prevPlanes;
  G.liquidCache = prevLiquidCache;
}
{
  const prevLevel = G.level;
  const prevTerrain = G.T;
  const prevRocks = G.trollRocks;
  const prevSettled = G.settledTrollRocks;
  const prevSettledSeq = G.settledTrollRockSeq;
  const prevParts = G.parts;
  const prevMonkeys = G.monkeys;
  const prevPlanes = G.planes;
  const prevLiquidCache = G.liquidCache;
  const cleared = [];
  G.level = {W:300, hatch:{x:20,y:180}, water:[]};
  G.T = {
    W:300,H:240,
    solid:(x,y)=>y>=200,
    solidBox:(x,y,r)=>y+(r||0)>=200,
    stair:()=>false,
    stairBox:()=>false,
    clearDisc(x,y,r){cleared.push({x,y,r})}
  };
  G.trollRocks = [{x:120,y:194,vx:0,vy:4,g:0,life:10,spin:1,hit:false,scale:1}];
  G.settledTrollRocks = [{id:5,x:126,y:197,groundY:199,scale:1,settled:true}];
  G.settledTrollRockSeq = 5;
  G.parts = [];
  G.monkeys = [];
  G.planes = [];
  G.liquidCache = null;
  G.updateTrollRocks();
  if (G.trollRocks.length !== 0 || G.settledTrollRocks.length !== 1) {
    throw new Error('Nearby troll rock landing should break without creating a second settled rock');
  }
  if (cleared.length !== 0) {
    throw new Error('Nearby troll rock landing should not make another terrain dent');
  }
  if (G.parts.length === 0) {
    throw new Error('Nearby troll rock landing should still create debris');
  }
  G.level = prevLevel;
  G.T = prevTerrain;
  G.trollRocks = prevRocks;
  G.settledTrollRocks = prevSettled;
  G.settledTrollRockSeq = prevSettledSeq;
  G.parts = prevParts;
  G.monkeys = prevMonkeys;
  G.planes = prevPlanes;
  G.liquidCache = prevLiquidCache;
}
{
  const prevLevel = G.level;
  const prevTerrain = G.T;
  const prevRocks = G.trollRocks;
  const prevSettled = G.settledTrollRocks;
  const prevSettledSeq = G.settledTrollRockSeq;
  const prevParts = G.parts;
  const prevMonkeys = G.monkeys;
  const prevPlanes = G.planes;
  G.level = {W:300, hatch:{x:20,y:180}, water:[]};
  G.T = {
    W:300,H:240,
    solid:(x,y)=>y>=200,
    solidBox:(x,y,r)=>y+(r||0)>=200,
    stair:()=>true,
    stairBox:()=>true,
    clearDisc(){throw new Error('Troll rock should not dent built stairs')}
  };
  G.trollRocks = [{x:120,y:194,vx:0,vy:4,g:0,life:10,spin:1,hit:false,scale:1}];
  G.settledTrollRocks = [];
  G.settledTrollRockSeq = 0;
  G.parts = [];
  G.monkeys = [];
  G.planes = [];
  G.updateTrollRocks();
  if (G.settledTrollRocks.length !== 0) {
    throw new Error('Troll rock settled on a stair');
  }
  G.level = prevLevel;
  G.T = prevTerrain;
  G.trollRocks = prevRocks;
  G.settledTrollRocks = prevSettled;
  G.settledTrollRockSeq = prevSettledSeq;
  G.parts = prevParts;
  G.monkeys = prevMonkeys;
  G.planes = prevPlanes;
}
{
  const prevLevel = G.level;
  const prevTerrain = G.T;
  const prevLems = G.lems;
  const prevRopes = G.ropes;
  const prevSettled = G.settledTrollRocks;
  G.level = {W:300, hatch:{x:20,y:180}, water:[], exit:{x:280,y:199}};
  G.T = {
    W:300,H:240,
    solid:(x,y)=>y>=200,
    solidBox:(x,y,r)=>y+(r||0)>=200,
    stairBox:()=>false
  };
  G.ropes = [];
  const lem = new Lemming(112,199);
  lem.state = 'WALK';
  lem.dir = 1;
  G.lems = [lem];
  G.settledTrollRocks = [{id:7,x:118,y:197,groundY:199,scale:1,settled:true}];
  lem.update(G.T);
  if (lem.state !== 'VAULT') throw new Error('Lemming did not start vaulting over a settled troll rock');
  let vaultGuard = 0;
  while (lem.state === 'VAULT' && vaultGuard++ < 30) lem.update(G.T);
  if (lem.state !== 'WALK' || lem.x <= 124) {
    throw new Error('Lemming did not finish past the settled troll rock');
  }
  if (lem.x > 126) {
    throw new Error('Lemming vault lands too far past the settled troll rock');
  }
  G.level = prevLevel;
  G.T = prevTerrain;
  G.lems = prevLems;
  G.ropes = prevRopes;
  G.settledTrollRocks = prevSettled;
}
{
  const prevLevel = G.level;
  const prevTerrain = G.T;
  const prevMonkeys = G.monkeys;
  const prevBananas = G.bananas;
  const prevParts = G.parts;
  const prevMonkeyEvents = G.monkeyEvents;
  const prevMonkeyMax = G.monkeyMax;
  const prevBananaExplode = G.bananaExplode;
  const prevLiquidCache = G.liquidCache;
  let exploded = false;
  G.level = {W:240, hatch:{x:20,y:180}, water:[{x:80,w:70,y:120,lava:false}]};
  G.T = {W:240, H:240, solid(){return false}, solidBox(){return false}};
  G.monkeys = [];
  G.monkeyEvents = 0;
  G.monkeyMax = 0;
  G.parts = [];
  G.bananaExplode = () => { exploded = true; };
  G.bananas = [{x:110, y:118, vx:0, vy:3, g:0, life:10, spin:0, hit:false}];
  G.updateMonkeyEvents();
  if (exploded || G.bananas.length !== 0 || !G.parts.some(p => p && p.water)) {
    throw new Error('Banana thrown into open water should splash without exploding');
  }
  exploded = false;
  G.parts = [];
  G.T = {W:240, H:240, solid(){return true}, solidBox(){return true}};
  G.bananas = [{x:110, y:118, vx:0, vy:3, g:0, life:10, spin:0, hit:false}];
  G.updateMonkeyEvents();
  if (!exploded) {
    throw new Error('Banana should still explode when water is hidden behind solid terrain');
  }
  G.level = prevLevel;
  G.T = prevTerrain;
  G.monkeys = prevMonkeys;
  G.bananas = prevBananas;
  G.parts = prevParts;
  G.monkeyEvents = prevMonkeyEvents;
  G.monkeyMax = prevMonkeyMax;
  G.bananaExplode = prevBananaExplode;
  G.liquidCache = prevLiquidCache;
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
  const prevSunSurprise = G.sunSurpriseT;
  G.level = {W:320, hatch:{x:20,y:180}, water:[]};
  G.T = {W:320, H:240, solid:(x,y)=>y>=210, solidBox:(x,y,r)=>y+(r||0)>=210};
  G.planes = [{x:150,y:42,vx:1.4,targetX:190,kind:'skill',skill:'baz',dropped:false}];
  G.packages = [];
  G.trollRocks = [];
  G.parts = [];
  G.flashes = [];
  G.toasts = [];
  G.rand = () => 0.35;
  G.sunSurpriseT = 0;
  const troll = {x:100,y:200,scale:2,dir:1,rockT:1,chewT:0,rageT:0};
  if (!G.pickSupplyPlaneForTroll(troll)) throw new Error('Giant troll did not target supply plane');
  if (!G.tryTrollThrowAtMonkey(troll) || !G.trollRocks[0] || G.trollRocks[0].scale !== 2) {
    throw new Error('Giant troll did not throw a scaled rock at supply plane');
  }
  const plane = G.planes[0];
  if (!G.damageSupplyPlane(plane, plane.x, plane.y) || !plane.crashing) {
    throw new Error('Supply plane did not enter crashing state');
  }
  if (G.sunSurpriseT !== Math.round(2000 / TICK)) {
    throw new Error('Supply plane crash did not trigger the sun surprise timer');
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
  G.sunSurpriseT = prevSunSurprise;
}
{
  const caveIdx = LEVELS.findIndex(L => L && L.cave);
  if (caveIdx < 0) throw new Error('Missing cave level fixture');
  G.startLevel(caveIdx);
  if (G.canUseSupplyPlanes() || G.supplyMax !== 0 || G.supplyMegaPlanned) {
    throw new Error('Cave levels should disable supply planes');
  }
  G.planes = [];
  G.monkeys = [];
  if (G.spawnSupplyPlane(null, 120) || G.planes.length !== 0) {
    throw new Error('Supply plane spawned in a cave level');
  }
  if (G.scheduleSupplyDrop(false) || G.canStartDirectedEvent('supplyPlane')) {
    throw new Error('Supply plane event was allowed in a cave level');
  }
  if (G.queueDirectedEvent('supplyPlane', 5, {}, true)) {
    throw new Error('Forced supply plane event was allowed in a cave level');
  }
  G.planes = [{x: 80, y: 30, vx: 1, targetX: 120, kind: 'skill', skill: 'build', dropped: false}];
  G.queuedEvents = [{kind: 'supplyPlane', t: 20, data: {}}, {kind: 'treeGrow', t: 20, data: {x: 120, baseY: 200}}];
  G.warnings = [{kind: 'supplyPlane', t: 20}, {kind: 'treeGrow', t: 20}];
  G.updateSupplyDrops();
  if (G.planes.length !== 0 || G.queuedEvents.some(e => e.kind === 'supplyPlane') || G.warnings.some(w => w.kind === 'supplyPlane')) {
    throw new Error('Cave supply plane cleanup failed');
  }
  G.spawnMonkey({dir: 1, y: 58});
  if (G.monkeys.length !== 0) {
    throw new Error('Monkey spawned in a cave level');
  }
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

function firstSolidBelow(T, x, y, maxDy) {
  x = Math.round(x); y = Math.round(y);
  for (let dy = 1; dy <= maxDy; dy++) {
    const yy = y + dy;
    if (yy >= T.H) break;
    if (T.solid(x, yy)) return dy;
  }
  return Infinity;
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
  for (const rescue of G.rescues || []) {
    const cageDrop = firstSolidBelow(G.T, rescue.releaseX, rescue.releaseY, 90);
    if (cageDrop < 16) {
      throw new Error(`${L.name}: rescue cage at ${rescue.releaseX},${rescue.releaseY} should hang above the floor`);
    }
    if (!Number.isFinite(cageDrop)) {
      throw new Error(`${L.name}: rescue cage at ${rescue.releaseX},${rescue.releaseY} has no nearby landing`);
    }
    if (!Number.isFinite(firstSolidBelow(G.T, rescue.buttonX, rescue.buttonY, 12))) {
      throw new Error(`${L.name}: rescue button at ${rescue.buttonX},${rescue.buttonY} is not grounded`);
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
for (const state of ['TITLE','MENU','BRIEF','RESULT']) {
  G.state = state;
  if (G.makeSaveState('VERIFY UNSAVEABLE')) {
    throw new Error(`Save-state should not be created while state=${state}`);
  }
}
G.state = 'PLAY';
G.paused = true;
const pausedState = G.makeSaveState('VERIFY PAUSED');
if (!pausedState || pausedState.fields.paused !== false) {
  throw new Error('Save-state should restore as unpaused');
}
G.paused = false;
const manualSaveLem = new Lemming(120, 120);
manualSaveLem.state = 'MANUAL';
G.lems = [manualSaveLem];
G.manual = {used:true, active:true, lemId:manualSaveLem.id, lampOn:true, keys:{left:true,right:true,down:true,run:true,aim:true}, jumpQueued:{super:true}, aimAngle:0.25};
const manualState = G.makeSaveState('VERIFY MANUAL');
if (!manualState || !manualState.fields.manual || manualState.fields.manual.jumpQueued || Object.values(manualState.fields.manual.keys || {}).some(Boolean)) {
  throw new Error('Save-state should clear transient manual input');
}
if (!G.restoreSaveState(savedState)) throw new Error('Restore after manual save-state verification failed');
G.playCutscene({id:'verify-save-block-cutscene',respectPrefs:false,shots:[{duration:8,text:'SAVE BLOCK'}]});
if (G.makeSaveState('VERIFY CUTSCENE')) {
  throw new Error('Save-state should not be created while a cutscene is active');
}
G.clearCutscene('verify-save-block');
G.waterfallCave = {active:true};
if (G.makeSaveState('VERIFY CAVE')) {
  throw new Error('Save-state should not be created while the waterfall cave is active');
}
G.waterfallCave = null;
G.playCutscene({id:'verify-restore-clears-cutscene',respectPrefs:false,shots:[{duration:8,text:'RESTORE'}]});
G.waterfallCave = {active:true};
G.waterfallCaveExitNeedsUpRelease = true;
G.state = 'MENU';
if (!G.restoreSaveState(savedState) || G.cutsceneActive() || G.waterfallCaveActive() || G.waterfallCaveExitNeedsUpRelease || G.state !== 'PLAY') {
  throw new Error('Restore-state should clear transient overlays and return to play');
}
{
  const prevStorage = sandbox.window.localStorage;
  const prevPrompt = sandbox.window.prompt;
  const prevInit = AU.init;
  const store = {
    'lemmel.save.v20': JSON.stringify({savedStates:[savedState]})
  };
  sandbox.window.localStorage = {
    getItem(k){return Object.prototype.hasOwnProperty.call(store,k)?store[k]:null},
    setItem(k,v){store[k]=String(v)},
    removeItem(k){delete store[k]}
  };
  sandbox.window.prompt = () => '1';
  AU.init = () => {};
  try {
    G.state = 'MENU';
    G.level = null;
    G.T = null;
    if (!G.promptLoadGame() || G.state !== 'PLAY' || !G.T || G.levelIdx !== savedState.levelIdx) {
      throw new Error('Prompt load did not restore a saved game from the menu state');
    }
  } finally {
    sandbox.window.localStorage = prevStorage;
    sandbox.window.prompt = prevPrompt;
    AU.init = prevInit;
  }
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

{
  const prevLevel = G.level;
  const prevTerrain = G.T;
  const prevLems = G.lems;
  const prevRockets = G.rockets;
  const prevParts = G.parts;
  const prevManual = G.manual;
  const prevTrees = G.trees;
  const prevDecor = G.decor;
  const cleared = [];
  const T = {
    W: 320, H: 240,
    solid(x, y){ return y >= 200 },
    solidBox(){ return false },
    clearDisc(x, y, r){ cleared.push({x, y, r}) },
    clearRect(){}
  };
  G.level = {W:320, hatch:{x:20,y:180}, water:[]};
  G.T = T;
  G.lems = [];
  G.rockets = [];
  G.parts = [];
  G.trees = [];
  G.decor = [];
  G.manual = {used:false, active:false, lemId:null, keys:{left:false,right:false,down:false,run:false,aim:false}, aimAngle:0};

  const bazLem = new Lemming(160, 199);
  bazLem.state = 'WALK';
  bazLem.dir = -1;
  G.lems = [bazLem];
  if (!G.applySkill(bazLem, 'baz', bazLem.x + 80, bazLem.y - 10)) {
    throw new Error('Bazooka skill could not be applied to direction test lemming');
  }
  for (let i = 0; i < 4; i++) bazLem.update(T);
  if (bazLem.dir !== -1 || !G.rockets[0] || G.rockets[0].vx >= 0) {
    throw new Error('Regular bazooka should fire in the lemming walking direction');
  }

  const flameLem = new Lemming(160, 199);
  flameLem.state = 'WALK';
  flameLem.dir = 1;
  G.lems = [flameLem];
  if (!G.applySkill(flameLem, 'flame', flameLem.x - 80, flameLem.y - 10)) {
    throw new Error('Flamethrower skill could not be applied to direction test lemming');
  }
  flameLem.update(T);
  flameLem.update(T);
  if (flameLem.dir !== 1 || !cleared.length || cleared.some(p => p.x <= flameLem.x)) {
    throw new Error('Regular flamethrower should fire in the lemming walking direction');
  }

  const manualLem = new Lemming(160, 199);
  manualLem.state = 'MANUAL';
  manualLem.dir = 1;
  G.lems = [manualLem];
  G.manual = {used:true, active:true, lemId:manualLem.id, keys:{left:false,right:false,down:false,run:false,aim:true}, aimAngle:Math.PI};
  if (!G.applySkill(manualLem, 'baz', manualLem.x + 80, manualLem.y - 10) || manualLem.dir !== -1 || !Number.isFinite(manualLem.manualAimAngle)) {
    throw new Error('Manual bazooka aim should still control firing direction');
  }

  G.level = prevLevel;
  G.T = prevTerrain;
  G.lems = prevLems;
  G.rockets = prevRockets;
  G.parts = prevParts;
  G.manual = prevManual;
  G.trees = prevTrees;
  G.decor = prevDecor;
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
warmLem.state = 'WALK';
warmLem.busyT = 0;
G.level.water = [{x: 40, y: 210, w: 60, lava: true}];
G.decor = [{t: 'torch', x: 102, y: 178}];
G.rand = () => 0.0;
if (G.canWarmAtTorch(warmLem)) {
  throw new Error('Lemmings should not be able to freeze on lava levels');
}
G.updateTorchWarmEffects();
G.rand = oldRand;
if (warmLem.state === 'WARM') {
  throw new Error('Torch warming started on a lava level');
}

console.log(`verify-game ok: ${LEVELS.length} levels, ${scripts.length} scripts`);
