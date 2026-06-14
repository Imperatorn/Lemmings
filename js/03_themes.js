// ---------------------------- TEMAN ---------------------------------
// Varje tema ger terrängen sin pixeltextur (egen pixelkonst, ritas proceduralt).
const THEMES={
  dirt:{ sky:['#000008','#000010'], brick:'#c8a050',
    px(x,y,dTop){ const n=hash2(x,y);
      if(dTop<3 && hash2(x*3,7)>0.15){ // gräs
        return n<0.3?[40,160,40]:(n<0.7?[60,200,60]:[30,130,30]);
      }
      let c=n<0.33?[122,74,33]:(n<0.66?[107,61,26]:[140,90,45]);
      if(n>0.965)c=[160,120,80];           // småsten
      if(dTop>50){c=[c[0]*0.7|0,c[1]*0.7|0,c[2]*0.7|0]}
      return c; } },
  hell:{ sky:['#1a0000','#3a0505'], brick:'#9a5a40',
    px(x,y,dTop){ const n=hash2(x,y);
      const row=y>>3, mortar=((y&7)===7)||(((x+((row&1)?8:0))&15)===15);
      if(dTop<2) return n<0.5?[200,110,70]:[170,80,55];
      if(mortar) return [42,15,15];
      let c=n<0.4?[122,48,48]:(n<0.8?[140,58,52]:[105,40,42]);
      return c; } },
  marble:{ sky:['#0a0402','#1c0a04'], brick:'#d2a040',
    px(x,y,dTop){ const n=hash2(x,y);
      if(dTop<3 && hash2(x*5,11)>0.25) return n<0.5?[70,150,60]:[50,120,45]; // mossa
      const v=Math.sin(x*0.07+Math.sin(y*0.05)*2+y*0.11)*0.5+0.5+(n-0.5)*0.35;
      if(v<0.25)return [112,47,12]; if(v<0.5)return [143,60,16];
      if(v<0.75)return [179,84,24]; return [210,105,30]; } },
  forest:{ sky:['#000400','#001200'], brick:'#8a6a3a',
    px(x,y,dTop){ const n=hash2(x,y);
      if(dTop<3) return n<0.5?[30,92,30]:[42,122,42];
      let c=n<0.5?[58,42,24]:(n<0.85?[44,32,18]:[70,52,30]);
      return c; } },
  cave:{ sky:['#02050a','#070b10'], brick:'#8c929a',
    px(x,y,dTop){ const n=hash2(x,y), seam=((x+(y>>1))&31)===0||((y+(x>>2))&37)===0;
      let c=n<0.30?[54,58,64]:(n<0.62?[70,76,84]:(n<0.90?[88,96,106]:[108,116,126]));
      const vein=Math.sin(x*0.055+y*0.11+Math.sin(y*0.035)*2.2);
      if(vein>0.78)c=[c[0]+18,c[1]+20,c[2]+22];
      if(seam)c=[Math.max(28,c[0]-24),Math.max(30,c[1]-24),Math.max(34,c[2]-24)];
      if(dTop<2)c=[Math.min(155,c[0]+44),Math.min(162,c[1]+44),Math.min(172,c[2]+46)];
      if(dTop>70)c=[c[0]*0.72|0,c[1]*0.72|0,c[2]*0.74|0];
      return c; } },
  desert:{ sky:['#2a1730','#f2a84f'], brick:'#d8a85a',
    px(x,y,dTop){ const n=hash2(x,y), ripple=Math.sin(x*0.18+y*0.035)*0.5+0.5;
      if(dTop<2)return ripple>0.56?[236,188,96]:[216,158,70];
      let c=n<0.36?[176,118,54]:(n<0.70?[198,139,62]:[220,166,78]);
      if(((x+y*2)&47)===0)c=[136,96,62];
      if(n>0.972)c=[112,84,66];
      if(dTop>45)c=[c[0]*0.78|0,c[1]*0.72|0,c[2]*0.62|0];
      return c; } },
  city:{ sky:['#141824','#46505e'], brick:'#9ca0a6',
    px(x,y,dTop){ const n=hash2(x,y);
      const row=y>>3, mortar=((y&7)===7)||(((x+((row&1)?8:0))&15)===15);
      if(dTop<2)return n<0.55?[92,96,102]:[110,114,120];
      if(mortar)return [42,46,52];
      let c=n<0.34?[82,86,92]:(n<0.68?[98,102,108]:[116,120,128]);
      if(n>0.965)c=[150,154,160];
      if(dTop>55)c=[c[0]*0.72|0,c[1]*0.72|0,c[2]*0.74|0];
      return c; } },
  crystal:{ sky:['#000014','#041030'], brick:'#a0d8f0',
    px(x,y,dTop){ const n=hash2(x,y);
      if(dTop<2) return [234,255,255];
      const v=Math.sin(x*0.15+y*0.2)*0.5+0.5+(n-0.5)*0.4;
      if(v<0.3)return [110,168,208]; if(v<0.6)return [140,200,230];
      if(n>0.97)return [255,255,255];
      return [165,220,245]; } }
};

function terrainThemeKeyAt(level,x,y){
  const base=(level&&level.theme)||'dirt';
  const zones=level&&level.materialZones;
  if(Array.isArray(zones)){
    for(let i=zones.length-1;i>=0;i--){
      const z=zones[i]||{}, key=z.theme;
      if(!THEMES[key])continue;
      const x0=z.x==null?0:z.x, x1=z.w==null?Infinity:x0+z.w;
      const y0=z.y==null?0:z.y, y1=z.h==null?Infinity:y0+z.h;
      if(x>=x0&&x<x1&&y>=y0&&y<y1)return key;
    }
  }
  return THEMES[base]?base:'dirt';
}

function terrainThemeAt(level,x,y){
  return THEMES[terrainThemeKeyAt(level,x,y)]||THEMES.dirt;
}

function terrainBrickColor(level,x,y){
  return terrainThemeAt(level,x,y).brick;
}
