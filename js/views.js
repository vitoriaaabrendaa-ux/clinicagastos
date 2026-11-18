/* =========================================================
   views.js — navegação e telas
   ========================================================= */
const IC = {
  edit:'<svg viewBox="0 0 24 24"><path d="M11 4H4v16h16v-7M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4z"/></svg>',
  del:'<svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>',
  x:'<svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  rep:'<svg viewBox="0 0 24 24"><path d="M17 2l4 4-4 4M3 11V9a4 4 0 014-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"/></svg>',
  copy:'<svg viewBox="0 0 24 24"><path d="M9 9h10v10H9zM5 15V5h10"/></svg>',
  clip:'<svg viewBox="0 0 24 24"><path d="M21 11l-8.5 8.5a5 5 0 01-7-7L14 4a3.3 3.3 0 014.7 4.7L10.2 17.2a1.7 1.7 0 01-2.4-2.4L15.5 7"/></svg>',
  plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  sino:'<svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"/></svg>',
  cash:'<svg viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg>',
  check:'<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>',
  clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  alert:'<svg viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/></svg>',
  swap:'<svg viewBox="0 0 24 24"><path d="M3 10a9 9 0 0115-4l3 3M21 14a9 9 0 01-15 4l-3-3M21 3v6h-6M3 21v-6h6"/></svg>',
  doc:'<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6"/></svg>',
  cal:'<svg viewBox="0 0 24 24"><path d="M3 5h18v16H3zM3 10h18M8 3v4M16 3v4"/></svg>',
  trend:'<svg viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8M15 7h6v6"/></svg>',
  lock:'<svg viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>',
  sol:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  lua:'<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>'
};
const NADA = '<span class="muted">—</span>';
const CORES = {pri:'#B5563A', ouro:'#C9922F', verde:'#7A8B45', azul:'#C49A6C', verm:'#9A4A32', areia:'#B9A79A', marrom:'#6E5231'};

function aviso(txt){
  const t=document.getElementById('toast'); t.textContent=txt; t.classList.add('on');
  clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('on'),3000);
}
const kpi = (cls, ic, k, v, d) => `<div class="kpi ${cls}"><div class="k"><i>${ic}</i>${k}</div><div class="v">${v}</div><div class="d">${d}</div></div>`;
const vazio = (t, s) => `<div class="vazio"><b>${t}</b>${s||''}</div>`;
const chipCat = k => k ? `<span class="chip cat"><span class="dot" style="background:${k.cor||CORES.ouro}"></span>${esc(k.nome)}</span>` : NADA;
const plural = (n, s, p) => `${n} ${n===1?s:(p||s+'s')}`;

/* ---------- navegação ---------- */
const ABAS = [
  {g:'Acompanhar', itens:[
    {id:'geral', nome:'Visão geral', icon:'M3 13h4l3 7 4-16 3 9h4'},
    {id:'lembretes', nome:'Lembretes', icon:'M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0'},
    {id:'cal', nome:'Calendário', icon:'M3 5h18v16H3zM3 10h18M8 3v4M16 3v4'},
    {id:'lanc', nome:'Lançamentos', icon:'M4 6h16M4 12h16M4 18h10'},
    {id:'rel', nome:'Relatórios', icon:'M4 20V10M10 20V4M16 20v-8M22 20H2'}
  ]},
  {g:'Custos', itens:[
    {id:'fixos', nome:'Custos fixos', icon:'M4 20V8l8-4 8 4v12M9 20v-6h6v6'},
    {id:'var', nome:'Custos variáveis', icon:'M3 17l6-6 4 4 8-8'},
    {id:'rec', nome:'Recorrências', icon:'M17 2l4 4-4 4M3 11V9a4 4 0 014-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 01-4 4H3'},
    {id:'cat', nome:'Categorias', icon:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'}
  ]},
  {g:'Planejar', itens:[
    {id:'eventos', nome:'Eventos', icon:'M12 2l2.6 6.2L21 9l-5 4.5L17.5 20 12 16.8 6.5 20 8 13.5 3 9l6.4-.8z'},
    {id:'sim', nome:'Simulador de locação', icon:'M3 21h18M5 21V7l7-4 7 4v14M9 9h1M14 9h1M9 13h1M14 13h1M10 21v-4h4v4'},
    {id:'metas', nome:'Metas', icon:'M12 22a10 10 0 100-20 10 10 0 000 20zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12h.01'},
    {id:'prev', nome:'Orçamentos futuros', icon:'M12 8v4l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z'},
    {id:'reemb', nome:'Reembolsos', icon:'M3 10a9 9 0 0115-4l3 3M21 14a9 9 0 01-15 4l-3-3M21 3v6h-6M3 21v-6h6'}
  ]},
  {g:'Registros', itens:[
    {id:'forn', nome:'Fornecedores', icon:'M3 7h18v13H3zM3 7l2-4h14l2 4M9 12h6'},
    {id:'atas', nome:'Atas de reunião', icon:'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M8 13h8M8 17h5'},
    {id:'arq', nome:'Arquivos', icon:'M4 6a2 2 0 012-2h4l2 3h6a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2z'}
  ]}
];
function renderNav(){
  const L = lembretes();
  const reemb = DB.gastos.filter(reembolsoPendente).length;
  const badge = id => {
    if(id==='lembretes' && L.total) return `<span class="badge ${L.urgentes||L.comp.length?'alerta':''}">${L.total}</span>`;
    if(id==='lanc') return `<span class="badge">${doMes().length}</span>`;
    if(id==='reemb' && reemb) return `<span class="badge alerta">${reemb}</span>`;
    if(id==='eventos'){ const n = DB.eventos.filter(e=>e.data && e.data>=hojeISO()).length; return n?`<span class="badge">${n}</span>`:''; }
    return '';
  };
  document.getElementById('nav').innerHTML = ABAS.map(g=>`<div class="navlab">${g.g}</div>` + g.itens.map(i=>
    `<button class="nav ${aba===i.id?'on':''}" onclick="alternarMenu(false);irPara('${i.id}')"><svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="${i.icon}"/></svg><span>${i.nome}</span>${badge(i.id)}</button>`
  ).join('')).join('');
  renderBottomNav();
}
function irPara(id){
  aba = id;
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('on', v.id==='v-'+id));
  render(); window.scrollTo({top:0,behavior:'smooth'});
  try{ history.replaceState(null,'','#'+id); }catch(e){}
}
function shiftMonth(d){ mes = addMes(mes, d); render(); }

const VIEWS = {
  geral:()=>renderGeral(), lembretes:()=>renderLembretes(), cal:()=>renderCalendario(), lanc:()=>renderLanc(),
  rel:()=>renderRelatorio(), fixos:()=>renderFixos(), var:()=>renderVariaveis(), rec:()=>renderRec(),
  cat:()=>renderCategorias(), metas:()=>renderMetas(), prev:()=>renderPrev(), reemb:()=>renderReembolsos(),
  forn:()=>renderForn(), arq:()=>renderArq(), eventos:()=>renderEventos(), atas:()=>renderAtas(), sim:()=>renderSim()
};
// redesenha só a tela aberta (antes redesenhava as 18 telas a cada clique)
function render(){
  document.querySelectorAll('.mesLbl').forEach(el=>el.textContent = mesNome(mes));
  renderNav();
  (VIEWS[aba]||VIEWS.geral)();
  const box = document.getElementById('setup');
  if(erroBanco){
    box.className='setup erro'; box.style.display='flex';
    box.innerHTML = `<b>O banco recusou a operação.</b> <code>${esc(erroBanco)}</code> <button class="btn xs ghost" onclick="erroBanco='';render()">Fechar</button>`;
  } else box.style.display='none';
}

