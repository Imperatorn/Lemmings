// ---------------------- VATTENFALLSGROTTA RENDER -----------------------
function waterfallCaveActiveBounds(cave){
  if(cave&&cave.scene==='camp')return cave.campBounds||cave.deepBounds||cave.bounds||{};
  return cave&&cave.scene==='deep'&&(cave.deepBounds||cave.bounds)?(cave.deepBounds||cave.bounds):(cave&&cave.bounds||{});
}
function waterfallCaveLemmingScale(cave){
  const b=waterfallCaveActiveBounds(cave);
  const far=Number.isFinite(b.exitY)?b.exitY:218;
  const near=Number.isFinite(b.maxY)?b.maxY:304;
  const y=Number.isFinite(cave&&cave.lemY)?cave.lemY:232;
  const p=clamp((y-far)/Math.max(1,near-far),0,1);
  return 1.55+p*0.9;
}

function drawWaterfallCaveLemming(c,cave,lx,ly,scale){
  const facing=(cave&&cave.facing)||((cave&&cave.dir||1)>0?'right':'left');
  const walking=!!(cave&&cave.walking);
  const colors=typeof COL==='object'&&COL?COL:{hair:'#6fb4ff',skin:'#ffd9a8',body:'#2244ee',leg:'#1a33bb'};
  const hair=colors.hair,skin=colors.skin,body=colors.body,leg=colors.leg,dark='#102040';
  const walkPhase=walking?(((cave.walkAnim||0)>>1)&3):0;
  c.save();
  c.translate(lx,ly);
  c.scale(scale,scale);
  function p(x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h)}
  function drawWalkLegs(){
    if(!walking||walkPhase===0){p(-2,-2,2,2,leg);p(1,-2,2,2,leg)}
    else if(walkPhase===1){p(-3,-1,2,1,leg);p(-2,-2,2,1,leg);p(1,-2,2,2,leg)}
    else if(walkPhase===2){p(-1,-2,2,2,leg);p(0,-2,1,2,leg)}
    else{p(-2,-2,2,2,leg);p(2,-1,2,1,leg);p(1,-2,2,1,leg)}
  }
  function drawDepthLegs(){
    const a=walking?walkPhase&1:0;
    p(-2,-2+a,1,2,leg);
    p(1,-2+(walking&&!a?1:0),1,2,leg);
    if(walking){p(-1,-1+a,1,1,leg);p(0,-1+(a?0:1),1,1,leg)}
  }
  if(facing==='left'||facing==='right'){
    const d=facing==='right'?1:-1;
    drawWalkLegs();
    p(-2,-6,4,4,body);
    p(-1+(d>0?0:-1)+1,-8,2,2,skin);
    p(-2,-10,4,2,hair);p(-2,-8,1,2,hair);p(1,-8,1,2,hair);
    p(d>0?1:-2,-8,1,1,dark);
  }else if(facing==='back'){
    drawDepthLegs();
    p(-2,-6,4,4,body);
    p(-3,-6,1,3,skin);p(2,-6,1,3,skin);
    p(-2,-10,4,2,hair);p(-2,-8,4,2,hair);
    p(-1,-11,2,1,hair);
  }else{
    drawDepthLegs();
    p(-2,-6,4,4,body);
    p(-3,-6,1,3,skin);p(2,-6,1,3,skin);
    p(-2,-8,4,2,skin);
    p(-2,-10,4,2,hair);p(-2,-8,1,2,hair);p(1,-8,1,2,hair);
    p(-1,-8,1,1,dark);p(1,-8,1,1,dark);
  }
  c.restore();
}

