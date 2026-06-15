// -------------------------- RENDERING -------------------------------
const COL={hair:'#6fb4ff',skin:'#ffd9a8',body:'#2244ee',leg:'#1a33bb',
  chute:'#ff5050',metal:'#b8b8c0'};

function drawLemming(c,l,sx,sy){
  const sc=Math.max(1,l&&l.scale||1);
  if(sc>1.01){
    c.save();
    c.translate(Math.round(sx),Math.round(sy));
    c.scale(sc,sc);
    drawLemmingCore(c,l,0,0);
    c.restore();
    return;
  }
  drawLemmingCore(c,l,sx,sy);
}

function drawLemmingCore(c,l,sx,sy){
  // sx,sy = fotpunkt på skärmen. Lemlarna är blå och handritade i kod.
  const d=l.dir,f=(l.anim>>1)&3;
  function p(x,y,col,w,h){c.fillStyle=col;c.fillRect(sx+x,sy+y,w||1,h||1)}
  if(l.state==='SPLAT'){
    c.globalAlpha=Math.max(0,1-l.busyT/18);
    p(-4,-1,COL.body,8,2);p(-3,-2,COL.hair,2,1);p(2,-2,COL.hair,2,1);
    c.globalAlpha=1;return;
  }
  if(l.state==='DROWN'){p(-2,-3,COL.hair,4,2);p(-1,-1,COL.skin,2,1);return}
  if(l.state==='BURN'){p(-2,-6,'#222',4,5);p(-2,-8,'#444',4,2);return}
  if(l.state==='SWIM'){
    const bob=(l.anim>>3)&1;
    p(-6,-5+bob,'#ff8a28',12,2);
    p(-7,-4+bob,'#ffe070',2,2);
    p(5,-4+bob,'#ff6a20',2,2);
    p(-5,-3+bob,'#ff8a28',10,2);
    p(-4,-4+bob,'#ffd060',2,1);
    p(2,-4+bob,'#ffd060',2,1);
    p(-2,-7+bob,COL.body,4,4);
    p(-1,-9+bob,COL.skin,2,2);
    p(-2,-11+bob,COL.hair,4,2);
    p(d>0?1:-2,-9+bob,'#102040',1,1);
    if(l.climber)p(d>0?3:-4,-8+bob,COL.skin,2,1);
    return;
  }
  if(l.state==='EXITING'){
    const k=Math.max(1,8-l.busyT/2);
    p(-2,-k,COL.body,4,k*0.6|0||1);p(-2,-k-2,COL.hair,4,2);
    return;
  }
  if(l.state==='FAINT'){
    const z=(l.anim>>4)&1;
    p(-5,-2,COL.leg,9,2);
    p(-4,-5,COL.body,8,3);
    p(3,-6,COL.skin,3,2);
    p(2,-8,COL.hair,4,2);
    p(-5,-1,'#102040',2,1);p(2,-1,'#102040',2,1);
    p(6,-11-z,'#d8f0ff',2,1);p(8,-13-z,'#d8f0ff',3,1);p(11,-15-z,'#d8f0ff',2,1);
    return;
  }
  if(l.state==='WARM'){
    const heat=(l.anim>>3)&1;
    p(-2,-1,COL.leg,1,2);p(1,-1,COL.leg,1,2);
    p(-2,-6,COL.body,4,5);
    p(-1,-8,COL.skin,2,2);
    p(-2,-10,COL.hair,4,2);
    p(d>0?1:-2,-8,'#102040',1,1);
    p(-5,-6+heat,COL.skin,3,1);p(3,-6+heat,COL.skin,3,1);
    p(-7,-11-heat,'#ffb040',1,2);p(6,-12+heat,'#ffe060',1,2);
    return;
  }
  if(l.state==='ROPE'){
    // Klättringsanimeringen är bunden till faktisk rörelse längs repet, inte bara
    // global frame-counter. Det gör att långsammare repklättring fortfarande ser aktiv ut.
    const rope=G.ropes&&G.ropes.find(r=>r.id===l.ropeId&&r.active);
    const ropeLen=rope?(rope.len||Math.max(1,Math.hypot(rope.x2-rope.x1,rope.y2-rope.y1))):48;
    const phase=(Math.floor(((l.ropeT||0)*ropeLen)/4)&3);
    const bob=(phase===1||phase===3)?-1:0;
    const armLead=(phase===0||phase===3)?-1:0;
    const armTrail=(phase===1||phase===2)?-1:0;
    const legLead=(phase===1||phase===2)?-1:0;
    const legTrail=(phase===0||phase===3)?-1:0;
    // Ben som växelvis söker fotfäste på repet.
    p(-2,-2+legLead,COL.leg,1,2);
    p(1,-2+legTrail,COL.leg,1,2);
    // Kropp och huvud.
    p(-2,-6+bob,COL.body,4,4);
    p(-1,-8+bob,COL.skin,2,2);
    p(-2,-10+bob,COL.hair,4,2);
    p(d>0?1:-2,-8+bob,'#102040',1,1);
    // Armarna greppar repet växelvis högt/lågt. Repet ritas bakom lemmeln,
    // så händerna placeras vid repets visuella linje runt y-8.
    p(d>0?2:-4,-8+armLead+bob,COL.skin,2,1);
    p(d>0?-4:2,-5+armTrail+bob,COL.skin,2,1);
    // Små händer/grepp-pixlar på repet för att klättringen ska läsas tydligare.
    p(d>0?3:-5,-7+armLead+bob,'#ffe8b8',1,1);
    p(d>0?-3:3,-4+armTrail+bob,'#ffe8b8',1,1);
    return;
  }
  const blockSway=l.state==='BLOCK'?((l.anim>>3)&1):0;
  // ben
  if(l.state==='WALK'||l.state==='MANUAL'||l.state==='BASH'||l.state==='BAZ'||l.state==='FLAME'||l.state==='SHRUG'){
    const lf=(l.state==='MANUAL'&&!l.manualMoving)?0:f;
    if(lf===0){p(-2,-2,COL.leg,2,2);p(1,-2,COL.leg,2,2)}
    else if(lf===1){p(-3,-1,COL.leg,2,1);p(-2,-2,COL.leg,2,1);p(1,-2,COL.leg,2,2)}
    else if(lf===2){p(-1,-2,COL.leg,2,2);p(0,-2,COL.leg,1,2)}
    else{p(-2,-2,COL.leg,2,2);p(2,-1,COL.leg,2,1);p(1,-2,COL.leg,2,1)}
  }else if(l.state==='FALL'||l.state==='JET'||l.state==='JUMP'){
    p(-2,-2,COL.leg,1,2);p(1,-2+( (l.anim>>1)&1),COL.leg,1,2);
  }else if(l.state==='CLIMB'){
    p(-1+d,-2,COL.leg,1,2);p(-1,-3+((l.anim>>1)&1),COL.leg,1,2);
  }else{p(-2,-2,COL.leg,2,2);p(1,-2,COL.leg,2,2)}
  // kropp
  p(-2,-6,COL.body,4,4);
  // huvud + hår
  p(-1+(d>0?0:-1)+1,-8,COL.skin,2,2);
  p(-2,-10,COL.hair,4,2);p(-2,-8,COL.hair,1,2);p(1,-8,COL.hair,1,2);
  // öga
  p(d>0?1:-2,-8,'#102040',1,1);
  // tillståndsdetaljer
  if(l.state==='BLOCK'){
    p(-4,-6+blockSway,COL.skin,2,1);p(2,-6+blockSway,COL.skin,2,1);
  }
  if(l.state==='SHRUG'){p(-4,-7,COL.skin,2,1);p(2,-7,COL.skin,2,1)}
  if(l.state==='BUILD'||l.state==='DBUILD'){
    const a=(l.anim>>1)&1;
    if(l.state==='BUILD'){
      p(d>0?2:-3,-5-a,COL.skin,2,1);
      if(a)p(d>0?3:-5,-4,terrainBrickColor(G.level,l.x,l.y),2,1);
    }else{
      // Nedbyggaren håller plankan lägre, så animationen skiljs tydligt från uppbyggaren.
      p(d>0?2:-3,-3+a,COL.skin,2,1);
      if(a)p(d>0?3:-5,-1,terrainBrickColor(G.level,l.x,l.y),2,1);
    }
  }
  if(l.state==='BASH'){
    const a=(l.anim>>1)&1;
    p(d>0?2:-4,-6+a,COL.skin,2+a,1);
  }
  if(l.state==='MINE'){
    const a=(l.anim>>1)&1;
    p(d>0?2:-4,-8+a*3,COL.metal,1,3-a);p(d>0?2:-3,-5,COL.skin,2,1);
  }
  if(l.state==='DIG'){
    const a=(l.anim>>1)&1;
    p(-3+a,-4,COL.skin,2,1);p(1+a,-4,COL.skin,2,1);
  }
  if(l.state==='CLIMB'){p(d>0?2:-3,-9,COL.skin,1,2)}
  if(l.state==='BAZ'){
    p(d>0?-1:-3,-9,COL.metal,4,2);
    if(l.busyT>5&&l.busyT<9)p(d>0?4:-6,-9,'#ffe060',2,2);
  }
  if(l.state==='FLAME'){
    p(d>0?1:-5,-8,COL.metal,5,2);
    p(d>0?5:-8,-8,'#ff8030',3,2);
    if((l.busyT&1)===0)p(d>0?8:-10,-9,'#ffd040',2,3);
  }
  if(l.state==='JET'){
    p(d>0?-4:2,-7,COL.metal,2,4);
  }
  if(l.state==='JUMP'){
    p(d>0?-4:3,-7,COL.skin,1,2);
    p(d>0?3:-4,-5,'#8fd8ff',1,1);
    p(d>0?4:-5,-7,'#8fd8ff',1,1);
  }
  if(l.chute){
    p(-4,-15,COL.chute,8,2);p(-3,-13,COL.chute,6,1);
    p(-3,-12,'#ffffff',1,1);p(2,-12,'#ffffff',1,1);
    p(0,-12,COL.chute,1,3);
  }
  if(l.climber&&l.state==='WALK'){p(-2,-11,'#ffffff',4,1)} // vit hjälmrand
  // direktstyrd lämmel: liten blå markering och eventuell handlampa.
  if(G.manual&&G.manual.active&&G.manual.lemId===l.id){
    p(-4,-13,'#80d8ff',8,1);
    p(-5,-12,'#204880',1,2);p(4,-12,'#204880',1,2);
    if(G.manual.lampOn){
      p(d>0?3:-5,-6,'#caa040',2,1);
      p(d>0?3:-5,-5,'#fff0a0',2,2);
      p(d>0?5:-7,-5,'#fff8c0',2,1);
    }
  }
  // lykta
  if(G.lamp&&G.lamp.holder===l.id){
    p(d>0?3:-5,-5,'#caa040',2,1);p(d>0?3:-5,-4,'#ffe890',2,2);
  }
  // bombnedräkning
  if(l.bombT>0){
    const s=Math.ceil(l.bombT/16);
    drawTextC(c,''+s,sx,sy-17,1,'#ffffff');
  }
}

