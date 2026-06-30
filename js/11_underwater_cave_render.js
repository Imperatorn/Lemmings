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
function uwGlint(c,x,y,w,col){
  c.fillStyle=col;
  c.fillRect(Math.round(x),Math.round(y),Math.round(w),1);
  c.fillRect(Math.round(x+w/2),Math.round(y-2),1,5);
}
function uwKelp(c,x,y,h,col,tk,seed){
  const sway=Math.sin((tk||0)*0.045+seed)*4;
  c.fillStyle=col;
  for(let i=0;i<h;i+=7){
    const p=i/Math.max(1,h),xx=x+Math.round(Math.sin(p*4.4+seed)*3+sway*p);
    c.fillRect(xx,Math.round(y-i),2,8);
    if(i%14===0)c.fillRect(xx+(seed%2?2:-5),Math.round(y-i+2),5,1);
  }
}
function uwSmallFish(c,x,y,d,col,tk,seed){
  const flick=Math.round(Math.sin((tk||0)*0.18+seed)*2);
  c.fillStyle=col;
  c.fillRect(Math.round(x),Math.round(y),8,2);
  c.fillRect(Math.round(x+d*7),Math.round(y-1),2,4);
  c.fillStyle='#d8fbff';
  c.fillRect(Math.round(x+d*2),Math.round(y),1,1);
  c.fillStyle=col;
  c.fillRect(Math.round(x-d*(3+flick)),Math.round(y-1),3,1);
  c.fillRect(Math.round(x-d*(3-flick)),Math.round(y+2),3,1);
}
function uwRuneScratch(c,x,y,col,tk,seed){
  const pulse=0.5+0.5*Math.sin((tk||0)*0.08+seed);
  c.globalAlpha*=0.42+0.28*pulse;
  c.fillStyle=col;
  c.fillRect(Math.round(x),Math.round(y-8),2,16);
  c.fillRect(Math.round(x-5),Math.round(y-3),10,2);
  c.fillRect(Math.round(x+2),Math.round(y+3),7,2);
  c.globalAlpha/=0.42+0.28*pulse;
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
  const pal={
    entryPool:['#082f40','#0d4355','#123845'],
    siltTunnel:['#041017','#071b20','#253328'],
    airBell:['#06141b','#0a242d','#16333a'],
    crystalReef:['#031018','#071b27','#123145'],
    sunkenArchive:['#04080f','#0a111b','#1a2430']
  }[scene]||['#01060a','#031018','#0a1d25'];
  c.fillStyle=lit?'#072635':pal[0];
  c.fillRect(0,0,CW,CH);
  const bg=c.createLinearGradient(0,0,0,CH);
  bg.addColorStop(0,lit?'#0d4355':pal[1]);
  bg.addColorStop(0.58,lit?'#082937':pal[0]);
  bg.addColorStop(1,lit?'#041017':'#010307');
  c.fillStyle=bg;
  c.fillRect(0,0,CW,CH);
  c.globalAlpha=lit?0.38:0.11;
  c.fillStyle='#4cc7df';
  for(let x=-64;x<CW+64;x+=38){
    const sx=x+Math.round(Math.sin(t*0.032+x*0.09)*14);
    uwLine(c,sx,0,sx+62+Math.round(Math.sin(t*0.018+x)*18),CH,lit?'#63d9ec':'#2b7180');
  }
  c.globalAlpha=lit?0.20:0.08;
  c.fillStyle='#d8fbff';
  for(let i=0;i<7;i++){
    const bx=40+i*68+Math.round(Math.sin(t*0.025+i)*8);
    c.fillRect(bx,22+i%3*9,34+i%2*16,1);
  }
  c.globalAlpha=1;
  c.fillStyle=lit?'#061017':'#02070b';
  uwPoly(c,[[0,0],[86,0],[74,54],[52,116],[36,188],[0,CH]]);
  uwPoly(c,[[CW,0],[390,0],[404,62],[432,134],[452,214],[CW,CH]]);
  c.fillStyle=lit?'#09212b':'#041017';
  uwPoly(c,[[0,CH],[62,256],[136,230],[214,218],[296,226],[382,254],[CW,CH]]);
  c.fillStyle=lit?pal[2]:'#0a1d25';
  for(let i=0;i<42;i++){
    const x=20+Math.round(hash2(i+601,scene.length)*438);
    const y=48+Math.round(hash2(i+607,scene.length)*220);
    const w=10+Math.round(hash2(i+613,scene.length)*46);
    c.globalAlpha=0.16+hash2(i+617,scene.length)*0.20;
    c.fillRect(x,y,w,1+(i%7===0?2:0));
  }
  c.globalAlpha=1;
  for(let i=0;i<9;i++){
    const x=24+i*52+Math.round(Math.sin(t*0.021+i)*5);
    uwKelp(c,x,CH-16,22+Math.round(hash2(i+631,scene.length)*26),lit?'#2d7c69':'#183a33',tk,i+3);
  }
}
function drawUnderwaterRoomDetails(c,cave,tk){
  const scene=cave.scene||'entryPool',t=(cave.t||0)+tk;
  if(scene==='entryPool'){
    c.globalAlpha=0.42;c.fillStyle='#b8f8ff';
    for(let i=0;i<11;i++)c.fillRect(146+i*18+Math.round(Math.sin(t*0.08+i)*3),40+i%2*3,13,2);
    c.globalAlpha=0.28;c.fillStyle='#d8fbff';
    for(let i=0;i<5;i++)uwLine(c,172+i*32,48,132+i*18,148,'#d8fbff');
    c.globalAlpha=1;
    c.fillStyle='#0a3a4a';uwPoly(c,[[370,118],[438,106],[456,236],[386,256],[372,206]]);
    c.fillStyle='#143f4d';uwPoly(c,[[386,130],[428,124],[438,224],[398,236]]);
    c.globalAlpha=0.55;c.fillStyle='#6fd6e6';
    for(let i=0;i<6;i++)c.fillRect(182+i*22,76+Math.round(Math.sin(t*0.06+i)*4),18,1);
    c.globalAlpha=0.90;
    uwSmallFish(c,118+Math.sin(t*0.025)*14,128,1,'#7ac8c8',tk,1);
    uwSmallFish(c,344-Math.sin(t*0.022)*18,168,-1,'#a6d8c0',tk,2);
    c.globalAlpha=1;
  }else if(scene==='siltTunnel'){
    c.fillStyle='#102a30';uwPoly(c,[[32,116],[110,82],[220,92],[330,78],[448,114],[430,198],[320,174],[222,190],[112,172],[44,210]]);
    c.fillStyle='#071116';uwPoly(c,[[28,126],[106,98],[218,104],[336,94],[442,122],[416,152],[294,138],[188,150],[78,144]]);
    c.globalAlpha=0.46;c.fillStyle='#344239';
    for(let i=0;i<9;i++){
      const y=124+i*13+Math.round(Math.sin(t*0.04+i)*2);
      c.fillRect(58+i%2*18,y,350-i*18,1);
    }
    c.globalAlpha=0.30;c.fillStyle='#b6c0a0';
    for(let i=0;i<28;i++)c.fillRect(46+Math.round(hash2(i+701,3)*388),204+Math.round(hash2(i+707,5)*44),8+Math.round(hash2(i+709,4)*12),1);
    c.globalAlpha=0.42;c.fillStyle='#6b5a44';
    c.fillRect(92,196,72,4);c.fillRect(300,178,86,4);
    c.fillStyle='#9a8060';c.fillRect(108,190,16,2);c.fillRect(328,172,18,2);
    c.globalAlpha=0.36;
    for(let i=0;i<15;i++)c.fillRect(94+i*22+Math.round(Math.sin(t*0.05+i)*5),98+i%5*24,2,1);
    c.globalAlpha=1;
  }else if(scene==='airBell'){
    c.globalAlpha=0.18;c.fillStyle='#d8fbff';uwPoly(c,[[126,118],[166,70],[250,52],[330,74],[370,122],[340,144],[162,144]]);
    c.globalAlpha=0.54;c.fillStyle='#d8fbff';
    c.fillRect(166,76,148,2);c.fillRect(146,90,188,2);c.fillRect(174,104,134,2);
    c.globalAlpha=0.24;c.fillRect(152,68,184,58);
    c.globalAlpha=0.46;c.fillStyle='#ffffff';
    for(let i=0;i<6;i++)c.fillRect(176+i*28,66+Math.round(Math.sin(t*0.06+i)*4),14,1);
    c.globalAlpha=0.34;c.fillStyle='#88d0df';
    for(let i=0;i<10;i++)c.fillRect(140+i*24,132+Math.round(Math.sin(t*0.04+i)*3),10,1);
    c.globalAlpha=1;
    c.fillStyle='#071016';uwPoly(c,[[70,80],[150,42],[240,34],[336,48],[414,88],[384,64],[250,52],[126,68]]);
  }else if(scene==='crystalReef'){
    c.globalAlpha=0.35;c.fillStyle='#092638';uwPoly(c,[[36,CH],[92,232],[174,246],[248,220],[330,238],[430,216],[CW,CH]]);
    c.globalAlpha=1;
    for(let i=0;i<18;i++){
      const x=48+i*24,y=246-Math.round(hash2(i+801,9)*74),h=26+Math.round(hash2(i+807,11)*54),wide=8+Math.round(hash2(i+811,7)*8);
      const col=i%3===0?'#70f0d0':(i%3===1?'#49d8ff':'#a8f0ff');
      c.fillStyle=col;uwPoly(c,[[x,y],[x+Math.round(wide*0.45),y-h],[x+wide,y],[x+Math.round(wide*0.60),y+8]]);
      c.globalAlpha=0.38;c.fillStyle='#ffffff';c.fillRect(x+Math.round(wide*0.45),y-h+8,2,Math.max(8,h-12));c.globalAlpha=1;
      if(i%4===0){c.globalAlpha=0.42;uwGlint(c,x+wide+3,y-h+14,10,'#d8ffff');c.globalAlpha=1}
    }
    c.globalAlpha=0.24;c.fillStyle='#83f7ff';
    for(let i=0;i<24;i++)c.fillRect(60+Math.round(hash2(i+821,4)*360),72+Math.round(hash2(i+827,6)*156),1+(i%5===0?1:0),1);
    c.globalAlpha=1;
  }else if(scene==='sunkenArchive'){
    c.fillStyle='#0b1018';uwPoly(c,[[108,94],[154,78],[326,78],[374,96],[360,228],[122,228]]);
    c.fillStyle='#111722';c.fillRect(128,108,224,112);
    c.fillStyle='#1c2a37';c.fillRect(138,118,204,92);
    c.fillStyle='#283846';c.fillRect(118,98,244,12);c.fillRect(124,220,232,8);
    c.fillStyle='#071018';c.fillRect(132,112,12,108);c.fillRect(336,112,12,108);
    c.fillStyle='#33505a';
    for(let i=0;i<8;i++)c.fillRect(154,132+i*10,172,2);
    c.globalAlpha=0.28;c.fillStyle='#bdf8ff';c.fillRect(178,124,124,76);c.globalAlpha=1;
    c.globalAlpha=0.40;
    uwRuneScratch(c,164,156,'#7ec8d8',tk,1);
    uwRuneScratch(c,316,166,'#7ec8d8',tk,2);
    uwRuneScratch(c,240,106,'#d8fbff',tk,3);
    c.globalAlpha=1;
    c.fillStyle='#070a10';
    c.fillRect(88,232,304,16);
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
      c.globalCompositeOperation='lighter';
      c.fillStyle='#bdf8ff';c.fillRect(x-46,y-3,92,2);c.fillRect(x-30,y+7,60,2);c.fillRect(x-16,y+17,32,1);
      c.globalAlpha*=0.46;c.fillStyle='#ffffff';
      for(let i=0;i<4;i++)c.fillRect(x-58+i*34+Math.round(Math.sin((tk||0)*0.06+i)*4),y-14+i%2*4,24,1);
      c.globalCompositeOperation='source-over';
    }else if(def.kind==='shell'){
      c.fillStyle='#d8c0a0';uwPoly(c,[[x-24,y+10],[x-14,y-10],[x+8,y-14],[x+24,y+4],[x+18,y+12]]);
      c.fillStyle='#f0d8b8';uwPoly(c,[[x-13,y-7],[x+6,y-10],[x+17,y+3],[x+9,y+6]]);
      c.fillStyle='#7e6c62';c.fillRect(x-17,y+5,34,3);c.fillRect(x-10,y+1,20,2);
      c.globalAlpha*=pulse?0.58:0.24;c.fillStyle='#bdf8ff';
      c.fillRect(x-42,y-18,26,1);c.fillRect(x+18,y-22,32,1);c.fillRect(x-32,y+20,58,1);
    }else if(def.kind==='airPocket'){
      c.globalCompositeOperation='lighter';
      c.globalAlpha=0.34+(pulse?0.24:0);
      c.fillStyle='#d8fbff';c.fillRect(x-66,y-28,132,2);c.fillRect(x-54,y-14,108,2);c.fillRect(x-38,y+2,76,2);c.fillRect(x-24,y+17,48,1);
      c.globalAlpha*=0.72;c.fillStyle='#ffffff';
      for(let i=0;i<5;i++)c.fillRect(x-44+i*22,y-36+Math.round(Math.sin((tk||0)*0.07+i)*3),11,1);
      c.globalCompositeOperation='source-over';
    }else if(def.kind==='crystal'){
      c.globalCompositeOperation='lighter';
      c.fillStyle='#79f0ff';uwPoly(c,[[x-20,y+20],[x-5,y-34],[x+16,y+18],[x+2,y+30]]);
      c.fillStyle='#48c8f0';uwPoly(c,[[x-5,y-34],[x+16,y+18],[x+3,y+7]]);
      c.fillStyle='#d8ffff';c.fillRect(x-2,y-24,2,42);c.fillRect(x-10,y-2,20,1);
      c.globalAlpha*=0.34;c.fillStyle='#80f8ff';c.fillRect(x-38,y+28,76,1);c.fillRect(x-28,y-12,56,1);
      c.globalCompositeOperation='source-over';
    }else if(def.kind==='sealedRunes'){
      c.fillStyle='#090d13';c.fillRect(x-76,y-40,152,78);
      c.fillStyle='#1a2630';c.fillRect(x-68,y-32,136,62);
      c.fillStyle='#223440';c.fillRect(x-62,y-26,124,50);
      c.strokeStyle=pulse?'#bdf8ff':'#496a76';c.strokeRect(x-68.5,y-32.5,136,62);
      let label='FÖRSEGLAT';
      const surface=G.surfaceRuneSummary?G.surfaceRuneSummary():null;
      const deep=G.deepRuneSummary?G.deepRuneSummary():null;
      if(deep&&deep.complete)label='DJUPRUNOR 10/10';
      else if(surface&&surface.complete&&deep)label='DJUPRUNOR '+deep.read+'/'+deep.total;
      else if(surface&&surface.complete)label='DJUPRUNOR';
      const read=deep&&Number.isFinite(deep.read)?deep.read:0;
      for(let i=0;i<10;i++){
        const litRune=surface&&surface.complete&&i<Math.min(10,read||0);
        c.fillStyle=litRune?'#bdf8ff':'#344957';
        c.fillRect(x-50+i*10,y+13,6,10);
        if(litRune){c.globalAlpha*=0.55;c.fillRect(x-51+i*10,y+11,8,1);c.globalAlpha/=0.55}
      }
      if(!(surface&&surface.complete)){
        c.globalAlpha*=0.42;c.fillStyle='#05070c';c.fillRect(x-60,y-22,120,34);c.globalAlpha/=0.42;
      }
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
  const hasFins=!!cave.swimFins;
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
  const repelFade=o&&o.phase==='holyRepel'?clamp((o.repelT||0)/Math.max(1,o.repelDur||54),0,1):0;
  const pulse=0.5+0.5*Math.sin((tk||0)*0.12+((o&&o.t)||0)*0.035);
  const y=Math.round(clamp((Number.isFinite(bodyY)?bodyY:CH+52)-18,CH-34,CH-16));
  const spread=22+Math.round(reach*5);
  c.save();
  c.globalCompositeOperation='lighter';
  c.globalAlpha=((front?0.26:0.18)+(front?0.28:0.18)*pulse+0.10*wake)*(1-escapeFade*0.28)*(1-repelFade*0.72);
  c.fillStyle='rgba(255,42,18,0.28)';
  c.fillRect(ox-spread-8,y-5,16,9);
  c.fillRect(ox+spread-8,y-5,16,9);
  c.globalAlpha=((front?0.48:0.34)+0.20*pulse+0.10*wake)*(1-repelFade*0.72);
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
  if(!o||!o.active)return false;
  const sx=Math.round(cave.swimX||240),sy=Math.round(cave.swimY||150);
  const ox=Math.round(Number.isFinite(o.x)?o.x:sx),bodyY=Math.round(Number.isFinite(o.bodyY)?o.bodyY:CH+58);
  const grab=o.phase==='grab',reach=clamp(o.reach||0,0,1);
  const repel=o.phase==='holyRepel',repelP=repel?clamp((o.repelT||0)/Math.max(1,o.repelDur||54),0,1):0;
  if(front&&!grab&&!repel){
    drawUnderwaterOctopusEyes(c,ox,bodyY,o,tk,true);
    return true;
  }
  c.save();
  const escapeFade=clamp((o.escapeT||0)/18,0,1);
  c.globalAlpha=(front?0.90:(0.30+0.54*reach))*(1-escapeFade*0.18)*(1-repelP*0.70);
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
    const tx=repel?ox+clamp(side*0.42,-34,34):(grab?sx+clamp(side*0.12,-10,10):sx+clamp(side*0.24,-24,24));
    const reachY=Number.isFinite(o.tipY)?o.tipY:CH+24;
    const ty=repel?bodyY+54+i%3*9+repelP*32:(grab?sy+8+Math.sin((tk||0)*0.08+i)*5:Math.max(reachY+i%3*7,sy+24+Math.abs(side)*0.04));
    drawUnderwaterOctopusTentacle(c,baseX,baseY,tx,ty,i+17,tk,front);
  }
  if(front&&grab){
    c.globalAlpha=0.96;
    drawUnderwaterOctopusTentacle(c,sx-36,sy+44,sx-6,sy+4,31,tk,true);
    drawUnderwaterOctopusTentacle(c,sx+40,sy+46,sx+10,sy+6,37,tk,true);
  }
  if(front&&repel)drawUnderwaterOctopusEyes(c,ox,bodyY,o,tk,true);
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
  const repel=!!(cave&&cave.octopus&&cave.octopus.phase==='holyRepel');
  const repelP=repel?clamp((cave.octopus.repelT||0)/Math.max(1,cave.octopus.repelDur||54),0,1):0;
  const goneFade=grab?clamp((y-(CH+2))/32,0,1):0;
  const visible=1-goneFade;
  if(visible<=0)return;
  const dangerFade=danger?clamp(((cave.octopus&&cave.octopus.t)||0)/60,0,1):0;
  c.save();
  c.globalCompositeOperation='lighter';
  const radius=repel?(104+Math.round(repelP*116)+Math.round(pulse*14)):(danger?76-Math.round(dangerFade*18)+Math.round(pulse*7):(dark?96+Math.round(pulse*12):46));
  let g=c.createRadialGradient(x,y,2,x,y,radius);
  g.addColorStop(0,repel?'rgba(255,255,210,0.86)':(danger?'rgba(255,230,130,0.38)':'rgba(255,245,170,0.46)'));
  g.addColorStop(0.24,repel?'rgba(255,238,150,0.36)':(danger?'rgba(150,220,255,0.15)':'rgba(190,240,255,0.25)'));
  g.addColorStop(0.65,repel?'rgba(120,220,255,0.11)':(danger?'rgba(40,120,160,0.045)':'rgba(80,190,220,0.08)'));
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
function drawUnderwaterHolyRepelLight(c,cave,tk){
  const o=cave&&cave.octopus;
  if(!o||o.phase!=='holyRepel')return false;
  const x=Math.round(cave.swimX||240),y=Math.round(cave.swimY||150);
  const p=clamp((o.repelT||0)/Math.max(1,o.repelDur||54),0,1);
  const burst=1-Math.abs(p-0.34)/0.34;
  const pulse=0.5+0.5*Math.sin(((cave.t||0)+tk)*0.24);
  const r=38+Math.round(170*Math.min(1,p*1.35));
  c.save();
  c.globalCompositeOperation='lighter';
  c.globalAlpha=0.24+0.34*clamp(burst,0,1)+0.10*pulse;
  c.fillStyle='#fff6b8';
  fillPixelPoly(c,[[x,y-r],[x+Math.round(r*0.32),y-Math.round(r*0.28)],[x+r,y],[x+Math.round(r*0.32),y+Math.round(r*0.28)],[x,y+r],[x-Math.round(r*0.32),y+Math.round(r*0.28)],[x-r,y],[x-Math.round(r*0.32),y-Math.round(r*0.28)]]);
  c.globalAlpha=0.18+0.16*pulse;
  c.fillStyle='#bdf8ff';
  c.fillRect(x-r-20,y-1,r*2+40,2);
  c.fillRect(x-1,y-r-12,2,r*2+24);
  c.globalAlpha=0.18+0.20*clamp(1-p,0,1);
  c.fillStyle='#ffffff';
  for(let i=0;i<10;i++){
    const a=i*Math.PI/5+((tk||0)*0.015),rr=Math.round(r*(0.48+0.05*(i%2)));
    const x2=x+Math.round(Math.cos(a)*rr),y2=y+Math.round(Math.sin(a)*rr);
    pixelLine(c,x,y,x2,y2,i%2?'#fff0a0':'#bdf8ff');
  }
  c.restore();
  return true;
}
function drawUnderwaterHolyRepelText(c,cave,tk){
  const o=cave&&cave.octopus;
  if(!o||o.phase!=='holyRepel'||typeof drawTextC!=='function')return false;
  const p=clamp((o.repelT||0)/Math.max(1,o.repelDur||54),0,1);
  const fade=clamp(Math.min(p/0.18,(1-p)/0.18),0,1);
  const pulse=0.5+0.5*Math.sin(((cave.t||0)+tk)*0.18);
  c.save();
  c.globalAlpha=0.32+0.36*fade;
  c.fillStyle='rgba(1,6,10,0.62)';
  fillPixelPoly(c,[[116,38],[132,30],[348,30],[364,38],[354,74],[126,74]]);
  c.globalAlpha=fade;
  drawTextC(c,'FIAT LUX',CW/2,43,2,pulse>0.48?'#ffffff':'#fff0a0');
  drawTextC(c,'LUX VINCIT TENEBRAS',CW/2,64,1,'#bdf8ff');
  c.restore();
  return true;
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
  if(!o||!o.active||!o.warned||o.phase==='grab'||o.phase==='holyRepel')return false;
  const pulse=0.5+0.5*Math.sin(((cave.t||0)+tk)*0.16);
  const x=CW-82,y=24,w=118,h=16;
  c.save();
  c.globalAlpha=0.44+0.12*pulse;
  c.fillStyle='rgba(0,0,0,0.68)';
  c.fillRect(x-Math.floor(w/2),y-10,w,h);
  c.globalAlpha=0.82+0.18*pulse;
  drawTextC(c,cave.swimFins?'SIMMA VIDARE!':'SIMMA UPP\u00c5T!',x,y-5,1,pulse>0.48?'#fff0a0':'#ffd45c');
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
  drawUnderwaterHolyRepelLight(c,cave,tk);
  drawUnderwaterLemming(c,cave,tk);
  drawUnderwaterManualLampLight(c,cave,tk,dark);
  drawUnderwaterOctopusThreat(c,cave,tk,true);
  const def=typeof underwaterCaveSceneDef==='function'?underwaterCaveSceneDef(cave.scene):null;
  drawText(c,def&&def.label?def.label:'Undervattnet',12,12,1,'#bdf8ff');
  drawUnderwaterOctopusWarning(c,cave,tk);
  drawUnderwaterHolyRepelText(c,cave,tk);
  const octopus=!!(cave.octopus&&cave.octopus.active);
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
