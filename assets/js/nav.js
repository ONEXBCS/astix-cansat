/* ASTIX · top bar: sliding pill, scroll progress, phone menu, and a jump cut for far links */
(function(){
"use strict";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const root=document.documentElement;
const bar=$(".bar"),nav=$("#nav"),pill=$(".nav-pill"),links=$$(".nav a"),prog=$(".bar-progress i");
const burger=$(".burger"),menu=$("#mnav"),mlinks=$$(".mnav a[href^='#']");

/* --- pill that glides to the hovered or active link --- */
let hover=null;
function placePill(){
  if(!pill)return;
  const a=hover||links.find(l=>l.classList.contains("on"));
  if(!a||!nav.offsetParent){pill.style.opacity="0";return}
  pill.style.opacity="1";
  pill.style.width=a.offsetWidth+"px";
  pill.style.transform=`translateX(${a.offsetLeft}px)`;
  pill.classList.toggle("ghost",!!hover&&!hover.classList.contains("on"));
}
links.forEach(a=>{
  a.addEventListener("pointerenter",()=>{hover=a;placePill()});
  a.addEventListener("pointerleave",()=>{hover=null;placePill()});
});
// main.js sets .on while scrolling; follow it and mirror it in the phone menu
new MutationObserver(()=>{
  placePill();
  const on=links.find(l=>l.classList.contains("on"));
  mlinks.forEach(m=>m.classList.toggle("on",!!on&&m.getAttribute("href")===on.getAttribute("href")));
}).observe(nav,{subtree:true,attributes:true,attributeFilter:["class"]});
addEventListener("resize",placePill);
document.fonts&&document.fonts.ready.then(placePill);
// language switch changes the link widths
$$(".lang button").forEach(b=>b.addEventListener("click",()=>requestAnimationFrame(placePill)));

/* --- scroll progress + compact bar --- */
let ticking=false;
function onScroll(){
  if(ticking)return;ticking=true;
  requestAnimationFrame(()=>{
    ticking=false;
    const max=Math.max(1,root.scrollHeight-innerHeight),p=Math.min(1,scrollY/max);
    if(prog)prog.style.transform=`scaleX(${p})`;
    bar.classList.toggle("scrolled",scrollY>30);
  });
}
addEventListener("scroll",onScroll,{passive:true});onScroll();

/* --- phone menu --- */
function setMenu(open){
  if(!burger)return;
  burger.setAttribute("aria-expanded",String(open));
  bar.classList.toggle("menu-open",open);
  document.body.classList.toggle("no-scroll",open);
}
burger&&burger.addEventListener("click",()=>setMenu(burger.getAttribute("aria-expanded")!=="true"));
addEventListener("keydown",e=>{if(e.key==="Escape")setMenu(false)});
addEventListener("resize",()=>{if(innerWidth>760)setMenu(false)});
menu&&menu.addEventListener("click",e=>{if(e.target===menu)setMenu(false)});

/* --- jumping far: go straight there instead of scrolling the whole flight backwards --- */
function go(target){
  const y=target.getBoundingClientRect().top+scrollY;
  const far=Math.abs(y-scrollY)>innerHeight*1.3;
  root.style.scrollBehavior="auto";
  scrollTo({top:y,behavior:far||reduce?"auto":"smooth"});
  root.style.scrollBehavior="";
}
document.addEventListener("click",e=>{
  const a=e.target.closest&&e.target.closest('a[href^="#"]');
  if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey)return;
  const id=a.getAttribute("href").slice(1);
  const t=id?document.getElementById(id):null;
  if(!t)return;
  e.preventDefault();
  const wasMenu=bar.classList.contains("menu-open");
  setMenu(false);
  setTimeout(()=>go(t),wasMenu?220:0);
  history.replaceState(null,"","#"+id);
});

placePill();
})();