/* ---------- pedaços reutilizados ---------- */
function anexosHTML(x, rotulos){
  const a = anexosDe(x), r = rotulos || ['Anexo 1','Anexo 2'];
  const falta = x && x.descricao!==undefined ? compFaltando(x) : [];
  const links = a.map((an,i)=>an.url ? `<div><a href="${esc(an.url)}" target="_blank" rel="noopener">${IC.clip}${esc(r[i].replace(/^Comprovante d[oa] ?/,'').replace(/^Anexo /,'anexo ')||'abrir')}</a>${an.obs?`<div class="o">${esc(an.obs)}</div>`:''}</div>` : '').join('');
  const f = falta.length ? `<span class="falta">falta: ${falta.map(t=>esc(t.replace('Comprovante ',''))).join(', ')}</span>` : '';
  return (links || f) ? `<div class="anx">${links}${f}</div>` : NADA;
}
function statusChip(g){
  if(g.pago){
    const q = quemPagouTxt(g);
    return `<span class="chip ok">Pago</span>${q?`<div class="sub-line">${esc(q)}</div>`:''}`;
  }
  return atrasado(g) ? '<span class="chip bad">Vencido</span>' : '<span class="chip warn">Em aberto</span>';
}
function linhaGasto(g){
  const k = cat(g.categoria_id), quando = dataDoGasto(g), parc = parcelaTxt(g);
  return `<tr>
    <td><b>${esc(g.descricao)}</b> ${g.recorrencia_id?`<span class="chip ${parc?'parc':'rec'}" title="Recorrente${parc?' · pagamento '+parc:''}">↻ ${parc||'recorrente'}</span>`:''}
      <div class="sub-line">${[g.fornecedor, formaTxt(g)].filter(Boolean).map(esc).join(' · ')}</div>
      ${g.obs?`<div class="sub-line" style="max-width:340px">${esc(g.obs)}</div>`:''}</td>
    <td>${chipCat(k)}<div class="sub-line">${g.tipo==='fixo'?'fixo':'variável'}</div></td>
    <td>${quando?dBR(quando):NADA}${!g.pago&&g.vencimento?`<div class="sub-line">${quandoTxt(g.vencimento)}</div>`:''}</td>
    <td>${statusChip(g)}${reembolsoPendente(g)?`<div><span class="chip info" style="margin-top:4px">reembolso pendente</span></div>`:''}</td>
    <td>${anexosHTML(g, rotulosAnexo(g))}</td>
    <td class="num">${brl(g.valor)}${(+g.parcelas>1)?`<div class="sub-line">${g.parcelas}x ${brl((+g.valor||0)/(+g.parcelas))}</div>`:''}</td>
    <td class="acts">
      ${!g.pago?`<button class="btn xs ok" onclick="openPagar('${g.id}')">Pagar</button>`:''}
      ${compFaltando(g).length?`<button class="btn xs ghost" onclick="openAnexos('${g.id}')">Anexar</button>`:''}
      <button class="iconbtn" onclick="openGasto('${g.id}')" aria-label="Editar" title="Editar">${IC.edit}</button>
      <button class="iconbtn" onclick="excluir('gastos','${g.id}')" aria-label="Excluir" title="Excluir">${IC.del}</button>
    </td></tr>`;
}
const CABEC = `<thead><tr><th>Descrição</th><th>Categoria</th><th>Data</th><th>Situação</th><th>Comprovantes</th><th class="num">Valor</th><th></th></tr></thead>`;
function linhaRecPendente(r, data){
  const k = cat(r.categoria_id), parc = parcelaRecTxt(r, data);
  return `<tr style="opacity:.92">
    <td><b>${esc(r.descricao)}</b> ${parc?`<span class="chip parc">${parc}</span>`:'<span class="chip rec">recorrente</span>'}
      <div class="sub-line">${[r.fornecedor, r.forma].filter(Boolean).map(esc).join(' · ')}</div></td>
    <td>${chipCat(k)}<div class="sub-line">${r.tipo==='variavel'?'variável':'fixo'}</div></td>
    <td>${dBR(data)}<div class="sub-line">${quandoTxt(data)}</div></td>
    <td><span class="chip rec">Programado</span></td>
    <td>${NADA}</td>
    <td class="num">${brl(r.valor)}</td>
    <td class="acts"><button class="btn xs ok" onclick="abrirRepeticao('${r.id}','${data}','ambas')">Pagar</button><button class="btn xs ghost" onclick="abrirRepeticao('${r.id}','${data}')">Abrir</button>
      <button class="iconbtn" onclick="openRec('${r.id}')" aria-label="Editar recorrência">${IC.edit}</button></td></tr>`;
}
function tabela(linhas, vz){ return linhas.length ? `<div class="tw"><table>${CABEC}<tbody>${linhas.join('')}</tbody></table></div>` : vz; }
function hbars(linhas, vz){
  const tot = linhas.reduce((s,l)=>s+l.total,0) || 1;
  return linhas.length ? linhas.map(l=>`<div class="hbar"><div class="nm"><span class="dot" style="background:${l.cor}"></span>${esc(l.nome)}</div>
    <div class="track"><div class="fill" style="width:${(l.total/tot*100).toFixed(1)}%;background:linear-gradient(90deg,${l.cor},${l.cor}99)"></div></div>
    <div class="vl">${brl(l.total)}<small>${l.sub||(l.total/tot*100).toFixed(0)+'%'}</small></div></div>`).join('') : vz;
}
function itensPorCategoria(gs){
  const l = DB.categorias.map(k=>({nome:k.nome, cor:k.cor||CORES.ouro, total:soma(gs.filter(g=>g.categoria_id===k.id))})).filter(x=>x.total>0);
  const sem = soma(gs.filter(g=>!g.categoria_id || !cat(g.categoria_id))); if(sem) l.push({nome:'Sem categoria', cor:CORES.areia, total:sem});
  return l.sort((a,b)=>b.total-a.total);
}
function graficoEvolucao(meses){
  const cols = meses.map(m=>{ const t=totaisDoMes(m); return {rotulo:mesCurto(m), destaque:m===mes, partes:[
    {v:t.fixo, cor:CORES.pri, nome:'Fixo'}, {v:t.variavel, cor:CORES.ouro, nome:'Variável'}, {v:t.programado, cor:CORES.azul, nome:'Programado', tracejado:true}]}; });
  return svgBarras(cols, {legenda:[{nome:'Fixo',cor:CORES.pri},{nome:'Variável',cor:CORES.ouro},{nome:'Programado (recorrências a lançar)',cor:CORES.azul,tracejado:true}]});
}
function proximosHTML(limite=6){
  const hoje = hojeISO();
  const abertos = DB.gastos.filter(g=>!g.pago && g.vencimento).map(g=>({tipo:'g', g, data:g.vencimento}));
  const recs = recPendentes(addDias(hoje,-60), addDias(hoje,30)).map(x=>({tipo:'r', r:x.r, data:x.data}));
  const lista = [...abertos, ...recs].sort((a,b)=>a.data.localeCompare(b.data)).slice(0,limite);
  if(!lista.length) return vazio('Nada a pagar nos próximos 30 dias','Tudo o que foi lançado já está quitado.');
  return `<div class="prox">${lista.map(it=>{
    const [, mm, dd] = it.data.split('-'), dias = diasAte(it.data);
    const cls = dias < 0 ? 'venc' : dias <= 2 ? 'hoje' : '';
    const x = it.tipo==='g' ? it.g : it.r, k = cat(x.categoria_id);
    const parc = it.tipo==='g' ? parcelaTxt(it.g) : parcelaRecTxt(it.r, it.data);
    return `<div class="prow ${cls}">
      <div class="pdata"><span class="d">${dd}</span><span class="m">${MES3[+mm-1]}</span></div>
      <div class="pinfo"><div class="nm">${esc(x.descricao)} ${parc?`<span class="chip parc">${parc}</span>`:''}${it.tipo==='r'&&!parc?'<span class="chip rec">recorrente</span>':''}</div>
        <div class="sub">${quandoTxt(it.data)}${k?' · '+esc(k.nome):''}${x.forma?' · '+esc(x.forma):''}</div></div>
      <div class="pval">${brl(x.valor)}</div>
      ${it.tipo==='g' ? `<button class="btn sm ok" onclick="openPagar('${x.id}')">Pagar</button>` : `<button class="btn sm ok" onclick="abrirRepeticao('${x.id}','${it.data}','ambas')">Pagar</button>`}
    </div>`; }).join('')}</div>`;
}
function diasDesembolsoHTML(m){
  const itens = fixosDoMes(m);
  if(!itens.length) return vazio(`Nenhum custo fixo em ${mesNome(m)}`, 'Cadastre um custo fixo com "por quanto tempo" e ele aparece aqui em todos os meses.');
  const porDia = {};
  itens.forEach(i=>{ (porDia[i.data]=porDia[i.data]||[]).push(i); });
  const stChip = s => ({pago:'<span class="chip ok">pago</span>', aberto:'<span class="chip warn">em aberto</span>', vencido:'<span class="chip bad">vencido</span>', programado:'<span class="chip rec">programado</span>'}[s]);
  return timelineMes(m, itens) + `<div class="dias">${Object.keys(porDia).sort().map(d=>{
    const l = porDia[d], dt = new Date(d+'T00:00:00');
    return `<div class="diarow"><div class="dn">${DIAS[dt.getDay()]}<b>${pad(dt.getDate())}</b></div>
      <div class="it">${l.map(i=>`<div><span>${esc(i.descricao)}</span>${i.parc?`<span class="chip parc">${i.parc}</span>`:''}${stChip(i.status)}<span class="muted">${brl(i.valor)}</span></div>`).join('')}</div>
      <div class="tot">${brl(l.reduce((s,i)=>s+i.valor,0))}</div></div>`; }).join('')}</div>`;
}