function drawAmbientBug(c,b,cam,tk){
  const x=Math.round(b.x-cam), y=Math.round(b.y);
  if(x<-24||x>VW+24||y<0||y>VH)return;
  if(!G.T||!G.T.solid(b.x,b.y))return;
  c.save();
  if(b.t==='fossil'){
    c.globalAlpha=0.82;
    if(b.k==='shell'){
      const d=b.flip||1;
      c.fillStyle='#ead6aa';
      c.fillRect(x-5,y-2,10,3);c.fillRect(x-4,y-5,8,3);c.fillRect(x-2,y-7,5,2);
      c.fillRect(x-6,y-1,2,2);c.fillRect(x+4,y-1,2,2);c.fillRect(x-3,y+1,7,1);
      c.fillStyle='#7a6244';
      c.fillRect(x+d*1,y-4,1,4);c.fillRect(x-d*1,y-3,1,3);c.fillRect(x+d*3,y-2,1,2);
      c.fillStyle='#f4e5c4';
      c.fillRect(x-d*2,y-5,2,1);c.fillRect(x+d*2,y-6,1,1);
      c.fillStyle='#5f4b35';
      c.fillRect(x,y-3,1,1);c.fillRect(x+d,y-2,1,1);c.fillRect(x+d*2,y-1,1,1);
    }else{
      const d=b.flip||1;
      c.fillStyle='#ead6aa';
      c.fillRect(x-7,y-2,11,2);              // ryggrad
      c.fillRect(x+d*4,y-4,4,4);             // huvud
      c.fillRect(x-d*8,y-3,3,1);             // stjärt
      c.fillRect(x-d*9,y-1,3,1);
      c.fillStyle='#7a6244';
      for(let i=-5;i<=2;i+=2)c.fillRect(x+i*d,y-4,1,5);
      c.fillRect(x+d*5,y-3,1,1);
      c.fillStyle='#f4e5c4';
      c.fillRect(x-d*1,y-5,2,1);c.fillRect(x-d*2,y+1,2,1);
    }
  }else if(b.t==='worm'){
    const phase=b.p||0;
    const d=b.dir>=0?1:-1;
    c.globalAlpha=0.80;
    for(let i=0;i<7;i++){
      const wx=b.x-d*5+i*d*2;
      const wy=b.y+Math.sin(phase+i*0.85)*1.15;
      if(!G.T.solid(wx,wy))continue;
      const xx=Math.round(wx-cam), yy=Math.round(wy);
      c.fillStyle=i===6?'#e8b090':(b.col||'#d88a7a');
      c.fillRect(xx,yy,2,2);
      if(i>1&&i<5){
        c.fillStyle='rgba(80,40,24,0.45)';
        c.fillRect(xx,yy+1,1,1);
      }
    }
    c.fillStyle='#3a1a12';
    const hx=Math.round(b.x+d*7-cam), hy=Math.round(b.y+Math.sin(phase+5.6)*1.15);
    c.fillRect(hx,hy,1,1);
  }
  c.globalAlpha=1;
  c.restore();
}

function drawAmbientFish(c,z,cam,tk){
  if(!G.ambientFish||!G.ambientFish.length)return;
  c.save();
  for(const f of G.ambientFish){
    if(f.zone!==z)continue;
    const x=Math.round(f.x-cam), y=Math.round(f.y);
    if(x<-12||x>VW+12||y<z.y+3||y>VH)continue;
    const d=f.dir>=0?1:-1;
    const sc=f.size||1, tail=((tk+(f.p*10|0))>>2)&1;
    const body=f.col||'#ffd060';
    const shade=body==='#ffd060'?'#c88428':(body==='#ff9c70'?'#b85848':'#78a8d8');
    c.save();
    c.translate(x,y);c.scale(d,1);
    c.globalAlpha=0.78;
    c.fillStyle=shade;
    c.fillRect(-5*sc,(-1+tail)*sc,2*sc,2*sc);
    c.fillRect(-7*sc,-2*sc,2*sc,2*sc);
    c.fillRect(-7*sc,1*sc,2*sc,2*sc);
    c.fillStyle=body;
    c.fillRect(-4*sc,-2*sc,8*sc,4*sc);
    c.fillRect(-2*sc,-3*sc,5*sc,1*sc);
    c.fillRect(-2*sc,2*sc,5*sc,1*sc);
    c.fillRect(3*sc,-1*sc,2*sc,2*sc);
    c.fillStyle=shade;
    c.fillRect(-1*sc,-3*sc,2*sc,1*sc);
    c.fillRect(-1*sc,2*sc,2*sc,1*sc);
    c.fillStyle='#123050';
    c.fillRect(4*sc,-1*sc,1*sc,1*sc);
    c.restore();
    if(f.giftT>0){
      const k=(f.giftT>>2)&1;
      c.globalAlpha=0.82;
      c.fillStyle='#ffb040';
      c.fillRect(x-d*10,y-8-k,6,1);
      c.fillRect(x-d*10,y-5-k,6,1);
      c.fillRect(x-d*11,y-7-k,1,2);
      c.fillRect(x-d*5,y-7-k,1,2);
      c.fillStyle='#fff0a0';
      c.fillRect(x-d*9,y-7-k,4,1);
    }
    if(((tk+(f.p*17|0))%96)<18){
      c.globalAlpha=0.30;
      c.fillStyle='#d8f8ff';
      c.fillRect(x-d*7,y-5-((tk>>4)&1),1,1);
      if(f.size>1)c.fillRect(x-d*10,y-8-((tk>>5)&1),1,1);
    }
  }
  c.globalAlpha=1;
  c.restore();
}

function drawAmbientGrass(c,g,cam,tk){
  const x=Math.round(g.x-cam), y=Math.round(g.y);
  if(x<-16||x>VW+16||!G.T||!G.T.solid(g.x,g.y+1)||G.T.solid(g.x,g.y-2))return;
  const phase=tk*(g.s||0.02)+(g.p||0);
  const sway=Math.sin(phase)*1.25;
  const h=g.h||4,w=g.w||3;
  c.save();
  c.globalAlpha=0.88;
  c.fillStyle='#1f6f28';c.fillRect(x-1,y,Math.max(2,w),1);
  c.fillStyle=g.col||'#3aa33a';
  for(let i=0;i<w;i++){
    const ox=i-Math.floor(w/2);
    const bladeH=Math.max(2,h-(i%2));
    const bladeSway=Math.sin(phase+i*0.42)*1.15;
    const lean=Math.round((sway*0.55+bladeSway*0.45)*(0.35+i/(w+1)));
    c.fillRect(x+ox+lean,y-bladeH,1,bladeH);
  }
  c.fillStyle='#85d060';
  c.fillRect(x+Math.round(sway),y-h,1,1);
  c.globalAlpha=1;
  c.restore();
}

function drawRootSegment(c,x0,y0,x1,y1,col,w){
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));
  c.fillStyle=col;
  for(let i=0;i<=steps;i++){
    const t=i/steps;
    const x=Math.round(x0+(x1-x0)*t), y=Math.round(y0+(y1-y0)*t);
    c.fillRect(x-(w>1?1:0),y,w||1,w||1);
  }
}

function rootAnchorSupported(x,y){
  const T=(typeof G!=='undefined'&&G&&G.T)?G.T:null;
  if(!T)return true;
  x=Math.round(x);y=Math.round(y);
  for(let yy=y-2;yy<=y+2;yy++){
    if(yy<0||yy>=T.H)continue;
    for(let xx=x-3;xx<=x+3;xx++){
      if(xx>=0&&xx<T.W&&T.solid(xx,yy))return true;
    }
  }
  return false;
}

