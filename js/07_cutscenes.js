// --------------------------- CUTSCENES ------------------------------
// Fristaende cutscene-ramverk for korta, tidsstyrda sekvenser.
// Modulen stoppar gameplay-tick nar pauseGame ar aktivt, men behaller aktuell
// spelvy under overlayn sa scener kan spelas upp ovanpa en pagaende bana.
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
function normalizeCutsceneSpec(src,opts){
  if(typeof src==='string')src=CUTSCENE_LIBRARY[src];
  if(!src)return null;
  const spec=Object.assign({},src,opts||{});
  const shots=Array.isArray(spec.shots)&&spec.shots.length?spec.shots:[{
    duration:spec.duration,
    seconds:spec.seconds,
    title:spec.title||'CUTSCENE',
    text:spec.text||''
  }];
  spec.id=String(spec.id||('cutscene-'+Math.floor(RND()*999999)));
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
function drawCutsceneBubble(c,x,y,s,tk,seed){
  const wob=Math.round(Math.sin(tk*0.18+seed)*2);
  c.fillStyle='#c8f6ff';
  c.fillRect(Math.round(x)+wob,Math.round(y),s,s);
  c.fillStyle='#ffffff';
  c.fillRect(Math.round(x)+wob,Math.round(y),1,1);
}
function drawCutsceneSwimRing(c,x,y,sc,a){
  c.save();
  c.globalAlpha=clamp(a==null?1:a,0,1);
  x=Math.round(x);y=Math.round(y);sc=Math.max(1,sc||1);
  c.fillStyle='#e04020';
  c.fillRect(x-10*sc,y-4*sc,20*sc,8*sc);
  c.fillRect(x-7*sc,y-7*sc,14*sc,14*sc);
  c.fillStyle='#ffd8a0';
  c.fillRect(x-6*sc,y-3*sc,12*sc,6*sc);
  c.fillRect(x-3*sc,y-6*sc,6*sc,12*sc);
  c.fillStyle='#fff0d0';
  c.fillRect(x-8*sc,y-5*sc,3*sc,3*sc);
  c.fillRect(x+5*sc,y+2*sc,3*sc,3*sc);
  c.restore();
}
function drawCutsceneFish(c,x,y,sc,p,ringHeld){
  x=Math.round(x);y=Math.round(y);sc=Math.max(1,sc||1);
  const tail=((p*10)|0)%2;
  c.fillStyle='#d88a20';
  c.fillRect(x-13*sc,y-4*sc,17*sc,9*sc);
  c.fillStyle='#ffd060';
  c.fillRect(x-8*sc,y-6*sc,17*sc,12*sc);
  c.fillStyle='#fff0a0';
  c.fillRect(x-4*sc,y-3*sc,9*sc,5*sc);
  c.fillStyle='#111827';
  c.fillRect(x+5*sc,y-3*sc,2*sc,2*sc);
  c.fillStyle='#e07018';
  c.fillRect(x-16*sc,y-(tail?7:4)*sc,5*sc,5*sc);
  c.fillRect(x-16*sc,y+(tail?2:0)*sc,5*sc,5*sc);
  c.fillStyle='#ffb030';
  c.fillRect(x-1*sc,y-8*sc,5*sc,3*sc);
  c.fillRect(x-2*sc,y+6*sc,6*sc,3*sc);
  c.fillStyle='#f8b040';
  c.fillRect(x+9*sc,y-1*sc,4*sc,3*sc);
  if(ringHeld)drawCutsceneSwimRing(c,x+18*sc,y+2*sc,Math.max(1,Math.round(sc*0.45)),0.95);
}
function drawCutsceneDolphinClose(c,x,y,sc,p,dir){
  x=Math.round(x);y=Math.round(y);sc=Math.max(1,sc||1);dir=dir||1;
  c.save();c.translate(x,y);c.scale(dir,1);
  const r=(x0,y0,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x0*sc),Math.round(y0*sc),Math.round(w*sc),Math.round(h*sc))};
  r(-23,-6,38,13,'#3f95c8');
  r(-15,-11,26,6,'#68c8f4');
  r(9,-4,14,8,'#3f95c8');
  r(20,-1,4,3,'#d8f8ff');
  r(-20,4,26,7,'#d8f8ff');
  r(-27,-4,10,5,'#2a6f9e');
  r(-34,-10,8,8,'#2a6f9e');
  r(-34,4,8,8,'#2a6f9e');
  r(-4,-17,9,10,'#2a6f9e');
  r(2,7,9,10,'#2a6f9e');
  r(15,-8,3,3,'#091421');
  r(16,-8,1,1,'#ffffff');
  if(p>0.55){
    r(11,2,8,2,'#ffffff');
    r(12,4,5,1,'#d8f8ff');
  }
  c.restore();
}
function drawCutsceneLemClose(c,x,y,sc,smile,ringOn,tk,euphoria){
  x=Math.round(x);y=Math.round(y);sc=Math.max(1,sc||1);
  euphoria=clamp(euphoria||0,0,1);
  const bob=Math.round(Math.sin(tk*0.2)*sc)-Math.round(euphoria*2*sc)+Math.round(Math.sin(tk*0.55)*euphoria*2*sc);
  y+=bob;
  c.fillStyle='rgba(0,0,0,0.28)';
  c.fillRect(x-15*sc,y+29*sc,35*sc,3*sc);
  if(ringOn)drawCutsceneSwimRing(c,x+1*sc,y+17*sc,Math.max(2,Math.round(sc*0.58)),1);
  c.fillStyle='#5bc0ff';
  c.fillRect(x-8*sc,y+7*sc,18*sc,19*sc);
  c.fillStyle='#87dcff';
  c.fillRect(x-5*sc,y+9*sc,7*sc,15*sc);
  c.fillStyle='#f0c090';
  c.fillRect(x-10*sc,y-13*sc,20*sc,20*sc);
  c.fillRect(x-6*sc,y+3*sc,12*sc,7*sc);
  c.fillStyle='#ffe0b8';
  c.fillRect(x-6*sc,y-9*sc,9*sc,8*sc);
  c.fillStyle='#266f32';
  c.fillRect(x-12*sc,y-17*sc,24*sc,6*sc);
  c.fillRect(x-8*sc,y-22*sc,16*sc,6*sc);
  c.fillStyle='#42b848';
  c.fillRect(x-8*sc,y-20*sc,8*sc,4*sc);
  c.fillStyle='#101018';
  if(euphoria>0.35){
    c.fillRect(x-7*sc,y-7*sc,6*sc,2*sc);
    c.fillRect(x+3*sc,y-7*sc,6*sc,2*sc);
    c.fillRect(x-5*sc,y-9*sc,2*sc,2*sc);
    c.fillRect(x+5*sc,y-9*sc,2*sc,2*sc);
  }else{
    c.fillRect(x-5*sc,y-6*sc,3*sc,3*sc);
    c.fillRect(x+5*sc,y-6*sc,3*sc,3*sc);
  }
  c.fillStyle='#ffffff';
  if(euphoria>0.35){
    c.fillRect(x-8*sc,y-10*sc,2*sc,2*sc);
    c.fillRect(x+8*sc,y-10*sc,2*sc,2*sc);
  }else{
    c.fillRect(x-4*sc,y-6*sc,1*sc,1*sc);
    c.fillRect(x+6*sc,y-6*sc,1*sc,1*sc);
  }
  if(euphoria>0.25){
    c.fillStyle='#f0a080';
    c.fillRect(x-11*sc,y-1*sc,3*sc,2*sc);
    c.fillRect(x+9*sc,y-1*sc,3*sc,2*sc);
  }
  c.fillStyle='#9c5c38';
  if(euphoria>0.35){
    c.fillStyle='#4a1c1c';
    c.fillRect(x-5*sc,y+1*sc,12*sc,7*sc);
    c.fillStyle='#fff4d0';
    c.fillRect(x-4*sc,y+1*sc,10*sc,2*sc);
    c.fillStyle='#d85858';
    c.fillRect(x-2*sc,y+5*sc,7*sc,2*sc);
  }else if(smile)c.fillRect(x-4*sc,y+2*sc,11*sc,2*sc);
  else c.fillRect(x-2*sc,y+3*sc,7*sc,2*sc);
  c.fillStyle='#f0c090';
  if(euphoria>0.25){
    const wave=((tk>>2)&1)?1:-1;
    c.fillRect(x-18*sc,y-7*sc,5*sc,16*sc);
    c.fillRect(x+13*sc,y-7*sc,5*sc,16*sc);
    c.fillRect(x-20*sc,y-(12+wave)*sc,8*sc,5*sc);
    c.fillRect(x+12*sc,y-(12-wave)*sc,8*sc,5*sc);
  }else{
    c.fillRect(x-17*sc,y+8*sc,7*sc,5*sc);
    c.fillRect(x+10*sc,y+8*sc,7*sc,5*sc);
  }
}
function drawDolphinRescueCutscene(c,r,p,cs,tk){
  c.fillStyle='#061425';c.fillRect(r.x,r.y,r.w,r.h);
  const waterY=r.y+Math.round(r.h*0.62);
  const skyGradTop='#0e2742';
  c.fillStyle=skyGradTop;c.fillRect(r.x,r.y,r.w,waterY-r.y);
  c.fillStyle='#084f76';c.fillRect(r.x,waterY,r.w,r.h-waterY);
  c.fillStyle='#0d8fbb';
  for(let x=r.x-30;x<r.x+r.w+60;x+=38)c.fillRect(x+Math.round(Math.sin(tk*0.12)*3),waterY+6+((x+tk)&9),28,3);
  c.fillStyle='#a8f0ff';
  for(let x=r.x+12;x<r.x+r.w;x+=58)c.fillRect(x-Math.round(Math.sin(tk*0.18)*2),waterY+1,30,2);

  const leap=clamp((p-0.10)/0.52,0,1);
  const land=clamp((p-0.66)/0.22,0,1);
  const joy=clamp((p-0.70)/0.20,0,1);
  const arc=Math.sin(leap*Math.PI);
  const dolphinX=r.x+70+leap*(r.w-160);
  const dolphinY=waterY+20-arc*76+land*22;
  const dir=leap<0.94?1:-1;
  const lemX=dolphinX-4;
  const lemY=dolphinY-42-arc*8;

  if(p<0.18){
    c.fillStyle='#d8fbff';
    for(let i=0;i<10;i++){
      const a=i*0.63, d=8+p*90;
      c.fillRect(r.x+78+Math.cos(a)*d,waterY+12+Math.sin(a)*d*0.35,2,2);
    }
  }
  drawCutsceneDolphinClose(c,dolphinX,dolphinY,3,p,dir);
  drawCutsceneLemClose(c,lemX,lemY,3,p>0.46,false,tk,joy);
  if(p>0.58&&p<0.92){
    const spray=clamp((p-0.58)/0.34,0,1);
    c.save();c.globalAlpha=1-spray*0.65;c.fillStyle='#d8fbff';
    for(let i=0;i<18;i++){
      const a=i*0.35+0.4, d=12+spray*66+(i%4)*3;
      c.fillRect(dolphinX-28+Math.cos(a)*d,dolphinY+18+Math.sin(a)*d*0.75,2+(i%2),2);
    }
    c.restore();
  }
  if(p>0.72){
    c.fillStyle='#fff7b0';
    for(let i=0;i<9;i++){
      const a=i*0.7+tk*0.05, d=18+joy*42;
      c.fillRect(Math.round(lemX+Math.cos(a)*d),Math.round(lemY-16+Math.sin(a)*d*0.70),i%2?3:5,i%2?3:5);
    }
    if(((tk>>2)&1)===0)drawTextC(c,'RADDAD!',lemX+4,lemY-58,2,'#fff7b0');
  }
  for(let i=0;i<9;i++){
    const bp=(p*1.2+i*0.13)%1;
    drawCutsceneBubble(c,r.x+40+i*45,waterY+50-bp*90,2+(i%3),tk,i+20);
  }
}
function drawFishRingCutscene(c,r,p,cs,tk){
  c.fillStyle='#061122';c.fillRect(r.x,r.y,r.w,r.h);
  const waterY=r.y+Math.round(r.h*0.60);
  const shine=Math.round(Math.sin(tk*0.16)*2);
  c.fillStyle='#102846';c.fillRect(r.x,r.y,r.w,waterY-r.y);
  c.fillStyle='#075a78';c.fillRect(r.x,waterY,r.w,r.h-waterY);
  c.fillStyle='#0e86a8';
  for(let x=r.x-20;x<r.x+r.w+40;x+=34)c.fillRect(x+shine,waterY+8+((x+tk)&7),22,3);
  c.fillStyle='#63d8ff';c.fillRect(r.x,waterY-2,r.w,3);
  c.fillStyle='#b8f8ff';
  for(let x=r.x+20;x<r.x+r.w;x+=54)c.fillRect(x-shine,waterY+2,24,2);

  const lemX=r.x+Math.round(r.w*0.63), lemY=r.y+Math.round(r.h*0.47);
  const fishIn=clamp(p/0.28,0,1);
  const handoff=clamp((p-0.32)/0.33,0,1);
  const settle=clamp((p-0.68)/0.24,0,1);
  const ringOn=p>0.58;
  const smile=p>0.52;
  const euphoria=clamp((p-0.70)/0.18,0,1);
  const fishX=r.x-50+fishIn*150+(p>0.68?(p-0.68)*170:0);
  const fishY=waterY-28+Math.sin(tk*0.22)*4;

  drawCutsceneLemClose(c,lemX,lemY,4,smile,ringOn,tk,euphoria);
  drawCutsceneFish(c,fishX,fishY,3,p,p<0.43);
  if(p>=0.38&&p<0.67){
    const sx=fishX+54, sy=fishY+8;
    const tx=lemX+4, ty=lemY+70;
    const e=handoff*handoff*(3-2*handoff);
    drawCutsceneSwimRing(c,sx+(tx-sx)*e,sy+(ty-sy)*e,2,1);
  }
  if(p>0.56&&p<0.88){
    const burst=clamp((p-0.56)/0.32,0,1);
    c.save();
    c.globalAlpha=1-burst;
    c.fillStyle='#d8fbff';
    for(let i=0;i<12;i++){
      const a=i*0.52, d=8+burst*42;
      c.fillRect(lemX+Math.cos(a)*d,lemY+62+Math.sin(a)*d*0.55,2,2);
    }
    c.restore();
  }
  for(let i=0;i<8;i++){
    const bp=(p*1.4+i*0.17)%1;
    drawCutsceneBubble(c,r.x+82+i*43,waterY+42-bp*95,2+(i%3),tk,i);
  }
  if(p>0.72){
    c.fillStyle='#fff7b0';
    const joy=clamp((p-0.72)/0.20,0,1);
    for(let i=0;i<10;i++){
      const a=i*0.63+tk*0.04, d=22+joy*46+(i%3)*4;
      const sx=lemX+Math.cos(a)*d, sy=lemY-18+Math.sin(a)*d*0.75;
      c.fillRect(Math.round(sx),Math.round(sy),i%2?3:5,i%2?3:5);
    }
    if(((tk>>2)&1)===0)drawTextC(c,'JIPPI!',lemX+6,lemY-78,2,'#fff7b0');
  }
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
    id=String(id||'').trim();
    if(!id||!spec)return null;
    CUTSCENE_LIBRARY[id]=Object.assign({id},spec);
    return CUTSCENE_LIBRARY[id];
  },
  cutsceneById(id){return CUTSCENE_LIBRARY[String(id||'')]||null},
  cutsceneActive(){return !!(this.cutscene&&this.cutscene.active)},
  cutsceneRect(mode){return cutsceneRectForMode(mode||((this.cutscene&&this.cutscene.mode)||'box'))},
  currentCutsceneShot(){
    const cs=this.cutscene;
    if(!cs||!cs.active||!cs.spec||!cs.spec.shots)return null;
    return cs.spec.shots[clamp(cs.shotIdx|0,0,cs.spec.shots.length-1)]||null;
  },
  makeCutscenePreviewSpec(mode){
    mode=(mode==='fullscreen'||mode==='full')?'fullscreen':'box';
    return {
      id:'preview-'+mode,
      title:'CUTSCENE TEST',
      mode,
      pauseGame:true,
      respectPrefs:false,
      skippable:true,
      shots:[
        {seconds:1.5,title:'CUTSCENE MODUL',text:['Spelet ar stoppat medan filmen spelar.'],scene:'field',bg:'#111b2e'},
        {seconds:1.5,title:mode==='fullscreen'?'FULLSKARM':'RUTA',text:['Samma API kan rita i ruta eller over hela skarmen.'],scene:mode==='fullscreen'?'city':'cave',bg:mode==='fullscreen'?'#070b18':'#101014'}
      ]
    };
  },
  makeFishRingCutsceneSpec(mode){
    mode=(mode==='box')?'box':'fullscreen';
    return {
      id:'fish-ring-closeup',
      title:'FISKEN HJALPER TILL',
      mode,
      pauseGame:true,
      respectPrefs:false,
      skippable:true,
      advanceOnInput:false,
      shots:[{
        duration:Math.round(3700/TICK),
        title:'FISKEN HJALPER TILL',
        text:['PLASK! EN BADRING TILL LEMMELN.'],
        draw:drawFishRingCutscene
      }]
    };
  },
  makeDolphinRescueCutsceneSpec(mode){
    mode=(mode==='box')?'box':'fullscreen';
    return {
      id:'dolphin-rescue-closeup',
      title:'DELFINEN RADDAR',
      mode,
      pauseGame:true,
      respectPrefs:false,
      skippable:true,
      advanceOnInput:false,
      shots:[{
        duration:Math.round(3700/TICK),
        title:'DELFINEN RADDAR',
        text:['EN DELFIN LYFTER LEMMELN UR VATTNET!'],
        draw:drawDolphinRescueCutscene
      }]
    };
  },
  playFishRingCutscene(l,fish,z,mode){
    if(this.cutsceneActive&&this.cutsceneActive())return null;
    if(!this.makeFishRingCutsceneSpec||!this.playCutscene)return null;
    const spec=this.makeFishRingCutsceneSpec(mode||'fullscreen');
    spec.event={
      lemX:l&&Number.isFinite(l.x)?Math.round(l.x):null,
      lemY:l&&Number.isFinite(l.y)?Math.round(l.y):null,
      fishX:fish&&Number.isFinite(fish.x)?Math.round(fish.x):null,
      fishY:fish&&Number.isFinite(fish.y)?Math.round(fish.y):null,
      waterY:z&&Number.isFinite(z.y)?Math.round(z.y):null
    };
    return this.playCutscene(spec,{respectPrefs:true});
  },
  playDolphinRescueCutscene(l,z,spot,sx,sy,mode){
    if(this.cutsceneActive&&this.cutsceneActive())return null;
    if(!this.makeDolphinRescueCutsceneSpec||!this.playCutscene)return null;
    const spec=this.makeDolphinRescueCutsceneSpec(mode||'fullscreen');
    spec.event={
      lemX:l&&Number.isFinite(l.x)?Math.round(l.x):null,
      lemY:l&&Number.isFinite(l.y)?Math.round(l.y):null,
      waterX:Number.isFinite(sx)?Math.round(sx):null,
      waterY:Number.isFinite(sy)?Math.round(sy):null,
      shoreX:spot&&Number.isFinite(spot.x)?Math.round(spot.x):null,
      shoreY:spot&&Number.isFinite(spot.y)?Math.round(spot.y):null
    };
    return this.playCutscene(spec,{respectPrefs:true});
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

G.registerCutscene('cutscene-preview-box',G.makeCutscenePreviewSpec('box'));
G.registerCutscene('cutscene-preview-fullscreen',G.makeCutscenePreviewSpec('fullscreen'));
G.registerCutscene('cutscene-fish-ring',G.makeFishRingCutsceneSpec('fullscreen'));
G.registerCutscene('cutscene-dolphin-rescue',G.makeDolphinRescueCutsceneSpec('fullscreen'));
