// ------------------------ SPARA / LADDA -----------------------------
Object.assign(G,{
  makeSaveState(label){
    if(this.state!=='PLAY'||!this.level||!this.T)return null;
    const fields=['cam','viewZoom','viewY','out','saved','spawned','doorT','rate','spawnT','timeT','levelTimeT','skills','selSkill','trollUsed',
      'lamp','weatherKind','weatherT','thunderT','thunderFlash','thunderX','thunderPath','meteorT','supplyT','supplyDrops','supplyMax','supplyLastX',
      'supplyRecentXs','supplyMegaDropped','supplyMegaPlanned','supplyMegaForceAt','supplyLateMegaScheduled','monkeyT','monkeyEvents','monkeyMax','monkeySeq',
      'monkeyAirSupportPending','monkeyAirSupportTargetX','monkeyLastX','trollT','trollEvents','trollMax','trollLastX','treeT','treeEvents','treeMax','treeLastX','jumpT','jumpEvents','jumpMax',
      'megaBoom','megaArmed','eventLockT','shakeT','shakePow','ropeAim','ropeSeq','settledTrollRockSeq','lemTalkT','manual','waterfallCaveLooted','money','pendingSkillBonus'];
    const arrays=['lems','parts','rockets','hooks','ropes','planes','packages','monkeys','bananas','trolls','trollRocks','settledTrollRocks','trees','dolphins','flashes',
      'decor','rescues','fireflies','meteors','caveDrips','ambientBugs','ambientFish','ambientGrass','warnings','queuedEvents'];
    const data={v:1,label:String(label||'SPARAT LÄGE').slice(0,28),ts:Date.now?Date.now():0,levelIdx:this.levelIdx,levelSeed:this.levelSeed>>>0,
      terrain:encodeMask(this.T.mask),terrainStairs:encodeMask(this.T.stairMask),W:this.T.W,H:this.T.H,fields:{},arrays:{}};
    for(const f of fields)data.fields[f]=jsonClone(this[f]);
    data.fields.paused=false;
    if(data.fields.manual&&data.fields.manual.keys)data.fields.manual.keys={left:false,right:false,down:false,run:false,aim:false};
    for(const a of arrays)data.arrays[a]=jsonClone(this[a]||[]);
    return data;
  },
  promptSaveGame(){
    if(this.state!=='PLAY'||!this.level||!this.T){this.toast('INGET SPEL ATT SPARA');return false}
    AU.init();
    let label='BANA '+(this.levelIdx+1)+' - '+this.level.name;
    try{
      const txt=window.prompt('Namn på sparat läge:',label);
      if(txt==null)return false;
      label=String(txt).trim()||label;
    }catch(_){}
    const state=this.makeSaveState(label);
    if(!state){this.toast('KUNDE INTE SPARA');return false}
    const slots=saveGameSlots().filter(s=>s&&s.v===1);
    slots.unshift(state);
    if(writeGameSlots(slots)){this.toast('SPELET SPARAT');AU.sClick();return true}
    this.toast('KUNDE INTE SPARA - LAGRING FULL?');
    AU.sShrug();
    return false;
  },
  restoreSaveState(s){
    if(!s||s.v!==1||!LEVELS[s.levelIdx]){this.toast('SPARLÄGET GÅR INTE ATT LADDA');return false}
    if(this.clearCutscene)this.clearCutscene('restore');
    if(this.exitWaterfallCave)this.exitWaterfallCave('silent');
    AU.stopMusic();AU.stopWeather();
    if(AU.stopWaterfallCave)AU.stopWaterfallCave();
    this.levelIdx=s.levelIdx|0;
    this.levelSeed=s.levelSeed>>>0;
    this.levelRng=rndSeed(this.levelSeed||1337);
    this.level=LEVELS[this.levelIdx];
    this.T=new Terrain(s.W||this.level.W,s.H||240);
    this.T.mask=decodeMask(s.terrain,this.T.W*this.T.H);
    this.T.stairMask=decodeMask(s.terrainStairs||'',this.T.W*this.T.H);
    this.T.renderFromMask(this.level.theme,this.level.materialZones);
    const fields=s.fields||{}, arrays=s.arrays||{};
    for(const k in fields)this[k]=jsonClone(fields[k]);
    if(!Object.prototype.hasOwnProperty.call(fields,'trollUsed'))this.trollUsed=!!fields.nuked;
    if(!this.waterfallCaveLooted||typeof this.waterfallCaveLooted!=='object')this.waterfallCaveLooted={};
    this.waterfallCaveExitNeedsUpRelease=false;
    this.waterfallCaveResumeMusic=false;
    this.waterfallCaveResumeWeather=null;
    this.money=Math.max(0,this.money|0);
    this.pendingSkillBonus=this.normalizePendingSkillBonus?this.normalizePendingSkillBonus(this.pendingSkillBonus):{};
    if(this.selSkill==='nuke')this.selSkill=null;
    this.paused=false;
    this.levelIdx=s.levelIdx|0;this.level=LEVELS[this.levelIdx];this.levelSeed=s.levelSeed>>>0;
    this.lems=(arrays.lems||[]).map(d=>{const l=new Lemming(d.x||0,d.y||0);Object.assign(l,d);return l});
    let maxId=0;for(const l of this.lems)maxId=Math.max(maxId,l.id||0);LEM_ID=Math.max(LEM_ID,maxId+1);
    const names=['parts','rockets','hooks','ropes','planes','packages','monkeys','bananas','trolls','trollRocks','settledTrollRocks','trees','dolphins','flashes',
      'decor','rescues','fireflies','meteors','caveDrips','ambientBugs','ambientFish','ambientGrass','warnings','queuedEvents'];
    for(const n of names)this[n]=jsonClone(arrays[n]||[]);
    this.weatherKind=this.normalizeWeatherForLevel(this.weatherKind,this.level);
    if(this.weatherKind!=='rain'){this.thunderT=0;this.thunderFlash=0;this.thunderPath=null}
    this.liquidCache=null;
    if(this.rebindAmbientFishZones)this.rebindAmbientFishZones();
    this.toasts=[];this.msg='';this.msgT=0;this.state='PLAY';this.endT=0;this.menuChapter=menuChapterForLevel(this.levelIdx);
    this.clampView();this.savePrefs();
    AU.startMusic(this.musicKindForLevel(this.levelIdx));
    AU.startWeather(this.weatherKind);
    this.toast('SPARLÄGE LADDAT');
    return true;
  },
  promptLoadGame(){
    AU.init();
    const slots=saveGameSlots().filter(s=>s&&s.v===1&&LEVELS[s.levelIdx]);
    if(!slots.length){this.toast('INGA SPARADE LÄGEN');AU.sShrug();return false}
    const lines=slots.map((s,i)=>{
      const t=s.ts?new Date(s.ts):null, ds=t?(' '+String(t.getMonth()+1).padStart(2,'0')+'/'+String(t.getDate()).padStart(2,'0')):'';
      return (i+1)+': '+(s.label||'SPARAT LÄGE')+'  (BANA '+((s.levelIdx|0)+1)+ds+')';
    }).join('\n');
    let ans=null;
    try{ans=window.prompt('Ladda sparat läge:\n'+lines+'\n\nSkriv nummer:', '1')}catch(_){}
    if(ans==null)return false;
    const idx=(parseInt(ans,10)||0)-1;
    if(!slots[idx]){this.toast('OGILTIGT SPARLÄGE');AU.sShrug();return false}
    return this.restoreSaveState(slots[idx]);
  }
});
