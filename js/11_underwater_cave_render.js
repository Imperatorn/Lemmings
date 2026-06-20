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
function drawUnderwaterLemming(c,cave,tk){
  const x=Math.round(cave.swimX||240),y=Math.round(cave.swimY||150),face=cave.facing||'right';
  const d=face==='left'?-1:1,bob=Math.round(Math.sin(((cave.t||0)+tk)*0.18)*2);
  c.save();
  c.globalAlpha=0.22;c.fillStyle='#d8f8ff';uwRect(c,x-18,y+10,36,3);c.globalAlpha=1;
  c.globalAlpha=0.22+0.08*Math.sin(tk*0.25);c.fillStyle='#fff4a8';
  uwRect(c,x-12,y-17+bob,24,28);uwRect(c,x-20,y-9+bob,40,12);
  c.globalAlpha=1;
  c.fillStyle=COL.body;uwRect(c,x-7*d,y-7+bob,14*d,6);
  c.fillStyle=COL.skin;uwRect(c,x+4*d,y-10+bob,5*d,5);
  c.fillStyle=COL.hair;uwRect(c,x+3*d,y-13+bob,7*d,3);
  c.fillStyle='#102040';uwRect(c,x+7*d,y-9+bob,1,1);
  c.fillStyle=COL.leg;
  uwRect(c,x-10*d,y-2+bob,8*d,2);
  uwRect(c,x-12*d,y+3+bob,9*d,2);
  c.fillStyle=COL.skin;
  uwRect(c,x-2*d,y-11+bob,8*d,2);
  uwRect(c,x-4*d,y-2+bob,8*d,2);
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
function drawUnderwaterCaveDarkness(c,cave,tk){
  if(underwaterCaveLitRoom(cave))return false;
  const x=Math.round(cave.swimX||240),y=Math.round(cave.swimY||150);
  const pulse=Math.sin(((cave.t||0)+tk)*0.11)*7;
  c.save();
  const g=c.createRadialGradient(x,y,26,x,y,136+pulse);
  g.addColorStop(0,'rgba(0,0,0,0)');
  g.addColorStop(0.34,'rgba(0,3,8,0.08)');
  g.addColorStop(0.58,'rgba(0,4,10,0.58)');
  g.addColorStop(0.82,'rgba(0,3,8,0.88)');
  g.addColorStop(1,'rgba(0,2,6,0.97)');
  c.fillStyle=g;
  c.fillRect(0,0,CW,CH);
  c.globalAlpha=0.18;
  c.fillStyle='#000000';
  c.fillRect(0,0,CW,28);
  c.fillRect(0,CH-24,CW,24);
  c.restore();
  return true;
}
function drawUnderwaterHolyLight(c,cave,tk,dark){
  const x=Math.round(cave.swimX||240),y=Math.round(cave.swimY||150);
  const pulse=0.5+0.5*Math.sin(((cave.t||0)+tk)*0.14);
  c.save();
  c.globalCompositeOperation='lighter';
  let g=c.createRadialGradient(x,y,2,x,y,dark?96+Math.round(pulse*12):46);
  g.addColorStop(0,'rgba(255,245,170,0.46)');
  g.addColorStop(0.24,'rgba(190,240,255,0.25)');
  g.addColorStop(0.65,'rgba(80,190,220,0.08)');
  g.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=g;
  c.fillRect(0,0,CW,CH);
  if(dark){
    c.globalAlpha=0.20+0.08*pulse;
    c.fillStyle='#fff0a0';
    c.fillRect(x-42,y-2,84,2);
    c.fillRect(x-26,y+12,52,1);
  }
  c.restore();
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
  const dark=drawUnderwaterCaveDarkness(c,cave,tk);
  drawUnderwaterHolyLight(c,cave,tk,dark);
  drawUnderwaterLemming(c,cave,tk);
  const def=typeof underwaterCaveSceneDef==='function'?underwaterCaveSceneDef(cave.scene):null;
  drawText(c,def&&def.label?def.label:'Undervattnet',12,12,1,'#bdf8ff');
  if(cave.hintT>0)drawTextC(c,'PILAR SIMMAR  SHIFT SNABBT  M KARTA  ESC UPP',CW/2,CH-18,1,'#d8fbff');
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
