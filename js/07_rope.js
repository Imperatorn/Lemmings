// ------------------------ REPKROK / REP -----------------------------
// Metoderna monteras på G i en separat fil för att hålla 07_game.js mindre.
Object.assign(G,{
  clearRopeAim(){this.ropeAim=null},
  handleRopeClick(wx,wy){
    if(!this.skills||this.skills.rope<=0){this.toast('INGA REPKROK KVAR');AU.sShrug();this.clearRopeAim();return false}
    if(this.ropeAim){
      const l=this.findLemById(this.ropeAim.lemId);
      if(!this.canApplySkill(l,'rope')){this.toast('REPLEMMELN KAN INTE SKJUTA NU');AU.sShrug();this.clearRopeAim();return false}
      if(this.fireRopeHook(l,wx,wy)){
        this.skills.rope--;
        if(this.skills.rope<=0)this.selSkill=null;
        this.clearRopeAim();
        return true;
      }
      return false;
    }
    const hit=this.findSkillTarget(wx,wy,'rope');
    if(hit.usable){
      this.ropeAim={lemId:hit.usable.id};
      this.toast('REPKROK: SIKTA OCH KLICKA IGEN');
      AU.sAssign();
      this.skillSpark(hit.usable,'rope');
      return true;
    }
    if(hit.near)this.toast('DEN LEMMELN KAN INTE SKJUTA REP NU');
    else this.toast('KLICKA PÅ EN LEMMEL FÖRST');
    AU.sShrug();
    return false;
  },
  fireRopeHook(l,tx,ty){
    const sc=Math.max(1,l.scale||1);
    const sx=l.x, sy=l.y-9*sc;
    const manualAim=this.manualAimFor(l,'rope');
    let dx,dy;
    if(manualAim!=null){
      dx=Math.cos(manualAim);dy=Math.sin(manualAim);
    }else{
      dx=tx-sx;dy=ty-sy;
      const len=Math.hypot(dx,dy);
      if(len<18){this.toast('SIKTA LÄNGRE BORT');AU.sShrug();return false}
      dx/=len;dy/=len;
    }
    l.dir=dx>=0?1:-1;
    this.hooks.push({x:sx,y:sy,px:sx,py:sy,vx:dx*8.2,vy:dy*8.2,g:0.018,life:86,owner:l.id,baseX:l.x,baseY:l.y,hit:false});
    l.ropeCooldown=12;
    AU.sRopeLaunch();
    this.toast('REPKROK AVFYRAD!');
    return true;
  },
  findRopeDismount(hitX,hitY,baseX,baseY){
    if(!this.T)return null;
    let best=null,bestScore=Infinity;
    const preferDir=hitX>=baseX?1:-1;
    for(let dx=-28;dx<=28;dx++){
      for(let dy=-24;dy<=22;dy++){
        const x=Math.round(hitX+dx), y=Math.round(hitY+dy);
        if(x<4||x>this.T.W-5||y<12||y>this.T.H-3)continue;
        if(!this.isBodyClearAt(x,y))continue;
        if(!this.T.solid(x,y+1))continue;
        const sideBonus=(Math.sign(dx||preferDir)===preferDir)?-3:0;
        const score=Math.abs(dx)*1.6+Math.abs(dy)*1.15+(y>baseY?70:0)+sideBonus;
        if(score<bestScore){bestScore=score;best={x,y,dir:preferDir}}
      }
    }
    return best;
  },
  isBodyClearAt(x,y){
    if(!this.T)return false;
    for(let yy=y-12;yy<=y;yy+=2){
      if(this.T.solid(x,yy)||this.T.solid(x-2,yy)||this.T.solid(x+2,yy))return false;
    }
    return !this.T.solid(x,y);
  },
  attachRopeFromHook(h,hitX,hitY){
    const dis=this.findRopeDismount(hitX,hitY,h.baseX,h.baseY);
    if(!dis){this.toast('KROKEN FICK INGET FÄSTE');AU.sShrug();return false}
    const ropeLen=Math.max(1,Math.hypot(dis.x-h.baseX,dis.y-h.baseY));
    const rope={id:this.ropeSeq++,x1:Math.round(h.baseX),y1:Math.round(h.baseY),x2:dis.x,y2:dis.y,hookX:Math.round(hitX),hookY:Math.round(hitY),exitDir:dis.dir,active:true,age:0,
      len:ropeLen,climbPxPerTick:clamp(ropeLen*0.0225,0.65,1.80)};
    this.ropes.push(rope);
    while(this.ropes.length>6)this.ropes.shift();
    AU.sRopeAttach();
    this.toast('REPET SITTER FAST!');
    const owner=this.findLemById(h.owner);
    if(owner&&this.canApplySkill(owner,'rope')){owner.ropeCooldown=0;owner.startRopeClimb(rope,0)}
    return true;
  },
  ropeAnchorIntact(rope){
    if(!this.T||!rope||!rope.active)return false;
    const x=Math.round(rope.hookX), y=Math.round(rope.hookY);
    if(!Number.isFinite(x)||!Number.isFinite(y))return false;
    // Kroken fastnar med solidBox(..., 2); samma kontaktyta avgör om repet håller.
    return this.T.solidBox(x,y,2);
  },
  detachRope(rope){
    if(!rope||!rope.active)return false;
    rope.active=false;
    for(const l of this.lems||[]){
      if(l&&l.ropeId===rope.id){
        l.state='FALL';l.fall=0;l.ropeId=null;l.ropeCooldown=Math.max(l.ropeCooldown||0,8);
      }
    }
    return true;
  },
  pruneDetachedRopes(){
    if(!this.T||!this.ropes||!this.ropes.length)return 0;
    let removed=0;
    for(const rope of this.ropes){
      if(rope&&rope.active&&!this.ropeAnchorIntact(rope)){
        this.detachRope(rope);
        removed++;
      }
    }
    if(removed)this.ropes=this.ropes.filter(r=>r&&r.active);
    return removed;
  },
  updateHooksAndRopes(){
    if(!this.T)return;
    this.pruneDetachedRopes();
    for(const rope of this.ropes||[])rope.age++;
    for(const h of this.hooks||[]){
      h.life--;h.vy+=h.g||0;
      const steps=Math.max(1,Math.ceil(Math.max(Math.abs(h.vx),Math.abs(h.vy))));
      for(let i=0;i<steps&&!h.hit;i++){
        h.px=h.x;h.py=h.y;
        h.x+=h.vx/steps;h.y+=h.vy/steps;
        if(h.x<2||h.x>this.T.W-2||h.y<0||h.y>this.T.H+18||h.life<=0){h.hit=true;h.missed=true;break}
        if(this.T.solidBox(h.x,h.y,2)){
          h.hit=true;
          this.attachRopeFromHook(h,h.x,h.y);
        }
      }
      if(h.missed){this.toast('KROKEN MISSADE');AU.sShrug()}
      if(!h.hit&&this.parts.length<MAX_PARTICLES){
        this.parts.push({x:h.x,y:h.y,vx:0,vy:0,life:5,g:0,col:'#c8b080'});
      }
    }
    this.hooks=this.hooks.filter(h=>!h.hit);
  },
  closestPointOnRope(rope,x,y){
    const ax=rope.x1,ay=rope.y1,bx=rope.x2,by=rope.y2;
    const vx=bx-ax,vy=by-ay,den=vx*vx+vy*vy||1;
    let t=((x-ax)*vx+(y-ay)*vy)/den;
    t=clamp(t,0,1);
    const px=ax+vx*t,py=ay+vy*t;
    return {t,x:px,y:py,d:Math.hypot(x-px,y-py)};
  },
  findClimbableRope(l){
    if(!l||!l.alive()||l.ropeCooldown>0||!this.ropes||this.ropes.length===0)return null;
    if(!(l.state==='WALK'||l.state==='FALL'))return null;
    let best=null,bestScore=Infinity;
    for(const rope of this.ropes){
      if(!rope.active)continue;
      const cp=this.closestPointOnRope(rope,l.x,l.y-5);
      const nearBase=Math.abs(l.x-rope.x1)<=9&&Math.abs(l.y-rope.y1)<=12;
      if(cp.t>=0.96)continue;
      if(cp.d<=6.5||nearBase){
        const t=nearBase?0:clamp(cp.t,0,0.94);
        const score=(nearBase?0:cp.d)+t*2;
        if(score<bestScore){bestScore=score;best={rope,t}}
      }
    }
    return best;
  }
});
