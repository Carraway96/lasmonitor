// LäsMonitor – helt statisk SPA (GitHub Pages-ready)
// Data lagras i localStorage. Export/Import/Save/Open hanterar JSON-filer lokalt.

const STORAGE_KEY = "lasmonitor.v1";

const defaultSettings = {
  ranges: {
    wpm: [60, 260],
    comp: [0, 100],
    lexile: [-200, 1600],
    lix: [20, 70],
  },
  weights: { wpm: 0.35, comp: 0.35, level: 0.30 },
  targets: {
    7: { wpm: 140, comp: 70 },
    8: { wpm: 160, comp: 75 },
    9: { wpm: 180, comp: 80 },
  },
};

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { students: [], materials: [], assessments: [], settings: defaultSettings };
}
function saveDb(db) { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); }
function uid() { return Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4); }
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const scale01 = (v, min, max) => clamp((v - min) / (max - min), 0, 1);
const scale100 = (v, min, max) => Math.round(scale01(v, min, max) * 100);

function computeLevelScore(a, ranges){
  const parts = [];
  if (typeof a.lexile === "number") parts.push(scale100(a.lexile, ranges.lexile[0], ranges.lexile[1]));
  if (typeof a.lix === "number") parts.push(scale100(a.lix, ranges.lix[0], ranges.lix[1]));
  if (typeof a.dlsStanine === "number" && a.dlsStanine >= 1 && a.dlsStanine <= 9) parts.push(Math.round(((a.dlsStanine - 1)/8)*100));
  if (typeof a.dlsPercentile === "number" && a.dlsPercentile >= 0 && a.dlsPercentile <= 100) parts.push(Math.round(a.dlsPercentile));
  if (!parts.length) return null;
  return Math.round(parts.reduce((a,b)=>a+b,0)/parts.length);
}
function computeNRS(a, ranges, weights){
  const wpmScore = typeof a.wpm === "number" ? scale100(a.wpm, ranges.wpm[0], ranges.wpm[1]) : null;
  const compScore = typeof a.comprehension === "number" ? scale100(a.comprehension, ranges.comp[0], ranges.comp[1]) : null;
  const levelScore = computeLevelScore(a, ranges);
  const items = [
    wpmScore!=null ? {s:wpmScore,w:weights.wpm} : null,
    compScore!=null ? {s:compScore,w:weights.comp} : null,
    levelScore!=null ? {s:levelScore,w:weights.level} : null,
  ].filter(Boolean);
  if (!items.length) return null;
  const totalW = items.reduce((acc,it)=>acc+it.w,0);
  const val = items.reduce((acc,it)=>acc+it.s*it.w,0)/totalW;
  return Math.round(val);
}

// State
let db = loadDb();
let selectedStudentId = null;

// Elements
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// Tabs
$$(".tab").forEach(btn => btn.addEventListener("click", () => {
  $$(".tab").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  const id = btn.dataset.tab;
  $$(".panel").forEach(p => p.classList.add("hidden"));
  $("#view-"+id).classList.remove("hidden");
  if (id === "dashboard") renderDashboard();
  if (id === "students") { renderStudents(); renderStudentDetail(); }
  if (id === "materials") renderMaterials();
  if (id === "analytics") renderAnalytics();
  if (id === "settings") renderSettings();
}));

// Init
document.addEventListener("DOMContentLoaded", () => {
  // default to dashboard
  $("#a-date").value = new Date().toISOString().slice(0,10);
  renderDashboard();
  renderSettings(); // ensure inputs reflect defaults initially
});

