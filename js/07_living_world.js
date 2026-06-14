// ------------------------ LEVANDE VÄRLD -----------------------------
Object.assign(G,{
  updateDolphins(){
    for(const d of this.dolphins){
      d.t++;
      if(d.t%3===0){
        const p=clamp(d.t/d.dur,0,1);
        const x=d.sx+(d.tx-d.sx)*p, y=d.sy+(d.ty-d.sy)*p-Math.sin(p*Math.PI)*18;
        this.bubble(x,y+4);
      }
    }
    this.dolphins=this.dolphins.filter(d=>d.t<d.dur);
  },
  spawnMeteor(){
    if(!this.level||!this.level.night||this.level.cave)return null;
    const dur=Math.round((4.0+this.rand()*1.1)*1000/TICK);
    const dir=this.rand()<0.5?1:-1;
    const viewPad=90;
    const sx=this.cam+(dir>0?-viewPad:VW+viewPad);
    const ex=this.cam+(dir>0?VW+viewPad:-viewPad);
    const sy=20+this.rand()*48;
    const ey=sy+34+this.rand()*42;
    const m={x:sx,y:sy,sx,sy,ex,ey,t:0,dur,dir,glow:0.75+this.rand()*0.25,seed:this.rand()*7};
    this.meteors.push(m);
    return m;
  },
  updateMeteors(){
    if(!this.level||!this.level.night||this.level.cave){this.meteors=[];return}
    this.meteorT--;
    if(this.meteorT<=0){
      this.spawnMeteor();
      this.meteorT=Math.round((42+this.rand()*58)*1000/TICK);
    }
    for(const m of this.meteors){
      m.t++;
      const p=clamp(m.t/m.dur,0,1);
      const ease=p<0.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
      m.x=m.sx+(m.ex-m.sx)*ease;
      m.y=m.sy+(m.ey-m.sy)*ease;
    }
    this.meteors=this.meteors.filter(m=>m.t<m.dur);
  },
  canEatMushroom(l){
    return !!(l&&l.alive&&l.alive()&&(l.scale||1)<LEM_GIANT_SCALE&&l.bombT<=0&&
      (l.state==='WALK'||l.state==='MANUAL'||l.state==='SHRUG'||l.state==='JUMP'));
  },
  growLemmingFromMushroom(l,mush){
    if(!this.canEatMushroom(l))return false;
    l.scale=LEM_GIANT_SCALE;
    l.giant=true;
    this.skillSpark(l,'mush');
    this.flashes.push({x:l.x,y:l.y-12*LEM_GIANT_SCALE,r:34,t:13,maxT:13});
    for(let i=0;i<16&&this.parts.length<MAX_PARTICLES;i++){
      const a=RND()*6.283,sp=0.35+RND()*1.4;
      this.parts.push({x:mush.x+RND()*8-4,y:mush.y-5+RND()*4-2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-0.8,
        life:12+RND()*14,g:0.08,col:RND()<0.55?'#e8d070':'#d08030',glow:RND()<0.35});
    }
    this.toast('EN LEMMEL ÅT EN SVAMP OCH VÄXTE!');
    AU.sPop();
    return true;
  },
  updateMushroomEatingEffects(){
    const mushrooms=(this.decor||[]).filter(d=>d.t==='mush'&&!d.eaten&&!d.remove);
    if(!mushrooms.length)return;
    for(const m of mushrooms){
      if(!Array.isArray(m.tasteIds))m.tasteIds=[];
      const nearIds=[];
      for(const l of this.lems||[]){
        if(!l.alive||!l.alive())continue;
        const sc=Math.max(1,l.scale||1);
        const near=Math.abs(l.x-m.x)<=8*sc&&Math.abs(l.y-m.y)<=12*sc;
        if(!near)continue;
        nearIds.push(l.id);
        if(m.tasteIds.includes(l.id))continue;
        m.tasteIds.push(l.id);
        if(this.canEatMushroom(l)&&this.rand()<MUSHROOM_EAT_CHANCE&&this.growLemmingFromMushroom(l,m)){
          m.eaten=true;
          m.remove=true;
          break;
        }
      }
      m.tasteIds=m.tasteIds.filter(id=>nearIds.includes(id));
    }
  },
  mummyPatrolX(m){
    const range=m&&m.w||120, spd=m&&m.speed||0.13, loop=range*2;
    const mt=m&&m.animT||0;
    const t=(mt*spd+(m&&m.v||0)*loop)%loop;
    return (m&&m.x||0)+(t<range?t:loop-t);
  },
  canMummyScareLemming(l){
    return !!(l&&l.alive&&l.alive()&&l.bombT<=0&&(l.state==='WALK'||l.state==='MANUAL'||l.state==='SHRUG'));
  },
  faintLemmingFromMummy(l){
    if(!this.canMummyScareLemming(l))return false;
    if(this.manual&&this.manual.active&&this.manual.lemId===l.id){
      this.manual.keys={left:false,right:false,down:false,run:false,aim:false};
      this.manual.jumpQueued=null;
    }
    l.state='FAINT';
    l.busyT=FAINT_MIN_TICKS+Math.round(this.rand()*(FAINT_MAX_TICKS-FAINT_MIN_TICKS));
    l.fall=0;l.jumpT=0;l.jumpVy=0;l.manualVy=0;l.ropeId=null;l.afterBazState=null;l.fuel=0;
    this.skillSpark(l,'faint');
    this.toast('EN LEMMEL BLEV RÄDD OCH SVIMMADE!');
    AU.sShrug();
    return true;
  },
  updateMummyScareEffects(){
    const mummies=(this.decor||[]).filter(d=>d.t==='mummy');
    if(!mummies.length)return;
    for(const m of mummies){
      m.animT=(m.animT||0)+1;
      const mx=this.mummyPatrolX(m), my=m.y;
      const nearIds=[];
      if(!Array.isArray(m.scareIds))m.scareIds=[];
      for(const l of this.lems||[]){
        if(!l.alive||!l.alive())continue;
        const near=Math.abs(l.x-mx)<=13&&Math.abs(l.y-my)<=11;
        if(!near)continue;
        nearIds.push(l.id);
        if(m.scareIds.includes(l.id))continue;
        m.scareIds.push(l.id);
        if(this.canMummyScareLemming(l)&&this.rand()<MUMMY_SCARE_CHANCE)this.faintLemmingFromMummy(l);
      }
      m.scareIds=m.scareIds.filter(id=>nearIds.includes(id));
    }
  },
  canWarmAtTorch(l){
    return !!(l&&l.alive&&l.alive()&&l.bombT<=0&&(l.state==='WALK'||l.state==='SHRUG'));
  },
  startTorchWarm(l,torch){
    if(!this.canWarmAtTorch(l)||!torch)return false;
    l.state='WARM';
    l.busyT=TORCH_WARM_TICKS;
    l.fall=0;l.jumpT=0;l.jumpVy=0;l.manualVy=0;l.ropeId=null;l.afterBazState=null;l.fuel=0;
    if(Number.isFinite(torch.x)&&Math.abs(torch.x-l.x)>1)l.dir=torch.x>l.x?1:-1;
    l.warmTorchX=torch.x;l.warmTorchY=torch.y;
    this.skillSpark(l,'warm');
    this.toast('EN LEMMEL: "JAG FRYSER!"');
    AU.sLemShiver((l.scale||1)>1);
    return true;
  },
  finishTorchWarm(l,T){
    if(!l||l.state!=='WARM')return false;
    l.state=(T&&T.solid(l.x,l.y+1))?'WALK':'FALL';
    l.busyT=0;l.fall=0;l.warmTorchX=null;l.warmTorchY=null;
    this.skillSpark(l,'warm');
    this.toast('EN LEMMEL: "VARM IGEN!"');
    AU.sLemWarmSigh((l.scale||1)>1);
    return true;
  },
  updateTorchWarmEffects(){
    const torches=(this.decor||[]).filter(d=>d.t==='torch'&&!d.remove);
    if(!torches.length||!this.lems||!this.lems.length)return;
    for(const torch of torches){
      if(!Array.isArray(torch.warmIds))torch.warmIds=[];
      const nearIds=[];
      for(const l of this.lems){
        if(!l.alive||!l.alive())continue;
        const sc=Math.max(1,l.scale||1);
        const near=Math.abs(l.x-torch.x)<=10*sc&&Math.abs(l.y-torch.y)<=13*sc;
        if(!near)continue;
        nearIds.push(l.id);
        if(torch.warmIds.includes(l.id))continue;
        torch.warmIds.push(l.id);
        if(this.canWarmAtTorch(l)&&this.rand()<TORCH_WARM_CHANCE)this.startTorchWarm(l,torch);
      }
      torch.warmIds=torch.warmIds.filter(id=>nearIds.includes(id));
    }
  },
  canSillyJump(l){
    return !!(l&&l.alive()&&(l.state==='WALK'||l.state==='SHRUG')&&l.bombT<=0);
  },
  startRandomSillyJump(lemId){
    const candidates=this.lems.filter(l=>this.canSillyJump(l));
    if(candidates.length===0)return false;
    let l=lemId==null?null:candidates.find(q=>q.id===lemId);
    if(!l)l=candidates[Math.floor(this.rand()*candidates.length)];
    if(!l.startSillyJump(SILLY_JUMP_TICKS))return false;
    this.toast('EN LEMMEL BÖRJAR HOPPA!');
    AU.sShrug();
    for(let i=0;i<10;i++){
      const a=RND()*6.283,sp=0.35+RND()*1.0;
      this.parts.push({x:l.x,y:l.y-8,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-0.7,life:10+RND()*8,g:0.10,
        col:'#8fd8ff',glow:true});
    }
    return true;
  },
  updateRandomJumpEvents(){
    if(this.jumpEvents>=this.jumpMax)return;
    this.jumpT--;
    if(this.jumpT>0)return;
    const candidates=this.lems.filter(l=>this.canSillyJump(l));
    if(candidates.length>0&&this.canStartDirectedEvent('randomJump')){
      const l=candidates[Math.floor(this.rand()*candidates.length)];
      if(this.queueDirectedEvent('randomJump',this.chaosConfig().jumpWarn,{lemId:l.id,lemX:l.x,x:l.x,y:l.y-18,label:'HOPPRYCK SNART'},false)){
        this.jumpEvents++;
        this.jumpT=Math.round((38+this.rand()*42)*1000/TICK);
      }else this.jumpT=Math.round((5+this.rand()*7)*1000/TICK);
    }else{
      // Om inga lemlar just då är i ett rimligt tillstånd, eller director-låset
      // är upptaget, prova snart igen.
      this.jumpT=Math.round((7+this.rand()*8)*1000/TICK);
    }
  },
  canLemmingChat(l){
    return !!(l&&l.alive&&l.alive()&&l.bombT<=0&&
      (l.state==='WALK'||l.state==='MANUAL'||l.state==='SHRUG'));
  },
  updateLemmingChatter(){
    if(!this.lems||this.lems.length<2)return;
    this.lemTalkT=(this.lemTalkT||0)-1;
    if(this.lemTalkT>0)return;
    const candidates=this.lems.filter(l=>this.canLemmingChat(l));
    let pair=null;
    for(let i=0;i<candidates.length&&!pair;i++){
      const a=candidates[i];
      if(a.x<this.cam-20||a.x>this.cam+this.viewW()+20)continue;
      for(let j=i+1;j<candidates.length;j++){
        const b=candidates[j], dx=Math.abs(a.x-b.x), dy=Math.abs(a.y-b.y);
        if(dx>=7&&dx<=24&&dy<=7){pair=[a,b];break}
      }
    }
    if(pair&&this.rand()<0.55)AU.sLemChatter((pair[0].scale||1)>1||(pair[1].scale||1)>1);
    const base=pair?9:4, span=pair?11:5;
    this.lemTalkT=Math.round((base+this.rand()*span)*1000/TICK);
  },
  updateWaterfallHeadSplashes(){
    const falls=(this.decor||[]).filter(d=>d.t==='waterfall');
    if(!falls.length||!this.lems||this.parts.length>=MAX_PARTICLES)return;
    for(const l of this.lems){
      if(!l.alive||!l.alive())continue;
      const sc=Math.max(1,l.scale||1), headY=l.y-9*sc;
      let hit=null;
      for(const wf of falls){
        const w=wf.w||28,h=wf.h||130,half=w/2+3*sc;
        if(Math.abs(l.x-wf.x)<=half&&headY>=wf.y-4*sc&&headY<=wf.y+h+4){
          hit=wf;break;
        }
      }
      if(!hit){l.waterfallWetT=0;continue}
      l.waterfallWetT=Math.max(0,(l.waterfallWetT||0)-1);
      if(l.waterfallWetT<=0){
        this.waterfallHeadSplash(l,hit);
        l.waterfallWetT=3+Math.floor(this.rand()*4);
      }
    }
  }
});