/* ---------- VISÃO GERAL ---------- */
function renderGeral(){
  const gs = doMes(), pagos = gs.filter(g=>g.pago), abertos = gs.filter(g=>!g.pago), atr = DB.gastos.filter(atrasado);
  const [a,m] = mes.split('-').map(Number);
  const progMes = recPendentes(`${mes}-01`, `${mes}-${pad(ultimoDia(a,m))}`);
  const totProg = progMes.reduce((s,x)=>s+(+x.r.valor||0),0);
  const fixosAtivos = DB.recorrencias.filter(r=>!r.pausada && (r.tipo||'fixo')==='fixo' && (!r.ate || r.ate>=hojeISO()));
  const compromisso = fixosAtivos.reduce((s,r)=>s+valorMensalRec(r),0);
  document.getElementById('kpis').innerHTML =
    kpi('', IC.cash, 'Total do mês', brl(soma(gs)+totProg), `${plural(gs.length,'lançamento')}${progMes.length?` + ${brl(totProg)} programado`:''}`) +
    kpi('ok', IC.check, 'Já pago', brl(soma(pagos)), `${plural(pagos.length,'quitado')}`) +
    kpi('warn', IC.clock, 'Falta pagar', brl(soma(abertos)+totProg), `${abertos.length} em aberto · ${progMes.length} programado${progMes.length!==1?'s':''}`) +
    kpi(atr.length?'bad':'info', atr.length?IC.alert:IC.rep, atr.length?'Vencido':'Custo fixo mensal', atr.length?brl(soma(atr)):brl(compromisso), atr.length?plural(atr.length,'conta atrasada','contas atrasadas'):`${plural(fixosAtivos.length,'contrato ativo','contratos ativos')}`);

  const L = lembretes();
  const partes = [];
  if(L.comp.length) partes.push(plural(L.comp.length,'comprovante','comprovantes')+' para subir');
  const prox = L.vencidos.length + L.proximos.length + L.recs.length;
  if(prox) partes.push(plural(prox,'pagamento chegando','pagamentos chegando'));
  if(L.reemb.length) partes.push(plural(L.reemb.length,'reembolso pendente','reembolsos pendentes'));
  if(L.docs.length) partes.push(plural(L.docs.length,'documento vencendo','documentos vencendo'));
  if(L.datas.length) partes.push(plural(L.datas.length,'data importante chegando','datas importantes chegando'));
  document.getElementById('bannerLemb').innerHTML = partes.length ? `<div class="banner" onclick="irPara('lembretes')">
    <div class="ic">${IC.sino}</div><div><b>Você tem ${plural(L.total,'lembrete')}</b><div class="s">${partes.join(' · ')}</div></div><div class="spacer"></div><span class="btn sm ghost">Ver lembretes</span></div>` : '';

  renderSemana();
  const meses = [-4,-3,-2,-1,0,1].map(d=>addMes(mes,d));
  document.getElementById('gEvol').innerHTML = graficoEvolucao(meses);
  const cats = itensPorCategoria(gs);
  document.getElementById('gCat').innerHTML = cats.length ? svgDonut(cats, mesNome(mes).split(' ')[0]) : vazio('Sem gastos neste mês');
  document.getElementById('proximos').innerHTML = proximosHTML();
  document.getElementById('gDias').innerHTML = diasDesembolsoHTML(mes);
  const ult = DB.gastos.slice().sort((a,b)=>(b.criado||'').localeCompare(a.criado||'')).slice(0,6);
  document.getElementById('ultimos').innerHTML = tabela(ult.map(linhaGasto), vazio('Ainda sem lançamentos','O primeiro gasto que você cadastrar aparece aqui.'));
}

/* ---------- LEMBRETES ---------- */
function renderLembretes(){
  const L = lembretes();
  document.getElementById('kpiLemb').innerHTML =
    kpi('warn', IC.clip, 'Comprovantes para subir', L.comp.length, L.comp.length?'pagamentos sem comprovante':'tudo em dia') +
    kpi(L.vencidos.length?'bad':'', IC.alert, 'Vencidos', brl(soma(L.vencidos)), plural(L.vencidos.length,'conta')) +
    kpi('', IC.clock, 'Próximos 10 dias', brl(soma(L.proximos)+L.recs.filter(x=>x.data>=hojeISO()).reduce((s,x)=>s+(+x.r.valor||0),0)), plural(L.proximos.length+L.recs.filter(x=>x.data>=hojeISO()).length,'pagamento')) +
    kpi('info', IC.swap, 'Reembolsos pendentes', brl(L.reemb.reduce((s,g)=>s+valorReembolso(g),0)), plural(L.reemb.length,'acerto'));

  const linha = (cls, ic, t, s, a) => `<div class="lemb"><div class="ic ${cls}">${ic}</div><div><div class="t">${t}</div><div class="s">${s}</div></div><div class="a">${a}</div></div>`;
  const sec = (titulo, hint, conteudo) => conteudo ? `<div class="panel glass"><header><h2>${titulo}</h2><span class="hint">${hint}</span></header>${conteudo}</div>` : '';

  const comp = L.comp.map(g=>linha('comp', IC.clip, `${esc(g.descricao)} · ${brl(g.valor)}`,
    `Pago em ${dBR(dataDoGasto(g))} · ${esc(quemPagouTxt(g))} · falta: <b>${compFaltando(g).map(esc).join(' e ')}</b>`,
    `<button class="btn sm" onclick="openAnexos('${g.id}')">Anexar comprovante</button><button class="btn sm ghost" onclick="dispensarComp('${g.id}')">Não precisa</button>`)).join('');

  const hoje = hojeISO();
  const pags = [
    ...L.vencidos.map(g=>({d:g.vencimento, html:linha('venc', IC.alert, `${esc(g.descricao)} · ${brl(g.valor)}`, `${quandoTxt(g.vencimento)} (${dBR(g.vencimento)})${parcelaTxt(g)?' · pagamento '+parcelaTxt(g):''}`, `<button class="btn sm ok" onclick="openPagar('${g.id}')">Pagar</button>`)})),
    ...L.recs.map(x=>({d:x.data, html:linha(x.data<hoje?'venc':'pag', IC.rep, `${esc(x.r.descricao)} · ${brl(x.r.valor)}`, `${x.data<hoje?'ainda não foi pago e ':''}${quandoTxt(x.data)} (${dBR(x.data)})${parcelaRecTxt(x.r,x.data)?' · pagamento '+parcelaRecTxt(x.r,x.data):''}`, `<button class="btn sm ghost" onclick="abrirRepeticao('${x.r.id}','${x.data}')">Abrir</button><button class="btn sm ok" onclick="lancarEPagar('${x.r.id}','${x.data}')">Já paguei</button>`)})),
    ...L.proximos.map(g=>({d:g.vencimento, html:linha('pag', IC.clock, `${esc(g.descricao)} · ${brl(g.valor)}`, `${quandoTxt(g.vencimento)} (${dBR(g.vencimento)})${parcelaTxt(g)?' · pagamento '+parcelaTxt(g):''}${g.destino?' · '+esc(g.destino):''}`, `<button class="btn sm ok" onclick="openPagar('${g.id}')">Pagar</button>`)}))
  ].sort((a,b)=>a.d.localeCompare(b.d)).map(x=>x.html).join('');

  const reemb = L.reemb.map(g=>{ const p=pag(g.pagador_id), o=outraSocia(g.pagador_id);
    return linha('reemb', IC.swap, `${o?esc(o.nome):'A outra sócia'} devolve ${brl(valorReembolso(g))} para ${p?esc(p.nome):'quem pagou'}`, `${esc(g.descricao)} · total ${brl(g.valor)} · pago em ${dBR(dataDoGasto(g))}`,
      `<button class="btn sm" onclick="openReembolso('${g.id}')">Marcar devolvido</button>`); }).join('');

  const docs = L.docs.map(a=>{ const n=diasAte(a.validade);
    return linha('doc', IC.doc, esc(a.nome), n<0?`venceu há ${-n} dias (${dBR(a.validade)})`:`vence em ${n} dias (${dBR(a.validade)})`, `<button class="btn sm ghost" onclick="openArq('${a.id}')">Abrir</button>`); }).join('');

  const datas = L.datas.map(x=>{ const n=diasAte(x.data);
    return x.tipo==='marco' ? linha('marco', IC2.flag, esc(x.x.titulo), `${tipoMarcoTxt(x.x.tipo)} · ${n===0?'hoje':n===1?'amanhã':'em '+n+' dias'} (${dBR(x.data)})${x.x.obs?' · '+esc(x.x.obs):''}`, `<button class="btn sm ghost" onclick="openMarco('${x.x.id}')">Abrir</button>`)
      : linha('comp', IC2.festa, esc(x.x.nome), `evento · ${n===0?'hoje':n===1?'amanhã':'em '+n+' dias'} (${dBR(x.data)}) · ${brl(resumoEvento(x.x).aPagar)} a pagar`, `<button class="btn sm ghost" onclick="abrirEvento('${x.x.id}')">Abrir</button>`); }).join('');
  const html = sec('Datas importantes', 'próximos 14 dias', datas) + sec('Comprovantes para subir', 'pagamentos feitos que ainda não têm comprovante', comp)
    + sec('Pagamentos chegando', 'vencidos e próximos 10 dias', pags)
    + sec('Reembolsos', 'quando uma pagou sozinha', reemb)
    + sec('Documentos', 'vencendo nos próximos 30 dias', docs);
  document.getElementById('listaLemb').innerHTML = html || `<div class="panel glass">${vazio('Nenhum lembrete agora','Sem comprovantes faltando, pagamentos atrasados ou reembolsos pendentes.')}</div>`;
}

