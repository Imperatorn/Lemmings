// --------------------------- SKÄRMAR --------------------------------
function drawTitleRidge(c,base,col,amp,seed){
  c.fillStyle=col;
  c.beginPath();c.moveTo(0,CH);
  for(let x=0;x<=CW+24;x+=24){
    const y=(base+Math.sin(x*0.023+seed)*amp*0.35+hash2(x+seed*31,seed)*amp)|0;
    c.lineTo(x,y);
  }
  c.lineTo(CW,CH);c.closePath();c.fill();
}

function drawTitleTorch(c,x,y,tk){
  const fl=Math.sin(tk*0.34+x)*1.2+Math.sin(tk*0.17+x*0.5)*0.8;
  c.globalAlpha=0.12+0.04*Math.sin(tk*0.22+x);
  c.fillStyle='#ff9c30';c.fillRect(x-8,y-18,16,16);
  c.globalAlpha=1;
  c.fillStyle='#3a2416';c.fillRect(x-2,y-8,4,8);
  c.fillStyle='#7a4a22';c.fillRect(x-1,y-9,2,9);
  const fy=Math.round(y-12+fl*0.35);
  c.fillStyle='#d84018';c.fillRect(x-3,fy,6,5);
  c.fillStyle='#ff8a20';c.fillRect(x-2,fy-2,4,6);
  c.fillStyle='#ffe060';c.fillRect(x-1,fy-1,2,3);
}

function drawTitleGrass(c,x,y,h,tk,seed){
  const sway=Math.round(Math.sin(tk*0.05+seed)*1.4);
  c.fillStyle='#226f28';c.fillRect(x,y-h,1,h);
  c.fillStyle='#46a842';c.fillRect(x+1+sway,y-h+2,1,Math.max(2,h-2));
  c.fillStyle='#7cc060';c.fillRect(x-1+sway,y-h+3,1,Math.max(1,h-3));
}

function drawTitleBackdrop(c,tk){
  const g=c.createLinearGradient(0,0,0,CH);
  g.addColorStop(0,'#09070a');g.addColorStop(0.55,'#17120d');g.addColorStop(1,'#07160c');
  c.fillStyle=g;c.fillRect(0,0,CW,CH);

  c.globalAlpha=0.18+0.03*Math.sin(tk*0.025);
  c.fillStyle='#f0d68a';c.fillRect(392,28,18,18);
  c.fillStyle='#fff2b8';c.fillRect(396,31,12,12);c.fillRect(393,35,16,6);
  c.globalAlpha=1;

  for(let i=0;i<52;i++){
    const tw=clamp(0.18+0.32*Math.sin(hash2(i,5)*7+tk*0.025),0.04,0.48);
    c.globalAlpha=tw;
    c.fillStyle=i%9===0?'#d8c894':'#9b8764';
    const s=i%13===0?2:1;
    c.fillRect(Math.floor(hash2(i,1)*CW),Math.floor(hash2(i,2)*145),s,1);
  }
  c.globalAlpha=1;

  drawTitleRidge(c,150,'#18120f',27,2);
  drawTitleRidge(c,176,'#182315',22,7);
  drawTitleRidge(c,198,'#0d2a13',15,11);

  for(let i=0;i<15;i++){
    const x=(hash2(i,31)*CW+Math.sin(tk*0.025+i)*7+CW)%CW;
    const y=134+hash2(i,32)*54+Math.sin(tk*0.04+i*2)*3;
    c.globalAlpha=clamp(0.18+0.25*Math.sin(tk*0.07+i),0.04,0.45);
    c.fillStyle=i%3?'#b8ffd0':'#ffe890';
    c.fillRect(Math.round(x),Math.round(y),1,1);
  }
  c.globalAlpha=1;
}

function drawTitleGround(c,tk){
  c.fillStyle='#123b16';c.fillRect(0,206,CW,4);
  c.fillStyle='#1f6a22';c.fillRect(0,210,CW,4);
  c.fillStyle='#704018';c.fillRect(0,214,CW,86);
  c.fillStyle='#5c3414';c.fillRect(0,236,CW,64);
  c.fillStyle='#8a5524';c.fillRect(0,214,CW,2);
  c.globalAlpha=0.35;
  c.fillStyle='#9c642d';for(let x=0;x<CW;x+=28)c.fillRect(x,228+Math.round(Math.sin(x*0.08)*3),22,1);
  c.fillStyle='#3a210e';for(let x=10;x<CW;x+=44)c.fillRect(x,260+Math.round(Math.sin(x*0.07)*5),30,1);
  c.globalAlpha=1;

  for(let i=0;i<18;i++)drawTitleGrass(c,Math.floor(hash2(i,41)*CW),210,4+Math.floor(hash2(i,42)*7),tk,i);
  c.fillStyle='#c8c0a0';
  for(let i=0;i<28;i++){
    const x=Math.floor(hash2(i,51)*CW),y=221+Math.floor(hash2(i,52)*63);
    c.fillRect(x,y,1+(i%3===0?1:0),1);
  }
  c.fillStyle='#3b220f';
  for(let i=0;i<8;i++){
    const x=Math.floor(hash2(i,61)*CW),y=228+Math.floor(hash2(i,62)*42);
    c.fillRect(x,y,12+Math.floor(hash2(i,63)*18),1);
    c.fillRect(x+3,y+1,1,4+Math.floor(hash2(i,64)*5));
  }

  c.fillStyle='#171512';c.fillRect(28,188,44,26);
  c.fillStyle='#2d241b';c.fillRect(23,202,54,12);c.fillRect(31,184,34,5);
  c.fillStyle='#0b0a08';c.fillRect(36,194,24,20);
  c.fillStyle='#5a4632';c.fillRect(27,202,5,5);c.fillRect(63,201,6,6);c.fillRect(36,186,8,3);c.fillRect(51,185,9,4);
  drawTitleTorch(c,78,207,tk);

  c.fillStyle='#221914';c.fillRect(392,185,36,29);
  c.fillStyle='#6c4b2a';c.fillRect(388,205,44,9);c.fillRect(396,181,28,5);
  c.fillStyle='#120d0a';c.fillRect(400,193,20,21);
  c.fillStyle='#d0a060';c.fillRect(402,193,16,1);c.fillRect(402,193,1,14);c.fillRect(417,193,1,14);
  c.globalAlpha=0.18+0.06*Math.sin(tk*0.08);
  c.fillStyle='#d0a060';c.fillRect(398,190,24,18);
  c.globalAlpha=1;
  drawTitleTorch(c,386,207,tk);drawTitleTorch(c,434,207,tk);

  c.fillStyle='#7a4a22';c.fillRect(116,202,18,12);
  c.fillStyle='#c08038';c.fillRect(118,204,14,3);
  c.fillStyle='#d8b058';c.fillRect(115,201,20,1);c.fillRect(124,202,2,12);
  if((tk&31)<11){c.fillStyle='#fff0b0';c.fillRect(136,198,2,1);c.fillRect(137,197,1,3)}
}

