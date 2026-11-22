/* ASTIX · hero: our CanSat in 3D, hanging under its parachute high above the Earth */
import * as THREE from "./vendor/three.module.min.js";

const canvas = document.getElementById("hero3d");
const hero = document.getElementById("start");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

function webglOK() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
}
if (!canvas || !webglOK()) {
  hero && hero.classList.add("no3d");
} else {
  start().catch(() => hero.classList.add("no3d"));
}

async function start() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(matchMedia("(pointer:coarse)").matches ? 1.5 : 1.75, devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 400);
  camera.position.set(0, 0.3, 8);

  /* --- environment for the metal reflections: a soft sky, warm sun, dark earth below --- */
  {
    const c = document.createElement("canvas"); c.width = 512; c.height = 256;
    const g = c.getContext("2d");
    const sky = g.createLinearGradient(0, 0, 0, 256);
    sky.addColorStop(0, "#0b1430"); sky.addColorStop(.45, "#2c4777"); sky.addColorStop(.52, "#9db6dc"); sky.addColorStop(.58, "#1b2a44"); sky.addColorStop(1, "#05070d");
    g.fillStyle = sky; g.fillRect(0, 0, 512, 256);
    const sun = g.createRadialGradient(380, 92, 0, 380, 92, 70); sun.addColorStop(0, "rgba(255,244,220,1)"); sun.addColorStop(1, "rgba(255,244,220,0)");
    g.fillStyle = sun; g.fillRect(0, 0, 512, 256);
    const tex = new THREE.CanvasTexture(c); tex.mapping = THREE.EquirectangularReflectionMapping; tex.colorSpace = THREE.SRGBColorSpace;
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromEquirectangular(tex).texture;
    tex.dispose(); pm.dispose();
  }

  /* --- lights --- */
  const sunLight = new THREE.DirectionalLight(0xfff0dc, 2.6); sunLight.position.set(6, 4, 6); scene.add(sunLight);
  const rim = new THREE.DirectionalLight(0x86a6e0, 1.3); rim.position.set(-6, 1.5, -5); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0x9fb6dd, 0x0a1020, 0.35));

  /* --- stars --- */
  {
    const n = 1800, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 90 + Math.random() * 60, th = Math.random() * Math.PI * 2, ph = Math.acos(Math.random() * 1.6 - .6);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th); pos[i * 3 + 1] = r * Math.cos(ph); pos[i * 3 + 2] = -Math.abs(r * Math.sin(ph) * Math.sin(th)) - 20;
      const b = .45 + Math.random() * .55, warm = Math.random() < .15;
      col[i * 3] = b * (warm ? 1 : .9); col[i * 3 + 1] = b * (warm ? .92 : .95); col[i * 3 + 2] = b * (warm ? .82 : 1);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: .22, vertexColors: true, transparent: true, opacity: .9, depthWrite: false })));
  }

  /* --- the Earth below, night side with city lights and a thin atmosphere --- */
  const earth = new THREE.Group(); scene.add(earth);
  const R = 34;
  earth.position.set(0, -R - 3.2, -16);
  {
    const ground = new THREE.Mesh(new THREE.SphereGeometry(R, 128, 96),
      new THREE.MeshStandardMaterial({ color: 0x0c1830, roughness: .95, metalness: 0 }));
    earth.add(ground);
    // city lights: clusters on the side facing us (roughly where Western Europe would be)
    const n = 2600, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    const centres = [[.0, .0, 1.4], [.12, .05, .9], [-.1, .08, 1], [.22, -.05, .7], [-.25, .02, .6], [.05, .16, .8], [-.05, -.1, .9], [.34, .1, .5]];
    for (let i = 0; i < n; i++) {
      const c = centres[i % centres.length], s = .06 * c[2];
      const lon = c[0] + (Math.random() + Math.random() + Math.random() - 1.5) * s * 2.2;
      const lat = .26 + c[1] + (Math.random() + Math.random() + Math.random() - 1.5) * s * 1.4;
      const x = Math.sin(lon) * Math.cos(lat), y = Math.sin(lat), z = Math.cos(lon) * Math.cos(lat);
      // rotate so lat .26 faces the camera near the limb
      const yy = y * Math.cos(-1.05) - z * Math.sin(-1.05), zz = y * Math.sin(-1.05) + z * Math.cos(-1.05);
      pos[i * 3] = x * (R + .02); pos[i * 3 + 1] = yy * (R + .02); pos[i * 3 + 2] = zz * (R + .02);
      const b = .5 + Math.random() * .5; col[i * 3] = b; col[i * 3 + 1] = b * .78; col[i * 3 + 2] = b * .48;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    earth.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: .07, vertexColors: true, transparent: true, opacity: .85, depthWrite: false })));
    // atmosphere: a fresnel rim, kept soft
    const atm = new THREE.Mesh(new THREE.SphereGeometry(R * 1.035, 96, 64), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
      uniforms: { c: { value: new THREE.Color(0x6f95d0) } },
      vertexShader: "varying vec3 vN;varying vec3 vP;void main(){vN=normalize(normalMatrix*normal);vec4 p=modelViewMatrix*vec4(position,1.);vP=p.xyz;gl_Position=projectionMatrix*p;}",
      fragmentShader: "uniform vec3 c;varying vec3 vN;varying vec3 vP;void main(){float f=pow(1.-abs(dot(normalize(-vP),vN)),3.2);gl_FragColor=vec4(c,f*.75);}"
    }));
    earth.add(atm);
  }

  /* --- textures for the can and the parachute --- */
  try { await Promise.race([document.fonts.load("700 60px Michroma"), new Promise(r => setTimeout(r, 1500))]); } catch (e) {}
  const logo = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = "assets/img/astix-logo.webp"; });

  function labelTexture() {
    const W = 2048, H = 1024, c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d");
    // brushed aluminium
    const base = g.createLinearGradient(0, 0, 0, H); base.addColorStop(0, "#d9dde4"); base.addColorStop(.5, "#c3c8d1"); base.addColorStop(1, "#d6dae1");
    g.fillStyle = base; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 2400; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? "255,255,255" : "90,98,112"},${Math.random() * .08})`; g.fillRect(0, Math.random() * H, W, 1); }
    // dark navy wrap with the logo
    g.fillStyle = "#0f1a33"; g.fillRect(0, H * .2, W, H * .6);
    g.fillStyle = "#4c78bf"; g.fillRect(0, H * .2, W, 14); g.fillRect(0, H * .8 - 14, W, 14);
    const cx = W * .15;
    if (logo) { const sz = H * .3; g.save(); g.beginPath(); g.arc(cx, H * .4, sz / 2, 0, Math.PI * 2); g.clip(); g.drawImage(logo, cx - sz / 2, H * .4 - sz / 2, sz, sz); g.restore(); }
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "#f1efe9"; g.font = "400 84px Michroma, sans-serif"; g.fillText("ASTIX", cx, H * .66);
    g.font = "700 28px JetBrains Mono, monospace"; g.fillStyle = "#93b1dc"; g.fillText("CANSAT BELGIUM", cx, H * .735);
    // the other side: names of the crew, vertical rhythm
    g.textAlign = "left"; g.font = "700 40px JetBrains Mono, monospace"; g.fillStyle = "#93b1dc";
    ["ALESSIO", "SAM", "THOMAS", "ILCO", "XENO"].forEach((n, i) => g.fillText(n, W * .55, H * (.3 + i * .1)));
    g.fillStyle = "#e0915a"; g.fillRect(W * .52, H * .27, 6, H * .46);
    g.font = "700 30px JetBrains Mono, monospace"; g.fillStyle = "#59709a"; g.fillText("2026–27 · ESERO", W * .78, H * .5);
    // small print on the back side
    g.fillStyle = "#59607033"; g.font = "700 34px JetBrains Mono, monospace";
    g.fillText("33 cl · 66 × 115 mm · 300–360 g", W * .02, H * .12); g.fillText("TEAM: A · S · T · I · X", W * .55, H * .9);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  function canopyTexture() {
    const W = 1024, H = 256, c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d"), gores = 12;
    for (let i = 0; i < gores; i++) { g.fillStyle = i % 2 ? "#f1efe9" : "#3f69ad"; g.fillRect(i * W / gores, 0, W / gores + 1, H); }
    const sh = g.createLinearGradient(0, 0, 0, H); sh.addColorStop(0, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,0,0,.18)");
    g.fillStyle = sh; g.fillRect(0, 0, W, H);
    for (let i = 0; i <= gores; i++) { g.fillStyle = "rgba(20,30,50,.25)"; g.fillRect(i * W / gores - 1, 0, 2, H); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  /* --- the CanSat --- */
  const sat = new THREE.Group(); scene.add(sat);
  const can = new THREE.Group(); sat.add(can);
  const r = .33, h = 1.15;
  const metal = new THREE.MeshStandardMaterial({ color: 0xc9ced6, metalness: 1, roughness: .28 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 96, 1, true), new THREE.MeshStandardMaterial({ map: labelTexture(), metalness: .55, roughness: .38 }));
  can.add(body);
  const capGeo = new THREE.CylinderGeometry(r * .96, r * .96, .05, 96);
  const top = new THREE.Mesh(capGeo, metal); top.position.y = h / 2; can.add(top);
  const bot = new THREE.Mesh(capGeo, metal); bot.position.y = -h / 2; can.add(bot);
  const ringGeo = new THREE.TorusGeometry(r * .97, .018, 12, 96);
  for (const y of [h / 2 + .02, -h / 2 - .02]) { const ring = new THREE.Mesh(ringGeo, metal); ring.rotation.x = Math.PI / 2; ring.position.y = y; can.add(ring); }
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .42, 8), metal); ant.position.set(.14, h / 2 + .22, 0); can.add(ant);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(.025, 16, 12), new THREE.MeshStandardMaterial({ color: 0xcc6b5c, emissive: 0x551b14, roughness: .4 })); tip.position.set(.14, h / 2 + .44, 0); can.add(tip);
  const eye = new THREE.Mesh(new THREE.TorusGeometry(.06, .012, 8, 24), metal); eye.position.y = h / 2 + .08; can.add(eye);

  // parachute
  const chute = new THREE.Group(); sat.add(chute);
  const CR = 1.25, THETA = Math.PI * .44, CY = 2.25;
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(CR, 96, 24, 0, Math.PI * 2, 0, THETA),
    new THREE.MeshStandardMaterial({ map: canopyTexture(), side: THREE.DoubleSide, roughness: .85, metalness: 0 }));
  canopy.scale.set(1, .62, 1); canopy.position.y = CY; chute.add(canopy);
  const rimR = CR * Math.sin(THETA), rimY = CY + CR * Math.cos(THETA) * .62;
  const cords = []; const lines = 12;
  for (let i = 0; i < lines; i++) { const a = i / lines * Math.PI * 2; cords.push(Math.cos(a) * rimR, rimY, Math.sin(a) * rimR, 0, h / 2 + .1, 0); }
  const cordGeo = new THREE.BufferGeometry(); cordGeo.setAttribute("position", new THREE.Float32BufferAttribute(cords, 3));
  chute.add(new THREE.LineSegments(cordGeo, new THREE.LineBasicMaterial({ color: 0xd6dce6, transparent: true, opacity: .75 })));

  sat.rotation.y = -.94;

  /* --- layout --- */
  let W = 0, H = 0, wide = true;
  function resize() {
    if (canvas.clientWidth === W && canvas.clientHeight === H && W) return;
    W = canvas.clientWidth; H = canvas.clientHeight; wide = W > 820;
    renderer.setSize(W, H, false); camera.aspect = W / H;
    camera.fov = wide ? 34 : 42; camera.updateProjectionMatrix();
  }
  resize(); addEventListener("resize", resize);

  /* --- interaction --- */
  let mx = 0, my = 0, drag = false, lastX = 0, spin = 0, spinV = 0;
  addEventListener("pointermove", e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; if (drag) { spinV = (e.clientX - lastX) * .01; lastX = e.clientX; } }, { passive: true });
  canvas.addEventListener("pointerdown", e => { drag = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); hero.classList.add("dragged"); });
  addEventListener("pointerup", () => { drag = false; });

  /* --- animate --- */
  const t0 = performance.now(); let on = true, raf = 0;
  function frame() {
    const t = (performance.now() - t0) / 1000;
    const p = Math.min(1, Math.max(0, scrollY / Math.max(1, hero.offsetHeight)));
    // intro: the CanSat drops in and the canopy opens
    const intro = reduce ? 1 : Math.min(1, t / 2.2), e = 1 - Math.pow(1 - intro, 3);
    const open = reduce ? 1 : Math.min(1, Math.max(0, (t - .5) / 1.4));
    const ob = 1 - Math.pow(1 - open, 3) * Math.cos(open * 9) * (1 - open);
    canopy.scale.set(.35 + .65 * ob, .62 * (.4 + .6 * ob), .35 + .65 * ob);
    const vh = 2 * 8 * Math.tan(camera.fov * Math.PI / 360), vw = vh * camera.aspect;
    const ms = Math.min(1.35, vh * .95 / 3.65, vw * .85 / 2.55);
    const baseX = wide ? vw * .37 / 2 : 0, baseY = wide ? -1.05 : -1.2 * ms - .05;
    sat.position.set(baseX + mx * .25, baseY + (1 - e) * 4 + Math.sin(t * .9) * .08 + p * 2.2, 0);
    // swinging under the canopy like a real payload
    sat.rotation.z = Math.sin(t * .85) * .06 + mx * .05;
    sat.rotation.x = Math.sin(t * .6 + 1) * .04 - my * .05;
    spinV *= .95; spin += spinV + (drag ? 0 : .0025);
    sat.rotation.y = -.94 + spin;
    sat.scale.setScalar(wide ? .9 : ms);
    earth.rotation.y = t * .004; earth.position.y = -R - 3.2 - p * 3;
    camera.position.x = mx * .5; camera.position.y = .3 - my * .3 + p * .8; camera.lookAt(0, p * .6, 0);
    canvas.style.opacity = String(1 - p * .85);
    renderer.render(scene, camera);
    if (on && !reduce) raf = requestAnimationFrame(frame);
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(es => { on = es[0].isIntersecting; cancelAnimationFrame(raf); if (on) raf = requestAnimationFrame(frame); }).observe(hero);
  }
  frame();
  if (reduce) addEventListener("scroll", () => requestAnimationFrame(frame), { passive: true });
  hero.classList.add("ready3d");
}