// ---------------- Dashboard ----------------
let chartCohort;
function renderDashboard(){
  // build cohort NRS by date
  const map = new Map();
  for (const a of db.assessments){
    const nrs = computeNRS(a, db.settings.ranges, db.settings.weights);
    if (nrs == null) continue;
    const key = a.date;
    if (!map.has(key)) map.set(key, { date:key, sum:0, n:0 });
    const o = map.get(key); o.sum += nrs; o.n += 1;
  }
  const data = Array.from(map.values()).sort((a,b)=>a.date.localeCompare(b.date)).map(o=>({x:o.date,y:Math.round(o.sum/o.n)}));
  // chart
  if (chartCohort) chartCohort.destroy();
  const ctx = $("#chart-cohort").getContext("2d");
  chartCohort = new Chart(ctx, {
    type: "line",
    data: { datasets:[{ label:"Cohort NRS", data, tension:.3 }]},
    options: {
      parsing:false,
      scales:{ y:{ min:0, max:100 }},
      plugins:{ legend:{display:true}, tooltip:{enabled:true} }
    }
  });

  // status list
  const ul = $("#status-list");
  ul.innerHTML = "";
  for (const s of db.students){
    const list = db.assessments.filter(a=>a.studentId===s.id).sort((a,b)=>a.date.localeCompare(b.date));
    const last = list[list.length-1];
    const prev = list[list.length-2];
    const delta = (last && prev) ? (computeNRS(last, db.settings.ranges, db.settings.weights) ?? null) - (computeNRS(prev, db.settings.ranges, db.settings.weights) ?? null) : null;
    const lastNrs = last ? computeNRS(last, db.settings.ranges, db.settings.weights) : null;
    const li = document.createElement("li");
    const openBtn = document.createElement("button");
    openBtn.textContent = "Öppna";
    openBtn.addEventListener("click", ()=>{
      // switch tab
      $$("[data-tab='students']")[0].click();
      selectedStudentId = s.id;
      renderStudentDetail();
    });
    li.innerHTML = `<div><div><b>${s.name}</b> <span class="muted">(åk ${s.grade})</span></div><div class="small muted">${list.length} mätningar</div></div>
    <div class="right"><div>NRS: ${lastNrs ?? "–"}</div><div class="small ${delta>0?"pos":delta<0?"neg":"muted"}">${delta==null?"":(delta>0?`▲ +${delta}`:(delta<0?`▼ ${delta}`:"0"))}</div></div>`;
    li.appendChild(openBtn);
    ul.appendChild(li);
  }
  if (!db.students.length){
    const li = document.createElement("li");
    li.textContent = "Lägg till elever under fliken Elever.";
    ul.appendChild(li);
  }
}

// ---------------- Students ----------------
$("#btn-add-student").addEventListener("click", () => {
  const name = $("#new-student-name").value.trim();
  const grade = Number($("#new-student-grade").value);
  if (!name) return;
  db.students.push({ id: uid(), name, grade });
  saveDb(db);
  $("#new-student-name").value = "";
  renderStudents();
});

function renderStudents(){
  const ul = $("#student-list");
  ul.innerHTML = "";
  for (const s of db.students){
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = `${s.name} (åk ${s.grade})`;
    btn.addEventListener("click", ()=>{ selectedStudentId = s.id; renderStudentDetail(); });
    const del = document.createElement("button");
    del.textContent = "Ta bort";
    del.addEventListener("click", ()=>{
      db.students = db.students.filter(x=>x.id!==s.id);
      db.assessments = db.assessments.filter(a=>a.studentId!==s.id);
      saveDb(db);
      if (selectedStudentId===s.id) selectedStudentId=null;
      renderStudents(); renderStudentDetail(); renderDashboard(); renderAnalytics();
    });
    li.appendChild(btn);
    li.appendChild(del);
    ul.appendChild(li);
  }
  // materials dropdown for assessment form
  const sel = $("#a-material");
  sel.innerHTML = `<option value="">(valfri)</option>` + db.materials.map(m=>`<option value="${m.id}">${m.title}</option>`).join("");
}

