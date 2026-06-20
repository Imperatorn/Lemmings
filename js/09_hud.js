// ------------------------------ HUD ---------------------------------
const BTNW=26,BTNY=252,BTNH=CH-BTNY;
const BUTTONS=[...SKILLS.map(s=>({k:s.k})),{k:'portal'},{k:'troll'},{k:'save'}];
const HUD_INFO_X=4, HUD_STATUS_X=170, HUD_IN_X=242, HUD_TIME_X=330, HUD_PAUSE_X=430;
function hudButtons(){
  return BUTTONS.filter(b=>b.k!=='portal'||(G.portalStoneButtonVisible&&G.portalStoneButtonVisible()));
}
function hudButtonAt(i){return hudButtons()[i]||null}
function btnRect(i){return {x:2+i*BTNW,y:BTNY,w:BTNW-1,h:BTNH-2}}
function btnHitRect(i){const r=btnRect(i),y=Math.max(HUDY,BTNY-7);return {x:r.x,y,w:r.w,h:CH-y}}
function hitButton(p){
  if(G.state!=='PLAY')return -1;
  const buttons=hudButtons();
  for(let i=0;i<buttons.length;i++){const r=btnHitRect(i);
    if(p.x>=r.x&&p.x<r.x+r.w&&p.y>=r.y&&p.y<r.y+r.h)return i;
  }
  return -1;
}


const ICON_LABELS={
  climb:'KL',float:'FS',bomb:'BO',block:'ST',build:'UP',downbuild:'NED',bash:'HA',mine:'MI',dig:'GR',baz:'BZ',jet:'JP',flame:'EL',rope:'RP',portal:'PT',troll:'TR',save:'SP'
};
function drawArrow(c,x,y,dir,col){
  c.fillStyle=col;
  if(dir==='up'){c.fillRect(x+4,y+2,2,9);c.fillRect(x+1,y+4,8,2);c.fillRect(x+2,y+3,6,1)}
  else if(dir==='down'){c.fillRect(x+4,y+2,2,9);c.fillRect(x+1,y+8,8,2);c.fillRect(x+2,y+10,6,1)}
  else if(dir==='right'){c.fillRect(x+1,y+5,9,2);c.fillRect(x+7,y+2,2,8);c.fillRect(x+9,y+3,1,6)}
  else if(dir==='diagDown'){for(let i=0;i<8;i+=2)c.fillRect(x+i,y+2+i,3,2);c.fillRect(x+8,y+8,3,2);c.fillRect(x+8,y+10,2,2)}
}
function drawIcon(c,k,x,y){
  function p(px,py,col,w,h){c.fillStyle=col;c.fillRect(x+px,y+py,w||1,h||1)}
  const label=ICON_LABELS[k];
  if(label)drawTextC(c,label,x+9,y+20,1,'#e8e8e8');
  switch(k){
    case 'climb':
      p(3,4,'#8a8a92',2,14);p(9,4,'#8a8a92',2,14);
      for(let yy=5;yy<=15;yy+=4)p(3,yy,'#b8b8c0',8,1);
      p(12,7,COL.body,4,5);p(12,4,COL.hair,4,2);p(14,12,COL.leg,1,3);
      break;
    case 'float':
      p(3,5,COL.chute,14,2);p(4,4,COL.chute,12,1);p(6,7,COL.chute,8,1);
      p(6,8,'#fff',1,5);p(13,8,'#fff',1,5);p(9,12,COL.body,3,4);
      break;
    case 'bomb':
      p(7,8,'#1c1c24',7,6);p(6,9,'#1c1c24',9,4);p(9,5,'#aaa',2,3);p(11,3,'#ff8030',3,2);p(8,8,'#fff',1,1);
      break;
    case 'block':
      p(3,7,'#d03030',14,4);p(5,5,'#ffd0d0',10,2);p(9,3,'#ffd0d0',2,10);
      p(7,12,COL.body,5,4);
      break;
    case 'build':
      p(2,16,'#c8a050',5,2);p(6,13,'#c8a050',5,2);p(10,10,'#c8a050',5,2);p(14,7,'#c8a050',4,2);
      drawArrow(c,x+3,y+2,'up','#80ff80');
      break;
    case 'downbuild':
      p(2,7,'#c8a050',5,2);p(6,10,'#c8a050',5,2);p(10,13,'#c8a050',5,2);p(14,16,'#c8a050',4,2);
      drawArrow(c,x+3,y+2,'down','#80d8ff');
      break;
    case 'bash':
      p(2,11,'#906030',14,3);p(12,7,'#d8d8e0',5,3);p(7,9,'#c0c0c8',6,2);drawArrow(c,x+3,y+2,'right','#ffffff');
      break;
    case 'mine':
      p(3,7,'#8a5a2a',10,2);p(10,5,'#b8b8c0',2,10);p(7,5,'#d8d8e0',8,2);drawArrow(c,x+3,y+5,'diagDown','#ffffff');
      break;
    case 'dig':
      p(9,4,'#8a5a2a',2,9);p(6,13,'#b8b8c0',8,3);p(4,17,'#5c3414',12,2);drawArrow(c,x+4,y+2,'down','#ffffff');
      break;
    case 'baz':
      p(2,9,'#565a64',13,4);p(14,8,'#b8b8c0',4,6);p(3,10,'#ff8030',2,2);p(17,9,'#ffd040',2,3);
      break;
    case 'jet':
      p(7,5,'#a0a0a8',6,7);p(8,6,'#d8d8e0',1,5);p(6,12,'#ff8030',3,5);p(11,12,'#ffd040',3,5);drawArrow(c,x+4,y+1,'up','#ffffff');
      break;
    case 'flame':
      p(3,9,'#5c5c64',10,4);p(11,8,'#b8b8c0',4,3);p(14,7,'#ff8030',2,5);
      p(16,6,'#ffd040',2,2);p(17,8,'#ff7020',3,3);p(19,9,'#ff3018',2,2);
      break;
    case 'rope':
      for(let i=0;i<9;i+=2)p(4+i,6+i,'#c8a070',2,2);
      p(13,3,'#d8d8e0',5,2);p(16,3,'#d8d8e0',2,6);p(14,8,'#d8d8e0',4,2);
      break;
    case 'portal':
      p(7,5,'#606070',7,10);p(6,7,'#484858',9,6);p(8,4,'#a8a8b0',5,1);
      p(9,7,'#80d8ff',1,7);p(11,6,'#ff70ff',1,8);p(13,9,'#80d8ff',1,4);
      p(5,14,'#80d8ff',2,1);p(14,14,'#ff70ff',2,1);
      break;
    case 'troll':
      p(5,7,'#7b4b2b',10,9);p(4,9,'#7b4b2b',12,5);
      p(6,5,'#d8c090',3,3);p(11,5,'#d8c090',3,3);
      p(7,10,'#101010',2,2);p(12,10,'#101010',2,2);p(9,14,'#d8c090',3,1);
      break;
    case 'save': p(4,5,'#70a0d8',12,13);p(6,7,'#d8f0ff',8,3);p(7,14,'#203040',7,3);p(13,6,'#203040',2,3);break;
  }
}

