/* =========================================================
   simulador.js — cenários de locação das salas por turno
   ========================================================= */
const SIM_DIAS = [['seg','Seg'],['ter','Ter'],['qua','Qua'],['qui','Qui'],['sex','Sex'],['sab','Sáb']];
const SIM_TURNOS = [['m','Manhã'],['t','Tarde'],['n','Noite']];
const MODELOS = [['turno','Por turno'],['prof','Mensalidade por profissional'],['pct','Percentual do atendimento']];
const MODELO_TXT = {turno:'Por turno', prof:'Por profissional', pct:'Percentual'};
const turnoExiste = (dia, t) => !(dia==='sab' && t==='n');   // sábado só manhã e tarde
const chaveTurno = (sala, dia, t) => `${sala}-${dia}-${t}`;

function custoFixoClinica(){
  return Math.round(DB.recorrencias.filter(r=>!r.pausada && (r.tipo||'fixo')==='fixo' && (!r.ate || r.ate>=hojeISO())).reduce((s,r)=>s+valorMensalRec(r),0));
}
function dadosPadrao(extra={}){
  return {modelo:'turno', salas:2, preco_turno:250, valor_prof:1000, turnos_prof:2, pct:30, atend_turno:6, ticket:200,
    minimo_prof:1000, aplicar_minimo:true, semanas:4.33, custo_fixo:custoFixoClinica(), ocupados:[], ...extra};
}
function todasChaves(d){
  const out = [];
  for(let s=1; s<=(+d.salas||2); s++) SIM_DIAS.forEach(([dia])=>SIM_TURNOS.forEach(([t])=>{ if(turnoExiste(dia,t)) out.push(chaveTurno(s,dia,t)); }));
  return out;
}
// ordem de preenchimento rápido: manhãs e tardes primeiro, noites por último, alternando as salas
function ordemPreenchimento(d){
  const out = [];
  [['t'],['m'],['n']].forEach(([t])=>SIM_DIAS.forEach(([dia])=>{ for(let s=1;s<=(+d.salas||2);s++) if(turnoExiste(dia,t)) out.push(chaveTurno(s,dia,t)); }));
  return out;
}

/* receita de um modelo com uma ocupação (turnos por semana) */
function receitaModelo(d, modelo, occ){
  const sem = +d.semanas||4.33, tp = Math.max(1, +d.turnos_prof||1);
  if(!occ) return {receita:0, profs:0, abaixo:false};
  const nProf = Math.ceil(occ/tp);
  const turnosDe = i => i < nProf-1 ? tp : occ - tp*(nProf-1);
  let receita = 0, minimoUsado = 0;
  for(let i=0;i<nProf;i++){
    const t = turnosDe(i);
    let r = modelo==='turno' ? t*(+d.preco_turno||0)*sem
          : modelo==='pct' ? (+d.pct||0)/100*(+d.atend_turno||0)*(+d.ticket||0)*t*sem
          : (+d.valor_prof||0);
    if(d.aplicar_minimo && r < (+d.minimo_prof||0)){ r = +d.minimo_prof||0; minimoUsado++; }
    receita += r;
  }
  return {receita, profs:nProf, minimoUsado};
}
function calcCenario(d){
  const disp = todasChaves(d).length, occ = (d.ocupados||[]).filter(k=>todasChaves(d).includes(k)).length, sem = +d.semanas||4.33;
  const r = receitaModelo(d, d.modelo, occ);
  const turnosMes = occ*sem, porTurno = turnosMes ? r.receita/turnosMes : 0;
  const lucro = r.receita - (+d.custo_fixo||0);
  const equilibrio = porTurno ? Math.ceil((+d.custo_fixo||0)/(porTurno*sem)) : null;
  const outros = Object.fromEntries(MODELOS.map(([m])=>[m, receitaModelo(d, m, occ).receita]));
  return {disp, occ, taxa: disp?occ/disp:0, turnosMes, receita:r.receita, profs:r.profs, minimoUsado:r.minimoUsado, porTurno, lucro, equilibrio, outros};
}

