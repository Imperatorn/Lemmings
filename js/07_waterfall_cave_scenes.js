// ------------------ VATTENFALLSGROTTA SCENER -----------------------
// Data for the "behind the waterfall" mode lives here so the mode can grow
// into a small adventure/point-and-click system without hardcoding every room
// transition in the runtime loop.
const WATERFALL_CAVE_SCENES={
  main:{
    id:'main',
    label:'Vattenfallsoppningen',
    render:'main',
    audio:'waterfall-near',
    boundsKey:'bounds',
    bounds:{minX:102,maxX:386,minY:176,maxY:304,exitX0:184,exitX1:296,exitY:218,deepX0:164,deepX1:316,deepY:298},
    spawns:{
      entry:{x:240,y:232,facing:'front'},
      fromDeep:{x:240,y:296,facing:'back'}
    },
    exits:[
      {id:'toOutside',key:'up',x0:184,x1:296,yMax:218,target:null,reason:'walkout'},
      {id:'toDeep',key:'down',x0:164,x1:316,yMin:298,target:'deep',spawn:'fromMain'}
    ],
    objects:[
      {id:'chest',runtimeKey:'chest',kind:'loot',default:{x:342,y:226,coins:3,opened:false,collected:false,near:false,glowT:0},hit:{type:'ellipse',rx:20,ry:20},verbs:['look','open']}
    ]
  },
  deep:{
    id:'deep',
    label:'Inre grottan',
    render:'deep',
    audio:'waterfall-far',
    boundsKey:'deepBounds',
    bounds:{minX:86,maxX:394,minY:168,maxY:282,exitX0:180,exitX1:300,exitY:178,campX0:154,campX1:326,campY:276},
    spawns:{
      fromMain:{x:240,y:190,facing:'front'},
      fromCamp:{x:240,y:278,facing:'back'}
    },
    exits:[
      {id:'toMain',key:'up',x0:180,x1:300,yMax:178,target:'main',spawn:'fromDeep',closeDeepItem:true},
      {id:'toCamp',key:'down',x0:154,x1:326,yMin:276,target:'camp',spawn:'fromDeep',requiresClosedDeepItem:true}
    ],
    objects:[
      {id:'cover',runtimeKey:'deepItem',kind:'inspectable',default:{x:246,y:252,near:false,coverOpen:false,dismissedNear:false,coverCloseArmed:false,coverSide:'front',coverReturnBlocked:false},hit:{type:'ellipse',rx:30,ry:20},verbs:['look','turn']}
    ]
  },
  camp:{
    id:'camp',
    label:'Lagerelden',
    render:'camp',
    audio:'campfire',
    boundsKey:'campBounds',
    bounds:{minX:74,maxX:406,minY:166,maxY:306,exitX0:168,exitX1:312,exitY:182},
    spawns:{
      fromDeep:{x:240,y:198,facing:'front'}
    },
    exits:[
      {id:'toDeep',key:'up',x0:168,x1:312,yMax:182,target:'deep',spawn:'fromCamp',markCoverReturn:true}
    ],
    objects:[
      {id:'campFire',runtimeKey:'campFire',kind:'hazard',default:{x:318,y:244,rx:54,ry:30},hit:{type:'ellipse',rx:54,ry:30,dy:8},blocker:true,verbs:['look']}
    ]
  }
};

function waterfallCaveCloneData(v){
  return v==null?v:JSON.parse(JSON.stringify(v));
}

function waterfallCaveSceneIds(){
  return Object.keys(WATERFALL_CAVE_SCENES);
}

function waterfallCaveSceneDef(id){
  return WATERFALL_CAVE_SCENES[id]||WATERFALL_CAVE_SCENES.main;
}

function waterfallCaveSceneRenderKey(caveOrId){
  const id=typeof caveOrId==='string'?caveOrId:(caveOrId&&caveOrId.scene)||'main';
  const def=waterfallCaveSceneDef(id);
  return def.render||def.id||'main';
}

function waterfallCaveSceneBoundsFor(cave,sceneId){
  const def=waterfallCaveSceneDef(sceneId||(cave&&cave.scene)||'main');
  return (cave&&def.boundsKey&&cave[def.boundsKey])||def.bounds||{};
}

function waterfallCaveSceneSpawn(sceneId,spawnId){
  const def=waterfallCaveSceneDef(sceneId);
  return waterfallCaveCloneData((def.spawns&&(def.spawns[spawnId]||def.spawns.entry||def.spawns.fromDeep))||null);
}

function waterfallCaveSceneObjects(sceneId){
  const def=waterfallCaveSceneDef(sceneId);
  return def.objects||[];
}

function waterfallCaveSceneExits(sceneId){
  const def=waterfallCaveSceneDef(sceneId);
  return def.exits||[];
}

function waterfallCaveObjectDefault(sceneId,objectId){
  const obj=(waterfallCaveSceneObjects(sceneId)||[]).find(o=>o&&o.id===objectId);
  return waterfallCaveCloneData(obj&&obj.default||null);
}
