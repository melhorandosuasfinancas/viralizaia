"use client";
import { useEffect, useRef } from "react";

const VS = `
  attribute vec4 aVertexPosition;
  void main() { gl_Position = aVertexPosition; }
`;

const FS = `
  precision highp float;
  uniform vec2 iResolution;
  uniform float iTime;

  const float overallSpeed = 0.2;
  const float gridSmoothWidth = 0.015;
  const float axisWidth = 0.05;
  const float majorLineWidth = 0.025;
  const float minorLineWidth = 0.0125;
  const float majorLineFrequency = 5.0;
  const float minorLineFrequency = 1.0;
  const float scale = 5.0;
  const vec4 lineColor = vec4(0.4, 0.2, 0.8, 1.0);
  const float minLineWidth = 0.01;
  const float maxLineWidth = 0.2;
  const float lineSpeed = 1.0 * overallSpeed;
  const float lineAmplitude = 1.0;
  const float lineFrequency = 0.2;
  const float warpSpeed = 0.2 * overallSpeed;
  const float warpFrequency = 0.5;
  const float warpAmplitude = 1.0;
  const float offsetFrequency = 0.5;
  const float offsetSpeed = 1.33 * overallSpeed;
  const float minOffsetSpread = 0.6;
  const float maxOffsetSpread = 2.0;
  const int linesPerGroup = 16;

  #define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
  #define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
  #define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))

  float random(float t) {
    return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
  }

  float getPlasmaY(float x, float hFade, float offset) {
    return random(x * lineFrequency + iTime * lineSpeed) * hFade * lineAmplitude + offset;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 space = (gl_FragCoord.xy - iResolution.xy / 2.0) / iResolution.x * 2.0 * scale;

    float hFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);
    float vFade = 1.0 - (cos(uv.y * 6.28) * 0.5 + 0.5);

    space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + hFade);
    space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * hFade;

    vec4 lines = vec4(0.0);
    vec4 bgColor1 = vec4(0.04, 0.04, 0.14, 1.0);
    vec4 bgColor2 = vec4(0.12, 0.04, 0.22, 1.0);

    for (int l = 0; l < linesPerGroup; l++) {
      float nli = float(l) / float(linesPerGroup);
      float offsetTime = iTime * offsetSpeed;
      float offsetPos = float(l) + space.x * offsetFrequency;
      float rand = random(offsetPos + offsetTime) * 0.5 + 0.5;
      float halfWidth = mix(minLineWidth, maxLineWidth, rand * hFade) / 2.0;
      float offset = random(offsetPos + offsetTime * (1.0 + nli)) * mix(minOffsetSpread, maxOffsetSpread, hFade);
      float linePos = getPlasmaY(space.x, hFade, offset);
      float line = drawSmoothLine(linePos, halfWidth, space.y) / 2.0
                 + drawCrispLine(linePos, halfWidth * 0.15, space.y);

      float cx = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
      vec2 cp = vec2(cx, getPlasmaY(cx, hFade, offset));
      float circle = drawCircle(cp, 0.01, space) * 4.0;

      lines += (line + circle) * lineColor * rand;
    }

    vec4 color = mix(bgColor1, bgColor2, uv.x);
    color *= vFade;
    color.a = 1.0;
    color += lines;
    gl_FragColor = color;
  }
`;

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    function loadShader(type: number, src: string): WebGLShader | null {
      const s = gl!.createShader(type);
      if (!s) return null;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        gl!.deleteShader(s);
        return null;
      }
      return s;
    }

    const vs = loadShader(gl.VERTEX_SHADER, VS);
    const fs = loadShader(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

    const buf = gl.createBuffer();
    if (!buf) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(prog, "aVertexPosition");
    const resLoc = gl.getUniformLocation(prog, "iResolution");
    const timeLoc = gl.getUniformLocation(prog, "iTime");

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }
    window.addEventListener("resize", resize);
    resize();

    let raf: number;
    const t0 = Date.now();
    function render() {
      const t = (Date.now() - t0) / 1000;
      gl!.clearColor(0, 0, 0, 1);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.useProgram(prog);
      gl!.uniform2f(resLoc, canvas!.width, canvas!.height);
      gl!.uniform1f(timeLoc, t);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, buf);
      gl!.vertexAttribPointer(posLoc, 2, gl!.FLOAT, false, 0, 0);
      gl!.enableVertexAttribArray(posLoc);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    }
    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
}
