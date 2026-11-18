/* =========================================================
   core.js — banco, utilidades e cálculos (sem nada de tela)
   ========================================================= */

/* ---------- CONFIG SUPABASE ---------- */
const SUPABASE_URL = 'https://vcygcxzextvgsufsdmjq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_h3eBSxlVdZ6ttM0b4WT1Aw_Bs-2-X9C';

const TABELAS = ['categorias','pagadores','gastos','previsoes','fornecedores','arquivos','recorrencias','metas','eventos','evento_custos','atas','marcos','cenarios'];
const online = !!(SUPABASE_URL && SUPABASE_KEY);
let erroBanco = '';
let DB = { categorias:[], pagadores:[], gastos:[], previsoes:[], fornecedores:[], arquivos:[], recorrencias:[], metas:[], eventos:[], evento_custos:[], atas:[], marcos:[], cenarios:[] };

/* ---------- utilidades ---------- */
const pad = n => String(n).padStart(2,'0');
const isoLocal = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const hojeISO = () => isoLocal(new Date());
let mes = hojeISO().slice(0,7);
let aba = 'geral';

const FORMAS = ['Pix','Cartão de crédito','Cartão de débito','Boleto','Transferência','Dinheiro','A definir'];
const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const MES3 = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const DIAS = ['dom','seg','ter','qua','qui','sex','sáb'];
const DIAS_LONGO = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];

