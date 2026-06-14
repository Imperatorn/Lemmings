// --------------------------- HUVUDLOOP ------------------------------
G.loadPrefs();
for(let i=0;i<7;i++){
  const l=new Lemming(40+i*65,210);l.state='WALK';l.dir=i%2?1:-1;
  G.titleLems.push(l);
}
let acc=0,last=performance.now();
function loop(now){
  try{
    acc+=now-last;last=now;
    if(acc>500)acc=500;
    const stepMs=(G.state==='PLAY'&&!G.paused&&G.tempoTickMs)?G.tempoTickMs():TICK;
    while(acc>=stepMs){
      acc-=stepMs;tickCount++;
      G.tick();
    }
    render();
  }catch(err){
    reportGameError('Loop-fel',err);
    try{render()}catch(_){}
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
