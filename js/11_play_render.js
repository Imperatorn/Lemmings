// --------------------------- HUVUDRENDER ----------------------------
let tickCount=0;
const BACKGROUND_DECOR_TYPES=new Set(['tree','pyramid','waterfall','cityscape','subway']);
function isBackgroundDecor(dec){return !!dec&&BACKGROUND_DECOR_TYPES.has(dec.t)}

function drawPlayWorld(c,L,cam,tk){
  const shake=G.shakeT>0?Math.max(1,Math.min(18,G.shakePow||6)):0;
  const shx=shake?Math.round((Math.random()*2-1)*shake):0;
  const shy=shake?Math.round((Math.random()*2-1)*shake*0.7):0;
  c.save();
  if(shake)c.translate(shx,shy);
  drawBg(c,L,cam,tk);
  drawWeatherBack(c,L,cam,tk);
  drawMeteors(c,cam,tk);
  // bakgrundsdekor (träd bakom terrängen)
  for(const d of G.decor)if(isBackgroundDecor(d))drawDecor(c,d,cam,tk);
  drawWater(c,L,cam,tk);
  c.drawImage(G.T.cv,cam,0,VW,VH,0,0,VW,VH);
  for(const b of G.ambientBugs||[])drawAmbientBug(c,b,cam,tk);
  for(const g of G.ambientGrass||[])drawAmbientGrass(c,g,cam,tk);
  for(const d of G.decor)if(!isBackgroundDecor(d)&&d.t==='road')drawDecor(c,d,cam,tk);
  for(const d of G.decor)if(!isBackgroundDecor(d)&&d.t!=='road')drawDecor(c,d,cam,tk);
  drawCaveDrips(c,G.caveDrips,cam,tk);
  drawRescueCages(c,G.rescues,cam,tk);
  drawHatch(c,L.hatch.x-cam,L.hatch.y,G.doorT);
  drawExit(c,L.exit.x-cam,L.exit.y,tk);
  drawBurningTrees(c,cam,tk);
  drawEventWarnings(c,cam,tk);
  for(const d of G.dolphins)drawDolphin(c,d,cam,tk);
  for(const a of G.planes)drawSupplyPlane(c,a,cam,tk);
  for(const m of G.monkeys)drawMonkey(c,m,cam,tk);
  for(const trl of G.trolls)drawTroll(c,trl,cam,tk);
  for(const p of G.packages)drawSupplyPackage(c,p,cam,tk);
  for(const b of G.bananas)drawThrownBanana(c,b,cam,tk);
  for(const r of G.trollRocks)drawTrollRock(c,r,cam,tk);
  for(const r of G.settledTrollRocks||[])drawSettledTrollRock(c,r,cam,tk);
  for(const rope of G.ropes)drawRope(c,rope,cam,tk);
  for(const h of G.hooks)drawRopeHook(c,h,cam,tk);
  // tappad lykta
  if(G.lamp&&G.lamp.onGround){
    const x=G.lamp.x-cam;
    c.fillStyle='#caa040';c.fillRect(x-1,G.lamp.y-5,3,1);
    c.fillStyle='#ffe890';c.fillRect(x-1,G.lamp.y-4,3,3);
    c.fillStyle='rgba(255,230,140,'+(0.2+0.1*Math.sin(tk*0.3))+')';
    c.fillRect(x-3,G.lamp.y-7,7,7);
  }
  // raketer
  for(const r of G.rockets){
    if(r.kind==='monkeyMissile'){drawMonkeyMissile(c,r,cam,tk);continue}
    const rd=r.dir||Math.sign(r.vx)||1;
    const sc=Math.max(1,r.scale||1),rw=Math.round(5*sc),rh=Math.max(2,Math.round(2*sc));
    c.fillStyle='#ccc';c.fillRect(r.x-cam-Math.round(2*sc),r.y-Math.round(sc),rw,rh);
    c.fillStyle='#ff8030';c.fillRect(r.x-cam-(rd>0?Math.round(4*sc):-Math.round(3*sc)),r.y-Math.round(sc),Math.round(2*sc),rh);
  }
  // lemlar och hover. Hover måste använda den zoom-inverterade muspositionen.
  G.hoverLem=null;
  const wp=G.screenToWorld({x:G.mx,y:G.my});
  const wx=wp.x,wy=wp.y;
  for(const l of G.lems){
    drawLemming(c,l,l.x-cam,l.y);
    const sc=Math.max(1,l.scale||1);
    if(!G.hoverLem&&Math.abs(l.x-wx)<6*sc&&Math.abs(l.y-5*sc-wy)<8*sc&&l.alive())G.hoverLem=l;
  }
  const lp=G.screenToLayer({x:G.mx,y:G.my});
  G.renderMx=lp.x;G.renderMy=lp.y;G.mouseWorldX=wp.x;G.mouseWorldY=wp.y;
  drawSkillPreview(c,cam,tk);
  drawManualAim(c,cam,tk);
  G.renderMx=G.renderMy=G.mouseWorldX=G.mouseWorldY=null;
  // partiklar
  for(const p of G.parts){
    if(p.ring){
      const maxLife=Math.max(1,p.maxLife||12), life=clamp(p.life/maxLife,0,1);
      const r=Math.round((1-life)*(8*(p.scale||1))+2);
      c.globalAlpha=0.25+life*0.55;
      c.strokeStyle=p.col||'#ffffff';
      c.lineWidth=1;
      c.beginPath();c.arc(Math.round(p.x-cam),Math.round(p.y),r,0,7);c.stroke();
      c.globalAlpha=1;
    }else if(p.smoke){
      const life=clamp(p.life/Math.max(1,p.maxLife||p.life||1),0,1);
      const age=1-life, seed=p.seed||0;
      const s=Math.max(2,Math.round(p.size||2)), w=Math.min(6,s+Math.floor(age*4));
      const x=Math.round(p.x-cam)+Math.round(Math.sin(seed+age*4.2)*2),y=Math.round(p.y);
      const side=Math.sin(seed*1.7)>0?1:-1;
      c.globalAlpha=clamp(0.08+life*0.34,0,0.44);
      c.fillStyle=p.col||'#707070';
      c.fillRect(x-Math.floor(w/2),y,w,2);
      c.fillRect(x-Math.floor(w/2)+1,y-2,Math.max(2,w-2),2);
      if(age>0.18)c.fillRect(x-side*Math.ceil(w/2),y+1,2,1);
      if(age>0.36)c.fillRect(x+side*Math.max(1,Math.floor(w/2)-1),y-1,2,2);
      if(age>0.58)c.fillRect(x-1,y-3,3,1);
      c.globalAlpha=1;
    }else if(p.dust){
      const life=clamp(p.life/18,0,1);
      c.globalAlpha=0.18+life*0.32;
      c.fillStyle=p.col||'#c0a080';
      c.fillRect(Math.round(p.x-cam),Math.round(p.y),p.glow?2:1,1);
      c.globalAlpha=1;
    }else if(p.water){
      const life=clamp(p.life/Math.max(1,p.maxLife||p.life||1),0,1);
      c.globalAlpha=clamp(0.22+life*0.68,0,0.90);
      c.fillStyle=p.col||'#b8efff';
      const x=Math.round(p.x-cam),y=Math.round(p.y);
      if(p.drip)c.fillRect(x,y,1,2);
      else{
        c.fillRect(x,y,p.glow?2:1,p.glow?2:1);
        if(life>0.55&&((tk+x+y)&3)===0)c.fillRect(x+(p.vx>0?-1:1),y+1,1,1);
      }
      c.globalAlpha=1;
    }else c.fillStyle=p.col,c.fillRect(p.x-cam,p.y,p.glow?2:1,p.glow?2:1);
  }
  // explosionsblixtar
  for(const f of G.flashes){
    const maxT=Math.max(1,f.maxT||14);
    const life=clamp(f.t/maxT,0,1);
    const grow=1-life;
    const rr=Math.max(0.5,(f.r||1)*(0.12+grow*(f.mega?1.08:0.88)));
    c.globalAlpha=clamp((f.mega?0.28:0.18)+life*(f.mega?0.58:0.72),0,0.95);
    c.fillStyle=f.mega?'#fff0b0':'#fff8d0';
    c.beginPath();c.arc(f.x-cam,f.y,rr,0,7);c.fill();
    c.globalAlpha=1;
  }
  if(G.megaBoom){
    c.globalAlpha=0.12+0.10*Math.sin(tk*0.6);
    c.fillStyle='#fff0b0';c.fillRect(0,0,VW,VH);
    c.globalAlpha=1;
  }
  if(L.night)drawDarkness(c,cam,tk);
  drawWeatherFront(c,L,cam,tk);
  if(G.thunderFlash>0&&G.weatherKind==='rain'){
    const a=clamp(G.thunderFlash/11,0,1);
    c.globalAlpha=0.06*a;c.fillStyle='#e8f4ff';c.fillRect(0,0,VW,VH);c.globalAlpha=1;
  }
  c.restore();
}

