/* ASTIX · CanSat mission site */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
let lang="nl";
try{const l=localStorage.getItem("astix-lang");if(l==="en"||l==="nl")lang=l}catch(e){}
const L=(nl,en)=>lang==="en"?en:nl;

/* ---------------- data ---------------- */
const CREW={            // in this order the first letters spell A-S-T-I-X
  Alessio:{c:"#d9844e",nl:"Elektronica & code",en:"Electronics & code",sym:"chip"},
  Sam:{c:"#d6b25a",nl:"Parachute & 3D",en:"Parachute & 3D",sym:"chute"},
  Thomas:{c:"#9d86c6",nl:"Grondstation & kaart",en:"Ground station & map",sym:"dish"},
  Ilco:{c:"#6aae8e",nl:"Ontwerp & data",en:"Design & data",sym:"wave"},
  Xeno:{c:"#6a95d4",nl:"Software & radio",en:"Software & radio",sym:"radio"},
};
const NAMES=Object.keys(CREW);
const ALL="ALL";
const GROUPS=[
  {id:"comp",nl:"Componenten",en:"Components"},
  {id:"mech",nl:"Mechanisch ontwerp",en:"Mechanical design"},
  {id:"soft",nl:"Software",en:"Software"},
  {id:"sec",nl:"Secundaire missie",en:"Secondary mission"},
  {id:"test",nl:"Testen",en:"Testing"},
  {id:"out",nl:"Outreach",en:"Outreach"},
];
const TASKS=[
  {g:"comp",id:"components",nl:"Componenten kiezen",en:"Components selection",who:["Ilco","Alessio"]},
  {g:"mech",id:"cad",nl:"3D-ontwerp van de CanSat",en:"CanSat 3D design",who:["Ilco","Sam"]},
  {g:"mech",id:"chute",nl:"Parachute ontwerpen",en:"Parachute design",who:["Sam","Thomas"]},
  {g:"mech",id:"print",nl:"3D-printen",en:"3D printing",who:["Alessio","Xeno"]},
  {g:"soft",id:"mcu",nl:"Microcontroller programmeren",en:"Microcontroller programming",who:["Alessio","Xeno"]},
  {g:"soft",id:"comms",nl:"Communicatiemodule",en:"Module communication",who:["Xeno","Alessio"]},
  {g:"soft",id:"gs",nl:"Software grondstation",en:"Ground station software",who:["Thomas","Xeno"]},
  {g:"sec",id:"research",nl:"Onderzoek turbulentie",en:"Turbulence research",who:["Alessio","Ilco"]},
  {g:"sec",id:"analysis",nl:"Turbulentiedata analyseren",en:"Turbulence data analysis",who:["Ilco","Alessio"]},
  {g:"sec",id:"map",nl:"Turbulentiekaart maken",en:"Turbulence map creation",who:["Thomas","Xeno"]},
  {g:"test",id:"etest",nl:"Elektronica testen",en:"Electronics testing",who:["Alessio","Ilco"]},
  {g:"test",id:"drop",nl:"Valtest parachute",en:"Parachute drop testing",who:["Sam","Alessio"]},
  {g:"test",id:"full",nl:"Volledige systeemtest",en:"Full system testing",who:ALL},
  {g:"out",id:"pres",nl:"Teampresentatie",en:"Team presentation",who:["Xeno","Alessio"]},
  {g:"out",id:"social",nl:"Updates op sociale media",en:"Social media updates",who:["Thomas","Xeno"]},
  {g:"out",id:"report",nl:"Voortgangsrapport",en:"Progress report",who:ALL},
];
const PARTS={
  parachute:{k:"01 / PARACHUTE",nl:["Parachute","Zonder parachute is het een blikje dat van een kilometer hoog valt. Hij moet de CanSat zo afremmen dat we genoeg tijd hebben om te meten, en dat er na de landing nog iets heel is. Dat testen we door hem echt te laten vallen."],
    en:["Parachute","Without a parachute it is just a can falling from a kilometre up. It has to slow the CanSat down enough to give us time to measure, and to leave something intact after the landing. We test that by actually dropping it."],tasks:["chute","drop"]},
  radio:{k:"02 / RADIO",nl:["Radio en antenne","Stuurt tijdens de vlucht de metingen naar beneden. Op de grond vangt ons grondstation ze op en zetten we ze meteen op een scherm."],
    en:["Radio and antenna","Sends the measurements down during the flight. On the ground our ground station picks them up and puts them straight on a screen."],tasks:["comms","gs"]},
  mcu:{k:"03 / BRAIN",nl:["Microcontroller","De kleine computer die alles aanstuurt. Hij leest de sensoren uit, rekent de hoogte uit en geeft alles door aan de radio."],
    en:["Microcontroller","The small computer that runs everything. It reads the sensors, works out the altitude and passes everything to the radio."],tasks:["mcu","components"]},
  sensors:{k:"04 / SENSORS",nl:["Sensoren","Luchtdruk en temperatuur voor de primaire missie. Voor onze turbulentiemissie meten we ook hoe de CanSat beweegt, slingert en draait."],
    en:["Sensors","Air pressure and temperature for the primary mission. For our turbulence mission we also measure how the CanSat moves, swings and turns."],tasks:["components","research","etest"]},
  power:{k:"05 / POWER",nl:["Batterij","Moet het volhouden van het wachten op het lanceerplatform tot we de CanSat na de landing terugvinden."],
    en:["Battery","Has to last from the wait on the launch pad until we find the CanSat again after landing."],tasks:["components","etest"]},
  shell:{k:"06 / SHELL",nl:["Behuizing","Zelf getekend en zelf geprint. Alles moet erin passen, het geheel moet tussen 300 en 360 gram wegen, en hij moet 11 G en de landing overleven."],
    en:["Shell","Designed and printed by us. Everything has to fit, the whole thing has to weigh between 300 and 360 grams, and it has to survive 11 G and the landing."],tasks:["cad","print"]},
};
const ROUTE=[
  {s:"2026-10-09",nl:["Voorstel insturen","Ons idee voor de secundaire missie, uitgeschreven voor ESERO."],en:["Proposal deadline","Our idea for the secondary mission, written up for ESERO."]},
  {s:"2026-10-16",nl:["Selectie","Tot 60 Belgische teams mogen meedoen."],en:["Selection","Up to 60 Belgian teams get in."]},
  {s:"2026-11-12",e:"2026-11-13",nl:["Workshop leerkrachten","Twee dagen in Brussel."],en:["Teacher workshop","Two days in Brussels."]},
  {s:"2027-01-05",e:"2027-01-07",nl:["Tech support days, ronde 1","Een halfuur met de experts om ons ontwerp te checken."],en:["Tech support days, round 1","Half an hour with the experts to check our design."]},
  {s:"2027-01-13",nl:["Voortgangsrapport","Deadline van het rapport. Daarna volgt de selectie voor de halve finale."],en:["Progress report","Report deadline, then the selection for the semi-final."]},
  {s:"2027-03-09",e:"2027-03-11",nl:["Tech support days, ronde 2","Laatste check voor de halve finale."],en:["Tech support days, round 2","Last check before the semi-final."]},
  {s:"2027-03-17",nl:["Halve finale","Presentatie voor de jury in Brussel. 30 teams gaan door."],en:["Semi-final","Presentation for the jury in Brussels. 30 teams go through."]},
  {s:"2027-04-22",e:"2027-04-24",big:1,nl:["Lancering en finale","Elsenborn. De 30 CanSats gaan de lucht in en er wordt één Belgische winnaar gekozen."],en:["Launch and final","Elsenborn. All 30 CanSats fly and one Belgian winner is picked."]},
  {s:"2027-06-01",e:"2027-06-30",month:1,nl:["ESTEC","Het winnende team gaat naar ESA in Noordwijk."],en:["ESTEC","The winning team goes to ESA in Noordwijk."]},
];
const whoOf=t=>t.who===ALL?NAMES:t.who;
const taskById=id=>TASKS.find(t=>t.id===id);

