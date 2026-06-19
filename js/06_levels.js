// ---------------------------- BANOR ---------------------------------
// Deklarativ bandata. build(P) ritar terräng, decor(D) placerar dekor.
// Alla banor är bredare än vyn (480) så att man får scrolla.
const LEVELS=[
{ name:'FÖRSTA STEGEN', theme:'dirt', night:false, W:800,
  lem:10, save:5, rate:50, time:300,
  skills:{climb:2,float:2,bomb:2,block:2,build:5,bash:5,mine:2,dig:10,baz:0,jet:0},
  hatch:{x:140,y:70}, exit:{x:700,y:169},
  water:[],
  hint:'GRÄV DIG NER GENOM HYLLAN, ELLER PROMENERA UT ÖVER KANTEN.',
  build(P){ P.rect(0,170,800,70); P.rect(0,120,420,14);
    P.rect(200,134,12,36); P.rect(60,134,12,36); },
  decor(D){ D.bush(300,169);D.bush(520,169);D.mush(620,169);D.bush(760,169);D.mush(40,119); } },

{ name:'BYGG EN BRO', theme:'dirt', night:false, W:900,
  lem:10, save:6, rate:45, time:300,
  skills:{climb:1,float:2,bomb:2,block:2,build:6,bash:2,mine:1,dig:2,baz:0,jet:0},
  hatch:{x:120,y:125}, exit:{x:820,y:139},
  water:[{x:350,w:90,y:212,lava:false}],
  secrets:{runeSets:['waterfall.glyphArchive'],caveVariant:'flodaChurch'},
  hint:'TVÅ BYGGARE PÅ RAD TAR ER ÖVER VATTNET. EN BLOCKERARE HÅLLER FLOCKEN.',
  build(P){ P.rect(0,180,350,60); P.rect(440,140,460,100); },
  decor(D){ D.waterfall(395,42,170,30);D.bush(80,179);D.bush(250,179);D.mush(600,139);D.bush(700,139); } },

{ name:'GRÄV DJUPT', theme:'dirt', night:false, W:800,
  lem:10, save:8, rate:50, time:300,
  skills:{climb:1,float:1,bomb:2,block:2,build:2,bash:4,mine:2,dig:8,baz:0,jet:0},
  hatch:{x:110,y:100}, exit:{x:600,y:209},
  water:[],
  loot:[{x:400,y:196,skill:'build'}],
  rescues:[{button:{x:55,y:149},release:{x:260,y:126},open:{x:253,y:150,w:14,h:30},count:2,dir:1}],
  hint:'UNDER ERA FÖTTER FINNS EN GROTTA. VÄND EN LEMMEL OM DU VILL NÅ BONUSKNAPPEN.',
  build(P){ P.rect(0,150,800,30); P.rect(0,210,800,30);
    P.ramp(120,210,40,14,1); P.ramp(680,210,40,14,-1);
    P.disc(400,216,12); P.disc(250,213,8); },
  decor(D){ D.mush(330,209);D.mush(520,209);D.bush(200,149);D.bush(560,149); } },

{ name:'HETT UNDER FÖTTERNA', theme:'hell', night:false, W:1000,
  lem:12, save:7, rate:45, time:300,
  skills:{climb:0,float:2,bomb:2,block:4,build:6,bash:4,mine:0,dig:0,baz:2,jet:0},
  hatch:{x:90,y:140}, exit:{x:920,y:189},
  water:[{x:300,w:40,y:212,lava:true},{x:600,w:40,y:212,lava:true}],
  hint:'BYGG ÖVER LAVAN OCH SLÅ DIG IGENOM MUREN.',
  build(P){ P.rect(0,190,1000,50);
    P.erase.rect(300,190,40,50); P.erase.rect(600,190,40,50);
    P.rect(700,120,26,70);
    P.rect(150,80,20,40); P.rect(450,80,20,40); P.rect(840,80,20,40); },
  decor(D){ D.torch(160,120);D.torch(460,120);D.torch(850,120);
    D.chain(250,0);D.chain(550,0);D.chain(780,0); } },

{ name:'MÖRK SKOG', theme:'forest', night:true, W:1000,
  lem:10, save:6, rate:45, time:360,
  skills:{climb:3,float:2,bomb:2,block:2,build:6,bash:4,mine:0,dig:2,baz:0,jet:0},
  hatch:{x:100,y:150}, exit:{x:900,y:199},
  water:[{x:480,w:40,y:210,lava:false}],
  secrets:{runeSets:['waterfall.darkForest'],caveVariant:'darkForestArchive'},
  hint:'NATT! FÖRSTA LEMMELN BÄR LYKTAN. TAPPA DEN INTE I DAMMEN.',
  build(P){ P.rect(0,200,1000,40);
    P.erase.rect(480,200,40,40);
    P.rect(740,160,24,40);
    P.ramp(640,200,60,14,1); },
  decor(D){ D.waterfall(500,54,156,28);D.tree(180,200,1.2);D.tree(380,200,0.9);D.tree(620,200,1.4);D.tree(860,200,1.0);
    D.root(185,200,96,26);D.root(382,200,76,22);D.root(625,200,116,30);D.root(858,200,88,24);
    D.torch(470,200);D.torch(530,200);D.torch(665,200);D.torch(740,160);
    D.mush(300,199);D.mush(560,199);D.bush(80,199);D.bush(960,199); } },

{ name:'BAZOOKA-SKOLAN', theme:'crystal', night:false, W:900,
  lem:10, save:8, rate:50, time:300,
  skills:{climb:0,float:2,bomb:2,block:2,build:2,bash:0,mine:0,dig:0,baz:9,jet:0},
  hatch:{x:80,y:145}, exit:{x:830,y:194},
  water:[],
  hint:'VÄLJ BAZOOKAN OCH KLICKA PÅ EN LEMMEL. TVÅ SKOTT PER MUR!',
  build(P){ P.rect(0,195,900,45);
    P.rect(300,110,26,85); P.rect(520,110,26,85); P.rect(720,110,26,85);
    P.disc(120,60,18); P.disc(620,55,14); },
  decor(D){ D.target(313,128);D.target(533,128);D.target(733,128);
    D.crystal(180,194);D.crystal(420,194);D.crystal(650,194);D.crystal(870,194); } },

{ name:'JETPACK-KLIPPAN', theme:'rock', night:false, W:1000,
  lem:12, save:8, rate:45, time:360,
  skills:{climb:0,float:4,bomb:2,block:2,build:4,bash:0,mine:0,dig:0,baz:0,jet:15},
  hatch:{x:90,y:130}, exit:{x:900,y:109},
  water:[],
  hint:'GE LEMLARNA JETPACK VID KLIPPVÄGGEN SÅ FLYGER DE UPP. BYGG ÖVER SPRICKAN.',
  build(P){ P.rect(0,180,400,60); P.rect(400,110,600,130);
    P.erase.rect(650,110,30,60);
    P.disc(500,40,22); P.disc(820,30,18); },
  decor(D){ D.rock(165,180,1.15);D.rock(310,180,0.9);D.rock(535,109,1.1);D.rock(820,109,1.25);D.rock(958,109,0.85);
    D.bush(570,109);D.bush(760,109);D.mush(940,109); } },

{ name:'MARMORGROTTAN', theme:'marble', night:false, W:1100,
  lem:12, save:8, rate:45, time:360,
  skills:{climb:2,float:2,bomb:2,block:2,build:4,bash:5,mine:2,dig:0,baz:0,jet:0},
  hatch:{x:90,y:150}, exit:{x:1000,y:199},
  water:[{x:700,w:40,y:212,lava:false}],
  secrets:{runeSets:['waterfall.marbleCave'],caveVariant:'marbleArchive'},
  rescues:[{button:{x:420,y:134},release:{x:360,y:112},open:{x:354,y:136,w:14,h:64},count:2,dir:1}],
  hint:'SLÅ EN TUNNEL GENOM KULLEN. BONUSKNAPPEN KRÄVER EN LEMMEL SOM TAR HÖJD.',
  build(P){ P.rect(0,200,1100,40);
    P.disc(420,205,70);
    P.erase.rect(700,200,40,40);
    P.disc(560,-15,55); P.disc(880,-25,65); P.disc(180,-30,50); },
  decor(D){ D.waterfall(720,54,158,26);D.mush(150,199);D.crystal(600,199);D.mush(820,199);D.bush(950,199); } },

{ name:'NATTSKIFTET', theme:'hell', night:true, W:1100,
  lem:14, save:8, rate:40, time:420,
  skills:{climb:2,float:3,bomb:3,block:3,build:8,bash:4,mine:0,dig:0,baz:2,jet:2},
  hatch:{x:90,y:145}, exit:{x:1000,y:169},
  water:[{x:260,w:40,y:212,lava:true},{x:330,w:40,y:212,lava:true}],
  hint:'NATT IGEN. FACKLORNA HJÄLPER - MEN LYKTAN VISAR VÄGEN. BYGG UPP TILL UTGÅNGEN.',
  build(P){ P.rect(0,195,1100,45);
    P.erase.rect(260,195,40,45); P.erase.rect(330,195,40,45);
    P.rect(520,125,26,70);
    P.rect(900,170,200,25);
    P.rect(80,85,20,40); P.rect(640,85,20,40); },
  decor(D){ D.torch(90,125);D.torch(250,195);D.torch(376,195);D.torch(515,125);D.torch(650,125);D.torch(895,170);D.torch(980,170);
    D.chain(200,0);D.chain(760,0);D.chain(1050,0); } },

{ name:'DEN LÅNGA RESAN', theme:'dirt', night:false, W:1400,
  lem:20, save:10, rate:40, time:480,
  skills:{climb:3,float:5,bomb:5,block:4,build:9,bash:6,mine:4,dig:4,baz:5,jet:6},
  hatch:{x:110,y:90}, exit:{x:1300,y:139},
  water:[{x:600,w:40,y:210,lava:false}],
  hint:'ALLT DU LÄRT DIG: SLÅ, BYGG, SPRÄNG OCH FLYG. LYCKA TILL!',
  build(P){ P.rect(0,190,1400,50);
    P.rect(0,140,260,20); P.rect(40,160,14,30); P.rect(200,160,14,30);
    P.rect(420,120,28,70);
    P.erase.rect(600,190,40,50);
    P.disc(800,174,26);
    P.rect(1000,140,400,50);
    P.erase.rect(1150,140,36,50); },
  decor(D){ D.bush(330,189);D.mush(540,189);D.bush(700,189);D.mush(950,189);
    D.bush(1100,139);D.mush(1250,139);D.bush(1380,139);D.bush(150,139); } },

{ name:'SKOGSRAVINEN', theme:'forest', night:false, W:1200,
  lem:14, save:9, rate:42, time:420,
  skills:{climb:2,float:3,bomb:2,block:2,build:7,downbuild:4,bash:3,mine:1,dig:3,baz:0,jet:1,rope:3},
  hatch:{x:80,y:120}, exit:{x:1110,y:159},
  water:[{x:374,w:170,y:224,lava:false}],
  secrets:{runeSets:['waterfall.forestRavine'],caveVariant:'forestRavineArchive'},
  hint:'EN RAVIN, EN DAMM OCH EN HÖG SLUTPLATÅ. REP OCH NEDBYGGARE HJÄLPER MYCKET.',
  build(P){ P.rect(0,180,230,60); P.ramp(230,205,90,25,-1);
    P.rect(320,205,44,35); P.disc(356,205,14);
    P.rect(550,190,180,50); P.disc(552,190,16);
    P.erase.rect(365,152,185,88); P.erase.disc(438,205,54);
    P.ramp(730,190,85,28,1);
    P.rect(850,160,350,80); P.rect(940,120,20,40); P.disc(250,183,16); },
  decor(D){ D.waterfall(458,30,194,42);D.tree(150,180,1.1);D.tree(342,205,0.75);D.tree(580,190,0.95);D.tree(900,160,1.2);
    D.root(575,190,70,26);D.bush(330,204);D.bush(700,189);D.mush(1020,159); } },

{ name:'SNÖKANTEN', theme:'crystal', night:false, W:1100,
  lem:12, save:8, rate:45, time:390,
  skills:{climb:1,float:5,bomb:2,block:2,build:5,downbuild:7,bash:1,mine:1,dig:2,baz:0,jet:2,rope:2},
  hatch:{x:90,y:78}, exit:{x:1010,y:199},
  water:[],
  hint:'FYRA HALA AVSATSER GÅR NEDÅT. BYGG NED ELLER FLYG ÖVER GLAPPEN.',
  build(P){ P.rect(0,115,260,125); P.rect(305,145,190,95);
    P.rect(545,175,220,65); P.rect(820,200,280,40);
    P.disc(215,92,16); P.disc(470,120,20); P.disc(720,150,18);
    P.ramp(760,200,60,25,1); },
  decor(D){ D.crystal(160,114);D.crystal(248,114);D.crystal(365,144);D.crystal(500,144);D.crystal(620,174);D.crystal(760,199);D.crystal(930,199);
    D.stal(245,115,14,true);D.stal(500,145,16,true);D.stal(765,200,18,true); } },

{ name:'LAVAPORTARNA', theme:'hell', night:false, W:1300,
  lem:16, save:10, rate:40, time:420,
  skills:{climb:0,float:3,bomb:3,block:4,build:9,downbuild:3,bash:6,mine:1,dig:1,baz:4,jet:0,rope:2},
  hatch:{x:80,y:140}, exit:{x:1220,y:169},
  water:[{x:240,w:50,y:212,lava:true},{x:540,w:60,y:212,lava:true},{x:860,w:50,y:212,lava:true}],
  hint:'TRE LAVAGAP OCH TRE PORTAR. BYGG ÖVER, SLÅ IGENOM ELLER SKJUT RENT.',
  build(P){ P.rect(0,190,1300,50); P.erase.rect(240,190,50,50);P.erase.rect(540,190,60,50);P.erase.rect(860,190,50,50);
    P.rect(360,112,24,78);P.rect(680,98,24,92);P.rect(990,126,26,64);
    P.rect(1050,170,250,70);P.rect(160,86,18,42);P.rect(760,78,18,52); },
  decor(D){ D.torch(170,128);D.torch(360,112);D.torch(680,98);D.torch(770,130);D.torch(990,126);D.torch(1080,170);
    D.chain(245,0);D.chain(430,0);D.chain(545,0);D.chain(860,0);D.chain(930,0); } },

{ name:'REP ÖVER DJUPET', theme:'marble', night:false, W:1200,
  lem:14, save:9, rate:42, time:420,
  skills:{climb:1,float:5,bomb:2,block:2,build:5,downbuild:3,bash:2,mine:2,dig:2,baz:0,jet:2,rope:5},
  hatch:{x:80,y:98}, exit:{x:1110,y:119},
  water:[],
  hint:'DJUPET ÄR FÖR BRETT FÖR EN ENKEL BRO. SKJUT REPET MOT HÖGRA KANTEN.',
  build(P){ P.rect(0,150,300,90); P.rect(420,220,280,20); P.rect(820,120,380,120);
    P.ramp(300,220,120,70,-1); P.rect(665,160,24,60); P.disc(520,218,24); P.disc(930,92,20); },
  decor(D){ D.chain(338,0);D.chain(742,0);D.rock(300,149,0.9);D.rock(820,119,1.1);
    D.mush(140,149);D.crystal(500,219);D.crystal(665,159);D.bush(865,119);D.mush(1030,119); } },

{ name:'UNDER RÖTTERNA', theme:'forest', night:true, W:1250,
  lem:15, save:10, rate:42, time:450,
  skills:{climb:3,float:2,bomb:3,block:3,build:4,downbuild:3,bash:7,mine:5,dig:6,baz:0,jet:0,rope:2},
  hatch:{x:90,y:145}, exit:{x:1160,y:214},
  water:[{x:690,w:50,y:222,lava:false}],
  loot:[{x:500,y:202,skill:'rope'}],
  hint:'EN ROTGROTTA MED NIVÅSKILLNADER. GRÄV, SLÅ OCH HÅLL LYKTAN VID LIV.',
  build(P){ P.rect(0,140,1250,100);
    P.erase.rect(70,140,42,50); // säker luck-/spawnöppning ner till första rotgången
    P.erase.rect(0,160,285,30); P.erase.rect(285,180,280,30);
    P.erase.rect(565,150,260,30); P.erase.rect(825,185,425,30);
    P.erase.rect(690,185,50,55); P.rect(360,140,18,40); P.rect(610,180,20,60); P.disc(930,185,22); },
  decor(D){ D.tree(160,160,1.2);D.tree(450,180,1.0);D.tree(780,150,1.3);
    D.root(150,160,165,35);D.root(450,180,185,34);D.root(780,150,190,44);D.root(1030,185,210,32);D.root(610,180,120,24);
    D.torch(360,180);D.torch(590,180);D.torch(682,185);D.torch(930,185);D.torch(1160,215);
    D.mush(330,209);D.bush(1030,214); } },

{ name:'KRISTALLSCHAKTET', theme:'glass', night:false, W:1300,
  lem:16, save:11, rate:40, time:450,
  skills:{climb:2,float:4,bomb:3,block:3,build:6,downbuild:4,bash:3,mine:4,dig:3,baz:5,jet:4,rope:4},
  hatch:{x:85,y:150}, exit:{x:1210,y:149},
  water:[],
  hint:'ETT SCHAKT MED KRISTALLPELARE. RÖJ LAGOM, ANNARS TAPPADE DU VÄGEN.',
  build(P){ P.rect(0,200,260,40); P.rect(300,160,190,80); P.rect(545,125,190,115);
    P.rect(790,175,210,65); P.rect(1080,150,220,90);
    P.rect(405,82,20,78); P.rect(650,62,22,63); P.rect(920,110,22,65);
    P.disc(210,154,18); P.disc(760,95,24); P.disc(1120,120,18); },
  decor(D){ D.crystal(120,199);D.crystal(180,199);D.crystal(330,159);D.crystal(360,159);D.crystal(470,159);D.crystal(570,124);D.crystal(610,124);D.crystal(705,124);D.crystal(730,124);
    D.crystal(820,174);D.crystal(880,174);D.crystal(965,174);D.crystal(990,174);D.crystal(1125,149);D.crystal(1180,149);D.crystal(1240,149); } },

{ name:'DUBBLA DAMMAR', theme:'dirt', night:false, W:1300,
  lem:15, save:10, rate:42, time:420,
  skills:{climb:1,float:5,bomb:3,block:3,build:10,downbuild:5,bash:3,mine:2,dig:3,baz:1,jet:1,rope:3},
  hatch:{x:90,y:140}, exit:{x:1220,y:189},
  water:[{x:320,w:135,y:212,lava:false},{x:685,w:175,y:212,lava:false}],
  secrets:{runeSets:['waterfall.doublePonds'],caveVariant:'doublePondsArchive'},
  hint:'TVÅ DAMMAR DELAR BANAN. BLOCKERA FLODEN OCH BYGG LÅGA, SÄKRA BROAR.',
  build(P){ P.rect(0,185,285,55); P.rect(455,160,230,80); P.rect(920,190,380,50);
    P.ramp(285,205,55,20,-1); P.ramp(860,190,80,30,1);
    P.disc(575,130,18); P.rect(1010,150,24,40); },
  decor(D){ D.waterfall(370,56,156,34);D.rock(300,184,0.9);D.rock(875,189,1.0);
    D.bush(120,184);D.mush(520,159);D.bush(650,159);D.mush(980,189);D.bush(1160,189);D.mush(760,159); } },

{ name:'MÅNSKENSMUREN', theme:'hell', night:true, W:1400,
  lem:18, save:11, rate:38, time:480,
  skills:{climb:3,float:4,bomb:4,block:4,build:8,downbuild:3,bash:7,mine:2,dig:2,baz:4,jet:2,rope:3},
  hatch:{x:90,y:145}, exit:{x:1310,y:159},
  water:[{x:470,w:45,y:214,lava:true},{x:740,w:45,y:214,lava:true}],
  hint:'MUREN SER ENKEL UT, MEN NATTEN OCH LAVAN STRAFFAR SLARVIGA TUNNLAR.',
  build(P){ P.rect(0,195,1400,45); P.erase.rect(470,195,45,45);P.erase.rect(740,195,45,45);
    P.rect(260,130,30,65); P.rect(545,100,30,95); P.rect(880,120,30,75);
    P.rect(1120,160,280,80); P.rect(120,90,18,45);P.rect(1020,80,18,55); },
  decor(D){ D.torch(130,135);D.torch(260,130);D.torch(462,195);D.torch(545,100);D.torch(732,195);D.torch(880,120);D.torch(1120,160);D.torch(1200,160);
    D.chain(210,0);D.chain(340,0);D.chain(650,0);D.chain(815,0);D.chain(980,0);D.chain(1250,0); } },

{ name:'BALKONGERNA', theme:'marble', night:false, W:1300,
  lem:16, save:11, rate:40, time:450,
  skills:{climb:4,float:5,bomb:2,block:3,build:5,downbuild:8,bash:2,mine:2,dig:2,baz:0,jet:2,rope:5},
  hatch:{x:90,y:78}, exit:{x:1210,y:204},
  water:[],
  hint:'BALKONGERNA LIGGER LÄGRE OCH LÄGRE. BYGG NED OCH LÄGG REP DÄR FLOCKEN FASTNAR.',
  build(P){ P.rect(0,115,230,125); P.rect(285,145,230,95); P.rect(565,175,240,65); P.rect(865,205,435,35);
    P.rect(230,82,18,33); P.rect(515,112,18,33); P.rect(805,142,18,33); P.disc(420,116,20); P.disc(990,175,24); },
  decor(D){ D.rail(28,115,175);D.rail(310,145,170);D.rail(595,175,180);D.rail(900,205,270);
    D.mush(150,114);D.crystal(350,144);D.crystal(735,174);D.bush(640,174);D.mush(955,204);D.bush(1160,204); } },

{ name:'KAOSKARTAN', theme:'dirt', night:false, W:1600,
  lem:22, save:14, rate:36, time:540,
  skills:{climb:5,float:7,bomb:6,block:5,build:12,downbuild:7,bash:8,mine:5,dig:5,baz:6,jet:6,rope:5},
  hatch:{x:90,y:90}, exit:{x:1510,y:139},
  water:[{x:505,w:60,y:212,lava:false},{x:885,w:115,y:212,lava:true},{x:1225,w:70,y:212,lava:false}],
  secrets:{runeSets:['waterfall.chaosMap'],caveVariant:'chaosArchive'},
  hint:'EN STOR BLANDNING AV ALLT: HÖJD, VATTEN, LAVA, MURAR, REP OCH FLYGNING.',
  build(P){ P.rect(0,140,260,20); P.rect(0,190,360,50);
    P.rect(420,205,240,35); P.erase.rect(505,205,60,35);
    P.rect(710,170,220,70); P.erase.rect(885,170,55,70);
    P.rect(1000,120,26,120); P.rect(1070,190,260,50); P.erase.rect(1225,190,70,50);
    P.rect(1380,140,220,100); P.ramp(1330,190,80,50,1);
    P.disc(250,166,26);P.disc(760,140,24);P.disc(1160,156,28);P.rect(1450,92,20,48); },
  decor(D){ D.waterfall(535,62,148,24);D.bush(170,189);D.mush(455,204);D.rock(660,204,0.95);D.crystal(760,169);D.torch(1010,120);D.bush(1110,189);
    D.rock(1215,189,0.9);D.mush(1360,170);D.bush(1490,139);D.mush(1560,139); } },

{ name:'STENGROTTANS SKEN', theme:'cave', night:true, cave:true, W:1200,
  lem:14, save:9, rate:42, time:420,
  skills:{climb:2,float:4,bomb:3,block:3,build:8,downbuild:3,bash:5,mine:2,dig:3,baz:2,jet:1,rope:3},
  hatch:{x:90,y:76}, exit:{x:1110,y:192},
  water:[{x:835,w:80,y:214,lava:false}],
  drips:[145,255,355,510,690,780,910,1040],
  hint:'EN GRÅ STENGROTTA MED FÅ LJUSPUNKTER. FALL NED, SLÅ GENOM VÄGGEN OCH BYGG ÖVER DAMMEN.',
  build(P){ P.rect(0,0,1200,240);
    P.erase.rect(40,72,280,42); P.erase.rect(300,72,50,118);
    P.erase.rect(330,148,340,44); P.erase.rect(720,148,410,44);
    P.erase.rect(835,192,80,48);
    P.disc(170,72,22); P.disc(455,148,26); P.disc(990,148,24);
    P.rect(670,148,24,44); P.rect(520,122,18,26); },
  decor(D){ D.torch(135,114);D.torch(315,188);D.torch(660,192);D.torch(820,192);D.torch(1085,192);
    D.stal(210,72,20,false);D.stal(252,114,16,true);D.stal(420,148,24,false);D.stal(570,192,18,true);
    D.stal(760,148,22,false);D.stal(930,192,16,true);D.crystal(1030,191); } },

{ name:'DROPPSTENSSALEN', theme:'cave', night:true, cave:true, W:1350,
  lem:16, save:10, rate:40, time:450,
  skills:{climb:3,float:5,bomb:3,block:4,build:9,downbuild:5,bash:5,mine:3,dig:4,baz:1,jet:2,rope:5},
  hatch:{x:85,y:66}, exit:{x:1260,y:220},
  water:[{x:545,w:88,y:214,lava:false},{x:1030,w:70,y:224,lava:false}],
  drips:[130,260,405,520,640,805,930,1070,1215],
  hint:'FACKLORNA VISAR DE FARLIGA GLAPPEN. FÖR NED FLOCKEN GENOM SALEN OCH HÅLL DEM SAMLADE.',
  build(P){ P.rect(0,0,1350,240);
    P.erase.rect(40,62,380,44); P.erase.rect(385,62,45,128);
    P.erase.rect(320,146,430,44); P.erase.rect(735,176,565,44);
    P.erase.rect(545,190,88,50); P.erase.rect(1030,220,70,20);
    P.erase.rect(810,112,260,42); P.erase.rect(990,112,40,108);
    P.disc(225,62,24); P.disc(590,146,30); P.disc(895,112,20); P.disc(1180,176,26);
    P.rect(710,146,25,44); P.rect(930,154,22,22); },
  decor(D){ D.torch(160,106);D.torch(420,190);D.torch(535,190);D.torch(725,190);D.torch(1000,220);D.torch(1230,220);
    D.stal(210,62,22,false);D.stal(340,106,18,true);D.stal(500,146,28,false);D.stal(665,190,18,true);
    D.stal(850,112,24,false);D.stal(945,154,18,true);D.stal(1135,176,28,false);D.crystal(875,153);D.crystal(1195,219); } },

{ name:'DJUPA GRÅ GÅNGEN', theme:'cave', night:true, cave:true, W:1500,
  lem:18, save:12, rate:38, time:500,
  skills:{climb:4,float:6,bomb:4,block:4,build:10,downbuild:6,bash:7,mine:4,dig:5,baz:3,jet:3,rope:5},
  hatch:{x:90,y:68}, exit:{x:1410,y:220},
  water:[{x:875,w:110,y:214,lava:false},{x:1180,w:80,y:224,lava:false}],
  drips:[135,310,470,615,760,900,1035,1190,1325,1430],
  hint:'DEN DJUPA GÅNGEN KRÄVER BÅDE TUNNLAR OCH BROAR. LJUSPUNKTERNA LIGGER DÄR BESLUTEN TAS.',
  build(P){ P.rect(0,0,1500,240);
    P.erase.rect(45,64,285,42); P.erase.rect(300,64,46,122);
    P.erase.rect(245,158,365,44); P.erase.rect(660,158,300,44);
    P.erase.rect(985,186,465,34); P.erase.rect(875,202,110,38); P.erase.rect(1180,220,80,20);
    P.erase.rect(720,102,200,42); P.erase.rect(915,102,42,100);
    P.disc(170,64,22);P.disc(420,158,28);P.disc(765,102,22);P.disc(1115,186,30);P.disc(1360,186,24);
    P.rect(610,158,28,44); P.rect(1010,150,24,36); P.rect(1300,170,22,50); },
  decor(D){ D.torch(145,106);D.torch(320,186);D.torch(600,202);D.torch(705,202);D.torch(860,202);D.torch(1005,220);D.torch(1288,220);D.torch(1390,220);
    D.stal(215,64,22,false);D.stal(360,186,20,true);D.stal(500,158,28,false);D.stal(625,202,18,true);
    D.stal(760,102,24,false);D.stal(910,202,20,true);D.stal(1085,186,28,false);D.stal(1220,220,16,true);D.stal(1370,186,24,false);
    D.crystal(795,143);D.crystal(1125,219);D.crystal(1460,219); } },

{ name:'SANDDYNERNA', theme:'desert', night:false, W:1250,
  lem:14, save:9, rate:42, time:430,
  skills:{climb:2,float:4,bomb:3,block:3,build:8,downbuild:3,bash:4,mine:3,dig:3,baz:2,jet:2,flame:1,rope:3},
  hatch:{x:90,y:136}, exit:{x:1160,y:189},
  water:[],
  hint:'SANDEN SER MJUK UT, MEN RUINERNA STOPPAR FLOCKEN. BYGG ÖVER SÄNKAN OCH RÖJ PORTEN.',
  build(P){ P.rect(0,190,1250,50);
    P.ramp(225,190,150,38,1); P.ramp(375,190,130,32,-1);
    P.erase.rect(560,190,95,50);
    P.ramp(655,190,90,24,1); P.rect(745,166,220,74); P.ramp(965,190,95,24,-1);
    P.rect(430,118,28,72); P.rect(860,112,28,54); P.disc(295,172,18); P.disc(1035,172,22); },
  decor(D){ D.pyramid(255,190,1.05);D.pyramid(1010,190,0.75);
    D.cactus(160,190,1.0);D.cactus(525,190,0.85);D.cactus(780,165,0.9);D.cactus(1130,190,1.1);
    D.rock(330,190,1.0);D.rock(680,182,0.8);D.rock(940,165,1.1);D.marker(450,118,'RUIN'); } },

{ name:'PYRAMIDPORTEN', theme:'desert', night:false, W:1400,
  lem:16, save:11, rate:40, time:460,
  skills:{climb:3,float:4,bomb:4,block:4,build:7,downbuild:4,bash:7,mine:5,dig:4,baz:2,jet:1,flame:2,rope:4},
  hatch:{x:85,y:138}, exit:{x:1300,y:189},
  water:[],
  loot:[{x:760,y:168,skill:'flame'}],
  hint:'PYRAMIDEN HAR EN LÅG GÅNG, MEN INGÅNGEN ÄR DELVIS IGENSANDAD. SLÅ, GRÄV OCH HÅLL TAKTEN.',
  build(P){ P.rect(0,190,1400,50);
    P.ramp(420,190,170,95,1); P.rect(590,95,250,95); P.ramp(840,190,170,95,-1);
    P.erase.rect(625,146,180,30); P.erase.rect(805,146,38,44);
    P.rect(330,150,28,40); P.rect(1045,128,30,62); P.rect(1130,190,270,50);
    P.disc(180,170,18); P.disc(1195,168,20); },
  decor(D){ D.pyramid(700,190,1.9);D.pyramid(210,190,0.75);D.pyramid(1135,190,0.95);
    D.mummy(735,94,88,0.18);D.cactus(125,190,0.9);D.cactus(1015,190,1.0);D.rock(365,190,1.0);D.rock(910,190,0.9);D.marker(705,94,'PORT'); } },

{ name:'OAS VID RUINEN', theme:'desert', night:false, W:1500,
  lem:18, save:12, rate:38, time:500,
  skills:{climb:4,float:5,bomb:4,block:4,build:10,downbuild:5,bash:5,mine:4,dig:5,baz:3,jet:3,flame:2,rope:5},
  hatch:{x:90,y:124}, exit:{x:1410,y:154},
  water:[{x:625,w:140,y:214,lava:false}],
  hint:'OASEN BRYTER AV SANDEN. BROA ÖVER VATTNET OCH TA DIG GENOM DE GAMLA PELARNA.',
  build(P){ P.rect(0,180,340,60); P.ramp(340,210,90,30,-1);
    P.rect(430,190,260,50); P.erase.rect(625,190,115,50);
    P.rect(765,170,245,70); P.ramp(1010,170,120,44,1); P.rect(1130,155,370,85);
    P.rect(510,132,22,58); P.rect(870,110,26,60); P.rect(1210,108,26,47);
    P.disc(265,154,18); P.disc(790,148,22); P.disc(1320,132,18); },
  decor(D){ D.pyramid(205,180,0.8);D.pyramid(1120,155,1.15);
    D.mummy(1140,154,185,0.15);D.cactus(335,180,0.85);D.cactus(985,170,1.0);D.cactus(1370,155,0.9);
    D.rock(475,190,0.9);D.rock(805,169,1.0);D.rock(1260,155,1.1);D.bush(620,189);D.marker(1210,108,'OAS'); } },

{ name:'TAKÖVERGÅNGEN', theme:'city', night:false, W:1300,
  lem:16, save:11, rate:40, time:460,
  skills:{climb:4,float:5,bomb:3,block:3,build:9,downbuild:6,bash:3,mine:2,dig:2,baz:1,jet:3,flame:1,rope:5},
  hatch:{x:90,y:86}, exit:{x:1210,y:179},
  water:[],
  hint:'TAKEN LIGGER I OLIKA HÖJD. BYGG NED SÄKERT OCH ANVÄND REP DÄR GATAN BLIR FÖR BRED.',
  build(P){ P.rect(0,125,260,115); P.rect(320,150,230,90); P.rect(610,175,230,65); P.rect(910,180,390,60);
    P.rect(260,94,18,31); P.rect(550,116,18,34); P.rect(840,142,18,33);
    P.disc(430,124,18); P.disc(720,150,18); P.disc(1020,154,20); },
  decor(D){ D.cityscape(20,125,240,100);D.cityscape(585,175,330,115);D.cityscape(970,180,260,105);
    D.streetlamp(170,125);D.streetlamp(665,175);D.streetlamp(1110,180);
    D.sign(410,150,'METRO');D.road(954,180,302);D.bus(1010,180,-1);
    D.road(20,224,1240);D.taxi(60,224,1160,1,0.62);
    D.road(176,233,1030);D.taxi(220,233,940,-1,0.46); } },

{ name:'TUNNELBANAN', theme:'city', night:false, W:1400,
  lem:18, save:12, rate:38, time:500,
  skills:{climb:3,float:5,bomb:4,block:4,build:8,downbuild:5,bash:7,mine:3,dig:4,baz:2,jet:2,flame:1,rope:5},
  hatch:{x:90,y:134}, exit:{x:1305,y:189},
  water:[],
  hint:'NERE VID SPÅREN ÄR DET TRÅNGT. HACKA GENOM SERVICEVÄGGEN OCH BYGG ÖVER RÄLSGAPET.',
  build(P){ P.rect(0,0,1400,56); P.rect(0,190,1400,50);
    P.erase.rect(70,56,1250,58);
    P.erase.rect(300,114,52,76); P.erase.rect(760,114,60,76);
    P.rect(470,138,30,52); P.rect(1030,126,32,64);
    P.erase.rect(620,190,110,50); P.ramp(350,190,85,25,1); P.ramp(820,190,90,28,-1);
    P.disc(210,112,18); P.disc(910,112,18); P.disc(1190,112,20); },
  decor(D){ D.subway(140,190,245);D.subway(820,190,300);D.cityscape(0,56,360,80);D.cityscape(1010,56,330,75);
    D.streetlamp(425,190);D.streetlamp(1015,190);D.sign(250,114,'T-BANA');D.sign(1170,114,'UT');
    D.road(40,226,1280);D.taxi(80,226,1200,1,0.38); } },

{ name:'TAXIRUSNINGEN', theme:'city', night:false, W:1500,
  lem:20, save:13, rate:36, time:520,
  skills:{climb:4,float:6,bomb:4,block:5,build:11,downbuild:6,bash:5,mine:4,dig:4,baz:3,jet:4,flame:2,rope:5},
  hatch:{x:90,y:132}, exit:{x:1415,y:159},
  water:[],
  hint:'TRAFIKEN RÖR SIG UNDER ER, MEN DET ÄR TERRÄNGEN SOM ÄR FARLIG. BYGG ÖVER GLAPPEN OCH RÖJ BARRIÄRERNA.',
  build(P){ P.rect(0,185,300,55); P.rect(380,205,260,35); P.rect(720,175,250,65); P.rect(1050,160,450,80);
    P.erase.rect(300,185,80,55); P.erase.rect(640,205,80,35); P.erase.rect(970,175,80,65);
    P.rect(505,152,26,53); P.rect(875,118,28,57); P.rect(1240,112,26,48);
    P.ramp(300,205,80,20,-1); P.ramp(970,175,80,30,1); P.disc(760,150,20); P.disc(1320,134,24); },
  decor(D){ D.cityscape(40,185,300,95);D.cityscape(690,175,310,100);D.cityscape(1090,160,330,115);
    D.road(424,205,172);D.bus(520,205,1);D.streetlamp(250,185);D.streetlamp(760,175);D.streetlamp(1190,160);D.sign(1260,112,'TAXI');
    D.road(-20,226,1540);D.taxi(0,226,1450,1,0.84);
    D.road(0,235,1460);D.taxi(40,235,1370,-1,0.68);
    D.road(180,218,1120);D.taxi(220,218,1040,1,0.52); } },

{ name:'LEMMELMÄSTARPROVET', theme:'dirt', night:false, W:1900,
  lem:24, save:17, rate:36, time:620,
  skills:{climb:5,float:8,bomb:6,block:6,build:14,downbuild:8,bash:8,mine:6,dig:6,baz:4,jet:4,flame:3,rope:6},
  hatch:{x:90,y:92}, exit:{x:1810,y:154},
  water:[{x:360,w:120,y:212,lava:false},{x:980,w:105,y:212,lava:true},{x:1380,w:120,y:214,lava:false}],
  secrets:{runeSets:['waterfall.masterTrial'],caveVariant:'masterTrialArchive'},
  materialZones:[{x:480,w:500,theme:'cave'},{x:980,w:520,theme:'desert'},{x:1500,w:400,theme:'city'}],
  loot:[{x:585,y:205,skill:'rope'},{x:1274,y:159,skill:'flame'},{x:1580,y:205,skill:'baz'}],
  rescues:[{button:{x:615,y:129},release:{x:815,y:104},open:{x:704,y:132,w:28,h:38},count:3,dir:1}],
  hint:'SISTA PROVET: VATTEN, LAVA, RUINER, REP, LOOT OCH BONUSLEMLAR. PLANERA VÄGEN OCH RÄDDA FLER ÄN KRAVET.',
  build(P){ P.rect(0,130,260,20); P.rect(0,190,360,50); P.ramp(260,190,100,60,1);
    P.erase.rect(360,190,120,50);
    P.rect(480,170,220,70); P.erase.rect(520,202,145,28); P.rect(590,130,54,14);
    P.rect(700,130,42,110); P.rect(742,150,210,90); P.ramp(905,190,75,40,-1);
    P.erase.rect(980,190,105,50);
    P.rect(1085,175,210,65); P.ramp(1295,190,85,30,1); P.rect(1370,190,10,50); P.erase.rect(1380,190,120,50);
    P.rect(1500,185,160,55); P.rect(1660,155,240,85);
    P.rect(1210,112,28,63); P.rect(1730,104,24,51);
    P.rect(1238,138,94,37); P.erase.rect(1250,150,48,22);
    P.disc(175,166,20); P.disc(555,145,18); P.disc(1130,150,22); P.disc(1540,160,20); },
  decor(D){ D.waterfall(420,54,158,30);
    D.tree(150,190,1.15);D.tree(245,190,0.9);D.bush(70,129);D.bush(520,169);D.mush(545,169);D.marker(615,129,'BONUS');
    D.torch(585,130);D.torch(845,150);D.crystal(884,150);D.marker(585,205,'LOOT');
    D.pyramid(1140,175,0.95);D.mummy(1135,174,130,0.15);D.cactus(1175,175,0.9);D.rock(1215,175,0.9);D.marker(1274,159,'LOOT');
    D.streetlamp(1545,185);D.cityscape(1510,185,190,92);D.subway(1525,185,145);D.road(1544,226,301);D.taxi(1560,226,270,1,0.42);
    D.sign(1760,104,'MÅL');D.marker(1580,205,'LOOT');D.bush(1685,154);D.mush(1710,154); } }
];