/* ---------- CALENDÁRIO ---------- */
let calModo = 'mes';
function setCalModo(m){
  calModo = m;
  document.querySelectorAll('#calModoSeg button').forEach((b,i)=>b.classList.toggle('on',(i===0)===(m==='mes')));
  document.getElementById('calMonthpick').style.display = m==='mes'?'flex':'none';
  document.getElementById('calRange').style.display = m==='mes'?'none':'flex';
  if(m==='periodo'){
    const de=document.getElementById('calDe'), ate=document.getElementById('calAte');
    if(!de.value) de.value = hojeISO(); if(!ate.value) ate.value = addDias(hojeISO(),30);
  }
  renderCalendario();
}
const FILTROS_CAL = [['pag','Pagamentos','var(--warn)'],['datas','Datas importantes','var(--tx)'],['eventos','Eventos','#C9922F'],['atas','Reuniões','var(--tx-3)'],['prev','Orçamentos previstos','var(--info)']];
let calFiltro = {pag:true, datas:true, eventos:true, atas:true, prev:true};
function togFiltro(k){
  const ligados = Object.keys(calFiltro).filter(x=>calFiltro[x]);
  if(ligados.length===Object.keys(calFiltro).length) Object.keys(calFiltro).forEach(x=>calFiltro[x]=(x===k)); // primeiro clique: mostra só esse
  else { calFiltro[k] = !calFiltro[k]; if(!Object.values(calFiltro).some(Boolean)) Object.keys(calFiltro).forEach(x=>calFiltro[x]=true); }
  renderCalendario();
}
function chipsFiltro(){
  const todos = Object.values(calFiltro).every(Boolean);
  return `<button class="chipbtn ${todos?'on':''}" onclick="Object.keys(calFiltro).forEach(x=>calFiltro[x]=true);renderCalendario()">Tudo</button>` +
    FILTROS_CAL.map(([k,t,c])=>`<button class="chipbtn ${!todos&&calFiltro[k]?'on':''}" onclick="togFiltro('${k}')"><i style="background:${c}"></i>${t}</button>`).join('');
}
// itens de um intervalo, por dia (respeita os filtros do calendário, a não ser que `todos` seja true)
function itensPeriodo(de, ate, todos){
  const F = todos ? {pag:1,datas:1,eventos:1,atas:1,prev:1} : calFiltro;
  const porDia = {}, push = (d,it)=>{ (porDia[d]=porDia[d]||[]).push(it); };
  const faixa = (ini, fim, fn) => { let d = ini < de ? de : ini; const f = fim && fim > ini ? fim : ini; while(d <= f && d <= ate){ fn(d); d = addDias(d,1); } };
  if(F.pag){
    DB.gastos.forEach(g=>{ const d=dataDoGasto(g); if(d && d>=de && d<=ate) push(d,{tipo:'gasto',g}); });
    recPendentes(de,ate).forEach(x=>push(x.data,{tipo:'rec',g:x.r,data:x.data}));
  }
  if(F.prev) DB.previsoes.forEach(p=>{ if(p.quando && p.quando>=de && p.quando<=ate) push(p.quando,{tipo:'prev',g:p}); });
  if(F.datas) DB.marcos.forEach(m=>{ if(m.data && m.data<=ate && (m.data_fim||m.data)>=de) faixa(m.data, m.data_fim, d=>push(d,{tipo:'marco',g:m})); });
  if(F.eventos){
    DB.eventos.forEach(e=>{ if(e.data && e.data<=ate && (e.data_fim||e.data)>=de) faixa(e.data, e.data_fim, d=>push(d,{tipo:'evento',g:e})); });
    DB.evento_custos.forEach(c=>{ if(c.vencimento && c.vencimento>=de && c.vencimento<=ate) push(c.vencimento,{tipo:'ecusto',g:c}); });
  }
  if(F.atas) DB.atas.forEach(a=>{ if(a.data && a.data>=de && a.data<=ate) push(a.data,{tipo:'ata',g:a}); });
  const ordem = {marco:0, evento:1, ata:2, gasto:3, rec:4, ecusto:5, prev:6};
  Object.values(porDia).forEach(l=>l.sort((a,b)=>ordem[a.tipo]-ordem[b.tipo]));
  return porDia;
}
const valorItem = i => (i.tipo==='marco'||i.tipo==='evento'||i.tipo==='ata') ? 0 : (+i.g.valor||0);
function itemCal(i, agenda){
  const cls = agenda ? 'agitem' : 'calitem', n = agenda?'n':'cd', s = agenda?'s':'cv';
  const val = agenda ? `<div class="v">${brl(i.g.valor)}</div>` : `<div class="cv">${brl(i.g.valor)}</div>`;
  if(i.tipo==='marco') return `<div class="${cls} marco" onclick="event.stopPropagation();openMarco('${i.g.id}')"><div style="flex:1"><div class="${n}">${esc(i.g.titulo)}</div><div class="${s}">${tipoMarcoTxt(i.g.tipo)}</div></div></div>`;
  if(i.tipo==='evento') return `<div class="${cls} evento" onclick="event.stopPropagation();abrirEvento('${i.g.id}')"><div style="flex:1"><div class="${n}">${esc(i.g.nome)}</div><div class="${s}">evento${i.g.local?' · '+esc(i.g.local):''}</div></div></div>`;
  if(i.tipo==='ata') return `<div class="${cls} ata" onclick="event.stopPropagation();abrirAta('${i.g.id}')"><div style="flex:1"><div class="${n}">${esc(i.g.titulo)}</div><div class="${s}">reunião</div></div></div>`;
  if(i.tipo==='ecusto'){ const ev = DB.eventos.find(e=>e.id===i.g.evento_id);
    return `<div class="${cls} evento" onclick="event.stopPropagation();openCustoEvento('${i.g.id}')"><div style="flex:1"><div class="${n}">${esc(i.g.descricao)}</div><div class="${s}">${ev?esc(ev.nome):'evento'} · ${i.g.status==='pago'?'pago':'a pagar'}</div></div>${val}</div>`; }
  if(i.tipo==='prev') return `<div class="${cls} prev" onclick="event.stopPropagation();openPrev('${i.g.id}')"><div style="flex:1"><div class="${n}">${esc(i.g.descricao)}</div><div class="${s}">orçamento previsto</div></div>${val}</div>`;
  if(i.tipo==='rec'){ const p = parcelaRecTxt(i.g, i.data);
    return `<div class="${cls} rec" onclick="event.stopPropagation();abrirRepeticao('${i.g.id}','${i.data}')" title="Abrir este mês"><div style="flex:1"><div class="${n}">${esc(i.g.descricao)}${p?' · '+p:''}</div><div class="${s}">programado</div></div>${val}</div>`; }
  const g = i.g, st = g.pago ? 'q' : (atrasado(g) ? 'atrasado' : ''), p = parcelaTxt(g);
  return `<div class="${cls} ${st}" onclick="event.stopPropagation();openGasto('${g.id}')"><div style="flex:1"><div class="${n}">${esc(g.descricao)}${p?' · '+p:''}</div><div class="${s}">${g.pago?'pago':(atrasado(g)?'vencido':'em aberto')}</div></div>${val}</div>`;
}
function lancarRecConfirma(id, data){
  const r = DB.recorrencias.find(x=>x.id===id); if(!r) return;
  if(confirm(`Lançar "${r.descricao}" (${brl(r.valor)}) com vencimento em ${dBR(data)}?`)) lancarRec(id, data);
}
function kpisCal(porDia, gs, prevs, recs, nDias){
  let maiorDia=null, maiorVal=0;
  Object.keys(porDia).forEach(d=>{ const v=porDia[d].reduce((s,i)=>s+valorItem(i),0); if(v>maiorVal){maiorVal=v;maiorDia=d;} });
  document.getElementById('kpiCal').innerHTML =
    kpi('', IC.cash, 'Sai no período', brl(soma(gs)), plural(gs.length,'lançamento')) +
    kpi('', IC.rep, 'Programado', brl(recs.reduce((s,x)=>s+(+x.r.valor||0),0)), plural(recs.length,'recorrência')) +
    kpi('info', IC.clock, 'Orçamentos previstos', brl(soma(prevs)), plural(prevs.length,'item','itens')) +
    kpi('warn', IC.cal, 'Dia mais pesado', maiorDia?dBR(maiorDia).slice(0,5):'—', maiorDia?`${brl(maiorVal)} · ${Object.keys(porDia).length} de ${nDias} dias com saída`:'nenhuma saída');
}
function renderCalendario(){
  document.getElementById('calFiltros').innerHTML = chipsFiltro();
  renderMarcosMes();
  if(calModo==='periodo') return renderAgenda();
  const [ano, mm] = mes.split('-').map(Number), n = ultimoDia(ano,mm), offset = new Date(ano,mm-1,1).getDay();
  const de = `${mes}-01`, ate = `${mes}-${pad(n)}`, porDia = itensPeriodo(de, ate);
  const gs = DB.gastos.filter(g=>(dataDoGasto(g)||'').slice(0,7)===mes), prevs = DB.previsoes.filter(p=>(p.quando||'').slice(0,7)===mes), recs = recPendentes(de,ate);
  kpisCal(porDia, gs, prevs, recs, n);
  let cels = '';
  for(let i=0;i<offset;i++) cels += `<div class="cel fora"></div>`;
  for(let d=1; d<=n; d++){
    const iso = `${mes}-${pad(d)}`, itens = porDia[iso] || [], tot = itens.reduce((s,i)=>s+valorItem(i),0);
    cels += `<div class="cel ${iso===hojeISO()?'hoje':''}" onclick="escolherNoDia('${iso}')" title="Clique para cadastrar algo em ${dBR(iso)}">
      <div class="dia"><span class="n">${d}</span>${tot?`<span class="diatot">${brlK(tot)}</span>`:''}</div>
      ${itens.map(i=>itemCal(i,false)).join('')}
      <span class="add">${IC.plus}</span></div>`;
  }
  const resto = (offset + n) % 7; if(resto) for(let i=resto;i<7;i++) cels += `<div class="cel fora"></div>`;
  document.getElementById('calendario').innerHTML = `<div class="calhead">${DIAS.map(d=>`<div>${d}</div>`).join('')}</div><div class="calgrid">${cels}</div>
    <div class="calresumo"><span>Total <b>${brl(soma(gs))}</b></span><span>Pago <b>${brl(soma(gs.filter(g=>g.pago)))}</b></span><span>Em aberto <b>${brl(soma(gs.filter(g=>!g.pago)))}</b></span><span>Programado <b>${brl(recs.reduce((s,x)=>s+(+x.r.valor||0),0))}</b></span><span>Previsto <b>${brl(soma(prevs))}</b></span></div>`;
}
function renderAgenda(){
  const de = document.getElementById('calDe').value, ate = document.getElementById('calAte').value, host = document.getElementById('calendario');
  if(!de || !ate || de>ate){ host.innerHTML = vazio('Escolha o período','Informe a data inicial e a final.'); document.getElementById('kpiCal').innerHTML=''; return; }
  const porDia = itensPeriodo(de, ate);
  const gs = DB.gastos.filter(g=>{ const d=dataDoGasto(g); return d && d>=de && d<=ate; }), prevs = DB.previsoes.filter(p=>p.quando && p.quando>=de && p.quando<=ate), recs = recPendentes(de,ate);
  kpisCal(porDia, gs, prevs, recs, diasAte(ate)-diasAte(de)+1);
  const dias = Object.keys(porDia).sort();
  host.innerHTML = dias.length ? `<div class="agenda">${dias.map(d=>{
    const itens = porDia[d], dt = new Date(d+'T00:00:00');
    const tot = itens.reduce((s,i)=>s+valorItem(i),0);
    return `<div class="agdia ${d===hojeISO()?'hoje':''}"><div class="agdata"><div class="d">${dt.getDate()}</div><div class="w">${DIAS[dt.getDay()]} · ${MES3[dt.getMonth()]}</div>${tot?`<div class="t">${brl(tot)}</div>`:''}</div>
      <div class="agitens">${itens.map(i=>itemCal(i,true)).join('')}</div></div>`; }).join('')}</div>`
    : vazio(`Nada entre ${dBR(de)} e ${dBR(ate)}`);
}