/* ---------------- stars ---------------- */
(function stars(){
  const sp=$(".space");if(!sp)return;
  const n=innerWidth<700?70:140;let h="";
  for(let i=0;i<n;i++){
    const big=Math.random()<.05,s=big?2.4:(Math.random()*1.6+.6);
    h+=`<i class="${big?"big":""}" style="left:${(Math.random()*100).toFixed(2)}%;top:${(Math.random()*100).toFixed(2)}%;--s:${s.toFixed(1)}px;--o:${(Math.random()*.6+.3).toFixed(2)};--d:${(Math.random()*4+2).toFixed(1)}s"></i>`;
  }
  sp.innerHTML=h;
})();
$$(".title span").forEach((s,i)=>s.style.setProperty("--i",i));

/* ---------------- language ---------------- */
function applyLang(){
  document.documentElement.lang=lang;
  $$("[data-en]").forEach(el=>{
    if(el.dataset.nl===undefined)el.dataset.nl=el.textContent;
    el.textContent=lang==="en"?el.dataset.en:el.dataset.nl;
  });
  $$(".lang button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.lang===lang)));
  renderCrew();renderBoard();renderRoute();if(curPart)renderPart(curPart);
  lastPhase=null;frame(true);
}
$$(".lang button").forEach(b=>b.addEventListener("click",()=>{lang=b.dataset.lang;try{localStorage.setItem("astix-lang",lang)}catch(e){}applyLang()}));

const av=n=>`<span class="av" style="--c:${CREW[n].c}" title="${n}">${n[0]}</span>`;

/* ---------------- crew patches ---------------- */
let selCrew=null;
const SYM={
  chip:'<rect x="-11" y="-11" width="22" height="22" rx="3"/><path d="M-6-17v6M0-17v6M6-17v6M-6 11v6M0 11v6M6 11v6M-17-6h6M-17 0h6M-17 6h6M11-6h6M11 0h6M11 6h6"/>',
  wave:'<path d="M-18 4c4-10 8-10 12 0s8 10 12 0 8-10 12 0"/><path d="M-18-6c4-6 8-6 12 0s8 6 12 0 8-6 12 0" opacity=".5"/>',
  chute:'<path d="M-16 0c0-10 7-16 16-16s16 6 16 16c-3-2-6-2-8 0-3-2-6-2-8 0-3-2-5-2-8 0-3-2-6-2-8 0z"/><path d="M-15 0l11 12M15 0L4 12"/><rect x="-4" y="11" width="8" height="8" rx="1"/>',
  dish:'<path d="M-14 6a16 16 0 0 1 22-20z"/><path d="M-3-3l9-9M-8 12h16M0 6v6"/><circle cx="7" cy="-13" r="2"/>',
  radio:'<path d="M0 10v-14"/><circle cx="0" cy="-6" r="2.5"/><path d="M-8-13a11 11 0 0 0 0 14M8-13a11 11 0 0 1 0 14M-13-18a18 18 0 0 0 0 24M13-18a18 18 0 0 1 0 24"/>',
};
function patchSVG(n){
  const p=CREW[n],id="pp-"+n;
  return `<svg viewBox="0 0 200 200" aria-hidden="true" style="--c:${p.c}">
    <defs><path id="${id}-t" d="M30 100a70 70 0 0 1 140 0"/><path id="${id}-b" d="M24 100a76 76 0 0 0 152 0"/></defs>
    <circle cx="100" cy="100" r="96" fill="#0a1330" stroke="${p.c}" stroke-width="6"/>
    <circle cx="100" cy="100" r="88" fill="none" stroke="#f4f7ff" stroke-width="1.5" stroke-dasharray="3 4" opacity=".55"/>
    <circle cx="100" cy="100" r="60" fill="#071025" stroke="#1f3566" stroke-width="1.5"/>
    <path d="M44 120c40 18 92 18 120-24" fill="none" stroke="${p.c}" stroke-width="3" opacity=".8"/>
    <text font-family="Michroma, sans-serif" font-size="15" letter-spacing="5" fill="#f4f7ff"><textPath href="#${id}-t" startOffset="50%" text-anchor="middle">${n.toUpperCase()}</textPath></text>
    <text font-family="JetBrains Mono, monospace" font-size="10" letter-spacing="2" fill="${p.c}"><textPath href="#${id}-b" startOffset="50%" text-anchor="middle">ASTIX · CANSAT</textPath></text>
    <text x="100" y="112" text-anchor="middle" font-family="Michroma, sans-serif" font-size="38" fill="#f4f7ff">${n[0]}</text>
    <g transform="translate(100 64)" fill="none" stroke="${p.c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${SYM[p.sym]}</g>
    <path d="M150 52l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#f4f7ff" opacity=".8"/>
  </svg>`;
}
function renderCrew(){
  const box=$("#crew");if(!box)return;
  box.innerHTML=NAMES.map((n,i)=>`<button class="patch${selCrew===n?" sel":""}" type="button" data-n="${n}" aria-pressed="${selCrew===n}" style="--c:${CREW[n].c};--i:${i}">
    ${patchSVG(n)}<span class="pname">${n}</span><span class="prole">${L(CREW[n].nl,CREW[n].en)}</span>
    <span class="pcta">${selCrew===n?L("✓ Geselecteerd","✓ Selected"):L("Bekijk taken →","See tasks →")}</span></button>`).join("");
  $$(".patch",box).forEach(b=>b.addEventListener("click",()=>{
    selCrew=selCrew===b.dataset.n?null:b.dataset.n;renderCrew();renderBoard();
    if(selCrew){const h=$(".task-head");if(h&&h.getBoundingClientRect().top>innerHeight*.75)h.scrollIntoView({behavior:reduce?"auto":"smooth",block:"center"})}
  }));
  box.classList.toggle("has-sel",!!selCrew);
}

/* ---------------- task board (filtered by the selected patch) ---------------- */
function renderBoard(){
  const b=$("#board");if(!b)return;
  const mine=selCrew?TASKS.filter(t=>whoOf(t).includes(selCrew)).length:TASKS.length;
  const tt=$("#task-title");
  tt.innerHTML=selCrew?`${L("Taken van","Tasks of")} <span style="color:${CREW[selCrew].c}">${selCrew}</span> · ${mine}`:`${L("Alle taken","All tasks")} · ${mine}`;
  $("#task-reset").hidden=!selCrew;
  b.classList.toggle("filtering",!!selCrew);
  b.innerHTML=GROUPS.map(g=>{
    const ts=TASKS.filter(t=>t.g===g.id);
    return `<div class="col"><h3>${L(g.nl,g.en)}<small>${ts.length}</small></h3>${ts.map(t=>{
      const all=t.who===ALL,hit=selCrew&&whoOf(t).includes(selCrew);
      return `<div class="card${all?" all":""}${hit?" hit":""}" style="${hit?"--c:"+CREW[selCrew].c:""}"><span>${L(t.nl,t.en)}</span><span class="avs">${all?L("IEDEREEN","EVERYONE"):t.who.map(av).join("")}</span></div>`;
    }).join("")}</div>`;
  }).join("");
}
$("#task-reset")&&$("#task-reset").addEventListener("click",()=>{selCrew=null;renderCrew();renderBoard()});

/* ---------------- the can ---------------- */
let curPart=null;
const layersEl=$("#layers");
function renderPart(p){
  const d=PARTS[p];
  $("#part-k").textContent=d.k;
  const [t,desc]=d[lang];
  const tt=$("#part-t"),dd=$("#part-d");
  tt.textContent=t;dd.textContent=desc;tt.dataset.nl=d.nl[0];tt.dataset.en=d.en[0];dd.dataset.nl=d.nl[1];dd.dataset.en=d.en[1];
  $("#part-who").innerHTML=d.tasks.map(id=>{const tk=taskById(id);
    return `<div class="who-row"><span class="task">${L(tk.nl,tk.en)}</span><span class="avs">${whoOf(tk).map(av).join("")}</span><span class="av-name">${tk.who===ALL?L("iedereen","everyone"):tk.who.join(" & ")}</span></div>`}).join("");
}
function pick(p){
  curPart=p;
  $$(".layer",layersEl).forEach(g=>g.classList.toggle("sel",g.dataset.part===p));
  layersEl.classList.add("has-sel");
  renderPart(p);
}
$$(".layer").forEach(g=>{
  g.addEventListener("click",()=>pick(g.dataset.part));
  g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();pick(g.dataset.part)}});
});