function drawDecor(c,dec,cam,tk){
  const x=dec.x-cam;
  const pad=120+(dec.w||0)+((dec.s||1)>1?70*(dec.s||1):0);
  if(x<-pad||x>VW+pad)return;
  switch(dec.t){
    case 'torch':{
      const px=Math.round(x),py=Math.round(dec.y);
      const fl=Math.sin(tk*0.34+dec.x)*1.2+Math.sin(tk*0.17+dec.x*0.5)*0.8;
      c.globalAlpha=0.10+0.04*Math.sin(tk*0.22+dec.x);
      c.fillStyle='#ff9c30';c.fillRect(px-8,py-18,16,16);
      c.globalAlpha=1;
      c.fillStyle='#3a2416';c.fillRect(px-2,py-8,4,8);
      c.fillStyle='#7a4a22';c.fillRect(px-1,py-9,2,9);
      const fy=Math.round(py-12+fl*0.35);
      c.fillStyle='#d84018';c.fillRect(px-3,fy,6,5);
      c.fillStyle='#ff8a20';c.fillRect(px-2,fy-2,4,6);
      c.fillStyle='#ffe060';c.fillRect(px-1,fy-1,2,3);
      if(((tk+(dec.x|0))&15)<5){
        c.fillStyle='#ffd060';c.fillRect(px+3,fy-4,1,1);
      }
      break}
    case 'tree':{
      const s=dec.s,h=70*s;
      const burning=!!dec.burning, burnP=burning?clamp((dec.burnT||0)/(dec.burnDur||60),0,1):0;
      const wind=Math.sin(tk*0.025+dec.x*0.07)*2.2*s+Math.sin(tk*0.011+dec.x*0.13)*1.2*s;
      const mid=wind*0.45, top=wind;
      c.fillStyle=burning?'#2b1b12':'#0c2a0c';
      c.beginPath();
      c.moveTo(x-3*s,dec.y);c.lineTo(x+3*s,dec.y);
      c.lineTo(x+3*s+mid,dec.y-h);c.lineTo(x-3*s+mid,dec.y-h);
      c.closePath();c.fill();
      c.fillStyle=burning?'#263018':'#0c2a0c';
      if(burnP<0.88){c.beginPath();c.arc(x+top,dec.y-h,26*s*(1-burnP*0.35),0,7);c.fill();}
      if(burnP<0.78){c.beginPath();c.arc(x-16*s+top*0.82,dec.y-h+14*s,18*s*(1-burnP*0.32),0,7);c.fill();}
      if(burnP<0.80){c.beginPath();c.arc(x+16*s+top*1.12,dec.y-h+12*s,20*s*(1-burnP*0.32),0,7);c.fill();}
      c.fillStyle=burning?'#1a1a12':'#123812';
      if(burnP<0.70){c.beginPath();c.arc(x-6*s+top,dec.y-h-6*s,12*s,0,7);c.fill();}
      if(burning){
        for(let i=0;i<5;i++){
          const fy=dec.y-h+10*s+hash2(i,tk&127)*h*0.55;
          const fx=x-14*s+hash2(i+11,tk&63)*28*s+top*0.6;
          c.fillStyle=((tk+i)&3)===0?'#ffe060':(((tk+i)&3)===1?'#ff9a20':'#d84018');
          c.fillRect(Math.round(fx),Math.round(fy-2),2,4+((tk+i)&2));
        }
      }
      break}
    case 'pyramid':{
      const s=dec.s||1,w=96*s,h=60*s,px=Math.round(x),py=Math.round(dec.y);
      c.globalAlpha=0.72;
      c.fillStyle='#9d6938';
      c.beginPath();c.moveTo(px-w/2,py);c.lineTo(px+w/2,py);c.lineTo(px,py-h);c.closePath();c.fill();
      c.fillStyle='#c38a4a';
      c.beginPath();c.moveTo(px-w/2,py);c.lineTo(px,py-h);c.lineTo(px-4*s,py);c.closePath();c.fill();
      c.fillStyle='rgba(70,42,26,0.36)';
      for(let i=0;i<9;i++){
        const yy=py-Math.round(h*(i+1)/10);
        const rowW=w*(1-(i+1)/10);
        c.fillRect(Math.round(px-rowW/2),yy,Math.max(2,Math.round(rowW)),1);
      }
      c.globalAlpha=1;
      break}
    case 'waterfall':{
      const w=dec.w||28,h=dec.h||130,px=Math.round(x),py=Math.round(dec.y);
      const left=px-Math.round(w/2), base=py+h;
      c.save();
      c.globalAlpha=0.24;
      c.fillStyle='#062438';c.fillRect(left-5,py-2,w+10,h+5);
      c.globalAlpha=0.34;
      c.fillStyle='#255f78';c.fillRect(left-3,py,w+6,h);
      for(let i=0;i<w;i+=3){
        const sx=left+i+Math.round(Math.sin(tk*0.10+i*0.7+dec.v*8)*2);
        const phase=(tk*2.45+i*11+(dec.v*40|0))%18;
        c.globalAlpha=0.34+0.16*hash2(i+17,dec.x|0);
        c.fillStyle=i%2?'#7fc8e8':'#b8efff';
        for(let yy=py+phase-18;yy<base;yy+=18){
          const sy=Math.max(py,Math.round(yy)), sh=Math.min(10,base-sy);
          if(sh>0)c.fillRect(sx,sy,2,sh);
        }
      }
      c.globalAlpha=0.30;
      c.fillStyle='#d8f8ff';
      for(let i=0;i<9;i++){
        const mx=left+Math.round(hash2(i+3,dec.x|0)*(w+10))-5;
        const my=base-3+Math.round(Math.sin(tk*0.14+i+dec.v*5)*3);
        c.fillRect(mx,my,2+(i%2),1);
      }
      c.globalAlpha=0.20;
      c.fillStyle='#8fd8ff';c.fillRect(left-2,base-1,w+4,2);
      c.restore();
      break}
    case 'cactus':{
      const s=dec.s||1,px=Math.round(x),py=Math.round(dec.y);
      const h=Math.round(24*s), sway=Math.round(Math.sin(tk*0.018+dec.v*7)*s);
      c.fillStyle='#0d4f35';
      c.fillRect(px-3+sway,py-h,6,h);
      c.fillRect(px-9+sway,py-h+8,4,10);c.fillRect(px-11+sway,py-h+6,6,4);
      c.fillRect(px+5+sway,py-h+12,4,9);c.fillRect(px+5+sway,py-h+10,7,4);
      c.fillStyle='#1f8a55';
      c.fillRect(px-1+sway,py-h+2,2,h-4);
      c.fillRect(px-8+sway,py-h+9,1,7);c.fillRect(px+7+sway,py-h+13,1,6);
      c.fillStyle='#f4d88a';
      if(dec.v<0.35)c.fillRect(px+5+sway,py-h+8,2,2);
      break}
    case 'rock':{
      const s=dec.s||1,px=Math.round(x),py=Math.round(dec.y);
      const key=G.level?terrainThemeKeyAt(G.level,dec.x,dec.y):'';
      const grey=key==='rock'||key==='cave'||key==='marble';
      c.fillStyle=grey?'#5f6972':'#876f55';c.fillRect(px-Math.round(8*s),py-Math.round(5*s),Math.round(16*s),Math.round(5*s));
      c.fillStyle=grey?'#87939e':'#a89070';c.fillRect(px-Math.round(5*s),py-Math.round(8*s),Math.round(9*s),Math.round(4*s));
      c.fillStyle=grey?'#37404a':'#5a4838';c.fillRect(px+Math.round(2*s),py-Math.round(4*s),Math.max(1,Math.round(4*s)),Math.max(1,Math.round(2*s)));
      c.fillStyle=grey?'#c5d0d8':'#d0bc98';c.fillRect(px-Math.round(4*s),py-Math.round(7*s),Math.max(1,Math.round(2*s)),1);
      break}
    case 'rail':{
      const w=dec.w||90,px=Math.round(x),py=Math.round(dec.y);
      c.fillStyle='#3e4650';c.fillRect(px,py-12,w,2);
      c.fillStyle='#6f7b86';c.fillRect(px,py-14,w,2);
      c.fillStyle='#2c333b';
      for(let i=4;i<w;i+=18)c.fillRect(px+i,py-13,3,13);
      c.fillStyle='#909ba6';
      for(let i=5;i<w;i+=18)c.fillRect(px+i,py-12,1,10);
      break}
    case 'cityscape':{
      const w=dec.w||180,h=dec.h||95,px=Math.round(x),py=Math.round(dec.y);
      c.globalAlpha=0.72;
      for(let i=0,xx=0;xx<w;i++){
        const bw=18+((i*13+(dec.v*31|0))%22), bh=34+((i*17+(dec.v*47|0))%Math.max(36,h));
        const bx=px+xx, by=py-bh;
        c.fillStyle=i%3===0?'#222936':(i%3===1?'#2f3440':'#1c2430');
        c.fillRect(bx,by,bw,bh);
        c.fillStyle=i%2?'#ffe08a':'#9ed8ff';
        for(let wy=by+8;wy<py-6;wy+=13)for(let wx=bx+4;wx<bx+bw-4;wx+=8){
          const keyX=Math.round(dec.x+xx+(wx-bx))+(dec.v*97|0), keyY=wy+i*23;
          const base=hash2(keyX,keyY);
          const fixed=base>0.40&&base<0.49;
          const phaseOffset=Math.floor(hash2(keyX+17,keyY+23)*340);
          const phase=Math.floor((tk+phaseOffset)/86);
          const live=base>0.14&&hash2(keyX+phase*29,keyY+phase*53)>0.24;
          if(fixed||live)c.fillRect(wx,wy,3,4);
        }
        xx+=bw+4;
      }
      c.globalAlpha=1;
      break}
    case 'subway':{
      const w=dec.w||170,px=Math.round(x),py=Math.round(dec.y);
      c.fillStyle='#1b1f28';c.fillRect(px-8,py-35,w+16,40);
      c.fillStyle='#343b46';c.fillRect(px,py-31,w,26);
      c.fillStyle='#687484';c.fillRect(px,py-27,w,4);
      c.fillStyle='#d8eef8';
      for(let i=8;i<w-12;i+=24)c.fillRect(px+i,py-23,14,9);
      c.fillStyle='#d6a020';c.fillRect(px+5,py-12,w-10,3);
      c.fillStyle='#0f1218';for(let i=18;i<w;i+=42){c.fillRect(px+i,py-6,10,4);c.fillRect(px+i+3,py-2,4,3)}
      c.fillStyle='#9aa4af';c.fillRect(px-12,py+2,w+24,3);
      break}
    case 'road':{
      const w=dec.w||220,px=Math.round(x),py=Math.round(dec.y);
      c.fillStyle='#222832';c.fillRect(px-44,py-3,w+88,13);
      c.fillStyle='#38404b';c.fillRect(px-44,py-3,w+88,2);
      c.fillStyle='#11151b';c.fillRect(px-44,py+8,w+88,2);
      c.fillStyle='#c8b858';
      for(let i=-24;i<w+60;i+=28)c.fillRect(px+i,py+2,13,1);
      break}
    case 'bus':{
      const px=Math.round(x),py=Math.round(dec.y),d=dec.dir>=0?1:-1;
      c.save();c.translate(px,py);c.scale(d,1);
      c.fillStyle='#b82828';c.fillRect(-34,-20,68,17);
      c.fillStyle='#dfc24a';c.fillRect(-30,-17,12,7);c.fillRect(-14,-17,12,7);c.fillRect(2,-17,12,7);c.fillRect(18,-17,10,7);
      c.fillStyle='#5b1c1c';c.fillRect(-34,-5,68,3);
      c.fillStyle='#111';c.fillRect(-24,-3,8,5);c.fillRect(19,-3,8,5);
      c.fillStyle='#ddd';c.fillRect(-22,-1,4,2);c.fillRect(21,-1,4,2);
      c.fillStyle='#ffe680';c.fillRect(30,-13,3,4);
      c.restore();
      break}
    case 'mummy':{
      const range=dec.w||120,spd=dec.speed||0.13,loop=range*2;
      const mt=dec.animT==null?tk:dec.animT;
      const t=(mt*spd+(dec.v||0)*loop)%loop;
      const forward=t<range;
      const wx=dec.x+(forward?t:loop-t);
      const px=Math.round(wx-cam),py=Math.round(dec.y),d=forward?1:-1;
      if(px<-30||px>VW+30)break;
      const gait=mt*0.20+dec.v*6;
      const arm=Math.round(Math.sin(gait)*2), leg=Math.sin(gait)>0?1:-1;
      c.save();c.translate(px,py);c.scale(d,1);
      c.globalAlpha=0.24;c.fillStyle='#4a321f';c.fillRect(-7,-1,14,2);c.globalAlpha=1;
      c.fillStyle='#9f835a';c.fillRect(-4,-18,8,6);c.fillRect(-4,-11,8,10);
      c.fillStyle='#d8c89c';
      c.fillRect(-3,-20,6,2);c.fillRect(-4,-18,8,5);c.fillRect(-3,-13,6,2);
      c.fillRect(-3,-11,7,10);c.fillRect(-4,-9,8,6);
      c.fillStyle='#efe2b8';
      c.fillRect(-3,-18,6,1);c.fillRect(-4,-15,7,1);c.fillRect(-3,-11,6,1);
      c.fillRect(-4,-8,8,1);c.fillRect(-3,-5,7,1);c.fillRect(-4,-2,6,1);
      c.fillStyle='#8b704d';
      c.fillRect(-4,-16,8,1);c.fillRect(-2,-12,6,1);c.fillRect(-3,-7,7,1);c.fillRect(-4,-4,5,1);
      c.fillStyle='#111018';c.fillRect(1,-16,2,2);
      c.fillStyle='#c8b482';
      c.fillRect(-7,-10+arm,3,2);c.fillRect(-8,-8+arm,2,3);
      c.fillRect(5,-10-arm,3,2);c.fillRect(7,-8-arm,2,3);
      c.fillStyle='#efe2b8';c.fillRect(-8,-9+arm,3,1);c.fillRect(6,-9-arm,3,1);
      c.fillStyle='#b79d70';
      c.fillRect(-4,-1,3,3);c.fillRect(1,-1,3,3);
      c.fillStyle='#d8c89c';
      c.fillRect(leg>0?-5:-3,1,4,2);c.fillRect(leg>0?1:0,1,4,2);
      c.fillStyle='#efe2b8';c.fillRect(-4,0,2,1);c.fillRect(2,0,2,1);
      c.restore();
      break}
    case 'taxi':{
      const range=dec.w||220,spd=dec.speed||0.55,d=dec.dir>=0?1:-1;
      const loop=range+76;
      const off=((tk*spd+(dec.v||0)*range)%loop)-38;
      const wx=d>0?dec.x+off:dec.x+range-off;
      const px=Math.round(wx-cam),py=Math.round(dec.y);
      if(px<-60||px>VW+60)break;
      c.save();c.translate(px,py);c.scale(d,1);
      c.fillStyle='#f0c020';c.fillRect(-18,-12,36,10);
      c.fillStyle='#ffdc38';c.fillRect(-10,-17,18,6);
      c.fillStyle='#203040';c.fillRect(-7,-16,6,4);c.fillRect(1,-16,6,4);
      c.fillStyle='#111';c.fillRect(-14,-4,6,4);c.fillRect(10,-4,6,4);
      c.fillStyle='#ececec';c.fillRect(-12,-3,2,2);c.fillRect(12,-3,2,2);
      c.fillStyle='#1b1b1b';c.fillRect(-1,-20,7,2);
      c.fillStyle='#ffe680';c.fillRect(17,-10,2,3);
      c.restore();
      break}
    case 'streetlamp':{
      const px=Math.round(x),py=Math.round(dec.y);
      c.fillStyle='#333843';c.fillRect(px-1,py-26,2,26);c.fillRect(px-1,py-27,12,2);
      c.fillStyle='#20242c';c.fillRect(px+9,py-29,5,5);
      c.fillStyle='#ffe68a';c.fillRect(px+10,py-28,3,3);
      c.globalAlpha=0.16+0.04*Math.sin(tk*0.04+dec.v*7);
      c.fillStyle='#ffe68a';c.fillRect(px+4,py-24,16,12);
      c.globalAlpha=1;
      break}
    case 'sign':{
      const px=Math.round(x),py=Math.round(dec.y);
      c.fillStyle='#4a4f58';c.fillRect(px-1,py-18,2,18);
      c.fillStyle='#1f5aa8';c.fillRect(px-16,py-30,32,14);
      c.fillStyle='#d8efff';c.fillRect(px-14,py-28,28,1);c.fillRect(px-14,py-18,28,1);
      drawTextC(c,dec.text||'',px,py-26,1,'#ffffff');
      break}
    case 'marker':{
      const px=Math.round(x),py=Math.round(dec.y);
      c.fillStyle='#7b6042';c.fillRect(px-12,py-15,24,15);
      c.fillStyle='#b08a5a';c.fillRect(px-10,py-18,20,3);
      c.fillStyle='#5a412d';c.fillRect(px-10,py-3,20,3);
      c.fillStyle='#d0b078';c.fillRect(px-8,py-13,16,1);
      drawTextC(c,dec.text||'',px,py-11,1,'#f0d098');
      break}
    case 'bush':{
      c.fillStyle='#1c6a1c';
      c.fillRect(x-4,dec.y-3,9,3);c.fillRect(x-2,dec.y-5,5,2);
      c.fillStyle='#2f8f2f';c.fillRect(x-1,dec.y-4,2,1);
      break}
    case 'mush':{
      if(dec.eaten)break;
      c.fillStyle='#e8e0d0';c.fillRect(x-1,dec.y-4,2,4);
      c.fillStyle=dec.v<0.5?'#d03030':'#d08030';c.fillRect(x-3,dec.y-6,7,2);
      c.fillRect(x-2,dec.y-7,5,1);
      c.fillStyle='#fff';c.fillRect(x-1,dec.y-6,1,1);c.fillRect(x+2,dec.y-6,1,1);
      break}
    case 'root':{
      const px=Math.round(x),py=Math.round(dec.y),w=dec.w||120,h=dec.h||38;
      const count=Math.max(4,Math.min(9,Math.round(w/22)));
      c.save();
      c.globalAlpha=0.82;
      for(let i=0;i<count;i++){
        const seed=(dec.x|0)*0.017+(dec.y|0)*0.031+i*1.71+(dec.v||0)*8;
        const sx=Math.round(px-w/2+(i+0.5)*w/count+(hash2(i+dec.x,dec.y)-0.5)*10);
        if(!rootAnchorSupported(sx+cam,py))continue;
        const len=h*(0.48+hash2(i+7,dec.x)*0.54);
        const lean=(hash2(i+13,dec.y)-0.5)*h*0.55;
        let lx=sx,ly=py;
        const segs=4+Math.floor(hash2(i+21,dec.x)*3);
        const thick=i%3===0?2:1;
        for(let s=1;s<=segs;s++){
          const p=s/segs;
          const nx=Math.round(sx+lean*p+Math.sin(seed+p*5.2)*4.5);
          const ny=Math.round(py+len*p);
          drawRootSegment(c,lx,ly,nx,ny,i%2?'#4a2d18':'#5b361c',thick);
          if(s===2||s===3){
            const bd=hash2(i*11+s,dec.x)>0.5?1:-1;
            const bx=Math.round(nx+bd*(7+hash2(s,i)*13));
            const by=Math.round(ny+5+hash2(i,s)*12);
            drawRootSegment(c,nx,ny,bx,by,'#3a2314',1);
          }
          lx=nx;ly=ny;
        }
        c.fillStyle='#7b4d28';
        c.fillRect(sx-1,py,2,2);
      }
      c.globalAlpha=1;
      c.restore();
      break}
    case 'target':{
      const px=Math.round(x),py=Math.round(dec.y);
      c.fillStyle='#3a2a1d';c.fillRect(px-8,py-8,16,16);
      c.fillStyle='#f0e8d8';c.fillRect(px-6,py-6,12,12);
      c.fillStyle='#c93030';c.fillRect(px-5,py-5,10,10);
      c.fillStyle='#f0e8d8';c.fillRect(px-3,py-3,6,6);
      c.fillStyle='#c93030';c.fillRect(px-1,py-1,3,3);
      c.fillStyle='#fff8e8';c.fillRect(px-6,py-6,2,1);
      break}
    case 'crystal':{
      const h=8+dec.v*8;
      c.fillStyle='#9fe0ff';
      c.beginPath();c.moveTo(x,dec.y-h);c.lineTo(x+3,dec.y);c.lineTo(x-3,dec.y);c.fill();
      c.fillStyle='#e8feff';c.fillRect(x,dec.y-h+2,1,h-4);
      break}
    case 'stal':{
      const h=dec.h||18, up=dec.up!==false;
      const key=G.level?terrainThemeKeyAt(G.level,dec.x,dec.y):'';
      const icy=key==='crystal'||key==='glass';
      c.fillStyle=icy?'#7fd6ef':'#565d66';
      c.beginPath();
      if(up){c.moveTo(x-5,dec.y);c.lineTo(x+5,dec.y);c.lineTo(x,dec.y-h);}
      else{c.moveTo(x-5,dec.y);c.lineTo(x+5,dec.y);c.lineTo(x,dec.y+h);}
      c.closePath();c.fill();
      c.fillStyle=icy?'#d8fbff':'#8e98a4';
      if(up)c.fillRect(Math.round(x-1),Math.round(dec.y-h+4),2,Math.max(2,h-5));
      else c.fillRect(Math.round(x-1),Math.round(dec.y+2),2,Math.max(2,h-5));
      c.fillStyle=icy?'#4ca3c8':'#343941';
      if(up)c.fillRect(Math.round(x+2),Math.round(dec.y-h/2),1,Math.max(2,h/2|0));
      else c.fillRect(Math.round(x+2),Math.round(dec.y+2),1,Math.max(2,h/2|0));
      break}
    case 'chain':{
      c.fillStyle='#555';
      for(let yy=dec.y;yy<dec.y+46;yy+=4)c.fillRect(x,yy+((yy>>2)&1),1,3);
      c.fillStyle='#702020';c.fillRect(x-3,dec.y+46,7,6);
      c.fillStyle='#ffd040';c.fillRect(x-1,dec.y+48,3,2);
      break}
  }
}

