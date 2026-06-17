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
  g.addColorStop(0,'#000018');g.addColorStop(0.58,'#061426');g.addColorStop(1,'#001a00');
  c.fillStyle=g;c.fillRect(0,0,CW,CH);

  c.globalAlpha=0.20+0.04*Math.sin(tk*0.025);
  c.fillStyle='#d8e8ff';c.fillRect(392,28,18,18);
  c.fillStyle='#f8f0c8';c.fillRect(396,31,12,12);c.fillRect(393,35,16,6);
  c.globalAlpha=1;

  for(let i=0;i<70;i++){
    const tw=clamp(0.25+0.45*Math.sin(hash2(i,5)*7+tk*0.035),0.05,0.70);
    c.globalAlpha=tw;
    c.fillStyle=i%9===0?'#d8e8ff':'#aac0ff';
    const s=i%13===0?2:1;
    c.fillRect(Math.floor(hash2(i,1)*CW),Math.floor(hash2(i,2)*145),s,1);
  }
  c.globalAlpha=1;

  drawTitleRidge(c,152,'#06142a',28,2);
  drawTitleRidge(c,178,'#08251f',22,7);
  drawTitleRidge(c,198,'#0b361b',15,11);

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

  c.fillStyle='#2b2f38';c.fillRect(392,185,36,29);
  c.fillStyle='#4a5570';c.fillRect(388,205,44,9);c.fillRect(396,181,28,5);
  c.fillStyle='#121827';c.fillRect(400,193,20,21);
  c.fillStyle='#79a8ff';c.fillRect(402,193,16,1);c.fillRect(402,193,1,14);c.fillRect(417,193,1,14);
  c.globalAlpha=0.20+0.08*Math.sin(tk*0.08);
  c.fillStyle='#80b8ff';c.fillRect(398,190,24,18);
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

function drawTitle(c,tk){
  drawTitleBackdrop(c,tk);
  // logga med studs
  const t='LEMMEL!';
  let x=CW/2-textW(t,6)/2;
  for(let i=0;i<t.length;i++){
    const ch=t[i],b=Math.sin(tk*0.18+i*0.7)*5;
    drawText(c,ch,x+2,61+b,6,'rgba(0,0,0,0.45)');
    drawText(c,ch,x,58+b,6,i%2?'#5fa8ff':'#2f6fff');
    if(((tk+i*5)&31)<12)drawText(c,ch,x,57+b,6,'rgba(190,230,255,0.18)');
    x+=(FONT[ch][0].length+1)*6;
  }
  drawTextC(c,'EN HYLLNING TILL DOS-KLASSIKERN',CW/2,118,1,'#9090a0');
  drawTitleGround(c,tk);
  drawTitleLemmings(c,tk);
  if((tk>>4)&1)drawTextC(c,'KLICKA FÖR ATT BÖRJA',CW/2,160,2,'#ffffff');
  drawTextC(c,'BYGG GRÄV SPRÄNG FLYG - RÄDDA LEMLARNA',CW/2,232,1,'#70a070');
}

function drawMenuVolumeBar(c,r,val,on){
  val=clamp(Number.isFinite(val)?val:1,0,1);
  c.fillStyle='#080c14';c.fillRect(r.x,r.y+4,r.w,r.h-8);
  c.fillStyle='#1d2c40';c.fillRect(r.x+1,r.y+5,r.w-2,r.h-10);
  c.fillStyle=on?'#4fc060':'#505050';c.fillRect(r.x+2,r.y+6,Math.max(1,Math.round((r.w-4)*val)),r.h-12);
  c.fillStyle=on?'#b8ffc0':'#909090';
  const tx=clamp(r.x+2+Math.round((r.w-4)*val),r.x+2,r.x+r.w-5);
  c.fillRect(tx,r.y+3,3,r.h-6);
  drawTextC(c,Math.round(val*100)+'%',r.x+r.w/2,r.y+2,1,on?'#ffffff':'#808080');
}