function drawTitleLemmings(c,tk){
  for(const l of G.titleLems){
    if(l.titleSpeed==null)l.titleSpeed=0.38+hash2(l.id,22)*0.18;
    const last=l.titleLastTk;
    const dt=last==null?1:clamp(tk-last,0,4);
    if(dt>0){
      l.titleLastTk=tk;l.anim+=dt;l.x+=l.dir*l.titleSpeed*dt;
      if(l.x<-12)l.x=CW+12;if(l.x>CW+12)l.x=-12;
    }
    const x=Math.round(l.x);
    c.globalAlpha=0.24;c.fillStyle='#000000';c.fillRect(x-5,211,10,1);c.globalAlpha=1;
    drawLemming(c,l,x,210);
  }
}

function drawTitleLogo(c,tk){
  const t='LEMMEL!';
  const sc=6, tw=textW(t,sc);
  const px=Math.round(CW/2-tw/2-24), py=34, pw=tw+48, ph=76;
  c.fillStyle='#050403';c.fillRect(px+4,py+7,pw,ph);
  c.fillStyle='#21150c';c.fillRect(px,py,pw,ph);
  c.fillStyle='#5b3619';c.fillRect(px+3,py+3,pw-6,ph-6);
  c.fillStyle='#2d1d10';c.fillRect(px+7,py+8,pw-14,ph-14);
  c.fillStyle='#7a4a22';c.fillRect(px+9,py+10,pw-18,3);
  c.fillStyle='#140d08';c.fillRect(px+9,py+ph-13,pw-18,3);
  c.fillStyle='#8a6532';
  for(let i=0;i<7;i++){
    const x=px+18+i*Math.floor((pw-36)/6);
    c.fillRect(x,py+13,2,2);
    if(i%2===0)c.fillRect(x+1,py+ph-17,2,1);
  }
  c.globalAlpha=0.42;
  c.fillStyle='#203b18';
  c.fillRect(px+12,py+6,38,3);c.fillRect(px+21,py+9,17,2);
  c.fillRect(px+pw-62,py+ph-16,42,3);c.fillRect(px+pw-47,py+ph-19,18,2);
  c.globalAlpha=1;

  let x=CW/2-tw/2;
  const textY=62;
  for(let i=0;i<t.length;i++){
    const ch=t[i], b=Math.round(Math.sin(tk*0.055+i*0.9)*1.2);
    drawText(c,ch,x+3,textY+3+b,sc,'#0a0705');
    drawText(c,ch,x-1,textY+1+b,sc,'#1a1008');
    drawText(c,ch,x+1,textY+1+b,sc,'#1a1008');
    drawText(c,ch,x,textY+b,sc,i%2?'#d8c06a':'#f1d982');
    drawText(c,ch,x,textY-1+b,sc,'rgba(255,240,170,0.22)');
    if(i%2===0){c.fillStyle='#6c8f3f';c.fillRect(Math.round(x+4),textY-2+b,7,2)}
    x+=(FONT[ch][0].length+1)*sc;
  }
}

function drawTitle(c,tk){
  drawTitleBackdrop(c,tk);
  drawTitleLogo(c,tk);
  drawTextC(c,'EN HYLLNING TILL DOS-KLASSIKERN',CW/2,123,1,'#9b8d68');
  drawTitleGround(c,tk);
  drawTitleLemmings(c,tk);
  if((tk>>4)&1)drawTextC(c,'KLICKA FÖR ATT BÖRJA',CW/2,160,2,'#f3df9a');
  drawTextC(c,'HJÄLP FLOCKEN ATT HITTA HEM TILL LÄMMELHIMLEN',CW/2,232,1,'#b8d890');
}

function drawMenuVolumeBar(c,r,val,on){
  val=clamp(Number.isFinite(val)?val:1,0,1);
  c.fillStyle='#0d0b08';c.fillRect(r.x,r.y+4,r.w,r.h-8);
  c.fillStyle='#2a2117';c.fillRect(r.x+1,r.y+5,r.w-2,r.h-10);
  c.fillStyle=on?'#4fc060':'#505050';c.fillRect(r.x+2,r.y+6,Math.max(1,Math.round((r.w-4)*val)),r.h-12);
  c.fillStyle=on?'#b8ffc0':'#909090';
  const tx=clamp(r.x+2+Math.round((r.w-4)*val),r.x+2,r.x+r.w-5);
  c.fillRect(tx,r.y+3,3,r.h-6);
  drawTextC(c,Math.round(val*100)+'%',r.x+r.w/2,r.y+2,1,on?'#ffffff':'#808080');
}

function drawMenuActionButton(c,r,label,on){
  const hov=G.mx>=r.x&&G.mx<r.x+r.w&&G.my>=r.y&&G.my<r.y+r.h;
  c.fillStyle=hov?'#3a2a1b':(on?'#241a12':'#16110d');
  c.fillRect(r.x,r.y,r.w,r.h);
  c.fillStyle=hov?'#d0a060':'#6f4e2d';
  c.fillRect(r.x,r.y,r.w,1);c.fillRect(r.x,r.y,1,r.h);
  c.fillStyle='#06090f';
  c.fillRect(r.x,r.y+r.h-1,r.w,1);c.fillRect(r.x+r.w-1,r.y,1,r.h);
  drawTextC(c,label,r.x+r.w/2,r.y+5,1,hov?'#fff0b8':'#d8c8a8');
}

function drawProfileOverlayButton(c,buttons,action,label,x,y,w,h,id,active){
  const r={action,label,x,y,w,h,id};
  buttons.push(r);
  const hov=G.mx>=x&&G.mx<x+w&&G.my>=y&&G.my<y+h;
  c.fillStyle=active?'#244828':(hov?'#3a2a1b':'#17120d');
  c.fillRect(x,y,w,h);
  c.fillStyle=active?'#80ff90':(hov?'#d0a060':'#5c4328');
  c.fillRect(x,y,w,1);c.fillRect(x,y,1,h);
  c.fillStyle='#06080c';c.fillRect(x,y+h-1,w,1);c.fillRect(x+w-1,y,1,h);
  drawTextC(c,label,x+w/2,y+5,1,active?'#e8ffe8':'#e8d8b8');
}

function drawProfileOverlayFrame(c,title){
  c.save();
  c.globalAlpha=0.90;c.fillStyle='#0b0806';c.fillRect(34,34,CW-68,218);c.globalAlpha=1;
  c.strokeStyle='#b58a4a';c.strokeRect(34.5,34.5,CW-69,217);
  c.fillStyle='#21170f';c.fillRect(42,43,CW-84,24);
  drawTextC(c,title,CW/2,51,2,'#f1d982');
  c.restore();
}