function waterfallCaveLemmingScale(cave){
  const b=cave&&cave.bounds||{};
  const far=Number.isFinite(b.exitY)?b.exitY:104;
  const near=Number.isFinite(b.maxY)?b.maxY:232;
  const y=Number.isFinite(cave&&cave.lemY)?cave.lemY:210;
  const p=clamp((y-far)/Math.max(1,near-far),0,1);
  return 1.55+p*1.55;
}

function drawWaterfallCaveView(c,tk){
  const cave=G.waterfallCave;
  if(!cave||!cave.active)return false;
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
  c.fillStyle='#1f2b34';
  for(let i=0;i<34;i++){
    const side=i&1?-1:1;
    const rx=side<0?Math.round(hash2(i,17)*120):CW-Math.round(hash2(i,19)*120);
    const ry=Math.round(hash2(i+3,23)*CH);
    c.fillRect(rx,ry,18+Math.round(hash2(i+5,29)*42),2+(i%3===0?2:0));
  }
  c.fillStyle='#2b3a44';
  for(let i=0;i<18;i++){
    const rx=62+Math.round(hash2(i+44,wf.x||0)*(CW-124));
    const ry=222+Math.round(hash2(i+55,wf.y||0)*40);
    c.fillRect(rx,ry,18+Math.round(hash2(i+66,wf.x||0)*34),4);
  }
  c.fillStyle='#0b1118';
  fillPixelPoly(c,[[156,CH],[190,250],[232,238],[286,248],[330,CH]]);
  c.fillStyle='#67b8d8';
  for(let i=0;i<16;i++){
    const mx=208+Math.round(hash2(i+76,wf.x||0)*66);
    const my=235+Math.round(hash2(i+81,wf.y||0)*28);
    c.fillRect(mx,my,2,1);
  }
  const b=cave.bounds||{}, exitY=Math.round(b.exitY||104);
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
    const glow=clamp((ch.glowT||0)/70,0,1);
    if(glow>0){
      c.globalAlpha=0.08+glow*0.16;
      c.fillStyle='#ffcf66';
      c.fillRect(0,0,CW,CH);
      c.globalAlpha=0.18+glow*0.32;
      fillPixelPoly(c,[
        [Math.round(ch.x-19),Math.round(ch.y-15)],
        [lx-Math.round(8*lemScale),ly-Math.round(22*lemScale)],
        [lx+Math.round(8*lemScale),ly-Math.round(22*lemScale)],
        [Math.round(ch.x+19),Math.round(ch.y-15)]
      ]);
      c.globalAlpha=0.16+glow*0.20;
      c.fillStyle='#ffe090';
      c.fillRect(Math.round(ch.x-46),Math.round(ch.y-42),92,46);
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
  drawLemming(c,{state:'WALK',dir:cave.dir||1,anim:(tk+t)|0,scale:lemScale,alive(){return true}},lx,ly);
  drawTextC(c,'PENGAR '+Math.max(0,G.money|0),58,284,1,'#ffd866');
  c.restore();
  return true;
}

function render(){
  ctx.clearRect(0,0,CW,CH);
  if(G.state==='TITLE'){drawTitle(ctx,tickCount)}
  else if(G.state==='MENU'){drawMenu(ctx,tickCount)}
  else if(G.state==='BRIEF'){drawBrief(ctx,tickCount)}
  else if(G.state==='RESULT'){drawResult(ctx,tickCount)}
  else if(G.state==='PLAY'){
    const L=G.level;
    G.clampView();
    WCTX.clearRect(0,0,VW,VH);
    drawPlayWorld(WCTX,L,G.cam|0,tickCount);
    const z=G.viewZoom||1;
    const sw=VW/z, sh=VH/z, sy=clamp(G.viewY||0,0,VH-sh);
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(WORLD_CV,0,sy,sw,sh,0,0,VW,VH);
    // meddelanden och HUD ligger stabilt ovanpå medan själva banan skakar/zoomar.
    if(G.waterfallCaveActive&&G.waterfallCaveActive()){
      drawWaterfallCaveView(ctx,tickCount);
      drawToastStack(ctx);
    }else{
      drawToastStack(ctx);
      drawHUD(ctx,tickCount);
      if(G.paused)drawPauseOverlay(ctx);
    }
    // Skarp spelmarkör. Använd bara integer-snäppade fillRect-pixlar:
    // strokeRect på fractional mouse-coordinates blev ibland anti-aliased/suddigt
    // när canvasen skalades i browsern.
    if(G.my<VH&&!(G.waterfallCaveActive&&G.waterfallCaveActive())&&!(G.cutsceneActive&&G.cutsceneActive())){
      const cx=Math.round(G.mx), cy=Math.round(G.my);
      const col=G.hoverLem?'#40ff40':'#ffffff';
      ctx.fillStyle='rgba(0,0,0,0.55)';
      ctx.fillRect(cx-6,cy-6,13,1);ctx.fillRect(cx-6,cy+6,13,1);
      ctx.fillRect(cx-6,cy-6,1,13);ctx.fillRect(cx+6,cy-6,1,13);
      ctx.fillRect(cx-1,cy-9,3,3);ctx.fillRect(cx-1,cy+7,3,3);
      ctx.fillRect(cx-9,cy-1,3,3);ctx.fillRect(cx+7,cy-1,3,3);
      ctx.fillStyle=col;
      ctx.fillRect(cx-5,cy-5,11,1);ctx.fillRect(cx-5,cy+5,11,1);
      ctx.fillRect(cx-5,cy-5,1,11);ctx.fillRect(cx+5,cy-5,1,11);
      ctx.fillRect(cx,cy-8,1,3);ctx.fillRect(cx,cy+6,1,3);
      ctx.fillRect(cx-8,cy,3,1);ctx.fillRect(cx+6,cy,3,1);
    }
  }
  // muspekare på menyskärmar
  if(G.state!=='PLAY'){
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.moveTo(G.mx,G.my);ctx.lineTo(G.mx+6,G.my+5);
    ctx.lineTo(G.mx+3,G.my+6);ctx.lineTo(G.mx,G.my+9);ctx.fill();
  }
  updateCanvasCursor();
  drawHelpOverlay(ctx);
  if(G.cutsceneActive&&G.cutsceneActive())drawCutsceneOverlay(ctx,tickCount);
  if(GAME_ERROR)drawErrorOverlay(ctx,GAME_ERROR);
}