let chartStudent;
function renderStudentDetail(){
  const h = $("#student-title");
  const sub = $("#student-sub");
  const tbody = $("#assessment-table tbody");
  tbody.innerHTML = "";
  if (!selectedStudentId){
    h.textContent = "Välj en elev";
    sub.textContent = "Ingen elev vald.";
    if (chartStudent) chartStudent.destroy();
    return;
  }
  const s = db.students.find(x=>x.id===selectedStudentId);
  const list = db.assessments.filter(a=>a.studentId===s.id).sort((a,b)=>a.date.localeCompare(b.date));

  const last = list[list.length-1];
  const prev = list[list.length-2];
  const lastNrs = last ? computeNRS(last, db.settings.ranges, db.settings.weights) : null;
  const prevNrs = prev ? computeNRS(prev, db.settings.ranges, db.settings.weights) : null;
  const delta = (lastNrs!=null && prevNrs!=null) ? (lastNrs - prevNrs) : null;

  h.textContent = `${s.name} (åk ${s.grade})`;
  sub.innerHTML = `Senaste NRS: <b>${lastNrs ?? "–"}</b> ${delta!=null ? `<span class="${delta>0?"pos":"neg"}">${delta>0?`▲ +${delta}`:`▼ ${delta}`}</span>`:""}
  &nbsp; Mål: ${db.settings.targets[s.grade].wpm} WPM, ${db.settings.targets[s.grade].comp}%`;

  // chart
  if (chartStudent) chartStudent.destroy();
  const ctx = $("#chart-student").getContext("2d");
  const labels = list.map(a=>a.date);
  const dataN = list.map(a=>computeNRS(a, db.settings.ranges, db.settings.weights));
  const dataW = list.map(a=>a.wpm ?? null);
  const dataC = list.map(a=>a.comprehension ?? null);
  chartStudent = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label:"NRS", data: dataN, tension:.3 },
        { label:"WPM", data: dataW, tension:.3 },
        { label:"Förståelse", data: dataC, tension:.3 },
      ]
    },
    options: { scales:{ y:{ suggestedMin:0, suggestedMax: Math.max(100, ...dataW.filter(v=>v!=null)) } } }
  });

  // table
  for (const a of list){
    const tr = document.createElement("tr");
    const nrs = computeNRS(a, db.settings.ranges, db.settings.weights);
    tr.innerHTML = `<td>${a.date}</td><td>${a.wpm ?? "–"}</td><td>${a.comprehension ?? "–"}</td>
    <td>${a.lexile ?? "–"}</td><td>${a.lix ?? "–"}</td><td>${a.dlsStanine ?? "–"}</td><td>${a.dlsPercentile ?? "–"}</td><td>${nrs ?? "–"}</td>
    <td><button data-del="${a.id}">Ta bort</button></td>`;
    tbody.appendChild(tr);
  }
  tbody.querySelectorAll("button[data-del]").forEach(b => b.addEventListener("click", () => {
    const id = b.getAttribute("data-del");
    db.assessments = db.assessments.filter(x=>x.id!==id);
    saveDb(db);
    renderStudentDetail(); renderDashboard(); renderAnalytics();
  }));

  // set default student in add form
  $("#a-date").value = new Date().toISOString().slice(0,10);
}

// add assessment
$("#btn-add-assessment").addEventListener("click", () => {
  if (!selectedStudentId){ alert("Välj en elev först."); return; }
  const payload = {
    id: uid(),
    studentId: selectedStudentId,
    date: $("#a-date").value,
    materialId: $("#a-material").value || null,
    wpm: $("#a-wpm").value !== "" ? Number($("#a-wpm").value) : null,
    comprehension: $("#a-comp").value !== "" ? Number($("#a-comp").value) : null,
    lexile: $("#a-lex").value !== "" ? Number($("#a-lex").value) : null,
    lix: $("#a-lix").value !== "" ? Number($("#a-lix").value) : null,
    dlsStanine: $("#a-dls-stan").value !== "" ? Number($("#a-dls-stan").value) : null,
    dlsPercentile: $("#a-dls-pct").value !== "" ? Number($("#a-dls-pct").value) : null,
    notes: $("#a-notes").value.trim(),
  };
  db.assessments.push(payload);
  saveDb(db);
  $("#a-wpm").value = $("#a-comp").value = $("#a-lex").value = $("#a-lix").value = $("#a-dls-stan").value = $("#a-dls-pct").value = $("#a-notes").value = "";
  renderStudentDetail(); renderDashboard(); renderAnalytics();
});

// ---------------- Materials ----------------
$("#btn-add-material").addEventListener("click", () => {
  const title = $("#m-title").value.trim();
  if (!title) return;
  const m = {
    id: uid(),
    title,
    lexile: $("#m-lex").value !== "" ? Number($("#m-lex").value) : null,
    lix: $("#m-lix").value !== "" ? Number($("#m-lix").value) : null,
    words: $("#m-words").value !== "" ? Number($("#m-words").value) : null,
  };
  db.materials.push(m);
  saveDb(db);
  $("#m-title").value = $("#m-lex").value = $("#m-lix").value = $("#m-words").value = "";
  renderMaterials(); renderStudents();
});