/* ---------------- big line: words light up while you scroll ---------------- */
const bigline=$("#bigline");let words=[];
function splitBigline(){
  if(!bigline)return;
  const txt=lang==="en"?bigline.dataset.en:(bigline.dataset.nl||bigline.textContent);
  if(bigline.dataset.nl===undefined)bigline.dataset.nl=bigline.textContent;
  bigline.innerHTML=txt.split(" ").map(w=>`<span class="w">${w}</span>`).join(" ");
  words=$$(".w",bigline);
}

/* ---------------- planning ---------------- */
const DAY=864e5;
function fmt(d1,d2,month){
  const m=lang==="en"?["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]:["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
  const a=new Date(d1+"T12:00:00"),b=d2?new Date(d2+"T12:00:00"):null;
  if(month)return `${m[a.getMonth()]} ${a.getFullYear()}`;
  if(b)return `${a.getDate()}–${b.getDate()} ${m[b.getMonth()]} ${b.getFullYear()}`;
  return `${a.getDate()} ${m[a.getMonth()]} ${a.getFullYear()}`;
}
function renderRoute(){
  const ol=$("#stops");if(!ol)return;
  const today=new Date();today.setHours(0,0,0,0);
  let nextIdx=ROUTE.findIndex(r=>new Date((r.e||r.s)+"T23:59:59")>=today);
  ol.innerHTML=ROUTE.map((r,i)=>{
    const past=new Date((r.e||r.s)+"T23:59:59")<today,now=i===nextIdx;
    const [t,x]=r[lang];
    return `<li class="stop${past?" past":""}${now?" nextup":""}${r.big?" big":""}" style="--f:${(i+.5)/ROUTE.length}">
      <span class="d">${fmt(r.s,r.e,r.month)}</span><span class="t">${t}${now?`<span class="tag2">${L("VOLGENDE","NEXT")}</span>`:""}</span><span class="x">${x}</span></li>`;
  }).join("");
  const nx=$("#next");
  if(nextIdx>=0){
    const r=ROUTE[nextIdx],days=Math.ceil((new Date(r.s+"T00:00:00")-today)/DAY);
    nx.innerHTML=days>0?`${L("Volgende stap","Next step")}: ${r[lang][0]} · ${L("nog","in")} <b>${days}</b> ${L(days===1?"dag":"dagen",days===1?"day":"days")}`:`${L("Nu bezig","Happening now")}: <b>${r[lang][0]}</b>`;
  }else nx.textContent="";
  // days until launch, as a bonus line in the launch caption block
  routeStops=$$(".stop",ol);
}
let routeStops=[];

/* ---------------- reveal on scroll ---------------- */
const rvTargets=$$(".sec-head,.mission,.turb,.filters,.board,.specs,.ig-card,.jury h3");
rvTargets.forEach(el=>el.classList.add("rv"));
const once=(els,cls,th=.2)=>{
  if(!("IntersectionObserver" in window)||reduce){els.forEach(e=>e&&e.classList.add(cls));return}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add(cls);io.unobserve(e.target)}}),{threshold:th});
  els.forEach(e=>e&&io.observe(e));
};
once(rvTargets,"in",.15);
once([$("#bars")],"in",.4);
once([$("#blueprint"),$(".chart-box")],"in",.35);
const crewEl=$("#crew");
once([crewEl],"in",.3);
if(crewEl)new MutationObserver(()=>{}).observe(crewEl,{attributes:true});
setTimeout(function waitStamp(){if(crewEl.classList.contains("in"))setTimeout(()=>crewEl.classList.add("done"),1400);else setTimeout(waitStamp,300)},300);