function drawCaveDrips(c,drips,cam,tk){
  if(!drips||!drips.length)return;
  c.save();
  for(const d of drips){
    const x=Math.round(d.x-cam);
    if(x<-12||x>VW+12)continue;
    c.globalAlpha=0.42+0.20*Math.sin(tk*0.08+d.p);
    c.fillStyle='#b8d8ee';
    c.fillRect(x,Math.round(d.ceiling),1,2);
    if(d.falling){
      c.globalAlpha=0.86;
      c.fillStyle='#cfefff';
      c.fillRect(x,Math.round(d.y)-2,1,3);
      c.globalAlpha=0.22;
      c.fillRect(x,Math.round(d.y)-7,1,4);
    }
    if(d.splashT>0){
      const p=1-d.splashT/9, y=Math.round(d.ground);
      c.globalAlpha=0.62*(1-p);
      c.fillStyle='#d8f4ff';
      c.fillRect(x-2-Math.round(p*3),y,2,1);
      c.fillRect(x+1+Math.round(p*3),y,2,1);
      c.fillRect(x,y-1-Math.round(p*2),1,1);
    }
  }
  c.globalAlpha=1;
  c.restore();
}

function drawHatch(c,x,y,t){
  c.fillStyle='#444';c.fillRect(x-9,y-6,18,5);
  c.fillStyle='#666';c.fillRect(x-9,y-6,18,1);
  c.fillStyle='#222';c.fillRect(x-7,y-1,14,1);
  const open=clamp(t/20,0,1);
  c.fillStyle='#555';
  c.fillRect(x-7,y-1,7*(1-open)|0||1,2);
  c.fillRect(x+7-(7*(1-open)|0||1),y-1,7*(1-open)|0||1,2);
}
function drawExit(c,x,y,tk){
  c.fillStyle='#3a2410';c.fillRect(x-9,y-20,3,20);c.fillRect(x+6,y-20,3,20);
  c.fillStyle='#553818';c.fillRect(x-10,y-23,20,4);
  c.fillStyle='#120a04';c.fillRect(x-6,y-19,12,19);
  if(G.lamp&&G.lamp.exitingWith){
    const t=G.lamp.exitT||0;
    const p=clamp(t/14,0,1);
    const depth=Math.round(p*14);
    const pulse=0.62+0.12*Math.sin(tk*0.35);
    c.globalAlpha=0.22*pulse;
    c.fillStyle='#ff9c30';c.fillRect(x-6,y-19,12,19);
    c.globalAlpha=0.78*pulse*(1-p*0.18);
    c.fillStyle='#ffd86a';c.fillRect(x-5,y-18+depth,10,5);
    c.fillStyle='#fff0a0';c.fillRect(x-3,y-17+depth,6,2);
    c.globalAlpha=1;
  }
  const a=tk*0.25;
  c.fillStyle='#ffd040';
  c.fillRect(x+Math.cos(a)*3-1,y-10+Math.sin(a)*4,2,2);
  c.fillStyle='#ff8030';
  c.fillRect(x+Math.cos(a+2.1)*3,y-9+Math.sin(a+2.1)*4,2,2);
  const wave=(tk>>4)&1;
  c.fillStyle='#7a4b20';
  c.fillRect(x+9,y-32,1,12);
  c.fillRect(x+8,y-22,3,1);
  c.fillStyle='#c03030';
  c.fillRect(x+10,y-32,6,3);
  c.fillRect(x+10,y-29,4+wave,2);
  c.fillStyle='#ff7070';
  c.fillRect(x+11,y-31,3,1);
}

