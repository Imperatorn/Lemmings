// ---------------------- UNDERVATTENSGROTTA RENDER --------------------
function uwPoly(c,pts){
  if(typeof fillPixelPoly==='function')return fillPixelPoly(c,pts);
  c.beginPath();
  c.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);
  c.closePath();c.fill();
}
function uwLine(c,x1,y1,x2,y2,col){
  c.fillStyle=col;
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(x2-x1),Math.abs(y2-y1))/4));
  for(let i=0;i<=steps;i++){
    const p=i/steps;
    c.fillRect(Math.round(x1+(x2-x1)*p),Math.round(y1+(y2-y1)*p),2,2);
  }
}
function uwRect(c,x,y,w,h){
  x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);
  if(w<0){x+=w;w=-w}
  if(h<0){y+=h;h=-h}
  c.fillRect(x,y,w,h);
}
const UW_DARK_CV=(typeof document!=='undefined'&&document.createElement)?document.createElement('canvas'):null;
if(UW_DARK_CV){UW_DARK_CV.width=CW;UW_DARK_CV.height=CH}
const UW_DARK_CTX=UW_DARK_CV?UW_DARK_CV.getContext('2d'):null;
function underwaterCaveLitRoom(cave){
  return (cave&&cave.scene?cave.scene:'entryPool')==='entryPool';
}
function drawUnderwaterBackdrop(c,cave,tk){
  const scene=cave.scene||'entryPool',t=(cave.t||0)+tk;
  const lit=underwaterCaveLitRoom(cave);
  c.fillStyle=lit?'#072635':'#01060a';
  c.fillRect(0,0,CW,CH);
  c.fillStyle=lit?'#0c3a4a':(scene==='airBell'?'#06141b':(scene==='crystalReef'?'#041018':(scene==='sunkenArchive'?'#050b11':'#031018')));
  c.fillRect(0,0,CW,CH);
  c.globalAlpha=lit?0.38:0.12;
  c.fillStyle='#4cc7df';
  for(let x=-40;x<CW+40;x+=42){
    const sx=x+Math.round(Math.sin(t*0.035+x)*12);
    uwLine(c,sx,0,sx+72,CH,'#4cc7df');
  }
  c.globalAlpha=1;
  c.fillStyle=lit?'#061017':'#02070b';
  uwPoly(c,[[0,0],[96,0],[72,72],[42,156],[0,CH]]);
  uwPoly(c,[[CW,0],[382,0],[410,86],[440,184],[CW,CH]]);
  c.fillStyle=lit?'#0d2833':'#061017';
  uwPoly(c,[[24,CH],[86,246],[152,222],[242,214],[334,230],[430,CH]]);
  c.fillStyle=lit?'#123845':'#0a1d25';
  for(let i=0;i<36;i++){
    const x=28+Math.round(hash2(i+601,scene.length)*424);
    const y=52+Math.round(hash2(i+607,scene.length)*214);
    c.fillRect(x,y,14+Math.round(hash2(i+613,scene.length)*42),1+(i%6===0?2:0));
  }
}
function drawUnderwaterRoomDetails(c,cave,tk){
  const scene=cave.scene||'entryPool',t=(cave.t||0)+tk;
  if(scene==='entryPool'){
    c.globalAlpha=0.42;
    c.fillStyle='#b8f8ff';
    for(let i=0;i<9;i++)c.fillRect(166+i*18+Math.round(Math.sin(t*0.08+i)*3),42+i%2,12,2);
    c.globalAlpha=1;
    c.fillStyle='#0a3a4a';uwPoly(c,[[372,126],[438,112],[454,238],[386,254]]);
  }else if(scene==='siltTunnel'){
    c.fillStyle='#102a30';
    uwPoly(c,[[32,116],[110,82],[220,92],[330,78],[448,114],[430,198],[320,174],[222,190],[112,172],[44,210]]);
    c.globalAlpha=0.30;c.fillStyle='#9ab090';
    for(let i=0;i<18;i++)c.fillRect(54+Math.round(hash2(i+701,3)*370),212+Math.round(hash2(i+707,5)*38),10,1);
    c.globalAlpha=1;
  }else if(scene==='airBell'){
    c.globalAlpha=0.52;
    c.fillStyle='#d8fbff';
    c.fillRect(170,78,142,2);c.fillRect(150,91,182,2);c.fillRect(176,104,132,2);
    c.globalAlpha=0.20;c.fillRect(154,70,180,52);
    c.globalAlpha=1;
  }else if(scene==='crystalReef'){
    for(let i=0;i<12;i++){
      const x=76+i*31,y=238-Math.round(hash2(i+801,9)*64),h=30+Math.round(hash2(i+807,11)*42);
      c.fillStyle=i%2?'#49d8ff':'#70f0d0';
      uwPoly(c,[[x,y],[x+8,y-h],[x+17,y],[x+10,y+8]]);
      c.globalAlpha=0.34;c.fillStyle='#ffffff';c.fillRect(x+8,y-h+8,2,h-10);c.globalAlpha=1;
    }
  }else if(scene==='sunkenArchive'){
    c.fillStyle='#111722';
    c.fillRect(132,112,216,104);
    c.fillStyle='#1c2a37';c.fillRect(140,120,200,88);
    c.fillStyle='#33505a';
    for(let i=0;i<7;i++)c.fillRect(154,134+i*10,172,2);
    c.globalAlpha=0.22;c.fillStyle='#bdf8ff';c.fillRect(178,124,124,76);c.globalAlpha=1;
  }
}
function drawUnderwaterObjects(c,cave,tk){
  const objects=G.underwaterCaveSceneObjects?G.underwaterCaveSceneObjects(cave):[];
  for(const hit of objects){
    const def=hit.def,obj=hit.obj||{};
    const x=Math.round(obj.x||0),y=Math.round(obj.y||0),pulse=(obj.pulseT||0)>0;
    c.save();
    c.globalAlpha=pulse?0.92:0.68;
    if(def.kind==='glow'){
      c.fillStyle='#bdf8ff';c.fillRect(x-38,y-2,76,3);c.fillRect(x-18,y+8,36,2);
    }else if(def.kind==='shell'){
      c.fillStyle='#d8c0a0';uwPoly(c,[[x-22,y+8],[x-10,y-12],[x+12,y-10],[x+24,y+8]]);
      c.fillStyle='#7e6c62';c.fillRect(x-16,y+5,32,3);
    }else if(def.kind==='airPocket'){
      c.globalAlpha=0.34+(pulse?0.24:0);
      c.fillStyle='#d8fbff';c.fillRect(x-58,y-22,116,2);c.fillRect(x-44,y-8,88,2);c.fillRect(x-30,y+8,60,2);
    }else if(def.kind==='crystal'){
      c.fillStyle='#79f0ff';uwPoly(c,[[x-16,y+18],[x-4,y-30],[x+12,y+18]]);
      c.fillStyle='#d8ffff';c.fillRect(x-2,y-20,2,34);
    }else if(def.kind==='sealedRunes'){
      c.fillStyle='#1a2630';c.fillRect(x-68,y-32,136,62);
      c.strokeStyle=pulse?'#bdf8ff':'#496a76';c.strokeRect(x-68.5,y-32.5,136,62);
      let label='FÖRSEGLAT';
      const surface=G.surfaceRuneSummary?G.surfaceRuneSummary():null;
      const deep=G.deepRuneSummary?G.deepRuneSummary():null;
      if(deep&&deep.complete)label='DJUPRUNOR 10/10';
      else if(surface&&surface.complete&&deep)label='DJUPRUNOR '+deep.read+'/'+deep.total;
      else if(surface&&surface.complete)label='DJUPRUNOR';
      if(typeof drawTextC==='function')drawTextC(c,label,x,y-5,1,pulse?'#bdf8ff':'#7398a6');
    }
    c.restore();
  }
}
function underwaterSwimPhase(cave,tk){
  const speed=Math.hypot(cave.vx||0,cave.vy||0),moving=speed>0.08,fast=!!(moving&&cave.keys&&cave.keys.run&&cave.swimFins);
  const t=(cave.t||0)+tk,strokeT=Number.isFinite(cave.swimStrokeT)?cave.swimStrokeT+tk*0.035:t*(moving?(fast?0.16:0.10):0.035);
  const wave=Math.sin(strokeT);
  return {
    speed,moving,fast,
    phase:moving?(Math.floor(strokeT*2.0)&3):0,
    kick:moving?Math.round(wave):0,
    bob:Math.round(Math.sin(t*(moving?0.10:0.07))*1.2)
  };
}
function drawUnderwaterLemmingSide(c,x,y,d,anim,hasFins){
  const colors=typeof COL==='object'&&COL?COL:{hair:'#6fb4ff',skin:'#ffd9a8',body:'#2244ee',leg:'#1a33bb'};
  const hair=colors.hair,skin=colors.skin,body=colors.body,leg=colors.leg,dark='#102040';
  const phase=anim.phase||0,kick=anim.kick||0;
  c.save();
  c.translate(x,y+anim.bob);
  c.scale(2,2);
  c.scale(d>=0?1:-1,1);
  function p(px,py,w,h,col){c.fillStyle=col;c.fillRect(px,py,w,h)}
  c.save();
  c.rotate(Math.PI/2);
  function rp(px,py,w,h,col){c.fillStyle=col;c.fillRect(px,py+5,w,h)}
  function drawSwimLegs(){
    if(!anim.moving||phase===0){rp(-2,-2,2,2,leg);rp(1,-2,2,2,leg)}
    else if(phase===1){rp(-3,-1,2,1,leg);rp(-2,-2,2,1,leg);rp(1,-2-kick,2,2,leg)}
    else if(phase===2){rp(-1,-2,2,2,leg);rp(0,-2,1,2,leg)}
    else{rp(-2,-2+kick,2,2,leg);rp(2,-1,2,1,leg);rp(1,-2,2,1,leg)}
  }
  drawSwimLegs();
  if(hasFins){
    rp(-3,0+kick,3,2,'#020304');
    rp(1,0-kick,3,2,'#020304');
    rp(-2,1+kick,2,1,'#172028');
    rp(2,1-kick,2,1,'#172028');
  }
  rp(-2,-6,4,4,body);
  c.restore();
  p(-1,-3,3,3,body);
  p(2,-5,2,2,skin);
  p(1,-7,4,2,hair);p(1,-5,1,2,hair);p(4,-5,1,2,hair);
  p(4,-5,1,1,dark);
  if(anim.moving&&phase===1)p(2,-1,3,1,skin);
  else p(1,0,3,1,skin);
  c.restore();
}
function drawUnderwaterLemming(c,cave,tk){
  const x=Math.round(cave.swimX||240),y=Math.round(cave.swimY||150),face=cave.facing||'right';
  const anim=underwaterSwimPhase(cave,tk);
  const hasFins=!!(cave.swimFins||(G.hasHolySwimFins&&G.hasHolySwimFins()));
  const drawDir=face==='left'?-1:(face==='right'?1:((cave.vx||0)<-0.05?-1:1));
  const grab=!!(cave.octopus&&cave.octopus.phase==='grab');
  const dragFade=grab?clamp(cave.octopus.dragFade||0,0,1):0;
  const goneFade=grab?clamp((y-(CH+2))/32,0,1):0;
  const visible=1-goneFade;
  if(visible<=0)return;
  const lampDive=!!cave.manualLampDive;
  c.save();
  if(!lampDive){
    c.globalAlpha=(0.18*(1-dragFade))*visible;c.fillStyle='#d8f8ff';uwRect(c,x-14,y+5,28,2);c.globalAlpha=1;
    c.globalCompositeOperation='lighter';
    const g=c.createRadialGradient(x,y-9,2,x,y-9,anim.fast?28:22);
    g.addColorStop(0,grab?'rgba(255,190,120,0.10)':'rgba(255,242,150,0.22)');
    g.addColorStop(0.46,grab?'rgba(150,80,90,0.06)':'rgba(150,232,255,0.10)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    c.globalAlpha=(1-dragFade*0.75)*visible;
    c.fillStyle=g;c.fillRect(x-32,y-36,64,56);
    c.globalCompositeOperation='source-over';
  }
  if(anim.moving&&!grab&&!lampDive){
    c.globalAlpha=anim.fast?0.34:0.22;
    c.fillStyle='#bdf8ff';
    uwRect(c,x-drawDir*(anim.fast?22:16),y-3+anim.bob,anim.fast?14:10,1);
    uwRect(c,x-drawDir*(anim.fast?18:13),y+3+anim.bob,anim.fast?10:7,1);
    c.globalAlpha=1;
  }
  if(grab){
    c.globalAlpha=(0.20+0.26*(1-dragFade))*visible;
    c.fillStyle='#13070a';
    uwRect(c,x-11,y+12,22,Math.max(8,Math.round(18+dragFade*30)));
    c.globalAlpha=clamp(1-dragFade*0.92,0.04,1)*visible;
  }
  drawUnderwaterLemmingSide(c,x,y,drawDir,anim,hasFins);
  c.restore();
}
function drawUnderwaterBubbles(c,cave,tk){
  c.save();
  c.globalAlpha=0.65;
  c.fillStyle='#bdf8ff';
  for(const b of cave.bubbles||[])c.fillRect(Math.round(b.x),Math.round(b.y),b.r||2,b.r||2);
  for(let i=0;i<18;i++){
    const x=36+Math.round(hash2(i+901,7)*408),y=CH-24-(((tk+i*31)%260));
    c.globalAlpha=0.18+hash2(i+907,11)*0.26;
    c.fillRect(x,y,1+(i%3===0?1:0),1+(i%4===0?1:0));
  }
  c.restore();
}
function drawUnderwaterOctopusTentacle(c,x0,y0,x1,y1,seed,tk,front){
  const steps=13,amp=8+seed%3*2;
  for(let i=0;i<=steps;i++){
    const p=i/steps;
    const sway=Math.sin((tk||0)*0.055+seed*1.7+p*5.4)*amp*(1-p*0.35);
    const x=x0+(x1-x0)*p+sway*Math.sin(p*Math.PI);
    const y=y0+(y1-y0)*p-Math.sin(p*Math.PI)*(18+seed%4*3);
    const s=front?4:3;
    c.fillStyle='#010203';
    c.fillRect(Math.round(x-s/2),Math.round(y-s/2),s,s);
    if(i%2===0){
      c.fillStyle=front?'#17222a':'#0b151c';
      c.fillRect(Math.round(x+s/2-1),Math.round(y-s/2),1,Math.max(1,s-1));
    }
    if(front&&i%3===1){
      c.fillStyle='#22333b';
      c.fillRect(Math.round(x-1),Math.round(y+1),1,1);
    }
  }
}
function drawUnderwaterOctopusEyes(c,ox,bodyY,o,tk,front){
  const reach=clamp(o&&o.reach||0,0,1);
  const wake=clamp(Number.isFinite(o&&o.wakeT)?o.wakeT/120:Math.max(0,((o&&o.t)||0)-60)/120,0,1);
  const escapeFade=clamp(((o&&o.escapeT)||0)/18,0,1);
  const pulse=0.5+0.5*Math.sin((tk||0)*0.12+((o&&o.t)||0)*0.035);
  const y=Math.round(clamp((Number.isFinite(bodyY)?bodyY:CH+52)-18,CH-34,CH-16));
  const spread=22+Math.round(reach*5);
  c.save();
  c.globalCompositeOperation='lighter';
  c.globalAlpha=((front?0.26:0.18)+(front?0.28:0.18)*pulse+0.10*wake)*(1-escapeFade*0.28);
  c.fillStyle='rgba(255,42,18,0.28)';
  c.fillRect(ox-spread-8,y-5,16,9);
  c.fillRect(ox+spread-8,y-5,16,9);
  c.globalAlpha=(front?0.48:0.34)+0.20*pulse+0.10*wake;
  c.fillStyle='#ff4a24';
  c.fillRect(ox-spread-4,y-2,8,3);
  c.fillRect(ox+spread-4,y-2,8,3);
  c.fillStyle='#ffd45c';
  c.fillRect(ox-spread-3,y-3,6,1);
  c.fillRect(ox+spread-3,y-3,6,1);
  c.restore();
}
function drawUnderwaterOctopusThreat(c,cave,tk,front){
  const o=cave&&cave.octopus;
  if(!o||!o.active||cave.swimFins)return false;
  const sx=Math.round(cave.swimX||240),sy=Math.round(cave.swimY||150);
  const ox=Math.round(Number.isFinite(o.x)?o.x:sx),bodyY=Math.round(Number.isFinite(o.bodyY)?o.bodyY:CH+58);
  const grab=o.phase==='grab',reach=clamp(o.reach||0,0,1);
  if(front&&!grab){
    drawUnderwaterOctopusEyes(c,ox,bodyY,o,tk,true);
    return true;
  }
  c.save();
  const escapeFade=clamp((o.escapeT||0)/18,0,1);
  c.globalAlpha=(front?0.90:(0.30+0.54*reach))*(1-escapeFade*0.18);
  if(!front){
    c.fillStyle='#010204';
    uwPoly(c,[[ox-76,bodyY+50],[ox-62,bodyY+10],[ox-34,bodyY-18],[ox,bodyY-28],[ox+36,bodyY-16],[ox+64,bodyY+12],[ox+78,bodyY+52]]);
    c.fillStyle='#050b10';
    uwPoly(c,[[ox-52,bodyY+22],[ox-28,bodyY-8],[ox,bodyY-16],[ox+30,bodyY-7],[ox+54,bodyY+22],[ox+34,bodyY+38],[ox-32,bodyY+38]]);
    c.globalAlpha*=0.55;
    c.fillStyle='#18313a';
    c.fillRect(ox-30,bodyY-4,18,2);
    c.fillRect(ox+12,bodyY-3,18,2);
    drawUnderwaterOctopusEyes(c,ox,bodyY,o,tk,false);
    c.globalAlpha=0.34+0.48*reach;
  }
  const offsets=[-64,-43,-22,0,24,46,66];
  for(let i=0;i<offsets.length;i++){
    const side=offsets[i],baseX=ox+side,baseY=bodyY+20+Math.abs(side)*0.08;
    const tx=grab?sx+clamp(side*0.12,-10,10):sx+clamp(side*0.24,-24,24);
    const reachY=Number.isFinite(o.tipY)?o.tipY:CH+24;
    const ty=grab?sy+8+Math.sin((tk||0)*0.08+i)*5:Math.max(reachY+i%3*7,sy+24+Math.abs(side)*0.04);
    drawUnderwaterOctopusTentacle(c,baseX,baseY,tx,ty,i+17,tk,front);
  }
  if(front&&grab){
    c.globalAlpha=0.96;
    drawUnderwaterOctopusTentacle(c,sx-36,sy+44,sx-6,sy+4,31,tk,true);
    drawUnderwaterOctopusTentacle(c,sx+40,sy+46,sx+10,sy+6,37,tk,true);
  }
  c.restore();
  return true;
}
function underwaterManualLampCone(cave,tk,wide){
  const x=Math.round(cave.swimX||240),y=Math.round(cave.swimY||150),d=underwaterManualLampDir(cave);
  const baseY=y-7,tilt=clamp(cave.vy||0,-1.4,1.4)*12;
  const len=wide?210:168,spread=wide?82:50;
  return [
    [x+d*7,baseY-5],
    [x+d*Math.round(len*0.44),baseY+tilt*0.5-Math.round(spread*0.50)],
    [x+d*len,baseY+tilt-Math.round(spread*0.18)],
    [x+d*(len+18),baseY+tilt],
    [x+d*len,baseY+tilt+Math.round(spread*0.18)],
    [x+d*Math.round(len*0.44),baseY+tilt*0.5+Math.round(spread*0.50)],
    [x+d*7,baseY+5]
  ];
}
function drawUnderwaterManualLampCutout(oc,cave,tk){
  const x=Math.round(cave.swimX||240),y=Math.round(cave.swimY||150),d=underwaterManualLampDir(cave);
  const on=underwaterManualLampOn(cave),flash=clamp((cave.lampPulseT||0)/18,0,1);
  oc.globalCompositeOperation='destination-out';
  if(on){
    oc.globalAlpha=0.28;
    oc.fillStyle='rgba(0,0,0,0.28)';
    uwPoly(oc,underwaterManualLampCone(cave,tk,true));
    oc.globalAlpha=0.76;
    oc.fillStyle='rgba(0,0,0,0.76)';
    uwPoly(oc,underwaterManualLampCone(cave,tk,false));
    const glow=oc.createRadialGradient(x+d*9,y-7,1,x+d*9,y-7,34+Math.round(flash*10));
    glow.addColorStop(0,'rgba(0,0,0,0.92)');
    glow.addColorStop(0.55,'rgba(0,0,0,0.44)');
    glow.addColorStop(1,'rgba(0,0,0,0)');
    oc.globalAlpha=1;
    oc.fillStyle=glow;
    oc.beginPath();oc.arc(x+d*9,y-7,34+Math.round(flash*10),0,7);oc.fill();
  }else if(flash>0){
    const glow=oc.createRadialGradient(x+d*9,y-7,1,x+d*9,y-7,18+Math.round(flash*14));
    glow.addColorStop(0,'rgba(0,0,0,'+(0.42*flash)+')');
    glow.addColorStop(1,'rgba(0,0,0,0)');
    oc.globalAlpha=1;
    oc.fillStyle=glow;
    oc.beginPath();oc.arc(x+d*9,y-7,18+Math.round(flash*14),0,7);oc.fill();
  }
  oc.globalCompositeOperation='source-over';
  oc.globalAlpha=1;
}
function drawUnderwaterLampDiveDarkness(c,cave,tk){
  if(!UW_DARK_CTX){
    c.save();c.globalAlpha=0.90;c.fillStyle='#01050a';c.fillRect(0,0,CW,CH);c.restore();
    return true;
  }
  const oc=UW_DARK_CTX,scene=cave.scene||'entryPool',t=(cave.t||0)+tk;
  oc.globalCompositeOperation='source-over';
  oc.clearRect(0,0,CW,CH);
  oc.globalAlpha=1;
  oc.fillStyle=scene==='entryPool'?'rgba(0,5,11,0.88)':'rgba(0,2,7,0.94)';
  oc.fillRect(0,0,CW,CH);
  oc.globalAlpha=0.20+0.08*Math.sin(t*0.16);
  oc.fillStyle='#000000';
  oc.fillRect(0,0,CW,CH);
  drawUnderwaterManualLampCutout(oc,cave,tk);
  oc.globalAlpha=0.28;
  oc.fillStyle='#000000';
  oc.fillRect(0,0,CW,34);
  oc.fillRect(0,CH-38,CW,38);
  oc.globalAlpha=1;
  c.drawImage(UW_DARK_CV,0,0);
  return true;
}
function drawUnderwaterCaveDarkness(c,cave,tk){
  const danger=!!(cave&&cave.octopus&&cave.octopus.active&&!cave.swimFins);
  if(cave&&cave.manualLampDive)return drawUnderwaterLampDiveDarkness(c,cave,tk);
  if(underwaterCaveLitRoom(cave)&&!danger)return false;
  const x=Math.round(cave.swimX||240),y=Math.round(cave.swimY||150);
  const pulse=Math.sin(((cave.t||0)+tk)*0.11)*7;
  const dangerFade=danger?clamp(((cave.octopus&&cave.octopus.t)||0)/60,0,1):0;
  c.save();
  if(danger)c.globalAlpha=0.66+0.34*dangerFade;
  const g=c.createRadialGradient(x,y,danger?12:26,x,y,danger?72+Math.abs(pulse)*0.7:136+pulse);
  g.addColorStop(0,'rgba(0,0,0,0)');
  g.addColorStop(danger?0.22:0.34,danger?'rgba(0,3,8,0.12)':'rgba(0,3,8,0.08)');
  g.addColorStop(danger?0.44:0.58,danger?'rgba(0,2,6,0.72)':'rgba(0,4,10,0.58)');
  g.addColorStop(danger?0.70:0.82,danger?'rgba(0,1,4,0.94)':'rgba(0,3,8,0.88)');
  g.addColorStop(1,danger?'rgba(0,0,2,0.995)':'rgba(0,2,6,0.97)');
  c.fillStyle=g;
  c.fillRect(0,0,CW,CH);
  if(danger){
    c.globalAlpha=(0.18+0.12*dangerFade)+0.10*Math.sin(((cave.t||0)+tk)*0.19);
    c.fillStyle='#020003';
    c.fillRect(0,0,CW,CH);
    c.globalAlpha=0.16+0.12*dangerFade;
    c.fillStyle='#18060b';
    c.fillRect(0,Math.round(CH*0.58),CW,Math.round(CH*0.42));
  }
  c.globalAlpha=danger?0.22+0.14*dangerFade:0.18;
  c.fillStyle='#000000';
  c.fillRect(0,0,CW,danger?46:28);
  c.fillRect(0,CH-(danger?44:24),CW,danger?44:24);
  c.restore();
  return true;
}
function drawUnderwaterHolyLight(c,cave,tk,dark){
  if(cave&&cave.manualLampDive)return false;
  const x=Math.round(cave.swimX||240),y=Math.round(cave.swimY||150);
  const pulse=0.5+0.5*Math.sin(((cave.t||0)+tk)*0.14);
  const danger=!!(cave&&cave.octopus&&cave.octopus.active&&!cave.swimFins);
  const grab=!!(cave&&cave.octopus&&cave.octopus.phase==='grab');
  const goneFade=grab?clamp((y-(CH+2))/32,0,1):0;
  const visible=1-goneFade;
  if(visible<=0)return;
  const dangerFade=danger?clamp(((cave.octopus&&cave.octopus.t)||0)/60,0,1):0;
  c.save();
  c.globalCompositeOperation='lighter';
  let g=c.createRadialGradient(x,y,2,x,y,danger?76-Math.round(dangerFade*18)+Math.round(pulse*7):(dark?96+Math.round(pulse*12):46));
  g.addColorStop(0,danger?'rgba(255,230,130,0.38)':'rgba(255,245,170,0.46)');
  g.addColorStop(0.24,danger?'rgba(150,220,255,0.15)':'rgba(190,240,255,0.25)');
  g.addColorStop(0.65,danger?'rgba(40,120,160,0.045)':'rgba(80,190,220,0.08)');
  g.addColorStop(1,'rgba(0,0,0,0)');
  c.globalAlpha=visible;
  c.fillStyle=g;
  c.fillRect(0,0,CW,CH);
  if(dark){
    c.globalAlpha=(0.20+0.08*pulse)*visible;
    c.fillStyle='#fff0a0';
    c.fillRect(x-42,y-2,84,2);
    c.fillRect(x-26,y+12,52,1);
  }
  c.restore();
}
function underwaterManualLampOn(cave){
  return !!(cave&&cave.manualLampDive&&G.manual&&G.manual.active&&G.manual.lemId===cave.lemId&&G.manual.lampOn);
}
function underwaterManualLampDir(cave){
  if(!cave)return 1;
  if(cave.facing==='left')return -1;
  if(cave.facing==='right')return 1;
  return (cave.vx||0)<-0.05?-1:1;
}
function drawUnderwaterManualLampLight(c,cave,tk,dark){
  if(!cave||!cave.manualLampDive)return false;
  const x=Math.round(cave.swimX||240),y=Math.round(cave.swimY||150),d=underwaterManualLampDir(cave);
  const on=underwaterManualLampOn(cave),pulse=0.5+0.5*Math.sin(((cave.t||0)+tk)*0.18);
  const flash=clamp((cave.lampPulseT||0)/18,0,1),baseY=y-7,tilt=clamp(cave.vy||0,-1.4,1.4)*10;
  c.save();
  c.globalCompositeOperation='lighter';
  if(!on){
    c.globalAlpha=0.12+0.18*flash;
    c.fillStyle='#fff0a0';
    c.fillRect(x+d*9-1,baseY-1,3,3);
    c.restore();
    return false;
  }
  const len=dark?178:132;
  c.globalAlpha=0.10+0.04*pulse+0.06*flash;
  c.fillStyle='#fff6c8';
  for(let i=0;i<8;i++){
    const p=(i+1)/9,xx=x+d*Math.round(18+p*len*0.70),yy=baseY+tilt*p+Math.sin((tk||0)*0.12+i)*3;
    const w=i%3===0?2:1;
    c.fillRect(Math.round(xx),Math.round(yy),w,1);
  }
  c.globalAlpha=0.88;
  c.fillStyle='#caa040';c.fillRect(x+d*7-1,baseY-2,3,2);
  c.fillStyle='#fff0a0';c.fillRect(x+d*9-1,baseY-2,3,3);
  c.globalAlpha=0.36+0.18*pulse;
  c.fillStyle='#fff8c8';c.fillRect(x+d*12-1,baseY-1,2,1);
  c.restore();
  return true;
}
function drawUnderwaterOctopusWarning(c,cave,tk){
  const o=cave&&cave.octopus;
  if(!o||!o.active||cave.swimFins||!o.warned||o.phase==='grab')return false;
  const pulse=0.5+0.5*Math.sin(((cave.t||0)+tk)*0.16);
  const x=CW-82,y=24,w=118,h=16;
  c.save();
  c.globalAlpha=0.44+0.12*pulse;
  c.fillStyle='rgba(0,0,0,0.68)';
  c.fillRect(x-Math.floor(w/2),y-10,w,h);
  c.globalAlpha=0.82+0.18*pulse;
  drawTextC(c,'SIMMA UPP\u00c5T!',x,y-5,1,pulse>0.48?'#fff0a0':'#ffd45c');
  c.restore();
  return true;
}
function underwaterCaveHintText(cave){
  if(cave&&cave.manualLampDive)return cave.swimFins?'PILAR SIMMAR  SHIFT SNABBT  L LAMPA  M KARTA  ESC UPP':'PILAR SIMMAR  L LAMPA  M KARTA  ESC UPP';
  return cave&&cave.swimFins?'PILAR SIMMAR  SHIFT SNABBT  M KARTA  ESC UPP':'PILAR SIMMAR  M KARTA  ESC UPP';
}
function drawUnderwaterMap(c,cave){
  const graph=typeof underwaterCaveMapGraph==='function'?underwaterCaveMapGraph():{nodes:[],links:[]};
  c.save();
  c.globalAlpha=0.92;c.fillStyle='#041018';c.fillRect(72,38,336,208);c.globalAlpha=1;
  c.strokeStyle='#4aa8b8';c.strokeRect(72.5,38.5,335,207);
  const pos={};
  for(const n of graph.nodes){
    pos[n.id]={x:118+n.x*78,y:76+n.y*54,w:n.w,h:n.h};
  }
  c.strokeStyle='rgba(139,232,255,0.38)';
  for(const l of graph.links){
    const a=pos[l.from],b=pos[l.to];if(!a||!b)continue;
    c.beginPath();c.moveTo(a.x+a.w/2,a.y+a.h/2);c.lineTo(b.x+b.w/2,b.y+b.h/2);c.stroke();
  }
  for(const n of graph.nodes){
    const r=pos[n.id],active=n.id===cave.scene;
    c.fillStyle=active?'#1f6b75':'#102832';c.fillRect(r.x,r.y,r.w,r.h);
    c.strokeStyle=active?'#bdf8ff':'#3d6c76';c.strokeRect(r.x+0.5,r.y+0.5,r.w-1,r.h-1);
    drawTextC(c,n.short||'?',r.x+r.w/2,r.y+8,1,active?'#ffffff':'#8fb8c0');
  }
  drawTextC(c,'UNDERVATTNET',240,52,2,'#bdf8ff');
  drawTextC(c,'M STÄNGER KARTAN',240,226,1,'#7fa8b0');
  c.restore();
}
function drawUnderwaterCaveView(c,tk){
  const cave=G.underwaterCave;
  if(!cave||!cave.active)return false;
  c.save();
  drawUnderwaterBackdrop(c,cave,tk);
  drawUnderwaterRoomDetails(c,cave,tk);
  drawUnderwaterObjects(c,cave,tk);
  drawUnderwaterBubbles(c,cave,tk);
  drawUnderwaterOctopusThreat(c,cave,tk,false);
  const dark=drawUnderwaterCaveDarkness(c,cave,tk);
  drawUnderwaterHolyLight(c,cave,tk,dark);
  drawUnderwaterLemming(c,cave,tk);
  drawUnderwaterManualLampLight(c,cave,tk,dark);
  drawUnderwaterOctopusThreat(c,cave,tk,true);
  const def=typeof underwaterCaveSceneDef==='function'?underwaterCaveSceneDef(cave.scene):null;
  drawText(c,def&&def.label?def.label:'Undervattnet',12,12,1,'#bdf8ff');
  drawUnderwaterOctopusWarning(c,cave,tk);
  const octopus=!!(cave.octopus&&cave.octopus.active&&!cave.swimFins);
  if(cave.hintT>0&&!octopus)drawTextC(c,underwaterCaveHintText(cave),CW/2,CH-18,1,'#d8fbff');
  const hit=G.underwaterCavePromptObject?G.underwaterCavePromptObject(cave):null;
  if(hit&&hit.obj&&hit.obj.near){
    drawTextC(c,'MELLANSLAG: UNDERSÖK',Math.round(cave.swimX||240),Math.max(22,Math.round((cave.swimY||150)-28)),1,'#fff0a0');
  }
  if(cave.messageT>0){
    const lines=cave.messageLines||[];
    c.globalAlpha=0.90;c.fillStyle='rgba(0,0,0,0.58)';c.fillRect(76,36,328,36);c.globalAlpha=1;
    for(let i=0;i<Math.min(2,lines.length);i++)drawTextC(c,lines[i],CW/2,46+i*13,1,i?'#d8fbff':'#fff0a0');
  }
  if(cave.mapOpen)drawUnderwaterMap(c,cave);
  c.restore();
  return true;
}
