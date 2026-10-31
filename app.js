const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]
const body = document.body, bar = $('#bar'), log = $('#log'), cv = $('#cv')

const FS = {
  '/': ['projects', 'about_me.txt', 'contact.txt'],
  '/projects': ['digital-store.txt', 'figma-redesign.txt'],
  '/about_me.txt': 'Angelica Dornton. Web developer and designer, Edgefield SC (originally Kuwait). ICSA Kuwait: full-stack web + graphic design. Linux Mint at home.',
  '/contact.txt': 'aj-dornton@proton.me\ngithub.com/eliutot\nbehance.net/angelicadornton\nfigma.com/@dornton',
  '/projects/digital-store.txt': 'PHP + MySQL store: auth, product CRUD, admin dashboard. ICSA Kuwait.',
  '/projects/figma-redesign.txt': 'Figma redesign of an existing app. 2026, solo.'
}
const VIEW = { '/': 'hero', '/projects': 'work', '/about_me.txt': 'about', '/contact.txt': 'contact', '/projects/digital-store.txt': 'work', '/projects/figma-redesign.txt': 'work' }

let cwd = '/', clean = false, want = !matchMedia('(prefers-reduced-motion:reduce)').matches
let low = false, fps = 60, sweep = -1, vel = 0, fx = want
const st = { hover: '-', scroll: 0 }

const paint = () => { bar.textContent = `[NORMAL] > HOVER: ${st.hover} // SCROLL_Y: ${st.scroll}% // FPS: ${fps} // FX: ${fx ? 'ON' : low ? 'OFF (LOW FPS)' : 'OFF'}` }
const sync = () => { fx = want && !clean && !low; $('#grid').hidden = $('#noise').hidden = !fx; paint() }
const out = (t, c) => { const d = document.createElement('div'); if (c) d.className = c; d.textContent = t; log.append(d); log.scrollTop = log.scrollHeight }
const setView = id => { $$('.view').forEach(v => { v.hidden = v.id !== id }); cv.scrollTop = 0 }
const show = p => VIEW[p] && setView(VIEW[p])
const res = a => {
  if (!a) return cwd
  if (a === '~') return '/'
  const p = (a[0] === '/' ? a : cwd + '/' + a).split('/').reduce((o, s) => (s === '..' ? o.pop() : s && s !== '.' && o.push(s), o), [])
  return '/' + p.join('/')
}

const toggle = () => {
  const go = () => {
    clean = !clean
    body.classList.toggle('clean', clean)
    $('#tg').textContent = clean ? 'chaos mode' : 'clean mode'
    sweep = -1
    clean ? $$('.view').forEach(v => { v.hidden = false }) : setView('hero')
    sync()
  }
  if (clean || !fx) return go()
  const t0 = performance.now()
  const step = t => { const k = (t - t0) / 600; sweep = Math.min(k, 1); k < 1 ? requestAnimationFrame(step) : go() }
  requestAnimationFrame(step)
}

const CMD = new Map([
  ['help', () => out('help  ls  cd  cat  pwd  whoami  clear  clean  fx [on|off]')],
  ['ls', a => { const n = FS[res(a[0])]; out(Array.isArray(n) ? n.join('  ') : n === undefined ? 'ls: no such path' : res(a[0])) }],
  ['cd', a => { const p = res(a[0] || '~'); if (Array.isArray(FS[p])) { cwd = p; $('#ps').textContent = p; show(p) } else out('cd: not a directory') }],
  ['cat', a => { const n = FS[res(a[0])]; typeof n === 'string' ? (out(n), show(res(a[0]))) : out('cat: no such file') }],
  ['pwd', () => out(cwd)],
  ['whoami', () => out('visitor')],
  ['clear', () => { log.textContent = '' }],
  ['clean', toggle],
  ['fx', a => { want = a[0] === 'on' ? true : a[0] === 'off' ? false : !want; if (want) low = false; sync() }]
])

// all input is untrusted: strip markup, keep a tiny charset, never evaluate
const run = raw => {
  const s = raw.replace(/<[^>]*>/g, '').replace(/\b(script|eval|function|document|window|alert|constructor|prototype)\b/gi, '').replace(/[^\w\s./~-]/g, '').trim().slice(0, 64)
  if (!s) return
  out('$ ' + s, 'in')
  const [c, ...a] = s.toLowerCase().split(/\s+/)
  const fn = CMD.get(c)
  fn ? fn(a) : out(c + ': command not found. try help')
}