function supplyPackageColor(kind,skill){
  if(kind==='mega'||skill==='mega')return '#ff3030';
  if(kind==='tree'||skill==='tree')return '#c78cff';
  if(skill==='flame')return '#ff7030';
  return skill==='jet'?'#ffb040':'#b8d8ff';
}
function supplyPackageLetter(kind,skill){
  if(kind==='mega'||skill==='mega')return '!';
  if(kind==='tree'||skill==='tree')return '?';
  if(skill==='flame')return 'E';
  return skill==='jet'?'J':'B';
}
function hiddenSupplyPackageColor(){return '#9fb8d8'}
function hiddenSupplyPackageLetter(){return '?'}
function drawCrashingSupplyPlane(c,a,cam,tk){
  const x=Math.round(a.x-cam),y=Math.round(a.y),dir=(a.vx||1)>=0?1:-1;
  if(x<-90||x>VW+90)return;
  c.save();
  c.translate(x,y);c.scale(dir,1);
  const r=(x0,y0,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x0),Math.round(y0),Math.round(w),Math.round(h))};
  const wob=((tk>>2)&1);
  r(-20,-7,13,7,'#454850');
  r(-7,-5,15,8,'#60646e');
  r(7,-2,12,7,'#747986');
  r(14,0,5,4,'#d8e8ff');
  r(-23,-7,6,5,'#303038');
  c.fillStyle='#555b66';
  c.beginPath();c.moveTo(-5,-1);c.lineTo(-22,7);c.lineTo(-2,5);c.lineTo(8,2);c.closePath();c.fill();
  c.fillStyle='#383c44';
  c.beginPath();c.moveTo(-2,3);c.lineTo(-16,13);c.lineTo(3,7);c.lineTo(9,4);c.closePath();c.fill();
  r(-16+wob,-9,5,2,'#202020');
  r(-19,-6,3,3,((tk>>1)&1)?'#ff7020':'#ffd040');
  r(-22,-4,4,2,'#ff3018');
  r(-12,3,3,3,((tk>>2)&1)?'#ffb030':'#ff5a18');
  r(-27,-10,5,2,'#505050');
  r(-31,-13,4,2,'#707070');
  r(-35,-16,3,2,'#909090');
  c.restore();
}
function drawSupplyPlaneWreck(c,a,cam,tk){
  const x=Math.round(a.x-cam),y=Math.round(a.y);
  if(x<-70||x>VW+70)return;
  c.save();
  c.globalAlpha=0.36;c.fillStyle='#000';c.fillRect(x-29,y+1,58,3);c.globalAlpha=1;
  c.fillStyle='#383c44';c.fillRect(x-22,y-8,26,8);
  c.fillStyle='#555b66';c.fillRect(x-18,y-10,14,3);
  c.fillStyle='#24272e';c.fillRect(x+3,y-6,18,6);
  c.fillStyle='#747986';c.fillRect(x+18,y-4,5,3);
  c.fillStyle='#303038';c.fillRect(x-27,y-7,8,6);
  c.fillStyle='#4f5662';c.fillRect(x-8,y-2,22,3);
  c.fillStyle='#2d3038';c.fillRect(x-16,y-1,10,2);
  const flick=(tk>>3)&1, slow=((tk>>5)&3)-1;
  c.fillStyle=flick?'#ff7020':'#ffd040';c.fillRect(x-13,y-10,3,4);
  c.fillStyle='#ff3018';c.fillRect(x-16,y-8,3,2);
  c.fillStyle=flick?'#ffd040':'#ff5a18';c.fillRect(x-10,y-7,2,3);
  c.globalAlpha=0.38;
  c.fillStyle='#6d6d6d';
  c.fillRect(x-12+slow,y-19,7,2);
  c.fillRect(x-9+slow,y-21,4,2);
  c.globalAlpha=0.24;
  c.fillStyle='#9a9a9a';
  c.fillRect(x-15-slow,y-26,6,2);
  c.fillRect(x-12-slow,y-28,3,2);
  c.globalAlpha=0.16;
  c.fillStyle='#b0b0b0';
  c.fillRect(x-12+slow,y-33,5,1);
  c.fillRect(x-16+slow,y-31,3,1);
  c.globalAlpha=1;
  c.fillStyle='#5a5a5a';c.fillRect(x-8,y-18,5,2);c.fillRect(x-11,y-21,4,2);
  c.fillStyle='#808080';c.fillRect(x-13,y-24,3,2);
  c.restore();
}
function drawSupplyPlane(c,a,cam,tk){
  if(a.wrecked)return drawSupplyPlaneWreck(c,a,cam,tk);
  if(a.crashing)return drawCrashingSupplyPlane(c,a,cam,tk);
  const x=Math.round(a.x-cam),y=Math.round(a.y),dir=a.vx>=0?1:-1;
  if(x<-90||x>VW+90)return;
  const kind=a.kind||((a.skill==='tree')?'tree':'skill');
  c.save();
  c.translate(x,y);c.scale(dir,1);
  const r=(x0,y0,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x0),Math.round(y0),Math.round(w),Math.round(h))};
  // Fuselage, nos och cockpit.
  r(-18,-4,31,8,'#6f7480');
  r(-13,-6,20,3,'#9aa3b2');
  r(13,-2,5,4,'#d8e8ff');
  r(-7,-9,11,5,'#aeb8ca');
  r(-5,-8,4,2,'#d8f0ff');
  r(0,-8,3,2,'#d8f0ff');
  // Vingar med enkel pixelpolygon så silhuetten blir mer flygplanslik.
  c.fillStyle='#858e9e';
  c.beginPath();c.moveTo(-4,-2);c.lineTo(-21,5);c.lineTo(-3,4);c.lineTo(8,0);c.closePath();c.fill();
  c.fillStyle='#596170';
  c.beginPath();c.moveTo(-3,3);c.lineTo(-17,13);c.lineTo(3,6);c.lineTo(9,3);c.closePath();c.fill();
  // Stjärtparti.
  r(-22,-5,6,5,'#5b6270');
  c.fillStyle='#6f7480';
  c.beginPath();c.moveTo(-20,-5);c.lineTo(-25,-14);c.lineTo(-15,-6);c.closePath();c.fill();
  c.beginPath();c.moveTo(-20,2);c.lineTo(-28,7);c.lineTo(-17,6);c.closePath();c.fill();
  // Propeller/nosblink.
  r(18,-1,2,2,'#303038');
  if((tk>>1)&1){r(20,-8,1,16,'#cfd8e8')}else{r(15,-1,10,1,'#cfd8e8')}
  // Hängande paket före släpp.
  if(!a.dropped){
    r(-4,7,1,5,'#dddddd');
    r(-8,12,9,6,hiddenSupplyPackageColor());
    r(-7,13,7,1,'#ffffff');
    drawTextC(c,hiddenSupplyPackageLetter(),-3,13,1,'#101010');
  }
  c.restore();
}
function drawSupplyPackage(c,p,cam,tk){
  const x=p.x-cam,y=p.y;
  if(x<-30||x>VW+30)return;
  const kind=p.kind||((p.skill==='tree')?'tree':'skill');
  if(!p.landed){
    c.strokeStyle='#eeeeee';c.lineWidth=1;
    c.beginPath();c.arc(x,y-9,9,Math.PI,0);c.stroke();
    c.beginPath();c.moveTo(x-8,y-9);c.lineTo(x-5,y-2);c.moveTo(x+8,y-9);c.lineTo(x+5,y-2);c.stroke();
  }
  c.fillStyle='#8a5a2a';c.fillRect(x-5,y-2,10,8);
  c.fillStyle='#c08038';c.fillRect(x-4,y-1,8,2);
  const hidden=!p.opened;
  c.fillStyle=hidden?hiddenSupplyPackageColor():supplyPackageColor(kind,p.skill);c.fillRect(x-3,y+2,6,2);
  if(p.loot&&hidden){
    c.fillStyle='#d8b058';c.fillRect(x-6,y-3,12,1);c.fillRect(x-6,y+6,12,1);
    c.fillStyle='#ffe8a0';c.fillRect(x-5,y-2,1,8);c.fillRect(x+4,y-2,1,8);
    if(((tk+(p.x|0))&31)<10){
      c.fillStyle='#fff0b0';c.fillRect(x+6,y-5,2,1);c.fillRect(x+7,y-6,1,3);
    }
  }
  drawTextC(c,hidden?hiddenSupplyPackageLetter():supplyPackageLetter(kind,p.skill),x,y+1,1,'#101010');
  if((kind==='tree'||kind==='mega')&&!p.opened){
    c.globalAlpha=0.45+0.25*Math.sin(tk*0.4);
    c.fillStyle='#d8e8ff';c.fillRect(x-6,y-4,12,1);c.fillRect(x-6,y+6,12,1);
    c.globalAlpha=1;
  }
  if(p.landed&&!p.opened){
    c.globalAlpha=0.55+0.25*Math.sin(tk*0.35);
    c.strokeStyle='#d8e8ff';c.strokeRect(x-7,y-4,14,12);
    c.globalAlpha=1;
    drawTextC(c,'TA',x,y+9,1,'#d8e8ff');
  }
  if(p.opened){
    c.globalAlpha=0.35+0.2*Math.sin(tk*0.35);
    c.fillStyle=kind==='mega'?'#fff0a0':(kind==='tree'?'#90e060':(p.skill==='jet'?'#ffd040':'#b8e8ff'));c.fillRect(x-8,y-6,16,16);
    c.globalAlpha=1;
  }
}

function drawRescueCages(c,rescues,cam,tk){
  if(!rescues||!rescues.length)return;
  c.save();
  for(const r of rescues){
    const bx=Math.round(r.buttonX-cam),by=Math.round(r.buttonY);
    if(bx>-28&&bx<VW+28){
      c.fillStyle='#3a3028';c.fillRect(bx-8,by-2,16,3);
      c.fillStyle=r.opened?'#4ee070':'#d05040';c.fillRect(bx-5,by-5,10,3);
      c.fillStyle=r.opened?'#b8ffd0':'#ffd080';c.fillRect(bx-3,by-6,6,1);
      if(!r.opened&&((tk>>4)&1)){c.fillStyle='#fff0a0';c.fillRect(bx-1,by-8,2,1)}
    }

    const x=Math.round(r.releaseX-cam),y=Math.round(r.releaseY);
    if(x<-34||x>VW+34)continue;
    if(r.opened){
      c.fillStyle='rgba(0,0,0,0.48)';c.fillRect(x-8,y-14,16,16);
      c.fillStyle='#596070';c.fillRect(x-10,y-15,20,2);c.fillRect(x-10,y,20,2);
      c.fillStyle='#9aa4b0';c.fillRect(x-11,y-17,6,3);c.fillRect(x+5,y-17,6,3);
      c.globalAlpha=0.35+0.15*Math.sin(tk*0.18+r.p);
      c.fillStyle='#80d8ff';c.fillRect(x-5,y-10,10,5);
      c.globalAlpha=1;
    }else{
      c.fillStyle='#20242c';c.fillRect(x-10,y-22,20,22);
      c.fillStyle='#596070';c.fillRect(x-12,y-24,24,3);c.fillRect(x-12,y,24,3);c.fillRect(x-12,y-24,3,27);c.fillRect(x+9,y-24,3,27);
      c.fillStyle='#9aa4b0';for(let xx=-6;xx<=6;xx+=6)c.fillRect(x+xx,y-22,2,22);
      const n=Math.min(3,r.count||1);
      for(let i=0;i<n;i++){
        const lx=x-5+i*5, bob=((tk+i*9)>>4)&1;
        c.fillStyle='#2244ee';c.fillRect(lx-1,y-7+bob,3,4);
        c.fillStyle='#ffd9a8';c.fillRect(lx,y-10+bob,2,2);
        c.fillStyle='#6fb4ff';c.fillRect(lx-1,y-12+bob,4,2);
      }
    }
  }
  c.restore();
}

function drawBurningTrees(c,cam,tk){
  if(!G.trees)return;
  c.save();
  for(const tr of G.trees){
    if(!tr.burning||tr.eaten)continue;
    const dur=Math.max(1,tr.burnDur||56);
    const p=clamp((tr.burnT||0)/dur,0,1);
    const x=Math.round(tr.x-cam),base=tr.baseY,h=tr.height||28,top=base-h;
    const flameTop=top+Math.round(h*p*0.55);
    const n=5+Math.round((1-p)*5);
    for(let i=0;i<n;i++){
      const fx=x-9+Math.round(hash2(i+tr.id.length,tk&255)*18);
      const fy=flameTop+Math.round(hash2(i+17,tk&127)*(base-flameTop));
      const flick=((tk+i)&3);
      c.fillStyle=flick===0?'#fff060':(flick===1?'#ffb020':(flick===2?'#ff6020':'#8a2214'));
      c.fillRect(fx,fy-2-flick,2,4+flick);
      if(flick===0){c.fillStyle='#ffe8a0';c.fillRect(fx,fy-3,1,2)}
    }
    c.globalAlpha=0.35+0.25*Math.sin(tk*0.25);
    c.fillStyle='#5a5a5a';
    for(let i=0;i<3;i++){
      const sx=x-7+i*7+Math.sin(tk*0.08+i)*3;
      const sy=top-4-i*3-Math.round(p*7);
      c.fillRect(Math.round(sx),Math.round(sy),4,2);
    }
    c.globalAlpha=1;
  }
  c.restore();
}

