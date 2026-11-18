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
/* ---------- árvore do mapa ---------- */
let mapaArv = null, mapaSel = null, mapaEdit = null;
const mapaId = () => 'n'+Math.random().toString(36).slice(2,9);
function comIds(n){ n.id = n.id || mapaId(); n.f = (n.f||[]).map(comIds); return n; }
// o mapa fica salvo como JSON; mapas antigos em tópicos (texto) são convertidos
function carregarArvore(str, titulo){
  let r = null;
  if(str && String(str).trim().startsWith('{')){ try{ r = JSON.parse(str); }catch(e){ r = null; } }
  else if(str && String(str).trim()) r = parseMapa(str, titulo);
  if(!r) r = {t: titulo || 'Reunião', f: []};
  return comIds(r);
}
function acharNo(id, n=mapaArv, pai=null){
  if(!n) return null;
  if(n.id===id) return {n, pai};
  for(const c of n.f){ const x = acharNo(id, c, n); if(x) return x; }
  return null;
}

/* ---------- posição dos balões ---------- */
function layoutMapa(root){
  const peso = n => n.f.length ? n.f.reduce((s,c)=>s+peso(c),0) : 1;
  const ROW = 44, COL = 200, curto = t => t.length>34 ? t.slice(0,33)+'…' : t;
  const larg = t => Math.max(70, Math.min(240, 30 + curto(t||' ').length*7.4));
  const dir = [], esq = []; let pd = 0, pe = 0;
  root.f.forEach(c=>{ const w = peso(c); if(pd<=pe){ dir.push(c); pd+=w; } else { esq.push(c); pe+=w; } });
  const nos = [], links = [];
  const rw = Math.max(120, Math.min(280, 40 + (root.t||'').length*9));
  nos.push({id:root.id, x:-rw/2, y:-22, w:rw, h:44, t:root.t, raiz:true, d:0, sinal:0});
  function coloca(n, d, y0, sinal, cor, px, py){
    const h = peso(n)*ROW, y = y0 + h/2, w = larg(n.t);
    const xBorda = sinal * (rw/2 + 50 + (d-1)*COL);
    const x = sinal>0 ? xBorda : xBorda - w;
    nos.push({id:n.id, x, y:y-17, w, h:34, t:n.t, cor, d, sinal});
    links.push({x1:px, y1:py, x2: sinal>0 ? x : x+w, y2:y, cor, d});
    let yy = y0;
    n.f.forEach(c=>{ coloca(c, d+1, yy, sinal, cor, sinal>0 ? x+w : x, y); yy += peso(c)*ROW; });
  }
  [[dir,1],[esq,-1]].forEach(([lista, sinal], li)=>{
    const total = lista.reduce((s,c)=>s+peso(c),0)*ROW; let y = -total/2;
    lista.forEach((c,i)=>{ const cor = MAPA_CORES[((li ? dir.length : 0) + i) % MAPA_CORES.length]; coloca(c, 1, y, sinal, cor, sinal*rw/2, 0); y += peso(c)*ROW; });
  });
  const pad = 60;
  const minX = Math.min(...nos.map(n=>n.x))-pad, maxX = Math.max(...nos.map(n=>n.x+n.w))+pad, minY = Math.min(...nos.map(n=>n.y))-pad, maxY = Math.max(...nos.map(n=>n.y+n.h))+pad;
  return {nos, links, minX, minY, W:maxX-minX, H:maxY-minY, curto};
}
function svgMapa(root, editor){
  const L = layoutMapa(root), {nos, links, minX, minY, W, H, curto} = L;
  const linksSvg = links.map(l=>{ const mx = (l.x1+l.x2)/2; return `<path d="M${l.x1} ${l.y1} C${mx} ${l.y1}, ${mx} ${l.y2}, ${l.x2} ${l.y2}" fill="none" stroke="${l.cor}" stroke-width="${l.d===1?3:2}" stroke-opacity="${l.d===1?.85:.55}"/>`; }).join('');
  const nosSvg = nos.map(n=>{
    const sel = editor && n.id===mapaSel;
    const ev = editor ? ` data-id="${n.id}" style="cursor:pointer" onclick="mapaClique(event,'${n.id}')" ondblclick="mapaEditar('${n.id}')"` : '';
    const anel = sel ? `<rect x="${n.x-5}" y="${n.y-5}" width="${n.w+10}" height="${n.h+10}" rx="${n.h/2+5}" fill="none" stroke="#2B2013" stroke-width="2" stroke-dasharray="5 4" class="ui"/>` : '';
    // "+" para criar um galho a partir deste balão
    const hx = n.raiz ? n.x+n.w/2 : (n.sinal>0 ? n.x+n.w+16 : n.x-16), hy = n.raiz ? n.y+n.h+16 : n.y+n.h/2;
    const mais = editor ? `<g class="ui mapa-mais" onclick="event.stopPropagation();mapaFilho('${n.id}')" style="cursor:pointer"><title>Criar galho</title><circle cx="${hx}" cy="${hy}" r="11" fill="#FFFFFF" stroke="${n.raiz?'#4A2C1A':n.cor}" stroke-width="1.8"/><path d="M${hx-5} ${hy}h10M${hx} ${hy-5}v10" stroke="${n.raiz?'#4A2C1A':n.cor}" stroke-width="2.2" stroke-linecap="round"/></g>` : '';
    if(n.raiz) return `<g${ev}>${anel}<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="22" fill="#4A2C1A"/><text x="${n.x+n.w/2}" y="${n.y+27}" text-anchor="middle" font-size="14.5" font-weight="800" fill="#FFF7EE" font-family="Montserrat, sans-serif">${esc(curto(n.t))}</text><title>${esc(n.t)}</title></g>${mais}`;
    const cheio = n.d===1;
    return `<g${ev}>${anel}<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="17" fill="${cheio?n.cor:'#FFFFFF'}" stroke="${n.cor}" stroke-width="${cheio?0:1.6}"/><text x="${n.x+n.w/2}" y="${n.y+21.5}" text-anchor="middle" font-size="12.5" font-weight="${cheio?800:600}" fill="${cheio?'#FFFFFF':'#2B2013'}" font-family="Montserrat, sans-serif">${esc(curto(n.t))}</text><title>${esc(n.t)}</title></g>${mais}`;
  }).join('');
  return {L, svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${W} ${H}" width="${W}" height="${H}" style="display:block;max-width:none">${linksSvg}${nosSvg}</svg>`};
}

/* ---------- editor ---------- */
function iniciarMapa(str, titulo){ mapaArv = carregarArvore(str, titulo); mapaSel = null; mapaEdit = null; }
function desenharMapa(){
  const host = document.getElementById('mapaSvg'); if(!host || !mapaArv) return;
  const {L, svg} = svgMapa(mapaArv, true);
  const pos = id => { const n = L.nos.find(x=>x.id===id); return n ? {x:n.x-L.minX, y:n.y-L.minY, w:n.w, h:n.h, raiz:n.raiz} : null; };
  let extra = '';
  const ps = mapaSel && !mapaEdit ? pos(mapaSel) : null;
  if(ps){
    const bt = (fn, t, ic) => `<button onmousedown="event.preventDefault()" onclick="event.stopPropagation();${fn}('${mapaSel}')">${ic}${t}</button>`;
    const metade = ps.raiz ? 120 : 175, cx = Math.max(metade+6, Math.min(L.W-metade-6, ps.x+ps.w/2));
    extra += `<div class="mapa-barra" style="left:${cx}px;top:${Math.max(4, ps.y-50)}px">
      ${bt('mapaFilho','Galho',IC.plus)}${ps.raiz?'':bt('mapaIrmao','Ao lado',IC.plus)}${bt('mapaEditar','Renomear',IC.edit)}${ps.raiz?'':bt('mapaRemover','Excluir',IC.del)}</div>`;
  }
  const pe = mapaEdit ? pos(mapaEdit) : null;
  if(pe){
    const n = acharNo(mapaEdit)?.n;
    extra += `<input id="mapaInput" class="mapa-input" value="${esc(n?.t||'')}" style="left:${pe.x-10}px;top:${pe.y-3}px;width:${Math.max(200,pe.w+20)}px;height:${pe.h+6}px"
      onkeydown="mapaTecla(event)" onblur="mapaConfirmar()">`;
  }
  // encolhe para caber na largura (até 65%); mapas maiores ganham rolagem
  const k = Math.max(0.75, Math.min(1, (host.clientWidth-8)/L.W));
  const sobra = Math.max(0, (host.clientHeight - L.H*k)/2);
  host.innerHTML = `<div class="mapa-caixa" style="width:${L.W*k}px;height:${L.H*k}px;margin-top:${sobra}px"><div class="mapa-palco" style="width:${L.W}px;height:${L.H}px;transform:scale(${k})" onclick="mapaClique(event,null)">${svg}${extra}</div></div>`;
  // mantém à vista o balão que está sendo editado/selecionado
  const alvo = pe || ps; if(alvo){ const r = {l:alvo.x, r:alvo.x+alvo.w}; const offs = host.querySelector('.mapa-caixa').offsetLeft;
    if(offs + r.l*k < host.scrollLeft || offs + r.r*k > host.scrollLeft + host.clientWidth) host.scrollLeft = offs + (r.l + alvo.w/2)*k - host.clientWidth/2; }
  if(pe){ const i = document.getElementById('mapaInput'); i.focus(); i.select(); }
  else if(ps) host.focus({preventScroll:true});
}
function mapaClique(ev, id){ ev.stopPropagation(); if(mapaEdit) return; mapaSel = id; desenharMapa(); }
function mapaMudou(){ const h = document.getElementById('ata-mapa'); if(h){ h.value = JSON.stringify(mapaArv); ataMudou(); } }
function mapaFilho(id){
  const x = acharNo(id); if(!x) return;
  const novo = {id:mapaId(), t:'', f:[], novo:true}; x.n.f.push(novo);
  mapaSel = novo.id; mapaEdit = novo.id; desenharMapa();
}
function mapaIrmao(id){
  const x = acharNo(id); if(!x || !x.pai) return mapaFilho(id);
  const novo = {id:mapaId(), t:'', f:[], novo:true}; x.pai.f.splice(x.pai.f.indexOf(x.n)+1, 0, novo);
  mapaSel = novo.id; mapaEdit = novo.id; desenharMapa();
}
function mapaEditar(id){ mapaSel = id; mapaEdit = id; desenharMapa(); }
function mapaRemover(id){
  const x = acharNo(id); if(!x || !x.pai) return;
  if(x.n.f.length && !confirm(`Excluir "${x.n.t}" e os ${x.n.f.length} galhos dele?`)) return;
  const i = x.pai.f.indexOf(x.n); x.pai.f.splice(i,1);
  mapaSel = x.pai.f[i]?.id || x.pai.f[i-1]?.id || x.pai.id; mapaEdit = null; desenharMapa(); mapaMudou();
}
let mapaSaindo = false;
function mapaConfirmar(cancelar){
  if(!mapaEdit || mapaSaindo) return;
  mapaSaindo = true;
  const x = acharNo(mapaEdit), t = (document.getElementById('mapaInput')?.value||'').trim();
  if(x){
    if(cancelar && x.n.novo || (!t && x.pai)){ const i = x.pai.f.indexOf(x.n); x.pai.f.splice(i,1); mapaSel = x.pai.id; }
    else if(!cancelar && t){ x.n.t = t; }
    delete x.n.novo;
  }
  mapaEdit = null; mapaSaindo = false; desenharMapa(); mapaMudou();
}
function mapaTecla(e){
  if(e.key==='Enter'){ e.preventDefault(); const id = mapaEdit; mapaConfirmar(); if(acharNo(id)?.pai) mapaIrmao(id); }
  else if(e.key==='Tab'){ e.preventDefault(); const id = mapaEdit; mapaConfirmar(); if(acharNo(id)) mapaFilho(id); }
  else if(e.key==='Escape'){ e.preventDefault(); mapaConfirmar(); }
}
// atalhos com um balão selecionado
document.addEventListener('keydown', e=>{
  if(!mapaSel || mapaEdit || aba!=='atas' || !document.getElementById('mapaSvg')) return;
  if(['input','textarea','select'].includes((e.target.tagName||'').toLowerCase())) return;
  if(e.key==='Tab'){ e.preventDefault(); mapaFilho(mapaSel); }
  else if(e.key==='Enter'){ e.preventDefault(); acharNo(mapaSel)?.pai ? mapaIrmao(mapaSel) : mapaFilho(mapaSel); }
  else if(e.key==='Delete' || e.key==='Backspace'){ e.preventDefault(); mapaRemover(mapaSel); }
  else if(e.key==='F2'){ e.preventDefault(); mapaEditar(mapaSel); }
  else if(e.key==='Escape'){ mapaSel = null; desenharMapa(); }
});
function baixarMapa(nome){
  if(!mapaArv) return;
  const {L, svg} = svgMapa(mapaArv, false);
  const c = document.createElement('canvas'); c.width = L.W*2; c.height = L.H*2;
  const img = new Image();
  img.onload = ()=>{ const x = c.getContext('2d'); x.fillStyle = '#FBF7F1'; x.fillRect(0,0,c.width,c.height); x.drawImage(img,0,0,c.width,c.height);
    c.toBlob(b=>{ const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `mapa-${norm(nome||'reuniao').replace(/[^a-z0-9]+/g,'-')}.png`; a.click(); }); };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
// texto do mapa para o .txt da ata
function mapaParaTexto(str, titulo){
  const r = carregarArvore(str, titulo), out = [];
  (function vai(n, d){ n.f.forEach(c=>{ out.push('  '.repeat(d)+'- '+c.t); vai(c, d+1); }); })(r, 0);
  return out.join('\n');
}