/* ---------- LANÇAMENTOS ---------- */
function renderLanc(){
  const q = norm(document.getElementById('lancBusca')?.value||'').trim();
  // com busca, procura em todos os meses
  let gs = (q ? DB.gastos : doMes()).slice().sort((a,b)=>(dataRef(b)||'').localeCompare(dataRef(a)||''));
  if(q) gs = gs.filter(g=>norm([g.descricao,g.fornecedor,g.obs,g.destino,cat(g.categoria_id)?.nome,String(g.valor),...anexosDe(g).map(a=>a.obs)].join(' ')).includes(q));
  document.getElementById('lancInfo').textContent = q ? `${plural(gs.length,'resultado')} em todos os meses` : '';
  document.getElementById('kpiLanc').innerHTML =
    kpi('', IC.cash, 'Total', brl(soma(gs)), plural(gs.length,'lançamento')) +
    kpi('ok', IC.check, 'Pago', brl(soma(gs.filter(g=>g.pago))), plural(gs.filter(g=>g.pago).length,'quitado')) +
    kpi('warn', IC.clock, 'Em aberto', brl(soma(gs.filter(g=>!g.pago))), plural(gs.filter(g=>!g.pago).length,'conta')) +
    kpi('', IC.clip, 'Sem comprovante', gs.filter(g=>g.pago && !temAnexo(g)).length, 'pagos sem nenhum anexo');
  document.getElementById('tbLanc').innerHTML = tabela(gs.map(linhaGasto), vazio(q?'Nada encontrado':`Nenhum gasto em ${mesNome(mes)}`, q?'Tente outra palavra.':'Clique em "Novo gasto" para começar.'));
}

/* ---------- CUSTOS FIXOS ---------- */
function cardContrato(r){
  const info = recInfo(r), k = cat(r.categoria_id);
  const total = info.total;
  let prog = '';
  if(total){
    const segs = total <= 36 ? `<div class="segs">${Array.from({length:total},(_,i)=>`<i class="${i<info.pagos?'p':(i<info.lancados?'l':'')}"></i>`).join('')}</div>`
      : `<div class="track"><div class="fill" style="width:${(info.pagos/total*100).toFixed(1)}%;background:var(--grad-verde)"></div></div>`;
    prog = `<div class="prog"><div class="lin"><span><b>${info.pagos}/${total}</b> pagos</span><span>${info.restantes? `faltam ${plural(info.restantes,'pagamento')} · ${brl(info.valorRestante)}` : 'contrato quitado'}</span></div>${segs}</div>`;
  } else if(r.ate){
    prog = `<div class="prog"><div class="lin"><span class="chip bad">datas inválidas</span><span>termina (${dBR(r.ate)}) antes de começar (${dBR(r.inicio)})</span></div></div>`;
  } else {
    prog = `<div class="prog"><div class="lin"><span><b>${info.pagos}</b> ${info.pagos===1?'pago':'pagos'} até agora</span><span>sem data para acabar</span></div></div>`;
  }
  const quitado = total && info.pagos>=total;
  return `<div class="fcard glass ${quitado?'fim':''}" style="${r.pausada?'opacity:.6':''}">
    <div class="top"><div style="flex:1"><div class="freq">${freqTxt(r)}${r.pausada?' · pausado':''}</div><div class="nm">${esc(r.descricao)}</div></div>
      <button class="iconbtn" onclick="openRec('${r.id}')" aria-label="Editar">${IC.edit}</button></div>
    <div class="val">${brl(r.valor)} <small>/ ${r.frequencia==='anual'?'ano':r.frequencia==='semanal'?'semana':r.frequencia==='quinzenal'?'15 dias':'mês'}</small></div>
    ${prog}
    <div class="meta">${r.ate?`Termina em <b>${mesNome(r.ate.slice(0,7))}</b>`:'Sem data para acabar'}${info.proxima?` · próximo: <b>${dBR(info.proxima)}</b>`:''}${k?` · ${esc(k.nome)}`:''}${r.destino?`<br><span class="mono">${esc(r.destino)}</span>`:''}</div>
    <div class="acts">
      ${info.proxima && !jaLancadaData(r, info.proxima) ? `<button class="btn xs ok" onclick="abrirRepeticao('${r.id}','${info.proxima}','ambas')">Pagar ${dBR(info.proxima).slice(0,5)}</button>` : ''}
      ${abertoDaRec(r) ? `<button class="btn xs ok" onclick="openPagar('${abertoDaRec(r).id}')">Pagar ${dBR(abertoDaRec(r).vencimento||'').slice(0,5)}</button>` : ''}
      ${r.destino?`<button class="iconbtn" onclick="copiar(this.dataset.v)" data-v="${esc(r.destino)}" aria-label="Copiar pix" title="Copiar pix">${IC.copy}</button>`:''}
      <div class="spacer"></div>
      <button class="btn xs ghost" onclick="pausarRec('${r.id}')">${r.pausada?'Reativar':'Pausar'}</button>
    </div></div>`;
}
const jaLancadaData = (r, d) => jaLancada(r, d);
const abertoDaRec = r => gastosDaRec(r).filter(g=>!g.pago).sort((a,b)=>(a.vencimento||'').localeCompare(b.vencimento||''))[0];

function renderFixos(){
  const fixRecs = DB.recorrencias.filter(r=>(r.tipo||'fixo')==='fixo');
  const ativos = fixRecs.filter(r=>!r.pausada && !recInfo(r).encerrada);
  const itensMes = fixosDoMes(mes);
  const pagoMes = itensMes.filter(i=>i.status==='pago').reduce((s,i)=>s+i.valor,0);
  const falta = itensMes.filter(i=>i.status!=='pago').reduce((s,i)=>s+i.valor,0);
  const restante = ativos.reduce((s,r)=>s+(recInfo(r).valorRestante||0),0);
  document.getElementById('kpiFixos').innerHTML =
    kpi('', IC.rep, 'Custo fixo mensal', brl(ativos.reduce((s,r)=>s+valorMensalRec(r),0)), plural(ativos.length,'contrato ativo','contratos ativos')) +
    kpi('ok', IC.check, `Pago em ${MESES[+mes.slice(5)-1]}`, brl(pagoMes), plural(itensMes.filter(i=>i.status==='pago').length,'pagamento')) +
    kpi('warn', IC.clock, `Falta em ${MESES[+mes.slice(5)-1]}`, brl(falta), plural(itensMes.filter(i=>i.status!=='pago').length,'pagamento')) +
    kpi('info', IC.trend, 'Ainda a pagar nos contratos', brl(restante), 'soma das parcelas que faltam');

  const meses = [0,1,2,3,4,5].map(d=>addMes(mes,d));
  const cols = meses.map(m=>{ const it = fixosDoMes(m); return {rotulo:mesCurto(m), destaque:m===mes, partes:[
    {v:it.filter(i=>i.status==='pago').reduce((s,i)=>s+i.valor,0), cor:CORES.verde, nome:'Pago'},
    {v:it.filter(i=>i.status==='aberto'||i.status==='vencido').reduce((s,i)=>s+i.valor,0), cor:CORES.ouro, nome:'Lançado, em aberto'},
    {v:it.filter(i=>i.status==='programado').reduce((s,i)=>s+i.valor,0), cor:CORES.pri, nome:'Previsto'}]}; });
  document.getElementById('gFixPrev').innerHTML = svgBarras(cols, {legenda:[{nome:'Pago',cor:CORES.verde},{nome:'Lançado, em aberto',cor:CORES.ouro},{nome:'Previsto',cor:CORES.pri}]});
  document.getElementById('gFixDias').innerHTML = diasDesembolsoHTML(mes);
  const ordem = fixRecs.slice().sort((a,b)=>{ const ia=recInfo(a), ib=recInfo(b); return (ia.encerrada-ib.encerrada) || (ia.proxima||'9').localeCompare(ib.proxima||'9'); });
  document.getElementById('fixCards').innerHTML = ordem.length ? ordem.map(cardContrato).join('') : `<div class="panel glass" style="grid-column:1/-1">${vazio('Nenhum custo fixo programado','Clique em "Novo custo fixo", diga o dia e quantos pagamentos são. O app conta 1/6, 2/6… sozinho.')}</div>`;
  const gs = doMes().filter(g=>g.tipo==='fixo');
  const [a,m] = mes.split('-').map(Number);
  const pend = recPendentes(`${mes}-01`, `${mes}-${pad(ultimoDia(a,m))}`).filter(x=>(x.r.tipo||'fixo')==='fixo');
  const linhas = [...gs.map(g=>({d:dataRef(g)||'', h:linhaGasto(g)})), ...pend.map(x=>({d:x.data, h:linhaRecPendente(x.r,x.data)}))].sort((x,y)=>x.d.localeCompare(y.d)).map(x=>x.h);
  document.getElementById('tbFixos').innerHTML = tabela(linhas, vazio(`Nenhum custo fixo em ${mesNome(mes)}`));
}

