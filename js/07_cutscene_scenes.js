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
    const step=((p*10)|0)&1;
    const reach=step?1:-1;
    c.fillStyle='rgba(0,0,0,0.24)';
    c.fillRect(x-14*sc,y+29*sc,30*sc,3*sc);

    c.fillStyle='#f0c090';
    c.fillRect(x+8*sc,y-(18+reach*3)*sc,6*sc,18*sc);
    c.fillRect(x+12*sc,y-(23+reach*3)*sc,8*sc,5*sc);
    c.fillRect(x-14*sc,y-(8-reach*4)*sc,6*sc,16*sc);
    c.fillRect(x-18*sc,y-(12-reach*4)*sc,8*sc,5*sc);

    c.fillStyle='#5bc0ff';
    c.fillRect(x-8*sc,y+2*sc,18*sc,22*sc);
    c.fillStyle='#87dcff';
    c.fillRect(x-5*sc,y+4*sc,7*sc,17*sc);
    c.fillStyle='#203040';
    c.fillRect(x-7*sc,y+21*sc,6*sc,12*sc);
    c.fillRect(x+4*sc,y+21*sc,6*sc,12*sc);
    c.fillStyle='#142030';
    c.fillRect(x-9*sc,y+(30+reach*2)*sc,10*sc,4*sc);
    c.fillRect(x+3*sc,y+(28-reach*2)*sc,10*sc,4*sc);

    c.fillStyle='#f0c090';
    c.fillRect(x-10*sc,y-20*sc,20*sc,20*sc);
    c.fillRect(x-5*sc,y-1*sc,12*sc,7*sc);
    c.fillStyle='#ffe0b8';
    c.fillRect(x-6*sc,y-16*sc,10*sc,9*sc);
    c.fillStyle='#266f32';
    c.fillRect(x-12*sc,y-24*sc,24*sc,6*sc);
    c.fillRect(x-8*sc,y-29*sc,16*sc,6*sc);
    c.fillStyle='#42b848';
    c.fillRect(x-8*sc,y-27*sc,8*sc,4*sc);
    c.fillStyle='#101018';
    c.fillRect(x-4*sc,y-13*sc,3*sc,3*sc);
    c.fillRect(x+5*sc,y-13*sc,3*sc,3*sc);
    c.fillStyle='#ffffff';
    c.fillRect(x-3*sc,y-13*sc,1*sc,1*sc);
    c.fillRect(x+6*sc,y-13*sc,1*sc,1*sc);
    c.fillStyle='#9c5c38';
    c.fillRect(x-3*sc,y-5*sc,9*sc,2*sc);

    if(p<0.24){
      drawCutsceneSwimRing(c,x+1*sc,y+21*sc,Math.max(2,Math.round(sc*0.54)),1-p/0.24);
    }
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
  }
  function drawWaterClimbCutscene(c,r,p,cs,tk){
    c.fillStyle='#07111d';c.fillRect(r.x,r.y,r.w,r.h);
    const waterY=r.y+Math.round(r.h*0.76);
    c.fillStyle='#10243a';c.fillRect(r.x,r.y,r.w,waterY-r.y);
    c.fillStyle='#0b5a78';c.fillRect(r.x,waterY,r.w,r.h-waterY);

    const wallRight=r.x+r.w+18;
    const edgeAt=y=>{
      const t=clamp((y-r.y)/Math.max(1,r.h),0,1);
      return r.x+Math.round(r.w*(0.60-0.16*t));
    };
    for(let y=r.y;y<r.y+r.h;y+=6){
      const t=clamp((y-r.y)/Math.max(1,r.h),0,1);
      const left=edgeAt(y);
      c.fillStyle=t>0.72?'#354050':(t>0.38?'#2d3747':'#232d3b');
      c.fillRect(left,y,wallRight-left,6);
      if(((y+tk)>>3)&1){
        c.fillStyle='rgba(255,255,255,0.08)';
        c.fillRect(left+6,y+1,Math.max(8,wallRight-left-28),1);
      }
    }
    c.fillStyle='#182232';
    for(let y=r.y+12;y<r.y+r.h;y+=28){
      const left=edgeAt(y);
      c.fillRect(left,y,wallRight-left,2);
    }
    for(let y=r.y+8;y<r.y+r.h;y+=22){
      const left=edgeAt(y);
      for(let x=left+16+((y>>1)%18);x<wallRight;x+=42)c.fillRect(x,y,2,16);
    }
    c.fillStyle='#566276';
    for(let y=r.y+18;y<waterY;y+=35){
      const left=edgeAt(y);
      c.fillRect(left+7,y,10,3);
      c.fillRect(left+28,y+10,7,2);
    }

    const climb=clamp((p-0.05)/0.78,0,1);
    const climbEase=climb*climb*(3-2*climb);
    const lemY=waterY+28-(waterY-r.y-74)*climbEase+Math.sin(tk*0.18)*2;
    const lemX=edgeAt(lemY)+30+Math.sin(tk*0.11)*2;
    const sc=Math.round(5-climbEase*1.4);

    c.fillStyle='#64d8ff';
    for(let x=r.x-20;x<r.x+r.w+28;x+=34)c.fillRect(x+Math.round(Math.sin(tk*0.12)*4),waterY+8+((x+tk)&7),24,3);
    c.fillStyle='#d8fbff';
    for(let i=0;i<16;i++){
      const bp=(p*1.25+i*0.11)%1;
      const bx=r.x+34+i*28+Math.sin(tk*0.13+i)*5;
      c.fillRect(Math.round(bx),Math.round(waterY+46-bp*96),2+(i%3),2+(i%2));
    }
    if(p<0.30){
      const splash=clamp(p/0.30,0,1);
      c.save();c.globalAlpha=1-splash*0.4;c.fillStyle='#d8fbff';
      for(let i=0;i<18;i++){
        const a=i*0.35, d=8+splash*48+(i%4)*3;
        c.fillRect(lemX+Math.cos(a)*d,waterY+4+Math.sin(a)*d*0.42,2+(i%2),2);
      }
      c.restore();
    }

    c.save();
    c.globalAlpha=0.55;
    c.fillStyle='#050913';
    c.fillRect(edgeAt(lemY)+6,lemY-32,44,70);
    c.restore();
    drawCutsceneWallClimber(c,lemX,lemY,sc,climb,tk);

    if(p>0.62){
      c.fillStyle='#b7f2ff';
      for(let i=0;i<8;i++){
        const yy=lemY+10+i*8;
        c.fillRect(edgeAt(yy)+18+(i%2)*9,yy,2,5);
      }
    }
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
        duration:Math.round(3700/TICK),
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
        duration:Math.round(3700/TICK),
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
        duration:Math.round(3400/TICK),
        title:'UPP UR VATTNET',
        text:['LEMMELN FAR GREPP OCH KLATTRAR UPPFOR VAGGEN.'],
        draw:drawWaterClimbCutscene
      }]
    };
  }
  function playFishRingCutscene(l,fish,z,mode){
    if(G.cutsceneActive&&G.cutsceneActive())return null;
    const spec=makeFishRingCutsceneSpec(mode||'fullscreen');
    spec.event={
      lemX:l&&Number.isFinite(l.x)?Math.round(l.x):null,
      lemY:l&&Number.isFinite(l.y)?Math.round(l.y):null,
      fishX:fish&&Number.isFinite(fish.x)?Math.round(fish.x):null,
      fishY:fish&&Number.isFinite(fish.y)?Math.round(fish.y):null,
      waterY:z&&Number.isFinite(z.y)?Math.round(z.y):null
    };
    return G.playCutscene(spec,{respectPrefs:true});
  }
  function playDolphinRescueCutscene(l,z,spot,sx,sy,mode){
    if(G.cutsceneActive&&G.cutsceneActive())return null;
    const spec=makeDolphinRescueCutsceneSpec(mode||'fullscreen');
    spec.event={
      lemX:l&&Number.isFinite(l.x)?Math.round(l.x):null,
      lemY:l&&Number.isFinite(l.y)?Math.round(l.y):null,
      waterX:Number.isFinite(sx)?Math.round(sx):null,
      waterY:Number.isFinite(sy)?Math.round(sy):null,
      shoreX:spot&&Number.isFinite(spot.x)?Math.round(spot.x):null,
      shoreY:spot&&Number.isFinite(spot.y)?Math.round(spot.y):null
    };
    return G.playCutscene(spec,{respectPrefs:true});
  }
  function playWaterClimbCutscene(l,z,mode){
    if(G.cutsceneActive&&G.cutsceneActive())return null;
    const spec=makeWaterClimbCutsceneSpec(mode||'fullscreen');
    spec.event={
      lemX:l&&Number.isFinite(l.x)?Math.round(l.x):null,
      lemY:l&&Number.isFinite(l.y)?Math.round(l.y):null,
      dir:l&&Number.isFinite(l.dir)?Math.round(l.dir):null,
      waterY:z&&Number.isFinite(z.y)?Math.round(z.y):null
    };
    return G.playCutscene(spec,{respectPrefs:true});
  }

  Object.assign(G,{
    makeCutscenePreviewSpec,
    makeFishRingCutsceneSpec,
    makeDolphinRescueCutsceneSpec,
    makeWaterClimbCutsceneSpec,
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
