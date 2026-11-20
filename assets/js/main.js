/* ASTIX · CanSat mission site */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
let lang="nl";
try{const l=localStorage.getItem("astix-lang");if(l==="en"||l==="nl")lang=l}catch(e){}
const L=(nl,en)=>lang==="en"?en:nl;

/* ---------------- data ---------------- */
const CREW={
  Alessio:{c:"#ff8a3d",nl:"Elektronica & code",en:"Electronics & code",sym:"chip"},
  Ilco:{c:"#4fe3a1",nl:"Ontwerp & data",en:"Design & data",sym:"wave"},
  Sam:{c:"#ffd84a",nl:"Parachute & 3D",en:"Parachute & 3D",sym:"chute"},
  Thomas:{c:"#c77dff",nl:"Grondstation & kaart",en:"Ground station & map",sym:"dish"},
  Xeno:{c:"#4aa0ff",nl:"Software & radio",en:"Software & radio",sym:"radio"},
};
const NAMES=Object.keys(CREW);
const ALL="ALL";
const GROUPS=[
  {id:"comp",nl:"Componenten",en:"Components"},
  {id:"mech",nl:"Mechanisch ontwerp",en:"Mechanical design"},
  {id:"soft",nl:"Software",en:"Software design"},
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
  parachute:{k:"01 / PARACHUTE",nl:["Parachute","Remt de val af, zodat de CanSat rustig genoeg zakt om onderweg goed te meten en heel te landen. We testen hem met echte valtests."],
    en:["Parachute","Slows the fall so the CanSat comes down calmly enough to measure properly and land in one piece. We check it with real drop tests."],tasks:["chute","drop"]},
  radio:{k:"02 / RADIO",nl:["Radio en antenne","Stuurt de metingen elke seconde naar het grondstation. Op de grond vangen we ze op en tonen we ze live."],
    en:["Radio and antenna","Sends the measurements to the ground station every second. On the ground we receive them and show them live."],tasks:["comms","gs"]},
  mcu:{k:"03 / BRAIN",nl:["Microcontroller","Het brein van de CanSat. Leest de sensoren uit, rekent, en geeft de data door aan de radio."],
    en:["Microcontroller","The brain of the CanSat. Reads the sensors, does the maths and hands the data to the radio."],tasks:["mcu","components"]},
  sensors:{k:"04 / SENSORS",nl:["Sensoren","Meten temperatuur en luchtdruk voor de primaire missie, en beweging en schokken voor onze turbulentiemissie."],
    en:["Sensors","Measure temperature and air pressure for the primary mission, and movement and shocks for our turbulence mission."],tasks:["components","research","etest"]},
  power:{k:"05 / POWER",nl:["Batterij","Houdt alles aan, van op het lanceerplatform tot na de landing."],
    en:["Battery","Keeps everything running, from the launch pad until after the landing."],tasks:["components","etest"]},
  shell:{k:"06 / SHELL",nl:["3D-geprinte behuizing","Zelf ontworpen en zelf geprint. Houdt alle lagen op hun plek en moet de klap van de landing overleven."],
    en:["3D-printed shell","Designed and printed by us. Holds every layer in place and has to survive the landing."],tasks:["cad","print"]},
};
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
  renderCrew();renderBoard();renderPart(curPart);hud.phaseNow=null;tick(true);
}
$$(".lang button").forEach(b=>b.addEventListener("click",()=>{lang=b.dataset.lang;try{localStorage.setItem("astix-lang",lang)}catch(e){}applyLang()}));

/* ---------------- avatars ---------------- */
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
  box.innerHTML=NAMES.map(n=>`<button class="patch" type="button" data-n="${n}" aria-pressed="${selCrew===n}" style="--c:${CREW[n].c}">
    ${patchSVG(n)}<span class="pname">${n}</span><span class="prole">${L(CREW[n].nl,CREW[n].en)}</span></button>`).join("");
  $$(".patch",box).forEach(b=>b.addEventListener("click",()=>{selCrew=selCrew===b.dataset.n?null:b.dataset.n;renderCrew()}));
  const out=$("#crew-tasks");
  if(!selCrew){out.innerHTML=`<p class="hint">${L("// kies een patch","// pick a patch")}</p>`;return}
  const mine=TASKS.filter(t=>whoOf(t).includes(selCrew));
  out.innerHTML=`<div class="box" style="--c:${CREW[selCrew].c}"><h3>${selCrew} · ${mine.length} ${L("taken","tasks")}</h3><ul>${
    mine.map(t=>`<li>${L(t.nl,t.en)}<span>${L(GROUPS.find(g=>g.id===t.g).nl,GROUPS.find(g=>g.id===t.g).en)}</span></li>`).join("")}</ul></div>`;
}

