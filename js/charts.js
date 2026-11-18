/* =========================================================
   charts.js — gráficos em SVG feitos à mão (sem biblioteca)
   ========================================================= */
let _gid = 0;
const gid = p => `${p}${++_gid}`;

// escala "bonita" para o eixo
function escalaBonita(max, passos=4){
  if(max<=0) return {topo:1, passo:1};
  const bruto = max/passos, mag = Math.pow(10, Math.floor(Math.log10(bruto)));
  const n = bruto/mag, passo = (n<=1?1:n<=2?2:n<=2.5?2.5:n<=5?5:10)*mag;
  return {topo: passo*Math.ceil(max/passo), passo};
}

/* Barras verticais empilhadas
   colunas: [{rotulo, destaque, partes:[{v, cor, nome, tracejado}]}] */
function svgBarras(colunas, {altura=230, legenda=[]}={}){
  const W = 640, H = altura, padL = 46, padB = 28, padT = 22;
  const n = colunas.length || 1;
  const max = Math.max(...colunas.map(c=>c.partes.reduce((s,p)=>s+p.v,0)), 0);
  const {topo, passo} = escalaBonita(max);
  const areaH = H - padB - padT, slot = (W - padL) / n, bw = Math.min(46, slot*0.56);
  const y = v => padT + areaH - (v/topo)*areaH;
  let defs = '', grid = '', barras = '';
  for(let v=0; v<=topo+0.001; v+=passo){
    grid += `<line class="grid" x1="${padL}" x2="${W}" y1="${y(v)}" y2="${y(v)}"/><text x="${padL-8}" y="${y(v)+4}" text-anchor="end">${brlK(v).replace('R$ ','')}</text>`;
  }
  colunas.forEach((c,i)=>{
    const x = padL + slot*i + (slot-bw)/2;
    const tot = c.partes.reduce((s,p)=>s+p.v,0);
    const clip = gid('clip');
    defs += `<clipPath id="${clip}"><rect x="${x}" y="${y(tot)}" width="${bw}" height="${Math.max(0,y(0)-y(tot))}" rx="8"/></clipPath>`;
    let acc = 0, segs = '';
    c.partes.forEach(p=>{
      if(p.v<=0) return;
      const y1 = y(acc+p.v), h = y(acc)-y1;
      segs += `<rect class="bar" x="${x}" y="${y1}" width="${bw}" height="${h}" fill="${p.cor}" ${p.tracejado?'opacity=".55"':''}><title>${esc(c.rotulo)} · ${esc(p.nome)}: ${brl(p.v)}</title></rect>`;
      acc += p.v;
    });
    barras += `<g clip-path="url(#${clip})">${segs}</g>`;
    if(tot>0) barras += `<text class="val" x="${x+bw/2}" y="${y(tot)-7}" text-anchor="middle">${brlK(tot)}</text>`;
    barras += `<text x="${x+bw/2}" y="${H-8}" text-anchor="middle" style="${c.destaque?'fill:var(--pri);font-weight:800':''}">${esc(c.rotulo)}</text>`;
  });
  const leg = legenda.length ? `<div class="legend">${legenda.map(l=>`<span><i style="background:${l.cor};${l.tracejado?'opacity:.55':''}"></i>${esc(l.nome)}</span>`).join('')}</div>` : '';
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img"><defs>${defs}</defs>${grid}${barras}</svg>${leg}</div>`;
}

/* Rosca (donut) com legenda ao lado */
function svgDonut(itens, titulo='Total'){
  const tot = itens.reduce((s,i)=>s+i.total,0);
  if(!tot) return '';
  const R = 74, C = 2*Math.PI*R, gap = itens.length>1 ? 3 : 0;
  let off = 0, arcos = '';
  itens.forEach(it=>{
    const len = Math.max(0, it.total/tot*C - gap);
    arcos += `<circle cx="100" cy="100" r="${R}" fill="none" stroke="${it.cor}" stroke-width="24" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-off}" transform="rotate(-90 100 100)" stroke-linecap="butt"><title>${esc(it.nome)}: ${brl(it.total)}</title></circle>`;
    off += it.total/tot*C;
  });
  const lista = itens.map(it=>`<div class="dl"><span class="dot" style="background:${it.cor}"></span><span class="n">${esc(it.nome)}</span><span class="v">${brl(it.total)} <span class="p">${(it.total/tot*100).toFixed(0)}%</span></span></div>`).join('');
  return `<div class="donutwrap chart">
    <svg viewBox="0 0 200 200" role="img">
      <circle cx="100" cy="100" r="${R}" fill="none" stroke="var(--linha)" stroke-width="24"/>
      ${arcos}
      <text class="donut-c1" x="100" y="94" text-anchor="middle">${esc(titulo)}</text>
      <text class="donut-c2" x="100" y="117" text-anchor="middle">${brlK(tot)}</text>
    </svg>
    <div class="lista">${lista}</div></div>`;
}