/* ---------------- scroll engine: launch, HUD, can, route, big line ---------------- */
const hud={el:$(".hud"),alt:$("#alt"),vel:$("#vel"),phase:$("#phase"),probe:$("#probe")};
const launch=$("#lancering"),caps=$$("#captions li"),lT=$("#l-t");
const lAlt=$("#l-alt"),lVel=$("#l-vel"),lG=$("#l-g"),lGbar=$("#l-gbar");
const pinCan=$("#ontwerp"),routeBox=$("#route-box"),routePath=$("#route-path");
const secs=$$("[data-phase]"),navLinks=$$(".nav a"),ground=$("#ground");
let tops=[],maxScroll=1,lastAlt=0,lastT=performance.now(),vel=0,lastPhase=null,lastCap=-1,curP=0;
function measure(){tops=secs.map(s=>s.offsetTop);maxScroll=Math.max(1,document.documentElement.scrollHeight-innerHeight)}
measure();addEventListener("resize",()=>{measure();frame(true)});addEventListener("load",measure);
if("ResizeObserver" in window)new ResizeObserver(measure).observe(document.body);

function flight(p){
  // simple made-up curve that respects ESERO's maxima: 11 G, 550 km/h, ~1 km
  const ign=.14,burnout=.34,apo=.86;
  if(p<ign)return{alt:0,v:0,g:1,burn:0};
  const q=(p-ign)/(apo-ign);
  const alt=Math.round(1000*clamp(1-Math.pow(1-clamp(q),2.2)));
  let v,g;
  if(p<burnout){const b=(p-ign)/(burnout-ign);v=550*Math.sin(b*Math.PI/2);g=1+10*Math.sin(Math.min(1,b*1.6)*Math.PI/2)*(b<.8?1:(1-b)*5)}
  else{const c=clamp((p-burnout)/(apo-burnout));v=550*(1-c)*(1-c*.1);g=.3}
  return{alt,v:Math.max(0,Math.round(v)),g:Math.max(0,g),burn:p<burnout?1:clamp(1-(p-burnout)*20)};
}