function renderMaterials(){
  const ul = $("#material-list");
  ul.innerHTML = "";
  for (const m of db.materials){
    const li = document.createElement("li");
    const del = document.createElement("button");
    del.textContent = "Ta bort";
    del.addEventListener("click", ()=>{
      db.materials = db.materials.filter(x=>x.id!==m.id);
      db.assessments = db.assessments.map(a => a.materialId===m.id ? {...a, materialId:null} : a);
      saveDb(db);
      renderMaterials(); renderStudents();
    });
    li.innerHTML = `<div><div><b>${m.title}</b></div><div class="small muted">Lexile: ${m.lexile ?? "–"} · LIX: ${m.lix ?? "–"} · Ord: ${m.words ?? "–"}</div></div>`;
    li.appendChild(del);
    ul.appendChild(li);
  }
}

// ---------------- Analytics ----------------
let chartLatest;
function renderAnalytics(){
  // latest NRS per student
  const data = db.students.map(s => {
    const list = db.assessments.filter(a=>a.studentId===s.id).sort((a,b)=>a.date.localeCompare(b.date));
    const last = list[list.length-1];
    const nrs = last ? computeNRS(last, db.settings.ranges, db.settings.weights) : null;
    return { label:s.name, value:nrs };
  });
  if (chartLatest) chartLatest.destroy();
  const ctx = $("#chart-latest").getContext("2d");
  chartLatest = new Chart(ctx, {
    type:"line",
    data:{ labels:data.map(d=>d.label), datasets:[{label:"Senaste NRS", data: data.map(d=>d.value), tension:.3}]},
    options:{ scales:{ y:{ min:0, max:100 } } }
  });

  // tips
  const ul = $("#tips-list");
  ul.innerHTML = "";
  for (const s of db.students){
    const g = s.grade;
    const targetW = db.settings.targets[g].wpm;
    const targetC = db.settings.targets[g].comp;
    const list = db.assessments.filter(a=>a.studentId===s.id).sort((a,b)=>b.date.localeCompare(a.date));
    const last = list[0];
    const prev = list[1];
    if (!last){ const li=document.createElement("li"); li.textContent=`${s.name}: –`; ul.appendChild(li); continue; }
    const msgs = [];
    if (last.wpm!=null && last.wpm < targetW) msgs.push("Fokusera på läshastighet (timad/upprepad läsning).");
    if (last.comprehension!=null && last.comprehension < targetC) msgs.push("Jobba med lässtrategier & förförståelse.");
    const lastN = computeNRS(last, db.settings.ranges, db.settings.weights);
    const prevN = prev ? computeNRS(prev, db.settings.ranges, db.settings.weights) : null;
    if (lastN!=null && prevN!=null && lastN < prevN) msgs.push("Nedgång i NRS – kontrollera textnivå/dagsform; justera nivå.");
    if (!msgs.length) msgs.push("Stabil/positiv – fortsätt och öka svårigheten stegvis.");
    const li = document.createElement("li");
    li.innerHTML = `<b>${s.name}:</b> ${msgs.join(" ")}`;
    ul.appendChild(li);
  }
}

