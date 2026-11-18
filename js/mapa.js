/* =========================================================
   mapa.js — mapa mental a partir de tópicos (um por linha, recuo = nível)
   ========================================================= */
const MAPA_CORES = ['#B5563A','#C9922F','#7E5235','#8C5A36','#9A4A32','#D27A4F','#6E5231','#C49A6C'];

function parseMapa(txt, raiz){
  const root = {t: raiz || 'Reunião', f: []}, pilha = [{n: root, d: -1}];
  String(txt||'').split(/\r?\n/).forEach(l=>{
    if(!l.trim()) return;
    const ind = l.match(/^[\t ]*/)[0].replace(/\t/g,'  ').length;
    const t = l.trim().replace(/^([-*•–]|\d+[.)])\s*/,'');
    if(!t) return;
    const d = Math.floor(ind/2);
    while(pilha.length > 1 && pilha[pilha.length-1].d >= d) pilha.pop();
    const no = {t, f: []}; pilha[pilha.length-1].n.f.push(no); pilha.push({n: no, d});
  });
  return root;
}
// transforma o texto da ata em tópicos: linhas com ":" ou títulos viram ramos, listas viram galhos
function textoParaTopicos(texto){
  const out = []; let temTitulo = false;
  String(texto||'').split(/\r?\n/).forEach(l=>{
    const s = l.trim(); if(!s) return;
    const bullet = /^([-*•–]|\d+[.)])\s+/.test(s);
    const limpo = s.replace(/^#+\s*/,'').replace(/^([-*•–]|\d+[.)])\s+/,'');
    if(bullet){ out.push((temTitulo?'  ':'') + limpo); return; }
    const m = limpo.match(/^([^:]{2,40}):\s*(.*)$/);
    if(m){ out.push(m[1].trim()); temTitulo = true; if(m[2].trim()) m[2].split(/;|\.\s+/).map(x=>x.trim()).filter(Boolean).forEach(x=>out.push('  '+x.replace(/\.$/,''))); return; }
    if(/^#/.test(s) || (limpo.length<40 && limpo===limpo.toUpperCase() && /[A-ZÁ-Ú]/.test(limpo))){ out.push(limpo); temTitulo = true; return; }
    out.push((temTitulo?'  ':'') + limpo);
  });
  return out.join('\n');
}
function svgMapa(root){
  const peso = n => n.f.length ? n.f.reduce((s,c)=>s+peso(c),0) : 1;
  const ROW = 38, COL = 210, curto = t => t.length>34 ? t.slice(0,33)+'…' : t;
  const larg = t => Math.min(230, 22 + curto(t).length*6.9);
  const dir = [], esq = []; let pd = 0, pe = 0;
  root.f.forEach(c=>{ const w = peso(c); if(pd<=pe){ dir.push(c); pd+=w; } else { esq.push(c); pe+=w; } });
  const nos = [], links = [];
  const rw = Math.min(260, 30 + root.t.length*8.5);
  nos.push({x:-rw/2, y:-20, w:rw, h:40, t:root.t, raiz:true});
  function coloca(n, d, y0, sinal, cor, px, py){
    const h = peso(n)*ROW, y = y0 + h/2, w = larg(n.t);
    const xBorda = sinal * (rw/2 + 50 + (d-1)*COL);
    const x = sinal>0 ? xBorda : xBorda - w;
    nos.push({x, y:y-15, w, h:30, t:n.t, cor, d});
    const cx = sinal>0 ? x : x+w;
    links.push({x1:px, y1:py, x2:cx, y2:y, cor, d});
    let yy = y0;
    n.f.forEach(c=>{ coloca(c, d+1, yy, sinal, cor, sinal>0 ? x+w : x, y); yy += peso(c)*ROW; });
  }
  [[dir,1],[esq,-1]].forEach(([lista, sinal], li)=>{
    const total = lista.reduce((s,c)=>s+peso(c),0)*ROW; let y = -total/2;
    lista.forEach((c,i)=>{ const cor = MAPA_CORES[((li ? dir.length : 0) + i) % MAPA_CORES.length]; coloca(c, 1, y, sinal, cor, sinal*rw/2, 0); y += peso(c)*ROW; });
  });
  const minX = Math.min(...nos.map(n=>n.x))-20, maxX = Math.max(...nos.map(n=>n.x+n.w))+20, minY = Math.min(...nos.map(n=>n.y))-20, maxY = Math.max(...nos.map(n=>n.y+n.h))+20;
  const W = maxX-minX, H = maxY-minY;
  const linksSvg = links.map(l=>{ const mx = (l.x1+l.x2)/2; return `<path d="M${l.x1} ${l.y1} C${mx} ${l.y1}, ${mx} ${l.y2}, ${l.x2} ${l.y2}" fill="none" stroke="${l.cor}" stroke-width="${l.d===1?3:2}" stroke-opacity="${l.d===1?.85:.55}"/>`; }).join('');
  const nosSvg = nos.map(n=>{
    if(n.raiz) return `<g><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="20" fill="#4A2C1A"/><text x="${n.x+n.w/2}" y="${n.y+25}" text-anchor="middle" font-size="14" font-weight="800" fill="#FFF7EE" font-family="Montserrat, sans-serif">${esc(curto(n.t))}</text><title>${esc(n.t)}</title></g>`;
    const cheio = n.d===1;
    return `<g><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="15" fill="${cheio?n.cor:'#FFFFFF'}" stroke="${n.cor}" stroke-width="${cheio?0:1.5}"/><text x="${n.x+n.w/2}" y="${n.y+19.5}" text-anchor="middle" font-size="12" font-weight="${cheio?800:600}" fill="${cheio?'#FFFFFF':'#2B2013'}" font-family="Montserrat, sans-serif">${esc(curto(n.t))}</text><title>${esc(n.t)}</title></g>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${W} ${H}" width="${W}" height="${H}" style="display:block;margin:0 auto;flex:0 0 auto;max-width:none">${linksSvg}${nosSvg}</svg>`;
}
function baixarMapa(nome){
  const svg = document.querySelector('#mapaSvg svg'); if(!svg) return;
  const vb = svg.viewBox.baseVal, esc2 = 2, c = document.createElement('canvas');
  c.width = vb.width*esc2; c.height = vb.height*esc2;
  const img = new Image();
  img.onload = ()=>{ const x = c.getContext('2d'); x.fillStyle = '#FBF7F1'; x.fillRect(0,0,c.width,c.height); x.drawImage(img,0,0,c.width,c.height);
    c.toBlob(b=>{ const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `mapa-${norm(nome||'reuniao').replace(/[^a-z0-9]+/g,'-')}.png`; a.click(); }); };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
}
