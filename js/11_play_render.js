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
    drawToastStack(ctx);
    drawHUD(ctx,tickCount);
    if(G.paused)drawPauseOverlay(ctx);
    // Skarp spelmarkör. Använd bara integer-snäppade fillRect-pixlar:
    // strokeRect på fractional mouse-coordinates blev ibland anti-aliased/suddigt
    // när canvasen skalades i browsern.
    if(G.my<VH&&!(G.cutsceneActive&&G.cutsceneActive())){
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
