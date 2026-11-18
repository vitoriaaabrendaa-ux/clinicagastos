/* =========================================================
   forms.js — janelas de cadastro e ações
   ========================================================= */
const bd = document.getElementById('bd'), modal = document.getElementById('modal');
function abrir(html){ modal.innerHTML = html; bd.classList.add('on'); modal.scrollTop = 0; const f = modal.querySelector('input:not([type=hidden]),select,textarea'); if(f && window.innerWidth>860) f.focus(); }
function fechar(){ bd.classList.remove('on'); }
bd.addEventListener('mousedown', e=>{ if(e.target===bd) fechar(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape') fechar(); });
const hdr = (t, s) => `<header><div><h3>${t}</h3>${s?`<div class="dica" style="margin-top:3px">${s}</div>`:''}</div><button class="iconbtn" onclick="fechar()" aria-label="Fechar">${IC.x}</button></header>`;
const pe = (fn, txt) => `<div class="mfoot"><button class="btn ghost" onclick="fechar()">Cancelar</button><button class="btn" onclick="${fn}">${txt}</button></div>`;
const val = id => (document.getElementById(id)?.value ?? '').trim();
const num = id => parseFloat(String(val(id)).replace(',','.'));
const seg2 = (grupo, opcoes, sel, fn) => `<div class="seg2" data-grupo="${grupo}">${opcoes.map(([v,t])=>`<button type="button" data-v="${v}" class="${v===sel?'on':''}" onclick="${fn}('${v}')">${t}</button>`).join('')}</div>`;
const marcaSeg = (grupo, v) => document.querySelectorAll(`[data-grupo="${grupo}"] button`).forEach(b=>b.classList.toggle('on', b.dataset.v===v));
const mostra = (id, sim) => document.getElementById(id)?.classList.toggle('hide', !sim);
const opcoesSocias = sel => socias().map(p=>`<option value="${p.id}" ${sel===p.id?'selected':''}>${esc(p.nome)}</option>`).join('');
const opcoesCat = sel => `<option value="">Sem categoria</option>` + DB.categorias.map(k=>`<option value="${k.id}" ${sel===k.id?'selected':''}>${esc(k.nome)}</option>`).join('');
const listaPix = id => `<datalist id="${id}">${DB.fornecedores.filter(f=>f.pix).map(f=>`<option value="${esc(f.pix)}">${esc(f.nome)}</option>`).join('')}</datalist>`;
const listaForn = id => `<datalist id="${id}">${DB.fornecedores.map(f=>`<option value="${esc(f.nome)}">`).join('')}</datalist>`;

/* ---------- campos de anexo (2 links + observação de cada) ---------- */
function camposAnexos(prefixo, anexos, rotulos, titulo='Comprovantes e anexos'){
  return `<div class="caixa neutra"><div class="tit">${IC.clip} ${titulo}<span class="dica" style="font-weight:600;margin-left:4px">até 2 links, cada um com observação</span></div>
    ${[0,1].map(i=>`<div class="f"><label id="${prefixo}-lbl${i}">${esc(rotulos[i])}</label><input id="${prefixo}-url${i}" value="${esc(anexos[i].url)}" placeholder="Link do Drive, foto ou PDF"></div>
    <div class="f"><label>Observação</label><input id="${prefixo}-obs${i}" value="${esc(anexos[i].obs)}" placeholder="${i===0?'ex: pix feito às 14h':'ex: segunda via, nota fiscal'}"></div>`).join('')}</div>`;
}
const lerAnexos = prefixo => [0,1].map(i=>({url:val(`${prefixo}-url${i}`)||null, obs:val(`${prefixo}-obs${i}`)||null}));
const minusc = t => t.charAt(0).toLowerCase()+t.slice(1);
const primeiroLink = an => an.find(a=>a.url)?.url || null;
function rotularAnexos(prefixo, rotulos){ rotulos.forEach((t,i)=>{ const el=document.getElementById(`${prefixo}-lbl${i}`); if(el) el.textContent=t; }); }

/* =========================================================
   GASTO
   ========================================================= */
let fTipo='variavel', fSit='aberto', fSitOrig='aberto', fDur='so', fGasto=null;
function sitDoGasto(g){
  if(!g || !g.pago) return 'aberto';
  if(g.quem_pagou) return g.quem_pagou;
  return socias().some(p=>p.id===g.pagador_id) ? 'uma' : 'ambas';
}
let fRec = null; // recorrência deste formulário (gasto já ligado ou repetição programada que vai ser lançada)
function openGasto(id, tipoPadrao, preset={}){
  const g = id ? DB.gastos.find(x=>x.id===id) : null;
  fGasto = g;
  const recPre = !g && preset.recId ? DB.recorrencias.find(r=>r.id===preset.recId) : null;
  fRec = recDoGasto(g) || recPre;
  // base dos campos: o gasto, ou os dados da recorrência quando é uma repetição programada
  const b = g || (recPre ? {descricao:recPre.descricao, valor:recPre.valor, categoria_id:recPre.categoria_id, forma:recPre.forma, destino:recPre.destino, fornecedor:recPre.fornecedor, tipo:recPre.tipo||'fixo'} : {});
  fTipo = b.tipo || tipoPadrao || 'variavel';
  fSit = fSitOrig = g ? sitDoGasto(g) : (preset.sit || 'aberto');
  fDur = g || recPre ? 'so' : 'n';
  const venc = g?.vencimento || preset.venc || '';
  const forma = b.forma || 'Pix';
  const quem = (fSit==='uma' && g?.pagador_id) || socias()[0]?.id;
  const reemb = g?.reembolso && g.reembolso!=='nao' ? g.reembolso : (g && fSit==='uma' ? 'nao' : 'pendente');
  const parc = fRec ? (g ? parcelaTxt(g) : parcelaRecTxt(fRec, venc)) : '';
  const titulo = g ? 'Editar gasto' : recPre ? `${esc(recPre.descricao)} · ${dBR(venc)}` : (preset.venc ? `Novo pagamento em ${dBR(preset.venc)}` : 'Novo gasto');
  const caixaRec = fRec ? `<div class="caixa" id="box-rec">
      <div class="tit">${IC.rep} Recorrente${parc?` · pagamento ${parc}`:''}</div>
      <div class="f full" style="font-size:12.5px;color:var(--tx-2)">Faz parte de <b>${esc(fRec.descricao)}</b> · ${freqTxt(fRec)}${fRec.ate?` · até ${dBR(fRec.ate)}`:' · sem data para acabar'}.
        Se mudar valor, dia ou forma de pagamento, eu pergunto se vale só para este mês ou para os próximos também.</div>
      <div class="f full"><button type="button" class="btn sm ghost" style="width:fit-content" onclick="fechar();openRec('${fRec.id}')">${IC.edit}Editar a recorrência inteira</button></div>
    </div>` : `<div class="caixa ${fTipo==='fixo'?'':'hide'}" id="box-fixo">
      <div class="tit">${IC.rep} Custo fixo: por quanto tempo?</div>
      <div class="f full">${seg2('dur',[['n','Nº de pagamentos'],['data','Até uma data'],['sem','Sem data para acabar'],['so','Só este mês']],fDur,'setDur')}</div>
      <div class="f" id="box-n"><label>Quantos pagamentos no total</label><input id="f-n" type="number" min="1" max="240" placeholder="ex: 6" oninput="prevFixo()"></div>
      <div class="f" id="box-ate"><label>Último pagamento em</label><input id="f-ate" type="date" onchange="prevFixo()"></div>
      <div class="preview" id="f-prev"></div>
    </div>`;
  abrir(`${hdr(titulo, recPre?'repetição programada: confira, anexe o comprovante e salve':'')}
    <div class="mbody"><div class="fgrid">
      <div class="f full"><label>Descrição</label><input id="f-desc" value="${esc(b.descricao)}" placeholder="Aluguel, assessoria jurídica, material elétrico"></div>
      <div class="f"><label>Valor</label><input id="f-valor" type="number" step="0.01" inputmode="decimal" value="${b.valor??''}" placeholder="0,00" oninput="prevFixo();dicaSit()"></div>
      <div class="f"><label>Vencimento</label><input id="f-venc" type="date" value="${venc}" onchange="onVencChange()"></div>
      <div class="f"><label>Categoria</label><select id="f-cat">${opcoesCat(b.categoria_id)}</select></div>
      <div class="f"><label>Mês de referência</label><input id="f-mes" type="month" value="${g?.mes || (venc?venc.slice(0,7):mes)}"></div>
      <div class="f"><label>Tipo de custo</label>${seg2('tipo',[['fixo','Fixo'],['variavel','Variável']],fTipo,'setTipo')}</div>
      <div class="f"><label>Forma de pagamento</label><select id="f-forma" onchange="onFormaChange()">${FORMAS.map(f=>`<option ${forma===f?'selected':''}>${f}</option>`).join('')}</select></div>
      ${caixaRec}
      <div class="f hide" id="box-parcelas"><label>Em quantas vezes no cartão</label><input id="f-parcelas" type="number" min="1" max="48" value="${g?.parcelas||1}"></div>
      <div class="f full"><label id="lbl-destino">Chave pix de destino</label><input id="f-destino" value="${esc(b.destino)}" list="pixlist" placeholder="Chave pix, banco ou nome de quem recebe">${listaPix('pixlist')}</div>

      <div class="f full"><label>Situação: as duas sócias já pagaram ou só uma?</label>${seg2('sit',[['aberto','Ainda não foi pago'],['ambas','As duas pagaram'],['uma','Só uma pagou']],fSit,'setSit')}
        <div class="dica" id="dica-sit"></div></div>
      <div class="caixa ${fSit==='uma'?'':'hide'}" id="box-uma">
        <div class="f"><label>Quem pagou</label><select id="f-quem" onchange="dicaSit()">${opcoesSocias(quem)}</select></div>
        <div class="f"><label>A outra precisa devolver a metade?</label><select id="f-reemb" onchange="dicaSit()">
          <option value="pendente" ${reemb==='pendente'?'selected':''}>Sim, ainda não devolveu</option>
          <option value="feito" ${reemb==='feito'?'selected':''}>Sim, já devolveu</option>
          <option value="nao" ${reemb==='nao'?'selected':''}>Não precisa</option></select></div>
      </div>
      <div class="f ${fSit!=='aberto'?'':'hide'}" id="box-pagoem"><label>Pago no dia</label><input id="f-pagoem" type="date" value="${g?.pago_em||hojeISO()}"></div>

      ${camposAnexos('fa', anexosDe(g), rotulosAnexo({...(g||{}), pago:fSit!=='aberto', quem_pagou:fSit}))}

      <div class="f"><label>Fornecedor</label><input id="f-forn" list="fornlist" value="${esc(b.fornecedor)}" placeholder="opcional">${listaForn('fornlist')}</div>
      <div class="f full"><label>Observação</label><textarea id="f-obs" placeholder="Qualquer detalhe que vocês queiram lembrar">${esc(g?.obs)}</textarea></div>
    </div></div>
    ${pe(`salvarGasto('${id||''}')`, recPre ? 'Salvar este mês' : 'Salvar gasto')}`);
  onFormaChange(); if(!fRec) setDur(fDur); dicaSit();
}
// abre uma repetição programada como um pagamento normal (com comprovantes e observação)
function abrirRepeticao(recId, data, sit){ openGasto(null, null, {recId, venc:data, sit}); }
function setTipo(t){ fTipo=t; marcaSeg('tipo',t); mostra('box-fixo', t==='fixo'); prevFixo(); }
function setDur(d){ fDur=d; marcaSeg('dur',d); mostra('box-n', d==='n'); mostra('box-ate', d==='data'); prevFixo(); }
function setSit(s){
  fSit=s; marcaSeg('sit',s); mostra('box-uma', s==='uma'); mostra('box-pagoem', s!=='aberto');
  rotularAnexos('fa', rotulosAnexo({pago:s!=='aberto', quem_pagou:s})); dicaSit();
}
function dicaSit(){
  const el = document.getElementById('dica-sit'); if(!el) return;
  const v = num('f-valor')||0;
  if(fSit==='ambas') el.textContent = `Cada uma sobe o próprio comprovante. O que faltar vai para Lembretes.`;
  else if(fSit==='uma'){ const q=pag(val('f-quem')), o=outraSocia(val('f-quem')), r=val('f-reemb');
    el.textContent = r==='nao' ? `${q?.nome||'Ela'} pagou e não precisa de acerto.` : `${o?.nome||'A outra'} devolve ${brl(v/2)} para ${q?.nome||'quem pagou'}${r==='feito'?' (já devolvido)':''}.`; }
  else el.textContent = 'Fica em aberto e aparece nos lembretes quando estiver perto de vencer.';
}
function onVencChange(){ const v=val('f-venc'); if(v) document.getElementById('f-mes').value = v.slice(0,7); prevFixo(); }
function onFormaChange(){
  const forma = val('f-forma');
  mostra('box-parcelas', forma.indexOf('Cartão')>-1);
  const l = document.getElementById('lbl-destino'); if(l) l.textContent = forma==='Pix' ? 'Chave pix de destino' : 'Para quem / dados do pagamento';
}
// recorrência "simulada" com o que está no formulário (para um custo fixo novo)
function recDoForm(){
  const venc = val('f-venc'), mesRef = val('f-mes') || mes;
  const base = venc || `${mesRef}-10`;
  return {frequencia:'mensal', dia: +base.slice(8,10), inicio: base, mes_ano:1, dia_semana:0, base};
}
function ateParaN(r, N){
  const fim = r.frequencia==='anual' ? addMeses(r.inicio, 12*N+12) : addMeses(r.inicio, N+2);
  const occ = ocorrencias({...r, ate:null}, r.inicio, fim);
  return occ[Math.min(N, occ.length)-1] || r.inicio;
}
function prevFixo(){
  const el = document.getElementById('f-prev'); if(!el) return;
  if(fTipo!=='fixo' || fRec){ el.innerHTML=''; return; }
  const r = recDoForm(), v = num('f-valor')||0;
  if(fDur==='so'){ el.innerHTML = 'Só este lançamento, sem repetir.'; return; }
  if(fDur==='sem'){ el.innerHTML = `Repete <b>todo dia ${r.dia}</b>, de ${dBR(r.inicio)} em diante, até vocês pausarem.`; return; }
  let N, ate;
  if(fDur==='n'){ N = parseInt(val('f-n')); if(!(N>=1)){ el.innerHTML='Diga quantos pagamentos são no total (ex: 6) e o app conta <b>1/6, 2/6…</b> sozinho.'; return; } ate = ateParaN(r, N); }
  else { ate = val('f-ate'); if(!ate){ el.innerHTML='Escolha a data do último pagamento.'; return; } N = ocorrencias(r, r.inicio, ate).length; if(!N){ el.innerHTML='A data final é antes do primeiro pagamento.'; return; } }
  el.innerHTML = `<b>${N} pagamentos</b> de ${brl(v)} = <b>${brl(v*N)}</b> · do dia ${dBR(r.inicio)} até <b>${dBR(ate)}</b> · este é o <b>1/${N}</b>`;
}
const semNumero = s => String(s||'').replace(/\s*-?\s*\d+\s*\/\s*\d+\s*$/,'').trim();
let pendGasto = null;
async function salvarGasto(id){
  const desc = val('f-desc'), valor = num('f-valor');
  if(!desc) return aviso('Dê um nome ao gasto para poder salvar.');
  if(!(valor>0)) return aviso('Informe um valor maior que zero.');
  const antigo = id ? DB.gastos.find(x=>x.id===id) : null;
  const venc = val('f-venc') || null, mesRef = val('f-mes') || (venc?venc.slice(0,7):mes), forma = val('f-forma');
  const pago = fSit!=='aberto';
  let quem_pagou = pago ? fSit : null;
  // lançamento antigo sem "quem pagou" que não teve a situação mexida continua como estava
  const legado = antigo && antigo.pago && !antigo.quem_pagou && pago && fSit===fSitOrig;
  if(legado) quem_pagou = null;
  const quem = fSit==='uma' ? val('f-quem') : null;
  const reemb = fSit==='uma' ? val('f-reemb') : (legado ? (antigo.reembolso||'nao') : 'nao');
  const regSocias = DB.pagadores.find(ehRegistroSocias);
  const pagador_id = legado ? antigo.pagador_id : fSit==='uma' ? quem : fSit==='ambas' ? (regSocias?.id||null) : null;
  const outra = quem ? outraSocia(quem) : null;

  let recNova = null, recId = antigo?.recorrencia_id || fRec?.id || null;
  // custo fixo novo: cria a recorrência
  if(fTipo==='fixo' && !fRec && fDur!=='so'){
    const r = recDoForm();
    let ate = null;
    if(fDur==='n'){ const N = parseInt(val('f-n')); if(!(N>=1)) return aviso('Diga quantos pagamentos são no total, ou escolha "Só este mês".'); ate = ateParaN(r, N); }
    else if(fDur==='data'){ ate = val('f-ate'); if(!ate) return aviso('Escolha a data do último pagamento.'); }
    recNova = {id: novoId(), descricao: semNumero(desc) || desc, valor, frequencia:'mensal', dia:r.dia, mes_ano:1, dia_semana:0, inicio:r.inicio, ate,
      forma: forma||null, destino: val('f-destino')||null, categoria_id: val('f-cat')||null, pagador_id:null,
      tipo:'fixo', fornecedor: val('f-forn')||null, obs:null, pausada:false, anexos:[], criado:new Date().toISOString()};
    recId = recNova.id;
  }
  const anexos = lerAnexos('fa');
  const gasto = {
    id: id || novoId(), descricao: desc, valor, mes: mesRef,
    categoria_id: val('f-cat') || null, pagador_id, tipo: fTipo, pago,
    vencimento: venc, pago_em: pago ? (val('f-pagoem') || hojeISO()) : null,
    forma: forma || null, parcelas: forma.indexOf('Cartão')>-1 ? (parseInt(val('f-parcelas'))||1) : 1,
    destino: val('f-destino') || null,
    reembolso: reemb, reembolso_quem: fSit==='uma' && reemb!=='nao' ? `${outra?.nome||'A outra'} devolve para ${pag(quem)?.nome||''}` : (legado ? antigo.reembolso_quem : null),
    fornecedor: val('f-forn') || null, comprovante: primeiroLink(anexos), anexos, obs: val('f-obs') || null,
    quem_pagou, comprovantes_ok: antigo?.comprovantes_ok || false,
    criado: antigo?.criado || new Date().toISOString(), recorrencia_id: recId
  };
  pendGasto = {gasto, recNova, novo: !id};
  // gasto de uma recorrência: se mudou algo que vale para os próximos meses, pergunta
  if(fRec){
    const mud = [];
    if(Math.abs((+fRec.valor||0) - valor) > 0.004) mud.push(`valor ${brl(fRec.valor)} → <b>${brl(valor)}</b>`);
    if(venc && porMes(fRec) && +venc.slice(8,10) !== +fRec.dia) mud.push(`dia ${fRec.dia} → <b>${+venc.slice(8,10)}</b>`);
    if((fRec.forma||'') !== (forma||'')) mud.push(`forma ${esc(fRec.forma||'—')} → <b>${esc(forma)}</b>`);
    if((fRec.destino||'') !== (gasto.destino||'')) mud.push('pix/destino');
    if((fRec.categoria_id||'') !== (gasto.categoria_id||'')) mud.push('categoria');
    if(semNumero(fRec.descricao) !== semNumero(desc)) mud.push('nome');
    if(mud.length){
      abrir(`${hdr('Editar só este mês ou todos os próximos?')}
        <div class="mbody"><p style="font-size:13.5px;color:var(--tx-2);margin-bottom:14px">Você mudou: ${mud.join(' · ')} em <b>${esc(fRec.descricao)}</b>.</p>
        <div class="escolha">
          <button style="background:var(--grad-pri)" onclick="concluirGasto('so')">${IC.cal}<b>Só este mês</b><span>os próximos continuam como estavam</span></button>
          <button style="background:var(--grad-pessego)" onclick="concluirGasto('todos')">${IC.rep}<b>Este e os próximos</b><span>atualiza a recorrência daqui pra frente</span></button>
        </div></div>`);
      return;
    }
  }
  concluirGasto('so');
}
async function concluirGasto(escopo){
  const p = pendGasto; if(!p) return;
  pendGasto = null;
  if(p.recNova && !await salvar('recorrencias', p.recNova)) return;
  if(escopo==='todos' && fRec){
    const g = p.gasto;
    const rec = {...fRec, valor:g.valor, forma:g.forma, destino:g.destino, categoria_id:g.categoria_id, fornecedor:g.fornecedor, descricao: semNumero(g.descricao)||fRec.descricao};
    if(g.vencimento && porMes(fRec)) rec.dia = +g.vencimento.slice(8,10);
    if(!await salvar('recorrencias', rec)) return;
  }
  if(!await salvar('gastos', p.gasto)) return;
  fechar(); render();
  const g = DB.gastos.find(x=>x.id===p.gasto.id);
  const falta = g ? compFaltando(g) : [], parc = g ? parcelaTxt(g) : '';
  aviso(falta.length ? `Salvo. Ficou um lembrete: ${falta.map(minusc).join(' e ')}.` : escopo==='todos' ? 'Salvo e aplicado aos próximos meses.' : parc ? `Salvo como pagamento ${parc}.` : (p.novo?'Gasto lançado.':'Gasto atualizado.'));
}
function novoNoDia(iso){ openGasto(null, null, {venc: iso}); }

/* ---------- registrar pagamento ---------- */
let pSit='ambas', pId=null;
function openPagar(id){
  const g = DB.gastos.find(x=>x.id===id); if(!g) return;
  pSit = 'ambas'; pId = id;
  const parc = parcelaTxt(g);
  abrir(`${hdr('Registrar pagamento', `${esc(g.descricao)}${parc?' · pagamento '+parc:''} · ${brl(g.valor)}${g.vencimento?' · vence '+dBR(g.vencimento):''}`)}
    <div class="mbody"><div class="fgrid">
      <div class="f full"><label>As duas sócias já pagaram ou só uma?</label>${seg2('psit',[['ambas','As duas pagaram'],['uma','Só uma pagou tudo']],pSit,'setPSit')}<div class="dica" id="p-dica"></div></div>
      <div class="caixa hide" id="p-uma">
        <div class="f"><label>Quem pagou</label><select id="p-quem" onchange="dicaPagar()">${opcoesSocias(socias()[0]?.id)}</select></div>
        <div class="f"><label>A outra precisa devolver a metade?</label><select id="p-reemb" onchange="dicaPagar()"><option value="pendente">Sim, ainda não devolveu</option><option value="feito">Sim, já devolveu</option><option value="nao">Não precisa</option></select></div>
      </div>
      <div class="f"><label>Pago no dia</label><input id="p-data" type="date" value="${hojeISO()}"></div>
      <div class="f"></div>
      ${camposAnexos('pa', anexosDe(g), rotulosAnexo({pago:true, quem_pagou:'ambas'}))}
    </div></div>
    ${pe(`confirmarPagamento('${id}')`, 'Confirmar pagamento')}`);
  dicaPagar();
}
function setPSit(s){ pSit=s; marcaSeg('psit',s); mostra('p-uma', s==='uma'); rotularAnexos('pa', rotulosAnexo({pago:true, quem_pagou:s})); dicaPagar(); }
function dicaPagar(){
  const el = document.getElementById('p-dica'); if(!el) return;
  const g = DB.gastos.find(x=>x.id===pId);
  const v = +(g?.valor)||0;
  if(pSit==='ambas') el.textContent = 'Sem comprovante agora? Tudo bem: o app guarda um lembrete para cada uma subir o dela.';
  else { const q=pag(val('p-quem')), o=outraSocia(val('p-quem')), r=val('p-reemb');
    el.textContent = r==='nao' ? 'Sem acerto entre vocês.' : `${o?.nome||'A outra'} devolve ${brl(v/2)} para ${q?.nome||'quem pagou'}. Aparece em Reembolsos.`; }
}
async function confirmarPagamento(id){
  const g = DB.gastos.find(x=>x.id===id); if(!g) return;
  const anexos = lerAnexos('pa'), quem = pSit==='uma' ? val('p-quem') : null, reemb = pSit==='uma' ? val('p-reemb') : 'nao';
  const regSocias = DB.pagadores.find(ehRegistroSocias);
  const novo = {...g, pago:true, pago_em: val('p-data')||hojeISO(), quem_pagou:pSit,
    pagador_id: pSit==='uma' ? quem : (regSocias?.id||null), reembolso: reemb,
    reembolso_quem: pSit==='uma' && reemb!=='nao' ? `${outraSocia(quem)?.nome||'A outra'} devolve para ${pag(quem)?.nome||''}` : null,
    anexos, comprovante: primeiroLink(anexos)};
  if(!await salvar('gastos', novo)) return;
  fechar(); render();
  const falta = compFaltando(novo);
  aviso(falta.length ? `Pago! Lembrete criado: ${falta.map(minusc).join(' e ')}.` : `${g.descricao} marcado como pago.`);
}

/* ---------- anexar comprovante depois ---------- */
function openAnexos(id){
  const g = DB.gastos.find(x=>x.id===id); if(!g) return;
  const falta = compFaltando(g);
  abrir(`${hdr('Anexar comprovantes', `${esc(g.descricao)} · ${brl(g.valor)} · ${esc(quemPagouTxt(g))}${falta.length?' · falta: '+falta.map(t=>esc(minusc(t))).join(' e '):''}`)}
    <div class="mbody"><div class="fgrid">${camposAnexos('aa', anexosDe(g), rotulosAnexo(g))}</div></div>
    ${pe(`salvarAnexos('${id}')`, 'Salvar comprovantes')}`);
}
async function salvarAnexos(id){
  const g = DB.gastos.find(x=>x.id===id); if(!g) return;
  const anexos = lerAnexos('aa');
  if(!await salvar('gastos', {...g, anexos, comprovante: primeiroLink(anexos)})) return;
  fechar(); render(); aviso(compFaltando({...g, anexos}).length ? 'Salvo. Ainda falta um comprovante.' : 'Comprovantes completos.');
}
async function dispensarComp(id){
  const g = DB.gastos.find(x=>x.id===id); if(!g) return;
  if(await salvar('gastos', {...g, comprovantes_ok:true})){ render(); aviso('Lembrete dispensado.'); }
}

/* ---------- reembolso ---------- */
function openReembolso(id){
  const g = DB.gastos.find(x=>x.id===id); if(!g) return;
  const an = anexosDe(g), p = pag(g.pagador_id), o = outraSocia(g.pagador_id);
  abrir(`${hdr('Marcar reembolso como devolvido', `${o?esc(o.nome):'A outra sócia'} devolve ${brl(valorReembolso(g))} para ${p?esc(p.nome):'quem pagou'} · ${esc(g.descricao)}`)}
    <div class="mbody"><div class="fgrid">
      <div class="f full"><label>Comprovante do reembolso</label><input id="rb-url" value="${esc(an[1].url)}" placeholder="Link do pix de devolução (opcional)"></div>
      <div class="f full"><label>Observação</label><input id="rb-obs" value="${esc(an[1].obs)}" placeholder="ex: devolvido junto com o aluguel"></div>
    </div></div>
    ${pe(`confirmarReembolso('${id}')`, 'Confirmar devolução')}`);
}
async function confirmarReembolso(id){
  const g = DB.gastos.find(x=>x.id===id); if(!g) return;
  const an = anexosDe(g); an[1] = {url: val('rb-url')||null, obs: val('rb-obs')||null};
  if(!await salvar('gastos', {...g, reembolso:'feito', anexos:an, comprovante: primeiroLink(an)})) return;
  fechar(); render(); aviso('Reembolso registrado.');
}

/* ---------- recorrências: lançar ---------- */
async function lancarRec(id, data, silencioso){
  const r = DB.recorrencias.find(x=>x.id===id); if(!r) return null;
  const g = {id:novoId(), descricao:r.descricao, valor:+r.valor||0, mes:data.slice(0,7), categoria_id:r.categoria_id||null, pagador_id:null,
    tipo:r.tipo||'fixo', pago:false, vencimento:data, pago_em:null, forma:r.forma||null, parcelas:1, destino:r.destino||null,
    reembolso:'nao', reembolso_quem:null, fornecedor:r.fornecedor||null, comprovante:null, anexos:[], obs:null, quem_pagou:null, comprovantes_ok:false,
    criado:new Date().toISOString(), recorrencia_id:r.id};
  if(!await salvar('gastos', g)) return null;
  if(!silencioso){ render(); const p = parcelaTxt(g); aviso(`${r.descricao}${p?' '+p:''} de ${dBR(data)} lançado em aberto.`); }
  return g.id;
}
function lancarEPagar(recId, data){ abrirRepeticao(recId, data, 'ambas'); }
async function pausarRec(id){
  const r = DB.recorrencias.find(x=>x.id===id); if(!r) return;
  if(await salvar('recorrencias',{...r, pausada:!r.pausada})){ render(); aviso(r.pausada?'Recorrência reativada.':'Recorrência pausada: some do calendário até reativar.'); }
}

/* ---------- recorrência: formulário ---------- */
let rDur='n', recOrigem=null;
function onFreqChange(){
  const f = val('r-freq');
  mostra('box-r-dia', f==='mensal' || f==='anual'); mostra('box-r-mes', f==='anual'); mostra('box-r-dsem', f==='semanal');
  prevRec();
}
function setRDur(d){ rDur=d; marcaSeg('rdur',d); mostra('box-r-n', d==='n'); mostra('box-r-ate', d==='data'); prevRec(); }
function recDoFormRec(){
  return {frequencia: val('r-freq'), dia: parseInt(val('r-dia'))||1, mes_ano: parseInt(val('r-mes'))||1, dia_semana: parseInt(val('r-dsem'))||0, inicio: val('r-ini')||hojeISO()};
}
function prevRec(){
  const el = document.getElementById('r-prev'); if(!el) return;
  const r = recDoFormRec(), v = num('r-valor')||0;
  if(rDur==='sem'){ el.innerHTML = `${freqTxt(r)}, a partir de ${dBR(r.inicio)}, até vocês pausarem.`; return; }
  let N, ate;
  if(rDur==='n'){ N=parseInt(val('r-n')); if(!(N>=1)){ el.innerHTML='Diga quantos pagamentos são no total.'; return; } ate=ateParaN(r,N); }
  else { ate=val('r-ate'); if(!ate){ el.innerHTML='Escolha a data do último pagamento.'; return; } N=ocorrencias(r,r.inicio,ate).length; }
  el.innerHTML = `<b>${N} pagamentos</b> de ${brl(v)} = <b>${brl(v*N)}</b> · último em <b>${dBR(ate)}</b>`;
}
const normDesc = s => String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\b(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\b/g,'').replace(/\b(de|do|da)\b/g,'').replace(/\d+/g,'').replace(/[^a-z]+/g,' ').trim();
const baseGasto = g => g.vencimento || g.pago_em || ((g.mes||hojeISO().slice(0,7))+'-10');
const semelhantes = g => { const n = normDesc(g.descricao); return DB.gastos.filter(x=>!x.recorrencia_id && (x.id===g.id || (n && normDesc(x.descricao)===n))).sort((a,b)=>baseGasto(a).localeCompare(baseGasto(b))); };
function recDeGasto(g){
  const sims = semelhantes(g), ult = sims[sims.length-1] || g, pri = sims[0] || g;
  return {descricao:g.descricao.replace(/\s*-?\s*\d+\s*\/\s*\d+\s*$/,''), valor:+ult.valor||+g.valor, frequencia:'mensal', dia:+baseGasto(ult).slice(8,10)||10, inicio:baseGasto(pri), ate:null,
    forma:ult.forma||g.forma, destino:ult.destino||g.destino, categoria_id:g.categoria_id, tipo:g.tipo||'fixo', fornecedor:g.fornecedor};
}
function openRec(id, deGastoId){
  recOrigem = (!id && deGastoId) ? deGastoId : null;
  const gOrig = recOrigem ? DB.gastos.find(x=>x.id===recOrigem) : null;
  const r = id ? DB.recorrencias.find(x=>x.id===id) : (gOrig ? recDeGasto(gOrig) : null);
  const sims = gOrig ? semelhantes(gOrig) : [];
  const freq = r?.frequencia || 'mensal';
  const info = id && r ? recInfo(r) : null;
  rDur = r?.ate ? 'n' : (r ? 'sem' : 'n');
  abrir(`${hdr(id?'Editar recorrência':(gOrig?'Tornar recorrente':'Nova recorrência'))}
    <div class="mbody">
    ${gOrig?`<div class="preview" style="margin-bottom:14px"><b>Vou ligar ${plural(sims.length,'lançamento')} que já existe${sims.length!==1?'m':''}</b>: eles contam como os primeiros pagamentos.<div class="dica" style="margin-top:6px">${sims.map(x=>`${esc(x.descricao)} · ${dBR(baseGasto(x))} · ${brl(x.valor)}`).join('<br>')}</div></div>`:''}
    <div class="fgrid">
      <div class="f full"><label>Qual pagamento</label><input id="r-desc" value="${esc(r?.descricao)}" placeholder="Aluguel da sala"></div>
      <div class="f"><label>Valor</label><input id="r-valor" type="number" step="0.01" value="${r?.valor??''}" placeholder="0,00" oninput="prevRec()"></div>
      <div class="f"><label>Repete</label><select id="r-freq" onchange="onFreqChange()">${Object.entries(FREQ).map(([v,t])=>`<option value="${v}" ${freq===v?'selected':''}>${t}</option>`).join('')}</select></div>
      <div class="f" id="box-r-dia"><label>Dia do mês</label><input id="r-dia" type="number" min="1" max="31" value="${r?.dia||10}" oninput="prevRec()"></div>
      <div class="f hide" id="box-r-mes"><label>Mês</label><select id="r-mes" onchange="prevRec()">${MESES.map((m,i)=>`<option value="${i+1}" ${(+r?.mes_ano||1)===i+1?'selected':''}>${m}</option>`).join('')}</select></div>
      <div class="f hide" id="box-r-dsem"><label>Dia da semana</label><select id="r-dsem" onchange="prevRec()">${DIAS_LONGO.map((d,i)=>`<option value="${i}" ${(+r?.dia_semana||1)===i?'selected':''}>${d}</option>`).join('')}</select></div>
      <div class="f"><label>Começa em</label><input id="r-ini" type="date" value="${r?.inicio||hojeISO()}" onchange="prevRec()"></div>
      <div class="caixa">
        <div class="tit">${IC.rep} Por quanto tempo?</div>
        <div class="f full">${seg2('rdur',[['n','Nº de pagamentos'],['data','Até uma data'],['sem','Sem data para acabar']],rDur,'setRDur')}</div>
        <div class="f" id="box-r-n"><label>Quantos pagamentos no total</label><input id="r-n" type="number" min="1" max="240" value="${info?.total||''}" placeholder="ex: 6" oninput="prevRec()"></div>
        <div class="f" id="box-r-ate"><label>Último pagamento em</label><input id="r-ate" type="date" value="${r?.ate||''}" onchange="prevRec()"></div>
        <div class="preview" id="r-prev"></div>
      </div>
      <div class="f"><label>Forma de pagamento</label><select id="r-forma">${FORMAS.map(f=>`<option ${(r?.forma||'Pix')===f?'selected':''}>${f}</option>`).join('')}</select></div>
      <div class="f"><label>Pix / dados de quem recebe</label><input id="r-dest" list="pixlist3" value="${esc(r?.destino)}" placeholder="Chave pix, banco ou nome">${listaPix('pixlist3')}</div>
      <div class="f"><label>Categoria</label><select id="r-cat">${opcoesCat(r?.categoria_id)}</select></div>
      <div class="f"><label>Tipo de custo</label><select id="r-tipo"><option value="fixo" ${(r?.tipo||'fixo')==='fixo'?'selected':''}>Fixo</option><option value="variavel" ${r?.tipo==='variavel'?'selected':''}>Variável</option></select></div>
      <div class="f full"><label>Fornecedor</label><input id="r-forn" list="fornlist3" value="${esc(r?.fornecedor)}" placeholder="opcional">${listaForn('fornlist3')}</div>
      ${camposAnexos('ra', anexosDe(r), ['Contrato','Outro anexo'], 'Contrato e anexos')}
      <div class="f full"><label>Observação</label><textarea id="r-obs" placeholder="Reajuste, com quem falar">${esc(r?.obs)}</textarea></div>
    </div></div>
    <div class="mfoot">${id?`<button class="btn ghost" style="margin-right:auto" onclick="excluir('recorrencias','${id}')">Excluir</button>`:''}<button class="btn ghost" onclick="fechar()">Cancelar</button><button class="btn" onclick="salvarRec('${id||''}')">Salvar</button></div>`);
  onFreqChange(); setRDur(rDur);
}
async function salvarRec(id){
  const descricao = val('r-desc'), valor = num('r-valor');
  if(!descricao) return aviso('Diga qual é o pagamento.');
  if(!(valor>0)) return aviso('Informe um valor maior que zero.');
  const antigo = id ? DB.recorrencias.find(x=>x.id===id) : null, base = recDoFormRec();
  let ate = null;
  if(rDur==='n'){ const N=parseInt(val('r-n')); if(!(N>=1)) return aviso('Diga quantos pagamentos são, ou escolha "Sem data para acabar".'); ate = ateParaN(base, N); }
  else if(rDur==='data'){ ate = val('r-ate'); if(!ate) return aviso('Escolha a data do último pagamento.'); }
  const anexos = lerAnexos('ra'), rid = id || novoId();
  const ok = await salvar('recorrencias',{...(antigo||{}), id:rid, descricao, valor, ...base, ate,
    forma: val('r-forma')||null, destino: val('r-dest')||null, categoria_id: val('r-cat')||null, pagador_id: antigo?.pagador_id||null,
    tipo: val('r-tipo'), fornecedor: val('r-forn')||null, obs: val('r-obs')||null, anexos,
    pausada: !!antigo?.pausada, criado: antigo?.criado || new Date().toISOString()});
  if(!ok) return;
  let vinc = 0;
  if(!id && recOrigem){ const g0 = DB.gastos.find(x=>x.id===recOrigem); if(g0) for(const x of semelhantes(g0)){ if(await salvar('gastos',{...x, recorrencia_id:rid})) vinc++; } }
  recOrigem = null; fechar(); render();
  aviso(id?'Recorrência atualizada.':(vinc?`Criada com ${plural(vinc,'pagamento anterior','pagamentos anteriores')} ligado${vinc!==1?'s':''}.`:'Recorrência criada.'));
}
function openImportarRec(){
  const grupos = {};
  DB.gastos.filter(g=>!g.recorrencia_id).forEach(g=>{ const k = normDesc(g.descricao) || g.id; (grupos[k]=grupos[k]||[]).push(g); });
  const lista = Object.values(grupos).map(gs=>{ gs.sort((a,b)=>baseGasto(b).localeCompare(baseGasto(a))); return {ult:gs[0], n:gs.length}; })
    .sort((a,b)=>b.n-a.n || baseGasto(b.ult).localeCompare(baseGasto(a.ult)));
  abrir(`${hdr('Usar pagamento anterior','O app junta lançamentos com o mesmo nome e transforma em recorrência.')}
    <div class="mbody"><input type="search" placeholder="Buscar" oninput="filtrarImport(this.value)" style="margin-bottom:12px">
      <div id="impLista" style="display:flex;flex-direction:column;gap:8px">${lista.length?lista.map(x=>{const g=x.ult,k=cat(g.categoria_id);return `
        <div class="agitem rec" data-busca="${esc((g.descricao+' '+(k?k.nome:'')).toLowerCase())}" onclick="openRec(null,'${g.id}')">
          <div style="flex:1"><div class="n">${esc(g.descricao)}</div><div class="s">${x.n>1?`${x.n} lançamentos parecidos · `:''}último em ${dBR(baseGasto(g))}${k?' · '+esc(k.nome):''}</div></div>
          <div class="v">${brl(g.valor)}</div></div>`}).join(''):vazio('Nenhum pagamento disponível','Todos já estão ligados a uma recorrência.')}</div>
    </div>`);
}
function filtrarImport(q){ q=(q||'').toLowerCase().trim(); document.querySelectorAll('#impLista [data-busca]').forEach(el=>{ el.style.display = !q || el.dataset.busca.includes(q) ? '' : 'none'; }); }

/* ---------- metas ---------- */
async function vendaMeta(id, n){
  const m = DB.metas.find(x=>x.id===id); if(!m) return;
  if(await salvar('metas',{...m, vendidos:Math.max(0,(+m.vendidos||0)+n)})){ render(); aviso(n>0?`Venda registrada em ${m.produto}.`:'Venda removida.'); }
}
async function vendaMetaN(id){
  const m = DB.metas.find(x=>x.id===id); if(!m) return;
  const r = prompt(`Quantas vendas de "${m.produto}" no total?`, m.vendidos||0); if(r===null) return;
  if(await salvar('metas',{...m, vendidos:Math.max(0,parseInt(r)||0)})){ render(); aviso('Atualizado.'); }
}
function openMeta(id){
  const m = id ? DB.metas.find(x=>x.id===id) : null;
  abrir(`${hdr(m?'Editar produto':'Novo produto')}
    <div class="mbody"><div class="fgrid">
      <div class="f full"><label>Produto</label><input id="m-prod" value="${esc(m?.produto)}" placeholder="Consulta, programa, pacote"></div>
      <div class="f"><label>Meta de faturamento</label><input id="m-meta" type="number" step="0.01" value="${m?.meta??''}" placeholder="30000"></div>
      <div class="f"><label>Ticket (valor por venda)</label><input id="m-ticket" type="number" step="0.01" value="${m?.ticket??''}" placeholder="450"></div>
      <div class="f"><label>Já vendidos</label><input id="m-vend" type="number" min="0" value="${m?.vendidos||0}"></div>
      <div class="f"><label>Prazo da meta</label><input id="m-prazo" type="date" value="${m?.prazo||''}"></div>
      <div class="f"><label>Cor</label><input id="m-cor" type="color" value="${m?.cor||CORES_META[DB.metas.length%CORES_META.length]}" style="height:44px;padding:4px"></div>
      <div class="f full"><label>Observação</label><textarea id="m-obs" placeholder="Canal de venda, promoção">${esc(m?.obs)}</textarea></div>
    </div></div>${pe(`salvarMeta('${id||''}')`,'Salvar produto')}`);
}
async function salvarMeta(id){
  const produto = val('m-prod'), meta = num('m-meta'), ticket = num('m-ticket');
  if(!produto) return aviso('Dê um nome ao produto.');
  if(!(meta>0)) return aviso('Informe a meta de faturamento.');
  if(!(ticket>0)) return aviso('Informe o ticket.');
  const antigo = id ? DB.metas.find(x=>x.id===id) : null;
  if(await salvar('metas',{id:id||novoId(), produto, meta, ticket, vendidos:Math.max(0,parseInt(val('m-vend'))||0), prazo:val('m-prazo')||null, cor:val('m-cor'), obs:val('m-obs')||null, criado:antigo?.criado||new Date().toISOString()})){ fechar(); render(); aviso('Produto salvo.'); }
}

/* ---------- categoria ---------- */
function openCat(id){
  const k = id ? DB.categorias.find(x=>x.id===id) : null;
  abrir(`${hdr(k?'Editar categoria':'Nova categoria')}<div class="mbody"><div class="fgrid">
      <div class="f"><label>Nome</label><input id="c-nome" value="${esc(k?.nome)}" placeholder="Aluguel"></div>
      <div class="f"><label>Cor</label><input id="c-cor" type="color" value="${k?.cor||'#D99A3D'}" style="height:44px;padding:4px"></div>
    </div></div>${pe(`salvarCat('${id||''}')`,'Salvar categoria')}`);
}
async function salvarCat(id){
  const nome = val('c-nome'); if(!nome) return aviso('A categoria precisa de um nome.');
  if(await salvar('categorias',{id:id||novoId(), nome, cor:val('c-cor')})){ fechar(); render(); aviso('Categoria salva.'); }
}

/* ---------- orçamentos futuros ---------- */
function openPrev(id){
  const p = id ? DB.previsoes.find(x=>x.id===id) : null, forma = p?.forma || 'A definir';
  abrir(`${hdr(p?'Editar orçamento':'Novo orçamento futuro')}<div class="mbody"><div class="fgrid">
      <div class="f full"><label>O que é</label><input id="v-desc" value="${esc(p?.descricao)}" placeholder="Cadeira, mobília, taxa"></div>
      <div class="f"><label>Valor</label><input id="v-valor" type="number" step="0.01" value="${p?.valor??''}" placeholder="0,00"></div>
      <div class="f"><label>Para qual dia</label><input id="v-quando" type="date" value="${p?.quando||''}"></div>
      <div class="f"><label>Forma de pagamento</label><select id="v-forma" onchange="mostra('box-v-parc', this.value.indexOf('Cartão')>-1)">${FORMAS.map(f=>`<option ${forma===f?'selected':''}>${f}</option>`).join('')}</select></div>
      <div class="f ${forma.indexOf('Cartão')>-1?'':'hide'}" id="box-v-parc"><label>Em quantas vezes</label><input id="v-parcelas" type="number" min="1" max="48" value="${p?.parcelas||1}"></div>
      <div class="f full"><label>Pix ou dados do pagamento</label><input id="v-destino" value="${esc(p?.destino)}" list="pixlist2" placeholder="Chave pix, banco ou nome">${listaPix('pixlist2')}</div>
      <div class="f"><label>Categoria</label><select id="v-cat">${opcoesCat(p?.categoria_id)}</select></div>
      <div class="f"><label>Fornecedor</label><input id="v-forn" list="fornlist2" value="${esc(p?.fornecedor)}" placeholder="opcional">${listaForn('fornlist2')}</div>
      ${camposAnexos('va', anexosDe(p), ['Orçamento 1','Orçamento 2'], 'Orçamentos anexados')}
      <div class="f full"><label>Observação</label><textarea id="v-obs" placeholder="Condição de pagamento, o que falta decidir">${esc(p?.obs)}</textarea></div>
    </div></div>${pe(`salvarPrev('${id||''}')`,'Salvar')}`);
}
async function salvarPrev(id){
  const descricao = val('v-desc'); if(!descricao) return aviso('Diga o que é.');
  const forma = val('v-forma');
  if(await salvar('previsoes',{id:id||novoId(), descricao, valor:num('v-valor')||0, quando:val('v-quando')||null, categoria_id:val('v-cat')||null, forma:forma||null,
    parcelas: forma.indexOf('Cartão')>-1 ? (parseInt(val('v-parcelas'))||1) : 1, destino:val('v-destino')||null, fornecedor:val('v-forn')||null, obs:val('v-obs')||null, anexos:lerAnexos('va')})){ fechar(); render(); aviso('Orçamento salvo.'); }
}
async function virarGasto(id){
  const p = DB.previsoes.find(x=>x.id===id); if(!p) return;
  const an = anexosDe(p);
  const ok = await salvar('gastos',{id:novoId(), descricao:p.descricao, valor:+p.valor||0, mes:(p.quando||hojeISO()).slice(0,7), categoria_id:p.categoria_id||null,
    pagador_id:null, tipo:'variavel', pago:false, vencimento:p.quando||null, pago_em:null, forma:p.forma||null, parcelas:p.parcelas||1, destino:p.destino||null,
    reembolso:'nao', reembolso_quem:null, fornecedor:p.fornecedor||null, comprovante:primeiroLink(an), anexos:an, obs:p.obs||null, quem_pagou:null, comprovantes_ok:false, criado:new Date().toISOString()});
  if(!ok) return;
  await remover('previsoes', id); render(); aviso(`${p.descricao} virou lançamento em aberto.`);
}

/* ---------- fornecedor (formulário em extras.js) ---------- */
function gastoDoForn(id){
  const f = DB.fornecedores.find(x=>x.id===id); if(!f) return;
  openGasto();
  document.getElementById('f-desc').value = f.nome; document.getElementById('f-forn').value = f.nome;
  if(f.valor) document.getElementById('f-valor').value = f.valor;
  if(f.categoria_id) document.getElementById('f-cat').value = f.categoria_id;
  if(f.pix) document.getElementById('f-destino').value = f.pix;
}

/* ---------- arquivos ---------- */
let pastaForm = 'outros';
function setPastaForm(id){ pastaForm=id; marcaSeg('pasta', id); }
function openArq(id){
  const a = id ? DB.arquivos.find(x=>x.id===id) : null;
  pastaForm = a?.pasta || pastaSel || 'contratos';
  abrir(`${hdr(a?'Editar arquivo':'Novo arquivo')}<div class="mbody"><div class="fgrid">
      <div class="f full"><label>Nome do arquivo</label><input id="a-nome" value="${esc(a?.nome)}" placeholder="Contrato de locação"></div>
      <div class="f full"><label>Pasta</label>${seg2('pasta', PASTAS.map(p=>[p.id,p.nome]), pastaForm, 'setPastaForm')}</div>
      ${camposAnexos('aq', anexosDe(a), ['Link 1','Link 2'], 'Links do arquivo')}
      <div class="f"><label>Válido até</label><input id="a-val" type="date" value="${a?.validade||''}"></div>
      <div class="f"><label>Responsável</label><select id="a-resp"><option value="">A definir</option>${socias().map(p=>`<option ${a?.responsavel===p.nome?'selected':''}>${esc(p.nome)}</option>`).join('')}</select></div>
      <div class="f full"><label>Observação</label><textarea id="a-obs" placeholder="Protocolo, o que precisa renovar, onde está a via física">${esc(a?.obs)}</textarea></div>
    </div></div>${pe(`salvarArq('${id||''}')`,'Salvar arquivo')}`);
}
async function salvarArq(id){
  const nome = val('a-nome'); if(!nome) return aviso('Dê um nome ao arquivo.');
  const antigo = id ? DB.arquivos.find(x=>x.id===id) : null, anexos = lerAnexos('aq');
  if(await salvar('arquivos',{id:id||novoId(), nome, pasta:pastaForm, link:primeiroLink(anexos), anexos, validade:val('a-val')||null, responsavel:val('a-resp')||null, obs:val('a-obs')||null, criado:antigo?.criado||new Date().toISOString()})){ fechar(); render(); aviso(id?'Arquivo atualizado.':'Arquivo guardado.'); }
}

/* ---------- comuns ---------- */
async function excluir(tabela, id){
  const nomes = {marcos:'esta data',evento_custos:'este custo do evento',gastos:'este gasto',categorias:'esta categoria',previsoes:'este orçamento',fornecedores:'este fornecedor',arquivos:'este arquivo',recorrencias:'esta recorrência (os gastos já lançados ficam)',metas:'este produto'};
  if(!confirm(`Excluir ${nomes[tabela]||'este item'}? Não dá para desfazer.`)) return;
  if(await remover(tabela, id)){ fechar(); render(); aviso('Excluído.'); } else render();
}
function copiar(txt){ navigator.clipboard?.writeText(txt).then(()=>aviso('Copiado.')).catch(()=>aviso('Não foi possível copiar.')); }

/* ---------- tema ---------- */
function aplicarTema(t){
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('temaIco').innerHTML = t==='dark' ? IC.sol : IC.lua;
  document.getElementById('temaTxt').textContent = t==='dark' ? 'Modo claro' : 'Modo escuro';
  try{ localStorage.setItem('sensi-tema', t); }catch(e){}
}
function alternarTema(){ aplicarTema(document.documentElement.getAttribute('data-theme')==='dark' ? 'light' : 'dark'); }

/* ---------- início ---------- */
(async ()=>{
  let t = 'light'; try{ t = localStorage.getItem('sensi-tema') || 'light'; }catch(e){}
  aplicarTema(t);
  const h = (location.hash||'').slice(1); if(VIEWS[h]) aba = h;
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('on', v.id==='v-'+aba));
  renderNav();
  await carregar();
  presetRel('mes');
  render();
})();
