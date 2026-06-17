// ------------------------ TELEPORTERINGSSTEN ------------------------
const PORTAL_STONE_MAX_DIST=Math.round(VW*1.5);
const PORTAL_STONE_ENTER_COOLDOWN=22;

Object.assign(G,{
  unlockHolyTeleportStone(l){
    if(l&&l.holy){
      l.teleportStone=true;
      this.holyTeleportStoneLemId=l.id;
    }
    const newly=!this.holyTeleportStoneUnlocked;
    this.holyTeleportStoneUnlocked=true;
    if(this.normalizeHolyLemmings)this.normalizeHolyLemmings(l&&l.holy?l:null);
    this.savePrefs();
    return newly;
  },
  portalStoneButtonVisible(){
    return !!this.holyTeleportStoneUnlocked;
  },
  portalStoneOwner(){
    if(!this.holyTeleportStoneUnlocked)return null;
    let l=this.holyTeleportStoneLemId!=null?this.findLemById(this.holyTeleportStoneLemId):null;
    if(!(l&&l.holy&&l.teleportStone&&l.alive&&l.alive())){
      l=(this.lems||[]).find(q=>q&&q.holy&&q.teleportStone&&q.alive&&q.alive())||null;
    }
    if(l)this.holyTeleportStoneLemId=l.id;
    return l||null;
  },
  portalStoneButtonAvailable(){
    return !!this.portalStoneOwner();
  },
  portalStoneSurfaceClear(x,y){
    if(!this.T||!this.level)return false;
    x=Math.round(x);y=Math.round(y);
    if(x<4||x>this.T.W-5||y<8||y>this.T.H-4)return false;
    if(this.liquidAt&&this.liquidAt(x,y+2,4))return false;
    if(!this.T.solid(x,y+1))return false;
    if(this.isInGoalZone&&this.isInGoalZone(x,y,12))return false;
    if(this.T.solidBox&&(this.T.solidBox(x,y-8,4)||this.T.solidBox(x,y-18,5)))return false;
    return true;
  },
  portalStoneSurfaceAt(x,yHint,range){
    if(!this.T)return null;
    const xx=clamp(Math.round(x),5,this.T.W-6);
    const base=clamp(Math.round(Number.isFinite(yHint)?yHint:120),8,this.T.H-6);
    const r=Math.max(8,Math.round(range||72));
    for(let d=0;d<=r;d++){
      const up=base-d,down=base+d;
      if(up>=6&&this.portalStoneSurfaceClear(xx,up))return {x:xx,y:up};
      if(d>0&&down<this.T.H-3&&this.portalStoneSurfaceClear(xx,down))return {x:xx,y:down};
    }
    return null;
  },
  portalStoneEntranceFor(l){
    if(!l||!this.T)return null;
    const sc=Math.max(1,l.scale||1),d=l.dir>=0?1:-1;
    const tries=[24,18,12,6,0,-8,-14];
    for(const off of tries){
      const s=this.portalStoneSurfaceAt(l.x+d*off*sc,l.y,54);
      if(s)return {x:s.x,y:s.y,dir:d};
    }
    return null;
  },
  findPortalStoneTarget(wx,wy){
    let best=null,bestScore=Infinity;
    for(const l of this.lems||[]){
      if(!l||!l.holy||!l.teleportStone||!l.alive||!l.alive())continue;
      const s=this.skillHitScore(l,wx,wy,'portal');
      if(Number.isFinite(s)&&s<bestScore){best=l;bestScore=s}
    }
    return best;
  },
  handlePortalStoneClick(wx,wy){
    if(!this.holyTeleportStoneUnlocked){this.toast('TELEPORTERINGSSTEN SAKNAS');AU.sShrug();return false}
    const l=this.findPortalStoneTarget(wx,wy);
    if(!l){this.toast('KLICKA PÅ DEN HELIGA LÄMMELN');AU.sShrug();return false}
    return this.beginPortalStonePlacement(l);
  },
  beginPortalStonePlacement(l){
    if(!l||!l.holy||!l.teleportStone||!l.alive||!l.alive()){
      this.toast('STENEN KAN BARA ANVÄNDAS AV DEN HELIGA LÄMMELN');
      AU.sShrug();
      return false;
    }
    const entry=this.portalStoneEntranceFor(l);
    if(!entry){this.toast('HITTAR INGEN PLATS FÖR PORTAL');AU.sShrug();return false}
    this.portalStone={
      placingExit:true,active:false,ownerId:l.id,t:0,
      in:{x:entry.x,y:entry.y,dir:entry.dir||1},
      out:null,
      prevPaused:!!this.paused
    };
    this.paused=true;
    this.selSkill='portal';
    this.portalStoneSpark(entry.x,entry.y,'in');
    if(AU.sPortalStoneOpen)AU.sPortalStoneOpen();
    this.toast('PLACERA UTGÅNGSPORTAL');
    return true;
  },
  portalStoneExitCandidate(wx,wy){
    if(!this.portalStone||!this.portalStone.in)return {ok:false,reason:'INGEN INGÅNGSPORTAL'};
    const p=this.portalStoneSurfaceAt(wx,wy,84);
    if(!p)return {ok:false,reason:'INGEN STABIL MARK'};
    const dx=p.x-this.portalStone.in.x,dy=p.y-this.portalStone.in.y;
    const dist=Math.hypot(dx,dy);
    if(dist<42)return {ok:false,point:p,reason:'FÖR NÄRA INGÅNGEN'};
    if(dist>PORTAL_STONE_MAX_DIST)return {ok:false,point:p,reason:'FÖR LÅNGT BORT'};
    return {ok:true,point:p};
  },
  portalStoneCanPlaceExit(wx,wy){
    return this.portalStoneExitCandidate(wx,wy).ok;
  },
  placePortalStoneExit(wx,wy){
    const ps=this.portalStone;
    if(!ps||!ps.placingExit)return false;
    const res=this.portalStoneExitCandidate(wx,wy);
    if(!res.ok){
      this.toast(res.reason||'KAN INTE PLACERA PORTAL DÄR');
      AU.sShrug();
      return false;
    }
    ps.out={x:res.point.x,y:res.point.y,dir:ps.in&&ps.in.dir||1};
    ps.placingExit=false;
    ps.active=true;
    ps.t=0;
    this.paused=false;
    this.selSkill=null;
    this.portalStoneSpark(ps.out.x,ps.out.y,'out');
    if(AU.sPortalStoneOpen)AU.sPortalStoneOpen();
    this.toast('PORTALERNA ÄR ÖPPNA');
    return true;
  },
  cancelPortalStonePlacement(){
    if(!this.portalStone||!this.portalStone.placingExit)return false;
    const wasPaused=!!this.portalStone.prevPaused;
    this.portalStone=null;
    this.paused=wasPaused;
    if(this.selSkill==='portal')this.selSkill=null;
    this.toast('PORTAL AVBRUTEN');
    AU.sShrug();
    return true;
  },
  clearPortalStone(){
    this.portalStone=null;
    if(this.selSkill==='portal')this.selSkill=null;
  },
  portalStoneSpark(x,y,kind){
    const cols=kind==='out'?['#ff70ff','#80d8ff','#ffffff']:['#80d8ff','#c060ff','#ffffff'];
    for(let i=0;i<18;i++){
      const a=RND()*Math.PI*2,r=1+RND()*10;
      this.parts.push({x:x+Math.cos(a)*r,y:y-10+Math.sin(a)*r*0.7,vx:Math.cos(a)*(0.22+RND()*0.8),vy:Math.sin(a)*(0.16+RND()*0.55)-0.25,life:14+(RND()*14|0),g:0.015,col:cols[i%cols.length]});
    }
    this.flashes.push({x,y:y-10,r:30,t:10,maxT:10});
  },
  updatePortalStone(){
    const ps=this.portalStone;
    if(!ps||!ps.active||!ps.in||!ps.out)return false;
    ps.t=(ps.t||0)+1;
    for(const l of this.lems||[]){
      if(!l||!l.alive||!l.alive())continue;
      if(l.portalCooldown>0)l.portalCooldown--;
      const sc=Math.max(1,l.scale||1);
      const dx=Math.abs(l.x-ps.in.x),dy=Math.abs(l.y-ps.in.y);
      if((l.portalCooldown||0)>0||dx>Math.max(7,7*sc)||dy>Math.max(15,13*sc))continue;
      const exitDir=l.dir||ps.out.dir||1;
      l.x=ps.out.x+exitDir*4;
      l.y=ps.out.y;
      l.fall=0;l.jumpT=0;l.jumpVy=0;l.manualVy=0;l.ropeId=null;l.ropeCooldown=8;
      l.portalCooldown=PORTAL_STONE_ENTER_COOLDOWN;
      if(this.T&&!this.T.solid(l.x,l.y+1))l.state='FALL';
      else if(l.state!=='MANUAL')l.state='WALK';
      this.portalStoneSpark(ps.out.x,ps.out.y,'out');
      if(AU.sPortalStoneTravel)AU.sPortalStoneTravel();
    }
    return true;
  }
});
