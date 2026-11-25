
const DEFAULT_R={
A:{n:"A. Push",s:"가슴 · 어깨 · 삼두",x:[
["체스트프레스",3,"6–10",120,1,0],["인클라인 덤벨/머신 프레스",3,"8–12",120,1,0],["펙덱 플라이",2,"12–15",90,0,0],["사이드 레터럴레이즈",4,"12–20",75,0,0],["머신 숄더프레스",2,"8–12",120,1,0],["로프 삼두 푸시다운",2,"10–15",75,1,0]]},
B:{n:"B. Pull",s:"등 · 후면어깨 · 이두",x:[
["뉴트럴그립 랫풀다운/풀업",3,"6–10",120,1,0],["체스트 서포티드 로우",3,"8–12",120,1,0],["원암 케이블/머신 로우",2,"10–15",90,1,0],["리버스 펙덱",3,"12–20",75,0,0],["스트레이트암 풀다운",2,"12–15",75,1,0],["덤벨/케이블 컬",2,"10–15",75,1,0]]},
C:{n:"C. Legs + Abs",s:"하체 · 복근",x:[
["레그프레스/핵스쿼트",3,"6–10",150,0,1],["레그익스텐션",3,"10–15",90,0,0],["레그컬",3,"10–15",90,0,0],["불가리안 스플릿스쿼트",2,"8–12",120,0,0],["힙쓰러스트",2,"8–12",120,0,1],["카프레이즈",4,"10–20",75,0,0],["AB슬라이드",3,"8–15",75,1,1],["리버스 크런치",3,"12–20",60,0,0],["중량 크런치",3,"10–15",60,0,1]]}
};
const clone=o=>JSON.parse(JSON.stringify(o));
const safeHTML=v=>String(v??"" ).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const K="threeSplitPWA_v1";
let S=JSON.parse(localStorage.getItem(K)||"null")||{next:"A",sessions:[],body:[],pain:{elbow:0,back:0},theme:"system"};
if(!S.theme) S.theme="system";
if(!S.routines) S.routines=clone(DEFAULT_R);
let R=S.routines;
let cur=S.next,startAt=0,tick,restTick,remain=0,deferred=null,editRoutine="A",activeExercises=[];
const q=id=>document.getElementById(id);
const save=()=>{S.routines=R;localStorage.setItem(K,JSON.stringify(S))};
const mediaDark=window.matchMedia("(prefers-color-scheme: dark)");
function resolvedTheme(){
  return S.theme==="system" ? (mediaDark.matches?"dark":"light") : S.theme;
}
function applyTheme(){
  const t=resolvedTheme();
  document.documentElement.setAttribute("data-theme",t);
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute("content",t==="dark"?"#090d16":"#f3f5fa");
  document.querySelectorAll(".theme-btn").forEach(b=>b.classList.toggle("active",b.dataset.theme===S.theme));
}
function setTheme(t){
  S.theme=t; save(); applyTheme();
  toast(t==="dark"?"다크 모드":t==="light"?"라이트 모드":"시스템 설정 모드");
}
mediaDark.addEventListener?.("change",()=>{if(S.theme==="system")applyTheme()});
const next=r=>r==="A"?"B":r==="B"?"C":"A";
const clock=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(Math.max(0,s%60)).padStart(2,"0")}`;
const dt=x=>new Intl.DateTimeFormat("ko-KR",{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(x));
function toast(t){q("toast").textContent=t;q("toast").classList.remove("hide");setTimeout(()=>q("toast").classList.add("hide"),1600)}
function go(v){document.querySelectorAll(".view").forEach(x=>x.classList.remove("on"));q(v).classList.add("on");document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active",b.dataset.go===v));if(v==="history")hist();if(v==="body")body();if(v==="settings"){renderEditor();applyTheme()}scrollTo(0,0)}
function pain(){let e=+q("elbow").value,b=+q("back").value;q("ev").textContent=e;q("bv").textContent=b;S.pain={elbow:e,back:b};save();let m=[];if(e>=3)m.push("팔꿈치 통증 3 이상: 프레스·풀다운/풀업·컬·푸시다운류는 통증 없는 범위에서만.");if(b>=3)m.push("허리 통증 3 이상: 하체 복합동작·AB슬라이드는 보수적으로.");q("pain").textContent=m.join(" ");q("pain").classList.toggle("hide",!m.length)}
function home(){let r=R[S.next];q("nextName").textContent=r.n;q("nextSub").textContent=r.s;q("badge").textContent=S.next;let z=S.body[0];q("weight").textContent=z?.w||"—";q("waist").textContent=z?.wa||"—";q("elbow").value=S.pain.elbow;q("back").value=S.pain.back;pain();let a=S.sessions.slice(0,3);q("recent").innerHTML=a.length?a.map(s=>`<div class="item"><b>${R[s.r]?.n||s.r}</b><div class="meta">${dt(s.date)} · ${Math.round((s.sec||0)/60)}분 · ${s.sets||0}세트</div></div>`).join(""):'<div class="meta">아직 기록이 없습니다.</div>'}
function last(name){for(let s of S.sessions){if(s.r===cur){let e=s.ex.find(e=>e.name===name);if(e)return e}}return null}
function exerciseCardHTML(e,i){
 let l=last(e[0]);
 let lt=l?l.sets.map(s=>`${s.kg||0}kg×${s.rep||0}`).join(" / "):"기록 없음";
 let risk=(S.pain.elbow>=3&&e[4])||(S.pain.back>=3&&e[5]);
 return `<section class="ex ${risk?"risk":""}" data-i="${i}">
 <div class="exhead"><div><b>${safeHTML(e[0])}</b><div class="meta">${e[1]}세트 · ${safeHTML(e[2])}회 · 휴식 ${e[3]}초</div></div><button class="mini rbtn" type="button" data-sec="${e[3]}">휴식</button></div>
 <div class="last">지난 기록: ${lt}</div><div class="workout-set-headers"><span>세트</span><span>kg</span><span>횟수</span><span>RIR</span><span>완료</span></div><div class="sets">${Array.from({length:e[1]},(_,j)=>row(j+1,l?.sets?.[j]?.kg??"")).join("")}</div>
 <div class="exactions"><button class="mini add" type="button">+ 세트</button><button class="mini sub" type="button">− 세트</button><button class="mini delete-workout-ex" type="button" aria-label="${safeHTML(e[0])} 종목 삭제">종목 삭제</button></div></section>`;
}
function renderWorkout(){
 let r=R[cur];q("wName").textContent=r.n;q("wSub").textContent=r.s;q("note").value="";
 q("exercises").innerHTML=activeExercises.map((e,i)=>exerciseCardHTML(e,i)).join("");
 document.querySelectorAll("#exercises .ex").forEach(bindExerciseCard);
 q("workoutAddPanel").classList.add("hide");
 q("openWorkoutAdd").classList.remove("hide");
}
function row(n,kg=""){return `<div class="set"><span>${n}</span><input class="kg" type="number" step=".5" value="${kg}" placeholder="kg"><input class="rep" type="number" placeholder="회"><input class="rir" type="number" min="0" max="5" value="2"><button class="ok">✓</button></div>`}
function bindSetCheck(btn,card){
 btn.onclick=()=>{
   btn.classList.toggle("done");
   if(btn.classList.contains("done")){
     const ex=activeExercises[Number(card.dataset.i)];
     if(ex)rest(ex[3]);
   }
 };
}
function bindExerciseCard(card){
 card.querySelectorAll(".ok").forEach(b=>bindSetCheck(b,card));
 card.querySelector(".rbtn").onclick=()=>{
   const ex=activeExercises[Number(card.dataset.i)];
   if(ex)rest(ex[3]);
 };
 card.querySelector(".add").onclick=()=>{
   let s=card.querySelector(".sets"),wrap=document.createElement("div");
   wrap.innerHTML=row(s.children.length+1);
   const el=wrap.firstElementChild;
   s.appendChild(el);
   bindSetCheck(el.querySelector(".ok"),card);
 };
 card.querySelector(".sub").onclick=()=>{
   let s=card.querySelector(".sets");
   if(s.children.length>1)s.lastElementChild.remove();
 };
 card.querySelector(".delete-workout-ex").onclick=()=>openWorkoutDelete(card);
}
let pendingWorkoutDeleteCard=null;
function openWorkoutDelete(card){
 const idx=Number(card.dataset.i);
 const exercise=activeExercises[idx];
 if(!exercise) return;
 const existing=R[cur].x.some(e=>e[0].toLocaleLowerCase()===exercise[0].toLocaleLowerCase());
 const entered=[...card.querySelectorAll(".set")].filter(row=>{
   const weight=row.querySelector(".kg").value;
   const reps=row.querySelector(".rep").value;
   return row.querySelector(".ok").classList.contains("done") || weight.trim()!=="" || reps.trim()!=="";
 });
 const completed=entered.filter(row=>row.querySelector(".ok").classList.contains("done")).length;
 pendingWorkoutDeleteCard=card;
 q("workoutDeleteTitle").textContent=`${exercise[0]} 삭제`;
 q("workoutDeleteMessage").textContent=entered.length
   ? `현재 운동에서 입력된 ${entered.length}세트(완료 ${completed}세트)가 제외됩니다. 계속할까요?`
   : "현재 운동에서 이 종목을 제외할까요?";
 q("workoutDeletePermanentRow").classList.toggle("hide",!existing);
 q("workoutDeleteOverlay").querySelector('input[value="today"]').checked=true;
 q("workoutDeleteOverlay").querySelector('input[value="permanent"]').checked=false;
 q("workoutDeleteOverlay").classList.remove("hide");
 q("cancelWorkoutDelete").focus();
}
function closeWorkoutDelete(){
 q("workoutDeleteOverlay").classList.add("hide");
 pendingWorkoutDeleteCard=null;
}
function confirmWorkoutDelete(){
 const card=pendingWorkoutDeleteCard;
 if(!card) return;
 const idx=Number(card.dataset.i),exercise=activeExercises[idx];
 if(!exercise){closeWorkoutDelete();return;}
 const permanent=q("workoutDeleteOverlay").querySelector('input[value="permanent"]').checked;
 if(permanent){
   const key=exercise[0].toLocaleLowerCase();
   const routineIndex=R[cur].x.findIndex(e=>e[0].toLocaleLowerCase()===key);
   if(routineIndex!==-1){R[cur].x.splice(routineIndex,1);save();}
 }
 activeExercises.splice(idx,1);
 card.remove();
 // Keep the indices used by remaining exercise cards aligned with activeExercises.
 // Do not recreate cards: that would erase partially entered sets and checks.
 [...q("exercises").querySelectorAll(".ex")].forEach((el,i)=>el.dataset.i=String(i));
 closeWorkoutDelete();
 toast(permanent?"오늘 운동과 루틴에서 삭제했습니다.":"오늘 운동에서만 제외했습니다.");
}
function openWorkoutAdd(){
 q("workoutAddPanel").classList.remove("hide");
 q("openWorkoutAdd").classList.add("hide");
 const names=[...new Set(Object.values(R).flatMap(r=>r.x.map(e=>e[0])))];
 q("workoutExNames").innerHTML=names.map(n=>`<option value="${safeHTML(n)}"></option>`).join("");
 q("workoutAddCard").scrollIntoView({behavior:"smooth",block:"center"});
 setTimeout(()=>q("workoutNewName").focus({preventScroll:true}),250);
}
function closeWorkoutAdd(){
 q("workoutAddPanel").classList.add("hide");
 q("openWorkoutAdd").classList.remove("hide");
}
function fillWorkoutExerciseDefaults(){
 const name=q("workoutNewName").value.trim();
 const match=Object.values(R).flatMap(r=>r.x).find(e=>e[0].toLocaleLowerCase()===name.toLocaleLowerCase());
 if(!match)return;
 q("workoutNewSets").value=match[1];
 q("workoutNewReps").value=match[2];
 q("workoutNewRest").value=match[3];
 q("workoutNewElbow").checked=!!match[4];
 q("workoutNewBack").checked=!!match[5];
}
function addExerciseDuringWorkout(){
 const name=q("workoutNewName").value.trim();
 if(!name){toast("운동 이름을 입력하세요.");q("workoutNewName").focus();return;}
 if(activeExercises.some(e=>e[0].toLocaleLowerCase()===name.toLocaleLowerCase())){
   toast("이미 있는 운동입니다. 해당 운동에서 + 세트를 이용하세요.");return;
 }
 const sets=Math.max(1,Math.min(12,Math.floor(Number(q("workoutNewSets").value)||3)));
 const reps=q("workoutNewReps").value.trim()||"8–12";
 const restSeconds=Math.max(15,Math.min(600,Math.floor(Number(q("workoutNewRest").value)||90)));
 const ex=[name,sets,reps,restSeconds,q("workoutNewElbow").checked?1:0,q("workoutNewBack").checked?1:0];
 activeExercises.push(ex);
 const i=activeExercises.length-1;
 const wrap=document.createElement("div");
 wrap.innerHTML=exerciseCardHTML(ex,i);
 const card=wrap.firstElementChild;
 q("exercises").appendChild(card);
 bindExerciseCard(card);
 if(q("workoutSaveRoutine").checked && !R[cur].x.some(e=>e[0].toLocaleLowerCase()===name.toLocaleLowerCase())){
   R[cur].x.push([...ex]);
   save();
 }
 closeWorkoutAdd();
 q("workoutNewName").value="";
 q("workoutNewSets").value="3";
 q("workoutNewReps").value="8–12";
 q("workoutNewRest").value="90";
 q("workoutNewElbow").checked=false;
 q("workoutNewBack").checked=false;
 card.scrollIntoView({behavior:"smooth",block:"center"});
 toast("운동 종목이 추가됐습니다.");
}
function begin(){startAt=Date.now();clearInterval(tick);tick=setInterval(()=>q("clock").textContent=clock(Math.floor((Date.now()-startAt)/1000)),1000)}
function rest(s){clearInterval(restTick);remain=s;q("restTime").textContent=clock(remain);q("rest").classList.remove("hide");restTick=setInterval(()=>{remain--;q("restTime").textContent=clock(remain);if(remain<=0){clearInterval(restTick);navigator.vibrate?.([180,100,180]);toast("휴식 종료");setTimeout(()=>q("rest").classList.add("hide"),800)}},1000)}
function finish(){
 let ex=[...document.querySelectorAll("#exercises .ex")].map(c=>({name:activeExercises[+c.dataset.i][0],sets:[...c.querySelectorAll(".set")].map(s=>({kg:+s.querySelector(".kg").value||0,rep:+s.querySelector(".rep").value||0,rir:+s.querySelector(".rir").value||0,done:s.querySelector(".ok").classList.contains("done")})).filter(s=>s.done||s.kg||s.rep)}));
 let sets=ex.reduce((n,e)=>n+e.sets.filter(s=>s.done).length,0),sec=startAt?Math.floor((Date.now()-startAt)/1000):0;
 S.sessions.unshift({date:new Date().toISOString(),r:cur,sec,sets,pain:{...S.pain},note:q("note").value.trim(),ex});S.next=next(cur);save();clearInterval(tick);clearInterval(restTick);q("rest").classList.add("hide");q("clock").textContent="00:00";home();go("home");toast(`완료! 다음은 ${R[S.next].n}`)
}
function hist(){q("historyList").innerHTML=S.sessions.length?S.sessions.map(s=>`<div class="card"><b>${R[s.r]?.n||s.r}</b><div class="meta">${dt(s.date)} · ${Math.round((s.sec||0)/60)}분 · ${s.sets||0}세트</div>${s.note?`<p>${s.note}</p>`:""}</div>`).join(""):'<div class="card meta">아직 기록이 없습니다.</div>'}
function body(){q("bodyList").innerHTML=S.body.length?S.body.map(x=>`<div class="item"><b>${dt(x.date)}</b><div class="meta">체중 ${x.w||"—"}kg · 허리 ${x.wa||"—"}cm</div></div>`).join(""):'<div class="meta">아직 기록이 없습니다.</div>'}

function renderEditor(){
 document.querySelectorAll(".edit-tab").forEach(b=>b.classList.toggle("active",b.dataset.er===editRoutine));
 const list=R[editRoutine].x; q("routineEditor").innerHTML=list.length?list.map((e,i)=>`<div class="editor-item" data-ei="${i}">
   <button class="drag-handle" aria-label="길게 눌러 순서 이동" title="길게 눌러 이동">☰</button>
   <div class="editor-main"><b>${safeHTML(e[0])}</b><div class="meta">${e[1]}세트 · ${e[2]}회 · 휴식 ${e[3]}초</div><div class="editor-edit"><input class="edSets" type="number" min="1" max="10" value="${e[1]}" title="세트 수"><input class="edReps" type="text" value="${e[2]}" title="반복수"><input class="edRest" type="number" min="15" max="600" step="15" value="${e[3]}" title="휴식 초"></div></div>
   <div class="editor-actions"><button class="moveUp">↑</button><button class="moveDown">↓</button><button class="deleteEx danger">×</button></div>
 </div>`).join(""):'<div class="meta">운동이 없습니다.</div>'; bindEditor(); bindDragSort();
}
function bindEditor(){document.querySelectorAll(".editor-item").forEach(item=>{const i=+item.dataset.ei;item.querySelector(".moveUp").onclick=()=>{if(i<=0)return;[R[editRoutine].x[i-1],R[editRoutine].x[i]]=[R[editRoutine].x[i],R[editRoutine].x[i-1]];save();renderEditor();toast("순서를 변경했습니다.")};item.querySelector(".moveDown").onclick=()=>{if(i>=R[editRoutine].x.length-1)return;[R[editRoutine].x[i+1],R[editRoutine].x[i]]=[R[editRoutine].x[i],R[editRoutine].x[i+1]];save();renderEditor();toast("순서를 변경했습니다.")};item.querySelector(".deleteEx").onclick=()=>{if(confirm(`"${R[editRoutine].x[i][0]}" 운동을 삭제할까요?`)){R[editRoutine].x.splice(i,1);save();renderEditor();toast("삭제했습니다.")}};const update=()=>{R[editRoutine].x[i][1]=Math.max(1,+item.querySelector(".edSets").value||1);R[editRoutine].x[i][2]=item.querySelector(".edReps").value.trim()||"8–12";R[editRoutine].x[i][3]=Math.max(15,+item.querySelector(".edRest").value||90);save()};item.querySelectorAll(".edSets,.edReps,.edRest").forEach(x=>x.onchange=update)})}

function bindDragSort(){
 const editor=q("routineEditor");
 let dragItem=null,holdTimer=null,startY=0,lastY=0,active=false,pointerId=null;
 const cleanup=()=>{
   clearTimeout(holdTimer);holdTimer=null;
   if(dragItem){dragItem.classList.remove("dragging");dragItem.style.transform="";}
   editor.classList.remove("sorting");
   dragItem=null;active=false;pointerId=null;
 };
 const syncOrder=()=>{
   const old=[...R[editRoutine].x];
   const order=[...editor.querySelectorAll(".editor-item")].map(el=>+el.dataset.ei);
   R[editRoutine].x=order.map(i=>old[i]);
   save();
   renderEditor();
   toast("운동 순서를 저장했습니다.");
 };
 editor.querySelectorAll(".drag-handle").forEach(handle=>{
   handle.addEventListener("pointerdown",e=>{
     e.preventDefault();
     dragItem=handle.closest(".editor-item");
     startY=lastY=e.clientY; pointerId=e.pointerId;
     try{handle.setPointerCapture(pointerId)}catch{}
     holdTimer=setTimeout(()=>{
       if(!dragItem)return;
       active=true;
       dragItem.classList.add("dragging");
       editor.classList.add("sorting");
       navigator.vibrate?.(35);
     },220);
   });
   handle.addEventListener("pointermove",e=>{
     if(!dragItem||e.pointerId!==pointerId)return;
     lastY=e.clientY;
     if(!active){
       if(Math.abs(lastY-startY)>12){clearTimeout(holdTimer);holdTimer=null;dragItem=null;}
       return;
     }
     e.preventDefault();
     const items=[...editor.querySelectorAll(".editor-item")].filter(x=>x!==dragItem);
     let target=null,after=false;
     for(const item of items){
       const r=item.getBoundingClientRect(),mid=r.top+r.height/2;
       if(e.clientY<mid){target=item;after=false;break}
       target=item;after=true;
     }
     if(target){
       if(after) target.after(dragItem); else target.before(dragItem);
     }
     const edge=70;
     if(e.clientY<edge) window.scrollBy(0,-10);
     else if(e.clientY>window.innerHeight-edge) window.scrollBy(0,10);
   });
   const end=e=>{
     if(e.pointerId!==pointerId)return;
     clearTimeout(holdTimer);holdTimer=null;
     if(active) syncOrder(); else cleanup();
   };
   handle.addEventListener("pointerup",end);
   handle.addEventListener("pointercancel",cleanup);
 });
}
function addExercise(){const name=q("newExName").value.trim();if(!name)return toast("운동 이름을 입력하세요.");R[editRoutine].x.push([name,Math.max(1,+q("newExSets").value||3),q("newExReps").value.trim()||"8–12",Math.max(15,+q("newExRest").value||90),q("newExElbow").checked?1:0,q("newExBack").checked?1:0]);save();q("newExName").value="";q("addExercisePanel").classList.add("hide");renderEditor();toast("운동을 추가했습니다.")}
q("start").onclick=()=>{cur=S.next;activeExercises=clone(R[cur].x);renderWorkout();go("workout");document.querySelectorAll("nav button").forEach(b=>b.classList.remove("active"));begin()};
q("finish").onclick=finish;q("backHome").onclick=()=>{clearInterval(tick);go("home")};
q("openWorkoutAdd").onclick=openWorkoutAdd;
q("quickWorkoutAdd").onclick=openWorkoutAdd;
q("closeWorkoutAdd").onclick=closeWorkoutAdd;
q("confirmWorkoutAdd").onclick=addExerciseDuringWorkout;
q("cancelWorkoutDelete").onclick=closeWorkoutDelete;
q("confirmWorkoutDelete").onclick=confirmWorkoutDelete;
q("workoutDeleteOverlay").addEventListener("click",e=>{if(e.target===q("workoutDeleteOverlay"))closeWorkoutDelete()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!q("workoutDeleteOverlay").classList.contains("hide"))closeWorkoutDelete()});
q("workoutNewName").addEventListener("change",fillWorkoutExerciseDefaults);
q("elbow").oninput=pain;q("back").oninput=pain;
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
document.querySelectorAll(".pick").forEach(b=>b.onclick=()=>{S.next=b.dataset.r;save();home();toast(`다음 루틴: ${R[S.next].n}`)});
document.querySelectorAll("[data-sec]").forEach(b=>b.onclick=()=>rest(+b.dataset.sec));q("restStop").onclick=()=>{clearInterval(restTick);q("rest").classList.add("hide")};
q("saveBody").onclick=()=>{let w=q("wi").value,wa=q("wai").value;if(!w&&!wa)return toast("값을 입력하세요.");S.body.unshift({date:new Date().toISOString(),w,wa});save();q("wi").value=q("wai").value="";body();home();toast("저장 완료")};
q("clear").onclick=()=>{if(confirm("운동 기록을 모두 지울까요?")){S.sessions=[];save();hist();home()}};
q("export").onclick=()=>{let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:"application/json"}));a.download=`3split-${new Date().toISOString().slice(0,10)}.json`;a.click()};
q("import").onchange=e=>{let f=e.target.files[0];if(!f)return;let rd=new FileReader();rd.onload=()=>{try{S=JSON.parse(rd.result);if(!S.routines)S.routines=clone(DEFAULT_R);R=S.routines;save();home();hist();body();renderEditor();toast("가져오기 완료")}catch{toast("올바른 파일이 아닙니다.")}};rd.readAsText(f)};
document.querySelectorAll(".edit-tab").forEach(b=>b.onclick=()=>{editRoutine=b.dataset.er;renderEditor()});
q("openAddExercise").onclick=()=>q("addExercisePanel").classList.remove("hide");q("closeAddExercise").onclick=()=>q("addExercisePanel").classList.add("hide");q("addExercise").onclick=addExercise;
document.querySelectorAll(".theme-btn").forEach(b=>b.onclick=()=>setTheme(b.dataset.theme));
applyTheme();

window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;q("install").classList.remove("hide")});q("install").onclick=async()=>{if(deferred){deferred.prompt();await deferred.userChoice;deferred=null;q("install").classList.add("hide")}};
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
home();body();hist();renderEditor();
const iosDate=q("iosTodayDate");
if(iosDate) iosDate.textContent=new Intl.DateTimeFormat("ko-KR",{month:"long",day:"numeric",weekday:"short"}).format(new Date());
