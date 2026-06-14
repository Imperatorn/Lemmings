// ------------------------------ UTIL --------------------------------
const CW=480, CH=300, VW=480, VH=240, HUDY=240;
const TEMPO_CFG=[
  {name:'LÅNGSAMT',speed:0.75},
  {name:'NORMALT',speed:1.00},
  {name:'SNABBT',speed:1.25}
];
const TICK=62;            // ms per logik-steg (~16 fps, "chunkig" retrokänsla)
const SPLAT_FALL=62;      // fallhöjd i pixlar som dödar
const SILLY_JUMP_TICKS=Math.round(5000/TICK); // slump-hopp varar cirka 5 sekunder
const DOLPHIN_RESCUE_CHANCE=0.15; // chans att en lemmel räddas ur vatten av en delfin
const FISH_RING_CHANCE=0.20; // chans att en nara fisk ger en lemmel en badring i vatten
const MEGA_MIN_PROGRESS=0.90; // !-paketet får tidigast komma när 90% av bantiden gått
const MAX_PARTICLES=900;      // mjukt prestandaskydd mot partikelstormar
const MAX_FLASHES=72;         // skydd om många explosioner råkar staplas
const BUILD_STEP_TICKS=6;     // byggare/nedbyggare lagger plattor ca 33% snabbare an tidigare 8 tick
const BUILD_MAX_BRICKS=12;    // antal plattor innan byggaren slutar och rycker pa axlarna
const BUILD_BRICK_W=9, BUILD_BRICK_H=2, BUILD_ADVANCE_X=4, BUILD_STEP_Y=2;
const TROLL_RAGE_TICKS=Math.round(3000/TICK); // trollet slar sonder en vagg i cirka 3 sekunder
const TROLL_EVENT_SLOWDOWN=1.15, TROLL_LIFE_SCALE=0.94;
const FLAME_TICKS=24, FLAME_RANGE=58;
const MUMMY_SCARE_CHANCE=0.10;
const FAINT_MIN_TICKS=Math.round(3000/TICK), FAINT_MAX_TICKS=Math.round(5000/TICK);
const TORCH_WARM_CHANCE=0.10, TORCH_WARM_TICKS=Math.round(5000/TICK);
const MUSHROOM_EAT_CHANCE=0.33, LEM_GIANT_SCALE=2;
const WEATHER_CFG={
  sun:{name:'SOLSKEN',short:'SOL',hud:'#ffd860'},
  rain:{name:'REGN',short:'REGN',hud:'#80b8ff'},
  snow:{name:'SNÖ',short:'SNÖ',hud:'#d8f0ff'},
  cave:{name:'DROPP',short:'DROPP',hud:'#a8b8c8'}
};
const MODE_CFG={
  classic:{name:'KLASSISKT',eventCooldown:Math.round(8500/TICK),supplyWarn:Math.round(1900/TICK),treeWarn:Math.round(2500/TICK),monkeyWarn:Math.round(2200/TICK),trollWarn:Math.round(2100/TICK),jumpWarn:Math.round(1200/TICK),megaWarn:Math.round(2600/TICK),
    supplyFirstMin:14,supplyFirstRange:12,supplyGapMin:54,supplyGapRange:36,supplyMaxMin:1,supplyMaxCap:3,megaPlanChance:0.22,megaChance:0.08,treeChance:0.20,monkeyCap:1,trollCap:1,treeCap:1,jumpCap:1},
  chaos:{name:'KAOS',eventCooldown:Math.round(4200/TICK),supplyWarn:Math.round(1700/TICK),treeWarn:Math.round(2200/TICK),monkeyWarn:Math.round(1900/TICK),trollWarn:Math.round(1900/TICK),jumpWarn:Math.round(950/TICK),megaWarn:Math.round(2600/TICK),
    supplyFirstMin:8,supplyFirstRange:8,supplyGapMin:34,supplyGapRange:28,supplyMaxMin:3,supplyMaxCap:6,megaPlanChance:0.50,megaChance:0.22,treeChance:0.47,monkeyCap:4,trollCap:3,treeCap:3,jumpCap:4}
};
const cvs=document.getElementById('cv');
const ctx=cvs.getContext('2d');
ctx.imageSmoothingEnabled=false;
// Världen renderas först i ett eget 480x240-lager. Det gör att zoom och
// panorering kan läggas ovanpå utan att röra HUD, menyer och befintlig pixelart.
const WORLD_CV=document.createElement('canvas');
WORLD_CV.width=VW;WORLD_CV.height=VH;
const WCTX=WORLD_CV.getContext('2d');
WCTX.imageSmoothingEnabled=false;

function clamp(v,a,b){return v<a?a:(v>b?b:v)}
function rndSeed(s){return function(){s|=0;s=(s+0x6D2B79F5)|0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function hash2(x,y){let h=(x*374761393+y*668265263)|0;h=(h^(h>>13))*1274126177|0;return ((h^(h>>16))>>>0)/4294967296}
const RND=rndSeed(1337);
const SAVE_KEY='lemmel.save.v20';
let GAME_ERROR=null;

function hashString(s){
  let h=2166136261>>>0;
  s=String(s==null?'':s);
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}
  return h>>>0;
}
function urlSeedValue(){
  try{
    const q=(window.location&&window.location.search)||'';
    const m=q.match(/[?&]seed=([^&]+)/i);
    return m?decodeURIComponent(m[1].replace(/\+/g,' ')):null;
  }catch(_){return null}
}
function loadPersisted(){
  try{
    const raw=window.localStorage&&window.localStorage.getItem(SAVE_KEY);
    return raw?JSON.parse(raw):{};
  }catch(_){return {}}
}
function savePersisted(data){
  try{ if(window.localStorage)window.localStorage.setItem(SAVE_KEY,JSON.stringify(data)); }catch(_){}
}
function jsonClone(v){return v==null?v:JSON.parse(JSON.stringify(v))}
function encodeMask(mask){
  if(!mask||!mask.length)return '';
  const out=[];let v=mask[0]?1:0,n=1;
  for(let i=1;i<mask.length;i++){
    const nv=mask[i]?1:0;
    if(nv===v)n++;
    else{out.push(n.toString(36)+(v?'b':'a'));v=nv;n=1}
  }
  out.push(n.toString(36)+(v?'b':'a'));
  return out.join(',');
}
function decodeMask(s,len){
  const mask=new Uint8Array(len||0);
  if(!s)return mask;
  let p=0;
  for(const tok of String(s).split(',')){
    if(!tok)continue;
    const v=tok[tok.length-1]==='b'?1:0;
    const n=parseInt(tok.slice(0,-1),36)||0;
    for(let i=0;i<n&&p<mask.length;i++)mask[p++]=v;
  }
  return mask;
}
function saveGameSlots(){
  const p=loadPersisted();
  return Array.isArray(p.savedStates)?p.savedStates:[];
}
function writeGameSlots(slots){
  const p=loadPersisted();
  p.savedStates=(slots||[]).slice(0,5);
  try{
    if(window.localStorage)window.localStorage.setItem(SAVE_KEY,JSON.stringify(p));
    return true;
  }catch(_){return false}
}
function reportGameError(msg,err){
  GAME_ERROR={msg:String(msg||'Okänt fel'),stack:String((err&&err.stack)||err||'').slice(0,260),t:Date.now?Date.now():0};
  try{ console.error('LEMMEL runtime error:',msg,err); }catch(_){}
}
window.addEventListener('error',e=>reportGameError(e&&e.message,e&&e.error));
window.addEventListener('unhandledrejection',e=>reportGameError('Promise-fel',e&&e.reason));