function drawLandsOfLoreCaveCover(c,cave,tk){
  const img=typeof ASSETS==='object'&&ASSETS?ASSETS.landsOfLoreCover:null;
  const loaded=!!(img&&img.complete!==false&&(img.naturalWidth||img.width));
  const side=(cave&&cave.deepItem&&cave.deepItem.coverSide)||'front';
  const x=150,y=30,w=180,h=225;
  c.save();
  c.globalAlpha=0.66;
  c.fillStyle='#000000';
  c.fillRect(0,0,CW,CH);
  c.globalAlpha=1;
  c.globalAlpha=0.42;
  c.fillStyle='#6ea8b4';
  c.fillRect(x+18,y+h+20,w-36,2);
  c.fillRect(x+40,y+h+30,w-80,2);
  c.globalAlpha=1;
  c.fillStyle='#07090b';
  fillPixelPoly(c,[[x-34,y+h+30],[x-18,y+h+8],[x+w+16,y+h+8],[x+w+34,y+h+30]]);
  c.fillStyle='#16120f';
  fillPixelPoly(c,[[x-22,y+h+24],[x-10,y+h+12],[x+w+8,y+h+12],[x+w+22,y+h+24]]);
  c.fillStyle='#0f0a07';c.fillRect(x-6,y-6,w+12,h+12);
  c.fillStyle='#3a271b';c.fillRect(x-3,y-3,w+6,h+6);
  c.fillStyle='#1a1511';c.fillRect(x,y,w,h);
  if(side==='back'){
    c.fillStyle='#4c3422';c.fillRect(x+5,y+5,w-10,h-10);
    c.fillStyle='#eadbb4';c.fillRect(x+10,y+10,w-20,h-20);
    c.fillStyle='#f8eac4';c.fillRect(x+14,y+16,w-28,h-34);
    c.fillStyle='#8a5a34';c.fillRect(x+16,y+24,w-32,2);
    c.fillStyle='#261910';
    c.font='12px sans-serif';
    c.textAlign='left';
    c.textBaseline='top';
    const lines=[
      'Utvecklat av',
      'Johan Forsberg.',
      '',
      'Tilldelat Valdemar,',
      'Tage och Elis.',
      '',
      'Betatestare:',
      'Micke och Calle'
    ];
    for(let i=0;i<lines.length;i++)c.fillText(lines[i],x+22,y+42+i*20);
    c.fillStyle='#6d472a';c.fillRect(x+22,y+h-34,w-44,2);
  }else if(loaded){
    c.imageSmoothingEnabled=false;
    c.drawImage(img,x,y,w,h);
  }else{
    drawTextC(c,'LADDAR BILD',x+w/2,y+h/2-6,1,'#f0c060');
  }
  c.globalAlpha=0.18;
  c.fillStyle='#8fd8ff';c.fillRect(x+w+8,y+20,2,h-26);
  c.globalAlpha=0.25;
  c.fillStyle='#000000';
  c.fillRect(0,0,CW,16);c.fillRect(0,CH-24,CW,24);c.fillRect(0,0,40,CH);c.fillRect(CW-40,0,40,CH);
  c.restore();
}

