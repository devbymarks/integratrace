const $=s=>document.querySelector(s);const state={integrations:[],checks:[],last:new Map(),view:'overview',editing:null};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=v=>{if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':d.toLocaleString('pt-BR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});};
const urlShort=v=>{try{const u=new URL(v);return u.host+(u.pathname==='/'?'':u.pathname);}catch{return v||'—';}};
let demoMode=false;
let demoData=null;
const demoStorageKey='integratrace-demo-v1';
function makeDemoData(){
 const now=Date.now();
 const integrations=[
  {id:1,name:'Payments API',description:'Serviço de pagamentos',url:'https://api.example.com/payments/health',method:'GET',expectedStatus:200,timeoutSeconds:5,active:true,createdAt:new Date(now-86400000*12).toISOString(),updatedAt:new Date(now-3600000).toISOString()},
  {id:2,name:'Customer Hub',description:'Cadastro de clientes',url:'https://customers.example.com/health',method:'HEAD',expectedStatus:200,timeoutSeconds:5,active:true,createdAt:new Date(now-86400000*8).toISOString(),updatedAt:new Date(now-7200000).toISOString()},
  {id:3,name:'Legacy Reports',description:'Relatórios antigos',url:'https://reports.example.com/status',method:'GET',expectedStatus:200,timeoutSeconds:10,active:false,createdAt:new Date(now-86400000*20).toISOString(),updatedAt:new Date(now-86400000).toISOString()}
 ];
 const checks=[
  {id:2,integrationId:2,integrationName:integrations[1].name,result:'FAILED',httpStatus:503,latencyMs:184, message:'Check demonstrativo: HTTP 503 simulado.',checkedAt:new Date(now-900000).toISOString()},
  {id:1,integrationId:1,integrationName:integrations[0].name,result:'SUCCESS',httpStatus:200,latencyMs:72,message:'Check demonstrativo concluído.',checkedAt:new Date(now-3600000).toISOString()}
 ];
 return {integrations,checks,nextId:4,nextCheckId:3};
}
function readDemoData(){
 if(demoData)return demoData;
 try{const saved=localStorage.getItem(demoStorageKey);if(saved){demoData=JSON.parse(saved);return demoData;}}catch{}
 demoData=makeDemoData();saveDemoData();return demoData;
}
function saveDemoData(){try{localStorage.setItem(demoStorageKey,JSON.stringify(demoData));}catch{}}
function resetDemoData(){demoData=makeDemoData();saveDemoData();}
function demoApi(path,opts={}){
 const data=readDemoData(),method=(opts.method||'GET').toUpperCase(),[route,query='']=path.split('?'),params=new URLSearchParams(query),body=opts.body?JSON.parse(opts.body):{};
 if(route==='/api/health')return {status:'UP',application:'IntegraTrace Demo',time:new Date().toISOString()};
 if(route==='/api/dashboard'){
  const successfulChecks=data.checks.filter(c=>c.result==='SUCCESS').length,failedChecks=data.checks.filter(c=>c.result==='FAILED').length;
  return {totalIntegrations:data.integrations.length,activeIntegrations:data.integrations.filter(i=>i.active).length,successfulChecks,failedChecks,averageLatencyMs:Math.round(data.checks.reduce((sum,c)=>sum+c.latencyMs,0)/(data.checks.length||1)),checksInWindow:data.checks.length};
 }
 if(route==='/api/integrations'&&method==='GET'){
  let list=[...data.integrations];const q=(params.get('q')||'').trim().toLowerCase(),active=params.get('active');
  if(q)list=list.filter(i=>`${i.name} ${i.url}`.toLowerCase().includes(q));if(active!==null)list=list.filter(i=>String(i.active)===active);
  return list.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
 }
 if(route==='/api/integrations'&&method==='POST'){
  const now=new Date().toISOString(),item={...body,id:data.nextId++,createdAt:now,updatedAt:now};data.integrations.unshift(item);saveDemoData();return item;
 }
 if(route==='/api/check-runs'&&method==='GET')return [...data.checks].sort((a,b)=>b.checkedAt.localeCompare(a.checkedAt)).slice(0,100);
 const match=route.match(/^\/api\/integrations\/(\d+)(?:\/(checks|active))?$/);
 if(!match)throw new Error('Endpoint indisponível no modo local.');
 const id=Number(match[1]),sub=match[2],index=data.integrations.findIndex(i=>i.id===id),item=data.integrations[index];
 if(sub==='checks'&&method==='POST'){
  if(!item)throw new Error('Integração não encontrada.');
  const check={id:data.nextCheckId++,integrationId:id,integrationName:item.name,result:'SUCCESS',httpStatus:item.expectedStatus,latencyMs:Math.floor(35+Math.random()*90),message:'Check simulado localmente; nenhuma requisição foi enviada.',checkedAt:new Date().toISOString()};
  data.checks.unshift(check);saveDemoData();return check;
 }
 if(sub==='checks'&&method==='GET')return data.checks.filter(c=>c.integrationId===id).slice(0,50);
 if(sub==='active'&&method==='PATCH'){
  if(!item)throw new Error('Integração não encontrada.');item.active=Boolean(body.active);item.updatedAt=new Date().toISOString();saveDemoData();return item;
 }
 if(sub||!item)throw new Error('Integração não encontrada.');
 if(method==='GET')return item;
 if(method==='PUT'){Object.assign(item,body,{id,updatedAt:new Date().toISOString()});saveDemoData();return item;}
 if(method==='DELETE'){
  if(data.checks.some(c=>c.integrationId===id))throw new Error('Esta integração possui histórico de checks.');
  data.integrations.splice(index,1);saveDemoData();return null;
 }
 throw new Error('Ação não disponível no modo local.');
}
async function api(path,opts={}){
 if(demoMode)return demoApi(path,opts);
 const r=await fetch(path,{...opts,headers:{'Content-Type':'application/json',...(opts.headers||{})}});
 if(r.status===204)return null;const t=await r.text();let data;try{data=t?JSON.parse(t):null;}catch{data=t;}
 if(!r.ok)throw new Error(data?.error||data?.message||`Erro HTTP ${r.status}`);return data;
}function toast(msg,type='success'){const n=document.createElement('div');n.className=`toast ${type}`;n.innerHTML=`<b>${type==='error'?'!':'✓'}</b> ${esc(msg)}`;$('#toasts').append(n);setTimeout(()=>n.remove(),4200);}
function pill(r){return r==='SUCCESS'?'<span class="pill success">Saudável</span>':r==='FAILED'?'<span class="pill failed">Falha</span>':'<span class="pill unknown">Sem check</span>';}
function lastFor(id){return state.last.get(Number(id));}
function rows(items,full=false){
 if(!items.length)return `<tr><td class="empty" colspan="${full?6:4}">Nenhuma integração encontrada. Cadastre um endpoint para começar.</td></tr>`;
 return items.map(i=>{
  const c=lastFor(i.id),name=esc(i.name),symbol=esc((i.name||'API').replace(/[^a-z0-9]/gi,'').slice(0,2).toUpperCase()||'API');
  if(full)return `<tr><td><div class="name-cell"><span class="symbol">${symbol}</span><div><b>${name}</b><small>${esc(i.description||(i.active?'Ativa':'Inativa'))}</small></div></div></td><td><span class="endpoint" title="${esc(i.url)}">${esc(urlShort(i.url))}</span></td><td><span class="method">${esc(i.method)}</span></td><td>${pill(c?.result)} ${!i.active?'<span class="pill unknown">Inativa</span>':''}</td><td><span class="latency">${c?`${c.latencyMs} ms · ${date(c.checkedAt)}`:'Ainda não verificada'}</span></td><td><button class="mini-btn run" data-action="check" data-id="${i.id}" ${!i.active?'disabled':''}>▶</button><button class="mini-btn" data-action="edit" data-id="${i.id}">Editar</button><button class="mini-btn" data-action="toggle" data-id="${i.id}">${i.active?'Pausar':'Ativar'}</button></td></tr>`;
  return `<tr><td><div class="name-cell"><span class="symbol">${symbol}</span><div><b>${name}</b><small title="${esc(i.url)}">${esc(urlShort(i.url))}</small></div></div></td><td>${pill(c?.result)}</td><td><span class="latency">${c?c.latencyMs+' ms':'—'}</span></td><td><button class="mini-btn run" data-action="check" data-id="${i.id}">Executar check</button></td></tr>`;
 }).join('');
}function renderRows(){const q=($('#overview-search').value||'').toLowerCase().trim();const list=state.integrations.filter(i=>`${i.name} ${i.url}`.toLowerCase().includes(q)).slice(0,6);$('#overview-rows').innerHTML=rows(list);$('#overview-count').textContent=`${list.length} registro(s)`;$('#overview-foot').textContent=`${state.integrations.length} integração(ões) no inventário`;
 const q2=($('#integration-search').value||'').toLowerCase().trim(),active=$('#active-filter').value;const all=state.integrations.filter(i=>`${i.name} ${i.url} ${i.description||''}`.toLowerCase().includes(q2)).filter(i=>active===''||String(i.active)===active);$('#integration-rows').innerHTML=rows(all,true);$('#integration-foot').textContent=`${all.length} de ${state.integrations.length} integração(ões)`;$('#nav-count').textContent=state.integrations.length;}