function hudFitText(s,maxW){
  s=String(s||'');
  if(typeof textW!=='function'||textW(s,1)<=maxW)return s;
  const suffix='..';
  let out=s;
  while(out.length>0&&textW(out+suffix,1)>maxW)out=out.slice(0,-1);
  return out?out+suffix:'';
}
function drawHudInfoText(c,s,x,y,maxW,col){
  c.save();
  c.beginPath();
  c.rect(x,HUDY,Math.max(0,maxW),12);
  c.clip();
  drawText(c,hudFitText(s,maxW),x,y,1,col);
  c.restore();
}

function drawHUD(c,tk){
  c.fillStyle='#101010';c.fillRect(0,HUDY,CW,CH-HUDY);
  const buttons=hudButtons();
  // inforad
  const L=G.level;
  let info='';
  const hb=G.hoverBtn>=0?buttons[G.hoverBtn]:null;
  const hs=hb?SKILLS.find(s=>s.k===hb.k):null;
  if(hb&&hb.k==='troll')info=G.trollUsed?'TROLLFÖRVANDLING ANVÄND':'FÖRVANDLA LEMMEL TILL TROLL';
  else if(hb&&hb.k==='save')info='SPARA LÄGE';
  else if(hb&&hb.k==='portal')info=(G.portalStoneButtonAvailable&&G.portalStoneButtonAvailable())?'PORTALSTENEN LADDAD':((G.portalStoneUnavailableReason&&G.portalStoneUnavailableReason())||'STENEN KRÄVER DEN HELIGA LÄMMELN');
  else if(hs)info=hs.name+' '+(G.skills&&G.skills[hs.k]!=null?G.skills[hs.k]:'');
  else if(G.hoverLem)info=roleName(G.hoverLem);
  else if(G.selSkill==='troll')info='FÖRVANDLA LEMMEL TILL TROLL';
  else if(G.selSkill==='portal')info=(G.portalStone&&G.portalStone.placingExit)?'PLACERA UTGÅNGSPORTAL':'PORTALSTENEN - KLICKA HELIG LÄMMEL';
  else if(G.selSkill){const ss=SKILLS.find(s=>s.k===G.selSkill);info=(ss?ss.name:G.selSkill)+' '+(G.skills?G.skills[G.selSkill]:'');}
  else info='VÄDER '+G.weatherShort()+'  ZOOM '+Math.round((G.viewZoom||1)*100)+'%';
  if(G.manual&&G.manual.active)info='DIREKT: PILAR/HOPP SHIFT CTRL L';
  drawHudInfoText(c,info,HUD_INFO_X,HUDY+4,HUD_STATUS_X-HUD_INFO_X-8,G.manual&&G.manual.active?'#80d8ff':'#40ff40');
  drawText(c,'UTE '+G.out+'/'+L.lem,HUD_STATUS_X,HUDY+4,1,'#40ff40');
  const pct=Math.floor(G.saved/L.lem*100);
  drawText(c,'INNE '+pct+'%',HUD_IN_X,HUDY+4,1,'#40ff40');
  const secs=Math.max(0,Math.floor(G.timeT*TICK/1000));
  drawText(c,'TID '+Math.floor(secs/60)+'-'+String(secs%60).padStart(2,'0'),HUD_TIME_X,HUDY+4,1,'#40ff40');
  if(G.paused)drawText(c,'PAUS',HUD_PAUSE_X,HUDY+4,1,'#ffd040');
  // knappar
  for(let i=0;i<buttons.length;i++){
    const b=buttons[i],r=btnRect(i);
    const skillButton=!!(G.skills&&Object.prototype.hasOwnProperty.call(G.skills,b.k));
    const disabled=(skillButton&&G.skills[b.k]<=0)||(b.k==='troll'&&G.trollUsed)||(b.k==='portal'&&!(G.portalStoneButtonAvailable&&G.portalStoneButtonAvailable()));
    const sel=!disabled&&((b.k===G.selSkill)||(b.k==='pause'&&G.paused)||(b.k==='fs'&&!!document.fullscreenElement));
    c.fillStyle=disabled?'#181820':(sel?'#284828':'#303038');
    c.fillRect(r.x,r.y,r.w,r.h);
    c.fillStyle=disabled?'#2a2a30':(sel?'#70ff70':'#555560');
    c.fillRect(r.x,r.y,r.w,1);c.fillRect(r.x,r.y,1,r.h);
    c.fillStyle='#15151a';
    c.fillRect(r.x,r.y+r.h-1,r.w,1);c.fillRect(r.x+r.w-1,r.y,1,r.h);
    let num='';
    if(skillButton)num=''+G.skills[b.k];
    else if(b.k==='fs')num='FS';
    if(num)drawTextC(c,num,r.x+r.w/2,r.y+2,1,disabled?'#606068':(sel?'#b0ffb0':'#cccccc'));
    const oldAlpha=c.globalAlpha;
    if(disabled)c.globalAlpha=0.33;
    drawIcon(c,b.k,r.x+4,r.y+16);
    c.globalAlpha=oldAlpha;
    if(disabled){
      c.strokeStyle='#404048';c.beginPath();c.moveTo(r.x+3,r.y+r.h-4);c.lineTo(r.x+r.w-4,r.y+4);c.stroke();
    }
    if(i===G.hoverBtn){c.fillStyle=disabled?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.12)';c.fillRect(r.x,r.y,r.w,r.h)}
  }
  // minikarta
  const mmx=2+buttons.length*BTNW+4,mmw=CW-mmx-3,mmh=BTNH-2;
  c.fillStyle='#000';c.fillRect(mmx,BTNY,mmw,mmh);
  const sc=mmw/L.W,th=Math.min(mmh,240*sc);
  const ty=BTNY+(mmh-th)/2;
  c.drawImage(G.T.cv,0,0,L.W,240,mmx,ty,mmw,th);
  c.fillStyle='#40ff40';
  for(const l of G.lems)if(l.alive())c.fillRect(mmx+l.x*sc,ty+l.y*sc-1,1,2);
  c.fillStyle='#ffd040';c.fillRect(mmx+L.exit.x*sc-1,ty+L.exit.y*sc-2,2,3);
  // Små dynamiska markörer gör det lättare att förstå var kaoshändelserna är.
  if(G.packages)for(const p of G.packages)if(!p.picked&&!p.opened){
    c.fillStyle=(p.kind==='mega'||p.skill==='mega')?'#ff3030':((p.kind==='tree'||p.skill==='tree')?'#d8a8ff':'#80d8ff');
    c.fillRect(mmx+p.x*sc-1,ty+clamp(p.y,0,240)*sc-1,3,3);
  }
  if(G.planes)for(const a of G.planes){c.fillStyle='#d8d8e8';c.fillRect(mmx+clamp(a.x,0,L.W)*sc-1,ty+8,3,2)}
  if(G.monkeys)for(const m of G.monkeys){c.fillStyle='#b07030';c.fillRect(mmx+clamp(m.x,0,L.W)*sc-1,ty+clamp(m.y,0,240)*sc-1,3,3)}
  if(G.trolls)for(const trl of G.trolls){c.fillStyle='#d0a060';c.fillRect(mmx+clamp(trl.x,0,L.W)*sc-1,ty+clamp(trl.y,0,240)*sc-1,3,3)}
  if(G.trees)for(const tr of G.trees){c.fillStyle='#40b040';c.fillRect(mmx+tr.x*sc-1,ty+clamp(tr.baseY-tr.height,0,240)*sc-1,2,4)}
  if(G.ropes)for(const rp of G.ropes){c.fillStyle='#d0a060';c.fillRect(mmx+rp.x1*sc,ty+rp.y1*sc,1,1);c.fillRect(mmx+rp.x2*sc,ty+rp.y2*sc,2,2)}
  if(G.portalStone){
    if(G.portalStone.in){c.fillStyle='#80d8ff';c.fillRect(mmx+G.portalStone.in.x*sc-1,ty+clamp(G.portalStone.in.y,0,240)*sc-2,3,4)}
    if(G.portalStone.out){c.fillStyle='#ff70ff';c.fillRect(mmx+G.portalStone.out.x*sc-1,ty+clamp(G.portalStone.out.y,0,240)*sc-2,3,4)}
  }
  if(G.warnings)for(const w of G.warnings){
    const wx=mmx+w.x*sc, wy=ty+clamp(w.y==null?40:w.y,0,240)*sc;
    c.fillStyle=w.kind==='megaBoom'?'#ff3030':(w.kind==='treeGrow'?'#70e060':(w.kind==='troll'?'#d0a060':'#ffb040'));
    c.fillRect(wx-1,wy-1,3,3);
  }
  c.strokeStyle='#fff';c.lineWidth=1;
  const vw=G.viewW(), vh=G.viewH();
  c.strokeRect(mmx+G.cam*sc+0.5,ty+(G.viewY||0)*sc+0.5,Math.max(2,vw*sc),Math.max(2,vh*sc));
  G.mm={x:mmx,y:BTNY,w:mmw,h:mmh,sc,ty,th};
}
function roleName(l){
  const map={WALK:'VANDRARE',MANUAL:'DIREKTSTYRD',FALL:'FALLANDE',CLIMB:'KLÄTTRARE',BLOCK:'BLOCKERARE',
    BUILD:'BYGGARE',SHRUG:'BYGGARE',BASH:'HACKARE',MINE:'TUNNELGRÄVARE',DIG:'GRÄVARE',
    BAZ:'BAZOOKA',JET:'JETPACK',FLAME:'ELDKASTARE',ROPE:'REPKLÄTTRARE',EXITING:'HEMMA!'};
  let n=map[l.state]||'';
  if(l.state==='WALK'&&l.climber&&l.floater)n='ATLET';
  if((l.scale||1)>1.01)n+=' (STOR)';
  if(G.lamp&&G.lamp.holder===l.id)n+=' (LYKTA)';
  if(G.manual&&G.manual.active&&G.manual.lemId===l.id&&G.manual.lampOn)n+=' (LAMPA)';
  return n;
}