function drawWaterfallCaveDeepView(c,cave,tk){
  const wf=cave.wf||{}, t=cave.t||0;
  c.save();
  c.fillStyle='#020407';
  c.fillRect(0,0,CW,CH);
  const ox=130,oy=30,ow=220,oh=116;
  c.fillStyle='#07131d';
  fillPixelPoly(c,[[ox,oy+oh],[ox+28,oy+36],[ox+76,oy+5],[ox+ow-78,oy+6],[ox+ow-28,oy+34],[ox+ow,oy+oh]]);
  c.fillStyle='#1b3342';c.fillRect(ox+48,oy+18,ow-96,oh-20);
  const fallH=oh+8;
  c.globalAlpha=0.18;
  c.fillStyle='#8fd8ff';c.fillRect(ox+92,oy+4,36,fallH);
  for(let i=0;i<40;i+=4){
    const sx=ox+94+i+Math.round(Math.sin((tk+t)*0.11+i)*2);
    c.globalAlpha=0.18+0.16*hash2(i+251,wf.x||0);
    c.fillStyle=i%8?'#70b8d0':'#d8f8ff';
    c.fillRect(sx,oy+4,1+(i%3===0?1:0),fallH+2);
  }
  c.globalAlpha=1;
  c.fillStyle='#071018';
  fillPixelPoly(c,[[0,0],[150,0],[ox+24,oy+72],[90,CH],[0,CH]]);
  fillPixelPoly(c,[[CW,0],[330,0],[ox+ow-24,oy+72],[390,CH],[CW,CH]]);
  c.fillStyle='#111b22';
  fillPixelPoly(c,[[70,CH],[126,210],[188,184],[286,190],[360,CH]]);
  c.fillStyle='#17262f';
  for(let i=0;i<30;i++){
    const x=70+Math.round(hash2(i+261,wf.x||0)*340);
    const y=116+Math.round(hash2(i+263,wf.y||0)*150);
    c.fillRect(x,y,18+Math.round(hash2(i+267,wf.x||0)*44),2+(i%4===0?2:0));
  }
  c.globalAlpha=0.32;
  c.fillStyle='#5aa8c2';
  for(let i=0;i<11;i++){
    const px=150+Math.round(hash2(i+271,wf.x||0)*180);
    const py=214+Math.round(hash2(i+273,wf.y||0)*42);
    c.fillRect(px,py,20+Math.round(hash2(i+277,wf.x||0)*30),2);
  }
  c.globalAlpha=1;
  const it=cave.deepItem||{x:246,y:252};
  const ix=Math.round(it.x),iy=Math.round(it.y);
  c.globalAlpha=0.42;c.fillStyle='#000000';c.fillRect(ix-20,iy+5,44,5);c.globalAlpha=1;
  c.save();
  c.translate(ix,iy);
  c.rotate(-0.12);
  c.fillStyle='#2b1710';c.fillRect(-15,-10,34,20);
  c.fillStyle='#9a5124';c.fillRect(-13,-8,30,16);
  c.fillStyle='#d0a052';c.fillRect(-12,-7,28,2);
  c.fillStyle='#202544';c.fillRect(-11,-4,26,11);
  c.fillStyle='#e8c070';c.fillRect(-9,-6,18,2);
  c.fillStyle='#c0d8ff';c.fillRect(7,-3,5,6);
  c.restore();
  const lx=Math.round(cave.lemX==null?240:cave.lemX),ly=Math.round(cave.lemY==null?210:cave.lemY);
  const lemScale=waterfallCaveLemmingScale(cave);
  c.globalAlpha=0.35;c.fillStyle='#000000';
  c.fillRect(lx-Math.round(8*lemScale),ly+1,Math.round(16*lemScale),Math.max(2,Math.round(2*lemScale)));
  c.globalAlpha=1;
  drawWaterfallCaveLemming(c,cave,lx,ly,lemScale);
  if(it.coverOpen)drawLandsOfLoreCaveCover(c,cave,tk+t);
  c.restore();
  return true;
}

