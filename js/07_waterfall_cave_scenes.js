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
      fromDeep:{x:240,y:198,facing:'front'},
      fromEmber:{x:88,y:226,facing:'right'}
    },
    exits:[
      {id:'toDeep',key:'up',x0:168,x1:312,yMax:182,target:'deep',spawn:'fromCamp',markCoverReturn:true},
      {id:'toEmberPassage',key:'left',x1:82,yMin:194,yMax:270,target:'emberPassage',spawn:'fromCamp'}
    ],
    objects:[
      {id:'campFire',runtimeKey:'campFire',kind:'hazard',default:{x:318,y:244,rx:54,ry:30},hit:{type:'ellipse',rx:54,ry:30,dy:8},blocker:true,verbs:['look']}
    ]
  },
  emberPassage:{
    id:'emberPassage',
    label:'Hemliga glodgangen',
    render:'emberPassage',
    audio:'ember-near',
    bounds:{minX:70,maxX:398,minY:172,maxY:286},
    spawns:{
      fromCamp:{x:374,y:226,facing:'left'},
      fromCrystal:{x:88,y:236,facing:'right'}
    },
    exits:[
      {id:'toCamp',key:'right',x0:392,yMin:194,yMax:270,target:'camp',spawn:'fromEmber'},
      {id:'toCrystalGalleryUp',key:'up',x0:138,x1:330,yMax:178,target:'crystalGallery',spawn:'fromEmber'},
      {id:'toCrystalGallery',key:'left',x1:76,yMin:188,yMax:276,target:'crystalGallery',spawn:'fromEmber'}
    ],
    objects:[
      {id:'wallTorch',kind:'torch',default:{x:130,y:148,near:false,activated:true,pulseT:0},hit:{type:'ellipse',rx:28,ry:34},verbs:['look','use']},
      {id:'looseStone',kind:'stone',default:{x:236,y:254,near:false,activated:false,pulseT:0},hit:{type:'ellipse',rx:24,ry:16},verbs:['look','push']}
    ]
  },
  crystalGallery:{
    id:'crystalGallery',
    label:'Kristallgalleriet',
    render:'crystalGallery',
    audio:'deep-quiet',
    bounds:{minX:76,maxX:396,minY:166,maxY:292},
    spawns:{
      fromEmber:{x:380,y:232,facing:'left'},
      fromPool:{x:240,y:286,facing:'back'}
    },
    exits:[
      {id:'toEmberPassage',key:'right',x0:390,yMin:190,yMax:276,target:'emberPassage',spawn:'fromCrystal'},
      {id:'toMirrorPool',key:'down',x0:160,x1:318,yMin:286,target:'mirrorPool',spawn:'fromCrystal'}
    ],
    objects:[
      {id:'songCrystal',kind:'crystal',default:{x:244,y:238,near:false,activated:false,pulseT:0},hit:{type:'ellipse',rx:36,ry:34},verbs:['look','touch']}
    ]
  },
  mirrorPool:{
    id:'mirrorPool',
    label:'Spegeldammen',
    render:'mirrorPool',
    audio:'distant-water',
    bounds:{minX:70,maxX:400,minY:174,maxY:286},
    spawns:{
      fromCrystal:{x:240,y:184,facing:'front'},
      fromGlyph:{x:86,y:230,facing:'right'}
    },
    exits:[
      {id:'toCrystalGallery',key:'up',x0:170,x1:310,yMax:178,target:'crystalGallery',spawn:'fromPool'},
      {id:'toGlyphArchive',key:'left',x1:76,yMin:196,yMax:268,target:'glyphArchive',spawn:'fromPool'}
    ],
    objects:[
      {id:'mirrorPool',kind:'pool',default:{x:250,y:246,near:false,activated:false,pulseT:0,rippleT:0},hit:{type:'ellipse',rx:78,ry:24,dy:2},blocker:true,verbs:['look','touch']}
    ]
  },
  glyphArchive:{
    id:'glyphArchive',
    label:'Runarkivet',
    render:'glyphArchive',
    audio:'deep-quiet',
    bounds:{minX:76,maxX:398,minY:162,maxY:288},
    spawns:{
      fromPool:{x:384,y:228,facing:'left'},
      fromRoot:{x:240,y:282,facing:'back'}
    },
    exits:[
      {id:'toMirrorPool',key:'right',x0:392,yMin:194,yMax:268,target:'mirrorPool',spawn:'fromGlyph'},
      {id:'toRootSanctum',key:'down',x0:162,x1:318,yMin:282,target:'rootSanctum',spawn:'fromGlyph'}
    ],
    objects:[
      {id:'runeWall',kind:'runeWall',default:{x:238,y:182,near:false,activated:false,pulseT:0},hit:{type:'rect',w:124,h:62,dy:-4},verbs:['look','read']},
      {id:'churchCard',kind:'viewCard',default:{x:328,y:252,near:false,activated:false,pulseT:0,cardOpen:false,cardSide:'front',cardCloseArmed:false,dismissedNear:false},hit:{type:'ellipse',rx:20,ry:14},verbs:['look','turn'],card:{asset:'dalaFlodaChurch',backLines:['Dala-Floda kyrka']}}
    ]
  },
  rootSanctum:{
    id:'rootSanctum',
    label:'Rotsanktumet',
    render:'rootSanctum',
    audio:'deep-quiet',
    bounds:{minX:86,maxX:394,minY:170,maxY:294},
    spawns:{
      fromGlyph:{x:240,y:184,facing:'front'}
    },
    exits:[
      {id:'toGlyphArchive',key:'up',x0:168,x1:312,yMax:174,target:'glyphArchive',spawn:'fromRoot'}
    ],
    objects:[
      {id:'rootHeart',kind:'rootHeart',default:{x:246,y:250,near:false,activated:false,pulseT:0},hit:{type:'ellipse',rx:42,ry:32},verbs:['look','touch']}
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
