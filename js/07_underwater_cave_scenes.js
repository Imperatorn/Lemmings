// Data for the underwater cave mode. Keep this separate from normal water
// physics so the adventure rooms can grow without changing regular levels.
const UNDERWATER_CAVE_SCENES={
  entryPool:{
    id:'entryPool',
    label:'Under ytan',
    render:'entryPool',
    bounds:{minX:58,maxX:424,minY:58,maxY:274},
    map:{x:0,y:0,w:44,h:24,kind:'entry',short:'YT'},
    spawns:{
      entry:{x:240,y:96,facing:'front'},
      fromTunnel:{x:392,y:184,facing:'left'}
    },
    exits:[
      {id:'toSurface',key:'up',yMax:64,target:null,reason:'surface'},
      {id:'toSiltTunnel',key:'right',xMin:418,yMin:116,yMax:246,target:'siltTunnel',spawn:'fromPool'}
    ],
    objects:[
      {id:'surfaceLight',kind:'glow',default:{x:240,y:62,near:false,pulseT:0,hintT:0,hintLines:['LJUSET DARRAR OVANFÖR','UPP TAR DIG TILLBAKA']},hit:{type:'ellipse',rx:78,ry:22},verbs:['look']}
    ]
  },
  siltTunnel:{
    id:'siltTunnel',
    label:'Slamtunneln',
    render:'siltTunnel',
    bounds:{minX:56,maxX:424,minY:82,maxY:258},
    map:{x:1,y:0,w:54,h:22,kind:'tunnel',short:'SL'},
    spawns:{
      fromPool:{x:78,y:184,facing:'right'},
      fromBell:{x:382,y:126,facing:'left'},
      fromReef:{x:236,y:250,facing:'back'}
    },
    exits:[
      {id:'toPool',key:'left',xMax:62,yMin:116,yMax:246,target:'entryPool',spawn:'fromTunnel'},
      {id:'toAirBell',key:'right',xMin:418,yMin:86,yMax:168,target:'airBell',spawn:'fromTunnel'},
      {id:'toCrystalReef',key:'down',x0:148,x1:324,yMin:254,target:'crystalReef',spawn:'fromTunnel'}
    ],
    objects:[
      {id:'shellEcho',kind:'shell',default:{x:246,y:158,near:false,pulseT:0,hintT:0,hintLines:['SNÄCKAN SVARAR MED ETT LÅGT EKO','NÅGOT RÖR SIG DJUPARE IN']},hit:{type:'ellipse',rx:34,ry:22},verbs:['look','touch']}
    ]
  },
  airBell:{
    id:'airBell',
    label:'Luftklockan',
    render:'airBell',
    bounds:{minX:70,maxX:410,minY:78,maxY:258},
    map:{x:2,y:-1,w:44,h:25,kind:'air',short:'LU'},
    spawns:{
      fromTunnel:{x:78,y:132,facing:'right'},
      fromArchive:{x:248,y:254,facing:'back'}
    },
    exits:[
      {id:'toTunnel',key:'left',xMax:76,yMin:92,yMax:176,target:'siltTunnel',spawn:'fromBell'},
      {id:'toArchive',key:'down',x0:154,x1:330,yMin:254,target:'sunkenArchive',spawn:'fromBell'}
    ],
    objects:[
      {id:'airPocket',kind:'airPocket',default:{x:244,y:96,near:false,pulseT:0,hintT:0,hintLines:['HÄR FINNS EN STILLASTÅENDE LUFTFICKA','DEN HELIGA LÄMMELN KAN VILA HÄR']},hit:{type:'ellipse',rx:62,ry:34},verbs:['rest']}
    ]
  },
  crystalReef:{
    id:'crystalReef',
    label:'Kristallrevet',
    render:'crystalReef',
    bounds:{minX:62,maxX:416,minY:78,maxY:270},
    map:{x:1,y:1,w:50,h:28,kind:'crystal',short:'KR'},
    spawns:{
      fromTunnel:{x:238,y:82,facing:'front'},
      fromArchive:{x:384,y:216,facing:'left'}
    },
    exits:[
      {id:'toTunnel',key:'up',x0:148,x1:324,yMax:84,target:'siltTunnel',spawn:'fromReef'},
      {id:'toArchive',key:'right',xMin:410,yMin:158,yMax:260,target:'sunkenArchive',spawn:'fromReef'}
    ],
    objects:[
      {id:'blueCrystal',kind:'crystal',default:{x:258,y:202,near:false,pulseT:0,hintT:0,hintLines:['KRISTALLEN PULSERAR I VATTNET','DEN VERKAR VÄNTA PÅ EN FRAMTIDA HEMLIGHET']},hit:{type:'ellipse',rx:40,ry:42},block:{type:'ellipse',rx:34,ry:26,dy:8},blocker:true,verbs:['look','touch']}
    ]
  },
  sunkenArchive:{
    id:'sunkenArchive',
    label:'Det sjunkna arkivet',
    render:'sunkenArchive',
    bounds:{minX:78,maxX:402,minY:90,maxY:260},
    map:{x:2,y:1,w:52,h:28,kind:'archive',short:'AR'},
    spawns:{
      fromBell:{x:244,y:96,facing:'front'},
      fromReef:{x:92,y:218,facing:'right'}
    },
    exits:[
      {id:'toAirBell',key:'up',x0:154,x1:330,yMax:96,target:'airBell',spawn:'fromArchive'},
      {id:'toCrystalReef',key:'left',xMax:84,yMin:158,yMax:260,target:'crystalReef',spawn:'fromArchive'}
    ],
    objects:[
      {id:'sealedRunes',kind:'sealedRunes',default:{x:242,y:174,near:false,pulseT:0,hintT:0,hintLines:['FÖRSEGLADE SPECIALRUNOR','DE ÄR INTE REDO ATT LÄSAS ÄN']},hit:{type:'rect',w:136,h:60,dy:-6},verbs:['read']}
    ]
  }
};

