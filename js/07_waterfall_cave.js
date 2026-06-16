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
  waterfallCaveSceneIds(){
    return typeof waterfallCaveSceneIds==='function'?waterfallCaveSceneIds():['main','deep','camp'];
  },
  waterfallCaveSceneDef(id){
    return typeof waterfallCaveSceneDef==='function'?waterfallCaveSceneDef(id):null;
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
    return bucket[obj.id]||null;
  },
  waterfallCaveSceneObjects(cave){
    cave=cave||this.waterfallCave;
    const defs=typeof waterfallCaveSceneObjects==='function'?waterfallCaveSceneObjects(cave&&cave.scene):[];
    return defs.map(def=>({def,obj:this.waterfallCaveRuntimeObject(cave,def)})).filter(hit=>!!hit.obj);
  },
  waterfallCaveHitObject(p){
    const cave=this.waterfallCave;
    if(!cave||!p)return null;
    for(const hit of this.waterfallCaveSceneObjects(cave)){
      const def=hit.def,obj=hit.obj,h=def.hit||{};
      const ox=(obj.x||0)+(h.dx||0),oy=(obj.y||0)+(h.dy||0);
      let inside=false;
      if(h.type==='rect')inside=p.x>=ox-(h.w||0)/2&&p.x<ox+(h.w||0)/2&&p.y>=oy-(h.h||0)/2&&p.y<oy+(h.h||0)/2;
      else{
        const rx=Math.max(1,h.rx||12),ry=Math.max(1,h.ry||12);
        inside=((p.x-ox)/rx)*((p.x-ox)/rx)+((p.y-oy)/ry)*((p.y-oy)/ry)<=1;
      }
      if(inside)return hit;
    }
    return null;
  },
  ensureWaterfallCaveSceneState(cave){
    cave=cave||this.waterfallCave;
    if(!cave)return null;
    const main=this.waterfallCaveSceneDef('main')||{};
    const deep=this.waterfallCaveSceneDef('deep')||{};
    const camp=this.waterfallCaveSceneDef('camp')||{};
    cave.bounds=cave.bounds||waterfallCaveCloneData(main.bounds||{minX:102,maxX:386,minY:176,maxY:304,exitX0:184,exitX1:296,exitY:218,deepX0:164,deepX1:316,deepY:298});
    cave.deepBounds=cave.deepBounds||waterfallCaveCloneData(deep.bounds||{minX:86,maxX:394,minY:168,maxY:282,exitX0:180,exitX1:300,exitY:178,campX0:154,campX1:326,campY:276});
    cave.campBounds=cave.campBounds||waterfallCaveCloneData(camp.bounds||{minX:74,maxX:406,minY:166,maxY:306,exitX0:168,exitX1:312,exitY:182});
    cave.deepItem=cave.deepItem||waterfallCaveObjectDefault('deep','cover')||{x:246,y:252,near:false,coverOpen:false,dismissedNear:false,coverCloseArmed:false,coverSide:'front',coverReturnBlocked:false};
    cave.campFire=cave.campFire||waterfallCaveObjectDefault('camp','campFire')||{x:318,y:244,rx:54,ry:30};
    cave.visited=cave.visited||{};
    cave.flags=cave.flags||{};
    cave.inventory=cave.inventory||[];
    cave.inputMode=cave.inputMode||'direct';
    cave.hoverObject=cave.hoverObject||null;
    if(!cave.scene)cave.scene='main';
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
    const spawn=typeof waterfallCaveSceneSpawn==='function'?waterfallCaveSceneSpawn(def.id,spawnId):null;
    if(spawn){
      cave.lemX=spawn.x;cave.lemY=spawn.y;
      if(spawn.facing)cave.facing=spawn.facing;
      if(Number.isFinite(spawn.dir))cave.dir=spawn.dir;
    }
    cave.walking=false;
    cave.lastStepT=cave.t||0;
    if(!opts||opts.audio!==false)this.setWaterfallCaveSceneAudio(def.id);
    return true;
  },
  waterfallCaveExitReady(cave,exit){
    if(!cave||!exit)return false;
    if(exit.key==='up'&&!cave.keys.up)return false;
    if(exit.key==='down'&&!cave.keys.down)return false;
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
      this.setWaterfallCaveScene(exit.target,exit.spawn);
      if(exit.markCoverReturn){
        const cover=cave.deepItem||(cave.deepItem=waterfallCaveObjectDefault('deep','cover')||{x:246,y:252});
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
    const chest=waterfallCaveObjectDefault('main','chest')||{x:342,y:226,coins:3,opened:false,collected:false,near:false,glowT:0};
    chest.collected=looted;chest.lootKey=lootKey;
    this.waterfallCave={
      active:true,t:0,scene:'main',inputMode:'direct',lemId:l.id,lemX:spawn.x,lemY:spawn.y,dir:l.dir||1,facing:spawn.facing||'front',walking:false,walkAnim:0,lastStepT:-999,stepSide:0,
      keys:{left:false,right:false,up:false,down:false},
      bounds:waterfallCaveCloneData(main.bounds),
      deepBounds:waterfallCaveCloneData(deep.bounds),
      campBounds:waterfallCaveCloneData(camp.bounds),
      campFire:waterfallCaveObjectDefault('camp','campFire')||{x:318,y:244,rx:54,ry:30},
      deepItem:waterfallCaveObjectDefault('deep','cover')||{x:246,y:252,near:false,coverOpen:false,dismissedNear:false,coverCloseArmed:false,coverSide:'front',coverReturnBlocked:false},
      chest,
      inventory:[],flags:{},visited:{main:true},hoverObject:null,sceneState:{},
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
    if(scene==='camp'){
      if(AU.setWaterfallCaveWaterLevel)AU.setWaterfallCaveWaterLevel(0.28,0.75);
      if(AU.startWaterfallCaveFire)AU.startWaterfallCaveFire();
    }else{
      if(AU.stopWaterfallCaveFire)AU.stopWaterfallCaveFire(0.45);
      if(AU.setWaterfallCaveWaterLevel)AU.setWaterfallCaveWaterLevel(scene==='deep'?0.72:1.0,0.55);
    }
  },
  waterfallCaveMovementHeld(cave){
    const k=(cave&&cave.keys)||{};
    return !!(k.left||k.right||k.up||k.down);
  },
  closeWaterfallCaveDeepItem(it){
    if(!it)return false;
    it.coverOpen=false;
    it.dismissedNear=true;
    it.coverCloseArmed=false;
    return true;
  },
  setWaterfallCaveMoveKey(cave,key,value){
    const k=cave.keys||(cave.keys={});
    if(key==='ArrowLeft')k.left=value;
    else if(key==='ArrowRight')k.right=value;
    else if(key==='ArrowUp')k.up=value;
    else if(key==='ArrowDown')k.down=value;
    return key==='ArrowLeft'||key==='ArrowRight'||key==='ArrowUp'||key==='ArrowDown';
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
    const b=this.waterfallCaveSceneBounds(cave);
    let dx=(cave.keys.right?1:0)-(cave.keys.left?1:0);
    let dy=(cave.keys.down?1:0)-(cave.keys.up?1:0);
    const waitingForCoverRelease=cave.scene==='deep'&&cave.deepItem&&cave.deepItem.coverOpen&&!cave.deepItem.coverCloseArmed;
    if(waitingForCoverRelease){dx=0;dy=0}
    if(dx||dy){
      const inv=Math.hypot(dx,dy)>1?1/Math.hypot(dx,dy):1;
      dx*=inv;dy*=inv;
      const sp=1.55;
      const oldX=cave.lemX==null?240:cave.lemX, oldY=cave.lemY==null?210:cave.lemY;
      let nextX=clamp(oldX+dx*sp,b.minX,b.maxX);
      let nextY=clamp(oldY+dy*sp,b.minY,b.maxY);
      if(cave.scene==='camp'&&this.waterfallCaveCampFireBlocked(cave,nextX,nextY)){
        const tryX=clamp(oldX+dx*sp,b.minX,b.maxX), tryY=oldY;
        if(!this.waterfallCaveCampFireBlocked(cave,tryX,tryY)){nextX=tryX;nextY=tryY}
        else{
          const altX=oldX, altY=clamp(oldY+dy*sp,b.minY,b.maxY);
          if(!this.waterfallCaveCampFireBlocked(cave,altX,altY)){nextX=altX;nextY=altY}
          else{nextX=oldX;nextY=oldY}
        }
      }
      cave.lemX=nextX;
      cave.lemY=nextY;
      if(dx){cave.dir=dx>0?1:-1;cave.facing=dx>0?'right':'left'}
      else cave.facing=dy<0?'back':'front';
      cave.walking=true;
      cave.walkAnim=(cave.walkAnim||0)+1;
      if(AU.sWaterfallCaveStep&&(cave.t-(Number.isFinite(cave.lastStepT)?cave.lastStepT:-999))>=10){
        cave.lastStepT=cave.t;
        cave.stepSide=1-(cave.stepSide||0);
        const depth=clamp(((cave.lemY||0)-b.exitY)/Math.max(1,b.maxY-b.exitY),0,1);
        AU.sWaterfallCaveStep(depth,cave.stepSide);
      }
    }else{
      cave.walking=false;
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
    if(cave.scene==='main'&&this.tryWaterfallCaveSceneExit(cave))return true;
    if(cave.scene==='deep'){
      const it=cave.deepItem||(cave.deepItem={x:246,y:252,near:false,coverOpen:false,dismissedNear:false,coverCloseArmed:false,coverSide:'front',coverReturnBlocked:false});
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
      if(this.tryWaterfallCaveSceneExit(cave))return true;
    }
    if(cave.scene==='camp'){
      if(AU.updateWaterfallCaveCampfire)AU.updateWaterfallCaveCampfire();
      if(this.tryWaterfallCaveSceneExit(cave))return true;
    }
    return true;
  },
  handleWaterfallCaveInput(p,kind){
    if(!this.waterfallCaveActive())return false;
    const it=this.waterfallCave.deepItem;
    if(it&&it.coverOpen){
      const r=this.waterfallCaveCoverRect();
      if(p&&p.x>=r.x&&p.x<r.x+r.w&&p.y>=r.y&&p.y<r.y+r.h)this.toggleWaterfallCaveDeepItemCover(it);
      else this.closeWaterfallCaveDeepItem(it);
      return true;
    }
    const hit=this.waterfallCaveHitObject(p);
    if(hit&&this.waterfallCave){
      this.waterfallCave.hoverObject=hit.def&&hit.def.id||null;
      return true;
    }
    if(kind==='silent')this.exitWaterfallCave('silent');
    return true;
  },
  handleWaterfallCaveKey(key){
    if(!this.waterfallCaveActive())return false;
    const cave=this.waterfallCave;
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
    if(this.setWaterfallCaveMoveKey(cave,key,true))return true;
    if(key==='Escape'){
      this.exitWaterfallCave('key');
    }
    return true;
  },
  handleWaterfallCaveKeyUp(key){
    if(!this.waterfallCaveActive())return false;
    this.setWaterfallCaveMoveKey(this.waterfallCave,key,false);
    const it=this.waterfallCave.deepItem;
    if(it&&it.coverOpen&&!it.coverCloseArmed&&!this.waterfallCaveMovementHeld(this.waterfallCave))it.coverCloseArmed=true;
    this.releaseWaterfallCaveEntryBlock(key);
    return true;
  },
});