function drawProfileOverlay(c,tk){
  drawProfileOverlayFrame(c,'PROFILER');
  const buttons=G.profileOverlayButtons=[];
  const profiles=typeof profileList==='function'?profileList():[];
  const active=typeof activeProfileId==='function'?activeProfileId():null;
  drawText(c,'AKTIV PROFIL: '+(G.activeProfileName?G.activeProfileName():'Spelare 1'),52,75,1,'#ffd880');
  const y0=84;
  for(let i=0;i<profiles.length&&i<8;i++){
    const p=profiles[i], y=y0+i*17, isActive=p.id===active;
    c.fillStyle=isActive?'rgba(80,220,120,0.14)':'rgba(255,255,255,0.04)';
    c.fillRect(52,y-2,376,16);
    drawText(c,(isActive?'> ':'  ')+p.name,62,y+3,1,isActive?'#b8ffb8':'#ffffff');
    drawProfileOverlayButton(c,buttons,'select',isActive?'VALD':'VÄLJ',238,y,46,14,p.id,isActive);
    drawProfileOverlayButton(c,buttons,'rename','NAMN',292,y,48,14,p.id,false);
    drawProfileOverlayButton(c,buttons,'delete','RADERA',348,y,64,14,p.id,false);
  }
  if(profiles.length>=8)drawTextC(c,'MAX 8 PROFILER',CW/2,215,1,'#8090a0');
  drawProfileOverlayButton(c,buttons,'new','NY PROFIL',52,226,86,17,null,false);
  drawProfileOverlayButton(c,buttons,'leaderboard','TOPPLISTA',148,226,86,17,null,false);
  drawProfileOverlayButton(c,buttons,'close','STÄNG',346,226,72,17,null,false);
}

function drawLeaderboardOverlay(c,tk){
  drawProfileOverlayFrame(c,'LOKAL TOPPLISTA');
  const buttons=G.leaderboardButtons=[];
  const rows=G.profileLeaderboardRows?G.profileLeaderboardRows():[];
  drawText(c,'PROFIL',54,77,1,'#a89878');
  drawTextC(c,'KLARA',198,77,1,'#a89878');
  drawTextC(c,'BÄST',244,77,1,'#a89878');
  drawTextC(c,'VINSTER',288,77,1,'#a89878');
  drawTextC(c,'FÖRSÖK',334,77,1,'#a89878');
  drawTextC(c,'MYNT',386,77,1,'#a89878');
  for(let i=0;i<rows.length&&i<8;i++){
    const r=rows[i], y=94+i*15;
    c.fillStyle=i%2?'rgba(255,255,255,0.035)':'rgba(190,140,80,0.055)';
    c.fillRect(48,y-3,384,15);
    const mark=(r.holy?(r.stone?' HS':' H'):'');
    drawText(c,String(i+1)+'. '+r.name+mark,54,y,1,i===0?'#ffe890':'#ffffff');
    drawTextC(c,String(r.cleared),198,y,1,'#b8ffb8');
    drawTextC(c,String(Math.round(r.sumPct))+'%',244,y,1,'#e8d8b8');
    drawTextC(c,String(r.wins),288,y,1,'#e8d8b8');
    drawTextC(c,String(r.attempts),334,y,1,'#e8d8b8');
    drawTextC(c,String(r.money),386,y,1,'#ffd880');
  }
  drawText(c,'H=HELIG  S=STEN',54,214,1,'#708090');
  drawProfileOverlayButton(c,buttons,'profiles','PROFILER',52,226,84,17,null,false);
  drawProfileOverlayButton(c,buttons,'close','STÄNG',346,226,72,17,null,false);
}

