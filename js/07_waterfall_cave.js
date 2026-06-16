// ------------------------ VATTENFALLSGROTTA ----------------------------
Object.assign(G,{
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
  waterfallCaveActive(){return !!(this.waterfallCave&&this.waterfallCave.active)},
  waterfallCaveEntryBlocked(){return !!this.waterfallCaveExitNeedsUpRelease},
  releaseWaterfallCaveEntryBlock(key){
    if(key==='ArrowUp')this.waterfallCaveExitNeedsUpRelease=false;
    return !this.waterfallCaveExitNeedsUpRelease;
  },
  cloneWaterfallCaveData(value){
    if(typeof waterfallCaveCloneData==='function')return waterfallCaveCloneData(value);
    return value==null?value:JSON.parse(JSON.stringify(value));
  },
  waterfallCaveObjectDefaultData(sceneId,objectId,fallback){
    const value=typeof waterfallCaveObjectDefault==='function'?waterfallCaveObjectDefault(sceneId,objectId):null;
    return value||this.cloneWaterfallCaveData(fallback);
  },
  waterfallCaveSceneIds(){
    return typeof waterfallCaveSceneIds==='function'?waterfallCaveSceneIds():['main','deep','camp'];
  },
  waterfallCaveSceneDef(id){
    return typeof waterfallCaveSceneDef==='function'?waterfallCaveSceneDef(id):null;
  },
  waterfallCaveSceneRenderKey(caveOrId){
    if(typeof waterfallCaveSceneRenderKey==='function')return waterfallCaveSceneRenderKey(caveOrId||this.waterfallCave);
    return typeof caveOrId==='string'?caveOrId:((caveOrId&&caveOrId.scene)||'main');
  },
  waterfallCaveMapGraph(){
    return typeof waterfallCaveMapGraph==='function'?waterfallCaveMapGraph():{nodes:[],links:[],kinds:{}};
  },
  waterfallCaveSceneMapNode(sceneId){
    return typeof waterfallCaveSceneMapNode==='function'?waterfallCaveSceneMapNode(sceneId):null;
  },
  waterfallCaveSceneBounds(cave,sceneId){
    cave=cave||this.waterfallCave;
    if(typeof waterfallCaveSceneBoundsFor==='function')return waterfallCaveSceneBoundsFor(cave,sceneId);
    if(cave&&cave.scene==='camp')return cave.campBounds||{};
    if(cave&&cave.scene==='deep')return cave.deepBounds||{};
    return cave&&cave.bounds||{};
  },
  waterfallCaveRuntimeObject(cave,obj){
    cave=cave||this.waterfallCave;
    if(!cave||!obj)return null;
    if(obj.runtimeKey)return cave[obj.runtimeKey]||null;
    cave.sceneState=cave.sceneState||{};
    const bucket=cave.sceneState[cave.scene]||(cave.sceneState[cave.scene]={});
    if(!bucket[obj.id]){
      bucket[obj.id]=this.cloneWaterfallCaveData(obj.default||{});
      bucket[obj.id].id=obj.id;
    }
    return bucket[obj.id];
  },
  waterfallCaveSceneObjects(cave){
    cave=cave||this.waterfallCave;
    const defs=typeof waterfallCaveSceneObjects==='function'?waterfallCaveSceneObjects(cave&&cave.scene):[];
    return defs.map(def=>({def,obj:this.waterfallCaveRuntimeObject(cave,def)})).filter(hit=>!!hit.obj);
  },
  waterfallCaveObjectContains(def,obj,x,y,scale){
    if(!def||!obj)return false;
    const h=def.hit||{};
    const ox=(obj.x||0)+(h.dx||0),oy=(obj.y||0)+(h.dy||0);
    const sc=Number.isFinite(scale)?scale:1;
    if(h.type==='rect'){
      const w=Math.max(1,(h.w||1)*sc),hh=Math.max(1,(h.h||1)*sc);
      return x>=ox-w/2&&x<ox+w/2&&y>=oy-hh/2&&y<oy+hh/2;
    }
    const rx=Math.max(1,(h.rx||12)*sc),ry=Math.max(1,(h.ry||12)*sc);
    return ((x-ox)/rx)*((x-ox)/rx)+((y-oy)/ry)*((y-oy)/ry)<=1;
  },
  waterfallCaveObjectBlockContains(def,obj,x,y,scale){
    if(!def||!obj)return false;
    const blocks=Array.isArray(def.block)?def.block:(def.block?[def.block]:[def.hit||{}]);
    for(const hit of blocks){
      if(this.waterfallCaveObjectContains(Object.assign({},def,{hit}),obj,x,y,scale))return true;
    }
    return false;
  },
  waterfallCaveHitObject(p){
    const cave=this.waterfallCave;
    if(!cave||!p)return null;
    for(const hit of this.waterfallCaveSceneObjects(cave)){
      if(this.waterfallCaveObjectContains(hit.def,hit.obj,p.x,p.y,1))return hit;
    }
    return null;
  },
  waterfallCaveSceneBlockerAt(cave,x,y){
    cave=cave||this.waterfallCave;
    if(!cave)return null;
    for(const hit of this.waterfallCaveSceneObjects(cave)){
      if(!hit.def||!hit.def.blocker)continue;
      if(hit.def.id==='campFire'){
        if(this.waterfallCaveCampFireBlocked(cave,x,y))return hit;
      }else if(this.waterfallCaveObjectBlockContains(hit.def,hit.obj,x,y,0.86))return hit;
    }
    return null;
  },
  waterfallCaveChurchBlessingState(cave){
    cave=cave||this.waterfallCave;
    if(!cave||cave.scene!=='churchInterior')return null;
    cave.sceneState=cave.sceneState||{};
    const bucket=cave.sceneState.churchInterior||(cave.sceneState.churchInterior={});
    if(!bucket.priestBlessing)bucket.priestBlessing={
      active:false,done:false,phase:'idle',t:0,priestX:70,priestY:150,targetX:206,targetY:150
    };
    return bucket.priestBlessing;
  },
  waterfallCaveChurchBlessingActive(cave){
    const st=this.waterfallCaveChurchBlessingState(cave);
    return !!(st&&st.active);
  },
  blessWaterfallCaveLemming(cave){
    cave=cave||this.waterfallCave;
    if(!cave)return false;
    const l=this.findLemById?this.findLemById(cave.lemId):null;
    cave.flags=cave.flags||{};
    cave.flags.priestBlessed=true;
    if(this.unlockHolyBlessing)this.unlockHolyBlessing();
    if(!l||l.holy)return false;
    l.holy=true;
    l.holySaveT=-999;
    this.holyLevelLemId=l.id;
    if(this.normalizeHolyLemmings)this.normalizeHolyLemmings(l);
    if(this.holyLemmingGlow)this.holyLemmingGlow(l,'blessing');
    this.toast('LÄMMELN HAR FÅTT GUDS VÄLSIGNELSE OCH ÄR NU ODÖDLIG',180);
    return true;
  },
  startWaterfallCaveChurchBlessing(cave){
    cave=cave||this.waterfallCave;
    const st=this.waterfallCaveChurchBlessingState(cave);
    if(!st||st.done||st.active)return false;
    const b=this.waterfallCaveSceneBounds(cave);
    const ly=clamp(cave.lemY||146,b.minY||132,160);
    st.active=true;
    st.done=false;
    st.phase='enter';
    st.t=0;
    st.priestX=(b.minX||78)-34;
    st.priestY=ly;
    st.targetX=clamp((cave.lemX||240)-24,b.minX||78,b.maxX||402);
    st.targetY=ly;
    st.blessT=0;
    cave.lemY=ly;
    cave.facing='front';
    cave.walking=false;
    cave.running=false;
    this.clearWaterfallCaveMoveKeys(cave);
    return true;
  },
  updateWaterfallCaveChurchBlessing(cave){
    cave=cave||this.waterfallCave;
    if(!cave||cave.scene!=='churchInterior')return false;
    const st=this.waterfallCaveChurchBlessingState(cave);
    if(!st)return false;
    if(!st.active){
      const nearAltar=(cave.lemY||999)<=146&&(cave.lemX||0)>=180&&(cave.lemX||0)<=300;
      return nearAltar?this.startWaterfallCaveChurchBlessing(cave):false;
    }
    cave.walking=false;
    cave.running=false;
    cave.facing='front';
    this.clearWaterfallCaveMoveKeys(cave);
    st.t++;
    const sp=1.55;
    if(st.phase==='enter'){
      const dx=(st.targetX||206)-(st.priestX||0);
      if(Math.abs(dx)<=sp){
        st.priestX=st.targetX;
        st.phase='raise';
        st.t=0;
      }else st.priestX+=Math.sign(dx)*sp;
      st.priestY=st.targetY;
    }else if(st.phase==='raise'){
      if(st.t>=18){st.phase='bless';st.t=0}
    }else if(st.phase==='bless'){
      st.blessT=st.t;
      if(st.t>=86){st.phase='exit';st.t=0}
    }else if(st.phase==='exit'){
      st.priestX-=sp;
      st.priestY=st.targetY;
      if(st.priestX<(this.waterfallCaveSceneBounds(cave).minX||78)-42){
        this.blessWaterfallCaveLemming(cave);
        st.active=false;
        st.done=true;
        st.phase='done';
        st.t=0;
      }
    }
    return st.active;
  },
  waterfallCaveNearestObject(cave){
    cave=cave||this.waterfallCave;
    if(!cave)return null;
    let best=null,bestD=Infinity;
    for(const hit of this.waterfallCaveSceneObjects(cave)){
      const def=hit.def,obj=hit.obj;
      if(!def||def.kind==='hazard')continue;
      const h=def.hit||{},rx=Math.max(1,h.rx||((h.w||24)/2)),ry=Math.max(1,h.ry||((h.h||24)/2));
      const d=((cave.lemX-(obj.x||0))/rx)*((cave.lemX-(obj.x||0))/rx)+((cave.lemY-(obj.y||0))/ry)*((cave.lemY-(obj.y||0))/ry);
      if(d<bestD){best=hit;bestD=d}
    }
    return bestD<=1.3?best:null;
  },
  interactWaterfallCaveObject(hit,mode){
    const cave=this.waterfallCave;
    if(!cave||!hit||!hit.obj)return false;
    const obj=hit.obj,def=hit.def||{};
    obj.near=true;
    obj.activated=true;
    obj.pulseT=Math.max(obj.pulseT||0,72);
    obj.lastInteractT=cave.t||0;
    if(def.kind==='pool')obj.rippleT=Math.max(obj.rippleT||0,96);
    if(def.kind==='stone'&&mode)obj.shifted=true;
    if(def.kind==='torch')obj.flameT=Math.max(obj.flameT||0,96);
    if(def.kind==='runeWall'){
      obj.readT=Math.max(obj.readT||0,110);
      obj.readLines=this.cloneWaterfallCaveData(def.readLines||['Runorna viskar.']);
    }
    if(def.kind==='viewCard'&&(mode!=='near'||!obj.dismissedNear))this.openWaterfallCaveViewCard(hit);
    cave.flags=cave.flags||{};
    cave.flags[def.id||'object']=true;
    return true;
  },
  updateWaterfallCaveSceneObjects(cave){
    cave=cave||this.waterfallCave;
    if(!cave)return false;
    for(const hit of this.waterfallCaveSceneObjects(cave)){
      const def=hit.def,obj=hit.obj;
      if(!def||def.runtimeKey)continue;
      if(Number.isFinite(obj.pulseT))obj.pulseT=Math.max(0,obj.pulseT-1);
      if(Number.isFinite(obj.rippleT))obj.rippleT=Math.max(0,obj.rippleT-1);
      if(Number.isFinite(obj.flameT))obj.flameT=Math.max(0,obj.flameT-1);
      if(Number.isFinite(obj.readT))obj.readT=Math.max(0,obj.readT-1);
      const nearScale=def.kind==='viewCard'?1.0:1.08;
      const near=this.waterfallCaveObjectContains(def,obj,cave.lemX||0,cave.lemY||0,nearScale);
      if(def.kind==='viewCard'){
        const leftResetZone=!this.waterfallCaveObjectContains(def,obj,cave.lemX||0,cave.lemY||0,1.42);
        if(leftResetZone){
          obj.dismissedNear=false;
          if(obj.cardOpen)obj.cardOpen=false;
          obj.cardCloseArmed=false;
        }
      }
      if(near&&!obj.near)this.interactWaterfallCaveObject(hit,'near');
      if(def.kind==='runeWall'&&near){
        obj.readT=Math.max(obj.readT||0,90);
        obj.readLines=obj.readLines||this.cloneWaterfallCaveData(def.readLines||['Runorna viskar.']);
      }
      obj.near=near;
    }
    return true;
  },
  ensureWaterfallCaveSceneState(cave){
    cave=cave||this.waterfallCave;
    if(!cave)return null;
    const main=this.waterfallCaveSceneDef('main')||{};
    const deep=this.waterfallCaveSceneDef('deep')||{};
    const camp=this.waterfallCaveSceneDef('camp')||{};
    cave.bounds=cave.bounds||this.cloneWaterfallCaveData(main.bounds||{minX:102,maxX:386,minY:176,maxY:304,exitX0:184,exitX1:296,exitY:218,deepX0:164,deepX1:316,deepY:298});
    cave.deepBounds=cave.deepBounds||this.cloneWaterfallCaveData(deep.bounds||{minX:86,maxX:394,minY:168,maxY:282,exitX0:180,exitX1:300,exitY:178,campX0:154,campX1:326,campY:276});
    cave.campBounds=cave.campBounds||this.cloneWaterfallCaveData(camp.bounds||{minX:74,maxX:406,minY:166,maxY:306,exitX0:168,exitX1:312,exitY:182});
    cave.deepItem=cave.deepItem||this.waterfallCaveObjectDefaultData('deep','cover',{x:246,y:252,displayScale:0.5,near:false,coverOpen:false,dismissedNear:false,coverCloseArmed:false,coverSide:'front',coverReturnBlocked:false});
    cave.campFire=cave.campFire||this.waterfallCaveObjectDefaultData('camp','campFire',{x:318,y:244,rx:54,ry:30});
    cave.visited=cave.visited||{};
    cave.flags=cave.flags||{};
    cave.inventory=cave.inventory||[];
    cave.inputMode=cave.inputMode||'direct';
    cave.mapOpen=!!cave.mapOpen;
    cave.hoverObject=cave.hoverObject||null;
    if(!cave.scene)cave.scene='main';
    if(cave.sceneExitBlockedKey&&(!cave.keys||!cave.keys[cave.sceneExitBlockedKey]))cave.sceneExitBlockedKey=null;
    cave.visited[cave.scene]=true;
    return cave;
  },
  setWaterfallCaveScene(scene,spawnId,opts){
    const cave=this.ensureWaterfallCaveSceneState(this.waterfallCave);
    if(!cave)return false;
    const def=this.waterfallCaveSceneDef(scene);
    if(!def)return false;
    cave.scene=def.id;
    cave.visited=cave.visited||{};
    cave.visited[def.id]=true;
    cave.hoverObject=null;
    cave.sceneExitBlockedKey=opts&&opts.fromExitKey?opts.fromExitKey:null;
    const spawn=typeof waterfallCaveSceneSpawn==='function'?waterfallCaveSceneSpawn(def.id,spawnId):null;
    if(spawn){
      cave.lemX=spawn.x;cave.lemY=spawn.y;
      if(spawn.facing)cave.facing=spawn.facing;
      if(Number.isFinite(spawn.dir))cave.dir=spawn.dir;
    }
    cave.walking=false;
    cave.running=false;
    cave.lastStepT=cave.t||0;
    if(!opts||opts.audio!==false)this.setWaterfallCaveSceneAudio(def.id);
    return true;
  },
  waterfallCaveExitReady(cave,exit){
    if(!cave||!exit)return false;
    if(exit.key==='up'&&!cave.keys.up)return false;
    if(exit.key==='down'&&!cave.keys.down)return false;
    if(exit.key==='left'&&!cave.keys.left)return false;
    if(exit.key==='right'&&!cave.keys.right)return false;
    if(cave.sceneExitBlockedKey===exit.key&&cave.keys&&cave.keys[exit.key])return false;
    if(Number.isFinite(exit.x0)&&(cave.lemX||0)<exit.x0)return false;
    if(Number.isFinite(exit.x1)&&(cave.lemX||0)>exit.x1)return false;
    if(Number.isFinite(exit.yMin)&&(cave.lemY||0)<exit.yMin)return false;
    if(Number.isFinite(exit.yMax)&&(cave.lemY||0)>exit.yMax)return false;
    return true;
  },
  tryWaterfallCaveSceneExit(cave){
    cave=this.ensureWaterfallCaveSceneState(cave);
    if(!cave)return false;
    const exits=typeof waterfallCaveSceneExits==='function'?waterfallCaveSceneExits(cave.scene):[];
    for(const exit of exits){
      if(!this.waterfallCaveExitReady(cave,exit))continue;
      const it=cave.deepItem;
      if(exit.requiresClosedDeepItem&&it&&it.coverOpen)continue;
      if(exit.closeDeepItem&&it&&it.coverOpen)this.closeWaterfallCaveDeepItem(it);
      if(!exit.target){
        this.exitWaterfallCave(exit.reason||'walkout');
        return true;
      }
      this.setWaterfallCaveScene(exit.target,exit.spawn,{fromExitKey:exit.key});
      if(exit.markCoverReturn){
        const cover=cave.deepItem||(cave.deepItem=this.waterfallCaveObjectDefaultData('deep','cover',{x:246,y:252}));
        cover.coverOpen=false;cover.coverCloseArmed=false;cover.coverReturnBlocked=true;cover.near=false;
      }
      return true;
    }
    return false;
  },
  findWaterfallCaveEntrance(l){
    if(!l||!l.alive||!l.alive()||!this.decor)return null;
    const sc=Math.max(1,l.scale||1);
    let best=null,bestScore=Infinity;
    for(const wf of this.decor){
      if(!wf||wf.t!=='waterfall'||wf.remove)continue;
      const w=wf.w||28,h=wf.h||130,top=wf.y||0,base=top+h;
      const dx=Math.abs(l.x-wf.x);
      const inCurtain=dx<=w/2+10*sc&&l.y>=top+28&&l.y<=base+16*sc;
      const atSplash=dx<=w/2+16*sc&&Math.abs(l.y-base)<=20*sc;
      if(!inCurtain&&!atSplash)continue;
      const score=dx+Math.abs(l.y-Math.min(base,l.y))*0.25;
      if(score<bestScore){best=wf;bestScore=score}
    }
    return best;
  },
  tryEnterWaterfallCaveFromManual(){
    if(!this.isManualActive()||this.waterfallCaveActive())return false;
    if(this.waterfallCaveEntryBlocked&&this.waterfallCaveEntryBlocked())return false;
    const l=this.manualLem&&this.manualLem();
    if(!l||!l.alive||!l.alive()||l.state!=='MANUAL')return false;
    const wf=this.findWaterfallCaveEntrance(l);
    return wf?this.enterWaterfallCave(l,wf):false;
  },
  enterWaterfallCave(l,wf){
    if(!l||!wf)return false;
    if(this.manual&&this.manual.keys)this.manual.keys={left:false,right:false,down:false,run:false,aim:false};
    if(this.manual)this.manual.jumpQueued=null;
    l.manualVy=0;l.fall=0;l.jumpT=0;l.jumpVy=0;l.manualMoving=false;
    this.clearRopeAim();
    const lootKey=this.waterfallCaveLootKey?this.waterfallCaveLootKey(wf):((this.levelIdx||0)+':'+Math.round(wf.x||0)+','+Math.round(wf.y||0));
    const looted=!!(this.waterfallCaveLooted&&this.waterfallCaveLooted[lootKey]);
    const main=this.waterfallCaveSceneDef('main')||{},deep=this.waterfallCaveSceneDef('deep')||{},camp=this.waterfallCaveSceneDef('camp')||{};
    const spawn=typeof waterfallCaveSceneSpawn==='function'?waterfallCaveSceneSpawn('main','entry'):{x:240,y:232,facing:'front'};
    const chest=this.waterfallCaveObjectDefaultData('main','chest',{x:342,y:226,coins:3,opened:false,collected:false,near:false,glowT:0});
    chest.collected=looted;chest.lootKey=lootKey;
    this.waterfallCave={
      active:true,t:0,scene:'main',inputMode:'direct',lemId:l.id,lemX:spawn.x,lemY:spawn.y,dir:l.dir||1,facing:spawn.facing||'front',walking:false,running:false,walkAnim:0,lastStepT:-999,stepSide:0,
      keys:{left:false,right:false,up:false,down:false,run:false},
      bounds:this.cloneWaterfallCaveData(main.bounds||{minX:102,maxX:386,minY:176,maxY:304,exitX0:184,exitX1:296,exitY:218,deepX0:164,deepX1:316,deepY:298}),
      deepBounds:this.cloneWaterfallCaveData(deep.bounds||{minX:86,maxX:394,minY:168,maxY:282,exitX0:180,exitX1:300,exitY:178,campX0:154,campX1:326,campY:276}),
      campBounds:this.cloneWaterfallCaveData(camp.bounds||{minX:74,maxX:406,minY:166,maxY:306,exitX0:168,exitX1:312,exitY:182}),
      campFire:this.waterfallCaveObjectDefaultData('camp','campFire',{x:318,y:244,rx:54,ry:30}),
      deepItem:this.waterfallCaveObjectDefaultData('deep','cover',{x:246,y:252,displayScale:0.5,near:false,coverOpen:false,dismissedNear:false,coverCloseArmed:false,coverSide:'front',coverReturnBlocked:false}),
      chest,
      inventory:[],flags:{},visited:{main:true},hoverObject:null,sceneState:{},mapOpen:false,
      wf:{x:wf.x,y:wf.y,w:wf.w||28,h:wf.h||130,v:wf.v||0,theme:this.level&&this.level.theme},
      exitCam:this.cam,exitViewY:this.viewY,exitZoom:this.viewZoom
    };
    this.waterfallCaveResumeMusic=!!AU.musicOn;
    this.waterfallCaveResumeWeather=this.weatherKind||null;
    if(AU.silenceMusicForWaterfallCave)AU.silenceMusicForWaterfallCave(1.0);
    else if(AU.stopMusic)AU.stopMusic();
    if(AU.stopWeather)AU.stopWeather();
    if(AU.startWaterfallCave)AU.startWaterfallCave();
    if(this.clearTransientText)this.clearTransientText();
    else{this.toasts=[];this.msg='';this.msgT=0}
    AU.sClick();
    return true;
  },
  exitWaterfallCave(reason){
    if(!this.waterfallCaveActive())return false;
    this.waterfallCave.active=false;
    this.waterfallCave=null;
    this.waterfallCaveExitNeedsUpRelease=reason==='walkout';
    if(AU.stopWaterfallCave)AU.stopWaterfallCave();
    if(AU.stopWaterfallCaveMysteryMusic)AU.stopWaterfallCaveMysteryMusic(0.35);
    if(AU.stopWaterfallCaveChurchHymn)AU.stopWaterfallCaveChurchHymn(0.35);
    const resumeMusic=!!this.waterfallCaveResumeMusic;
    const resumeWeather=this.waterfallCaveResumeWeather;
    this.waterfallCaveResumeMusic=false;
    this.waterfallCaveResumeWeather=null;
    if(reason!=='silent'&&resumeWeather&&AU.sfxOn&&AU.startWeather)this.startWeatherAfterWaterfallCave(resumeWeather);
    if(reason!=='silent'&&resumeMusic&&AU.musicOn&&AU.startMusic&&this.state==='PLAY'&&this.level)AU.startMusic(this.musicKindForLevel(this.levelIdx));
    if(this.manual&&this.manual.keys)this.manual.keys={left:false,right:false,down:false,run:false,aim:false};
    if(this.manual)this.manual.jumpQueued=null;
    if(reason!=='silent')this.toast('UTE UR GROTTVY');
    return true;
  },
  startWeatherAfterWaterfallCave(kind){
    if(this.state==='PLAY'&&this.level&&AU.startWeather)AU.startWeather(kind||this.weatherKind);
  },
  setWaterfallCaveSceneAudio(scene){
    const def=this.waterfallCaveSceneDef(scene)||{};
    const audio=def.audio||scene;
    if(audio!=='church-hymn'&&AU.stopWaterfallCaveChurchHymn)AU.stopWaterfallCaveChurchHymn(0.65);
    if(audio!=='church-mystery'&&AU.stopWaterfallCaveMysteryMusic)AU.stopWaterfallCaveMysteryMusic(0.65);
    if(audio==='campfire'){
      if(AU.setWaterfallCaveWaterLevel)AU.setWaterfallCaveWaterLevel(0.28,0.75);
      if(AU.startWaterfallCaveFire)AU.startWaterfallCaveFire();
    }else if(audio==='ember-near'){
      if(AU.setWaterfallCaveWaterLevel)AU.setWaterfallCaveWaterLevel(0.18,0.75);
      if(AU.startWaterfallCaveFire)AU.startWaterfallCaveFire();
    }else if(audio==='waterfall-far'){
      if(AU.stopWaterfallCaveFire)AU.stopWaterfallCaveFire(0.55);
      if(AU.setWaterfallCaveWaterLevel)AU.setWaterfallCaveWaterLevel(0.72,0.55);
    }else if(audio==='distant-water'){
      if(AU.stopWaterfallCaveFire)AU.stopWaterfallCaveFire(0.55);
      if(AU.setWaterfallCaveWaterLevel)AU.setWaterfallCaveWaterLevel(0.24,0.65);
    }else if(audio==='church-mystery'){
      if(AU.stopWaterfallCaveFire)AU.stopWaterfallCaveFire(0.55);
      if(AU.setWaterfallCaveWaterLevel)AU.setWaterfallCaveWaterLevel(0.08,0.85);
      if(AU.startWaterfallCaveMysteryMusic)AU.startWaterfallCaveMysteryMusic(1.35);
    }else if(audio==='church-hymn'){
      if(AU.stopWaterfallCaveFire)AU.stopWaterfallCaveFire(0.55);
      if(AU.setWaterfallCaveWaterLevel)AU.setWaterfallCaveWaterLevel(0.05,0.85);
      if(AU.startWaterfallCaveChurchHymn)AU.startWaterfallCaveChurchHymn(1.0);
    }else{
      if(AU.stopWaterfallCaveFire)AU.stopWaterfallCaveFire(0.45);
      if(AU.setWaterfallCaveWaterLevel)AU.setWaterfallCaveWaterLevel(audio==='waterfall-near'?1.0:0.12,0.65);
    }
  },
  waterfallCaveMovementHeld(cave){
    const k=(cave&&cave.keys)||{};
    return !!(k.left||k.right||k.up||k.down);
  },
  clearWaterfallCaveMoveKeys(cave){
    cave=cave||this.waterfallCave;
    if(!cave)return false;
    cave.keys=cave.keys||{};
    cave.keys.left=false;cave.keys.right=false;cave.keys.up=false;cave.keys.down=false;cave.keys.run=false;
    cave.walking=false;cave.running=false;
    return true;
  },
  waterfallCaveMapOpen(cave){
    cave=cave||this.waterfallCave;
    return !!(cave&&cave.mapOpen);
  },
  openWaterfallCaveMap(cave){
    cave=cave||this.waterfallCave;
    if(!cave)return false;
    cave.mapOpen=true;
    this.clearWaterfallCaveMoveKeys(cave);
    return true;
  },
  closeWaterfallCaveMap(cave){
    cave=cave||this.waterfallCave;
    if(!cave)return false;
    cave.mapOpen=false;
    this.clearWaterfallCaveMoveKeys(cave);
    return true;
  },
  toggleWaterfallCaveMap(cave){
    cave=cave||this.waterfallCave;
    if(!cave)return false;
    return cave.mapOpen?this.closeWaterfallCaveMap(cave):this.openWaterfallCaveMap(cave);
  },
  closeWaterfallCaveDeepItem(it){
    if(!it)return false;
    it.coverOpen=false;
    it.dismissedNear=true;
    it.coverCloseArmed=false;
    return true;
  },
  waterfallCaveActiveViewCard(cave){
    cave=cave||this.waterfallCave;
    if(!cave)return null;
    return this.waterfallCaveSceneObjects(cave).find(hit=>hit.def&&hit.def.kind==='viewCard'&&hit.obj&&hit.obj.cardOpen)||null;
  },
  openWaterfallCaveViewCard(hit){
    const cave=this.waterfallCave;
    if(!cave||!hit||!hit.obj)return false;
    const obj=hit.obj;
    obj.cardOpen=true;
    obj.cardSide='front';
    obj.cardCloseArmed=!this.waterfallCaveMovementHeld(cave);
    obj.dismissedNear=false;
    cave.inspectObjectId=hit.def&&hit.def.id||null;
    return true;
  },
  closeWaterfallCaveViewCard(hit){
    const obj=hit&&hit.obj?hit.obj:hit;
    if(!obj)return false;
    obj.cardOpen=false;
    obj.dismissedNear=true;
    obj.cardCloseArmed=false;
    return true;
  },
  toggleWaterfallCaveViewCard(hit){
    const obj=hit&&hit.obj?hit.obj:hit;
    if(!obj||!obj.cardOpen)return false;
    obj.cardSide=obj.cardSide==='back'?'front':'back';
    return true;
  },
  waterfallCaveViewCardRect(hit){
    const card=hit&&hit.def&&hit.def.card||{};
    return card.rect||{x:126,y:54,w:228,h:152};
  },
  setWaterfallCaveMoveKey(cave,key,value){
    const k=cave.keys||(cave.keys={});
    if(key==='ArrowLeft')k.left=value;
    else if(key==='ArrowRight')k.right=value;
    else if(key==='ArrowUp')k.up=value;
    else if(key==='ArrowDown')k.down=value;
    else if(key==='Shift')k.run=value;
    return key==='ArrowLeft'||key==='ArrowRight'||key==='ArrowUp'||key==='ArrowDown'||key==='Shift';
  },
  toggleWaterfallCaveDeepItemCover(it){
    if(!it||!it.coverOpen)return false;
    it.coverSide=it.coverSide==='back'?'front':'back';
    return true;
  },
  waterfallCaveCoverRect(){
    return {x:150,y:30,w:180,h:225};
  },
  waterfallCaveCampFire(cave){
    return (cave&&cave.campFire)||{x:318,y:244,rx:54,ry:30};
  },
  waterfallCaveCampFireBlocked(cave,x,y){
    const f=this.waterfallCaveCampFire(cave);
    const dx=(x-(f.x||318))/Math.max(1,f.rx||54);
    const dy=(y-((f.y||244)+8))/Math.max(1,f.ry||30);
    return dx*dx+dy*dy<1;
  },
  updateWaterfallCave(){
    if(!this.waterfallCaveActive())return false;
    const cave=this.waterfallCave;
    cave.t++;
    this.ensureWaterfallCaveSceneState(cave);
    cave.keys=cave.keys||{};
    if(cave.mapOpen){
      cave.walking=false;
      cave.running=false;
      if(cave.scene==='camp'&&AU.updateWaterfallCaveCampfire)AU.updateWaterfallCaveCampfire();
      return true;
    }
    if(this.updateWaterfallCaveChurchBlessing(cave))return true;
    const b=this.waterfallCaveSceneBounds(cave);
    let dx=(cave.keys.right?1:0)-(cave.keys.left?1:0);
    let dy=(cave.keys.down?1:0)-(cave.keys.up?1:0);
    const waitingForCoverRelease=cave.scene==='deep'&&cave.deepItem&&cave.deepItem.coverOpen&&!cave.deepItem.coverCloseArmed;
    const viewCard=this.waterfallCaveActiveViewCard(cave);
    const waitingForViewCardRelease=viewCard&&viewCard.obj&&viewCard.obj.cardOpen&&!viewCard.obj.cardCloseArmed;
    if(waitingForCoverRelease||waitingForViewCardRelease){dx=0;dy=0}
    if(dx||dy){
      const inv=Math.hypot(dx,dy)>1?1/Math.hypot(dx,dy):1;
      dx*=inv;dy*=inv;
      const running=!!cave.keys.run;
      const sp=running?2.35:1.55;
      const oldX=cave.lemX==null?240:cave.lemX, oldY=cave.lemY==null?210:cave.lemY;
      let nextX=clamp(oldX+dx*sp,b.minX,b.maxX);
      let nextY=clamp(oldY+dy*sp,b.minY,b.maxY);
      if(this.waterfallCaveSceneBlockerAt(cave,nextX,nextY)){
        const tryX=clamp(oldX+dx*sp,b.minX,b.maxX), tryY=oldY;
        if(!this.waterfallCaveSceneBlockerAt(cave,tryX,tryY)){nextX=tryX;nextY=tryY}
        else{
          const altX=oldX, altY=clamp(oldY+dy*sp,b.minY,b.maxY);
          if(!this.waterfallCaveSceneBlockerAt(cave,altX,altY)){nextX=altX;nextY=altY}
          else{nextX=oldX;nextY=oldY}
        }
      }
      cave.lemX=nextX;
      cave.lemY=nextY;
      if(dx){cave.dir=dx>0?1:-1;cave.facing=dx>0?'right':'left'}
      else cave.facing=dy<0?'back':'front';
      cave.walking=true;
      cave.running=running;
      cave.walkAnim=(cave.walkAnim||0)+(running?2:1);
      const stepGap=running?7:10;
      if(AU.sWaterfallCaveStep&&(cave.t-(Number.isFinite(cave.lastStepT)?cave.lastStepT:-999))>=stepGap){
        cave.lastStepT=cave.t;
        cave.stepSide=1-(cave.stepSide||0);
        const far=Number.isFinite(b.exitY)?b.exitY:(Number.isFinite(b.minY)?b.minY:176);
        const near=Number.isFinite(b.maxY)?b.maxY:304;
        const depth=clamp(((cave.lemY||0)-far)/Math.max(1,near-far),0,1);
        AU.sWaterfallCaveStep(depth,cave.stepSide);
      }
    }else{
      cave.walking=false;
      cave.running=false;
    }
    const ch=cave.chest;
    if(cave.scene==='main'&&ch){
      const dist=Math.hypot((cave.lemX||0)-ch.x,(cave.lemY||0)-ch.y);
      ch.near=dist<20;
      ch.opened=!!ch.near;
      ch.glowT=ch.opened?70:0;
      if(ch.near&&!ch.collected&&this.collectWaterfallCaveChest)this.collectWaterfallCaveChest(cave);
    }else if(ch){
      ch.near=false;ch.opened=false;ch.glowT=0;
    }
    this.updateWaterfallCaveSceneObjects(cave);
    if(cave.scene==='deep'){
      const it=cave.deepItem||(cave.deepItem={x:246,y:252,displayScale:0.5,near:false,coverOpen:false,dismissedNear:false,coverCloseArmed:false,coverSide:'front',coverReturnBlocked:false});
      const ix=Math.abs((cave.lemX||0)-it.x),iy=Math.abs((cave.lemY||0)-it.y);
      const near=(ix/30)*(ix/30)+(iy/20)*(iy/20)<=1;
      const leftResetZone=(ix/38)*(ix/38)+(iy/26)*(iy/26)>=1;
      it.near=near;
      if(leftResetZone){
        it.dismissedNear=false;
        if(it.coverOpen)it.coverOpen=false;
        it.coverCloseArmed=false;
        if(!this.waterfallCaveMovementHeld(cave))it.coverReturnBlocked=false;
      }
      if(it.coverReturnBlocked&&this.waterfallCaveMovementHeld(cave)&&near)it.dismissedNear=true;
      if(it.coverReturnBlocked&&!this.waterfallCaveMovementHeld(cave)){
        it.coverReturnBlocked=false;
        if(near)it.dismissedNear=true;
      }
      if(it.near&&!it.dismissedNear&&!it.coverOpen&&!it.coverReturnBlocked){
        it.coverOpen=true;
        it.coverCloseArmed=!this.waterfallCaveMovementHeld(cave);
        it.coverSide='front';
      }
    }
    if(cave.scene==='camp'){
      if(AU.updateWaterfallCaveCampfire)AU.updateWaterfallCaveCampfire();
    }
    if(this.updateWaterfallCaveChurchBlessing(cave))return true;
    if(this.tryWaterfallCaveSceneExit(cave))return true;
    return true;
  },
  handleWaterfallCaveInput(p,kind){
    if(!this.waterfallCaveActive())return false;
    if(this.waterfallCaveChurchBlessingActive&&this.waterfallCaveChurchBlessingActive(this.waterfallCave))return true;
    if(this.waterfallCaveMapOpen(this.waterfallCave)){
      if(kind==='silent')this.closeWaterfallCaveMap(this.waterfallCave);
      return true;
    }
    const it=this.waterfallCave.deepItem;
    if(it&&it.coverOpen){
      const r=this.waterfallCaveCoverRect();
      if(p&&p.x>=r.x&&p.x<r.x+r.w&&p.y>=r.y&&p.y<r.y+r.h)this.toggleWaterfallCaveDeepItemCover(it);
      else this.closeWaterfallCaveDeepItem(it);
      return true;
    }
    const viewCard=this.waterfallCaveActiveViewCard(this.waterfallCave);
    if(viewCard&&viewCard.obj&&viewCard.obj.cardOpen){
      const r=this.waterfallCaveViewCardRect(viewCard);
      if(p&&p.x>=r.x&&p.x<r.x+r.w&&p.y>=r.y&&p.y<r.y+r.h)this.toggleWaterfallCaveViewCard(viewCard);
      else this.closeWaterfallCaveViewCard(viewCard);
      return true;
    }
    const hit=this.waterfallCaveHitObject(p);
    if(hit&&this.waterfallCave){
      this.waterfallCave.hoverObject=hit.def&&hit.def.id||null;
      this.interactWaterfallCaveObject(hit,'click');
      return true;
    }
    if(kind==='silent')this.exitWaterfallCave('silent');
    return true;
  },
  handleWaterfallCaveKey(key){
    if(!this.waterfallCaveActive())return false;
    const cave=this.waterfallCave;
    if(this.waterfallCaveChurchBlessingActive&&this.waterfallCaveChurchBlessingActive(cave))return true;
    if(this.waterfallCaveMapOpen(cave)){
      if(key==='m'||key==='M'||key==='Escape')this.closeWaterfallCaveMap(cave);
      return true;
    }
    const it=cave.deepItem;
    if(it&&it.coverOpen){
      if(key===' '||key==='Spacebar'||key==='Enter'||key==='v'||key==='V'){
        this.toggleWaterfallCaveDeepItemCover(it);
        return true;
      }
      if(key==='Escape'){
        this.closeWaterfallCaveDeepItem(it);
        return true;
      }
      if(it.coverCloseArmed){
        this.closeWaterfallCaveDeepItem(it);
        if(this.setWaterfallCaveMoveKey(cave,key,true))return true;
        return true;
      }
      return true;
    }
    const viewCard=this.waterfallCaveActiveViewCard(cave);
    if(viewCard&&viewCard.obj&&viewCard.obj.cardOpen){
      if(key===' '||key==='Spacebar'||key==='Enter'||key==='v'||key==='V'){
        this.toggleWaterfallCaveViewCard(viewCard);
        return true;
      }
      if(key==='Escape'){
        this.closeWaterfallCaveViewCard(viewCard);
        return true;
      }
      if(viewCard.obj.cardCloseArmed){
        this.closeWaterfallCaveViewCard(viewCard);
        if(this.setWaterfallCaveMoveKey(cave,key,true))return true;
        return true;
      }
      return true;
    }
    if(key==='m'||key==='M'){
      this.openWaterfallCaveMap(cave);
      return true;
    }
    if(this.setWaterfallCaveMoveKey(cave,key,true))return true;
    if(key===' '||key==='Spacebar'||key==='Enter'){
      const hit=this.waterfallCaveNearestObject(cave);
      if(hit)return this.interactWaterfallCaveObject(hit,'key');
    }
    if(key==='Escape'){
      this.exitWaterfallCave('key');
    }
    return true;
  },
  handleWaterfallCaveKeyUp(key){
    if(!this.waterfallCaveActive())return false;
    const cave=this.waterfallCave;
    this.setWaterfallCaveMoveKey(cave,key,false);
    if(cave.sceneExitBlockedKey&&(!cave.keys||!cave.keys[cave.sceneExitBlockedKey]))cave.sceneExitBlockedKey=null;
    if(key==='Shift'||!this.waterfallCaveMovementHeld(cave))cave.running=false;
    const it=cave.deepItem;
    if(it&&it.coverOpen&&!it.coverCloseArmed&&!this.waterfallCaveMovementHeld(cave))it.coverCloseArmed=true;
    const viewCard=this.waterfallCaveActiveViewCard(cave);
    if(viewCard&&viewCard.obj&&viewCard.obj.cardOpen&&!viewCard.obj.cardCloseArmed&&!this.waterfallCaveMovementHeld(cave))viewCard.obj.cardCloseArmed=true;
    this.releaseWaterfallCaveEntryBlock(key);
    return true;
  },
});
