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
      {id:'cover',runtimeKey:'deepItem',kind:'inspectable',default:{x:246,y:252,displayScale:0.5,near:false,coverOpen:false,dismissedNear:false,coverCloseArmed:false,coverSide:'front',coverReturnBlocked:false,coverAsset:'landsOfLoreCover',coverRect:{x:150,y:30,w:180,h:225},coverBackLines:['Utvecklat av','Johan Forsberg.','','Tilldelat Valdemar,','Tage och Elis.','','Beta-testare:','Micke och Calle','']},hit:{type:'ellipse',rx:33,ry:22},verbs:['look','turn']}
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
      {id:'runeWall',kind:'runeWall',runeSetSource:'levelSecret',runeSet:{id:'waterfall.glyphArchive',title:'Brobyggarens runor',source:'Runarkivet',world:'Bakom vattenfallet',order:1},default:{x:238,y:182,near:false,activated:false,pulseT:0,readT:0},hit:{type:'rect',w:124,h:62,dy:-4},verbs:['look','read'],
        runes:[
          {id:'water',title:'Vattnet',dx:-26,dy:-22,rx:19,ry:28,lines:['Runa 1/6','När vattnet döljer porten','börjar den dolda vägen.']},
          {id:'dark',title:'Mörkret',dx:-7,dy:-22,rx:19,ry:28,lines:['Runa 2/6','I mörkret prövas modet,','men hjärtat söker ljus.']},
          {id:'altar',title:'Altaret',dx:15,dy:-22,rx:19,ry:28,lines:['Runa 3/6','Vid altaret väntar handen','som stilla ger välsignelse.']},
          {id:'fire',title:'Elden',dx:-27,dy:7,rx:20,ry:24,lines:['Runa 4/6','Då mister elden sin hunger','och lågan viker undan.']},
          {id:'fall',title:'Djupet',dx:6,dy:8,rx:20,ry:24,lines:['Runa 5/6','Djupet kan inte krossa','den som bär heligt ljus.']},
          {id:'hope',title:'Hoppet',dx:27,dy:9,rx:20,ry:24,lines:['Runa 6/6','Så vandrar lämmeln vidare','och hoppet följer flocken.']}
        ],
        readLines:['Runorna viskar:','Läs varje tecken i stenen','så formas hela budskapet.']},
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
    stoneInscription:{title:'BROSTENEN',glyph:'bridge',color:'#d99a54',lines:['Två plankor över vattnet.','En dold port lyssnar.']},
    hiddenScenes:[],
    scenes:{}
  },
  darkForestArchive:{
    id:'darkForestArchive',
    label:'Skogens runarkiv',
    archiveStyle:'forest',
    stoneInscription:{title:'ROTSTENEN',glyph:'root',color:'#8fb96a',lines:['Rötterna bär natten.','Lyktan får inte slockna.']},
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
    stoneInscription:{title:'MARMORSTENEN',glyph:'vein',color:'#e6dcc2',lines:['Vit ådra, svart spricka.','Knappen sover ovanför.']},
    hiddenScenes:['church','churchInterior'],
    scenes:{glyphArchive:{removeExits:['toChurch'],removeObjects:['churchCard']}}
  },
  forestRavineArchive:{
    id:'forestRavineArchive',
    label:'Ravinens runarkiv',
    archiveStyle:'ravine',
    stoneInscription:{title:'RAVINSTENEN',glyph:'rope',color:'#b9d68a',lines:['Repet minns andra sidan.','Djupet svarar långsamt.']},
    hiddenScenes:['church','churchInterior'],
    scenes:{glyphArchive:{removeExits:['toChurch'],removeObjects:['churchCard']}}
  },
  doublePondsArchive:{
    id:'doublePondsArchive',
    label:'Dammarnas runarkiv',
    archiveStyle:'water',
    stoneInscription:{title:'DAMMSTENEN',glyph:'waves',color:'#9eefff',lines:['Två speglar delar vägen.','Bygg lågt där vattnet väntar.']},
    hiddenScenes:['church','churchInterior'],
    scenes:{glyphArchive:{removeExits:['toChurch'],removeObjects:['churchCard']}}
  },
  chaosArchive:{
    id:'chaosArchive',
    label:'Kaosets runarkiv',
    archiveStyle:'chaos',
    stoneInscription:{title:'KAOSSTENEN',glyph:'fracture',color:'#ff6a80',lines:['Mönstret gömmer sig skevt.','Samla vägarna till en.']},
    hiddenScenes:['church','churchInterior'],
    scenes:{glyphArchive:{removeExits:['toChurch'],removeObjects:['churchCard']}}
  },
  masterTrialArchive:{
    id:'masterTrialArchive',
    label:'Mästarprovets runarkiv',
    archiveStyle:'master',
    stoneInscription:{title:'MÄSTARSTENEN',glyph:'crown',color:'#d8b65a',lines:['Alla prov lämnar spår.','Sista tecknet pekar vidare.']},
    hiddenScenes:['church','churchInterior'],
    scenes:{glyphArchive:{removeExits:['toChurch'],removeObjects:['churchCard']}}
  }
};

