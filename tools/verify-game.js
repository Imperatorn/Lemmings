const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'LEMMEL_fixed_v44.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);

if (scripts.length === 0) throw new Error('No script tags found in LEMMEL_fixed_v44.html');

const runtimeScripts = ['js/07_game.js','js/07_save_state.js','js/07_manual_control.js','js/07_living_world.js'];
for (let i = 0; i < runtimeScripts.length; i++) {
  const idx = scripts.indexOf(runtimeScripts[i]);
  if (idx < 0) throw new Error(`Missing script tag: ${runtimeScripts[i]}`);
  if (i > 0 && idx <= scripts.indexOf(runtimeScripts[i - 1])) {
    throw new Error(`Script order is wrong around ${runtimeScripts[i]}`);
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
  'globalThis.__verify={G,LEVELS,THEMES,AU,SKILLS,drawPlayWorld,drawMenu,WCTX,menuChapters};',
  sandbox,
  {timeout:10000}
);

const {G, LEVELS, THEMES, AU, SKILLS, drawPlayWorld, drawMenu, WCTX, menuChapters} = sandbox.__verify;

if (!Array.isArray(LEVELS) || LEVELS.length === 0) throw new Error('LEVELS is empty');
if (!Array.isArray(SKILLS) || SKILLS.length === 0) throw new Error('SKILLS is empty');

const requiredRuntimeMethods = [
  'makeSaveState','restoreSaveState','promptSaveGame','promptLoadGame',
  'setMusicVolume','setSfxVolume',
  'ropeAnchorIntact','detachRope','pruneDetachedRopes',
  'isManualActive','startManualControl','stopManualControl','manualAimFor','releaseManualForSkill',
  'updateDolphins','updateMeteors','updateMushroomEatingEffects','updateMummyScareEffects',
  'updateRandomJumpEvents','updateLemmingChatter','updateWaterfallHeadSplashes'
];
for (const name of requiredRuntimeMethods) {
  if (typeof G[name] !== 'function') throw new Error(`Missing G method after script split: ${name}`);
}
for (const name of ['setMusicVolume','setSfxVolume','applyVolumes']) {
  if (typeof AU[name] !== 'function') throw new Error(`Missing AU volume method: ${name}`);
}
if (!AU.PAT || !AU.PAT.menu || !Array.isArray(AU.PAT.menu.mel) || !Array.isArray(AU.PAT.menu.bass)) {
  throw new Error('Missing menu music pattern');
}
G.setMusicVolume(0.42);
G.setSfxVolume(0.37);
if (Math.abs(AU.musicVol - 0.42) > 0.001 || Math.abs(AU.sfxVol - 0.37) > 0.001) {
  throw new Error('Audio volume setters failed');
}
G.state = 'MENU';
drawMenu(WCTX, 1);
if (!G.menuSettings || !G.menuSettings.musicVol || !G.menuSettings.sfxVol) {
  throw new Error('Menu volume controls were not created');
}

const levelNames = new Set();
for (let idx = 0; idx < LEVELS.length; idx++) {
  const L = LEVELS[idx];
  if (levelNames.has(L.name)) throw new Error(`Duplicate level name: ${L.name}`);
  levelNames.add(L.name);
  if (!THEMES[L.theme]) throw new Error(`${L.name}: missing theme ${L.theme}`);

  G.startLevel(idx);
  const musicKind = G.musicKindForLevel(idx);
  if (!AU.PAT[musicKind]) throw new Error(`${L.name}: missing music pattern ${musicKind}`);
  if (!G.T || G.T.W !== L.W) throw new Error(`${L.name}: terrain was not built`);

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

console.log(`verify-game ok: ${LEVELS.length} levels, ${scripts.length} scripts`);