function drawMenuActionButton(c,r,label,on){
  const hov=G.mx>=r.x&&G.mx<r.x+r.w&&G.my>=r.y&&G.my<r.y+r.h;
  c.fillStyle=hov?'#26384f':(on?'#182a3e':'#111a28');
  c.fillRect(r.x,r.y,r.w,r.h);
  c.fillStyle=hov?'#78cfff':'#3d5878';
  c.fillRect(r.x,r.y,r.w,1);c.fillRect(r.x,r.y,1,r.h);
  c.fillStyle='#06090f';
  c.fillRect(r.x,r.y+r.h-1,r.w,1);c.fillRect(r.x+r.w-1,r.y,1,r.h);
  drawTextC(c,label,r.x+r.w/2,r.y+5,1,hov?'#ffffff':'#a8c8e8');
}

function drawProfileOverlayButton(c,buttons,action,label,x,y,w,h,id,active){
  const r={action,label,x,y,w,h,id};
  buttons.push(r);
  const hov=G.mx>=x&&G.mx<x+w&&G.my>=y&&G.my<y+h;
  c.fillStyle=active?'#244828':(hov?'#2a405a':'#151e2c');
  c.fillRect(x,y,w,h);
  c.fillStyle=active?'#80ff90':(hov?'#80d0ff':'#405068');
  c.fillRect(x,y,w,1);c.fillRect(x,y,1,h);
  c.fillStyle='#06080c';c.fillRect(x,y+h-1,w,1);c.fillRect(x+w-1,y,1,h);
  drawTextC(c,label,x+w/2,y+5,1,active?'#e8ffe8':'#d8e8ff');
}

function drawProfileOverlayFrame(c,title){
  c.save();
  c.globalAlpha=0.90;c.fillStyle='#050912';c.fillRect(34,34,CW-68,218);c.globalAlpha=1;
  c.strokeStyle='#7fbfff';c.strokeRect(34.5,34.5,CW-69,217);
  c.fillStyle='#101928';c.fillRect(42,43,CW-84,24);
  drawTextC(c,title,CW/2,51,2,'#d8ecff');
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
  drawText(c,'PROFIL',54,77,1,'#8090b0');
  drawText(c,'AVK',188,77,1,'#8090b0');
  drawText(c,'BEST',226,77,1,'#8090b0');
  drawText(c,'VIN',276,77,1,'#8090b0');
  drawText(c,'FÖRS',318,77,1,'#8090b0');
  drawText(c,'MYNT',366,77,1,'#8090b0');
  for(let i=0;i<rows.length&&i<7;i++){
    const r=rows[i], y=94+i*17;
    c.fillStyle=i%2?'rgba(255,255,255,0.035)':'rgba(100,160,255,0.055)';
    c.fillRect(48,y-3,384,15);
    const mark=(r.holy?(r.stone?' HS':' H'):'');
    drawText(c,String(i+1)+'. '+r.name+mark,54,y,1,i===0?'#ffe890':'#ffffff');
    drawTextC(c,String(r.cleared),198,y,1,'#b8ffb8');
    drawTextC(c,String(Math.round(r.sumPct))+'%',244,y,1,'#d8e8ff');
    drawTextC(c,String(r.wins),288,y,1,'#d8e8ff');
    drawTextC(c,String(r.attempts),334,y,1,'#d8e8ff');
    drawTextC(c,String(r.money),386,y,1,'#ffd880');
  }
  drawText(c,'H=HELIG  S=STEN',54,214,1,'#708090');
  drawProfileOverlayButton(c,buttons,'profiles','PROFILER',52,226,84,17,null,false);
  drawProfileOverlayButton(c,buttons,'close','STÄNG',346,226,72,17,null,false);
}