/* ---------- CUSTOS VARIÁVEIS ---------- */
function renderVariaveis(){
  const gs = doMes().filter(g=>g.tipo!=='fixo');
  const todos = DB.gastos.filter(g=>g.tipo!=='fixo'), nMeses = new Set(todos.map(g=>g.mes)).size || 1;
  const maior = gs.slice().sort((a,b)=>(+b.valor)-(+a.valor))[0];
  document.getElementById('kpiVar').innerHTML =
    kpi('', IC.cash, 'Variável do mês', brl(soma(gs)), plural(gs.length,'lançamento')) +
    kpi('info', IC.trend, 'Média mensal', brl(soma(todos)/nMeses), `com base em ${plural(nMeses,'mês','meses')}`) +
    kpi('ok', IC.check, 'Pago no mês', brl(soma(gs.filter(g=>g.pago))), `${gs.filter(g=>g.pago).length} de ${gs.length}`) +
    kpi('warn', IC.alert, 'Maior gasto', maior?brl(maior.valor):'—', maior?esc(maior.descricao):'nada no mês');
  const cats = itensPorCategoria(gs);
  document.getElementById('gVarCat').innerHTML = cats.length ? svgDonut(cats,'variável') : vazio('Sem custos variáveis neste mês');
  const meses = [-5,-4,-3,-2,-1,0].map(d=>addMes(mes,d));
  document.getElementById('gVarEvol').innerHTML = svgBarras(meses.map(m=>({rotulo:mesCurto(m), destaque:m===mes, partes:[{v:totaisDoMes(m).variavel, cor:CORES.ouro, nome:'Variável'}]})), {altura:200});
  document.getElementById('tbVar').innerHTML = tabela(gs.sort((a,b)=>(dataRef(a)||'').localeCompare(dataRef(b)||'')).map(linhaGasto), vazio(`Nada em ${mesNome(mes)}`,'Obra, material, compras pontuais.'));
}

/* ---------- RECORRÊNCIAS ---------- */
function renderRec(){
  const ativas = DB.recorrencias.filter(r=>!r.pausada && !recInfo(r).encerrada);
  const prox = recPendentes(hojeISO(), addDias(hojeISO(),45));
  document.getElementById('kpiRec').innerHTML =
    kpi('', IC.rep, 'Recorrências ativas', ativas.length, `de ${DB.recorrencias.length} cadastrada${DB.recorrencias.length!==1?'s':''}`) +
    kpi('info', IC.cash, 'Compromisso mensal', brl(ativas.reduce((s,r)=>s+valorMensalRec(r),0)), 'em base mensal') +
    kpi('warn', IC.clock, 'A lançar em 45 dias', brl(prox.reduce((s,x)=>s+(+x.r.valor||0),0)), plural(prox.length,'repetição','repetições'));
  const porDia = {}; prox.forEach(x=>{ (porDia[x.data]=porDia[x.data]||[]).push(x); });
  document.getElementById('recAgenda').innerHTML = Object.keys(porDia).length ? Object.keys(porDia).sort().map(d=>{
    const dt=new Date(d+'T00:00:00'), itens=porDia[d];
    return `<div class="agdia ${d===hojeISO()?'hoje':''}"><div class="agdata"><div class="d">${dt.getDate()}</div><div class="w">${DIAS[dt.getDay()]} · ${MES3[dt.getMonth()]}</div><div class="t">${brl(itens.reduce((s,x)=>s+(+x.r.valor||0),0))}</div></div>
      <div class="agitens">${itens.map(x=>`<div class="agitem rec" onclick="openRec('${x.r.id}')"><div style="flex:1"><div class="n">${esc(x.r.descricao)} ${parcelaRecTxt(x.r,x.data)?`<span class="chip parc">${parcelaRecTxt(x.r,x.data)}</span>`:''}</div><div class="s">${[x.r.forma,x.r.destino].filter(Boolean).map(esc).join(' · ')}</div></div><div class="v">${brl(x.r.valor)}</div><button class="btn xs ok" onclick="event.stopPropagation();abrirRepeticao('${x.r.id}','${x.data}','ambas')">Pagar</button></div>`).join('')}</div></div>`; }).join('')
    : vazio('Nada a repetir nos próximos 45 dias');
  document.getElementById('recCards').innerHTML = DB.recorrencias.slice().sort((a,b)=>(+b.valor||0)-(+a.valor||0)).map(cardContrato).join('') || `<div class="panel glass" style="grid-column:1/-1">${vazio('Nenhuma recorrência','Aluguel, internet, contabilidade: cadastre uma vez e o app lembra todo mês.')}</div>`;
}

