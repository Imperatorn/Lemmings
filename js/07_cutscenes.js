// --------------------------- CUTSCENES ------------------------------
// Core playback module. Scene content lives in 07_cutscene_scenes.js.
// A cutscene is a registered spec with timed shots. The renderer can draw it
// boxed over gameplay or full-screen while updateCutscene blocks gameplay ticks.
const CUTSCENE_LIBRARY={};

function cutsceneTicks(v,fallback){
  if(Number.isFinite(v))return Math.max(1,Math.round(v));
  if(Number.isFinite(fallback))return Math.max(1,Math.round(fallback));
  return Math.round(2600/TICK);
}
function cutsceneSeconds(v,fallback){
  if(Number.isFinite(v))return Math.max(1,Math.round(v*1000/TICK));
  return cutsceneTicks(fallback);
}
function normalizeCutsceneShot(shot,idx){
  const s=Object.assign({},shot||{});
  if(!Number.isFinite(s.duration))s.duration=cutsceneSeconds(s.seconds,idx===0?Math.round(2800/TICK):Math.round(2200/TICK));
  else s.duration=cutsceneTicks(s.duration);
  if(s.text==null)s.text=[];
  else if(!Array.isArray(s.text))s.text=[String(s.text)];
  else s.text=s.text.map(x=>String(x));
  s.title=s.title==null?'':String(s.title);
  s.bg=s.bg||null;
  s.scene=s.scene||'field';
  return s;
}
function cutsceneSource(src,opts){
  if(typeof src==='string')src=CUTSCENE_LIBRARY[src]||null;
  if(src&&typeof src.factory==='function'){
    const made=src.factory(opts||{})||{};
    return Object.assign({},src,made,{
      id:src.id||made.id,
      label:src.label||made.label,
      group:src.group||made.group,
      order:Number.isFinite(src.order)?src.order:made.order,
      debug:src.debug!==false&&made.debug!==false
    });
  }
  return src;
}
function normalizeCutsceneSpec(src,opts){
  src=cutsceneSource(src,opts);
  if(!src)return null;
  const spec=Object.assign({},src,opts||{});
  const shots=Array.isArray(spec.shots)&&spec.shots.length?spec.shots:[{
    duration:spec.duration,
    seconds:spec.seconds,
    title:spec.title||'CUTSCENE',
    text:spec.text||''
  }];
  spec.id=String(spec.id||('cutscene-'+Math.floor(RND()*999999)));
  spec.label=spec.label==null?(spec.title||spec.id):String(spec.label);
  spec.group=spec.group==null?'Cutscenes':String(spec.group);
  spec.order=Number.isFinite(spec.order)?spec.order:999;
  spec.debug=spec.debug!==false;
  spec.mode=(spec.mode==='fullscreen'||spec.mode==='full')?'fullscreen':'box';
  spec.pauseGame=spec.pauseGame!==false;
  spec.skippable=spec.skippable!==false;
  spec.advanceOnInput=spec.advanceOnInput!==false;
  spec.respectPrefs=spec.respectPrefs!==false;
  spec.dim=clamp(Number.isFinite(spec.dim)?spec.dim:(spec.mode==='fullscreen'?1:0.68),0,1);
  spec.shots=shots.map(normalizeCutsceneShot);
  return spec;
}
function cutsceneActiveScene(){
  return G&&G.cutscene&&G.cutscene.active?G.cutscene:null;
}
function cutsceneWrappedLines(lines,maxW,scale,maxLines){
  const out=[];
  const src=Array.isArray(lines)?lines:[String(lines||'')];
  for(const raw of src){
    const words=String(raw||'').replace(/\s+/g,' ').trim().split(' ').filter(Boolean);
    let line='';
    for(const word of words){
      const candidate=line?line+' '+word:word;
      if(textW(candidate,scale)<=maxW){line=candidate;continue}
      if(line)out.push(line);
      if(textW(word,scale)<=maxW){line=word;continue}
      let chunk='';
      for(const ch of word){
        const c=chunk+ch;
        if(textW(c,scale)>maxW&&chunk){out.push(chunk);chunk=ch}
        else chunk=c;
      }
      line=chunk;
    }
    if(line)out.push(line);
  }
  return out.slice(0,maxLines||4);
}
function cutsceneRectForMode(mode){
  if(mode==='fullscreen')return {x:0,y:0,w:CW,h:CH,full:true};
  return {x:44,y:34,w:CW-88,h:174,full:false};
}
function drawCutscenePixels(c,r,shot,cs,tk,p){
  const sky=shot.bg||(cs.mode==='fullscreen'?'#070b16':'#101828');
  c.fillStyle=sky;c.fillRect(r.x,r.y,r.w,r.h);
  const horizon=r.y+Math.round(r.h*0.58);
  c.fillStyle=shot.scene==='cave'?'#1a1d24':(shot.scene==='city'?'#121827':'#16243a');
  c.fillRect(r.x,horizon,r.w,r.y+r.h-horizon);
  if(shot.scene==='city'){
    for(let i=0;i<12;i++){
      const bw=16+((i*7)%18),bh=34+((i*13)%54);
      const x=r.x+12+i*34-Math.round(p*18)%34;
      c.fillStyle=i%2?'#233044':'#1b2638';
      c.fillRect(x,horizon-bh,bw,bh);
      c.fillStyle='#ffd060';
      for(let yy=horizon-bh+8;yy<horizon-6;yy+=13)for(let xx=x+4;xx<x+bw-4;xx+=7)if(((xx+yy+tk)>>3)&1)c.fillRect(xx,yy,2,2);
    }
  }else if(shot.scene==='cave'){
    c.fillStyle='#303743';
    for(let i=0;i<9;i++){
      const x=r.x+i*48-Math.round(p*16)%48;
      c.fillRect(x,r.y+8,14,38+((i*11)%32));
      c.fillRect(x+18,horizon-18-((i*9)%30),16,18+((i*5)%20));
    }
  }else{
    c.fillStyle='#203858';
    for(let x=r.x-30;x<r.x+r.w+40;x+=46){
      const yy=horizon-26-Math.round(Math.sin((x+tk)*0.025)*5);
      c.fillRect(x,yy,52,horizon-yy);
    }
    c.fillStyle='#244e2c';
    c.fillRect(r.x,horizon+10,r.w,12);
    c.fillStyle='#5c3c1f';
    c.fillRect(r.x,horizon+22,r.w,r.h);
  }
  const lemY=horizon+8;
  const walkX=r.x+Math.round(24+p*(r.w-70));
  c.fillStyle='#000';c.globalAlpha=0.35;c.fillRect(walkX-8,lemY+11,18,2);c.globalAlpha=1;
  c.fillStyle='#78d4ff';c.fillRect(walkX-3,lemY-7,7,8);
  c.fillStyle='#fff2c8';c.fillRect(walkX-4,lemY-13,8,6);
  c.fillStyle='#49c060';c.fillRect(walkX-5,lemY-16,10,3);
  c.fillStyle='#203040';c.fillRect(walkX-4,lemY+1,3,9);c.fillRect(walkX+2,lemY+1,3,9);
  if((tk>>2)&1)c.fillRect(walkX+5,lemY+7,5,2);else c.fillRect(walkX-8,lemY+7,5,2);
}
function drawCutsceneCaption(c,r,shot,cs,tk){
  const capH=cs.mode==='fullscreen'?58:44;
  const y=r.y+r.h-capH;
  c.globalAlpha=0.82;c.fillStyle='#03050a';c.fillRect(r.x,y,r.w,capH);c.globalAlpha=1;
  const title=shot.title||cs.spec.title||'';
  if(title)drawText(c,title,r.x+12,y+8,1,'#ffd060');
  const lines=cutsceneWrappedLines(shot.text,r.w-24,1,cs.mode==='fullscreen'?3:2);
  for(let i=0;i<lines.length;i++)drawText(c,lines[i],r.x+12,y+22+i*11,1,'#f0f4ff');
  const hint=cs.spec.skippable?'KLICK/ENTER: NASTA   ESC: HOPPA OVER':'';
  if(hint)drawTextC(c,hint,r.x+r.w/2,r.y+r.h-11,1,'#8090a8');
}
function drawCutsceneFrame(c,r,cs,shot,tk){
  c.strokeStyle=cs.mode==='fullscreen'?'#405878':'#ffd060';
  c.strokeRect(r.x+0.5,r.y+0.5,r.w-1,r.h-1);
  c.fillStyle=cs.mode==='fullscreen'?'#405878':'#ffd060';
  c.fillRect(r.x,r.y,22,1);c.fillRect(r.x,r.y,1,22);
  c.fillRect(r.x+r.w-22,r.y+r.h-1,22,1);c.fillRect(r.x+r.w-1,r.y+r.h-22,1,22);
  const total=cs.spec.shots.reduce((sum,s)=>sum+s.duration,0);
  const done=cs.spec.shots.slice(0,cs.shotIdx).reduce((sum,s)=>sum+s.duration,0)+cs.shotT;
  const p=clamp(done/Math.max(1,total),0,1);
  const bw=Math.max(1,Math.round((r.w-2)*p));
  c.fillStyle='#203040';c.fillRect(r.x+1,r.y+r.h-4,r.w-2,3);
  c.fillStyle='#70a8ff';c.fillRect(r.x+1,r.y+r.h-4,bw,3);
}
function drawCutsceneOverlay(c,tk){
  const cs=cutsceneActiveScene();
  if(!cs)return false;
  const shot=G.currentCutsceneShot();
  if(!shot)return false;
  const r=G.cutsceneRect(cs.mode);
  const p=clamp(cs.shotT/Math.max(1,shot.duration),0,1);
  c.save();
  if(cs.mode==='box'){
    c.globalAlpha=cs.spec.dim;c.fillStyle='#000000';c.fillRect(0,0,CW,CH);c.globalAlpha=1;
    c.fillStyle='#02040a';c.fillRect(r.x-5,r.y-5,r.w+10,r.h+10);
  }
  try{
    if(typeof shot.draw==='function')shot.draw(c,r,p,cs,tk);
    else if(typeof cs.spec.draw==='function')cs.spec.draw(c,r,p,cs,tk);
    else drawCutscenePixels(c,r,shot,cs,tk,p);
  }catch(err){reportGameError('Cutscene draw error',err)}
  drawCutsceneCaption(c,r,shot,cs,tk);
  drawCutsceneFrame(c,r,cs,shot,tk);
  c.restore();
  return true;
}