function drawMenu(c,tk){
  c.fillStyle='#090806';c.fillRect(0,0,CW,CH);
  drawTextC(c,'VÄLJ BANA',CW/2,9,3,'#f1d982');
  G.menuRows=[];G.menuTabs=[];
  const chapters=menuChapters();
  G.menuChapter=clamp(G.menuChapter|0,0,chapters.length-1);
  const tabGap=8, tabMargin=28;
  const tabW=Math.floor((CW-tabMargin*2-tabGap*Math.max(0,chapters.length-1))/Math.max(1,chapters.length));
  const tabStart=Math.round((CW-(tabW*chapters.length+tabGap*Math.max(0,chapters.length-1)))/2);
  for(let i=0;i<chapters.length;i++){
    const r={x:tabStart+i*(tabW+tabGap),y:40,w:tabW,h:19,idx:i}, active=i===G.menuChapter;
    const hov=G.mx>=r.x&&G.mx<r.x+r.w&&G.my>=r.y&&G.my<r.y+r.h;
    const locked=G.chapterUnlocked?!G.chapterUnlocked(i):false;
    c.fillStyle=locked?(active?'#1c1a18':(hov?'#201914':'#11100d')):(active?'#3a2818':(hov?'#2a2117':'#17120d'));
    c.fillRect(r.x,r.y,r.w,r.h);
    c.fillStyle=locked?(active?'#7a6040':'#383038'):(active?'#d0a060':(hov?'#8f6a3e':'#4a3825'));
    c.fillRect(r.x,r.y,r.w,1);c.fillRect(r.x,r.y,1,r.h);
    c.fillStyle='#070a12';c.fillRect(r.x,r.y+r.h-1,r.w,1);c.fillRect(r.x+r.w-1,r.y,1,r.h);
    const tabLabel=locked&&chapters[i].gate!=='sky'?'LÅST VÄRLD':chapters[i].name;
    drawTextC(c,tabLabel,r.x+r.w/2,r.y+6,1,locked?'#806850':(active?'#fff0b8':'#c8b090'));
    r.locked=locked;
    G.menuTabs.push(r);
  }
  const ch=chapters[G.menuChapter], count=Math.max(0,ch.to-ch.from);
  const chProg=G.chapterProgress?G.chapterProgress(ch):null;
  const campaign=!!(G.campaignModeEnabled&&G.campaignModeEnabled());
  const chLocked=campaign&&G.chapterUnlocked?!G.chapterUnlocked(ch):false;
  const chLockReason=chLocked&&G.levelLockedReason?G.levelLockedReason(ch.from):'';
  const chInfo=campaign
    ?(chLocked?(chLockReason?'  LÅST: '+chLockReason:'  LÅST'):(chProg?'  ÖPPNA '+chProg.unlocked+'/'+chProg.total:''))
    :'';
  drawTextC(c,'BANOR '+String(ch.from+1).padStart(2,'0')+'-'+String(ch.to).padStart(2,'0')+chInfo,CW/2,64,1,'#8a7658');
  for(let row=0;row<count;row++){
    const i=ch.from+row, x=46, w=CW-92, y=78+row*18;
    const L=LEVELS[i], unlocked=G.levelUnlocked?G.levelUnlocked(i):true;
    const hov=G.mx>=x&&G.mx<x+w&&G.my>=y-4&&G.my<y+16;
    const active=unlocked&&i===G.levelIdx;
    if(!unlocked){
      c.fillStyle=hov?'rgba(105,90,72,0.26)':'rgba(40,36,34,0.72)';
      c.fillRect(x,y-4,w,18);
      c.fillStyle='#0a0b0d';c.fillRect(x,y-4,w,1);c.fillRect(x,y+13,w,1);
      c.globalAlpha=0.28;
      c.fillStyle='#6d5a46';
      for(let sx=x+6; sx<x+w-8; sx+=18)c.fillRect(sx,y+4,10,1);
      c.globalAlpha=1;
      drawText(c,'??',x+14,y,2,hov?'#c8a070':'#806850');
      drawText(c,G.visibleLevelName?G.visibleLevelName(i):'DOLD BANA',x+58,y,2,hov?'#c8b090':'#706860');
      drawText(c,G.levelLockedReason?G.levelLockedReason(i):'LÅST',x+w-146,y+1,1,hov?'#e0b070':'#8a7058');
      drawText(c,'LÅST',x+w-42,y+1,1,hov?'#e0b070':'#806850');
    }else{
      if(active){c.fillStyle='rgba(120,190,110,0.11)';c.fillRect(x,y-4,w,18)}
      if(hov){c.fillStyle='rgba(255,210,110,0.13)';c.fillRect(x,y-4,w,18)}
      drawText(c,String(i+1).padStart(2,'0'),x+8,y,2,hov?'#fff0b8':(active?'#9dff9d':'#a89878'));
      drawText(c,L.name,x+58,y,2,hov?'#fff0c8':'#d0c4a8');
      const comp=G.levelCompletionStatus?G.levelCompletionStatus(i):null;
      if(comp&&comp.hasExtra){
        const guide=G.levelRuneGuidance?G.levelRuneGuidance(i):null;
        const label=guide&&guide.menuLabel?guide.menuLabel:(comp.full?'FULL':(comp.cleared?'RUNOR KVAR':'RUNOR'));
        drawText(c,label,x+w-164,y+1,1,comp.full?'#ffe880':'#caa0ff');
      }
      if(L.theme==='sky')drawText(c,'HIMMEL',x+w-84,y+1,1,'#d8f6ff');
      else if(L.cave)drawText(c,'GROTTA',x+w-84,y+1,1,'#a8b8c8');
      else if(L.theme==='desert')drawText(c,'ÖKEN',x+w-64,y+1,1,'#ffd070');
      else if(L.theme==='city')drawText(c,'STAD',x+w-64,y+1,1,'#a8d8ff');
      else if(L.night)drawText(c,'NATT',x+w-64,y+1,1,'#a0a0d0');
      if(G.cleared[i])drawText(c,'✓',x+w-18,y+1,1,'#40ff40');
    }
    G.menuRows.push({x,y:y-4,w,h:18,idx:i,locked:!unlocked});
  }
  const setY=258, volY=274;
  G.menuSettings={
    profile:{x:10,y:8,w:126,h:18},
    progression:{x:176,y:27,w:128,h:10},
    leaderboard:{x:344,y:8,w:126,h:18},
    mode:{x:18,y:setY-4,w:120,h:14},
    load:{x:146,y:setY-4,w:62,h:14},
    fs:{x:216,y:setY-4,w:100,h:14},
    cutscenes:{x:324,y:setY-4,w:136,h:14},
    music:{x:18,y:volY-4,w:44,h:14},
    musicVol:{x:66,y:volY-4,w:154,h:14},
    sfx:{x:238,y:volY-4,w:34,h:14},
    sfxVol:{x:276,y:volY-4,w:174,h:14}
  };
  drawMenuActionButton(c,G.menuSettings.profile,'PROFIL: '+(G.activeProfileName?G.activeProfileName():'Spelare 1'),true);
  drawMenuActionButton(c,G.menuSettings.progression,'BANVAL: '+(G.levelSelectModeName?G.levelSelectModeName():'KAMPANJ'),true);
  drawMenuActionButton(c,G.menuSettings.leaderboard,'TOPPLISTA',true);
  for(const k in G.menuSettings){const r=G.menuSettings[k];
    if(G.mx>=r.x&&G.mx<r.x+r.w&&G.my>=r.y&&G.my<r.y+r.h){c.fillStyle='rgba(255,220,64,0.12)';c.fillRect(r.x,r.y,r.w,r.h)}
  }
  drawText(c,'LÄGE: '+G.modeName(),22,setY,1,'#ffd040');
  drawText(c,'LADDA',152,setY,1,'#d8c8a8');
  drawText(c,'FULLSKÄRM',222,setY,1,'#d8c8a8');
  drawText(c,'FILMER: '+(G.cutscenesOn===false?'AV':'PÅ'),330,setY,1,G.cutscenesOn===false?'#808080':'#d8a8ff');
  drawText(c,'MUSIK',22,volY,1,AU.musicOn?'#a0ffa0':'#808080');
  drawMenuVolumeBar(c,G.menuSettings.musicVol,AU.musicVol,AU.musicOn);
  drawText(c,'SFX',242,volY,1,AU.sfxOn?'#a0ffa0':'#808080');
  drawMenuVolumeBar(c,G.menuSettings.sfxVol,AU.sfxVol,AU.sfxOn);
  drawTextC(c,'K: LÄGE   V: BANVAL   M/S: AV/PÅ   L: LADDA   H: HJÄLP',CW/2,290,1,'#607060');
  if(G.profileOverlay==='profiles')drawProfileOverlay(c,tk);
  else if(G.profileOverlay==='leaderboard')drawLeaderboardOverlay(c,tk);
}