const novoId = () => 'id'+Math.random().toString(36).slice(2,10);
const brl = v => (+v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const brlK = v => { v=+v||0; return Math.abs(v)>=1000 ? 'R$ '+(v/1000).toLocaleString('pt-BR',{maximumFractionDigits:1})+'k' : 'R$ '+Math.round(v).toLocaleString('pt-BR'); };
const mesNome = m => { const [a,x]=m.split('-'); return `${MESES[+x-1]} ${a}`; };
const mesCurto = m => { const [a,x]=m.split('-'); return `${MES3[+x-1]}/${a.slice(2)}`; };
const dBR = d => d ? d.split('-').reverse().join('/') : '';
const esc = s => String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const soma = arr => arr.reduce((s,g)=>s+(+g.valor||0),0);
const cat = id => DB.categorias.find(x=>x.id===id);
const pag = id => DB.pagadores.find(x=>x.id===id);

function diasAte(d){
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  return Math.round((new Date(d+'T00:00:00') - hoje)/86400000);
}
function addDias(iso, n){ const d=new Date(iso+'T00:00:00'); d.setDate(d.getDate()+n); return isoLocal(d); }
function ultimoDia(a,m){ return new Date(a,m,0).getDate(); }
// soma n meses mantendo o dia (cai no último dia em meses curtos)
function addMeses(iso, n, dia){
  let [a,m,d] = iso.split('-').map(Number);
  if(dia) d = dia;
  m += n; while(m>12){m-=12;a++;} while(m<1){m+=12;a--;}
  return `${a}-${pad(m)}-${pad(Math.min(d, ultimoDia(a,m)))}`;
}
function addMes(m, n){ return addMeses(m+'-01', n).slice(0,7); }
function difMeses(a, b){ const [y1,m1]=a.split('-').map(Number), [y2,m2]=b.split('-').map(Number); return (y2-y1)*12+(m2-m1); }
function quandoTxt(d){
  const n = diasAte(d);
  if(n < 0) return `venceu há ${-n} dia${n!==-1?'s':''}`;
  if(n === 0) return 'vence hoje';
  if(n === 1) return 'vence amanhã';
  return `em ${n} dias`;
}

/* ---------- sócias ---------- */
// "Sócias" é o registro antigo usado quando as duas pagavam juntas
const ehRegistroSocias = p => /^s[oó]cias$/i.test((p?.nome||'').trim());
const socias = () => DB.pagadores.filter(p=>!ehRegistroSocias(p)).slice(0,2);
const nomeSocia = i => socias()[i]?.nome || `Sócia ${i+1}`;
const outraSocia = id => socias().find(p=>p.id!==id);

/* ---------- anexos (2 links, cada um com observação) ---------- */
function anexosDe(x){
  const a = Array.isArray(x?.anexos) ? x.anexos : [];
  const out = [0,1].map(i=>({url:a[i]?.url||null, obs:a[i]?.obs||null}));
  if(!out[0].url && !out[1].url){
    const legado = x?.comprovante || x?.link;
    if(legado){ out[0].url = legado; }
  }
  return out;
}
const temAnexo = x => anexosDe(x).some(a=>a.url);

/* ---------- gastos ---------- */
const atrasado = g => !g.pago && !!g.vencimento && g.vencimento < hojeISO();
const dataDoGasto = g => g.pago ? (g.pago_em || g.vencimento) : g.vencimento;
const dataRef = g => dataDoGasto(g) || (g.mes ? g.mes+'-01' : null);
const doMes = (m=mes) => DB.gastos.filter(g=>g.mes===m);
function formaTxt(g){
  if(!g.forma) return '';
  return g.forma + ((+g.parcelas||1) > 1 ? ` ${g.parcelas}x` : '');
}
// 'ambas' | 'uma' | null (lançamentos antigos ficam null)
const quemPagou = g => g.pago ? (g.quem_pagou || null) : null;
function quemPagouTxt(g){
  if(!g.pago) return '';
  if(g.quem_pagou==='ambas') return 'as duas pagaram';
  if(g.quem_pagou==='uma'){ const p=pag(g.pagador_id); return p ? `só ${p.nome} pagou` : 'só uma pagou'; }
  return '';
}
const valorReembolso = g => (+g.valor||0)/2;
const reembolsoPendente = g => g.reembolso === 'pendente';

function rotulosAnexo(g){
  const qp = g?.pago ? g.quem_pagou : null;
  if(qp==='ambas') return [`Comprovante da ${nomeSocia(0)}`, `Comprovante da ${nomeSocia(1)}`];
  if(qp==='uma') return ['Comprovante do pagamento', 'Comprovante do reembolso'];
  return ['Anexo 1', 'Anexo 2'];
}
// quais comprovantes ainda faltam subir (só para lançamentos novos, com "quem pagou" informado)
function compFaltando(g){
  if(!g.pago || !g.quem_pagou || g.comprovantes_ok) return [];
  const a = anexosDe(g), r = rotulosAnexo(g), out = [];
  if(g.quem_pagou==='ambas'){ if(!a[0].url) out.push(r[0]); if(!a[1].url) out.push(r[1]); }
  else { if(!a[0].url) out.push(r[0]); if(g.reembolso==='feito' && !a[1].url) out.push(r[1]); }
  return out;
}

/* ---------- recorrências ---------- */
const FREQ = {mensal:'Todo mês', semanal:'Toda semana', quinzenal:'A cada 15 dias', anual:'Todo ano'};
function freqTxt(r){
  if(r.frequencia==='semanal') return `Toda ${DIAS_LONGO[+r.dia_semana||1]}`;
  if(r.frequencia==='quinzenal') return 'A cada 15 dias';
  if(r.frequencia==='anual') return `Todo ano, dia ${r.dia||1}/${pad(r.mes_ano||1)}`;
  return `Todo dia ${r.dia||1}`;
}
const porMes = r => !r.frequencia || r.frequencia==='mensal' || r.frequencia==='anual';
// datas em que a recorrência acontece entre `de` e `ate` (inclusivas)
function ocorrencias(r, de, ate){
  const out=[];
  const fim = r.ate && r.ate < ate ? r.ate : ate;
  const ini = r.inicio && r.inicio > de ? r.inicio : de;
  if(!ini || !fim || ini > fim) return out;
  if(r.frequencia==='semanal' || r.frequencia==='quinzenal'){
    const passo = r.frequencia==='semanal' ? 7 : 14;
    let d = r.inicio || ini;
    if(r.frequencia==='semanal'){
      const alvo = +r.dia_semana||0; const dt=new Date(d+'T00:00:00');
      while(dt.getDay()!==alvo) dt.setDate(dt.getDate()+1);
      d = isoLocal(dt);
    }
    while(d < ini) d = addDias(d, passo);
    while(d <= fim){ out.push(d); d = addDias(d, passo); }
    return out;
  }
  if(r.frequencia==='anual'){
    for(let a=+ini.slice(0,4); ; a++){
      const m=+r.mes_ano||1, s=`${a}-${pad(m)}-${pad(Math.min(+r.dia||1, ultimoDia(a,m)))}`;
      if(s > fim) break; if(s >= ini) out.push(s);
    }
    return out;
  }
  let [a,m] = ini.slice(0,7).split('-').map(Number);
  while(true){
    const s = `${a}-${pad(m)}-${pad(Math.min(+r.dia||1, ultimoDia(a,m)))}`;
    if(s > fim) break; if(s >= ini) out.push(s);
    m++; if(m>12){m=1;a++;}
  }
  return out;
}
const gastosDaRec = r => DB.gastos.filter(g=>g.recorrencia_id===r.id);
function jaLancada(r, data){
  return gastosDaRec(r).some(g=>{
    if(g.vencimento===data) return true;
    if(porMes(r)) return (g.vencimento||g.mes||'').slice(0,7)===data.slice(0,7);
    return !g.vencimento && g.mes===data.slice(0,7);
  });
}
function recPendentes(de, ate){
  const out=[];
  DB.recorrencias.forEach(r=>{
    if(r.pausada) return;
    ocorrencias(r,de,ate).forEach(data=>{ if(!jaLancada(r,data)) out.push({r,data}); });
  });
  return out.sort((a,b)=>a.data.localeCompare(b.data));
}
const valorMensalRec = r => { const v=+r.valor||0; return r.frequencia==='semanal'?v*4.33 : r.frequencia==='quinzenal'?v*2.17 : r.frequencia==='anual'?v/12 : v; };
const recDoGasto = g => g?.recorrencia_id ? DB.recorrencias.find(r=>r.id===g.recorrencia_id) : null;

// progresso de um contrato: quantos pagamentos no total, quantos pagos, quanto falta
function recInfo(r){
  const lig = gastosDaRec(r);
  const pagos = lig.filter(g=>g.pago).length;
  let total = null, datas = [];
  if(r.ate){
    datas = ocorrencias(r, r.inicio || r.ate, r.ate);
    total = Math.max(datas.length, lig.length);
  }
  const hoje = hojeISO();
  const abertos = lig.filter(g=>!g.pago && g.vencimento).map(g=>g.vencimento);
  const pend = r.pausada ? [] : ocorrencias(r, addDias(hoje,-120), r.ate || addDias(hoje,400)).filter(d=>!jaLancada(r,d));
  const proxima = [...abertos, ...pend].sort()[0] || null;
  const restantes = total!==null ? Math.max(0, total - pagos) : null;
  const encerrada = !!(r.ate && r.ate < hoje && !proxima);
  return {total, pagos, lancados:lig.length, restantes, valorRestante: restantes!==null ? restantes*(+r.valor||0) : null, proxima, encerrada, datas};
}
// número do pagamento dentro do contrato ("3/6")
function indiceNaRec(r, data){
  if(!data) return null;
  const datas = ocorrencias(r, r.inicio || data, r.ate || addMeses(data,1));
  if(porMes(r)){ const i = datas.findIndex(d=>d.slice(0,7)===data.slice(0,7)); if(i>=0) return i+1; }
  const i = datas.indexOf(data); if(i>=0) return i+1;
  return datas.filter(d=>d<=data).length || 1;
}
function parcelaTxt(g){
  const r = recDoGasto(g); if(!r || !r.ate) return '';
  const info = recInfo(r);
  const i = indiceNaRec(r, g.vencimento || (g.mes ? g.mes+'-'+pad(r.dia||1) : null));
  return i ? `${Math.min(i,info.total)}/${info.total}` : '';
}
function parcelaRecTxt(r, data){
  if(!r.ate) return '';
  const info = recInfo(r); const i = indiceNaRec(r, data);
  return i ? `${Math.min(i,info.total)}/${info.total}` : '';
}

/* ---------- custos fixos de um mês (lançados + programados) ---------- */
function fixosDoMes(m){
  const de = `${m}-01`, ate = `${m}-${pad(ultimoDia(...m.split('-').map(Number)))}`;
  const itens = [];
  DB.gastos.filter(g=>g.tipo==='fixo' && (dataRef(g)||'').slice(0,7)===m).forEach(g=>{
    itens.push({data:dataDoGasto(g)||de, descricao:g.descricao, valor:+g.valor||0, status:g.pago?'pago':(atrasado(g)?'vencido':'aberto'), g, parc:parcelaTxt(g)});
  });
  recPendentes(de, ate).filter(x=>(x.r.tipo||'fixo')==='fixo').forEach(x=>{
    itens.push({data:x.data, descricao:x.r.descricao, valor:+x.r.valor||0, status: x.data < hojeISO() ? 'vencido' : 'programado', r:x.r, parc:parcelaRecTxt(x.r,x.data)});
  });
  return itens.sort((a,b)=>a.data.localeCompare(b.data));
}
// total por mês (para gráficos): lançado no mês + o que ainda vai ser lançado de recorrência
function totaisDoMes(m){
  const gs = DB.gastos.filter(g=>(dataRef(g)||'').slice(0,7)===m);
  const de = `${m}-01`, ate = `${m}-${pad(ultimoDia(...m.split('-').map(Number)))}`;
  const pend = recPendentes(de, ate);
  const fixo = soma(gs.filter(g=>g.tipo==='fixo')), variavel = soma(gs.filter(g=>g.tipo!=='fixo'));
  const progFixo = pend.filter(x=>(x.r.tipo||'fixo')==='fixo').reduce((s,x)=>s+(+x.r.valor||0),0);
  const progVar = pend.filter(x=>x.r.tipo==='variavel').reduce((s,x)=>s+(+x.r.valor||0),0);
  return {fixo, variavel, programado: progFixo+progVar, progFixo, progVar};
}

/* ---------- lembretes ---------- */
function lembretes(){
  const hoje = hojeISO(), limite = addDias(hoje, 10);
  const comp = DB.gastos.filter(g=>compFaltando(g).length).sort((a,b)=>(dataRef(b)||'').localeCompare(dataRef(a)||''));
  const vencidos = DB.gastos.filter(atrasado).sort((a,b)=>a.vencimento.localeCompare(b.vencimento));
  const proximos = DB.gastos.filter(g=>!g.pago && g.vencimento && g.vencimento>=hoje && g.vencimento<=limite).sort((a,b)=>a.vencimento.localeCompare(b.vencimento));
  const recs = recPendentes(addDias(hoje,-60), limite);
  const reemb = DB.gastos.filter(reembolsoPendente);
  const docs = DB.arquivos.filter(a=>a.validade && diasAte(a.validade)<=30).sort((a,b)=>a.validade.localeCompare(b.validade));
  const datas = [
    ...DB.marcos.filter(m=>m.data && m.data>=hoje && diasAte(m.data)<=14).map(m=>({tipo:'marco', x:m, data:m.data})),
    ...DB.eventos.filter(e=>e.data && e.data>=hoje && diasAte(e.data)<=14).map(e=>({tipo:'evento', x:e, data:e.data}))
  ].sort((a,b)=>a.data.localeCompare(b.data));
  const urgentes = vencidos.length + recs.filter(x=>x.data<hoje).length + proximos.filter(g=>diasAte(g.vencimento)<=3).length + recs.filter(x=>x.data>=hoje && diasAte(x.data)<=3).length;
  return {comp, vencidos, proximos, recs, reemb, docs, datas, total: comp.length + vencidos.length + proximos.length + recs.length + reemb.length + docs.length + datas.length, urgentes};
}

/* ---------- persistência ---------- */
async function api(tabela, metodo, corpo, filtro){
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${tabela}${filtro||''}`,{
    method:metodo,
    headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Content-Type':'application/json','Prefer':'return=minimal'},
    body: corpo ? JSON.stringify(corpo) : undefined
  });
  if(!r.ok) throw new Error(await r.text());
  if(metodo!=='GET') return null;
  return r.json();
}
function seed(){
  DB.categorias = [
    {id:'cat_aluguel',nome:'Aluguel',cor:'#D99A3D'},{id:'cat_obra',nome:'Obra e reforma',cor:'#B5563A'},
    {id:'cat_equip',nome:'Equipamentos',cor:'#8A6A3B'},{id:'cat_mkt',nome:'Marketing',cor:'#5E8C61'},
    {id:'cat_contab',nome:'Contabilidade',cor:'#4F6D8A'},{id:'cat_util',nome:'Água, luz e internet',cor:'#6E5231'}
  ];
  DB.pagadores = [{id:'pag_vitoria',nome:'Vitória',pix:'',cor:'#D99A3D'},{id:'pag_sabrina',nome:'Sabrina',pix:'',cor:'#B5563A'}];
}
// carrega as 8 tabelas ao mesmo tempo (antes era uma por vez)
async function carregar(){
  if(!online){ seed(); return; }
  const res = await Promise.allSettled(TABELAS.map(t=>api(t,'GET',null,'?select=*')));
  res.forEach((r,i)=>{
    const t = TABELAS[i];
    if(r.status==='fulfilled'){ DB[t] = r.value || []; return; }
    DB[t] = [];
    const msg = (r.reason && r.reason.message) || String(r.reason);
    if(!erroBanco) erroBanco = `Tabela "${t}": ${msg.slice(0,240)}`;
    console.warn('Falha ao carregar', t, r.reason);
  });
  if(!erroBanco && !DB.categorias.length && !DB.pagadores.length){
    seed();
    await Promise.allSettled([...DB.categorias.map(k=>api('categorias','POST',k)), ...DB.pagadores.map(p=>api('pagadores','POST',p))]);
  }
  if(erroBanco && !DB.pagadores.length) seed();
}
async function salvar(tabela, reg){
  const antes = DB[tabela];
  const novo = !antes.find(x=>x.id===reg.id);
  DB[tabela] = novo ? [...antes, reg] : antes.map(x=>x.id===reg.id?reg:x);
  if(!online) return true;
  try{ await api(tabela, novo?'POST':'PATCH', reg, novo?'':`?id=eq.${encodeURIComponent(reg.id)}`); return true; }
  catch(e){
    DB[tabela] = antes;
    erroBanco = ((e && e.message) || String(e)).slice(0,300);
    aviso('O banco não aceitou salvar. Veja o aviso no topo.');
    render();
    return false;
  }
}
async function inserirVarios(tabela, regs){
  if(!regs.length) return true;
  if(online){
    try{ await api(tabela,'POST',regs); }
    catch(e){ erroBanco = ((e && e.message) || String(e)).slice(0,300); aviso('O banco não aceitou a importação.'); render(); return false; }
  }
  DB[tabela] = [...DB[tabela], ...regs]; return true;
}
async function remover(tabela, id){
  const antes = DB[tabela];
  DB[tabela] = antes.filter(x=>x.id!==id);
  if(!online) return true;
  try{ await api(tabela,'DELETE',null,`?id=eq.${encodeURIComponent(id)}`); return true; }
  catch(e){
    DB[tabela] = antes;
    erroBanco = ((e && e.message) || String(e)).slice(0,300);
    aviso('O banco não deixou excluir. Nada foi apagado.');
    return false;
  }
}
