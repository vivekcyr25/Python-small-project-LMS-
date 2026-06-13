import { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  uniform float u_time;
  uniform vec2 u_resolution;

  float blob(vec2 uv, vec2 center, float radius) {
    float d = length(uv - center);
    return smoothstep(radius, radius * 0.12, d);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= u_resolution.x / u_resolution.y;

    float t = u_time * 0.05;

    vec2 blue1 = vec2(-0.45 + sin(t * 0.6) * 0.08, 0.25 + cos(t * 0.5) * 0.07);
    vec2 blue2 = vec2(0.35 + cos(t * 0.4) * 0.1, -0.15 + sin(t * 0.7) * 0.08);
    vec2 purple1 = vec2(0.1 + sin(t * 0.5 + 1.0) * 0.12, 0.4 + cos(t * 0.6 + 2.0) * 0.07);
    vec2 purple2 = vec2(-0.2 + cos(t * 0.55 + 3.0) * 0.1, -0.45 + sin(t * 0.45) * 0.07);

    float bBlue1 = blob(p, blue1, 0.95);
    float bBlue2 = blob(p, blue2, 0.8);
    float bPurple1 = blob(p, purple1, 0.85);
    float bPurple2 = blob(p, purple2, 0.75);

    // Soft muted navy base
    vec3 base = vec3(0.04, 0.05, 0.11);

    // Desaturated calm blue tones
    vec3 calmBlue = vec3(0.09, 0.14, 0.28);
    vec3 softBlue = vec3(0.12, 0.18, 0.32);

    // Muted lavender-purple tones
    vec3 calmPurple = vec3(0.16, 0.13, 0.26);
    vec3 softLavender = vec3(0.20, 0.17, 0.30);

    vec3 color = base;
    color = mix(color, calmBlue, bBlue1 * 0.28);
    color = mix(color, softBlue, bBlue2 * 0.18);
    color = mix(color, calmPurple, bPurple1 * 0.22);
    color = mix(color, softLavender, bPurple2 * 0.15);

    float wave = sin(p.x * 1.4 + t * 0.8) * cos(p.y * 1.2 - t * 0.6) * 0.02;
    color += vec3(0.04, 0.06, 0.12) * wave;

    float glow = exp(-length(p) * 0.7) * 0.06;
    color += vec3(0.08, 0.10, 0.20) * glow;

    float vignette = 1.0 - length(p) * 0.22;
    color *= clamp(vignette, 0.72, 1.0);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vs: string, fs: string) {
  const vert = createShader(gl, gl.VERTEX_SHADER, vs);
  const frag = createShader(gl, gl.FRAGMENT_SHADER, fs);
  if (!vert || !frag) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

const LiquidGlassShader = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return;

    const program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    if (!program) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const posLoc = gl.getAttribLocation(program, 'a_position');
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    const start = performance.now();
    const render = (now: number) => {
      const t = (now - start) / 1000;
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(timeLoc, t);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="liquid-shader-container" aria-hidden="true">
      <div className="liquid-shader-fallback" />
      <canvas ref={canvasRef} className="liquid-shader-canvas" />
      <div className="liquid-shader-noise" />
      <div className="liquid-shader-calm" />
      <div className="liquid-shader-specular" />
    </div>
  );
};

export default LiquidGlassShader;
