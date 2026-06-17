// ------------------ VATTENFALLSGROTTA SCENER -----------------------
// Data for the "behind the waterfall" mode lives here so the mode can grow
// into a small adventure/point-and-click system without hardcoding every room
// transition in the runtime loop.
const WATERFALL_CAVE_SCENES={
  main:{
    id:'main',
    label:'Vattenfallsöppningen',
    render:'main',
    audio:'waterfall-near',
    boundsKey:'bounds',
    bounds:{minX:102,maxX:386,minY:176,maxY:304,exitX0:184,exitX1:296,exitY:218,deepX0:164,deepX1:316,deepY:298},
    map:{x:1,y:0,w:40,h:22,kind:'entrance',short:'IN'},
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
    map:{x:1,y:1,w:44,h:24,kind:'cave',short:'GR'},
    spawns:{
      fromMain:{x:240,y:190,facing:'front'},
      fromCamp:{x:240,y:278,facing:'back'}
    },
    exits:[
      {id:'toMain',key:'up',x0:180,x1:300,yMax:178,target:'main',spawn:'fromDeep',closeDeepItem:true},
      {id:'toCamp',key:'down',x0:154,x1:326,yMin:276,target:'camp',spawn:'fromDeep',requiresClosedDeepItem:true}
    ],
    objects:[
      {id:'cover',runtimeKey:'deepItem',kind:'inspectable',default:{x:246,y:252,displayScale:0.5,near:false,coverOpen:false,dismissedNear:false,coverCloseArmed:false,coverSide:'front',coverReturnBlocked:false},hit:{type:'ellipse',rx:30,ry:20},verbs:['look','turn']}
    ]
  },
  camp:{
    id:'camp',
    label:'Lagerelden',
    render:'camp',
    audio:'campfire',
    boundsKey:'campBounds',
    bounds:{minX:74,maxX:406,minY:166,maxY:306,exitX0:168,exitX1:312,exitY:182},
    map:{x:1,y:2,w:44,h:28,kind:'fire',short:'EL'},
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
    label:'Hemliga glödgången',
    render:'emberPassage',
    audio:'ember-near',
    bounds:{minX:70,maxX:398,minY:172,maxY:286},
    map:{x:0,y:2,w:42,h:24,kind:'ember',short:'GL'},
    spawns:{
      fromCamp:{x:374,y:226,facing:'left'},
      fromCrystal:{x:240,y:280,facing:'back'}
    },
    exits:[
      {id:'toCamp',key:'right',x0:392,yMin:194,yMax:270,target:'camp',spawn:'fromEmber'},
      {id:'toCrystalGallery',key:'down',x0:138,x1:330,yMin:280,target:'crystalGallery',spawn:'fromEmber'}
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
    map:{x:0,y:3,w:46,h:26,kind:'crystal',short:'KR'},
    spawns:{
      fromEmber:{x:240,y:178,facing:'front'},
      fromPool:{x:240,y:286,facing:'back'}
    },
    exits:[
      {id:'toEmberPassage',key:'up',x0:138,x1:330,yMax:172,target:'emberPassage',spawn:'fromCrystal'},
      {id:'toMirrorPool',key:'down',x0:160,x1:318,yMin:286,target:'mirrorPool',spawn:'fromCrystal'}
    ],
    objects:[
      {id:'songCrystal',kind:'crystal',default:{x:244,y:238,near:false,activated:false,pulseT:0},hit:{type:'ellipse',rx:36,ry:34},block:{type:'ellipse',rx:31,ry:23,dy:8},blocker:true,verbs:['look','touch']}
    ]
  },
  mirrorPool:{
    id:'mirrorPool',
    label:'Spegeldammen',
    render:'mirrorPool',
    audio:'distant-water',
    bounds:{minX:70,maxX:400,minY:174,maxY:286},
    map:{x:0,y:4,w:46,h:24,kind:'water',short:'SP'},
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
    audio:'church-mystery',
    bounds:{minX:76,maxX:398,minY:162,maxY:288},
    map:{x:-1,y:4,w:48,h:26,kind:'archive',short:'RU'},
    spawns:{
      fromPool:{x:384,y:228,facing:'left'},
      fromChurch:{x:240,y:282,facing:'back'}
    },
    exits:[
      {id:'toMirrorPool',key:'right',x0:392,yMin:194,yMax:268,target:'mirrorPool',spawn:'fromGlyph'},
      {id:'toChurch',key:'down',x0:154,x1:326,yMin:282,target:'church',spawn:'fromGlyph'}
    ],
    objects:[
      {id:'runeWall',kind:'runeWall',default:{x:238,y:182,near:false,activated:false,pulseT:0,readT:0},hit:{type:'rect',w:124,h:62,dy:-4},verbs:['look','read'],
        runes:[
          {id:'water',dx:-26,dy:-22,rx:19,ry:28,lines:['Runa 1/6','När vattnet döljer porten','börjar den dolda vägen.']},
          {id:'dark',dx:-7,dy:-22,rx:19,ry:28,lines:['Runa 2/6','I mörkret prövas modet,','men hjärtat söker ljus.']},
          {id:'altar',dx:15,dy:-22,rx:19,ry:28,lines:['Runa 3/6','Vid altaret väntar handen','som stilla ger välsignelse.']},
          {id:'fire',dx:-27,dy:7,rx:20,ry:24,lines:['Runa 4/6','Då mister elden sin hunger','och lågan viker undan.']},
          {id:'fall',dx:6,dy:8,rx:20,ry:24,lines:['Runa 5/6','Djupet kan inte krossa','den som bär heligt ljus.']},
          {id:'hope',dx:27,dy:9,rx:20,ry:24,lines:['Runa 6/6','Så vandrar lämmeln vidare','och hoppet följer flocken.']}
        ],
        readLines:['Runorna viskar:','Läs varje tecken i stenen','så formas hela budskapet.']},
      {id:'churchCard',kind:'viewCard',displayScale:0.5,default:{x:300,y:252,near:false,activated:false,pulseT:0,cardOpen:false,cardSide:'front',cardCloseArmed:false,dismissedNear:false},hit:{type:'ellipse',rx:22,ry:15},verbs:['look','turn'],card:{asset:'dalaFlodaChurch',backLines:['Floda kyrka']}}
    ]
  },
  church:{
    id:'church',
    label:'Kyrkan',
    render:'church',
    audio:'deep-quiet',
    bounds:{minX:86,maxX:394,minY:170,maxY:294},
    map:{x:-1,y:5,w:44,h:26,kind:'church',short:'KY'},
    spawns:{
      fromGlyph:{x:374,y:178,facing:'left'},
      fromInterior:{x:258,y:270,facing:'front'}
    },
    exits:[
      {id:'toChurchInterior',key:'up',x0:232,x1:282,yMin:250,yMax:268,target:'churchInterior',spawn:'fromDoor'},
      {id:'toGlyphArchive',key:'up',x0:118,x1:390,yMax:174,target:'glyphArchive',spawn:'fromChurch'}
    ],
    objects:[
      {id:'churchModel',kind:'churchModel',default:{x:246,y:238,near:false,activated:false,pulseT:0},hit:{type:'ellipse',rx:82,ry:40,dy:22},block:[
        {type:'rect',dx:-82,dy:8,w:58,h:72},
        {type:'rect',dx:-42,dy:6,w:76,h:86},
        {type:'rect',dx:62,dy:6,w:88,h:86},
        {type:'rect',dx:116,dy:10,w:44,h:72},
        {type:'rect',dx:18,dy:-34,w:196,h:48}
      ],blocker:true,verbs:['look','enter']}
    ]
  },
  churchInterior:{
    id:'churchInterior',
    label:'Inne i kyrkan',
    render:'churchInterior',
    audio:'church-hymn',
    bounds:{minX:78,maxX:402,minY:108,maxY:292},
    spawns:{
      fromDoor:{x:240,y:264,facing:'front'}
    },
    exits:[
      {id:'toChurchYard',key:'down',x0:176,x1:304,yMin:286,target:'church',spawn:'fromInterior'}
    ],
    objects:[
      {id:'churchAltar',kind:'altar',default:{x:240,y:135},hit:{type:'rect',w:104,h:54},block:{type:'rect',w:96,h:28},blocker:true,verbs:['look']}
    ]
  }
};

const WATERFALL_CAVE_MAP_KINDS={
  entrance:{label:'Vattenfall',color:'#6bb6d8'},
  cave:{label:'Grotta',color:'#8a7658'},
  fire:{label:'Lägereld',color:'#d07933'},
  ember:{label:'Glödgång',color:'#a64a2a'},
  crystal:{label:'Kristall',color:'#55b9d0'},
  water:{label:'Spegeldamm',color:'#4f91b8'},
  archive:{label:'Runarkiv',color:'#c0944b'},
  church:{label:'Kyrkan',color:'#d8c58a'}
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

function waterfallCaveMapKind(kind){
  return WATERFALL_CAVE_MAP_KINDS[kind]||WATERFALL_CAVE_MAP_KINDS.cave;
}

function waterfallCaveSceneMapNode(sceneId){
  const def=waterfallCaveSceneDef(sceneId);
  return def&&def.map?Object.assign({id:def.id,label:def.label||def.id},waterfallCaveCloneData(def.map)):null;
}

function waterfallCaveMapGraph(){
  const nodes=waterfallCaveSceneIds().map(id=>waterfallCaveSceneMapNode(id)).filter(Boolean);
  const links=[],seen={};
  for(const id of waterfallCaveSceneIds()){
    for(const exit of waterfallCaveSceneExits(id)){
      if(!exit||!exit.target||!waterfallCaveSceneMapNode(exit.target))continue;
      const a=id<exit.target?id:exit.target,b=id<exit.target?exit.target:id,key=a+'>'+b;
      if(seen[key])continue;
      seen[key]=true;
      links.push({from:id,to:exit.target,key:exit.key});
    }
  }
  return {nodes,links,kinds:WATERFALL_CAVE_MAP_KINDS};
}