function drawWaterfallCaveCampfire(c,x,y,tk){
  const frame=(Math.floor(tk/10)%4+4)%4;
  const frames=[
    {
      outer:[[-20,7,42,5],[-18,2,36,5],[-15,-3,30,5],[-12,-8,24,5],[-9,-13,18,5],[-6,-18,13,5],[-3,-24,8,6]],
      mid:[[-13,8,26,5],[-11,2,22,5],[-8,-4,17,6],[-5,-10,12,6],[-2,-17,7,7]],
      core:[[-5,8,11,6],[-4,1,9,7],[-2,-6,6,8],[0,-14,4,7]],
      sparks:[[-17,-18,2,1],[15,-25,1,2],[-2,-34,2,1]]
    },
    {
      outer:[[-21,7,41,5],[-17,2,35,5],[-13,-3,28,5],[-10,-9,22,6],[-7,-15,15,6],[-4,-22,9,7],[-1,-30,5,7]],
      mid:[[-14,8,27,5],[-10,3,21,5],[-7,-4,16,6],[-4,-12,11,7],[-1,-20,6,7]],
      core:[[-5,8,10,6],[-3,1,8,7],[-1,-7,6,8],[1,-16,3,7]],
      sparks:[[-21,-12,1,2],[12,-20,2,1],[4,-36,1,2]]
    },
    {
      outer:[[-20,7,42,5],[-19,2,37,5],[-16,-4,31,6],[-12,-10,25,6],[-10,-16,18,6],[-7,-22,13,6],[-5,-28,8,7]],
      mid:[[-13,8,26,5],[-12,2,22,6],[-9,-5,17,6],[-6,-12,13,7],[-4,-20,8,7]],
      core:[[-5,8,11,6],[-4,1,8,7],[-3,-8,7,8],[-2,-17,5,7]],
      sparks:[[-14,-23,1,1],[18,-17,1,2],[0,-39,2,1]]
    },
    {
      outer:[[-21,7,43,5],[-18,1,36,6],[-15,-4,29,6],[-11,-11,23,7],[-8,-18,16,6],[-5,-24,10,7],[-2,-32,6,7]],
      mid:[[-14,8,28,5],[-11,2,22,6],[-8,-5,17,7],[-5,-13,12,7],[-2,-22,7,7]],
      core:[[-5,8,11,6],[-4,0,9,8],[-2,-9,6,8],[0,-18,4,7]],
      sparks:[[-19,-15,2,1],[16,-23,1,1],[5,-32,2,1]]
    }
  ];
  const f=frames[frame];
  c.save();
  c.globalAlpha=0.12;
  c.fillStyle='#7a3a1c';
  fillPixelPoly(c,[[x-94,y+38],[x-74,y+4],[x-28,y-20],[x+42,y-24],[x+92,y+8],[x+106,y+34],[x+54,y+48],[x-70,y+48]]);
  c.globalAlpha=0.14;
  c.fillStyle='#c1642d';
  fillPixelPoly(c,[[x-62,y+28],[x-38,y-6],[x+16,y-24],[x+58,y-2],[x+72,y+24],[x+32,y+36],[x-48,y+36]]);
  c.globalAlpha=1;
  c.globalAlpha=0.38;c.fillStyle='#000000';c.fillRect(x-54,y+13,108,8);c.globalAlpha=1;
  c.fillStyle='#263038';
  for(let i=0;i<12;i++){
    const a=i*Math.PI*2/12;
    const w=6+(i%3);
    c.fillRect(Math.round(x+Math.cos(a)*31)-Math.floor(w/2),Math.round(y+7+Math.sin(a)*8)-2,w,4);
  }
  c.fillStyle='#55331f';
  fillPixelPoly(c,[[x-30,y+9],[x-6,y+3],[x+27,y+11],[x+23,y+16],[x-32,y+15]]);
  c.fillStyle='#6c3c22';
  fillPixelPoly(c,[[x-26,y+18],[x+2,y+9],[x+30,y+15],[x+25,y+20],[x-28,y+23]]);
  c.fillStyle='#2a1710';c.fillRect(x-27,y+14,8,4);c.fillRect(x+18,y+13,8,4);

  function drawRects(rects,col,alpha){
    c.globalAlpha=alpha;
    c.fillStyle=col;
    for(const r of rects)c.fillRect(x+r[0],y+r[1],r[2],r[3]);
  }
  drawRects(f.outer,'#9f2c17',0.94);
  drawRects(f.mid,'#f06a22',0.98);
  drawRects(f.core,'#ffd36b',0.98);
  drawRects(f.sparks,'#ffd27a',0.58);
  c.globalAlpha=1;
  c.restore();
}

function drawWaterfallCaveLemmingFireLight(c,cave,lx,ly,scale,fireX){
  const dx=(fireX-lx), dist=Math.abs(dx);
  const strength=clamp(1-dist/160,0,1);
  if(strength<=0)return;
  const side=dx>=0?1:-1;
  const facing=(cave&&cave.facing)||'right';
  const faceLit=(facing==='right'&&side>0)||(facing==='left'&&side<0);
  const sx=side>0?1:-2, outer=side>0?2:-3;
  c.save();
  c.translate(lx,ly);
  c.scale(scale,scale);
  c.globalCompositeOperation='lighter';
  c.globalAlpha=0.10+0.13*strength;
  c.fillStyle='#ffd080';
  c.fillRect(sx,-10,1,2);
  c.fillRect(sx,-6,1,4);
  if(facing==='front'||facing==='back'){
    c.fillRect(outer,-6,1,3);
  }else if(faceLit){
    c.fillRect(sx,-8,1,2);
  }else{
    c.fillRect(sx,-8,1,1);
  }
  c.globalAlpha=0.08+0.10*strength;
  c.fillStyle='#ff9a3a';
  c.fillRect(outer,-5,1,2);
  c.fillRect(sx,-2,1,1);
  c.globalCompositeOperation='source-over';
  c.restore();
}