function underwaterCaveCloneData(v){
  if(v==null||typeof v!=='object')return v;
  if(Array.isArray(v))return v.map(underwaterCaveCloneData);
  const out={};
  for(const k in v)out[k]=underwaterCaveCloneData(v[k]);
  return out;
}
function underwaterCaveSceneDef(id){
  return UNDERWATER_CAVE_SCENES[String(id||'entryPool')]||UNDERWATER_CAVE_SCENES.entryPool;
}
function underwaterCaveSceneIds(){
  return Object.keys(UNDERWATER_CAVE_SCENES);
}
function underwaterCaveSceneBoundsFor(cave,sceneId){
  const def=underwaterCaveSceneDef(sceneId||(cave&&cave.scene)||'entryPool');
  return underwaterCaveCloneData(def.bounds||{minX:60,maxX:420,minY:70,maxY:282});
}
function underwaterCaveSceneSpawn(sceneId,spawnId){
  const def=underwaterCaveSceneDef(sceneId);
  return underwaterCaveCloneData((def.spawns&&(def.spawns[spawnId]||def.spawns.entry))||{x:240,y:150,facing:'front'});
}
function underwaterCaveSceneObjects(sceneId){
  const def=underwaterCaveSceneDef(sceneId);
  return underwaterCaveCloneData(def.objects||[]);
}
function underwaterCaveSceneExits(sceneId){
  const def=underwaterCaveSceneDef(sceneId);
  return underwaterCaveCloneData(def.exits||[]);
}
function underwaterCaveMapGraph(){
  const nodes=underwaterCaveSceneIds().map(id=>{
    const def=underwaterCaveSceneDef(id);
    return def&&def.map?Object.assign({id,label:def.label||id},underwaterCaveCloneData(def.map)):null;
  }).filter(Boolean);
  const links=[];
  for(const id of underwaterCaveSceneIds()){
    for(const e of underwaterCaveSceneExits(id)){
      if(e&&e.target&&underwaterCaveSceneDef(e.target))links.push({from:id,to:e.target});
    }
  }
  return {nodes,links};
}
