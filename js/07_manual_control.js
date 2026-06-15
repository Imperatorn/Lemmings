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
      l.skipClimbCutsceneT=Math.max(l.skipClimbCutsceneT||0,Math.round(1400/TICK));
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
  waterfallCaveEntryBlocked(){return !!this.waterfallCaveExitNeedsUpRelease},
  releaseWaterfallCaveEntryBlock(key){
    if(key==='ArrowUp')this.waterfallCaveExitNeedsUpRelease=false;
    return !this.waterfallCaveExitNeedsUpRelease;
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
    this.waterfallCave={
      active:true,t:0,scene:'main',lemId:l.id,lemX:240,lemY:232,dir:l.dir||1,facing:'front',walking:false,walkAnim:0,lastStepT:-999,stepSide:0,
      keys:{left:false,right:false,up:false,down:false},
      bounds:{minX:102,maxX:386,minY:176,maxY:304,exitX0:184,exitX1:296,exitY:218,deepX0:164,deepX1:316,deepY:298},
      deepBounds:{minX:86,maxX:394,minY:168,maxY:282,exitX0:180,exitX1:300,exitY:178},
      deepItem:{x:246,y:252,near:false,coverOpen:false,dismissedNear:false,coverCloseArmed:false,coverSide:'front'},
      chest:{x:342,y:226,coins:3,opened:false,collected:looted,near:false,glowT:0,lootKey},
      wf:{x:wf.x,y:wf.y,w:wf.w||28,h:wf.h||130,v:wf.v||0,theme:this.level&&this.level.theme},
      exitCam:this.cam,exitViewY:this.viewY,exitZoom:this.viewZoom
    };
    this.waterfallCaveResumeMusic=!!AU.musicOn;
    this.waterfallCaveResumeWeather=this.weatherKind||null;
    if(AU.silenceMusicForWaterfallCave)AU.silenceMusicForWaterfallCave(1.0);
    else if(AU.stopMusic)AU.stopMusic();
    if(AU.stopWeather)AU.stopWeather();
    if(AU.startWaterfallCave)AU.startWaterfallCave();
    this.toast('BAKOM VATTENFALLET - PILARNA STYR',120);
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
  updateWaterfallCave(){
    if(!this.waterfallCaveActive())return false;
    const cave=this.waterfallCave;
    cave.t++;
    cave.keys=cave.keys||{};
    cave.bounds=cave.bounds||{minX:102,maxX:386,minY:176,maxY:304,exitX0:184,exitX1:296,exitY:218,deepX0:164,deepX1:316,deepY:298};
    cave.deepBounds=cave.deepBounds||{minX:86,maxX:394,minY:168,maxY:282,exitX0:180,exitX1:300,exitY:178};
    if(!cave.scene)cave.scene='main';
    const b=cave.scene==='deep'?cave.deepBounds:cave.bounds;
    let dx=(cave.keys.right?1:0)-(cave.keys.left?1:0);
    let dy=(cave.keys.down?1:0)-(cave.keys.up?1:0);
    const waitingForCoverRelease=cave.scene==='deep'&&cave.deepItem&&cave.deepItem.coverOpen&&!cave.deepItem.coverCloseArmed;
    if(waitingForCoverRelease){dx=0;dy=0}
    if(dx||dy){
      const inv=Math.hypot(dx,dy)>1?1/Math.hypot(dx,dy):1;
      dx*=inv;dy*=inv;
      const sp=1.55;
      cave.lemX=clamp((cave.lemX==null?240:cave.lemX)+dx*sp,b.minX,b.maxX);
      cave.lemY=clamp((cave.lemY==null?210:cave.lemY)+dy*sp,b.minY,b.maxY);
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
    if(cave.scene==='main'&&cave.keys.down&&(cave.lemY||0)>=cave.bounds.deepY&&(cave.lemX||0)>=cave.bounds.deepX0&&(cave.lemX||0)<=cave.bounds.deepX1){
      cave.scene='deep';
      cave.lemX=240;cave.lemY=190;cave.facing='front';cave.walking=false;cave.lastStepT=cave.t;
    }
    if(cave.scene==='deep'){
      const it=cave.deepItem||(cave.deepItem={x:246,y:252,near:false,coverOpen:false,dismissedNear:false,coverCloseArmed:false,coverSide:'front'});
      const ix=Math.abs((cave.lemX||0)-it.x),iy=Math.abs((cave.lemY||0)-it.y);
      const near=(ix/30)*(ix/30)+(iy/20)*(iy/20)<=1;
      const leftResetZone=(ix/38)*(ix/38)+(iy/26)*(iy/26)>=1;
      it.near=near;
      if(leftResetZone){
        it.dismissedNear=false;
        if(it.coverOpen)it.coverOpen=false;
        it.coverCloseArmed=false;
      }
      if(it.near&&!it.dismissedNear&&!it.coverOpen){
        it.coverOpen=true;
        it.coverCloseArmed=!this.waterfallCaveMovementHeld(cave);
        it.coverSide='front';
      }
      if(cave.keys.up&&(cave.lemY||0)<=cave.deepBounds.exitY&&(cave.lemX||0)>=cave.deepBounds.exitX0&&(cave.lemX||0)<=cave.deepBounds.exitX1){
        if(it.coverOpen)this.closeWaterfallCaveDeepItem(it);
        cave.scene='main';
        cave.lemX=240;cave.lemY=cave.bounds.maxY-8;cave.facing='back';cave.walking=false;cave.lastStepT=cave.t;
      }
    }
    if(cave.scene==='main'&&cave.keys.up&&(cave.lemY||0)<=cave.bounds.exitY&&(cave.lemX||0)>=cave.bounds.exitX0&&(cave.lemX||0)<=cave.bounds.exitX1){
      this.exitWaterfallCave('walkout');
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