$('#f').addEventListener('submit', e => { e.preventDefault(); run($('#cmd').value); $('#cmd').value = '' })
$$('[data-cmd]').forEach(b => b.addEventListener('click', () => run(b.dataset.cmd)))
$('#tg').addEventListener('click', toggle)
cv.addEventListener('scroll', () => { st.scroll = Math.round(cv.scrollTop / Math.max(1, cv.scrollHeight - cv.clientHeight) * 100); paint() }, { passive: true })
document.addEventListener('pointerover', e => { const t = e.target.closest('[data-s]'); st.hover = t ? t.dataset.s : '-'; paint() })

// cursor + pointer state
const xh = $('#xh'), ptr = { x: 0, y: 0, nx: 0, ny: 0 }
if (matchMedia('(pointer:fine)').matches) body.classList.add('fine')
document.addEventListener('pointermove', e => {
  vel = Math.min(1, vel + Math.hypot(e.clientX - ptr.x, e.clientY - ptr.y) / 120)
  ptr.x = e.clientX; ptr.y = e.clientY
  ptr.nx = e.clientX / innerWidth * 2 - 1; ptr.ny = -(e.clientY / innerHeight) * 2 + 1
  xh.style.transform = `translate(${e.clientX}px,${e.clientY}px)`
}, { passive: true })

// xerox grain: simplex noise, thresholded, row-torn by cursor speed
let gl = null, uni = {}
try {
  gl = $('#noise').getContext('webgl', { antialias: false })
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o }
  const pr = gl.createProgram()
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}'))
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, `precision mediump float;uniform float uT,uV,uS;uniform vec2 uR;
vec3 pm(vec3 x){return mod(((x*34.)+1.)*x,289.);}
float sn(vec2 v){const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);vec2 i=floor(v+dot(v,C.yy)),x0=v-i+dot(i,C.xx),i1=x0.x>x0.y?vec2(1,0):vec2(0,1);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.);vec3 p=pm(pm(i.y+vec3(0,i1.y,1))+i.x+vec3(0,i1.x,1)),m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m;m*=m;vec3 x=2.*fract(p*C.www)-1.,h=abs(x)-.5,a0=x-floor(x+.5);m*=1.79284291400159-.85373472095314*(a0*a0+h*h);vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.*dot(m,g);}
void main(){vec2 uv=gl_FragCoord.xy/uR;if(uS>=0.&&uv.x<uS)discard;
float tear=sn(vec2(floor(uv.y*50.),floor(uT*9.)))*uV*.12;vec2 p=vec2(uv.x+tear,uv.y)*uR*.5;
float n=sn(p*.8+uT*4.)*.6+sn(p*.05+uT*.3)*.4;float g=step(.5,n);
float e=uS>=0.?1.-smoothstep(0.,.006,abs(uv.x-uS)):0.;float a=max(g*.16,e);
gl_FragColor=vec4(mix(vec3(1),vec3(.84,.07,.17),e)*a,a);}`))
  gl.linkProgram(pr); gl.useProgram(pr)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  ;['uT', 'uV', 'uS', 'uR'].forEach(k => { uni[k] = gl.getUniformLocation(pr, k) })
} catch { gl = null }

// 3D grid: intersections bend toward the cursor in the vertex shader
let grid = null
if (window.THREE) {
  const T = THREE, rd = new T.WebGLRenderer({ canvas: $('#grid'), alpha: true })
  const sc = new T.Scene(), cam = new T.PerspectiveCamera(55, 1, .1, 200)
  cam.position.set(0, 7, 14); cam.lookAt(0, 0, -8)
  const N = 40, S = 3, pts = []
  for (let i = -N / 2; i <= N / 2; i++) for (let j = -N / 2; j < N / 2; j++) pts.push(i * S, 0, j * S, i * S, 0, (j + 1) * S, j * S, 0, i * S, (j + 1) * S, 0, i * S)
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pts, 3))
  const u = { uT: { value: 0 }, uM: { value: new T.Vector2(999, 999) } }
  sc.add(new T.LineSegments(geo, new T.ShaderMaterial({
    uniforms: u, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: `uniform vec2 uM;uniform float uT;varying float vA;void main(){vec3 p=position;vec2 d=uM-p.xz;float f=exp(-dot(d,d)*.02);
p.xz+=d*f*.55;p.y+=f*2.2+sin(p.x*.3+uT)*.25;vec4 mv=modelViewMatrix*vec4(p,1.);
vA=clamp(1.-(-mv.z)/90.,0.,1.)*(.35+.3*sin(p.z*.35-uT*2.))+f*.6;gl_Position=projectionMatrix*mv;}`,
    fragmentShader: 'varying float vA;void main(){gl_FragColor=vec4(.84,.07,.17,1.)*vA;}'
  })))
  const ray = new T.Raycaster(), plane = new T.Plane(new T.Vector3(0, 1, 0), 0), hit = new T.Vector3()
  const fit = () => { rd.setPixelRatio(Math.min(devicePixelRatio, 1.5)); rd.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix() }
  fit(); addEventListener('resize', fit)
  grid = t => {
    u.uT.value = t / 1000
    ray.setFromCamera({ x: ptr.nx, y: ptr.ny }, cam)
    if (ray.ray.intersectPlane(plane, hit)) u.uM.value.set(hit.x, hit.z)
    rd.render(sc, cam)
  }
}

