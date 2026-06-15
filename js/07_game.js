// -------------------------- SPELMOTOR -------------------------------
const SKILLS=[
  {k:'climb', name:'KLÄTTRARE'},
  {k:'float', name:'FALLSKÄRM'},
  {k:'bomb',  name:'BOMBARE'},
  {k:'block', name:'BLOCKERARE'},
  {k:'build', name:'BYGG UPP'},
  {k:'downbuild', name:'BYGG NED'},
  {k:'bash',  name:'HACKARE'},
  {k:'mine',  name:'TUNNELGRÄVARE'},
  {k:'dig',   name:'GRÄVARE'},
  {k:'baz',   name:'BAZOOKA'},
  {k:'jet',   name:'JETPACK'},
  {k:'flame', name:'ELDKASTARE'},
  {k:'rope',  name:'REPKROK'}
];

const MENU_CHAPTER_NAMES=['BÖRJAN','FARORNA','VÄRLDAR'];
function menuChapters(){
  const n=LEVELS.length, size=Math.ceil(n/3), out=[];
  for(let i=0;i<3;i++){
    const from=i*size, to=Math.min(n,(i+1)*size);
    out.push({name:MENU_CHAPTER_NAMES[i]||('KAPITEL '+(i+1)),from,to});
  }
  return out;
}
function menuChapterForLevel(idx){
  const ch=menuChapters();
  for(let i=0;i<ch.length;i++)if(idx>=ch[i].from&&idx<ch[i].to)return i;
  return 0;
}

function createLevelBuildApi(T){
  return {
    rect:(x,y,w,h)=>T.setRect(x,y,w,h,1),
    disc:(x,y,r)=>T.setDisc(x,y,r,1),
    ramp:(x,y,w,h,d)=>T.setRamp(x,y,w,h,d,1),
    erase:{
      rect:(x,y,w,h)=>T.setRect(x,y,w,h,0),
      disc:(x,y,r)=>T.setDisc(x,y,r,0)
    }
  };
}

function createLevelDecorApi(game){
  const add=d=>{
    if(game&&game.decorLiquidSpawnBlocked&&game.decorLiquidSpawnBlocked(d))return null;
    game.decor.push(d);
    return d;
  };
  return {
    torch:(x,y)=>add({t:'torch',x,y,vy:0}),
    tree:(x,y,s)=>add({t:'tree',x,y,s}),
    bush:(x,y)=>add({t:'bush',x,y,v:RND()}),
    mush:(x,y)=>add({t:'mush',x,y,v:RND()}),
    crystal:(x,y)=>add({t:'crystal',x,y,v:RND()}),
    chain:(x,y)=>add({t:'chain',x,y}),
    stal:(x,y,h,up)=>add({t:'stal',x,y,h:h||18,up:up!==false}),
    root:(x,y,w,h)=>add({t:'root',x,y,w:w||120,h:h||38,v:RND()}),
    target:(x,y)=>add({t:'target',x,y,v:RND()}),
    rail:(x,y,w)=>add({t:'rail',x,y,w:w||90,v:RND()}),
    waterfall:(x,y,h,w)=>add({t:'waterfall',x,y,h:h||130,w:w||28,v:RND()}),
    cactus:(x,y,s)=>add({t:'cactus',x,y,s:s||1,v:RND()}),
    rock:(x,y,s)=>add({t:'rock',x,y,s:s||1,v:RND()}),
    pyramid:(x,y,s)=>add({t:'pyramid',x,y,s:s||1,v:RND()}),
    mummy:(x,y,w,speed)=>add({t:'mummy',x,y,w:w||120,speed:speed||0.13,v:RND()}),
    cityscape:(x,y,w,h)=>add({t:'cityscape',x,y,w:w||180,h:h||95,v:RND()}),
    subway:(x,y,w)=>add({t:'subway',x,y,w:w||170,v:RND()}),
    road:(x,y,w)=>add({t:'road',x,y,w:w||220,v:RND()}),
    bus:(x,y,dir)=>add({t:'bus',x,y,dir:dir||1,v:RND()}),
    taxi:(x,y,w,dir,speed)=>add({t:'taxi',x,y,w:w||220,dir:dir||1,speed:speed||0.55,v:RND()}),
    streetlamp:(x,y)=>add({t:'streetlamp',x,y,v:RND()}),
    sign:(x,y,text)=>add({t:'sign',x,y,text:text||'',v:RND()}),
    marker:(x,y,text)=>add({t:'marker',x,y,text:text||'',v:RND()})
  };
}

