// ------------------------- UNDERVATTENSGROTTA ------------------------
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
      water:{x:z.x,y:z.y,w:z.w,lava:false},
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
      const spot=cave.returnSpot||{};
      l.x=clamp(Math.round(spot.x==null?l.x:spot.x),4,this.level?this.level.W-5:9999);
      l.y=Math.round(spot.y==null?l.y:spot.y);
      l.state='MANUAL';l.fall=0;l.manualVy=-1.2;l.jumpT=0;l.jumpVy=0;l.busyT=0;l.swimRing=false;l.fishRingTried=true;
      if(this.manual){
        this.manual.active=true;
        this.manual.lemId=l.id;
        this.manual.keys={left:false,right:false,down:false,run:false,aim:false};
        this.manual.jumpQueued=null;
      }
    }
    this.underwaterCave=null;
    this.underwaterCaveExitCooldown=48;
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
  activateUnderwaterCaveObject(){
    const cave=this.underwaterCave;
    if(!cave||!cave.active)return false;
    const hit=this.underwaterCavePromptObject(cave);
    if(!hit)return false;
    const obj=hit.obj,def=hit.def;
    obj.activated=true;
    obj.pulseT=Math.max(obj.pulseT||0,80);
    obj.hintT=Math.max(obj.hintT||0,120);
    cave.messageT=110;
    cave.messageLines=underwaterCaveCloneData(obj.hintLines||['VATTNET SVARAR TYST']);
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
