// ------------------------ RUNOR / HEMLIGHETER ------------------------
Object.assign(G,{
  runeCatalog(){
    if(typeof waterfallCaveRuneCatalog==='function')return waterfallCaveRuneCatalog();
    return {sets:[],runes:[]};
  },
  normalizeRuneProgress(data){
    const src=data&&typeof data==='object'?data:{};
    const out={v:1,discovered:{},sets:{}};
    const rawSets=src.sets&&typeof src.sets==='object'?src.sets:{};
    for(const id in rawSets){
      const s=rawSets[id]||{}, sid=String(s.id||id);
      if(!sid)continue;
      out.sets[sid]={
        id:sid,
        title:String(s.title||sid),
        source:String(s.source||''),
        world:String(s.world||''),
        total:Math.max(0,Number(s.total)|0),
        readCount:0,
        complete:!!s.complete,
        completedAt:Number.isFinite(s.completedAt)?s.completedAt:null
      };
    }
    const raw=src.discovered&&typeof src.discovered==='object'?src.discovered:{};
    for(const key0 in raw){
      const value=raw[key0];
      const entry=value&&typeof value==='object'?value:{key:key0};
      const key=String(entry.key||key0);
      if(!key)continue;
      const setId=String(entry.setId||'unknown');
      const runeId=String(entry.runeId||key.split('.').pop()||key);
      const lines=Array.isArray(entry.lines)?entry.lines.map(v=>String(v)).slice(0,8):[];
      out.discovered[key]={
        key,setId,runeId,
        title:String(entry.title||runeId),
        setTitle:String(entry.setTitle||entry.title||setId),
        order:Math.max(0,Number(entry.order)|0),
        total:Math.max(0,Number(entry.total)|0),
        sceneId:String(entry.sceneId||''),
        objectId:String(entry.objectId||''),
        source:String(entry.source||''),
        world:String(entry.world||''),
        lines,
        text:String(entry.text||lines.join('\n')||''),
        discoveredAt:Number.isFinite(entry.discoveredAt)?entry.discoveredAt:0,
        levelIdx:Number.isFinite(entry.levelIdx)?entry.levelIdx:null,
        levelName:String(entry.levelName||'')
      };
      const e=out.discovered[key];
      const set=out.sets[setId]||(out.sets[setId]={id:setId,title:e.setTitle||setId,source:e.source||'',world:e.world||'',total:0,readCount:0,complete:false,completedAt:null});
      if(e.setTitle)set.title=e.setTitle;
      if(e.source)set.source=e.source;
      if(e.world)set.world=e.world;
      set.total=Math.max(set.total||0,e.total||0);
    }
    const readBySet={};
    for(const key in out.discovered){
      const e=out.discovered[key], sid=e.setId||'unknown';
      readBySet[sid]=readBySet[sid]||{};
      readBySet[sid][key]=true;
    }
    for(const sid in out.sets){
      const set=out.sets[sid];
      set.readCount=Object.keys(readBySet[sid]||{}).length;
      if(set.total>0&&set.readCount>=set.total)set.complete=true;
      if(set.complete&&!Number.isFinite(set.completedAt))set.completedAt=null;
    }
    return out;
  },
  recordRuneDiscovery(desc){
    if(!desc||typeof desc!=='object')return {newly:false,setCompletedNow:false,set:null,key:null};
    const key=String(desc.key||'');
    if(!key)return {newly:false,setCompletedNow:false,set:null,key:null};
    let progress=this.normalizeRuneProgress(this.runeProgress);
    const setId=String(desc.setId||'unknown');
    const wasKnown=!!progress.discovered[key];
    if(this.currentRunAffectsProgress&&!this.currentRunAffectsProgress()){
      return {key,newly:!wasKnown,setCompletedNow:false,set:progress.sets[setId]||null,entry:progress.discovered[key]||null,practice:true};
    }
    const descTotal=Math.max(0,Number(desc.total)|0);
    const oldSet=progress.sets[setId]||null;
    const wasComplete=!!(oldSet&&oldSet.complete&&(!descTotal||(oldSet.total||0)>=descTotal));
    if(!wasKnown){
      const now=Date.now?Date.now():0;
      progress.discovered[key]={
        key,setId,
        runeId:String(desc.runeId||key.split('.').pop()||key),
        title:String(desc.title||desc.runeId||key),
        setTitle:String(desc.setTitle||setId),
        order:Math.max(0,Number(desc.order)|0),
        total:descTotal,
        sceneId:String(desc.sceneId||''),
        objectId:String(desc.objectId||''),
        source:String(desc.source||''),
        world:String(desc.world||''),
        lines:Array.isArray(desc.lines)?desc.lines.map(v=>String(v)).slice(0,8):[],
        text:String(desc.text||''),
        discoveredAt:now,
        levelIdx:this.level?this.levelIdx:null,
        levelName:this.level&&this.level.name?String(this.level.name):''
      };
    }
    progress=this.normalizeRuneProgress(progress);
    const set=progress.sets[setId]||null;
    const setCompletedNow=!!(set&&set.complete&&!wasComplete);
    if(setCompletedNow)set.completedAt=Date.now?Date.now():0;
    this.runeProgress=progress;
    if(!wasKnown||setCompletedNow)this.savePrefs();
    return {key,newly:!wasKnown,setCompletedNow,set,entry:progress.discovered[key]||null};
  },
  runeProgressSummary(data){
    const progress=this.normalizeRuneProgress(data||this.runeProgress);
    const catalog=this.runeCatalog();
    const knownTotal=Array.isArray(catalog.runes)?catalog.runes.length:0;
    let completeSets=0,totalSets=0;
    const seenSets={};
    if(Array.isArray(catalog.sets)){
      totalSets=catalog.sets.length;
      for(const s of catalog.sets||[])seenSets[s&&s.id]=true;
    }
    for(const id in progress.sets){
      if(!seenSets[id])totalSets++;
      if(progress.sets[id]&&progress.sets[id].complete)completeSets++;
    }
    return {
      discovered:Object.keys(progress.discovered).length,
      knownTotal,
      completeSets,
      totalSets,
      sets:progress.sets
    };
  },
  runeArchiveProgress(data,limit){
    const progress=this.normalizeRuneProgress(data||this.runeProgress);
    const catalog=this.runeCatalog();
    const setMeta={};
    const sets=Array.isArray(catalog.sets)?catalog.sets:[];
    for(let i=0;i<sets.length;i++){
      const s=sets[i]||{},id=String(s.id||'');
      if(!id)continue;
      setMeta[id]={
        order:Number.isFinite(s.order)?s.order:i,
        index:i,
        title:String(s.title||id)
      };
    }
    const entries=(Array.isArray(catalog.runes)?catalog.runes:[]).map((r,i)=>{
      r=r||{};
      const setId=String(r.setId||'');
      const meta=setMeta[setId]||{order:9999,index:9999,title:String(r.setTitle||setId)};
      const key=String(r.key||'');
      return {
        key,
        setId,
        runeId:String(r.runeId||key.split('.').pop()||('rune'+i)),
        title:String(r.title||r.runeId||key||('Runa '+(i+1))),
        setTitle:String(r.setTitle||meta.title||setId),
        setOrder:meta.order,
        setIndex:meta.index,
        order:Number.isFinite(r.order)?r.order:i+1,
        catalogIndex:i,
        read:!!(key&&progress.discovered&&progress.discovered[key])
      };
    }).sort((a,b)=>
      (a.setOrder-b.setOrder)||
      (a.setIndex-b.setIndex)||
      (a.order-b.order)||
      (a.catalogIndex-b.catalogIndex)||
      a.key.localeCompare(b.key)
    );
    const max=Number.isFinite(limit)?Math.max(0,Number(limit)|0):entries.length;
    const pages=max>0?entries.slice(0,max):[];
    const visited={};
    let discovered=0,visibleLit=0;
    for(const e of entries){
      if(!e.read)continue;
      discovered++;
      if(e.setId)visited[e.setId]=true;
    }
    for(const e of pages)if(e.read)visibleLit++;
    return {
      entries,
      pages,
      discovered,
      visibleLit,
      visitedSets:Object.keys(visited).length,
      knownTotal:entries.length,
      visibleTotal:pages.length,
      hiddenTotal:Math.max(0,entries.length-pages.length)
    };
  },
  levelSecretRuneSets(idx){
    const L=LEVELS[clamp(idx|0,0,LEVELS.length-1)];
    const secrets=L&&L.secrets&&typeof L.secrets==='object'?L.secrets:null;
    return secrets&&Array.isArray(secrets.runeSets)?secrets.runeSets.map(String).filter(Boolean):[];
  },
  levelHasWaterfallSecrets(idx){
    return this.levelSecretRuneSets(idx).length>0;
  },
  levelRuneRequirements(idx){
    const ids=this.levelSecretRuneSets(idx);
    if(!ids.length)return [];
    const catalog=this.runeCatalog();
    const sets=Array.isArray(catalog.sets)?catalog.sets:[];
    return sets.filter(s=>s&&ids.includes(String(s.id)));
  },
  levelRuneStatus(idx){
    const requirements=this.levelRuneRequirements(idx);
    const progress=this.normalizeRuneProgress(this.runeProgress);
    let complete=0,read=0,total=0;
    const missing=[];
    for(const req of requirements){
      const set=progress.sets&&progress.sets[req.id];
      const setTotal=Math.max(0,(req.total||0),(set&&set.total)||0);
      const setRead=Math.max(0,(set&&set.readCount)||0);
      total+=setTotal;
      read+=Math.min(setRead,setTotal||setRead);
      if(set&&set.complete)complete++;
      else missing.push(req);
    }
    const required=requirements.length;
    return {
      required,
      complete,
      missing,
      read,
      total,
      hasRequirements:required>0,
      completeAll:required===0||complete>=required,
      label:required===0?'INGA RUNOR':(complete>=required?'RUNOR FUNNA':'RUNOR SAKNAS')
    };
  },
  levelRuneGuidance(idx){
    const status=this.levelRuneStatus(idx);
    if(!status||!status.hasRequirements)return null;
    const total=Math.max(status.total||0,status.required||0,1);
    const read=clamp(status.read||0,0,total);
    if(status.completeAll){
      return {
        complete:true,
        menuLabel:'FULL',
        briefingLines:['RUNORNA BAKOM FALLET ÄR LÄSTA'],
        resultLines:['BANA FULLBORDAD - ALLA RUNOR FUNNA'],
        entryHint:'RUNORNA HÄR ÄR REDAN LÄSTA'
      };
    }
    if(read>0){
      return {
        complete:false,
        menuLabel:'RUNOR '+read+'/'+total,
        briefingLines:['FALLETS RISTNINGAR ÄR DELVIS LÄSTA','ÅTERVÄND BAKOM VATTNET FÖR RESTEN'],
        resultLines:['BANA KLARAD - FALLETS RUNOR SAKNAS','ÅTERVÄND BAKOM VATTENFALLET'],
        entryHint:'TRYCK UPP: FORTSÄTT LÄSA RUNORNA'
      };
    }
    return {
      complete:false,
      menuLabel:'FALLRUNOR',
      briefingLines:['DET FINNS RISTNINGAR BAKOM VATTENFALLET','HÖGERKLICKA EN LÄMMEL, GÅ TILL FALLET OCH TRYCK UPP'],
      resultLines:['BANA KLARAD - FALLETS RUNOR SAKNAS','DIREKTSTYR EN LÄMMEL BAKOM VATTNET'],
      entryHint:'TRYCK UPP: GÅ BAKOM VATTENFALLET'
    };
  },
  levelFullyCompleted(idx){
    idx=clamp(idx|0,0,LEVELS.length-1);
    const status=this.levelRuneStatus(idx);
    return !!(this.cleared&&this.cleared[idx]&&status.completeAll);
  },
  levelCompletionStatus(idx){
    idx=clamp(idx|0,0,LEVELS.length-1);
    const rune=this.levelRuneStatus(idx);
    const cleared=!!(this.cleared&&this.cleared[idx]);
    return {
      cleared,
      full:cleared&&rune.completeAll,
      rune,
      hasExtra:rune.hasRequirements,
      label:!cleared?'EJ KLARAD':(rune.hasRequirements?(rune.completeAll?'FULLBORDAD':'RUNOR SAKNAS'):'KLARAD')
    };
  }
});