/* ---------- RELATÓRIOS ---------- */
function presetRel(p){
  const h = hojeISO(); let de, ate=h;
  if(p==='mes'){ de = h.slice(0,7)+'-01'; const [a,m]=h.slice(0,7).split('-').map(Number); ate = `${h.slice(0,7)}-${pad(ultimoDia(a,m))}`; }
  else if(p==='30') de = addDias(h,-30);
  else if(p==='tri') de = addMeses(h,-3);
  else if(p==='ano') de = h.slice(0,4)+'-01-01';
  else { const ds = DB.gastos.map(dataRef).filter(Boolean).sort(); de = ds[0]||h; ate = ds[ds.length-1]>h?ds[ds.length-1]:h; }
  document.getElementById('relDe').value = de; document.getElementById('relAte').value = ate;
  document.querySelectorAll('#relSeg button').forEach(b=>b.classList.toggle('on', b.dataset.p===p));
  if(aba==='rel') renderRelatorio();
}
function gastosRel(){
  const de = document.getElementById('relDe').value, ate = document.getElementById('relAte').value;
  if(!de||!ate) return null;
  return DB.gastos.filter(g=>{ const d=dataRef(g); return d && d>=de && d<=ate; });
}
function renderRelatorio(){
  const de = document.getElementById('relDe').value, ate = document.getElementById('relAte').value, gs = gastosRel();
  document.getElementById('relCapa').textContent = `Relatório de gastos · ${de&&ate?dBR(de)+' a '+dBR(ate):''} · gerado em ${dBR(hojeISO())}`;
  if(!gs){ ['kpiRel','relCat','relTipo','relEvol'].forEach(id=>document.getElementById(id).innerHTML=''); document.getElementById('relTb').innerHTML = vazio('Escolha um intervalo'); return; }
  const nDias = Math.max(1, diasAte(ate)-diasAte(de)+1), fixo = soma(gs.filter(g=>g.tipo==='fixo')), vari = soma(gs.filter(g=>g.tipo!=='fixo'));
  document.getElementById('kpiRel').innerHTML =
    kpi('', IC.cash, 'Total no período', brl(soma(gs)), `${plural(gs.length,'lançamento')} · ${nDias} dias`) +
    kpi('ok', IC.check, 'Pago', brl(soma(gs.filter(g=>g.pago))), plural(gs.filter(g=>g.pago).length,'quitado')) +
    kpi('warn', IC.clock, 'Em aberto', brl(soma(gs.filter(g=>!g.pago))), plural(gs.filter(g=>!g.pago).length,'pendente')) +
    kpi('info', IC.trend, 'Média por mês', brl(soma(gs)/Math.max(1,nDias/30.4)), `${brl(soma(gs)/nDias)} por dia`);
  const cats = itensPorCategoria(gs);
  document.getElementById('relCat').innerHTML = cats.length ? svgDonut(cats,'período') : vazio('Sem gastos no período');
  document.getElementById('relTipo').innerHTML = (fixo+vari) ? svgDonut([{nome:'Custos fixos',cor:CORES.pri,total:fixo},{nome:'Custos variáveis',cor:CORES.ouro,total:vari}].filter(x=>x.total>0),'fixo × variável') : vazio('Sem gastos no período');
  const nM = difMeses(de.slice(0,7), ate.slice(0,7));
  const meses = nM<=12 ? Array.from({length:nM+1},(_,i)=>addMes(de.slice(0,7),i)) : Array.from({length:12},(_,i)=>addMes(ate.slice(0,7),i-11));
  document.getElementById('relEvol').innerHTML = svgBarras(meses.map(m=>{ const x=gs.filter(g=>(dataRef(g)||'').slice(0,7)===m);
    return {rotulo:mesCurto(m), partes:[{v:soma(x.filter(g=>g.tipo==='fixo')),cor:CORES.pri,nome:'Fixo'},{v:soma(x.filter(g=>g.tipo!=='fixo')),cor:CORES.ouro,nome:'Variável'}]}; }), {altura:210, legenda:[{nome:'Fixo',cor:CORES.pri},{nome:'Variável',cor:CORES.ouro}]});
  document.getElementById('relHint').textContent = `${dBR(de)} a ${dBR(ate)}`;
  document.getElementById('relTb').innerHTML = tabela(gs.slice().sort((a,b)=>(dataRef(a)||'').localeCompare(dataRef(b)||'')).map(linhaGasto), vazio(`Nada entre ${dBR(de)} e ${dBR(ate)}`));
}
function exportarCSV(){
  const gs = gastosRel(); if(!gs) return aviso('Escolha um intervalo antes de exportar.');
  const de = document.getElementById('relDe').value, ate = document.getElementById('relAte').value;
  const q = s => `"${String(s??'').replace(/"/g,'""')}"`;
  const linhas = [['Data','Descrição','Valor','Categoria','Tipo','Pagamento do contrato','Situação','Quem pagou','Reembolso','Forma','Pix/destino','Fornecedor','Observação','Comprovante 1','Obs. comprovante 1','Comprovante 2','Obs. comprovante 2'].join(';')];
  gs.slice().sort((a,b)=>(dataRef(a)||'').localeCompare(dataRef(b)||'')).forEach(g=>{
    const an = anexosDe(g);
    linhas.push([dBR(dataRef(g)), g.descricao, String(+g.valor||0).replace('.',','), cat(g.categoria_id)?.nome||'', g.tipo==='fixo'?'fixo':'variável', parcelaTxt(g),
      g.pago?'pago':(atrasado(g)?'vencido':'em aberto'), quemPagouTxt(g), g.reembolso==='pendente'?'pendente':g.reembolso==='feito'?'devolvido':'', formaTxt(g), g.destino||'', g.fornecedor||'', g.obs||'',
      an[0].url||'', an[0].obs||'', an[1].url||'', an[1].obs||''].map(q).join(';'));
  });
  const blob = new Blob(['﻿'+linhas.join('\n')],{type:'text/csv;charset=utf-8'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `gastos-clinica-${de}-a-${ate}.csv`; a.click();
  aviso('Planilha exportada.');
}

/* ---------- REEMBOLSOS ---------- */
function renderReembolsos(){
  const pend = DB.gastos.filter(g=>g.reembolso==='pendente'), feitos = DB.gastos.filter(g=>g.reembolso==='feito');
  document.getElementById('kpiReemb').innerHTML =
    kpi('warn', IC.swap, 'A devolver', brl(pend.reduce((s,g)=>s+valorReembolso(g),0)), plural(pend.length,'acerto')) +
    kpi('ok', IC.check, 'Já devolvido', brl(feitos.reduce((s,g)=>s+valorReembolso(g),0)), plural(feitos.length,'acerto'));
  const todos = [...pend, ...feitos].sort((a,b)=>(dataRef(b)||'').localeCompare(dataRef(a)||''));
  document.getElementById('tbReemb').innerHTML = todos.length ? `<div class="tw"><table><thead><tr><th>Gasto</th><th>Quem pagou</th><th>Quem devolve</th><th>Situação</th><th>Comprovantes</th><th class="num">Valor total</th><th class="num">Devolver</th><th></th></tr></thead><tbody>${todos.map(g=>{
    const p=pag(g.pagador_id), o=outraSocia(g.pagador_id);
    return `<tr><td><b>${esc(g.descricao)}</b><div class="sub-line">${dataDoGasto(g)?dBR(dataDoGasto(g)):'sem data'}</div></td>
      <td>${p?esc(p.nome):NADA}</td><td>${o?esc(o.nome):NADA}</td>
      <td>${g.reembolso==='pendente'?'<span class="chip warn">Pendente</span>':'<span class="chip ok">Devolvido</span>'}</td>
      <td>${anexosHTML(g, rotulosAnexo(g))}</td>
      <td class="num">${brl(g.valor)}</td><td class="num">${brl(valorReembolso(g))}</td>
      <td class="acts">${g.reembolso==='pendente'?`<button class="btn xs" onclick="openReembolso('${g.id}')">Marcar devolvido</button>`:''}<button class="iconbtn" onclick="openGasto('${g.id}')" aria-label="Editar">${IC.edit}</button></td></tr>`; }).join('')}</tbody></table></div>`
    : vazio('Nenhum reembolso','Quando você marcar "Só uma pagou" num gasto, o acerto aparece aqui (metade do valor).');
}

/* ---------- METAS ---------- */
const CORES_META = ['#B5563A','#C9922F','#7A8B45','#8C5A36','#9A4A32','#C49A6C'];
function calcMeta(m){
  const meta=+m.meta||0, ticket=+m.ticket||0, vendidos=+m.vendidos||0;
  const necessarios = ticket>0 ? Math.ceil(meta/ticket) : 0, faturado = vendidos*ticket, falta = Math.max(0, meta-faturado);
  const faltamTickets = ticket>0 ? Math.ceil(falta/ticket) : 0, pc = meta>0 ? faturado/meta*100 : 0;
  const dias = m.prazo ? diasAte(m.prazo) : null;
  const ritmoSem = (dias!==null && dias>0 && faltamTickets>0) ? faltamTickets/(dias/7) : null;
  return {meta,ticket,vendidos,necessarios,faturado,falta,faltamTickets,pc,dias,ritmoSem};
}
function renderMetas(){
  const ms = DB.metas;
  const tot = ms.reduce((a,m)=>{const x=calcMeta(m); a.meta+=x.meta; a.fat+=x.faturado; a.vend+=x.vendidos; return a;},{meta:0,fat:0,vend:0});
  const pcTot = tot.meta ? tot.fat/tot.meta*100 : 0;
  document.getElementById('metaGeral').innerHTML = ms.length ? svgGauge(pcTot, {rotulo:`${brl(tot.fat)} de ${brl(tot.meta)}`, sub:`faltam ${brl(Math.max(0,tot.meta-tot.fat))}`, tamanho:330}) : vazio('Sem metas ainda');
  document.getElementById('kpiMetas').innerHTML =
    kpi('', IC.trend, 'Meta total', brl(tot.meta), plural(ms.length,'produto')) +
    kpi('ok', IC.check, 'Faturado', brl(tot.fat), plural(tot.vend,'venda')) +
    kpi(tot.meta-tot.fat>0?'warn':'ok', IC.clock, 'Falta', brl(Math.max(0,tot.meta-tot.fat)), `${pcTot.toFixed(0)}% alcançado`) +
    kpi('info', IC.cash, 'Ticket médio', brl(tot.vend?tot.fat/tot.vend:(ms.reduce((s,m)=>s+(+m.ticket||0),0)/(ms.length||1))), 'por venda');
  document.getElementById('metaCards').innerHTML = ms.length ? ms.map((m,i)=>{
    const x = calcMeta(m), cor = m.cor || CORES_META[i%CORES_META.length];
    return `<div class="metacard glass">
      <div class="prod"><span class="dot" style="background:${cor}"></span>${esc(m.produto)}<div class="spacer"></div>
        <button class="iconbtn" onclick="openMeta('${m.id}')" aria-label="Editar">${IC.edit}</button><button class="iconbtn" onclick="excluir('metas','${m.id}')" aria-label="Excluir">${IC.del}</button></div>
      <div class="sub-line">${m.prazo?(x.dias<0?`prazo venceu há ${-x.dias} dias`:x.dias===0?'prazo é hoje':`${x.dias} dias até ${dBR(m.prazo)}`):'sem prazo definido'}</div>
      ${svgGauge(x.pc, {tamanho:230})}
      <div class="g4">
        <div><div class="mt">Meta</div><div class="mv">${brl(x.meta)}</div></div><div><div class="mt">Ticket</div><div class="mv">${brl(x.ticket)}</div></div>
        <div><div class="mt">Vendido</div><div class="mv">${x.vendidos} / ${x.necessarios}</div></div><div><div class="mt">Faturado</div><div class="mv">${brl(x.faturado)}</div></div>
      </div>
      <div class="falta ${x.falta<=0?'ok':''}">${x.falta<=0 ? `<b>Meta batida!</b>${x.faturado>x.meta?`Passou ${brl(x.faturado-x.meta)}.`:''}`
        : `<b>Faltam ${plural(x.faltamTickets,'venda')} · ${brl(x.falta)}</b>${x.ritmoSem!==null?`Ritmo para chegar no prazo: ~${x.ritmoSem.toFixed(1)} por semana.`:(x.dias!==null&&x.dias<=0?'O prazo passou: ajuste a data ou a meta.':'Defina um prazo para ver o ritmo semanal.')}`}</div>
      <div class="acts"><button class="btn sm" onclick="vendaMeta('${m.id}',1)">+1 venda</button><button class="btn sm ghost" onclick="vendaMeta('${m.id}',-1)">−1</button><button class="btn sm ghost" onclick="vendaMetaN('${m.id}')">Informar total</button></div>
    </div>`; }).join('') : `<div class="panel glass" style="grid-column:1/-1">${vazio('Nenhum produto ainda','Cadastre um produto com meta e ticket: o velocímetro mostra o quão perto vocês estão.')}</div>`;
}

/* ---------- CATEGORIAS ---------- */
function renderCategorias(){
  const gsMes = doMes();
  const linhas = DB.categorias.map(k=>({...k, mesTotal:soma(gsMes.filter(g=>g.categoria_id===k.id)), total:soma(DB.gastos.filter(g=>g.categoria_id===k.id)), qtd:DB.gastos.filter(g=>g.categoria_id===k.id).length})).sort((a,b)=>b.total-a.total);
  const cats = itensPorCategoria(DB.gastos);
  document.getElementById('gCatTot').innerHTML = cats.length ? svgDonut(cats,'acumulado') : vazio('Sem gastos ainda');
  const geral = soma(DB.gastos) || 1;
  document.getElementById('tbCat').innerHTML = linhas.length ? `<div class="tw"><table><thead><tr><th>Categoria</th><th class="num">Em ${MESES[+mes.slice(5)-1]}</th><th class="num">Acumulado</th><th class="num">Lançamentos</th><th>Peso</th><th></th></tr></thead><tbody>${linhas.map(k=>`<tr>
    <td>${chipCat(k)}</td><td class="num">${brl(k.mesTotal)}</td><td class="num"><b>${brl(k.total)}</b></td><td class="num">${k.qtd}</td>
    <td style="min-width:130px"><div class="track"><div class="fill" style="width:${(k.total/geral*100).toFixed(1)}%;background:linear-gradient(90deg,${k.cor||CORES.ouro},${k.cor||CORES.ouro}99)"></div></div></td>
    <td class="acts"><button class="iconbtn" onclick="openCat('${k.id}')" aria-label="Editar">${IC.edit}</button><button class="iconbtn" onclick="excluir('categorias','${k.id}')" aria-label="Excluir">${IC.del}</button></td></tr>`).join('')}</tbody></table></div>`
    : vazio('Nenhuma categoria');
}

/* ---------- ORÇAMENTOS FUTUROS ---------- */
function renderPrev(){
  const ps = DB.previsoes.slice().sort((a,b)=>(a.quando||'9').localeCompare(b.quando||'9'));
  const prox30 = ps.filter(p=>p.quando && diasAte(p.quando)>=0 && diasAte(p.quando)<=30), doMesSel = ps.filter(p=>(p.quando||'').slice(0,7)===mes);
  document.getElementById('kpiPrev').innerHTML =
    kpi('info', IC.cash, 'Total previsto', brl(soma(ps)), plural(ps.length,'item','itens')) +
    kpi('', IC.cal, `Previsto em ${MESES[+mes.slice(5)-1]}`, brl(soma(doMesSel)), plural(doMesSel.length,'item','itens')) +
    kpi('warn', IC.clock, 'Próximos 30 dias', brl(soma(prox30)), `${prox30.length} chegando`);
  document.getElementById('tbPrev').innerHTML = ps.length ? `<div class="tw"><table><thead><tr><th>O que é</th><th>Categoria</th><th>Data prevista</th><th>Pagamento</th><th>Anexos</th><th class="num">Valor</th><th></th></tr></thead><tbody>${ps.map(p=>{const parc=(+p.parcelas>1);return `<tr>
    <td><b>${esc(p.descricao)}</b>${p.fornecedor?`<div class="sub-line">${esc(p.fornecedor)}</div>`:''}${p.obs?`<div class="sub-line">${esc(p.obs)}</div>`:''}</td>
    <td>${chipCat(cat(p.categoria_id))}</td><td>${p.quando?dBR(p.quando):'<span class="muted">sem data</span>'}</td>
    <td>${p.forma?esc(p.forma):'<span class="muted">a definir</span>'}${parc?` · ${p.parcelas}x`:''}${p.destino?`<div class="sub-line mono">${esc(p.destino)}</div>`:''}</td>
    <td>${anexosHTML(p, ['orçamento 1','orçamento 2'])}</td>
    <td class="num">${brl(p.valor)}${parc?`<div class="sub-line">${p.parcelas}x ${brl((+p.valor||0)/(+p.parcelas))}</div>`:''}</td>
    <td class="acts"><button class="btn xs ghost" onclick="virarGasto('${p.id}')">Virar gasto</button><button class="iconbtn" onclick="openPrev('${p.id}')" aria-label="Editar">${IC.edit}</button><button class="iconbtn" onclick="excluir('previsoes','${p.id}')" aria-label="Excluir">${IC.del}</button></td></tr>`;}).join('')}</tbody></table></div>`
    : vazio('Nada previsto ainda','Cadastre o que já se sabe que vem: mobília, equipamento, taxa de alvará.');
}

/* ---------- ARQUIVOS ---------- */
const PASTAS = [
  {id:'contratos', nome:'Contratos', icon:'M9 12h6M9 16h6M8 4h8a2 2 0 012 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 012-2z'},
  {id:'licencas', nome:'Licenças e alvarás', icon:'M12 2l7 4v6c0 5-3 8-7 10-4-2-7-5-7-10V6z'},
  {id:'notas', nome:'Notas fiscais', icon:'M6 2h12v20l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6'},
  {id:'projetos', nome:'Projetos e plantas', icon:'M3 3h18v18H3zM3 9h18M9 9v12'},
  {id:'juridico', nome:'Jurídico', icon:'M12 3v18M5 7h14M7 7l-3 6h6zM17 7l-3 6h6z'},
  {id:'financeiro', nome:'Financeiro', icon:'M12 2v20M17 6H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6'},
  {id:'outros', nome:'Outros', icon:'M4 6a2 2 0 012-2h4l2 3h6a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2z'}
];
let pastaSel = null;
const pastaDe = id => PASTAS.find(p=>p.id===id) || PASTAS[PASTAS.length-1];
function statusValidade(a){
  if(!a.validade) return null;
  const dias = diasAte(a.validade);
  if(dias < 0) return {cls:'bad', txt:`Vencido há ${-dias} dia${dias!==-1?'s':''}`, dias};
  if(dias <= 30) return {cls:'warn', txt:`Vence em ${dias} dia${dias!==1?'s':''}`, dias};
  return {cls:'ok', txt:'Válido até '+dBR(a.validade), dias};
}
function selPasta(id){ pastaSel = (pastaSel===id ? null : id); renderArq(); }
function renderArq(){
  const q = (document.getElementById('arqBusca')?.value || '').toLowerCase().trim();
  document.getElementById('pastas').innerHTML = PASTAS.map(p=>{ const n = DB.arquivos.filter(a=>(a.pasta||'outros')===p.id).length;
    return `<button class="pasta glass ${pastaSel===p.id?'on':''}" onclick="selPasta('${p.id}')"><svg class="ico" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="${p.icon}"/></svg><div class="nm">${p.nome}</div><div class="qt">${plural(n,'arquivo')}</div></button>`; }).join('');
  const arqs = DB.arquivos.filter(a=>(!pastaSel || a.pasta===pastaSel) && (!q || [a.nome,a.obs,pastaDe(a.pasta).nome,...anexosDe(a).map(x=>x.obs)].join(' ').toLowerCase().includes(q)))
    .sort((a,b)=>{ const sa=statusValidade(a), sb=statusValidade(b); if(sa&&sb) return sa.dias-sb.dias; if(sa) return -1; if(sb) return 1; return a.nome.localeCompare(b.nome); });
  document.getElementById('arqListas').innerHTML = `<div class="panel glass"><header><h2>${pastaSel?pastaDe(pastaSel).nome:'Todos os arquivos'}</h2><span class="hint">${plural(arqs.length,'item','itens')}</span></header>
    ${arqs.length ? `<div class="tw"><table><thead><tr><th>Arquivo</th><th>Pasta</th><th>Validade</th><th>Links</th><th></th></tr></thead><tbody>${arqs.map(a=>{const s=statusValidade(a);return `<tr>
      <td><b>${esc(a.nome)}</b>${a.obs?`<div class="sub-line">${esc(a.obs)}</div>`:''}${a.responsavel?`<div class="sub-line">responsável: ${esc(a.responsavel)}</div>`:''}</td>
      <td><span class="chip cat">${esc(pastaDe(a.pasta).nome)}</span></td>
      <td>${s?`<span class="chip ${s.cls}">${s.txt}</span>`:'<span class="muted" style="font-size:12px">sem data</span>'}</td>
      <td>${anexosHTML(a, ['link 1','link 2'])}</td>
      <td class="acts"><button class="iconbtn" onclick="openArq('${a.id}')" aria-label="Editar">${IC.edit}</button><button class="iconbtn" onclick="excluir('arquivos','${a.id}')" aria-label="Excluir">${IC.del}</button></td></tr>`;}).join('')}</tbody></table></div>`
    : vazio(pastaSel?'Nada nesta pasta ainda':'Nenhum arquivo salvo','Guarde o link do contrato, do alvará, da planta. Com validade, o app avisa antes de vencer.')}</div>`;
}

// datas importantes do mês (embaixo do calendário)
function renderMarcosMes(){
  const host = document.getElementById('calMarcos'); if(!host) return;
  const [a,m] = mes.split('-').map(Number), de = `${mes}-01`, ate = `${mes}-${pad(ultimoDia(a,m))}`;
  const ms = DB.marcos.filter(x=>x.data && x.data<=ate && (x.data_fim||x.data)>=de).sort((x,y)=>x.data.localeCompare(y.data));
  const evs = DB.eventos.filter(x=>x.data && x.data<=ate && (x.data_fim||x.data)>=de);
  const itens = [...ms.map(x=>({d:x.data, h:`<div class="agitem marco" onclick="openMarco('${x.id}')"><div style="flex:1"><div class="n">${esc(x.titulo)}</div><div class="s">${dBR(x.data)}${x.data_fim?' a '+dBR(x.data_fim):''} · ${tipoMarcoTxt(x.tipo)}${x.obs?' · '+esc(x.obs):''}</div></div></div>`})),
    ...evs.map(x=>({d:x.data, h:`<div class="agitem evento" onclick="abrirEvento('${x.id}')"><div style="flex:1"><div class="n">${esc(x.nome)}</div><div class="s">${dBR(x.data)} · evento${x.local?' · '+esc(x.local):''}</div></div><div class="v">${brl(resumoEvento(x).tot)}</div></div>`}))].sort((x,y)=>x.d.localeCompare(y.d));
  host.innerHTML = `<header><h2>Datas importantes de ${MESES[m-1]}</h2><span class="spacer"></span><button class="btn sm ghost" onclick="openMarco(null)">${IC.plus}Nova data</button></header>
    <div class="pbody"><div class="agitens">${itens.map(x=>x.h).join('') || '<div class="dica">Nenhuma data marcada neste mês. Clique em um dia do calendário e escolha "Data importante".</div>'}</div></div>`;
}