function drawWaterfallCaveCampView(c,cave,tk){
  const wf=cave.wf||{}, t=cave.t||0;
  c.save();
  c.fillStyle='#010305';
  c.fillRect(0,0,CW,CH);
  c.fillStyle='#07111a';
  fillPixelPoly(c,[[78,64],[146,24],[234,10],[334,28],[402,72],[350,142],[132,142]]);
  c.fillStyle='#102433';
  fillPixelPoly(c,[[156,58],[214,34],[278,38],[322,62],[292,112],[178,110]]);
  c.globalAlpha=0.18;
  c.fillStyle='#8fd8ff';c.fillRect(232,38,18,84);
  for(let i=0;i<18;i+=3){
    const sx=232+i+Math.round(Math.sin((tk+t)*0.12+i)*1.5);
    c.fillStyle=i%6?'#5aa8c2':'#d8f8ff';
    c.fillRect(sx,38,1,84);
  }
  c.globalAlpha=1;
  c.fillStyle='#06090d';
  fillPixelPoly(c,[[0,0],[128,0],[96,92],[52,CH],[0,CH]]);
  fillPixelPoly(c,[[CW,0],[352,0],[386,92],[430,CH],[CW,CH]]);
  c.fillStyle='#111a21';
  fillPixelPoly(c,[[40,CH],[88,218],[144,180],[224,168],[320,184],[394,CH]]);
  c.fillStyle='#18242c';
  fillPixelPoly(c,[[78,CH],[128,240],[198,218],[286,222],[360,CH]]);
  c.fillStyle='#22313a';
  for(let i=0;i<38;i++){
    const x=44+Math.round(hash2(i+501,wf.x||0)*392);
    const y=92+Math.round(hash2(i+503,wf.y||0)*176);
    c.fillRect(x,y,16+Math.round(hash2(i+507,wf.x||0)*54),2+(i%5===0?2:0));
  }
  c.globalAlpha=0.26;
  c.fillStyle='#6797a4';
  for(let i=0;i<12;i++){
    const x=152+Math.round(hash2(i+523,wf.x||0)*168);
    const y=130+Math.round(hash2(i+527,wf.y||0)*54);
    c.fillRect(x,y,10+Math.round(hash2(i+529,wf.x||0)*26),1);
  }
  c.globalAlpha=1;
  const fire=cave.campFire||{x:318,y:244};
  const fireX=Math.round(fire.x||318),fireY=Math.round(fire.y||244);
  drawWaterfallCaveCampfire(c,fireX,fireY,tk+t);
  const lx=Math.round(cave.lemX==null?240:cave.lemX),ly=Math.round(cave.lemY==null?210:cave.lemY);
  const lemScale=waterfallCaveLemmingScale(cave);
  c.globalAlpha=0.36;c.fillStyle='#000000';
  c.fillRect(lx-Math.round(8*lemScale),ly+1,Math.round(16*lemScale),Math.max(2,Math.round(2*lemScale)));
  c.globalAlpha=1;
  drawWaterfallCaveLemming(c,cave,lx,ly,lemScale);
  drawWaterfallCaveLemmingFireLight(c,cave,lx,ly,lemScale,fireX);
  c.restore();
  return true;
}