/* ---------------- mission board ---------------- */
let filter=null;
function renderBoard(){
  const f=$("#filters"),b=$("#board");if(!f||!b)return;
  f.innerHTML=`<button type="button" data-n="" aria-pressed="${!filter}"><span class="dot" style="--c:#8fa3c8"></span>${L("Iedereen","Everyone")}</button>`+
    NAMES.map(n=>`<button type="button" data-n="${n}" aria-pressed="${filter===n}"><span class="dot" style="--c:${CREW[n].c}"></span>${n}</button>`).join("");
  $$("button",f).forEach(x=>x.addEventListener("click",()=>{filter=x.dataset.n||null;renderBoard()}));
  b.classList.toggle("filtering",!!filter);
  b.innerHTML=GROUPS.map(g=>{
    const ts=TASKS.filter(t=>t.g===g.id);
    return `<div class="col"><h3>${L(g.nl,g.en)}<small>${ts.length}</small></h3>${ts.map(t=>{
      const all=t.who===ALL,hit=filter&&whoOf(t).includes(filter);
      return `<div class="card${all?" all":""}${hit?" hit":""}"><span>${L(t.nl,t.en)}</span><span class="avs">${all?L("HELE CREW","WHOLE CREW"):t.who.map(av).join("")}</span></div>`;
    }).join("")}</div>`;
  }).join("");
}

/* ---------------- exploded CanSat ---------------- */
let curPart=null;
const explode=$(".explode"),layersEl=$("#layers");
function renderPart(p){
  if(!p)return;
  const d=PARTS[p];
  $("#part-k").textContent=d.k;
  const [t,desc]=d[lang];
  const tt=$("#part-t"),dd=$("#part-d");
  tt.textContent=t;dd.textContent=desc;tt.dataset.nl=d.nl[0];tt.dataset.en=d.en[0];dd.dataset.nl=d.nl[1];dd.dataset.en=d.en[1];
  $("#part-who").innerHTML=d.tasks.map(id=>{const tk=taskById(id);
    return `<div class="who-row"><span class="task">${L(tk.nl,tk.en)}</span><span class="avs">${whoOf(tk).map(av).join("")}</span><span class="av-name">${tk.who===ALL?L("hele crew","whole crew"):tk.who.join(" & ")}</span></div>`}).join("");
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
/* the can starts closed and opens up when you scroll to it */
if(explode&&!reduce){
  explode.classList.add("closed");
  new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting){setTimeout(()=>explode.classList.remove("closed"),250);o.disconnect()}}),{threshold:.45}).observe(explode);
}

/* ---------------- reveal ---------------- */
const rvTargets=$$(".sec-head,.step,.mission,.turb,.explode,.crew,.filters,.board,.specs");
rvTargets.forEach((el,i)=>{el.classList.add("rv");el.style.transitionDelay=(el.classList.contains("step")||el.classList.contains("mission")?(i%3)*0.1:0)+"s"});
if("IntersectionObserver" in window&&!reduce){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.15});
  rvTargets.forEach(el=>io.observe(el));
}else rvTargets.forEach(el=>el.classList.add("in"));

