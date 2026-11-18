/* =========================================================
   extras.js — eventos, atas de reunião, datas importantes,
   busca geral, fornecedores por segmento e menu do celular
   ========================================================= */
const IC2 = {
  busca:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  festa:'<svg viewBox="0 0 24 24"><path d="M12 2l2.6 6.2L21 9l-5 4.5L17.5 20 12 16.8 6.5 20 8 13.5 3 9l6.4-.8z"/></svg>',
  ata:'<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M8 13h8M8 17h5"/></svg>',
  flag:'<svg viewBox="0 0 24 24"><path d="M4 22V4M4 4h13l-2 4 2 4H4"/></svg>',
  user:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg>',
  loja:'<svg viewBox="0 0 24 24"><path d="M3 7h18v13H3zM3 7l2-4h14l2 4M9 12h6"/></svg>',
  menu:'<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
  home:'<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/></svg>',
  down:'<svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg>',
  up:'<svg viewBox="0 0 24 24"><path d="M12 21V9M7 14l5-5 5 5M4 3h16"/></svg>',
  back:'<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>',
  pin:'<svg viewBox="0 0 24 24"><path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>'
};
const norm = s => String(s??'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const fmtHora = d => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/* anel de progresso simples */
function anel(pct, {tam=74, esp=8, cor}={}){
  const R = (tam-esp)/2, C = 2*Math.PI*R, p = Math.max(0, Math.min(100, pct));
  const c = cor || (pct>100 ? CORES.verm : pct>85 ? CORES.ouro : CORES.verde);
  return `<div class="anel" style="width:${tam}px;height:${tam}px"><svg width="${tam}" height="${tam}">
    <circle cx="${tam/2}" cy="${tam/2}" r="${R}" fill="none" stroke="var(--linha-2)" stroke-width="${esp}"/>
    <circle cx="${tam/2}" cy="${tam/2}" r="${R}" fill="none" stroke="${c}" stroke-width="${esp}" stroke-linecap="round" stroke-dasharray="${C*p/100} ${C}" transform="rotate(-90 ${tam/2} ${tam/2})"/></svg>
    <b style="font-size:${tam<70?12:14}px">${Math.round(pct)}%</b></div>`;
}

/* =========================================================
   ESCOLHER O QUE CADASTRAR (dia do calendário / botão +)
   ========================================================= */
function escolherNoDia(iso){
  iso = iso || hojeISO();
  abrir(`${hdr(iso===hojeISO()?'O que você quer cadastrar?':`Cadastrar em ${dBR(iso)}`)}
    <div class="mbody"><div class="escolha">
      <button style="background:var(--grad-pri)" onclick="fechar();openGasto(null,null,{venc:'${iso}'})">${IC.cash}<b>Pagamento</b><span>conta, gasto ou parcela</span></button>
      <button style="background:var(--grad-pessego)" onclick="fechar();openMarco(null,'${iso}')">${IC2.flag}<b>Data importante</b><span>marco, prazo, serviço</span></button>
      <button style="background:var(--grad-salvia)" onclick="fechar();novaAta('${iso}')">${IC2.ata}<b>Reunião</b><span>abre a ata para escrever</span></button>
      <button style="background:var(--grad-azul)" onclick="fechar();openEvento(null,'${iso}')">${IC2.festa}<b>Evento</b><span>com orçamento e custos</span></button>
    </div></div>`);
}

/* =========================================================
   DATAS IMPORTANTES (marcos)
   ========================================================= */
const TIPOS_MARCO = [['evento','Evento'],['servico','Serviço'],['prazo','Prazo'],['acontecimento','Acontecimento'],['outro','Outro']];
const tipoMarcoTxt = t => (TIPOS_MARCO.find(x=>x[0]===t)||TIPOS_MARCO[4])[1];
let mTipo = 'evento';
function setMTipo(t){ mTipo=t; marcaSeg('mtipo',t); }
function openMarco(id, iso){
  const m = id ? DB.marcos.find(x=>x.id===id) : null;
  mTipo = m?.tipo || 'evento';
  abrir(`${hdr(m?'Editar data importante':'Nova data importante','aparece no calendário e nos lembretes 14 dias antes')}
    <div class="mbody"><div class="fgrid">
      <div class="f full"><label>O que é</label><input id="mk-tit" value="${esc(m?.titulo)}" placeholder="Inauguração, vistoria, entrega dos móveis"></div>
      <div class="f"><label>Dia</label><input id="mk-data" type="date" value="${m?.data||iso||hojeISO()}"></div>
      <div class="f"><label>Até (se durar mais de um dia)</label><input id="mk-fim" type="date" value="${m?.data_fim||''}"></div>
      <div class="f full"><label>Tipo</label>${seg2('mtipo', TIPOS_MARCO, mTipo, 'setMTipo')}</div>
      <div class="f full"><label>Observação</label><textarea id="mk-obs" placeholder="Horário, endereço, quem vai">${esc(m?.obs)}</textarea></div>
    </div></div>
    <div class="mfoot">${id?`<button class="btn ghost" style="margin-right:auto" onclick="excluir('marcos','${id}')">Excluir</button>`:''}<button class="btn ghost" onclick="fechar()">Cancelar</button><button class="btn" onclick="salvarMarco('${id||''}')">Salvar</button></div>`);
}
async function salvarMarco(id){
  const titulo = val('mk-tit'), data = val('mk-data');
  if(!titulo) return aviso('Diga o que é.'); if(!data) return aviso('Escolha o dia.');
  const fim = val('mk-fim');
  const antigo = id ? DB.marcos.find(x=>x.id===id) : null;
  if(await salvar('marcos',{id:id||novoId(), titulo, data, data_fim: fim && fim>data ? fim : null, tipo:mTipo, obs:val('mk-obs')||null, criado:antigo?.criado||new Date().toISOString()})){ fechar(); render(); aviso('Data salva no calendário.'); }
}

/* =========================================================
   EVENTOS — orçamento, custos e mini painel
   ========================================================= */
const CATS_EVENTO = ['Espaço','Buffet e bebidas','Decoração','Som e luz','Foto e vídeo','Brindes e sacolas','Convites e gráfica','Equipe','Transporte','Outros'];
const STATUS_CUSTO = [['orcado','Orçado'],['fechado','Fechado'],['pago','Pago']];
const CORES_STATUS = {orcado:CORES.azul, fechado:CORES.ouro, pago:CORES.verde};
let eventoSel = null, evFiltro = 'proximos';
const custosDo = id => DB.evento_custos.filter(c=>c.evento_id===id);
function resumoEvento(e){
  const cs = custosDo(e.id), tot = soma(cs), pago = soma(cs.filter(c=>c.status==='pago')), fechado = soma(cs.filter(c=>c.status==='fechado')), orcado = soma(cs.filter(c=>c.status!=='pago'&&c.status!=='fechado'));
  const orc = +e.orcamento||0;
  return {cs, tot, pago, fechado, orcado, aPagar: tot-pago, orc, saldo: orc-tot, pct: orc ? tot/orc*100 : 0};
}
function quandoEvento(e){
  if(!e.data) return 'sem data';
  const n = diasAte(e.data), fim = e.data_fim && e.data_fim>e.data ? e.data_fim : e.data;
  if(n>0) return n===1 ? 'amanhã' : `em ${n} dias`;
  if(diasAte(fim)>=0) return 'acontecendo';
  return 'realizado';
}
function abrirEvento(id){ eventoSel = id; if(aba!=='eventos') irPara('eventos'); else render(); window.scrollTo({top:0}); }
function setEvFiltro(f){ evFiltro=f; renderEventos(); }
function renderEventos(){
  const host = document.getElementById('evConteudo');
  const e = eventoSel ? DB.eventos.find(x=>x.id===eventoSel) : null;
  if(e) return renderEventoDetalhe(e, host);
  eventoSel = null;
  document.getElementById('evHead').style.display = '';
  const todos = DB.eventos.slice().sort((a,b)=>(a.data||'9').localeCompare(b.data||'9'));
  const prox = todos.filter(e=>!e.data || quandoEvento(e)!=='realizado');
  const lista = evFiltro==='proximos' ? prox : evFiltro==='realizados' ? todos.filter(e=>quandoEvento(e)==='realizado').reverse() : todos;
  const somaR = f => prox.reduce((s,e)=>s+resumoEvento(e)[f],0);
  host.innerHTML = `<div class="kpis">
      ${kpi('', IC2.festa, 'Próximos eventos', prox.length, prox[0]?`próximo: ${esc(prox[0].nome)}`:'nenhum programado')}
      ${kpi('info', IC.trend, 'Orçamento previsto', brl(prox.reduce((s,e)=>s+(+e.orcamento||0),0)), 'soma dos próximos')}
      ${kpi('warn', IC.cash, 'Custos levantados', brl(somaR('tot')), `${brl(somaR('aPagar'))} ainda a pagar`)}
      ${kpi('ok', IC.check, 'Já pago', brl(somaR('pago')), 'nos próximos eventos')}
    </div>
    <div class="seg glass" style="margin-bottom:16px">${[['proximos','Próximos'],['realizados','Realizados'],['todos','Todos']].map(([v,t])=>`<button class="${evFiltro===v?'on':''}" onclick="setEvFiltro('${v}')">${t}</button>`).join('')}</div>
    <div class="cards">${lista.map(e=>{ const r=resumoEvento(e), q=quandoEvento(e);
      return `<div class="evcard glass" onclick="abrirEvento('${e.id}')">
        <div><div class="nm">${esc(e.nome)}</div>
          <div class="sub">${e.data?dBR(e.data):'sem data'}${e.data_fim&&e.data_fim>e.data?' a '+dBR(e.data_fim):''}${e.local?' · '+esc(e.local):''}</div>
          <div style="margin-top:10px"><span class="chip ${q==='realizado'?'cat':q==='acontecendo'?'ok':'warn'}">${q}</span></div></div>
        ${r.orc ? anel(r.pct) : `<div class="anel" style="width:74px;height:74px;border-radius:50%;background:var(--input)"><b style="font-size:11px;color:var(--tx-3)">sem<br>orçam.</b></div>`}
        <div class="rodape"><span>Custos <b>${brl(r.tot)}</b></span><span>Pago <b>${brl(r.pago)}</b></span>${r.orc?`<span>${r.saldo>=0?'Sobra':'Passou'} <b style="color:${r.saldo>=0?'var(--ok)':'var(--bad)'}">${brl(Math.abs(r.saldo))}</b></span>`:''}<span class="spacer"></span><span>${plural(r.cs.length,'custo')}</span></div>
      </div>`; }).join('') || `<div class="panel glass" style="grid-column:1/-1">${vazio(evFiltro==='realizados'?'Nenhum evento realizado ainda':'Nenhum evento por aqui','Clique em "Novo evento", dê um nome, a data e o orçamento. Depois é só ir lançando os custos.')}</div>`}</div>`;
}
let qStatus = 'orcado';
function renderEventoDetalhe(e, host){
  document.getElementById('evHead').style.display = 'none';
  const r = resumoEvento(e), q = quandoEvento(e);
  const cats = Object.entries(r.cs.reduce((a,c)=>{ const k=c.categoria||'Outros'; a[k]=(a[k]||0)+(+c.valor||0); return a; },{}))
    .map(([nome,total],i)=>({nome,total,cor:[CORES.pri,CORES.ouro,CORES.verde,CORES.azul,CORES.verm,CORES.marrom,'#D27A4F','#A3B96A','#8C5A36','#E9BC52'][i%10]})).sort((a,b)=>b.total-a.total);
  const ordem = r.cs.slice().sort((a,b)=>(a.vencimento||'9').localeCompare(b.vencimento||'9') || (b.valor-a.valor));
  host.innerHTML = `
    <button class="voltar" onclick="abrirEvento(null)">${IC2.back}Todos os eventos</button>
    <div class="head">
      <div><div class="eyebrow">${IC2.festa.replace('<svg','<svg width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"')} Evento · ${q}</div><h1>${esc(e.nome)}</h1>
        <p class="desc">${e.data?dBR(e.data):'sem data'}${e.data_fim&&e.data_fim>e.data?' a '+dBR(e.data_fim):''}${e.local?' · '+esc(e.local):''}${e.obs?' · '+esc(e.obs):''}</p></div>
      <div class="spacer"></div>
      <button class="btn ghost keep" onclick="openEvento('${e.id}')">${IC.edit}Editar evento</button>
      <button class="btn keep" onclick="openCustoEvento(null,'${e.id}')">${IC.plus}Novo custo</button>
    </div>
    <div class="kpis">
      ${kpi('', IC.trend, 'Orçamento', r.orc?brl(r.orc):'—', r.orc?`${r.pct.toFixed(0)}% já comprometido`:'defina em "Editar evento"')}
      ${kpi('warn', IC.cash, 'Custos levantados', brl(r.tot), plural(r.cs.length,'item','itens'))}
      ${kpi('ok', IC.check, 'Pago', brl(r.pago), `${brl(r.aPagar)} a pagar`)}
      ${kpi(r.orc && r.saldo<0?'bad':'info', r.orc && r.saldo<0?IC.alert:IC.swap, r.orc && r.saldo<0?'Passou do orçamento':'Sobra no orçamento', r.orc?brl(Math.abs(r.saldo)):'—', r.orc?(r.saldo<0?'reveja os custos':'margem disponível'):'sem orçamento definido')}
    </div>
    <div class="grid-3-2 row">
      <div class="panel glass"><header><h2>Para onde vai o dinheiro</h2><span class="hint">por tipo de custo</span></header><div class="pbody">${cats.length?svgDonut(cats,'custos'):vazio('Sem custos ainda','Use a linha abaixo para ir lançando.')}</div></div>
      <div class="panel glass"><header><h2>Situação</h2></header><div class="pbody">
        <div style="display:flex;justify-content:center;margin-bottom:8px">${r.orc?anel(r.pct,{tam:120,esp:12}):''}</div>
        ${hbars(STATUS_CUSTO.map(([k,t])=>({nome:t, cor:CORES_STATUS[k], total:soma(r.cs.filter(c=>(c.status||'orcado')===k)), sub:plural(r.cs.filter(c=>(c.status||'orcado')===k).length,'item','itens')})).filter(x=>x.total>0), '<div class="dica" style="text-align:center">Nada lançado ainda.</div>')}
      </div></div>
    </div>
    <div class="panel glass">
      <header><h2>Custos do evento</h2><span class="hint">lançamento rápido: preencha e aperte Enter</span></header>
      <div class="quick" onkeydown="if(event.key==='Enter'){event.preventDefault();addCustoRapido('${e.id}')}">
        <div class="f"><label>Descrição</label><input id="q-desc" placeholder="ex: Buffet para 80 pessoas"></div>
        <div class="f"><label>Tipo</label><input id="q-cat" list="catsev" placeholder="Buffet e bebidas"><datalist id="catsev">${catsEvento().map(c=>`<option value="${esc(c)}">`).join('')}</datalist></div>
        <div class="f"><label>Fornecedor</label><input id="q-forn" list="fornlistq" placeholder="opcional">${listaForn('fornlistq')}</div>
        <div class="f"><label>Valor</label><input id="q-valor" type="number" step="0.01" inputmode="decimal" placeholder="0,00"></div>
        <div class="f"><label>Situação</label><select id="q-status">${STATUS_CUSTO.map(([k,t])=>`<option value="${k}" ${qStatus===k?'selected':''}>${t}</option>`).join('')}</select></div>
        <button class="btn" onclick="addCustoRapido('${e.id}')">${IC.plus}Adicionar</button>
      </div>
      ${ordem.length?`<div class="tw"><table><thead><tr><th>Custo</th><th>Tipo</th><th>Vencimento</th><th>Situação</th><th>Anexos</th><th class="num">Valor</th><th></th></tr></thead><tbody>${ordem.map(c=>`<tr>
        <td><b>${esc(c.descricao)}</b>${c.fornecedor?`<div class="sub-line">${esc(c.fornecedor)}</div>`:''}${c.obs?`<div class="sub-line">${esc(c.obs)}</div>`:''}</td>
        <td><span class="chip cat">${esc(c.categoria||'Outros')}</span></td>
        <td>${c.vencimento?dBR(c.vencimento):NADA}${c.vencimento&&c.status!=='pago'?`<div class="sub-line">${quandoTxt(c.vencimento)}</div>`:''}</td>
        <td><select onchange="mudarStatusCusto('${c.id}',this.value)" style="width:auto;padding:5px 30px 5px 10px;font-size:12px;border-radius:99px;font-weight:700;color:${CORES_STATUS[c.status||'orcado']}">${STATUS_CUSTO.map(([k,t])=>`<option value="${k}" ${(c.status||'orcado')===k?'selected':''}>${t}</option>`).join('')}</select></td>
        <td>${anexosHTML(c,['anexo 1','anexo 2'])}</td>
        <td class="num">${brl(c.valor)}</td>
        <td class="acts"><button class="iconbtn" onclick="openCustoEvento('${c.id}','${e.id}')" aria-label="Editar">${IC.edit}</button><button class="iconbtn" onclick="excluir('evento_custos','${c.id}')" aria-label="Excluir">${IC.del}</button></td></tr>`).join('')}</tbody></table></div>`
      : vazio('Nenhum custo lançado','Comece pela linha acima: descrição, valor e Enter.')}
    </div>`;
}
const catsEvento = () => [...new Set([...CATS_EVENTO, ...DB.evento_custos.map(c=>c.categoria).filter(Boolean)])];
async function addCustoRapido(evId){
  const descricao = val('q-desc'), valor = num('q-valor');
  if(!descricao) return aviso('Escreva o que é o custo.');
  if(!(valor>=0)) return aviso('Informe o valor.');
  qStatus = val('q-status') || 'orcado';
  const ok = await salvar('evento_custos',{id:novoId(), evento_id:evId, descricao, categoria:val('q-cat')||null, fornecedor:val('q-forn')||null, valor, status:qStatus, vencimento:null, anexos:[], obs:null, criado:new Date().toISOString()});
  if(!ok) return;
  render(); aviso('Custo adicionado.');
  setTimeout(()=>document.getElementById('q-desc')?.focus(), 30);
}
async function mudarStatusCusto(id, st){
  const c = DB.evento_custos.find(x=>x.id===id); if(!c) return;
  if(await salvar('evento_custos',{...c, status:st})){ render(); aviso(`Marcado como ${st==='pago'?'pago':st==='fechado'?'fechado':'orçado'}.`); }
}
let ecStatus='orcado';
function setEcStatus(s){ ecStatus=s; marcaSeg('ecst',s); }
function openCustoEvento(id, evId){
  const c = id ? DB.evento_custos.find(x=>x.id===id) : null;
  const ev = DB.eventos.find(x=>x.id===(c?.evento_id||evId));
  ecStatus = c?.status || 'orcado';
  abrir(`${hdr(c?'Editar custo':'Novo custo', ev?esc(ev.nome):'')}
    <div class="mbody"><div class="fgrid">
      <div class="f full"><label>Descrição</label><input id="ec-desc" value="${esc(c?.descricao)}" placeholder="Buffet, decoração, sacolas personalizadas"></div>
      <div class="f"><label>Valor</label><input id="ec-valor" type="number" step="0.01" value="${c?.valor??''}" placeholder="0,00"></div>
      <div class="f"><label>Vencimento / data de pagamento</label><input id="ec-venc" type="date" value="${c?.vencimento||''}"></div>
      <div class="f"><label>Tipo de custo</label><input id="ec-cat" list="catsev2" value="${esc(c?.categoria)}" placeholder="Buffet e bebidas"><datalist id="catsev2">${catsEvento().map(x=>`<option value="${esc(x)}">`).join('')}</datalist></div>
      <div class="f"><label>Fornecedor</label><input id="ec-forn" list="fornlist5" value="${esc(c?.fornecedor)}" placeholder="opcional">${listaForn('fornlist5')}</div>
      <div class="f full"><label>Situação</label>${seg2('ecst', STATUS_CUSTO, ecStatus, 'setEcStatus')}<div class="dica">Orçado = só cotação · Fechado = contratado, falta pagar · Pago</div></div>
      ${camposAnexos('ec', anexosDe(c), ['Orçamento / contrato','Comprovante'])}
      <div class="f full"><label>Observação</label><textarea id="ec-obs" placeholder="Condições, quantidade, contato">${esc(c?.obs)}</textarea></div>
    </div></div>
    <div class="mfoot">${id?`<button class="btn ghost" style="margin-right:auto" onclick="excluir('evento_custos','${id}')">Excluir</button>`:''}<button class="btn ghost" onclick="fechar()">Cancelar</button><button class="btn" onclick="salvarCustoEvento('${id||''}','${ev?.id||''}')">Salvar custo</button></div>`);
}
async function salvarCustoEvento(id, evId){
  const descricao = val('ec-desc'), valor = num('ec-valor');
  if(!descricao) return aviso('Escreva o que é o custo.');
  const antigo = id ? DB.evento_custos.find(x=>x.id===id) : null, anexos = lerAnexos('ec');
  if(await salvar('evento_custos',{id:id||novoId(), evento_id:antigo?.evento_id||evId, descricao, valor:valor||0, vencimento:val('ec-venc')||null, categoria:val('ec-cat')||null, fornecedor:val('ec-forn')||null, status:ecStatus, anexos, obs:val('ec-obs')||null, criado:antigo?.criado||new Date().toISOString()})){ fechar(); render(); aviso('Custo salvo.'); }
}
function openEvento(id, iso){
  const e = id ? DB.eventos.find(x=>x.id===id) : null;
  abrir(`${hdr(e?'Editar evento':'Novo evento')}
    <div class="mbody"><div class="fgrid">
      <div class="f full"><label>Nome do evento</label><input id="ev-nome" value="${esc(e?.nome)}" placeholder="Inauguração da clínica, workshop, ação de Natal"></div>
      <div class="f"><label>Data</label><input id="ev-data" type="date" value="${e?.data||iso||''}"></div>
      <div class="f"><label>Até (se durar mais de um dia)</label><input id="ev-fim" type="date" value="${e?.data_fim||''}"></div>
      <div class="f"><label>Orçamento total</label><input id="ev-orc" type="number" step="0.01" value="${e?.orcamento??''}" placeholder="quanto podem gastar"></div>
      <div class="f"><label>Local</label><input id="ev-local" value="${esc(e?.local)}" placeholder="opcional"></div>
      <div class="f full"><label>Observação</label><textarea id="ev-obs" placeholder="Público, objetivo, quem organiza">${esc(e?.obs)}</textarea></div>
    </div></div>
    <div class="mfoot">${id?`<button class="btn ghost" style="margin-right:auto" onclick="excluirEvento('${id}')">Excluir</button>`:''}<button class="btn ghost" onclick="fechar()">Cancelar</button><button class="btn" onclick="salvarEvento('${id||''}')">${id?'Salvar':'Criar evento'}</button></div>`);
}
async function salvarEvento(id){
  const nome = val('ev-nome'); if(!nome) return aviso('Dê um nome ao evento.');
  const antigo = id ? DB.eventos.find(x=>x.id===id) : null, data = val('ev-data')||null, fim = val('ev-fim');
  const nid = id || novoId();
  if(await salvar('eventos',{id:nid, nome, data, data_fim: fim && data && fim>data ? fim : null, local:val('ev-local')||null, orcamento:num('ev-orc')||null, status:antigo?.status||null, cor:antigo?.cor||null, obs:val('ev-obs')||null, criado:antigo?.criado||new Date().toISOString()})){
    fechar(); aviso(id?'Evento atualizado.':'Evento criado. Agora é só ir lançando os custos.'); abrirEvento(nid);
  }
}
async function excluirEvento(id){
  const cs = custosDo(id);
  if(!confirm(`Excluir este evento${cs.length?` e os ${cs.length} custos dele`:''}? Não dá para desfazer.`)) return;
  for(const c of cs) await remover('evento_custos', c.id);
  if(await remover('eventos', id)){ eventoSel=null; fechar(); render(); aviso('Evento excluído.'); }
}

/* =========================================================
   ATAS DE REUNIÃO
   ========================================================= */
let ataSel = null, ataTimer = null, ataFila = Promise.resolve();
function abrirAta(id){ ataSel = id; if(aba!=='atas') irPara('atas'); else renderAtas(); }
async function novaAta(iso){
  const a = {id:novoId(), titulo:'Reunião', data:iso||hojeISO(), participantes:null, texto:'', criado:new Date().toISOString(), atualizado:new Date().toISOString()};
  if(!await salvar('atas', a)) return;
  ataSel = a.id; if(aba!=='atas') irPara('atas'); else render();
  setTimeout(()=>{ const t=document.getElementById('ata-tit'); if(t){ t.focus(); t.select(); } }, 60);
}
function atasFiltradas(){
  const q = norm(document.getElementById('ataBusca')?.value||'');
  return DB.atas.filter(a=>!q || norm([a.titulo,a.participantes,a.texto].join(' ')).includes(q)).sort((a,b)=>(b.data||'').localeCompare(a.data||'') || (b.criado||'').localeCompare(a.criado||''));
}
function renderAtaLista(){
  const host = document.getElementById('ataLista'); if(!host) return;
  const l = atasFiltradas();
  host.innerHTML = l.length ? l.map(a=>{ const [y,m,d]=(a.data||'----').split('-');
    return `<button class="ataitem ${ataSel===a.id?'on':''}" onclick="abrirAta('${a.id}')"><div class="dt"><b>${d||'–'}</b><span>${m?MES3[+m-1]:''}</span></div>
      <div><div class="t">${esc(a.titulo||'Sem título')}</div><div class="s">${esc((a.texto||'').slice(0,90)||'sem texto ainda')}</div></div></button>`; }).join('')
    : vazio('Nenhuma ata', 'Clique em "Nova reunião" para começar.');
}
function renderAtas(){
  if(ataSel && !DB.atas.find(a=>a.id===ataSel)) ataSel = null;
  if(!ataSel && DB.atas.length) ataSel = atasFiltradas()[0]?.id || null;
  renderAtaLista();
  const a = DB.atas.find(x=>x.id===ataSel), host = document.getElementById('ataEditor');
  host.innerHTML = a ? `<div class="ataeditor">
      <div class="cab"><input id="ata-tit" class="titulo" value="${esc(a.titulo)}" placeholder="Título da reunião" oninput="ataMudou()">
        <input id="ata-data" type="date" value="${a.data||''}" onchange="ataMudou()"></div>
      <div class="f" style="margin-bottom:12px"><label>Participantes</label><input id="ata-part" value="${esc(a.participantes)}" placeholder="Vitória, Sabrina, contador…" oninput="ataMudou()"></div>
      <textarea id="ata-txt" class="texto" placeholder="Pauta, o que foi decidido, próximos passos e responsáveis…" oninput="ataMudou()">${esc(a.texto)}</textarea>
      <div class="rod"><span id="ata-status">${a.atualizado?'Salvo às '+fmtHora(new Date(a.atualizado)):''}</span><span class="spacer"></span>
        <button class="btn sm ghost" onclick="baixarAta('${a.id}')">${IC2.down}Baixar .txt</button>
        <button class="btn sm ghost" onclick="excluirAta('${a.id}')">${IC.del}Excluir</button></div>
    </div>` : `<div class="ataeditor">${vazio('Nenhuma reunião selecionada','Crie uma nova reunião e escreva a ata aqui mesmo. Ela salva sozinha enquanto você digita.')}</div>`;
}
// salva sozinho enquanto digita (sem redesenhar o editor)
function ataMudou(){
  const st = document.getElementById('ata-status'); if(st) st.textContent = 'Salvando…';
  clearTimeout(ataTimer);
  ataTimer = setTimeout(()=>{
    const a = DB.atas.find(x=>x.id===ataSel); if(!a) return;
    const novo = {...a, titulo:val('ata-tit')||'Reunião', data:val('ata-data')||a.data, participantes:val('ata-part')||null, texto:document.getElementById('ata-txt').value, atualizado:new Date().toISOString()};
    ataFila = ataFila.then(async ()=>{
      const ok = await salvar('atas', novo);
      const s = document.getElementById('ata-status'); if(s) s.textContent = ok ? 'Salvo às '+fmtHora(new Date()) : 'Não salvou: veja o aviso no topo';
      renderAtaLista();
    });
  }, 700);
}
function baixarAta(id){
  const a = DB.atas.find(x=>x.id===id); if(!a) return;
  const txt = `${a.titulo}\nData: ${dBR(a.data)}\n${a.participantes?'Participantes: '+a.participantes+'\n':''}\n${a.texto||''}`;
  const el = document.createElement('a'); el.href = URL.createObjectURL(new Blob([txt],{type:'text/plain;charset=utf-8'}));
  el.download = `ata-${a.data||'sem-data'}-${norm(a.titulo).replace(/[^a-z0-9]+/g,'-')}.txt`; el.click();
}
async function excluirAta(id){
  if(!confirm('Excluir esta ata? Não dá para desfazer.')) return;
  clearTimeout(ataTimer);
  if(await remover('atas', id)){ ataSel = null; render(); aviso('Ata excluída.'); }
}

/* =========================================================
   FORNECEDORES por segmento + importação
   ========================================================= */
const SEG_SUGESTOES = ['Eventos','Sacolas e embalagens','Brindes','Gráfica','Obra e reforma','Móveis e decoração','Equipamentos','Marketing','Serviços','Contabilidade e jurídico'];
let fornSeg = '';
const segmentos = () => [...new Set(DB.fornecedores.map(f=>(f.segmento||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
function setFornSeg(s){ fornSeg = fornSeg===s ? '' : s; renderForn(); }
function renderForn(){
  const q = norm(document.getElementById('fornBusca')?.value||'');
  const segs = segmentos(), semSeg = DB.fornecedores.filter(f=>!f.segmento).length;
  document.getElementById('fornChips').innerHTML = `<button class="chipbtn ${!fornSeg?'on':''}" onclick="setFornSeg('')">Todos <span class="n">${DB.fornecedores.length}</span></button>`
    + segs.map(s=>`<button class="chipbtn ${fornSeg===s?'on':''}" onclick="setFornSeg(this.dataset.s)" data-s="${esc(s)}">${esc(s)} <span class="n">${DB.fornecedores.filter(f=>f.segmento===s).length}</span></button>`).join('')
    + (semSeg?`<button class="chipbtn ${fornSeg==='-'?'on':''}" onclick="setFornSeg('-')">Sem segmento <span class="n">${semSeg}</span></button>`:'');
  const fs = DB.fornecedores.filter(f=>(!fornSeg || (fornSeg==='-' ? !f.segmento : f.segmento===fornSeg)) && (!q || norm([f.nome,f.segmento,f.pix,f.contato,f.obs,cat(f.categoria_id)?.nome].join(' ')).includes(q)))
    .sort((a,b)=>a.nome.localeCompare(b.nome));
  document.getElementById('tbForn').innerHTML = fs.length ? `<div class="tw"><table><thead><tr><th>Fornecedor</th><th>Segmento</th><th>Contato</th><th>Chave pix</th><th class="num">Já pago</th><th></th></tr></thead><tbody>${fs.map(f=>{
    const nomeN = norm(f.nome.trim());
    const pagoTot = soma(DB.gastos.filter(g=>g.pago && norm((g.fornecedor||'').trim())===nomeN)) + soma(DB.evento_custos.filter(c=>c.status==='pago' && norm((c.fornecedor||'').trim())===nomeN));
    return `<tr><td><b>${esc(f.nome)}</b>${f.obs?`<div class="sub-line">${esc(f.obs)}</div>`:''}</td>
      <td>${f.segmento?`<span class="chip rec">${esc(f.segmento)}</span>`:NADA}</td>
      <td>${f.contato?esc(f.contato):NADA}</td>
      <td><span class="mono" style="font-size:12.5px">${esc(f.pix||'—')}</span>${f.pix?`<button class="iconbtn" onclick="copiar(this.dataset.v)" data-v="${esc(f.pix)}" aria-label="Copiar pix">${IC.copy}</button>`:''}</td>
      <td class="num">${pagoTot?brl(pagoTot):NADA}</td>
      <td class="acts"><button class="btn xs ghost" onclick="gastoDoForn('${f.id}')">Lançar gasto</button><button class="iconbtn" onclick="openForn('${f.id}')" aria-label="Editar">${IC.edit}</button><button class="iconbtn" onclick="excluir('fornecedores','${f.id}')" aria-label="Excluir">${IC.del}</button></td></tr>`;}).join('')}</tbody></table></div>`
    : vazio(q||fornSeg?'Nenhum fornecedor encontrado':'Nenhum fornecedor salvo', q||fornSeg?'Tente outra busca ou outro segmento.':'Cadastre um a um ou use "Importar lista" para subir vários de uma vez.');
}
function openForn(id){
  const f = id ? DB.fornecedores.find(x=>x.id===id) : null;
  const opts = [...new Set([...segmentos(), ...SEG_SUGESTOES])];
  abrir(`${hdr(f?'Editar fornecedor':'Novo fornecedor')}<div class="mbody"><div class="fgrid">
      <div class="f full"><label>Nome</label><input id="n-nome" value="${esc(f?.nome)}" placeholder="Ateliê das Sacolas"></div>
      <div class="f"><label>Segmento</label><input id="n-seg" list="seglist" value="${esc(f?.segmento||(fornSeg&&fornSeg!=='-'?fornSeg:''))}" placeholder="Eventos, sacolas…"><datalist id="seglist">${opts.map(s=>`<option value="${esc(s)}">`).join('')}</datalist></div>
      <div class="f"><label>Contato</label><input id="n-cont" value="${esc(f?.contato)}" placeholder="telefone, @instagram, e-mail"></div>
      <div class="f full"><label>Chave pix</label><input id="n-pix" value="${esc(f?.pix)}" placeholder="cnpj, telefone ou aleatória"></div>
      <div class="f"><label>Valor de referência</label><input id="n-valor" type="number" step="0.01" value="${f?.valor??''}" placeholder="0,00"></div>
      <div class="f"><label>Categoria de gasto</label><select id="n-cat">${opcoesCat(f?.categoria_id)}</select></div>
      <div class="f full"><label>Observação</label><textarea id="n-obs" placeholder="Prazo, pedido mínimo, condição combinada">${esc(f?.obs)}</textarea></div>
    </div></div>${pe(`salvarForn('${id||''}')`,'Salvar fornecedor')}`);
}
async function salvarForn(id){
  const nome = val('n-nome'); if(!nome) return aviso('O fornecedor precisa de um nome.');
  if(await salvar('fornecedores',{id:id||novoId(), nome, segmento:val('n-seg')||null, contato:val('n-cont')||null, pix:val('n-pix')||null, valor:num('n-valor')||null, categoria_id:val('n-cat')||null, obs:val('n-obs')||null})){ fechar(); render(); aviso('Fornecedor salvo.'); }
}
function lerImport(){
  const padrao = val('imp-seg'), existentes = new Set(DB.fornecedores.map(f=>norm(f.nome.trim())));
  const vistos = new Set(), novos = [], repetidos = [];
  (document.getElementById('imp-txt')?.value||'').split(/\r?\n/).forEach(l=>{
    if(!l.trim()) return;
    const p = (l.includes('\t') ? l.split('\t') : l.split(/;|\|/)).map(x=>x.trim());
    const nome = p[0]; if(!nome || /^nome$/i.test(nome)) return;
    const k = norm(nome); if(existentes.has(k) || vistos.has(k)){ repetidos.push(nome); return; }
    vistos.add(k);
    novos.push({id:novoId(), nome, segmento:p[1]||padrao||null, contato:p[2]||null, pix:p[3]||null, valor:null, categoria_id:null, obs:p[4]||null});
  });
  return {novos, repetidos};
}
function prevImport(){
  const {novos, repetidos} = lerImport(), el = document.getElementById('imp-prev');
  el.innerHTML = novos.length ? `<b>${plural(novos.length,'fornecedor novo','fornecedores novos')}</b>${repetidos.length?` · ${repetidos.length} já existe${repetidos.length>1?'m':''} e será${repetidos.length>1?'ão':''} ignorado${repetidos.length>1?'s':''}`:''}<div class="dica" style="margin-top:6px">${novos.slice(0,5).map(n=>`${esc(n.nome)}${n.segmento?' · '+esc(n.segmento):''}${n.contato?' · '+esc(n.contato):''}`).join('<br>')}${novos.length>5?'<br>…':''}</div>` : 'Cole a lista acima para ver a prévia.';
}
function openImportForn(){
  abrir(`${hdr('Importar lista de fornecedores','copie da planilha ou escreva uma linha por fornecedor')}
    <div class="mbody"><div class="fgrid">
      <div class="f full"><label>Lista</label><textarea id="imp-txt" style="min-height:200px;font-family:inherit" oninput="prevImport()" placeholder="Nome; Segmento; Contato; Pix; Observação
Ateliê Bolsa Bonita; Sacolas e embalagens; (85) 99999-0000; 12.345.678/0001-00
Buffet Sabor; Eventos; @buffetsabor"></textarea>
        <div class="dica">Colunas na ordem: <b>Nome; Segmento; Contato; Pix; Observação</b>. Pode separar por ponto e vírgula ou colar direto do Excel/Google Planilhas. Só o nome é obrigatório.</div></div>
      <div class="f full"><label>Segmento para quem vier sem segmento</label><input id="imp-seg" list="seglist2" placeholder="ex: Eventos" oninput="prevImport()"><datalist id="seglist2">${[...new Set([...segmentos(),...SEG_SUGESTOES])].map(s=>`<option value="${esc(s)}">`).join('')}</datalist></div>
      <div class="preview" id="imp-prev">Cole a lista acima para ver a prévia.</div>
    </div></div>${pe('importarForn()','Importar')}`);
}
async function importarForn(){
  const {novos} = lerImport();
  if(!novos.length) return aviso('Nada novo para importar.');
  if(await inserirVarios('fornecedores', novos)){ fechar(); render(); aviso(`${plural(novos.length,'fornecedor importado','fornecedores importados')}.`); }
}

/* =========================================================
   BUSCA GERAL (lupinha)
   ========================================================= */
function abrirBusca(){
  abrir(`<div class="mbody" style="padding-top:20px">
      <div class="buscainp">${IC2.busca}<input id="bg-q" placeholder="Buscar pagamentos, fornecedores, eventos, atas…" oninput="buscar()" autocomplete="off" style="font-size:15px;padding:13px 14px 13px 38px;min-width:0;width:100%"></div>
      <div class="busca-res" id="bg-res"><div class="dica" style="padding:10px 6px">Digite um nome, fornecedor, valor (ex: 1300) ou palavra de uma ata.</div></div>
    </div>`);
  setTimeout(()=>document.getElementById('bg-q')?.focus(), 30);
}
function buscar(){
  const qq = val('bg-q'), q = norm(qq), host = document.getElementById('bg-res');
  if(q.length<2){ host.innerHTML = '<div class="dica" style="padding:10px 6px">Digite pelo menos 2 letras.</div>'; return; }
  const n = parseFloat(qq.replace(/\./g,'').replace(',','.'));
  const bateValor = v => !isNaN(n) && /^[\d.,]+$/.test(qq) && Math.abs((+v||0)-n) < 0.01;
  const tem = (...xs) => norm(xs.join(' ')).includes(q);
  const grupos = [
    ['Pagamentos', IC.cash, DB.gastos.filter(g=>tem(g.descricao,g.fornecedor,g.obs,g.destino,cat(g.categoria_id)?.nome,...anexosDe(g).map(a=>a.obs)) || bateValor(g.valor)).sort((a,b)=>(dataRef(b)||'').localeCompare(dataRef(a)||'')),
      g=>[g.descricao, `${dBR(dataRef(g))} · ${g.pago?'pago':'em aberto'}${g.fornecedor?' · '+g.fornecedor:''}`, brl(g.valor), `openGasto('${g.id}')`]],
    ['Fornecedores', IC2.loja, DB.fornecedores.filter(f=>tem(f.nome,f.segmento,f.contato,f.pix,f.obs)),
      f=>[f.nome, [f.segmento,f.contato].filter(Boolean).join(' · ')||'fornecedor', '', `openForn('${f.id}')`]],
    ['Eventos', IC2.festa, DB.eventos.filter(e=>tem(e.nome,e.local,e.obs)),
      e=>[e.nome, `${e.data?dBR(e.data):'sem data'}${e.local?' · '+e.local:''}`, e.orcamento?brl(e.orcamento):'', `fechar();abrirEvento('${e.id}')`]],
    ['Custos de eventos', IC2.festa, DB.evento_custos.filter(c=>tem(c.descricao,c.fornecedor,c.categoria,c.obs) || bateValor(c.valor)),
      c=>[c.descricao, `${DB.eventos.find(e=>e.id===c.evento_id)?.nome||'evento'}${c.fornecedor?' · '+c.fornecedor:''}`, brl(c.valor), `fechar();abrirEvento('${c.evento_id}')`]],
    ['Atas de reunião', IC2.ata, DB.atas.filter(a=>tem(a.titulo,a.participantes,a.texto)),
      a=>{ const t=a.texto||'', i=norm(t).indexOf(q); return [a.titulo, `${dBR(a.data)}${i>=0?' · …'+t.slice(Math.max(0,i-30), i+50).replace(/\s+/g,' ')+'…':''}`, '', `fechar();abrirAta('${a.id}')`]; }],
    ['Datas importantes', IC2.flag, DB.marcos.filter(m=>tem(m.titulo,m.obs,tipoMarcoTxt(m.tipo))),
      m=>[m.titulo, `${dBR(m.data)} · ${tipoMarcoTxt(m.tipo)}`, '', `openMarco('${m.id}')`]],
    ['Recorrências', IC.rep, DB.recorrencias.filter(r=>tem(r.descricao,r.fornecedor,r.destino,r.obs) || bateValor(r.valor)),
      r=>[r.descricao, freqTxt(r), brl(r.valor), `openRec('${r.id}')`]],
    ['Orçamentos futuros', IC.clock, DB.previsoes.filter(p=>tem(p.descricao,p.fornecedor,p.obs) || bateValor(p.valor)),
      p=>[p.descricao, p.quando?dBR(p.quando):'sem data', brl(p.valor), `openPrev('${p.id}')`]],
    ['Arquivos', IC.doc, DB.arquivos.filter(a=>tem(a.nome,a.obs,a.responsavel,...anexosDe(a).map(x=>x.obs))),
      a=>[a.nome, pastaDe(a.pasta).nome, '', `openArq('${a.id}')`]],
    ['Metas', IC.trend, DB.metas.filter(m=>tem(m.produto,m.obs)), m=>[m.produto, 'meta '+brl(m.meta), '', `openMeta('${m.id}')`]]
  ];
  const html = grupos.filter(g=>g[2].length).map(([nome, ic, itens, f])=>`<div class="busca-grupo">${nome} · ${itens.length}</div>` + itens.slice(0,8).map(x=>{ const [t,s,v,acao]=f(x);
    return `<button class="busca-it" onclick="${acao}"><span class="ic">${ic}</span><span><div class="t">${esc(t)}</div><div class="s">${esc(s)}</div></span><span class="v">${esc(v)}</span></button>`; }).join('')).join('');
  host.innerHTML = html || `<div class="vazio"><b>Nada encontrado</b>para "${esc(qq)}"</div>`;
}
document.addEventListener('keydown', e=>{
  const tag = (e.target.tagName||'').toLowerCase();
  if((e.key==='k' && (e.ctrlKey||e.metaKey)) || (e.key==='/' && !['input','textarea','select'].includes(tag))){ e.preventDefault(); abrirBusca(); }
});

/* =========================================================
   SEMANA (faixa de dias na visão geral)
   ========================================================= */
let diaSel = hojeISO();
function moverSemana(n){ diaSel = addDias(diaSel, 7*n); renderSemana(); }
function selDia(iso){ diaSel = iso; renderSemana(); }
function renderSemana(){
  const host = document.getElementById('semana'); if(!host) return;
  const d0 = new Date(diaSel+'T00:00:00'); d0.setDate(d0.getDate()-d0.getDay());
  const ini = isoLocal(d0), fim = addDias(ini, 6), porDia = itensPeriodo(ini, fim, true);
  const corItem = i => i.tipo==='marco' ? 'var(--tx)' : i.tipo==='evento'||i.tipo==='ecusto' ? '#C9922F' : i.tipo==='ata' ? 'var(--tx-3)' : i.tipo==='prev' ? 'var(--info)' : i.tipo==='rec' ? 'var(--pri)' : (i.g.pago ? 'var(--ok)' : atrasado(i.g) ? 'var(--bad)' : 'var(--warn)');
  const dias = Array.from({length:7},(_,k)=>addDias(ini,k));
  const itens = porDia[diaSel] || [];
  const [, mm] = ini.split('-');
  host.innerHTML = `<div class="top"><h2>Sua semana</h2><span class="hint muted" style="font-size:12px">${MESES[+mm-1]}</span><span class="spacer"></span>
      <button class="iconbtn" onclick="moverSemana(-1)" aria-label="Semana anterior">${IC2.back}</button>
      <button class="btn xs ghost" onclick="diaSel=hojeISO();renderSemana()">Hoje</button>
      <button class="iconbtn" onclick="moverSemana(1)" aria-label="Próxima semana"><svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></button></div>
    <div class="dias7">${dias.map(d=>{ const l=porDia[d]||[]; const cores=[...new Set(l.map(corItem))].slice(0,4);
      return `<button class="dia7 ${d===hojeISO()?'hoje':''} ${d===diaSel?'on':''}" onclick="selDia('${d}')"><span class="w">${DIAS[new Date(d+'T00:00:00').getDay()]}</span><span class="n">${+d.slice(8)}</span><span class="pts">${cores.map(c=>`<i style="background:${c}"></i>`).join('')}</span></button>`; }).join('')}</div>
    <div class="diadet">${itens.length ? itens.map(i=>itemCal(i,true)).join('') : `<div class="dica" style="text-align:center;padding:6px">Nada em ${dBR(diaSel)}. <a href="#" onclick="escolherNoDia('${diaSel}');return false" style="color:var(--pri);font-weight:700">Cadastrar algo</a></div>`}</div>`;
}

/* =========================================================
   MENU DO CELULAR
   ========================================================= */
function alternarMenu(forca){ document.body.classList.toggle('menu-on', forca!==undefined ? forca : !document.body.classList.contains('menu-on')); }
function renderBottomNav(){
  const host = document.getElementById('bottomnav'); if(!host) return;
  const L = lembretes();
  const b = (id, ic, t) => `<button class="${aba===id?'on':''}" onclick="alternarMenu(false);irPara('${id}')">${ic}<span>${t}</span>${id==='lembretes'&&L.total?`<span class="bdg">${L.total}</span>`:''}</button>`;
  host.innerHTML = b('geral', IC2.home, 'Início') + b('cal', IC.cal, 'Agenda')
    + `<button class="fab" onclick="escolherNoDia()" aria-label="Cadastrar">${IC.plus}</button>`
    + b('lembretes', IC.sino, 'Lembretes')
    + `<button onclick="alternarMenu()">${IC2.menu}<span>Menu</span></button>`;
}