function drawBrief(c,tk){
  const L=LEVELS[G.levelIdx];
  c.fillStyle=L.night?'#07070d':'#0a0906';c.fillRect(0,0,CW,CH);
  G.briefShopButtons=[];
  drawTextC(c,'BANA '+(G.levelIdx+1),CW/2,40,2,'#a89878');
  drawTextC(c,L.name,CW/2,62,3,'#f1d982');
  for(let i=0;i<Math.min(2,(L.story||[]).length);i++)drawTextC(c,L.story[i],CW/2,88+i*10,1,'#bfd9c4');
  drawTextC(c,'ANTAL LEMLAR: '+L.lem,CW/2,110,1,'#fff');
  drawTextC(c,'RÄDDA: '+Math.floor(L.save/L.lem*100)+'% ('+L.save+' ST)',CW/2,124,1,'#fff');
  drawTextC(c,'TID: '+Math.floor(L.time/60)+':'+String(L.time%60).padStart(2,'0'),CW/2,138,1,'#fff');
  drawTextC(c,'LÄGE: '+G.modeName()+(G.mode==='classic'?' - FÄRRE SLUMPHÄNDELSER':' - MER KAOS OCH BONUSAR'),CW/2,152,1,G.mode==='classic'?'#a0d0ff':'#ffd040');
  drawTextC(c,'MUSIK '+(AU.musicOn?'PÅ':'AV')+'  SFX '+(AU.sfxOn?'PÅ':'AV')+'  K/M/S ÄNDRAR  H HJÄLP',CW/2,166,1,'#8a9080');
  const weatherHint=L.cave?'GROTTA: SKYDDAD FRÅN REGN OCH SNÖ'
    :'VÄDER: '+(L.night?'REGN ELLER SNÖ':(L.theme==='desert'?'SOL ELLER REGN':'SOL, REGN ELLER SNÖ'));
  drawTextC(c,weatherHint,CW/2,178,1,'#98b0b0');
  drawTextC(c,'TEMPO: '+G.tempoName()+'  +/- ÄNDRAR',CW/2,190,1,'#ffd080');
  let infoY=202;
  const affectsProgress=G.selectedLevelAffectsProgress?G.selectedLevelAffectsProgress():true;
  const runeGuide=G.levelRuneGuidance?G.levelRuneGuidance(G.levelIdx):null;
  if(runeGuide&&Array.isArray(runeGuide.briefingLines)){
    for(const line of runeGuide.briefingLines.slice(0,2)){
      drawTextC(c,line,CW/2,infoY,1,runeGuide.complete?'#ffe880':'#caa0ff');
      infoY+=12;
    }
  }
  if(!affectsProgress){
    drawTextC(c,'FRITT SPEL: ÖVNING - RESULTAT OCH FYND SPARAS INTE',CW/2,infoY,1,'#ffd080');
    infoY+=12;
  }
  const money=affectsProgress?Math.max(0,G.money|0):0;
  const bonus=affectsProgress?((G.pendingSkillBonus&&G.pendingSkillBonus[G.levelIdx])||{}):{};
  const shopActive=money>0||Object.keys(bonus).length>0;
  if(L.night){
    drawTextC(c,'NATTBANA: FÖRSTA LEMMELN BÄR LYKTAN.',CW/2,infoY,1,'#9090ff');
    drawTextC(c,'OM DEN DÖR KAN EN ANNAN PLOCKA UPP DEN.',CW/2,infoY+12,1,'#9090ff');
    infoY+=24;
  }
  if(L.rescues&&L.rescues.length){
    drawTextC(c,'BONUS: TRYCK PÅ KNAPPAR FÖR ATT BEFRIA FÅNGADE LEMLAR.',CW/2,infoY,1,'#ffd040');
    drawTextC(c,'EXTRA LEMLAR KAN GE ÖVER 100% RÄDDAT.',CW/2,infoY+12,1,'#ffd040');
    infoY+=24;
  }
  let promptY=236,promptScale=2;
  if(shopActive){
    c.fillStyle=L.night?'#07070d':'#0a0906';
    c.fillRect(0,198,CW,102);
    let shopTextY=204;
    if(runeGuide&&!runeGuide.complete&&runeGuide.briefingLines&&runeGuide.briefingLines[0]){
      drawTextC(c,runeGuide.briefingLines[0],CW/2,shopTextY,1,'#caa0ff');
      shopTextY+=10;
    }
    drawTextC(c,'PENGAR: '+money+'  EXTRA SKILLS KOSTAR 1 MYNT',CW/2,shopTextY,1,'#ffd866');
    const opts=G.shopOptions?G.shopOptions():[];
    const cols=7,bw=62,bh=17,gapX=4,gapY=5,total=cols*bw+(cols-1)*gapX;
    const x0=Math.round(CW/2-total/2),y0=shopTextY+12;
    for(let i=0;i<opts.length;i++){
      const opt=opts[i],col=i%cols,row=(i/cols)|0;
      const x=x0+col*(bw+gapX),y=y0+row*(bh+gapY);
      const hov=G.mx>=x&&G.mx<x+bw&&G.my>=y&&G.my<y+bh;
      const can=money>=opt.cost;
      c.fillStyle=hov?'#2c4258':(can?'#162838':'#101820');
      c.fillRect(x,y,bw,bh);
      c.fillStyle=can?'#5f8fc8':'#303848';
      c.fillRect(x,y,bw,1);c.fillRect(x,y,1,bh);
      c.fillStyle='#05070d';
      c.fillRect(x,y+bh-1,bw,1);c.fillRect(x+bw-1,y,1,bh);
      drawTextC(c,opt.label+' +'+(bonus[opt.k]||0),x+bw/2,y+5,1,can?'#ffffff':'#707880');
      G.briefShopButtons.push({x,y,w:bw,h:bh,k:opt.k});
    }
    drawTextC(c,L.hint,CW/2,runeGuide&&!runeGuide.complete?274:263,1,'#40c040');
    promptY=290;promptScale=1;
  }else{
    const hintY=Math.max(infoY,L.night?226:228);
    drawTextC(c,L.hint,CW/2,hintY,1,'#40c040');
    promptY=hintY+16;
  }
  if((tk>>4)&1)drawTextC(c,shopActive?'KLICKA UTANFÖR BUTIKEN FÖR ATT STARTA':'KLICKA FÖR ATT SLÄPPA UT DEM',CW/2,promptY,promptScale,'#ffd040');
}

function drawHomecomingWaterfall(c,x,y,w,h,tk){
  c.save();
  c.fillStyle='#5dbcc7';c.fillRect(x,y,w,h);
  c.fillStyle='#a7e8e6';c.fillRect(x+2,y,Math.max(1,w-4),h);
  c.beginPath();c.rect(x,y,w,h);c.clip();
  for(let i=0;i<Math.max(3,w/3);i++){
    const xx=x+1+(i*7)%Math.max(1,w-2);
    const yy=y+((tk*(0.8+i%3*0.2)+i*13)%(h+12))-12;
    c.fillStyle=i%2?'#f3ffff':'#d0f6ec';c.fillRect(xx,Math.round(yy),i%3===0?2:1,8+i%5);
  }
  c.restore();
  c.fillStyle='#f6ffff';
  for(let i=0;i<5;i++){
    const dx=Math.round(Math.sin(tk*0.06+i*2)*w*0.6);
    c.fillRect(x+w/2+dx,y+h+(i%2),3+i%3,1);
  }
}

