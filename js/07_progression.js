// -------------------------- PROGRESSION ------------------------------
// Kampanjreglerna ligger separat från menyritning och input så att framtida
// krav, till exempel runor eller hemliga världar, kan läggas till på ett ställe.
const LEVEL_SELECT_MODE_CAMPAIGN='campaign';
const LEVEL_SELECT_MODE_FREE='free';
const LEVEL_RUN_MODE_CAMPAIGN='campaign';
const LEVEL_RUN_MODE_PRACTICE='practice';

Object.assign(G,{
  normalizeLevelSelectMode(mode){
    return String(mode||'')===LEVEL_SELECT_MODE_FREE?LEVEL_SELECT_MODE_FREE:LEVEL_SELECT_MODE_CAMPAIGN;
  },
  levelSelectModeName(mode){
    return this.normalizeLevelSelectMode(mode||this.levelSelectMode)===LEVEL_SELECT_MODE_FREE?'FRITT SPEL':'KAMPANJ';
  },
  normalizeLevelRunMode(mode){
    return String(mode||'')===LEVEL_RUN_MODE_PRACTICE?LEVEL_RUN_MODE_PRACTICE:LEVEL_RUN_MODE_CAMPAIGN;
  },
  levelRunModeName(mode){
    return this.normalizeLevelRunMode(mode||this.levelRunMode)===LEVEL_RUN_MODE_PRACTICE?'ÖVNING':'KAMPANJ';
  },
  campaignModeEnabled(){
    return this.normalizeLevelSelectMode(this.levelSelectMode)!==LEVEL_SELECT_MODE_FREE;
  },
  selectedLevelAffectsProgress(){
    return this.normalizeLevelSelectMode(this.levelSelectMode)!==LEVEL_SELECT_MODE_FREE;
  },
  currentRunAffectsProgress(){
    return this.normalizeLevelRunMode(this.levelRunMode)!==LEVEL_RUN_MODE_PRACTICE;
  },
  practiceRunActive(){
    return !this.currentRunAffectsProgress();
  },
  hasHolyTeleportStone(){
    return !!(this.holyTeleportStoneUnlocked||this.practiceHolyTeleportStoneUnlocked);
  },
  campaignUnlockedCount(){
    if(!this.campaignModeEnabled())return LEVELS.length;
    let n=LEVELS.length?1:0;
    while(n<LEVELS.length&&this.cleared&&this.cleared[n-1])n++;
    return clamp(n,0,LEVELS.length);
  },
  highestUnlockedLevelIdx(){
    return Math.max(0,this.campaignUnlockedCount()-1);
  },
  levelUnlocked(idx){
    idx=clamp(idx|0,0,Math.max(0,LEVELS.length-1));
    if(!this.campaignModeEnabled())return true;
    if(idx===0)return true;
    return !!(this.cleared&&this.cleared[idx-1]);
  },
  levelLockedReason(idx){
    idx=clamp(idx|0,0,Math.max(0,LEVELS.length-1));
    if(this.levelUnlocked(idx))return '';
    return 'KLARA BANA '+String(idx).padStart(2,'0');
  },
  visibleLevelName(idx){
    idx=clamp(idx|0,0,Math.max(0,LEVELS.length-1));
    return this.levelUnlocked(idx)?(LEVELS[idx]&&LEVELS[idx].name||'BANA'):'DOLD BANA';
  },
  chapterUnlocked(chOrIdx){
    if(!this.campaignModeEnabled())return true;
    const ch=typeof chOrIdx==='number'?menuChapters()[chOrIdx]:chOrIdx;
    if(!ch)return false;
    return (ch.from|0)<this.campaignUnlockedCount();
  },
  chapterProgress(chOrIdx){
    const ch=typeof chOrIdx==='number'?menuChapters()[chOrIdx]:chOrIdx;
    if(!ch)return {total:0,cleared:0,unlocked:0,locked:true};
    let cleared=0,unlocked=0;
    for(let i=ch.from;i<ch.to;i++){
      if(this.cleared&&this.cleared[i])cleared++;
      if(this.levelUnlocked(i))unlocked++;
    }
    return {total:Math.max(0,ch.to-ch.from),cleared,unlocked,locked:unlocked<=0};
  },
  clampLevelSelectionForProgression(){
    this.levelSelectMode=this.normalizeLevelSelectMode(this.levelSelectMode);
    if(this.campaignModeEnabled()&&!this.levelUnlocked(this.levelIdx)){
      this.levelIdx=this.highestUnlockedLevelIdx();
    }
    this.levelIdx=clamp(this.levelIdx|0,0,Math.max(0,LEVELS.length-1));
    this.menuChapter=menuChapterForLevel(this.levelIdx);
    return this.levelIdx;
  },
  selectMenuLevel(idx){
    idx=clamp(idx|0,0,Math.max(0,LEVELS.length-1));
    if(!this.levelUnlocked(idx)){
      this.toast('BANA LÅST - '+this.levelLockedReason(idx));
      if(AU.sShrug)AU.sShrug();
      return false;
    }
    this.levelIdx=idx;
    this.menuChapter=menuChapterForLevel(idx);
    this.savePrefs();
    return true;
  },
  toggleLevelSelectMode(){
    this.levelSelectMode=this.campaignModeEnabled()?LEVEL_SELECT_MODE_FREE:LEVEL_SELECT_MODE_CAMPAIGN;
    this.clampLevelSelectionForProgression();
    this.toast('BANVAL: '+this.levelSelectModeName());
    this.savePrefs();
    if(AU.sClick)AU.sClick();
    return this.levelSelectMode;
  }
});