function renderActivity(){const list=state.checks.slice(0,6);$('#activity-list').innerHTML=list.length?list.map(c=>`<div class="activity-item"><span class="activity-mark ${c.result==='SUCCESS'?'success':'failed'}">${c.result==='SUCCESS'?'✓':'!'}</span><div class="activity-main"><b>${esc(c.integrationName||'Integração')}</b><small>${esc(c.message||'Sem detalhe')} · ${c.httpStatus?'HTTP '+c.httpStatus:'sem resposta HTTP'}</small></div><span class="activity-time">${date(c.checkedAt)}</span></div>`).join(''):'<div class="empty">Nenhum check registrado.<small>Execute uma verificação para começar.</small></div>';}
function renderHistory(){const q=($('#history-search').value||'').toLowerCase().trim(),filter=$('#history-filter').value;const list=state.checks.filter(c=>`${c.integrationName||''} ${c.message||''} ${c.result||''} ${c.httpStatus||''}`.toLowerCase().includes(q)).filter(c=>!filter||c.result===filter);$('#history-rows').innerHTML=list.length?list.map(c=>`<tr><td><span class="latency">${date(c.checkedAt)}</span></td><td><b>${esc(c.integrationName||'Integração')}</b></td><td>${pill(c.result)}</td><td>${c.httpStatus??'—'}</td><td><span class="latency">${c.latencyMs} ms</span></td><td style="white-space:normal;min-width:180px">${esc(c.message||'—')}</td></tr>`).join(''):'<tr><td class="empty" colspan="6">Nenhum check corresponde ao filtro.</td></tr>';$('#history-foot').textContent=`${list.length} registro(s) exibido(s)`;}
function renderMetrics(d){$('#m-total').textContent=d.totalIntegrations??0;$('#m-active').textContent=`${d.activeIntegrations??0} ativas`;$('#m-success').textContent=d.successfulChecks??0;$('#m-failed').textContent=d.failedChecks??0;$('#m-latency').textContent=d.averageLatencyMs??0;$('#hero-latency').innerHTML=`${d.averageLatencyMs??0} <em>ms</em>`;}
async function load(){
 try{
  const [health,d,integrations,checks]=await Promise.all([api('/api/health'),api('/api/dashboard'),api('/api/integrations'),api('/api/check-runs')]);
  $('#api-status').textContent=demoMode?'demo local':(health.status==='UP'?'conectada':'indisponível');
  $('#api-state').classList.toggle('is-online',!demoMode&&health.status==='UP');$('#api-state').classList.toggle('is-demo',demoMode);$('#api-state').classList.toggle('is-offline',!demoMode&&health.status!=='UP');
  $('#api-warning').classList.toggle('hidden',!demoMode);
  state.integrations=integrations||[];state.checks=checks||[];state.last=new Map();
  state.checks.forEach(c=>{if(c.integrationId&&!state.last.has(Number(c.integrationId)))state.last.set(Number(c.integrationId),c);});
  renderMetrics(d||{});renderRows();renderActivity();renderHistory();
 }catch(e){
  if(!demoMode){demoMode=true;readDemoData();return load();}
  $('#api-status').textContent='demo local';$('#api-state').classList.add('is-demo');$('#api-state').classList.remove('is-online','is-offline');$('#api-warning').classList.remove('hidden');
  toast('Não foi possível carregar os dados de demonstração: '+e.message,'error');
 }
}function view(name){state.view=name;document.querySelectorAll('.view').forEach(v=>v.classList.toggle('hidden',v.id!==`view-${name}`));document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.view===name));$('#crumb').textContent=({overview:'Visão geral',integrations:'Integrações',history:'Histórico de checks',settings:'Configurações'})[name]||'Visão geral';if(name==='integrations')renderRows();if(name==='history')renderHistory();}
function openModal(item=null){state.editing=item?.id??null;$('#form').reset();$('#f-id').value=item?.id??'';$('#f-name').value=item?.name??'';$('#f-url').value=item?.url??'';$('#f-description').value=item?.description??'';$('#f-method').value=item?.method??'GET';$('#f-status').value=item?.expectedStatus??200;$('#f-timeout').value=item?.timeoutSeconds??5;$('#f-active').checked=item?.active??true;$('#modal-title').textContent=item?'Editar integração':'Nova integração';$('#save').textContent=item?'Salvar alterações →':'Salvar integração →';$('#form-error').classList.add('hidden');$('#modal').classList.remove('hidden');setTimeout(()=>$('#f-name').focus(),30);}
function closeModal(){$('#modal').classList.add('hidden');}
async function runCheck(id,button){if(button){button.disabled=true;button.dataset.label=button.textContent;button.textContent='…';}try{const c=await api(`/api/integrations/${id}/checks`,{method:'POST'});toast(c.result==='SUCCESS'?`Check concluído: HTTP ${c.httpStatus}, ${c.latencyMs} ms.`:`Check falhou: ${c.message}`,c.result==='SUCCESS'?'success':'error');await load();}catch(e){toast(e.message,'error');}finally{if(button){button.disabled=false;button.textContent=button.dataset.label||'▶ Check';}}}
async function actions(ev){const b=ev.target.closest('[data-action]');if(!b)return;const id=Number(b.dataset.id),item=state.integrations.find(i=>Number(i.id)===id);if(!item)return;if(b.dataset.action==='check')return runCheck(id,b);if(b.dataset.action==='edit')return openModal(item);if(b.dataset.action==='toggle'){try{await api(`/api/integrations/${id}/active`,{method:'PATCH',body:JSON.stringify({active:!item.active})});toast(item.active?'Integração pausada.':'Integração ativada.');await load();}catch(e){toast(e.message,'error');}}}
async function save(ev){ev.preventDefault();const payload={name:$('#f-name').value.trim(),url:$('#f-url').value.trim(),description:$('#f-description').value.trim(),method:$('#f-method').value,expectedStatus:Number($('#f-status').value),timeoutSeconds:Number($('#f-timeout').value),active:$('#f-active').checked};const id=state.editing;$('#save').disabled=true;$('#save').textContent='Salvando…';$('#form-error').classList.add('hidden');try{await api(id?`/api/integrations/${id}`:'/api/integrations',{method:id?'PUT':'POST',body:JSON.stringify(payload)});closeModal();toast(id?'Integração atualizada.':'Integração cadastrada.');await load();view('integrations');}catch(e){$('#form-error').textContent=e.message;$('#form-error').classList.remove('hidden');}finally{$('#save').disabled=false;$('#save').textContent=id?'Salvar alterações →':'Salvar integração →';}}
function csv(){const data=[['checkedAt','integrationName','result','httpStatus','latencyMs','message'],...state.checks.map(c=>[c.checkedAt,c.integrationName,c.result,c.httpStatus,c.latencyMs,c.message])];const text=data.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');const u=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=u;a.download='integratrace-check-history.csv';a.click();URL.revokeObjectURL(u);}
document.querySelectorAll('.nav').forEach(b=>b.addEventListener('click',()=>view(b.dataset.view)));document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>view(b.dataset.nav)));$('#new-one').addEventListener('click',()=>openModal());$('#new-two').addEventListener('click',()=>openModal());$('#close-modal').addEventListener('click',closeModal);$('#cancel').addEventListener('click',closeModal);$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});$('#form').addEventListener('submit',save);$('#refresh').addEventListener('click',load);$('#reload-list').addEventListener('click',load);$('#overview-search').addEventListener('input',renderRows);$('#integration-search').addEventListener('input',renderRows);$('#active-filter').addEventListener('change',renderRows);$('#history-search').addEventListener('input',renderHistory);$('#history-filter').addEventListener('change',renderHistory);$('#export').addEventListener('click',csv);$('#overview-rows').addEventListener('click',actions);$('#integration-rows').addEventListener('click',actions);$('#retry-api').addEventListener('click',()=>{resetDemoData();load();});load();








