(function(){
const VERT_SRC=`#version 300 es
in vec2 a_pos;
void main(){ gl_Position=vec4(a_pos,0,1); }
`;
const FRAG_SRC=`#version 300 es
precision highp float;
uniform float uTime;
uniform vec2  uRes;
out vec4 fragColor;

vec3 oklab2rgb(vec3 lab){
  float l_=lab.x+0.3963377774*lab.y+0.2158037573*lab.z;
  float m_=lab.x-0.1055613458*lab.y-0.0638541728*lab.z;
  float s_=lab.x-0.0894841775*lab.y-1.2914855480*lab.z;
  float l=l_*l_*l_, m=m_*m_*m_, s=s_*s_*s_;
  return vec3(
     4.0767416621*l-3.3077115913*m+0.2309699292*s,
    -1.2684380046*l+2.6097574011*m-0.3413193965*s,
    -0.0041960863*l-0.7034186147*m+1.7076147010*s);
}

float blob(vec2 uv, vec2 center, float r){
  return exp(-dot(uv-center,uv-center)*r);
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float t  = uTime * 0.20;
  float asp= uRes.x / uRes.y;
  vec2  p  = vec2(uv.x*asp, uv.y);

  // 7 blobs — slightly larger radii, faster drift
  float b1=blob(p,vec2(0.18*asp+sin(t*0.65)*0.32*asp, 0.28+cos(t*0.50)*0.26), 2.6);
  float b2=blob(p,vec2(0.72*asp+cos(t*0.42)*0.28*asp, 0.72+sin(t*0.58)*0.24), 2.4);
  float b3=blob(p,vec2(0.50*asp+sin(t*0.88)*0.38*asp, 0.50+cos(t*0.76)*0.32), 2.2);
  float b4=blob(p,vec2(0.88*asp+cos(t*0.52)*0.20*asp, 0.18+sin(t*0.68)*0.22), 3.0);
  float b5=blob(p,vec2(0.12*asp+sin(t*0.60)*0.22*asp, 0.82+cos(t*0.42)*0.20), 2.8);
  float b6=blob(p,vec2(0.55*asp+cos(t*1.05)*0.30*asp, 0.12+sin(t*0.85)*0.18), 2.3);
  float b7=blob(p,vec2(0.38*asp+sin(t*0.72)*0.25*asp, 0.62+cos(t*0.95)*0.25), 2.5);

  vec3 col  = vec3(0.0);
  float tot = 0.0;

  // Oklab colors — pushed higher L (brightness 0.90+) for airy feel
  col += b1 * vec3(0.93, 0.10, 0.05);  tot+=b1; // bright coral
  col += b2 * vec3(0.91,-0.07,-0.12);  tot+=b2; // bright sky
  col += b3 * vec3(0.93,-0.11, 0.05);  tot+=b3; // bright mint
  col += b4 * vec3(0.92, 0.04,-0.10);  tot+=b4; // bright lavender
  col += b5 * vec3(0.95, 0.05, 0.07);  tot+=b5; // bright peach
  col += b6 * vec3(0.94, 0.01, 0.10);  tot+=b6; // bright gold
  col += b7 * vec3(0.91,-0.05,-0.08);  tot+=b7; // bright periwinkle

  if(tot > 0.001) col /= tot;

  // near-white base in oklab
  vec3 base = vec3(0.990, 0.001, 0.001);

  // lower strength cap → colors stay pastel, never oversaturate
  float strength = clamp(tot * 0.45, 0.0, 0.30);
  vec3 final = mix(base, col, strength);

  vec3 rgb = clamp(oklab2rgb(final), 0.0, 1.0);

  // barely-there vignette
  vec2 vc = uv*2.0-1.0;
  float vig = 1.0 - 0.10*dot(vc,vc);

  fragColor = vec4(rgb*vig, 1.0);
}
`;
const canvas = document.createElement('canvas');
canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:0;';
document.body.appendChild(canvas);

const gl = canvas.getContext('webgl2');
if(!gl){ canvas.style.display='none'; document.body.style.background='linear-gradient(135deg,#FEF0E7 0%,#EFF6FF 50%,#F0FDF4 100%)'; }

function compile(type, src){
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if(!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    console.error(gl.getShaderInfoLog(s));
  return s;
}

const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER,   VERT_SRC));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG_SRC));
gl.linkProgram(prog);
gl.useProgram(prog);

const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(prog, 'a_pos');
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

const uTime = gl.getUniformLocation(prog, 'uTime');
const uRes  = gl.getUniformLocation(prog, 'uRes');

function resize(){
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener('resize', resize);
resize();

let start = null;
function frame(ts){
  if(document.hidden){requestAnimationFrame(frame);return;}
  if(!start) start = ts;
  gl.uniform1f(uTime, (ts-start)*0.001);
  gl.uniform2f(uRes, canvas.width, canvas.height);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

canvas.id = 'aurora-canvas';
})();