function drawDolphin(c,d,cam,tk){
  const p=clamp(d.t/d.dur,0,1);
  const x=Math.round(d.sx+(d.tx-d.sx)*p-cam);
  const y=Math.round(d.sy+(d.ty-d.sy)*p-Math.sin(p*Math.PI)*22);
  const dir=d.dir||1;
  if(x<-40||x>VW+40)return;
  c.save();c.translate(x,y);c.scale(dir,1);
  const r=(x0,y0,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x0),Math.round(y0),Math.round(w),Math.round(h))};
  // Enkel blockig delfin i samma pixelart-teknik som resten av spelet.
  r(-8,-3,15,5,'#5fb8e8');
  r(-5,-5,9,2,'#7fd0ff');
  r(6,-2,5,3,'#5fb8e8');
  r(10,-1,2,1,'#d8f8ff');
  r(-9,1,7,3,'#d8f8ff');
  r(-12,-2,4,2,'#2e7fb5');
  r(-14,-5,3,3,'#2e7fb5');
  r(-14,1,3,3,'#2e7fb5');
  r(-2,-8,4,4,'#2e7fb5');
  r(0,2,4,4,'#2e7fb5');
  if((tk>>1)&1)r(5,-6,2,2,'#a0e8ff');
  c.restore();
}

function drawMonkey(c,m,cam,tk){
  const x=Math.round(m.x-cam),y=Math.round(m.y),dir=m.dir||1;
  if(x<-76||x>VW+76)return;
  c.save();c.translate(x,y);c.scale(dir,1);
  const r=(x0,y0,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x0),Math.round(y0),Math.round(w),Math.round(h))};
  const nextThrow=(m.throwSchedule&&m.throwIndex<m.throwSchedule.length)?m.throwSchedule[m.throwIndex]:Infinity;
  const armUp=m.age>=nextThrow-16&&m.age<=nextThrow+4;
  const walk=(m.age>>2)&3;
  const bob=(walk===1||walk===2)?1:0;
  const tailSwing=((m.age>>3)&1)?1:-1;
  const blink=(m.age%113)>107;

  // Gren/vin med blad så apan känns placerad i världen.
  r(-21,12,42,2,'#4a2a16');
  r(-17,13,10,1,'#2c5a24');r(7,13,11,1,'#2c5a24');
  r(-15,15,5,1,'#397a2d');r(11,15,5,1,'#397a2d');

  // Svans: flera segment med lite liv.
  r(-12,2+tailSwing,3,3,'#5a331c');
  r(-15,0+tailSwing,3,3,'#5a331c');
  r(-18,-3,3,4,'#5a331c');
  r(-18,-6,4,3,'#6b3a1e');
  r(-16,-7,3,2,'#7a4526');

  // Ben och fötter. De pendlar lite när apan färdas.
  r(-7,8+(walk===1?1:0),3,5,'#4b2817');
  r(1,8+(walk===3?1:0),3,5,'#4b2817');
  r(-10,12+(walk===1?1:0),6,2,'#3a1f12');
  r(1,12+(walk===3?1:0),6,2,'#3a1f12');

  // Kropp med mage/skuggning.
  r(-8,-2+bob,12,12,'#6b3a1e');
  r(-6,0+bob,8,8,'#8a512c');
  r(-4,2+bob,5,5,'#c58b55');
  r(2,-1+bob,2,10,'#4b2817');

  // Huvud, öron, kind/mule.
  r(-9,-12+bob,13,10,'#6b3a1e');
  r(-13,-9+bob,5,6,'#5a331c');
  r(4,-9+bob,5,6,'#5a331c');
  r(-12,-7+bob,2,3,'#c58b55');
  r(5,-7+bob,2,3,'#c58b55');
  r(-7,-10+bob,9,6,'#c58b55');
  r(-5,-5+bob,6,3,'#d29a61');
  r(-2,-4+bob,2,1,'#7a3f22');
  if(blink){r(-5,-7+bob,2,1,'#101010');r(1,-7+bob,2,1,'#101010')}
  else{r(-5,-8+bob,1,2,'#101010');r(2,-8+bob,1,2,'#101010');r(-4,-9+bob,1,1,'#f0d8b0');}
  r(-4,-12+bob,3,1,'#2b170d');r(0,-12+bob,3,1,'#2b170d'); // ögonbryn/hår
  r(-1,-2+bob,2,1,'#f3d9a0'); // liten tand

  // Armar: kastarmen laddar tydligt upp bananen.
  if(armUp){
    r(3,-8+bob,3,4,'#5a331c');
    r(5,-13+bob,3,6,'#5a331c');
    r(7,-15+bob,3,3,'#c58b55');
    drawBananaShape(c,11,-16+bob,tk,1);
  }else{
    r(3,-2+bob,7,3,'#5a331c');
    r(8,0+bob,3,3,'#c58b55');
    if((m.age>>4)&1)r(9,-2+bob,2,2,'#5a331c'); // liten vinkning/rörelse
  }
  r(-10,-2+bob,5,3,'#5a331c');
  r(-12,0+bob,3,3,'#c58b55');

  // Liten glimt i ansiktet gör den mer levande utan att bryta pixelstilen.
  if((m.age%37)<8)r(-6,-11+bob,2,1,'#9c6a3a');
  c.restore();
}

function drawTroll(c,t,cam,tk){
  const x=Math.round(t.x-cam), y=Math.round(t.y), d=t.dir>=0?1:-1;
  const sc=Math.max(1,t&&t.scale||1);
  if(x<-48*sc||x>VW+48*sc)return;
  const rage=t.rageT>0;
  const chew=!rage&&t.chewT>0;
  const rageFrame=rage?(((t.rageMax||TROLL_RAGE_TICKS)-(t.rageT||0))>>1)&3:0;
  const walk=rage?rageFrame:(((t.stepT||tk)>>2)&3);
  const bob=rage?(rageFrame===1?-1:(rageFrame===3?1:0)):((walk===1||walk===2)?1:0);
  const chewFrame=chew?((t.chewT||0)>>1)&3:0;
  function p(xx,yy,col,w,h){
    c.fillStyle=col;
    c.fillRect(x+Math.round(xx*sc),y+Math.round(yy*sc),Math.max(1,Math.round((w||1)*sc)),Math.max(1,Math.round((h||1)*sc)));
  }
  function q(xx,yy,col){p(d*xx,yy,col,1,1)}
  // Blockigt troll: större silhuett än lemlarna men samma fillRect-pixelstil.
  // Skugga och stora fötter gör att det känns tungt när det går.
  p(-11,1, 'rgba(0,0,0,0.20)',22,2);
  p(-7+(walk===3?-1:0),-1,'#2a1b14',7,3);       // bakre fot
  p(1+(walk===1?1:0), -1,'#2a1b14',8,3);        // främre fot
  p(-5,-8+bob,'#3b2418',4,8);                   // bakre ben
  p(2,-8+(walk===2?1:0),'#3b2418',4,8);         // främre ben
  p(-8,-20+bob,'#5a3722',16,13);                // kropp
  p(-6,-19+bob,'#7b4b2b',12,6);                 // bröst/ljus päls
  p(-4,-13+bob,'#8b5a33',8,4);                  // mage
  p(-9,-24+bob,'#744424',18,9);                 // huvud
  p(-6,-26+bob,'#8b5630',12,4);                 // panna
  // Horn, öron och små hårtaggar.
  p(-11,-25+bob,'#d9c8a4',4,3);p(7,-25+bob,'#d9c8a4',4,3);
  p(-13,-23+bob,'#4a2d1c',4,5);p(9,-23+bob,'#4a2d1c',4,5);
  p(-5,-28+bob,'#2b1b12',2,2);p(0,-29+bob,'#2b1b12',2,3);p(5,-28+bob,'#2b1b12',2,2);
  // Ansikte riktat åt gångriktningen.
  p(d>0?1:-4,-23+bob,rage?'#ff3028':'#101010',2,2);            // öga
  if(rage){
    p(d>0?0:-4,-25+bob,'#2a120a',4,1);          // argt ögonbryn
    p(d>0?3:-7,-18+bob,'#1a0e08',6,2);          // öppen ilsken mun
    p(d>0?5:-5,-17+bob,'#f5e3c0',1,2);
    p(d>0?8:-8,-17+bob,'#f5e3c0',1,2);
  }
  p(d>0?3:-6,-21+bob,'#b88758',5,3);            // nos
  p(d>0?5:-7,-20+bob,'#1a0e08',2,1);            // näsborre
  if(!rage){
    p(d>0?3:-5,-18+bob,'#2a120a',5,1);          // mun
    p(d>0?5:-6,-17+bob,'#f5e3c0',1,2);          // tand
    p(d>0?2:-3,-17+bob,'#f5e3c0',1,2);          // tand
  }
  // Vårtor/ärr som ger lite mer personlighet.
  p(d>0?-6:5,-22+bob,'#2f7a32',1,1);
  p(d>0?-3:2,-15+bob,'#2f7a32',1,1);
  p(d>0?-1:0,-12+bob,'#c08a54',2,1);
  // Armar. Vid raseri slår trollet mot väggen; vid tuggning jobbar armarna mot trädet.
  if(rage){
    const punch=(rageFrame===1||rageFrame===2)?3:0;
    p(d>0?7:-11,-18+bob,'#4a2d1c',4,7);
    p(d>0?10+punch:-14-punch,-15+bob,'#3a2418',5+punch,4);
    p(d>0?13+punch:-18-punch,-14+bob,'#8b5630',4,4);
    p(d>0?-11:7,-17+bob,'#4a2d1c',4,8);
    p(d>0?-14:10,-10+bob,'#3a2418',4,3);
    if(rageFrame===2){
      p(d>0?18:-20,-17+bob,'#ffe060',2,2);
      p(d>0?21:-23,-12+bob,'#d8c090',2,1);
      p(d>0?17:-19,-8+bob,'#d8c090',1,2);
    }
  }else if(chew){
    const a=chewFrame%2;
    p(d>0?7:-11,-18+bob+a,'#4a2d1c',4,5);
    p(d>0?10:-14,-15+bob-a,'#4a2d1c',4,4);
    p(d>0?12:-15,-18+bob,'#8a552c',3,2);        // trädbit i handen
    p(d>0?7:-10,-13+bob,'#ffd8a8',2,2);         // tugg-/saliv-pixel
    if(chewFrame===1)p(d>0?9:-12,-11+bob,'#ffd8a8',2,1);
    p(d>0?-11:7,-17+bob,'#4a2d1c',4,7);
  }else{
    const swing=walk===1?1:(walk===3?-1:0);
    p(d>0?7:-11,-17+bob+swing,'#4a2d1c',4,8);
    p(d>0?10:-14,-11+bob+swing,'#3a2418',4,3);
    p(d>0?-11:7,-17+bob-swing,'#4a2d1c',4,8);
    p(d>0?-14:10,-11+bob-swing,'#3a2418',4,3);
  }
  // Några mörka pälsränder på kroppen.
  p(-7,-18+bob,'#3b2418',2,1);p(5,-16+bob,'#3b2418',2,1);p(-3,-10+bob,'#3b2418',6,1);
}
function drawBananaShape(c,x,y,tk,sc){
  sc=sc||1;
  const phase=(tk>>2)&3;
  c.fillStyle='#ffd840';
  if(phase===0||phase===2){
    c.fillRect(x,y+1,5*sc,2*sc);c.fillRect(x+1,y,3*sc,1*sc);c.fillRect(x+4*sc,y+3*sc,1*sc,1*sc);
  }else{
    c.fillRect(x+1,y,2*sc,5*sc);c.fillRect(x,y+1,1*sc,3*sc);c.fillRect(x+3*sc,y+3*sc,1*sc,1*sc);
  }
  c.fillStyle='#9a6a10';
  c.fillRect(x,y+1,1*sc,1*sc);
}
function drawThrownBanana(c,b,cam,tk){
  const x=Math.round(b.x-cam),y=Math.round(b.y);
  if(x<-25||x>VW+25||y<-25||y>VH+25)return;
  drawBananaShape(c,x-2,y-2,tk+(b.spin||0),1);
}
function drawTrollRock(c,r,cam,tk){
  const x=Math.round(r.x-cam),y=Math.round(r.y);
  const sc=Math.max(1,r&&r.scale||1);
  if(x<-25*sc||x>VW+25*sc||y<-25*sc||y>VH+25*sc)return;
  const phase=(tk+(r.spin||0))&3;
  const rct=(xx,yy,w,h,col)=>{c.fillStyle=col;c.fillRect(x+Math.round(xx*sc),y+Math.round(yy*sc),Math.max(1,Math.round(w*sc)),Math.max(1,Math.round(h*sc)))};
  rct(-3,-2,6,5,'#5a5148');
  rct(-2,-3,4,2,'#7a7064');
  rct(1-(phase&1),1,2,1,'#302820');
  rct(-2+(phase===2?1:0),-2,1,1,'#b0a090');
}