function drawMenu(c,tk){
  c.fillStyle='#000010';c.fillRect(0,0,CW,CH);
  drawTextC(c,'VÄLJ BANA',CW/2,14,3,'#5fa8ff');
  G.menuRows=[];G.menuTabs=[];
  const chapters=menuChapters();
  G.menuChapter=clamp(G.menuChapter|0,0,chapters.length-1);
  for(let i=0;i<chapters.length;i++){
    const r={x:42+i*132,y:34,w:118,h:19,idx:i}, active=i===G.menuChapter;
    const hov=G.mx>=r.x&&G.mx<r.x+r.w&&G.my>=r.y&&G.my<r.y+r.h;
    c.fillStyle=active?'#203858':(hov?'#182438':'#101828');
    c.fillRect(r.x,r.y,r.w,r.h);
    c.fillStyle=active?'#70a8ff':(hov?'#506890':'#283848');
    c.fillRect(r.x,r.y,r.w,1);c.fillRect(r.x,r.y,1,r.h);
    c.fillStyle='#070a12';c.fillRect(r.x,r.y+r.h-1,r.w,1);c.fillRect(r.x+r.w-1,r.y,1,r.h);
    drawTextC(c,chapters[i].name,r.x+r.w/2,r.y+6,1,active?'#ffffff':'#90a0c0');
    G.menuTabs.push(r);
  }
  const ch=chapters[G.menuChapter], count=Math.max(0,ch.to-ch.from);
  drawTextC(c,'BANOR '+String(ch.from+1).padStart(2,'0')+'-'+String(ch.to).padStart(2,'0'),CW/2,59,1,'#607090');
  for(let row=0;row<count;row++){
    const i=ch.from+row, x=46, w=CW-92, y=74+row*18;
    const L=LEVELS[i], hov=G.mx>=x&&G.mx<x+w&&G.my>=y-4&&G.my<y+16;
    const active=i===G.levelIdx;
    if(active){c.fillStyle='rgba(80,180,120,0.11)';c.fillRect(x,y-4,w,18)}
    if(hov){c.fillStyle='rgba(80,140,255,0.15)';c.fillRect(x,y-4,w,18)}
    drawText(c,String(i+1).padStart(2,'0'),x+8,y,2,hov?'#fff':(active?'#80ffb0':'#8090b0'));
    drawText(c,L.name,x+58,y,2,hov?'#ffffff':'#c0c8e0');
    const comp=G.levelCompletionStatus?G.levelCompletionStatus(i):null;
    if(comp&&comp.hasExtra){
      const label=comp.full?'FULL':(comp.cleared?'RUNOR KVAR':'RUNOR');
      drawText(c,label,x+w-164,y+1,1,comp.full?'#ffe880':'#caa0ff');
    }
    if(L.cave)drawText(c,'GROTTA',x+w-84,y+1,1,'#a8b8c8');
    else if(L.theme==='desert')drawText(c,'ÖKEN',x+w-64,y+1,1,'#ffd070');
    else if(L.theme==='city')drawText(c,'STAD',x+w-64,y+1,1,'#a8d8ff');
    else if(L.night)drawText(c,'NATT',x+w-64,y+1,1,'#8080ff');
    if(G.cleared[i])drawText(c,'✓',x+w-18,y+1,1,'#40ff40');
    G.menuRows.push({x,y:y-4,w,h:18,idx:i});
  }
  const setY=258, volY=274;
  G.menuSettings={
    profile:{x:10,y:8,w:126,h:18},
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
  drawMenuActionButton(c,G.menuSettings.leaderboard,'TOPPLISTA',true);
  for(const k in G.menuSettings){const r=G.menuSettings[k];
    if(G.mx>=r.x&&G.mx<r.x+r.w&&G.my>=r.y&&G.my<r.y+r.h){c.fillStyle='rgba(255,220,64,0.12)';c.fillRect(r.x,r.y,r.w,r.h)}
  }
  drawText(c,'LÄGE: '+G.modeName(),22,setY,1,'#ffd040');
  drawText(c,'LADDA',152,setY,1,'#a0d0ff');
  drawText(c,'FULLSKÄRM',222,setY,1,'#a0d0ff');
  drawText(c,'FILMER: '+(G.cutscenesOn===false?'AV':'PÅ'),330,setY,1,G.cutscenesOn===false?'#808080':'#d8a8ff');
  drawText(c,'MUSIK',22,volY,1,AU.musicOn?'#a0ffa0':'#808080');
  drawMenuVolumeBar(c,G.menuSettings.musicVol,AU.musicVol,AU.musicOn);
  drawText(c,'SFX',242,volY,1,AU.sfxOn?'#a0ffa0':'#808080');
  drawMenuVolumeBar(c,G.menuSettings.sfxVol,AU.sfxVol,AU.sfxOn);
  drawTextC(c,'K: LÄGE   M/S: AV/PÅ   KLICKA REGLAGE FÖR VOLYM   L: LADDA   H: HJÄLP',CW/2,290,1,'#607060');
  if(G.profileOverlay==='profiles')drawProfileOverlay(c,tk);
  else if(G.profileOverlay==='leaderboard')drawLeaderboardOverlay(c,tk);
}

function drawBrief(c,tk){
  const L=LEVELS[G.levelIdx];
  c.fillStyle=L.night?'#000010':'#080800';c.fillRect(0,0,CW,CH);
  G.briefShopButtons=[];
  drawTextC(c,'BANA '+(G.levelIdx+1),CW/2,40,2,'#8090b0');
  drawTextC(c,L.name,CW/2,62,3,'#5fa8ff');
  drawTextC(c,'ANTAL LEMLAR: '+L.lem,CW/2,110,1,'#fff');
  drawTextC(c,'RÄDDA: '+Math.ceil(L.save/L.lem*100)+'% ('+L.save+' ST)',CW/2,124,1,'#fff');
  drawTextC(c,'TID: '+Math.floor(L.time/60)+' MINUTER',CW/2,138,1,'#fff');
  drawTextC(c,'LÄGE: '+G.modeName()+(G.mode==='classic'?' - FÄRRE SLUMPHÄNDELSER':' - MER KAOS OCH BONUSAR'),CW/2,152,1,G.mode==='classic'?'#a0d0ff':'#ffd040');
  drawTextC(c,'MUSIK '+(AU.musicOn?'PÅ':'AV')+'  SFX '+(AU.sfxOn?'PÅ':'AV')+'  K/M/S ÄNDRAR  H HJÄLP',CW/2,166,1,'#8090a0');
  drawTextC(c,'VÄDER SLUMPAS VARJE FÖRSÖK: SOL, REGN/SKURAR/ÅSKA ELLER SNÖ',CW/2,178,1,'#80b8ff');
  drawTextC(c,'TEMPO: '+G.tempoName()+'  +/- ÄNDRAR',CW/2,190,1,'#ffd080');
  let infoY=202;
  const runeStatus=G.levelRuneStatus?G.levelRuneStatus(G.levelIdx):null;
  if(runeStatus&&runeStatus.hasRequirements){
    drawTextC(c,runeStatus.completeAll?'RUNORNA I VATTENFALLSGROTTAN ÄR FUNNA':'HEMLIGHET: RUNOR FINNS BAKOM VATTNET',CW/2,infoY,1,runeStatus.completeAll?'#ffe880':'#caa0ff');
    infoY+=12;
  }
  const money=Math.max(0,G.money|0);
  const bonus=(G.pendingSkillBonus&&G.pendingSkillBonus[G.levelIdx])||{};
  const shopActive=money>0||Object.keys(bonus).length>0;
  if(L.night){
    drawTextC(c,'NATTBANA: FÖRSTA LEMMELN BÄR LYKTAN.',CW/2,infoY,1,'#9090ff');
    drawTextC(c,'OM DEN DÖR KAN EN ANNAN PLOCKA UPP DEN.',CW/2,infoY+12,1,'#9090ff');
    infoY+=24;
  }
  if(L.rescues&&L.rescues.length){
    drawTextC(c,'BONUS: ÖPPNA KNAPPAR OCH RÄDDA FÅNGADE LEMLAR.',CW/2,infoY,1,'#ffd040');
    drawTextC(c,'EXTRA LEMLAR KAN GE ÖVER 100% RÄDDAT.',CW/2,infoY+12,1,'#ffd040');
    infoY+=24;
  }
  if(shopActive){
    c.fillStyle=L.night?'#000010':'#080800';
    c.fillRect(0,198,CW,102);
    drawTextC(c,'PENGAR: '+money+'  EXTRA SKILLS KOSTAR 1 MYNT',CW/2,204,1,'#ffd866');
    const opts=G.shopOptions?G.shopOptions():[];
    const cols=7,bw=62,bh=17,gapX=4,gapY=5,total=cols*bw+(cols-1)*gapX;
    const x0=Math.round(CW/2-total/2),y0=216;
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
    drawTextC(c,L.hint,CW/2,263,1,'#40c040');
  }else drawTextC(c,L.hint,CW/2,Math.min(infoY,L.night?226:228),1,'#40c040');
  if((tk>>4)&1)drawTextC(c,shopActive?'KLICKA UTANFÖR BUTIKEN FÖR ATT STARTA':'KLICKA FÖR ATT SLÄPPA UT DEM',CW/2,shopActive?282:236,shopActive?1:2,'#ffd040');
}

function drawResult(c,tk){
  const L=G.level,win=G.saved>=L.save;
  const comp=G.levelCompletionStatus?G.levelCompletionStatus(G.levelIdx):null;
  c.fillStyle='#000008';c.fillRect(0,0,CW,CH);
  drawTextC(c,win?'BRA JOBBAT!':'OJDÅ...',CW/2,50,3,win?'#40ff40':'#ff5050');
  const pct=Math.floor(G.saved/L.lem*100),need=Math.ceil(L.save/L.lem*100);
  drawTextC(c,'DU RÄDDADE '+pct+'%',CW/2,100,2,'#fff');
  drawTextC(c,'KRAVET VAR '+need+'%',CW/2,122,2,'#a0a0b0');
  if(G.saved>L.lem)drawTextC(c,'BONUS: +'+(G.saved-L.lem)+' FÅNGADE LEMLAR',CW/2,146,1,'#ffd040');
  if(win&&comp&&comp.hasExtra)drawTextC(c,comp.full?'BANA FULLBORDAD - ALLA RUNOR FUNNA':'BANA KLARAD - RUNOR SAKNAS',CW/2,G.saved>L.lem?158:146,1,comp.full?'#ffe880':'#caa0ff');
  if(win&&G.levelIdx<LEVELS.length-1)
    drawTextC(c,'KLICKA / ENTER: NÄSTA BANA',CW/2,170,1,'#ffd040');
  else if(win)
    drawTextC(c,'DU KLARADE ALLA BANOR - LEMMEL-MÄSTARE!',CW/2,170,1,'#ffd040');
  else
    drawTextC(c,'KLICKA / ENTER: BANMENY',CW/2,170,1,'#ffd040');
  drawTextC(c,'R: SPELA IGEN   ESC/B: BANMENY',CW/2,190,1,'#8090a0');
  drawTextC(c,'LÄGE '+G.modeName()+'  VÄDER '+G.weatherShort()+'  SEED '+((G.levelSeed>>>0).toString(36).toUpperCase()),CW/2,212,1,'#606880');
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
  c.globalAlpha=0.62;c.fillStyle='#000010';c.fillRect(54,50,CW-108,90);c.globalAlpha=1;
  c.strokeStyle='#ffd040';c.strokeRect(54.5,50.5,CW-109,89);
  drawTextC(c,'PAUS',CW/2,64,3,'#ffd040');
  drawTextC(c,'MELLANSLAG: FORTSÄTT   R: STARTA OM',CW/2,100,1,'#ffffff');
  drawTextC(c,'H: HJÄLP   ESC/B: BANMENY',CW/2,116,1,'#a0d0ff');
  c.restore();
}
function drawHelpOverlay(c){
  if(!G.showHelp)return;
  c.save();
  c.globalAlpha=0.88;c.fillStyle='#000018';c.fillRect(26,28,CW-52,206);c.globalAlpha=1;
  c.strokeStyle='#80b8ff';c.strokeRect(26.5,28.5,CW-53,205);
  drawTextC(c,'HJÄLP / KONTROLLER',CW/2,46,2,'#80b8ff');
  const rows=[
    'KLICKA HUD-IKON + LEMMEL FÖR FÄRDIGHET',
    'BYGG UPP OCH BYGG NED HAR EGNA IKONER',
    '1-0 VÄLJER FÄRDIGHET   J JETPACK   E ELDKASTARE   Q REPKROK',
    'REPKROK: VÄLJ LEMMEL, SIKTA',
    'HÖGERKLICKA LEMMEL: DIREKTSTYR EN GÅNG/BANA',
    'DIREKT: PILAR STYR/HOPPAR   SHIFT SPRING   CTRL SIKTE   L LAMPA',
    'MELLANSLAG PAUS   R STARTA OM   ESC/B MENY',
    'Z/X/C ZOOM   HJUL/PINCH   DRA/SVEP PANORERA',
    'K LÄGE   M MUSIK   S SFX   F FULLSKÄRM',
    'H VISAR / DÖLJER DENNA RUTA'
  ];
  for(let i=0;i<rows.length;i++)drawTextC(c,rows[i],CW/2,68+i*17,1,i===7?'#a0ffa0':'#ffffff');
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