/* Velocímetro (meta) — pc de 0 a 100+ */
function svgGauge(pc, {rotulo='', sub='', tamanho=260}={}){
  const cx=150, cy=150, R=112, esp=22;
  const ang = p => Math.PI * (1 - Math.max(0,Math.min(100,p))/100);   // 0% = esquerda, 100% = direita
  const pt = (p, r=R) => [cx + r*Math.cos(ang(p)), cy - r*Math.sin(ang(p))];
  const arco = (p1, p2, r=R) => { const [x1,y1]=pt(p1,r), [x2,y2]=pt(p2,r); return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`; };
  const g = gid('gg');
  const zonas = [[0,40,'#C2413A'],[40,75,'#D99A3D'],[75,100,'#5E8C61']]
    .map(([a,b,c])=>`<path d="${arco(a+0.6,b-0.6,R+esp/2+9)}" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`).join('');
  const ticks = [0,25,50,75,100].map(p=>{ const [x1,y1]=pt(p,R-esp/2-6), [x2,y2]=pt(p,R-esp/2-14), [tx,ty]=pt(p,R-esp/2-28);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--tx-3)" stroke-width="2" stroke-linecap="round"/><text x="${tx}" y="${ty+4}" text-anchor="middle" style="font-size:11px;fill:var(--tx-3);font-weight:700">${p}</text>`; }).join('');
  const pcv = Math.max(0, Math.min(100, pc));
  const [nx,ny] = pt(pcv, R-esp/2-20);
  const cor = pc>=100 ? '#5E8C61' : pc>=75 ? '#5E8C61' : pc>=40 ? '#D99A3D' : '#C2413A';
  return `<div class="chart gauge" style="max-width:${tamanho}px;margin:0 auto">
    <svg viewBox="0 0 300 200" role="img" aria-label="${pc.toFixed(0)}% da meta">
      <defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#C2413A"/><stop offset=".5" stop-color="#D99A3D"/><stop offset="1" stop-color="#5E8C61"/></linearGradient></defs>
      ${zonas}
      <path d="${arco(0,100)}" stroke="var(--linha-2)" stroke-width="${esp}" fill="none" stroke-linecap="round"/>
      ${pcv>0.5?`<path d="${arco(0,pcv)}" stroke="url(#${g})" stroke-width="${esp}" fill="none" stroke-linecap="round"/>`:''}
      ${ticks}
      <line x1="${cx}" y1="${cy}" x2="${nx.toFixed(2)}" y2="${ny.toFixed(2)}" stroke="var(--tx)" stroke-width="5" stroke-linecap="round" style="transition:all .6s"/>
      <circle cx="${cx}" cy="${cy}" r="11" fill="var(--tx)"/><circle cx="${cx}" cy="${cy}" r="4.5" fill="${cor}"/>
      <text x="${cx}" y="${cy+44}" text-anchor="middle" style="font-size:26px;font-weight:800;fill:var(--tx)">${pc.toFixed(0)}%</text>
    </svg>
    ${rotulo?`<div style="text-align:center;font-weight:800;font-size:14px;margin-top:2px">${rotulo}</div>`:''}
    ${sub?`<div style="text-align:center;font-size:12px;color:var(--tx-3);margin-top:2px">${sub}</div>`:''}
  </div>`;
}

/* Linha do tempo dos dias de desembolso de um mês */
function timelineMes(m, itens){
  const [a,mm] = m.split('-').map(Number), n = ultimoDia(a,mm);
  const porDia = {};
  itens.forEach(it=>{ const d=+it.data.slice(8,10); (porDia[d]=porDia[d]||[]).push(it); });
  const max = Math.max(...Object.values(porDia).map(l=>l.reduce((s,i)=>s+i.valor,0)), 1);
  const pos = d => ((d-1)/(n-1)*100).toFixed(2)+'%';
  let html = `<div class="tl"><div class="trilho"></div>`;
  [1,5,10,15,20,25,n].forEach(d=>{ html += `<div class="tick" style="left:${pos(d)}">${d}</div>`; });
  if(hojeISO().slice(0,7)===m){ const d=+hojeISO().slice(8,10); html += `<div class="hoje" style="left:${pos(d)}"><span>hoje</span></div>`; }
  let ultimoCima = -99, ultimoBaixo = -99;
  Object.keys(porDia).map(Number).sort((a,b)=>a-b).forEach(d=>{
    const l = porDia[d], tot = l.reduce((s,i)=>s+i.valor,0);
    const st = l.some(i=>i.status==='vencido')?'vencido': l.every(i=>i.status==='pago')?'pago': l.some(i=>i.status==='aberto')?'aberto':'programado';
    const tam = Math.round(20 + Math.sqrt(tot/max)*18);
    html += `<div class="bolha ${st}" style="left:${pos(+d)};width:${tam}px;height:${tam}px" title="Dia ${d}: ${l.map(i=>i.descricao+' '+brl(i.valor)).join(' · ')}">${l.length>1?l.length:''}</div>`;
    // alterna rótulos em cima/embaixo quando os dias estão próximos
    const p = (d-1)/(n-1)*100; let baixo = false;
    if(p - ultimoCima < 9){ baixo = p - ultimoBaixo >= 9; }
    if(baixo) ultimoBaixo = p; else ultimoCima = p;
    html += `<div class="rot ${baixo?'baixo':''}" style="left:${pos(+d)}">${brlK(tot)}</div>`;
  });
  return html + `</div>`;
}