const WATERFALL_CAVE_RUNE_LAYOUT=[
  {id:'water',title:'Vattnet',dx:-26,dy:-22,rx:19,ry:28},
  {id:'dark',title:'Mörkret',dx:-7,dy:-22,rx:19,ry:28},
  {id:'altar',title:'Altaret',dx:15,dy:-22,rx:19,ry:28},
  {id:'fire',title:'Elden',dx:-27,dy:7,rx:20,ry:24},
  {id:'fall',title:'Djupet',dx:6,dy:8,rx:20,ry:24},
  {id:'hope',title:'Hoppet',dx:27,dy:9,rx:20,ry:24}
];

const WATERFALL_CAVE_RUNE_SETS={
  'waterfall.glyphArchive':waterfallCaveMakeRuneSet('waterfall.glyphArchive','Brobyggarens runor',1,[
    ['När första bron läggs över vattnet','vågar flocken följa efter.'],
    ['Håll en vän vid kanten','så hinner de andra tänka.'],
    ['Två plankor räddar fler','än ett förhastat språng.'],
    ['Vattnet prövar tålamodet','mer än styrkan.'],
    ['Den som bygger för högt','glömmer vägen hem.'],
    ['Så börjar färden:','med mod, bro och mål.']
  ]),
  'waterfall.darkForest':waterfallCaveMakeRuneSet('waterfall.darkForest','Skogens nattbudskap',2,[
    ['När träden sluter leden','blir lyktan flockens hjärta.'],
    ['Mörkret skrämmer bara den','som springer utan riktning.'],
    ['Rötterna minns varje steg','och släpper den varsamt fram.'],
    ['Vattnet tar den som glömmer','att ljus också kan falla.'],
    ['Facklorna viskar: stanna','innan ravinen svarar.'],
    ['I nattens skog bär modet','en liten blå låga.']
  ]),
  'waterfall.marbleCave':waterfallCaveMakeRuneSet('waterfall.marbleCave','Marmorns hemliga rad',3,[
    ['Vit sten döljer gamla hål','under den blanka ytan.'],
    ['Den som tar höjd ser knappen','som marken inte berättar om.'],
    ['Tunneln ska vara lagom låg','så flocken inte tappar takten.'],
    ['Vattenfallet mäter stilla','vem som vågar gå bakom.'],
    ['Marmor sjunger långsamt','när hackan hittar rätt ådra.'],
    ['Bakom den kalla stenen','finns en varm väg vidare.']
  ]),
  'waterfall.forestRavine':waterfallCaveMakeRuneSet('waterfall.forestRavine','Ravinens reptecken',4,[
    ['Ravinen är bredare','än första blicken lovar.'],
    ['Ett rep över djupet','kan bli en bro av mod.'],
    ['Bygg ned där marken sjunker','inte där paniken pekar.'],
    ['Vattnet samlar ekon','från steg som nästan föll.'],
    ['Träden böjer sig över kanten','men håller inte flocken.'],
    ['Den som fäster repet väl','binder dagen vid andra sidan.']
  ]),
  'waterfall.doublePonds':waterfallCaveMakeRuneSet('waterfall.doublePonds','Dammarnas dubbla sång',5,[
    ['Två vatten delar vägen','men inte viljan.'],
    ['Den första bron lär försiktighet','den andra kräver rytm.'],
    ['Lågt byggda steg håller','fler lämlar kvar på marken.'],
    ['Mellan dammarna hörs','den kortaste pausen.'],
    ['Stenarna vid kanten vet','var strömmen blir stark.'],
    ['När båda speglar tystnar','öppnas runans mening.']
  ]),
  'waterfall.chaosMap':waterfallCaveMakeRuneSet('waterfall.chaosMap','Kaosets ordning',6,[
    ['När allt händer samtidigt','måste första valet vara enkelt.'],
    ['Vatten, lava och murar','lyder den som ser mönstret.'],
    ['Flyg inte från planen','förrän marken har svarat.'],
    ['Repet minns avståndet','som bron inte når.'],
    ['Kaos är bara karta','innan tecknen har lästs.'],
    ['Samla vägarna till en','och flocken följer.']
  ]),
  'waterfall.masterTrial':waterfallCaveMakeRuneSet('waterfall.masterTrial','Mästarprovets sista runor',7,[
    ['Det sista provet bär','alla tidigare misstag.'],
    ['Den heliga gnistan skyddar','men löser inte vägen.'],
    ['Lava, vatten, stad och sand','är delar av samma fråga.'],
    ['Looten lockar, målet väntar','och flocken räknar stegen.'],
    ['När sista runan tänds','blir minnet större än banan.'],
    ['Alla tecken tillsammans','pekar mot nästa värld.']
  ])
};

function waterfallCaveMakeRuneSet(id,title,order,parts){
  const total=WATERFALL_CAVE_RUNE_LAYOUT.length;
  return {
    runeSet:{id,title,source:'Runarkivet',world:'Bakom vattenfallet',order,kind:RUNE_KIND_SURFACE},
    readLines:['Runorna viskar:',title,'Läs varje tecken i stenen.'],
    runes:WATERFALL_CAVE_RUNE_LAYOUT.map((base,i)=>{
      const text=Array.isArray(parts&&parts[i])?parts[i]:['Runorna viskar.'];
      return Object.assign({},base,{kind:RUNE_KIND_SURFACE,lines:['Runa '+(i+1)+'/'+total].concat(text)});
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
