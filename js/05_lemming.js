// --------------------------- LEMMEL ---------------------------------
// Tillstånd: WALK FALL CLIMB BLOCK BUILD SHRUG BASH MINE DIG BAZ JET FLAME JUMP
//            FAINT EXITING SPLAT DROWN BURN DEAD
let LEM_ID=1;
class Lemming{
  constructor(x,y){
    this.id=LEM_ID++;
    this.x=x;this.y=y;this.dir=1;
    this.state='FALL';this.fall=0;this.soft=false;this.glide=0;
    this.climber=false;this.floater=false;this.chute=false;
    this.bombT=-1;this.busyT=0;this.bricks=0;this.fuel=0;
    this.jetT=0;this.jetBlockedT=0;this.afterBazState=null;
    this.jumpT=0;this.jumpVy=0;this.manualVy=0;this.ropeId=null;this.ropeT=0;this.ropeCooldown=0;
    this.scale=1;this.manualMoving=false;
    this.anim=Math.floor(RND()*4);this.dead=false;
  }
  alive(){return !this.dead&&this.state!=='SPLAT'&&this.state!=='DROWN'&&this.state!=='BURN'&&this.state!=='EXITING'}
  actionScale(){return Math.max(1,this.scale||1)}
  kill(kind){
    if(this.dead)return;
    if(kind==='splat'){this.state='SPLAT';this.busyT=0;AU.sSplat()}
    else if(kind==='drown'){this.state='DROWN';this.busyT=0;AU.sDrown()}
    else if(kind==='burn'){this.state='BURN';this.busyT=0;AU.sSizzle()}
    else{this.dead=true;AU.sDie()}
    G.dropLampIfCarrier(this);
  }
  update(T){
    this.anim++;
    if(this.ropeCooldown>0)this.ropeCooldown--;
    // bombnedräkning pågår oavsett tillstånd
    if(this.bombT>0){
      this.bombT--;
      if(this.bombT%16===0&&this.bombT>0)AU.sTick();
      if(this.bombT===0&&!this.dead&&this.state!=='EXITING'){
        const sc=this.actionScale();
        G.explode(this.x,this.y-4*sc,26*sc,true,'lemming');
        G.dropLampIfCarrier(this);
        this.dead=true;
        return;
      }
    }
    if(this.enforceWorldActionBoundary(T))return;
    switch(this.state){
      case 'WALK': this.walk(T); break;
      case 'MANUAL': this.manualControl(T); break;
      case 'FALL': this.fallStep(T); break;
      case 'CLIMB': this.climb(T); break;
      case 'BLOCK':
        if(!T.solid(this.x,this.y+1)){this.state='FALL';this.fall=0;G.blockers=null}
        break;
      case 'BUILD': this.build(T); break;
      case 'DBUILD': this.downBuild(T); break;
      case 'SHRUG': if(++this.busyT>14)this.state='WALK'; break;
      case 'BASH': this.bash(T); break;
      case 'MINE': this.mine(T); break;
      case 'DIG': this.dig(T); break;
      case 'BAZ': this.bazooka(T); break;
      case 'JET': this.jet(T); break;
      case 'FLAME': this.flamethrower(T); break;
      case 'JUMP': this.sillyJump(T); break;
      case 'ROPE': this.ropeClimb(T); break;
      case 'FAINT':
        if(!T.solid(this.x,this.y+1)){this.state='FALL';this.fall=0;break}
        if(--this.busyT<=0){this.state='WALK';this.busyT=0}
        break;
      case 'EXITING': if(++this.busyT>14)G.finishLemmingExit(this); break;
      case 'SPLAT': if(++this.busyT>18)this.dead=true; break;
      case 'DROWN': this.y+=1; if(this.anim%3===0)G.bubble(this.x,this.y-6);
        if(++this.busyT>16)this.dead=true; break;
      case 'BURN': if(this.anim%2===0)G.flame(this.x,this.y-4);
        if(++this.busyT>10)this.dead=true; break;
    }
    this.enforceWorldActionBoundary(T);
    if(this.y>T.H+6&&!this.dead){this.kill('out');}
  }
  boundaryActionState(){
    return this.state==='BUILD'||this.state==='DBUILD'||this.state==='BASH'||this.state==='MINE'||this.state==='DIG'||
      this.state==='BAZ'||this.state==='JET'||this.state==='FLAME'||this.state==='ROPE';
  }
  enforceWorldActionBoundary(T){
    if(!T||!this.boundaryActionState())return false;
    const min=3,max=T.W-3,margin=(this.state==='DIG'||this.state==='BASH'||this.state==='MINE')?9:3;
    const out=this.x<min||this.x>max;
    const atWorkingEdge=this.x<=min+margin||this.x>=max-margin;
    const drivingOut=(this.dir<0&&this.x<=min+margin)||(this.dir>0&&this.x>=max-margin);
    if(!out&&!atWorkingEdge&&!drivingOut)return false;
    this.x=clamp(this.x,min,max);
    this.state='WALK';this.busyT=0;this.fall=0;this.jumpT=0;this.jumpVy=0;this.fuel=0;this.ropeId=null;this.manualAimAngle=null;
    AU.sShrug();
    return true;
  }
  turnedByBlocker(nx){
    for(const b of G.lems){
      if(b!==this&&b.state==='BLOCK'&&Math.abs(b.y-this.y)<12){
        const d=Math.abs(nx-b.x);
        if(d<7&&d<Math.abs(this.x-b.x))return true;
      }
    }
    return false;
  }
  tryStepOverTinyGap(T,nx,baseY){
    // NÃ¥gra banor har 1-2 px skarvar mellan ramp och plattform. De ska lÃ¤sas
    // som ojÃ¤mn mark, inte som en riktig ravin.
    // Regeln nedan tillater 1-3 px och landning nagra pixlar hogre.
    const yOffsets=[0,-1,1,-2,2,-3,3,-4,-5,-6];
    for(let gap=1;gap<=3;gap++){
      const tx=nx+this.dir*gap;
      if(tx<3||tx>T.W-3||this.turnedByBlocker(tx))return false;
      for(const yo of yOffsets){
        const ty=baseY+yo;
        if(ty<4||ty>T.H-5)continue;
        if(!T.solid(tx,ty)&&T.solid(tx,ty+1)&&!T.solid(tx,ty-6)){
          this.x=tx;this.y=ty;
          return true;
        }
      }
    }
    return false;
  }
  walk(T){
    const climbRope=G.findClimbableRope(this);
    if(climbRope){this.startRopeClimb(climbRope.rope,climbRope.t);return}
    if(T.stairBox&&T.stairBox(this.x,this.y+1,2)&&(this.anim&1)){
      G.checkExit(this);G.checkLiquid(this);return;
    }
    const nx=this.x+this.dir;
    if(nx<3||nx>T.W-3){this.dir*=-1;return}
    if(this.turnedByBlocker(nx)){this.dir*=-1;return}
    let ny=this.y;
    if(T.solid(nx,ny)){           // marken stiger
      let up=0;
      while(T.solid(nx,ny)&&up<7){ny--;up++}
      if(up>=7){                   // vägg
        if(this.climber){this.state='CLIMB';this.busyT=0;return}
        this.dir*=-1;return;
      }
    }else{                         // marken sjunker?
      let down=0;
      while(!T.solid(nx,ny+1)&&down<4){ny++;down++}
      if(down>=4){
        if(this.tryStepOverTinyGap(T,nx,this.y)){G.checkExit(this);G.checkLiquid(this);return}
        this.x=nx;this.state='FALL';this.fall=0;this.chute=false;this.soft=false;return
      }
    }
    this.x=nx;this.y=ny;
    G.checkExit(this); G.checkLiquid(this);
  }
  fallStep(T){
    const climbRope=G.findClimbableRope(this);
    if(climbRope){this.startRopeClimb(climbRope.rope,climbRope.t);return}
    let spd=3;
    if(this.floater){ if(this.fall>14){this.chute=true;spd=1} }
    else if(this.soft){ spd=2 }
    for(let i=0;i<spd;i++){
      if(T.solid(this.x,this.y+1)){ // landa
        if(this.fall>SPLAT_FALL&&!this.floater&&!this.soft){this.kill('splat')}
        else{
          if(this.fall>8){AU.sLand(this.fall);G.landingPuff(this.x,this.y,this.fall,this.scale)}
          this.state='WALK';this.chute=false;this.soft=false;
        }
        return;
      }
      this.y++;this.fall++;
      if(this.soft&&this.glide!==0&&i===0){ // jetpack-glid
        if(!T.solid(this.x+this.glide,this.y)&&!T.solid(this.x+this.glide,this.y-5))this.x+=this.glide;
      }
    }
    G.checkLiquid(this);
  }
  climb(T){
    if(T.solid(this.x,this.y-8)){      // slår i utsprång -> faller bakåt
      this.x-=this.dir;this.dir*=-1;
      this.state='FALL';this.fall=0;return;
    }
    if(!T.solid(this.x+this.dir,this.y)){ // väggen tar slut -> häv upp
      this.x+=this.dir;
      let guard=0;
      while(T.solid(this.x,this.y)&&guard++<10)this.y--;
      this.state='WALK';return;
    }
    this.y--;
    if(this.anim%5===0)AU.sClimbStep();
  }
  build(T){
    this.busyT++;
    if(this.busyT%BUILD_STEP_TICKS!==0)return;
    const sc=this.actionScale(),bw=Math.round(BUILD_BRICK_W*sc),bh=Math.max(1,Math.round(BUILD_BRICK_H*sc));
    const adv=Math.max(1,Math.round(BUILD_ADVANCE_X*sc)),stepY=Math.max(1,Math.round(BUILD_STEP_Y*sc));
    // lägg en platta framför + ett steg upp
    const x0=this.dir>0?this.x:this.x-(bw-1);
    T.brick(x0,this.y-bh+1,bw,bh,terrainBrickColor(G.level,x0,this.y));
    this.bricks++;
    AU.sBuildStep(false);
    const hx=this.x+this.dir*adv;
    if(T.solid(hx,this.y-Math.round(3*sc))||T.solid(hx,this.y-Math.round(9*sc))){ // slår i tak/vägg
      this.state='WALK';this.dir*=-1;AU.sShrug();return;
    }
    this.x+=this.dir*adv;this.y-=stepY;
    if(this.bricks>=BUILD_MAX_BRICKS){this.state='SHRUG';this.busyT=0;AU.sShrug()}
  }
  downBuild(T){
    this.busyT++;
    if(this.busyT%BUILD_STEP_TICKS!==0)return;
    const sc=this.actionScale(),bw=Math.round(BUILD_BRICK_W*sc),bh=Math.max(1,Math.round(BUILD_BRICK_H*sc));
    const adv=Math.max(1,Math.round(BUILD_ADVANCE_X*sc)),stepY=Math.max(1,Math.round(BUILD_STEP_Y*sc));
    // NEDBYGGARE: lägg en platta framför lemmeln och två pixlar lägre.
    // Plankan får samma blockiga form som vanliga byggaren men fungerar som
    // en nedåtgående ramp över gropar eller från en kant.
    const x0=this.dir>0?this.x:this.x-(bw-1);
    const y0=this.y+stepY+1;
    T.brick(x0,y0,bw,bh,terrainBrickColor(G.level,x0,y0));
    // Rensa precis ovanför den nya plankan så lemmeln inte fastnar i en tunn
    // kantpixel när trappan byggs ned genom ojämn terräng.
    T.clearRect(x0,y0-bh,bw,bh);
    T.brick(x0,y0,bw,bh,terrainBrickColor(G.level,x0,y0));
    this.bricks++;
    AU.sBuildStep(true);
    const hx=this.x+this.dir*adv;
    if(T.solid(hx,this.y-Math.round(9*sc))){ // tak framför byggaren
      this.state='WALK';this.dir*=-1;AU.sShrug();return;
    }
    this.x+=this.dir*adv;this.y+=stepY;
    if(this.y>T.H-6){this.state='FALL';this.fall=0;return}
    if(this.bricks>=BUILD_MAX_BRICKS){this.state='SHRUG';this.busyT=0;AU.sShrug()}
  }
  bash(T){
    this.busyT++;
    if(this.busyT%4!==2)return;
    const sc=this.actionScale(),w=Math.round(11*sc),h=Math.round(9*sc);
    const x0=this.dir>0?this.x:this.x-(w-1);
    T.clearRect(x0,this.y-h+1,w,h);
    G.debris(this.x+this.dir*Math.round(5*sc),this.y-Math.round(4*sc),Math.round(4*sc));
    AU.sBash();
    this.x+=this.dir*Math.max(1,Math.round(2*sc));
    if(!T.solid(this.x,this.y+1)){this.state='FALL';this.fall=0;return}
    // klar? inget berg kvar inom rackhall framfor (pixelvis sa rester inte missas)
    let any=false;
    for(let dx=2;dx<=Math.round(12*sc)&&!any;dx++)
      for(let k=1;k<Math.round(9*sc);k++)if(T.solid(this.x+this.dir*dx,this.y-k)){any=true;break}
    if(!any)this.state='WALK';
  }
  mine(T){
    this.busyT++;
    if(this.busyT%4!==1)return;
    const sc=this.actionScale();
    // Snedgrävningen behöver ett litet extra bett i framkant. Annars kan
    // sista delen av snedtunneln lämna kvar en tunn stump som bromsar lemlarna.
    const cutX=this.x+this.dir*Math.round(4*sc), cutY=this.y-Math.round(4*sc);
    T.clearDisc(cutX,cutY,Math.round(7*sc));
    T.clearDisc(this.x+this.dir*Math.round(8*sc),this.y-Math.round(2*sc),Math.round(5*sc));
    const rw=Math.round(12*sc),rh=Math.round(9*sc);
    T.clearRect(this.dir>0?this.x+1:this.x-rw,this.y-rh+1,rw,rh);
    G.debris(cutX,this.y-Math.round(2*sc),Math.round(5*sc));
    AU.sMine();
    this.x+=this.dir*Math.max(1,Math.round(3*sc));this.y+=Math.max(1,Math.round(2*sc));
    // Extra efterrensning ett steg längre fram gör att den sneda gången får
    // samma rena avslut som lemming-bomb/bananexplosionerna.
    T.clearDisc(this.x+this.dir*Math.round(5*sc),this.y-Math.round(4*sc),Math.round(4*sc));
    if(!T.solid(this.x,this.y+1)){this.state='FALL';this.fall=0}
    G.checkLiquid(this);
  }
  dig(T){
    this.busyT++;
    if(this.busyT%3!==1)return;
    const sc=this.actionScale(),half=Math.round(7*sc),w=half*2+1,h1=Math.round(6*sc),h2=Math.max(2,Math.round(3*sc));
    // Bredare och något högre första skär så att det inte blir kvar en
    // liten "tapp"/stump precis under fötterna efter ett grävtag.
    T.clearRect(this.x-half,this.y-1,w,h1);
    // Ett litet extra nedre skär gör tunneln sammanhängande även på
    // texturerad/rampad terräng där enstaka pixlar annars kan hänga kvar.
    T.clearRect(this.x-half,this.y-1+h1,w,h2);
    G.debris(this.x,this.y+1,Math.round(4*sc));
    AU.sDig();
    this.y+=Math.max(1,Math.round(2*sc));
    let any=false;
    for(let dx=-half;dx<=half;dx++)if(T.solid(this.x+dx,this.y+1)){any=true;break}
    if(!any){this.state='FALL';this.fall=0}
    G.checkLiquid(this);
  }
  startSillyJump(ticks){
    if(!this.alive()||(this.state!=='WALK'&&this.state!=='SHRUG'))return false;
    this.state='JUMP';
    this.jumpT=ticks||SILLY_JUMP_TICKS;
    this.jumpVy=-4.6-G.rand()*0.8;
    this.busyT=0;this.fall=0;this.chute=false;this.soft=false;
    AU.sHop();
    return true;
  }
  manualSolidAt(T,x,y){
    if(T.solid(x,y))return true;
    return !!G.manualPlatformAt(x,y);
  }
  manualSolidBox(T,x,y,r){
    if(T.solidBox(x,y,r))return true;
    for(let yy=(y|0)-r;yy<=(y|0)+r;yy++)
      for(let xx=(x|0)-r;xx<=(x|0)+r;xx++)
        if(G.manualPlatformAt(xx,yy))return true;
    return false;
  }
  manualControl(T){
    const m=G.manual||{};
    if(!m.active||m.lemId!==this.id){this.manualMoving=false;this.state=this.manualSolidAt(T,this.x,this.y+1)?'WALK':'FALL';this.fall=0;return}
    const keys=m.keys||{};
    const startX=this.x,startY=this.y;
    this.busyT++;
    let grounded=this.manualSolidAt(T,this.x,this.y+1);

    // Horisontell direktstyrning. På mark använder vi ungefär samma
    // småstegslogik som vanlig WALK så lämmeln inte fastnar på låga kanter.
    // Shift springer genom att göra två säkra enpixeldrag per tick.
    const h=(keys.left?-1:0)+(keys.right?1:0);
    if(h!==0){
      this.dir=h>0?1:-1;
      const steps=keys.run?2:1;
      for(let step=0;step<steps;step++){
        const nx=this.x+this.dir;
        if(nx<3||nx>T.W-3||this.turnedByBlocker(nx))break;
        if(grounded){
          let ny=this.y;
          if(this.manualSolidAt(T,nx,ny)){
            let up=0;
            while(this.manualSolidAt(T,nx,ny)&&up<7){ny--;up++}
            if(up<7){this.x=nx;this.y=ny}
            else break;
          }else{
            let down=0;
            while(!this.manualSolidAt(T,nx,ny+1)&&down<5){ny++;down++}
            this.x=nx;this.y=ny;
            if(down>=5){grounded=false;this.fall=0;break}
          }
        }else if(!this.manualSolidBox(T,nx,this.y-5,2)&&!this.manualSolidAt(T,nx,this.y)){
          this.x=nx;
        }else{
          break;
        }
      }
    }

    grounded=this.manualSolidAt(T,this.x,this.y+1);
    if(grounded&&m.jumpQueued){
      this.manualVy=m.jumpQueued.super?-7.2:-5.0;
      this.fall=0;
      grounded=false;
      m.jumpQueued=null;
      AU.sHop();
    }else if(grounded){
      this.manualVy=0;
      this.fall=0;
      m.jumpQueued=null;
    }

    // Tyngdkraft och hopp. Hoppet fungerar samtidigt som vänster/höger, så
    // spelaren kan hoppa framåt över hinder.
    if(!grounded){
      this.manualVy=clamp((this.manualVy||0)+0.36,-7.6,4.6);
      const dy=Math.round(this.manualVy);
      if(dy<0){
        for(let i=0;i<-dy;i++){
          if(this.manualSolidAt(T,this.x,this.y-11)||this.manualSolidBox(T,this.x,this.y-8,2)){
            this.manualVy=1.2;break;
          }
          this.y--;
        }
      }else if(dy>0){
        for(let i=0;i<dy;i++){
          if(this.manualSolidAt(T,this.x,this.y+1)){
            if(this.fall>SPLAT_FALL&&!this.floater&&!this.soft){
              G.stopManualControl('dead');
              this.kill('splat');
              return;
            }
            this.manualVy=0;this.fall=0;grounded=true;
            break;
          }
          this.y++;this.fall++;
        }
      }
    }

    G.checkExit(this);
    G.checkLiquid(this);
    this.manualMoving=!grounded||Math.abs(this.x-startX)>0.05||Math.abs(this.y-startY)>0.05;
  }
  sillyJump(T){
    this.jumpT--;

    // Hopprycket ska vara ett faktiskt spelhinder, men inte fastna lätt i väggar.
    const nx=this.x+this.dir;
    if(nx<3||nx>T.W-3||this.turnedByBlocker(nx)){
      this.dir*=-1;
    }else if(!T.solidBox(nx,this.y-5,2)&&!T.solid(nx,this.y)){
      this.x=nx;
    }else{
      this.dir*=-1;
    }

    this.jumpVy=clamp(this.jumpVy+0.38,-5.4,4.2);
    const dy=Math.round(this.jumpVy);
    if(dy<0){
      for(let i=0;i<-dy;i++){
        if(T.solid(this.x,this.y-11)||T.solidBox(this.x,this.y-8,2)){
          this.jumpVy=1.2;break;
        }
        this.y--;
      }
    }else if(dy>0){
      for(let i=0;i<dy;i++){
        if(T.solid(this.x,this.y+1)){
          if(this.jumpT>0){
            this.jumpVy=-4.2-G.rand()*0.7;
          }else{
            this.state='WALK';this.jumpVy=0;this.jumpT=0;
          }
          G.checkExit(this);G.checkLiquid(this);
          return;
        }
        this.y++;
      }
    }

    if(this.jumpT<=0){
      this.jumpT=0;this.jumpVy=0;
      if(T.solid(this.x,this.y+1))this.state='WALK';
      else{this.state='FALL';this.fall=0;}
    }
    G.checkExit(this);G.checkLiquid(this);
  }
  startRopeClimb(rope,t){
    if(!rope||this.ropeCooldown>0)return false;
    this.state='ROPE';
    this.ropeId=rope.id;
    this.ropeT=clamp(t==null?0:t,0,0.95);
    this.busyT=0;this.fall=0;this.jumpT=0;this.jumpVy=0;this.soft=false;this.chute=false;
    this.dir=(rope.x2>=rope.x1)?1:-1;
    AU.sAssign();
    return true;
  }
  ropeClimb(T){
    const rope=G.ropes&&G.ropes.find(r=>r.id===this.ropeId&&r.active);
    if(!rope){this.state='FALL';this.fall=0;this.ropeId=null;return}
    this.busyT++;
    if(this.busyT%6===1)AU.sRopeStep();
    // Klättringen ska kännas som en faktisk pixelhastighet längs repet.
    // Tidigare ökade ropeT med en fast procent per tick, vilket gjorde att
    // långa rep klättrades på samma tid som korta rep och därför såg för snabba ut.
    const ropeLen=rope.len||Math.max(1,Math.hypot(rope.x2-rope.x1,rope.y2-rope.y1));
    const climbPxPerTick=rope.climbPxPerTick||clamp(ropeLen*0.0225,0.65,1.80);
    const climbSpeed=climbPxPerTick/ropeLen;
    this.ropeT=clamp(this.ropeT+climbSpeed,0,1);
    const t=this.ropeT;
    this.x=Math.round(rope.x1+(rope.x2-rope.x1)*t);
    this.y=Math.round(rope.y1+(rope.y2-rope.y1)*t);
    if(t>=0.995){
      this.x=rope.x2;this.y=rope.y2;this.dir=rope.exitDir||this.dir;
      this.state=T.solid(this.x,this.y+1)?'WALK':'FALL';
      this.fall=0;this.ropeId=null;this.ropeCooldown=22;this.busyT=0;
      G.checkExit(this);G.checkLiquid(this);
    }
  }
  bazooka(T){
    this.busyT++;
    if(this.busyT===1){
      // Frys inte fast lemmeln om bazookan gavs i luften eller under en kort annan animation.
      this.afterBazState=T.solid(this.x,this.y+1)?'WALK':'FALL';
    }
    if(this.busyT===4){
      const sc=this.actionScale();
      const aim=Number.isFinite(this.manualAimAngle)?this.manualAimAngle:null;
      const ux=aim==null?this.dir:Math.cos(aim), uy=aim==null?0:Math.sin(aim);
      G.rockets.push({
        x:this.x+ux*7*sc,
        y:this.y-7*sc+uy*7*sc,
        vx:ux*6.4,
        vy:uy*6.4+(aim==null?-0.28:0),
        g:0.052,
        life:110,
        dir:ux>=0?1:-1,
        scale:sc
      });
      AU.sBazooka();
      AU.sLemHehe('bazooka');
      G.recoil(this.x,this.y-6*sc,ux>=0?1:-1,sc);
    }
    if(this.busyT>10){
      if(!T.solid(this.x,this.y+1)){this.state='FALL';this.fall=0;}
      else this.state='WALK';
      this.afterBazState=null;this.manualAimAngle=null;
    }
  }
  flamethrower(T){
    this.busyT++;
    if(this.busyT===1){
      this.afterBazState=T.solid(this.x,this.y+1)?'WALK':'FALL';
      AU.sFlamethrower();
      AU.sLemHehe('flame');
    }
    if(this.busyT<=FLAME_TICKS){
      G.flamethrowerBurst(this,this.busyT);
      if(this.busyT%5===1)AU.sFlamethrower();
    }
    if(this.busyT>FLAME_TICKS+3){
      if(!T.solid(this.x,this.y+1)){this.state='FALL';this.fall=0;}
      else this.state='WALK';
      this.afterBazState=null;this.manualAimAngle=null;
    }
  }
  jet(T){
    this.fuel--;this.jetT++;
    G.jetFlame(this.x,this.y,this.dir,this.actionScale());
    AU.sJetFly();

    let moved=false;
    const lift=this.jetT<24?2:1;
    for(let i=0;i<lift;i++){
      // Vertikal jetpack-rörelse ska kunna skrapa längs en vägg.
      // Kontrollera därför bara punkten ovanför huvudet här; sidokollisioner
      // hanteras separat i framåtrörelsen. Annars fastnar lemmeln vid klippväggen.
      if(!T.solid(this.x,this.y-10)){this.y--;moved=true}
      else break;
    }
    const forward=this.jetT<36?2:1;
    for(let i=0;i<forward;i++){
      if(!T.solidBox(this.x+this.dir,this.y-4,2)&&!T.solid(this.x+this.dir,this.y)){
        this.x+=this.dir;moved=true;
      }else break;
    }

    this.jetBlockedT=moved?0:(this.jetBlockedT||0)+1;
    if(this.fuel<=0||this.jetBlockedT>12){
      this.state='FALL';this.fall=0;this.soft=true;this.glide=this.dir;
    }
    G.checkLiquid(this);
  }
}