/* ---------------- launch scene (canvas, scrubbed by scroll) ---------------- */
const IGN=.14,BURNOUT=.34,APO=.86;
function missionClock(p){
  const f2=n=>String(Math.floor(n)).padStart(2,"0");
  if(p<IGN){const s=Math.ceil(3-(p/IGN)*3);return "T-00:"+f2(Math.max(0,s))}
  const s=(p-IGN)/(APO-IGN)*11;                  // about 11 s to apogee
  return "T+00:"+f2(s)+"."+Math.floor((s%1)*10);
}
const fl=(function(){
  const cv=$("#flight");if(!cv)return null;
  const ctx=cv.getContext("2d");
  let W=0,H=0,dpr=1,trees=[],clouds=[];
  function rnd(i){const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)}
  function size(){
    dpr=Math.min(2,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    trees=[];for(let x=-20,i=0;x<W+20;i++){const w=8+rnd(i)*14;trees.push({x,w,h:18+rnd(i+50)*34});x+=w*.55}
    clouds=[{a:230,x:.18,s:1.1},{a:330,x:.78,s:.8},{a:470,x:.33,s:1.4},{a:600,x:.86,s:1},{a:720,x:.1,s:.9},{a:860,x:.62,s:1.3},{a:980,x:.25,s:1}];
  }
  size();addEventListener("resize",size);
  const altAt=p=>p<IGN?0:1000*clamp(1-Math.pow(1-clamp((p-IGN)/(APO-IGN)),2.2));
  const pAt=a=>IGN+(1-Math.pow(1-clamp(a/1000),1/2.2))*(APO-IGN);
  function cloud(x,y,s,al){
    ctx.save();ctx.globalAlpha=al;
    const parts=[[0,0,38],[-34,8,26],[34,6,30],[-12,-14,26],[16,-12,24],[54,14,18],[-56,14,16]];
    for(const [dx,dy,r] of parts){
      const g=ctx.createRadialGradient(x+dx*s,y+dy*s-r*s*.3,r*s*.2,x+dx*s,y+dy*s,r*s);
      g.addColorStop(0,"#ffffff");g.addColorStop(.7,"#eef3fa");g.addColorStop(1,"rgba(220,230,244,0)");
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(x+dx*s,y+dy*s,r*s,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
  function puff(x,y,r,al){
    const g=ctx.createRadialGradient(x-r*.25,y-r*.3,r*.1,x,y,r);
    g.addColorStop(0,`rgba(250,250,252,${al})`);g.addColorStop(.6,`rgba(225,228,234,${al*.75})`);g.addColorStop(1,"rgba(210,214,222,0)");
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  }
  function rocketShape(L){
    const D=L/9.5;
    // fins
    ctx.fillStyle="#1d3f8f";
    ctx.beginPath();ctx.moveTo(-D/2,-L*.18);ctx.lineTo(-D*1.55,-L*.02);ctx.lineTo(-D*1.55,0);ctx.lineTo(-D/2,0);ctx.fill();
    ctx.beginPath();ctx.moveTo(D/2,-L*.18);ctx.lineTo(D*1.55,-L*.02);ctx.lineTo(D*1.55,0);ctx.lineTo(D/2,0);ctx.fill();
    // body with round shading
    const g=ctx.createLinearGradient(-D/2,0,D/2,0);
    g.addColorStop(0,"#9aa4b6");g.addColorStop(.35,"#ffffff");g.addColorStop(.7,"#dde3ee");g.addColorStop(1,"#8f99ab");
    ctx.fillStyle=g;ctx.fillRect(-D/2,-L*.78,D,L*.78);
    // blue band + decal
    const gb=ctx.createLinearGradient(-D/2,0,D/2,0);gb.addColorStop(0,"#1b3f8c");gb.addColorStop(.4,"#3f86ff");gb.addColorStop(1,"#18357a");
    ctx.fillStyle=gb;ctx.fillRect(-D/2,-L*.6,D,L*.05);
    ctx.save();ctx.rotate(-Math.PI/2);ctx.fillStyle="#1b2a4a";ctx.font=`700 ${Math.max(7,D*.55)}px JetBrains Mono, monospace`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("ASTIX",L*.34,0);ctx.restore();
    // nozzle
    ctx.fillStyle="#3a3f4a";ctx.beginPath();ctx.moveTo(-D*.32,0);ctx.lineTo(D*.32,0);ctx.lineTo(D*.42,D*.45);ctx.lineTo(-D*.42,D*.45);ctx.fill();
    return D;
  }
  function nose(L,D){
    const g=ctx.createLinearGradient(-D/2,0,D/2,0);
    g.addColorStop(0,"#b23a2c");g.addColorStop(.35,"#ff6a52");g.addColorStop(1,"#9c2f23");
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-D/2,0);ctx.quadraticCurveTo(-D/2,-L*.13,0,-L*.22);ctx.quadraticCurveTo(D/2,-L*.13,D/2,0);ctx.fill();
  }
  function canSat(s,open){
    // parachute
    if(open>0){
      ctx.save();ctx.scale(open,open);
      ctx.strokeStyle="rgba(230,236,248,.8)";ctx.lineWidth=1/open;
      ctx.beginPath();for(const x of [-30,-12,12,30]){ctx.moveTo(x*s,-34*s);ctx.lineTo(0,0)}ctx.stroke();
      const g=ctx.createLinearGradient(0,-62*s,0,-34*s);g.addColorStop(0,"#5aa0ff");g.addColorStop(1,"#1f5fd6");
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-34*s,-34*s);ctx.quadraticCurveTo(-34*s,-66*s,0,-66*s);ctx.quadraticCurveTo(34*s,-66*s,34*s,-34*s);
      for(let i=0;i<4;i++){const x0=34*s-i*17*s;ctx.quadraticCurveTo(x0-8.5*s,-39*s,x0-17*s,-34*s)}ctx.fill();
      ctx.fillStyle="rgba(255,255,255,.85)";ctx.beginPath();ctx.moveTo(-6*s,-34*s);ctx.quadraticCurveTo(-5*s,-62*s,0,-66*s);ctx.quadraticCurveTo(5*s,-62*s,6*s,-34*s);ctx.fill();
      ctx.restore();
    }
    // the can
    const g=ctx.createLinearGradient(-6*s,0,6*s,0);g.addColorStop(0,"#9aa4b6");g.addColorStop(.4,"#fff");g.addColorStop(1,"#8f99ab");
    ctx.fillStyle=g;ctx.fillRect(-6*s,0,12*s,20*s);ctx.fillStyle="#2f7bff";ctx.fillRect(-6*s,6*s,12*s,4*s);
  }
  function draw(p,t){
    if(!W)return;
    const alt=altAt(p),q=clamp((p-IGN)/(APO-IGN)),burn=p<IGN?0:p<BURNOUT?1:clamp(1-(p-BURNOUT)*25);
    const k=H/250;                         // pixels per metre near the ground
    const groundY=H*.84, holdY=H*.56;
    const rocketY=Math.max(holdY,groundY-alt*k);       // nozzle on screen
    const camAlt=alt-(groundY-rocketY)/k;             // altitude at the ground line
    const sy=a=>groundY-(a-camAlt)*k;
    const shake=(p>IGN&&p<IGN+.05)?Math.sin(t*90)*2.2*(1-(p-IGN)/.05):0;
    ctx.save();ctx.translate(shake,0);
    // sky: stays blue, gets a little deeper higher up
    const d=clamp(camAlt/1000);
    const sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,`rgb(${Math.round(46-16*d)},${Math.round(104-30*d)},${Math.round(186-26*d)})`);
    sky.addColorStop(.65,`rgb(${Math.round(120-30*d)},${Math.round(170-30*d)},${Math.round(222-14*d)})`);
    sky.addColorStop(1,`rgb(${Math.round(214-40*d)},${Math.round(226-30*d)},${Math.round(236-16*d)})`);
    ctx.fillStyle=sky;ctx.fillRect(-10,0,W+20,H);
    // sun glow
    const sun=ctx.createRadialGradient(W*.84,H*.2,0,W*.84,H*.2,H*.5);sun.addColorStop(0,"rgba(255,246,214,.75)");sun.addColorStop(.12,"rgba(255,240,200,.35)");sun.addColorStop(1,"rgba(255,240,200,0)");
    ctx.fillStyle=sun;ctx.fillRect(0,0,W,H);
    // clouds (fixed heights, they slide past)
    for(const c of clouds){const y=sy(c.a);if(y<-120||y>H+120)continue;cloud(c.x*W+Math.sin(t*.05+c.a)*8,y,c.s*Math.min(1.4,W/900+.4),.92)}
    // landscape: far ridge, forest, heath, launch pad (moves with the camera)
    const g0=sy(0);
    if(g0<H+200){
      ctx.fillStyle="#7c97b8";ctx.beginPath();ctx.moveTo(0,g0-36);
      for(let x=0;x<=W;x+=W/8)ctx.lineTo(x,g0-36-Math.sin(x*.004)*10-Math.sin(x*.011)*6);ctx.lineTo(W,g0+4);ctx.lineTo(0,g0+4);ctx.fill();
      ctx.fillStyle="#2c4a35";
      for(const tr of trees){ctx.beginPath();ctx.moveTo(tr.x-tr.w/2,g0-6);ctx.lineTo(tr.x,g0-6-tr.h);ctx.lineTo(tr.x+tr.w/2,g0-6);ctx.fill()}
      const field=ctx.createLinearGradient(0,g0-8,0,g0+H*.3);field.addColorStop(0,"#5b6b3a");field.addColorStop(.35,"#6f7a45");field.addColorStop(1,"#4a5530");
      ctx.fillStyle=field;ctx.fillRect(0,g0-8,W,H);
      // pad, blast plate, launch rail
      const cx=W/2;
      ctx.fillStyle="#8b8f96";ctx.fillRect(cx-70,g0-4,140,8);
      ctx.fillStyle="#5d6168";ctx.fillRect(cx-26,g0-12,52,8);
      ctx.strokeStyle="#4b5059";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx+14,g0-12);ctx.lineTo(cx+14,g0-12-H*.24);ctx.stroke();
      ctx.lineWidth=1;for(let y=g0-20;y>g0-12-H*.24;y-=14){ctx.beginPath();ctx.moveTo(cx+14,y);ctx.lineTo(cx+22,y-7);ctx.stroke()}
      ctx.strokeStyle="#6b7079";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx+22,g0-6);ctx.lineTo(cx+22,g0-12-H*.24);ctx.stroke();
      // small tent and flags for scale
      ctx.fillStyle="#dfe3ea";ctx.beginPath();ctx.moveTo(cx-W*.28,g0-2);ctx.lineTo(cx-W*.28+22,g0-30);ctx.lineTo(cx-W*.28+44,g0-2);ctx.fill();
      ctx.fillStyle="#c9372c";ctx.fillRect(cx+W*.22,g0-34,2,32);ctx.beginPath();ctx.moveTo(cx+W*.22+2,g0-34);ctx.lineTo(cx+W*.22+16,g0-29);ctx.lineTo(cx+W*.22+2,g0-24);ctx.fill();
    }
    // smoke: one puff per few metres of the burn, older puffs are bigger and drift with the wind
    if(p>IGN){
      const topA=Math.min(alt,altAt(BURNOUT));
      for(let a=0,i=0;a<=topA;a+=4,i++){
        const pe=pAt(a),age=Math.max(0,p-pe);
        const y=sy(a)+8;if(y<-150||y>H+150)continue;
        const r=6+Math.min(90,age*700)+rnd(i)*6;
        const x=W/2+age*W*.55+Math.sin(i*1.7)*Math.min(18,age*180);
        const al=clamp(.62-age*.9-(a/topA)*.12,.04,.62);
        puff(x,y,r,al);
      }
      // ground cloud at the pad
      const ga=p-IGN;
      if(g0<H+150)for(let i=0;i<14;i++){const sx=(rnd(i+9)-.5)*2;puff(W/2+sx*Math.min(W*.35,ga*W*2.4),g0-10-rnd(i)*20*Math.min(1,ga*8),20+Math.min(70,ga*500)*(.6+rnd(i+3)*.6),clamp(.7-ga*.8,.08,.7))}
    }
    // rocket
    const L=Math.min(150,H*.2),cx=W/2;
    const sep=clamp((p-APO)/.12);
    const tilt=(q*5+(sep>0?sep*40:0))*Math.PI/180;
    const fallY=sep*sep*H*.9;
    ctx.save();ctx.translate(cx+Math.sin(t*60)*.6*burn,rocketY+fallY);ctx.rotate(tilt);
    // flame + glow
    if(burn>0){
      const fl=L*(.55+.12*Math.sin(t*50)+.06*Math.sin(t*93))*burn,D=L/9.5;
      ctx.globalCompositeOperation="lighter";
      const glow=ctx.createRadialGradient(0,D*.6,0,0,D*.6,L*.45);glow.addColorStop(0,`rgba(255,190,90,${.55*burn})`);glow.addColorStop(1,"rgba(255,150,60,0)");
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,D*.6,L*.45,0,Math.PI*2);ctx.fill();
      const fg=ctx.createLinearGradient(0,D*.4,0,D*.4+fl);fg.addColorStop(0,"rgba(255,255,235,1)");fg.addColorStop(.25,"rgba(255,214,120,.95)");fg.addColorStop(.7,"rgba(255,120,40,.55)");fg.addColorStop(1,"rgba(255,90,30,0)");
      ctx.fillStyle=fg;ctx.beginPath();ctx.moveTo(-D*.4,D*.4);ctx.quadraticCurveTo(-D*.55,D*.4+fl*.45,0,D*.4+fl);ctx.quadraticCurveTo(D*.55,D*.4+fl*.45,D*.4,D*.4);ctx.fill();
      ctx.globalCompositeOperation="source-over";
    }
    const D=rocketShape(L);
    ctx.save();
    if(sep>0){ctx.translate(-sep*L*.9,-L*.78-sep*L*.5);ctx.rotate(-sep*1.4)}else ctx.translate(0,-L*.78);
    nose(L,D);ctx.restore();
    ctx.restore();
    // CanSat comes out and opens its parachute
    if(sep>0){
      const open=clamp((p-APO-.015)/.06);
      ctx.save();ctx.translate(cx+sep*20,rocketY-L*.9-sep*L*.35+Math.sin(t*1.2)*3);ctx.rotate(Math.sin(t*1.1)*.06);
      canSat(Math.min(2.2,L/60),open);ctx.restore();
    }
    ctx.restore();
    // soft vignette
    const v=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);v.addColorStop(0,"rgba(0,0,0,0)");v.addColorStop(1,"rgba(3,8,20,.45)");
    ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
  }
  return {draw,size};
})();
let flightLoop=false;
function drawFlight(p){if(fl)fl.draw(p,performance.now()/1000)}
if(fl&&launch&&"IntersectionObserver" in window&&!reduce){
  let raf=0;
  const loop=()=>{drawFlight(curP);raf=requestAnimationFrame(loop)};
  new IntersectionObserver(es=>{flightLoop=es[0].isIntersecting;cancelAnimationFrame(raf);if(flightLoop)raf=requestAnimationFrame(loop)}).observe($("#flight"));
}

