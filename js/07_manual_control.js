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