let simSel = null, simTimer = null;
const cenAtual = () => DB.cenarios.find(c=>c.id===simSel);
function renderSim(){
  const host = document.getElementById('simConteudo');
  if(!DB.cenarios.length){
    const d = dadosPadrao();
    host.innerHTML = `<div class="kpis">
        ${kpi('', IC.cal, 'Turnos disponíveis', `${todasChaves(d).length} por semana`, `≈ ${Math.round(todasChaves(d).length*d.semanas)} por mês · 2 salas`)}
        ${kpi('warn', IC.cash, 'Se lotar a R$ 250/turno', brl(todasChaves(d).length*250*d.semanas), 'receita máxima por mês')}
        ${kpi('info', IC.rep, 'Custos fixos da clínica', brl(d.custo_fixo), 'por mês, puxado das recorrências')}
      </div>
      <div class="panel glass">${vazio('Nenhum cenário ainda','Crie cenários e compare: por turno, por profissional ou percentual. O app mostra qual rende mais.')}
        <div style="display:flex;gap:10px;justify-content:center;padding:0 0 26px;flex-wrap:wrap"><button class="btn" onclick="criarExemplos()">${IC.plus}Criar 3 cenários de exemplo</button><button class="btn ghost" onclick="novoCenario()">Começar do zero</button></div></div>`;
    return;
  }
  if(!cenAtual()) simSel = DB.cenarios.slice().sort((a,b)=>(a.criado||'').localeCompare(b.criado||''))[0].id;
  const c = cenAtual(), d = {...dadosPadrao(), ...(c.dados||{})};
  const campo = (id, rot, v, extra='') => `<div class="f"><label>${rot}</label><input id="${id}" type="number" step="any" value="${v}" oninput="simCampo('${id.replace('s-','')}', this.value)" ${extra}></div>`;
  host.innerHTML = `
    <div class="chips">${DB.cenarios.slice().sort((a,b)=>(a.criado||'').localeCompare(b.criado||'')).map(x=>`<button class="chipbtn ${x.id===simSel?'on':''}" onclick="simSel='${x.id}';renderSim()">${esc(x.nome||'Cenário')}</button>`).join('')}
      <button class="chipbtn" onclick="novoCenario()">${IC.plus.replace('<svg','<svg width="13" height="13" stroke="currentColor" fill="none" stroke-width="2.4"')} Novo</button>
      <button class="chipbtn" onclick="duplicarCenario()">Duplicar este</button></div>
    <div class="grid2 row simgrid">
      <div class="panel glass"><header><h2>Parâmetros</h2><span class="spacer"></span><button class="iconbtn" onclick="excluirCenario()" title="Excluir cenário" aria-label="Excluir cenário">${IC.del}</button></header><div class="pbody"><div class="fgrid">
        <div class="f full"><label>Nome do cenário</label><input id="s-nome" value="${esc(c.nome)}" oninput="simNome(this.value)"></div>
        <div class="f full"><label>Como vamos cobrar</label>${seg2('smod', MODELOS, d.modelo, 'simModelo')}</div>
        ${d.modelo==='turno' ? campo('s-preco_turno','Valor por turno (mín. R$ 250)', d.preco_turno, 'min="0"') : ''}
        ${d.modelo==='prof' ? campo('s-valor_prof','Mensalidade por profissional', d.valor_prof) : ''}
        ${d.modelo==='pct' ? campo('s-pct','Percentual cobrado (%)', d.pct) + campo('s-ticket','Ticket médio da consulta', d.ticket) + campo('s-atend_turno','Atendimentos por turno', d.atend_turno) : ''}
        ${campo('s-turnos_prof','Turnos por semana de cada profissional', d.turnos_prof, 'min="1"')}
        <div class="f"><label>Mínimo por profissional</label><input id="s-minimo_prof" type="number" step="any" value="${d.minimo_prof}" oninput="simCampo('minimo_prof', this.value)"></div>
        <div class="f full" style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" id="s-aplic" ${d.aplicar_minimo?'checked':''} onchange="simCampo('aplicar_minimo', this.checked)"><label for="s-aplic" style="cursor:pointer">Garantir o mínimo de ${brl(d.minimo_prof)} por profissional em qualquer modelo</label></div>
        ${campo('s-custo_fixo','Custos fixos da clínica por mês', d.custo_fixo)}
        ${campo('s-semanas','Semanas por mês', d.semanas)}
        <div class="f full"><div class="dica" id="simAvisos"></div></div>
      </div></div></div>
      <div class="panel glass"><header><h2>Mapa de turnos</h2><span class="hint">clique para marcar os turnos ocupados</span></header><div class="pbody">
        <div class="chips" style="margin-bottom:12px">${[[0,'Vazio'],[25,'25%'],[50,'50%'],[75,'75%'],[100,'Cheio']].map(([p,t])=>`<button class="chipbtn" onclick="simPreencher(${p})">${t}</button>`).join('')}</div>
        <div id="simGrade"></div>
      </div></div>
    </div>
    <div id="simRes"></div>`;
  renderSimGrade(); renderSimRes();
}
function renderSimGrade(){
  const c = cenAtual(); if(!c) return;
  const d = {...dadosPadrao(), ...(c.dados||{})}, set = new Set(d.ocupados||[]);
  let html = '';
  for(let s=1; s<=(+d.salas||2); s++){
    html += `<div style="font-weight:800;font-size:13px;margin:${s>1?'16px':'0'} 0 8px">Sala ${s}</div>
      <div style="display:grid;grid-template-columns:62px repeat(6,1fr);gap:5px;align-items:center">
      <span></span>${SIM_DIAS.map(([dia,t])=>`<button class="dica" style="font-weight:800;text-align:center" onclick="simColuna(${s},'${dia}')" title="Marcar/desmarcar o dia inteiro">${t}</button>`).join('')}
      ${SIM_TURNOS.map(([t,nome])=>`<button class="dica" style="font-weight:800;text-align:left" onclick="simLinha(${s},'${t}')" title="Marcar/desmarcar a linha">${nome}</button>` + SIM_DIAS.map(([dia])=>{
        if(!turnoExiste(dia,t)) return `<span style="height:34px;border-radius:10px;border:1px dashed var(--linha-2);display:grid;place-items:center;font-size:10px;color:var(--tx-3)">—</span>`;
        const k = chaveTurno(s,dia,t), on = set.has(k);
        return `<button onclick="simToggle('${k}')" aria-pressed="${on}" title="Sala ${s} · ${dia} · ${nome}" style="height:34px;border-radius:10px;border:1px solid ${on?'transparent':'var(--linha-2)'};background:${on?'var(--grad-pri)':'var(--input)'};color:#fff;font-size:11px;font-weight:800">${on?'✓':''}</button>`; }).join('')).join('')}
      </div>`;
  }
  document.getElementById('simGrade').innerHTML = html;
}
function renderSimRes(){
  const c = cenAtual(); if(!c) return;
  const d = {...dadosPadrao(), ...(c.dados||{})}, x = calcCenario(d);
  const av = [];
  if(d.modelo==='turno' && +d.preco_turno < 250) av.push(`⚠ Valor por turno abaixo do mínimo de R$ 250.`);
  if(d.modelo==='prof' && +d.valor_prof < 1000) av.push(`⚠ Mensalidade abaixo do mínimo de R$ 1.000 por profissional.`);
  if(x.occ && x.porTurno < 250) av.push(`⚠ Na prática, cada turno está saindo por ${brl(x.porTurno)}, abaixo do mínimo de R$ 250.`);
  if(x.minimoUsado) av.push(`${plural(x.minimoUsado,'profissional paga','profissionais pagam')} o mínimo de ${brl(d.minimo_prof)} porque o valor calculado ficou abaixo.`);
  const el = document.getElementById('simAvisos'); if(el) el.innerHTML = av.join('<br>') || 'Tudo dentro das regras mínimas.';
  const melhorModelo = Object.entries(x.outros).sort((a,b)=>b[1]-a[1])[0];
  const lista = DB.cenarios.slice().sort((a,b)=>(a.criado||'').localeCompare(b.criado||'')).map(cc=>{ const dd={...dadosPadrao(), ...(cc.dados||{})}; return {c:cc, d:dd, x:calcCenario(dd)}; });
  const campeao = lista.slice().sort((a,b)=>b.x.receita-a.x.receita)[0];
  document.getElementById('simRes').innerHTML = `
    <div class="kpis">
      ${kpi('', IC.cal, 'Turnos ocupados', `${x.occ} de ${x.disp}`, `${Math.round(x.taxa*100)}% por semana · ≈ ${Math.round(x.turnosMes)} no mês`)}
      ${kpi('warn', IC.cash, 'Receita por mês', brl(x.receita), `${plural(x.profs,'profissional','profissionais')} · ${brl(x.porTurno)} por turno`)}
      ${kpi(x.lucro>=0?'ok':'bad', x.lucro>=0?IC.trend:IC.alert, x.lucro>=0?'Sobra depois dos custos':'Falta para cobrir os custos', brl(Math.abs(x.lucro)), `custos fixos de ${brl(d.custo_fixo)}`)}
      ${kpi('info', IC.check, 'Ponto de equilíbrio', x.equilibrio!==null?`${x.equilibrio} turnos/sem`:'—', x.equilibrio!==null?`para pagar os custos fixos (${x.disp?Math.round(x.equilibrio/x.disp*100):0}% da agenda)`:'marque turnos ocupados')}
    </div>
    <div class="grid2 row">
      <div class="panel glass"><header><h2>Com essa mesma ocupação</h2><span class="hint">quanto cada forma de cobrar renderia</span></header><div class="pbody">
        ${hbars(MODELOS.map(([m,t],i)=>({nome:MODELO_TXT[m], cor:[CORES.pri,CORES.ouro,CORES.verde][i], total:x.outros[m], sub: m===melhorModelo[0]&&x.occ?'rende mais':(m===d.modelo?'modelo atual':'')})), '<div class="dica">Marque os turnos ocupados no mapa.</div>')}
        ${x.occ?`<div class="preview" style="margin-top:10px">Com ${x.occ} turnos ocupados por semana, <b>${MODELO_TXT[melhorModelo[0]].toLowerCase()}</b> rende mais: <b>${brl(melhorModelo[1])}</b> por mês.</div>`:''}
      </div></div>
      <div class="panel glass"><header><h2>Comparando os cenários</h2><span class="hint">receita por mês</span></header><div class="pbody">
        ${svgBarras(lista.map(l=>({rotulo:(l.c.nome||'Cenário').slice(0,14), destaque:l.c.id===simSel, partes:[{v:l.x.receita, cor:l===campeao?CORES.verde:CORES.pri, nome:l.c.nome}]})), {altura:200})}
      </div></div>
    </div>
    <div class="panel glass"><header><h2>Todos os cenários</h2></header><div class="tw"><table><thead><tr><th>Cenário</th><th>Cobrança</th><th class="num">Ocupação</th><th class="num">Profissionais</th><th class="num">Por turno</th><th class="num">Receita/mês</th><th class="num">Depois dos custos</th></tr></thead><tbody>
      ${lista.map(l=>`<tr style="cursor:pointer" onclick="simSel='${l.c.id}';renderSim();window.scrollTo({top:0,behavior:'smooth'})"><td><b>${esc(l.c.nome||'Cenário')}</b> ${l===campeao&&l.x.receita>0?'<span class="chip ok">rende mais</span>':''}</td>
        <td>${MODELO_TXT[l.d.modelo]}${l.d.modelo==='turno'?' · '+brl(l.d.preco_turno):l.d.modelo==='prof'?' · '+brl(l.d.valor_prof):' · '+l.d.pct+'%'}</td>
        <td class="num">${l.x.occ}/${l.x.disp} · ${Math.round(l.x.taxa*100)}%</td><td class="num">${l.x.profs}</td><td class="num">${brl(l.x.porTurno)}</td>
        <td class="num"><b>${brl(l.x.receita)}</b></td><td class="num" style="color:${l.x.lucro>=0?'var(--ok)':'var(--bad)'}">${brl(l.x.lucro)}</td></tr>`).join('')}
    </tbody></table></div></div>`;
}
function simAtualizar(muda, redesenhar){
  const c = cenAtual(); if(!c) return;
  const novo = {...c, dados:{...dadosPadrao(), ...(c.dados||{}), ...muda}, atualizado:new Date().toISOString()};
  DB.cenarios = DB.cenarios.map(x=>x.id===c.id?novo:x);
  if(redesenhar) renderSim(); else { renderSimGrade(); renderSimRes(); }
  clearTimeout(simTimer);
  simTimer = setTimeout(()=>salvar('cenarios', DB.cenarios.find(x=>x.id===c.id)), 600);
}
function simCampo(campo, v){ simAtualizar({[campo]: typeof v==='boolean' ? v : (parseFloat(String(v).replace(',','.'))||0)}); }
function simModelo(m){ simAtualizar({modelo:m}, true); }
function simNome(v){
  const c = cenAtual(); if(!c) return;
  DB.cenarios = DB.cenarios.map(x=>x.id===c.id?{...x, nome:v}:x);
  clearTimeout(simTimer); simTimer = setTimeout(()=>{ salvar('cenarios', DB.cenarios.find(x=>x.id===c.id)); renderSimRes(); }, 600);
}
function simToggle(k){ const d = cenAtual().dados||{}, s = new Set(d.ocupados||[]); s.has(k)?s.delete(k):s.add(k); simAtualizar({ocupados:[...s]}); }
function simGrupo(chaves){
  const d = cenAtual().dados||{}, s = new Set(d.ocupados||[]), todas = chaves.every(k=>s.has(k));
  chaves.forEach(k=>todas?s.delete(k):s.add(k)); simAtualizar({ocupados:[...s]});
}
function simLinha(sala, t){ simGrupo(SIM_DIAS.map(([dia])=>dia).filter(dia=>turnoExiste(dia,t)).map(dia=>chaveTurno(sala,dia,t))); }
function simColuna(sala, dia){ simGrupo(SIM_TURNOS.map(([t])=>t).filter(t=>turnoExiste(dia,t)).map(t=>chaveTurno(sala,dia,t))); }
function simPreencher(p){ const d = {...dadosPadrao(), ...(cenAtual().dados||{})}, o = ordemPreenchimento(d); simAtualizar({ocupados:o.slice(0, Math.round(o.length*p/100))}); }
async function novoCenario(dados, nome){
  const c = {id:novoId(), nome: nome || `Cenário ${DB.cenarios.length+1}`, dados: dados || dadosPadrao({ocupados: ordemPreenchimento(dadosPadrao()).slice(0,17)}), criado:new Date().toISOString(), atualizado:new Date().toISOString()};
  if(await salvar('cenarios', c)){ simSel = c.id; renderSim(); }
}
async function duplicarCenario(){ const c = cenAtual(); if(c) await novoCenario(JSON.parse(JSON.stringify(c.dados||{})), (c.nome||'Cenário')+' (cópia)'); }
async function criarExemplos(){
  const o = ordemPreenchimento(dadosPadrao()), meia = o.slice(0, Math.round(o.length*.6));
  const exs = [
    ['Por turno · R$ 250 · 60%', dadosPadrao({modelo:'turno', preco_turno:250, ocupados:meia})],
    ['Mensalidade R$ 1.000 · 2 turnos/sem', dadosPadrao({modelo:'prof', valor_prof:1000, turnos_prof:2, ocupados:meia})],
    ['30% do atendimento · 60%', dadosPadrao({modelo:'pct', pct:30, ticket:200, atend_turno:6, ocupados:meia})]
  ].map(([nome,dados],i)=>({id:novoId(), nome, dados, criado:new Date(Date.now()+i).toISOString(), atualizado:new Date().toISOString()}));
  if(await inserirVarios('cenarios', exs)){ simSel = exs[0].id; renderSim(); aviso('3 cenários criados. Mude os valores e os turnos para comparar.'); }
}
async function excluirCenario(){
  const c = cenAtual(); if(!c || !confirm(`Excluir o cenário "${c.nome}"?`)) return;
  if(await remover('cenarios', c.id)){ simSel = null; renderSim(); aviso('Cenário excluído.'); }
}
