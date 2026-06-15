// ------------------------ DIREKTSTYRNING ----------------------------
Object.assign(G,{
  isManualActive(){return !!(this.manual&&this.manual.active)},
  manualLem(){return this.manual?this.findLemById(this.manual.lemId):null},
  canManualControl(l){
    return !!(l&&l.alive&&l.alive()&&(l.state==='WALK'||l.state==='FALL'||l.state==='SHRUG'||l.state==='CLIMB'||l.state==='JUMP'||l.state==='MANUAL'));
  },
  findManualTarget(wx,wy){
    let best=null,bestS=1;
    for(const l of this.lems||[]){
      if(!l.alive||!l.alive())continue;
      const sc=Math.max(1,l.scale||1);
      const dx=(l.x-wx)/(14*sc),dy=((l.y-5*sc)-wy)/(17*sc);
      const s=dx*dx+dy*dy;
      if(s<bestS){best=l;bestS=s}
    }
    return best;
  },
  startManualControl(l){
    if(!this.canManualControl(l)){this.toast('KAN INTE DIREKTSTYRA DEN LEMMELN NU');AU.sShrug();return false}
    if(this.manual&&this.manual.used){this.toast('DIREKTSTYRNING HAR REDAN ANVÄNTS PÅ DENNA BANA');AU.sShrug();return false}
    this.clearRopeAim();
    this.manual={used:true,active:true,lemId:l.id,lampOn:false,keys:{left:false,right:false,down:false,run:false,aim:false},jumpQueued:null,aimAngle:l.dir>=0?0:Math.PI};
    l.state='MANUAL';l.busyT=0;l.fall=0;l.jumpT=0;l.jumpVy=0;l.manualVy=0;l.ropeId=null;l.ropeCooldown=10;
    this.skillSpark(l,'manual');
    this.toast('DIREKT: PILAR STYR, SHIFT SPRING, CTRL SIKTE, L LAMPA',120);
    AU.sAssign();
    return true;
  },
  stopManualControl(reason){
    const m=this.manual;
    if(!m||!m.active)return false;
    const l=this.findLemById(m.lemId);
    if(l&&l.alive&&l.alive()&&l.state==='MANUAL'){
      l.state=this.T&&(this.T.solid(l.x,l.y+1)||this.manualPlatformAt(l.x,l.y+1))?'WALK':'FALL';
      l.fall=0;l.manualVy=0;l.busyT=0;
    }
    m.active=false;m.lemId=null;m.keys={left:false,right:false,down:false,run:false,aim:false};m.jumpQueued=null;m.lampOn=false;
    if(reason!=='dead'&&reason!=='skill')this.toast('DIREKTSTYRNING AVSLUTAD');
    return true;
  },
  toggleManualControlAt(wx,wy){
    if(this.state!=='PLAY')return false;
    if(this.isManualActive())return this.stopManualControl();
    const l=this.findManualTarget(wx,wy);
    if(!l){this.toast('HÖGERKLICKA PÅ EN LEMMEL FÖR DIREKTSTYRNING');AU.sShrug();return false}
    return this.startManualControl(l);
  },
  setManualKey(k,v){
    if(!this.manual)this.manual={used:false,active:false,lemId:null,lampOn:false,keys:{},jumpQueued:null};
    this.manual.keys=this.manual.keys||{};
    this.manual.keys[k]=!!v;
    if(k==='aim'&&v){
      const l=this.manualLem&&this.manualLem();
      if(!Number.isFinite(this.manual.aimAngle))this.manual.aimAngle=l&&l.dir<0?Math.PI:0;
    }
  },
  normAimAngle(a){
    const tau=Math.PI*2;
    a=Number.isFinite(a)?a:0;
    a%=tau;
    return a<0?a+tau:a;
  },
  adjustManualAim(delta){
    if(!this.manual||!this.manual.active)return false;
    const l=this.manualLem&&this.manualLem();
    if(!l)return false;
    if(!Number.isFinite(this.manual.aimAngle))this.manual.aimAngle=l.dir<0?Math.PI:0;
    this.manual.aimAngle=this.normAimAngle(this.manual.aimAngle+delta);
    l.dir=Math.cos(this.manual.aimAngle)>=0?1:-1;
    return true;
  },
  manualAimFor(l,k){
    if(!this.manual||!this.manual.active||!l||this.manual.lemId!==l.id)return null;
    if(k!=='baz'&&k!=='flame'&&k!=='rope')return null;
    if(!Number.isFinite(this.manual.aimAngle))this.manual.aimAngle=l.dir<0?Math.PI:0;
    return this.normAimAngle(this.manual.aimAngle);
  },
  queueManualJump(superJump){
    if(!this.isManualActive())return false;
    this.manual.jumpQueued={super:!!superJump};
    return true;
  },
  toggleManualLamp(){
    if(!this.isManualActive())return false;
    this.manual.lampOn=!this.manual.lampOn;
    AU.sLamp();
    this.toast(this.manual.lampOn?'DIREKTLAMPA PÅ':'DIREKTLAMPA AV');
    return true;
  },
  waterfallCaveActive(){return !!(this.waterfallCave&&this.waterfallCave.active)},
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
    this.waterfallCave={
      active:true,t:0,lemId:l.id,lemX:240,lemY:210,dir:l.dir||1,
      keys:{left:false,right:false,up:false,down:false},
      bounds:{minX:112,maxX:370,minY:70,maxY:230,exitX0:184,exitX1:296,exitY:82},
      chest:{x:342,y:219,coins:3,opened:looted,collected:looted,near:false,glowT:looted?16:0,lootKey},
      wf:{x:wf.x,y:wf.y,w:wf.w||28,h:wf.h||130,v:wf.v||0,theme:this.level&&this.level.theme},
      exitCam:this.cam,exitViewY:this.viewY,exitZoom:this.viewZoom
    };
    if(AU.startWaterfallCave)AU.startWaterfallCave();
    this.toast('BAKOM VATTENFALLET - PILARNA STYR',120);
    AU.sClick();
    return true;
  },
  exitWaterfallCave(reason){
    if(!this.waterfallCaveActive())return false;
    this.waterfallCave.active=false;
    this.waterfallCave=null;
    if(AU.stopWaterfallCave)AU.stopWaterfallCave();
    if(this.manual&&this.manual.keys)this.manual.keys={left:false,right:false,down:false,run:false,aim:false};
    if(this.manual)this.manual.jumpQueued=null;
    if(reason!=='silent')this.toast('UTE UR GROTTVY');
    return true;
  },
  updateWaterfallCave(){
    if(!this.waterfallCaveActive())return false;
    const cave=this.waterfallCave;
    cave.t++;
    cave.keys=cave.keys||{};
    cave.bounds=cave.bounds||{minX:112,maxX:370,minY:70,maxY:230,exitX0:184,exitX1:296,exitY:82};
    let dx=(cave.keys.right?1:0)-(cave.keys.left?1:0);
    let dy=(cave.keys.down?1:0)-(cave.keys.up?1:0);
    if(dx||dy){
      const inv=Math.hypot(dx,dy)>1?1/Math.hypot(dx,dy):1;
      dx*=inv;dy*=inv;
      const sp=1.55;
      cave.lemX=clamp((cave.lemX==null?240:cave.lemX)+dx*sp,cave.bounds.minX,cave.bounds.maxX);
      cave.lemY=clamp((cave.lemY==null?210:cave.lemY)+dy*sp,cave.bounds.minY,cave.bounds.maxY);
      if(dx)cave.dir=dx>0?1:-1;
    }
    const ch=cave.chest;
    if(ch){
      const dist=Math.hypot((cave.lemX||0)-ch.x,(cave.lemY||0)-ch.y);
      ch.near=dist<34;
      ch.glowT=clamp((ch.glowT||0)+(ch.near?4:-2),0,70);
      if(ch.near&&!ch.collected&&this.collectWaterfallCaveChest)this.collectWaterfallCaveChest(cave);
    }
    if((cave.lemY||0)<=cave.bounds.exitY&&(cave.lemX||0)>=cave.bounds.exitX0&&(cave.lemX||0)<=cave.bounds.exitX1){
      this.exitWaterfallCave('walkout');
    }
    return true;
  },
  handleWaterfallCaveInput(p,kind){
    if(!this.waterfallCaveActive())return false;
    if(kind==='silent')this.exitWaterfallCave('silent');
    return true;
  },
  handleWaterfallCaveKey(key){
    if(!this.waterfallCaveActive())return false;
    const k=this.waterfallCave.keys||(this.waterfallCave.keys={});
    if(key==='ArrowLeft')k.left=true;
    else if(key==='ArrowRight')k.right=true;
    else if(key==='ArrowUp')k.up=true;
    else if(key==='ArrowDown')k.down=true;
    else if(key==='Escape'){
      this.exitWaterfallCave('key');
    }
    return true;
  },
  handleWaterfallCaveKeyUp(key){
    if(!this.waterfallCaveActive())return false;
    const k=this.waterfallCave.keys||(this.waterfallCave.keys={});
    if(key==='ArrowLeft')k.left=false;
    else if(key==='ArrowRight')k.right=false;
    else if(key==='ArrowUp')k.up=false;
    else if(key==='ArrowDown')k.down=false;
    return true;
  },
  updateManualState(){
    const m=this.manual;
    if(!m||!m.active)return;
    const l=this.findLemById(m.lemId);
    if(!l||!l.alive||!l.alive()||l.state==='EXITING'||l.state==='SPLAT'||l.state==='DROWN'||l.state==='BURN'||l.dead){
      this.stopManualControl('dead');
      return;
    }
    if(l.state==='MANUAL')return;
    if(this.manualResumeState(l.state))this.resumeManualControl(l);
  },
  updateManualCameraFollow(){
    if(!this.manual||!this.manual.active||!this.level)return false;
    const l=this.findLemById(this.manual.lemId);
    if(!l||!l.alive||!l.alive())return false;
    const z=this.viewZoom||1;
    const left=88,right=VW-92,top=48,bottom=VH-54;
    const sx=(l.x-(this.cam||0))*z;
    if(sx<left)this.cam=l.x-left/z;
    else if(sx>right)this.cam=l.x-right/z;
    if(z>1.001){
      const sy=(l.y-(this.viewY||0))*z;
      if(sy<top)this.viewY=l.y-top/z;
      else if(sy>bottom)this.viewY=l.y-bottom/z;
    }
    this.clampView();
    return true;
  },
  manualResumeState(st){
    return st==='WALK'||st==='FALL'||st==='SHRUG'||st==='CLIMB';
  },
  manualActiveSkillState(st){
    return st==='BUILD'||st==='DBUILD'||st==='BASH'||st==='MINE'||st==='DIG'||st==='BAZ'||st==='JET'||st==='FLAME'||st==='ROPE'||st==='BLOCK';
  },
  resumeManualControl(l){
    if(!this.manual||!this.manual.active||!l||this.manual.lemId!==l.id||!l.alive())return false;
    l.state='MANUAL';
    l.busyT=0;l.jumpT=0;l.jumpVy=0;l.ropeId=null;l.ropeCooldown=Math.max(l.ropeCooldown||0,4);
    if(this.manualGrounded(l)){l.fall=0;l.manualVy=0}
    else{l.fall=0;l.manualVy=Math.max(l.manualVy||0,0.8)}
    return true;
  },
  cancelManualSkillWithInput(action){
    if(!this.manual||!this.manual.active)return false;
    const l=this.findLemById(this.manual.lemId);
    if(!l||!l.alive||!l.alive()||l.state==='MANUAL')return false;
    if(this.manualResumeState(l.state)){
      this.resumeManualControl(l);
    }else if(this.manualActiveSkillState(l.state)){
      l.afterBazState=null;l.manualAimAngle=null;l.fuel=0;l.jetT=0;l.jetBlockedT=0;l.ropeId=null;l.ropeCooldown=Math.max(l.ropeCooldown||0,6);
      this.resumeManualControl(l);
      this.toast('DIREKTSKILL AVBRUTEN');
      AU.sShrug();
    }else return false;
    if(action==='left'||action==='right')this.setManualKey(action,true);
    if(action==='up')this.queueManualJump(this.manual&&this.manual.keys&&this.manual.keys.down);
    return true;
  },
  manualGrounded(l){
    return !!(l&&this.T&&(this.T.solid(l.x,l.y+1)||this.manualPlatformAt(l.x,l.y+1)));
  },
  manualSkillState(l){
    if(!l||l.state!=='MANUAL')return l?l.state:null;
    return this.manualGrounded(l)?'WALK':'FALL';
  },
  releaseManualForSkill(l,k){
    if(!this.manual||!this.manual.active||!l||this.manual.lemId!==l.id)return;
    if(k==='climb'||k==='float'||k==='bomb')return;
    this.manual.keys={left:false,right:false,down:false,run:false,aim:!!(this.manual.keys&&this.manual.keys.aim)};
    this.manual.jumpQueued=null;
  }
});