function drawSkyResultBackground(c,tk){
  c.save();
  const g=c.createLinearGradient(0,0,0,CH);
  g.addColorStop(0,'#77bfdf');
  g.addColorStop(0.58,'#d8f0ed');
  g.addColorStop(1,'#f7fcf5');
  c.fillStyle=g;c.fillRect(0,0,CW,CH);
  const oval=(x,y,rx,ry,col)=>{
    c.fillStyle=col;
    for(let dy=-ry;dy<ry;dy+=2){
      const half=Math.round(rx*Math.sqrt(Math.max(0,1-Math.pow((dy+1)/ry,2))));
      c.fillRect(Math.round(x-half),Math.round(y+dy),half*2,2);
    }
  };
  const cloud=(x,y,w,h,col)=>{
    oval(x,y,w/2,h*0.40,col);
    oval(x-w*0.24,y-h*0.18,w*0.23,h*0.46,col);
    oval(x+w*0.03,y-h*0.34,w*0.25,h*0.58,col);
    oval(x+w*0.30,y-h*0.10,w*0.20,h*0.42,col);
  };
  // Distant gardens and falling water place the home above the cloud sea.
  oval(420,55,14,14,'#fff5cc');
  for(let band=0;band<4;band++){
    c.fillStyle=['#eed8bc','#f4e7bb','#cde8ca','#b5dedc'][band];
    for(let x=55;x<399;x+=2){
      const y=149-Math.sqrt(Math.max(0,180*180-(x-227)*(x-227)))*0.48+band*2;
      c.fillRect(x,Math.round(y),2,2);
    }
  }
  for(let i=0;i<5;i++){
    const drift=Math.round(Math.sin(tk*0.008+i*1.7)*5);
    cloud(8+i*120+drift,98+i%2*18,126,24,'#c0e2ef');
    cloud(8+i*120+drift,94+i%2*18,122,22,'#effbff');
  }
  for(const [x,y,w] of [[30,127,88],[438,120,100]]){
    cloud(x,y,w,24,'#f5fcf8');
    oval(x,y-6,w*0.36,9,'#90bd99');oval(x-4,y-10,w*0.29,7,'#b3d6a6');
    drawHomecomingWaterfall(c,x+4,y-4,5,29,tk*0.7);
  }
  cloud(240,231,477,63,'#adcfd9');
  cloud(236,226,479,53,'#d8eeeb');
  cloud(240,220,465,45,'#f7fdf6');
  c.fillStyle='#5b9581';fillPixelPoly(c,[[26,195],[67,148],[152,127],[260,129],[374,148],[438,194],[412,223],[349,238],[233,244],[105,237],[49,216]]);
  c.fillStyle='#72ad77';fillPixelPoly(c,[[28,189],[72,147],[147,129],[272,128],[372,148],[436,191],[408,216],[342,230],[230,236],[112,230],[54,211]]);
  oval(230,185,170,39,'#92c77f');oval(247,172,135,25,'#aad889');
  oval(126,204,68,19,'#afd98c');oval(325,212,58,16,'#a4cf80');
  c.fillStyle='#dee2b3';fillPixelPoly(c,[[105,157],[122,158],[164,185],[202,197],[277,189],[320,156],[333,159],[284,200],[202,209],[153,194]]);

  const stream=[[215,134],[224,149],[244,166],[274,180],[312,188],[345,195],[371,211],[403,216]];
  const ribbon=(width,color)=>{
    const upper=stream.map(([x,y])=>[x,y-width]);
    const lower=stream.map(([x,y])=>[x,y+width]).reverse();
    c.fillStyle=color;fillPixelPoly(c,upper.concat(lower));
  };
  ribbon(9,'#527f70');ribbon(7,'#d6e2b1');ribbon(5,'#409eac');ribbon(3,'#79d8d0');
  for(let i=0;i<23;i++){
    const u=(i/23+tk*0.0018)%1,pos=u*(stream.length-1),n=Math.floor(pos),f=pos-n;
    const a=stream[n],b=stream[n+1];
    c.fillStyle=i%3?'#b4efe2':'#f0fff3';
    c.fillRect(Math.round(a[0]+(b[0]-a[0])*f),Math.round(a[1]+(b[1]-a[1])*f)+(i%3)-1,4+i%4,1);
  }
  drawHomecomingWaterfall(c,211,119,11,22,tk);
  drawHomecomingWaterfall(c,396,215,14,31,tk);
  oval(216,119,13,3,'#d7eee4');oval(214,117,10,3,'#7caaa0');

  const tree=(x,y,size,blossom)=>{
    const px=v=>Math.round(x+v*size),py=v=>Math.round(y+v*size);
    oval(x,y+1,21*size,4*size,'#64976e');
    c.fillStyle='#79684f';fillPixelPoly(c,[[-5,0],[-2,-42],[3,-42],[4,-8],[9,0]].map(([a,b])=>[px(a),py(b)]));
    pixelLine(c,px(-1),py(-22),px(-15),py(-35),'#79684f');pixelLine(c,px(2),py(-28),px(16),py(-44),'#79684f');
    const colors=blossom?['#779c70','#d69caa','#efd0cc','#fff0dc']:['#397c67','#509866','#75b471','#a6ce83'];
    for(const [cx,cy,rx,ry] of [[-16,-40,18,14],[15,-45,21,16],[0,-58,23,18]]){
      oval(px(cx),py(cy),rx*size,ry*size,colors[0]);oval(px(cx-2),py(cy-3),(rx-1)*size,(ry-2)*size,colors[1]);
      oval(px(cx-5),py(cy-7),rx*size*0.65,ry*size*0.53,colors[2]);
      c.fillStyle=colors[3];c.fillRect(px(cx-9),py(cy-11),Math.max(2,Math.round(5*size)),1);c.fillRect(px(cx+5),py(cy-7),2,1);
    }
  };
  tree(53,170,1,false);tree(397,170,0.95,false);
  tree(143,151,0.64,true);tree(297,145,0.62,false);

  const cottage=(x,y,w,roof)=>{
    c.fillStyle='#96b1b3';c.fillRect(x+4,y-32,w,34);
    c.fillStyle='#f6f5df';c.fillRect(x,y-34,w,34);
    c.fillStyle='#dce4d1';c.fillRect(x+w-10,y-34,10,34);
    c.fillStyle=roof;
    fillPixelPoly(c,[[x-6,y-32],[x-6,y-38],[x+2,y-38],[x+2,y-46],[x+12,y-46],[x+12,y-52],[x+w-12,y-52],[x+w-12,y-46],[x+w-2,y-46],[x+w-2,y-38],[x+w+6,y-38],[x+w+6,y-32]]);
    c.fillStyle='rgba(255,246,213,0.25)';
    c.fillRect(x+14,y-48,w-28,1);c.fillRect(x+4,y-41,w-8,1);c.fillRect(x-3,y-35,w+6,1);
    c.fillStyle='#fff8d6';c.fillRect(x-6,y-33,w+12,2);
    c.fillStyle='#677e77';c.fillRect(x+w/2-5,y-21,10,21);
    c.fillStyle='#fff0a9';c.fillRect(x+w/2-3,y-19,6,19);
    for(const wx of [x+7,x+w-15]){
      c.fillStyle='#748e89';c.fillRect(wx,y-24,8,11);
      c.fillStyle='#ffe9a0';c.fillRect(wx+1,y-23,6,9);
      c.fillStyle='#f6f5df';c.fillRect(wx+3,y-23,1,9);c.fillRect(wx+1,y-19,6,1);
      c.fillStyle='#5c8d62';c.fillRect(wx-2,y-12,12,3);
      c.fillStyle='#e58c99';c.fillRect(wx,y-15,3,3);c.fillRect(wx+5,y-14,3,2);
    }
    c.fillStyle='#c6d4ca';c.fillRect(x+w/2-8,y,16,3);
  };
  cottage(78,160,44,'#6b9a99');
  cottage(163,140,40,'#c58b80');
  cottage(319,158,48,'#af8471');
  tree(382,201,0.60,true);
  for(let i=0;i<105;i++){
    const x=52+(i*47)%365,y=159+(i*23)%72;
    if(Math.pow((x-234)/188,2)+Math.pow((y-189)/44,2)>1)continue;
    const nearest=stream.reduce((a,b)=>Math.abs(b[0]-x)<Math.abs(a[0]-x)?b:a);
    if(Math.abs(nearest[0]-x)<28&&Math.abs(nearest[1]-y)<12)continue;
    const sway=Math.round(Math.sin(tk*0.025+i)*0.7);
    c.fillStyle='#4e9664';c.fillRect(x,y-4,1,5);c.fillRect(x-2,y-1,2,1);
    c.fillStyle=['#de8fa9','#fff4c5','#ffffff','#97badf'][i%4];
    c.fillRect(x-1+sway,y-6,3,3);
    c.fillStyle='#e2b959';c.fillRect(x+sway,y-5,1,1);
  }

  // An arched footbridge keeps the path visibly separate from the stream.
  for(let x=226;x<270;x+=2){
    const arch=Math.round(Math.sin((x-226)/44*Math.PI)*7);
    c.fillStyle='#8c7856';c.fillRect(x,177-arch,2,5);
    c.fillStyle='#f1e1b2';c.fillRect(x,175-arch,2,2);
    if(x%8===2){c.fillStyle='#8c7856';c.fillRect(x,166-arch,2,10)}
    c.fillStyle='#eed6a6';c.fillRect(x,165-arch,2,2);
  }

  const neighbor=(x,y,pose,seed,scale=2)=>{
    oval(x,y+1,5*scale,scale,'#72a777');
    const dance=pose==='dance',front=pose==='wave'||dance||pose==='front';
    const hop=dance?Math.round(Math.max(0,Math.sin(tk*0.10+seed))*3):0;
    c.save();c.translate(Math.round(x),Math.round(y-hop));c.scale(scale,scale);
    drawWaterfallCaveLemming(c,{facing:front?'front':pose,walking:pose==='left'||pose==='right',walkAnim:Math.floor(tk*0.45+seed)},0,0,1);
    if(front){
      c.fillStyle=COL.skin;c.fillRect(-2,-9,5,4);
      c.fillStyle=COL.hair;c.fillRect(-2,-11,5,2);c.fillRect(-3,-10,1,3);
      c.fillStyle='#244454';c.fillRect(-1,-8,1,1);c.fillRect(2,-8,1,1);
      c.fillStyle='#ac705e';c.fillRect(-1,-7,1,1);c.fillRect(2,-7,1,1);c.fillRect(0,-6,2,1);
      if(pose==='wave'||dance){
        const lift=Math.sin(tk*0.09+seed)>0?1:0;
        c.fillStyle=COL.skin;c.fillRect(2,-6,2,1);c.fillRect(3,-9-lift,1,4+lift);
        if(dance){c.fillRect(-4,-6,2,1);c.fillRect(-4,-8+lift,1,2)}
      }
    }
    c.restore();
  };
  for(const p of [[143,166,'front'],[182,144,'wave'],[303,161,'front'],[345,166,'wave']])neighbor(p[0],p[1],p[2],0,1);
  const stroll=(tk*0.33)%88;
  neighbor(139+(stroll<44?stroll:88-stroll),188,stroll<44?'right':'left',3,2);
  const flock=[
    [76,181,'wave'],[112,185,'front'],[206,181,'wave'],[250,164,'front'],
    [286,216,'front'],[315,216,'front'],[360,193,'wave'],[367,223,'front'],
    [102,218,'front'],[116,218,'wave'],[161,215,'front'],
    [195,217,'dance'],[217,217,'dance'],[257,227,'wave'],[289,172,'front'],[339,211,'wave']
  ];
  for(let i=0;i<flock.length;i++)neighbor(...flock[i],i);
  c.fillStyle=COL.skin;c.fillRect(106,205,6,2);
  c.fillStyle='#718f64';c.fillRect(274,231,52,2);
  c.fillStyle='#927453';c.fillRect(279,222,3,9);c.fillRect(318,222,3,9);
  c.fillStyle='#c7a575';c.fillRect(272,217,56,5);
  c.fillStyle='#f6ebcd';c.fillRect(280,216,34,2);
  c.fillStyle='#fdf9e5';
  for(const x of [281,294,314]){c.fillRect(x,212,4,4);c.fillRect(x+4,213,2,2)}
  c.fillStyle='#d89468';c.fillRect(302,213,7,3);
  for(let i=0;i<3;i++){
    const x=282+i*16+Math.round(Math.sin(tk*0.035+i));
    c.fillStyle='#eef8dc';c.fillRect(x,208-((tk/14+i*2)|0)%4,1,3);
  }
  // A quiet seat at the garden edge, with the whole flock safely on land.
  c.fillStyle='#b29a72';c.fillRect(68,206,28,3);c.fillRect(71,201,2,13);c.fillRect(90,201,2,13);
  neighbor(80,206,'front',2,2);
  c.fillStyle=COL.leg;c.fillRect(76,207,3,3);c.fillRect(82,207,3,3);
  cloud(-4,236,126,26,'#f7fcf5');cloud(474,238,116,24,'#f7fcf5');
  c.fillStyle='#f7fcf5';c.fillRect(0,249,CW,CH-249);
  c.restore();
}

