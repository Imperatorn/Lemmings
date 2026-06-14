// --------------------------- TERRÄNG --------------------------------
class Terrain{
  constructor(W,H){
    this.W=W;this.H=H;
    this.mask=new Uint8Array(W*H);
    this.stairMask=new Uint8Array(W*H);
    this.cv=document.createElement('canvas');
    this.cv.width=W;this.cv.height=H;
    this.cx=this.cv.getContext('2d');
  }
  solid(x,y){
    x|=0;y|=0;
    if(x<0||x>=this.W)return true;        // bankant = vägg, lemlar vänder
    if(y<0||y>=this.H)return false;
    return this.mask[y*this.W+x]===1;
  }
  solidBox(x,y,r){
    x|=0;y|=0;r|=0;
    for(let yy=y-r;yy<=y+r;yy++)
      for(let xx=x-r;xx<=x+r;xx++)
        if(this.solid(xx,yy))return true;
    return false;
  }
  setRect(x,y,w,h,v){
    x|=0;y|=0;
    const x0=Math.max(0,x),x1=Math.min(this.W,x+w);
    const y0=Math.max(0,y),y1=Math.min(this.H,y+h);
    for(let yy=y0;yy<y1;yy++){const o=yy*this.W;
      for(let xx=x0;xx<x1;xx++){this.mask[o+xx]=v;this.stairMask[o+xx]=0;}}
  }
  setDisc(x,y,r,v){
    const x0=Math.max(0,x-r|0),x1=Math.min(this.W-1,x+r|0);
    const y0=Math.max(0,y-r|0),y1=Math.min(this.H-1,y+r|0);
    for(let yy=y0;yy<=y1;yy++){const o=yy*this.W,dy=yy-y;
      for(let xx=x0;xx<=x1;xx++){const dx=xx-x;
        if(dx*dx+dy*dy<=r*r){this.mask[o+xx]=v;this.stairMask[o+xx]=0;}}}
  }
  setRamp(x,yBase,w,h,dir,v){ // lutande backe; dir=1 stiger åt höger
    for(let i=0;i<w;i++){
      const colH=Math.round(h*(i+1)/w);
      const cx=dir>0?x+i:x+w-1-i;
      for(let k=1;k<=colH;k++){
        const yy=yBase-k;
        if(cx>=0&&cx<this.W&&yy>=0&&yy<this.H){this.mask[yy*this.W+cx]=v;this.stairMask[yy*this.W+cx]=0}
      }
    }
  }
  clearRect(x,y,w,h){this.setRect(x,y,w,h,0);this.cx.clearRect(x|0,y|0,w,h)}
  clearDisc(x,y,r){
    this.setDisc(x,y,r,0);
    this.cx.save();this.cx.globalCompositeOperation='destination-out';
    this.cx.globalAlpha=1;this.cx.fillStyle='#000';
    this.cx.beginPath();this.cx.arc(x,y,r,0,7);this.cx.fill();this.cx.restore();
  }
  brick(x,y,w,h,col){
    this.setRect(x,y,w,h,1);
    const x0=Math.max(0,x|0),x1=Math.min(this.W,(x+w)|0);
    const y0=Math.max(0,y|0),y1=Math.min(this.H,(y+h)|0);
    for(let yy=y0;yy<y1;yy++){const o=yy*this.W;
      for(let xx=x0;xx<x1;xx++)this.stairMask[o+xx]=1;}
    this.cx.fillStyle=col;this.cx.fillRect(x|0,y|0,w,h);
    this.cx.fillStyle='rgba(255,255,255,0.25)';this.cx.fillRect(x|0,y|0,w,1);
  }
  stair(x,y){
    x|=0;y|=0;
    if(x<0||x>=this.W||y<0||y>=this.H)return false;
    return this.stairMask&&this.stairMask[y*this.W+x]===1;
  }
  stairBox(x,y,r){
    x|=0;y|=0;r|=0;
    if(!this.stairMask)return false;
    for(let yy=y-r;yy<=y+r;yy++)
      for(let xx=x-r;xx<=x+r;xx++)
        if(this.stair(xx,yy))return true;
    return false;
  }
  renderFromMask(themeKey,materialZones){
    const levelTheme={theme:themeKey,materialZones};
    const W=this.W,H=this.H;
    const img=this.cx.createImageData(W,H),d=img.data;
    for(let x=0;x<W;x++){
      let dTop=-1;
      for(let y=0;y<H;y++){
        const i=y*W+x;
        if(this.mask[i]){
          dTop=dTop<0?0:dTop+1;
          const th=terrainThemeAt(levelTheme,x,y);
          let c=th.px(x,y,dTop);
          // kantljus på sidor
          if(x>0&&!this.mask[i-1]||x<W-1&&!this.mask[i+1])
            c=[Math.min(255,c[0]+30),Math.min(255,c[1]+25),Math.min(255,c[2]+20)];
          const o=i*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255;
        }else dTop=-1;
      }
    }
    this.cx.putImageData(img,0,0);
  }
}
