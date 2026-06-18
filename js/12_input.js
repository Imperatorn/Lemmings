// ----------------------------- INPUT --------------------------------
function canvasPos(e){
  const r=cvs.getBoundingClientRect();
  const w=Math.max(1,r.width),h=Math.max(1,r.height);
  return {
    x:clamp((e.clientX-r.left)*CW/w,0,CW-0.001),
    y:clamp((e.clientY-r.top)*CH/h,0,CH-0.001)
  };
}
async function toggleFullscreen(){
  const d=document, el=document.documentElement;
  try{
    if(!d.fullscreenElement){
      const req=el.requestFullscreen||el.webkitRequestFullscreen||el.msRequestFullscreen;
      if(req)await req.call(el);
      else G.toast('FULLSKÄRM STÖDS INTE HÄR');
    }else{
      const exit=d.exitFullscreen||d.webkitExitFullscreen||d.msExitFullscreen;
      if(exit)await exit.call(d);
    }
  }catch(_){ G.toast('KUNDE INTE ÄNDRA FULLSKÄRM'); }
}
function updateCanvasCursor(){
  // I spelvärlden ritar vi egen markeringsruta. I HUD/menyer ska användaren se
  // vanlig muspekare så knapparna går att pricka utan att pekaren försvinner.
  if(!cvs||!cvs.style)return;
  const showNative=(G.waterfallCaveActive&&G.waterfallCaveActive())||(G.cutsceneActive&&G.cutsceneActive())||G.state!=='PLAY'||G.my>=HUDY||G.showHelp||G.paused||GAME_ERROR;
  cvs.style.cursor=showNative?'default':'none';
}
function refreshPointer(p){
  G.mx=p.x;G.my=p.y;G.hoverBtn=hitButton(p);
  updateCanvasCursor();
  return p;
}
function selectSkill(k){
  if(k==='portal'){
    if(!G.portalStoneButtonAvailable||!G.portalStoneButtonAvailable()){
      G.toast('STENEN KRÄVER DEN HELIGA LÄMMELN');
      AU.sShrug();
      return;
    }
    G.clearRopeAim();
    G.selSkill='portal';
    G.toast('VALD TELEPORTERINGSSTEN - KLICKA PÅ DEN HELIGA LÄMMELN');
    return;
  }
  const s=SKILLS.find(q=>q.k===k);
  if(!s)return;
  // Om spelaren var mitt i ett repkroks-aim och väljer något annat ska
  // siktningsläget alltid avbrytas, även om den nya skillen råkar vara slut.
  if(k!=='rope')G.clearRopeAim();
  if(G.skills&&Object.prototype.hasOwnProperty.call(G.skills,k)&&G.skills[k]<=0){G.toast('INGA '+s.name+' KVAR');AU.sShrug();return}
  G.selSkill=k;
  G.toast(k==='rope'?'VALD REPKROK - KLICKA PÅ EN LEMMEL':'VALD '+s.name+' - KLICKA PÅ EN LEMMEL');
}
function selectTrollTransform(){
  if(G.trollUsed){G.toast('TROLLFÖRVANDLING REDAN ANVÄND');AU.sShrug();return}
  G.clearRopeAim();
  G.selSkill='troll';
  G.toast('VALD TROLL - KLICKA PÅ EN LEMMEL');
}
function pressAt(p){
  refreshPointer(p);
  AU.init();
  if(AU.ctx&&AU.ctx.state==='suspended')AU.ctx.resume();
  if(G.waterfallCaveActive&&G.waterfallCaveActive()){G.handleWaterfallCaveInput(p,'click');return}
  if(G.cutsceneActive&&G.cutsceneActive()){G.handleCutsceneInput(p,'click');return}
  if(G.state==='TITLE'){G.state='MENU';AU.sClick();AU.startMusic('menu');return}
  if(G.state==='MENU'){
    if(G.profileOverlay){
      G.handleProfileOverlayInput(p);
      AU.sClick();
      return;
    }
    if(G.menuSettings)for(const k in G.menuSettings){const r=G.menuSettings[k];
      if(p.x>=r.x&&p.x<r.x+r.w&&p.y>=r.y&&p.y<r.y+r.h){
        if(k==='profile')G.openProfileOverlay();
        else if(k==='leaderboard')G.openLeaderboardOverlay();
        else if(k==='progression')G.toggleLevelSelectMode();
        else if(k==='mode')G.toggleMode();
        else if(k==='cutscenes')G.toggleCutscenes();
        else if(k==='music')G.toggleMusic();
        else if(k==='musicVol')G.setMusicVolume((p.x-r.x)/Math.max(1,r.w));
        else if(k==='sfx')G.toggleSfx();
        else if(k==='sfxVol')G.setSfxVolume((p.x-r.x)/Math.max(1,r.w));
        else if(k==='load')G.promptLoadGame();
        else if(k==='fs')toggleFullscreen();
        return;
      }
    }
    if(G.menuTabs)for(const r of G.menuTabs)
      if(p.x>=r.x&&p.x<r.x+r.w&&p.y>=r.y&&p.y<r.y+r.h){
        G.menuChapter=r.idx;AU.sClick();return}
    if(G.menuRows)for(const r of G.menuRows)
      if(p.y>=r.y&&p.y<r.y+r.h&&p.x>=(r.x||30)&&p.x<(r.x||30)+(r.w||CW-60)){
        if(G.selectMenuLevel&&!G.selectMenuLevel(r.idx))return;
        if(!G.selectMenuLevel){G.levelIdx=r.idx;G.menuChapter=menuChapterForLevel(r.idx);G.savePrefs()}
        G.state='BRIEF';AU.sClick();return}
    return;
  }
  if(G.state==='BRIEF'){
    if(G.handleBriefShopInput&&G.handleBriefShopInput(p))return;
    if(G.levelUnlocked&&!G.levelUnlocked(G.levelIdx)){G.toast('BANA LÅST');G.state='MENU';return}
    G.startLevel(G.levelIdx);return
  }
  if(G.state==='RESULT'){
    G.advanceFromResult();
    AU.sClick();return;
  }
  if(G.state==='PLAY'){
    // HUD-zonen hanteras separat så att klick på knappar/minikarta aldrig
    // misstolkas som världsklick. Hitboxarna är lite högre än det ritade
    // området för att fungera bättre på skalade/touch-skärmar.
    if(p.y>=HUDY){
      if(G.portalStone&&G.portalStone.placingExit){G.toast('PLACERA UTGÅNGSPORTAL ELLER ESC');return}
      const bi=hitButton(p);
      if(bi>=0){
        const b=typeof hudButtonAt==='function'?hudButtonAt(bi):BUTTONS[bi];
        if(!b)return;
        const k=b.k;
        if(k==='fs')toggleFullscreen();
        else if(k==='pause')G.paused=!G.paused;
        else if(k==='save')G.promptSaveGame();
        else if(k==='troll')selectTrollTransform();
        else selectSkill(k);
        AU.sClick();
      }else if(G.mm&&p.x>=G.mm.x&&p.y>=G.mm.y&&p.y<G.mm.y+G.mm.h){
        G.cam=clamp((p.x-G.mm.x)/G.mm.sc-G.viewW()/2,0,G.maxCam());
        G.viewY=clamp((p.y-G.mm.ty)/G.mm.sc-G.viewH()/2,0,G.maxViewY());
      }
      return;
    }
    const wp=G.screenToWorld(p);
    G.clickWorld(wp.x,wp.y);
  }
}
function rightClickAt(p){
  refreshPointer(p);
  AU.init();
  if(AU.ctx&&AU.ctx.state==='suspended')AU.ctx.resume();
  if(G.waterfallCaveActive&&G.waterfallCaveActive()){G.handleWaterfallCaveInput(p,'context');return}
  if(G.cutsceneActive&&G.cutsceneActive()){G.handleCutsceneInput(p,'context');return}
  if(G.state==='PLAY'&&p.y<VH){
    if(G.portalStone&&G.portalStone.placingExit){G.cancelPortalStonePlacement();return}
    const wp=G.screenToWorld(p);
    G.toggleManualControlAt(wp.x,wp.y);
  }
}
const ACTIVE_POINTERS=new Map();
let DRAG=null,PINCH=null;
function playWorldPoint(p){return !(G.waterfallCaveActive&&G.waterfallCaveActive())&&!(G.cutsceneActive&&G.cutsceneActive())&&G.state==='PLAY'&&p.y<VH}
function startPointerAction(id,p,kind){
  refreshPointer(p);
  ACTIVE_POINTERS.set(id,{x:p.x,y:p.y,world:playWorldPoint(p),kind:kind||'pointer'});
  if(playWorldPoint(p)){
    DRAG={id,p0:{x:p.x,y:p.y},last:{x:p.x,y:p.y},moved:false,world:true};
  }else{
    pressAt(p);
    DRAG=null;
  }
}
function updatePinchFromPointers(){
  const pts=[...ACTIVE_POINTERS.values()].filter(q=>q.world);
  if(pts.length<2){PINCH=null;return false}
  const a=pts[0],b=pts[1];
  const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
  const dist=Math.max(8,Math.hypot(a.x-b.x,a.y-b.y));
  if(!PINCH){PINCH={dist,zoom:G.viewZoom||1,mid};return true}
  G.setZoom(PINCH.zoom*dist/PINCH.dist,mid,true);
  G.panViewByScreenDelta(mid.x-PINCH.mid.x,mid.y-PINCH.mid.y);
  PINCH.mid=mid;
  if(DRAG)DRAG.moved=true;
  return true;
}
function finishPointerAction(id,p){
  refreshPointer(p);
  const wasDrag=DRAG&&DRAG.id===id;
  const shouldClick=wasDrag&&DRAG.world&&!DRAG.moved&&ACTIVE_POINTERS.size<=1;
  ACTIVE_POINTERS.delete(id);
  updatePinchFromPointers();
  if(shouldClick)pressAt(p);
  if(wasDrag)DRAG=null;
}
function bindInput(){
  cvs.addEventListener('contextmenu',e=>{e.preventDefault();});
  cvs.addEventListener('wheel',e=>{
    const p=canvasPos(e);refreshPointer(p);
    if(G.cutsceneActive&&G.cutsceneActive()){e.preventDefault();return}
    if(playWorldPoint(p)){
      e.preventDefault();
      G.zoomStep(e.deltaY<0?1:-1,p);
    }
  },{passive:false});
  if(window.PointerEvent){
    cvs.addEventListener('pointermove',e=>{
      e.preventDefault();
      const p=canvasPos(e);refreshPointer(p);
      if(ACTIVE_POINTERS.has(e.pointerId))ACTIVE_POINTERS.set(e.pointerId,{x:p.x,y:p.y,world:playWorldPoint(p),kind:e.pointerType||'pointer'});
      if(updatePinchFromPointers())return;
      if(DRAG&&DRAG.id===e.pointerId&&DRAG.world){
        const dx=p.x-DRAG.last.x,dy=p.y-DRAG.last.y;
        if(Math.abs(p.x-DRAG.p0.x)>5||Math.abs(p.y-DRAG.p0.y)>5){
          DRAG.moved=true;
          G.panViewByScreenDelta(dx,dy);
        }
        DRAG.last={x:p.x,y:p.y};
      }
    },{passive:false});
    cvs.addEventListener('pointerdown',e=>{
      if(e.button!=null&&e.button===2){
        e.preventDefault();
        rightClickAt(canvasPos(e));
        return;
      }
      if(e.button!=null&&e.button!==0)return;
      e.preventDefault();
      if(cvs.setPointerCapture&&e.pointerId!=null)try{cvs.setPointerCapture(e.pointerId)}catch(_){}
      startPointerAction(e.pointerId,canvasPos(e),e.pointerType||'pointer');
    },{passive:false});
    cvs.addEventListener('pointerup',e=>{e.preventDefault();finishPointerAction(e.pointerId,canvasPos(e))},{passive:false});
    cvs.addEventListener('pointercancel',e=>{ACTIVE_POINTERS.delete(e.pointerId);DRAG=null;PINCH=null},{passive:false});
  }else{
    cvs.addEventListener('mousemove',e=>{
      const p=canvasPos(e);refreshPointer(p);
      if(DRAG&&DRAG.world){
        const dx=p.x-DRAG.last.x,dy=p.y-DRAG.last.y;
        if(Math.abs(p.x-DRAG.p0.x)>5||Math.abs(p.y-DRAG.p0.y)>5){DRAG.moved=true;G.panViewByScreenDelta(dx,dy)}
        DRAG.last={x:p.x,y:p.y};
      }
    });
    cvs.addEventListener('mousedown',e=>{e.preventDefault();if(e.button===2){rightClickAt(canvasPos(e));return}startPointerAction('mouse',canvasPos(e),'mouse')});
    window.addEventListener('mouseup',e=>{if(DRAG)finishPointerAction('mouse',canvasPos(e))});
    cvs.addEventListener('touchmove',e=>{
      const t=e.touches&&e.touches[0];
      if(!t)return;
      e.preventDefault();refreshPointer(canvasPos(t));
    },{passive:false});
    cvs.addEventListener('touchstart',e=>{
      const t=(e.changedTouches&&e.changedTouches[0])||(e.touches&&e.touches[0]);
      if(!t)return;
      e.preventDefault();startPointerAction('touch',canvasPos(t),'touch');
    },{passive:false});
    cvs.addEventListener('touchend',e=>{
      const t=(e.changedTouches&&e.changedTouches[0]);
      if(!t)return;
      e.preventDefault();finishPointerAction('touch',canvasPos(t));
    },{passive:false});
  }
}
bindInput();
window.addEventListener('keydown',e=>{
  if(e.key==='f'||e.key==='F'){toggleFullscreen();e.preventDefault();return}
  if(G.waterfallCaveActive&&G.waterfallCaveActive()){G.handleWaterfallCaveKey(e.key);e.preventDefault();return}
  if(G.cutsceneActive&&G.cutsceneActive()){G.handleCutsceneKey(e.key);e.preventDefault();return}
  if(e.key==='h'||e.key==='H'){G.toggleHelp();e.preventDefault();return}
  if(e.key==='k'||e.key==='K'){if(G.state==='MENU'||G.state==='BRIEF'||G.state==='TITLE'){G.toggleMode()}else G.toast('LÄGE ÄNDRAS I MENYN');e.preventDefault();return}
  if(e.key==='v'||e.key==='V'){if(G.state==='MENU'||G.state==='TITLE'){G.toggleLevelSelectMode()}else G.toast('BANVAL ÄNDRAS I MENYN');e.preventDefault();return}
  if(e.key==='m'||e.key==='M'){G.toggleMusic();e.preventDefault();return}
  if(e.key==='s'||e.key==='S'){G.toggleSfx();e.preventDefault();return}
  const tempoDir=(e.key==='+'||e.key==='='||e.code==='NumpadAdd')?1:((e.key==='-'||e.key==='_'||e.code==='NumpadSubtract')?-1:0);
  if(tempoDir){G.adjustTempo(tempoDir);e.preventDefault();return}
  if(G.state==='PLAY'){
    if(G.portalStone&&G.portalStone.placingExit&&(e.key==='Escape'||e.key==='b'||e.key==='B')){
      G.cancelPortalStonePlacement();
      e.preventDefault();
      return;
    }
    if(G.isManualActive&&G.isManualActive()){
      if(e.key==='Control'){G.setManualKey('aim',true);e.preventDefault();return}
      if(e.key==='ArrowLeft'&&G.manual&&G.manual.keys&&G.manual.keys.aim){G.adjustManualAim(-0.13);e.preventDefault();return}
      if(e.key==='ArrowRight'&&G.manual&&G.manual.keys&&G.manual.keys.aim){G.adjustManualAim(0.13);e.preventDefault();return}
      if(e.key==='ArrowLeft'){if(!G.cancelManualSkillWithInput('left'))G.setManualKey('left',true);e.preventDefault();return}
      if(e.key==='ArrowRight'){if(!G.cancelManualSkillWithInput('right'))G.setManualKey('right',true);e.preventDefault();return}
      if(e.key==='ArrowDown'){G.setManualKey('down',true);e.preventDefault();return}
      if(e.key==='ArrowUp'){
        if(G.waterfallCaveEntryBlocked&&G.waterfallCaveEntryBlocked()){e.preventDefault();return}
        if(!G.tryEnterWaterfallCaveFromManual||!G.tryEnterWaterfallCaveFromManual())if(!G.cancelManualSkillWithInput('up'))G.queueManualJump(G.manual&&G.manual.keys&&G.manual.keys.down);
        e.preventDefault();return;
      }
      if(e.key==='Shift'){G.setManualKey('run',true);e.preventDefault();return}
      if(e.key==='l'||e.key==='L'){G.toggleManualLamp();e.preventDefault();return}
    }
    if(e.key==='ArrowLeft')G.cam=clamp(G.cam-24/(G.viewZoom||1),0,G.maxCam());
    if(e.key==='ArrowRight')G.cam=clamp(G.cam+24/(G.viewZoom||1),0,G.maxCam());
    if(e.key===' '){G.paused=!G.paused;e.preventDefault()}
    if(e.key==='r'||e.key==='R'){G.restartCurrentLevel();e.preventDefault();return}
    if(e.key==='Escape'||e.key==='b'||e.key==='B'){G.goToMenu();e.preventDefault();return}
    if(e.key==='q'||e.key==='Q'){selectSkill('rope');e.preventDefault();return}
    if(e.key==='d'||e.key==='D'){selectSkill('downbuild');e.preventDefault();return}
    if(e.key==='e'||e.key==='E'){selectSkill('flame');e.preventDefault();return}
    if(e.key==='j'||e.key==='J'){selectSkill('jet');e.preventDefault();return}
    if(e.key==='z'||e.key==='Z'){G.zoomStep(1,{x:VW/2,y:VH/2});e.preventDefault();return}
    if(e.key==='x'||e.key==='X'){G.zoomStep(-1,{x:VW/2,y:VH/2});e.preventDefault();return}
    if(e.key==='c'||e.key==='C'){G.resetZoom();e.preventDefault();return}
    const num='1234567890'.indexOf(e.key);
    if(num>=0){selectSkill(SKILLS[num].k);e.preventDefault();return}
  }else if(G.state==='RESULT'){
    if(e.key==='Enter'){G.advanceFromResult();e.preventDefault();return}
    if(e.key==='r'||e.key==='R'){G.restartCurrentLevel();e.preventDefault();return}
    if(e.key==='Escape'||e.key==='b'||e.key==='B'){G.goToMenu();e.preventDefault();return}
  }else if(G.state==='MENU'){
    if(G.profileOverlay){
      if(e.key==='Escape'||e.key==='b'||e.key==='B'){G.closeProfileOverlay();e.preventDefault();return}
      if(e.key==='l'||e.key==='L'){G.openLeaderboardOverlay();e.preventDefault();return}
      if(e.key==='p'||e.key==='P'){G.openProfileOverlay();e.preventDefault();return}
      e.preventDefault();
      return;
    }
    if(e.key==='l'||e.key==='L'){G.promptLoadGame();e.preventDefault();return}
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
      const n=menuChapters().length, d=e.key==='ArrowRight'?1:-1;
      G.menuChapter=(G.menuChapter+d+n)%n;AU.sClick();e.preventDefault();return;
    }
    if(e.key==='Escape')G.state='TITLE';
  }
});

window.addEventListener('keyup',e=>{
  if(e.key==='ArrowUp'&&G.releaseWaterfallCaveEntryBlock)G.releaseWaterfallCaveEntryBlock(e.key);
  if(G.waterfallCaveActive&&G.waterfallCaveActive()){if(G.handleWaterfallCaveKeyUp)G.handleWaterfallCaveKeyUp(e.key);e.preventDefault();return}
  if(G.cutsceneActive&&G.cutsceneActive()){e.preventDefault();return}
  if(G.state==='PLAY'&&G.isManualActive&&G.isManualActive()){
    if(e.key==='ArrowLeft'){G.setManualKey('left',false);e.preventDefault();return}
    if(e.key==='ArrowRight'){G.setManualKey('right',false);e.preventDefault();return}
    if(e.key==='ArrowDown'){G.setManualKey('down',false);e.preventDefault();return}
    if(e.key==='Shift'){G.setManualKey('run',false);e.preventDefault();return}
    if(e.key==='Control'){G.setManualKey('aim',false);e.preventDefault();return}
  }
});