// ascii hero: initials sampled from an offscreen canvas, warped near the cursor
const asc = $('#asc'), W = 64, H = 26, RAMP = ' .:-=+*#%@'
const oc = document.createElement('canvas'); oc.width = W; oc.height = H
const cx = oc.getContext('2d', { willReadFrequently: true })
let rows = 0
const drawAscii = t => {
  if (!asc.offsetParent) return
  cx.fillStyle = '#000'; cx.fillRect(0, 0, W, H)
  cx.fillStyle = '#fff'; cx.textAlign = 'center'; cx.textBaseline = 'middle'
  cx.font = `900 ${H * .95}px Archivo, Impact, sans-serif`
  cx.setTransform(1.7, 0, 0, 1, 0, 0); cx.fillText('AD', W / 2 / 1.7, H / 2 + 1); cx.setTransform(1, 0, 0, 1, 0, 0)
  const d = cx.getImageData(0, 0, W, H).data, r = asc.getBoundingClientRect()
  const mx = (ptr.x - r.left) / r.width * W, my = (ptr.y - r.top) / r.height * H
  let s = ''
  for (let y = 0; y < Math.min(rows, H); y++) {
    for (let x = 0; x < W; x++) {
      const k = Math.hypot(x - mx, (y - my) * 2), sx = k < 10 ? Math.round(Math.sin(y * .8 + t / 90) * (10 - k) * .4) : 0
      const l = d[(y * W + Math.min(W - 1, Math.max(0, x + sx))) * 4] / 255
      s += l < .05 ? (Math.random() < .03 ? '.' : ' ') : RAMP[Math.min(9, Math.floor(l * 9.99 - Math.random() * 1.5 * (k < 10)))] || '.'
    }
    s += '\n'
  }
  asc.textContent = s
}
setInterval(() => { rows = Math.min(H, rows + 1); drawAscii(performance.now()) }, 80)

// frame loop + fps safety hatch
let n = 0, last = 0, lowN = 0
const loop = t => {
  requestAnimationFrame(loop)
  n++
  if (t - last >= 1000) {
    fps = n; n = 0; last = t
    lowN = fps < 28 ? lowN + 1 : 0
    if (lowN >= 3 && !low) { low = true; sync() }
    paint()
  }
  if (!fx) return
  vel *= .92
  if (gl) {
    const c = $('#noise'), w = innerWidth >> 1, h = innerHeight >> 1
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; gl.viewport(0, 0, w, h) }
    gl.uniform1f(uni.uT, t / 1000); gl.uniform1f(uni.uV, vel); gl.uniform1f(uni.uS, sweep); gl.uniform2f(uni.uR, w, h)
    gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  grid?.(t)
}
requestAnimationFrame(loop)

// boot
const bootEl = $('#boot'), lines = ['loading modules...', 'mounting /projects', 'compiling shaders', 'identity loaded successfully']
let booted = false
const done = () => { if (booted) return; booted = true; bootEl.hidden = true; sync(); out('type help, or click a command.'); $('#cmd').focus({ preventScroll: true }) }
$('#skip').addEventListener('click', done)
addEventListener('keydown', e => { if (e.key === 'Escape') done() })
lines.forEach((l, i) => setTimeout(() => { if (!booted) $('#bootlog').textContent += '> ' + l + '\n' }, i * 350))
setTimeout(done, lines.length * 350 + 150)
if (!want) done()
