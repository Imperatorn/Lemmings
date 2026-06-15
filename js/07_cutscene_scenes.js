// ----------------------- CUTSCENE SCENES ---------------------------
// Scene library for reusable cutscenes. Keep the playback rules in
// 07_cutscenes.js; add new timeline/drawing content here or in another
// scene module that registers specs through G.registerCutscene.
(function(){
  function drawCutsceneBubble(c,x,y,s,tk,seed){
    const wob=Math.round(Math.sin(tk*0.18+seed)*2);
    c.fillStyle='#c8f6ff';
    c.fillRect(Math.round(x)+wob,Math.round(y),s,s);
    c.fillStyle='#ffffff';
    c.fillRect(Math.round(x)+wob,Math.round(y),1,1);
  }
  function drawCutsceneSwimRing(c,x,y,sc,a){
    c.save();
    c.globalAlpha=clamp(a==null?1:a,0,1);
    x=Math.round(x);y=Math.round(y);sc=Math.max(1,sc||1);
    c.fillStyle='#e04020';
    c.fillRect(x-10*sc,y-4*sc,20*sc,8*sc);
    c.fillRect(x-7*sc,y-7*sc,14*sc,14*sc);
    c.fillStyle='#ffd8a0';
    c.fillRect(x-6*sc,y-3*sc,12*sc,6*sc);
    c.fillRect(x-3*sc,y-6*sc,6*sc,12*sc);
    c.fillStyle='#fff0d0';
    c.fillRect(x-8*sc,y-5*sc,3*sc,3*sc);
    c.fillRect(x+5*sc,y+2*sc,3*sc,3*sc);
    c.restore();
  }
  function makeCutsceneWorldContext(l,z,extra){
    const L=G.level||{};
    const x=l&&Number.isFinite(l.x)?Math.round(l.x+(l.dir||1)):0;
    const y=z&&Number.isFinite(z.y)?Math.round(z.y-6):(l&&Number.isFinite(l.y)?Math.round(l.y):0);
    const themeKey=(typeof terrainThemeKeyAt==='function')?terrainThemeKeyAt(L,x,y):((L&&L.theme)||'dirt');
    const weatherKind=G.weatherKind||(L.cave?'cave':(L.night?'rain':'sun'));
    return Object.assign({
      themeKey,
      night:!!L.night,
      cave:!!L.cave,
      weatherKind,
      levelName:L&&L.name?String(L.name):''
    },extra||{});
  }
  function cutsceneWorldContext(cs){
    const ev=(cs&&cs.spec&&cs.spec.event)||{};
    const L=G.level||{};
    return {
      themeKey:ev.themeKey||((typeof terrainThemeKeyAt==='function')?terrainThemeKeyAt(L,ev.lemX||0,ev.waterY||0):((L&&L.theme)||'dirt')),
      night:ev.night!=null?!!ev.night:!!L.night,
      cave:ev.cave!=null?!!ev.cave:!!L.cave,
      weatherKind:ev.weatherKind||(G.weatherKind||(L.cave?'cave':(L.night?'rain':'sun'))),
      levelName:ev.levelName||((L&&L.name)?String(L.name):'')
    };
  }
  function rescueTextIndex(kind,ev,count){
    if(count<=1)return 0;
    const seed=[
      kind,
      ev&&ev.levelName,
      ev&&ev.themeKey,
      ev&&ev.weatherKind,
      Math.round((ev&&ev.lemX)||0),
      Math.round((ev&&ev.lemY)||0)
    ].join('|');
    return (typeof hashString==='function'?hashString(seed):seed.length)%count;
  }
  function rescueCutsceneText(kind,ev){
    ev=ev||{};
    const cave=!!ev.cave;
    const night=!!ev.night;
    const rain=ev.weatherKind==='rain';
    const snow=ev.weatherKind==='snow';
    let pool;
    if(kind==='fish'){
      pool=ev.rescueOnly?[
        {title:'BADRING UR DJUPET',text:['UR VATTNET KOMMER EN FISK MED BADRING.']},
        {title:'OVANTAD HJALP',text:['EN GLIMT UNDER YTAN - EN BADRING!']},
        {title:'SISTA SEKUNDEN',text:['FISKEN RUSAR FRAM MED EN ROD BADRING.']}
      ]:[
        {title:'FISKEN HJALPER TILL',text:['PLASK! EN BADRING TILL LEMMELN.']},
        {title:'SNABB FISK',text:['FISKEN KASTAR UT EN BADRING PRECIS I TID.']},
        {title:'RADDNING I VATTNET',text:['EN LITEN FENA BLIR STOR HJALP.']}
      ];
    }else if(kind==='dolphin'){
      pool=[
        {title:'DELFINEN RADDAR',text:['DELFINEN TAR FART UNDERIFRAN OCH SKJUTER UPP LEMMELN.']},
        {title:'UPP UR DJUPET',text:['ETT KRAFTIGT SPRANG LYFTER LEMMELN TILL LAND.']},
        {title:'VATTNET EXPLODERAR',text:['DELFINEN BRYTER YTAN OCH BAR LEMMELN MOT KANTEN.']}
      ];
    }else{
      pool=[
        {title:'GREPP I VAGGEN',text:['LEMMELN FANGAR EN KANT OCH BORJAR KLATTRA.']},
        {title:'UPP UR VATTNET',text:['ETT STEG I TAGET TAR SIG LEMMELN MOT TOPPEN.']},
        {title:'NARA LAND',text:['VAGGEN HALLER, OCH LEMMELN KLATTRAR VIDARE.']}
      ];
    }
    if(cave&&kind!=='dolphin')pool=pool.concat([{title:'I GROTTMORKRET',text:['DROPPAR FALLER MEDAN LEMMELN TAR SIG UPP.']}]);
    else if(night)pool=pool.concat([{title:'RADDAD I NATTEN',text:[rain?'REGNET PISKAR, MEN HJALPEN KOMMER FRAM.':(snow?'SNON FALLER NAR LEMMELN RADDAS.':'MORKRET STOPPAR INTE RADDNINGEN.')]}]);
    const pick=pool[rescueTextIndex(kind,ev,pool.length)]||pool[0];
    return {title:pick.title,text:pick.text.slice()};
  }
  function applyRescueCutsceneText(spec,kind){
    if(!spec)return spec;
    const msg=rescueCutsceneText(kind,(spec&&spec.event)||{});
    spec.title=msg.title;
    if(spec.shots&&spec.shots[0]){
      spec.shots[0].title=msg.title;
      spec.shots[0].text=msg.text;
    }
    return spec;
  }
  function drawCutsceneAtmosphere(c,r,cs,tk){
    const ctx=cutsceneWorldContext(cs);
    if(ctx.cave){
      c.save();
      c.globalAlpha=0.22;c.fillStyle='#02050a';c.fillRect(r.x,r.y,r.w,r.h);c.globalAlpha=1;
      c.fillStyle='#88a8c0';
      for(let i=0;i<11;i++){
        const x=r.x+22+i*43+((i*17)%11);
        const y=r.y+((tk*2+i*37)%(r.h+60))-42;
        c.fillRect(x,y,1,7+(i%3)*3);
      }
      c.restore();
    }else if(ctx.night){
      c.save();
      c.globalAlpha=0.30;c.fillStyle='#000018';c.fillRect(r.x,r.y,r.w,r.h);c.globalAlpha=1;
      c.fillStyle='#b8d8ff';
      for(let i=0;i<16;i++){
        const x=r.x+12+i*31+((i*13)%9), y=r.y+12+((i*29+tk)%Math.max(18,Math.round(r.h*0.52)));
        if(((i+tk)>>4)&1)c.fillRect(x,y,1,1);
      }
      c.restore();
    }
    if(ctx.weatherKind==='rain'){
      c.save();
      if(G.thunderFlash>0){c.globalAlpha=0.10+Math.min(0.24,G.thunderFlash/80);c.fillStyle='#d8ecff';c.fillRect(r.x,r.y,r.w,r.h)}
      c.globalAlpha=ctx.night?0.42:0.34;c.strokeStyle='#91bfe8';c.lineWidth=1;
      for(let i=0;i<34;i++){
        const x=r.x+((i*37+tk*5)%(r.w+70))-35;
        const y=r.y+((i*23+tk*7)%(r.h+44))-22;
        c.beginPath();c.moveTo(x,y);c.lineTo(x-7,y+16);c.stroke();
      }
      c.restore();
    }else if(ctx.weatherKind==='snow'){
      c.save();c.globalAlpha=ctx.night?0.72:0.62;c.fillStyle='#e8f6ff';
      for(let i=0;i<36;i++){
        const x=r.x+((i*29+Math.round(tk*0.7))%r.w);
        const y=r.y+((i*19+Math.round(tk*0.9))%r.h);
        c.fillRect(x,y,i%5===0?2:1,i%5===0?2:1);
      }
      c.restore();
    }
  }
  function drawCutsceneFish(c,x,y,sc,p,ringHeld){
    x=Math.round(x);y=Math.round(y);sc=Math.max(1,sc||1);
    const tail=((p*10)|0)%2;
    c.fillStyle='#d88a20';
    c.fillRect(x-13*sc,y-4*sc,17*sc,9*sc);
    c.fillStyle='#ffd060';
    c.fillRect(x-8*sc,y-6*sc,17*sc,12*sc);
    c.fillStyle='#fff0a0';
    c.fillRect(x-4*sc,y-3*sc,9*sc,5*sc);
    c.fillStyle='#111827';
    c.fillRect(x+5*sc,y-3*sc,2*sc,2*sc);
    c.fillStyle='#e07018';
    c.fillRect(x-16*sc,y-(tail?7:4)*sc,5*sc,5*sc);
    c.fillRect(x-16*sc,y+(tail?2:0)*sc,5*sc,5*sc);
    c.fillStyle='#ffb030';
    c.fillRect(x-1*sc,y-8*sc,5*sc,3*sc);
    c.fillRect(x-2*sc,y+6*sc,6*sc,3*sc);
    c.fillStyle='#f8b040';
    c.fillRect(x+9*sc,y-1*sc,4*sc,3*sc);
    if(ringHeld)drawCutsceneSwimRing(c,x+18*sc,y+2*sc,Math.max(1,Math.round(sc*0.45)),0.95);
  }
  function drawCutsceneDolphinClose(c,x,y,sc,p,dir){
    x=Math.round(x);y=Math.round(y);sc=Math.max(1,sc||1);dir=dir||1;
    c.save();c.translate(x,y);c.scale(dir,1);
    const r=(x0,y0,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x0*sc),Math.round(y0*sc),Math.round(w*sc),Math.round(h*sc))};
    r(-23,-6,38,13,'#3f95c8');
    r(-15,-11,26,6,'#68c8f4');
    r(9,-4,14,8,'#3f95c8');
    r(20,-1,4,3,'#d8f8ff');
    r(-20,4,26,7,'#d8f8ff');
    r(-27,-4,10,5,'#2a6f9e');
    r(-34,-10,8,8,'#2a6f9e');
    r(-34,4,8,8,'#2a6f9e');
    r(-4,-17,9,10,'#2a6f9e');
    r(2,7,9,10,'#2a6f9e');
    r(15,-8,3,3,'#091421');
    r(16,-8,1,1,'#ffffff');
    if(p>0.55){
      r(11,2,8,2,'#ffffff');
      r(12,4,5,1,'#d8f8ff');
    }
    c.restore();
  }
  function drawCutsceneLemClose(c,x,y,sc,smile,ringOn,tk,euphoria){
    x=Math.round(x);y=Math.round(y);sc=Math.max(1,sc||1);
    euphoria=clamp(euphoria||0,0,1);
    const bob=Math.round(Math.sin(tk*0.2)*sc)-Math.round(euphoria*2*sc)+Math.round(Math.sin(tk*0.55)*euphoria*2*sc);
    y+=bob;
    c.fillStyle='rgba(0,0,0,0.28)';
    c.fillRect(x-15*sc,y+29*sc,35*sc,3*sc);
    if(ringOn)drawCutsceneSwimRing(c,x+1*sc,y+17*sc,Math.max(2,Math.round(sc*0.58)),1);
    c.fillStyle='#5bc0ff';
    c.fillRect(x-8*sc,y+7*sc,18*sc,19*sc);
    c.fillStyle='#87dcff';
    c.fillRect(x-5*sc,y+9*sc,7*sc,15*sc);
    c.fillStyle='#f0c090';
    c.fillRect(x-10*sc,y-13*sc,20*sc,20*sc);
    c.fillRect(x-6*sc,y+3*sc,12*sc,7*sc);
    c.fillStyle='#ffe0b8';
    c.fillRect(x-6*sc,y-9*sc,9*sc,8*sc);
    c.fillStyle='#266f32';
    c.fillRect(x-12*sc,y-17*sc,24*sc,6*sc);
    c.fillRect(x-8*sc,y-22*sc,16*sc,6*sc);
    c.fillStyle='#42b848';
    c.fillRect(x-8*sc,y-20*sc,8*sc,4*sc);
    c.fillStyle='#101018';
    if(euphoria>0.35){
      c.fillRect(x-7*sc,y-7*sc,6*sc,2*sc);
      c.fillRect(x+3*sc,y-7*sc,6*sc,2*sc);
      c.fillRect(x-5*sc,y-9*sc,2*sc,2*sc);
      c.fillRect(x+5*sc,y-9*sc,2*sc,2*sc);
    }else{
      c.fillRect(x-5*sc,y-6*sc,3*sc,3*sc);
      c.fillRect(x+5*sc,y-6*sc,3*sc,3*sc);
    }
    c.fillStyle='#ffffff';
    if(euphoria>0.35){
      c.fillRect(x-8*sc,y-10*sc,2*sc,2*sc);
      c.fillRect(x+8*sc,y-10*sc,2*sc,2*sc);
    }else{
      c.fillRect(x-4*sc,y-6*sc,1*sc,1*sc);
      c.fillRect(x+6*sc,y-6*sc,1*sc,1*sc);
    }
    if(euphoria>0.25){
      c.fillStyle='#f0a080';
      c.fillRect(x-11*sc,y-1*sc,3*sc,2*sc);
      c.fillRect(x+9*sc,y-1*sc,3*sc,2*sc);
    }
    c.fillStyle='#9c5c38';
    if(euphoria>0.35){
      c.fillStyle='#4a1c1c';
      c.fillRect(x-5*sc,y+1*sc,12*sc,7*sc);
      c.fillStyle='#fff4d0';
      c.fillRect(x-4*sc,y+1*sc,10*sc,2*sc);
      c.fillStyle='#d85858';
      c.fillRect(x-2*sc,y+5*sc,7*sc,2*sc);
    }else if(smile)c.fillRect(x-4*sc,y+2*sc,11*sc,2*sc);
    else c.fillRect(x-2*sc,y+3*sc,7*sc,2*sc);
    c.fillStyle='#f0c090';
    if(euphoria>0.25){
      const wave=((tk>>2)&1)?1:-1;
      c.fillRect(x-18*sc,y-7*sc,5*sc,16*sc);
      c.fillRect(x+13*sc,y-7*sc,5*sc,16*sc);
      c.fillRect(x-20*sc,y-(12+wave)*sc,8*sc,5*sc);
      c.fillRect(x+12*sc,y-(12-wave)*sc,8*sc,5*sc);
    }else{
      c.fillRect(x-17*sc,y+8*sc,7*sc,5*sc);
      c.fillRect(x+10*sc,y+8*sc,7*sc,5*sc);
    }
  }
  function drawCutsceneWallClimber(c,x,y,sc,p,tk){
    x=Math.round(x);y=Math.round(y);sc=Math.max(1,Math.round(sc||1));
    const stepIdx=Math.min(3,Math.floor(clamp(p,0,0.999)*4));
    const reach=(stepIdx&1)?1:-1;
    c.fillStyle='rgba(0,0,0,0.24)';
    c.fillRect(x-14*sc,y+29*sc,30*sc,3*sc);

    // Bakifran: inga ansiktsdetaljer, bara nacke/har och rygg mot kameran.
    c.fillStyle='#f0c090';
    c.fillRect(x+8*sc,y-(19+reach*5)*sc,6*sc,20*sc);
    c.fillRect(x+13*sc,y-(25+reach*5)*sc,9*sc,5*sc);
    c.fillRect(x-14*sc,y-(10-reach*5)*sc,6*sc,17*sc);
    c.fillRect(x-19*sc,y-(15-reach*5)*sc,9*sc,5*sc);

    c.fillStyle='#5bc0ff';
    c.fillRect(x-9*sc,y+1*sc,20*sc,24*sc);
    c.fillStyle='#87dcff';
    c.fillRect(x-6*sc,y+3*sc,5*sc,19*sc);
    c.fillStyle='#2878ad';
    c.fillRect(x+5*sc,y+3*sc,4*sc,19*sc);
    c.fillStyle='#203040';
    c.fillRect(x-8*sc,y+22*sc,6*sc,12*sc);
    c.fillRect(x+5*sc,y+22*sc,6*sc,12*sc);
    c.fillStyle='#142030';
    c.fillRect(x-10*sc,y+(31+reach*2)*sc,11*sc,4*sc);
    c.fillRect(x+3*sc,y+(29-reach*2)*sc,11*sc,4*sc);

    c.fillStyle='#f0c090';
    c.fillRect(x-5*sc,y-2*sc,12*sc,7*sc);
    c.fillRect(x-10*sc,y-20*sc,20*sc,18*sc);
    c.fillStyle='#d8a078';
    c.fillRect(x-8*sc,y-7*sc,16*sc,5*sc);
    c.fillStyle='#ffe0b8';
    c.fillRect(x-5*sc,y-16*sc,10*sc,8*sc);
    c.fillStyle='#266f32';
    c.fillRect(x-12*sc,y-23*sc,24*sc,6*sc);
    c.fillRect(x-8*sc,y-29*sc,16*sc,6*sc);
    c.fillStyle='#42b848';
    c.fillRect(x-8*sc,y-27*sc,8*sc,4*sc);

    if(p<0.24){
      drawCutsceneSwimRing(c,x+1*sc,y+21*sc,Math.max(2,Math.round(sc*0.54)),1-p/0.24);
    }
  }
  function waterClimbMaterial(key){
    const base={
      bg:'#07111d',sky:'#10243a',dark:'#08111c',side:'#111a27',
      topBack:'#102218',top:'#4f6a2d',tuft:'#7ea947',
      ledgeDark:'#251a13',ledgeFace:'#6a4930',ledgeLip:'#d0b070',
      wallA:'#263140',wallB:'#303b4c',wallC:'#3a4556',seam:'#182130',
      detail:'#6c788a',water:'#0b5a78',wave:'#64d8ff',foam:'#d8fbff'
    };
    const sets={
      dirt:{topBack:'#1c2a16',top:'#4f7a2e',tuft:'#8abf4f',ledgeDark:'#2a1a10',ledgeFace:'#7a4a26',ledgeLip:'#c69a56',
        wallA:'#5d371d',wallB:'#714523',wallC:'#8a5a32',seam:'#3b2415',detail:'#a77a4a'},
      forest:{topBack:'#0f2618',top:'#2f6a2a',tuft:'#6fbf50',ledgeDark:'#1a120c',ledgeFace:'#4c2e18',ledgeLip:'#8f6338',
        wallA:'#332419',wallB:'#46301d',wallC:'#5a3b24',seam:'#24170f',detail:'#7c5734'},
      marble:{topBack:'#29313b',top:'#77808c',tuft:'#8eb28c',ledgeDark:'#303744',ledgeFace:'#9fa9b8',ledgeLip:'#e4d8b0',
        wallA:'#748090',wallB:'#9aa5b2',wallC:'#c2c9d2',seam:'#505b6b',detail:'#e2e6ec'},
      cave:{topBack:'#151b22',top:'#303843',tuft:'#59646f',ledgeDark:'#111820',ledgeFace:'#46505d',ledgeLip:'#87919f',
        wallA:'#343b45',wallB:'#47505b',wallC:'#5d6876',seam:'#1e2731',detail:'#9ba6b4'},
      rock:{topBack:'#18202a',top:'#47515c',tuft:'#6f8870',ledgeDark:'#17202a',ledgeFace:'#5e6772',ledgeLip:'#9aa6b2',
        wallA:'#404852',wallB:'#545d68',wallC:'#6a7480',seam:'#242c35',detail:'#9facba'},
      desert:{topBack:'#4a2c1d',top:'#c58c42',tuft:'#e9c46f',ledgeDark:'#4a2b19',ledgeFace:'#b87938',ledgeLip:'#edcc88',
        wallA:'#9a6131',wallB:'#b9793d',wallC:'#d29551',seam:'#6e4528',detail:'#efbd78',sky:'#1b2030'},
      city:{topBack:'#242a32',top:'#5c626b',tuft:'#8a929c',ledgeDark:'#1d222a',ledgeFace:'#606873',ledgeLip:'#b5b9c0',
        wallA:'#535961',wallB:'#686f78',wallC:'#7f8790',seam:'#303741',detail:'#c0c5cc'},
      crystal:{topBack:'#13344a',top:'#70b8dd',tuft:'#e8fbff',ledgeDark:'#11304a',ledgeFace:'#6cb6d8',ledgeLip:'#f4ffff',
        wallA:'#5ea4cc',wallB:'#8fd1ec',wallC:'#c8f2ff',seam:'#2c789d',detail:'#ffffff'},
      glass:{topBack:'#16384c',top:'#94dff0',tuft:'#f2ffff',ledgeDark:'#15324a',ledgeFace:'#8ed6e8',ledgeLip:'#ffffff',
        wallA:'#68adc8',wallB:'#a4dfed',wallC:'#d8f8ff',seam:'#4b9fbc',detail:'#ffffff'},
      hell:{topBack:'#351010',top:'#7a3025',tuft:'#d87848',ledgeDark:'#250b0b',ledgeFace:'#8d3d2e',ledgeLip:'#db8b5d',
        wallA:'#6b2527',wallB:'#843238',wallC:'#a24440',seam:'#2a0d11',detail:'#d46a54',sky:'#250608',water:'#5a1212',wave:'#ff7a3a',foam:'#ffb080'}
    };
    return Object.assign({},base,sets[key]||sets.dirt||{});
  }
  function drawDolphinRescueCutscene(c,r,p,cs,tk){
    c.fillStyle='#061425';c.fillRect(r.x,r.y,r.w,r.h);
    const waterY=r.y+Math.round(r.h*0.66);
    c.fillStyle='#0e2742';c.fillRect(r.x,r.y,r.w,waterY-r.y);
    c.fillStyle='#084f76';c.fillRect(r.x,waterY,r.w,r.h-waterY);
    c.fillStyle='#0d8fbb';
    for(let x=r.x-30;x<r.x+r.w+60;x+=38)c.fillRect(x+Math.round(Math.sin(tk*0.12)*3),waterY+6+((x+tk)&9),28,3);
    c.fillStyle='#a8f0ff';
    for(let x=r.x+12;x<r.x+r.w;x+=58)c.fillRect(x-Math.round(Math.sin(tk*0.18)*2),waterY+1,30,2);

    const launch=clamp((p-0.08)/0.68,0,1);
    const e=launch*launch*(3-2*launch);
    const startX=r.x+Math.round(r.w*0.46);
    const startY=waterY+76;
    const exitX=r.x+Math.round(r.w*0.72);
    const exitY=r.y-70;
    const dolphinX=startX+(exitX-startX)*e+Math.sin(tk*0.10)*2;
    const dolphinY=startY+(exitY-startY)*e;
    const angle=-1.04+Math.sin(launch*Math.PI)*0.16;
    const wake=clamp((p-0.08)/0.48,0,1);
    const splash=clamp((p-0.04)/0.28,0,1);
    const joy=clamp((p-0.42)/0.22,0,1);
    const showRider=p>0.14&&dolphinY<waterY+34;
    const lemX=dolphinX-Math.cos(angle)*18-Math.sin(angle)*34;
    const lemY=dolphinY-Math.sin(angle)*18+Math.cos(angle)*34-48;

    if(p<0.22){
      c.fillStyle='#d8fbff';
      for(let i=0;i<16;i++){
        const a=i*0.39, d=10+splash*68+(i%4)*3;
        c.fillRect(startX+Math.cos(a)*d,waterY+12+Math.sin(a)*d*0.34,2+(i%2),2);
      }
    }
    c.save();
    c.globalAlpha=1-wake*0.45;
    c.fillStyle='#b8f8ff';
    for(let i=0;i<20;i++){
      const t=i/19;
      const x=startX+(dolphinX-startX)*t+Math.sin(tk*0.16+i)*5;
      const y=waterY+8+(dolphinY-waterY)*t+Math.sin(t*5+tk*0.12)*4;
      if(y>r.y&&y<r.y+r.h)c.fillRect(Math.round(x),Math.round(y),2+(i%3),2);
    }
    c.restore();
    if(dolphinY<r.y+r.h+40){
      c.save();
      c.translate(dolphinX,dolphinY);
      c.rotate(angle);
      drawCutsceneDolphinClose(c,0,0,3.4,p,1);
      c.restore();
      if(showRider)drawCutsceneLemClose(c,lemX,lemY,3,true,false,tk,joy);
    }
    if(p>0.22&&p<0.72){
      c.save();c.globalAlpha=1-wake*0.35;c.fillStyle='#d8fbff';
      for(let i=0;i<22;i++){
        const a=-2.4+i*0.22, d=18+wake*82+(i%5)*3;
        c.fillRect(startX+Math.cos(a)*d*0.55,startY-18+Math.sin(a)*d,2+(i%2),2);
      }
      c.restore();
    }
    if(p>0.46&&p<0.86){
      c.fillStyle='#fff7b0';
      for(let i=0;i<8;i++){
        const a=i*0.78+tk*0.05, d=16+joy*38;
        c.fillRect(Math.round(lemX+Math.cos(a)*d),Math.round(lemY-18+Math.sin(a)*d*0.70),i%2?3:5,i%2?3:5);
      }
      if(((tk>>2)&1)===0)drawTextC(c,'RADDAD!',lemX+4,lemY-58,2,'#fff7b0');
    }
    for(let i=0;i<9;i++){
      const bp=(p*1.2+i*0.13)%1;
      drawCutsceneBubble(c,r.x+40+i*45,waterY+50-bp*90,2+(i%3),tk,i+20);
    }
    drawCutsceneAtmosphere(c,r,cs,tk);
  }
  function drawWaterClimbCutscene(c,r,p,cs,tk){
    const ctx=cutsceneWorldContext(cs);
    const mat=waterClimbMaterial(ctx.themeKey);
    c.fillStyle=mat.bg;c.fillRect(r.x,r.y,r.w,r.h);
    const topY=r.y+46;
    const waterY=r.y+Math.round(r.h*0.82);
    const cx=r.x+Math.round(r.w*0.52);
    const topL=cx-118, topR=cx+126;
    const botL=r.x+68, botR=r.x+r.w-60;
    const wallAt=y=>{
      const t=clamp((y-topY)/Math.max(1,waterY-topY),0,1);
      return {
        t,
        left:Math.round(topL+(botL-topL)*t),
        right:Math.round(topR+(botR-topR)*t)
      };
    };

    c.fillStyle=mat.sky;c.fillRect(r.x,r.y,r.w,waterY-r.y);
    c.fillStyle=mat.dark;c.fillRect(r.x,r.y,r.w,topY-18-r.y);
    const topEdge=wallAt(topY);
    const ledgeL=topEdge.left-22,ledgeR=topEdge.right+22,ledgeW=ledgeR-ledgeL;
    c.fillStyle=mat.topBack;c.fillRect(ledgeL,topY-26,ledgeW,15);
    c.fillStyle=mat.top;c.fillRect(ledgeL+4,topY-31,ledgeW-8,6);
    c.fillStyle=mat.tuft;
    for(let x=ledgeL+8;x<ledgeR-8;x+=22)c.fillRect(x,topY-35-((x+tk)&3),12,4);
    c.fillStyle=mat.ledgeDark;c.fillRect(ledgeL,topY-11,ledgeW,11);
    c.fillStyle=mat.ledgeFace;c.fillRect(topEdge.left-12,topY-6,topEdge.right-topEdge.left+24,7);
    c.fillStyle=mat.ledgeLip;c.fillRect(topEdge.left+4,topY-1,topEdge.right-topEdge.left-8,3);

    c.fillStyle=mat.side;c.fillRect(r.x,topY+2,r.w,waterY-topY);
    for(let y=topY;y<waterY+8;y+=6){
      const b=wallAt(y), w=b.right-b.left;
      const shade=0.20+b.t*0.12+(((y>>3)&1)?0.03:0);
      c.fillStyle=shade>0.30?mat.wallC:(shade>0.25?mat.wallB:mat.wallA);
      c.fillRect(b.left,y,w,6);
      if(((y+tk)>>3)&1){
        c.fillStyle='rgba(255,255,255,0.07)';
        c.fillRect(b.left+Math.round(w*0.10),y+1,Math.round(w*0.72),1);
      }
    }
    c.fillStyle=mat.seam;
    for(let y=topY+12;y<waterY;y+=24){
      const b=wallAt(y), w=b.right-b.left;
      c.fillRect(b.left+Math.round(w*0.06),y,Math.round(w*0.88),2);
      for(let x=b.left+Math.round(w*0.18)+((y>>1)%19);x<b.right-Math.round(w*0.12);x+=Math.max(18,Math.round(w*0.18))){
        c.fillRect(x,y+1,2,14);
      }
    }
    c.fillStyle=mat.detail;
    for(let y=topY+22;y<waterY-28;y+=38){
      const b=wallAt(y), w=b.right-b.left;
      c.fillRect(b.left+Math.round(w*0.22),y,12,3);
      c.fillRect(b.left+Math.round(w*0.63),y+13,14,3);
      c.fillRect(b.left+Math.round(w*0.45),y+25,9,3);
    }

    const climb=clamp((p-0.08)/0.86,0,1);
    const stepCount=4;
    const rawStep=clamp(climb*stepCount,0,stepCount-0.001);
    const stepIdx=Math.floor(rawStep);
    const stepP=rawStep-stepIdx;
    const stepEase=stepP*stepP*(3-2*stepP);
    const climbEase=(stepIdx+stepEase)/stepCount;
    const startY=waterY-14;
    const endY=topY+72;
    const lemY=startY+(endY-startY)*climbEase+Math.sin(tk*0.18)*2;
    const lemBounds=wallAt(lemY);
    const lemX=Math.round((lemBounds.left+lemBounds.right)/2)+Math.round(Math.sin(tk*0.11)*1);
    const sc=2;

    c.fillStyle=mat.water;c.fillRect(r.x,waterY,r.w,r.h-waterY);
    c.fillStyle=mat.wave;
    for(let x=r.x-20;x<r.x+r.w+28;x+=34)c.fillRect(x+Math.round(Math.sin(tk*0.12)*4),waterY+8+((x+tk)&7),24,3);
    c.fillStyle='#b8f8ff';
    for(let x=r.x+16;x<r.x+r.w;x+=58)c.fillRect(x-Math.round(Math.sin(tk*0.16)*3),waterY+1,34,2);
    c.fillStyle=mat.foam;
    for(let i=0;i<16;i++){
      const bp=(p*1.25+i*0.11)%1;
      const bx=r.x+34+i*28+Math.sin(tk*0.13+i)*5;
      c.fillRect(Math.round(bx),Math.round(waterY+46-bp*96),2+(i%3),2+(i%2));
    }
    if(p<0.30){
      const splash=clamp(p/0.30,0,1);
      c.save();c.globalAlpha=1-splash*0.4;c.fillStyle=mat.foam;
      for(let i=0;i<18;i++){
        const a=i*0.35, d=8+splash*48+(i%4)*3;
        c.fillRect(lemX+Math.cos(a)*d,waterY+4+Math.sin(a)*d*0.42,2+(i%2),2);
      }
      c.restore();
    }

    c.save();
    c.globalAlpha=0.36;
    c.fillStyle='#050913';
    c.fillRect(lemX-12,lemY-18,25,39);
    c.restore();
    drawCutsceneWallClimber(c,lemX,lemY,sc,climb,tk);

    if(p>0.62){
      c.fillStyle=mat.foam;
      for(let i=0;i<8;i++){
        const yy=lemY+10+i*8;
        c.fillRect(lemX-9+(i%2)*18,yy,1,4);
      }
    }
    drawCutsceneAtmosphere(c,r,cs,tk);
  }
  function drawFishRingCutscene(c,r,p,cs,tk){
    c.fillStyle='#061122';c.fillRect(r.x,r.y,r.w,r.h);
    const waterY=r.y+Math.round(r.h*0.60);
    const shine=Math.round(Math.sin(tk*0.16)*2);
    c.fillStyle='#102846';c.fillRect(r.x,r.y,r.w,waterY-r.y);
    c.fillStyle='#075a78';c.fillRect(r.x,waterY,r.w,r.h-waterY);
    c.fillStyle='#0e86a8';
    for(let x=r.x-20;x<r.x+r.w+40;x+=34)c.fillRect(x+shine,waterY+8+((x+tk)&7),22,3);
    c.fillStyle='#63d8ff';c.fillRect(r.x,waterY-2,r.w,3);
    c.fillStyle='#b8f8ff';
    for(let x=r.x+20;x<r.x+r.w;x+=54)c.fillRect(x-shine,waterY+2,24,2);

    const lemX=r.x+Math.round(r.w*0.63), lemY=r.y+Math.round(r.h*0.47);
    const fishIn=clamp(p/0.28,0,1);
    const handoff=clamp((p-0.32)/0.33,0,1);
    const ringOn=p>0.58;
    const smile=p>0.52;
    const euphoria=clamp((p-0.70)/0.18,0,1);
    const fishX=r.x-50+fishIn*150+(p>0.68?(p-0.68)*170:0);
    const fishY=waterY-28+Math.sin(tk*0.22)*4;

    drawCutsceneLemClose(c,lemX,lemY,4,smile,ringOn,tk,euphoria);
    drawCutsceneFish(c,fishX,fishY,3,p,p<0.43);
    if(p>=0.38&&p<0.67){
      const sx=fishX+54, sy=fishY+8;
      const tx=lemX+4, ty=lemY+70;
      const e=handoff*handoff*(3-2*handoff);
      drawCutsceneSwimRing(c,sx+(tx-sx)*e,sy+(ty-sy)*e,2,1);
    }
    if(p>0.56&&p<0.88){
      const burst=clamp((p-0.56)/0.32,0,1);
      c.save();
      c.globalAlpha=1-burst;
      c.fillStyle='#d8fbff';
      for(let i=0;i<12;i++){
        const a=i*0.52, d=8+burst*42;
        c.fillRect(lemX+Math.cos(a)*d,lemY+62+Math.sin(a)*d*0.55,2,2);
      }
      c.restore();
    }
    for(let i=0;i<8;i++){
      const bp=(p*1.4+i*0.17)%1;
      drawCutsceneBubble(c,r.x+82+i*43,waterY+42-bp*95,2+(i%3),tk,i);
    }
    if(p>0.72){
      c.fillStyle='#fff7b0';
      const joy=clamp((p-0.72)/0.20,0,1);
      for(let i=0;i<10;i++){
        const a=i*0.63+tk*0.04, d=22+joy*46+(i%3)*4;
        const sx=lemX+Math.cos(a)*d, sy=lemY-18+Math.sin(a)*d*0.75;
        c.fillRect(Math.round(sx),Math.round(sy),i%2?3:5,i%2?3:5);
      }
      if(((tk>>2)&1)===0)drawTextC(c,'JIPPI!',lemX+6,lemY-78,2,'#fff7b0');
    }
    drawCutsceneAtmosphere(c,r,cs,tk);
  }

  function makeCutscenePreviewSpec(mode){
    mode=(mode==='fullscreen'||mode==='full')?'fullscreen':'box';
    return {
      id:'cutscene-preview-'+mode,
      label:mode==='fullscreen'?'Test: fullskarm':'Test: ruta',
      group:'Teknik',
      order:mode==='fullscreen'?20:10,
      title:'CUTSCENE TEST',
      mode,
      pauseGame:true,
      respectPrefs:false,
      skippable:true,
      shots:[
        {seconds:1.5,title:'CUTSCENE MODUL',text:['Spelet ar stoppat medan filmen spelar.'],scene:'field',bg:'#111b2e'},
        {seconds:1.5,title:mode==='fullscreen'?'FULLSKARM':'RUTA',text:['Samma API kan rita i ruta eller over hela skarmen.'],scene:mode==='fullscreen'?'city':'cave',bg:mode==='fullscreen'?'#070b18':'#101014'}
      ]
    };
  }
  function makeFishRingCutsceneSpec(mode){
    mode=(mode==='box')?'box':'fullscreen';
    return {
      id:'fish-ring-closeup',
      label:'Fisk ger badring',
      group:'Raddningar',
      order:10,
      title:'FISKEN HJALPER TILL',
      mode,
      pauseGame:true,
      skippable:true,
      advanceOnInput:false,
      shots:[{
        duration:Math.max(1,Math.floor(3000/TICK)),
        title:'FISKEN HJALPER TILL',
        text:['PLASK! EN BADRING TILL LEMMELN.'],
        draw:drawFishRingCutscene
      }]
    };
  }
  function makeDolphinRescueCutsceneSpec(mode){
    mode=(mode==='box')?'box':'fullscreen';
    return {
      id:'dolphin-rescue-closeup',
      label:'Delfinraddning',
      group:'Raddningar',
      order:20,
      title:'DELFINEN RADDAR',
      mode,
      pauseGame:true,
      skippable:true,
      advanceOnInput:false,
      shots:[{
        duration:Math.max(1,Math.floor(3000/TICK)),
        title:'DELFINEN RADDAR',
        text:['EN DELFIN LYFTER LEMMELN UR VATTNET!'],
        draw:drawDolphinRescueCutscene
      }]
    };
  }
  function makeWaterClimbCutsceneSpec(mode){
    mode=(mode==='box')?'box':'fullscreen';
    return {
      id:'water-climb-closeup',
      label:'Klattrar ur vatten',
      group:'Raddningar',
      order:30,
      title:'UPP UR VATTNET',
      mode,
      pauseGame:true,
      skippable:true,
      advanceOnInput:false,
      shots:[{
        duration:Math.max(1,Math.floor(3000/TICK)),
        title:'UPP UR VATTNET',
        text:['LEMMELN FAR GREPP OCH KLATTRAR UPPFOR VAGGEN.'],
        draw:drawWaterClimbCutscene
      }]
    };
  }
  function playFishRingCutscene(l,fish,z,mode){
    if(G.cutsceneActive&&G.cutsceneActive())return null;
    const spec=makeFishRingCutsceneSpec(mode||'fullscreen');
    spec.event=makeCutsceneWorldContext(l,z,{
      lemX:l&&Number.isFinite(l.x)?Math.round(l.x):null,
      lemY:l&&Number.isFinite(l.y)?Math.round(l.y):null,
      fishX:fish&&Number.isFinite(fish.x)?Math.round(fish.x):null,
      fishY:fish&&Number.isFinite(fish.y)?Math.round(fish.y):null,
      waterY:z&&Number.isFinite(z.y)?Math.round(z.y):null,
      rescueOnly:!!(fish&&fish.rescueOnly)
    });
    applyRescueCutsceneText(spec,'fish');
    return G.playCutscene(spec,{respectPrefs:true});
  }
  function playDolphinRescueCutscene(l,z,spot,sx,sy,mode){
    if(G.cutsceneActive&&G.cutsceneActive())return null;
    const spec=makeDolphinRescueCutsceneSpec(mode||'fullscreen');
    spec.event=makeCutsceneWorldContext(l,z,{
      lemX:l&&Number.isFinite(l.x)?Math.round(l.x):null,
      lemY:l&&Number.isFinite(l.y)?Math.round(l.y):null,
      waterX:Number.isFinite(sx)?Math.round(sx):null,
      waterY:Number.isFinite(sy)?Math.round(sy):null,
      shoreX:spot&&Number.isFinite(spot.x)?Math.round(spot.x):null,
      shoreY:spot&&Number.isFinite(spot.y)?Math.round(spot.y):null
    });
    applyRescueCutsceneText(spec,'dolphin');
    return G.playCutscene(spec,{respectPrefs:true});
  }
  function playWaterClimbCutscene(l,z,mode){
    if(G.cutsceneActive&&G.cutsceneActive())return null;
    const spec=makeWaterClimbCutsceneSpec(mode||'fullscreen');
    spec.event=makeCutsceneWorldContext(l,z,{
      lemX:l&&Number.isFinite(l.x)?Math.round(l.x):null,
      lemY:l&&Number.isFinite(l.y)?Math.round(l.y):null,
      dir:l&&Number.isFinite(l.dir)?Math.round(l.dir):null,
      waterY:z&&Number.isFinite(z.y)?Math.round(z.y):null
    });
    applyRescueCutsceneText(spec,'climb');
    return G.playCutscene(spec,{respectPrefs:true});
  }

  Object.assign(G,{
    makeCutscenePreviewSpec,
    makeFishRingCutsceneSpec,
    makeDolphinRescueCutsceneSpec,
    makeWaterClimbCutsceneSpec,
    applyRescueCutsceneText,
    playFishRingCutscene,
    playDolphinRescueCutscene,
    playWaterClimbCutscene
  });

  G.registerCutscene(makeCutscenePreviewSpec('box'));
  G.registerCutscene(makeCutscenePreviewSpec('fullscreen'));
  G.registerCutscene(makeFishRingCutsceneSpec('fullscreen'));
  G.registerCutscene(makeDolphinRescueCutsceneSpec('fullscreen'));
  G.registerCutscene(makeWaterClimbCutsceneSpec('fullscreen'));
})();
