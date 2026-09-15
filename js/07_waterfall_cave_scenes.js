// ------------------ VATTENFALLSGROTTA SCENER -----------------------
// Data for the "behind the waterfall" mode lives here so the mode can grow
// into a small adventure/point-and-click system without hardcoding every room
// transition in the runtime loop.
const RUNE_KIND_SURFACE='surface';
const RUNE_KIND_DEEP='deep';
const SURFACE_RUNE_TOTAL=32;
const DEEP_RUNE_TOTAL=10;

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
      {id:'cover',runtimeKey:'deepItem',kind:'inspectable',default:{x:246,y:252,displayScale:0.5,near:false,coverOpen:false,dismissedNear:false,coverCloseArmed:false,coverSide:'front',coverReturnBlocked:false,coverAsset:'landsOfLoreCover',coverRect:{x:150,y:30,w:180,h:225},coverBackLines:['Utvecklat av','Johan Forsberg.','','Till Valdemar,','Tage och Elis.','','Betatestare:','Micke och Calle','']},hit:{type:'ellipse',rx:33,ry:22},verbs:['look','turn']}
    ]
  },
  camp:{
    id:'camp',
    label:'Lägerelden',
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
      {id:'songCrystal',kind:'crystal',nearScale:1.45,default:{x:244,y:238,near:false,activated:false,pulseT:0,chargeT:0,hintT:0,hintLines:null},hit:{type:'ellipse',rx:36,ry:34},block:{type:'ellipse',rx:31,ry:23,dy:8},blocker:true,verbs:['look','touch','charge']}
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
      {id:'mirrorPool',kind:'pool',default:{x:250,y:246,near:false,activated:false,pulseT:0,rippleT:0,splashT:0,splashX:0,splashY:0,splashSeed:0},hit:{type:'ellipse',rx:78,ry:24,dy:2},blocker:true,verbs:['look','touch']},
      {id:'mirrorThrowStones',kind:'throwStonePile',default:{x:132,y:262,near:false,activated:false,pulseT:0,pickedT:0},hit:{type:'ellipse',rx:28,ry:16},verbs:['take','throw']}
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
      {id:'runeWall',kind:'runeWall',runeSetSource:'levelSecret',runeSet:{id:'waterfall.glyphArchive',title:'Vägen hem',source:'Runarkivet',world:'Bakom vattenfallet',order:1},default:{x:238,y:182,near:false,activated:false,pulseT:0,readT:0},hit:{type:'rect',w:124,h:62,dy:-4},verbs:['look','read'],
        readLines:['Vandrarnas runor','Här finns spår av vägen hem.']},
      {id:'churchCard',kind:'viewCard',displayScale:0.5,default:{x:300,y:252,near:false,activated:false,pulseT:0,cardOpen:false,cardSide:'front',cardCloseArmed:false,dismissedNear:false},hit:{type:'ellipse',rx:27,ry:18},verbs:['look','turn'],card:{asset:'dalaFlodaChurch',backLines:['Floda kyrka']}}
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

const WATERFALL_CAVE_VARIANTS={
  flodaChurch:{
    id:'flodaChurch',
    label:'Floda kyrkgrotta',
    archiveStyle:'floda',
    stoneInscription:{title:'BROSTENEN',glyph:'bridge',color:'#d99a54',lines:['Vi sökte också vägen hem.','Våra runor finns längre in.']},
    hiddenScenes:[],
    scenes:{}
  },
  darkForestArchive:{
    id:'darkForestArchive',
    label:'Skogens runarkiv',
    archiveStyle:'forest',
    stoneInscription:{title:'ROTSTENEN',glyph:'root',color:'#8fb96a',lines:['Lyktan gick först i natten.','Vi andra följde efter.']},
    hiddenScenes:['church','churchInterior'],
    scenes:{
      deep:{objectDefaults:{cover:{coverAsset:'amigaA1200Cover',coverRect:{x:84,y:46,w:312,h:208},coverBackLines:['Tack till Anders Gunderson']}}},
      glyphArchive:{removeExits:['toChurch'],removeObjects:['churchCard']}
    }
  },
  marbleArchive:{
    id:'marbleArchive',
    label:'Marmorns runarkiv',
    archiveStyle:'marble',
    stoneInscription:{title:'MARMORSTENEN',glyph:'vein',color:'#e6dcc2',lines:['Stenen bär våra minnen.','Läs dem innan ni går.']},
    hiddenScenes:['church','churchInterior'],
    scenes:{glyphArchive:{removeExits:['toChurch'],removeObjects:['churchCard']}}
  },
  forestRavineArchive:{
    id:'forestRavineArchive',
    label:'Ravinens runarkiv',
    archiveStyle:'ravine',
    stoneInscription:{title:'RAVINSTENEN',glyph:'rope',color:'#b9d68a',lines:['En gick över med repet.','Sedan kunde fler följa.']},
    hiddenScenes:['church','churchInterior'],
    scenes:{glyphArchive:{removeExits:['toChurch'],removeObjects:['churchCard']}}
  },
  doublePondsArchive:{
    id:'doublePondsArchive',
    label:'Dammarnas runarkiv',
    archiveStyle:'water',
    stoneInscription:{title:'DAMMSTENEN',glyph:'waves',color:'#9eefff',lines:['Sex ringar kring dammen.','Vi kastade en sten till.']},
    hiddenScenes:['church','churchInterior'],
    scenes:{glyphArchive:{removeExits:['toChurch'],removeObjects:['churchCard']}}
  },
  chaosArchive:{
    id:'chaosArchive',
    label:'Kaosets runarkiv',
    archiveStyle:'chaos',
    stoneInscription:{title:'KAOSSTENEN',glyph:'fracture',color:'#ff6a80',lines:['Vi tappade vägen,','men inte varandra.']},
    hiddenScenes:['church','churchInterior'],
    scenes:{glyphArchive:{removeExits:['toChurch'],removeObjects:['churchCard']}}
  },
  masterTrialArchive:{
    id:'masterTrialArchive',
    label:'Mästarprovets runarkiv',
    archiveStyle:'master',
    stoneInscription:{title:'MÄSTARSTENEN',glyph:'crown',color:'#d8b65a',lines:['Vägen hem går uppåt.','De sista orden sjönk.']},
    hiddenScenes:['church','churchInterior'],
    scenes:{glyphArchive:{removeExits:['toChurch'],removeObjects:['churchCard']}}
  }
};

// These IDs belong to saved discoveries; narrative titles may change independently.
const WATERFALL_CAVE_RUNE_LAYOUT=[
  {id:'water',title:'Vattnet',dx:-26,dy:-22,rx:19,ry:28},
  {id:'dark',title:'Mörkret',dx:-7,dy:-22,rx:19,ry:28},
  {id:'altar',title:'Altaret',dx:15,dy:-22,rx:19,ry:28},
  {id:'fire',title:'Elden',dx:-27,dy:7,rx:20,ry:24},
  {id:'fall',title:'Djupet',dx:6,dy:8,rx:20,ry:24},
  {id:'hope',title:'Hoppet',dx:27,dy:9,rx:20,ry:24}
];

const WATERFALL_CAVE_RUNE_SETS={
  'waterfall.glyphArchive':waterfallCaveMakeRuneSet('waterfall.glyphArchive','Vägen hem',1,[
    {title:'Hemmet',lines:['Vårt hem ligger ovanför molnen.','Där finns plats för hela flocken.']},
    {title:'Stormen',lines:['Stormen bröt den gamla molnvägen.','Sedan dess söker vi en väg tillbaka.']},
    {title:'Bron',lines:['Vi byggde bron för dem som kom efter.','Ingen skulle behöva gå ensam.']},
    {title:'Ljuset',lines:['I kyrkan längre in tog vi emot ljuset.','Det bar vi med oss genom mörkret.']},
    {title:'Spåren',lines:['Sju arkiv på land bevarar vår färd.','Läs våra spår och hjälp de andra hem.']}
  ]),
  'waterfall.darkForest':waterfallCaveMakeRuneSet('waterfall.darkForest','Natten i skogen',2,[
    {title:'Längtan',lines:['Under träden såg vi inte himlen.','Ändå mindes vi hur det var där hemma.']},
    {title:'Lyktan',lines:['En av oss bar lyktan längs stigen.','Vi höll oss nära varandra.']},
    {title:'Lägerelden',lines:['Vid elden värmde vi våra händer.','Någon berättade om trädgårdarna hemma.']},
    {title:'Välsignelsen',lines:['Kyrkans ljus slocknar inte i vatten.','Men ljuset gör inte simtagen starkare.']},
    {title:'Morgonen',lines:['När natten var över gick vi vidare.','Hemmet fanns kvar, fast vägen saknades.']}
  ]),
  'waterfall.marbleCave':waterfallCaveMakeRuneSet('waterfall.marbleCave','Minnen i marmor',3,[
    {title:'Arkiven',lines:['Bakom fallen bevarade vi våra minnen.','Vattnet skyddade dem från stormen.']},
    {title:'Arken',lines:['Trettiotvå ark bevarar vår färd på land.','Läser du en runa, vaknar ett av arken.']},
    {title:'Minnet',lines:['Arken minns samma ord i alla grottor.','Deras ljus följer dig från arkiv till arkiv.']},
    {title:'Portalstenen',lines:['Portalstenen kan förena två platser.','Den heliga bäraren visar vägen.']},
    {title:'Kristallen',lines:['När stenen mörknar söker vi kristallen.','Där kan den få kraft igen.']}
  ]),
  'waterfall.forestRavine':waterfallCaveMakeRuneSet('waterfall.forestRavine','Över ravinen',4,[
    {title:'Avståndet',lines:['Från kanten syntes nästa stig.','Vi fick bygga vägen dit tillsammans.']},
    {title:'Repet',lines:['Den första fäste repet i berget.','De andra klättrade efter.']},
    {title:'Väntan',lines:['Vi väntade medan bron blev klar.','Sedan kom hela flocken över.']},
    {title:'De instängda',lines:['Längs vägen fann vi fler av vår sort.','Vi öppnade deras burar.']},
    {title:'Flocken',lines:['Vägen hem var inte bara vår.','De vi mötte fick följa med.']}
  ]),
  'waterfall.doublePonds':waterfallCaveMakeRuneSet('waterfall.doublePonds','Vid spegeldammen',5,[
    {title:'Spegeln',lines:['Vi såg molnen speglas i dammarna.','Så nära i vattnet, så långt från oss.']},
    {title:'Spegeldammen',lines:['I grottans damm räknade vi våra kast.','Det sjunde fick stenen att stiga.']},
    {title:'Simfötterna',lines:['På stenen låg svarta simfötter.','Med dem nådde vi längre under ytan.']},
    {title:'Djupet',lines:['Det sista arkivet sjönk med molnvägen.','Dess ord finns kvar under vatten.']}
  ]),
  'waterfall.chaosMap':waterfallCaveMakeRuneSet('waterfall.chaosMap','Kaosets ordning',6,[
    {title:'Omvägarna',lines:['Vi kom genom hetta, skog och sten.','Ingen av vägarna gick rakt hem.']},
    {title:'Verktygen',lines:['Det krävdes mer än ett par starka händer.','Vi byggde, grävde och hjälptes åt.']},
    {title:'Mörkret i vattnet',lines:['I djupet sträckte sig armar efter oss.','Kyrkans ljus drev dem tillbaka.']},
    {title:'Fortsättningen',lines:['När alla ark lyser, sök under ytan.','Ta både ljuset och simfötterna med.']}
  ]),
  'waterfall.masterTrial':waterfallCaveMakeRuneSet('waterfall.masterTrial','Vid världens kant',7,[
    {title:'Den sista marken',lines:['Här slutar vår vandring på marken.','Hemmet väntar fortfarande ovanför oss.']},
    {title:'De förlorade orden',lines:['Tio runor vilar i det sjunkna arkivet.','De beskriver vägen upp till molnen.']},
    {title:'Det heliga ljuset',lines:['En vanlig lampa visar vägen i vattnet.','Men bara heligt ljus väcker djuprunorna.']},
    {title:'Hemvägen',lines:['För flocken hit och läs de sista orden.','Då kan färden genom himlen börja.']}
  ])
};

function waterfallCaveMakeRuneSet(id,title,order,parts){
  const total=parts.length;
  return {
    runeSet:{id,title,source:'Runarkivet',world:'Bakom vattenfallet',order,kind:RUNE_KIND_SURFACE},
    readLines:['Vandrarnas runor',title,'Här finns spår av vägen hem.'],
    runes:parts.map((part,i)=>{
      return Object.assign({},WATERFALL_CAVE_RUNE_LAYOUT[i],{title:part.title,kind:RUNE_KIND_SURFACE,lines:['Runa '+(i+1)+'/'+total].concat(part.lines)});
    })
  };
}

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

function waterfallCaveVariant(id){
  return WATERFALL_CAVE_VARIANTS[String(id||'flodaChurch')]||WATERFALL_CAVE_VARIANTS.flodaChurch;
}

function waterfallCaveVariantId(id){
  return waterfallCaveVariant(id).id;
}

function waterfallCaveSceneVariantConfig(variantId,sceneId){
  const v=waterfallCaveVariant(variantId);
  return (v.scenes&&v.scenes[sceneId])||{};
}

function waterfallCaveSceneAllowed(sceneId,variantId){
  if(!WATERFALL_CAVE_SCENES[sceneId])return false;
  const hidden=waterfallCaveVariant(variantId).hiddenScenes||[];
  return !hidden.includes(sceneId);
}

function waterfallCaveApplySceneVariant(raw,variantId){
  if(!raw||!waterfallCaveSceneAllowed(raw.id,variantId))return null;
  const out=waterfallCaveCloneData(raw);
  const v=waterfallCaveVariant(variantId);
  const cfg=waterfallCaveSceneVariantConfig(v.id,out.id);
  out.variantId=v.id;
  out.archiveStyle=v.archiveStyle||'floda';
  if(out.id==='emberPassage'&&v.stoneInscription&&Array.isArray(out.objects)){
    for(const obj of out.objects){
      if(obj&&obj.id==='looseStone')obj.inscription=waterfallCaveCloneData(v.stoneInscription);
    }
  }
  for(const key of ['label','render','audio']){
    if(cfg[key]!=null)out[key]=cfg[key];
  }
  if(cfg.map)out.map=Object.assign({},out.map||{},waterfallCaveCloneData(cfg.map));
  if(cfg.bounds)out.bounds=Object.assign({},out.bounds||{},waterfallCaveCloneData(cfg.bounds));
  if(Array.isArray(cfg.removeExits)&&cfg.removeExits.length){
    out.exits=(out.exits||[]).filter(e=>e&&!cfg.removeExits.includes(e.id));
  }
  if(Array.isArray(cfg.addExits)&&cfg.addExits.length){
    out.exits=(out.exits||[]).concat(waterfallCaveCloneData(cfg.addExits));
  }
  if(Array.isArray(cfg.removeObjects)&&cfg.removeObjects.length){
    out.objects=(out.objects||[]).filter(o=>o&&!cfg.removeObjects.includes(o.id));
  }
  if(cfg.objectDefaults&&Array.isArray(out.objects)){
    for(const obj of out.objects){
      const patch=obj&&cfg.objectDefaults[obj.id];
      if(patch)obj.default=Object.assign({},obj.default||{},waterfallCaveCloneData(patch));
    }
  }
  if(Array.isArray(cfg.addObjects)&&cfg.addObjects.length){
    out.objects=(out.objects||[]).concat(waterfallCaveCloneData(cfg.addObjects));
  }
  return out;
}

function waterfallCaveSceneIds(variantId){
  return Object.keys(WATERFALL_CAVE_SCENES).filter(id=>waterfallCaveSceneAllowed(id,variantId));
}

function waterfallCaveSceneDef(id,variantId){
  const sceneId=WATERFALL_CAVE_SCENES[id]?id:'main';
  return waterfallCaveApplySceneVariant(WATERFALL_CAVE_SCENES[sceneId],variantId);
}

function waterfallCaveSceneRenderKey(caveOrId,variantId){
  const id=typeof caveOrId==='string'?caveOrId:(caveOrId&&caveOrId.scene)||'main';
  const def=waterfallCaveSceneDef(id,variantId||(caveOrId&&caveOrId.variantId));
  return def?(def.render||def.id||'main'):(id||'main');
}

function waterfallCaveSceneBoundsFor(cave,sceneId){
  const def=waterfallCaveSceneDef(sceneId||(cave&&cave.scene)||'main',cave&&cave.variantId);
  if(!def)return {};
  return (cave&&def.boundsKey&&cave[def.boundsKey])||def.bounds||{};
}

function waterfallCaveSceneSpawn(sceneId,spawnId,variantId){
  const def=waterfallCaveSceneDef(sceneId,variantId);
  if(!def)return null;
  return waterfallCaveCloneData((def.spawns&&(def.spawns[spawnId]||def.spawns.entry||def.spawns.fromDeep))||null);
}

function waterfallCaveSceneObjects(sceneId,variantId){
  if(sceneId&&typeof sceneId==='object'){
    variantId=variantId||sceneId.variantId;
    sceneId=sceneId.scene;
  }
  const def=waterfallCaveSceneDef(sceneId,variantId);
  if(!def)return [];
  return def.objects||[];
}

function waterfallCaveSceneExits(sceneId,variantId){
  if(sceneId&&typeof sceneId==='object'){
    variantId=variantId||sceneId.variantId;
    sceneId=sceneId.scene;
  }
  const def=waterfallCaveSceneDef(sceneId,variantId);
  if(!def)return [];
  return def.exits||[];
}

function waterfallCaveObjectDefault(sceneId,objectId,variantId){
  const obj=(waterfallCaveSceneObjects(sceneId,variantId)||[]).find(o=>o&&o.id===objectId);
  return waterfallCaveCloneData(obj&&obj.default||null);
}

function waterfallCaveRuneSetOrder(){
  return Object.keys(WATERFALL_CAVE_RUNE_SETS).map(id=>{
    const set=(WATERFALL_CAVE_RUNE_SETS[id]&&WATERFALL_CAVE_RUNE_SETS[id].runeSet)||{};
    return {
      id,
      order:Number.isFinite(set.order)?set.order:9999,
      title:String(set.title||id)
    };
  }).sort((a,b)=>(a.order-b.order)||a.title.localeCompare(b.title)||a.id.localeCompare(b.id));
}

function waterfallCaveSurfaceRuneLimit(setId){
  const ordered=waterfallCaveRuneSetOrder();
  const idx=ordered.findIndex(s=>s.id===String(setId||''));
  if(idx<0||!ordered.length)return 0;
  const base=Math.floor(SURFACE_RUNE_TOTAL/ordered.length);
  const extra=SURFACE_RUNE_TOTAL%ordered.length;
  return Math.max(0,Math.min(WATERFALL_CAVE_RUNE_LAYOUT.length,base+(idx<extra?1:0)));
}

function waterfallCaveApplySurfaceRuneLimit(raw,setId){
  const out=waterfallCaveCloneData(raw);
  if(!out)return out;
  const id=String(setId||(out.runeSet&&out.runeSet.id)||'');
  const limit=waterfallCaveSurfaceRuneLimit(id);
  out.runeSet=Object.assign({},out.runeSet||{},{kind:RUNE_KIND_SURFACE,total:limit});
  out.runes=(Array.isArray(out.runes)?out.runes:[]).slice(0,limit).map((r,i)=>{
    const rr=Object.assign({},r,{kind:RUNE_KIND_SURFACE,total:limit});
    if(Array.isArray(rr.lines)&&rr.lines.length)rr.lines=['Runa '+(i+1)+'/'+limit].concat(rr.lines.slice(1));
    return rr;
  });
  return out;
}

function waterfallCaveRuneSet(id){
  const setId=String(id||'');
  return waterfallCaveApplySurfaceRuneLimit(WATERFALL_CAVE_RUNE_SETS[setId]||null,setId);
}

function waterfallCaveRuneObjectForSet(sceneId,obj,setId){
  const out=waterfallCaveCloneData(obj||{});
  const selected=waterfallCaveRuneSet(setId)||(out.runeSet&&waterfallCaveRuneSet(out.runeSet.id));
  if(!selected)return out;
  out.runeSet=selected.runeSet;
  out.runes=selected.runes;
  if(selected.readLines)out.readLines=selected.readLines;
  return out;
}

function waterfallCaveMapKind(kind){
  return WATERFALL_CAVE_MAP_KINDS[kind]||WATERFALL_CAVE_MAP_KINDS.cave;
}

function waterfallCaveSceneMapNode(sceneId,variantId){
  const def=waterfallCaveSceneDef(sceneId,variantId);
  return def&&def.map?Object.assign({id:def.id,label:def.label||def.id},waterfallCaveCloneData(def.map)):null;
}

function waterfallCaveMapGraph(variantId){
  const nodes=waterfallCaveSceneIds(variantId).map(id=>waterfallCaveSceneMapNode(id,variantId)).filter(Boolean);
  const links=[],seen={};
  for(const id of waterfallCaveSceneIds(variantId)){
    for(const exit of waterfallCaveSceneExits(id,variantId)){
      if(!exit||!exit.target||!waterfallCaveSceneMapNode(exit.target,variantId))continue;
      const a=id<exit.target?id:exit.target,b=id<exit.target?exit.target:id,key=a+'>'+b;
      if(seen[key])continue;
      seen[key]=true;
      links.push({from:id,to:exit.target,key:exit.key});
    }
  }
  return {nodes,links,kinds:WATERFALL_CAVE_MAP_KINDS};
}

function waterfallCaveRuneSetMeta(sceneId,obj){
  const raw=obj&&obj.runeSet||{};
  const objectId=String(obj&&obj.id||'runes');
  const id=String(raw.id||obj&&obj.setId||('waterfall.'+String(sceneId||'scene')+'.'+objectId));
  return {
    id,
    title:String(raw.title||obj&&obj.title||'Runor'),
    source:String(raw.source||waterfallCaveSceneDef(sceneId).label||sceneId||'Okänd plats'),
    world:String(raw.world||'Bakom vattenfallet'),
    order:Number.isFinite(raw.order)?raw.order:0,
    kind:String(raw.kind||RUNE_KIND_SURFACE),
    sceneId:String(sceneId||''),
    objectId
  };
}

function waterfallCaveRuneEntry(sceneId,obj,rune,index,total){
  const set=waterfallCaveRuneSetMeta(sceneId,obj);
  const r=rune||{};
  const runeId=String(r.id||('rune'+(index||0)));
  const key=String(r.key||set.id+'.'+runeId);
  const lines=waterfallCaveCloneData(Array.isArray(r.lines)&&r.lines.length?r.lines:[]);
  return {
    key,
    setId:set.id,
    setTitle:set.title,
    runeId,
    title:String(r.title||('Runa '+((index||0)+1))),
    kind:String(r.kind||set.kind||RUNE_KIND_SURFACE),
    order:Number.isFinite(r.order)?r.order:((index||0)+1),
    total:Math.max(1,total||1),
    sceneId:set.sceneId,
    objectId:set.objectId,
    source:set.source,
    world:set.world,
    lines,
    text:lines.length?lines.join('\n'):String(r.text||'')
  };
}

function waterfallCaveRuneCatalog(){
  const sets={},runes=[];
  for(const setId in WATERFALL_CAVE_RUNE_SETS){
    const obj=waterfallCaveRuneObjectForSet('glyphArchive',{id:'runeWall',kind:'runeWall'},setId);
    const set=waterfallCaveRuneSetMeta('glyphArchive',obj);
    set.total=obj.runes.length;
    sets[set.id]=set;
    for(let i=0;i<obj.runes.length;i++)runes.push(waterfallCaveRuneEntry('glyphArchive',obj,obj.runes[i],i,obj.runes.length));
  }
  for(const sceneId of waterfallCaveSceneIds()){
    for(const obj of waterfallCaveSceneObjects(sceneId)){
      if(obj&&obj.runeSetSource==='levelSecret')continue;
      if(!obj||!Array.isArray(obj.runes)||!obj.runes.length)continue;
      const set=waterfallCaveRuneSetMeta(sceneId,obj);
      set.total=obj.runes.length;
      sets[set.id]=set;
      for(let i=0;i<obj.runes.length;i++)runes.push(waterfallCaveRuneEntry(sceneId,obj,obj.runes[i],i,obj.runes.length));
    }
  }
  return {sets:Object.keys(sets).map(k=>sets[k]).sort((a,b)=>(a.order-b.order)||a.title.localeCompare(b.title)),runes};
}