// ---------------- Settings ----------------
function renderSettings(){
  const s = db.settings;
  // ranges
  $("#s-wpm-min").value = s.ranges.wpm[0]; $("#s-wpm-max").value = s.ranges.wpm[1];
  $("#s-comp-min").value = s.ranges.comp[0]; $("#s-comp-max").value = s.ranges.comp[1];
  $("#s-lex-min").value = s.ranges.lexile[0]; $("#s-lex-max").value = s.ranges.lexile[1];
  $("#s-lix-min").value = s.ranges.lix[0]; $("#s-lix-max").value = s.ranges.lix[1];
  // targets
  $("#s-t7-wpm").value = s.targets[7].wpm; $("#s-t7-comp").value = s.targets[7].comp;
  $("#s-t8-wpm").value = s.targets[8].wpm; $("#s-t8-comp").value = s.targets[8].comp;
  $("#s-t9-wpm").value = s.targets[9].wpm; $("#s-t9-comp").value = s.targets[9].comp;
  // weights
  $("#s-w-wpm").value = s.weights.wpm; $("#s-w-comp").value = s.weights.comp; $("#s-w-level").value = s.weights.level;

  // listeners (idempotent pattern: remove old, add new)
  const bindNum = (id, fn) => {
    const el = $(id);
    const clone = el.cloneNode(true);
    el.parentNode.replaceChild(clone, el);
    clone.addEventListener("change", () => { fn(Number(clone.value)); saveDb(db); rerenderAll(); });
  };
  bindNum("#s-wpm-min", v=>db.settings.ranges.wpm[0]=v);
  bindNum("#s-wpm-max", v=>db.settings.ranges.wpm[1]=v);
  bindNum("#s-comp-min", v=>db.settings.ranges.comp[0]=v);
  bindNum("#s-comp-max", v=>db.settings.ranges.comp[1]=v);
  bindNum("#s-lex-min", v=>db.settings.ranges.lexile[0]=v);
  bindNum("#s-lex-max", v=>db.settings.ranges.lexile[1]=v);
  bindNum("#s-lix-min", v=>db.settings.ranges.lix[0]=v);
  bindNum("#s-lix-max", v=>db.settings.ranges.lix[1]=v);
  bindNum("#s-t7-wpm", v=>db.settings.targets[7].wpm=v);
  bindNum("#s-t7-comp", v=>db.settings.targets[7].comp=v);
  bindNum("#s-t8-wpm", v=>db.settings.targets[8].wpm=v);
  bindNum("#s-t8-comp", v=>db.settings.targets[8].comp=v);
  bindNum("#s-t9-wpm", v=>db.settings.targets[9].wpm=v);
  bindNum("#s-t9-comp", v=>db.settings.targets[9].comp=v);
  bindNum("#s-w-wpm", v=>db.settings.weights.wpm=v);
  bindNum("#s-w-comp", v=>db.settings.weights.comp=v);
  bindNum("#s-w-level", v=>db.settings.weights.level=v);
}

function rerenderAll(){
  renderDashboard();
  if (!$("##view-students").classList.contains("hidden")) { renderStudents(); renderStudentDetail(); }
  if (!$("##view-analytics").classList.contains("hidden")) renderAnalytics();
}

// ---------------- Export/Import/FS Access ----------------
$("#btn-export").addEventListener("click", () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], {type:"application/json"}));
  a.download = "lasmonitor-data.json";
  a.click();
  URL.revokeObjectURL(a.href);
});
$("#file-import").addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const json = JSON.parse(reader.result);
      if (!json.students || !json.assessments || !json.settings) throw new Error("Ogiltig fil");
      db = json; saveDb(db);
      alert("Importerad!");
      renderDashboard(); renderStudents(); renderStudentDetail(); renderMaterials(); renderAnalytics(); renderSettings();
    }catch(err){ alert("Kunde inte importera: "+err.message); }
  };
  reader.readAsText(file);
});
$("#btn-open-file").addEventListener("click", async () => {
  try{
    if (!("showOpenFilePicker" in window)) throw new Error("File System Access API stöds inte av denna webbläsare.");
    const [handle] = await window.showOpenFilePicker({ types:[{description:"JSON", accept:{ "application/json":[".json"] }}] });
    const file = await handle.getFile();
    const text = await file.text();
    const json = JSON.parse(text);
    if (!json.students || !json.assessments || !json.settings) throw new Error("Ogiltig fil");
    db = json; saveDb(db);
    alert("Öppnat!");
    renderDashboard(); renderStudents(); renderStudentDetail(); renderMaterials(); renderAnalytics(); renderSettings();
  }catch(err){ alert(err.message); }
});
$("#btn-save-file").addEventListener("click", async () => {
  try{
    if (!("showSaveFilePicker" in window)) throw new Error("File System Access API stöds inte av denna webbläsare.");
    const handle = await window.showSaveFilePicker({ suggestedName:"lasmonitor-data.json", types:[{description:"JSON", accept:{ "application/json":[".json"] }}] });
    const w = await handle.createWritable();
    await w.write(JSON.stringify(db, null, 2));
    await w.close();
    alert("Sparat!");
  }catch(err){ alert(err.message); }
});

