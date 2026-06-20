// ------------------------- UNDERVATTENSGROTTA ------------------------
const UNDERWATER_ENTRY_MUSIC_DUCK=0.34;
Object.assign(G,{
  underwaterCaveActive(){return !!(this.underwaterCave&&this.underwaterCave.active)},
  underwaterCaveSceneDef(cave){
    return typeof underwaterCaveSceneDef==='function'?underwaterCaveSceneDef(cave&&cave.scene):null;
  },
  underwaterCaveSceneBounds(cave){
    return typeof underwaterCaveSceneBoundsFor==='function'?underwaterCaveSceneBoundsFor(cave):{minX:60,maxX:420,minY:70,maxY:282};
  },
  underwaterCaveSceneObjects(cave){
    cave=cave||this.underwaterCave;
    if(!cave)return [];
    cave.sceneState=cave.sceneState||{};
    const bucket=cave.sceneState[cave.scene]||(cave.sceneState[cave.scene]={objects:{}});
    const defs=typeof underwaterCaveSceneObjects==='function'?underwaterCaveSceneObjects(cave.scene):[];
    return defs.map(def=>{
      const id=def.id||def.runtimeKey||'object';
      if(!bucket.objects[id])bucket.objects[id]=underwaterCaveCloneData(def.default||{});
      return {def,obj:bucket.objects[id]};
    });
  },
  underwaterCaveHitContains(hit,obj,x,y,scale){
    if(!hit||!obj)return false;
    const rx=(hit.rx||Math.max(12,(hit.w||24)/2))*(scale||1), ry=(hit.ry||Math.max(10,(hit.h||24)/2))*(scale||1);
    const ox=(obj.x||0)+(hit.dx||0), oy=(obj.y||0)+(hit.dy||0);
    if(hit.type==='rect'){
      const w=(hit.w||rx*2)*(scale||1), h=(hit.h||ry*2)*(scale||1);
      return x>=ox-w/2&&x<=ox+w/2&&y>=oy-h/2&&y<=oy+h/2;
    }
    const dx=(x-ox)/Math.max(1,rx), dy=(y-oy)/Math.max(1,ry);
    return dx*dx+dy*dy<=1;
  },
  underwaterCaveObjectContains(def,obj,x,y,scale){
    return this.underwaterCaveHitContains(def&&def.hit,obj,x,y,scale);
  },
  underwaterCaveObjectBlocks(def,obj,x,y){
    if(!def||!obj||!def.blocker)return false;
    return this.underwaterCaveHitContains(def.block||def.hit,obj,x,y,1);
  },
  underwaterCaveSceneDark(scene){
    return String(scene||'entryPool')!=='entryPool';
  },
  setUnderwaterCaveSceneAudio(scene,opts){
    const dark=this.underwaterCaveSceneDark(scene);
    if(opts&&opts.audio===false)return dark;
    if(dark){
      if(AU.clearMusicDuck)AU.clearMusicDuck(opts&&opts.force?0.2:0.75);
      if(AU.startUnderwaterCaveMysteryMusic)AU.startUnderwaterCaveMysteryMusic(opts&&opts.force?0.55:1.35);
    }else{
      const wasUnderwaterMusic=!!(AU.mus&&AU.mus.kind==='underwaterMystery');
      if(AU.stopUnderwaterCaveMysteryMusic)AU.stopUnderwaterCaveMysteryMusic(opts&&opts.force?0.35:0.75);
      const restartLevelMusic=this.underwaterCaveResumeMusic&&AU.musicOn&&AU.startMusic&&this.state==='PLAY'&&this.level&&(!AU.mus||!AU.mus.timer||wasUnderwaterMusic);
      if(restartLevelMusic&&AU.setMusicDuck)AU.setMusicDuck(UNDERWATER_ENTRY_MUSIC_DUCK,0);
      if(restartLevelMusic){
        AU.startMusic(this.musicKindForLevel(this.levelIdx));
      }
      if(AU.setMusicDuck)AU.setMusicDuck(UNDERWATER_ENTRY_MUSIC_DUCK,restartLevelMusic?0.05:(opts&&opts.force?0.85:0.75));
    }
    return dark;
  },
  underwaterCaveDryStandAt(x,surfaceY){
    if(!this.T)return null;
    const T=this.T,xx=clamp(Math.round(x),4,T.W-5),baseY=Math.round(surfaceY||160);
    const valid=y=>{
      y=Math.round(y);
      if(y<8||y>T.H-5)return false;
      if(T.solid(xx,y)||!T.solid(xx,y+1))return false;
      if(T.solid(xx,y-8)||T.solid(xx-3,y-4)||T.solid(xx+3,y-4))return false;
      if(this.liquidAt(xx,y,0)||this.liquidAt(xx,y+4,0))return false;
      return true;
    };
    for(let d=0;d<=132;d++){
      const up=baseY-d;
      if(valid(up))return {x:xx,y:up,dry:true};
      if(d<=28){
        const down=baseY+d;
        if(valid(down))return {x:xx,y:down,dry:true};
      }
    }
    return null;
  },
  underwaterCaveSurfaceExitSpot(cave){
    if(!cave)return null;
    const water=cave.water||{},ret=cave.returnSpot||{};
    const entryX=Number.isFinite(ret.x)?ret.x:Math.round((water.x||0)+(water.w||0)/2);
    const surfaceY=Math.round(water.sourceY||water.y||ret.y||160);
    const sourceX=Number.isFinite(water.sourceX)?water.sourceX:(Number.isFinite(water.x)?water.x:entryX-20);
    const sourceW=Number.isFinite(water.sourceW)?Math.max(1,water.sourceW):(Number.isFinite(water.w)?Math.max(1,water.w):40);
    const center=sourceX+sourceW/2,preferredSide=entryX<=center?-1:1;
    const probes=[];
    const pushProbe=(x,side,extra)=>{
      probes.push({x:Math.round(x),side,extra:extra||0});
    };
    for(let r=0;r<=96;r+=4){
      pushProbe(entryX-r,entryX-r<=center?-1:1,r*0.08);
      if(r)pushProbe(entryX+r,entryX+r<=center?-1:1,r*0.08);
    }
    for(let r=0;r<=116;r+=4){
      pushProbe(sourceX-6-r,-1,r*0.06);
      pushProbe(sourceX+sourceW+6+r,1,r*0.06);
      if(r<=28){
        pushProbe(sourceX+4+r,-1,18+r*0.3);
        pushProbe(sourceX+sourceW-4-r,1,18+r*0.3);
      }
    }
    let best=null,bestScore=Infinity;
    const seen=new Set();
    for(const p of probes){
      const x=clamp(p.x,4,this.T?this.T.W-5:9999);
      if(seen.has(x))continue;
      seen.add(x);
      const spot=this.underwaterCaveDryStandAt(x,surfaceY-5);
      if(!spot)continue;
      const sidePenalty=p.side===preferredSide?0:18;
      const score=Math.abs(spot.x-entryX)*1.25+Math.abs(spot.y-(surfaceY-8))*0.34+sidePenalty+(p.extra||0);
      if(score<bestScore){best=spot;bestScore=score}
    }
    if(best){
      best.dir=best.x<entryX?-1:1;
      return best;
    }
    return null;
  },
  tryEnterUnderwaterCaveFromManual(l,z){
    if(!l||!z||z.lava||this.underwaterCaveActive())return false;
    if(this.waterfallCaveActive&&this.waterfallCaveActive())return false;
    if(this.cutsceneActive&&this.cutsceneActive())return false;
    if(this.underwaterCaveExitCooldown>0)return false;
    if(!this.isManualActive||!this.isManualActive())return false;
    if(!this.manual||this.manual.lemId!==l.id||!l.holy||l.state!=='MANUAL')return false;
    return this.enterUnderwaterCave(l,z);
  },
  enterUnderwaterCave(l,z,opts){
    if(!l||!z)return false;
    this.underwaterCaveExitCooldown=0;
    if(this.manual&&this.manual.keys)this.manual.keys={left:false,right:false,down:false,run:false,aim:false};
    if(this.manual)this.manual.jumpQueued=null;
    l.fall=0;l.manualVy=0;l.jumpT=0;l.jumpVy=0;l.manualMoving=false;l.swimRing=false;l.fishRingTried=false;
    this.clearRopeAim();
    const spawn=underwaterCaveSceneSpawn('entryPool','entry');
    const key=(this.levelIdx||0)+':'+Math.round(z.x||0)+','+Math.round(z.y||0)+','+Math.round(z.w||0);
    this.underwaterCave={
      active:true,
      scene:'entryPool',
      levelIdx:this.levelIdx||0,
      lemId:l.id,
      waterKey:key,
      water:{
        x:z.x,y:z.y,w:z.w,lava:false,
        sourceX:z.source&&Number.isFinite(z.source.x)?z.source.x:z.x,
        sourceY:z.source&&Number.isFinite(z.source.y)?z.source.y:z.y,
        sourceW:z.source&&Number.isFinite(z.source.w)?z.source.w:z.w
      },
      returnSpot:{x:Math.round(l.x),y:Math.round((z.y||l.y)-7)},
      t:0,
      swimX:spawn.x,
      swimY:spawn.y,
      vx:0,
      vy:0,
      facing:spawn.facing||'front',
      keys:{left:false,right:false,up:false,down:false,run:false},
      sceneState:{},
      bubbles:[],
      mapOpen:false,
      hintT:140
    };
    const caveAudio=!opts||opts.audio!==false;
    this.underwaterCaveResumeMusic=caveAudio&&!!AU.musicOn;
    this.underwaterCaveResumeWeather=caveAudio?this.weatherKind||null:null;
    if(caveAudio){
      if(AU.stopWeather)AU.stopWeather();
      if(AU.stopUnderwaterCaveMysteryMusic)AU.stopUnderwaterCaveMysteryMusic(0.05);
    }else{
      this.underwaterCaveResumeMusic=false;
      this.underwaterCaveResumeWeather=null;
      if(AU.stopUnderwaterCaveMysteryMusic)AU.stopUnderwaterCaveMysteryMusic(0);
    }
    this.setUnderwaterCaveSceneAudio('entryPool',{force:true,audio:caveAudio});
    this.clearTransientText();
    this.toast('DEN HELIGA LÄMMELN SIMMAR NER',120);
    if(AU.sSplash)AU.sSplash(); else if(AU.sWaterfallCaveStoneSplash)AU.sWaterfallCaveStoneSplash(1);
    return true;
  },
  exitUnderwaterCave(reason){
    const cave=this.underwaterCave;
    if(!cave||!cave.active)return false;
    const l=this.findLemById?this.findLemById(cave.lemId):null;
    if(l&&l.alive&&l.alive()){
      const fallback=cave.returnSpot||{};
      const shore=this.underwaterCaveSurfaceExitSpot?this.underwaterCaveSurfaceExitSpot(cave):null;
      const spot=shore||fallback;
      l.x=clamp(Math.round(spot.x==null?l.x:spot.x),4,this.level?this.level.W-5:9999);
      l.y=Math.round(spot.y==null?l.y:spot.y);
      l.dir=Number.isFinite(spot.dir)?spot.dir:l.dir;
      l.state='MANUAL';l.fall=0;l.manualVy=spot.dry?0:-1.2;l.jumpT=0;l.jumpVy=0;l.busyT=0;l.swimRing=false;l.fishRingTried=true;
      if(this.manual){
        this.manual.active=true;
        this.manual.lemId=l.id;
        this.manual.keys={left:false,right:false,down:false,run:false,aim:false};
        this.manual.jumpQueued=null;
      }
    }
    this.underwaterCave=null;
    this.underwaterCaveExitCooldown=48;
    if(AU.stopUnderwaterCaveMysteryMusic)AU.stopUnderwaterCaveMysteryMusic(reason==='silent'?0.05:0.55);
    if(AU.clearMusicDuck)AU.clearMusicDuck(reason==='silent'?0.05:0.35);
    const resumeMusic=!!this.underwaterCaveResumeMusic;
    const resumeWeather=this.underwaterCaveResumeWeather;
    this.underwaterCaveResumeMusic=false;
    this.underwaterCaveResumeWeather=null;
    if(reason!=='silent'&&resumeWeather&&AU.sfxOn&&AU.startWeather)AU.startWeather(resumeWeather);
    if(reason!=='silent'&&resumeMusic&&AU.musicOn&&AU.startMusic&&this.state==='PLAY'&&this.level){
      const levelMusic=this.musicKindForLevel(this.levelIdx);
      if(!(AU.mus&&AU.mus.timer&&AU.mus.kind===levelMusic))AU.startMusic(levelMusic);
    }
    if(reason!=='silent')this.toast(reason==='surface'?'UPPE VID YTAN':'UTE UR UNDERVATTNET',100);
    return true;
  },
  setUnderwaterCaveScene(sceneId,spawnId){
    const cave=this.underwaterCave;
    if(!cave||!cave.active)return false;
    const def=underwaterCaveSceneDef(sceneId);
    if(!def)return false;
    const spawn=underwaterCaveSceneSpawn(sceneId,spawnId||'entry');
    cave.scene=def.id;
    cave.swimX=spawn.x;
    cave.swimY=spawn.y;
    cave.vx=0;cave.vy=0;
    cave.facing=spawn.facing||cave.facing||'front';
    cave.mapOpen=false;
    cave.hintT=90;
    this.setUnderwaterCaveSceneAudio(def.id);
    this.toast(def.label||'NYTT RUM',80);
    return true;
  },
  underwaterCaveTryExit(cave){
    const exits=typeof underwaterCaveSceneExits==='function'?underwaterCaveSceneExits(cave.scene):[];
    const k=cave.keys||{}, x=cave.swimX||0,y=cave.swimY||0;
    for(const e of exits){
      if(!e)continue;
      const held=(e.key==='left'&&k.left)||(e.key==='right'&&k.right)||(e.key==='up'&&k.up)||(e.key==='down'&&k.down);
      if(!held)continue;
      if(Number.isFinite(e.xMin)&&x<e.xMin)continue;
      if(Number.isFinite(e.xMax)&&x>e.xMax)continue;
      if(Number.isFinite(e.x0)&&x<e.x0)continue;
      if(Number.isFinite(e.x1)&&x>e.x1)continue;
      if(Number.isFinite(e.yMin)&&y<e.yMin)continue;
      if(Number.isFinite(e.yMax)&&y>e.yMax)continue;
      if(!e.target)return this.exitUnderwaterCave(e.reason||'surface');
      return this.setUnderwaterCaveScene(e.target,e.spawn);
    }
    return false;
  },
  updateUnderwaterCaveObjects(cave){
    for(const hit of this.underwaterCaveSceneObjects(cave)){
      const def=hit.def,obj=hit.obj;
      if(!def||!obj)continue;
      if(def.kind==='sealedRunes'&&this.syncUnderwaterCaveDeepRuneObjectProgress)this.syncUnderwaterCaveDeepRuneObjectProgress(def,obj);
      if(Number.isFinite(obj.pulseT))obj.pulseT=Math.max(0,obj.pulseT-1);
      if(Number.isFinite(obj.hintT))obj.hintT=Math.max(0,obj.hintT-1);
      obj.near=this.underwaterCaveObjectContains(def,obj,cave.swimX||0,cave.swimY||0,1.35);
      if(obj.near)obj.pulseT=Math.max(obj.pulseT||0,18);
    }
  },
  underwaterCaveBlockerAt(cave,x,y){
    for(const hit of this.underwaterCaveSceneObjects(cave)){
      if(this.underwaterCaveObjectBlocks(hit.def,hit.obj,x,y))return true;
    }
    return false;
  },
  updateUnderwaterCave(){
    if(!this.underwaterCaveActive())return false;
    const cave=this.underwaterCave;
    cave.t++;
    if(cave.messageT>0)cave.messageT--;
    cave.keys=cave.keys||{};
    const b=this.underwaterCaveSceneBounds(cave);
    if(cave.mapOpen){
      cave.vx=0;cave.vy=0;
      this.updateUnderwaterCaveObjects(cave);
      return true;
    }
    const h=(cave.keys.right?1:0)-(cave.keys.left?1:0);
    const v=(cave.keys.down?1:0)-(cave.keys.up?1:0);
    const mag=Math.hypot(h,v);
    const accel=(cave.keys.run?0.34:0.22);
    if(mag>0){
      cave.vx=clamp((cave.vx||0)+h/mag*accel,-2.45,2.45);
      cave.vy=clamp((cave.vy||0)+v/mag*accel,-2.45,2.45);
      if(Math.abs(h)>Math.abs(v))cave.facing=h>0?'right':'left';
      else cave.facing=v<0?'back':'front';
    }
    cave.vx=(cave.vx||0)*0.86;
    cave.vy=(cave.vy||0)*0.86;
    let nx=clamp((cave.swimX||240)+cave.vx,b.minX,b.maxX);
    let ny=clamp((cave.swimY||150)+cave.vy,b.minY,b.maxY);
    if(this.underwaterCaveBlockerAt(cave,nx,ny)){
      if(!this.underwaterCaveBlockerAt(cave,nx,cave.swimY||150))ny=cave.swimY||150;
      else if(!this.underwaterCaveBlockerAt(cave,cave.swimX||240,ny))nx=cave.swimX||240;
      else{nx=cave.swimX||240;ny=cave.swimY||150;cave.vx=0;cave.vy=0}
    }
    cave.swimX=nx;cave.swimY=ny;
    const moving=Math.abs(cave.vx)>0.08||Math.abs(cave.vy)>0.08;
    if(moving&&cave.t%7===0){
      cave.bubbles=cave.bubbles||[];
      if(cave.bubbles.length<34)cave.bubbles.push({x:nx-8+RND()*16,y:ny-5+RND()*8,vy:0.35+RND()*0.55,r:1+Math.floor(RND()*3),t:54+Math.floor(RND()*24)});
    }
    if(cave.bubbles){
      for(const bbl of cave.bubbles){bbl.y-=bbl.vy;bbl.t--}
      cave.bubbles=cave.bubbles.filter(bbl=>bbl.t>0&&bbl.y>24);
    }
    if(cave.hintT>0)cave.hintT--;
    this.updateUnderwaterCaveObjects(cave);
    if(this.underwaterCaveTryExit(cave))return true;
    return true;
  },
  underwaterCavePromptObject(cave){
    for(const hit of this.underwaterCaveSceneObjects(cave)){
      if(hit.obj&&hit.obj.near)return hit;
    }
    return null;
  },
  underwaterCaveDeepRuneEntries(){
    const catalog=typeof underwaterCaveRuneCatalog==='function'?underwaterCaveRuneCatalog():{runes:[]};
    return Array.isArray(catalog.runes)?catalog.runes:[];
  },
  syncUnderwaterCaveDeepRuneObjectProgress(def,obj){
    if(!obj)return null;
    const surface=this.surfaceRuneSummary?this.surfaceRuneSummary():{read:0,total:SURFACE_RUNE_TOTAL,complete:false};
    const deep=this.deepRuneSummary?this.deepRuneSummary():{read:0,total:DEEP_RUNE_TOTAL,complete:false};
    obj.surfaceComplete=!!surface.complete;
    obj.surfaceRead=surface.read||0;
    obj.surfaceTotal=surface.total||SURFACE_RUNE_TOTAL;
    obj.deepRead=deep.read||0;
    obj.deepTotal=deep.total||DEEP_RUNE_TOTAL;
    obj.readComplete=!!deep.complete;
    if(obj.readComplete)obj.hintLines=['ALLA DJUPRUNOR ÄR LÄSTA','ARKIVET LYSER STILLA'];
    else if(obj.surfaceComplete)obj.hintLines=['DET SJUNKNA ARKIVET ÖPPNAS','LÄS NÄSTA DJUPRUNA'];
    else obj.hintLines=['ARKIVET ÄR FÖRSEGLAT','LÄS DE 32 ARKEN FÖRST'];
    return obj;
  },
  readUnderwaterCaveDeepRunes(hit){
    const cave=this.underwaterCave;
    const obj=hit&&hit.obj,def=hit&&hit.def;
    if(!cave||!obj||!def)return false;
    this.syncUnderwaterCaveDeepRuneObjectProgress(def,obj);
    obj.activated=true;
    obj.pulseT=Math.max(obj.pulseT||0,100);
    obj.hintT=Math.max(obj.hintT||0,140);
    const meta=typeof underwaterCaveDeepRuneSetMeta==='function'?underwaterCaveDeepRuneSetMeta():{
      id:'underwater.deepArchive',
      title:'Djuprunor',
      source:'Det sjunkna arkivet',
      world:'Undervattnet',
      kind:RUNE_KIND_DEEP,
      sceneId:'sunkenArchive',
      objectId:'sealedRunes'
    };
    if(this.recordRuneArchiveVisit)this.recordRuneArchiveVisit(Object.assign({},meta,{setId:meta.id}));
    if(!obj.surfaceComplete){
      cave.messageT=130;
      cave.messageLines=['ARKIVET ÄR FÖRSEGLAT','LÄS DE 32 ARKEN FÖRST'];
      this.toast('DJUPRUNORNA VÄNTAR',80);
      if(AU.sWaterfallCaveCrystalChime)AU.sWaterfallCaveCrystalChime(0.65);
      return true;
    }
    const entries=this.underwaterCaveDeepRuneEntries();
    const progress=this.normalizeRuneProgress?this.normalizeRuneProgress(this.runeProgress):{discovered:{}};
    const nextIndex=entries.findIndex(e=>e&&e.key&&!progress.discovered[e.key]);
    if(nextIndex<0){
      cave.messageT=140;
      cave.messageLines=['ALLA DJUPRUNOR ÄR LÄSTA','ARKIVET LYSER STILLA'];
      this.toast('DJUPRUNOR 10/10',90);
      if(AU.sWaterfallCaveCrystalChime)AU.sWaterfallCaveCrystalChime(0.85);
      return true;
    }
    const entry=entries[nextIndex];
    const res=this.recordRuneDiscovery?this.recordRuneDiscovery(entry):{newly:false,setCompletedNow:false};
    this.syncUnderwaterCaveDeepRuneObjectProgress(def,obj);
    const line1=entry.lines&&entry.lines[0]?entry.lines[0]:('DJUPRUNA '+(nextIndex+1)+'/'+entries.length);
    const line2=entry.lines&&entry.lines[1]?entry.lines[1]:(entry.title||'Runan svarar.');
    cave.messageT=170;
    cave.messageLines=[line1,line2];
    this.toast('DJUPRUNA '+Math.min(entries.length,nextIndex+1)+'/'+entries.length,90);
    if(res&&res.newly&&AU.sWaterfallCaveRuneDiscover)AU.sWaterfallCaveRuneDiscover();
    if(res&&res.setCompletedNow){
      this.toast('ALLA DJUPRUNOR ÄR LÄSTA',130);
      if(AU.sWaterfallCaveRunesComplete)AU.sWaterfallCaveRunesComplete();
    }else if(!(res&&res.newly)&&AU.sWaterfallCaveCrystalChime)AU.sWaterfallCaveCrystalChime(0.75);
    return true;
  },
  activateUnderwaterCaveObject(){
    const cave=this.underwaterCave;
    if(!cave||!cave.active)return false;
    const hit=this.underwaterCavePromptObject(cave);
    if(!hit)return false;
    const obj=hit.obj,def=hit.def;
    if(def&&def.kind==='sealedRunes'&&this.readUnderwaterCaveDeepRunes)return this.readUnderwaterCaveDeepRunes(hit);
    obj.activated=true;
    obj.pulseT=Math.max(obj.pulseT||0,80);
    obj.hintT=Math.max(obj.hintT||0,120);
    cave.messageT=110;
    cave.messageLines=underwaterCaveCloneData(obj.hintLines||['VATTNET SVARAR INTE ÄN']);
    this.toast((def&&def.label)||'NÅGOT RÖR SIG I VATTNET',70);
    if(AU.sWaterfallCaveCrystalChime)AU.sWaterfallCaveCrystalChime(0.8);
    return true;
  },
  handleUnderwaterCaveInput(p,kind){
    if(!this.underwaterCaveActive())return false;
    if(kind==='context'){this.exitUnderwaterCave('cancel');return true}
    if(kind==='click')return this.activateUnderwaterCaveObject()||true;
    return true;
  },
  handleUnderwaterCaveKey(key){
    if(!this.underwaterCaveActive())return false;
    const cave=this.underwaterCave;
    cave.keys=cave.keys||{};
    if(key==='Escape'){this.exitUnderwaterCave('cancel');return true}
    if(key==='m'||key==='M'){cave.mapOpen=!cave.mapOpen;return true}
    if(key===' '||key==='Spacebar'||key==='Enter')return this.activateUnderwaterCaveObject()||true;
    if(key==='ArrowLeft'){cave.keys.left=true;return true}
    if(key==='ArrowRight'){cave.keys.right=true;return true}
    if(key==='ArrowUp'){cave.keys.up=true;return true}
    if(key==='ArrowDown'){cave.keys.down=true;return true}
    if(key==='Shift'){cave.keys.run=true;return true}
    return true;
  },
  handleUnderwaterCaveKeyUp(key){
    if(!this.underwaterCaveActive())return false;
    const keys=this.underwaterCave.keys||(this.underwaterCave.keys={});
    if(key==='ArrowLeft')keys.left=false;
    if(key==='ArrowRight')keys.right=false;
    if(key==='ArrowUp')keys.up=false;
    if(key==='ArrowDown')keys.down=false;
    if(key==='Shift')keys.run=false;
    return true;
  }
});