function drawWaterfallCaveView(c,tk){
  const cave=G.waterfallCave;
  if(!cave||!cave.active)return false;
  if(cave.scene==='camp')return drawWaterfallCaveCampView(c,cave,tk);
  if(cave.scene==='deep')return drawWaterfallCaveDeepView(c,cave,tk);
  const wf=cave.wf||{}, t=cave.t||0;
  c.save();
  c.fillStyle='#030508';
  c.fillRect(0,0,CW,CH);

  const ox=88,oy=28,ow=304,oh=194;
  const skyA=G.level&&G.level.night?'#071226':'#234766';
  const skyB=G.level&&G.level.night?'#10213a':'#79a8c8';
  for(let y=0;y<oh;y+=4){
    c.fillStyle=y<oh*0.45?skyA:skyB;
    c.fillRect(ox,oy+y,ow,4);
  }
  c.fillStyle=G.level&&G.level.theme==='desert'?'#c58a45':'#233a35';
  fillPixelPoly(c,[[ox,oy+154],[ox+70,oy+112],[ox+138,oy+144],[ox+214,oy+98],[ox+ow,oy+148],[ox+ow,oy+oh],[ox,oy+oh]]);
  c.fillStyle=G.level&&G.level.theme==='city'?'#222936':'#122516';
  for(let i=0;i<12;i++){
    const tx=ox+18+i*24+Math.round(hash2(i,wf.x||0)*9);
    const th=12+Math.round(hash2(i+8,wf.y||0)*22);
    if(G.level&&G.level.theme==='city'){
      c.fillRect(tx,oy+150-th,16,th);
      c.fillStyle='#e8d080';
      if(i%2)c.fillRect(tx+5,oy+153-th,3,4);
      c.fillStyle='#222936';
    }else{
      c.fillRect(tx,oy+150-th,4,th);
      c.fillRect(tx-7,oy+151-th,18,5);
      c.fillRect(tx-5,oy+146-th,14,5);
    }
  }

  const waterW=112,wx=ox+ow/2-waterW/2,wy=oy-8,wh=oh+34;
  c.globalAlpha=0.36;
  c.fillStyle='#b8efff';
  c.fillRect(wx,wy,waterW,wh);
  for(let i=0;i<waterW;i+=4){
    const sx=Math.round(wx+i+Math.sin((tk+t)*0.13+i*0.49+(wf.v||0)*9)*3);
    const phase=((tk+t)*2+i*9)%22;
    c.globalAlpha=0.34+0.24*hash2(i+13,wf.x||0);
    c.fillStyle=i%8?'#7fc8e8':'#e8fbff';
    for(let yy=wy+phase-22;yy<wy+wh;yy+=22){
      const sy=Math.max(wy,Math.round(yy)),sh=Math.min(13,wy+wh-sy);
      if(sh>0)c.fillRect(sx,sy,2,sh);
    }
  }
  c.globalAlpha=0.25;
  c.fillStyle='#ffffff';
  for(let i=0;i<24;i++){
    const mx=wx+Math.round(hash2(i+31,wf.x||0)*waterW);
    const my=oy+oh-14+Math.round(Math.sin((tk+t)*0.12+i)*6);
    c.fillRect(mx,my,2+(i%3),1);
  }
  c.globalAlpha=1;

  c.fillStyle='#111821';
  c.fillRect(0,0,CW,oy+6);
  c.fillRect(0,0,ox+10,CH);
  c.fillRect(ox+ow-10,0,CW-(ox+ow-10),CH);
  c.fillRect(0,oy+oh,CW,CH-oy-oh);
  fillPixelPoly(c,[[ox,oy+oh],[ox+10,oy+80],[ox+34,oy+40],[ox+88,oy+5],[ox+70,oy+92],[ox+54,oy+oh]]);
  fillPixelPoly(c,[[ox+ow,oy+oh],[ox+ow-10,oy+82],[ox+ow-34,oy+42],[ox+ow-90,oy+5],[ox+ow-70,oy+92],[ox+ow-54,oy+oh]]);
  fillPixelPoly(c,[[ox+58,oy+8],[ox+118,oy-2],[ox+ow-118,oy-1],[ox+ow-56,oy+8],[ox+ow-82,oy+30],[ox+82,oy+30]]);
  c.fillStyle='#05080d';
  fillPixelPoly(c,[[0,0],[95,0],[ox+34,oy+46],[ox,oy+oh],[0,CH]]);
  fillPixelPoly(c,[[CW,0],[CW-95,0],[ox+ow-34,oy+46],[ox+ow,oy+oh],[CW,CH]]);
  c.fillStyle='#17222b';
  for(let i=0;i<13;i++){
    const x=102+Math.round(hash2(i+91,wf.x||0)*274);
    const h=10+Math.round(hash2(i+93,wf.y||0)*24);
    const w=4+(i%3);
    fillPixelPoly(c,[[x-w,oy+2],[x+w,oy+1],[x+Math.round(w/2),oy+8+h],[x-1,oy+13+h]]);
  }
  c.fillStyle='#071018';
  for(let i=0;i<10;i++){
    const x=118+Math.round(hash2(i+119,wf.y||0)*236);
    const h=8+Math.round(hash2(i+123,wf.x||0)*18);
    fillPixelPoly(c,[[x-5,CH],[x-1,CH-h],[x+3,CH-h-3],[x+8,CH]]);
  }
  c.fillStyle='#1f2b34';
  for(let i=0;i<34;i++){
    const side=i&1?-1:1;
    const rx=side<0?Math.round(hash2(i,17)*120):CW-Math.round(hash2(i,19)*120);
    const ry=Math.round(hash2(i+3,23)*CH);
    c.fillRect(rx,ry,18+Math.round(hash2(i+5,29)*42),2+(i%3===0?2:0));
  }
  c.fillStyle='#314553';
  for(let i=0;i<18;i++){
    const side=i&1?-1:1;
    const rx=side<0?76+Math.round(hash2(i+131,wf.x||0)*70):334+Math.round(hash2(i+133,wf.y||0)*68);
    const ry=54+Math.round(hash2(i+137,wf.x||0)*168);
    c.fillRect(rx,ry,10+Math.round(hash2(i+139,wf.y||0)*22),1);
  }
  c.globalAlpha=0.70;
  for(let i=0;i<16;i++){
    const side=i&1?-1:1;
    const rx=side<0?90+Math.round(hash2(i+151,wf.x||0)*92):298+Math.round(hash2(i+153,wf.y||0)*92);
    const ry=72+Math.round(hash2(i+157,wf.x||0)*132);
    c.fillStyle=i%3?'#6d8b9e':'#82c7d8';
    c.fillRect(rx,ry,2,1);
    if(i%4===0)c.fillRect(rx+1,ry-1,1,3);
  }
  c.globalAlpha=1;
  c.globalAlpha=0.38;
  c.fillStyle='#42606d';
  for(let i=0;i<18;i++){
    const side=i&1?-1:1;
    const rx=side<0?78+Math.round(hash2(i+181,wf.x||0)*96):306+Math.round(hash2(i+183,wf.y||0)*88);
    const ry=52+Math.round(hash2(i+185,wf.x||0)*132);
    const h=14+Math.round(hash2(i+187,wf.y||0)*38);
    c.fillRect(rx,ry,1,h);
    if(i%3===0)c.fillRect(rx+1,ry+5,1,Math.max(5,Math.round(h*0.45)));
    const fall=(tk+t+i*11)%(h+18);
    if(fall<h){
      c.fillStyle='#9ed8e6';
      c.fillRect(rx,ry+fall,2,2);
      c.fillStyle='#42606d';
    }
  }
  c.globalAlpha=1;
  c.fillStyle='#2b3a44';
  for(let i=0;i<18;i++){
    const rx=62+Math.round(hash2(i+44,wf.x||0)*(CW-124));
    const ry=222+Math.round(hash2(i+55,wf.y||0)*40);
    c.fillRect(rx,ry,18+Math.round(hash2(i+66,wf.x||0)*34),4);
  }
  c.globalAlpha=0.32;
  c.fillStyle='#78cde8';
  for(let i=0;i<7;i++){
    const px=168+Math.round(hash2(i+165,wf.x||0)*142);
    const py=244+Math.round(hash2(i+171,wf.y||0)*28);
    c.fillRect(px,py,16+Math.round(hash2(i+173,wf.x||0)*24),2);
    if(i&1)c.fillRect(px+4,py-1,8,1);
  }
  c.globalAlpha=0.18;
  c.fillStyle='#dff8ff';
  for(let i=0;i<10;i++){
    const mx=Math.round(wx-18+hash2(i+177,wf.x||0)*(waterW+36));
    const my=oy+oh-26+Math.round(Math.sin((tk+t)*0.08+i*1.7)*5);
    c.fillRect(mx,my,10+Math.round(hash2(i+179,wf.y||0)*18),1);
  }
  c.globalAlpha=1;
  c.fillStyle='#0b1118';
  fillPixelPoly(c,[[156,CH],[190,250],[232,238],[286,248],[330,CH]]);
  c.fillStyle='#020508';
  fillPixelPoly(c,[[196,CH],[212,266],[240,254],[270,266],[288,CH]]);
  c.globalAlpha=0.34;
  c.fillStyle='#4a7888';
  c.fillRect(215,268,50,2);
  c.fillRect(224,276,34,1);
  c.globalAlpha=1;
  c.fillStyle='#67b8d8';
  for(let i=0;i<16;i++){
    const mx=208+Math.round(hash2(i+76,wf.x||0)*66);
    const my=235+Math.round(hash2(i+81,wf.y||0)*28);
    c.fillRect(mx,my,2,1);
  }
  const b=cave.bounds||{}, exitY=Math.round(b.exitY||218);
  c.globalAlpha=0.45;
  c.fillStyle='#7fc8e8';
  c.fillRect(Math.round(b.exitX0||184),exitY,Math.round((b.exitX1||296)-(b.exitX0||184)),2);
  c.globalAlpha=0.24;
  c.fillStyle='#e8fbff';
  for(let i=0;i<11;i++){
    const sx=Math.round((b.exitX0||184)+8+i*10+Math.sin((tk+t)*0.09+i)*2);
    c.fillRect(sx,exitY-2+(i&1),5,1);
  }
  c.globalAlpha=1;
  const lx=Math.round(cave.lemX==null?240:cave.lemX),ly=Math.round(cave.lemY==null?210:cave.lemY);
  const lemScale=waterfallCaveLemmingScale(cave);
  const ch=cave.chest;
  if(ch){
    const glow=ch.opened?1:0;
    if(glow>0){
      c.globalAlpha=0.24;
      c.fillStyle='#ffcf66';
      c.fillRect(0,0,CW,CH);
      c.globalAlpha=0.48;
      fillPixelPoly(c,[
        [Math.round(ch.x-20),Math.round(ch.y-15)],
        [Math.round(ch.x-58),Math.round(ch.y-78)],
        [Math.round(ch.x+34),Math.round(ch.y-88)],
        [Math.round(ch.x+22),Math.round(ch.y-15)]
      ]);
      c.globalAlpha=0.36;
      c.fillStyle='#ffe090';
      c.fillRect(Math.round(ch.x-52),Math.round(ch.y-74),96,66);
      c.globalAlpha=1;
    }
    const x=Math.round(ch.x),y=Math.round(ch.y),open=!!ch.opened;
    c.fillStyle='rgba(0,0,0,0.35)';
    c.fillRect(x-22,y+1,44,4);
    c.fillStyle='#5a2d13';
    c.fillRect(x-18,y-14,36,14);
    c.fillStyle='#9a5b24';
    c.fillRect(x-16,y-12,32,10);
    c.fillStyle='#d8a84c';
    c.fillRect(x-19,y-15,38,2);
    c.fillRect(x-2,y-14,4,14);
    c.fillStyle='#2a140a';
    c.fillRect(x-18,y-2,36,2);
    if(open){
      c.fillStyle='#5a2d13';
      fillPixelPoly(c,[[x-17,y-16],[x+16,y-24],[x+19,y-19],[x-15,y-12]]);
      c.fillStyle='#f5c85a';
      c.fillRect(x-11,y-13,22,3);
      c.fillStyle='#ffe58a';
      for(let i=0;i<8;i++)c.fillRect(x-10+i*3,y-15+(i&1),2,2);
    }else{
      c.fillStyle='#7a3d18';
      c.fillRect(x-17,y-21,34,7);
      c.fillStyle='#b8702a';
      c.fillRect(x-15,y-20,30,5);
      c.fillStyle='#ffd866';
      c.fillRect(x-3,y-9,6,6);
      c.fillStyle='#4a2a13';
      c.fillRect(x-1,y-7,2,3);
    }
  }
  c.globalAlpha=0.35;
  c.fillStyle='#000000';
  c.fillRect(lx-Math.round(8*lemScale),ly+1,Math.round(16*lemScale),Math.max(2,Math.round(2*lemScale)));
  c.globalAlpha=1;
  drawWaterfallCaveLemming(c,cave,lx,ly,lemScale);
  drawTextC(c,'PENGAR '+Math.max(0,G.money|0),58,284,1,'#ffd866');
  c.restore();
  return true;
}
