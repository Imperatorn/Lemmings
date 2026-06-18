// ----------------------------- LJUD ---------------------------------
// Procedurell chiptune-motor. All musik är egenkomponerad.
const MUSIC_GAIN_BASE=0.50;
const CAVE_MYSTERY_GAIN_BOOST=1.35;
const CHURCH_HYMN_LOOP_START_SECONDS=1;
const CHURCH_HYMN_LOOP_SECONDS=32;
const CHURCH_HYMN_LOOP_FADE_SECONDS=1;
const AU={
  ctx:null, master:null, musGain:null, sfxGain:null, on:true, musicOn:true, sfxOn:true, musicVol:1, sfxVol:1, started:false,
  weather:{timer:null,kind:null,next:0,step:0,loopNodes:[]}, waterfallCave:{loopNodes:[]}, churchHymn:null, fxLast:{},
  init(){
    if(this.ctx) return;
    try{
      this.ctx=new (window.AudioContext||window.webkitAudioContext)();
      this.master=this.ctx.createGain(); this.master.gain.value=0.5;
      this.master.connect(this.ctx.destination);
      this.sfxGain=this.ctx.createGain();
      this.sfxGain.connect(this.master);
      this.musGain=this.ctx.createGain();
      this.musGain.connect(this.master);
      // Separat explosionsbuss: explosionsljud behöver mycket transient/subbas
      // men ska inte kunna överstyra hela mixen eller krascha äldre/fake AudioContexts.
      this.boomGain=this.ctx.createGain(); this.boomGain.gain.value=0.92;
      let boomOut=this.boomGain;
      if(this.ctx.createDynamicsCompressor){
        this.boomComp=this.ctx.createDynamicsCompressor();
        if(this.boomComp.threshold)this.boomComp.threshold.setValueAtTime(-18,this.ctx.currentTime);
        if(this.boomComp.knee)this.boomComp.knee.setValueAtTime(18,this.ctx.currentTime);
        if(this.boomComp.ratio)this.boomComp.ratio.setValueAtTime(5.5,this.ctx.currentTime);
        if(this.boomComp.attack)this.boomComp.attack.setValueAtTime(0.003,this.ctx.currentTime);
        if(this.boomComp.release)this.boomComp.release.setValueAtTime(0.32,this.ctx.currentTime);
        this.boomGain.connect(this.boomComp); boomOut=this.boomComp;
      }
      boomOut.connect(this.sfxGain||this.master);
      this.applyVolumes();
    }catch(e){ this.on=false }
  },
  now(){return this.ctx?this.ctx.currentTime:0},
  sfxDest(){return this.sfxGain||this.master},
  applyVolumes(){
    const t=this.now();
    const mystery=this.mus&&this.mus.kind==='caveMystery';
    const mv=MUSIC_GAIN_BASE*(mystery?CAVE_MYSTERY_GAIN_BOOST:1)*clamp(Number.isFinite(this.musicVol)?this.musicVol:1,0,1);
    const sv=clamp(Number.isFinite(this.sfxVol)?this.sfxVol:1,0,1);
    if(this.musGain&&this.musGain.gain)this.gainRamp(this.musGain,this.musGain.gain,t,mv,'linear');
    if(this.sfxGain&&this.sfxGain.gain)this.gainRamp(this.sfxGain,this.sfxGain.gain,t,sv,'linear');
    if(this.updateWaterfallCaveChurchHymnVolume)this.updateWaterfallCaveChurchHymnVolume(0.08);
  },
  setMusicVolume(v){
    v=Number(v);
    this.musicVol=Number.isFinite(v)?clamp(v,0,1):1;
    this.applyVolumes();
    return this.musicVol;
  },
  setSfxVolume(v){
    v=Number(v);
    this.sfxVol=Number.isFinite(v)?clamp(v,0,1):1;
    this.applyVolumes();
    return this.sfxVol;
  },
  tone(f,dur,type,vol,slide,when,dest){
    if(!this.ctx||!this.on)return;
    if(dest!==this.musGain&&!this.sfxOn)return;
    const t=when||this.now();
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type=type||'square'; o.frequency.setValueAtTime(f,t);
    if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(20,f*slide),t+dur);
    g.gain.setValueAtTime(vol||0.1,t);
    g.gain.exponentialRampToValueAtTime(0.0008,t+dur);
    o.connect(g); g.connect(dest||this.sfxDest());
    o.start(t); o.stop(t+dur+0.02);
  },
  padTone(f,dur,type,vol,when,dest){
    if(!this.ctx||!this.on)return;
    if(dest!==this.musGain&&!this.sfxOn)return;
    const t=when||this.now();
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    const attack=Math.min(0.10,Math.max(0.018,dur*0.10));
    const release=Math.min(0.42,Math.max(0.08,dur*0.26));
    const end=Math.max(t+attack,t+dur-release);
    o.type=type||'triangle'; o.frequency.setValueAtTime(f,t);
    g.gain.setValueAtTime(0.00005,t);
    if(g.gain.linearRampToValueAtTime)g.gain.linearRampToValueAtTime(Math.max(0.0008,vol||0.02),t+attack);
    else g.gain.exponentialRampToValueAtTime(Math.max(0.0008,vol||0.02),t+attack);
    g.gain.setValueAtTime(Math.max(0.0008,vol||0.02),end);
    g.gain.exponentialRampToValueAtTime(0.0008,t+dur);
    o.connect(g); g.connect(dest||this.sfxDest());
    o.start(t); o.stop(t+dur+0.04);
  },
  noise(dur,vol,fq,slide,when,dest){
    if(!this.ctx||!this.on)return;
    if(dest!==this.musGain&&!this.sfxOn)return;
    const t=when||this.now(), n=Math.floor(this.ctx.sampleRate*dur);
    const buf=this.ctx.createBuffer(1,n,this.ctx.sampleRate), d=buf.getChannelData(0);
    for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
    const src=this.ctx.createBufferSource(); src.buffer=buf;
    const f=this.ctx.createBiquadFilter(); f.type='lowpass';
    f.frequency.setValueAtTime(fq||1200,t);
    if(slide) f.frequency.exponentialRampToValueAtTime(Math.max(40,(fq||1200)*slide),t+dur);
    const g=this.ctx.createGain(); g.gain.setValueAtTime(vol||0.15,t);
    g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    src.connect(f);f.connect(g);g.connect(dest||this.sfxDest());
    src.start(t);
  },
  softNoise(dur,vol,fq,slide,when,opts){
    // Mjukare engångsbrus än noise(): kort fade-in/fade-out och lätt färgat brus.
    // Används för droppar, smällar och små vädereffekter. Själva regnmattan
    // ligger numera som loopad bruskälla så den inte pulserar i vågor.
    if(!this.ctx||!this.on)return;
    opts=opts||{};
    const dest=opts.dest||this.sfxDest();
    if(dest!==this.musGain&&!this.sfxOn)return;
    const t=when||this.now();
    const n=Math.max(1,Math.floor(this.ctx.sampleRate*Math.max(0.01,dur)));
    const buf=this.ctx.createBuffer(1,n,this.ctx.sampleRate), d=buf.getChannelData(0);
    const smooth=opts.smooth==null?0.55:clamp(opts.smooth,0,0.98);
    let last=0;
    for(let i=0;i<n;i++){
      const white=Math.random()*2-1;
      last=last*smooth+white*(1-smooth);
      d[i]=last;
    }
    const src=this.ctx.createBufferSource(); src.buffer=buf;
    const f=this.ctx.createBiquadFilter(); f.type=opts.type||'lowpass';
    f.frequency.setValueAtTime(fq||1200,t);
    if(f.Q&&opts.q)f.Q.setValueAtTime(opts.q,t);
    if(slide) f.frequency.exponentialRampToValueAtTime(Math.max(40,(fq||1200)*slide),t+dur);
    const g=this.ctx.createGain();
    const attack=Math.max(0.01,Math.min(dur*0.45,opts.attack==null?0.08:opts.attack));
    const release=Math.max(0.02,Math.min(dur*0.75,opts.release==null?0.18:opts.release));
    const sustainEnd=Math.max(t+attack,t+dur-release);
    g.gain.setValueAtTime(0.0008,t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0009,vol||0.02),t+attack);
    g.gain.setValueAtTime(Math.max(0.0009,vol||0.02),sustainEnd);
    g.gain.exponentialRampToValueAtTime(0.0008,t+dur);
    src.connect(f);f.connect(g);g.connect(dest);
    src.start(t);
  },
  gainRamp(g,param,t,value,mode){
    if(!param)return;
    try{
      if(param.cancelScheduledValues)param.cancelScheduledValues(t);
      if(param.setValueAtTime)param.setValueAtTime(Math.max(0.00005,param.value||0.0001),t);
      if(mode==='linear'&&param.linearRampToValueAtTime)param.linearRampToValueAtTime(Math.max(0.00005,value),t);
      else if(param.exponentialRampToValueAtTime)param.exponentialRampToValueAtTime(Math.max(0.00005,value),t);
      else if(param.setValueAtTime)param.setValueAtTime(Math.max(0.00005,value),t);
    }catch(_){try{param.value=Math.max(0.00005,value)}catch(__){}}
  },
  loopNoise(dur,vol,fq,opts){
    // Konstant loopad vädermatta. Viktigt för regn: inga återkommande gain-attacker
    // var sekund, eftersom sådana hörs som "vågor". En lång loop med konstant gain
    // låter mycket jämnare även med enkel WebAudio.
    if(!this.ctx||!this.on||!this.sfxOn)return null;
    opts=opts||{};
    const t=this.now(), rate=this.ctx.sampleRate||44100;
    const n=Math.max(256,Math.floor(rate*Math.max(0.6,dur||3.0)));
    const fade=Math.min(Math.max(64,Math.floor(rate*0.035)),Math.floor(n/5));
    const buf=this.ctx.createBuffer(1,n,this.ctx.sampleRate), d=buf.getChannelData(0);
    const smooth=opts.smooth==null?0.5:clamp(opts.smooth,0,0.98);
    let last=0;
    for(let i=0;i<n;i++){
      const white=Math.random()*2-1;
      last=last*smooth+white*(1-smooth);
      d[i]=last;
    }
    // Mjuka ihop slutet mot början så loop-skarven inte klickar.
    for(let i=0;i<fade;i++){
      const w=i/(fade-1||1);
      const a=n-fade+i;
      d[a]=d[a]*(1-w)+d[i]*w;
    }
    const src=this.ctx.createBufferSource(); src.buffer=buf; src.loop=true;
    const f=this.ctx.createBiquadFilter(); f.type=opts.type||'lowpass';
    f.frequency.setValueAtTime(fq||1200,t);
    if(f.Q&&opts.q)f.Q.setValueAtTime(opts.q,t);
    const g=this.ctx.createGain();
    const target=Math.max(0.00005,vol||0.01);
    g.gain.setValueAtTime(0.00005,t);
    if(g.gain.linearRampToValueAtTime)g.gain.linearRampToValueAtTime(target,t+(opts.attack==null?0.9:opts.attack));
    else if(g.gain.exponentialRampToValueAtTime)g.gain.exponentialRampToValueAtTime(target,t+(opts.attack==null?0.9:opts.attack));
    else g.gain.setValueAtTime(target,t);
    src.connect(f);f.connect(g);g.connect(opts.dest||this.sfxDest());
    src.start(t);
    return {src,gain:g};
  },
  clearWeatherLoops(fade){
    if(!this.weather||!this.weather.loopNodes)return;
    const t=this.now(), stopDelay=fade==null?0.45:fade;
    for(const n of this.weather.loopNodes){
      try{
        if(n.gain&&n.gain.gain){
          const p=n.gain.gain;
          if(p.cancelScheduledValues)p.cancelScheduledValues(t);
          if(p.setValueAtTime)p.setValueAtTime(Math.max(0.00005,p.value||0.0001),t);
          if(p.linearRampToValueAtTime)p.linearRampToValueAtTime(0.00005,t+stopDelay);
          else if(p.exponentialRampToValueAtTime)p.exponentialRampToValueAtTime(0.00005,t+stopDelay);
        }
        if(n.src&&n.src.stop)n.src.stop(t+stopDelay+0.08);
      }catch(_){}
    }
    this.weather.loopNodes=[];
  },
  startRainAmbient(){
    this.clearWeatherLoops(0.05);
    const base=this.loopNoise(4.2,0.0117,1900,{type:'bandpass',q:0.45,smooth:0.46,attack:1.1});
    const hiss=this.loopNoise(3.7,0.00495,5600,{type:'highpass',smooth:0.22,attack:1.3});
    if(base)this.weather.loopNodes.push(base);
    if(hiss)this.weather.loopNodes.push(hiss);
  },
  startSnowAmbient(){
    this.clearWeatherLoops(0.05);
    const wind=this.loopNoise(5.2,0.010,620,{type:'lowpass',smooth:0.82,attack:1.4});
    if(wind)this.weather.loopNodes.push(wind);
  },
  fadeLoopNodes(nodes,fade){
    if(!nodes)return;
    const t=this.now(), stopDelay=fade==null?0.35:fade;
    for(const n of nodes||[]){
      try{
        if(n.gain&&n.gain.gain){
          const p=n.gain.gain;
          if(p.cancelScheduledValues)p.cancelScheduledValues(t);
          if(p.setValueAtTime)p.setValueAtTime(Math.max(0.00005,p.value||0.0001),t);
          if(p.linearRampToValueAtTime)p.linearRampToValueAtTime(0.00005,t+stopDelay);
          else if(p.exponentialRampToValueAtTime)p.exponentialRampToValueAtTime(0.00005,t+stopDelay);
        }
        if(n.src&&n.src.stop)n.src.stop(t+stopDelay+0.08);
      }catch(_){}
    }
  },
  stopWaterfallCaveFire(fade){
    const bank=this.waterfallCave||(this.waterfallCave={loopNodes:[],fireNodes:[]});
    this.fadeLoopNodes(bank.fireNodes,fade==null?0.45:fade);
    bank.fireNodes=[];
    bank.fireOn=false;
    bank.nextFireCrackle=0;
  },
  stopWaterfallCave(fade){
    const bank=this.waterfallCave||(this.waterfallCave={loopNodes:[],fireNodes:[]});
    this.fadeLoopNodes(bank.loopNodes,fade==null?0.35:fade);
    this.fadeLoopNodes(bank.fireNodes,fade==null?0.35:fade);
    bank.loopNodes=[];
    bank.fireNodes=[];
    bank.fireOn=false;
    bank.nextFireCrackle=0;
  },
  startWaterfallCave(level){
    this.init();
    this.stopWaterfallCave(0.05);
    if(!this.ctx||!this.on||!this.sfxOn)return;
    const bank=this.waterfallCave||(this.waterfallCave={loopNodes:[],fireNodes:[]});
    const waterLevel=clamp(Number.isFinite(level)?level:1,0.05,1);
    const body=this.loopNoise(6.4,0.035*waterLevel,460,{type:'lowpass',smooth:0.90,attack:0.9});
    const wash=this.loopNoise(5.6,0.021*waterLevel,880,{type:'bandpass',q:0.38,smooth:0.88,attack:1.2});
    const spray=this.loopNoise(4.8,0.011*waterLevel,2400,{type:'bandpass',q:0.50,smooth:0.68,attack:1.1});
    if(body)body.baseVol=0.035;
    if(wash)wash.baseVol=0.021;
    if(spray)spray.baseVol=0.011;
    if(body)bank.loopNodes.push(body);
    if(wash)bank.loopNodes.push(wash);
    if(spray)bank.loopNodes.push(spray);
    bank.waterLevel=waterLevel;
  },
  setWaterfallCaveWaterLevel(level,fade){
    const bank=this.waterfallCave||(this.waterfallCave={loopNodes:[],fireNodes:[]});
    bank.waterLevel=clamp(Number.isFinite(level)?level:1,0.05,1);
    if(!this.ctx||!this.on)return;
    const t=this.now(), dur=fade==null?0.55:fade;
    for(const n of bank.loopNodes||[]){
      const p=n&&n.gain&&n.gain.gain;
      if(!p)continue;
      const target=Math.max(0.00005,(n.baseVol||0.014)*bank.waterLevel);
      try{
        if(p.cancelScheduledValues)p.cancelScheduledValues(t);
        if(p.setValueAtTime)p.setValueAtTime(Math.max(0.00005,p.value||0.0001),t);
        if(p.linearRampToValueAtTime)p.linearRampToValueAtTime(target,t+dur);
        else if(p.exponentialRampToValueAtTime)p.exponentialRampToValueAtTime(target,t+dur);
        else p.setValueAtTime(target,t);
      }catch(_){try{p.value=target}catch(__){}}
    }
  },
  startWaterfallCaveFire(){
    this.init();
    if(!this.ctx||!this.on||!this.sfxOn)return;
    const bank=this.waterfallCave||(this.waterfallCave={loopNodes:[],fireNodes:[]});
    if(bank.fireOn)return;
    bank.fireNodes=bank.fireNodes||[];
    const ember=this.loopNoise(5.8,0.0105,520,{type:'lowpass',smooth:0.90,attack:1.0});
    const hiss=this.loopNoise(4.9,0.0032,1450,{type:'bandpass',q:0.45,smooth:0.62,attack:1.2});
    if(ember)bank.fireNodes.push(ember);
    if(hiss)bank.fireNodes.push(hiss);
    bank.fireOn=true;
    bank.nextFireCrackle=this.now()+0.65+Math.random()*1.25;
  },
  waterfallCaveChurchHymnVolume(mode){
    const bank=this.churchHymn||{};
    const distantLevel=clamp(Number.isFinite(bank.distantLevel)?bank.distantLevel:1,0.05,1);
    const base=mode==='distant'?0.15*distantLevel:0.47;
    return base*clamp(Number.isFinite(this.musicVol)?this.musicVol:1,0,1);
  },
  waterfallCaveChurchHymnElement(){
    if(this.churchHymn&&this.churchHymn.el)return this.churchHymn.el;
    if(typeof Audio==='undefined')return null;
    try{
      const el=new Audio('assets/blessthelord.mp3');
      el.loop=false;
      el.preload='auto';
      el.volume=0;
      this.churchHymn={el,timer:null,loopTimer:null,loopStep:null,loopReady:false,on:false,mode:'inside',distantLevel:1,loopStartSeconds:CHURCH_HYMN_LOOP_START_SECONDS,loopSeconds:CHURCH_HYMN_LOOP_SECONDS,loopFadeSeconds:CHURCH_HYMN_LOOP_FADE_SECONDS,baseVolume:0};
      this.setupWaterfallCaveChurchHymnLoop();
      return el;
    }catch(_){return null}
  },
  waterfallCaveChurchHymnLoopGain(){
    const bank=this.churchHymn, el=bank&&bank.el;
    if(!bank||!el)return 1;
    const start=clamp(Number.isFinite(bank.loopStartSeconds)?bank.loopStartSeconds:CHURCH_HYMN_LOOP_START_SECONDS,0,60);
    const end=Math.max(start+0.1,Number.isFinite(bank.loopSeconds)?bank.loopSeconds:CHURCH_HYMN_LOOP_SECONDS);
    const fade=clamp(Number.isFinite(bank.loopFadeSeconds)?bank.loopFadeSeconds:CHURCH_HYMN_LOOP_FADE_SECONDS,0,(end-start)*0.5);
    if(fade<=0)return 1;
    let t=0;
    try{t=Number(el.currentTime)||0}catch(_){return 1}
    if(t<end-fade)return 1;
    return clamp((end-t)/fade,0,1);
  },
  applyWaterfallCaveChurchHymnVolume(value){
    const bank=this.churchHymn, el=bank&&bank.el;
    if(!bank||!el)return false;
    if(Number.isFinite(value))bank.baseVolume=clamp(value,0,1);
    const base=clamp(Number.isFinite(bank.baseVolume)?bank.baseVolume:0,0,1);
    const loopGain=this.waterfallCaveChurchHymnLoopGain();
    try{el.volume=clamp(base*loopGain,0,1)}catch(_){}
    return true;
  },
  setupWaterfallCaveChurchHymnLoop(){
    const bank=this.churchHymn, el=bank&&bank.el;
    if(!el||bank.loopReady)return !!el;
    const step=()=>this.enforceWaterfallCaveChurchHymnLoop();
    bank.loopStep=step;
    bank.loopReady=true;
    try{el.loop=false}catch(_){}
    try{
      if(el.addEventListener){
        el.addEventListener('timeupdate',step);
        el.addEventListener('ended',step);
      }
    }catch(_){}
    return true;
  },
  enforceWaterfallCaveChurchHymnLoop(){
    const bank=this.churchHymn, el=bank&&bank.el;
    if(!bank||!el||!bank.on)return false;
    const start=clamp(Number.isFinite(bank.loopStartSeconds)?bank.loopStartSeconds:CHURCH_HYMN_LOOP_START_SECONDS,0,60);
    const end=Math.max(start+0.1,Number.isFinite(bank.loopSeconds)?bank.loopSeconds:CHURCH_HYMN_LOOP_SECONDS);
    let t=0;
    try{t=Number(el.currentTime)||0}catch(_){return false}
    this.applyWaterfallCaveChurchHymnVolume();
    if(t<start&&!el.ended){
      try{el.currentTime=start}catch(_){}
      this.applyWaterfallCaveChurchHymnVolume();
      return true;
    }
    if(t<end&&!el.ended)return false;
    try{el.currentTime=start}catch(_){}
    this.applyWaterfallCaveChurchHymnVolume();
    try{
      if(el.paused&&bank.on){
        const p=el.play();
        if(p&&p.catch)p.catch(()=>{});
      }
    }catch(_){}
    return true;
  },
  fadeWaterfallCaveChurchHymn(target,fade,done){
    const bank=this.churchHymn;
    const el=bank&&bank.el;
    if(!el)return false;
    if(bank.timer){clearInterval(bank.timer);bank.timer=null}
    target=clamp(Number.isFinite(target)?target:0,0,1);
    const start=clamp(Number.isFinite(bank.baseVolume)?bank.baseVolume:el.volume,0,1);
    const dur=Math.max(0,fade==null?0.65:fade)*1000;
    if(dur<=16){
      this.applyWaterfallCaveChurchHymnVolume(target);
      if(done)done();
      return true;
    }
    const startT=Date.now?Date.now():0;
    bank.timer=setInterval(()=>{
      const now=Date.now?Date.now():startT+dur;
      const p=clamp((now-startT)/dur,0,1);
      const v=start+(target-start)*p;
      this.applyWaterfallCaveChurchHymnVolume(v);
      if(p>=1){
        clearInterval(bank.timer);
        bank.timer=null;
        if(done)done();
      }
    },40);
    return true;
  },
  updateWaterfallCaveChurchHymnVolume(fade){
    const bank=this.churchHymn;
    if(!bank||!bank.el||!bank.on)return false;
    return this.fadeWaterfallCaveChurchHymn(this.waterfallCaveChurchHymnVolume(bank.mode),fade==null?0.12:fade);
  },
  startWaterfallCaveChurchHymn(fade,mode){
    this.init();
    if(!this.on||!this.musicOn)return false;
    const el=this.waterfallCaveChurchHymnElement();
    if(!el)return false;
    const bank=this.churchHymn;
    bank.on=true;
    bank.mode=mode==='distant'?'distant':'inside';
    if(bank.mode!=='distant')bank.distantLevel=1;
    this.setupWaterfallCaveChurchHymnLoop();
    if(bank.loopTimer==null&&bank.loopStep)bank.loopTimer=setInterval(bank.loopStep,250);
    this.enforceWaterfallCaveChurchHymnLoop();
    try{
      if(el.paused){
        const p=el.play();
        if(p&&p.catch)p.catch(()=>{});
      }
    }catch(_){}
    this.fadeWaterfallCaveChurchHymn(this.waterfallCaveChurchHymnVolume(bank.mode),fade==null?1.0:fade);
    return true;
  },
  startWaterfallCaveChurchHymnDistant(fade,level){
    const el=this.waterfallCaveChurchHymnElement();
    if(el&&this.churchHymn)this.churchHymn.distantLevel=clamp(Number.isFinite(level)?level:1,0.05,1);
    return this.startWaterfallCaveChurchHymn(fade==null?0.85:fade,'distant');
  },
  setWaterfallCaveChurchHymnDistantLevel(level,fade){
    const bank=this.churchHymn;
    if(!bank||!bank.el||!bank.on)return false;
    bank.mode='distant';
    bank.distantLevel=clamp(Number.isFinite(level)?level:1,0.05,1);
    return this.fadeWaterfallCaveChurchHymn(this.waterfallCaveChurchHymnVolume('distant'),fade==null?0.18:fade);
  },
  stopWaterfallCaveChurchHymn(fade){
    const bank=this.churchHymn;
    const el=bank&&bank.el;
    if(!el)return false;
    bank.on=false;
    bank.mode='inside';
    bank.distantLevel=1;
    if(bank.loopTimer!=null){clearInterval(bank.loopTimer);bank.loopTimer=null}
    return this.fadeWaterfallCaveChurchHymn(0,fade==null?0.65:fade,()=>{
      try{
        el.pause();
        el.currentTime=0;
      }catch(_){}
    });
  },
  updateWaterfallCaveCampfire(){
    const bank=this.waterfallCave||(this.waterfallCave={loopNodes:[],fireNodes:[]});
    if(!bank.fireOn||!this.ctx||!this.on||!this.sfxOn)return;
    const t=this.now();
    if(!bank.nextFireCrackle||t>=bank.nextFireCrackle){
      this.softNoise(0.080,0.017+Math.random()*0.010,2100,0.58,t,{type:'bandpass',q:0.70,smooth:0.24,attack:0.006,release:0.065});
      if(Math.random()<0.26)this.softNoise(0.16,0.010,780,0.70,t+0.035,{type:'lowpass',smooth:0.72,attack:0.018,release:0.10});
      if(Math.random()<0.16)this.tone(430+Math.random()*160,0.045,'triangle',0.0045,0.72,t+0.018);
      bank.nextFireCrackle=t+0.65+Math.random()*1.55;
    }
  },
  sWaterfallCaveCrystalChime(strength){
    if(!this.rateFx('waterfall-cave-crystal',0.85))return;
    const t=this.now(), s=clamp(Number.isFinite(strength)?strength:1,0.45,1);
    this.padTone(784,0.58,'sine',0.018*s,t);
    this.padTone(1175,0.66,'triangle',0.013*s,t+0.05);
    this.tone(1568,0.20,'sine',0.020*s,1.01,t+0.12);
    this.tone(2093,0.16,'triangle',0.010*s,0.98,t+0.24);
  },
  sWaterfallCaveRuneDiscover(index,total){
    if(!this.rateFx('waterfall-cave-rune-discover',0.10))return;
    const t=this.now(), i=Math.max(0,Number.isFinite(index)?index:0);
    const step=Number.isFinite(total)&&total>1?i/(total-1):0;
    const base=740+step*250;
    this.tone(base,0.060,'triangle',0.034,1.04,t);
    this.tone(base*1.5,0.075,'sine',0.018,0.98,t+0.035);
    this.softNoise(0.055,0.006,2600,0.72,t+0.010,{type:'bandpass',q:0.8,smooth:0.42,attack:0.006,release:0.038});
  },
  sWaterfallCaveRunesComplete(){
    if(!this.rateFx('waterfall-cave-runes-complete',1.4))return;
    const t=this.now();
    this.padTone(523,0.82,'sine',0.030,t);
    this.padTone(784,0.92,'triangle',0.034,t+0.06);
    this.padTone(1047,1.02,'sine',0.026,t+0.16);
    this.tone(1568,0.22,'triangle',0.044,1.02,t+0.30);
    this.tone(2093,0.20,'sine',0.026,0.98,t+0.44);
    this.softNoise(0.42,0.012,2200,0.62,t+0.08,{type:'bandpass',q:0.70,smooth:0.78,attack:0.05,release:0.28});
  },
  sWaterfallCaveTeleportStone(){
    if(!this.rateFx('waterfall-cave-teleport-stone',1.2))return;
    const t=this.now();
    this.padTone(392,0.92,'sine',0.016,t);
    this.padTone(740,0.78,'triangle',0.018,t+0.05);
    this.tone(1175,0.24,'sine',0.026,1.18,t+0.12);
    this.tone(1760,0.22,'triangle',0.014,0.84,t+0.26);
    this.softNoise(0.45,0.010,1800,0.55,t+0.03,{type:'bandpass',q:0.60,smooth:0.76,attack:0.07,release:0.28});
  },
  sWaterfallCaveStonePickup(){
    if(!this.rateFx('waterfall-cave-stone-pickup',0.10))return;
    const t=this.now();
    this.softNoise(0.045,0.010,620,0.42,t,{type:'bandpass',q:0.55,smooth:0.34,attack:0.004,release:0.035});
    this.tone(210,0.040,'triangle',0.014,0.92,t+0.010);
  },
  sWaterfallCaveStoneThrow(){
    if(!this.rateFx('waterfall-cave-stone-throw',0.12))return;
    const t=this.now();
    this.softNoise(0.060,0.006,880,0.30,t,{type:'bandpass',q:0.50,smooth:0.52,attack:0.010,release:0.045});
    this.tone(330,0.035,'triangle',0.008,1.06,t+0.018);
  },
  sWaterfallCaveStoneSplash(){
    if(!this.rateFx('waterfall-cave-stone-splash',0.12))return;
    const t=this.now();
    this.softNoise(0.14,0.010,1250,0.30,t,{type:'bandpass',q:0.55,smooth:0.80,attack:0.006,release:0.085});
    this.softNoise(0.30,0.018,360,0.44,t+0.012,{type:'lowpass',smooth:0.88,attack:0.012,release:0.22});
    this.softNoise(0.18,0.006,820,0.22,t+0.060,{type:'bandpass',q:0.45,smooth:0.72,attack:0.018,release:0.12});
    this.tone(150,0.070,'sine',0.014,0.76,t+0.012);
  },
  sPortalStoneOpen(){
    if(!this.rateFx('portal-stone-open',0.18))return;
    const t=this.now();
    this.padTone(330,0.42,'sine',0.014,t);
    this.padTone(660,0.46,'triangle',0.012,t+0.03);
    this.tone(990,0.16,'sine',0.024,1.04,t+0.08);
    this.tone(1480,0.12,'triangle',0.012,0.92,t+0.18);
    this.softNoise(0.22,0.006,2200,0.45,t+0.02,{type:'bandpass',q:0.75,smooth:0.82,attack:0.035,release:0.16});
  },
  sPortalStoneTravel(){
    if(!this.rateFx('portal-stone-travel',0.10))return;
    const t=this.now();
    this.tone(880,0.06,'triangle',0.028,1.08,t);
    this.tone(1320,0.08,'sine',0.018,0.86,t+0.04);
    this.softNoise(0.12,0.007,2600,0.42,t,{type:'bandpass',q:0.90,smooth:0.70,attack:0.010,release:0.08});
  },
  // --- effekter ---
  rateFx(name,gap){
    if(!this.ctx||!this.on||!this.sfxOn)return false;
    const t=this.now(), last=this.fxLast?this.fxLast[name]:null;
    if(last!=null&&t-last<(gap||0.05))return false;
    (this.fxLast=this.fxLast||{})[name]=t;
    return true;
  },
  sClick(){this.tone(880,0.05,'square',0.06)},
  sAssign(){this.tone(660,0.06,'square',0.09);this.tone(990,0.07,'square',0.07,1,this.now()+0.05)},
  sLetsGo(){const t=this.now();[523,659,784,1047].forEach((f,i)=>this.tone(f,0.12,'square',0.08,1,t+i*0.09))},
  sCutscene(){
    if(!this.rateFx('cutscene',0.12))return;
    const t=this.now();
    [880,1175,1568].forEach((f,i)=>this.tone(f,0.075,'triangle',0.055,1.01,t+i*0.055));
    this.tone(2093,0.09,'sine',0.020,1,t+0.14);
  },
  boomDest(){return this.boomGain||this.sfxDest()},
  makeDistortionCurve(amount){
    const n=256, curve=new Float32Array(n), k=amount||60;
    for(let i=0;i<n;i++){
      const x=i*2/n-1;
      curve[i]=(1+k)*x/(1+k*Math.abs(x));
    }
    return curve;
  },
  boomFilter(type,fq,q,t){
    if(!this.ctx||!this.ctx.createBiquadFilter)return null;
    const f=this.ctx.createBiquadFilter(); f.type=type||'lowpass';
    if(f.frequency&&f.frequency.setValueAtTime)f.frequency.setValueAtTime(fq||500,t||this.now());
    if(f.Q&&f.Q.setValueAtTime)f.Q.setValueAtTime(q||0.7,t||this.now());
    return f;
  },
  boomEnvelope(g,t,dur,vol,attack,hold){
    const p=g&&g.gain;if(!p)return;
    const peak=Math.max(0.0008,vol||0.1), a=Math.max(0.001,attack||0.004);
    const h=Math.max(t+a,t+(hold||0.018));
    try{
      if(p.cancelScheduledValues)p.cancelScheduledValues(t);
      p.setValueAtTime(0.00005,t);
      if(p.linearRampToValueAtTime)p.linearRampToValueAtTime(peak,t+a);
      else p.setValueAtTime(peak,t+a);
      if(p.setValueAtTime)p.setValueAtTime(peak,h);
      if(p.exponentialRampToValueAtTime)p.exponentialRampToValueAtTime(0.00005,t+dur);
      else if(p.linearRampToValueAtTime)p.linearRampToValueAtTime(0.00005,t+dur);
      else p.setValueAtTime(0.00005,t+dur);
    }catch(_){try{p.value=0.00005}catch(__){}}
  },
  boomNoise(dur,vol,fq,when,opts){
    if(!this.ctx||!this.on||!this.sfxOn)return;
    opts=opts||{};
    const t=when||this.now(), rate=this.ctx.sampleRate||44100;
    const n=Math.max(1,Math.floor(rate*Math.max(0.012,dur)));
    const buf=this.ctx.createBuffer(1,n,rate), d=buf.getChannelData(0);
    let last=0, last2=0, smooth=opts.smooth==null?0.18:clamp(opts.smooth,0,0.995);
    for(let i=0;i<n;i++){
      const white=Math.random()*2-1;
      last=last*smooth+white*(1-smooth);
      // Lite brun/röd komponent ger tyngre kropp än vanlig vit brusmatta.
      last2=last2*0.985+white*0.015;
      d[i]=opts.brown?clamp(last*0.45+last2*4.4,-1,1):last;
    }
    const src=this.ctx.createBufferSource(); src.buffer=buf;
    let node=src;
    const f=this.boomFilter(opts.type||'lowpass',fq||500,opts.q||0.8,t);
    if(f){node.connect(f);node=f}
    if(opts.dist&&this.ctx.createWaveShaper){
      const ws=this.ctx.createWaveShaper(); ws.curve=this.makeDistortionCurve(opts.dist); ws.oversample='2x';
      node.connect(ws); node=ws;
    }
    const g=this.ctx.createGain(); this.boomEnvelope(g,t,dur,vol,opts.attack,opts.hold);
    node.connect(g); g.connect(opts.dest||this.boomDest());
    src.start(t); if(src.stop)src.stop(t+dur+0.04);
  },
  boomOsc(f0,f1,dur,vol,when,opts){
    if(!this.ctx||!this.on||!this.sfxOn)return;
    opts=opts||{};
    const t=when||this.now();
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type=opts.type||'sine';
    if(o.frequency&&o.frequency.setValueAtTime)o.frequency.setValueAtTime(Math.max(20,f0),t);
    if(o.frequency&&f1){
      if(o.frequency.exponentialRampToValueAtTime)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
      else if(o.frequency.linearRampToValueAtTime)o.frequency.linearRampToValueAtTime(Math.max(20,f1),t+dur);
    }
    let node=o;
    if(opts.filter){
      const f=this.boomFilter(opts.filter.type||'lowpass',opts.filter.fq||260,opts.filter.q||0.75,t);
      if(f){node.connect(f);node=f}
    }
    if(opts.dist&&this.ctx.createWaveShaper){
      const ws=this.ctx.createWaveShaper(); ws.curve=this.makeDistortionCurve(opts.dist); ws.oversample='2x';
      node.connect(ws); node=ws;
    }
    this.boomEnvelope(g,t,dur,vol,opts.attack,opts.hold);
    node.connect(g); g.connect(opts.dest||this.boomDest());
    o.start(t); if(o.stop)o.stop(t+dur+0.04);
  },
  sExplosion(kind){
    // Explosionsdesign: dov tryckvåg med fyllig kropp. Den snabba toppen finns
    // kvar för attack, men är kortare/lägre så ljudet inte blir vasst i hörlurar.
    const C={
      small:  {scale:0.82,crack:0.17,body:0.31,bass:0.42,f0:104,f1:42,dur:0.82,tail:2},
      banana: {scale:1.00,crack:0.21,body:0.39,bass:0.56,f0:102,f1:39,dur:1.04,tail:3},
      lemming:{scale:1.22,crack:0.26,body:0.50,bass:0.70,f0:96, f1:35,dur:1.28,tail:4},
      bazooka:{scale:1.38,crack:0.30,body:0.60,bass:0.82,f0:90, f1:32,dur:1.46,tail:5},
      big:    {scale:1.62,crack:0.36,body:0.74,bass:0.98,f0:84, f1:29,dur:1.82,tail:6}
    }[kind||'small']||null;
    const cfg=C||{scale:1,crack:0.24,body:0.42,bass:0.60,f0:100,f1:38,dur:1.02,tail:4};
    const t=this.now(), s=cfg.scale;

    // 1. Rund attack/luftstöt: mindre diskant, mer lågmid.
    this.boomNoise(0.032,0.070*s,4300,t,{type:'highpass',q:0.28,smooth:0.20,attack:0.004,hold:0.004,dist:12});
    this.boomNoise(0.120,cfg.crack*0.55,1450,t+0.006,{type:'bandpass',q:0.46,smooth:0.36,attack:0.010,hold:0.020,dist:24});
    this.boomNoise(0.150,cfg.body*0.34,360,t+0.004,{type:'lowpass',q:0.50,smooth:0.82,brown:true,attack:0.012,hold:0.030,dist:14});

    // 2. Tryckvåg/kick: ren sub plus mild, varm mellanbas.
    this.boomOsc(cfg.f0,cfg.f1,0.52*cfg.dur,cfg.bass,t+0.002,{type:'sine',attack:0.010,hold:0.034});
    this.boomOsc(cfg.f0*1.55,cfg.f1*1.02,0.40*cfg.dur,cfg.bass*0.44,t+0.006,{type:'triangle',attack:0.012,hold:0.028,dist:18,filter:{type:'lowpass',fq:205,q:0.58}});
    this.boomOsc(cfg.f0*2.05,cfg.f1*1.45,0.24*cfg.dur,cfg.bass*0.16,t+0.018,{type:'triangle',attack:0.014,hold:0.016,dist:10,filter:{type:'lowpass',fq:310,q:0.50}});

    // 3. Explosionskropp: tung brun/röd brusmatta, inte kort blöt duns.
    this.boomNoise(0.66*cfg.dur,cfg.body,185,t+0.018,{type:'lowpass',q:0.44,smooth:0.955,brown:true,attack:0.030,hold:0.110,dist:18});
    this.boomNoise(1.02*cfg.dur,cfg.body*0.60,105,t+0.060,{type:'lowpass',q:0.38,smooth:0.982,brown:true,attack:0.085,hold:0.100,dist:12});

    // 4. Eftermuller/eko: ojämna, låga puffar som får explosionen att leva kvar.
    const rolls=Math.max(1,Math.round(1+s*1.6));
    for(let i=0;i<rolls;i++){
      const k=1-i/(rolls+0.5);
      const dt=t+0.22+i*(0.22+RND()*0.08)+RND()*0.06;
      this.boomNoise(0.42+RND()*0.28,0.065*s*k,110+RND()*75,dt,{type:'lowpass',q:0.36,smooth:0.978,brown:true,attack:0.070,hold:0.070,dist:10});
      if(i<2)this.boomOsc(58+RND()*20,28+RND()*10,0.42+RND()*0.24,0.070*s*k,dt+0.026,{type:'triangle',attack:0.040,hold:0.030,dist:7,filter:{type:'lowpass',fq:130,q:0.45}});
    }

    // 5. Splitter/grus, mörkare och lägre i mixen än tidigare.
    for(let i=0;i<cfg.tail;i++){
      const dt=t+0.070+RND()*0.48;
      this.boomNoise(0.060+RND()*0.090,0.006*s*(0.5+RND()*0.7),650+RND()*1700,dt,{type:'bandpass',q:0.50+RND()*0.45,smooth:0.42,attack:0.010,hold:0.010,dist:5});
    }
  },
  sPop(){this.sExplosion('small')},
  sBigBoom(){this.sExplosion('big')},
  sBazookaExplosion(){this.sExplosion('bazooka')},
  sLemmingExplosion(){this.sExplosion('lemming')},
  sBananaExplosion(){this.sExplosion('banana')},
  sSplat(){this.noise(0.12,0.22,900,0.3);this.tone(180,0.1,'sawtooth',0.1,0.4)},
  sDrown(){const t=this.now();for(let i=0;i<4;i++)this.tone(500-i*90,0.1,'sine',0.06,0.8,t+i*0.09)},
  sSizzle(){this.noise(0.3,0.2,4000,0.3);this.tone(900,0.2,'sawtooth',0.05,0.3)},
  sFlamethrower(){
    if(!this.rateFx('flamethrower',0.11))return;
    const t=this.now();
    this.softNoise(0.16,0.070,1500,0.55,t,{type:'bandpass',q:0.65,smooth:0.34,attack:0.006,release:0.090});
    this.softNoise(0.19,0.046,420,0.70,t+0.012,{type:'lowpass',smooth:0.72,attack:0.012,release:0.110});
    if(RND()<0.34)this.tone(190+RND()*55,0.055,'sawtooth',0.018,0.82,t+0.010);
  },
  sTreeIgnite(){
    if(!this.ctx||!this.on||!this.sfxOn)return;
    const t=this.now();
    this.softNoise(0.18,0.12,3200,0.45,t,{type:'highpass',q:0.5,smooth:0.30,attack:0.004,hold:0.025,dist:6});
    this.softNoise(0.42,0.10,850,0.55,t+0.04,{type:'bandpass',q:0.8,smooth:0.42,attack:0.010,hold:0.035,dist:5});
    this.tone(170,0.22,'sawtooth',0.035,0.62,t+0.02);
  },
  sTreeBurn(){
    if(!this.rateFx('treeburn',0.16))return;
    const t=this.now();
    this.softNoise(0.18,0.045,1800,0.55,t,{type:'bandpass',q:1.0,smooth:0.48,attack:0.003,hold:0.010,dist:4});
    if(RND()<0.35)this.tone(720+RND()*180,0.035,'triangle',0.018,0.65,t+0.01);
  },
  sTreeAsh(){
    if(!this.ctx||!this.on||!this.sfxOn)return;
    const t=this.now();
    this.softNoise(0.32,0.070,700,0.48,t,{type:'lowpass',q:0.6,smooth:0.70,attack:0.020,hold:0.030,dist:3});
    this.tone(120,0.20,'triangle',0.028,0.72,t+0.02);
  },
  sSaved(){const t=this.now();this.tone(880,0.08,'square',0.08,1,t);this.tone(1175,0.12,'square',0.08,1,t+0.07)},
  sBrick(){this.sBuildStep(false)},
  sBuildStep(down){
    if(!this.rateFx(down?'downbuild':'build',0.060))return;
    const t=this.now();
    this.tone(down?410:690,0.040,'triangle',0.034,down?0.82:1.05,t);
    this.softNoise(0.055,0.026,2200,0.60,t+0.004,{type:'bandpass',q:0.9,smooth:0.16,attack:0.003,release:0.034});
  },
  sDig(){
    if(!this.rateFx('dig',0.055))return;
    const t=this.now();
    this.softNoise(0.075,0.040,880,0.58,t,{type:'lowpass',smooth:0.58,attack:0.002,release:0.045});
    this.tone(115+RND()*24,0.028,'triangle',0.018,0.78,t+0.002);
  },
  sBash(){
    if(!this.rateFx('bash',0.062))return;
    const t=this.now();
    this.tone(520+RND()*90,0.035,'square',0.026,0.70,t);
    this.softNoise(0.052,0.035,2400,0.52,t+0.004,{type:'bandpass',q:1.0,smooth:0.10,attack:0.002,release:0.030});
  },
  sMine(){
    if(!this.rateFx('mine',0.065))return;
    const t=this.now();
    this.tone(860+RND()*180,0.030,'triangle',0.032,0.74,t);
    this.tone(260+RND()*60,0.045,'square',0.020,0.82,t+0.010);
    this.softNoise(0.050,0.030,3100,0.48,t+0.004,{type:'bandpass',q:1.4,smooth:0.08,attack:0.002,release:0.028});
  },
  sLand(fall){
    if(!this.rateFx('land',0.070))return;
    const t=this.now(), v=clamp((fall||12)/44,0.18,0.90);
    this.softNoise(0.060,0.020+v*0.028,620,0.62,t,{type:'lowpass',smooth:0.64,attack:0.002,release:0.042});
    if(v>0.42)this.tone(145,0.035,'triangle',0.012+v*0.012,0.82,t+0.004);
    if((fall||0)>18)this.sLemOof(fall,t+0.014);
  },
  sLemOof(fall,when){
    if(!this.rateFx('lemoof',0.58))return;
    const t=when||this.now(), v=clamp((fall||20)/54,0.25,1.0);
    this.tone(220+RND()*26,0.085,'triangle',0.026+v*0.012,0.58,t);
    this.tone(128+RND()*16,0.120,'sine',0.020+v*0.010,0.70,t+0.030);
    this.softNoise(0.060,0.010+v*0.010,780,0.58,t+0.014,{type:'bandpass',q:0.62,smooth:0.58,attack:0.006,release:0.044});
  },
  sLemHehe(kind){
    if(!this.ctx||!this.on||!this.sfxOn)return;
    const chance=kind==='flame'?0.46:0.38;
    if(RND()>chance||!this.rateFx('lemhehe',2.15))return;
    const t=this.now()+0.065, base=(kind==='flame'?540:500)+RND()*70;
    this.tone(base,0.052,'triangle',0.026,1.16,t);
    this.tone(base*1.28,0.050,'triangle',0.024,0.92,t+0.070);
    this.tone(base*1.05,0.055,'square',0.012,1.08,t+0.128);
  },
  sLemChatter(big){
    if(!this.rateFx('lemchatter',5.8))return;
    const t=this.now(), base=(big?350:455)+RND()*115;
    this.tone(base,0.050,'triangle',0.020,1.12,t);
    this.tone(base*1.24,0.045,'triangle',0.018,0.96,t+0.060);
    this.tone(base*(big?0.88:1.38),0.048,'triangle',0.017,big?0.88:1.04,t+0.175);
    if(RND()<0.45)this.tone(base*(big?1.10:0.92),0.040,'square',0.010,1.08,t+0.235);
  },
  sLemShiver(big){
    if(!this.rateFx('lemshiver',0.75))return;
    const t=this.now()+0.015, base=big?260:360;
    for(let i=0;i<5;i++){
      const tt=t+i*0.055, f=base+(i%2?42:-18)+RND()*18;
      this.tone(f,0.036,'triangle',0.017,1.06,tt);
      this.tone(f*1.48,0.026,'square',0.006,0.94,tt+0.010);
    }
    this.softNoise(0.28,0.010,big?900:1300,0.72,t,{type:'bandpass',q:1.1,smooth:0.32,attack:0.012,release:0.16});
  },
  sLemWarmSigh(big){
    if(!this.rateFx('lemwarmsigh',0.75))return;
    const t=this.now()+0.020, base=big?260:345;
    this.tone(base,0.18,'sine',0.025,0.72,t);
    this.tone(base*0.72,0.24,'triangle',0.019,0.84,t+0.055);
    this.softNoise(0.32,0.012,520,0.58,t+0.035,{type:'lowpass',smooth:0.72,attack:0.045,release:0.20});
  },
  sClimbStep(){
    if(!this.rateFx('climbstep',0.120))return;
    const t=this.now();
    this.softNoise(0.040,0.018,1300,0.70,t,{type:'bandpass',q:0.75,smooth:0.22,attack:0.003,release:0.028});
  },
  sRopeStep(){
    if(!this.rateFx('ropestep',0.115))return;
    const t=this.now();
    this.tone(310+RND()*50,0.030,'triangle',0.018,0.92,t);
    this.softNoise(0.045,0.015,950,0.82,t+0.002,{type:'bandpass',q:0.65,smooth:0.32,attack:0.004,release:0.030});
  },
  sHop(){
    if(!this.rateFx('hop',0.110))return;
    const t=this.now();
    this.tone(430,0.090,'triangle',0.045,1.42,t);
    this.softNoise(0.050,0.018,1200,0.75,t+0.010,{type:'bandpass',q:0.7,smooth:0.20,attack:0.004,release:0.035});
  },
  sShrug(){this.tone(330,0.12,'square',0.06,0.7)},
  sBazooka(){
    // Avfyrning/rekyl: kort dov thump + raket-whoosh. Själva träffen
    // spelas separat via sBazookaExplosion().
    const t=this.now();
    this.softNoise(0.12,0.080,700,2.6,t,{type:'lowpass',smooth:0.34,attack:0.008,release:0.070});
    this.softNoise(0.30,0.052,1800,2.2,t+0.035,{type:'bandpass',q:0.55,smooth:0.26,attack:0.025,release:0.16});
    this.tone(120,0.18,'sawtooth',0.050,1.65,t+0.01);
  },
  sMissileLaunch(){
    const t=this.now();
    this.softNoise(0.10,0.060,900,1.85,t,{type:'lowpass',smooth:0.42,attack:0.004,release:0.060});
    this.softNoise(0.34,0.042,2600,2.1,t+0.018,{type:'bandpass',q:0.72,smooth:0.18,attack:0.010,release:0.18});
    this.tone(180,0.10,'sawtooth',0.040,1.42,t+0.006);
    this.tone(360,0.055,'triangle',0.026,1.18,t+0.055);
  },
  sJet(){
    const t=this.now();
    this.softNoise(0.30,0.090,520,3.4,t,{type:'lowpass',smooth:0.48,attack:0.006,release:0.15});
    this.tone(120,0.16,'sawtooth',0.035,1.7,t+0.015);
  },
  sJetFly(){
    if(!this.rateFx('jetfly',0.135))return;
    const t=this.now();
    this.softNoise(0.18,0.044,640,1.45,t,{type:'lowpass',smooth:0.54,attack:0.018,release:0.090});
    this.softNoise(0.11,0.018,2100,0.78,t+0.010,{type:'bandpass',q:0.5,smooth:0.22,attack:0.010,release:0.060});
  },
  sPlane(){
    if(!this.rateFx('supplyplane',0.220))return;
    const t=this.now();
    this.softNoise(0.36,0.028,460,0.88,t,{type:'lowpass',smooth:0.82,attack:0.050,release:0.20});
    this.softNoise(0.18,0.012,1150,0.72,t+0.015,{type:'bandpass',q:0.55,smooth:0.38,attack:0.020,release:0.10});
    this.tone(92,0.22,'triangle',0.016,0.96,t+0.020);
  },
  sRopeLaunch(){const t=this.now();this.tone(420,0.08,'triangle',0.06,1.45,t);this.softNoise(0.16,0.05,1800,1.8,t+0.02,{type:'bandpass',q:0.7,smooth:0.18,attack:0.006,release:0.08})},
  sRopeAttach(){const t=this.now();this.tone(220,0.06,'square',0.07,0.75,t);this.tone(660,0.08,'triangle',0.055,1.0,t+0.045);this.softNoise(0.08,0.045,2500,0.45,t+0.02,{type:'highpass',smooth:0.12,attack:0.002,release:0.04})},
  sMonkey(){const t=this.now();this.tone(740,0.07,'square',0.05,1.08,t);this.tone(590,0.08,'square',0.05,0.92,t+0.06)},
  sTroll(){
    if(!this.rateFx('trollgrowl',0.85))return;
    const t=this.now();
    this.tone(142,0.16,'sawtooth',0.060,0.76,t);
    this.tone(76,0.24,'triangle',0.052,0.72,t+0.030);
    this.softNoise(0.20,0.038,540,0.58,t+0.018,{type:'lowpass',smooth:0.68,attack:0.010,release:0.110});
  },
  sTrollStep(){
    if(!this.rateFx('trollstep',0.34))return;
    const t=this.now();
    this.tone(72,0.060,'triangle',0.038,0.66,t);
    this.softNoise(0.085,0.028,330,0.52,t+0.006,{type:'lowpass',smooth:0.74,attack:0.004,release:0.050});
    if(RND()<0.22)this.tone(118+RND()*35,0.045,'sawtooth',0.017,0.80,t+0.035);
  },
  sTrollSmash(){
    if(!this.rateFx('trollsmash',0.16))return;
    const t=this.now();
    this.tone(78,0.075,'triangle',0.050,0.62,t);
    this.softNoise(0.095,0.055,420,0.48,t+0.006,{type:'lowpass',smooth:0.70,attack:0.003,release:0.060});
    this.softNoise(0.055,0.035,1800,0.62,t+0.014,{type:'bandpass',q:0.9,smooth:0.18,attack:0.002,release:0.035});
  },
  sTrollMunch(){
    if(!this.rateFx('trollmunch',0.13))return;
    const t=this.now();
    this.softNoise(0.070,0.040,920,0.42,t,{type:'bandpass',q:0.85,smooth:0.34,attack:0.002,release:0.043});
    this.softNoise(0.095,0.025,270,0.55,t+0.018,{type:'lowpass',smooth:0.70,attack:0.004,release:0.056});
    this.tone(180+RND()*40,0.038,'square',0.018,0.62,t+0.006);
  },
  sTrollBurp(){
    if(!this.rateFx('trollburp',1.45))return;
    const t=this.now();
    this.tone(120,0.18,'sawtooth',0.035,0.62,t);
    this.softNoise(0.14,0.022,470,0.50,t+0.018,{type:'lowpass',smooth:0.72,attack:0.012,release:0.090});
  },
  sTrollUgh(){
    if(!this.rateFx('trollugh',1.90))return;
    const t=this.now();
    this.tone(155,0.18,'sawtooth',0.042,0.72,t);
    this.tone(86,0.24,'triangle',0.036,0.68,t+0.035);
    this.softNoise(0.22,0.020,360,0.58,t+0.020,{type:'lowpass',smooth:0.82,attack:0.020,release:0.13});
  },
  sBanana(){this.sBananaExplosion()},
  sDolphin(){const t=this.now();this.tone(820,0.10,'sine',0.08,1.35,t);this.tone(1180,0.12,'triangle',0.07,1.18,t+0.08);this.noise(0.16,0.10,1800,0.35)},
  sMegaBoom(){
    const t=this.now();
    this.noise(2.1,0.36,1800,0.05,t);
    this.noise(5.8,0.24,520,0.06,t+0.18);
    this.tone(55,4.8,'sine',0.30,0.35,t);
    this.tone(32,6.0,'sine',0.24,0.55,t+0.12);
    for(let i=0;i<12;i++){
      const tt=t+i*0.42;
      this.tone(90+RND()*70,0.16,'sawtooth',0.10,0.55,tt);
      this.noise(0.22,0.16,1400+RND()*1200,0.18,tt+0.03);
    }
  },
  sGrow(){const t=this.now();this.tone(330,0.08,'triangle',0.05,1.22,t);this.tone(494,0.11,'triangle',0.05,1.15,t+0.07);this.noise(0.12,0.07,900,0.55)},
  sLamp(){const t=this.now();this.tone(1047,0.07,'triangle',0.1,1,t);this.tone(1568,0.12,'triangle',0.1,1,t+0.06)},
  sDie(){this.tone(440,0.25,'square',0.08,0.45)},
  sTick(){this.tone(1200,0.03,'square',0.05)},
  sWarn(){const t=this.now();this.tone(520,0.08,'square',0.07,0.9,t);this.tone(780,0.08,'square',0.06,0.9,t+0.09)},
  sBirdChirp(){
    const t=this.now(), b=760+Math.random()*460;
    // Luftigare och lite lägre volym så fåglarna ligger bakom musiken/SFX.
    this.tone(b,0.06,'sine',0.030,1.18,t);
    this.tone(b*1.28,0.055,'sine',0.024,1.08,t+0.075);
    if(Math.random()<0.35)this.tone(b*1.62,0.045,'triangle',0.018,0.96,t+0.17);
  },
  sRainLoop(){
    const t=this.now();
    // Lång överlappande drizzle-matta i stället för korta hårda brus-burstar.
    this.softNoise(1.35,0.0126,2100,0.96,t,{type:'bandpass',q:0.55,smooth:0.36,attack:0.28,release:0.45});
    this.softNoise(1.10,0.00585,4800,0.90,t+0.04,{type:'highpass',smooth:0.22,attack:0.22,release:0.38});
    // Enstaka droppar, men lågt och sällan så regnet inte låter som sprak/knaster.
    if(Math.random()<0.22){
      const dt=t+0.08+Math.random()*0.45;
      this.softNoise(0.075,0.009,5400,0.62,dt,{type:'bandpass',q:1.2,smooth:0.08,attack:0.012,release:0.055});
    }
  },
  sCaveDrip(x){
    if(!this.rateFx('cavedrip'+(((x||0)/90)|0),0.18))return;
    const t=this.now(), bright=0.75+Math.random()*0.5;
    this.tone(720+Math.random()*260,0.055,'sine',0.018,1.18,t);
    this.softNoise(0.10,0.010*bright,3600,0.62,t+0.018,{type:'bandpass',q:1.6,smooth:0.08,attack:0.006,release:0.060});
    if(Math.random()<0.42)this.tone(260+Math.random()*90,0.16,'triangle',0.010,0.82,t+0.035);
  },
  sWaterfallCaveStep(depth){
    if(!this.rateFx('waterfallcavestep',0.095))return;
    const d=clamp(Number.isFinite(depth)?depth:0.45,0,1), t=this.now();
    this.softNoise(0.075,0.052+d*0.020,560-d*120,0.58,t,{type:'lowpass',smooth:0.74,attack:0.002,release:0.052});
    this.softNoise(0.052,0.024+d*0.010,1550,0.62,t+0.008,{type:'bandpass',q:0.85,smooth:0.28,attack:0.002,release:0.034});
    this.tone(128+d*34,0.035,'triangle',0.016+d*0.008,0.72,t+0.004);
    if(d>0.36)this.softNoise(0.055,0.018+d*0.008,2600,0.72,t+0.018,{type:'bandpass',q:1.0,smooth:0.18,attack:0.004,release:0.036});
  },
  sSnowWind(){
    const t=this.now();
    // Mjuk vind: lågpassat, lång fade och svag ton som blåser förbi.
    this.softNoise(1.65,0.012,620,1.02,t,{type:'lowpass',smooth:0.78,attack:0.36,release:0.55});
    if(Math.random()<0.24)this.tone(135+Math.random()*34,0.70,'sine',0.012,0.90,t+0.16);
  },
  sThunder(strong,delay){
    // V39: mer riktig åska. Åska ska inte låta som en kort explosion, utan som
    // en dämpad tryckfront följd av långt, lågt muller. Därför är transienten
    // mycket svagare/högre delen kortare, medan huvuddelen ligger under ca
    // 180 Hz med brun/röd brusmatta och långsamma bas-svep.
    if(!this.ctx||!this.on||!this.sfxOn)return;
    const t=this.now()+(delay==null?0.36:Math.max(0,delay));
    const s=strong?1.0:0.74;

    // Liten avlägsen knäpp från blixten, inte en hård explosionstransient.
    this.boomNoise(0.020,0.050*s,3600,t,{type:'highpass',q:0.45,smooth:0.10,attack:0.001,hold:0.002,dist:16});

    // Första tryckfronten: låg, dov och filtrerad. Den ger tyngd utan vass smäll.
    this.boomOsc(52,28,2.20,0.210*s,t+0.050,{type:'sine',attack:0.030,hold:0.075,dist:8,filter:{type:'lowpass',fq:105,q:0.55}});
    this.boomOsc(37,24,2.85,0.150*s,t+0.100,{type:'triangle',attack:0.060,hold:0.050,dist:6,filter:{type:'lowpass',fq:82,q:0.50}});

    // Huvudmuller: lång, mörk, lågpassad brun brusmatta.
    this.boomNoise(3.60,0.185*s,118,t+0.120,{type:'lowpass',q:0.48,smooth:0.985,brown:true,attack:0.110,hold:0.190,dist:10});
    this.boomNoise(2.60,0.082*s,245,t+0.300,{type:'lowpass',q:0.42,smooth:0.975,brown:true,attack:0.180,hold:0.100,dist:8});

    // Rullande ekon: flera lågfrekventa puffar som avtar och kommer oregelbundet.
    const rolls=strong?6:4;
    for(let i=0;i<rolls;i++){
      const k=Math.pow(1-i/(rolls+0.85),1.35);
      const dt=t+0.58+i*(0.43+RND()*0.18)+RND()*0.14;
      this.boomNoise(0.72+RND()*0.56,0.090*s*k,85+RND()*85,dt,{type:'lowpass',q:0.45,smooth:0.988,brown:true,attack:0.070,hold:0.080,dist:9});
      this.boomOsc(44+RND()*13,24+RND()*9,0.74+RND()*0.42,0.050*s*k,dt+0.020,{type:'sine',attack:0.045,hold:0.030,dist:5,filter:{type:'lowpass',fq:92,q:0.50}});
    }

    // Svag fjärr-sus-tail, så mullret inte bara stannar tvärt.
    this.boomNoise(2.70,0.040*s,180,t+1.25,{type:'lowpass',q:0.35,smooth:0.992,brown:true,attack:0.220,hold:0.100,dist:5});
  },
  jingle(win){
    const t=this.now();
    const seq=win?[523,659,784,1047,784,1047]:[392,370,349,330,294,262];
    seq.forEach((f,i)=>this.tone(f,0.16,'square',0.09,1,t+i*0.13));
  },
  // --- musik (egenkomponerade slingor) ---
  mus:{timer:null,step:0,next:0,kind:'day'},
  // melodi/bas i MIDI-nummer, 0 = paus. Åttondelar.
  PAT:{
    menu:{bpm:112,
      mel:[72,0,74,76, 79,0,76,74, 72,0,74,76, 81,0,79,0,
           76,0,79,81, 83,81,79,76, 74,0,76,79, 76,0,72,0,
           72,0,74,76, 79,0,81,79, 76,0,74,72, 74,0,76,0,
           79,0,81,83, 84,83,81,79, 76,0,79,76, 74,0,72,0,
           69,0,72,74, 76,0,74,72, 71,0,74,76, 79,0,76,0,
           72,0,76,79, 81,0,79,76, 74,0,76,79, 83,0,81,0,
           76,0,79,81, 84,0,81,79, 77,0,81,84, 86,0,84,0,
           79,0,83,86, 88,86,84,81, 79,0,76,74, 72,0,0,0],
      bass:[48,0,55,0, 48,0,55,0, 41,0,48,0, 43,0,50,0,
            45,0,52,0, 48,0,55,0, 41,0,48,0, 43,0,50,0,
            48,0,55,0, 48,0,55,0, 45,0,52,0, 43,0,50,0,
            41,0,48,0, 48,0,55,0, 43,0,50,0, 48,0,55,0,
            45,0,52,0, 41,0,48,0, 43,0,50,0, 43,0,50,0,
            48,0,55,0, 45,0,52,0, 41,0,48,0, 43,0,50,0,
            41,0,48,0, 48,0,55,0, 38,0,45,0, 43,0,50,0,
            48,0,55,0, 41,0,48,0, 43,0,50,0, 48,0,55,0],
      harm:[0,0,84,0, 0,0,84,0, 0,0,81,0, 0,0,83,0,
            0,0,81,0, 0,0,84,0, 0,0,81,0, 0,0,83,0,
            0,0,84,0, 0,0,84,0, 0,0,81,0, 0,0,83,0,
            0,0,81,0, 0,0,84,0, 0,0,83,0, 0,0,84,0,
            0,0,81,0, 0,0,81,0, 0,0,83,0, 0,0,83,0,
            0,0,84,0, 0,0,81,0, 0,0,81,0, 0,0,83,0,
            0,0,81,0, 0,0,84,0, 0,0,77,0, 0,0,83,0,
            0,0,84,0, 0,0,81,0, 0,0,83,0, 0,0,84,0]},
    day:{bpm:138,
      mel:[72,0,76,79, 76,72,76,0, 74,0,77,81, 77,74,77,0,
           76,0,79,84, 83,79,76,0, 74,77,76,74, 72,0,0,0,
           69,0,72,76, 72,69,72,0, 71,0,74,77, 74,71,74,0,
           72,76,79,76, 81,79,77,76, 74,71,67,71, 72,0,0,0],
      bass:[48,0,55,0, 48,0,55,0, 50,0,57,0, 50,0,57,0,
            48,0,55,0, 52,0,55,0, 50,0,55,0, 48,0,55,0,
            45,0,52,0, 45,0,52,0, 43,0,50,0, 43,0,50,0,
            48,0,55,0, 53,0,55,0, 50,0,43,0, 48,0,48,0]},
    day2:{bpm:146,
      mel:[76,0,79,81, 84,0,81,79, 76,79,84,86, 88,86,84,0,
           77,0,81,84, 86,84,81,77, 79,83,86,88, 91,0,88,86,
           84,81,79,0, 76,79,81,84, 83,81,79,76, 74,77,79,81,
           72,76,79,81, 84,86,84,81, 79,0,77,74, 76,0,0,0,
           79,0,83,86, 88,86,83,79, 81,84,88,91, 93,91,88,0,
           86,84,81,79, 77,0,79,81, 84,88,91,88, 86,84,81,0,
           72,0,76,79, 81,79,76,72, 74,77,81,84, 86,84,81,77,
           76,79,83,86, 88,0,86,83, 81,79,77,74, 76,0,0,0],
      bass:[48,0,55,0, 52,0,59,0, 53,0,60,0, 55,0,62,0,
            50,0,57,0, 53,0,60,0, 55,0,62,0, 59,0,62,0,
            48,0,55,0, 52,0,59,0, 53,0,60,0, 55,0,62,0,
            45,0,52,0, 48,0,55,0, 50,0,57,0, 48,0,48,0,
            52,0,59,0, 55,0,62,0, 57,0,64,0, 60,0,64,0,
            53,0,60,0, 50,0,57,0, 52,0,59,0, 55,0,59,0,
            45,0,52,0, 48,0,55,0, 50,0,57,0, 53,0,57,0,
            48,0,55,0, 52,0,59,0, 53,0,50,0, 48,0,48,0],
      harm:[0,0,0,0, 72,0,76,0, 0,0,76,0, 79,0,0,0,
            0,0,0,0, 74,0,77,0, 0,0,79,0, 83,0,0,0,
            0,0,72,0, 76,0,0,0, 0,0,74,0, 77,0,0,0,
            69,0,72,0, 76,0,0,0, 0,0,71,0, 72,0,0,0,
            0,0,76,0, 79,0,0,0, 0,0,81,0, 84,0,0,0,
            0,0,77,0, 81,0,0,0, 0,0,79,0, 83,0,0,0,
            0,0,69,0, 72,0,0,0, 0,0,71,0, 74,0,0,0,
            72,0,76,0, 79,0,0,0, 76,0,74,0, 72,0,0,0]},
    night:{bpm:92,
      mel:[69,0,0,72, 0,0,76,0, 74,0,0,71, 0,0,68,0,
           69,0,0,72, 0,0,77,0, 76,0,74,0, 71,0,0,0,
           64,0,0,69, 0,0,72,0, 71,0,0,67, 0,0,64,0,
           65,0,0,69, 0,0,74,0, 72,0,71,0, 69,0,0,0],
      bass:[45,0,0,0, 52,0,0,0, 43,0,0,0, 50,0,0,0,
            45,0,0,0, 53,0,0,0, 52,0,0,0, 40,0,0,0,
            41,0,0,0, 48,0,0,0, 43,0,0,0, 47,0,0,0,
            41,0,0,0, 50,0,0,0, 52,0,0,0, 45,0,0,0]},
    cave:{bpm:76,
      mel:[57,0,0,0, 60,0,0,0, 62,0,0,0, 55,0,0,0,
           57,0,0,0, 64,0,0,0, 62,0,60,0, 55,0,0,0,
           52,0,0,0, 57,0,0,0, 59,0,0,0, 50,0,0,0,
           53,0,0,0, 57,0,0,0, 62,0,60,0, 57,0,0,0],
      bass:[33,0,0,0, 0,0,40,0, 35,0,0,0, 0,0,42,0,
            33,0,0,0, 0,0,45,0, 40,0,0,0, 0,0,35,0,
            29,0,0,0, 0,0,36,0, 31,0,0,0, 0,0,38,0,
            29,0,0,0, 0,0,40,0, 33,0,0,0, 0,0,33,0],
      harm:[0,0,69,0, 0,0,72,0, 0,0,67,0, 0,0,64,0,
            0,0,69,0, 0,0,76,0, 0,0,74,0, 0,0,67,0,
            0,0,64,0, 0,0,69,0, 0,0,71,0, 0,0,62,0,
            0,0,65,0, 0,0,69,0, 0,0,72,0, 0,0,69,0]},
    desert:{bpm:112,
      mel:[64,0,65,68, 69,68,65,64, 62,0,64,65, 68,65,64,0,
           69,0,72,73, 76,73,72,69, 68,0,69,72, 73,72,69,0,
           64,65,68,69, 72,69,68,65, 64,62,60,62, 64,0,0,0,
           68,69,72,73, 76,73,72,69, 68,65,64,62, 64,0,0,0],
      bass:[40,0,0,47, 40,0,47,0, 38,0,0,45, 38,0,45,0,
            45,0,0,52, 45,0,52,0, 44,0,0,51, 44,0,51,0,
            40,0,47,0, 45,0,52,0, 38,0,45,0, 40,0,40,0,
            44,0,51,0, 45,0,52,0, 38,0,45,0, 40,0,40,0],
      harm:[0,0,76,0, 77,0,76,0, 0,0,72,0, 73,0,72,0,
            0,0,81,0, 84,0,81,0, 0,0,80,0, 81,0,80,0,
            76,0,77,0, 81,0,77,0, 72,0,73,0, 76,0,0,0,
            80,0,81,0, 84,0,81,0, 77,0,76,0, 76,0,0,0]},
    lava:{bpm:84,
      mel:[52,0,55,0, 59,0,57,55, 52,0,55,0, 60,59,55,0,
           50,0,54,0, 57,0,55,54, 48,0,52,0, 55,54,52,0,
           52,0,55,0, 59,0,62,60, 59,0,57,0, 55,54,52,0,
           47,0,50,0, 54,0,57,54, 52,0,50,0, 48,0,52,0],
      bass:[28,0,0,0, 35,0,0,0, 28,0,0,0, 36,0,0,0,
            26,0,0,0, 33,0,0,0, 24,0,0,0, 31,0,0,0,
            28,0,0,0, 35,0,0,0, 23,0,0,0, 30,0,0,0,
            24,0,0,0, 31,0,0,0, 26,0,0,0, 28,0,28,0],
      harm:[0,0,64,0, 0,0,67,0, 0,0,64,0, 0,0,67,0,
            0,0,62,0, 0,0,66,0, 0,0,60,0, 0,0,64,0,
            0,0,64,0, 0,0,67,0, 0,0,59,0, 0,0,62,0,
            0,0,60,0, 0,0,64,0, 0,0,62,0, 0,0,64,0]},
    caveMystery:{bpm:58,
      mel:[52,0,0,0, 55,0,0,0, 59,0,57,0, 55,0,0,0,
           52,0,0,0, 60,0,59,0, 55,0,0,0, 52,0,0,0,
           50,0,0,0, 54,0,0,0, 57,0,55,0, 54,0,0,0,
           48,0,0,0, 52,0,55,0, 54,0,52,0, 47,0,0,0],
      bass:[28,0,0,0, 0,0,35,0, 28,0,0,0, 0,0,36,0,
            28,0,0,0, 0,0,35,0, 24,0,0,0, 0,0,31,0,
            26,0,0,0, 0,0,33,0, 24,0,0,0, 0,0,31,0,
            23,0,0,0, 0,0,30,0, 24,0,0,0, 28,0,0,0],
      harm:[0,0,64,0, 0,0,67,0, 0,0,64,0, 0,0,67,0,
            0,0,64,0, 0,0,67,0, 0,0,60,0, 0,0,64,0,
            0,0,62,0, 0,0,66,0, 0,0,60,0, 0,0,64,0,
            0,0,59,0, 0,0,62,0, 0,0,60,0, 0,0,64,0]},
    city:{bpm:128,
      mel:[72,0,76,79, 81,79,76,0, 71,0,74,76, 79,76,74,0,
           69,0,72,76, 77,76,72,0, 68,0,71,74, 76,74,71,0,
           72,76,79,0, 84,0,83,81, 79,76,72,0, 76,79,81,0,
           74,0,77,81, 82,81,77,74, 76,0,74,71, 68,0,0,0,
           79,0,81,84, 86,84,81,79, 77,0,79,83, 84,83,79,77,
           76,0,79,81, 84,81,79,76, 74,0,76,77, 81,77,76,74,
           72,74,77,0, 81,0,79,77, 76,74,71,0, 68,71,74,0,
           72,0,76,79, 84,83,81,79, 76,0,74,72, 71,0,68,0],
      bass:[45,0,52,0, 45,0,52,0, 43,0,50,0, 43,0,50,0,
            41,0,48,0, 41,0,48,0, 40,0,47,0, 40,0,47,0,
            45,0,52,0, 45,0,52,0, 36,0,43,0, 36,0,43,0,
            38,0,45,0, 38,0,45,0, 40,0,47,0, 40,0,40,0,
            36,0,43,0, 36,0,43,0, 43,0,50,0, 43,0,50,0,
            45,0,52,0, 45,0,52,0, 41,0,48,0, 41,0,48,0,
            38,0,45,0, 38,0,45,0, 40,0,47,0, 40,0,47,0,
            45,0,52,0, 45,0,52,0, 40,0,47,0, 40,0,40,0],
      harm:[0,0,84,0, 88,0,84,0, 0,0,83,0, 86,0,83,0,
            0,0,81,0, 84,0,81,0, 0,0,80,0, 83,0,80,0,
            84,0,88,0, 91,0,88,0, 0,0,84,0, 88,0,91,0,
            0,0,86,0, 89,0,86,0, 0,0,83,0, 80,0,0,0,
            88,0,91,0, 93,0,91,0, 86,0,83,0, 79,0,83,0,
            84,0,88,0, 91,0,88,0, 81,0,84,0, 89,0,84,0,
            0,0,86,0, 89,0,93,0, 83,0,80,0, 76,0,80,0,
            84,0,88,0, 91,0,88,0, 83,0,80,0, 76,0,0,0]}
  },
  midi(n){return 440*Math.pow(2,(n-69)/12)},
  retroLeadLayer(kind,m,i,t,stepDur,leadLen){
    if(!m)return;
    if(kind==='lava'){
      this.tone(this.midi(m+12),leadLen*0.82,'square',0.030,0.99,t+stepDur*0.03,this.musGain);
    }else if(kind==='day'){
      if(i%8===0)this.tone(this.midi(m+12),stepDur*0.28,'square',0.015,1,t+stepDur*0.03,this.musGain);
      if(i%16===12)this.tone(this.midi(m+7),stepDur*0.22,'square',0.011,1,t+stepDur*0.16,this.musGain);
    }else if(kind==='day2'){
      if(i%8===0)this.tone(this.midi(m+12),stepDur*0.34,'square',0.017,1,t+stepDur*0.03,this.musGain);
      if(i%16===14)this.tone(this.midi(m+7),stepDur*0.26,'square',0.014,1,t+stepDur*0.20,this.musGain);
    }else if(kind==='night'){
      if(i%8===3||i%16===8)this.tone(this.midi(m),stepDur*0.36,'square',0.016,1,t+stepDur*0.02,this.musGain);
    }else if(kind==='menu'){
      const p=i%128;
      if(p%16===0||p%32===12)this.tone(this.midi(m+12),stepDur*0.24,'square',0.012,1,t+stepDur*0.03,this.musGain);
      if(p%16===10)this.tone(this.midi(m+7),stepDur*0.18,'square',0.008,1,t+stepDur*0.18,this.musGain);
      if(p>=96&&p%8===4)this.tone(this.midi(m+12),stepDur*0.22,'triangle',0.010,1,t+stepDur*0.12,this.musGain);
    }else if(kind==='cave'){
      if(i%16===4||i%16===12)this.tone(this.midi(m+12),stepDur*0.46,'square',0.010,0.99,t+stepDur*0.05,this.musGain);
    }else if(kind==='caveMystery'){
      if(i%16===8)this.tone(this.midi(m+12),stepDur*0.82,'sine',0.008,0.995,t+stepDur*0.12,this.musGain);
      if(i%32===24)this.tone(this.midi(m+7),stepDur*0.62,'triangle',0.006,0.99,t+stepDur*0.22,this.musGain);
    }else if(kind==='desert'){
      if(i%8===0||i%8===4)this.tone(this.midi(m+12),stepDur*0.30,'square',0.015,1,t+stepDur*0.03,this.musGain);
    }else if(kind==='city'){
      const bar=i%32;
      if(bar===0||bar===8||bar===16||bar===24)this.tone(this.midi(m+12),stepDur*0.24,'square',0.013,1,t+stepDur*0.02,this.musGain);
      if(bar===6||bar===14||bar===22)this.tone(this.midi(m+7),stepDur*0.20,'square',0.010,1,t+stepDur*0.18,this.musGain);
      if(bar===30)this.tone(this.midi(m+12),stepDur*0.28,'triangle',0.014,0.99,t+stepDur*0.20,this.musGain);
    }
  },
  retroBassLayer(kind,b,i,t,stepDur){
    if(!b)return;
    if(kind==='lava'){
      this.tone(this.midi(b+12),stepDur*2.20,'square',0.058,0.98,t+stepDur*0.01,this.musGain);
      if(i%8===0)this.tone(this.midi(b+24),stepDur*1.35,'triangle',0.032,0.98,t+stepDur*0.04,this.musGain);
      return;
    }
    let third=4,pulseVol=0.020,arpVol=0.018,pulseEvery=4,arpEvery=8,padVol=0,padEvery=16;
    let subVol=0,subEvery=8,subLen=3.2;
    if(kind==='day'){
      pulseVol=0.026;arpVol=0.024;subVol=0.035;
    }else if(kind==='day2'){
      pulseVol=0.031;arpVol=0.029;subVol=0.041;subLen=3.0;
    }else if(kind==='night'){
      third=3;pulseVol=0.046;arpVol=0.024;pulseEvery=4;arpEvery=16;padVol=0.016;subVol=0.046;subEvery=8;subLen=5.2;
    }else if(kind==='menu'){
      const p=i%128;
      const root=((b%12)+12)%12;
      if(root===9||root===4||root===2)third=3;
      pulseVol=p>=96?0.022:(p>=64?0.015:0.019);
      arpVol=p>=96?0.017:(p>=64?0.010:0.014);
      pulseEvery=p>=64&&p<96?8:4;
      arpEvery=p>=96?4:8;
      padVol=p>=64&&p<96?0.007:0.003;
      subVol=p>=96?0.038:0.032;
      subEvery=8;
      subLen=p>=64&&p<96?3.4:2.2;
    }else if(kind==='cave'){
      third=3;pulseVol=0.027;arpVol=0.017;pulseEvery=4;arpEvery=16;padVol=0.012;padEvery=32;
    }else if(kind==='caveMystery'){
      third=3;pulseVol=0.012;arpVol=0.007;pulseEvery=8;arpEvery=32;padVol=0.015;padEvery=16;subVol=0.030;subEvery=16;subLen=7.0;
    }else if(kind==='desert'){
      pulseVol=0.024;arpVol=0.022;padVol=0.008;
    }else if(kind==='city'){
      third=3;pulseVol=0.027;arpVol=0.021;pulseEvery=4;arpEvery=16;padVol=0.005;
    }
    if(subVol&&i%subEvery===0){
      this.padTone(this.midi(b-12),stepDur*subLen,'sine',subVol,t+stepDur*0.01,this.musGain);
      this.tone(this.midi(b),stepDur*0.40,'triangle',subVol*(kind==='night'?0.72:0.62),0.995,t+stepDur*0.03,this.musGain);
      if(kind==='night')this.tone(this.midi(b+12),stepDur*0.34,'square',subVol*0.34,0.99,t+stepDur*0.06,this.musGain);
    }
    if(kind==='night'){
      const strong=i%8===0?1.0:0.82;
      this.padTone(this.midi(b),stepDur*2.55,'triangle',0.050*strong,t+stepDur*0.002,this.musGain);
      this.padTone(this.midi(b),stepDur*2.35,'sawtooth',0.032*strong,t+stepDur*0.020,this.musGain);
      this.tone(this.midi(b+12),stepDur*0.74,'square',0.044*strong,0.985,t+stepDur*0.030,this.musGain);
      if(i%8===4)this.tone(this.midi(b+7),stepDur*0.46,'square',0.034,0.99,t+stepDur*0.12,this.musGain);
    }
    if(i%pulseEvery===0)this.tone(this.midi(b+12),stepDur*0.62,'square',pulseVol,0.98,t+stepDur*0.01,this.musGain);
    if(kind==='city'&&i%8===4)this.tone(this.midi(b+19),stepDur*0.25,'square',pulseVol*0.55,1,t+stepDur*0.05,this.musGain);
    if(i%arpEvery===0){
      const dur=stepDur*(kind==='city'?0.24:(kind==='menu'?0.22:0.32));
      const swing=kind==='day2'?0.03:(kind==='menu'&&i%128>=96?0.02:0);
      this.tone(this.midi(b+24),dur,'square',arpVol,1,t+stepDur*(0.04+swing),this.musGain);
      if(kind==='city'){
        this.tone(this.midi(b+31),dur,'square',arpVol*0.82,1,t+stepDur*0.22,this.musGain);
        this.tone(this.midi(b+36),dur,'square',arpVol*0.68,1,t+stepDur*0.40,this.musGain);
      }else{
        this.tone(this.midi(b+24+third),dur,'square',arpVol*0.82,1,t+stepDur*(0.22+swing),this.musGain);
        this.tone(this.midi(b+31),dur,'square',arpVol*0.74,1,t+stepDur*(0.40+swing),this.musGain);
      }
    }
    if((kind==='day'||kind==='day2')&&i%16===8){
      this.tone(this.midi(b+36),stepDur*0.18,'square',arpVol*0.75,1,t+stepDur*0.10,this.musGain);
      this.tone(this.midi(b+31),stepDur*0.18,'square',arpVol*0.58,1,t+stepDur*0.28,this.musGain);
    }
    if(padVol&&i%padEvery===0){
      this.padTone(this.midi(b+12),stepDur*(kind==='cave'||kind==='caveMystery'?7.5:5.5),'triangle',padVol,t+stepDur*0.02,this.musGain);
      if(kind==='night')this.padTone(this.midi(b+19),stepDur*4.8,'sine',padVol*0.55,t+stepDur*0.10,this.musGain);
      if(kind==='cave')this.padTone(this.midi(b+19),stepDur*4.8,'sine',padVol*0.48,t+stepDur*0.12,this.musGain);
      if(kind==='caveMystery')this.padTone(this.midi(b+19),stepDur*6.2,'sine',padVol*0.42,t+stepDur*0.18,this.musGain);
    }
  },
  startWeather(kind){
    this.stopWeather();
    kind=kind||'sun';
    this.weather.kind=kind;this.weather.step=0;
    if(!this.ctx||!this.on||!this.sfxOn)return;
    const t=this.now();
    if(kind==='rain'){
      this.startRainAmbient();
      // Bara diskreta droppar ligger i timer; själva regnljudet är konstant loop.
      this.weather.next=t+2.2+Math.random()*2.4;
      this.weather.timer=setInterval(()=>this.pumpWeather(),260);
    }else if(kind==='snow'){
      this.startSnowAmbient();
      this.weather.next=t+3.2+Math.random()*3.8;
      this.weather.timer=setInterval(()=>this.pumpWeather(),400);
    }else{
      this.weather.next=t+3.8+Math.random()*5.2;
      this.weather.timer=setInterval(()=>this.pumpWeather(),220);
    }
  },
  stopWeather(){
    if(this.weather.timer){clearInterval(this.weather.timer);this.weather.timer=null}
    this.clearWeatherLoops(0.45);
    this.weather.kind=null;
  },
  pumpWeather(){
    if(!this.ctx||!this.on||!this.sfxOn||!this.weather.kind)return;
    const t=this.now();
    if(t<this.weather.next)return;
    const k=this.weather.kind;
    this.weather.step++;
    if(k==='rain'){
      // Någon enstaka droppe för liv, men inte regnmattan.
      if(Math.random()<0.55)this.softNoise(0.055,0.00585,6100,0.70,t,{type:'bandpass',q:0.9,smooth:0.05,attack:0.006,release:0.045});
      this.weather.next=t+2.3+Math.random()*2.7;
    }else if(k==='snow'){
      if(Math.random()<0.18)this.tone(125+Math.random()*22,0.55,'sine',0.006,0.93,t+0.05);
      this.weather.next=t+3.4+Math.random()*4.6;
    }else if(k==='sun'){
      this.sBirdChirp();
      this.weather.next=t+3.8+Math.random()*5.2;
    }else this.weather.next=t+1.0;
  },
  startMusic(kind){
    this.stopMusic();
    if(!this.ctx||!this.on||!this.musicOn)return;
    this.mus.kind=kind;
    this.applyVolumes();
    this.mus.step=0; this.mus.next=this.now()+0.1;
    this.mus.timer=setInterval(()=>this.pump(),50);
  },
  stopMusic(){ if(this.mus.timer){clearInterval(this.mus.timer);this.mus.timer=null} },
  silenceMusicForWaterfallCave(fade){
    this.stopMusic();
    if(!this.musGain||!this.musGain.gain)return;
    const t=this.now(), stopDelay=fade==null?1.0:fade;
    const p=this.musGain.gain;
    try{
      if(p.cancelScheduledValues)p.cancelScheduledValues(t);
      if(p.setValueAtTime)p.setValueAtTime(Math.max(0.00005,p.value||0.0001),t);
      if(p.linearRampToValueAtTime)p.linearRampToValueAtTime(0.00005,t+stopDelay);
      else if(p.exponentialRampToValueAtTime)p.exponentialRampToValueAtTime(0.00005,t+stopDelay);
      else p.value=0.00005;
    }catch(_){try{p.value=0.00005}catch(__){}}
  },
  startWaterfallCaveMysteryMusic(fade){
    this.init();
    if(!this.ctx||!this.on||!this.musicOn)return false;
    if(this.mus&&this.mus.timer&&this.mus.kind==='caveMystery'){this.applyVolumes();return true}
    this.startMusic('caveMystery');
    if(!this.musGain||!this.musGain.gain)return true;
    const t=this.now(), dur=fade==null?1.2:Math.max(0.05,fade);
    const target=MUSIC_GAIN_BASE*CAVE_MYSTERY_GAIN_BOOST*clamp(Number.isFinite(this.musicVol)?this.musicVol:1,0,1);
    const p=this.musGain.gain;
    try{
      if(p.cancelScheduledValues)p.cancelScheduledValues(t);
      if(p.setValueAtTime)p.setValueAtTime(0.00005,t);
      if(p.linearRampToValueAtTime)p.linearRampToValueAtTime(Math.max(0.00005,target),t+dur);
      else if(p.exponentialRampToValueAtTime)p.exponentialRampToValueAtTime(Math.max(0.00005,target),t+dur);
      else p.value=Math.max(0.00005,target);
    }catch(_){try{p.value=Math.max(0.00005,target)}catch(__){}}
    return true;
  },
  stopWaterfallCaveMysteryMusic(fade){
    if(!this.mus||this.mus.kind!=='caveMystery')return false;
    this.silenceMusicForWaterfallCave(fade==null?0.75:fade);
    return true;
  },
  pump(){
    if(!this.ctx)return;
    const P=this.PAT[this.mus.kind], stepDur=60/P.bpm/2;
    while(this.mus.next<this.now()+0.25){
      const i=this.mus.step%P.mel.length, t=this.mus.next;
      const m=P.mel[i], b=P.bass[i], kind=this.mus.kind;
      const mp=i%128;
      const mystery=kind==='caveMystery';
      const lead=kind==='cave'||mystery?'sine':(kind==='menu'?(mp>=64&&mp<96?'triangle':'square'):(kind==='lava'||kind==='night'||kind==='desert'?'triangle':(kind==='day2'&&i%32>=16?'triangle':'square')));
      const accent=kind==='day2'?(i%16===0?1.18:(i%8===6?0.86:1.0)):(kind==='menu'?(mp>=96?1.10:(mp>=64?0.88:(mp%32===0?1.06:1.0))):1);
      const leadVol=mystery?0.066:(kind==='cave'?0.075:(kind==='lava'?0.102:(kind==='night'?0.10:(kind==='desert'?0.066:(kind==='menu'?0.050*accent:(kind==='city'?0.068:(kind==='day2'?0.060*accent:0.07)))))));
      const leadLen=mystery?stepDur*3.6:(kind==='cave'?stepDur*2.55:(kind==='lava'?stepDur*2.25:(kind==='menu'?stepDur*(P.mel[(i+1)%P.mel.length]?0.62:(mp>=64&&mp<96?1.05:0.88)):(kind==='desert'?stepDur*(i%8===0?1.65:1.05):(kind==='city'?stepDur*(P.mel[(i+1)%P.mel.length]?0.84:1.28):(kind==='day2'?(i%16===14?stepDur*1.55:(i%4===0?stepDur*1.10:stepDur*0.82)):stepDur*0.95))))));
      if(m)this.tone(this.midi(m),leadLen,lead,leadVol,1,t,this.musGain);
      this.retroLeadLayer(kind,m,i,t,stepDur,leadLen);
      if(P.harm){
        const h=P.harm[i%P.harm.length];
        if(h)this.tone(this.midi(h),mystery?stepDur*3.2:(kind==='cave'?stepDur*2.2:(kind==='lava'?stepDur*2.05:(kind==='menu'?stepDur*(mp>=64&&mp<96?1.12:0.78):(kind==='desert'?stepDur*1.75:stepDur*1.35)))),'triangle',mystery?0.026:(kind==='cave'?0.024:(kind==='lava'?0.034:(kind==='menu'?0.014*accent:(kind==='desert'?0.022:0.030*accent)))),1,t+stepDur*0.08,this.musGain);
      }
      if(b)this.tone(this.midi(b),mystery?stepDur*4.4:(kind==='cave'?stepDur*2.8:(kind==='lava'?stepDur*3.05:(kind==='menu'?stepDur*(mp>=64&&mp<96?1.55:1.05):(kind==='day2'||kind==='city'?stepDur*1.35:stepDur*1.8)))),'triangle',mystery?0.146:(kind==='cave'?0.158:(kind==='lava'?0.158:(kind==='night'?0.225:(kind==='desert'?0.130:(kind==='menu'?0.112:(kind==='day2'?0.140:0.158)))))),1,t,this.musGain);
      this.retroBassLayer(kind,b,i,t,stepDur);
      if(kind!=='night'&&kind!=='cave'&&!mystery&&kind!=='desert'&&kind!=='lava'&&kind!=='menu'&&i%4===2)this.noise(0.03,kind==='day2'||kind==='city'?0.020:0.03,6000,0.5,t,this.musGain); // hihat-känsla
      if(kind==='menu'){
        if(mp%8===6)this.noise(0.018,mp>=96?0.010:0.007,4800,0.46,t+stepDur*0.10,this.musGain);
        if(mp%32===0&&b)this.padTone(this.midi(b+19),stepDur*(mp>=64&&mp<96?7.0:5.2),'triangle',0.010*(mp>=96?1.15:1),t+stepDur*0.03,this.musGain);
        if(mp%32===30)this.tone(this.midi(mp>=96?88:84),stepDur*0.34,'square',0.013,1,t+stepDur*0.15,this.musGain);
      }
      if(kind==='cave'&&i%16===8)this.softNoise(0.42,0.010,520,0.82,t+stepDur*0.2,{type:'lowpass',smooth:0.82,attack:0.12,release:0.24,dest:this.musGain});
      if(mystery){
        if(i%32===0){
          const root=b||28;
          this.padTone(this.midi(root+12),stepDur*9.0,'sine',0.030,t,this.musGain);
          this.padTone(this.midi(root+19),stepDur*8.0,'triangle',0.014,t+stepDur*0.18,this.musGain);
        }
        if(i%16===10)this.softNoise(0.55,0.0105,420,0.86,t+stepDur*0.2,{type:'lowpass',smooth:0.88,attack:0.18,release:0.32,dest:this.musGain});
        if(i%32===22&&b)this.tone(this.midi(b+31),stepDur*1.4,'sine',0.012,1.01,t+stepDur*0.36,this.musGain);
      }
      if(kind==='lava'){
        if(i%16===0){
          const root=b||28;
          this.padTone(this.midi(root+12),stepDur*8.0,'triangle',0.030,t,this.musGain);
          this.padTone(this.midi(root+19),stepDur*7.0,'sine',0.014,t+stepDur*0.10,this.musGain);
        }
        if(i%8===0)this.softNoise(0.48,0.030,160,0.72,t,{type:'lowpass',smooth:0.92,attack:0.035,release:0.24,dest:this.musGain});
        if(i%16===6)this.softNoise(0.26,0.017,680,0.55,t+stepDur*0.20,{type:'bandpass',q:0.80,smooth:0.48,attack:0.018,release:0.14,dest:this.musGain});
        if(i%32===24&&b)this.padTone(this.midi(b+12),stepDur*4.2,'sine',0.034,t+stepDur*0.15,this.musGain);
      }
      if(kind==='day2'){
        if(i%8===0)this.noise(0.026,0.018,5200,0.55,t,this.musGain);
        if(i%16===12)this.noise(0.038,0.014,3400,0.48,t+stepDur*0.45,this.musGain);
        if(i%32===30)this.tone(this.midi(72+(this.mus.step%64===30?7:12)),stepDur*0.70,'triangle',0.030,1.18,t+stepDur*0.35,this.musGain);
      }
      if(kind==='desert'){
        if(i%8===0)this.softNoise(0.09,0.026,220,0.62,t,{type:'lowpass',smooth:0.80,attack:0.004,release:0.075,dest:this.musGain});
        if(i%8===4)this.softNoise(0.06,0.014,900,0.48,t+stepDur*0.1,{type:'bandpass',q:1.3,smooth:0.22,attack:0.006,release:0.05,dest:this.musGain});
        if(i%16===14)this.tone(this.midi(76),stepDur*1.4,'sine',0.018,1.04,t+stepDur*0.28,this.musGain);
      }
      if(kind==='city'){
        const phrase=i%64;
        if(i%4===0)this.noise(0.032,phrase<32?0.014:0.018,900,0.52,t,this.musGain);
        if(i%8===6||i%32===22)this.noise(0.024,phrase<32?0.010:0.014,4200,0.60,t+stepDur*0.2,this.musGain);
        if(i%16===10)this.tone(this.midi(phrase<32?86:91),stepDur*0.46,'square',0.015,1.10,t+stepDur*0.32,this.musGain);
        if(i%32===30)this.tone(this.midi(79+(phrase<32?0:5)),stepDur*0.74,'triangle',0.014,0.96,t+stepDur*0.18,this.musGain);
        if(i%64===48&&b)this.padTone(this.midi(b+12),stepDur*5.0,'triangle',0.012,t+stepDur*0.05,this.musGain);
      }
      this.mus.next+=stepDur; this.mus.step++;
    }
  }
};