function frame(force){
  const y=scrollY,H=innerHeight;
  /* launch */
  let pL=0,inLaunch=false,launched=false,lf={alt:0};
  if(launch){
    const top=launch.offsetTop,len=launch.offsetHeight-H;
    pL=clamp((y-top)/len);inLaunch=y>=top-H*.5&&y<=top+len;launched=y>top+len;
    launch.style.setProperty("--p",pL.toFixed(4));
    lf=flight(pL);
    launch.classList.toggle("sep",pL>.86);
    curP=pL;if(!flightLoop)drawFlight(pL);
    lAlt.textContent=lf.alt+" m";lVel.textContent=lf.v+(lang==="en"?" km/h":" km/u");lG.textContent=lf.g.toFixed(1)+" G";
    lGbar.style.setProperty("--gw",(lf.g/11*100).toFixed(1)+"%");
    lT.textContent=missionClock(pL);
    let ci=-1;caps.forEach((li,i)=>{if(pL>=+li.dataset.at)ci=i});
    if(ci!==lastCap){caps.forEach((li,i)=>li.classList.toggle("on",i===ci));lastCap=ci}
  }
  /* HUD altitude: on the pad, up with the rocket, then down with the parachute */
  let alt,ascent=false;
  if(!launched){alt=inLaunch?lf.alt:0;ascent=pL<.86}
  else{const start=launch.offsetTop+launch.offsetHeight-H;alt=Math.round(1000*(1-clamp((y-start)/Math.max(1,maxScroll-start))))}
  const now=performance.now(),dt=Math.max(16,now-lastT)/1000;
  vel=vel*.8+Math.min(Math.abs(alt-lastAlt)/dt,99)*.2;lastAlt=alt;lastT=now;
  hud.alt.textContent=alt;hud.vel.textContent=vel.toFixed(1);
  hud.probe.style.top=(100-alt/10)+"%";
  const landed=launched&&y>=maxScroll-4;
  if(landed){alt=0;hud.alt.textContent=0}
  hud.el.classList.toggle("ascent",ascent&&!launched);
  hud.el.classList.toggle("landed",landed);
  ground.classList.toggle("down",landed);
  const mid=y+H*.5;let cur=null;
  secs.forEach((s,i)=>{if(tops[i]<=mid)cur=s});
  const label=landed?L("GELAND","TOUCHDOWN"):(!launched&&pL>.86)?L("UITGEWORPEN","DEPLOYED"):cur?(lang==="en"?cur.dataset.phaseEn:cur.dataset.phase):"T-0";
  if(label!==lastPhase||force){hud.phase.textContent=label;lastPhase=label}
  hud.el.classList.toggle("shake",!landed&&cur&&cur.id==="missie");
  navLinks.forEach(a=>a.classList.toggle("on",!!cur&&a.getAttribute("href")==="#"+cur.id));
  /* background: the closer to the ground, the more the terrain map below comes into view */
  const dsc=launched?clamp(1-alt/1000):0;
  rootEl.style.setProperty("--dsc",dsc.toFixed(3));
  rootEl.style.setProperty("--py",(y*.06).toFixed(1));
  rootEl.style.setProperty("--sp",((y*.06)%(H*.35)).toFixed(1));
  /* can opens */
  if(pinCan){
    const r=pinCan.getBoundingClientRect();
    const pinned=pinCan.offsetHeight>H*1.2;
    const e=pinned?clamp((-r.top)/(pinCan.offsetHeight-H)*1.6):clamp((H*.85-r.top)/(H*.7));
    layersEl.style.setProperty("--e",ease(e).toFixed(3));
  }
  /* big line */
  if(words.length){
    const r=bigline.getBoundingClientRect();
    const f=clamp((H*.8-r.top)/(r.height+H*.35));
    const n=Math.round(f*words.length);
    words.forEach((w,i)=>w.classList.toggle("lit",i<n));
  }
  /* route draws itself */
  if(routeBox){
    const r=routeBox.getBoundingClientRect();
    const d=clamp((H*.75-r.top)/(r.height));
    routeBox.style.setProperty("--draw",d.toFixed(3));
    routeStops.forEach(s=>s.classList.toggle("shown",d>=parseFloat(s.style.getPropertyValue("--f"))-.04));
  }
}
const rootEl=document.documentElement;
let ticking=false;
addEventListener("scroll",()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{ticking=false;frame()})},{passive:true});
setInterval(()=>{if(performance.now()-lastT>200){vel*=.6;if(vel<.05)vel=0;hud.vel.textContent=vel.toFixed(1)}},120);