function drawBg(c,L,cam,tk){
  const sky=THEMES[L.theme].sky;
  const g=c.createLinearGradient(0,0,0,VH);
  g.addColorStop(0,sky[0]);g.addColorStop(1,sky[1]);
  c.fillStyle=g;c.fillRect(0,0,VW,VH);
  if(L.cave){
    c.fillStyle='rgba(120,132,146,0.08)';
    for(let i=0;i<16;i++){
      const x=((hash2(i,19)*L.W-cam*0.16)%(VW+120)+VW+120)%(VW+120)-60;
      const y=12+hash2(i,23)*105;
      const w=22+hash2(i,29)*58,h=20+hash2(i,31)*76;
      c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
      c.fillStyle='rgba(30,34,42,0.18)';
      c.fillRect(Math.round(x+4),Math.round(y+h-3),Math.round(w-8),3);
      c.fillStyle='rgba(120,132,146,0.08)';
    }
    c.fillStyle='rgba(0,0,0,0.20)';
    for(let i=0;i<9;i++){
      const x=((hash2(i,43)*L.W-cam*0.08)%(VW+160)+VW+160)%(VW+160)-80;
      c.fillRect(Math.round(x),0,16+hash2(i,47)*30,70+hash2(i,53)*80);
    }
    return;
  }
  // stjärnor på natten
  if(L.night){
    for(let i=0;i<40;i++){
      const x=(hash2(i,1)*L.W-cam*0.3)%VW, y=hash2(i,2)*120;
      const tw=hash2(i,3)*6.3+tk*0.1;
      c.globalAlpha=0.3+0.3*Math.sin(tw);
      c.fillStyle='#cdd8ff';c.fillRect((x+VW)%VW,y,1,1);
    }
    c.globalAlpha=1;
    // måne
    c.fillStyle='#e8e8d8';c.beginPath();c.arc(((420-cam*0.2)%VW+VW)%VW,34,9,0,7);c.fill();
    c.fillStyle=sky[0];c.beginPath();c.arc(((420-cam*0.2)%VW+VW)%VW+4,31,8,0,7);c.fill();
  }
  if(L.theme==='desert'){
    const sx=((360-cam*0.12)%VW+VW)%VW;
    c.globalAlpha=0.55;c.fillStyle='#ffd27a';c.beginPath();c.arc(sx,42,16,0,7);c.fill();
    c.globalAlpha=0.18;c.fillStyle='#f2c070';
    for(let i=0;i<5;i++){
      const x=((i*165-cam*0.18)%(VW+210)+VW+210)%(VW+210)-110;
      c.beginPath();c.arc(x,214+hash2(i,6)*14,85+hash2(i,9)*45,3.2,6.2);c.fill();
    }
    c.globalAlpha=1;
  }else if(L.theme==='rock'){
    c.globalAlpha=0.24;
    for(let i=0;i<7;i++){
      const x=((i*145+hash2(i,71)*70-cam*0.16)%(VW+180)+VW+180)%(VW+180)-90;
      const h=50+hash2(i,73)*80, w=88+hash2(i,79)*58;
      c.fillStyle=i%2?'#182635':'#213346';
      c.beginPath();c.moveTo(x-w*0.5,VH);c.lineTo(x,VH-h);c.lineTo(x+w*0.5,VH);c.fill();
      c.fillStyle='rgba(210,225,238,0.16)';
      c.beginPath();c.moveTo(x,VH-h);c.lineTo(x+w*0.16,VH-h+18);c.lineTo(x-w*0.05,VH-h+25);c.fill();
    }
    c.globalAlpha=1;
  }else if(L.theme==='city'){
    c.globalAlpha=0.16;c.fillStyle='#9aa6b8';
    for(let i=0;i<14;i++){
      const x=((i*54+hash2(i,15)*24-cam*0.18)%(VW+90)+VW+90)%(VW+90)-45;
      const h=38+hash2(i,18)*86;
      c.fillRect(Math.round(x),Math.round(VH-h),28+hash2(i,21)*24,h);
      c.fillStyle=i%2?'#7f8998':'#9aa6b8';
    }
    c.globalAlpha=1;
  }
  // avlägsna siluetter (parallax)
  c.fillStyle='rgba(255,255,255,0.05)';
  for(let i=0;i<10;i++){
    const x=((hash2(i,9)*L.W-cam*0.4)%(L.W))-40;
    if(x>-60&&x<VW){
      const h=30+hash2(i,4)*70;
      if(L.theme==='hell'){c.fillStyle='rgba(255,60,20,0.07)';c.fillRect(x,VH-h,24,h)}
      else if(L.theme==='forest'){c.fillStyle='rgba(40,120,40,0.06)';
        c.beginPath();c.arc(x,VH-h,30,0,7);c.fill()}
      else if(L.theme==='desert'){c.fillStyle='rgba(120,70,35,0.08)';
        c.beginPath();c.moveTo(x,VH);c.lineTo(x+28,VH-h*0.6);c.lineTo(x+56,VH);c.fill()}
      else if(L.theme==='city'){c.fillStyle='rgba(20,24,32,0.10)';c.fillRect(x,VH-h,26,h)}
      else{c.fillStyle='rgba(150,150,200,0.05)';c.fillRect(x,VH-h,18,h)}
    }
  }
}


function drawPixelLightning(c,path,cam,alpha){
  if(!path||path.length<2)return;
  c.save();
  c.globalAlpha=clamp(alpha,0,1);
  c.fillStyle='#fff8d8';
  for(let i=1;i<path.length;i++){
    const a=path[i-1],b=path[i];
    const dx=b.x-a.x,dy=b.y-a.y,steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/3));
    for(let j=0;j<=steps;j++){
      const t=j/steps;
      const x=Math.round(a.x+dx*t-cam), y=Math.round(a.y+dy*t);
      c.fillRect(x-1,y-1,3,3);
    }
    if(i>1&&i<path.length-1&&i%2===0){
      const dir=(i%4===0)?1:-1;
      const len=12+((i*7)%13);
      const sx=b.x, sy=b.y, ex=sx+dir*len, ey=sy+8+((i*5)%9);
      const sdx=ex-sx,sdy=ey-sy,ssteps=Math.max(1,Math.ceil(Math.max(Math.abs(sdx),Math.abs(sdy))/3));
      c.fillStyle='rgba(200,225,255,0.90)';
      for(let j=0;j<=ssteps;j++){
        const tt=j/ssteps;
        c.fillRect(Math.round(sx+sdx*tt-cam),Math.round(sy+sdy*tt),2,2);
      }
      c.fillStyle='#fff8d8';
    }
  }
  c.restore();
}

function drawMeteors(c,cam,tk){
  if(!G.meteors||!G.meteors.length)return;
  c.save();
  for(const m of G.meteors){
    const p=clamp(m.t/Math.max(1,m.dur),0,1);
    const fade=clamp(Math.sin(p*Math.PI)*1.25,0,1);
    const x=Math.round(m.x-cam),y=Math.round(m.y);
    if(x<-130||x>VW+130||y<-40||y>VH+40)continue;
    const dx=m.ex-m.sx,dy=m.ey-m.sy,len=Math.hypot(dx,dy)||1;
    const ux=dx/len,uy=dy/len;
    c.globalAlpha=0.28*fade;
    c.fillStyle='#b8d8ff';
    for(let i=18;i<=72;i+=6)c.fillRect(Math.round(x-ux*i),Math.round(y-uy*i),Math.max(1,4-i/18),1);
    c.globalAlpha=0.86*fade;
    c.fillStyle='#fff8d8';c.fillRect(x-2,y-2,5,4);
    c.fillStyle='#d8f0ff';c.fillRect(x+Math.round(ux*2)-1,y+Math.round(uy*2)-1,3,2);
    c.fillStyle='#ffc060';c.fillRect(x-Math.round(ux*4),y-Math.round(uy*4),2,2);
    c.globalAlpha=0.38*fade;
    c.fillStyle='#80c8ff';c.fillRect(x-1,y-1,3,3);
  }
  c.globalAlpha=1;
  c.restore();
}

function drawSkyBird(c,x,y,tk,seed){
  x=Math.round(x);y=Math.round(y);
  const phase=tk*0.045+seed*0.73;
  const wing=Math.round(Math.sin(phase)*2);
  const tail=wing>0?1:0;
  c.fillRect(x+6,y,3,1);
  c.fillRect(x+8,y-1,1,1);
  c.fillRect(x+4,y+tail,2,1);
  c.fillRect(x,y+wing,5,1);
  c.fillRect(x+9,y-wing,5,1);
  if(Math.abs(wing)>=2){
    c.fillRect(x+1,y+wing+(wing>0?1:-1),3,1);
    c.fillRect(x+10,y-wing+(wing>0?-1:1),3,1);
  }
}