const G={
  state:'TITLE', levelIdx:0, level:null, T:null,
  lems:[], parts:[], glows:[], rockets:[], hooks:[], ropes:[], planes:[], packages:[], monkeys:[], bananas:[], trolls:[], trollRocks:[], settledTrollRocks:[], trees:[], dolphins:[], flashes:[], decor:[], rescues:[], fireflies:[], meteors:[], caveDrips:[], ambientBugs:[], ambientFish:[], ambientGrass:[], warnings:[], queuedEvents:[],
  cam:0, out:0, saved:0, spawned:0, rate:50, spawnT:0, doorT:0,
  timeT:0, levelTimeT:0, selSkill:'build', paused:false, trollUsed:false, mode:'chaos', tempoIdx:1, cutscenesOn:true,
  lamp:null, cleared:new Array(LEVELS.length).fill(false), money:0, pendingSkillBonus:{}, waterfallCaveLooted:{},
  mx:240, my:150, mDown:false, hoverLem:null, hoverBtn:-1, endT:0, menuChapter:0,
  msg:'', msgT:0, toasts:[], showHelp:false, titleLems:[], supplyT:0, supplyDrops:0, supplyMax:0, supplyLastX:null, supplyRecentXs:[], supplyMegaDropped:false, supplyMegaPlanned:false, supplyMegaForceAt:0, supplyLateMegaScheduled:false,
  monkeyT:0, monkeyEvents:0, monkeyMax:0, monkeyLastX:null, monkeySeq:0, monkeyAirSupportPending:false, monkeyAirSupportTargetX:null,
  trollT:0, trollEvents:0, trollMax:0, trollLastX:null,
  treeT:0, treeEvents:0, treeMax:0, treeLastX:null,
  jumpT:0, jumpEvents:0, jumpMax:0, megaBoom:null, megaArmed:null, eventLockT:0, shakeT:0, shakePow:0,
  weatherKind:'sun', weatherT:0, thunderT:0, thunderFlash:0, thunderX:0, thunderPath:null, sunSurpriseT:0,
  levelSeed:0, levelRng:null, playCount:0, ropeAim:null, ropeSeq:1, settledTrollRockSeq:0, lemTalkT:0,
  manual:{used:false,active:false,lemId:null,lampOn:false,keys:{left:false,right:false,down:false,run:false,aim:false},jumpQueued:null,aimAngle:0},
  viewZoom:1, viewY:0, zoomLevels:[1,1.35,1.7,2.1],

  viewW(){return VW/(this.viewZoom||1)},
  viewH(){return VH/(this.viewZoom||1)},
  maxCamFor(L){return Math.max(0,((L&&L.W)||VW)-this.viewW())},
  maxCam(){return this.maxCamFor(this.level)},
  maxViewY(){return Math.max(0,VH-this.viewH())},
  clampView(){
    this.viewZoom=clamp(this.viewZoom||1,1,2.1);
    this.cam=clamp(this.cam||0,0,this.maxCam());
    this.viewY=this.viewZoom<=1.001?0:clamp(this.viewY||0,0,this.maxViewY());
  },
  viewCenterX(){return (this.cam||0)+this.viewW()/2},
  screenToWorld(p){
    const z=this.viewZoom||1;
    if(!this.level||p.y>=VH)return {x:(this.cam||0)+p.x,y:p.y};
    return {x:clamp((this.cam||0)+p.x/z,0,this.level.W-1),y:clamp((this.viewY||0)+p.y/z,0,VH-1)};
  },
  screenToLayer(p){
    const z=this.viewZoom||1;
    return {x:clamp(p.x/z,0,VW),y:clamp((this.viewY||0)+p.y/z,0,VH)};
  },
  panViewByScreenDelta(dx,dy){
    if(!this.level)return;
    const z=this.viewZoom||1;
    this.cam-=dx/z;
    this.viewY-=dy/z;
    this.clampView();
  },
  setZoom(z,anchor,quiet){
    if(!this.level)return;
    const oldZ=this.viewZoom||1;
    const ax=anchor?clamp(anchor.x,0,VW):VW/2;
    const ay=anchor?clamp(anchor.y,0,VH):VH/2;
    const worldX=(this.cam||0)+ax/oldZ;
    const worldY=(this.viewY||0)+ay/oldZ;
    this.viewZoom=clamp(z,1,2.1);
    const nz=this.viewZoom||1;
    this.cam=worldX-ax/nz;
    this.viewY=worldY-ay/nz;
    this.clampView();
    if(!quiet)this.toast('ZOOM '+Math.round(this.viewZoom*100)+'%');
  },
  zoomStep(dir,anchor){
    if(!this.level)return;
    const levels=this.zoomLevels||[1,1.35,1.7,2.1];
    let best=0,bd=Infinity;
    for(let i=0;i<levels.length;i++){const d=Math.abs(levels[i]-(this.viewZoom||1));if(d<bd){bd=d;best=i}}
    const ni=clamp(best+(dir>0?1:-1),0,levels.length-1);
    this.setZoom(levels[ni],anchor,false);
  },
  resetZoom(){if(!this.level)return;this.setZoom(1,{x:VW/2,y:VH/2},true);this.viewY=0;this.clampView();this.toast('ZOOM ÅTERSTÄLLD')},

  chaosConfig(){return MODE_CFG[this.mode]||MODE_CFG.chaos},
  modeName(){return this.chaosConfig().name},
  tempoConfig(){return TEMPO_CFG[clamp(this.tempoIdx|0,0,TEMPO_CFG.length-1)]||TEMPO_CFG[1]},
  tempoName(){return this.tempoConfig().name},
  tempoTickMs(){return TICK/Math.max(0.25,this.tempoConfig().speed||1)},
  adjustTempo(dir){
    if(this.state==='PLAY'){this.toast('TEMPO ÄNDRAS FÖRE BANA');AU.sShrug();return false}
    const old=this.tempoIdx|0;
    this.tempoIdx=clamp(old+(dir>0?1:-1),0,TEMPO_CFG.length-1);
    if(this.tempoIdx===old){AU.sShrug();this.toast('TEMPO: '+this.tempoName());return false}
    this.savePrefs();AU.sClick();this.toast('TEMPO: '+this.tempoName());return true;
  },
  weatherName(){return (WEATHER_CFG[this.weatherKind]&&WEATHER_CFG[this.weatherKind].name)||'VÄDER'},
  weatherShort(){return (WEATHER_CFG[this.weatherKind]&&WEATHER_CFG[this.weatherKind].short)||'VÄDER'},
  rand(){ if(!this.levelRng)this.levelRng=rndSeed(this.levelSeed||1337); return this.levelRng(); },
  pickWeather(){
    const L=this.level||{};
    const r=this.rand();
    if(L.cave)return 'cave';
    if(L.night)return r<0.68?'rain':'snow';
    if(L.theme==='desert')return r<0.88?'sun':'rain';
    if(L.theme==='city')return r<0.50?'sun':(r<0.88?'rain':'snow');
    if(L.theme==='crystal'||L.theme==='glass')return r<0.48?'snow':(r<0.70?'rain':'sun');
    if(L.theme==='forest')return r<0.50?'rain':(r<0.68?'snow':'sun');
    if(L.theme==='hell')return r<0.68?'sun':(r<0.88?'rain':'snow');
    if(L.theme==='marble')return r<0.46?'sun':(r<0.72?'snow':'rain');
    if(L.theme==='rock')return r<0.52?'sun':(r<0.78?'rain':'snow');
    return r<0.45?'sun':(r<0.73?'rain':'snow');
  },
  normalizeWeatherForLevel(kind,L){
    if(L&&L.cave)return 'cave';
    if(L&&L.night&&kind==='sun')return 'rain';
    if(!WEATHER_CFG[kind]||kind==='cave')return (L&&L.night)?'rain':'sun';
    return kind;
  },
  scheduleThunder(initial){
    // Åska ska bara kunna komma vid regn och inte direkt första sekunden av banan.
    // Classic får längre mellanrum; kaos får mer liv men fortfarande cooldown.
    if(this.weatherKind!=='rain'){this.thunderT=0;this.thunderFlash=0;this.thunderPath=null;return}
    const classic=this.mode==='classic';
    const min=initial?(classic?20:14):(classic?26:18);
    const span=initial?(classic?24:18):(classic?42:30);
    this.thunderT=Math.round((min+this.rand()*span)*1000/TICK);
  },
  makeThunderPath(worldX,targetY){
    const path=[];
    let x=worldX,y=-6;
    path.push({x,y});
    targetY=targetY==null?58+this.rand()*86:clamp(Math.round(targetY),42,VH-6);
    while(y<targetY){
      y+=10+this.rand()*18;
      x+=Math.round((this.rand()-0.5)*34);
      x=clamp(x,8,(this.level&&this.level.W?this.level.W:VW)-8);
      path.push({x,y});
    }
    return path;
  },
  triggerThunder(){
    if(this.weatherKind!=='rain'||!this.level)return;
    const viewPad=70;
    const vw=this.viewW();
    const minX=Math.max(10,this.cam+viewPad), maxX=Math.min(this.level.W-10,this.cam+vw-viewPad);
    const usable=maxX>minX;
    this.thunderX=usable?minX+this.rand()*(maxX-minX):clamp(this.viewCenterX(),10,this.level.W-10);

    const treeChance=this.mode==='chaos'?0.36:0.24;
    const targetTree=this.rand()<treeChance?this.pickThunderTreeTarget(this.thunderX):null;
    let strong=this.rand()<0.34;
    if(targetTree){
      this.thunderX=targetTree.x;
      const strikeY=(targetTree.baseY||160)-Math.max(16,Math.round((targetTree.height||28)*0.72));
      this.thunderPath=this.makeThunderPath(this.thunderX,strikeY);
      strong=true;
      this.igniteTreeFromLightning(targetTree);
    }else{
      this.thunderPath=this.makeThunderPath(this.thunderX);
    }
    this.thunderFlash=8+Math.floor(this.rand()*5);
    AU.sThunder(strong,0.22+this.rand()*0.48);
    this.shakeT=Math.max(this.shakeT,strong?8:5);
    this.shakePow=Math.max(this.shakePow,strong?3:2);
    this.scheduleThunder(false);
  },
  updateThunder(){
    if(this.weatherKind!=='rain'){this.thunderT=0;this.thunderFlash=0;this.thunderPath=null;return}
    if(this.thunderFlash>0)this.thunderFlash--;
    if(this.megaBoom||this.megaArmed)return; // megabombens ljus/ljud ska få dominera
    if(this.thunderT>0)this.thunderT--;
    else this.triggerThunder();
  },
  makeLevelSeed(idx){
    const forced=urlSeedValue();
    if(forced!=null)return (hashString(forced)^Math.imul(idx+1,0x9E3779B1))>>>0;
    const persisted=loadPersisted();
    const base=(persisted.sessionSeed>>>0)||hashString('lemmel-'+Date.now()+'-'+Math.random());
    if(!persisted.sessionSeed){persisted.sessionSeed=base;savePersisted(persisted)}
    this.playCount=((persisted.playCount||0)+1)>>>0;
    persisted.playCount=this.playCount;savePersisted(persisted);
    return (base^Math.imul(idx+1,1009)^Math.imul(this.playCount,104729))>>>0;
  },
  normalizePendingSkillBonus(data){
    const out={};
    if(!data||typeof data!=='object')return out;
    for(const idxKey in data){
      const idx=clamp(parseInt(idxKey,10)||0,0,LEVELS.length-1);
      const src=data[idxKey];
      if(!src||typeof src!=='object')continue;
      const dst={};
      for(const s of SKILLS){
        const v=Number(src[s.k]);
        if(Number.isFinite(v)&&v>0)dst[s.k]=clamp(Math.round(v),0,99);
      }
      if(Object.keys(dst).length)out[idx]=dst;
    }
    return out;
  },
  shopOptions(){
    return [
      {k:'build',label:'BYGG',cost:1},
      {k:'bash',label:'HACKA',cost:1},
      {k:'dig',label:'GRAV',cost:1},
      {k:'rope',label:'REP',cost:1}
    ];
  },
  pendingBonusForLevel(idx){
    const all=this.pendingSkillBonus||(this.pendingSkillBonus={});
    return all[idx]||(all[idx]={});
  },
  briefShopSkillBonus(idx,k){
    const all=this.pendingSkillBonus||{};
    return all[idx]&&all[idx][k]||0;
  },
  buyBriefShopSkill(k){
    const opt=this.shopOptions().find(o=>o.k===k);
    if(!opt)return false;
    this.money=Math.max(0,this.money|0);
    if(this.money<opt.cost){
      this.toast('FOR LITE PENGAR');
      AU.sShrug();
      return true;
    }
    const bonus=this.pendingBonusForLevel(this.levelIdx);
    bonus[k]=(bonus[k]||0)+1;
    this.money-=opt.cost;
    this.savePrefs();
    this.toast('+1 '+opt.label+' TILL DENNA BANA');
    AU.sClick();
    return true;
  },
  handleBriefShopInput(p){
    if(!this.briefShopButtons||!this.briefShopButtons.length)return false;
    for(const b of this.briefShopButtons){
      if(p.x>=b.x&&p.x<b.x+b.w&&p.y>=b.y&&p.y<b.y+b.h)return this.buyBriefShopSkill(b.k);
    }
    return false;
  },
  applyPendingSkillBonus(idx){
    const all=this.pendingSkillBonus||{};
    const bonus=all[idx];
    if(!bonus||!this.skills)return false;
    let applied=false;
    for(const k in bonus){
      const v=Number(bonus[k])|0;
      if(v>0){this.skills[k]=(this.skills[k]||0)+v;applied=true}
    }
    delete all[idx];
    if(applied)this.savePrefs();
    return applied;
  },
  waterfallCaveLootKey(wf){
    wf=wf&&wf.wf?wf.wf:wf;
    return (this.levelIdx||0)+':'+Math.round(wf&&wf.x||0)+','+Math.round(wf&&wf.y||0);
  },
  collectWaterfallCaveChest(cave){
    cave=cave||this.waterfallCave;
    const ch=cave&&cave.chest;
    if(!ch||ch.collected)return false;
    const key=ch.lootKey||this.waterfallCaveLootKey(cave);
    this.waterfallCaveLooted=this.waterfallCaveLooted||{};
    if(this.waterfallCaveLooted[key]){
      ch.opened=true;ch.collected=true;
      return false;
    }
    this.waterfallCaveLooted[key]=true;
    ch.opened=true;ch.collected=true;ch.glowT=Math.max(ch.glowT||0,70);
    const coins=Math.max(1,Math.round(ch.coins||3));
    this.money=Math.max(0,this.money|0)+coins;
    this.savePrefs();
    this.toast('SKATTKISTA: +'+coins+' PENGAR',140);
    if(AU.sSaved)AU.sSaved();else AU.sClick();
    return true;
  },
  loadPrefs(){
    const p=loadPersisted();
    if(p.mode==='classic'||p.mode==='chaos')this.mode=p.mode;
    if(Array.isArray(p.cleared))this.cleared=this.cleared.map((_,i)=>!!p.cleared[i]);
    if(Number.isFinite(p.money))this.money=Math.max(0,p.money|0);
    this.pendingSkillBonus=this.normalizePendingSkillBonus(p.pendingSkillBonus);
    if(typeof p.musicOn==='boolean')AU.musicOn=p.musicOn;
    if(typeof p.sfxOn==='boolean')AU.sfxOn=p.sfxOn;
    if(typeof p.cutscenesOn==='boolean')this.cutscenesOn=p.cutscenesOn;
    if(Number.isFinite(p.musicVol))AU.setMusicVolume(p.musicVol);
    if(Number.isFinite(p.sfxVol))AU.setSfxVolume(p.sfxVol);
    if(Number.isFinite(p.tempoIdx))this.tempoIdx=clamp(p.tempoIdx|0,0,TEMPO_CFG.length-1);
    if(Number.isFinite(p.lastLevelIdx))this.levelIdx=clamp(p.lastLevelIdx|0,0,LEVELS.length-1);
    this.menuChapter=menuChapterForLevel(this.levelIdx);
    if(Number.isFinite(p.playCount))this.playCount=p.playCount>>>0;
  },
  savePrefs(){
    const p=loadPersisted();
    p.mode=this.mode;p.tempoIdx=clamp(this.tempoIdx|0,0,TEMPO_CFG.length-1);p.cleared=this.cleared.slice();p.money=Math.max(0,this.money|0);p.pendingSkillBonus=this.normalizePendingSkillBonus(this.pendingSkillBonus);p.musicOn=!!AU.musicOn;p.sfxOn=!!AU.sfxOn;p.cutscenesOn=this.cutscenesOn!==false;p.musicVol=AU.musicVol;p.sfxVol=AU.sfxVol;p.lastLevelIdx=this.levelIdx;p.playCount=this.playCount>>>0;p.lastSeed=this.levelSeed>>>0;
    savePersisted(p);
  },
  toggleMode(){this.mode=this.mode==='chaos'?'classic':'chaos';this.toast('LÄGE: '+this.modeName());this.savePrefs();AU.sClick();return this.mode},
  toggleCutscenes(){
    this.cutscenesOn=this.cutscenesOn===false;
    if(!this.cutscenesOn&&this.clearCutscene)this.clearCutscene('disabled');
    this.toast('CUTSCENES '+(this.cutscenesOn?'PÅ':'AV'));
    this.savePrefs();
    AU.sClick();
    return this.cutscenesOn;
  },
  toggleMusic(){
    AU.musicOn=!AU.musicOn;
    if(!AU.musicOn)AU.stopMusic();
    else if(this.state==='PLAY'&&this.level)AU.startMusic(this.musicKindForLevel(this.levelIdx));
    else AU.startMusic('menu');
    this.toast('MUSIK '+(AU.musicOn?'PÅ':'AV'));this.savePrefs();
  },
  setMusicVolume(v){
    AU.musicOn=true;
    AU.setMusicVolume(v);
    if(this.state==='PLAY'&&this.level)AU.startMusic(this.musicKindForLevel(this.levelIdx));
    else AU.startMusic('menu');
    this.toast('MUSIKVOLYM '+Math.round(AU.musicVol*100)+'%');
    this.savePrefs();
    return AU.musicVol;
  },
  toggleSfx(){
    AU.sfxOn=!AU.sfxOn;
    if(!AU.sfxOn){AU.stopWeather();if(AU.stopWaterfallCave)AU.stopWaterfallCave()}
    else {AU.sClick();if(this.state==='PLAY'&&this.level)AU.startWeather(this.weatherKind);if(this.waterfallCaveActive&&this.waterfallCaveActive()&&AU.startWaterfallCave)AU.startWaterfallCave()}
    this.toast('SFX '+(AU.sfxOn?'PÅ':'AV'));this.savePrefs();
  },
  setSfxVolume(v){
    AU.sfxOn=true;
    AU.setSfxVolume(v);
    if(this.state==='PLAY'&&this.level)AU.startWeather(this.weatherKind);
    if(this.waterfallCaveActive&&this.waterfallCaveActive()&&AU.startWaterfallCave)AU.startWaterfallCave();
    this.toast('SFX-VOLYM '+Math.round(AU.sfxVol*100)+'%');
    this.savePrefs();
    AU.sClick();
    return AU.sfxVol;
  },
  toggleHelp(){
    this.showHelp=!this.showHelp;
    this.toast(this.showHelp?'HJÄLP VISAS':'HJÄLP DOLD');
    AU.sClick();
    return this.showHelp;
  },
  musicKindForLevel(idx){
    const L=LEVELS[idx];
    if(L&&L.cave)return 'cave';
    if(L&&Array.isArray(L.water)&&L.water.some(w=>w&&w.lava))return 'lava';
    if(L&&L.theme==='desert')return 'desert';
    if(L&&L.theme==='city')return 'city';
    if(!L||L.night)return 'night';
    let dayIndex=0;
    for(let i=0;i<=idx;i++)if(LEVELS[i]&&!LEVELS[i].night)dayIndex++;
    return (dayIndex%2===0)?'day2':'day';
  },
  liquidZones(){
    const L=this.level;
    if(!L||!Array.isArray(L.water)||!L.water.length)return [];
    if(this.liquidCache&&this.liquidCache.level===L)return this.liquidCache.zones;
    const src=L.water.filter(z=>z&&z.w>0).map((z,idx)=>({
      source:z,idx,
      center:(z.x||0)+(z.w||0)/2,
      y:Math.round(z.y||220),
      lava:!!z.lava
    })).sort((a,b)=>a.center-b.center||a.idx-b.idx);
    const zones=[];
    for(let i=0;i<src.length;i++){
      const left=i===0?0:Math.round((src[i-1].center+src[i].center)/2);
      const right=i===src.length-1?L.W:Math.round((src[i].center+src[i+1].center)/2);
      const x=clamp(left,0,L.W), x2=clamp(Math.max(left+1,right),0,L.W);
      zones.push({x,w:Math.max(1,x2-x),y:src[i].y,lava:src[i].lava,source:src[i].source,full:true});
    }
    this.liquidCache={level:L,zones};
    return zones;
  },
  liquidAt(x,y,pad){
    if(!this.level||!this.level.water||y==null)return null;
    const xx=Math.round(x), yy=Math.round(y), p=Math.max(0,pad||0);
    for(const z of this.liquidZones()){
      if(xx>=z.x-p&&xx<z.x+z.w+p&&yy>=z.y-2)return z;
    }
    return null;
  },
  decorLiquidSpawnBlocked(d){
    if(!d||(d.t!=='mush'&&d.t!=='rock'))return false;
    return !!this.liquidAt(d.x,Math.round((d.y||0)+6),2);
  },
  lemmingLiquidHazard(l){
    if(!l)return null;
    const z=this.liquidAt(l.x,l.y,0);
    if(!z)return null;
    const visibleSurfaceY=z.y+2;
    const contactDepth=Math.round(l.y-visibleSurfaceY);
    const sc=Math.max(1,l.scale||1);
    const killDepth=z.lava?2:Math.max(3,Math.round(10*sc*0.25));
    return contactDepth>=killDepth?z:null;
  },
  visibleLiquidAtX(x,pad){
    if(!this.T)return false;
    const p=Math.max(0,pad||0), xx=Math.round(x);
    for(let dx=-p;dx<=p;dx+=Math.max(1,p||1)){
      const sx=clamp(xx+dx,2,this.T.W-3);
      const gy=this.findSupplyGroundY(sx);
      if(this.liquidAt(sx,gy+1,0)||this.liquidAt(sx,gy+4,0))return true;
    }
    return false;
  },
  isDarkLevel(){
    const L=this.level;
    return !!(L&&(L.night||L.cave));
  },
  goToMenu(){
    if(this.clearCutscene)this.clearCutscene('menu');
    if(this.exitWaterfallCave)this.exitWaterfallCave('silent');
    this.clearRopeAim();
    this.paused=false;
    this.menuChapter=menuChapterForLevel(this.levelIdx);
    AU.stopWeather();
    AU.stopMusic();
    this.state='MENU';
    AU.startMusic('menu');
    this.savePrefs();
  },
  restartCurrentLevel(){
    if(this.clearCutscene)this.clearCutscene('restart');
    if(this.exitWaterfallCave)this.exitWaterfallCave('silent');
    this.clearRopeAim();
    this.paused=false;
    AU.stopMusic();
    AU.stopWeather();
    this.startLevel(this.levelIdx);
  },
  advanceFromResult(){
    if(!this.level){this.goToMenu();return}
    const win=this.saved>=this.level.save;
    if(win&&this.levelIdx<LEVELS.length-1){
      this.levelIdx++;
      this.savePrefs();
      this.state='BRIEF';
    }else this.goToMenu();
  },
  markLevelCleared(idx){if(!this.cleared[idx]){this.cleared[idx]=true;this.savePrefs()}},
  levelProgress(){return this.levelTimeT>0?clamp(1-this.timeT/this.levelTimeT,0,1):0},
  isMegaAllowed(){return this.levelProgress()>=MEGA_MIN_PROGRESS},
  canUseSupplyPlanes(){return !!(this.level&&!this.level.cave)},
  canStartDirectedEvent(kind){
    if(this.megaBoom||this.megaArmed)return false;
    if(this.eventLockT>0)return false;
    if(kind==='supplyPlane'&&!this.canUseSupplyPlanes())return false;
    return true;
  },
  warningText(kind,data){
    if(data&&data.label)return data.label;
    if(kind==='supplyPlane')return 'PAKET INKOMMANDE';
    if(kind==='treeGrow')return 'TRÄD VÄXER SNART';
    if(kind==='monkey')return 'APA PÅ VÄG';
    if(kind==='troll')return 'TROLL PÅ VÄG';
    if(kind==='randomJump')return 'HOPPRYCK SNART';
    if(kind==='megaBoom')return 'MEGABOMB ARMAD';
    return 'VARNING';
  },
  addWarning(kind,x,y,ticks,label){
    ticks=Math.max(1,Math.round(ticks||1));
    this.warnings.push({kind,x:Math.round(x==null?this.cam+VW/2:x),y:Math.round(y==null?40:y),t:ticks,maxT:ticks,text:label||this.warningText(kind,{})});
  },
  queueDirectedEvent(kind,ticks,data,force){
    data=data||{};ticks=Math.max(1,Math.round(ticks||1));
    if(kind==='supplyPlane'&&!this.canUseSupplyPlanes())return false;
    if(!force&&!this.canStartDirectedEvent(kind))return false;
    const x=data.x!=null?data.x:(data.targetX!=null?data.targetX:(data.lemX!=null?data.lemX:this.cam+VW/2));
    const y=data.y!=null?data.y:(data.baseY!=null?data.baseY-18:42);
    this.queuedEvents.push({kind,t:ticks,data});
    this.addWarning(kind,x,y,ticks,this.warningText(kind,data));
    if(!force)this.eventLockT=Math.max(this.eventLockT,ticks+this.chaosConfig().eventCooldown);
    else this.eventLockT=Math.max(this.eventLockT,Math.min(this.chaosConfig().eventCooldown,ticks));
    AU.sWarn();
    return true;
  },
  executeQueuedEvent(ev){
    if(!ev)return;
    const d=ev.data||{};
    if(ev.kind==='supplyPlane')this.spawnSupplyPlane(d.payload,d.targetX);
    else if(ev.kind==='treeGrow')this.spawnGrowingTreeAt(d.x,d.baseY,d.message||'ETT TRÄD BÖRJAR VÄXA!');
    else if(ev.kind==='monkey')this.spawnMonkey(d);
    else if(ev.kind==='troll')this.spawnTroll(d);
    else if(ev.kind==='randomJump')this.startRandomSillyJump(d.lemId);
    else if(ev.kind==='megaBoom'){this.megaArmed=null;this.startMegaBoom(d.x,d.y)}
  },
  updateEventDirector(){
    if(this.level&&this.level.cave){
      this.queuedEvents=this.queuedEvents.filter(q=>q.kind!=='supplyPlane');
      this.warnings=this.warnings.filter(w=>w.kind!=='supplyPlane');
    }
    if(this.isDarkLevel()){
      this.queuedEvents=this.queuedEvents.filter(q=>q.kind!=='monkey'&&q.kind!=='troll');
      this.warnings=this.warnings.filter(w=>w.kind!=='monkey'&&w.kind!=='troll');
    }
    if(this.eventLockT>0)this.eventLockT--;
    for(const w of this.warnings)w.t--;
    this.warnings=this.warnings.filter(w=>w.t>0);
    for(const q of this.queuedEvents)q.t--;
    const due=this.queuedEvents.filter(q=>q.t<=0);
    this.queuedEvents=this.queuedEvents.filter(q=>q.t>0);
    for(const q of due)this.executeQueuedEvent(q);
    if(this.megaArmed){
      this.megaArmed.t=Math.max(0,this.megaArmed.t-1);
      if(this.megaArmed.t%8===0)AU.sTick();
      this.shakeT=Math.max(this.shakeT,4);this.shakePow=Math.max(this.shakePow,3);
    }
  },

  startLevel(idx){
    if(this.clearCutscene)this.clearCutscene('level-start');
    if(this.exitWaterfallCave)this.exitWaterfallCave('silent');
    AU.stopWeather();
    this.levelIdx=idx;
    this.levelSeed=this.makeLevelSeed(idx);
    this.levelRng=rndSeed(this.levelSeed||1337);
    this.savePrefs();
    const L=this.level=LEVELS[idx];
    this.liquidCache=null;
    const T=this.T=new Terrain(L.W,240);
    // bygg terräng
    const P=createLevelBuildApi(T);
    L.build(P);
    this.ensureHatchClearance();
    T.renderFromMask(L.theme,L.materialZones);
    // dekor
    this.decor=[];
    const D=createLevelDecorApi(this);
    if(L.decor)L.decor(D);
    // status
    this.lems=[];this.parts=[];this.rockets=[];this.hooks=[];this.ropes=[];this.planes=[];this.packages=[];this.monkeys=[];this.bananas=[];this.trolls=[];this.trollRocks=[];this.settledTrollRocks=[];this.settledTrollRockSeq=0;this.trees=[];this.dolphins=[];this.flashes=[];this.rescues=[];this.meteors=[];this.caveDrips=[];this.ambientBugs=[];this.ambientFish=[];this.ambientGrass=[];this.warnings=[];this.queuedEvents=[];this.toasts=[];this.msg='';this.msgT=0;this.megaBoom=null;this.megaArmed=null;this.eventLockT=0;this.shakeT=0;this.shakePow=0;this.ropeAim=null;this.ropeSeq=1;this.waterfallCaveLooted={};this.manual={used:false,active:false,lemId:null,lampOn:false,keys:{left:false,right:false,down:false,run:false,aim:false},jumpQueued:null,aimAngle:0};
    this.weatherKind=this.normalizeWeatherForLevel(this.pickWeather(),L);this.weatherT=0;this.thunderT=0;this.thunderFlash=0;this.thunderX=0;this.thunderPath=null;this.sunSurpriseT=0;
    this.meteorT=(L.night&&!L.cave)?Math.round((18+this.rand()*34)*1000/TICK):0;
    this.cam=clamp(L.hatch.x-160,0,this.maxCamFor(L));
    this.clampView();
    this.out=0;this.saved=0;this.spawned=0;this.doorT=0;
    this.lemTalkT=Math.round((7+this.rand()*12)*1000/TICK);
    this.rate=L.rate;this.spawnT=20;
    this.timeT=L.time*1000/TICK;this.levelTimeT=this.timeT;
    this.skills=Object.assign({rope:2,downbuild:Math.max(2,Math.ceil((L.skills.build||0)/2)),flame:Math.max(0,Math.min(3,Math.ceil((L.skills.baz||0)/3)))},L.skills);
    this.applyPendingSkillBonus(idx);
    this.initLevelLootPackages();
    this.initLevelRescues();
    const cfg=this.chaosConfig();
    const supplyPlanesOn=!L.cave;
    this.supplyT=supplyPlanesOn?Math.round((cfg.supplyFirstMin+this.rand()*cfg.supplyFirstRange)*1000/TICK):0;
    this.supplyDrops=0;
    this.supplyMax=supplyPlanesOn?Math.max(cfg.supplyMaxMin,Math.min(cfg.supplyMaxCap,Math.floor(L.time/70)+2)):0;
    this.supplyLastX=null;
    this.supplyRecentXs=[];
    this.supplyMegaDropped=false;
    this.supplyMegaPlanned=supplyPlanesOn&&this.rand()<cfg.megaPlanChance;
    this.supplyMegaForceAt=1+Math.floor(this.rand()*2);
    this.supplyLateMegaScheduled=false;
    const darkNoCreatures=!!(L.night||L.cave);
    this.monkeyT=Math.round((18+this.rand()*22)*1000/TICK);
    this.monkeyEvents=0;
    this.monkeyMax=darkNoCreatures?0:Math.max(0,Math.min(cfg.monkeyCap,Math.floor(L.time/130)+1));
    this.monkeyLastX=null;this.monkeySeq=0;this.monkeyAirSupportPending=false;this.monkeyAirSupportTargetX=null;
    this.trollT=Math.round((34+this.rand()*42)*TROLL_EVENT_SLOWDOWN*1000/TICK);
    this.trollEvents=0;
    this.trollMax=darkNoCreatures?0:Math.max(0,Math.min(cfg.trollCap||0,(this.levelIdx<10?1:Math.floor(L.time/210)+1)));
    this.trollLastX=null;
    this.treeT=Math.round((28+this.rand()*38)*1000/TICK);
    this.treeEvents=0;
    this.treeMax=Math.max(0,Math.min(cfg.treeCap,Math.floor(L.time/175)+1));
    this.treeLastX=null;
    this.jumpT=Math.round((22+this.rand()*32)*1000/TICK);
    this.jumpEvents=0;
    this.jumpMax=Math.max(0,Math.min(cfg.jumpCap,Math.floor(L.time/165)+1));
    this.selSkill=null;this.paused=false;this.trollUsed=false;
    this.lamp=L.night?{x:L.hatch.x,y:L.hatch.y,holder:null,onGround:false}:null;
    this.fireflies=[];
    if(L.night&&!L.cave)for(let i=0;i<22;i++)
      this.fireflies.push({x:RND()*L.W,y:40+RND()*150,p:RND()*7,s:0.3+RND()*0.6});
    this.initCaveDrips();
    this.buildAmbientLife();
    this.state='PLAY';
    AU.sLetsGo();
    AU.startMusic(this.musicKindForLevel(idx));
    AU.startWeather(this.weatherKind);
    this.scheduleThunder(true);
    this.toast('VÄDER: '+this.weatherName());
  },

  findSolidBelowSurface(x,minDepth,maxDepth){
    if(!this.T)return null;
    const xx=clamp(Math.round(x),4,this.T.W-5);
    for(let y=24;y<this.T.H-4;y++){
      if(!this.T.solid(xx,y)&&this.T.solid(xx,y+1)){
        const d=Math.round(minDepth+this.rand()*(maxDepth-minDepth));
        const yy=clamp(y+d,4,this.T.H-5);
        if(this.T.solid(xx,yy))return yy;
      }
    }
    return null;
  },
  findAmbientSurfaceY(x){
    if(!this.T)return null;
    const xx=clamp(Math.round(x),4,this.T.W-5);
    for(let y=16;y<this.T.H-3;y++){
      if(!this.T.solid(xx,y)&&this.T.solid(xx,y+1)&&!this.T.solid(xx-3,y)&&!this.T.solid(xx+3,y)&&!this.liquidAt(xx,y+2,4))return y;
    }
    return null;
  },
  buildAmbientLife(){
    const L=this.level;
    this.ambientBugs=[];this.ambientFish=[];this.ambientGrass=[];
    if(!L||!this.T)return;
    if(L.theme==='dirt'){
      const fossils=Math.max(3,Math.min(8,Math.round(L.W/230)));
      const worms=Math.max(2,Math.min(7,Math.round(L.W/300)));
      for(let i=0;i<fossils;i++){
        const x=40+this.rand()*Math.max(1,L.W-80);
        const y=this.findSolidBelowSurface(x,12,46);
        if(y!=null)this.ambientBugs.push({t:'fossil',x,y,k:this.rand()<0.55?'shell':'fish',flip:this.rand()<0.5?-1:1,p:this.rand()*7});
      }
      for(let i=0;i<worms;i++){
        const x=35+this.rand()*Math.max(1,L.W-70);
        const y=this.findSolidBelowSurface(x,7,34);
        if(y!=null)this.ambientBugs.push({t:'worm',x,y,baseX:x,baseY:y,p:this.rand()*7,s:0.012+this.rand()*0.014,amp:2.5+this.rand()*4,crawl:0,dir:this.rand()<0.5?-1:1,col:this.rand()<0.55?'#d88a7a':'#caa05a'});
      }
    }
    if(L.theme==='dirt'||L.theme==='forest'){
      const tufts=Math.max(8,Math.min(26,Math.round(L.W/(L.theme==='forest'?58:72))));
      for(let i=0;i<tufts;i++){
        const x=20+this.rand()*Math.max(1,L.W-40);
        const y=this.findAmbientSurfaceY(x);
        if(y!=null)this.ambientGrass.push({x,y,p:this.rand()*7,s:0.012+this.rand()*0.018,h:3+Math.floor(this.rand()*4),w:2+Math.floor(this.rand()*3),col:this.rand()<0.55?'#3aa33a':'#67bd43'});
      }
    }
    for(let zoneIdx=0;zoneIdx<(L.water||[]).length;zoneIdx++){
      const z=L.water[zoneIdx];
      if(z.lava)continue;
      const n=Math.max(1,Math.min(3,Math.round(z.w/55)));
      for(let i=0;i<n;i++)this.ambientFish.push({
        zone:z,zoneIdx,x:z.x+8+this.rand()*Math.max(1,z.w-16),baseY:z.y+9+this.rand()*Math.max(4,Math.min(20,236-z.y)),
        y:0,dir:this.rand()<0.5?-1:1,p:this.rand()*7,s:0.055+this.rand()*0.055,spd:0.10+this.rand()*0.11,
        size:this.rand()<0.32?2:1,col:this.rand()<0.45?'#ffd060':(this.rand()<0.72?'#d8f0ff':'#ff9c70')
      });
    }
    for(const f of this.ambientFish)if(!f.y)f.y=f.baseY;
  },
  rebindAmbientFishZones(){
    const waters=(this.level&&this.level.water)||[];
    if(!Array.isArray(this.ambientFish)||!waters.length)return 0;
    const sameZone=(a,b)=>!!(a&&b&&
      Math.round(a.x||0)===Math.round(b.x||0)&&
      Math.round(a.y||0)===Math.round(b.y||0)&&
      Math.round(a.w||0)===Math.round(b.w||0)&&
      !!a.lava===!!b.lava);
    let fixed=0;
    for(const f of this.ambientFish){
      if(!f)continue;
      let zone=waters.includes(f.zone)?f.zone:null;
      if(!zone&&Number.isFinite(f.zoneIdx)){
        const zi=f.zoneIdx|0;
        if(waters[zi])zone=waters[zi];
      }
      if(!zone&&f.zone)zone=waters.find(z=>sameZone(z,f.zone))||null;
      if(!zone&&Number.isFinite(f.x)){
        zone=waters.find(z=>!z.lava&&f.x>=z.x&&f.x<z.x+z.w)||null;
      }
      if(!zone)continue;
      if(f.zone!==zone)fixed++;
      f.zone=zone;
      f.zoneIdx=waters.indexOf(zone);
    }
    return fixed;
  },
  updateAmbientLife(){
    for(const b of this.ambientBugs||[]){
      if(b.t!=='worm')continue;
      b.p+=b.s;
      b.crawl=(b.crawl||0)+b.dir*(0.018+0.012*Math.sin(b.p*0.7));
      if(Math.abs(b.crawl)>b.amp){b.crawl=clamp(b.crawl,-b.amp,b.amp);b.dir*=-1}
      b.x=b.baseX+b.crawl+Math.sin(b.p*0.8)*0.7;
      b.y=b.baseY+Math.sin(b.p*1.15)*0.35;
    }
    for(const f of this.ambientFish||[]){
      if(f.giftT>0)f.giftT--;
      f.p+=f.s;
      f.x+=f.dir*f.spd*(0.65+0.35*Math.sin(f.p*1.7));
      const target=f.baseY+Math.sin(f.p*1.1)*2.2+Math.sin(f.p*0.37)*1.4;
      f.y+=(target-f.y)*0.035;
      const z=f.zone;
      if(!z)continue;
      if(f.x<z.x+5){f.x=z.x+5;f.dir=1}
      if(f.x>z.x+z.w-5){f.x=z.x+z.w-5;f.dir=-1}
    }
  },

  findCaveDripColumn(x){
    if(!this.T)return null;
    const xx=clamp(Math.round(x),5,this.T.W-6);
    for(let y=8;y<this.T.H-12;y++){
      if(this.T.solid(xx,y-1)&&!this.T.solid(xx,y)){
        for(let yy=y+18;yy<this.T.H-4;yy++){
          if(!this.T.solid(xx,yy)&&this.T.solid(xx,yy+1)){
            if(yy-y>=28)return {x:xx,ceiling:y,ground:yy};
            break;
          }
        }
      }
    }
    return null;
  },
  initCaveDrips(){
    this.caveDrips=[];
    const L=this.level;
    if(!L||!L.cave||!this.T)return;
    const target=Math.max(8,Math.min(18,Math.round(L.W/95)));
    const tried=[];
    for(let i=0;i<target*7&&this.caveDrips.length<target;i++){
      let x=30+this.rand()*Math.max(1,L.W-60);
      if(i<target&&L.drips&&L.drips[i]!=null)x=L.drips[i];
      if(tried.some(v=>Math.abs(v-x)<34))continue;
      const p=this.findCaveDripColumn(x);
      if(!p)continue;
      tried.push(p.x);
      this.caveDrips.push({
        x:p.x+(this.rand()*2-1)*1.5,ceiling:p.ceiling,ground:p.ground,
        y:p.ceiling,next:Math.round((0.4+this.rand()*3.2)*1000/TICK),
        speed:1.65+this.rand()*0.85,falling:false,splashT:0,p:this.rand()*7
      });
    }
  },
  updateCaveDrips(){
    if(!this.level||!this.level.cave||!this.caveDrips)return;
    for(const d of this.caveDrips){
      d.p+=0.04;
      if(d.splashT>0)d.splashT--;
      if(!d.falling){
        d.next--;
        if(d.next<=0){d.falling=true;d.y=d.ceiling+1}
        continue;
      }
      d.y+=d.speed;
      if(d.y>=d.ground){
        d.y=d.ground;d.falling=false;d.splashT=9;
        d.next=Math.round((1.1+this.rand()*4.2)*1000/TICK);
        if(Math.abs(d.x-this.viewCenterX())<this.viewW()*0.62)AU.sCaveDrip(d.x);
        for(let i=0;i<4&&this.parts.length<MAX_PARTICLES;i++){
          this.parts.push({x:d.x,y:d.ground-1,vx:(this.rand()*2-1)*(0.25+this.rand()*0.35),vy:-0.35-this.rand()*0.35,
            life:7+this.rand()*6,g:0.12,col:this.rand()<0.55?'#9fd0ff':'#d8f0ff',glow:this.rand()<0.18});
        }
      }
    }
  },

  ensureHatchClearance(){
    // Säkerhetsnät för nivådata: om hatch/spawn råkar hamna i marken
    // öppnas en smal luckschakt ner till närmaste riktiga gångyta. Detta
    // hindrar nya banor från att börja med fastlåsta lemlar utan att ändra
    // normal geometri på banor där hatchen redan är fri.
    const L=this.level,T=this.T;
    if(!L||!T||!L.hatch)return false;
    const sx=clamp(Math.round(L.hatch.x),8,T.W-9);
    const spawnY=Math.round(L.hatch.y+6);
    let blocked=T.solid(sx,spawnY);
    for(let yy=spawnY-12;yy<=spawnY+3&&!blocked;yy++){
      for(let xx=sx-5;xx<=sx+5;xx++){
        if(T.solid(xx,yy)){blocked=true;break}
      }
    }
    if(!blocked)return false;
    let surface=null;
    for(let y=Math.max(8,spawnY-4);y<T.H-3;y++){
      if(!T.solid(sx,y)&&T.solid(sx,y+1)){surface=y;break}
    }
    if(surface==null)surface=clamp(spawnY+44,18,T.H-8);
    const top=clamp(Math.round(L.hatch.y-3),0,T.H-4);
    const bottom=clamp(surface,top+8,T.H-4);
    T.setRect(sx-9,top,18,bottom-top+1,0);
    T.setRect(sx-14,Math.max(0,bottom-17),28,17,0);
    return true;
  },

  // ---- händelser ----
  explode(x,y,r,big,soundKind){
    this.T.clearDisc(x,y,r);
    if(this.isInGoalZone(x,y,Math.max(16,Math.round(r||0))))this.restoreGoalBase();
    this.pruneDetachedRopes();
    if(soundKind==='bazooka')AU.sBazookaExplosion();
    else if(soundKind==='lemming')AU.sLemmingExplosion();
    else if(soundKind==='banana')AU.sBananaExplosion();
    else big?AU.sBigBoom():AU.sPop();
    this.flashes.push({x,y,r:r*4.6,t:16,maxT:16});
    const n=Math.min(72,Math.round((big?34:24)+r*1.35));
    for(let i=0;i<n;i++){
      const a=RND()*6.283,sp=0.9+RND()*(big?4.4:3.2);
      this.parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1.8,
        life:18+RND()*(big?28:18),g:0.18,
        col:RND()<0.42?'#ffd040':(RND()<0.52?'#ff7020':(RND()<0.70?'#ff3018':'#3858ff')),glow:true});
    }
    if(this.parts.length>MAX_PARTICLES)this.parts.splice(0,this.parts.length-MAX_PARTICLES);
    if(this.flashes.length>MAX_FLASHES)this.flashes.splice(0,this.flashes.length-MAX_FLASHES);
  },
  goalBounds(pad){
    const e=this.level&&this.level.exit;
    if(!e)return null;
    pad=pad||0;
    return {x0:e.x-15-pad,x1:e.x+15+pad,y0:e.y-32-pad,y1:e.y+8+pad};
  },
  isInGoalZone(x,y,pad){
    const b=this.goalBounds(pad||0);
    if(!b)return false;
    return x>=b.x0&&x<=b.x1&&y>=b.y0&&y<=b.y1;
  },
  restoreGoalBase(){
    const e=this.level&&this.level.exit,T=this.T;
    if(!e||!T)return false;
    const x=Math.round(e.x), y=clamp(Math.round(e.y+1),0,T.H-1);
    const x0=clamp(x-16,0,T.W), x1=clamp(x+17,0,T.W), h=Math.min(6,T.H-y);
    if(x1<=x0||h<=0)return false;
    let missing=false;
    for(let yy=y;yy<y+h&&!missing;yy++){
      const o=yy*T.W;
      for(let xx=x0;xx<x1;xx++)if(!T.mask[o+xx]){missing=true;break}
    }
    if(!missing)return false;
    T.setRect(x0,y,x1-x0,h,1);
    if(T.cx){
      const col=terrainBrickColor(this.level,x,y);
      T.cx.fillStyle=col;T.cx.fillRect(x0,y,x1-x0,h);
      T.cx.fillStyle='rgba(255,255,255,0.22)';T.cx.fillRect(x0,y,x1-x0,1);
      T.cx.fillStyle='rgba(0,0,0,0.20)';T.cx.fillRect(x0,y+h-1,x1-x0,1);
    }
    return true;
  },
  goalSpark(x,y){
    // Exit/målet är inte destruerbar terräng. Om en raket träffar målet
    // absorberas träffen som en visuell puff i stället för att riskera att
    // målets omgivning rensas och spelet hamnar i ett konstigt sluttillstånd.
    AU.sPop();
    this.flashes.push({x,y,r:34,t:12,maxT:12});
    for(let i=0;i<22;i++){
      const a=RND()*6.283,sp=0.45+RND()*1.8;
      this.parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1.0,life:12+RND()*14,g:0.12,
        col:RND()<0.5?'#ffd040':'#ffffff',glow:true});
    }
    this.toast('MÅLET ÄR SKYDDAT!');
  },
  debris(x,y,n){
    for(let i=0;i<n;i++)this.parts.push({x:x+RND()*6-3,y:y+RND()*4-2,
      vx:RND()*1.6-0.8,vy:-RND()*1.6,life:8+RND()*8,g:0.2,col:'#9a7040'});
  },
  landingPuff(x,y,fall,scale){
    if(this.parts.length>=MAX_PARTICLES)return;
    const sc=Math.max(1,scale||1), power=clamp((fall||10)/42,0.35,1.25);
    const key=terrainThemeKeyAt(this.level,x,y);
    const dustCols={
      dirt:['#d8c0a0','#b89068'],forest:['#8a6a3a','#5c4228'],desert:['#e8bf72','#c9904e'],
      city:['#b8bec6','#7c838c'],cave:['#9aa2ad','#666f7a'],rock:['#a8b2bd','#68727e'],crystal:['#c8f0ff','#86c6e0'],glass:['#e8fbff','#92d8ee'],
      marble:['#dce4eb','#8f9aa8'],hell:['#c07052','#6a3028']
    }[key]||['#d8c0a0','#b89068'];
    const n=Math.round((3+power*7)*sc);
    for(let i=0;i<n&&this.parts.length<MAX_PARTICLES;i++){
      const side=RND()<0.5?-1:1, sp=(0.22+RND()*0.72)*power*sc;
      this.parts.push({x:x+RND()*7*sc-3.5*sc,y:y-1+RND()*2,
        vx:side*sp,vy:-0.18-RND()*0.38*power,life:8+RND()*10,g:0.035,
        col:RND()<0.65?dustCols[0]:dustCols[1],dust:true});
    }
  },
  pickupSparkle(x,y,kind,scale){
    if(this.parts.length>=MAX_PARTICLES)return;
    const sc=Math.max(1,scale||1);
    const col=kind==='loot'?'#ffd870':(kind==='mega'?'#ff5050':'#b8e8ff');
    this.parts.push({x,y,vx:0,vy:0,life:12,maxLife:12,g:0,col,ring:true,glow:true,scale:sc});
    for(let i=0;i<10*sc&&this.parts.length<MAX_PARTICLES;i++){
      const a=RND()*6.283, sp=(0.35+RND()*1.25)*sc;
      this.parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-0.35*sc,
        life:10+RND()*10,g:0.10,col:RND()<0.35?'#ffffff':col,glow:true});
    }
  },
  bubble(x,y){this.parts.push({x:x+RND()*4-2,y,vx:0,vy:-0.5,life:14,g:0,col:'#a0d0ff'})},
  waterfallHeadSplash(l,wf){
    if(!l||!wf||this.parts.length>=MAX_PARTICLES)return;
    const sc=Math.max(1,l.scale||1), headX=l.x, headY=l.y-9*sc;
    const flow=Math.sin((this.weatherT||0)*0.22+(wf.v||0)*7)*0.26;
    const n=Math.round(5+sc*3);
    for(let i=0;i<n&&this.parts.length<MAX_PARTICLES;i++){
      const side=(this.rand()<0.5?-1:1), lift=0.45+this.rand()*0.75;
      const life=Math.round(8+this.rand()*9);
      this.parts.push({
        x:headX+(this.rand()*7-3.5)*sc,
        y:headY-1+this.rand()*3*sc,
        vx:side*(0.20+this.rand()*0.58)*sc+flow,
        vy:-lift*sc+this.rand()*0.18,
        life,maxLife:life,g:0.12,
        col:this.rand()<0.58?'#d8f8ff':(this.rand()<0.82?'#8fd8ff':'#ffffff'),
        water:true,glow:this.rand()<0.18
      });
    }
    for(let i=0;i<2&&this.parts.length<MAX_PARTICLES;i++){
      const life=10+Math.floor(this.rand()*7);
      this.parts.push({
        x:headX+(this.rand()*8-4)*sc,
        y:headY+this.rand()*4*sc,
        vx:(this.rand()*0.38-0.19)*sc+flow*0.55,
        vy:0.12+this.rand()*0.34,
        life,maxLife:life,g:0.035,
        col:'#b8efff',water:true,drip:true
      });
    }
  },
  flame(x,y){this.parts.push({x:x+RND()*4-2,y,vx:RND()*0.6-0.3,vy:-1,life:8,g:0,
    col:RND()<0.5?'#ff8020':'#ffd040',glow:true})},
  flameJetParticle(x,y,dir,dist,r){
    for(let i=0;i<2&&this.parts.length<MAX_PARTICLES;i++){
      const hot=RND();
      this.parts.push({x:x+RND()*r-r/2,y:y+RND()*r-r/2,
        vx:dir*(0.45+dist*0.012+RND()*0.9),vy:-0.28+RND()*0.46,
        life:8+RND()*8,g:-0.004,
        col:hot<0.22?'#fff0a0':(hot<0.62?'#ffb030':'#ff5a18'),glow:true});
    }
  },
  jetFlame(x,y,d,scale){
    const sc=Math.max(1,scale||1),n=Math.round(2*sc);
    for(let i=0;i<n;i++)this.parts.push({x:x-d*sc+RND()*3*sc-1*sc,y:y+sc,
      vx:-d*0.4+RND()*0.4-0.2,vy:0.8+RND()*0.8,life:6+RND()*5,g:0,
      col:RND()<0.5?'#ffd040':'#ff7020',glow:true});
  },
  recoil(x,y,d,scale){
    const sc=Math.max(1,scale||1);
    for(let i=0;i<Math.round(5*sc);i++)this.parts.push({x:x-d*3*sc,y,vx:-d*(0.5+RND())*sc,vy:RND()-0.5,
      life:7,g:0,col:'#cccccc'});
  },
  skillSpark(l,k){
    if(!l)return;
    const cols={build:'#c8a050',downbuild:'#d8b060',dig:'#9a7040',bash:'#d0d0d0',mine:'#b8b8c0',rope:'#d0a060',jet:'#ffb040',flame:'#ff7020',baz:'#ff8040',bomb:'#ff4040',float:'#ff8080',climb:'#ffffff',block:'#70a0ff',faint:'#d8f0ff',warm:'#ffb040',mush:'#e8d070',troll:'#d0a060'};
    const col=cols[k]||'#ffffff';
    const sc=Math.max(1,l.scale||1);
    for(let i=0;i<Math.round(7*sc)&&this.parts.length<MAX_PARTICLES;i++){
      const a=-1.7+RND()*3.4, sp=0.35+RND()*1.0;
      this.parts.push({x:l.x+RND()*6*sc-3*sc,y:l.y-9*sc+RND()*5*sc-2*sc,vx:Math.sin(a)*sp,vy:-0.3-Math.cos(a)*sp,life:8+RND()*8,g:0.08,col,glow:RND()<0.25});
    }
  },
  decorSupportX(d){
    if(!d)return d&&d.x||0;
    if(d.t==='mummy')return this.mummyPatrolX(d);
    return d.x||0;
  },
  decorCanFall(d){
    return !!(d&&['torch','mummy','cactus','rock','bush','mush','crystal','marker','sign','streetlamp'].includes(d.t));
  },
  applyDecorGravity(d){
    const x=Math.round(this.decorSupportX(d));
    let y=Math.round(d.y);
    if(y>=this.T.H-2){d.y=this.T.H-2;d.vy=0;return}
    if(this.T.solid(x,y+1)){d.vy=0;return}
    d.vy=Math.min(4.2,(d.vy||0)+0.34);
    let remain=d.vy,guard=0;
    while(remain>0&&guard++<8){
      const step=Math.min(1,remain);
      y=Math.round(d.y+step);
      if(this.T.solid(x,y+1)||y>=this.T.H-2){
        d.y=clamp(y,0,this.T.H-2);
        d.vy=0;
        return;
      }
      d.y+=step;
      remain-=step;
    }
  },
  updateDecorPhysics(){
    if(!this.T||!this.decor)return;
    for(const d of this.decor){
      if(d.t==='tree'&&d.burning){
        d.burnT=(d.burnT||0)+1;
        if(d.burnT%4===1&&this.parts.length<MAX_PARTICLES){
          const s=d.s||1,h=70*s;
          this.parts.push({x:d.x+this.rand()*34*s-17*s,y:d.y-h*0.65+this.rand()*30*s,
            vx:this.rand()*0.5-0.25,vy:-0.75-this.rand()*0.9,life:12+this.rand()*14,g:0.02,
            col:this.rand()<0.45?'#ffe060':(this.rand()<0.8?'#ff8020':'#a04018'),glow:true});
        }
        if(d.burnT>(d.burnDur||Math.round(3.8*1000/TICK)))d.remove=true;
        continue;
      }
      if(this.decorCanFall(d))this.applyDecorGravity(d);
    }
    this.decor=this.decor.filter(d=>!d.remove);
  },
  hitDecorTargetAt(x,y,r){
    if(!this.decor)return false;
    const rr=Math.max(1,r||1);
    for(const d of this.decor){
      if(!d||d.t!=='target'||d.remove)continue;
      const nx=clamp(x,d.x-9,d.x+9),ny=clamp(y,d.y-9,d.y+9);
      if(Math.hypot(x-nx,y-ny)>rr)continue;
      d.remove=true;
      this.flashes.push({x:d.x,y:d.y,r:26,t:10,maxT:10});
      for(let i=0;i<26&&this.parts.length<MAX_PARTICLES;i++){
        const a=RND()*6.283,sp=0.45+RND()*2.2;
        this.parts.push({x:d.x+RND()*10-5,y:d.y+RND()*10-5,
          vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-0.45,life:12+RND()*18,g:0.12,
          col:RND()<0.42?'#f0e8d8':(RND()<0.70?'#c93030':'#3a2a1d'),glow:RND()<0.18});
      }
      AU.sPop();
      this.toast('TRÄFFTAVLA SPRÄNGD!');
      return true;
    }
    return false;
  },
  igniteDecorTreeAt(x,y,r){
    if(!this.decor)return false;
    let hit=false;
    for(const d of this.decor){
      if(d.t!=='tree'||d.burning||d.remove)continue;
      const s=d.s||1,h=70*s,top=d.y-h;
      const nx=clamp(x,d.x-26*s,d.x+26*s),ny=clamp(y,top-10*s,d.y+5);
      if(Math.hypot(x-nx,y-ny)<=r+5){
        d.burning=true;d.burnT=0;d.burnDur=Math.round((3.4+this.rand()*1.0)*1000/TICK);
        AU.sTreeIgnite();
        hit=true;
      }
    }
    return hit;
  },
  igniteGrowingTreeAt(x,y,r){
    let hit=false;
    for(const tr of this.trees||[]){
      if(!tr||tr.eaten||tr.burning)continue;
      const top=tr.baseY-(tr.height||28);
      const nx=clamp(x,tr.x-13,tr.x+13),ny=clamp(y,top-4,tr.baseY+2);
      if(Math.hypot(x-nx,y-ny)<=r+5){
        this.igniteTreeFromLightning(tr,'ELDEN TÄNDE ETT TRÄD!');
        hit=true;
      }
    }
    return hit;
  },
  flamethrowerBurst(l,tick){
    if(!l||!this.T)return;
    const sc=Math.max(1,l.scale||1);
    const aim=Number.isFinite(l.manualAimAngle)?l.manualAimAngle:null;
    const d=l.dir>=0?1:-1;
    const ux=aim==null?d:Math.cos(aim), uy=aim==null?0:Math.sin(aim);
    const nx=-uy,ny=ux;
    const baseX=l.x+ux*6*sc,baseY=l.y-8*sc+uy*6*sc;
    for(let dist=8;dist<=FLAME_RANGE;dist+=6){
      const actualDist=dist*sc;
      const spread=(2+dist*0.14)*sc;
      const wob=Math.sin(dist*0.19+tick*0.55)*2.2*sc;
      const cx=baseX+ux*actualDist+nx*wob;
      const cy=baseY+uy*actualDist+ny*wob+Math.max(0,(actualDist-28*sc))*0.035;
      this.flameJetParticle(cx,cy,ux>=0?1:-1,actualDist,spread);
      if(tick%2===0)this.T.clearDisc(cx,cy,Math.round(spread));
      this.igniteGrowingTreeAt(cx,cy,spread);
      this.igniteDecorTreeAt(cx,cy,spread);
    }
    if(tick%4===0)this.debris(baseX+ux*30*sc,baseY+uy*30*sc,Math.round(3*sc));
  },
  manualPlatformAt(x,y){
    if(!this.level)return false;
    x=Math.round(x);y=Math.round(y);
    const h=this.level.hatch,e=this.level.exit;
    if(h&&x>=h.x-10&&x<=h.x+10&&y>=h.y-7&&y<=h.y-4)return true;
    if(e&&x>=e.x-11&&x<=e.x+11&&y>=e.y-24&&y<=e.y-21)return true;
    return false;
  },
  checkExit(l){
    const e=this.level.exit;
    if(Math.abs(l.x-e.x)<5&&l.y>=e.y-10&&Math.abs(l.y-e.y)<12&&(l.state==='WALK'||l.state==='SHRUG'||l.state==='MANUAL')){
      this.prepareFinalLampExit(l);
      l.x=e.x;
      l.state='EXITING';l.busyT=0;
      if(!(this.lamp&&this.lamp.exitingWith===l.id))this.dropLampIfCarrier(l,true);
    }
  },
  isFinalActiveLemming(l){
    return !(this.lems||[]).some(q=>q!==l&&q.alive&&q.alive());
  },
  prepareFinalLampExit(l){
    if(!this.lamp||!l||!this.isFinalActiveLemming(l))return false;
    const e=this.level&&this.level.exit;
    const carrying=this.lamp.holder===l.id;
    const nearLem=this.lamp.onGround&&Math.abs(this.lamp.x-l.x)<=26&&Math.abs(this.lamp.y-l.y)<=28;
    const nearExit=e&&this.lamp.onGround&&Math.abs(this.lamp.x-e.x)<=34&&Math.abs(this.lamp.y-e.y)<=34;
    if(!carrying&&!nearLem&&!nearExit)return false;
    this.lamp.holder=l.id;
    this.lamp.onGround=false;
    this.lamp.exitingWith=l.id;
    this.lamp.exitT=0;
    AU.sLamp();
    return true;
  },
  finishLemmingExit(l){
    if(!l||l.dead)return;
    if(this.lamp&&this.lamp.exitingWith===l.id){
      this.lamp=null;
    }
    l.dead=true;
    this.saved++;
    AU.sSaved();
  },
  rescueToastText(kind,ctx){
    ctx=ctx||{};
    const pools={
      fish:ctx.rescueOnly?[
        'EN FISK KOM UPP MED EN BADRING!',
        'BADRING UR DJUPET!',
        'FISKEN KOM FRAM I SISTA SEKUNDEN!'
      ]:[
        'FISKEN KASTADE EN BADRING!',
        'EN FISK GAV LEMMELN FLYTHJALP!',
        'BADRING LEVERERAD AV FISK!'
      ],
      dolphin:[
        'EN DELFIN SKJUTER UPP LEMMELN!',
        'DELFINRADDNING VID VATTENKANTEN!',
        'DELFINEN LYFTE LEMMELN TILL LAND!'
      ],
      climb:[
        'LEMMELN FICK GREPP I VAGGEN!',
        'UPP UR VATTNET - ETT STEG I TAGET!',
        'LEMMELN KLATTRAR MOT FAST MARK!'
      ]
    };
    const pool=pools[kind]||['RADDNING!'];
    const seed=[kind,this.level&&this.level.name,Math.round(ctx.x||ctx.lemX||0),Math.round(ctx.y||ctx.lemY||0),ctx.rescueOnly?'rescue':''].join('|');
    const idx=(typeof hashString==='function'?hashString(seed):seed.length)%pool.length;
    return pool[idx];
  },
  findWaterRescueSpot(l,z){
    if(!this.T||!this.level)return null;
    const leftDist=Math.abs(l.x-z.x), rightDist=Math.abs(l.x-(z.x+z.w));
    const sides=leftDist<=rightDist?[-1,1]:[1,-1];
    for(let d=6;d<=120;d+=3){
      for(const side of sides){
        const x=clamp(Math.round(l.x+side*d),5,this.level.W-6);
        const y=this.findSupplyGroundY(x);
        // Landningspunkten ska vara en riktig gångyta vid vattenkanten, inte
        // botten av dammen. Lite över vattennivån är okej; långt under är inte.
        if(y>z.y+3)continue;
        if(this.liquidAt(x,y+1,3))continue;
        if(this.T.solidBox(x,y-5,3)||this.T.solid(x,y-10))continue;
        return {x,y,dir:side<0?-1:1};
      }
    }
    return null;
  },
  tryDolphinRescue(l,z){
    if(!l||!l.alive()||z.lava)return false;
    if(this.rand()>=DOLPHIN_RESCUE_CHANCE)return false;
    const spot=this.findWaterRescueSpot(l,z);
    if(!spot)return false;
    const sx=clamp(l.x,z.x+2,z.x+z.w-2), sy=z.y+8;
    l.x=spot.x;l.y=spot.y;l.dir=spot.dir;
    l.state='WALK';l.fall=0;l.busyT=0;l.jumpT=0;l.jumpVy=0;
    l.chute=false;l.soft=true;l.glide=spot.dir;
    this.dolphins.push({sx,sy,tx:spot.x,ty:spot.y-3,t:0,dur:34,dir:spot.dir});
    AU.sDolphin();
    this.toast(this.rescueToastText('dolphin',{x:spot.x,y:spot.y}));
    for(let i=0;i<18;i++){
      const a=RND()*6.283,sp=0.45+RND()*1.4;
      this.parts.push({x:sx,y:sy-4,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1.1,life:12+RND()*12,g:0.10,col:'#a0d0ff',glow:true});
    }
    if(this.playDolphinRescueCutscene)this.playDolphinRescueCutscene(l,z,spot,sx,sy,'fullscreen');
    return true;
  },
  findNearbyRingFish(l,z){
    if(!l||!z||z.lava)return null;
    const source=z.source||z;
    let best=null,bestScore=Infinity;
    for(const f of this.ambientFish||[]){
      if(!f||f.zone!==source)continue;
      const fy=f.y||f.baseY||z.y+10;
      const dx=Math.abs((f.x||0)-l.x),dy=Math.abs(fy-l.y);
      if(dx>92||dy>34)continue;
      const score=dx+dy*0.7;
      if(score<bestScore){best=f;bestScore=score}
    }
    return best;
  },
  makeRescueRingFish(l,z){
    if(!l||!z||z.lava)return null;
    const source=z.source||z;
    const zx=Number.isFinite(z.x)?z.x:(source.x||0);
    const zw=Number.isFinite(z.w)?z.w:(source.w||0);
    if(!(zw>0))return null;
    const minX=zx+5, maxX=zx+zw-5;
    const fy=clamp(Math.round(l.y),Math.round((z.y||0)+5),Math.round(Math.min(236,(z.y||0)+26)));
    const dir=l.dir>=0?1:-1;
    const offsets=[-dir*28,dir*28,-18,18,0];
    let fx=clamp(Math.round(l.x-dir*24),minX,maxX);
    for(const off of offsets){
      const x=clamp(Math.round(l.x+off),minX,maxX);
      if(!this.T||!this.T.solid(x,fy)){fx=x;break}
    }
    return {
      zone:source,
      zoneIdx:(this.level&&Array.isArray(this.level.water))?this.level.water.indexOf(source):-1,
      x:fx,
      y:fy,
      baseY:fy,
      dir:fx<l.x?1:-1,
      p:0,
      s:0,
      spd:0,
      size:1,
      col:'#ffd060',
      rescueOnly:true
    };
  },
  tryFishSwimRing(l,z){
    if(!l||!l.alive()||!z||z.lava||l.swimRing||l.fishRingTried)return false;
    const fish=this.findNearbyRingFish(l,z)||this.makeRescueRingFish(l,z);
    if(!fish)return false;
    l.fishRingTried=true;
    if(this.rand()>=FISH_RING_CHANCE)return false;
    l.swimRing=true;
    l.state='SWIM';l.fall=0;l.busyT=0;l.jumpT=0;l.jumpVy=0;
    l.chute=false;l.soft=true;l.glide=0;
    l.y=clamp(Math.round(z.y+5),Math.round(z.y+3),Math.round(z.y+10));
    fish.giftT=28;
    fish.dir=(fish.x<l.x)?1:-1;
    this.toast(this.rescueToastText('fish',{x:l.x,y:l.y,rescueOnly:!!fish.rescueOnly}));
    for(let i=0;i<18&&this.parts.length<MAX_PARTICLES;i++){
      const a=RND()*6.283,sp=0.35+RND()*1.15;
      this.parts.push({x:l.x+RND()*8-4,y:l.y-5+RND()*5,
        vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-0.35,life:12+RND()*14,g:0.06,
        col:RND()<0.5?'#ffb040':(RND()<0.75?'#ffe070':'#d8f8ff'),glow:RND()<0.25});
    }
    const cs=this.playFishRingCutscene?this.playFishRingCutscene(l,fish,z,'fullscreen'):null;
    if(!cs&&AU.sCutscene)AU.sCutscene();
    return true;
  },
  checkLiquid(l){
    const z=this.lemmingLiquidHazard(l);
    if(!z){
      if(l&&l.state!=='SWIM')l.fishRingTried=false;
      return;
    }
    if(l.state!=='DROWN'&&l.state!=='BURN'){
      if(z.lava){
        l.swimRing=false;
        l.kill('burn');
      }else if(l.swimRing){
        if(l.state!=='SWIM'){
          l.state='SWIM';l.fall=0;l.busyT=0;l.chute=false;l.soft=true;
        }
      }else if(!this.tryFishSwimRing(l,z)&&!this.tryDolphinRescue(l,z)){
        l.kill('drown');
      }
    }
  },
  dropLampIfCarrier(l,atExit){
    if(!this.lamp||this.lamp.holder!==l.id)return;
    this.lamp.holder=null;this.lamp.onGround=true;
    this.lamp.x=l.x;this.lamp.y=l.y;
    if(atExit){this.toast('LYKTAN LÄMNAD VID UTGÅNGEN');return}
    let y=this.lamp.y,guard=0;
    while(!this.T.solid(this.lamp.x,y+1)&&y<238&&guard++<240)y++;
    this.lamp.y=y;
    // hamnade lyktan i vatten/lava? da flyter den i land vid ingangen
    const wet=!!this.liquidAt(this.lamp.x,this.lamp.y+2,0);
    if(wet){
      this.lamp.x=this.level.hatch.x;
      y=this.level.hatch.y;guard=0;
      while(!this.T.solid(this.lamp.x,y+1)&&y<238&&guard++<240)y++;
      this.lamp.y=y;
      this.toast('LYKTAN FLÖT I LAND VID INGÅNGEN!');
    }else this.toast('LYKTAN TAPPAD! PLOCKA UPP DEN!');
  },
  toast(s,ttl){
    s=String(s||'');
    if(!s)return;
    const t=Math.max(18,ttl||62);
    this.toasts=this.toasts||[];
    const last=this.toasts[0];
    if(last&&last.text===s){last.t=t;last.maxT=t;}
    else{
      this.toasts.unshift({text:s,t,maxT:t});
      if(this.toasts.length>4)this.toasts.length=4;
    }
    this.msg=s;this.msgT=t;
  },
  updateToasts(){
    if(this.msgT>0)this.msgT--;
    if(!this.toasts)return;
    for(const t of this.toasts)t.t--;
    this.toasts=this.toasts.filter(t=>t.t>0);
    if(this.toasts.length>0){this.msg=this.toasts[0].text;this.msgT=this.toasts[0].t;}
    else{this.msgT=0;}
  },

  // ---- skilltilldelning ----
  canApplySkill(l,k){
    if(!l||!l.alive())return false;
    const st=this.manualSkillState(l);
    switch(k){
      case 'climb': return !l.climber;
      case 'float': return !l.floater;
      case 'bomb':  return l.bombT<=0;
      case 'block':
      case 'build':
      case 'downbuild':
      case 'bash':
      case 'mine':
      case 'dig':   return st==='WALK';
      case 'baz':   return l.state!=='BAZ'&&l.state!=='JET'&&l.state!=='FLAME'&&l.state!=='ROPE';
      case 'jet':   return l.state!=='JET'&&l.state!=='BAZ'&&l.state!=='FLAME'&&l.state!=='ROPE';
      case 'flame': return l.state!=='FLAME'&&l.state!=='BAZ'&&l.state!=='JET'&&l.state!=='ROPE';
      case 'rope':  return st==='WALK'||st==='FALL'||st==='SHRUG'||l.state==='SWIM';
    }
    return false;
  },
  applySkill(l,k){
    if(!this.canApplySkill(l,k))return false;
    const originalDir=l.dir||1;
    const manualAim=k==='jet'?null:this.manualAimFor(l,k);
    this.releaseManualForSkill(l,k);
    if(manualAim!=null){
      l.manualAimAngle=manualAim;
      l.dir=Math.cos(manualAim)>=0?1:-1;
    }else{
      l.manualAimAngle=null;
    }
    switch(k){
      case 'climb': l.climber=true; return true;
      case 'float': l.floater=true; return true;
      case 'bomb':  l.bombT=5*16+1; return true;
      case 'block': l.blockDir=l.dir||1;l.state='BLOCK'; return true;
      case 'build': l.state='BUILD';l.busyT=0;l.bricks=0; return true;
      case 'downbuild': l.state='DBUILD';l.busyT=0;l.bricks=0; return true;
      case 'bash':  l.state='BASH';l.busyT=0; return true;
      case 'mine':  l.state='MINE';l.busyT=0; return true;
      case 'dig':   l.state='DIG';l.busyT=0; return true;
      case 'baz':
        l.jumpT=0;l.jumpVy=0;l.state='BAZ';l.busyT=0;l.afterBazState=null; return true;
      case 'jet':
        l.dir=originalDir;
        l.jumpT=0;l.jumpVy=0;l.state='JET';l.fuel=120;l.jetT=0;l.jetBlockedT=0;l.fall=0;
        l.soft=true;l.glide=l.dir;AU.sJet(); return true;
      case 'flame':
        l.jumpT=0;l.jumpVy=0;l.state='FLAME';l.busyT=0;l.afterBazState=null; return true;
    }
    return false;
  },
  skillHitScore(l,wx,wy,k){
    const action=k==='baz'||k==='jet'||k==='flame'||k==='rope';
    const sc=Math.max(1,l.scale||1);
    const rx=(action?34:15)*sc, ry=(action?32:18)*sc;
    const dx=Math.abs(l.x-wx), dy=Math.abs((l.y-6*sc)-wy);
    const norm=(dx/rx)*(dx/rx)+(dy/ry)*(dy/ry);
    const body=dx<=11*sc&&wy>=l.y-18*sc&&wy<=l.y+5;
    if(!body&&norm>1.0)return Infinity;
    return body?norm*0.2:norm;
  },
  findSkillTarget(wx,wy,k){
    let usable=null,usableScore=Infinity,near=null,nearScore=Infinity;
    for(const l of this.lems){
      if(!l.alive())continue;
      const s=this.skillHitScore(l,wx,wy,k);
      if(!Number.isFinite(s))continue;
      if(s<nearScore){near=l;nearScore=s}
      if(this.canApplySkill(l,k)&&s<usableScore){usable=l;usableScore=s}
    }
    return {usable,near};
  },
  cancelBlockerAt(wx,wy){
    let best=null,bestScore=Infinity;
    for(const l of this.lems){
      if(!l||l.dead||l.state!=='BLOCK')continue;
      const sc=Math.max(1,l.scale||1);
      const dx=Math.abs(l.x-wx),dy=Math.abs((l.y-6*sc)-wy);
      const body=dx<=11*sc&&wy>=l.y-18*sc&&wy<=l.y+5;
      const norm=(dx/(16*sc))*(dx/(16*sc))+(dy/(20*sc))*(dy/(20*sc));
      if(!body&&norm>1.0)continue;
      const score=body?norm*0.2:norm;
      if(score<bestScore){best=l;bestScore=score}
    }
    if(!best)return false;
    const wasDir=best.blockDir||best.dir||1;
    best.dir=wasDir>0?-1:1;
    best.blockDir=null;
    best.busyT=0;best.fall=0;
    best.state=(this.T&&this.T.solid(best.x,best.y+1))?'WALK':'FALL';
    this.skillSpark(best,'block');
    AU.sAssign();
    this.toast('BLOCKERING AVBRUTEN');
    return true;
  },
  findLemById(id){return this.lems.find(l=>l.id===id&&!l.dead)||null},
  clickWorld(wx,wy){
    const k=this.selSkill;
    if(k!=='bomb'&&k!=='troll'&&this.cancelBlockerAt(wx,wy))return true;
    if(!k)return false;
    if(k==='rope')return this.handleRopeClick(wx,wy);
    if(k==='troll')return this.transformLemmingToTrollAt(wx,wy);
    if(!this.skills||this.skills[k]<=0){
      const s=SKILLS.find(q=>q.k===k);
      this.toast('INGA '+(s?s.name:k)+' KVAR');
      AU.sShrug();
      return false;
    }
    if(k==='bomb'&&this.bombMonkeyAt(wx,wy)){
      this.skills[k]--;
      if(this.skills[k]<=0)this.selSkill=null;
      return true;
    }
    const hit=this.findSkillTarget(wx,wy,k);
    if(hit.usable&&this.applySkill(hit.usable,k,wx,wy)){
      this.skillSpark(hit.usable,k);
      this.skills[k]--;
      if(this.skills[k]<=0)this.selSkill=null;
      AU.sAssign();
      return true;
    }
    if(hit.near){
      AU.sShrug();
      this.toast('KAN INTE ANVÄNDA DEN JUST NU');
    }else if(k==='baz'||k==='jet'||k==='flame'){
      this.toast('KLICKA NÄRMARE EN LEMMEL');
    }
    return false;
  },
  findTrollTransformTarget(wx,wy){
    let best=null,bestScore=Infinity;
    for(const l of this.lems||[]){
      if(!l.alive||!l.alive())continue;
      const s=this.skillHitScore(l,wx,wy,'troll');
      if(Number.isFinite(s)&&s<bestScore){best=l;bestScore=s}
    }
    return best;
  },
  transformLemmingToTrollAt(wx,wy){
    if(this.trollUsed){this.toast('TROLLFÖRVANDLING REDAN ANVÄND');AU.sShrug();return false}
    if(!this.level||!this.T)return false;
    const l=this.findTrollTransformTarget(wx,wy);
    if(!l){this.toast('KLICKA PÅ EN LEMMEL');AU.sShrug();return false}
    const y=this.trollGroundY(l.x,l.y);
    const t=this.makeTroll(l.x,y,l.dir||1,Math.max(1,l.scale||1),{playerMade:true});
    if(!t){this.toast('TROLLFÖRVANDLING MISSLYCKADES');AU.sShrug();return false}
    if(this.manual&&this.manual.active&&this.manual.lemId===l.id)this.stopManualControl('dead');
    this.dropLampIfCarrier(l);
    l.dead=true;
    l.ropeId=null;
    this.skillSpark(t,'troll');
    this.trollUsed=true;
    this.selSkill=null;
    this.toast('LEMMELN BLEV ETT TROLL!');
    return true;
  },
  skillName(k){
    const s=SKILLS.find(q=>q.k===k);
    return s?s.name:k;
  },
  pickSupplySkill(){
    const candidates=SKILLS.map(s=>s.k);
    let total=0;
    const weights=candidates.map(k=>{
      const count=this.skills&&this.skills[k]||0;
      const action=(k==='baz'||k==='jet'||k==='flame'||k==='rope');
      const w=Math.max(1,8-Math.min(7,count))*(action?1.25:1.0);
      total+=w;
      return w;
    });
    let roll=this.rand()*total;
    for(let i=0;i<candidates.length;i++){
      roll-=weights[i];
      if(roll<=0)return candidates[i];
    }
    return candidates[candidates.length-1]||'build';
  },
  pickSupplyPayload(forceMega){
    const cfg=this.chaosConfig();
    if(forceMega)return {kind:'mega',skill:'mega'};
    // Första dropen är fortfarande oftast praktisk bazooka/jetpack. Specialpaket
    // får komma senare, men !-paketet är hårt gated tills 90% av tiden gått.
    const allowSpecial=this.supplyDrops>0&&!this.megaBoom&&!this.megaArmed;
    const allowMega=allowSpecial&&!this.supplyMegaDropped&&this.isMegaAllowed();
    const r=this.rand();
    if(allowMega){
      if(this.supplyMegaPlanned&&this.supplyDrops>=this.supplyMegaForceAt)return {kind:'mega',skill:'mega'};
      if(r<cfg.megaChance)return {kind:'mega',skill:'mega'};
    }
    if(allowSpecial&&r<cfg.treeChance)return {kind:'tree',skill:'tree'};
    return {kind:'skill',skill:this.pickSupplySkill()};
  },
  supplyPayloadName(payload){
    const kind=payload&&payload.kind||((payload&&payload.skill)==='tree'?'tree':((payload&&payload.skill)==='mega'?'mega':'skill'));
    if(kind==='mega')return 'UTROPSTECKENPAKET';
    if(kind==='tree')return 'FRÅGEPAKET';
    return this.skillName(payload&&payload.skill);
  },
  isSupplyWaterX(x){
    if(!this.level||!this.level.water)return false;
    return this.visibleLiquidAtX(x,18);
  },
  findSupplyGroundY(x){
    if(!this.T)return 220;
    const xx=clamp(x|0,2,this.T.W-3);
    for(let y=8;y<this.T.H-2;y++){
      if(!this.T.solid(xx,y)&&this.T.solid(xx,y+1))return y;
    }
    return this.T.H-8;
  },
  initLevelLootPackages(){
    const loot=this.level&&this.level.loot;
    if(!Array.isArray(loot)||!loot.length)return;
    for(const item of loot){
      if(!item||!item.skill)continue;
      const x=clamp(Math.round(item.x),4,this.level.W-4);
      const y=clamp(Math.round(item.y),12,this.T.H-8);
      this.packages.push({
        x,y,vx:0,vy:0,kind:'skill',skill:item.skill,
        landed:true,opened:false,openT:0,picked:false,loot:true,
        landX:x,landY:y,treeBaseY:null
      });
    }
  },
  initLevelRescues(){
    const rescues=this.level&&this.level.rescues;
    if(!Array.isArray(rescues)||!rescues.length)return;
    for(let i=0;i<rescues.length;i++){
      const r=rescues[i]||{};
      const b=r.button||{}, rel=r.release||{}, op=r.open||{};
      this.rescues.push({
        id:i+1,
        buttonX:Math.round(b.x||rel.x||0),buttonY:Math.round(b.y||rel.y||0),
        releaseX:Math.round(rel.x||b.x||0),releaseY:Math.round(rel.y||b.y||0),
        openX:Math.round(op.x==null?(rel.x||0)-6:op.x),openY:Math.round(op.y==null?(rel.y||0):op.y),
        openW:Math.max(4,Math.round(op.w||12)),openH:Math.max(4,Math.round(op.h||18)),
        count:Math.max(1,Math.round(r.count||1)),dir:r.dir>=0?1:-1,
        opened:false,released:0,releaseT:0,p:RND()*7
      });
    }
  },
  openRescue(r){
    if(!r||r.opened)return false;
    r.opened=true;
    r.releaseT=1;
    // Buren är visuell: öppningen ska inte gräva bort material under fångarna.
    this.toast('LUCKAN ÖPPNADES - FÅNGADE LEMLAR FRIA!');
    AU.sSaved();
    for(let i=0;i<14&&this.parts.length<MAX_PARTICLES;i++){
      this.parts.push({x:r.buttonX+RND()*12-6,y:r.buttonY-6+RND()*5,vx:RND()*1.2-0.6,vy:-0.8-RND()*0.8,life:12+RND()*10,g:0.12,col:RND()<0.5?'#80d8ff':'#ffd060',glow:RND()<0.25});
    }
    return true;
  },
  releaseRescueLemming(r){
    const l=new Lemming(r.releaseX+(r.released%2?2:-2),r.releaseY);
    l.state='FALL';l.dir=r.dir||1;l.soft=true;l.fall=0;l.captive=true;
    this.lems.push(l);
    r.released++;
    AU.sLetsGo();
    for(let i=0;i<8&&this.parts.length<MAX_PARTICLES;i++){
      this.parts.push({x:l.x+RND()*8-4,y:l.y-6+RND()*6,vx:RND()*0.9-0.45,vy:-0.45-RND()*0.55,life:10+RND()*8,g:0.10,col:'#d8f0ff',glow:RND()<0.18});
    }
  },
  updateLevelRescues(){
    if(!this.rescues||!this.rescues.length)return;
    for(const r of this.rescues){
      if(!r.opened){
        for(const l of this.lems||[]){
          if(!l.alive||!l.alive())continue;
          if(Math.abs(l.x-r.buttonX)<=8&&Math.abs(l.y-r.buttonY)<=9){
            this.openRescue(r);
            break;
          }
        }
      }
      if(r.opened&&r.released<r.count){
        r.releaseT--;
        if(r.releaseT<=0){
          this.releaseRescueLemming(r);
          r.releaseT=10;
        }
      }
    }
  },
  pickSupplyDropX(){
    const L=this.level, margin=55;
    if(!L)return this.viewCenterX();
    // Slumpa på riktigt per flygning. Ibland i aktuell vy så paketet är
    // spelbart, ibland över hela banan så det inte alltid faller på samma ställe.
    const vw=this.viewW();
    const useView=L.W>vw&&this.rand()<0.48;
    let min=useView?this.cam+45:margin;
    let max=useView?this.cam+vw-45:L.W-margin;
    min=clamp(min,margin,L.W-margin);
    max=clamp(max,min,L.W-margin);

    const recent=this.supplyRecentXs||[];
    let best=min+(max-min)*this.rand(), bestScore=-Infinity;
    for(let i=0;i<40;i++){
      let x=min+(max-min)*this.rand();
      // En liten extra jitter gör att två flygplan inte får identisk mållinje
      // även om kameran står stilla och intervallet är smalt.
      x=clamp(x+(this.rand()*2-1)*35,margin,L.W-margin);
      const groundY=this.findSupplyGroundY(x);
      let score=0;
      score+=this.isSupplyWaterX(x)?-260:90;          // undvik vatten/lava-drop om möjligt
      score+=groundY<this.T.H-12?40:-40;             // föredra riktig mark över botten
      if(this.supplyLastX!=null)score+=Math.min(220,Math.abs(x-this.supplyLastX))*0.38;
      for(const rx of recent)score-=Math.max(0,115-Math.abs(x-rx))*1.2;
      score+=this.rand()*45;
      if(score>bestScore){bestScore=score;best=x}
    }
    this.supplyLastX=best;
    recent.push(best);
    while(recent.length>4)recent.shift();
    this.supplyRecentXs=recent;
    return best;
  },
  scheduleSupplyDrop(forceMega){
    if(!this.canUseSupplyPlanes())return false;
    const payload=this.pickSupplyPayload(!!forceMega);
    if(payload&&payload.kind==='mega'){this.supplyMegaDropped=true;this.supplyLateMegaScheduled=true}
    const targetX=this.pickSupplyDropX();
    const groundY=this.findSupplyGroundY(targetX);
    const ok=this.queueDirectedEvent('supplyPlane',this.chaosConfig().supplyWarn,{payload,targetX,x:targetX,y:groundY-20,label:'FLYGPLAN SNART'},false);
    if(ok)this.toast('VARNING: FLYGPLAN SNART');
    return ok;
  },
  spawnSupplyPlane(payload,targetX){
    if(!this.canUseSupplyPlanes())return null;
    payload=payload||this.pickSupplyPayload();
    if(payload&&payload.kind==='mega')this.supplyMegaDropped=true;
    const support=!!(payload&&payload.monkeyAirSupport)||!!this.monkeyAirSupportPending;
    const dir=this.rand()<0.5?1:-1;
    if(support&&targetX==null&&this.monkeyAirSupportTargetX!=null)targetX=this.monkeyAirSupportTargetX;
    targetX=targetX==null?this.pickSupplyDropX():targetX;
    const plane={
      x:dir>0?-55:this.level.W+55,
      y:18+this.rand()*26,
      vx:dir*(3.0+this.rand()*0.8),
      targetX,
      kind:payload.kind,
      skill:payload.skill,
      dropped:support&&payload.kind==='support',
      monkeyAirSupport:support,
      monkeyMissileCooldown:0
    };
    if(support){
      this.monkeyAirSupportPending=false;
      this.monkeyAirSupportTargetX=null;
    }
    this.planes.push(plane);
    this.toast(support&&payload.kind==='support'?'LUFTSTÖD INKOMMANDE!':'FLYGPLAN MED PAKET!');
    return plane;
  },
  supplyPlaneHitScore(a,wx,wy,scale){
    if(!a||a.crashing||a.wrecked)return Infinity;
    const sc=Math.max(1,scale||1);
    const dx=Math.abs(a.x-wx), dy=Math.abs(a.y-wy);
    const body=dx<=30&&dy<=16;
    const norm=(dx/(34+4*sc))*(dx/(34+4*sc))+(dy/(18+2*sc))*(dy/(18+2*sc));
    if(!body&&norm>1)return Infinity;
    return body?norm*0.2:norm;
  },
  hitSupplyPlaneAt(wx,wy,scale){
    if(Math.max(1,scale||1)<2)return null;
    let best=null,bestScore=Infinity;
    for(const a of this.planes||[]){
      const s=this.supplyPlaneHitScore(a,wx,wy,scale);
      if(s<bestScore){best=a;bestScore=s}
    }
    return best;
  },
  pickSupplyPlaneForTroll(t){
    if(!t||this.trollScale(t)<2)return null;
    let best=null,bestScore=Infinity;
    for(const a of this.planes||[]){
      if(!a||a.crashing||a.wrecked)continue;
      const dx=Math.abs(a.x-t.x), dy=t.y-a.y;
      if(dx>520||dy<70||dy>230)continue;
      const ahead=(a.x-t.x)*(t.dir||1);
      const score=dx+Math.abs(dy-155)*0.45+(ahead<-45?120:0);
      if(score<bestScore){best=a;bestScore=score}
    }
    return best;
  },
  crashPlaneSmoke(x,y,hot){
    if(this.parts.length>=MAX_PARTICLES)return;
    const fire=hot&&this.rand()<0.45;
    if(fire){
      this.parts.push({x:x+this.rand()*8-4,y:y+this.rand()*5-3,vx:this.rand()*0.22-0.11,vy:-0.18-this.rand()*0.28,
        life:13+this.rand()*11,g:-0.006,col:this.rand()<0.45?'#ffd040':'#ff7020',glow:true});
      return;
    }
    const life=58+this.rand()*42;
    this.parts.push({x:x+this.rand()*10-5,y:y+this.rand()*7-4,vx:this.rand()*0.18-0.09,vy:-0.08-this.rand()*0.15,
      life,maxLife:life,g:-0.001,col:this.rand()<0.55?'#5f5f5f':'#858585',smoke:true,size:this.rand()<0.35?3:2,seed:this.rand()*6.283});
  },
  pickCrashedPlaneLootSkills(){
    const pool=SKILLS.map(s=>s.k), out=[];
    while(out.length<3&&pool.length){
      const i=Math.floor(this.rand()*pool.length);
      out.push(pool.splice(i,1)[0]);
    }
    return out;
  },
  dropCrashedPlaneLoot(a){
    if(!a||a.crashLootDropped||!this.level)return false;
    a.crashLootDropped=true;
    const skills=this.pickCrashedPlaneLootSkills();
    const offsets=[-18,0,18];
    for(let i=0;i<skills.length;i++){
      const x=clamp(Math.round(a.x+offsets[i]+this.rand()*8-4),5,this.level.W-5);
      const y=clamp(Math.round(this.findSupplyGroundY(x)-5),12,this.T.H-8);
      this.packages.push({x,y,vx:0,vy:0,kind:'skill',skill:skills[i],landed:true,opened:false,openT:0,picked:false,loot:true,crashLoot:true,landX:x,landY:y,treeBaseY:null});
      this.pickupSparkle(x,y,'loot',1);
    }
    return true;
  },
  damageSupplyPlane(a,x,y){
    if(!a||a.crashing||a.wrecked)return false;
    a.crashing=true;
    a.dropped=true;
    a.vx*=0.42;
    a.vy=0.35+this.rand()*0.25;
    a.crashT=0;
    a.spin=0;
    this.sunSurpriseT=Math.max(this.sunSurpriseT||0,Math.round(2000/TICK));
    this.flashes.push({x,y,r:46,t:10,maxT:10});
    for(let i=0;i<22&&this.parts.length<MAX_PARTICLES;i++)this.crashPlaneSmoke(x,y,true);
    this.shakeT=Math.max(this.shakeT,8);this.shakePow=Math.max(this.shakePow,4);
    AU.sTrollSmash();
    this.toast('JÄTTETROLLET TRÄFFADE FLYGPLANET!');
    return true;
  },
  finishSupplyPlaneCrash(a){
    if(!a||a.wrecked)return false;
    a.crashing=false;
    a.wrecked=true;
    a.vx=0;a.vy=0;
    a.x=clamp(a.x,8,this.level.W-8);
    a.y=this.findSupplyGroundY(a.x);
    a.wreckT=0;
    this.dropCrashedPlaneLoot(a);
    this.flashes.push({x:a.x,y:a.y-8,r:84,t:14,maxT:14});
    for(let i=0;i<34&&this.parts.length<MAX_PARTICLES;i++)this.crashPlaneSmoke(a.x,a.y-10,true);
    this.debris(a.x,a.y-5,18);
    this.shakeT=Math.max(this.shakeT,14);this.shakePow=Math.max(this.shakePow,6);
    AU.sBigBoom();
    this.toast('FLYGPLANET STÖRTADE - TRE PAKET FÖLL UR!');
    return true;
  },
  updateWreckedSupplyPlane(a){
    if(!a||!a.wrecked)return false;
    a.wreckT=(a.wreckT||0)+1;
    // Vraket ska leva kvar visuellt utan att spamma partiklar. Röken är
    // långsam och lågintensiv, med bara enstaka varma puffar från branden.
    if(a.wreckT%14===0)this.crashPlaneSmoke(a.x-9+this.rand()*7,a.y-13-this.rand()*3,false);
    if(a.wreckT%50===7)this.crashPlaneSmoke(a.x-14+this.rand()*8,a.y-11-this.rand()*4,true);
    return true;
  },
  updateCrashingSupplyPlane(a){
    if(!a||!this.level||!this.T)return false;
    a.crashT=(a.crashT||0)+1;
    a.x=clamp(a.x+(a.vx||0),5,this.level.W-5);
    a.vy=Math.min(3.4,(a.vy||0)+0.075);
    a.y+=a.vy;
    if(a.crashT%2===0)this.crashPlaneSmoke(a.x-10*(a.vx>=0?1:-1),a.y,true);
    if(a.crashT%7===0)AU.sPlane();
    const gy=this.findSupplyGroundY(a.x);
    if(a.y>=gy-5||a.y>=this.T.H-8)return this.finishSupplyPlaneCrash(a);
    return false;
  },
  supplyTouchesLemming(p,l,oldX,oldY){
    // Paketet ska kunna fångas både när det landar bredvid en lemmel och när
    // det faktiskt faller rakt på huvudet. Därför används en svept box mellan
    // föregående och aktuell paketposition, inte bara ett punktavstånd.
    const px0=oldX==null?p.x:oldX, py0=oldY==null?p.y:oldY;
    const minX=Math.min(px0,p.x)-9, maxX=Math.max(px0,p.x)+9;
    const minY=Math.min(py0,p.y)-18, maxY=Math.max(py0,p.y)+10;
    const sc=Math.max(1,l.scale||1);
    const lx0=l.x-6*sc, lx1=l.x+6*sc, ly0=l.y-17*sc, ly1=l.y+3;
    if(maxX<lx0||minX>lx1||maxY<ly0||minY>ly1)return false;
    return true;
  },
  tryPickupSupplyPackage(p,oldX,oldY){
    if(!p||p.opened)return false;
    for(const l of this.lems){
      if(!l.alive())continue;
      if(this.supplyTouchesLemming(p,l,oldX,oldY)){
        const kind=p.kind||((p.skill==='tree')?'tree':((p.skill==='mega')?'mega':'skill'));
        if(kind==='tree'){
          p.landX=Math.round(l.x);
          p.landY=Math.round(l.y);
          p.treeBaseY=this.findTreeGroundYAtLevel(l.x,l.y);
        }
        p.x=(p.x+l.x)/2;
        p.y=Math.min(p.y,l.y-8*Math.max(1,l.scale||1));
        p.opened=true;p.picked=true;p.landed=true;p.openT=0;p.vx=0;p.vy=0;
        this.pickupSparkle(p.x,p.y,p.loot?'loot':kind,Math.max(1,l.scale||1));
        const openedMsg=this.openSupplyPackage(p);
        if(openedMsg)this.toast(openedMsg);
        return true;
      }
    }
    return false;
  },
  openSupplyPackage(p){
    const kind=p&&p.kind||((p&&p.skill)==='tree'?'tree':((p&&p.skill)==='mega'?'mega':'skill'));
    if(kind==='mega'){
      this.armMegaBoom(p.x,p.y);
      return '!!! UTROPSTECKENPAKET ARMAT !!!';
    }
    if(kind==='tree'){
      this.grantSupplyTreeFromPackage(p);
      return 'FRÅGEPAKET: TRÄD VÄXER!';
    }
    this.grantSupplySkill(p.skill,p.x,p.y);
    return (p&&p.loot?'LOOT HÄMTAT':'PAKET HÄMTAT')+': +1 '+this.skillName(p.skill);
  },
  grantSupplyTreeFromPackage(p){
    if(!p)return null;
    const x=clamp(Math.round(p.landX==null?p.x:p.landX),42,this.level.W-42);
    const baseY=Math.round(p.treeBaseY==null?this.findTreeGroundY(x):p.treeBaseY);
    const ticks=Math.round((1.6+this.rand()*0.7)*1000/TICK);
    this.queueDirectedEvent('treeGrow',ticks,{x,baseY,message:'FRÅGEPAKET: TRÄD VÄXER!',label:'FRÖ GROR HÄR'},true);
    p.treeSpawned=true;
    for(let i=0;i<18;i++){
      const a=RND()*6.283,sp=0.35+RND()*1.35;
      this.parts.push({x,y:baseY-10,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-0.9,life:16+RND()*14,g:0.11,
        col:RND()<0.5?'#40b850':'#8a552c',glow:false});
    }
    return null;
  },
  grantSupplySkill(k,x,y){
    this.skills[k]=(this.skills[k]||0)+1;
    this.toast('PAKET: +1 '+this.skillName(k));
    AU.sSaved();
    for(let i=0;i<14;i++){
      const a=RND()*6.283,sp=0.4+RND()*1.5;
      this.parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-0.8,life:14+RND()*12,g:0.12,
        col:k==='jet'?'#ffb040':(k==='flame'?'#ff7030':'#b8d8ff'),glow:true});
    }
  },
  shouldScheduleLateMegaSupply(){
    return !!(this.supplyMegaPlanned&&!this.supplyMegaDropped&&!this.supplyLateMegaScheduled&&this.isMegaAllowed()&&this.supplyDrops>=this.supplyMax&&!this.megaBoom&&!this.megaArmed);
  },
  updateSupplyDrops(){
    if(!this.canUseSupplyPlanes()){
      this.planes=[];
      this.queuedEvents=this.queuedEvents.filter(q=>q.kind!=='supplyPlane');
      this.warnings=this.warnings.filter(w=>w.kind!=='supplyPlane');
    }else{
      const cfg=this.chaosConfig();
      const lateMega=this.shouldScheduleLateMegaSupply();
      if(this.supplyDrops<this.supplyMax||lateMega){
        this.supplyT--;
        if(lateMega)this.supplyT=Math.min(this.supplyT,1);
        if(this.supplyT<=0){
          if(this.canStartDirectedEvent('supplyPlane')){
            if(this.scheduleSupplyDrop(lateMega)){
              this.supplyDrops++;
              this.supplyT=Math.round((cfg.supplyGapMin+this.rand()*cfg.supplyGapRange)*1000/TICK);
            }else this.supplyT=Math.round(4*1000/TICK);
          }else this.supplyT=Math.round(3*1000/TICK);
        }
      }

      for(const a of this.planes){
        if(a.wrecked){this.updateWreckedSupplyPlane(a);continue}
        if(a.crashing){this.updateCrashingSupplyPlane(a);continue}
        if(a.missileFlashT>0)a.missileFlashT--;
        a.x+=a.vx;
        this.updateMonkeyAirSupportPlane(a);
        if(a.x>this.cam-120&&a.x<this.cam+this.viewW()+120)AU.sPlane();
        if(!a.dropped&&((a.vx>0&&a.x>=a.targetX)||(a.vx<0&&a.x<=a.targetX))){
          this.packages.push({x:a.x,y:a.y+10,vx:a.vx*0.05,vy:0,kind:a.kind||((a.skill==='tree')?'tree':((a.skill==='mega')?'mega':'skill')),skill:a.skill,landed:false,opened:false,openT:0,picked:false,landX:null,landY:null,treeBaseY:null});
          a.dropped=true;
          AU.sClick();
        }
      }
      this.planes=this.planes.filter(a=>a.wrecked||a.crashing||a.x>-80&&a.x<this.level.W+80);
    }

    for(const p of this.packages){
      // Kontrollera pickup både före och efter fysiksteget. Det löser fallet
      // där paketet släpps direkt på en lemmel och visuellt hamnar på huvudet.
      if(!p.opened)this.tryPickupSupplyPackage(p);

      if(!p.landed&&!p.opened){
        const oldX=p.x, oldY=p.y;
        p.vy=Math.min(2.2,p.vy+0.07);
        p.x=clamp(p.x+p.vx,2,this.level.W-3);
        p.y+=p.vy;
        if(!this.tryPickupSupplyPackage(p,oldX,oldY)){
          if(p.y>=this.T.H-5||this.T.solidBox(p.x,p.y+5,3)){
            let yy=Math.min(p.y,this.T.H-8),guard=0;
            while(this.T.solidBox(p.x,yy+5,3)&&yy>0&&guard++<80)yy--;
            p.y=yy;p.vx=0;p.vy=0;p.landed=true;p.openT=0;
            p.landX=Math.round(p.x);p.landY=Math.round(p.y);p.treeBaseY=this.findTreeGroundYAtLevel(p.x,p.y);
            if(p.kind==='mega'||p.skill==='mega'){
              p.opened=true;p.picked=false;p.openT=0;
              const openedMsg=this.openSupplyPackage(p);
              if(openedMsg)this.toast(openedMsg);
            }else{
              this.toast('PAKET LANDADE - PLOCKA UPP DET!');
              this.tryPickupSupplyPackage(p,oldX,oldY);
            }
          }
        }
      }

      if(!p.opened)this.tryPickupSupplyPackage(p);
      if(p.opened)p.openT++;
    }
    this.packages=this.packages.filter(p=>!p.picked&&(!p.opened||p.openT<140));
  },

  pickMonkeyBananaTarget(m){
    const L=this.level;
    const margin=16;
    if(!L||!this.T)return {x:m.x+(m.dir||1)*120,y:180};

    // Försök ibland kasta mot en lemmel som faktiskt är nära apan. Om ingen
    // lemmel är nära blir målet en markyta längre fram i färdriktningen.
    const nearby=this.lems.filter(l=>l.alive()&&Math.abs(l.x-m.x)<190);
    let tx,ty;
    if(nearby.length>0&&this.rand()<0.55){
      const l=nearby[Math.floor(this.rand()*nearby.length)];
      tx=l.x+(this.rand()*28-14);
      ty=l.y-6;
    }else{
      const ahead=85+this.rand()*170;
      tx=m.x+(m.dir||1)*ahead+(this.rand()*56-28);
      tx=clamp(tx,margin,L.W-margin);
      const gy=this.findSupplyGroundY(tx);
      ty=gy-5;
    }

    tx=clamp(tx,margin,L.W-margin);
    const groundY=this.findSupplyGroundY(tx);
    ty=clamp(Math.min(ty,groundY-3),44,222);
    return {x:tx,y:ty};
  },
  scheduleMonkeyEvent(){
    if(!this.level||this.isDarkLevel())return false;
    const dir=this.rand()<0.5?1:-1;
    const x=dir>0?8:this.level.W-8;
    return this.queueDirectedEvent('monkey',this.chaosConfig().monkeyWarn,{dir,x,y:58,label:'APA KOMMER FRÅN '+(dir>0?'VÄNSTER':'HÖGER')},false);
  },
  spawnMonkey(opts){
    if(!this.level||this.isDarkLevel())return;
    opts=opts||{};
    const L=this.level;
    const dir=opts.dir||((this.rand()<0.5)?1:-1);
    const speed=1.05+this.rand()*0.45;
    const startX=dir>0?-72:L.W+72;
    const y=clamp(opts.y==null?44+this.rand()*50:opts.y,30,112);
    const bananaCount=1+Math.floor(this.rand()*3);
    const travelFrames=Math.max(120,Math.ceil((L.W+144)/speed));
    const throwSchedule=[];
    for(let i=0;i<bananaCount;i++){
      const base=travelFrames*(i+1)/(bananaCount+1);
      const jitter=(this.rand()*0.16-0.08)*travelFrames;
      throwSchedule.push(clamp(Math.round(base+jitter),36,travelFrames-28));
    }
    throwSchedule.sort((a,b)=>a-b);
    this.monkeys.push({
      id:(this.monkeySeq=(this.monkeySeq||0)+1),
      x:startX,y,dir,vx:dir*speed,age:0,throwSchedule,throwIndex:0,
      bananaCount,travelFrames,endX:dir>0?L.W+78:-78
    });
    this.toast('APA MED '+bananaCount+' BANAN'+(bananaCount===1?'':'ER')+'!');
    AU.sMonkey();
  },
  throwBanana(m){
    const target=this.pickMonkeyBananaTarget(m);
    const sx=m.x+m.dir*9, sy=m.y+2;
    const dx=target.x-sx, dy=target.y-sy;
    const dist=Math.abs(dx);
    const frames=clamp(28+dist/8,32,68);
    const g=0.145;
    const vx=dx/frames;
    const vy=(dy-0.5*g*frames*frames)/frames;
    this.bananas.push({x:sx,y:sy,vx,vy,g,life:Math.ceil(frames)+48,spin:0,hit:false});
    AU.sMonkey();
  },
  bananaBlastCenter(x,y,vx,vy){
    if(!this.T)return {x,y};
    let cx=clamp(Math.round(x),4,this.T.W-5);
    let cy=clamp(Math.round(y),4,this.T.H-5);

    // Bananen träffar ofta ovansidan av marken. Om explosionen då ritas med
    // centrum exakt i första solida pixeln blir kratern grundare och små
    // materialstumpar kan bli kvar. Lemming-bomben exploderar däremot ungefär
    // vid kroppen, några pixlar ovanför fot-/marknivån. Återskapa samma
    // geometri genom att låsa centrum till lokal markyta när bananen faller.
    if(vy==null||vy>=-0.25){
      const y0=Math.max(4,cy-10), y1=Math.min(this.T.H-3,cy+18);
      for(let yy=y0;yy<=y1;yy++){
        if(!this.T.solid(cx,yy-1)&&this.T.solid(cx,yy)){
          cy=clamp(yy-5,4,this.T.H-5);
          break;
        }
      }
    }

    // Vid sidoträffar flytta centrum en aning ut från väggen, annars kan
    // bananen detonera för djupt inne i materialet och lämna en ful läpp.
    const side=vx?Math.sign(vx):0;
    if(side&&this.T.solid(cx,cy)&&!this.T.solid(cx-side*3,cy)){
      cx=clamp(cx-side*5,4,this.T.W-5);
    }
    return {x:cx,y:cy};
  },
  cleanBananaCrater(x,y,r){
    if(!this.T)return;
    x=Math.round(x);y=Math.round(y);r=Math.round(r);
    // Extra överlappande rensning gör bananexplosionen lika "ren" som en
    // lemming-bomb. Det tar bort tunna mitt-stumpar utan att göra en fyrkantig
    // gruva av hela kratern.
    const lower=Math.round(r*0.24);
    const side=Math.round(r*0.28);
    this.T.clearDisc(x,y+lower,Math.round(r*0.76));
    this.T.clearDisc(x-side,y+Math.round(r*0.08),Math.round(r*0.58));
    this.T.clearDisc(x+side,y+Math.round(r*0.08),Math.round(r*0.58));
    this.T.clearDisc(x,y-Math.round(r*0.22),Math.round(r*0.48));
    this.T.clearDisc(x-side,y+lower,Math.round(r*0.46));
    this.T.clearDisc(x+side,y+lower,Math.round(r*0.46));
    this.T.clearDisc(x,y,Math.round(r*0.50));
  },
  bananaExplode(x,y,vx,vy){
    const c=this.bananaBlastCenter(x,y,vx,vy);
    const r=26;
    this.explode(c.x,c.y,r,true,'banana');
    this.cleanBananaCrater(c.x,c.y,r);
    for(let i=0;i<30;i++){
      const a=RND()*6.283,sp=0.9+RND()*3.1;
      this.parts.push({x:c.x,y:c.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1.5,life:16+RND()*22,g:0.18,
        col:RND()<0.65?'#ffd040':(RND()<0.80?'#ffb020':'#ff7020'),glow:true});
    }
  },
  bananaSplash(x,y){
    if(!this.parts)return;
    for(let i=0;i<10&&this.parts.length<MAX_PARTICLES;i++){
      const side=RND()<0.5?-1:1, sp=0.18+RND()*0.75;
      this.parts.push({
        x:x+RND()*5-2.5,y:y-1+RND()*3,
        vx:side*sp,vy:-0.30-RND()*0.65,
        life:8+RND()*10,maxLife:18,g:0.08,
        col:RND()<0.58?'#b8efff':'#7fc8e8',
        water:true,glow:RND()<0.12
      });
    }
  },
  monkeyHitScore(m,wx,wy){
    if(!m||m.gone)return Infinity;
    const dx=Math.abs(m.x-wx), dy=Math.abs((m.y-1)-wy);
    const body=dx<=20&&wy>=m.y-20&&wy<=m.y+18;
    const norm=(dx/28)*(dx/28)+(dy/24)*(dy/24);
    if(!body&&norm>1.0)return Infinity;
    return body?norm*0.2:norm;
  },
  findMonkeyTarget(wx,wy){
    let best=null,bestScore=Infinity;
    for(const m of this.monkeys||[]){
      const s=this.monkeyHitScore(m,wx,wy);
      if(s<bestScore){best=m;bestScore=s}
    }
    return best;
  },
  findMonkeyById(id){
    return (this.monkeys||[]).find(m=>m&&!m.gone&&m.id===id)||null;
  },
  monkeyHasIncomingMissile(m){
    return !!(m&&(this.rockets||[]).some(r=>r&&!r.hit&&r.kind==='monkeyMissile'&&r.targetMonkeyId===m.id));
  },
  pickMonkeyMissilePlane(m){
    if(!m)return null;
    let best=null,bestScore=Infinity;
    for(const a of this.planes||[]){
      if(!a||a.crashing||a.wrecked)continue;
      const dx=Math.abs(a.x-m.x),dy=Math.abs(a.y-m.y);
      const score=dx+dy*0.65+(a.dropped?22:0);
      if(score<bestScore){best=a;bestScore=score}
    }
    return best;
  },
  queueMonkeyAirSupport(m){
    if(!m||m.gone)return false;
    if(!this.canUseSupplyPlanes()){
      this.toast('INGET FLYGPLAN KAN KOMMA HÄR');
      AU.sShrug();
      return false;
    }
    this.monkeyAirSupportPending=true;
    this.monkeyAirSupportTargetX=Math.round(m.x);
    const alreadyQueued=(this.queuedEvents||[]).some(q=>q&&q.kind==='supplyPlane'&&q.data&&q.data.payload&&q.data.payload.monkeyAirSupport);
    if(!alreadyQueued){
      const targetX=clamp(Math.round(m.x),20,(this.level&&this.level.W||m.x)-20);
      this.queueDirectedEvent('supplyPlane',Math.round(1200/TICK),{
        payload:{kind:'support',skill:null,monkeyAirSupport:true},
        targetX,x:targetX,y:m.y-24,label:'LUFTSTÖD SNART'
      },true);
    }
    this.toast('LUFTSTÖD INKALLAT - NÄSTA FLYGPLAN SKJUTER APOR!');
    return true;
  },
  requestMonkeyAirSupport(m){
    if(!m||m.gone)return false;
    if(!m.id)m.id=(this.monkeySeq=(this.monkeySeq||0)+1);
    const a=this.pickMonkeyMissilePlane(m);
    if(a){
      a.monkeyAirSupport=true;
      a.monkeyMissileCooldown=Math.min(a.monkeyMissileCooldown||0,4);
      return this.launchPlaneMissileAtMonkey(m,a)||true;
    }
    return this.queueMonkeyAirSupport(m);
  },
  launchPlaneMissileAtMonkey(m,plane){
    if(!m||m.gone)return false;
    if(!m.id)m.id=(this.monkeySeq=(this.monkeySeq||0)+1);
    if(this.monkeyHasIncomingMissile(m))return true;
    const a=plane||this.pickMonkeyMissilePlane(m);
    if(!a)return false;
    const sx=a.x,sy=a.y+8;
    const dx=m.x-sx,dy=(m.y-3)-sy,dist=Math.max(1,Math.hypot(dx,dy));
    const speed=7.2;
    this.rockets.push({
      kind:'monkeyMissile',x:sx,y:sy,vx:dx/dist*speed,vy:dy/dist*speed,g:0,
      life:Math.max(28,Math.ceil(dist/speed)+24),dir:dx>=0?1:-1,scale:1,
      targetMonkeyId:m.id,speed,hit:false
    });
    a.missileFlashT=8;
    this.toast('MISSIL AVFYRAD MOT APAN!');
    if(AU.sMissileLaunch)AU.sMissileLaunch();else AU.sBazooka();
    return true;
  },
  updateMonkeyAirSupportPlane(a){
    if(!a||!a.monkeyAirSupport||a.crashing||a.wrecked)return false;
    if(a.monkeyMissileCooldown>0){a.monkeyMissileCooldown--;return false}
    let best=null,bestScore=Infinity;
    for(const m of this.monkeys||[]){
      if(!m||m.gone)continue;
      if(!m.id)m.id=(this.monkeySeq=(this.monkeySeq||0)+1);
      if(this.monkeyHasIncomingMissile(m))continue;
      const score=Math.abs(m.x-a.x)+Math.abs(m.y-a.y)*0.35;
      if(score<bestScore){best=m;bestScore=score}
    }
    if(!best)return false;
    if(this.launchPlaneMissileAtMonkey(best,a)){
      a.monkeyMissileCooldown=8;
      return true;
    }
    return false;
  },
  dismissMonkey(m,kind,x,y){
    if(!m||m.gone)return false;
    const px=x==null?m.x:x, py=y==null?m.y:clamp(y,12,VH-8);
    m.gone=true;
    this.monkeyEvents=Math.max(0,(this.monkeyEvents||0)-1);
    this.monkeyT=Math.round((16+this.rand()*12)*1000/TICK);
    this.flashes.push({x:px,y:py,r:72,t:12,maxT:12});
    for(let i=0;i<32&&this.parts.length<MAX_PARTICLES;i++){
      const a=RND()*6.283,sp=0.55+RND()*2.4;
      this.parts.push({x:px,y:py,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-0.8,life:14+RND()*18,g:0.12,
        col:RND()<0.45?'#8a512c':(RND()<0.70?'#c58b55':'#ffd040'),glow:RND()<0.25});
    }
    if(kind==='rock'){AU.sPop();this.toast('TROLLET SKRÄMDE BORT APAN!')}
    else if(kind==='missile'){AU.sBazookaExplosion();this.toast('MISSILEN SPRÄNGDE APAN!')}
    else{AU.sLemmingExplosion();this.toast('APAN SPRÄNGD - DEN KOMMER TILLBAKA SENARE')}
    return true;
  },
  bombMonkeyAt(wx,wy){
    const m=this.findMonkeyTarget(wx,wy);
    if(!m)return false;
    return this.requestMonkeyAirSupport(m);
  },
  updateMonkeyEvents(){
    if(this.isDarkLevel()){
      this.monkeys=[];
      this.bananas=[];
      this.monkeyEvents=0;
      return;
    }
    if(this.monkeyEvents<this.monkeyMax){
      this.monkeyT--;
      if(this.monkeyT<=0){
        if(this.scheduleMonkeyEvent()){
          this.monkeyEvents++;
          this.monkeyT=Math.round((36+this.rand()*38)*1000/TICK);
        }else this.monkeyT=Math.round((5+this.rand()*6)*1000/TICK);
      }
    }

    for(const m of this.monkeys){
      m.age++;
      m.x+=m.vx;
      while(m.throwSchedule&&m.throwIndex<m.throwSchedule.length&&m.age>=m.throwSchedule[m.throwIndex]){
        this.throwBanana(m);
        m.throwIndex++;
      }
    }
    this.monkeys=this.monkeys.filter(m=>!m.gone&&(m.dir>0?m.x<=this.level.W+90:m.x>=-90));

    for(const b of this.bananas){
      if(b.hit)continue;
      b.life--;b.spin++;
      b.vy+=b.g;
      const steps=Math.max(1,Math.ceil(Math.max(Math.abs(b.vx),Math.abs(b.vy))));
      for(let i=0;i<steps&&!b.hit;i++){
        b.x+=b.vx/steps;b.y+=b.vy/steps;
        const liquid=this.liquidAt(b.x,b.y,2);
        if(liquid&&!liquid.lava&&!this.T.solidBox(b.x,b.y,2)){
          this.bananaSplash(b.x,Math.max(liquid.y+2,b.y));
          b.hit=true;
        }else if(this.T.solidBox(b.x,b.y,2)||b.y>=this.T.H-4){
          this.bananaExplode(b.x,clamp(b.y,4,this.T.H-5),b.vx,b.vy);
          b.hit=true;
        }
        if(b.x<2||b.x>this.level.W-2||b.y<-20||b.y>this.T.H+16||b.life<=0)b.hit=true;
      }
      if(!b.hit&&this.parts.length<420){
        this.parts.push({x:b.x,y:b.y,vx:-b.vx*0.05,vy:-0.1,life:5,g:0,col:'#ffd040',glow:false});
      }
    }
    this.bananas=this.bananas.filter(b=>!b.hit);
  },
  steerMonkeyMissile(r){
    const m=this.findMonkeyById(r.targetMonkeyId);
    if(!m)return null;
    const speed=r.speed||7.2;
    const dx=m.x-r.x,dy=(m.y-3)-r.y,dist=Math.max(1,Math.hypot(dx,dy));
    r.vx=r.vx*0.64+(dx/dist)*speed*0.36;
    r.vy=r.vy*0.64+(dy/dist)*speed*0.36;
    const v=Math.max(0.1,Math.hypot(r.vx,r.vy));
    r.vx=r.vx/v*speed;r.vy=r.vy/v*speed;
    r.dir=r.vx>=0?1:-1;
    return m;
  },
  updateMonkeyMissile(r,T,L){
    let m=this.steerMonkeyMissile(r);
    if(!m){r.hit=true;return}
    const steps=Math.max(1,Math.ceil(Math.max(Math.abs(r.vx),Math.abs(r.vy))));
    for(let i=0;i<steps&&!r.hit;i++){
      r.x+=r.vx/steps;r.y+=r.vy/steps;
      m=this.findMonkeyById(r.targetMonkeyId);
      if(!m){r.hit=true;break}
      if(Math.hypot(m.x-r.x,(m.y-3)-r.y)<=8){
        this.dismissMonkey(m,'missile',r.x,r.y);
        r.hit=true;
      }else if(T.solidBox&&T.solidBox(r.x,r.y,2)){
        this.explode(r.x,r.y,18,true,'bazooka');
        r.hit=true;
      }
      if(!r.hit&&(r.x<2||r.x>L.W-2||r.y<-20||r.y>T.H+20||r.life<=0))r.hit=true;
    }
    if(!r.hit&&this.parts.length<400){
      this.parts.push({x:r.x-r.vx*0.35,y:r.y-r.vy*0.35,vx:-r.vx*0.035,vy:-r.vy*0.035,life:7,g:0,col:'#ffb040',glow:true});
    }
  },
  updateBazookaRocket(r,T,L){
    r.vy+=(r.g||0);
    const rScale=Math.max(1,r.scale||1),hitR=Math.max(2,Math.round(2*rScale));
    const steps=Math.max(1,Math.ceil(Math.max(Math.abs(r.vx),Math.abs(r.vy))));
    for(let i=0;i<steps&&!r.hit;i++){
      r.x+=r.vx/steps;r.y+=r.vy/steps;
      if(this.hitDecorTargetAt(r.x,r.y,Math.max(10,hitR+7))){
        r.hit=true;
      }else if(this.isInGoalZone(r.x,r.y,2)){
        this.goalSpark(r.x,r.y);
        r.hit=true;
      }else if(T.solidBox(r.x,r.y,hitR)){
        if(this.isInGoalZone(r.x,r.y,24*rScale))this.goalSpark(r.x,r.y);
        else this.explode(r.x,r.y,30*rScale,true,'bazooka');
        r.hit=true;
      }
      if(!r.hit&&(r.x<2||r.x>L.W-2||r.y<0||r.y>T.H+20||r.life<=0))r.hit=true;
    }
    if(!r.hit&&this.parts.length<400)
      this.parts.push({x:r.x-(r.dir||Math.sign(r.vx))*3,y:r.y,vx:0,vy:-0.2,life:7,g:0,col:'#aaaaaa'});
  },
  updateRockets(){
    const T=this.T,L=this.level;
    if(!T||!L)return;
    for(const r of this.rockets||[]){
      r.life--;
      if(r.kind==='monkeyMissile')this.updateMonkeyMissile(r,T,L);
      else this.updateBazookaRocket(r,T,L);
    }
    this.rockets=(this.rockets||[]).filter(r=>!r.hit);
  },



  isNewLevelWithTrolls(){return !!(this.level&&!this.isDarkLevel())},
  trollScale(t){return Math.max(1,t&&t.scale||1)},
  makeTroll(x,y,dir,scale,opts){
    const t={x,y,dir:dir||1,age:0,chewT:0,targetId:null,stepT:0,scale:Math.max(1,scale||1),
      rockT:Math.round((2.0+this.rand()*2.5)*1000/TICK),life:Math.round((42+this.rand()*26)*TROLL_LIFE_SCALE*1000/TICK)};
    if(opts&&opts.playerMade)t.playerMade=true;
    this.trolls.push(t);
    this.trollLastX=t.x;
    AU.sTroll();
    return t;
  },
  trollGroundY(x,fromY){
    if(!this.T)return 220;
    const xx=clamp(Math.round(x),5,this.T.W-6);
    const start=fromY==null?8:clamp(Math.round(fromY)-18,8,this.T.H-4);
    for(let y=start;y<this.T.H-3;y++){
      if(!this.T.solid(xx,y)&&this.T.solid(xx,y+1))return y;
    }
    return this.findSupplyGroundY(xx);
  },
  pickTrollEntry(){
    const L=this.level;
    if(!L)return {x:20,y:200,dir:1};
    const dir=this.rand()<0.5?1:-1;
    let x=dir>0?18:L.W-18;
    // Om det finns träd, låt trollet oftare komma från den sida som gör
    // det relevant för spelaren i stället för att bara vandra i tomma delar.
    const living=(this.trees||[]).filter(t=>!t.eaten);
    if(living.length&&this.rand()<0.75){
      const t=living[Math.floor(this.rand()*living.length)];
      x=t.x<(L.W/2)?18:L.W-18;
    }
    const y=this.trollGroundY(x);
    return {x,y,dir:x<L.W/2?1:-1};
  },
  scheduleTrollEvent(){
    if(!this.isNewLevelWithTrolls()||!this.level||!this.T)return false;
    const e=this.pickTrollEntry();
    return this.queueDirectedEvent('troll',this.chaosConfig().trollWarn||Math.round(2000/TICK),{x:e.x,y:e.y-20,entry:e,label:'TROLL PÅ VÄG'},false);
  },
  spawnTroll(data){
    if(!this.isNewLevelWithTrolls()||!this.level||!this.T)return null;
    const e=(data&&data.entry)||this.pickTrollEntry();
    const t=this.makeTroll(e.x,e.y,e.dir||1,1);
    this.toast('ETT TROLL VANDRAR IN!');
    return t;
  },
  treeById(id){return (this.trees||[]).find(t=>t.id===id&&!t.eaten&&!t.burning)||null},
  findTreeForTroll(t){
    if(!t||!this.trees)return null;
    const sc=this.trollScale(t);
    let best=null,bestD=1e9;
    for(const tr of this.trees){
      if(tr.eaten||tr.burning)continue;
      const dx=Math.abs(tr.x-t.x),dy=Math.abs((tr.baseY||t.y)-t.y);
      if(dx<bestD&&dx<42*sc&&dy<28*sc){best=tr;bestD=dx}
    }
    return best;
  },
  clearTreeShape(tr,extra){
    if(!tr||!this.T)return;
    const e=extra||0,x=tr.x,base=tr.baseY,height=tr.height||28;
    const top=base-height;
    // Rensa samma ungefärliga pixel-form som trädet målades med. Det minskar
    // risken att trollet råkar göra stora hål i underliggande plattformar.
    this.T.clearRect(x-3-e,base-Math.round(height*0.68)-e,7+2*e,Math.round(height*0.68)+1+e);
    this.T.clearRect(x-12-e,top+2-e,25+2*e,22+2*e);
    this.T.clearRect(x-8-e,top-1-e,17+2*e,9+2*e);
  },
  trollEatTree(t,tr){
    if(!t||!tr||tr.eaten)return false;
    const sc=this.trollScale(t);
    const prev=t.chewT||0;
    t.chewT=prev+sc;
    t.dir=tr.x>=t.x?1:-1;
    if(Math.floor(prev/6)!==Math.floor(t.chewT/6)){
      const biteR=Math.round((6+((t.chewT/6)|0)%3)*sc);
      const bx=tr.x+(this.rand()*2-1)*7*sc, by=tr.baseY-(tr.height||28)*0.45+this.rand()*14;
      this.T.clearDisc(bx,by,biteR);
      this.debris(bx,by,Math.round(5*sc));
      AU.sTrollMunch();
      if(Math.floor(prev/18)!==Math.floor(t.chewT/18))AU.sTroll();
    }
    if(t.chewT>=30){
      this.clearTreeShape(tr,Math.ceil(sc));
      tr.eaten=true;
      this.toast('TROLLET ÅT UPP ETT TRÄD!');
      AU.sTrollBurp();
      for(let i=0;i<Math.round(18*sc)&&this.parts.length<MAX_PARTICLES;i++){
        const a=RND()*6.283,sp=0.45+RND()*1.4;
        this.parts.push({x:tr.x,y:tr.baseY-(tr.height||28)/2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-0.7,life:14+RND()*14,g:0.10,col:RND()<0.5?'#40b850':'#8a552c'});
      }
      t.chewT=0;t.targetId=null;
      return true;
    }
    return false;
  },
  trollWallAhead(t){
    if(!t||!this.T)return false;
    const sc=this.trollScale(t);
    const d=t.dir>=0?1:-1;
    let hits=0;
    for(let dx=8*sc;dx<=18*sc;dx+=Math.max(2,2*sc)){
      for(let dy=-25*sc;dy<=0;dy+=3){
        if(this.T.solid(t.x+d*dx,t.y+dy)&&++hits>=7)return true;
      }
    }
    return false;
  },
  trollWallHasStairs(t){
    if(!t||!this.T||!this.T.stairBox)return false;
    const sc=this.trollScale(t);
    const d=t.dir>=0?1:-1;
    const step=Math.max(2,Math.round(2*sc));
    const r=Math.max(2,Math.round(2*sc));
    for(let dx=4*sc;dx<=34*sc;dx+=step){
      for(let dy=-36*sc;dy<=2*sc;dy+=step){
        if(this.T.stairBox(t.x+d*dx,t.y+dy,r))return true;
      }
    }
    return false;
  },
  clearTrollWallBite(t,finishing){
    if(!t||!this.T)return;
    if(this.trollWallHasStairs(t))return;
    const sc=this.trollScale(t);
    const d=t.dir>=0?1:-1;
    const max=t.rageMax||TROLL_RAGE_TICKS;
    const elapsed=max-(t.rageT||0);
    const p=clamp(elapsed/max,0,1);
    const x=t.x+d*(5+Math.round(p*23))*sc;
    const wob=(elapsed%3)-1;
    const cuts=[
      {x:x,y:t.y-23*sc+wob,r:Math.round(5*sc)},
      {x:x+d*2*sc,y:t.y-17*sc-wob,r:Math.round(6*sc)},
      {x:x+d*sc,y:t.y-10*sc+wob,r:Math.round(6*sc)},
      {x:x+d*2*sc,y:t.y-4*sc,r:Math.round(5*sc)}
    ];
    if(finishing){
      const x1=t.x+d*8*sc;
      const x2=t.x+d*22*sc;
      cuts.push({x:x1,y:t.y-22*sc,r:Math.round(6*sc)},{x:x1+d*2*sc,y:t.y-15*sc,r:Math.round(7*sc)},{x:x1,y:t.y-8*sc,r:Math.round(7*sc)},{x:x1+d*sc,y:t.y-2*sc,r:Math.round(5*sc)});
      cuts.push({x:x2,y:t.y-22*sc,r:Math.round(6*sc)},{x:x2+d*2*sc,y:t.y-15*sc,r:Math.round(7*sc)},{x:x2,y:t.y-8*sc,r:Math.round(7*sc)},{x:x2+d*sc,y:t.y-2*sc,r:Math.round(5*sc)});
    }
    for(const c of cuts)this.T.clearDisc(c.x,c.y,c.r);
    if(finishing){
      this.clearTrollWallEntry(t);
      this.clearTrollWallHeadroom(t);
    }
    this.debris(x,t.y-12*sc,Math.round((finishing?10:6)*sc));
  },
  clearTrollWallEntry(t){
    if(!t||!this.T)return;
    const sc=this.trollScale(t);
    const d=t.dir>=0?1:-1;
    const x0=Math.round(Math.min(t.x-d*2*sc,t.x+d*14*sc));
    const x1=Math.round(Math.max(t.x-d*2*sc,t.x+d*14*sc));
    const y0=Math.round(t.y-28*sc);
    const y1=Math.round(t.y+1*sc);
    this.T.clearRect(x0,y0,x1-x0+1,y1-y0+1);
  },
  clearTrollWallHeadroom(t){
    if(!t||!this.T)return 0;
    const sc=this.trollScale(t);
    const d=t.dir>=0?1:-1;
    const minX=Math.round(d>0?t.x+2*sc:t.x-36*sc);
    const maxX=Math.round(d>0?t.x+36*sc:t.x-2*sc);
    const y0=Math.round(t.y-36*sc);
    const y1=Math.round(t.y-24*sc);
    const air0=Math.round(t.y-23*sc);
    const air1=Math.round(t.y-8*sc);
    let cleared=0;
    for(let x=Math.max(1,minX);x<=Math.min(this.T.W-2,maxX);x++){
      let openBelow=false, solidAbove=false;
      for(let y=air0;y<=air1;y+=Math.max(1,Math.round(3*sc))){
        if(!this.T.solid(x,y)){openBelow=true;break}
      }
      if(!openBelow)continue;
      for(let y=y0;y<=y1;y++){
        if(this.T.solid(x,y)){solidAbove=true;break}
      }
      if(!solidAbove)continue;
      this.T.clearRect(x,y0,1,y1-y0+1);
      cleared++;
    }
    return cleared;
  },
  clearTrollWallMouth(t){
    if(!t||!this.T)return;
    if(this.trollWallHasStairs(t))return;
    const sc=this.trollScale(t);
    const d=t.dir>=0?1:-1;
    const x=d>0?Math.round(t.x+2*sc):Math.round(t.x-24*sc);
    const y=Math.round(t.y-27*sc);
    // Rensa en sammanhängande startöppning direkt vid trollets slagyta.
    // De progressiva cirklarna såg bra ut, men kunde lämna en tunn rest längst
    // in i väggen som var visuellt liten men fortfarande blockerade lemlar.
    this.T.clearRect(x,y,Math.round(22*sc),Math.round(28*sc));
    this.clearTrollWallEntry(t);
    this.T.clearDisc(t.x+d*7*sc,t.y-20*sc,Math.round(8*sc));
    this.T.clearDisc(t.x+d*9*sc,t.y-11*sc,Math.round(9*sc));
    this.T.clearDisc(t.x+d*8*sc,t.y-3*sc,Math.round(7*sc));
    this.clearTrollWallHeadroom(t);
    this.debris(t.x+d*10*sc,t.y-12*sc,Math.round(8*sc));
  },
  startTrollWallRage(t){
    if(!t||!this.T||!this.trollWallAhead(t)||this.trollWallHasStairs(t))return false;
    t.rageT=TROLL_RAGE_TICKS;
    t.rageMax=TROLL_RAGE_TICKS;
    t.rageHitT=0;
    t.chewT=0;
    t.targetId=null;
    this.clearTrollWallMouth(t);
    AU.sTrollUgh();
    return true;
  },
  updateTrollWallRage(t){
    if(!t||!t.rageT)return false;
    if(this.trollWallHasStairs(t)){t.rageT=0;t.dir*=-1;return true}
    t.stepT++;
    t.rageT--;
    const elapsed=(t.rageMax||TROLL_RAGE_TICKS)-t.rageT;
    if(elapsed%4===1||t.rageT<=0){
      this.clearTrollWallBite(t,t.rageT<=0);
      AU.sTrollSmash();
      this.shakeT=Math.max(this.shakeT,3);
      this.shakePow=Math.max(this.shakePow,2);
    }
    if(t.rageT<=0){
      t.rageT=0;
      t.x+=t.dir*1.5;
    }
    return true;
  },
  moveTroll(t){
    if(!t||!this.T||!this.level)return;
    if(this.updateTrollWallRage(t))return;
    const sc=this.trollScale(t);
    t.stepT++;
    const speed=0.72;
    let nx=t.x+t.dir*speed, ny=t.y;
    if(nx<8*sc||nx>this.level.W-8*sc){t.dir*=-1;return}
    if(this.T.solid(nx,ny-8*sc)){
      if(this.startTrollWallRage(t))return;
      t.dir*=-1;return
    }
    if(this.T.solid(nx,ny)){
      let up=0;
      while(this.T.solid(nx,ny)&&up<8*sc){ny--;up++}
      if(up>=8*sc){
        if(this.startTrollWallRage(t))return;
        t.dir*=-1;return
      }
    }else{
      let down=0;
      while(!this.T.solid(nx,ny+1)&&down<10*sc){ny++;down++}
      if(down>=10*sc){t.dir*=-1;return}
    }
    t.x=nx;t.y=ny;
    if(t.stepT%24===1)AU.sTrollStep();
    if(t.stepT%96===13&&this.rand()<0.28)AU.sTroll();
    if(t.stepT%150===37&&this.rand()<0.34)AU.sTrollUgh();
  },
  pickMonkeyForTroll(t){
    let best=null,bestD=1e9;
    for(const m of this.monkeys||[]){
      if(!m||m.gone)continue;
      const dx=Math.abs(m.x-t.x), dy=t.y-m.y;
      if(dx<380&&dy>28&&dy<190&&dx<bestD){best=m;bestD=dx}
    }
    return best;
  },
  throwTrollRock(t,m){
    if(!t||!m)return false;
    const sc=this.trollScale(t);
    const sx=t.x+(m.x>=t.x?1:-1)*9*sc, sy=t.y-22*sc;
    const frames=clamp(32+Math.abs(m.x-sx)/8,34,74);
    const g=0.18;
    const tx=m.x+(m.vx||0)*frames*0.72+(this.rand()*26-13);
    const ty=m.y-4+(this.rand()*18-9);
    const vx=(tx-sx)/frames;
    const vy=(ty-sy-0.5*g*frames*frames)/frames;
    this.trollRocks.push({x:sx,y:sy,vx,vy,g,life:Math.ceil(frames)+42,spin:0,hit:false,scale:sc});
    t.dir=m.x>=t.x?1:-1;
    AU.sTrollUgh();
    return true;
  },
  tryTrollThrowAtMonkey(t){
    if(!t||t.chewT>0||t.rageT>0)return false;
    if(t.rockT==null)t.rockT=Math.round((1.5+this.rand()*2.0)*1000/TICK);
    const plane=this.pickSupplyPlaneForTroll(t);
    const m=this.pickMonkeyForTroll(t);
    if(plane)t.rockT-=3;
    else if(m)t.rockT-=2;
    else return false;
    t.rockT--;
    if(t.rockT>0)return false;
    t.rockT=Math.round((3.5+this.rand()*4.5)*1000/TICK);
    if(plane)return this.throwTrollRock(t,plane);
    if(!m||this.rand()>0.82)return false;
    return this.throwTrollRock(t,m);
  },
  trollRockLandingSurface(r){
    if(!this.T||!r)return null;
    const sc=Math.max(1,r.scale||1);
    const x=clamp(Math.round(r.x),4,this.T.W-5);
    const y0=clamp(Math.round(r.y-8*sc),2,this.T.H-3);
    const y1=clamp(Math.round(r.y+12*sc),y0,this.T.H-2);
    for(let y=y0;y<=y1;y++){
      if(this.T.solid(x,y)&&!this.T.solid(x,y-1)){
        const rStair=Math.max(2,Math.round(3*sc));
        if((this.T.stair&&this.T.stair(x,y))||(this.T.stairBox&&this.T.stairBox(x,y,rStair)))return null;
        return {x,y:y-1};
      }
    }
    return null;
  },
  nearbySettledTrollRock(x,y,sc){
    const nearX=Math.max(10,Math.round(12*Math.max(1,sc||1)));
    const nearY=Math.max(5,Math.round(5*Math.max(1,sc||1)));
    for(const r of this.settledTrollRocks||[]){
      if(!r)continue;
      const rs=Math.max(1,r.scale||1);
      const groundY=r.groundY==null?r.y+Math.round(2*rs):r.groundY;
      if(Math.abs(r.x-x)<=nearX&&Math.abs(groundY-y)<=nearY)return r;
    }
    return null;
  },
  settleTrollRock(r){
    const surf=this.trollRockLandingSurface(r);
    if(!surf||!this.T)return false;
    const sc=Math.max(1,r.scale||1);
    if(this.liquidAt&&this.liquidAt(surf.x,surf.y+2,2))return false;
    if(this.nearbySettledTrollRock(surf.x,surf.y,sc)){
      this.debris(surf.x,surf.y,Math.round(5*sc));
      return true;
    }
    this.debris(surf.x,surf.y,Math.round(4*sc));
    const buriedPx=Math.max(1,Math.round(sc));
    this.settledTrollRockSeq=(this.settledTrollRockSeq||0)+1;
    const rock={
      id:this.settledTrollRockSeq,
      x:surf.x,
      y:surf.y-buriedPx,
      groundY:surf.y,
      buriedPx,
      scale:sc,
      spin:(r.spin||0)&3,
      settled:true
    };
    (this.settledTrollRocks=this.settledTrollRocks||[]).push(rock);
    if(this.settledTrollRocks.length>28)this.settledTrollRocks.shift();
    return true;
  },
  findSettledTrollRockForLemming(l){
    if(!l||!l.alive||!l.alive())return null;
    const dir=l.dir>=0?1:-1;
    let best=null,bestAhead=1e9;
    for(const r of this.settledTrollRocks||[]){
      if(!r)continue;
      const rs=Math.max(1,r.scale||1);
      const groundY=r.groundY==null?r.y+Math.round(2*rs):r.groundY;
      if(Math.abs(groundY-l.y)>Math.max(6,Math.round(5*rs)))continue;
      const ahead=(r.x-l.x)*dir;
      const trigger=Math.max(5,Math.round(6*rs+3));
      if(ahead>=1&&ahead<=trigger&&ahead<bestAhead){best=r;bestAhead=ahead}
    }
    return best;
  },
  updateTrollRocks(){
    for(const r of this.trollRocks||[]){
      if(r.hit)continue;
      const sc=Math.max(1,r.scale||1);
      r.life--;r.spin++;
      r.vy+=r.g||0;
      const steps=Math.max(1,Math.ceil(Math.max(Math.abs(r.vx),Math.abs(r.vy))));
      for(let i=0;i<steps&&!r.hit;i++){
        r.x+=r.vx/steps;r.y+=r.vy/steps;
        const plane=this.hitSupplyPlaneAt(r.x,r.y,sc);
        const m=plane?null:this.findMonkeyTarget(r.x,r.y);
        if(plane){
          this.damageSupplyPlane(plane,r.x,r.y);
          r.hit=true;
        }else if(m){
          this.dismissMonkey(m,'rock',r.x,r.y);
          r.hit=true;
        }else if(this.T&&(this.T.solidBox(r.x,r.y,Math.round(2*sc))||r.y>=this.T.H-4)){
          if(!this.settleTrollRock(r)){
            this.debris(r.x,r.y,Math.round(7*sc));
            AU.sPop();
          }
          r.hit=true;
        }
        if(r.x<2||r.x>this.level.W-2||r.y<-30||(this.T&&r.y>this.T.H+18)||r.life<=0)r.hit=true;
      }
    }
    this.trollRocks=(this.trollRocks||[]).filter(r=>!r.hit);
  },
  updateTrollEvents(){
    const dark=this.isDarkLevel();
    if(dark){
      this.trolls=(this.trolls||[]).filter(t=>t&&t.playerMade);
      this.trollEvents=0;
    }
    if(this.megaBoom||this.megaArmed)return;
    if(!dark&&!this.isNewLevelWithTrolls())return;
    if(!dark&&this.trollEvents<this.trollMax){
      const hasTree=(this.trees||[]).some(t=>!t.eaten);
      this.trollT-=hasTree?2:1;
      if(this.trollT<=0){
        if(this.canStartDirectedEvent('troll')&&this.scheduleTrollEvent()){
          this.trollEvents++;
          this.trollT=Math.round((hasTree?38:58+this.rand()*42)*TROLL_EVENT_SLOWDOWN*1000/TICK);
        }else this.trollT=Math.round((7+this.rand()*8)*1000/TICK);
      }
    }
    for(const tr of this.trees||[])if(tr.eaten)tr.removeT=(tr.removeT||0)+1;
    this.trees=(this.trees||[]).filter(tr=>!tr.eaten||tr.removeT<10);
    for(const t of this.trolls){
      t.age++;t.life--;
      const sc=this.trollScale(t);
      let tr=this.treeById(t.targetId)||this.findTreeForTroll(t);
      if(tr){
        t.targetId=tr.id;
        if(Math.abs(t.x-tr.x)>13*sc){t.dir=tr.x>t.x?1:-1;this.moveTroll(t)}
        else this.trollEatTree(t,tr);
      }else{t.targetId=null;t.chewT=0;this.moveTroll(t)}
      this.tryTrollThrowAtMonkey(t);
    }
    this.trolls=(this.trolls||[]).filter(t=>t.life>0&&t.x>-50&&t.x<this.level.W+50);
  },

  isTreeWaterX(x){
    if(!this.level||!this.level.water)return false;
    return this.visibleLiquidAtX(x,22);
  },
  findTreeGroundY(x){
    if(!this.T)return 220;
    const xx=clamp(x|0,4,this.T.W-5);
    for(let y=10;y<this.T.H-3;y++){
      // Kräv några pixlar fast mark under så trädet inte väljer en tunn kant
      // eller en överhängande enstaka pixel.
      if(!this.T.solid(xx,y)&&this.T.solid(xx,y+1)&&this.T.solid(xx-2,y+1)&&this.T.solid(xx+2,y+1))return y;
    }
    return this.T.H-8;
  },
  treePlacementScore(x,baseY){
    const L=this.level;
    let score=0;
    if(this.isTreeWaterX(x))score-=420; else score+=90;
    score+=baseY<this.T.H-12?55:-80;
    if(L){
      score-=Math.max(0,54-Math.abs(x-L.hatch.x))*5.0;
      score-=Math.max(0,58-Math.abs(x-L.exit.x))*5.5;
    }
    if(this.treeLastX!=null)score+=Math.min(240,Math.abs(x-this.treeLastX))*0.24;
    for(const t of this.trees||[])score-=Math.max(0,90-Math.abs(x-t.x))*2.0;
    for(const l of this.lems||[])if(l.alive&&l.alive())score-=Math.max(0,34-Math.abs(x-l.x))*3.0;
    score+=this.rand()*50;
    return score;
  },
  pickTreeSpot(){
    const L=this.level, margin=42;
    if(!L)return {x:this.viewCenterX(),baseY:200};
    // Träd ska kännas spontana men spelbara: oftast i eller nära aktuell vy,
    // ibland längre bort på banan så världen fortsätter förändras.
    const vw=this.viewW();
    const useView=L.W>vw&&this.rand()<0.62;
    let min=useView?this.cam+35:margin;
    let max=useView?this.cam+vw-35:L.W-margin;
    min=clamp(min,margin,L.W-margin);
    max=clamp(max,min,L.W-margin);
    let bestX=min+(max-min)*this.rand(), bestY=this.findTreeGroundY(bestX), bestScore=-Infinity;
    for(let i=0;i<56;i++){
      let x=min+(max-min)*this.rand();
      x=clamp(x+(this.rand()*2-1)*28,margin,L.W-margin);
      const baseY=this.findTreeGroundY(x);
      const score=this.treePlacementScore(x,baseY);
      if(score>bestScore){bestScore=score;bestX=x;bestY=baseY}
    }
    return {x:Math.round(bestX),baseY:Math.round(bestY)};
  },
  spawnGrowingTreeAt(x,baseY,message){
    if(!this.level||!this.T)return null;
    const height=Math.round(24+this.rand()*10);       // ungefär 2-3 lemlar högt
    const growFrames=Math.round((2.4+this.rand()*1.9)*1000/TICK); // ca 2.4-4.3 s
    const tree={id:'tree'+((this.treeSeq=(this.treeSeq||0)+1)),x:clamp(Math.round(x),42,this.level.W-42),baseY:Math.round(baseY),height,growFrames,age:0,done:false,eaten:false,removeT:0,seed:RND(),fromPackage:message&&message.indexOf('FRÅGEPAKET')>=0};
    this.trees.push(tree);
    this.treeLastX=tree.x;
    if(message)this.toast(message);
    AU.sGrow();
    return tree;
  },
  scheduleGrowingTree(){
    if(!this.level||!this.T)return false;
    const spot=this.pickTreeSpot();
    return this.queueDirectedEvent('treeGrow',this.chaosConfig().treeWarn,{x:spot.x,baseY:spot.baseY,message:'ETT TRÄD BÖRJAR VÄXA!',label:'FRÖ I MARKEN'},false);
  },
  spawnGrowingTree(){
    if(!this.level||!this.T)return null;
    const spot=this.pickTreeSpot();
    return this.spawnGrowingTreeAt(spot.x,spot.baseY,'ETT TRÄD BÖRJAR VÄXA!');
  },
  paintTreeRect(tree,x,y,w,h,col,revealTop){
    if(!this.T)return;
    let x0=Math.round(x),y0=Math.round(y),x1=Math.round(x+w),y1=Math.round(y+h);
    y0=Math.max(y0,Math.round(revealTop));
    y1=Math.min(y1,tree.baseY+1,this.T.H);
    if(x1<=x0||y1<=y0)return;
    this.T.setRect(x0,y0,x1-x0,y1-y0,1);
    this.T.cx.fillStyle=col;
    this.T.cx.fillRect(x0,y0,x1-x0,y1-y0);
  },
  paintGrowingTree(tree){
    if(!tree||!this.T)return;
    const p=clamp(tree.age/tree.growFrames,0,1);
    const revealTop=tree.baseY-Math.max(2,Math.round(tree.height*p));
    const x=tree.x, base=tree.baseY, top=base-tree.height;
    const trunkH=Math.max(14,Math.round(tree.height*0.66));
    const trunkTop=base-trunkH;
    const leafTop=top;
    // Stammen är blockig och smal så den blir ett tydligt men inte jättestort hinder.
    this.paintTreeRect(tree,x-2,trunkTop,5,trunkH+1,'#5a331c',revealTop);
    this.paintTreeRect(tree,x-1,trunkTop+1,1,trunkH-2,'#8a552c',revealTop);
    this.paintTreeRect(tree,x+2,trunkTop+2,1,trunkH-3,'#3d2113',revealTop);
    this.paintTreeRect(tree,x-7,trunkTop+7,7,2,'#5a331c',revealTop);
    this.paintTreeRect(tree,x+1,trunkTop+5,8,2,'#5a331c',revealTop);
    // Kronan använder rektanglar, inte arc(), för att matcha spelets pixelart.
    this.paintTreeRect(tree,x-4,leafTop,9,4,'#225f24',revealTop);
    this.paintTreeRect(tree,x-8,leafTop+4,17,6,'#1d7a2a',revealTop);
    this.paintTreeRect(tree,x-11,leafTop+9,23,7,'#176321',revealTop);
    this.paintTreeRect(tree,x-7,leafTop+14,15,5,'#249034',revealTop);
    this.paintTreeRect(tree,x-2,leafTop+3,5,3,'#3fb84a',revealTop);
    this.paintTreeRect(tree,x+5,leafTop+8,4,3,'#2fa13c',revealTop);
    if(tree.age<tree.growFrames&&tree.age%5===0){
      this.parts.push({x:x+(RND()*16-8),y:Math.max(revealTop,top)+RND()*12,vx:RND()*0.6-0.3,vy:-0.3-RND()*0.5,life:12+RND()*8,g:0.03,col:'#40b850',glow:false});
    }
  },
  igniteTreeFromLightning(tr,message){
    if(!tr||tr.eaten||tr.burning||!this.T)return false;
    tr.burning=true;
    tr.burnT=0;
    tr.burnDur=Math.round((3.1+this.rand()*0.8)*1000/TICK); // ca 3-4 sekunder
    tr.age=Math.max(tr.age||0,tr.growFrames||1);
    tr.done=true;
    this.toast(message||'ÅSKAN TÄNDE ETT TRÄD!');
    AU.sTreeIgnite();
    const top=tr.baseY-(tr.height||28);
    for(let i=0;i<14&&this.parts.length<MAX_PARTICLES;i++){
      this.parts.push({x:tr.x+this.rand()*18-9,y:top+this.rand()*18,
        vx:this.rand()*1.0-0.5,vy:-0.9-this.rand()*1.4,life:18+this.rand()*18,g:0.04,
        col:this.rand()<0.45?'#ffd040':(this.rand()<0.72?'#ff7020':'#7a3018'),glow:true});
    }
    return true;
  },
  updateBurningTree(tr){
    if(!tr||!tr.burning||tr.eaten||!this.T)return;
    tr.burnT=(tr.burnT||0)+1;
    const dur=Math.max(1,tr.burnDur||Math.round(3.5*1000/TICK));
    const p=clamp(tr.burnT/dur,0,1);
    const x=tr.x,base=tr.baseY,h=tr.height||28,top=base-h;

    // Bränn uppifrån och ned. Rensningen är avsiktligt lite bredare än den
    // målade trädkronan så att aska inte lämnar kvar blockerande småpixlar.
    const burnY=top+Math.round(h*p);
    if(tr.burnT%3===1){
      const fy=clamp(burnY-this.rand()*8,top,base-2);
      this.T.clearDisc(x+(this.rand()*20-10),fy,3+this.rand()*4);
      for(let i=0;i<5&&this.parts.length<MAX_PARTICLES;i++){
        const flame=this.rand();
        this.parts.push({x:x+this.rand()*22-11,y:fy+this.rand()*8,
          vx:this.rand()*0.8-0.4,vy:-0.8-this.rand()*1.5,life:10+this.rand()*16,g:0.02,
          col:flame<0.35?'#ffe060':(flame<0.72?'#ff8020':'#a04018'),glow:true});
      }
      AU.sTreeBurn();
    }
    if(tr.burnT%7===2){
      for(let i=0;i<3&&this.parts.length<MAX_PARTICLES;i++){
        this.parts.push({x:x+this.rand()*18-9,y:burnY+this.rand()*8,
          vx:this.rand()*0.4-0.2,vy:-0.35-this.rand()*0.55,life:22+this.rand()*18,g:-0.004,
          col:'#4a4a4a',glow:false});
      }
    }
    if(p>0.25)this.T.clearRect(x-13,top-1,27,Math.max(2,Math.round(h*p*0.80)));
    if(p>0.55)this.T.clearRect(x-6,base-Math.round(h*0.70),13,Math.round(h*0.55));
    if(tr.burnT>=dur){
      this.clearTreeShape(tr,2);
      tr.eaten=true;tr.burnt=true;tr.removeT=0;
      this.toast('TRÄDET BRANN NER TILL ASKA!');
      AU.sTreeAsh();
      for(let i=0;i<22&&this.parts.length<MAX_PARTICLES;i++){
        const a=this.rand()*6.283,sp=0.25+this.rand()*1.0;
        this.parts.push({x:x,y:base-h*0.45,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-0.25,
          life:20+this.rand()*22,g:0.03,col:this.rand()<0.65?'#3a3a3a':'#6a4a2a'});
      }
    }
  },
  pickThunderTreeTarget(preferredX){
    const all=(this.trees||[]).filter(t=>!t.eaten&&!t.burning);
    if(!all.length)return null;
    const vw=this.viewW(),viewMin=this.cam-28,viewMax=this.cam+vw+28;
    const visible=all.filter(t=>t.x>=viewMin&&t.x<=viewMax);
    // Prioritera synliga träd så spelaren faktiskt ser hjälpen. Om inga syns
    // kan åskan fortfarande ibland träffa ett träd längre bort i banan.
    const pool=visible.length?visible:(this.rand()<0.45?all:[]);
    if(!pool.length)return null;
    let best=null,bestScore=1e9;
    for(const tr of pool){
      const dist=Math.abs(tr.x-(preferredX==null?this.viewCenterX():preferredX));
      const mature=clamp((tr.age||0)/Math.max(1,tr.growFrames||1),0,1);
      const score=dist-this.rand()*90-(mature*35);
      if(score<bestScore){bestScore=score;best=tr}
    }
    return best;
  },
  updateGrowingTrees(){
    if(this.treeEvents<this.treeMax&&!this.megaBoom&&!this.megaArmed){
      this.treeT--;
      if(this.treeT<=0){
        if(this.scheduleGrowingTree()){
          this.treeEvents++;
          this.treeT=Math.round((48+this.rand()*42)*1000/TICK);
        }else this.treeT=Math.round((6+this.rand()*8)*1000/TICK);
      }
    }
    for(const t of this.trees){
      if(t.eaten)continue;
      if(t.burning){this.updateBurningTree(t);continue}
      if(t.age<=t.growFrames){
        t.age++;
        this.paintGrowingTree(t);
        if(!t.done&&t.age>=t.growFrames){t.done=true;this.paintGrowingTree(t)}
      }
    }
  },

  findTreeGroundYAtLevel(x,startY){
    if(!this.T)return this.findTreeGroundY(x);
    const xx=clamp(Math.round(x),4,this.T.W-5);
    const sy=clamp(Math.round(startY),8,this.T.H-4);
    // När ett frågeteckenpaket fångas på en lemmels huvud ska trädet inte
    // börja växa från paketets höjd eller från ett överhäng ovanför. Sök därför
    // efter den första riktiga gångytan på samma nivå eller nedanför lemmeln.
    for(let y=Math.max(8,sy-8);y<this.T.H-3;y++){
      if(!this.T.solid(xx,y)&&this.T.solid(xx,y+1)&&this.T.solid(xx-2,y+1)&&this.T.solid(xx+2,y+1))return y;
    }
    return this.findTreeGroundY(xx);
  },
  megaBlast(x,y,r,heavy){
    if(!this.T)return;
    x=clamp(Math.round(x),4,this.T.W-5);y=clamp(Math.round(y),4,this.T.H-5);r=Math.round(r);
    this.T.clearDisc(x,y,r);
    const flashT=heavy?28:20;
    this.flashes.push({x,y,r:r*(heavy?7:5),t:flashT,maxT:flashT,mega:true});
    // Ljudet ska vara maffigt, men inte skapa dussintals tunga ljudnoder per sekund.
    // Den långa Tsar-bomb-ljudmattan startas i startMegaBoom(); här läggs bara
    // extra knallar in med en throttlad takt så webbläsaren inte kan hänga sig.
    if(heavy){
      const m=this.megaBoom;
      if(!m||m.lastBoomSound==null||m.t-(m.lastBoomSound||0)>=6){
        AU.sBigBoom();
        if(m)m.lastBoomSound=m.t;
      }
    }
    const maxParts=760;
    const count=heavy?48:24;
    for(let i=0;i<count&&this.parts.length<maxParts;i++){
      const a=RND()*6.283,sp=(heavy?1.8:1.0)+RND()*(heavy?5.6:3.4);
      this.parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2.0-RND()*1.2,
        life:24+RND()*(heavy?52:34),g:0.16,
        col:RND()<0.35?'#fff0a0':(RND()<0.7?'#ff7a18':'#ff2020'),glow:true});
    }
  },
  armMegaBoom(x,y){
    if(this.megaBoom||this.megaArmed||!this.T||!this.level)return false;
    const sx=clamp(Math.round(x==null?this.cam+VW/2:x),4,this.level.W-5);
    const sy=clamp(Math.round(y==null?this.findSupplyGroundY(sx):y),8,this.T.H-6);
    const ticks=this.chaosConfig().megaWarn;
    this.megaArmed={x:sx,y:sy,t:ticks,maxT:ticks};
    this.queueDirectedEvent('megaBoom',ticks,{x:sx,y:sy,label:'!!! MEGABOMB !!!'},true);
    this.toast('!!! MEGABOMB ARMAD !!!');
    return true;
  },
  startMegaBoom(x,y){
    if(this.megaBoom||!this.T||!this.level)return false;
    const dur=Math.round((5.2+this.rand()*1.5)*1000/TICK); // cirka 5-7 sekunder
    const sx=clamp(Math.round(x==null?this.cam+VW/2:x),4,this.level.W-5);
    const sy=clamp(Math.round(y==null?this.findSupplyGroundY(sx):y),8,this.T.H-6);
    this.megaArmed=null;
    this.megaBoom={t:0,dur,sourceX:sx,sourceY:sy,lastSlice:0,done:false};
    this.shakeT=dur+24;this.shakePow=18;
    this.toast('!!! UTROPSTECKENPAKET !!!');
    AU.sMegaBoom();
    this.megaBlast(sx,sy,34,true);
    return true;
  },
  updateMegaBoom(){
    if(this.shakeT>0)this.shakeT--;
    const m=this.megaBoom;
    if(!m||!this.T||!this.level)return;
    m.t++;
    const p=clamp(m.t/m.dur,0,1);
    this.shakeT=Math.max(this.shakeT,8);
    this.shakePow=Math.max(this.shakePow,Math.round(5+16*(1-p)));
    const W=this.level.W;
    const bursts=m.t<10?5:(m.t%2===0?3:2);
    for(let i=0;i<bursts;i++){
      let x;
      if(i===0)x=clamp(p*W+(RND()*2-1)*90,6,W-7);
      else if(i===1)x=clamp(m.sourceX+(RND()*2-1)*(80+p*W*0.6),6,W-7);
      else x=6+RND()*(W-12);
      let y;
      if(RND()<0.72)y=this.findSupplyGroundY(x)-RND()*30;
      else y=55+RND()*(this.T.H-72);
      const heavy=(m.t%13===0&&i===0)||(m.t<8&&i<2);
      const r=(heavy?28:18)+RND()*(heavy?24:18);
      this.megaBlast(x,clamp(y,8,this.T.H-7),r,heavy);
    }
    // En chockvåg äter upp världen under samma 5-7 sekunder, så inte bara
    // enstaka hål försvinner. Slut-clearen nedan garanterar att allt är borta.
    const targetSlice=Math.floor(p*W);
    if(targetSlice>m.lastSlice){
      this.T.clearRect(m.lastSlice,0,targetSlice-m.lastSlice+2,this.T.H);
      m.lastSlice=targetSlice;
    }
    if(m.t>=m.dur){
      this.T.clearRect(0,0,this.T.W,this.T.H);
      this.flashes.push({x:m.sourceX,y:m.sourceY,r:W,t:40,maxT:40,mega:true});
      this.toast('HELA BANAN ÄR BORTSPRÄNGD!');
      this.megaBoom=null;
      this.shakeT=Math.max(this.shakeT,28);this.shakePow=10;
    }
  },

  // ---- logik-tick ----
  tick(){
    if(this.updateWaterfallCave&&this.updateWaterfallCave())return;
    if(this.updateCutscene&&this.updateCutscene())return;
    if(this.state!=='PLAY'||this.paused)return;
    const L=this.level,T=this.T;
    this.doorT++;this.weatherT++;
    if(this.sunSurpriseT>0)this.sunSurpriseT--;
    this.updateThunder();
    this.updateToasts();
    // spawn
    if(this.doorT>24&&this.spawned<L.lem){
      if(--this.spawnT<=0){
        const l=new Lemming(L.hatch.x,L.hatch.y+6);
        this.lems.push(l);this.spawned++;
        if(this.lamp&&this.lamp.holder===null&&!this.lamp.onGround&&this.spawned===1){
          this.lamp.holder=l.id;
        }
        this.spawnT=Math.max(6,Math.round(60-this.rate*0.54));
      }
    }
    // lemlar
    for(const l of this.lems)if(!l.dead)l.update(T);
    this.updateLemmingChatter();
    this.updateWaterfallHeadSplashes();
    this.updateMushroomEatingEffects();
    this.updateTorchWarmEffects();
    this.updateLevelRescues();
    this.updateMummyScareEffects();
    // lyktplock
    if(this.lamp){
      if(this.lamp.holder!==null){
        const h=this.lems.find(q=>q.id===this.lamp.holder);
        if(h&&!h.dead){
          if(this.lamp.exitingWith===h.id){
            const e=this.level&&this.level.exit;
            const sc=Math.max(1,h.scale||1);
            this.lamp.exitT=h.busyT||0;
            this.lamp.x=e?e.x:h.x;
            this.lamp.y=(e?e.y-16:h.y-6*sc)+Math.min(18,(h.busyT||0)*1.45);
          }else{
            const sc=Math.max(1,h.scale||1);
            this.lamp.x=h.x;this.lamp.y=h.y-6*sc;
          }
        }
        else if(this.lamp.exitingWith){this.lamp=null}
        else{this.lamp.holder=null;this.lamp.onGround=true}
      }else if(this.lamp.onGround){
        for(const l of this.lems){
          const sc=Math.max(1,l.scale||1);
          if(l.alive()&&Math.abs(l.x-this.lamp.x)<6*sc&&Math.abs(l.y-this.lamp.y)<11*sc){
            this.lamp.holder=l.id;this.lamp.onGround=false;AU.sLamp();
            this.toast('LYKTAN UPPLOCKAD!');break;
          }
        }
      }
    }
    this.lems=this.lems.filter(l=>!l.dead);
    this.updateManualState();
    this.out=this.lems.length;
    this.updateEventDirector();
    this.updateSupplyDrops();
    this.updateMonkeyEvents();
    this.updateGrowingTrees();
    this.updateTrollEvents();
    this.updateTrollRocks();
    this.updateRandomJumpEvents();
    this.updateMegaBoom();
    this.updateDolphins();
    this.updateMeteors();
    this.updateHooksAndRopes();
    this.updateCaveDrips();
    this.updateRockets();
    this.updateDecorPhysics();
    // partiklar
    for(const p of this.parts){p.x+=p.vx;p.y+=p.vy;p.vy+=p.g||0;p.life--}
    this.parts=this.parts.filter(p=>p.life>0);
    if(this.parts.length>MAX_PARTICLES)this.parts.splice(0,this.parts.length-MAX_PARTICLES);
    for(const f of this.flashes)f.t--;
    this.flashes=this.flashes.filter(f=>f.t>0);
    if(this.flashes.length>MAX_FLASHES)this.flashes.splice(0,this.flashes.length-MAX_FLASHES);
    // eldflugor
    for(const f of this.fireflies){f.p+=0.05*f.s;f.x+=Math.cos(f.p)*0.4;f.y+=Math.sin(f.p*1.7)*0.3}
    this.updateAmbientLife();
    // tid & slut
    this.timeT--;
    const done=this.spawned>=L.lem&&this.out===0;
    if((done||this.timeT<=0)&&!this.megaBoom){
      this.endT=(this.endT||0)+1;
      if(this.endT>16){
        this.endT=0;
        this.state='RESULT';
        const win=this.saved>=L.save;
        if(win)this.markLevelCleared(this.levelIdx);
        AU.stopMusic();AU.stopWeather();AU.jingle(win);
      }
    }else this.endT=0;
    // kantscroll
    if(this.my<VH&&!this.isManualActive()){
      const edgeStep=6/(this.viewZoom||1);
      if(this.mx<14)this.cam-=edgeStep;
      if(this.mx>VW-14)this.cam+=edgeStep;
    }
    this.updateManualCameraFollow();
    this.clampView();
  }
};
