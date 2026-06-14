// --------------------------- PIXELFONT ------------------------------
// 3-5 px bred, 5 px hög retrofont (variabel bredd).
const FONT_RAW={
'A':['.#.','#.#','###','#.#','#.#'],'B':['##.','#.#','##.','#.#','##.'],
'C':['.##','#..','#..','#..','.##'],'D':['##.','#.#','#.#','#.#','##.'],
'E':['###','#..','##.','#..','###'],'F':['###','#..','##.','#..','#..'],
'G':['.##','#..','#.#','#.#','.##'],'H':['#.#','#.#','###','#.#','#.#'],
'I':['###','.#.','.#.','.#.','###'],'J':['..#','..#','..#','#.#','.#.'],
'K':['#.#','##.','#..','##.','#.#'],'L':['#..','#..','#..','#..','###'],
'M':['#...#','##.##','#.#.#','#...#','#...#'],
'N':['#..#','##.#','#.##','#..#','#..#'],
'O':['###','#.#','#.#','#.#','###'],'P':['###','#.#','###','#..','#..'],
'Q':['###','#.#','#.#','###','..#'],'R':['##.','#.#','##.','#.#','#.#'],
'S':['.##','#..','.#.','..#','##.'],'T':['###','.#.','.#.','.#.','.#.'],
'U':['#.#','#.#','#.#','#.#','###'],'V':['#.#','#.#','#.#','#.#','.#.'],
'W':['#...#','#...#','#.#.#','#.#.#','.#.#.'],
'X':['#.#','#.#','.#.','#.#','#.#'],'Y':['#.#','#.#','.#.','.#.','.#.'],
'Z':['###','..#','.#.','#..','###'],
'0':['###','#.#','#.#','#.#','###'],'1':['.#.','##.','.#.','.#.','###'],
'2':['###','..#','###','#..','###'],'3':['###','..#','.##','..#','###'],
'4':['#.#','#.#','###','..#','..#'],'5':['###','#..','###','..#','###'],
'6':['###','#..','###','#.#','###'],'7':['###','..#','.#.','.#.','.#.'],
'8':['###','#.#','###','#.#','###'],'9':['###','#.#','###','..#','###'],
'%':['#.#','..#','.#.','#..','#.#'],'-':['...','...','###','...','...'],
'.':['.','.','.','.','#'],':':['.','#','.','#','.'],
'!':['#','#','#','.','#'],'/':['..#','..#','.#.','#..','#..'],
'+':['...','.#.','###','.#.','...'],'?':['###','..#','.##','...','.#.'],
'(':['.#','#.','#.','#.','.#'],')':['#.','.#','.#','.#','#.'],
',':['.','.','.','#','#'],
'Å':['.#.','#.#','.#.','#.#','###','#.#','#.#'],
'Ä':['#.#','...','.#.','#.#','###','#.#','#.#'],
'Ö':['#.#','...','###','#.#','#.#','#.#','###']
};
const FONT={};
for(const k in FONT_RAW){FONT[k]=FONT_RAW[k]}
// Svenska tecken ska ligga på samma baslinje som A/O. Accenter ritas separat ovanför glyphen.
// V9 hade 7-radiga Å/Ä/Ö-glyphs, vilket flyttade själva bokstaven nedåt i texten.
FONT['Å']=FONT['A']; FONT['Ä']=FONT['A']; FONT['Ö']=FONT['O'];
FONT['å']=FONT['Å']; FONT['ä']=FONT['Ä']; FONT['ö']=FONT['Ö'];
const FONT_ACCENTS={
  'Å':['.#.','...'],
  'Ä':['#.#','...'],
  'Ö':['#.#','...']
};
function fontGlyphs(s){
  // Acceptera både förkomponerade tecken (Å) och kombinerade Unicode-sekvenser (A + ring).
  // Det gör att svensk text fortsätter fungera även om en editor sparar å/ä/ö i decomposed form.
  let t=String(s);
  try{t=t.normalize('NFC')}catch(_){/* äldre webbläsare */}
  const out=[];
  for(let i=0;i<t.length;i++){
    let ch=t[i], n=t[i+1];
    if((ch==='A'||ch==='a')&&n==='̊'){out.push('Å');i++;continue}
    if((ch==='A'||ch==='a')&&n==='̈'){out.push('Ä');i++;continue}
    if((ch==='O'||ch==='o')&&n==='̈'){out.push('Ö');i++;continue}
    if(ch==='̊'||ch==='̈')continue;
    if(ch==='å'||ch==='Å'){out.push('Å');continue}
    if(ch==='ä'||ch==='Ä'){out.push('Ä');continue}
    if(ch==='ö'||ch==='Ö'){out.push('Ö');continue}
    out.push(ch.toUpperCase());
  }
  return out;
}
function textW(s,sc){sc=sc||1;let w=0;for(const ch of fontGlyphs(s)){const g=FONT[ch];w+=((g?g[0].length:2)+1)*sc}return w? w-sc:0}
function drawText(c,s,x,y,sc,col){
  sc=sc||1;c.fillStyle=col||'#fff';
  for(const ch of fontGlyphs(s)){
    const g=FONT[ch];
    if(!g){x+=3*sc;continue}
    const accent=FONT_ACCENTS[ch];
    if(accent){
      for(let r=0;r<accent.length;r++){const row=accent[r];
        for(let i=0;i<row.length;i++) if(row[i]==='#') c.fillRect(x+i*sc,y+(r-2)*sc,sc,sc);
      }
    }
    for(let r=0;r<g.length;r++){const row=g[r];
      for(let i=0;i<row.length;i++) if(row[i]==='#') c.fillRect(x+i*sc,y+r*sc,sc,sc);
    }
    x+=(g[0].length+1)*sc;
  }
}
function drawTextC(c,s,cx,y,sc,col){drawText(c,s,cx-(textW(s,sc)>>1),y,sc,col)}