function drawWeatherBack(c,L,cam,tk){
  const k=G.weatherKind;
  if(!k||!G.level)return;
  c.save();
  if(k==='sun'){
    const sx=clamp(360-cam*0.10+(hash2(G.levelSeed&1023,9)-0.5)*70,48,VW-48);
    const sy=28+(hash2(G.levelSeed&2047,10)-0.5)*12;
    c.globalAlpha=0.24;c.fillStyle='#ffe890';
    for(let r=22;r>=10;r-=4)c.fillRect(Math.round(sx-r),Math.round(sy-r/2),r*2,Math.max(2,r));
    c.globalAlpha=0.92;c.fillStyle='#ffd850';
    for(let y=-8;y<=8;y+=2)for(let x=-8;x<=8;x+=2)if(x*x+y*y<78)c.fillRect(Math.round(sx+x),Math.round(sy+y),2,2);
    c.globalAlpha=0.55;c.fillStyle='#fff0a0';
    for(let i=0;i<8;i++){const a=i*Math.PI/4+tk*0.01;const x=sx+Math.cos(a)*18,y=sy+Math.sin(a)*14;c.fillRect(Math.round(x),Math.round(y),Math.abs(Math.cos(a))>0.7?8:2,Math.abs(Math.sin(a))>0.7?7:2)}
    c.globalAlpha=0.65;c.fillStyle='#d8e8ff';
    for(let i=0;i<4;i++){
      const bx=((hash2(i+11,G.levelSeed&4095)*L.W-cam*0.18+tk*0.12*(i+1))%(VW+80)+VW+80)%(VW+80)-40;
      const by=36+hash2(i+13,G.levelSeed&4095)*54;
      drawSkyBird(c,bx,by,tk,i+G.levelSeed);
    }
  }else if(k==='rain'){
    c.globalAlpha=0.16;c.fillStyle='#1a2b40';
    for(let i=0;i<9;i++){
      const x=((hash2(i+31,G.levelSeed&2047)*L.W-cam*0.10)%(VW+120)+VW+120)%(VW+120)-60;
      const y=12+hash2(i+41,G.levelSeed&2047)*42;
      c.fillRect(x,y,42+hash2(i,4)*38,5);c.fillRect(x+12,y-4,34,5);c.fillRect(x+30,y+4,46,4);
    }
    if(G.thunderFlash>0){
      const a=clamp(G.thunderFlash/11,0,1);
      c.globalAlpha=0.10+0.24*a;c.fillStyle='#dceaff';c.fillRect(0,0,VW,VH);
      drawPixelLightning(c,G.thunderPath,cam,0.35+0.60*a);
      c.globalAlpha=1;
    }
  }else if(k==='snow'){
    c.globalAlpha=0.10;c.fillStyle='#d8f0ff';
    for(let i=0;i<7;i++){
      const x=((hash2(i+61,G.levelSeed&2047)*L.W-cam*0.08)%(VW+140)+VW+140)%(VW+140)-70;
      const y=10+hash2(i+71,G.levelSeed&2047)*50;
      c.fillRect(x,y,58,4);c.fillRect(x+16,y-4,34,4);c.fillRect(x+38,y+4,44,3);
    }
  }
  c.globalAlpha=1;c.restore();
}
function drawWeatherFront(c,L,cam,tk){
  const k=G.weatherKind;
  if(!k||!G.level)return;
  const seed=(G.levelSeed||1)&4095;
  c.save();
  if(k==='rain'){
    const chaos=G.mode==='chaos';
    function rainLayer(stepX,stepY,speed,alpha,col,near){
      const cols=Math.ceil(VW/stepX)+5;
      const camShift=Math.floor(cam*(near?0.10:0.05));
      const windDrift=Math.floor(tk*(near?1.05:0.70));
      const xDrift=((windDrift-camShift)%stepX+stepX)%stepX;
      c.globalAlpha=alpha;c.fillStyle=col;
      for(let colIdx=-2;colIdx<cols;colIdx++){
        const phase=Math.floor(hash2(colIdx+seed,near?91:73)*stepY);
        const y0=-stepY+((tk*speed+phase)%stepY);
        const xBase=colIdx*stepX+xDrift-stepX;
        const offset=hash2(colIdx+17,seed)>0.55?2:0;
        for(let y=y0;y<VH+stepY;y+=stepY){
          const row=(y/stepY)|0;
          const px=Math.round(xBase+offset+((row&1)?1:0));
          const py=Math.round(y);
          c.fillRect(px,py,1,2);
          c.fillRect(px+1,py+2,1,2);
          if(near)c.fillRect(px+2,py+4,1,2);
        }
      }
    }
    rainLayer(chaos?14:16,chaos?19:22,chaos?3.4:2.9,0.38,'#6f9fd0',false);
    rainLayer(chaos?23:26,chaos?24:28,chaos?4.5:3.8,0.52,'#91bfe8',true);
    c.globalAlpha=0.10;c.fillStyle='#9ec8ff';
    const splashStep=chaos?34:42;
    const splashDrift=((Math.floor(tk*0.58)-Math.floor(cam*0.04))%splashStep+splashStep)%splashStep;
    for(let x=-20+splashDrift;x<VW+20;x+=splashStep){
      const y=214+((Math.round(x)+seed)&15);
      c.fillRect(Math.round(x),y,3,1);
      c.fillRect(Math.round(x+5),y+1,2,1);
    }
    if(G.thunderFlash>0){
      const a=clamp(G.thunderFlash/11,0,1);
      drawPixelLightning(c,G.thunderPath,cam,0.16+0.28*a);
    }
  }else if(k==='snow'){
    const chaos=G.mode==='chaos';
    function snowLayer(stepX,stepY,speed,alpha,bigLayer){
      const cols=Math.ceil(VW/stepX)+4;
      const yDrift=(tk*speed)%stepY;
      const xWind=Math.floor(tk*(bigLayer?0.055:0.035)-cam*0.025);
      c.globalAlpha=alpha;c.fillStyle=bigLayer?'#f4fbff':'#d8ecff';
      for(let colIdx=-2;colIdx<cols;colIdx++){
        const cellOffset=Math.floor(hash2(colIdx+seed,bigLayer?149:131)*stepY);
        const xBase=colIdx*stepX+xWind%stepX;
        for(let y=-stepY+((yDrift+cellOffset)%stepY);y<VH+stepY;y+=stepY){
          const row=(y/stepY)|0;
          const px=Math.round(xBase+Math.sin(tk*0.025+colIdx*0.8+row)*5+hash2(colIdx+row*17,seed)*4);
          const py=Math.round(y);
          if(bigLayer&&hash2(colIdx*31+row,seed)>0.46){
            c.fillRect(px,py,2,2);
            if(hash2(colIdx+row*19,seed)>0.62){c.fillRect(px-1,py+1,4,1);c.fillRect(px+1,py-1,1,4)}
          }else{
            c.fillRect(px,py,1,1);
          }
        }
      }
    }
    snowLayer(chaos?18:22,chaos?28:32,chaos?0.72:0.62,0.66,false);
    snowLayer(chaos?30:36,chaos?36:42,chaos?0.98:0.86,0.84,true);
  }else if(k==='sun'){
    c.globalAlpha=0.10+0.04*Math.sin(tk*0.03);c.fillStyle='#fff0a0';c.fillRect(0,0,VW,VH);
    c.globalAlpha=0.35;c.fillStyle='#fff8c8';
    for(let i=0;i<12;i++)if(((tk+i*11)>>5)%7===0){
      const x=(hash2(i+151,seed)*VW+Math.sin(tk*0.04+i)*8),y=40+hash2(i+157,seed)*150;
      c.fillRect(Math.round(x),Math.round(y),2,1);c.fillRect(Math.round(x-1),Math.round(y+1),4,1);
    }
  }
  c.globalAlpha=1;c.restore();
}

function drawWater(c,L,cam,tk){
  const zones=G.liquidZones?G.liquidZones():(L.water||[]);
  function surfaceOpen(z,x){
    if(!G.T)return true;
    const xx=clamp(Math.round(x),0,G.T.W-1);
    const y=clamp(Math.round(z.y+2),0,G.T.H-1);
    return !G.T.solid(xx,y)&&!G.T.solid(xx,Math.max(0,y-2));
  }
  for(const z of zones){
    const x0=Math.max(0,z.x-cam),x1=Math.min(VW,z.x+z.w-cam);
    if(x1<0||x0>VW)continue;
    const base=z.lava?'rgba(255,80,10,0.85)':'rgba(30,80,200,0.6)';
    c.fillStyle=base;
    c.fillRect(x0,z.y+2,x1-x0,240-z.y);
    for(let x=x0;x<x1;x++){
      const w=Math.sin(x*0.3+tk*0.3)*1.5;
      c.fillRect(x,z.y+2+w,1,2);
    }
    if(!z.lava)drawAmbientFish(c,z.source||z,cam,tk);
    c.fillStyle=z.lava?'#ffd040':'#9fc8ff';
    const step=z.lava?8:9;
    for(let x=Math.floor(x0/step)*step;x<x1;x+=step){
      const worldX=x+cam;
      const phase=tk*0.055+worldX*0.11;
      const sparkle=0.5+0.5*Math.sin(phase+hash2(worldX|0,z.y|0)*6.28);
      if(sparkle>0.72){
        const yy=z.y+2+Math.sin(worldX*0.22+tk*0.18)*1.4;
        c.globalAlpha=z.lava?0.45+sparkle*0.35:0.30+sparkle*0.35;
        c.fillRect(Math.round(x+Math.sin(phase)*2),Math.round(yy),sparkle>0.92?3:2,1);
      }
    }
    c.globalAlpha=1;
    if(z.lava&&tk%5===0&&RND()<0.5&&G.parts.length<350){
      for(let tries=0;tries<8;tries++){
        const sx=z.x+RND()*z.w;
        if(!surfaceOpen(z,sx))continue;
        G.parts.push({x:sx,y:z.y+2,vx:RND()*0.4-0.2,vy:-0.8-RND(),
          life:20+RND()*16,g:0.02,col:RND()<0.5?'#ff9030':'#ffd040',glow:true});
        break;
      }
    }
  }
}

// mörkeroverlay för nattbanor (mjuk fade runt ljuskällor)
const OV=document.createElement('canvas');OV.width=VW;OV.height=VH;
const ovc=OV.getContext('2d');
function drawDarkness(c,cam,tk){
  ovc.globalCompositeOperation='source-over';
  ovc.clearRect(0,0,VW,VH);
  ovc.fillStyle='rgba(2,2,14,0.93)';
  ovc.fillRect(0,0,VW,VH);
  ovc.globalCompositeOperation='destination-out';
  function light(x,y,r,a){
    if(x<-r||x>VW+r)return;
    const g=ovc.createRadialGradient(x,y,1,x,y,r);
    g.addColorStop(0,'rgba(0,0,0,'+a+')');
    g.addColorStop(0.55,'rgba(0,0,0,'+(a*0.55)+')');
    g.addColorStop(1,'rgba(0,0,0,0)');
    ovc.fillStyle=g;
    ovc.beginPath();ovc.arc(x,y,r,0,7);ovc.fill();
  }
  // lyktan: stort, flackande sken
  if(G.lamp){
    const fl=Math.sin(tk*0.5)*4+Math.sin(tk*0.13)*3;
    if(G.lamp.exitingWith)light(G.lamp.x-cam,G.lamp.y,42+fl*0.45,0.86);
    else light(G.lamp.x-cam,G.lamp.y-6,(G.lamp.holder!==null?92:60)+fl,1);
  }
  if(G.manual&&G.manual.active&&G.manual.lampOn){
    const ml=G.manualLem&&G.manualLem();
    if(ml){
      const fl=Math.sin(tk*0.42)*3+Math.sin(tk*0.17)*2;
      light(ml.x-cam,ml.y-7,74+fl,1);
    }
  }
  light(G.level.hatch.x-cam,G.level.hatch.y,26,0.8);
  light(G.level.exit.x-cam,G.level.exit.y-10,32,0.85);
  for(const d of G.decor)if(d.t==='torch')
    light(d.x-cam,d.y-10,44+Math.sin(tk*0.4+d.x)*3,0.82);
  for(const f of G.flashes)light(f.x-cam,f.y,f.r*1.6,f.t/14);
  for(const m of G.meteors||[]){
    const p=clamp(m.t/Math.max(1,m.dur),0,1), a=clamp(Math.sin(p*Math.PI)*m.glow,0,1);
    light(m.x-cam,m.y,160+60*a,a*0.55);
    light(m.x-cam,m.y+42,240+90*a,a*0.22);
  }
  for(const l of G.lems)if(l.alive())light(l.x-cam,l.y-5,8,0.3);
  for(const p of G.parts)if(p.glow)light(p.x-cam,p.y,6,0.4);
  c.drawImage(OV,0,0);
  for(const m of G.meteors||[]){
    const p=clamp(m.t/Math.max(1,m.dur),0,1), a=clamp(Math.sin(p*Math.PI)*0.16,0,0.16);
    if(a>0.005){c.globalAlpha=a;c.fillStyle='#d8e8ff';c.fillRect(0,0,VW,VH);c.globalAlpha=1}
  }
  // eldflugor ovanpå mörkret
  for(const f of G.fireflies){
    const x=f.x-cam;if(x<0||x>VW)continue;
    const a=0.4+0.4*Math.sin(f.p*3);
    c.globalAlpha=a;c.fillStyle='#d8ff80';c.fillRect(x,f.y,1,1);
    c.globalAlpha=a*0.3;c.fillRect(x-1,f.y-1,3,3);
  }
  c.globalAlpha=1;
  // lava lyser genom mörkret
  for(const z of G.level.water)if(z.lava){
    const x0=z.x-cam,g2=c.createRadialGradient(x0+z.w/2,z.y+6,2,x0+z.w/2,z.y+6,z.w);
    g2.addColorStop(0,'rgba(255,120,30,0.35)');g2.addColorStop(1,'rgba(255,120,30,0)');
    c.fillStyle=g2;c.fillRect(x0-z.w/2,z.y-z.w/2,z.w*2,z.w*1.5);
  }
}
