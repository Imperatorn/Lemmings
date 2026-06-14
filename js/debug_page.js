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
    }else{
      ctx.fillStyle='#05070d';ctx.fillRect(0,0,CW,CH);
      drawTextC(ctx,'LEMMEL DEBUG',CW/2,104,2,'#63d0ff');
      drawTextC(ctx,'STARTA EN NIVA FOR ATT VISA SPELET',CW/2,144,1,'#94a4ba');
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

  function doAction(action){
    if(action!=='camLeft'&&action!=='camRight'&&!(G.state==='PLAY'&&G.level&&G.T))startSelectedLevel();
    audioReady();
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
  }

  function makeButton(label,fn,cls){
    const b=document.createElement('button');
    b.type='button';b.textContent=label;
    if(cls)b.className=cls;
    b.addEventListener('click',fn);
    return b;
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
    $('debugReady').textContent='Redo';
    $('debugReady').style.color='var(--ok)';
    renderDebug();
  }

  window.addEventListener('beforeunload',()=>{stopLoop();AU.stopMusic();AU.stopWeather()});
  window.addEventListener('load',initDebugPage);
})();
