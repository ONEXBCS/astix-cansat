/* ASTIX · downlink scene: a packet every second from the can to the ground station (example values) */
(function(){
"use strict";
const scene=document.getElementById("link-scene");if(!scene)return;
const path=document.getElementById("link-path"),svg=path.ownerSVGElement;
const led=document.getElementById("link-led"),rx=document.getElementById("link-rx"),chart=document.getElementById("link-chart");
const out={n:"pkt-n",t:"pkt-t",h:"pkt-h",p:"pkt-p",c:"pkt-c"};for(const k in out)out[k]=document.getElementById(out[k]);
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const NS="http://www.w3.org/2000/svg",len=path.getTotalLength();

let n=0,t=0,h=1000,hist=[],timer=null,visible=false;
const pressure=h=>1013.25*Math.pow(1-2.25577e-5*h,5.2559);
// chart area inside the laptop screen
const X0=890,X1=954,Y0=312,Y1=356,N=40;
function drawChart(){
  const pts=hist.slice(-N).map((v,i,a)=>{
    const x=X0+(a.length<2?0:i/(a.length-1))*(X1-X0),y=Y1-(v/1000)*(Y1-Y0);return x.toFixed(1)+","+y.toFixed(1)});
  chart.setAttribute("points",pts.join(" "));
}
function show(){
  out.n.textContent="#"+String(n).padStart(4,"0");
  out.t.textContent="T+"+t+" s";
  out.h.textContent=Math.max(0,Math.round(h))+" m";
  out.p.textContent=pressure(Math.max(0,h)).toFixed(1)+" hPa";
  out.c.textContent=(12-0.0065*Math.max(0,h)+Math.sin(t*.7)*.15).toFixed(1)+" °C";
  hist.push(Math.max(0,h));drawChart();
}
function fly(){
  if(reduce){show();return}
  const dot=document.createElementNS(NS,"circle");dot.setAttribute("r","3.6");dot.setAttribute("class","l-pkt");svg.appendChild(dot);
  led.classList.remove("blink");void led.getBBox();led.classList.add("blink");
  const start=performance.now(),dur=720;
  (function step(now){
    const k=Math.min(1,(now-start)/dur),e=k*k*(3-2*k),pt=path.getPointAtLength(e*len);
    dot.setAttribute("cx",pt.x);dot.setAttribute("cy",pt.y);
    if(k<1)requestAnimationFrame(step);
    else{dot.remove();rx.classList.remove("hit");void rx.getBBox();rx.classList.add("hit");show()}
  })(start);
}
function tick(){
  if(h<=0){ // landed: wait a moment, then start a new flight
    h=1000;t=0;hist=[];n=0;
  }
  n++;t++;h-=8.5+Math.random()*1.5;
  fly();
}
function run(on){
  if(on&&!timer){timer=setInterval(tick,1000);tick()}
  if(!on&&timer){clearInterval(timer);timer=null}
}
show();
if("IntersectionObserver" in window)new IntersectionObserver(es=>{visible=es[0].isIntersecting;run(visible)},{threshold:.15}).observe(scene);
else run(true);
document.addEventListener("visibilitychange",()=>run(visible&&!document.hidden));
})();