/* ---------------- altimeter HUD ---------------- */
const hud={el:$(".hud"),probe:$("#probe"),alt:$("#alt"),vel:$("#vel"),phase:$("#phase"),lastAlt:1000,lastT:performance.now(),v:0,phaseNow:null};
const secs=$$("[data-phase]");
const navLinks=$$(".nav a");
const ground=$("#ground");
let tops=[],maxScroll=1;
function measure(){tops=secs.map(s=>s.offsetTop);maxScroll=Math.max(1,document.documentElement.scrollHeight-innerHeight)}
measure();addEventListener("resize",measure);addEventListener("load",measure);
if("ResizeObserver" in window)new ResizeObserver(measure).observe(document.body);
let ticking=false;
function tick(force){
  const p=Math.min(1,Math.max(0,scrollY/maxScroll));
  const alt=Math.round(1000*(1-p));
  const now=performance.now(),dt=Math.max(16,now-hud.lastT)/1000;
  const inst=Math.abs(alt-hud.lastAlt)/dt;
  hud.v=hud.v*0.8+Math.min(inst,99)*0.2;
  hud.lastAlt=alt;hud.lastT=now;
  hud.alt.textContent=alt;
  hud.vel.textContent=hud.v.toFixed(1);
  if(hud.probe)hud.probe.style.top=(p*100)+"%";
  // phase: the section whose top is above the middle of the screen
  const mid=scrollY+innerHeight*.5;let cur=null;
  secs.forEach((s,i)=>{if(tops[i]<=mid)cur=s});
  const landed=p>.985;
  const label=landed?L("GELAND","TOUCHDOWN"):cur?(lang==="en"?cur.dataset.phaseEn:cur.dataset.phase):(scrollY<40?"T-0":L("LOSGELATEN","RELEASED"));
  if(label!==hud.phaseNow||force){hud.phase.textContent=label;hud.phaseNow=label}
  hud.el.classList.toggle("landed",landed);
  ground.classList.toggle("down",landed);
  hud.el.classList.toggle("shake",!landed&&cur&&cur.id==="missie");
  // active menu item
  navLinks.forEach(a=>a.classList.toggle("on",cur&&a.getAttribute("href")==="#"+cur.id));
}
addEventListener("scroll",()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{ticking=false;tick()})},{passive:true});
/* velocity falls back to 0 when you stop scrolling */
setInterval(()=>{if(performance.now()-hud.lastT>200){hud.v*=0.6;if(hud.v<0.05)hud.v=0;hud.vel.textContent=hud.v.toFixed(1)}},120);

/* ---------------- turbulence canvas ---------------- */
(function turbulence(){
  const cv=$("#turb");if(!cv)return;
  const ctx=cv.getContext("2d");let W=0,H=0,dpr=1,parts=[],on=false,raf=0,t=0;
  const mouse={x:-999,y:-999};
  function size(){dpr=Math.min(2,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    parts=Array.from({length:Math.round(W*H/1400)},()=>({x:Math.random()*W,y:Math.random()*H,a:Math.random()}));ctx.fillStyle="#040916";ctx.fillRect(0,0,W,H)}
  function field(x,y){
    const r=x/W;                                   // 0 = calm (left) .. 1 = turbulent (right)
    const k=0.4+r*r*3.2;
    let ang=Math.sin(y*0.012+t*0.6)*0.15*(1-r)+(Math.sin(x*0.02*k+t*1.3)+Math.cos(y*0.023*k-t*1.1)+Math.sin((x+y)*0.011*k+t))*r*r*1.1;
    const dx=x-mouse.x,dy=y-mouse.y,d2=dx*dx+dy*dy;
    if(d2<9000){ang+=Math.atan2(dy,dx)+1.6;}
    return ang;
  }
  function frame(){
    t+=0.016;
    ctx.fillStyle="rgba(4,9,22,0.13)";ctx.fillRect(0,0,W,H);
    for(const p of parts){
      const a=field(p.x,p.y),sp=1.2+p.x/W*1.6;
      const nx=p.x+Math.cos(a)*sp,ny=p.y+Math.sin(a)*sp;
      const r=p.x/W;
      ctx.strokeStyle=`hsla(${215-r*180},95%,${62+r*8}%,${0.55})`;
      ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(nx,ny);ctx.stroke();
      p.x=nx;p.y=ny;
      if(p.x>W||p.y<0||p.y>H||p.x<0||Math.random()<0.004){p.x=Math.random()*W*0.15;p.y=Math.random()*H}
    }
    if(on)raf=requestAnimationFrame(frame);
  }
  cv.addEventListener("pointermove",e=>{const b=cv.getBoundingClientRect();mouse.x=e.clientX-b.left;mouse.y=e.clientY-b.top});
  cv.addEventListener("pointerleave",()=>{mouse.x=mouse.y=-999});
  size();addEventListener("resize",()=>{size()});
  if(reduce){for(let i=0;i<120;i++)frame();return}
  new IntersectionObserver(es=>{on=es[0].isIntersecting;if(on){cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)}}).observe(cv);
})();

$("#year").textContent=new Date().getFullYear();
applyLang();
})();