function pixelOutline(c,x,y,w,h,col){
  x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);
  c.fillStyle=col;c.fillRect(x,y,w,1);c.fillRect(x,y+h-1,w,1);c.fillRect(x,y,1,h);c.fillRect(x+w-1,y,1,h);
}
function pixelLine(c,x1,y1,x2,y2,col){
  c.fillStyle=col;
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(x2-x1),Math.abs(y2-y1))/4));
  for(let i=0;i<=steps;i++){const p=i/steps;c.fillRect(Math.round(x1+(x2-x1)*p),Math.round(y1+(y2-y1)*p),2,2)}
}
function drawManualAim(c,cam,tk){
  const m=G.manual;
  if(!m||!m.active||!m.keys||!m.keys.aim)return;
  const l=G.manualLem&&G.manualLem();
  if(!l||!l.alive||!l.alive())return;
  const a=Number.isFinite(m.aimAngle)?m.aimAngle:(l.dir<0?Math.PI:0);
  const sc=Math.max(1,l.scale||1);
  const sx=l.x-cam, sy=l.y-8*sc, r=58*sc;
  const tx=sx+Math.cos(a)*r, ty=sy+Math.sin(a)*r;
  const col=((tk>>2)&1)?'#d8f4ff':'#80d8ff';
  c.save();
  c.globalAlpha=0.86;
  pixelLine(c,sx,sy,tx,ty,col);
  c.fillStyle=col;
  c.fillRect(Math.round(tx)-7,Math.round(ty),15,1);
  c.fillRect(Math.round(tx),Math.round(ty)-7,1,15);
  pixelOutline(c,tx-5,ty-5,10,10,col);
  c.globalAlpha=0.45;
  c.fillRect(Math.round(sx)-2,Math.round(sy)-2,5,5);
  c.restore();
}
function drawSkillPreview(c,cam,tk){
  if(!G.selSkill||G.my>=HUDY||!G.level||!G.T)return;
  const mx=G.renderMx!=null?G.renderMx:G.mx;
  const my=G.renderMy!=null?G.renderMy:G.my;
  const wx=G.mouseWorldX!=null?G.mouseWorldX:mx+cam, wy=G.mouseWorldY!=null?G.mouseWorldY:my;
  const k=G.selSkill;
  if(k==='portal'){
    c.save();c.globalAlpha=0.82;
    if(G.portalStone&&G.portalStone.placingExit){
      const res=G.portalStoneExitCandidate?G.portalStoneExitCandidate(wx,wy):{ok:false,reason:'KAN EJ'};
      const p=res.point||(G.portalStoneSurfaceAt&&G.portalStoneSurfaceAt(wx,wy,84));
      const col=res.ok?'#80d8ff':'#ff8080';
      if(G.portalStone.in){
        pixelLine(c,G.portalStone.in.x-cam,G.portalStone.in.y-16,p?p.x-cam:mx,p?p.y-16:my,col);
        if(typeof drawPortalStonePortal==='function')drawPortalStonePortal(c,G.portalStone.in,cam,tk,'in',false);
      }
      if(p){
        if(typeof drawPortalStonePortal==='function')drawPortalStonePortal(c,p,cam,tk,'out',true);
        else pixelOutline(c,p.x-cam-9,p.y-26,18,26,col);
        drawTextC(c,res.ok?'PLACERA':(res.reason||'KAN EJ'),clamp(p.x-cam,42,VW-42),Math.max(14,p.y-38),1,col);
      }else drawTextC(c,res.reason||'INGEN MARK',clamp(mx,42,VW-42),Math.max(14,my-16),1,col);
    }else{
      const l=G.findPortalStoneTarget?G.findPortalStoneTarget(wx,wy):null;
      const col=l?'#80d8ff':'#ff8080';
      if(l){
        const sc=Math.max(1,l.scale||1);
        pixelOutline(c,l.x-cam-11*sc,l.y-21*sc,22*sc,26*sc,col);
        drawTextC(c,'ANVÄND STENEN',clamp(l.x-cam,50,VW-50),Math.max(14,l.y-34),1,col);
      }else drawTextC(c,'KLICKA HELIG LÄMMEL',clamp(mx,62,VW-62),Math.max(14,my-14),1,col);
    }
    c.restore();
    return;
  }
  const hit=G.findSkillTarget(wx,wy,k);
  const aimable=k==='baz'||k==='flame'||k==='rope';
  const manualBase=aimable&&G.isManualActive&&G.isManualActive()&&G.manualLem?G.manualLem():null;
  const manualAim=manualBase&&manualBase.alive&&manualBase.alive()?G.manualAimFor(manualBase,k):null;
  const useManualAim=Number.isFinite(manualAim);
  const l=(useManualAim?manualBase:null)||hit.usable||hit.near;
  if(!l&&!(k==='rope'&&G.ropeAim&&G.findLemById(G.ropeAim.lemId)))return;
  const baseL=l||(k==='rope'?G.findLemById(G.ropeAim.lemId):null);
  if(!baseL)return;
  const sx=baseL.x-cam, sy=baseL.y, d=baseL.dir||1, sc=Math.max(1,baseL.scale||1);
  const ux=useManualAim?Math.cos(manualAim):d, uy=useManualAim?Math.sin(manualAim):0;
  const ok=k==='troll'?(!G.trollUsed&&!!hit.near):((useManualAim&&G.canApplySkill&&G.canApplySkill(baseL,k)&&G.skills&&G.skills[k]>0)||
    (k==='rope'&&G.ropeAim&&G.findLemById(G.ropeAim.lemId)&&G.skills&&G.skills.rope>0)||!!hit.usable&&G.skills&&G.skills[k]>0);
  const col=ok?'#80ff80':'#ff8080';
  c.save();c.globalAlpha=0.78;
  if(k==='dig')pixelOutline(c,sx-8*sc,sy,16*sc,18*sc,col);
  else if(k==='bash')pixelOutline(c,sx+(d>0?2*sc:-38*sc),sy-10*sc,36*sc,12*sc,col);
  else if(k==='mine')pixelLine(c,sx,sy-2*sc,sx+d*34*sc,sy+18*sc,col);
  else if(k==='build'){for(let i=0;i<12;i++){c.fillStyle=col;c.fillRect(Math.round(sx+d*(5+i*4)*sc),Math.round(sy-2*sc-i*2*sc),Math.round(8*sc),Math.max(2,Math.round(2*sc)))}}
  else if(k==='downbuild'){for(let i=0;i<12;i++){c.fillStyle=col;c.fillRect(Math.round(sx+d*(5+i*4)*sc),Math.round(sy+3*sc+i*2*sc),Math.round(8*sc),Math.max(2,Math.round(2*sc)))}}
  else if(k==='baz'){
    let hx=baseL.x+ux*100, hy=baseL.y-8*sc+uy*100;
    let x=baseL.x+ux*7*sc,y=baseL.y-8*sc+uy*7*sc,vx=ux*6.4,vy=uy*6.4+(useManualAim?0:-0.28);
    for(let i=0;i<80;i++){x+=vx;y+=vy;vy+=0.05;if(G.isInGoalZone(x,y,2)||G.T.solidBox(x,y,Math.max(2,Math.round(2*sc)))||x<2||x>G.level.W-2||y<0||y>G.T.H+20){hx=x;hy=y;break}}
    pixelLine(c,sx+ux*7*sc,sy-8*sc+uy*7*sc,hx-cam,hy,col);pixelOutline(c,hx-cam-18*sc,hy-18*sc,36*sc,36*sc,col);
  }else if(k==='jet'){pixelLine(c,sx,sy-10*sc,sx+d*62*sc,sy-48*sc,col);pixelOutline(c,sx+d*52*sc,sy-56*sc,18*sc,18*sc,col);}
  else if(k==='flame'){
    const nx=-uy,ny=ux,baseX=sx+ux*7*sc,baseY=sy-8*sc+uy*7*sc;
    for(let dist=8;dist<=FLAME_RANGE;dist+=8){
      const r=Math.round((2+dist*0.14)*sc);
      const wob=Math.sin(dist*0.19+tk*0.15)*2*sc;
      const x=baseX+ux*dist*sc+nx*wob,y=baseY+uy*dist*sc+ny*wob;
      pixelOutline(c,x-r,y-r,r*2,r*2,col);
    }
    pixelLine(c,baseX,baseY,baseX+ux*(FLAME_RANGE+8)*sc,baseY+uy*(FLAME_RANGE+8)*sc,col);
  }
  else if(k==='rope'){
    const aiming=G.ropeAim&&G.findLemById(G.ropeAim.lemId);
    const rl=aiming||l;
    const rsc=Math.max(1,rl.scale||1),rsx=rl.x-cam,rsy=rl.y-9*rsc;
    const tx=useManualAim?rsx+ux*86*rsc:mx,ty=useManualAim?rsy+uy*86*rsc:my;
    pixelLine(c,rsx,rsy,tx,ty,col);
    pixelOutline(c,tx-5,ty-5,10,10,col);
    if(useManualAim)drawTextC(c,'SIKTE',clamp(tx,48,VW-48),Math.max(14,ty-16),1,col);
    else if(!aiming)drawTextC(c,'VÄLJ LEMMEL',clamp(rsx,45,VW-45),Math.max(14,rsy-18),1,col);
    else drawTextC(c,useManualAim?'SIKTE':'KLICKA FÄSTE',clamp(tx,48,VW-48),Math.max(14,ty-16),1,col);
  }
  else if(k==='bomb')pixelOutline(c,sx-15*sc,sy-20*sc,30*sc,30*sc,col);
  else if(k==='troll')pixelOutline(c,sx-13*sc,sy-25*sc,26*sc,30*sc,col);
  else pixelOutline(c,sx-8*sc,sy-19*sc,16*sc,22*sc,col);
  drawTextC(c,ok?'FÖRHANDSVISNING':'KAN EJ',clamp(sx,36,VW-36),Math.max(14,sy-30),1,col);
  c.restore();
}
function drawRope(c,rope,cam,tk){
  if(!rope||!rope.active)return;
  const x1=rope.x1-cam,y1=rope.y1-8,x2=rope.x2-cam,y2=rope.y2-8;
  const pulse=(tk>>2)&1;
  c.save();
  pixelLine(c,x1,y1,x2,y2,'#8a5a2a');
  pixelLine(c,x1+1,y1,x2+1,y2,pulse?'#d0a060':'#b88040');
  c.fillStyle='#c0c0c8';
  c.fillRect(rope.hookX-cam-2,rope.hookY-2,5,2);
  c.fillRect(rope.hookX-cam+1,rope.hookY-5,2,5);
  c.restore();
}
function drawRopeHook(c,h,cam,tk){
  if(!h)return;
  c.save();
  pixelLine(c,h.baseX-cam,h.baseY-8,h.x-cam,h.y,'#b88040');
  c.fillStyle='#d0d0d8';
  c.fillRect(h.x-cam-2,h.y-1,5,2);
  c.fillRect(h.x-cam+1,h.y-4,2,5);
  c.restore();
}
function drawEventWarnings(c,cam,tk){
  if(!G.warnings||G.warnings.length===0)return;
  c.save();
  for(const w of G.warnings){
    const life=clamp(w.t/Math.max(1,w.maxT||w.t),0,1);
    let x=w.x-cam,y=clamp(w.y==null?42:w.y,16,VH-8);
    const off=x<-18||x>VW+18;
    if(off)x=clamp(x,14,VW-14);
    const pulse=((tk>>2)&1);
    const col=w.kind==='megaBoom'?'#ff3030':(w.kind==='treeGrow'?'#70e060':(w.kind==='monkey'?'#ffd040':(w.kind==='randomJump'?'#8fd8ff':'#ffb040')));
    c.globalAlpha=0.55+0.35*pulse;
    c.fillStyle=col;
    if(w.kind==='supplyPlane'){for(let yy=18;yy<Math.min(VH,y+4);yy+=8)c.fillRect(x,yy,2,4);}
    pixelOutline(c,x-8,y-8,16,16,col);
    c.fillRect(x-2,y-2,4,4);
    if(off){c.fillRect(x<20?x-8:x+5,y-2,4,4);c.fillRect(x<20?x-5:x+2,y-5,4,10)}
    c.globalAlpha=1;
    drawTextC(c,w.text||'VARNING',clamp(x,55,VW-55),clamp(y-18,10,VH-18),1,col);
    if(w.kind==='megaBoom'){drawTextC(c,''+Math.ceil(w.t/16),x,y+10,1,'#fff0a0')}
  }
  c.restore();
}
