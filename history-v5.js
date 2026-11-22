/* Detailed workout history, v5. All data stays in the existing threeSplitPWA_v1 storage key. */
let historyFilter = 'all';
let historyMetric = 'weight';
let historyExercise = '';
let openHistoryId = null;
let editHistoryId = null;
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const numberText = value => Number.isFinite(Number(value)) ? Number(value).toLocaleString('ko-KR',{maximumFractionDigits:1}) : '0';
const validSets = e => (e?.sets || []).filter(x => x && x.done === true && Number(x.rep) > 0);
const completedExercises = s => (s?.ex || []).filter(e => validSets(e).length);
function exerciseMetrics(ex) {
  const sets=validSets(ex);
  return {
    count:sets.length,
    reps:sets.reduce((sum,x)=>sum+Number(x.rep||0),0),
    volume:sets.reduce((sum,x)=>sum+Number(x.kg||0)*Number(x.rep||0),0),
    best:sets.reduce((mx,x)=>Math.max(mx,Number(x.kg||0)),0),
    rir:sets.length ? sets.reduce((sum,x)=>sum+Number(x.rir||0),0)/sets.length : null
  };
}
function sessionMetrics(s) {
  const es=(s.ex||[]).map(exerciseMetrics);
  return {count:es.reduce((n,x)=>n+x.count,0),reps:es.reduce((n,x)=>n+x.reps,0),volume:es.reduce((n,x)=>n+x.volume,0),exercises:es.filter(x=>x.count).length};
}
function calcWeek(){
 const now=Date.now(), week=7*24*60*60*1000;
 const list=(S.sessions||[]).filter(s=>now-new Date(s.date).getTime() < week && now >= new Date(s.date).getTime());
 return {sessions:list.length,sets:list.reduce((n,s)=>n+sessionMetrics(s).count,0),time:list.reduce((n,s)=>n+Number(s.sec||0),0)};
}
function detailPrevious(session,exerciseName) {
 // Chronological comparison, independent of current routine order or custom exercises
 const target=new Date(session.date).getTime();
 const older=(S.sessions||[]).filter(s=>s!==session && new Date(s.date).getTime()<target).sort((a,b)=>new Date(b.date)-new Date(a.date));
 for(const old of older){const found=(old.ex||[]).find(e=>e.name===exerciseName && validSets(e).length);if(found)return found;}
 return null;
}
function diffLabel(current,previous,suffix){
 if(previous===null) return '<span class="history-exercise-delta">첫 기록</span>';
 const diff=current-previous, sign=diff>0?'+':'';
 return `<span class="history-exercise-delta ${diff>0?'positive':diff<0?'negative':''}">${sign}${numberText(diff)}${suffix}</span>`;
}
function metricSVG(points,unit){
 const width=680,height=190,padL=56,padR=18,padT=20,padB=32;
 const nums=points.map(p=>p.value), minRaw=Math.min(...nums),maxRaw=Math.max(...nums);
 const pad=Math.max((maxRaw-minRaw)*.14,maxRaw*.045,1);
 const min=Math.max(0,minRaw-pad),max=maxRaw+pad;
 const x=i=>padL+(points.length===1?(width-padL-padR)/2 : i*(width-padL-padR)/(points.length-1));
 const y=v=>padT+(max-v)/(max-min)*(height-padT-padB);
 const path=points.map((p,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(p.value).toFixed(1)).join(' ');
 const grids=[0,.5,1].map(t=>{
   const val=min+(max-min)*t,yy=y(val);
   return `<line x1="${padL}" y1="${yy}" x2="${width-padR}" y2="${yy}" stroke="var(--line)" stroke-dasharray="4 6"/><text x="${padL-9}" y="${yy+4}" text-anchor="end" fill="var(--muted)" font-size="13">${escapeHTML(numberText(val))}</text>`;
 }).join('');
 const circles=points.map((p,i)=>`<circle cx="${x(i)}" cy="${y(p.value)}" r="5.5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"><title>${escapeHTML(dt(p.date))}: ${numberText(p.value)}${unit}</title></circle>`).join('');
 return `<div class="progress-plot"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="운동 기록 추세 그래프">
 ${grids}<path d="${path}" fill="none" stroke="var(--accent)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>${circles}
 </svg><div class="progress-foot"><span>${escapeHTML(dt(points[0].date))}</span><span>최근 ${points.length}회 · ${unit}</span><span>${escapeHTML(dt(points[points.length-1].date))}</span></div></div>`;
}
function renderProgress(){
 const names=[...new Set((S.sessions||[]).flatMap(s=>(s.ex||[]).filter(e=>validSets(e).length).map(e=>e.name)))];
 if(!historyExercise || !names.includes(historyExercise)) historyExercise=names[0]||'';
 const select=q('progressExercise');
 select.innerHTML=names.length?names.map(n=>`<option value="${escapeHTML(n)}" ${n===historyExercise?'selected':''}>${escapeHTML(n)}</option>`).join(''):'<option value="">완료된 운동 기록 없음</option>';
 select.disabled=!names.length;
 document.querySelectorAll('.metric-switch button').forEach(b=>b.classList.toggle('active',b.dataset.metric===historyMetric));
 const values=(S.sessions||[]).slice().reverse().flatMap(s=>{
   const ex=(s.ex||[]).find(e=>e.name===historyExercise && validSets(e).length);
   if(!ex)return [];
   const metrics=exerciseMetrics(ex);
   return [{date:s.date,value:historyMetric==='weight'?metrics.best:metrics.volume}];
 }).slice(-12);
 if(!values.length){q('progressPlot').innerHTML='<div class="progress-empty">운동을 기록하면 중량·운동량 변화가 표시됩니다.</div>';return;}
 if(historyMetric==='weight' && values.every(p=>p.value===0)){
   q('progressPlot').innerHTML='<div class="progress-empty">중량이 입력된 완료 세트가 없어 그래프를 표시할 수 없습니다.</div>';return;
 }
 q('progressPlot').innerHTML=metricSVG(values,historyMetric==='weight'?'kg':'kg·회');
}
function historySessionHTML(s,idx){
 const m=sessionMetrics(s),isEditing=editHistoryId===idx,opened=openHistoryId===idx;
 const exercises=(s.ex||[]).filter(e=>(e.sets||[]).length);
 let content=`<div class="history-summary-metrics"><div class="history-metric"><strong>${m.count}</strong><span>완료 세트</span></div><div class="history-metric"><strong>${m.reps}</strong><span>총 반복수</span></div><div class="history-metric"><strong>${numberText(m.volume)}</strong><span>볼륨 (kg·회)</span></div></div>`;
 if(isEditing){
   content+=`<div class="history-editor" data-idx="${idx}">${exercises.map((e,ei)=>`
     <div class="history-edit-exercise" data-exercise-index="${(s.ex||[]).indexOf(e)}"><div class="editor-head">${escapeHTML(e.name)}</div>
       <div class="history-set-grid edit header"><span>#</span><span>kg</span><span>횟수</span><span>RIR</span><span>완료</span></div>
       <div class="history-edit-sets">${(e.sets||[]).map((set,si)=>historyEditSetHTML(si,set)).join('')}</div>
       <button type="button" class="mini history-add-set history-editor-action">+ 세트 추가</button>
     </div>`).join('')}
     <label>운동 메모<textarea class="history-edit-note" rows="3">${escapeHTML(s.note||'')}</textarea></label>
     <div class="history-session-actions"><button type="button" class="primary save-history" data-idx="${idx}">수정 저장</button><button type="button" class="cancel-history" data-idx="${idx}">취소</button></div>
   </div>`;
 }else{
   content+=exercises.map(e=>{
     const em=exerciseMetrics(e),prev=detailPrevious(s,e.name),pm=prev?exerciseMetrics(prev):null;
     const diff=diffLabel(em.volume,pm?.volume??null,' kg·회');
     return `<section class="history-exercise"><div class="history-exercise-head"><span class="history-exercise-name">${escapeHTML(e.name)}</span>${diff}</div>
       <div class="history-set-grid header"><span>#</span><span>kg</span><span>횟수</span><span>RIR</span></div>
       ${(e.sets||[]).map((set,i)=>`<div class="history-set-grid ${set.done?'':'incomplete'}"><span>${i+1}</span><span>${numberText(set.kg)}</span><span>${numberText(set.rep)}</span><span>${numberText(set.rir)}${set.done?'':' ·'}</span></div>`).join('')}
       <div class="meta">최고 중량 ${numberText(em.best)}kg · ${em.count}세트 · 총 볼륨 ${numberText(em.volume)} kg·회 ${pm?`· 직전 ${numberText(pm.volume)} kg·회`:''}</div>
     </section>`;
   }).join('');
   content+=s.note?`<div class="history-note">${escapeHTML(s.note)}</div>`:'';
   content+=`<div class="history-footnote">볼륨은 완료 표시된 세트의 중량 × 반복수 합계이며, 맨몸운동과 미완료 세트는 계산에서 제외되거나 낮게 나타날 수 있습니다.</div>`;
   content+=`<div class="history-session-actions"><button type="button" class="edit-history" data-idx="${idx}">기록 수정</button><button type="button" class="delete-one" data-idx="${idx}">기록 삭제</button></div>`;
 }
 return `<details class="history-session" data-idx="${idx}" ${opened?'open':''}><summary>
     <div class="history-session-title">${escapeHTML(R[s.r]?.n||s.r)}</div><div class="history-summary-date">${escapeHTML(dt(s.date))}</div>
     <div class="history-summary-stats"><span class="history-chip">${m.count}세트</span><span class="history-chip">${Math.round((s.sec||0)/60)}분</span><span class="history-chip">${numberText(m.volume)} kg·회</span></div>
     </summary><div class="history-session-inner">${content}</div></details>`;
}
function historyEditSetHTML(i,s={}){
 return `<div class="history-set-grid edit history-edit-set"><span>${i+1}</span>
   <input class="history-kg" type="number" min="0" step="0.5" inputmode="decimal" value="${Number(s.kg||0)}" aria-label="중량">
   <input class="history-rep" type="number" min="0" step="1" inputmode="numeric" value="${Number(s.rep||0)}" aria-label="횟수">
   <input class="history-rir" type="number" min="0" max="10" step="1" inputmode="numeric" value="${Number(s.rir||0)}" aria-label="RIR">
   <input class="history-done" type="checkbox" ${s.done?'checked':''} aria-label="완료 세트"></div>`;
}
function hist(){
 const w=calcWeek();
 q('weeklySummary').innerHTML=`<div class="overview-item"><div class="overview-label">최근 7일 운동</div><div class="overview-value">${w.sessions}<span class="overview-unit">회</span></div></div>
 <div class="overview-item"><div class="overview-label">최근 7일 세트</div><div class="overview-value">${w.sets}<span class="overview-unit">세트</span></div></div>
 <div class="overview-item"><div class="overview-label">최근 7일 시간</div><div class="overview-value">${Math.round(w.time/60)}<span class="overview-unit">분</span></div></div>`;
 document.querySelectorAll('.routine-filter button').forEach(b=>b.classList.toggle('active',b.dataset.filter===historyFilter));
 const sessions=(S.sessions||[]).map((s,idx)=>({s,idx})).filter(item=>historyFilter==='all'||item.s.r===historyFilter);
 q('historyCount').textContent=`${sessions.length}회`;
 q('historyList').innerHTML=sessions.length?sessions.map(({s,idx})=>historySessionHTML(s,idx)).join(''):'<div class="card meta">선택한 루틴의 운동 기록이 없습니다.</div>';
 renderProgress();
}
q('historyList').addEventListener('click',ev=>{
 const btn=ev.target.closest('button');if(!btn)return;
 const i=Number(btn.dataset.idx||btn.closest('[data-idx]')?.dataset.idx),s=S.sessions[i];
 if(!s)return;
 if(btn.matches('.edit-history')){openHistoryId=i;editHistoryId=i;hist();return;}
 if(btn.matches('.cancel-history')){editHistoryId=null;openHistoryId=i;hist();return;}
 if(btn.matches('.delete-one')){
   if(!confirm(`${dt(s.date)} ${R[s.r]?.n||s.r} 기록을 삭제할까요?`))return;
   S.sessions.splice(i,1);save();openHistoryId=null;editHistoryId=null;home();hist();toast('기록을 삭제했습니다.');return;
 }
 if(btn.matches('.history-add-set')){
   const container=btn.closest('.history-edit-exercise').querySelector('.history-edit-sets');
   container.insertAdjacentHTML('beforeend',historyEditSetHTML(container.children.length,{done:true,rir:2}));return;
 }
 if(btn.matches('.save-history')){
   const outer=btn.closest('.history-editor');
   outer.querySelectorAll('.history-edit-exercise').forEach(ee=>{
     const ex=s.ex[Number(ee.dataset.exerciseIndex)];
     ex.sets=[...ee.querySelectorAll('.history-edit-set')].map(el=>({
       kg:Math.max(0,Number(el.querySelector('.history-kg').value)||0),
       rep:Math.max(0,Math.round(Number(el.querySelector('.history-rep').value)||0)),
       rir:Math.max(0,Number(el.querySelector('.history-rir').value)||0),
       done:el.querySelector('.history-done').checked
     }));
   });
   s.note=outer.querySelector('.history-edit-note').value.trim();
   s.sets=sessionMetrics(s).count;
   editHistoryId=null;openHistoryId=i;
   save();home();hist();toast('수정 내용을 저장했습니다.');return;
 }
});
q('historyList').addEventListener('toggle',ev=>{
 const d=ev.target.closest('details.history-session');
 if(!d)return;
 if(d.open)openHistoryId=Number(d.dataset.idx);
 else if(openHistoryId===Number(d.dataset.idx)&&editHistoryId===null)openHistoryId=null;
},true);
document.querySelectorAll('.routine-filter button').forEach(b=>b.addEventListener('click',()=>{
 historyFilter=b.dataset.filter;openHistoryId=null;editHistoryId=null;hist();
}));
document.querySelectorAll('.metric-switch button').forEach(b=>b.addEventListener('click',()=>{
 historyMetric=b.dataset.metric;renderProgress();
}));
q('progressExercise').addEventListener('change',e=>{historyExercise=e.target.value;renderProgress()});
// The earlier app.js calls hist() on initial load; refresh once with upgraded rendering.
hist();