Object.assign(G,{
  cutscene:null,
  registerCutscene(id,spec){
    if(spec==null&&id&&typeof id==='object'){spec=id;id=spec.id}
    if(typeof spec==='function')spec={factory:spec};
    id=String(id||(spec&&spec.id)||'').trim();
    if(!id||!spec)return null;
    const entry=Object.assign({},spec,{id});
    entry.label=entry.label==null?(entry.title||id):String(entry.label);
    entry.group=entry.group==null?'Cutscenes':String(entry.group);
    entry.order=Number.isFinite(entry.order)?entry.order:999;
    entry.debug=entry.debug!==false;
    CUTSCENE_LIBRARY[id]=entry;
    return entry;
  },
  cutsceneById(id){return CUTSCENE_LIBRARY[String(id||'')]||null},
  cutsceneList(opts){
    opts=opts||{};
    const debugOnly=opts.debug===true;
    return Object.keys(CUTSCENE_LIBRARY).map(id=>{
      const spec=CUTSCENE_LIBRARY[id]||{};
      return {
        id,
        label:String(spec.label||spec.title||id),
        title:String(spec.title||spec.label||id),
        group:String(spec.group||'Cutscenes'),
        mode:(spec.mode==='fullscreen'||spec.mode==='full')?'fullscreen':'box',
        order:Number.isFinite(spec.order)?spec.order:999,
        debug:spec.debug!==false,
        description:spec.description?String(spec.description):''
      };
    }).filter(item=>!debugOnly||item.debug).sort((a,b)=>
      a.group.localeCompare(b.group)||a.order-b.order||a.label.localeCompare(b.label)||a.id.localeCompare(b.id)
    );
  },
  cutsceneActive(){return !!(this.cutscene&&this.cutscene.active)},
  cutsceneRect(mode){return cutsceneRectForMode(mode||((this.cutscene&&this.cutscene.mode)||'box'))},
  currentCutsceneShot(){
    const cs=this.cutscene;
    if(!cs||!cs.active||!cs.spec||!cs.spec.shots)return null;
    return cs.spec.shots[clamp(cs.shotIdx|0,0,cs.spec.shots.length-1)]||null;
  },
  playCutscene(src,opts){
    const spec=normalizeCutsceneSpec(src,opts);
    if(!spec){this.toast('CUTSCENE SAKNAS');return null}
    if(this.cutscenesOn===false&&spec.respectPrefs){
      const cs={active:false,id:spec.id,spec,mode:spec.mode,t:0,shotIdx:0,shotT:0,pauseGame:false,startedState:this.state||'TITLE',reason:'disabled'};
      try{if(typeof spec.onFinish==='function')spec.onFinish(this,cs,'disabled')}catch(err){reportGameError('Cutscene finish error',err)}
      return null;
    }
    if(this.cutsceneActive())this.stopCutscene('replace',true);
    if(spec.pauseGame&&this.manual&&this.manual.keys){
      this.manual.keys.left=false;this.manual.keys.right=false;this.manual.keys.down=false;this.manual.keys.run=false;this.manual.keys.aim=false;
    }
    if(spec.pauseGame&&this.clearRopeAim)this.clearRopeAim();
    const cs={active:true,id:spec.id,spec,mode:spec.mode,t:0,shotIdx:0,shotT:0,pauseGame:spec.pauseGame,startedState:this.state||'TITLE'};
    this.cutscene=cs;
    try{if(typeof spec.onStart==='function')spec.onStart(this,cs)}catch(err){reportGameError('Cutscene start error',err)}
    return cs;
  },
  stopCutscene(reason,silent){
    const cs=this.cutscene;
    if(!cs)return false;
    this.cutscene=null;
    cs.active=false;cs.reason=reason||'stop';
    try{if(cs.spec&&typeof cs.spec.onFinish==='function')cs.spec.onFinish(this,cs,cs.reason)}catch(err){reportGameError('Cutscene finish error',err)}
    if(!silent&&reason==='skip')AU.sClick();
    return true;
  },
  clearCutscene(reason){return this.stopCutscene(reason||'clear',true)},
  advanceCutscene(){
    const cs=this.cutscene;
    if(!cs||!cs.active)return false;
    if(cs.shotIdx<cs.spec.shots.length-1){cs.shotIdx++;cs.shotT=0;return true}
    return this.stopCutscene('done',true);
  },
  updateCutscene(){
    const cs=this.cutscene;
    if(!cs||!cs.active)return false;
    const block=!!cs.pauseGame;
    const shot=this.currentCutsceneShot();
    cs.t++;cs.shotT++;
    try{
      if(shot&&typeof shot.update==='function')shot.update(this,cs,shot);
      if(cs.spec&&typeof cs.spec.update==='function')cs.spec.update(this,cs,shot);
    }catch(err){reportGameError('Cutscene update error',err)}
    if(shot&&cs.shotT>=shot.duration)this.advanceCutscene();
    return block;
  },
  handleCutsceneInput(p,kind){
    const cs=this.cutscene;
    if(!cs||!cs.active)return false;
    if(kind==='context'||kind==='escape'){if(cs.spec.skippable)this.stopCutscene('skip',false);return true}
    if(cs.spec.advanceOnInput)this.advanceCutscene();
    else if(cs.spec.skippable)this.stopCutscene('skip',false);
    return true;
  },
  handleCutsceneKey(key){
    if(!this.cutsceneActive())return false;
    if(key==='Escape')return this.handleCutsceneInput(null,'escape');
    if(key==='Enter'||key===' ')return this.handleCutsceneInput(null,'advance');
    return true;
  }
});