/* ---------------- turbulence canvas ---------------- */
(function turbulence(){
  const cv=$("#turb");if(!cv)return;
  const ctx=cv.getContext("2d");let W=0,H=0,parts=[],on=false,raf=0,t=0;
  const mouse={x:-999,y:-999};
  function size(){const dpr=Math.min(2,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    parts=Array.from({length:Math.round(W*H/1300)},()=>({x:Math.random()*W,y:Math.random()*H}));ctx.fillStyle="#040916";ctx.fillRect(0,0,W,H)}
  function field(x,y){
    const r=x/W,k=0.4+r*r*3.2;
    let a=Math.sin(y*0.012+t*0.6)*0.15*(1-r)+(Math.sin(x*0.02*k+t*1.3)+Math.cos(y*0.023*k-t*1.1)+Math.sin((x+y)*0.011*k+t))*r*r*1.1;
    const dx=x-mouse.x,dy=y-mouse.y;if(dx*dx+dy*dy<9000)a+=Math.atan2(dy,dx)+1.6;
    return a;
  }
  function step(){
    t+=0.016;ctx.fillStyle="rgba(4,9,22,0.13)";ctx.fillRect(0,0,W,H);
    for(const p of parts){
      const a=field(p.x,p.y),sp=1.2+p.x/W*1.6,nx=p.x+Math.cos(a)*sp,ny=p.y+Math.sin(a)*sp,r=p.x/W;
      ctx.strokeStyle=`hsla(${214-r*190},${38+r*20}%,${66+r*6}%,.5)`;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(nx,ny);ctx.stroke();
      p.x=nx;p.y=ny;
      if(p.x>W||p.y<0||p.y>H||p.x<0||Math.random()<0.004){p.x=Math.random()*W*0.15;p.y=Math.random()*H}
    }
    if(on)raf=requestAnimationFrame(step);
  }
  cv.addEventListener("pointermove",e=>{const b=cv.getBoundingClientRect();mouse.x=e.clientX-b.left;mouse.y=e.clientY-b.top});
  cv.addEventListener("pointerleave",()=>{mouse.x=mouse.y=-999});
  size();addEventListener("resize",size);
  if(reduce){for(let i=0;i<120;i++)step();return}
  new IntersectionObserver(es=>{on=es[0].isIntersecting;if(on){cancelAnimationFrame(raf);raf=requestAnimationFrame(step)}}).observe(cv);
})();

$("#year").textContent=new Date().getFullYear();
applyLang();
})();