function drawSkyHomecoming(c,tk,preview){
  drawSkyResultBackground(c,tk);
  drawTextC(c,'ÄNTLIGEN HEMMA',CW/2,24,3,'#ffffff');
  drawTextC(c,'ÄNTLIGEN HEMMA',CW/2,23,3,'#245773');
  drawTextC(c,'FLOCKEN HAR HITTAT HEM TILL LÄMMELHIMLEN',CW/2,49,1,'#315d70');
  drawTextC(c,'NU ÄR ALLA HEMMA. INGEN BEHÖVER GÅ ENSAM.',CW/2,252,1,'#385c4c');
  drawTextC(c,'TACK FÖR ATT DU HJÄLPTE DEM HEM.',CW/2,263,1,'#385c4c');
  if(preview){
    drawTextC(c,'ENTER/KLICK: TILLBAKA   ESC: STÄNG',CW/2,288,1,'#315d70');
    return;
  }
  const L=G.level;
  drawTextC(c,'DU RÄDDADE '+Math.floor(G.saved/L.lem*100)+'% ('+G.saved+' ST)',130,276,1,'#4d6973');
  drawTextC(c,'KRAVET VAR '+Math.floor(L.save/L.lem*100)+'% ('+L.save+' ST)',350,276,1,'#4d6973');
  drawTextC(c,'ENTER/KLICK: BANMENY   R: SPELA IGEN   ESC/B: BANMENY',CW/2,288,1,'#315d70');
}

