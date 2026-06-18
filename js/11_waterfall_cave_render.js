// ---------------------- VATTENFALLSGROTTA RENDER -----------------------
function waterfallCaveActiveBounds(cave){
  if(typeof waterfallCaveSceneBoundsFor==='function')return waterfallCaveSceneBoundsFor(cave);
  if(cave&&cave.scene==='camp')return cave.campBounds||cave.deepBounds||cave.bounds||{};
  return cave&&cave.scene==='deep'&&(cave.deepBounds||cave.bounds)?(cave.deepBounds||cave.bounds):(cave&&cave.bounds||{});
}
function waterfallCaveRenderKey(cave){
  if(typeof waterfallCaveSceneRenderKey==='function')return waterfallCaveSceneRenderKey(cave);
  return cave&&cave.scene||'main';
}
function waterfallCaveLemmingScale(cave){
  const b=waterfallCaveActiveBounds(cave);
  const far=Number.isFinite(b.exitY)?b.exitY:218;
  const near=Number.isFinite(b.maxY)?b.maxY:304;
  const y=Number.isFinite(cave&&cave.lemY)?cave.lemY:232;
  const p=clamp((y-far)/Math.max(1,near-far),0,1);
  return 1.55+p*0.9;
}

function waterfallCaveVariantKey(cave){
  return G.waterfallCaveSceneArchiveStyle?G.waterfallCaveSceneArchiveStyle(cave):'floda';
}

function waterfallCaveVariantTheme(cave){
  const key=waterfallCaveVariantKey(cave);
  const themes={
    floda:{key:'floda',tint:'#7aa9bd',tintAlpha:0.03,wall:'#111821',mid:'#1b3342',floor:'#17262f',rim:'#314553',accent:'#d8c58a',glow:'#d8ecff'},
    forest:{key:'forest',tint:'#234b25',tintAlpha:0.11,wall:'#07100b',mid:'#102018',floor:'#101811',rim:'#254326',accent:'#7eb06c',glow:'#b9e58a'},
    ravine:{key:'ravine',tint:'#1e3923',tintAlpha:0.10,wall:'#080d0a',mid:'#162318',floor:'#111512',rim:'#375038',accent:'#a3c27a',glow:'#c9e6a0'},
    marble:{key:'marble',tint:'#d9d0ba',tintAlpha:0.09,wall:'#111315',mid:'#2b3135',floor:'#202326',rim:'#aaa188',accent:'#e6dcc2',glow:'#f8efd0'},
    water:{key:'water',tint:'#2b7589',tintAlpha:0.13,wall:'#061118',mid:'#102d39',floor:'#102027',rim:'#235c6d',accent:'#79d8f0',glow:'#baf8ff'},
    chaos:{key:'chaos',tint:'#5a1c36',tintAlpha:0.13,wall:'#10070c',mid:'#21121d',floor:'#171016',rim:'#5a2340',accent:'#e15a7a',glow:'#8fd8ff'},
    master:{key:'master',tint:'#8a6d2d',tintAlpha:0.10,wall:'#0f1011',mid:'#22241f',floor:'#181916',rim:'#5c5131',accent:'#d8b65a',glow:'#6bdcff'}
  };
  return themes[key]||themes.floda;
}

