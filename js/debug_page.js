// --------------------------- DEBUG PAGE -----------------------------
// Separat kontrollpanel for att provkora spelmoment och alla ljud utan
// att starta den vanliga titel/meny-loopen i 13_boot.js.
(function(){
  const $=id=>document.getElementById(id);
  const DBG={
    running:false,timer:null,tick:0,lastLevelIdx:0,
    levelSelect:null,statusEl:null,runBtn:null
  };

  const MUSIC=[
    ['menu','Levelväljare'],['day','Dag 1'],['day2','Dag 2'],['night','Natt'],
    ['cave','Grotta'],['desert','Öken'],['lava','Lava'],['city','Stad']
  ];
  const WEATHER=[['sun','Sol/fåglar'],['rain','Regn'],['snow','Snö'],['cave','Dropp'],['stop','Stoppa väder']];
  const SFX_GROUPS=[
    ['UI',[
      ['Klick',()=>AU.sClick()],['Jingle vinst',()=>AU.jingle(true)],['Jingle förlust',()=>AU.jingle(false)]
    ]],
    ['Lemlar',[
      ['Lets go',()=>AU.sLetsGo()],['Landning/oof',()=>AU.sLand(34)],['Oof',()=>AU.sLemOof(32)],
      ['Hehe bazooka',()=>repeatChanceSfx(()=>AU.sLemHehe('bazooka'))],['Hehe eld',()=>repeatChanceSfx(()=>AU.sLemHehe('flame'))],
      ['Småprat',()=>AU.sLemChatter(false)],['Småprat stor',()=>AU.sLemChatter(true)],
      ['Huttrar',()=>AU.sLemShiver(false)],['Varm suck',()=>AU.sLemWarmSigh(false)],
      ['Splat',()=>AU.sSplat()],['Drunkna',()=>AU.sDrown()],['Räddad',()=>AU.sSaved()],
      ['Dör',()=>AU.sDie()],['Rycker på axlar',()=>AU.sShrug()]
    ]],
    ['Skills',[
      ['Tilldela',()=>AU.sAssign()],['Bygg steg',()=>AU.sBuildStep(false)],['Bygg ned',()=>AU.sBuildStep(true)],
      ['Gräv',()=>AU.sDig()],['Hacka',()=>AU.sBash()],['Tunnla',()=>AU.sMine()],
      ['Klättra',()=>AU.sClimbStep()],['Repsteg',()=>AU.sRopeStep()],['Hoppa',()=>AU.sHop()],
      ['Bazooka skott',()=>AU.sBazooka()],['Jetpack start',()=>AU.sJet()],['Jetpack flyg',()=>AU.sJetFly()],
      ['Eldkastare',()=>AU.sFlamethrower()],['Repkrok',()=>AU.sRopeLaunch()],['Rep fastnar',()=>AU.sRopeAttach()]
    ]],
    ['Explosioner',[
      ['Pop',()=>AU.sPop()],['Stor bomb',()=>AU.sBigBoom()],['Bazooka boom',()=>AU.sBazookaExplosion()],
      ['Lemming boom',()=>AU.sLemmingExplosion()],['Banan boom',()=>AU.sBananaExplosion()],
      ['Megabomb',()=>AU.sMegaBoom()],['Varning',()=>AU.sWarn()],['Tick',()=>AU.sTick()]
    ]],
    ['Värld',[
      ['Flygplan',()=>AU.sPlane()],['Apa',()=>AU.sMonkey()],['Banan',()=>AU.sBanana()],
      ['Troll',()=>AU.sTroll()],['Troll steg',()=>AU.sTrollStep()],['Troll krossar',()=>AU.sTrollSmash()],
      ['Troll äter',()=>AU.sTrollMunch()],['Troll rapar',()=>AU.sTrollBurp()],['Troll ugh',()=>AU.sTrollUgh()],
      ['Delfin',()=>AU.sDolphin()],['Växer',()=>AU.sGrow()],['Lykta',()=>AU.sLamp()],
      ['Träd tänds',()=>AU.sTreeIgnite()],['Träd brinner',()=>AU.sTreeBurn()],['Träd aska',()=>AU.sTreeAsh()]
    ]],
    ['Väder',[
      ['Fågel',()=>AU.sBirdChirp()],['Regnloop',()=>AU.sRainLoop()],['Grottdroppe',()=>AU.sCaveDrip(G.cam+VW/2)],
      ['Snövind',()=>AU.sSnowWind()],['Åska',()=>AU.sThunder(false)],['Stark åska',()=>AU.sThunder(true)]
    ]]
  ];

  function audioReady(){
    AU.init();
    if(AU.ctx&&AU.ctx.state==='suspended'&&AU.ctx.resume)AU.ctx.resume();
    AU.on=true;AU.musicOn=true;AU.sfxOn=true;
    AU.setMusicVolume(Number($('musicVol').value)/100);
    AU.setSfxVolume(Number($('sfxVol').value)/100);
  }

  function repeatChanceSfx(fn){
    for(let i=0;i<7;i++){
      setTimeout(()=>{AU.fxLast={};fn()},i*95);
    }
  }

  function setStatus(msg,kind){
    DBG.statusEl.textContent=msg;
    DBG.statusEl.style.color=kind==='ok'?'var(--ok)':(kind==='warn'?'var(--warn)':'var(--muted)');
  }

  function renderDebug(){
    ctx.clearRect(0,0,CW,CH);
    if(G.state==='PLAY'&&G.level&&G.T){
      G.clampView();
      WCTX.clearRect(0,0,VW,VH);
      drawPlayWorld(WCTX,G.level,G.cam|0,DBG.tick++);
      ctx.drawImage(WORLD_CV,0,0);
      ctx.fillStyle='#05070d';ctx.fillRect(0,HUDY,CW,CH-HUDY);
      drawText(ctx,'DEBUG',8,248,1,'#63d0ff');
      drawText(ctx,(G.level.name||'NIVA').slice(0,34),70,248,1,'#dce8ff');
      drawText(ctx,'LEM '+G.lems.length+'  CAM '+Math.round(G.cam),8,266,1,'#94a4ba');
      drawText(ctx,DBG.running?'KOR':'PAUS',365,266,1,DBG.running?'#78dd86':'#ffd166');
      if(G.cutsceneActive&&G.cutsceneActive())drawCutsceneOverlay(ctx,DBG.tick);
    }else{
      ctx.fillStyle='#05070d';ctx.fillRect(0,0,CW,CH);
      drawTextC(ctx,'LEMMEL DEBUG',CW/2,104,2,'#63d0ff');
      drawTextC(ctx,'STARTA EN NIVA FOR ATT VISA SPELET',CW/2,144,1,'#94a4ba');
      if(G.cutsceneActive&&G.cutsceneActive())drawCutsceneOverlay(ctx,DBG.tick);
    }
  }

  function stopLoop(){
    DBG.running=false;
    if(DBG.timer){clearInterval(DBG.timer);DBG.timer=null}
    if(DBG.runBtn)DBG.runBtn.textContent='Kör';
  }

  function tickOnce(){
    if(!(G.state==='PLAY'&&G.level&&G.T)){setStatus('Starta en nivå först.','warn');return}
    G.tick();
    renderDebug();
  }

  function startLoop(){
    if(!(G.state==='PLAY'&&G.level&&G.T)){setStatus('Starta en nivå först.','warn');return}
    if(DBG.running){stopLoop();renderDebug();return}
    DBG.running=true;
    DBG.runBtn.textContent='Pausa';
    DBG.timer=setInterval(tickOnce,Math.max(24,G.tempoTickMs?G.tempoTickMs():TICK));
  }

  function ensureLoop(){
    if(!DBG.running)startLoop();
  }

  function finishAnimationSetup(msg){
    renderDebug();
    ensureLoop();
    setStatus(msg,'ok');
  }

  function worldCenterX(){
    return clamp(Math.round((G.cam||0)+VW/2),12,G.level.W-12);
  }

  function focusWorldX(x){
    G.cam=clamp(Math.round(x)-Math.round(VW*0.45),0,G.maxCam());
  }

  function clearDebugActors(){
    G.planes=[];G.packages=[];G.trolls=[];G.trollRocks=[];G.monkeys=[];G.bananas=[];
    G.rockets=[];G.hooks=[];G.ropes=[];G.meteors=[];G.flashes=[];G.parts=[];
  }

  function startSelectedLevel(){
    audioReady();
    stopLoop();
    const idx=clamp(Number(DBG.levelSelect.value)||0,0,LEVELS.length-1);
    DBG.lastLevelIdx=idx;
    G.state='PLAY';
    G.startLevel(idx);
    G.paused=false;
    renderDebug();
    setStatus('Startade: '+LEVELS[idx].name,'ok');
  }

  function groundYAt(x){
    if(!G.T)return 180;
    const xx=clamp(Math.round(x),4,G.T.W-5);
    for(let y=10;y<G.T.H-3;y++){
      if(!G.T.solid(xx,y)&&G.T.solid(xx,y+1))return y;
    }
    return clamp((G.level&&G.level.hatch?G.level.hatch.y+8:180),12,VH-4);
  }

  function addDebugLemming(x){
    if(!(G.state==='PLAY'&&G.level&&G.T))startSelectedLevel();
    x=clamp(Math.round(x==null?G.cam+VW/2:x),8,G.level.W-8);
    const l=new Lemming(x,groundYAt(x));
    l.dir=1;l.state='WALK';l.fall=0;
    G.lems.push(l);G.out=G.lems.filter(lem=>lem.alive()).length;
    return l;
  }

  function firstLiveLemming(){
    return (G.lems||[]).find(l=>l&&l.alive&&l.alive())||addDebugLemming();
  }

  function ensureNightLevelForMeteor(){
    if(G.level&&G.level.night&&!G.level.cave)return true;
    const idx=LEVELS.findIndex(L=>L&&L.night&&!L.cave);
    if(idx<0)return false;
    DBG.levelSelect.value=String(idx);
    startSelectedLevel();
    return true;
  }

  function ensureWaterLevelForFishRing(){
    if(G.level&&Array.isArray(G.level.water)&&G.level.water.some(z=>z&&!z.lava))return true;
    const idx=LEVELS.findIndex(L=>L&&Array.isArray(L.water)&&L.water.some(z=>z&&!z.lava));
    if(idx<0)return false;
    DBG.levelSelect.value=String(idx);
    startSelectedLevel();
    return true;
  }

  function debugBrick(x,y,w,h){
    if(!G.T)return;
    G.T.brick(Math.round(x),Math.round(y),Math.round(w),Math.round(h),terrainBrickColor(G.level,x,y));
  }

  function prepareSkillTestArea(x){
    const gy=groundYAt(x);
    if(G.T){
      G.T.clearRect(x-58,gy-54,152,54);
      debugBrick(x-62,gy+1,164,8);
    }
    return groundYAt(x);
  }

  function resetDebugLemming(l,x,y){
    l.x=Math.round(x);l.y=Math.round(y);l.dir=1;l.state='WALK';l.fall=0;l.bombT=-1;l.busyT=0;l.bricks=0;
    l.jumpT=0;l.jumpVy=0;l.manualAimAngle=null;l.ropeId=null;l.ropeCooldown=0;l.swimRing=false;l.fishRingTried=false;
    l.climber=false;l.floater=false;l.chute=false;l.soft=false;l.glide=0;l.dead=false;
    return l;
  }

  function setupPlaneCrashAnimation(){
    clearDebugActors();
    const x=worldCenterX();
    const a={x,y:38,vx:1.1,targetX:x+120,kind:'skill',skill:'baz',dropped:false};
    G.planes.push(a);
    G.damageSupplyPlane(a,a.x,a.y);
    focusWorldX(x);
    finishAnimationSetup('Animation: flygplanet störtar, brinner/ryker, blir vrak och släpper tre paket.');
  }

  function setupTrollPlaneAnimation(){
    clearDebugActors();
    const maxTrollX=Math.max(45,G.level.W-230);
    const tX=clamp(worldCenterX()-115,45,maxTrollX);
    const t=G.makeTroll(tX,G.trollGroundY(tX),1,2);
    t.rockT=9999;
    const px=clamp(t.x+190,65,G.level.W-65);
    const a={x:px,y:Math.max(28,t.y-155),vx:0.22,targetX:px+140,kind:'skill',skill:'jet',dropped:false};
    G.planes.push(a);
    G.throwTrollRock(t,a);
    focusWorldX((t.x+a.x)/2);
    finishAnimationSetup('Animation: jättetroll kastar sten mot flygplan.');
  }

  function setupPackageFallAnimation(){
    G.packages=[];G.planes=[];
    const x=worldCenterX();
    G.packages.push({x,y:26,vx:0,vy:0,kind:'skill',skill:'rope',landed:false,opened:false,openT:0,picked:false,landX:null,landY:null,treeBaseY:null});
    focusWorldX(x);
    finishAnimationSetup('Animation: paket faller med fallskärm och landar.');
  }

  function setupWaterfallAnimation(){
    const x=worldCenterX();
    const l=firstLiveLemming();
    l.x=x;l.y=groundYAt(x);l.state='WALK';l.fall=0;l.dir=1;l.waterfallWetT=0;
    G.decor=G.decor.filter(d=>!d||d.t!=='waterfall');
    G.decor.push({t:'waterfall',x:l.x,y:Math.max(12,l.y-145),h:150,w:34,v:RND()});
    focusWorldX(l.x);
    finishAnimationSetup('Animation: lemming går genom vattenfall och får skvätt på huvudet.');
  }

  function setupFishRingAnimation(){
    if(!ensureWaterLevelForFishRing()){setStatus('Ingen vattenbana hittades för badringstest.','warn');return}
    clearDebugActors();
    const z=(G.level.water||[]).find(w=>w&&!w.lava);
    if(!z){setStatus('Aktuell nivå saknar vatten för badringstest.','warn');return}
    G.liquidCache=null;
    const x=clamp(Math.round(z.x+Math.min(Math.max(z.w*0.38,30),Math.max(30,z.w-18))),z.x+12,z.x+z.w-12);
    const y=Math.round(z.y+7);
    if(G.T){
      G.T.clearRect(x-44,z.y-18,104,78);
      debugBrick(x+42,z.y-36,9,84);
    }
    const l=resetDebugLemming(new Lemming(x,y),x,y);
    l.state='FALL';l.fall=12;l.climber=true;l.dir=1;
    G.lems=[l];G.out=1;
    const zoneIdx=(G.level.water||[]).indexOf(z);
    G.ambientFish=(G.ambientFish||[]).filter(f=>f&&f.zone!==z);
    G.ambientFish.push({zone:z,zoneIdx,x:x-10,y:z.y+12,baseY:z.y+12,dir:1,p:0,s:0.045,spd:0.05,size:2,col:'#ffd060',giftT:0});
    const oldRand=G.rand;
    G.rand=()=>0.0;
    const liquid=G.lemmingLiquidHazard(l);
    G.tryFishSwimRing(l,liquid);
    G.rand=oldRand;
    focusWorldX(x+26);
    finishAnimationSetup('Animation: fisk ger badring, lemmeln flyter och klättrar upp för väggen.');
  }

  function setupFishRingRopeAnimation(){
    if(!ensureWaterLevelForFishRing()){setStatus('Ingen vattenbana hittades för repkrok från vatten.','warn');return}
    clearDebugActors();
    const z=(G.level.water||[]).find(w=>w&&!w.lava);
    if(!z){setStatus('Aktuell nivå saknar vatten för repkrokstest.','warn');return}
    G.liquidCache=null;
    const x=clamp(Math.round(z.x+Math.min(Math.max(z.w*0.34,28),Math.max(28,z.w-20))),z.x+14,z.x+z.w-14);
    const y=Math.round(z.y+7);
    const anchorX=clamp(x+68,10,G.level.W-12), anchorY=Math.max(38,z.y-50);
    if(G.T){
      G.T.clearRect(x-38,z.y-18,132,82);
      debugBrick(anchorX-6,anchorY-5,14,10);
    }
    const l=resetDebugLemming(new Lemming(x,y),x,y);
    l.state='FALL';l.fall=12;l.dir=1;
    G.lems=[l];G.out=1;G.skills.rope=Math.max(G.skills.rope||0,9);
    const zoneIdx=(G.level.water||[]).indexOf(z);
    G.ambientFish=(G.ambientFish||[]).filter(f=>f&&f.zone!==z);
    G.ambientFish.push({zone:z,zoneIdx,x:x-12,y:z.y+12,baseY:z.y+12,dir:1,p:0,s:0.045,spd:0.05,size:2,col:'#ffd060',giftT:0});
    const oldRand=G.rand;
    G.rand=()=>0.0;
    G.tryFishSwimRing(l,G.lemmingLiquidHazard(l));
    G.rand=oldRand;
    G.fireRopeHook(l,anchorX,anchorY);
    focusWorldX(x+34);
    finishAnimationSetup('Animation: simmande lemming med badring skjuter repkrok och klättrar upp.');
  }

  function setupMeteorAnimation(){
    if(!ensureNightLevelForMeteor()){setStatus('Ingen nattbana hittades för meteorit-test.','warn');return}
    G.meteors=[];G.meteorT=99999;
    G.spawnMeteor();
    finishAnimationSetup('Animation: meteorit lyser upp nattbanan.');
  }

  function setupMegaAnimation(){
    const x=worldCenterX(), y=Math.max(22,groundYAt(x)-22);
    if(!G.startMegaBoom(x,y)){setStatus('Kunde inte starta megabomb just nu.','warn');return}
    finishAnimationSetup('Animation: megabombens svep och ljus.');
  }

  function setupMushroomAnimation(){
    const l=firstLiveLemming();
    l.state='WALK';l.fall=0;l.bombT=-1;l.scale=1;
    const mush={t:'mush',x:l.x+4,y:l.y,v:RND()};
    G.decor.push(mush);
    G.growLemmingFromMushroom(l,mush);
    mush.eaten=true;mush.remove=true;
    focusWorldX(l.x);
    finishAnimationSetup('Animation: lemming äter svamp och växer.');
  }

  function setupTrollMushroomAnimation(){
    clearDebugActors();
    const x=worldCenterX();
    const t=G.makeTroll(x,G.trollGroundY(x),1,1);
    const mush={t:'mush',x:t.x+6,y:t.y,v:RND()};
    G.decor.push(mush);
    G.growTrollFromMushroom(t,mush);
    mush.eaten=true;mush.remove=true;
    focusWorldX(t.x);
    finishAnimationSetup('Animation: troll äter svamp och blir jättetroll.');
  }

  function setupBananaAnimation(){
    G.bananas=[];
    const x=clamp(worldCenterX()-120,12,G.level.W-12);
    G.bananas.push({x,y:62,vx:3.5,vy:-1.15,g:0.145,life:95,spin:0,hit:false});
    focusWorldX(x+120);
    finishAnimationSetup('Animation: banan flyger och exploderar mot terrängen.');
  }

  function setupRescueAnimation(){
    const x=worldCenterX(), gy=groundYAt(x);
    const r={id:9001,buttonX:x-46,buttonY:gy-2,releaseX:x+42,releaseY:gy-54,
      openX:x+35,openY:gy-52,openW:16,openH:54,count:3,dir:1,opened:false,released:0,releaseT:0,p:RND()*7};
    G.rescues=[r];
    G.openRescue(r);
    focusWorldX(x);
    finishAnimationSetup('Animation: räddningslucka öppnas och fångade lemlar släpps.');
  }

  function setupSkillAnimation(k){
    if(k==='rope')return setupRopeAnimation();
    const l=firstLiveLemming();
    const x=worldCenterX();
    const gy=prepareSkillTestArea(x);
    resetDebugLemming(l,x,gy);
    l.scale=Math.max(1,l.scale||1);
    G.skills[k]=Math.max(G.skills[k]||0,9);
    if(k==='float'){
      l.y=Math.max(28,gy-92);l.state='FALL';l.fall=22;l.floater=true;l.chute=true;
      focusWorldX(l.x);
      finishAnimationSetup('Animation: fallskärm/flytare bromsar ett fall.');
      return;
    }
    if(k==='climb'){
      debugBrick(l.x+26,l.y-46,10,48);
      G.applySkill(l,k,l.x,l.y-8);
    }else if(k==='bash'||k==='mine'){
      debugBrick(l.x+28,l.y-42,16,44);
      G.applySkill(l,k,l.x+35,l.y-16);
    }else if(k==='baz'||k==='flame'){
      debugBrick(l.x+78,l.y-46,16,48);
      G.applySkill(l,k,l.x+90,l.y-20);
    }else{
      G.applySkill(l,k,l.x+90,l.y-20);
      if(k==='bomb')l.bombT=Math.min(l.bombT,34);
    }
    focusWorldX(l.x+55);
    const names={climb:'Klättrare',bomb:'Bomb',block:'Blockerare',build:'Byggare',downbuild:'Nedbyggare',
      bash:'Hacka',mine:'Tunnla',dig:'Gräva',jet:'Jetpack',flame:'Eldkastare',baz:'Bazooka'};
    finishAnimationSetup('Animation: '+(names[k]||k)+'.');
  }

  function setupRopeAnimation(){
    const l=firstLiveLemming();
    const x=worldCenterX(), gy=prepareSkillTestArea(x);
    resetDebugLemming(l,x,gy);
    G.skills.rope=Math.max(G.skills.rope||0,9);
    const hx=l.x+74, hy=l.y-56;
    debugBrick(hx-6,hy-6,14,12);
    G.fireRopeHook(l,hx,hy);
    focusWorldX(l.x+40);
    finishAnimationSetup('Animation: repkrok skjuts, fastnar och lemmeln klättrar.');
  }

  function doAnimation(action){
    if(action==='animPlaneCrash')return setupPlaneCrashAnimation();
    if(action==='animTrollPlane')return setupTrollPlaneAnimation();
    if(action==='animPackageFall')return setupPackageFallAnimation();
    if(action==='animWaterfall')return setupWaterfallAnimation();
    if(action==='animFishRing')return setupFishRingAnimation();
    if(action==='animFishRingRope')return setupFishRingRopeAnimation();
    if(action==='animMeteor')return setupMeteorAnimation();
    if(action==='animMega')return setupMegaAnimation();
    if(action==='animMushroom')return setupMushroomAnimation();
    if(action==='animTrollMushroom')return setupTrollMushroomAnimation();
    if(action==='animBanana')return setupBananaAnimation();
    if(action==='animRescue')return setupRescueAnimation();
    if(action==='animClimb')return setupSkillAnimation('climb');
    if(action==='animFloat')return setupSkillAnimation('float');
    if(action==='animBomb')return setupSkillAnimation('bomb');
    if(action==='animBlock')return setupSkillAnimation('block');
    if(action==='animBuild')return setupSkillAnimation('build');
    if(action==='animDownbuild')return setupSkillAnimation('downbuild');
    if(action==='animBash')return setupSkillAnimation('bash');
    if(action==='animMine')return setupSkillAnimation('mine');
    if(action==='animDig')return setupSkillAnimation('dig');
    if(action==='animRope')return setupSkillAnimation('rope');
    if(action==='animJet')return setupSkillAnimation('jet');
    if(action==='animFlame')return setupSkillAnimation('flame');
    if(action==='animBazooka')return setupSkillAnimation('baz');
    setStatus('Okänd animation: '+action,'warn');
  }

  function doAction(action){
    if(action!=='camLeft'&&action!=='camRight'&&!(G.state==='PLAY'&&G.level&&G.T))startSelectedLevel();
    audioReady();
    if(action&&action.indexOf('anim')===0){doAnimation(action);return}
    if(action==='camLeft'){
      G.cam=clamp((G.cam||0)-120,0,G.maxCam());renderDebug();setStatus('Kamera flyttad vänster.');return;
    }
    if(action==='camRight'){
      G.cam=clamp((G.cam||0)+120,0,G.maxCam());renderDebug();setStatus('Kamera flyttad höger.');return;
    }
    if(action==='spawnLem'){
      const l=addDebugLemming();G.cam=clamp(l.x-180,0,G.maxCam());renderDebug();setStatus('Lade till en lemming.','ok');return;
    }
    if(action==='giveSkills'){
      for(const s of SKILLS)G.skills[s.k]=Math.max(G.skills[s.k]||0,9);
      renderDebug();setStatus('Alla skills sattes till minst 9.','ok');return;
    }
    if(action==='explode'){
      G.explode(G.cam+VW/2,Math.min(190,groundYAt(G.cam+VW/2)-10),28,true,'bazooka');
      renderDebug();setStatus('Explosion testad.','ok');return;
    }
    if(action==='torchWarm'){
      const l=firstLiveLemming();
      const torch={t:'torch',x:l.x+10,y:l.y,vy:0};
      G.decor.push(torch);
      G.startTorchWarm(l,torch);
      G.cam=clamp(l.x-180,0,G.maxCam());
      renderDebug();setStatus('Fackelvärme tvingad på närmaste lemming.','ok');return;
    }
    if(action==='plane'){
      G.spawnSupplyPlane(null,G.cam+VW/2);
      renderDebug();setStatus('Paketflyg skickat.','ok');return;
    }
    if(action==='monkey'){
      const before=G.monkeys.length;
      G.spawnMonkey({dir:1,y:58});
      const m=G.monkeys[G.monkeys.length-1];
      if(m&&G.monkeys.length>before)m.x=clamp(G.cam+40,12,G.level.W-12);
      renderDebug();
      setStatus(G.monkeys.length>before?'Apa spawnad nära kameran.':'Apa är avstängd på mörka/grottnivåer.',G.monkeys.length>before?'ok':'warn');
      return;
    }
    if(action==='troll'){
      const x=clamp(G.cam+VW/2,20,G.level.W-20);
      const t=G.spawnTroll({entry:{x,y:G.trollGroundY(x),dir:x<G.level.W/2?1:-1}});
      renderDebug();setStatus(t?'Troll spawnat nära kameran.':'Troll är avstängt på mörka/grottnivåer.',t?'ok':'warn');return;
    }
    if(action==='spawnMushroom'){
      const x=clamp(Math.round(G.cam+VW/2),8,G.level.W-8);
      const y=groundYAt(x);
      G.decor.push({t:'mush',x,y,v:RND()});
      renderDebug();setStatus('Svamp spawnad vid kamerans mitt.','ok');return;
    }
    if(action==='spawnTree'){
      const x=clamp(Math.round(G.cam+VW/2),42,G.level.W-42);
      const baseY=G.findTreeGroundY?G.findTreeGroundY(x):groundYAt(x);
      const tree=G.spawnGrowingTreeAt?G.spawnGrowingTreeAt(x,baseY,'DEBUG: TRAD VAXER!'):null;
      renderDebug();setStatus(tree?'Trad skapat vid kamerans mitt.':'Kunde inte skapa trad har.',tree?'ok':'warn');return;
    }
  }

  function makeButton(label,fn,cls){
    const b=document.createElement('button');
    b.type='button';b.textContent=label;
    if(cls)b.className=cls;
    b.addEventListener('click',fn);
    return b;
  }

  function cutsceneOption(id,fallback){
    const el=$(id);
    return el&&el.value?el.value:fallback;
  }

  function debugCutsceneWorldContext(){
    if(!(G.state==='PLAY'&&G.level&&G.T))startSelectedLevel();
    const L=G.level||{};
    const light=cutsceneOption('cutsceneLight','level');
    const weather=cutsceneOption('cutsceneWeather','level');
    const material=cutsceneOption('cutsceneMaterial','level');
    const cave=light==='cave'?true:(light==='day'||light==='night'?false:!!L.cave);
    const night=light==='night'?true:(light==='day'||light==='cave'?false:!!L.night);
    const weatherKind=weather==='level'?(G.weatherKind||(cave?'cave':(night?'rain':'sun'))):weather;
    return {
      themeKey:material==='level'?(L.theme||'dirt'):material,
      night,
      cave,
      weatherKind,
      levelName:'DEBUG CUTSCENE'
    };
  }

  function playDebugRescueCutscene(kind){
    if(!(G.state==='PLAY'&&G.level&&G.T))startSelectedLevel();
    audioReady();
    const mode=cutsceneOption('cutsceneMode','fullscreen');
    const ctx=debugCutsceneWorldContext();
    const x=worldCenterX();
    const waterY=Math.min(196,Math.max(132,groundYAt(x)-22));
    let spec=null,label='';
    if(kind==='waterClimb'&&G.makeWaterClimbCutsceneSpec){
      spec=G.makeWaterClimbCutsceneSpec(mode);
      spec.event=Object.assign(ctx,{lemX:x,lemY:waterY+6,dir:1,waterY,fromWater:true});
      label='Klattrar ur vatten';
    }else if(kind==='climb'&&G.makeClimbCutsceneSpec){
      spec=G.makeClimbCutsceneSpec(mode);
      spec.event=Object.assign(ctx,{lemX:x,lemY:waterY-8,dir:1,waterY,fromWater:false});
      label='Klattrar pa vagg';
    }else if(kind==='fishRing'&&G.makeFishRingCutsceneSpec){
      spec=G.makeFishRingCutsceneSpec(mode);
      spec.event=Object.assign(ctx,{lemX:x+18,lemY:waterY+8,fishX:x-34,fishY:waterY+12,waterY,fromWater:true});
      label='Fisk ger badring';
    }else if(kind==='dolphin'&&G.makeDolphinRescueCutsceneSpec){
      spec=G.makeDolphinRescueCutsceneSpec(mode);
      spec.event=Object.assign(ctx,{lemX:x+52,lemY:waterY-8,waterX:x-36,waterY:waterY+10,shoreX:x+82,shoreY:waterY-20,fromWater:true});
      label='Delfinraddning';
    }
    if(!spec){setStatus('Cutscene-variant saknas: '+kind,'warn');return}
    const textKind=kind==='fishRing'?'fish':(kind==='dolphin'?'dolphin':'climb');
    if(G.applyRescueCutsceneText)G.applyRescueCutsceneText(spec,textKind);
    if(ctx.weatherKind==='rain')G.thunderFlash=Math.max(G.thunderFlash||0,8);
    const cs=G.playCutscene(spec,{respectPrefs:false});
    if(!cs){setStatus('Kunde inte starta cutscene-variant: '+kind,'warn');return}
    finishAnimationSetup('Cutscene: '+label+' - '+ctx.themeKey+', '+(ctx.cave?'grotta':(ctx.night?'natt':'dag'))+', '+ctx.weatherKind+'.');
  }

  function debugRescueKindForCutsceneId(id){
    if(id==='water-climb-closeup')return 'waterClimb';
    if(id==='wall-climb-closeup')return 'climb';
    if(id==='fish-ring-closeup')return 'fishRing';
    if(id==='dolphin-rescue-closeup')return 'dolphin';
    return null;
  }

  function playDebugCutscene(id,label){
    if(!(G.state==='PLAY'&&G.level&&G.T))startSelectedLevel();
    const rescueKind=debugRescueKindForCutsceneId(id);
    if(rescueKind){playDebugRescueCutscene(rescueKind);return}
    if(!G.cutsceneById||!G.cutsceneById(id)){setStatus('Cutscene saknas: '+id,'warn');return}
    const cs=G.playCutscene(id,{respectPrefs:false});
    if(!cs){setStatus('Kunde inte starta cutscene: '+id,'warn');return}
    finishAnimationSetup('Cutscene: '+(label||id)+'.');
  }

  function buildCutsceneButtons(){
    const wrap=$('cutsceneButtons');
    if(!wrap)return;
    wrap.textContent='';
    const scenes=G.cutsceneList?G.cutsceneList({debug:true}):[];
    if(!scenes.length){
      wrap.appendChild(makeButton('Inga scener',()=>setStatus('Inga cutscenes ar registrerade.','warn'),'danger'));
      return;
    }
    for(const scene of scenes){
      wrap.appendChild(makeButton(scene.label||scene.id,()=>playDebugCutscene(scene.id,scene.label)));
    }
  }

  function playSfx(label,fn){
    audioReady();
    AU.fxLast={};
    try{
      fn();
      setStatus('Spelar SFX: '+label,'ok');
    }catch(e){
      console.error(e);
      setStatus('Kunde inte spela SFX: '+label,'warn');
    }
  }

  function buildAudioButtons(){
    const musicWrap=$('musicButtons');
    for(const [kind,label] of MUSIC){
      musicWrap.appendChild(makeButton(label,()=>{
        audioReady();
        AU.stopWeather();
        AU.startMusic(kind);
        setStatus('Spelar musik: '+label,'ok');
      }));
    }
    musicWrap.appendChild(makeButton('Stoppa musik',()=>{
      audioReady();AU.stopMusic();setStatus('Musik stoppad.');
    },'danger'));

    const weatherWrap=$('weatherButtons');
    for(const [kind,label] of WEATHER){
      weatherWrap.appendChild(makeButton(label,()=>{
        audioReady();
        if(kind==='stop')AU.stopWeather();
        else AU.startWeather(kind);
        setStatus(kind==='stop'?'Väderljud stoppat.':'Spelar väderljud: '+label,'ok');
      }));
    }

    const sfxWrap=$('sfxButtons');
    for(const [group,items] of SFX_GROUPS){
      const box=document.createElement('div');
      box.className='group';
      const h=document.createElement('h2');
      h.textContent=group;
      box.appendChild(h);
      const grid=document.createElement('div');
      grid.className='grid';
      for(const [label,fn] of items)grid.appendChild(makeButton(label,()=>playSfx(label,fn)));
      box.appendChild(grid);
      sfxWrap.appendChild(box);
    }
  }

  function initDebugPage(){
    DBG.levelSelect=$('levelSelect');
    DBG.statusEl=$('debugStatus');
    DBG.runBtn=$('toggleRunBtn');
    LEVELS.forEach((L,i)=>{
      const o=document.createElement('option');
      o.value=String(i);
      o.textContent=String(i+1).padStart(2,'0')+' - '+L.name;
      DBG.levelSelect.appendChild(o);
    });
    DBG.levelSelect.value=String(clamp(G.levelIdx||0,0,LEVELS.length-1));

    $('startLevelBtn').addEventListener('click',startSelectedLevel);
    DBG.runBtn.addEventListener('click',startLoop);
    $('stepBtn').addEventListener('click',tickOnce);
    $('resetBtn').addEventListener('click',startSelectedLevel);
    document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>doAction(b.dataset.action)));
    document.querySelectorAll('[data-cutscene-test]').forEach(b=>b.addEventListener('click',()=>playDebugRescueCutscene(b.dataset.cutsceneTest)));

    for(const id of ['musicVol','sfxVol']){
      const label=$(id+'Label');
      $(id).addEventListener('input',()=>{
        audioReady();
        const v=Number($(id).value)||0;
        label.textContent=v+'%';
        if(id==='musicVol')AU.setMusicVolume(v/100);
        else AU.setSfxVolume(v/100);
      });
    }

    buildAudioButtons();
    buildCutsceneButtons();
    $('debugReady').textContent='Redo';
    $('debugReady').style.color='var(--ok)';
    renderDebug();
  }

  window.addEventListener('beforeunload',()=>{stopLoop();AU.stopMusic();AU.stopWeather()});
  window.addEventListener('load',initDebugPage);
})();