function drawResult(c,tk){
  const L=G.level,win=!G.levelForceFail&&G.saved>=L.save;
  const practice=G.practiceRunActive&&G.practiceRunActive();
  const hasNext=G.levelIdx<LEVELS.length-1;
  const nextLocked=!!(win&&hasNext&&G.levelUnlocked&&!G.levelUnlocked(G.levelIdx+1));
  const finalSkyWin=G.hasFinalSkyVictory();
  if(finalSkyWin){drawSkyHomecoming(c,tk);return}
  const comp=!practice&&G.levelCompletionStatus?G.levelCompletionStatus(G.levelIdx):null;
  const runeGuide=G.levelRuneGuidance?G.levelRuneGuidance(G.levelIdx):null;
  c.fillStyle='#000008';c.fillRect(0,0,CW,CH);
  drawTextC(c,win?'BRA JOBBAT!':'OJDÅ...',CW/2,50,3,win?'#40ff40':'#ff5050');
  const pct=Math.floor(G.saved/L.lem*100),need=Math.floor(L.save/L.lem*100);
  drawTextC(c,'DU RÄDDADE '+pct+'% ('+G.saved+' ST)',CW/2,100,2,'#fff');
  drawTextC(c,'KRAVET VAR '+need+'% ('+L.save+' ST)',CW/2,122,2,'#a0a0b0');
  if(G.saved>L.lem)drawTextC(c,'BONUS: +'+(G.saved-L.lem)+' FÅNGADE LEMLAR',CW/2,146,1,'#ffd040');
  if(practice)drawTextC(c,'ÖVNING - PROGRESSION SPARADES INTE',CW/2,G.saved>L.lem?158:146,1,'#ffd080');
  let nextY=170;
  if(win&&comp&&comp.hasExtra){
    const lines=runeGuide&&Array.isArray(runeGuide.resultLines)?runeGuide.resultLines:[comp.full?'BANA FULLBORDAD - ALLA RUNOR FUNNA':'BANA KLARAD - RUNOR SAKNAS'];
    const y0=G.saved>L.lem?158:146;
    for(let i=0;i<lines.length&&i<2;i++)drawTextC(c,lines[i],CW/2,y0+i*12,1,comp.full?'#ffe880':'#caa0ff');
    nextY=lines.length>1?182:170;
  }
  if(nextLocked){
    const chapter=menuChapters()[menuChapterForLevel(G.levelIdx+1)];
    const label=chapter&&chapter.gate==='sky'?'HIMLEN ÄR LÅST':'NÄSTA BANA ÄR LÅST';
    drawTextC(c,label+' - '+G.levelLockedReason(G.levelIdx+1),CW/2,nextY,1,'#caa0ff');
    nextY+=14;
  }
  const controlsY=nextY+20,footerY=nextY+42;
  if(!win||nextLocked)
    drawTextC(c,'KLICKA / ENTER: BANMENY',CW/2,nextY,1,'#ffd040');
  else if(hasNext)
    drawTextC(c,practice?'KLICKA / ENTER: NÄSTA ÖVNING':'KLICKA / ENTER: NÄSTA BANA',CW/2,nextY,1,'#ffd040');
  else
    drawTextC(c,practice?'SISTA ÖVNINGEN KLARAD':'DU KLARADE ALLA BANOR - LEMMEL-MÄSTARE!',CW/2,nextY,1,'#ffd040');
  drawTextC(c,'R: SPELA IGEN   ESC/B: BANMENY',CW/2,controlsY,1,'#8090a0');
  drawTextC(c,'LÄGE '+G.modeName()+'  VÄDER '+G.weatherShort()+'  SEED '+((G.levelSeed>>>0).toString(36).toUpperCase()),CW/2,footerY,1,'#606880');
}


function drawToastStack(c){
  const list=(G.toasts&&G.toasts.length)?G.toasts:(G.msgT>0?[{text:G.msg,t:G.msgT,maxT:62}]:[]);
  if(!list.length)return;
  c.save();
  for(let i=Math.min(3,list.length)-1;i>=0;i--){
    const t=list[i],life=clamp(t.t/Math.max(1,t.maxT||62),0,1);
    const y=8+i*11;
    c.globalAlpha=0.20+0.70*life;
    const w=Math.min(CW-28,Math.max(86,textW(t.text,1)+18));
    c.fillStyle='rgba(0,0,0,0.72)';c.fillRect((CW-w)/2,y-2,w,9);
    c.strokeStyle='rgba(255,232,144,0.35)';c.strokeRect((CW-w)/2+0.5,y-2.5,w-1,9);
    c.globalAlpha=clamp(0.30+life,0,1);
    drawTextC(c,t.text,CW/2,y,1,'#ffe890');
  }
  c.globalAlpha=1;c.restore();
}
function drawPauseOverlay(c){
  c.save();
  c.globalAlpha=0.66;c.fillStyle='#0b0806';c.fillRect(54,50,CW-108,90);c.globalAlpha=1;
  c.strokeStyle='#ffd040';c.strokeRect(54.5,50.5,CW-109,89);
  drawTextC(c,'PAUS',CW/2,64,3,'#ffd040');
  drawTextC(c,'MELLANSLAG: FORTSÄTT   R: STARTA OM',CW/2,100,1,'#ffffff');
  drawTextC(c,'H: HJÄLP   ESC/B: BANMENY',CW/2,116,1,'#d8c8a8');
  c.restore();
}
function drawHelpOverlay(c){
  if(!G.showHelp)return;
  c.save();
  c.globalAlpha=0.88;c.fillStyle='#0b0806';c.fillRect(26,28,CW-52,206);c.globalAlpha=1;
  c.strokeStyle='#b58a4a';c.strokeRect(26.5,28.5,CW-53,205);
  drawTextC(c,'HJÄLP / KONTROLLER',CW/2,46,2,'#f1d982');
  const rows=[
    'KLICKA HUD-IKON + LEMMEL FÖR FÄRDIGHET',
    'BYGG UPP OCH BYGG NED HAR EGNA IKONER',
    '1-0 VÄLJER FÄRDIGHET   J JETPACK   E ELDKASTARE   Q REPKROK',
    'REPKROK: VÄLJ LEMMEL, SIKTA',
    'HÖGERKLICKA PÅ EN LEMMEL: DIREKTSTYR EN GÅNG/BANA',
    'DIREKT: PILAR STYR/HOPPAR   SHIFT SPRING   CTRL SIKTE   L LAMPA',
    'VATTENFALL: DIREKTSTYR EN LÄMMEL, TRYCK UPP VID VATTENFALLET',
    'MELLANSLAG PAUS   R STARTA OM   ESC/B MENY',
    'Z/X/C ZOOM   HJUL/PINCH   DRA/SVEP PANORERA',
    'K LÄGE   M MUSIK   S SFX   F FULLSKÄRM',
    'H VISAR / DÖLJER DENNA RUTA'
  ];
  for(let i=0;i<rows.length;i++)drawTextC(c,rows[i],CW/2,68+i*15,1,i===8?'#a0ffa0':'#ffffff');
  c.restore();
}
function drawErrorOverlay(c,err){
  if(!err)return;
  c.save();
  c.globalAlpha=0.92;c.fillStyle='#200000';c.fillRect(20,54,CW-40,112);c.globalAlpha=1;
  c.strokeStyle='#ff6060';c.strokeRect(20.5,54.5,CW-41,111);
  drawTextC(c,'FEL I SPELET',CW/2,66,2,'#ff8080');
  drawTextC(c,String(err.msg||'Okänt fel').slice(0,52),CW/2,94,1,'#ffffff');
  drawTextC(c,'ÖPPNA DEVTOOLS FÖR DETALJER',CW/2,112,1,'#ffd080');
  drawTextC(c,'LADDA OM SIDAN OM SPELET STANNAT',CW/2,128,1,'#ffd080');
  if(err.stack)drawTextC(c,err.stack.replace(/\s+/g,' ').slice(0,52),CW/2,148,1,'#b0b0b0');
  c.restore();
}