function drawWaterfallCaveVariantMotifs(c,cave,tk,zone){
  const theme=waterfallCaveVariantTheme(cave),key=theme.key,wf=cave&&cave.wf||{},t=(cave&&cave.t||0)+tk;
  if(!key||key==='floda')return;
  c.save();
  if(theme.tintAlpha>0){
    c.globalAlpha=theme.tintAlpha;
    c.fillStyle=theme.tint;
    c.fillRect(0,0,CW,CH);
  }
  if(key==='forest'||key==='ravine'){
    c.globalAlpha=zone==='main'?0.34:0.28;
    c.fillStyle=key==='forest'?'#2c2416':'#342818';
    for(let i=0;i<7;i++){
      const x=36+i*66+Math.round(hash2(i+2201,wf.x||0)*18);
      const y0=zone==='camp'?58:36;
      const len=42+Math.round(hash2(i+2203,wf.y||0)*72);
      fillPixelPoly(c,[[x,y0],[x+5,y0],[x+18,y0+len],[x+12,y0+len+4],[x+4,y0+Math.round(len*0.55)]]);
      if(i%2===0)fillPixelPoly(c,[[x+10,y0+len-10],[x+34,y0+len+6],[x+31,y0+len+10],[x+7,y0+len-5]]);
    }
    c.globalAlpha=key==='forest'?0.26:0.20;
    c.fillStyle=key==='forest'?'#355d2d':'#4b5f34';
    for(let i=0;i<6;i++){
      const x=72+Math.round(hash2(i+2211,wf.x||0)*330),y=216+Math.round(hash2(i+2213,wf.y||0)*56);
      fillPixelPoly(c,[[x,y],[x+34,y-5],[x+58,y+2],[x+50,y+7],[x+8,y+8]]);
    }
    if(key==='ravine'){
      c.globalAlpha=0.38;
      c.fillStyle='#050504';
      fillPixelPoly(c,[[38,CH],[82,244],[126,226],[108,CH]]);
      fillPixelPoly(c,[[414,CH],[378,244],[336,226],[352,CH]]);
      c.globalAlpha=0.22;
      c.fillStyle='#b9d68a';
      c.fillRect(94,238,54,2);c.fillRect(332,238,48,2);
    }
  }else if(key==='marble'){
    c.globalAlpha=0.30;
    c.fillStyle='#d8d0bd';
    for(let i=0;i<12;i++){
      const x=46+Math.round(hash2(i+2301,wf.x||0)*382);
      const y=66+Math.round(hash2(i+2303,wf.y||0)*190);
      c.fillRect(x,y,2,24+Math.round(hash2(i+2307,wf.x||0)*52));
      c.fillRect(x+2,y+8,18+Math.round(hash2(i+2311,wf.y||0)*36),1);
    }
    c.globalAlpha=0.22;
    c.fillStyle='#f5efd8';
    for(let i=0;i<5;i++){
      const x=84+i*78;
      fillPixelPoly(c,[[x,CH],[x+14,230],[x+34,230],[x+48,CH]]);
      c.fillStyle='#9f987f';
      c.fillRect(x+14,230,20,3);
      c.fillStyle='#f5efd8';
    }
  }else if(key==='water'){
    c.globalAlpha=0.28;
    c.fillStyle='#4aa5b8';
    for(let i=0;i<9;i++){
      const y=216+i*8+Math.round(Math.sin(t*0.04+i)*2);
      c.fillRect(72+i*10,y,126+Math.round(hash2(i+2401,wf.x||0)*188),1);
      if(i%2)c.fillRect(118+i*7,y+3,82,1);
    }
    c.globalAlpha=0.24;
    c.fillStyle='#baf8ff';
    for(let i=0;i<18;i++){
      const x=54+Math.round(hash2(i+2411,wf.x||0)*372);
      const y=70+Math.round(hash2(i+2417,wf.y||0)*156);
      const h=18+Math.round(hash2(i+2419,wf.x||0)*44);
      c.fillRect(x,y,1,h);
      const drop=(t+i*13)%(h+22);
      if(drop<h)c.fillRect(x-1,y+drop,2,2);
    }
  }else if(key==='chaos'){
    c.globalAlpha=0.34;
    c.fillStyle='#6b243e';
    for(let i=0;i<12;i++){
      const x=50+Math.round(hash2(i+2501,wf.x||0)*370),y=62+Math.round(hash2(i+2503,wf.y||0)*202);
      fillPixelPoly(c,[[x,y],[x+24,y+8],[x+12,y+15],[x+34,y+27],[x+4,y+20]]);
    }
    c.globalAlpha=0.26+0.06*Math.sin(t*0.08);
    c.fillStyle='#86d8ff';
    c.fillRect(166,86,58,2);c.fillRect(274,126,74,2);c.fillRect(112,226,86,2);
    c.fillStyle='#ff6a80';
    c.fillRect(228,178,60,2);c.fillRect(306,216,48,2);
  }else if(key==='master'){
    c.globalAlpha=0.24;
    c.fillStyle='#3b2a18';
    fillPixelPoly(c,[[50,CH],[78,214],[114,206],[112,CH]]);
    c.fillStyle='#d9d0ba';
    for(let i=0;i<4;i++){const x=142+i*60;c.fillRect(x,82+i*18,2,54);c.fillRect(x+4,92+i*18,38,1)}
    c.globalAlpha=0.22;
    c.fillStyle='#4aa5b8';
    for(let i=0;i<4;i++)c.fillRect(184+i*22,232+i*5,116-i*20,1);
    c.globalAlpha=0.30;
    c.fillStyle='#d8b65a';
    for(let i=0;i<5;i++){const x=118+i*58,y=136+(i%2)*22;c.fillRect(x,y,16,2);c.fillRect(x+7,y-6,2,14)}
  }
  c.restore();
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

function drawWaterfallCaveLemmingShadow(c,lx,ly,scale,alpha){
  const a=alpha==null?0.30:alpha;
  const w=Math.max(12,Math.round(12*scale));
  const h=Math.max(2,Math.round(1.6*scale));
  const y=Math.round(ly+1);
  c.save();
  c.fillStyle='#000000';
  c.globalAlpha=a*0.72;
  fillPixelPoly(c,[
    [lx-Math.round(w*0.44),y+h],
    [lx-Math.round(w*0.30),y],
    [lx+Math.round(w*0.30),y],
    [lx+Math.round(w*0.44),y+h],
    [lx+Math.round(w*0.32),y+h+1],
    [lx-Math.round(w*0.32),y+h+1]
  ]);
  c.globalAlpha=a*0.36;
  c.fillRect(lx-Math.round(w*0.22),y-1,Math.round(w*0.44),1);
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
      'Beta-testare:',
      'Micke och Calle',
      ''
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

function drawWaterfallCaveViewCardInspect(c,cave,tk,hit){
  const def=hit&&hit.def||{}, obj=hit&&hit.obj||{}, card=def.card||{};
  const img=typeof ASSETS==='object'&&ASSETS&&card.asset?ASSETS[card.asset]:null;
  const loaded=!!(img&&img.complete!==false&&(img.naturalWidth||img.width));
  const side=obj.cardSide||'front';
  const r=G.waterfallCaveViewCardRect?G.waterfallCaveViewCardRect(hit):{x:126,y:54,w:228,h:152};
  const x=r.x,y=r.y,w=r.w,h=r.h;
  c.save();
  c.globalAlpha=0.56;
  c.fillStyle='#000000';
  c.fillRect(0,0,CW,CH);
  c.globalAlpha=1;
  c.globalAlpha=0.28;
  c.fillStyle='#5aa8c2';
  c.fillRect(x+24,y+h+18,w-48,2);
  c.fillRect(x+48,y+h+27,w-96,1);
  c.globalAlpha=1;
  c.fillStyle='#05070a';
  fillPixelPoly(c,[[x-26,y+h+24],[x-12,y+h+8],[x+w+10,y+h+8],[x+w+26,y+h+24]]);
  c.fillStyle='#17110d';
  fillPixelPoly(c,[[x-18,y+h+18],[x-8,y+h+9],[x+w+8,y+h+9],[x+w+18,y+h+18]]);
  c.fillStyle='#120d0a';
  c.fillRect(x-6,y-6,w+12,h+12);
  c.fillStyle='#4a3120';
  c.fillRect(x-3,y-3,w+6,h+6);
  c.fillStyle='#1a1410';
  c.fillRect(x,y,w,h);
  if(side==='back'){
    c.fillStyle='#5b412d';
    c.fillRect(x+5,y+5,w-10,h-10);
    c.fillStyle='#eadbb4';
    c.fillRect(x+11,y+11,w-22,h-22);
    c.fillStyle='#fbefc9';
    c.fillRect(x+17,y+18,w-34,h-36);
    c.fillStyle='#a26a38';
    c.fillRect(x+25,y+34,w-50,2);
    c.fillRect(x+25,y+h-42,w-50,2);
    c.fillStyle='#24160e';
    c.font='18px sans-serif';
    c.textAlign='center';
    c.textBaseline='middle';
    const lines=card.backLines&&card.backLines.length?card.backLines:['Floda kyrka'];
    for(let i=0;i<lines.length;i++)c.fillText(lines[i],x+w/2,y+h/2+(i-(lines.length-1)/2)*24);
  }else if(loaded){
    c.imageSmoothingEnabled=false;
    c.drawImage(img,x+10,y+10,w-20,h-20);
    c.fillStyle='#e7d7ad';
    c.fillRect(x+10,y+10,w-20,3);
    c.fillRect(x+10,y+h-13,w-20,3);
    c.fillRect(x+10,y+10,3,h-20);
    c.fillRect(x+w-13,y+10,3,h-20);
  }else{
    drawTextC(c,'LADDAR BILD',x+w/2,y+h/2-6,1,'#f0c060');
  }
  c.globalAlpha=0.20;
  c.fillStyle='#8fd8ff';
  c.fillRect(x+w+8,y+18,2,h-30);
  c.globalAlpha=0.22;
  c.fillStyle='#000000';
  c.fillRect(0,0,CW,16);c.fillRect(0,CH-20,CW,20);c.fillRect(0,0,32,CH);c.fillRect(CW-32,0,32,CH);
  c.restore();
}

function waterfallCaveMapScreenNode(node){
  const cellW=54,cellH=30,originX=170,originY=54;
  const w=node.w||56,h=node.h||34;
  const cx=originX+(node.x||0)*cellW,cy=originY+(node.y||0)*cellH;
  return {x:Math.round(cx-w/2),y:Math.round(cy-h/2),w,h,cx:Math.round(cx),cy:Math.round(cy)};
}

function drawWaterfallCaveMapText(c,text,x,y,scale,col,align){
  const s=String(text==null?'':text),sc=scale||1;
  if(typeof drawText==='function'&&typeof textW==='function'){
    let tx=x;
    if(align==='center')tx=x-Math.round(textW(s,sc)/2);
    else if(align==='right')tx=x-textW(s,sc);
    drawText(c,s,Math.round(tx),Math.round(y),sc,col||'#22150c');
    return;
  }
  c.fillStyle=col||'#22150c';
  c.font=Math.max(8,sc*6)+'px sans-serif';
  c.textAlign=align||'left';
  c.textBaseline='top';
  c.fillText(s,x,y);
}

function drawWaterfallCaveMapCorridor(c,a,b,col){
  const mx=Math.round((a.cx+b.cx)/2),w=3;
  function rectLine(x1,y1,x2,y2,width,color){
    c.fillStyle=color;
    if(Math.abs(x2-x1)>=Math.abs(y2-y1)){
      const x=Math.min(x1,x2),ww=Math.max(width,Math.abs(x2-x1)+width);
      c.fillRect(x,Math.round(y1-width/2),ww,width);
    }else{
      const y=Math.min(y1,y2),hh=Math.max(width,Math.abs(y2-y1)+width);
      c.fillRect(Math.round(x1-width/2),y,width,hh);
    }
  }
  rectLine(a.cx,a.cy,mx,a.cy,w+4,'#3d2616');
  rectLine(mx,a.cy,mx,b.cy,w+4,'#3d2616');
  rectLine(mx,b.cy,b.cx,b.cy,w+4,'#3d2616');
  rectLine(a.cx,a.cy,mx,a.cy,w,col);
  rectLine(mx,a.cy,mx,b.cy,w,col);
  rectLine(mx,b.cy,b.cx,b.cy,w,col);
}

function drawWaterfallCaveMapOverlay(c,cave,tk){
  const graph=G.waterfallCaveMapGraph?G.waterfallCaveMapGraph():{nodes:[],links:[],kinds:{}};
  const visited=cave&&cave.visited||{};
  const nodesById={};
  for(const node of graph.nodes||[])nodesById[node.id]=node;
  c.save();
  c.globalAlpha=0.72;
  c.fillStyle='#000000';
  c.fillRect(0,0,CW,CH);
  c.globalAlpha=1;

  const x=18,y=18,w=444,h=264,legendX=316;
  c.fillStyle='#3a2414';c.fillRect(x,y,w,h);
  c.fillStyle='#7d4a24';c.fillRect(x+4,y+4,w-8,h-8);
  c.fillStyle='#d7ad5c';c.fillRect(x+8,y+8,w-16,h-16);
  c.fillStyle='#c89545';c.fillRect(x+12,y+12,w-24,h-24);
  c.fillStyle='#e0bd6d';c.fillRect(x+16,y+16,w-32,h-32);

  c.globalAlpha=0.10;
  c.fillStyle='#8b5a2d';
  for(let i=0;i<22;i++){
    const px=x+28+Math.round(hash2(i+1301,17)*(w-76));
    const py=y+30+Math.round(hash2(i+1307,31)*(h-68));
    c.fillRect(px,py,12+Math.round(hash2(i+1311,7)*34),1);
  }
  c.globalAlpha=1;
  c.fillStyle='#6f421f';c.fillRect(legendX-12,y+22,2,h-44);
  drawWaterfallCaveMapText(c,'GROTTKARTA',legendX,y+30,2,'#201107','left');
  c.fillStyle='#7d4a24';c.fillRect(legendX,y+48,112,2);

  const visibleIds={};
  for(const id in visited)if(visited[id]&&nodesById[id])visibleIds[id]=true;
  if(cave&&cave.scene&&nodesById[cave.scene])visibleIds[cave.scene]=true;
  const mapNodes={};
  for(const node of graph.nodes||[]){
    if(!visibleIds[node.id])continue;
    mapNodes[node.id]=waterfallCaveMapScreenNode(node);
  }

  for(const link of graph.links||[]){
    if(!visibleIds[link.from]||!visibleIds[link.to])continue;
    const a=mapNodes[link.from],b=mapNodes[link.to];
    if(a&&b)drawWaterfallCaveMapCorridor(c,a,b,'#8a6335');
  }

  for(const node of graph.nodes||[]){
    if(!visibleIds[node.id])continue;
    const r=mapNodes[node.id],kind=(graph.kinds&&graph.kinds[node.kind])||{color:'#8a7658',label:'Rum'};
    const current=cave&&cave.scene===node.id;
    c.fillStyle='#2d1a0d';c.fillRect(r.x-2,r.y-2,r.w+4,r.h+4);
    c.fillStyle=current?'#efd27a':kind.color;
    c.fillRect(r.x,r.y,r.w,r.h);
    c.globalAlpha=0.18;
    c.fillStyle='#fff0b8';
    c.fillRect(r.x+3,r.y+3,Math.max(3,r.w-6),2);
    c.globalAlpha=1;
    c.fillStyle='#3a2414';
    c.fillRect(r.x+3,r.y+r.h-5,r.w-6,2);
    drawWaterfallCaveMapText(c,node.short||node.id.slice(0,2).toUpperCase(),r.cx,r.y+Math.max(5,Math.floor(r.h/2)-5),2,'#201107','center');
  }

  const currentNode=nodesById[cave&&cave.scene];
  const currentRect=currentNode&&mapNodes[currentNode.id];
  if(currentNode&&currentRect){
    const b=waterfallCaveActiveBounds(cave);
    const px=currentRect.x+5+clamp(((cave.lemX||0)-(b.minX||0))/Math.max(1,(b.maxX||1)-(b.minX||0)),0,1)*(currentRect.w-10);
    const py=currentRect.y+5+clamp(((cave.lemY||0)-(b.minY||0))/Math.max(1,(b.maxY||1)-(b.minY||0)),0,1)*(currentRect.h-10);
    c.fillStyle='#2d1a0d';c.fillRect(Math.round(px)-4,Math.round(py)-4,8,8);
    c.fillStyle='#f8f8e8';c.fillRect(Math.round(px)-3,Math.round(py)-3,6,6);
    c.fillStyle='#2444cc';c.fillRect(Math.round(px)-1,Math.round(py)-1,2,2);
  }

  let ly=y+66;
  const usedKinds={};
  for(const id in visibleIds){
    const node=nodesById[id];
    if(node)usedKinds[node.kind]=true;
  }
  const kindOrder=['entrance','cave','fire','ember','crystal','water','archive','church'];
  for(const kind of kindOrder){
    if(!usedKinds[kind])continue;
    const info=(graph.kinds&&graph.kinds[kind])||{label:kind,color:'#8a7658'};
    c.fillStyle='#3a2414';c.fillRect(legendX,ly+1,12,12);
    c.fillStyle=info.color;c.fillRect(legendX+3,ly+4,6,6);
    drawWaterfallCaveMapText(c,info.label,legendX+18,ly+1,2,'#2b1a0d','left');
    ly+=17;
  }
  ly+=7;
  c.fillStyle='#f8f8e8';c.fillRect(legendX+3,ly+3,8,8);
  c.fillStyle='#2444cc';c.fillRect(legendX+5,ly+5,4,4);
  drawWaterfallCaveMapText(c,'Du',legendX+18,ly+1,2,'#2b1a0d','left');
  ly+=17;
  c.fillStyle='#8a6335';c.fillRect(legendX+1,ly+6,16,3);
  drawWaterfallCaveMapText(c,'Passage',legendX+22,ly+1,2,'#2b1a0d','left');
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
  drawWaterfallCaveVariantMotifs(c,cave,tk,'deep');
  const it=cave.deepItem||{x:246,y:252};
  const ix=Math.round(it.x),iy=Math.round(it.y);
  const itemScale=Number.isFinite(it.displayScale)?it.displayScale:0.5;
  c.globalAlpha=0.42;c.fillStyle='#000000';c.fillRect(ix-Math.round(20*itemScale),iy+4,Math.round(44*itemScale),3);c.globalAlpha=1;
  c.save();
  c.translate(ix,iy);
  c.rotate(-0.12);
  c.scale(itemScale,itemScale);
  c.fillStyle='#2b1710';c.fillRect(-15,-10,34,20);
  c.fillStyle='#9a5124';c.fillRect(-13,-8,30,16);
  c.fillStyle='#d0a052';c.fillRect(-12,-7,28,2);
  c.fillStyle='#202544';c.fillRect(-11,-4,26,11);
  c.fillStyle='#e8c070';c.fillRect(-9,-6,18,2);
  c.fillStyle='#c0d8ff';c.fillRect(7,-3,5,6);
  c.restore();
  const lx=Math.round(cave.lemX==null?240:cave.lemX),ly=Math.round(cave.lemY==null?210:cave.lemY);
  const lemScale=waterfallCaveLemmingScale(cave);
  drawWaterfallCaveLemmingShadow(c,lx,ly,lemScale,0.32);
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

function waterfallCaveTeleportStoneRenderState(cave){
  const st=cave&&cave.sceneState&&cave.sceneState.churchInterior&&cave.sceneState.churchInterior.teleportStone;
  if(st&&st.found&&!st.collected)return st;
  return null;
}

function drawWaterfallCaveTeleportStone(c,x,y,scale,tk,pulse){
  const p=clamp(Number.isFinite(pulse)?pulse:0,0,1);
  const flick=0.55+0.45*Math.sin(tk*0.12);
  c.save();
  c.translate(Math.round(x),Math.round(y));
  c.scale(scale||1,scale||1);
  c.globalCompositeOperation='lighter';
  c.globalAlpha=0.10+0.20*p+0.05*flick;
  c.fillStyle='#5ee8ff';
  fillPixelPoly(c,[[-18,12],[-10,-14],[8,-20],[20,-4],[15,16],[-8,22]]);
  c.globalAlpha=0.08+0.18*p+0.04*(1-flick);
  c.fillStyle='#ff4fd8';
  fillPixelPoly(c,[[-20,10],[-14,-8],[2,-22],[18,-8],[18,14],[-2,24]]);
  c.globalCompositeOperation='source-over';
  c.globalAlpha=0.45;
  c.fillStyle='#000000';
  fillPixelPoly(c,[[-20,18],[-8,13],[14,13],[24,18],[12,23],[-12,23]]);
  c.globalAlpha=1;
  c.fillStyle='#474a50';
  fillPixelPoly(c,[[-12,12],[-17,-2],[-9,-18],[8,-22],[18,-8],[16,10],[4,20],[-8,18]]);
  c.fillStyle='#6a6f78';
  fillPixelPoly(c,[[-8,10],[-12,-1],[-6,-14],[6,-18],[13,-6],[11,8],[2,15]]);
  c.fillStyle='#2d3036';
  fillPixelPoly(c,[[4,20],[16,10],[18,-8],[22,-3],[20,13],[10,22]]);
  c.globalCompositeOperation='lighter';
  c.globalAlpha=0.74+0.18*flick;
  c.fillStyle='#69f0ff';
  c.fillRect(-8,-5,2,13);
  c.fillRect(-8,-5,9,2);
  c.fillRect(4,-14,2,12);
  c.fillRect(4,-2,8,2);
  c.globalAlpha=0.62+0.16*(1-flick);
  c.fillStyle='#ff58d8';
  c.fillRect(-2,-17,2,9);
  c.fillRect(-2,-9,8,2);
  c.fillRect(8,2,2,9);
  c.fillRect(1,10,9,2);
  c.restore();
}

function drawWaterfallCaveChurchAltar(c){
  c.globalAlpha=0.34;
  c.fillStyle='#000000';
  fillPixelPoly(c,[[198,118],[214,111],[268,111],[284,118],[270,124],[210,124]]);
  c.globalAlpha=1;
  c.fillStyle='#5b4328';
  c.fillRect(204,110,72,8);
  c.fillStyle='#7b5a30';
  c.fillRect(210,92,60,24);
  c.fillStyle='#9a7a42';
  c.fillRect(214,96,52,3);
  c.fillStyle='#5d3f22';
  c.fillRect(210,114,60,3);
  c.fillStyle='#d8c58a';
  c.fillRect(214,88,52,4);
  c.fillStyle='#f6e8a8';
  c.fillRect(218,86,44,2);
  c.fillStyle='#f0d880';
  c.fillRect(237,70,5,20);
  c.fillRect(229,78,21,4);
  c.globalAlpha=0.34;
  c.fillStyle='#fff0a8';
  c.fillRect(235,68,9,24);
  c.fillRect(227,76,25,8);
  c.globalAlpha=1;
  c.fillStyle='#f3d47a';
  c.fillRect(219,83,2,7);
  c.fillRect(259,83,2,7);
  c.fillStyle='#ffe8a0';
  c.fillRect(218,81,4,2);
  c.fillRect(258,81,4,2);
}

function drawWaterfallCaveChurchAltarForeground(c){
  c.save();
  drawWaterfallCaveChurchAltar(c);
  c.restore();
}

function drawWaterfallCaveChurchPews(c){
  const rows=[
    {y:136,outerL:124,innerL:174,outerR:356,innerR:306,lift:8,depth:6},
    {y:164,outerL:108,innerL:172,outerR:372,innerR:308,lift:9,depth:7},
    {y:194,outerL:92,innerL:169,outerR:388,innerR:311,lift:10,depth:8},
    {y:226,outerL:76,innerL:166,outerR:404,innerR:314,lift:11,depth:9}
  ];
  function pointOn(a,b,t){
    return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  }
  function post(p,side,h){
    const lean=side<0?-3:3;
    c.fillStyle='#3a2819';
    fillPixelPoly(c,[[p[0]-2,p[1]+3],[p[0]+3,p[1]+3],[p[0]+3+lean,p[1]+h],[p[0]-2+lean,p[1]+h]]);
    c.fillStyle='#6e4b25';
    fillPixelPoly(c,[[p[0]-1,p[1]+4],[p[0]+1,p[1]+4],[p[0]+1+lean,p[1]+h-3],[p[0]-1+lean,p[1]+h-3]]);
  }
  function row(side,r){
    const left=side<0;
    const outer=[left?r.outerL:r.outerR,r.y+r.lift];
    const inner=[left?r.innerL:r.innerR,r.y];
    const lowerOuter=[outer[0]+(left?-9:9),outer[1]+r.depth+8];
    const lowerInner=[inner[0]+(left?5:-5),inner[1]+r.depth+4];
    const rearOuter=[outer[0]+(left?-4:4),outer[1]-4];
    const rearInner=[inner[0]+(left?-2:2),inner[1]-5];
    const hiOuter=[outer[0]+(left?12:-12),outer[1]+1];
    const hiInner=[inner[0]+(left?-8:8),inner[1]+1];

    c.globalAlpha=0.26;
    c.fillStyle='#050403';
    fillPixelPoly(c,[lowerOuter,lowerInner,[lowerInner[0]+(left?6:-6),lowerInner[1]+12],[lowerOuter[0]+(left?7:-7),lowerOuter[1]+11]]);
    c.globalAlpha=0.72;
    c.fillStyle='#2b1d13';
    fillPixelPoly(c,[rearOuter,rearInner,inner,outer]);
    c.globalAlpha=0.88;
    c.fillStyle='#5a3c21';
    fillPixelPoly(c,[outer,inner,lowerInner,lowerOuter]);
    c.fillStyle='#8a5b2b';
    fillPixelPoly(c,[hiOuter,hiInner,[hiInner[0],hiInner[1]+3],[hiOuter[0],hiOuter[1]+4]]);
    c.fillStyle='#b07a37';
    const glintOuter=[outer[0]+(left?18:-18),outer[1]+3];
    const glintInner=[inner[0]+(left?-16:16),inner[1]+3];
    fillPixelPoly(c,[glintOuter,glintInner,[glintInner[0],glintInner[1]+2],[glintOuter[0],glintOuter[1]+2]]);
    c.globalAlpha=0.44;
    const p1=pointOn(outer,inner,0.22), p2=pointOn(outer,inner,0.78);
    post(p1,side,18+r.depth);
    post(p2,side,14+r.depth);
    c.globalAlpha=1;
  }

  c.save();
  c.globalAlpha=0.36;
  c.fillStyle='#1d150f';
  fillPixelPoly(c,[[58,CH],[116,145],[174,124],[152,CH]]);
  fillPixelPoly(c,[[422,CH],[364,145],[306,124],[328,CH]]);
  c.globalAlpha=0.24;
  c.fillStyle='#d8c58a';
  fillPixelPoly(c,[[82,CH],[126,150],[150,142],[116,CH]]);
  fillPixelPoly(c,[[398,CH],[354,150],[330,142],[364,CH]]);
  c.globalAlpha=1;
  for(let i=0;i<rows.length;i++){
    row(-1,rows[i]);
    row(1,rows[i]);
  }
  c.restore();
}

function drawWaterfallCaveTeleportStoneMessage(c,cave,tk){
  const lines=cave&&cave.teleportStoneMessageT>0&&Array.isArray(cave.teleportStoneMessageLines)?cave.teleportStoneMessageLines:null;
  if(!lines||typeof drawTextC!=='function')return false;
  const life=clamp((cave.teleportStoneMessageT||0)/28,0,1);
  const x=72,y=28,w=336,h=38;
  c.save();
  c.globalAlpha=0.58+0.24*life;
  c.fillStyle='#020508';
  c.fillRect(x-6,y-6,w+12,h+12);
  c.globalAlpha=0.90;
  c.fillStyle='#101528';
  fillPixelPoly(c,[[x,y+4],[x+12,y],[x+w-12,y],[x+w,y+4],[x+w-10,y+h],[x+10,y+h]]);
  c.globalAlpha=0.30+0.16*Math.sin(tk*0.10);
  c.fillStyle='#5ee8ff';
  c.fillRect(x+12,y+h-7,w-24,2);
  c.globalAlpha=1;
  drawTextC(c,lines[0]||'',x+w/2,y+10,1,'#a8f7ff');
  drawTextC(c,lines[1]||'',x+w/2,y+23,1,'#ffb0f0');
  c.restore();
  return true;
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

function waterfallCaveAdventureStyle(scene,cave){
  const styles={
    emberPassage:{wall:'#140f0d',mid:'#211713',floor:'#172027',rim:'#362319',accent:'#ff9a3a',glow:'#d46b32'},
    crystalGallery:{wall:'#07121d',mid:'#11293a',floor:'#101b24',rim:'#24475b',accent:'#6fe8ff',glow:'#6aa8ff'},
    mirrorPool:{wall:'#071017',mid:'#102532',floor:'#111920',rim:'#26414c',accent:'#77d8f0',glow:'#78b8d0'},
    glyphArchive:{wall:'#100d0b',mid:'#221a15',floor:'#171718',rim:'#473325',accent:'#d5a55a',glow:'#ffce78'},
    church:{wall:'#080d12',mid:'#141d22',floor:'#161a1b',rim:'#35434a',accent:'#d8c58a',glow:'#d8ecff'}
  };
  const out=Object.assign({},styles[scene]||styles.emberPassage);
  if(scene!=='church'){
    const th=waterfallCaveVariantTheme(cave);
    if(th.key&&th.key!=='floda'){
      out.wall=th.wall;out.mid=th.mid;out.floor=th.floor;out.rim=th.rim;
      if(scene!=='emberPassage')out.accent=th.accent;
      if(scene!=='emberPassage')out.glow=th.glow;
    }
  }
  return out;
}

function drawWaterfallCaveEmberCampOpeningLight(c,cave,tk){
  const t=cave&&cave.t||0;
  const flicker=[0,1,0,2,1,0][Math.floor((tk+t)/11)%6];
  c.save();
  c.fillStyle='#020304';
  fillPixelPoly(c,[[452,178],[422,152],[396,180],[402,262],[444,276]]);
  c.globalAlpha=0.72;
  c.fillStyle='#1b0c08';
  fillPixelPoly(c,[[444,190],[425,174],[409,190],[413,244],[438,258],[449,236]]);
  c.globalCompositeOperation='lighter';
  c.globalAlpha=0.13+flicker*0.014;
  c.fillStyle='#f47a24';
  fillPixelPoly(c,[[442,200],[427,188],[416,200],[419,234],[438,244],[446,226]]);
  c.globalAlpha=0.08+flicker*0.008;
  c.fillStyle='#ff8a3a';
  fillPixelPoly(c,[[402,218],[446,208],[CW,212],[CW,224],[424,224],[374,220]]);
  c.globalAlpha=0.06+flicker*0.006;
  c.fillStyle='#ffb45a';
  fillPixelPoly(c,[[410,236],[CW,228],[CW,240],[430,248],[368,252],[392,240]]);
  c.globalAlpha=0.13;
  c.fillStyle='#ffd080';
  c.fillRect(414,212,28,2);
  c.fillRect(420,226,18,1);
  c.fillRect(388,220,34,1);
  c.restore();
}

function drawWaterfallCaveAdventureBase(c,cave,tk,style){
  const scene=cave.scene||'emberPassage', wf=cave.wf||{}, t=cave.t||0;
  const exits=G.waterfallCaveSceneExits?G.waterfallCaveSceneExits(cave):(typeof waterfallCaveSceneExits==='function'?waterfallCaveSceneExits(scene):[]);
  const hasUp=exits.some(e=>e&&e.key==='up'),hasDown=exits.some(e=>e&&e.key==='down');
  const hasLeft=exits.some(e=>e&&e.key==='left'),hasRight=exits.some(e=>e&&e.key==='right');
  c.fillStyle='#010204';
  c.fillRect(0,0,CW,CH);
  c.fillStyle=style.wall;
  fillPixelPoly(c,[[0,0],[CW,0],[CW,CH],[0,CH]]);
  c.fillStyle=style.mid;
  fillPixelPoly(c,[[52,CH],[84,118],[146,54],[238,30],[334,54],[400,122],[430,CH]]);
  c.fillStyle=style.floor;
  fillPixelPoly(c,[[34,CH],[128,210],[206,188],[282,190],[372,214],[446,CH]]);
  c.fillStyle=style.rim;
  c.globalAlpha=scene==='emberPassage'?0.27:0.46;
  fillPixelPoly(c,[[0,70],[74,86],[116,164],[54,CH],[0,CH]]);
  fillPixelPoly(c,[[CW,62],[404,88],[362,170],[428,CH],[CW,CH]]);
  c.globalAlpha=1;
  if(hasUp){
    c.fillStyle='#05070a';
    fillPixelPoly(c,[[152,68],[202,50],[276,50],[326,70],[304,112],[178,112]]);
    c.fillStyle=style.wall;
    fillPixelPoly(c,[[170,76],[214,62],[268,62],[310,76],[288,104],[192,104]]);
  }else{
    c.fillStyle='#101820';
    fillPixelPoly(c,[[154,72],[204,54],[276,54],[326,74],[298,98],[182,98]]);
    c.globalAlpha=0.24;
    c.fillStyle=style.rim;
    c.fillRect(188,86,104,2);
    c.globalAlpha=1;
  }
  if(hasDown){
    c.fillStyle='#030508';
    fillPixelPoly(c,[[170,CH],[204,266],[244,254],[286,266],[322,CH]]);
    c.globalAlpha=0.24;
    c.fillStyle=style.accent;
    c.fillRect(204,266,78,2);
    c.globalAlpha=1;
  }
  if(hasLeft){
    c.fillStyle='#020304';
    fillPixelPoly(c,[[28,178],[58,152],[84,180],[78,262],[36,276]]);
  }
  if(hasRight){
    c.fillStyle='#020304';
    fillPixelPoly(c,[[452,178],[422,152],[396,180],[402,262],[444,276]]);
  }
  c.fillStyle=style.rim;
  c.globalAlpha=scene==='emberPassage'?0.22:0.34;
  for(let i=0;i<36;i++){
    const x=42+Math.round(hash2(i+701,wf.x||0)*398);
    const y=66+Math.round(hash2(i+703,wf.y||0)*180);
    c.fillRect(x,y,14+Math.round(hash2(i+707,wf.x||0)*56),1+(i%5===0?2:0));
  }
  c.globalAlpha=1;
  c.fillStyle='#07090c';
  for(let i=0;i<12;i++){
    const x=72+Math.round(hash2(i+721,wf.x||0)*336);
    const h=10+Math.round(hash2(i+723,wf.y||0)*32);
    if(i&1)fillPixelPoly(c,[[x-5,54],[x+4,54],[x+2,54+h],[x-1,58+h]]);
    else fillPixelPoly(c,[[x-6,CH],[x-1,CH-h],[x+3,CH-h-4],[x+8,CH]]);
  }
  if(scene==='emberPassage'){
    drawWaterfallCaveEmberCampOpeningLight(c,cave,tk);
    c.fillStyle='#050302';
    fillPixelPoly(c,[[154,66],[202,42],[280,42],[330,68],[310,106],[184,108]]);
    c.fillStyle='#2a1710';
    fillPixelPoly(c,[[176,70],[216,54],[270,54],[306,73],[286,96],[198,98]]);
    c.fillStyle='#1a0f0b';
    fillPixelPoly(c,[[184,78],[212,66],[278,68],[300,82],[284,100],[198,100]]);
    c.fillStyle='#0b0705';
    fillPixelPoly(c,[[188,90],[206,78],[278,79],[294,90],[280,104],[200,104]]);
    c.globalAlpha=0.34;
    c.fillStyle='#6b381e';
    fillPixelPoly(c,[[178,72],[216,54],[206,66],[184,80]]);
    fillPixelPoly(c,[[270,54],[306,73],[286,82],[278,67]]);
    c.globalAlpha=1;
    c.fillStyle='#3b2417';
    c.fillRect(204,101,72,3);
    c.fillStyle='#5a2f19';
    const teeth=[[190,88,13],[207,84,18],[284,85,17],[300,88,12]];
    for(const q of teeth){
      const x=q[0],y=q[1],h=q[2];
      fillPixelPoly(c,[[x,y],[x+9,y],[x+5,y+h],[x+2,y+h-3]]);
    }
    c.globalAlpha=0.50;
    c.fillStyle='#1d2b18';
    const roots=[[181,82,16,-1],[194,86,13,1],[293,85,15,-1],[307,80,19,1]];
    for(const q of roots){
      const x=q[0],y=q[1],h=q[2],d=q[3];
      c.fillRect(x,y,2,Math.max(5,h-5));
      c.fillRect(x+d*3,y+Math.max(6,h-8),2,7);
      c.fillRect(x+d*5,y+h-2,1,5);
    }
    c.globalAlpha=0.22;
    c.fillStyle='#ff8a36';
    c.fillRect(206,101,68,1);
    c.globalAlpha=1;
  }
  if(scene==='mirrorPool'){
    c.globalAlpha=0.16;
    c.fillStyle='#79d8f0';
    fillPixelPoly(c,[[96,CH],[162,230],[260,214],[346,234],[398,CH]]);
    c.globalAlpha=1;
  }
  if(scene==='church'){
    c.globalAlpha=0.28;
    c.fillStyle='#d8ecff';
    fillPixelPoly(c,[[102,72],[202,48],[302,54],[392,92],[344,148],[138,142]]);
    c.globalAlpha=0.34;
    c.fillStyle='#2e3940';
    fillPixelPoly(c,[[62,CH],[130,214],[226,194],[328,208],[418,CH]]);
    c.globalAlpha=0.22;
    c.fillStyle='#d8c58a';
    c.fillRect(154,224,156,2);
    c.fillRect(178,236,118,1);
    c.globalAlpha=1;
  }
}

function drawWaterfallCaveTorchGlow(c,x,y,tk,obj){
  const pulse=(obj&&obj.pulseT||0)>0?1:0;
  const flicker=[0,1,0,2,1][Math.floor(tk/10)%5];
  c.save();
  c.globalCompositeOperation='lighter';
  c.globalAlpha=0.045+0.030*pulse+flicker*0.004;
  c.fillStyle='#ff7a2a';
  fillPixelPoly(c,[[x-30,y+4],[x-13,y-24],[x+14,y-24],[x+31,y+5],[x+18,y+34],[x-18,y+34]]);
  c.globalAlpha=0.09+0.035*pulse+flicker*0.005;
  c.fillStyle='#ffb45a';
  fillPixelPoly(c,[[x-18,y+2],[x-6,y-18],[x+8,y-18],[x+19,y+3],[x+11,y+23],[x-11,y+23]]);
  c.globalAlpha=0.13+0.035*pulse;
  c.fillStyle='#ffd080';
  c.fillRect(x-11,y+6,22,2);
  c.fillRect(x-7,y+17,14,1);
  c.restore();
}

function drawWaterfallCaveWallTorch(c,x,y,tk,obj){
  const f=(Math.floor(tk/9)%3)-1;
  c.save();
  drawWaterfallCaveTorchGlow(c,x,y,tk,obj);
  c.fillStyle='#5b3924';c.fillRect(x-3,y+5,6,25);
  c.fillStyle='#9a612e';c.fillRect(x-7,y+2,14,5);
  c.fillStyle='#b73518';c.fillRect(x-4+f,y-7,9,12);
  c.fillStyle='#f47a24';c.fillRect(x-2,y-13,6,14);
  c.fillStyle='#ffd36b';c.fillRect(x,y-9,3,9);
  c.restore();
}

function drawWaterfallCaveAmbientMotes(c,cave,tk,col,count,seed,alpha){
  const wf=cave.wf||{}, t=cave.t||0;
  c.save();
  c.fillStyle=col;
  for(let i=0;i<count;i++){
    const x=44+Math.round(hash2(seed+i*7,wf.x||0)*392);
    const baseY=70+Math.round(hash2(seed+i*11,wf.y||0)*176);
    const y=baseY+Math.round(Math.sin((tk+t+i*13)*0.035)*5);
    c.globalAlpha=(alpha||0.25)*(0.45+hash2(seed+i*17,wf.x||0)*0.55);
    c.fillRect(x,y,1+(i%7===0?1:0),1);
  }
  c.restore();
}

function drawWaterfallCaveAdventureDetails(c,cave,tk,style){
  const scene=cave.scene||'emberPassage', wf=cave.wf||{}, t=cave.t||0;
  if(scene==='emberPassage'){
    drawWaterfallCaveAmbientMotes(c,cave,tk,'#ffb45a',24,811,0.28);
    c.save();
    c.globalAlpha=0.28;
    c.fillStyle='#2b160f';
    for(let i=0;i<8;i++){
      const x=96+i*34+Math.round(hash2(i+821,wf.x||0)*10);
      const y=126+Math.round(hash2(i+823,wf.y||0)*86);
      c.fillRect(x,y,14+(i%3)*6,2);
      if(i%2===0)c.fillRect(x+4,y+3,8,1);
    }
    c.globalAlpha=0.32;
    c.fillStyle='#d46b32';
    for(let i=0;i<10;i++){
      const x=118+Math.round(hash2(i+827,wf.x||0)*248);
      const y=188+Math.round(hash2(i+829,wf.y||0)*76);
      c.fillRect(x,y,2,1);
      if((tk+t+i*9)%46<12)c.fillRect(x+1,y-1,1,1);
    }
    c.restore();
  }else if(scene==='crystalGallery'){
    drawWaterfallCaveAmbientMotes(c,cave,tk,'#9ff5ff',30,841,0.30);
    c.save();
    const clusters=[
      [104,188,0.70],[146,142,0.52],[350,178,0.66],[310,132,0.45],[92,246,0.42],[386,236,0.38]
    ];
    for(let i=0;i<clusters.length;i++){
      const q=clusters[i],x=q[0],y=q[1],s=q[2],shine=(Math.floor((tk+t+i*19)/28)%3)===0;
      c.globalAlpha=0.74;
      c.fillStyle=shine?'#c8ffff':'#4fb6d0';
      fillPixelPoly(c,[[x,y],[x+Math.round(10*s),y-Math.round(34*s)],[x+Math.round(20*s),y],[x+Math.round(10*s),y+Math.round(8*s)]]);
      c.fillStyle='#245b78';
      fillPixelPoly(c,[[x-Math.round(12*s),y+Math.round(4*s)],[x-Math.round(2*s),y-Math.round(22*s)],[x+Math.round(8*s),y+Math.round(6*s)]]);
      if(shine){c.globalAlpha=0.80;c.fillStyle='#ffffff';c.fillRect(x+Math.round(7*s),y-Math.round(20*s),2,8)}
    }
    c.globalAlpha=0.18;
    c.fillStyle='#6fe8ff';
    fillPixelPoly(c,[[128,CH],[188,226],[252,210],[342,238],[408,CH]]);
    c.restore();
  }else if(scene==='mirrorPool'){
    drawWaterfallCaveAmbientMotes(c,cave,tk,'#91d8e8',18,861,0.18);
    c.save();
    c.globalAlpha=0.36;
    c.fillStyle='#6fb8c8';
    for(let i=0;i<12;i++){
      const x=90+Math.round(hash2(i+867,wf.x||0)*300);
      const y=80+Math.round(hash2(i+869,wf.y||0)*110);
      const h=18+Math.round(hash2(i+871,wf.x||0)*36);
      c.fillRect(x,y,1,h);
      const drop=(tk+t+i*17)%(h+28);
      if(drop<h){c.fillStyle='#c8f8ff';c.fillRect(x-1,y+drop,2,2);c.fillStyle='#6fb8c8'}
    }
    c.globalAlpha=0.22;
    c.fillStyle='#b8f4ff';
    for(let i=0;i<7;i++){
      const x=150+i*28+Math.round(Math.sin((tk+t+i)*0.05)*4);
      c.fillRect(x,232+i%3*8,42-i*3,1);
    }
    c.restore();
  }else if(scene==='glyphArchive'){
    drawWaterfallCaveAmbientMotes(c,cave,tk,'#ffd080',20,881,0.22);
    c.save();
    c.globalAlpha=0.46;
    c.fillStyle='#080604';
    fillPixelPoly(c,[[72,92],[116,70],[170,86],[160,226],[78,242]]);
    fillPixelPoly(c,[[408,92],[364,70],[310,86],[320,226],[402,242]]);
    c.globalAlpha=0.70;
    c.fillStyle='#2b1c13';
    fillPixelPoly(c,[[92,126],[160,110],[154,232],[82,246]]);
    fillPixelPoly(c,[[388,126],[320,110],[326,232],[398,246]]);
    c.globalAlpha=1;
    for(let side=0;side<2;side++){
      const left=side===0, sx=left?92:324;
      for(let row=0;row<4;row++){
        const y=132+row*26;
        c.fillStyle='#4f3421';
        fillPixelPoly(c,left?[[sx,y],[sx+58,y-8],[sx+58,y-4],[sx,y+5]]:[[sx,y-8],[sx+58,y],[sx+58,y+5],[sx,y-4]]);
        c.fillStyle='#b9874c';
        for(let i=0;i<4;i++){
          const bx=sx+(left?8+i*12:8+i*12), by=y-7+(i%2);
          c.fillStyle=i%2?'#d0a060':'#8f6137';
          c.fillRect(bx,by,7,12);
        }
      }
    }
    c.globalAlpha=0.24;
    c.fillStyle='#ffd080';
    fillPixelPoly(c,[[210,68],[270,68],[292,134],[276,198],[204,198],[188,134]]);
    c.globalAlpha=0.38;
    c.fillStyle='#5f4630';
    c.fillRect(190,204,100,2);
    c.fillRect(204,218,72,2);
    c.globalAlpha=1;
    c.restore();
  }else if(scene==='church'){
    drawWaterfallCaveAmbientMotes(c,cave,tk,'#d8ecff',24,901,0.22);
    c.save();
    c.globalAlpha=0.32;
    c.fillStyle='#4a5559';
    for(let i=0;i<14;i++){
      const x=74+Math.round(hash2(i+907,wf.x||0)*330);
      const y=188+Math.round(hash2(i+911,wf.y||0)*78);
      c.fillRect(x,y,18+Math.round(hash2(i+913,wf.x||0)*36),2);
      if(i%3===0)c.fillRect(x+5,y+3,10,1);
    }
    c.globalAlpha=0.20;
    c.fillStyle='#d8c58a';
    for(let i=0;i<10;i++){
      const x=126+Math.round(hash2(i+917,wf.x||0)*230);
      const y=96+Math.round(hash2(i+919,wf.y||0)*94);
      c.fillRect(x,y,2,2);
      if((tk+t+i*7)%58<16)c.fillRect(x-1,y+2,4,1);
    }
    c.restore();
  }
}

function drawWaterfallCaveGroundCard(c,x,y,def,obj,style,near,pulse){
  const sc=Number.isFinite(def&&def.displayScale)?def.displayScale:1;
  const glow=near||pulse>0.15||!!(obj&&obj.cardOpen);
  c.save();
  c.translate(x,y);
  c.rotate(-0.12);
  c.scale(sc,sc);
  c.globalAlpha=0.36;
  c.fillStyle='#000000';
  fillPixelPoly(c,[[-28,8],[-14,2],[24,3],[32,9],[16,14],[-24,14]]);
  if(glow){
    c.globalAlpha=0.12+0.18*pulse;
    c.fillStyle=style.glow||'#d5a55a';
    fillPixelPoly(c,[[-38,9],[-20,-16],[28,-14],[42,8],[20,20],[-24,20]]);
  }
  c.globalAlpha=1;
  c.fillStyle='#3a2619';
  c.fillRect(-22,-13,44,26);
  c.fillStyle=near?'#eee0bd':'#cdbf9c';
  c.fillRect(-20,-11,40,22);
  c.fillStyle='#3275a8';
  c.fillRect(-18,-9,36,8);
  c.fillStyle='#e7dfc8';
  c.fillRect(-18,0,36,9);
  c.fillStyle='#7a4a2a';
  c.fillRect(-15,3,9,4);
  c.fillRect(-2,2,5,5);
  c.fillRect(9,3,5,4);
  c.fillStyle='#26451f';
  c.fillRect(-11,5,24,2);
  c.restore();
}

function drawWaterfallCaveThrowStonePile(c,x,y,obj,style,near,pulse){
  const lift=clamp((obj&&obj.pickedT||0)/24,0,1);
  c.save();
  c.globalAlpha=0.30;
  c.fillStyle='#000000';
  fillPixelPoly(c,[[x-30,y+8],[x-14,y+2],[x+18,y+2],[x+32,y+8],[x+18,y+13],[x-20,y+13]]);
  if(near||lift>0){
    c.globalAlpha=0.10+0.16*Math.max(pulse,lift);
    c.fillStyle=style.glow||'#baf8ff';
    fillPixelPoly(c,[[x-40,y+8],[x-24,y-12],[x+24,y-12],[x+42,y+8],[x+18,y+20],[x-24,y+20]]);
  }
  c.globalAlpha=1;
  const stones=[
    [-17,0,8,5,'#53616a'],[-8,-4,9,6,'#334149'],[4,-3,10,7,'#65747a'],
    [14,1,8,5,'#46545a'],[-2,3,8,5,'#758087'],[9,5,7,4,'#2d383e']
  ];
  for(let i=0;i<stones.length;i++){
    const s=stones[i],dy=lift&&i===2?-Math.round(5*lift):0;
    c.fillStyle='#171d20';
    fillPixelPoly(c,[[x+s[0]-2,y+s[1]+dy+4],[x+s[0]+s[2],y+s[1]+dy+4],[x+s[0]+s[2]+2,y+s[1]+dy+s[3]],[x+s[0]-1,y+s[1]+dy+s[3]+1]]);
    c.fillStyle=s[4];
    fillPixelPoly(c,[[x+s[0],y+s[1]+dy],[x+s[0]+s[2]-2,y+s[1]+dy-1],[x+s[0]+s[2],y+s[1]+dy+s[3]-2],[x+s[0]+2,y+s[1]+dy+s[3]]]);
    c.fillStyle='rgba(210,230,230,0.55)';
    c.fillRect(x+s[0]+2,y+s[1]+dy+1,Math.max(1,Math.floor(s[2]/2)),1);
  }
  c.restore();
}

function drawWaterfallCaveMirrorPoolSplash(c,x,y,obj,tk){
  const splashT=obj&&obj.splashT||0;
  if(!(splashT>0))return false;
  const life=clamp(splashT/22,0,1),p=1-life;
  const sx=Math.round(obj.splashX||x),sy=Math.round(obj.splashY||y);
  c.save();
  c.globalCompositeOperation='lighter';
  c.globalAlpha=0.72*life;
  c.fillStyle='#d8fbff';
  const spread=8+Math.round(p*26);
  for(let i=0;i<13;i++){
    const a=(i-6)/6;
    const px=sx+Math.round(a*spread);
    const py=sy-Math.round(Math.sin((1-Math.abs(a))*Math.PI*0.5)*(9+p*12))-Math.round((i%3)*p*2);
    c.fillRect(px,py,2,2);
    if(i%2===0)c.fillRect(px+(a<0?-2:2),py+3,2,1);
  }
  c.globalAlpha=0.54*life;
  c.fillStyle='#7ee8ff';
  fillPixelPoly(c,[[sx-spread,sy+2],[sx-Math.round(spread*0.52),sy-2],[sx+Math.round(spread*0.52),sy-2],[sx+spread,sy+2],[sx+Math.round(spread*0.55),sy+5],[sx-Math.round(spread*0.55),sy+5]]);
  c.globalAlpha=0.24*life;
  c.fillRect(sx-Math.round(spread*0.75),sy+8,Math.round(spread*1.5),1);
  c.restore();
  return true;
}

function waterfallCaveMirrorStoneProjectilePos(st){
  const rel=Number.isFinite(st&&st.releaseT)?st.releaseT:10;
  const dur=Math.max(1,(st&&st.dur||40)-rel);
  const raw=clamp(((st&&st.t||0)-rel)/dur,0,1);
  const p=raw;
  const x=(st.sx||0)+((st.tx||0)-(st.sx||0))*p;
  const baseY=(st.sy||0)+((st.ty||0)-(st.sy||0))*p;
  const arc=4*raw*(1-raw);
  const y=baseY-arc*(st.peak||28);
  return {x,y,p,raw};
}

function drawWaterfallCaveMirrorStoneProjectile(c,cave,tk){
  const st=cave&&cave.mirrorStoneThrow;
  if(!st||st.landed||st.t<st.releaseT)return false;
  const pos=waterfallCaveMirrorStoneProjectilePos(st);
  const x=Math.round(pos.x),y=Math.round(pos.y),p=pos.p,raw=pos.raw;
  c.save();
  c.globalAlpha=0.14+0.18*p;
  c.fillStyle='#000000';
  c.fillRect(Math.round((st.sx||x)+((st.tx||x)-(st.sx||x))*p)-5,Math.round((st.sy||y)+((st.ty||y)-(st.sy||y))*p)+3,10,2);
  c.globalAlpha=1;
  const s=Math.max(2,Math.round(5-raw*2));
  c.fillStyle='#11181c';
  c.fillRect(x-Math.ceil(s/2),y-Math.ceil(s/2)+1,s+1,s);
  c.fillStyle='#6c7a80';
  const roll=((st.t||0)>>2)&1;
  fillPixelPoly(c,[[x-2+roll,y-3],[x+3,y-2+roll],[x+4-roll,y+2],[x-1,y+4-roll],[x-4,y+1]]);
  c.fillStyle='#c8d4d4';
  c.fillRect(x-1,y-2,2,1);
  c.restore();
  return true;
}

function drawWaterfallCaveMirrorStoneCarry(c,cave,lx,ly,scale){
  if(!cave||cave.scene!=='mirrorPool')return false;
  const st=cave.mirrorStoneThrow;
  const holding=!!cave.mirrorStoneHeld;
  const preRelease=st&&st.active&&st.t<st.releaseT;
  if(!holding&&!preRelease)return false;
  const facing=(preRelease&&st&&st.facing)||cave.facing||'front';
  const rawP=preRelease?clamp((st.t||0)/Math.max(1,st.releaseT||4),0,1):0;
  const throwP=rawP*rawP*(3-2*rawP);
  c.save();
  c.translate(lx,ly);
  c.scale(scale,scale);
  function r(x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h)}
  const colors=typeof COL==='object'&&COL?COL:{skin:'#ffd9a8'};
  const skin=colors.skin||'#ffd9a8';
  if(facing==='left'||facing==='right'){
    const d=facing==='right'?1:-1;
    const lift=Math.sin(rawP*Math.PI*0.5);
    const shoulderX=d*2,shoulderY=-6;
    const elbowX=d*(3+2*throwP),elbowY=-8-3*lift;
    const handX=d*(4+3*throwP),handY=-8-3*lift-2*throwP;
    c.fillStyle=skin;
    fillPixelPoly(c,[[shoulderX,shoulderY],[shoulderX+d*2,shoulderY],[elbowX+d,elbowY+1],[elbowX,elbowY+3]]);
    fillPixelPoly(c,[[elbowX,elbowY],[elbowX+d*2,elbowY],[handX+d,handY+2],[handX,handY+3]]);
    r(handX,handY,2,2,skin);
    r(handX+d,handY-2,3,3,'#6c7a80');
    r(handX+d,handY-2,2,1,'#c8d4d4');
  }else{
    const side=facing==='back'?-1:1;
    const lift=Math.sin(rawP*Math.PI*0.5);
    const shoulderX=side*2,shoulderY=-6;
    const elbowX=side*(3+2*throwP),elbowY=-8-2*lift;
    const handX=side*(4+2*throwP),handY=-8-3*lift-3*throwP;
    c.fillStyle=skin;
    fillPixelPoly(c,[[shoulderX,shoulderY],[shoulderX+side*2,shoulderY],[elbowX+side,elbowY+1],[elbowX,elbowY+3]]);
    fillPixelPoly(c,[[elbowX,elbowY],[elbowX+side*2,elbowY],[handX+side,handY+2],[handX,handY+3]]);
    r(handX,handY,2,2,skin);
    r(handX-1,handY-3,4,3,'#6c7a80');
    r(handX,handY-3,2,1,'#c8d4d4');
  }
  c.restore();
  return true;
}

function waterfallCavePromptObject(cave){
  if(!cave||!G.waterfallCaveSceneObjects||!G.waterfallCaveObjectContains)return null;
  const lx=Number.isFinite(cave.lemX)?cave.lemX:240,ly=Number.isFinite(cave.lemY)?cave.lemY:220;
  let best=null,bestScore=Infinity;
  for(const hit of G.waterfallCaveSceneObjects(cave)){
    const def=hit&&hit.def||{},obj=hit&&hit.obj||{};
    const isCard=def.kind==='viewCard';
    const isCover=def.kind==='inspectable'&&def.id==='cover';
    const isChargeCrystal=def.kind==='crystal'&&(G.hasHolyTeleportStone&&G.hasHolyTeleportStone())&&!(G.holyTeleportStoneIsCharged&&G.holyTeleportStoneIsCharged());
    if(!isCard&&!isCover&&!isChargeCrystal)continue;
    if((isCard&&obj.cardOpen)||(isCover&&obj.coverOpen))continue;
    const scale=G.waterfallCaveObjectNearScale?G.waterfallCaveObjectNearScale(def):1.7;
    if(!G.waterfallCaveObjectContains(def,obj,lx,ly,scale))continue;
    const h=def.hit||{},rx=Math.max(1,(h.rx||((h.w||24)/2))*scale),ry=Math.max(1,(h.ry||((h.h||24)/2))*scale);
    const score=((lx-(obj.x||0))/rx)*((lx-(obj.x||0))/rx)+((ly-(obj.y||0))/ry)*((ly-(obj.y||0))/ry);
    if(score<bestScore){best=hit;bestScore=score}
  }
  return best;
}

function drawWaterfallCaveObjectPrompt(c,cave,tk){
  if(typeof drawTextC!=='function')return false;
  const hit=waterfallCavePromptObject(cave);
  if(!hit||!hit.obj)return false;
  const label=hit.def&&hit.def.kind==='crystal'?'MELLANSLAG: LADDA':'MELLANSLAG: TITTA';
  const x=clamp(Math.round(hit.obj.x||240),82,CW-82);
  const y=clamp(Math.round((hit.obj.y||220)-44),24,CH-42);
  const tw=typeof textW==='function'?textW(label,1):102;
  const w=Math.max(118,tw+18),h=18;
  const pulse=0.82+0.18*Math.sin((tk+(cave&&cave.t||0))*0.16);
  c.save();
  c.globalAlpha=0.82;
  c.fillStyle='#050607';
  c.fillRect(x-(w>>1)-2,y-2,w+4,h+4);
  c.globalAlpha=0.88;
  c.fillStyle='#1b1710';
  c.fillRect(x-(w>>1),y,w,h);
  c.globalAlpha=0.90*pulse;
  c.fillStyle='#4b3b1d';
  c.fillRect(x-(w>>1)+4,y+3,w-8,2);
  c.globalAlpha=1;
  drawTextC(c,label,x,y+6,1,'#f4d878');
  c.restore();
  return true;
}

function drawWaterfallCaveChurchModel(c,x,y,tk,obj,style,near,pulse){
  const active=!!(obj&&obj.activated);
  const light=active||near?1:clamp(pulse||0,0,1);
  c.save();
  c.globalAlpha=0.12+0.12*light;
  c.fillStyle='#d8ecff';
  fillPixelPoly(c,[[x-126,y+26],[x-82,y-124],[x-18,y-166],[x+98,y-104],[x+142,y+28],[x+72,y+50],[x-96,y+46]]);
  c.globalAlpha=0.40;
  c.fillStyle='#000000';
  fillPixelPoly(c,[[x-116,y+34],[x-78,y+18],[x+96,y+18],[x+138,y+34],[x+96,y+48],[x-96,y+48]]);
  c.globalAlpha=0.18;
  c.fillStyle='#d8ecff';
  fillPixelPoly(c,[[x-142,y+40],[x-90,y+24],[x+112,y+24],[x+154,y+39],[x+96,y+56],[x-102,y+56]]);
  c.globalAlpha=1;

  c.fillStyle='#2b3032';
  fillPixelPoly(c,[[x-112,y+20],[x-72,y+10],[x+102,y+12],[x+128,y+24],[x+96,y+34],[x-100,y+34]]);
  c.fillStyle='#404a50';
  fillPixelPoly(c,[[x-108,y+18],[x-72,y+12],[x+98,y+14],[x+120,y+22],[x+92,y+29],[x-98,y+29]]);
  c.fillStyle='#59646a';
  for(let i=0;i<16;i++){
    const sx=x-102+i*13;
    c.fillRect(sx,y+18+(i%2),8,2);
  }
  c.fillStyle='#1b2022';
  fillPixelPoly(c,[[x-108,y+32],[x-84,y+22],[x+100,y+23],[x+124,y+31],[x+96,y+38],[x-96,y+38]]);
  c.fillStyle='#728087';
  c.fillRect(x-98,y+21,26,2);
  c.fillRect(x+44,y+23,42,2);
  c.fillStyle='#8a969b';
  for(let i=0;i<9;i++)c.fillRect(x-86+i*18,y+30+(i%2),10,1);
  c.globalAlpha=0.18;
  c.fillStyle='#d8ecff';
  fillPixelPoly(c,[[x-124,y+18],[x-82,y+4],[x+88,y+6],[x+132,y+22],[x+96,y+30],[x-98,y+28]]);
  c.globalAlpha=1;

  c.fillStyle='#9b3f1d';
  fillPixelPoly(c,[[x-62,y-58],[x+16,y-80],[x+104,y-56],[x+88,y-43],[x-74,y-42]]);
  c.fillStyle='#6d2715';
  fillPixelPoly(c,[[x+104,y-56],[x+136,y-39],[x+124,y-28],[x+88,y-43]]);
  c.fillStyle='#c8642c';
  for(let i=0;i<10;i++)c.fillRect(x-54+i*14,y-55+Math.floor(i/3),10,3);
  c.fillStyle='#7f2d17';
  for(let i=0;i<7;i++)c.fillRect(x-48+i*20,y-47+Math.floor(i/2),14,2);
  c.fillStyle='#e0904c';
  c.fillRect(x-42,y-61,114,2);
  c.fillStyle='#f0a05a';
  c.fillRect(x-34,y-65,70,2);
  c.fillRect(x+40,y-63,32,2);
  c.fillStyle='#5a1d12';
  c.fillRect(x-69,y-43,160,4);
  c.fillStyle='#b95528';
  c.fillRect(x+92,y-47,30,3);

  c.fillStyle='#f0e5bc';
  fillPixelPoly(c,[[x-58,y-43],[x+88,y-43],[x+88,y+18],[x-58,y+18]]);
  c.fillStyle='#d6c58f';
  fillPixelPoly(c,[[x+88,y-43],[x+124,y-28],[x+124,y+16],[x+88,y+18]]);
  c.fillStyle='#fff3c8';
  fillPixelPoly(c,[[x-56,y-40],[x+22,y-40],[x+22,y+17],[x-56,y+17]]);
  c.fillStyle='#e7d9a6';
  c.fillRect(x+24,y-38,60,55);
  c.fillStyle='#c9b77f';
  c.fillRect(x+88,y-38,3,56);
  c.fillStyle='#b8a46d';
  c.fillRect(x-58,y-43,2,61);
  c.fillRect(x+22,y-40,3,58);
  c.fillRect(x+84,y-38,2,55);
  c.fillStyle='#f8edc4';
  c.fillRect(x-52,y-36,32,51);
  c.fillStyle='#fff6d2';
  c.fillRect(x-50,y-34,14,47);
  c.fillStyle='#e0cf9b';
  c.fillRect(x-22,y-38,2,55);
  c.fillRect(x+55,y-37,2,54);
  c.fillStyle='#b39d6b';
  c.fillRect(x-58,y-2,146,2);
  c.fillRect(x-58,y+17,146,3);
  c.fillStyle='#9c8758';
  c.fillRect(x-58,y-43,146,2);
  c.fillStyle='#88754f';
  c.fillRect(x-62,y+19,154,3);
  c.fillStyle='#5d5f58';
  fillPixelPoly(c,[[x-70,y+23],[x+92,y+23],[x+126,y+31],[x+102,y+38],[x-92,y+38],[x-116,y+31]]);
  c.fillStyle='#7a8278';
  for(let i=0;i<10;i++){
    const bx=x-98+i*20;
    c.fillRect(bx,y+27+(i%2),12,2);
  }
  c.fillStyle='#343a38';
  c.fillRect(x-100,y+36,196,3);

  c.fillStyle='#5f2415';
  fillPixelPoly(c,[[x-108,y-78],[x-72,y-88],[x-50,y-76],[x-58,y-65],[x-112,y-64]]);
  c.fillStyle='#8f351b';
  fillPixelPoly(c,[[x-106,y-77],[x-72,y-86],[x-54,y-76],[x-59,y-70],[x-110,y-68]]);
  c.fillStyle='#c65a28';
  c.fillRect(x-98,y-78,34,2);
  c.fillStyle='#e9ddb4';
  fillPixelPoly(c,[[x-106,y-64],[x-58,y-64],[x-58,y+18],[x-106,y+18]]);
  c.fillStyle='#cdbb88';
  fillPixelPoly(c,[[x-58,y-64],[x-42,y-54],[x-42,y+16],[x-58,y+18]]);
  c.fillStyle='#fff0c2';
  c.fillRect(x-103,y-60,42,42);
  c.fillStyle='#fff8d8';
  c.fillRect(x-100,y-57,18,37);
  c.fillStyle='#d8c997';
  c.fillRect(x-80,y-59,2,40);
  c.fillStyle='#d8c997';
  c.fillRect(x-60,y-54,3,70);
  c.fillStyle='#b49e70';
  c.fillRect(x-106,y-10,48,2);
  c.fillRect(x-106,y+17,48,3);
  c.fillStyle='#6f735f';
  for(let i=0;i<4;i++)c.fillRect(x-104+i*12,y+22+(i%2),8,2);

  c.fillStyle='#303033';
  fillPixelPoly(c,[[x-101,y-118],[x-62,y-118],[x-52,y-104],[x-58,y-78],[x-108,y-78],[x-112,y-104]]);
  c.fillStyle='#3a3838';
  c.fillRect(x-106,y-83,46,4);
  c.fillStyle='#4c4a42';
  fillPixelPoly(c,[[x-95,y-158],[x-82,y-184],[x-70,y-158],[x-62,y-118],[x-102,y-118]]);
  c.fillStyle='#252629';
  fillPixelPoly(c,[[x-82,y-184],[x-68,y-154],[x-58,y-118],[x-62,y-118],[x-70,y-158]]);
  c.fillStyle='#636158';
  c.fillRect(x-90,y-150,8,2);
  c.fillRect(x-88,y-138,12,2);
  c.fillRect(x-86,y-126,16,2);
  c.fillStyle='#d4a843';
  c.fillRect(x-84,y-190,4,10);
  c.fillRect(x-90,y-186,16,3);
  c.fillRect(x-83,y-198,2,8);
  c.fillStyle='#786f58';
  for(let i=0;i<5;i++){
    c.fillRect(x-95+i*7,y-110,4,24);
    c.fillRect(x-96+i*7,y-108,6,2);
  }
  c.fillStyle='#2b2826';
  for(let i=0;i<4;i++)c.fillRect(x-94+i*9,y-102,2,14);

  function arch(wx,wy,w,h,lit){
    c.fillStyle='#9fa8a8';
    fillPixelPoly(c,[[wx-2,wy+h+1],[wx-2,wy+7],[wx+Math.round(w/2),wy-3],[wx+w+2,wy+7],[wx+w+2,wy+h+1]]);
    c.fillStyle='#1a2026';
    fillPixelPoly(c,[[wx,wy+h],[wx,wy+7],[wx+Math.round(w/2),wy],[wx+w,wy+7],[wx+w,wy+h]]);
    c.fillStyle=lit?'#d8ecff':'#4a5960';
    c.fillRect(wx+3,wy+8,w-6,h-10);
    c.fillStyle='#20272d';
    c.fillRect(wx+Math.floor(w/2),wy+7,2,h-7);
    c.fillRect(wx+3,wy+Math.floor(h*0.55),w-6,2);
  }
  arch(x-28,y-24,16,31,light>0.2);
  arch(x+42,y-24,16,31,light>0.2);
  arch(x+100,y-12,12,22,light>0.2);
  c.fillStyle='#a48f64';
  c.fillRect(x-30,y+8,20,2);
  c.fillRect(x+40,y+8,20,2);
  c.fillRect(x+99,y+11,15,2);
  c.fillStyle='#6a351f';
  fillPixelPoly(c,[[x-1,y+16],[x-1,y-10],[x+12,y-19],[x+25,y-10],[x+25,y+16]]);
  c.fillStyle='#8a4a2a';
  fillPixelPoly(c,[[x+2,y+15],[x+2,y-8],[x+12,y-15],[x+22,y-8],[x+22,y+15]]);
  c.fillStyle='#3d2014';
  c.fillRect(x+5,y-8,14,24);
  c.fillStyle='#24130d';
  c.fillRect(x+11,y-14,2,30);
  c.fillStyle='#d1a45a';
  c.fillRect(x+17,y+3,2,2);
  c.fillStyle='#8d7350';
  c.fillRect(x+1,y+18,22,3);
  c.fillRect(x-2,y+21,28,2);
  c.fillStyle='#c7ad76';
  c.fillRect(x+3,y-11,18,2);
  c.fillStyle='#2d170f';
  c.fillRect(x+3,y+13,20,3);
  c.fillStyle='#4a514e';
  fillPixelPoly(c,[[x-8,y+23],[x+34,y+23],[x+46,y+30],[x-18,y+30]]);
  c.fillStyle='#748078';
  c.fillRect(x-2,y+24,30,2);

  c.globalAlpha=0.28+0.20*light;
  c.fillStyle='#d8ecff';
  fillPixelPoly(c,[[x-31,y+8],[x-31,y-17],[x-20,y-26],[x-9,y-17],[x-9,y+8]]);
  fillPixelPoly(c,[[x+39,y+8],[x+39,y-17],[x+50,y-26],[x+61,y-17],[x+61,y+8]]);
  c.globalAlpha=0.12+0.10*light;
  c.fillStyle='#fff6d2';
  c.fillRect(x-53,y-37,24,1);
  c.fillRect(x+28,y-39,48,1);
  c.fillRect(x-101,y-61,34,1);
  c.globalAlpha=1;
  c.restore();
}

function waterfallCaveChurchModelHit(cave){
  return ((G.waterfallCaveSceneObjects&&G.waterfallCaveSceneObjects(cave))||[]).find(hit=>hit.def&&hit.def.id==='churchModel');
}

function waterfallCaveChurchOccludesLemming(hit,lx,ly){
  const obj=hit&&hit.obj;
  if(!obj)return false;
  const x=obj.x||246,y=obj.y||238;
  if(ly>y+8)return false;
  if(lx<x-126||lx>x+138)return false;
  if(ly<y-80)return lx>x-118&&lx<x-48;
  if(ly<y-42)return lx>x-116&&lx<x+116;
  return lx>x-118&&lx<x+132;
}

function drawWaterfallCaveChurchLemmingOcclusion(c,cave,tk,style,lx,ly,lemScale){
  if(!cave||cave.scene!=='church')return false;
  const hit=waterfallCaveChurchModelHit(cave);
  if(!waterfallCaveChurchOccludesLemming(hit,lx,ly))return false;
  const obj=hit.obj||{},def=hit.def||{};
  const pulse=clamp((obj.pulseT||0)/72,0,1);
  const w=Math.ceil(20*lemScale),top=Math.ceil(42*lemScale),bottom=Math.ceil(14*lemScale);
  const x0=lx-w,y0=ly-top,x1=lx+w,y1=ly+bottom;
  c.save();
  c.beginPath();
  c.moveTo(x0,y0);c.lineTo(x1,y0);c.lineTo(x1,y1);c.lineTo(x0,y1);c.closePath();
  c.clip();
  drawWaterfallCaveChurchModel(c,Math.round(obj.x||246),Math.round(obj.y||238),tk,obj,style,!!obj.near,pulse);
  c.restore();
  return true;
}

function drawWaterfallCaveRuneWall(c,x,y,tk,active,pulse,def,obj){
  c.save();
  c.globalAlpha=0.34;
  c.fillStyle='#000000';
  fillPixelPoly(c,[[x-80,y+44],[x-60,y+28],[x+62,y+28],[x+84,y+44],[x+60,y+54],[x-62,y+54]]);
  c.globalAlpha=1;
  c.fillStyle='#21170f';
  fillPixelPoly(c,[[x-76,y+34],[x-68,y-40],[x-44,y-68],[x+44,y-68],[x+70,y-40],[x+78,y+34]]);
  c.fillStyle='#4a3524';
  fillPixelPoly(c,[[x-68,y+28],[x-60,y-34],[x-38,y-58],[x+38,y-58],[x+60,y-34],[x+68,y+28]]);
  c.fillStyle='#2b221b';
  fillPixelPoly(c,[[x-56,y+20],[x-50,y-28],[x-30,y-48],[x+30,y-48],[x+50,y-28],[x+56,y+20]]);
  c.fillStyle=active?'#f0c76a':'#8a6335';
  const runes=[
    [-30,-24,10,2],[-26,-31,2,16],[-16,-18,14,2],[-10,-31,2,22],
    [6,-30,2,23],[0,-21,13,2],[20,-27,2,19],[16,-13,14,2],
    [-34,1,17,2],[-26,-8,2,19],[-5,-4,2,18],[2,4,16,2],[25,-4,2,18],[18,8,16,2]
  ];
  for(const r of runes)c.fillRect(x+r[0],y+r[1],r[2],r[3]);
  const runeDefs=Array.isArray(def&&def.runes)?def.runes:[];
  const read=obj&&obj.readRunes||{};
  for(let i=0;i<runeDefs.length;i++){
    const r=runeDefs[i]||{},rx=x+(r.dx||0),ry=y+(r.dy||0);
    const selected=obj&&obj.activeRuneIndex===i&&obj.readT>0;
    const seen=!!read[r.id||('rune'+i)];
    if(!selected&&!seen)continue;
    c.globalAlpha=selected?0.32+0.18*Math.sin(tk*0.18):0.14;
    c.fillStyle=selected?'#ffd080':'#b88a48';
    fillPixelPoly(c,[[rx-14,ry+12],[rx-8,ry-14],[rx+10,ry-14],[rx+15,ry+12],[rx+8,ry+18],[rx-9,ry+18]]);
  }
  c.globalAlpha=1;
  c.globalAlpha=0.24+0.18*pulse;
  c.fillStyle=active?'#ffd080':'#5f4630';
  fillPixelPoly(c,[[x-58,y+22],[x-44,y-46],[x+42,y-46],[x+58,y+22],[x+28,y+34],[x-30,y+34]]);
  c.globalAlpha=1;
  c.restore();
}

function drawWaterfallCaveStoneGlyph(c,x,y,glyph,color,scale){
  const sc=Number.isFinite(scale)?scale:1,col=color||'#d99a54';
  function r(dx,dy,w,h,fill){c.fillStyle=fill||col;c.fillRect(Math.round(x+dx*sc),Math.round(y+dy*sc),Math.max(1,Math.round(w*sc)),Math.max(1,Math.round(h*sc)))}
  c.save();
  if(glyph==='root'){
    r(-10,3,20,2);r(-6,-6,3,11);r(-1,-4,3,9);r(5,-7,3,12);
    r(-14,7,8,2);r(6,7,10,2);r(-12,-2,6,2);r(8,-1,7,2);
  }else if(glyph==='vein'){
    r(-12,2,24,2);r(-8,-5,2,8);r(-2,-8,2,12);r(5,-5,2,9);
    r(-14,8,10,1);r(4,7,12,1);
  }else if(glyph==='rope'){
    r(-12,-2,24,2);r(-10,3,20,2);r(-8,-7,2,16);r(8,-7,2,16);
    r(-2,-5,4,4);r(-3,4,6,3);
  }else if(glyph==='waves'){
    r(-13,-5,9,2);r(-1,-5,9,2);r(9,-5,5,2);
    r(-10,1,10,2);r(3,1,10,2);
    r(-13,7,9,2);r(-1,7,9,2);r(9,7,5,2);
  }else if(glyph==='fracture'){
    r(-2,-10,3,8);r(1,-3,3,6);r(-5,2,4,8);
    r(-14,4,9,2);r(5,-5,11,2);r(5,8,8,2);
  }else if(glyph==='crown'){
    r(-12,5,24,3);r(-9,-5,3,10);r(-1,-9,3,14);r(8,-5,3,10);
    r(-11,2,6,2);r(5,2,7,2);
  }else{
    r(-2,-10,4,22);r(2,2,20,4);r(16,-2,4,12);r(-22,6,18,3);
  }
  c.restore();
}

function drawWaterfallCaveCrystalChargeEffect(c,cave,x,y,obj,tk){
  const charge=clamp((obj&&obj.chargeT||0)/96,0,1);
  if(charge<=0)return false;
  const p=1-charge;
  const pulse=0.55+0.45*Math.sin((tk+(cave&&cave.t||0))*0.22);
  const lx=Math.round(cave&&Number.isFinite(cave.lemX)?cave.lemX:240);
  const ly=Math.round(cave&&Number.isFinite(cave.lemY)?cave.lemY:220);
  const scale=typeof waterfallCaveLemmingScale==='function'?waterfallCaveLemmingScale(cave):2;
  const targetX=lx+Math.round(((cave&&cave.facing)==='left'?-7:7)*scale);
  const targetY=ly-Math.round(16*scale);
  c.save();
  c.globalCompositeOperation='lighter';
  c.globalAlpha=0.18+0.42*charge;
  c.fillStyle='#6ff0ff';
  fillPixelPoly(c,[[x-78,y+20],[x-38,y-48],[x+2,y-64],[x+42,y-42],[x+80,y+18],[x+36,y+42],[x-36,y+42]]);
  c.globalAlpha=0.16+0.34*charge;
  c.fillStyle='#ff55d8';
  fillPixelPoly(c,[[x-64,y+24],[x-18,y-58],[x+22,y-52],[x+66,y+20],[x+30,y+38],[x-28,y+40]]);
  for(let i=0;i<5;i++){
    const t=i/4;
    const bx=x+(targetX-x)*t+Math.sin(p*4.8+i*1.7)*6;
    const by=(y-34)+(targetY-(y-34))*t+Math.cos(p*4.2+i)*3;
    c.globalAlpha=(0.22+0.30*charge)*(1-Math.abs(t-0.55)*0.7);
    c.fillStyle=i%2?'#ff72e5':'#92f7ff';
    c.fillRect(Math.round(bx)-1,Math.round(by)-1,3,3);
    if(i>0){
      const q=(i-1)/4;
      const px=x+(targetX-x)*q+Math.sin(p*4.8+(i-1)*1.7)*6;
      const py=(y-34)+(targetY-(y-34))*q+Math.cos(p*4.2+(i-1))*3;
      pixelLine(c,Math.round(px),Math.round(py),Math.round(bx),Math.round(by),i%2?'#ff72e5':'#92f7ff');
    }
  }
  c.globalAlpha=0.72+0.20*pulse;
  drawWaterfallCaveTeleportStone(c,targetX,targetY,0.42+0.10*pulse,tk,1);
  c.globalCompositeOperation='source-over';
  c.globalAlpha=1;
  c.restore();
  return true;
}

function drawWaterfallCaveAdventureObjects(c,cave,tk,style){
  const objects=G.waterfallCaveSceneObjects?G.waterfallCaveSceneObjects(cave):[];
  for(const hit of objects){
    const def=hit.def||{}, obj=hit.obj||{}, kind=def.kind, x=Math.round(obj.x||0), y=Math.round(obj.y||0);
    const pulse=clamp((obj.pulseT||0)/72,0,1), active=!!obj.activated, near=!!obj.near;
    if(kind==='torch'){
      drawWaterfallCaveWallTorch(c,x,y,tk,obj);
    }else if(kind==='stone'){
      const off=obj.shifted?4:0;
      const ins=def.inscription||{}, glyph=ins.glyph||'bridge', markColor=ins.color||'#d99a54';
      if(active){
        c.globalAlpha=0.18+0.18*pulse;
        c.fillStyle=markColor;
        fillPixelPoly(c,[[x-34,y+10],[x-18,y-18],[x+18,y-16],[x+36,y+10],[x+16,y+22],[x-18,y+22]]);
        c.globalAlpha=1;
      }
      c.globalAlpha=0.36;c.fillStyle='#000';c.fillRect(x-22+off,y+5,44,5);c.globalAlpha=1;
      c.fillStyle='#242d32';fillPixelPoly(c,[[x-22+off,y+4],[x-10+off,y-10],[x+16+off,y-8],[x+24+off,y+4],[x+12+off,y+12],[x-16+off,y+12]]);
      c.fillStyle=near?'#52606a':'#3a454c';c.fillRect(x-10+off,y-4,22,4);
      c.globalAlpha=active?1:0.42;
      drawWaterfallCaveStoneGlyph(c,x+off,y-1,glyph,markColor,0.55);
      c.globalAlpha=1;
    }else if(kind==='crystal'){
      c.globalAlpha=0.18+0.30*pulse;
      c.fillStyle='#75eaff';fillPixelPoly(c,[[x-58,y+18],[x-34,y-30],[x+4,y-46],[x+46,y-18],[x+62,y+20]]);
      c.globalAlpha=1;
      const cols=active?['#a8f8ff','#6fe8ff','#326c94']:['#7aa6b8','#416b82','#20384a'];
      c.fillStyle=cols[2];fillPixelPoly(c,[[x-40,y+24],[x-24,y-24],[x-4,y+22]]);
      c.fillStyle=cols[1];fillPixelPoly(c,[[x-10,y+26],[x+6,y-52],[x+28,y+24]]);
      c.fillStyle=cols[0];fillPixelPoly(c,[[x+22,y+20],[x+42,y-22],[x+54,y+18]]);
      if(active){c.fillStyle='#e8ffff';c.fillRect(x+3,y-32,3,18);c.fillRect(x-26,y-10,2,15)}
      drawWaterfallCaveCrystalChargeEffect(c,cave,x,y,obj,tk);
    }else if(kind==='pool'){
      const rip=obj.rippleT||0;
      c.globalAlpha=0.42;c.fillStyle='#000';c.fillRect(x-86,y+18,172,8);c.globalAlpha=1;
      c.fillStyle='#06131a';fillPixelPoly(c,[[x-90,y+8],[x-62,y-14],[x+62,y-14],[x+92,y+8],[x+60,y+28],[x-58,y+28]]);
      c.fillStyle='#174252';fillPixelPoly(c,[[x-78,y+4],[x-52,y-10],[x+52,y-10],[x+78,y+4],[x+52,y+18],[x-52,y+18]]);
      c.globalAlpha=0.34+0.26*clamp(rip/96,0,1);
      c.fillStyle='#9eefff';
      for(let i=0;i<5;i++){
        const w=30+i*22+Math.round(Math.sin((tk+i)*0.08)*4);
        c.fillRect(x-Math.round(w/2),y-3+i*4,w,1);
      }
      c.globalAlpha=1;
      drawWaterfallCaveMirrorPoolSplash(c,x,y,obj,tk);
    }else if(kind==='throwStonePile'){
      drawWaterfallCaveThrowStonePile(c,x,y,obj,style,near,pulse);
    }else if(kind==='runeWall'){
      drawWaterfallCaveRuneWall(c,x,y,tk,active,pulse,def,obj);
    }else if(kind==='viewCard'){
      drawWaterfallCaveGroundCard(c,x,y,def,obj,style,near,pulse);
    }else if(kind==='churchModel'){
      drawWaterfallCaveChurchModel(c,x,y,tk,obj,style,near,pulse);
    }
  }
}

function drawWaterfallCaveStoneInspect(c,cave,tk){
  if(!cave||cave.scene!=='emberPassage')return false;
  const hit=((G.waterfallCaveSceneObjects&&G.waterfallCaveSceneObjects(cave))||[]).find(h=>h.def&&h.def.id==='looseStone');
  const def=hit&&hit.def||{},obj=hit&&hit.obj;
  if(!obj||(!obj.near&&!(obj.lastInteractT!=null&&(cave.t||0)-obj.lastInteractT<70)))return false;
  const ins=def.inscription||{},title=String(ins.title||'RISTAD STEN');
  const lines=Array.isArray(ins.lines)&&ins.lines.length?ins.lines:['Stenen bär ett gammalt tecken.'];
  const markColor=ins.color||'#d99a54',glyph=ins.glyph||'bridge';
  const x=156,y=24,w=168,h=86;
  c.save();
  c.globalAlpha=0.72;
  c.fillStyle='#030507';
  c.fillRect(x-8,y-8,w+16,h+16);
  c.globalAlpha=1;
  c.fillStyle='#1a1612';c.fillRect(x,y,w,h);
  c.fillStyle='#332820';c.fillRect(x+4,y+4,w-8,h-8);
  c.fillStyle='#12171a';c.fillRect(x+10,y+10,w-20,h-20);
  c.fillStyle='#2d373a';
  fillPixelPoly(c,[[x+42,y+56],[x+58,y+30],[x+102,y+26],[x+126,y+50],[x+112,y+70],[x+56,y+72]]);
  c.fillStyle='#536066';
  fillPixelPoly(c,[[x+52,y+52],[x+64,y+36],[x+96,y+34],[x+114,y+50],[x+102,y+62],[x+60,y+64]]);
  drawWaterfallCaveStoneGlyph(c,x+84,y+49,glyph,markColor,1.15);
  c.fillStyle='#ffcf74';
  c.fillRect(x+56,y+62,18,2);
  c.fillRect(x+98,y+62,22,2);
  c.globalAlpha=0.22;
  c.fillStyle=markColor;
  fillPixelPoly(c,[[x+34,y+66],[x+62,y+18],[x+114,y+18],[x+140,y+58],[x+112,y+82],[x+58,y+82]]);
  c.globalAlpha=1;
  if(typeof drawTextC==='function'){
    drawTextC(c,title,x+w/2,y+12,1,markColor);
    for(let i=0;i<Math.min(2,lines.length);i++)drawTextC(c,String(lines[i]).toUpperCase(),x+w/2,y+h-29+i*12,1,'#f1c275');
  }
  c.restore();
  return true;
}

function drawWaterfallCaveCrystalMessage(c,cave,tk){
  if(!cave||cave.scene!=='crystalGallery'||typeof drawTextC!=='function')return false;
  const hit=((G.waterfallCaveSceneObjects&&G.waterfallCaveSceneObjects(cave))||[]).find(h=>h.def&&h.def.id==='songCrystal');
  const obj=hit&&hit.obj;
  if(!obj||!(obj.hintT>0)||!Array.isArray(obj.hintLines)||!obj.hintLines.length)return false;
  const life=clamp((obj.hintT||0)/32,0,1);
  const x=78,y=26,w=324,h=38;
  c.save();
  c.globalAlpha=0.42+0.22*life;
  c.fillStyle='#02070a';
  c.fillRect(x-5,y-5,w+10,h+10);
  c.globalAlpha=0.84;
  c.fillStyle='#0b1724';
  fillPixelPoly(c,[[x,y+4],[x+12,y],[x+w-12,y],[x+w,y+4],[x+w-10,y+h],[x+10,y+h]]);
  c.globalAlpha=0.28+0.14*Math.sin(tk*0.12);
  c.fillStyle=(obj.chargeT>0)?'#ff72e5':'#7eefff';
  c.fillRect(x+12,y+h-7,w-24,2);
  c.globalAlpha=1;
  drawTextC(c,String(obj.hintLines[0]||''),x+w/2,y+10,1,'#bdf8ff');
  if(obj.hintLines[1])drawTextC(c,String(obj.hintLines[1]||''),x+w/2,y+23,1,'#f4d878');
  c.restore();
  return true;
}

function drawWaterfallCaveRuneReadPanel(c,cave,tk){
  if(!cave||cave.scene!=='glyphArchive')return false;
  const hit=((G.waterfallCaveSceneObjects&&G.waterfallCaveSceneObjects(cave))||[]).find(h=>h.def&&h.def.id==='runeWall');
  const obj=hit&&hit.obj,def=hit&&hit.def||{};
  if(!obj||!(obj.readT>0))return false;
  const lines=(Array.isArray(obj.readLines)&&obj.readLines.length?obj.readLines:def.readLines)||['Runorna viskar.'];
  const life=clamp((obj.readT||0)/22,0,1);
  const total=Array.isArray(def.runes)?def.runes.length:0;
  const readCount=obj.readRunes?Object.keys(obj.readRunes).length:0;
  const x=76,y=20,w=328,h=68;
  c.save();
  c.globalAlpha=0.54+0.28*life;
  c.fillStyle='#030507';
  c.fillRect(x-6,y-6,w+12,h+12);
  c.globalAlpha=0.88;
  c.fillStyle='#17110d';
  fillPixelPoly(c,[[x,y+4],[x+10,y],[x+w-10,y],[x+w,y+4],[x+w-8,y+h],[x+8,y+h]]);
  c.fillStyle='#2d2119';
  fillPixelPoly(c,[[x+6,y+8],[x+16,y+4],[x+w-16,y+4],[x+w-6,y+8],[x+w-12,y+h-6],[x+12,y+h-6]]);
  c.globalAlpha=0.14+0.12*Math.sin(tk*0.12);
  c.fillStyle='#ffcf74';
  fillPixelPoly(c,[[x+16,y+h-8],[x+42,y+10],[x+w-40,y+10],[x+w-18,y+h-8]]);
  c.globalAlpha=1;
  for(let i=0;i<Math.min(3,lines.length);i++){
    const col=i===0?'#ffd080':'#e8d0a0';
    if(typeof drawTextC==='function')drawTextC(c,lines[i],x+w/2,y+12+i*13,1,col);
  }
  if(total>0&&typeof drawTextC==='function'){
    const suffix=obj.readComplete?'HEL TEXT FUNNEN':'LÄSTA RUNOR '+readCount+'/'+total;
    drawTextC(c,suffix,x+w/2,y+h-13,1,obj.readComplete?'#fff0a8':'#a89068');
  }
  c.restore();
  return true;
}

function drawWaterfallCaveAdventureView(c,cave,tk){
  const style=waterfallCaveAdventureStyle(cave.scene,cave);
  c.save();
  drawWaterfallCaveAdventureBase(c,cave,tk,style);
  drawWaterfallCaveVariantMotifs(c,cave,tk,'adventure');
  drawWaterfallCaveAdventureDetails(c,cave,tk,style);
  drawWaterfallCaveAdventureObjects(c,cave,tk,style);
  const lx=Math.round(cave.lemX==null?240:cave.lemX),ly=Math.round(cave.lemY==null?210:cave.lemY);
  const lemScale=waterfallCaveLemmingScale(cave);
  drawWaterfallCaveLemmingShadow(c,lx,ly,lemScale,0.30);
  drawWaterfallCaveLemming(c,cave,lx,ly,lemScale);
  drawWaterfallCaveMirrorStoneCarry(c,cave,lx,ly,lemScale);
  drawWaterfallCaveMirrorStoneProjectile(c,cave,tk);
  drawWaterfallCaveChurchLemmingOcclusion(c,cave,tk,style,lx,ly,lemScale);
  if(cave.scene==='emberPassage'){
    drawWaterfallCaveLemmingFireLight(c,cave,lx,ly,lemScale,430);
    const torch=((G.waterfallCaveSceneObjects&&G.waterfallCaveSceneObjects(cave))||[]).find(hit=>hit.def&&hit.def.id==='wallTorch');
    if(torch&&torch.obj)drawWaterfallCaveLemmingFireLight(c,cave,lx,ly,lemScale,torch.obj.x||130);
  }
  drawWaterfallCaveStoneInspect(c,cave,tk);
  drawWaterfallCaveCrystalMessage(c,cave,tk);
  drawWaterfallCaveRuneReadPanel(c,cave,tk);
  drawWaterfallCaveObjectPrompt(c,cave,tk);
  c.globalAlpha=0.22;
  c.fillStyle='#000000';
  c.fillRect(0,0,CW,18);c.fillRect(0,CH-18,CW,18);c.fillRect(0,0,18,CH);c.fillRect(CW-18,0,18,CH);
  c.globalAlpha=1;
  const viewCard=G.waterfallCaveActiveViewCard?G.waterfallCaveActiveViewCard(cave):null;
  if(viewCard)drawWaterfallCaveViewCardInspect(c,cave,tk,viewCard);
  c.restore();
  return true;
}

function waterfallCaveChurchBlessingRenderState(cave){
  return cave&&cave.sceneState&&cave.sceneState.churchInterior&&cave.sceneState.churchInterior.priestBlessing||null;
}

function drawWaterfallCavePriest(c,st,tk){
  if(!st||!st.active)return false;
  const x=Math.round(st.priestX||0),y=Math.round(st.priestY||150);
  const walking=st.phase==='enter'||st.phase==='exit';
  const bless=st.phase==='raise'||st.phase==='bless';
  const handReach=st.phase==='raise'?clamp(st.t/18,0,1):(st.phase==='bless'?1:0);
  const step=walking?((st.t>>3)&1):0;
  const d=(Number.isFinite(st.priestFacing)?st.priestFacing:(st.phase==='exit'?-1:1))<0?-1:1;
  c.save();
  c.globalAlpha=0.26;
  c.fillStyle='#000000';
  fillPixelPoly(c,[[x-12,y+3],[x-6,y],[x+8,y],[x+14,y+3],[x+8,y+6],[x-8,y+6]]);
  c.globalAlpha=1;
  c.translate(x,y);
  c.scale(d*2.05,2.05);
  function p(x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h)}
  const sway=walking?(step?1:0):0;
  p(-5,-2,3,2,'#17100d');
  p(2+sway,-2,3,2,'#17100d');
  c.fillStyle='#15100e';
  fillPixelPoly(c,[[-6,-2],[-4,-14],[4,-14],[7,-2]]);
  c.fillStyle='#261b16';
  fillPixelPoly(c,[[-4,-13],[2,-13],[4,-2],[-5,-2]]);
  c.fillStyle='#0c0a09';
  fillPixelPoly(c,[[2,-13],[5,-12],[7,-2],[4,-2]]);
  p(-5,-10,2,7,'#1b1411');
  p(3,-10,2,7,'#100c0b');
  p(-3,-15,6,3,'#f4ead8');
  p(-1,-15,2,5,'#ffffff');
  p(-3,-21,6,6,'#efc89a');
  p(2,-19,2,2,'#f5d3ab');
  p(-4,-23,8,3,'#3a3028');
  p(-3,-24,6,1,'#5d5147');
  p(2,-19,1,1,'#1a1715');
  p(4,-13,2,5,'#211914');
  if(bless){
    const elbowX=5+Math.round(2*handReach);
    const elbowY=-8-Math.round(2*handReach);
    const handX=6+Math.round(4*handReach);
    const handY=-6-Math.round(3*handReach);
    c.fillStyle='#211914';
    fillPixelPoly(c,[[4,-11],[6,-11],[elbowX+1,elbowY],[elbowX,elbowY+2]]);
    fillPixelPoly(c,[[elbowX,elbowY],[elbowX+2,elbowY],[handX+1,handY+1],[handX,handY+2]]);
    p(handX,handY,2,2,'#efc89a');
    p(handX+1,handY+1,1,1,'#ffe8bd');
  }else{
    p(4,-11,2,5,'#211914');
    p(4,-6,2,1,'#efc89a');
  }
  p(-2,-12,1,10,'#d8c58a');
  if(bless)p(0,-8,1,1,'#d8c58a');
  c.restore();
  return true;
}

function drawWaterfallCaveBlessedLemmingOverlay(c,cave,lx,ly,scale,st,tk){
  if(!st||st.phase!=='bless')return false;
  const pulse=0.55+0.45*Math.sin((tk+st.t)*0.18);
  const hx=lx,hy=ly-Math.round(10*scale);
  const rx=Math.max(4,Math.round(5*scale)),ry=Math.max(3,Math.round(4*scale));
  c.save();
  c.globalCompositeOperation='lighter';
  c.globalAlpha=0.16+0.10*pulse;
  c.fillStyle='#fff3a0';
  fillPixelPoly(c,[
    [hx-rx*2,hy],
    [hx-rx,hy-ry*2],
    [hx+rx,hy-ry*2],
    [hx+rx*2,hy],
    [hx+rx,hy+ry],
    [hx-rx,hy+ry]
  ]);
  c.globalAlpha=0.52+0.18*pulse;
  c.fillStyle='#ffffff';
  c.fillRect(hx-rx,hy-Math.max(1,Math.round(2*scale)),rx*2,Math.max(1,Math.round(1.2*scale)));
  c.globalAlpha=0.22+0.08*pulse;
  c.fillStyle='#d8ecff';
  c.fillRect(hx-Math.round(2*scale),hy-ry*3,Math.max(1,Math.round(4*scale)),Math.max(1,Math.round(1*scale)));
  c.fillRect(hx-rx*3,hy-Math.round(1*scale),Math.max(1,Math.round(2*scale)),Math.max(1,Math.round(1*scale)));
  c.fillRect(hx+rx*3-Math.round(2*scale),hy-Math.round(1*scale),Math.max(1,Math.round(2*scale)),Math.max(1,Math.round(1*scale)));
  c.restore();
  c.save();
  c.translate(lx,ly);
  c.scale(scale,scale);
  c.fillStyle=(typeof COL==='object'&&COL&&COL.skin)||'#ffd9a8';
  c.fillRect(-2,-8,4,2);
  c.fillStyle='#102040';
  c.fillRect(-2,-7,1,1);
  c.fillRect(1,-7,1,1);
  c.restore();
  return true;
}

function drawWaterfallCaveChurchBlessingText(c,cave,st,tk){
  if(!cave)return false;
  const latin=st&&st.active&&(st.phase==='raise'||st.phase==='bless')?(st.latinText||'BENEDICAT TE DOMINUS'):null;
  const lines=cave.blessingMessageT>0&&Array.isArray(cave.blessingMessageLines)?cave.blessingMessageLines:null;
  if(!latin&&!lines)return false;
  c.save();
  if(latin&&typeof drawTextC==='function'){
    const x=Math.round((st.priestX||206)+70),y=Math.round((st.priestY||150)-62);
    c.globalAlpha=0.82;
    c.fillStyle='#050403';
    c.fillRect(x-86,y-9,172,22);
    c.strokeStyle='rgba(255,220,150,0.42)';
    c.strokeRect(x-85.5,y-8.5,171,21);
    c.globalAlpha=1;
    drawTextC(c,latin,x,y,1,'#f4dfb0');
  }
  if(lines&&typeof drawTextC==='function'){
    const life=clamp((cave.blessingMessageT||0)/28,0,1);
    const x=80,y=30,w=320,h=38;
    c.globalAlpha=0.62+0.22*life;
    c.fillStyle='#030507';
    c.fillRect(x-6,y-6,w+12,h+12);
    c.globalAlpha=0.88;
    c.fillStyle='#17120c';
    fillPixelPoly(c,[[x,y+3],[x+10,y],[x+w-10,y],[x+w,y+3],[x+w-8,y+h],[x+8,y+h]]);
    c.globalAlpha=1;
    drawTextC(c,lines[0]||'',x+w/2,y+9,1,'#ffe890');
    drawTextC(c,lines[1]||'',x+w/2,y+22,1,'#fff0b8');
  }
  c.restore();
  return true;
}

function drawWaterfallCaveChurchInteriorView(c,cave,tk){
  c.save();
  c.fillStyle='#030507';
  c.fillRect(0,0,CW,CH);
  c.fillStyle='#12100d';
  fillPixelPoly(c,[[0,0],[CW,0],[CW,CH],[0,CH]]);
  c.fillStyle='#252019';
  fillPixelPoly(c,[[58,CH],[118,92],[184,48],[296,48],[362,92],[422,CH]]);
  c.fillStyle='#191713';
  fillPixelPoly(c,[[114,CH],[160,136],[208,98],[272,98],[322,136],[366,CH]]);
  c.fillStyle='#2b261f';
  fillPixelPoly(c,[[74,CH],[132,116],[178,72],[188,94],[146,148],[112,CH]]);
  fillPixelPoly(c,[[406,CH],[348,116],[302,72],[292,94],[334,148],[368,CH]]);
  c.fillStyle='#3a3328';
  fillPixelPoly(c,[[108,CH],[150,144],[188,112],[196,130],[166,178],[140,CH]]);
  fillPixelPoly(c,[[372,CH],[330,144],[292,112],[284,130],[314,178],[340,CH]]);
  c.globalAlpha=0.18;
  c.fillStyle='#d8ecff';
  fillPixelPoly(c,[[204,52],[238,28],[276,52],[266,118],[214,118]]);
  c.globalAlpha=0.10;
  c.fillStyle='#f0d880';
  fillPixelPoly(c,[[232,58],[248,58],[278,CH],[202,CH]]);
  c.globalAlpha=1;
  c.fillStyle='#090806';
  fillPixelPoly(c,[[196,72],[208,48],[272,48],[284,72],[274,124],[206,124]]);
  c.fillStyle='#12100d';
  fillPixelPoly(c,[[207,120],[220,78],[260,78],[273,120],[260,136],[220,136]]);
  c.globalAlpha=0.34;
  c.fillStyle='#6f7e86';
  c.fillRect(226,84,8,32);
  c.fillRect(246,84,8,32);
  c.fillStyle='#d8ecff';
  c.fillRect(230,86,2,28);
  c.fillRect(250,86,2,28);
  c.globalAlpha=1;
  const teleportStone=waterfallCaveTeleportStoneRenderState(cave);
  if(teleportStone)drawWaterfallCaveTeleportStone(c,teleportStone.x||240,teleportStone.y||118,1.65,tk,clamp((teleportStone.pulseT||0)/120,0,1));
  drawWaterfallCaveChurchAltar(c);
  drawWaterfallCaveChurchPews(c);
  c.globalAlpha=0.36;
  c.fillStyle='#0b0704';
  fillPixelPoly(c,[[196,CH],[214,268],[240,256],[268,268],[288,CH]]);
  c.fillStyle='#d8c58a';
  c.fillRect(216,270,48,2);
  c.globalAlpha=0.46;
  c.fillStyle='#4d3a24';
  fillPixelPoly(c,[[178,CH],[218,214],[262,214],[302,CH]]);
  c.globalAlpha=0.26;
  c.fillStyle='#d8c58a';
  for(let i=0;i<5;i++){
    const yy=222+i*17;
    c.fillRect(222-i*7,yy,36+i*14,1);
  }
  c.globalAlpha=1;
  for(let i=0;i<16;i++){
    const x=84+Math.round(hash2(i+1501,7)*312);
    const y=70+Math.round(hash2(i+1507,11)*176);
    c.globalAlpha=0.10+hash2(i+1511,13)*0.14;
    c.fillStyle=i%3?'#d8ecff':'#d8c58a';
    c.fillRect(x,y,1+(i%5===0?1:0),1);
  }
  c.globalAlpha=1;
  const blessing=waterfallCaveChurchBlessingRenderState(cave);
  if(blessing&&blessing.active&&blessing.priestY<(cave.lemY||264))drawWaterfallCavePriest(c,blessing,tk);
  const lx=Math.round(cave.lemX==null?240:cave.lemX),ly=Math.round(cave.lemY==null?264:cave.lemY);
  const lemScale=waterfallCaveLemmingScale(cave);
  drawWaterfallCaveLemmingShadow(c,lx,ly,lemScale,0.30);
  drawWaterfallCaveLemming(c,cave,lx,ly,lemScale);
  drawWaterfallCaveBlessedLemmingOverlay(c,cave,lx,ly,lemScale,blessing,tk);
  if(blessing&&blessing.active&&blessing.priestY>=(cave.lemY||264))drawWaterfallCavePriest(c,blessing,tk);
  if(!(blessing&&blessing.active)&&ly<=140&&lx>=198&&lx<=282)drawWaterfallCaveChurchAltarForeground(c);
  drawWaterfallCaveChurchBlessingText(c,cave,blessing,tk);
  drawWaterfallCaveTeleportStoneMessage(c,cave,tk);
  c.restore();
  return true;
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
  c.fillStyle='#050608';
  fillPixelPoly(c,[[46,178],[66,154],[88,180],[84,260],[50,274]]);
  c.globalAlpha=0.22;
  c.fillStyle='#f08a3a';
  c.fillRect(80,198,2,48);
  c.globalAlpha=1;
  drawWaterfallCaveVariantMotifs(c,cave,tk,'camp');
  const fire=cave.campFire||{x:318,y:244};
  const fireX=Math.round(fire.x||318),fireY=Math.round(fire.y||244);
  drawWaterfallCaveCampfire(c,fireX,fireY,tk+t);
  const lx=Math.round(cave.lemX==null?240:cave.lemX),ly=Math.round(cave.lemY==null?210:cave.lemY);
  const lemScale=waterfallCaveLemmingScale(cave);
  drawWaterfallCaveLemmingShadow(c,lx,ly,lemScale,0.30);
  drawWaterfallCaveLemming(c,cave,lx,ly,lemScale);
  drawWaterfallCaveLemmingFireLight(c,cave,lx,ly,lemScale,fireX);
  c.restore();
  return true;
}

function drawWaterfallCaveView(c,tk){
  const cave=G.waterfallCave;
  if(!cave||!cave.active)return false;
  if(cave.mapOpen){
    let ok=false;
    cave.mapOpen=false;
    try{
      ok=drawWaterfallCaveView(c,tk);
    }finally{
      cave.mapOpen=true;
    }
    drawWaterfallCaveMapOverlay(c,cave,tk);
    return ok;
  }
  const renderKey=waterfallCaveRenderKey(cave);
  if(renderKey==='camp')return drawWaterfallCaveCampView(c,cave,tk);
  if(renderKey==='deep')return drawWaterfallCaveDeepView(c,cave,tk);
  if(renderKey==='churchInterior')return drawWaterfallCaveChurchInteriorView(c,cave,tk);
  if(['emberPassage','crystalGallery','mirrorPool','glyphArchive','church'].includes(renderKey))return drawWaterfallCaveAdventureView(c,cave,tk);
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
  drawWaterfallCaveVariantMotifs(c,cave,tk,'main');
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
  drawWaterfallCaveLemmingShadow(c,lx,ly,lemScale,0.30);
  drawWaterfallCaveLemming(c,cave,lx,ly,lemScale);
  drawTextC(c,'PENGAR '+Math.max(0,G.money|0),58,284,1,'#ffd866');
  c.restore();
  return true;
}
