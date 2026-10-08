"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

export type SceneState = { p: number; mx: number; my: number };

const LEN = 190;
const TRAVEL = LEN - 40;
const GOLD = 0xd8b558;
const EMERALD = 0x2f9c62;

export function MallScene({ state }: { state: MutableRefObject<SceneState> }) {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05100b, 0.021);
    const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 400);

    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(o: T) => {
      disposables.push(o);
      return o;
    };

    // Arcos de luz a lo largo del pasillo
    const W = 12;
    const yBot = -4.5;
    const yTop = 7.5;
    const archPts = [
      new THREE.Vector3(-W, yBot, 0),
      new THREE.Vector3(-W, yTop - 2, 0),
      new THREE.Vector3(-W + 2, yTop, 0),
      new THREE.Vector3(W - 2, yTop, 0),
      new THREE.Vector3(W, yTop - 2, 0),
      new THREE.Vector3(W, yBot, 0),
    ];
    const archGeo = track(new THREE.BufferGeometry().setFromPoints(archPts));
    const archMat = track(
      new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending }),
    );
    const archGroup = new THREE.Group();
    for (let z = 0; z > -LEN; z -= 9) {
      const arch = new THREE.Line(archGeo, archMat);
      arch.position.z = z;
      archGroup.add(arch);
    }
    scene.add(archGroup);

    // Barras de luz en el techo
    const barGeo = track(new THREE.BoxGeometry(0.35, 0.12, 5));
    const barMat = track(new THREE.MeshBasicMaterial({ color: 0xf2dc9b }));
    const bars = new THREE.InstancedMesh(barGeo, barMat, 2 * Math.floor(LEN / 9));
    const m = new THREE.Matrix4();
    let k = 0;
    for (let z = -4.5; z > -LEN; z -= 9) {
      for (const x of [-4, 4]) {
        m.makeTranslation(x, yTop + 0.4, z);
        bars.setMatrixAt(k++, m);
      }
    }
    scene.add(bars);

    // Líneas longitudinales (zócalos y cornisas)
    const lineMat = track(
      new THREE.LineBasicMaterial({ color: EMERALD, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending }),
    );
    for (const [x, y] of [[-W, yBot], [W, yBot], [-W, yTop - 2], [W, yTop - 2], [-W + 2, yTop], [W - 2, yTop]] as const) {
      const g = track(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, y, 0), new THREE.Vector3(x, y, -LEN)]));
      scene.add(new THREE.Line(g, lineMat));
    }

    // Piso brillante con rejilla
    const floorMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uCam: { value: 0 } },
        vertexShader: `
          varying vec3 vW;
          void main(){
            vec4 w = modelMatrix * vec4(position,1.0);
            vW = w.xyz;
            gl_Position = projectionMatrix * viewMatrix * w;
          }`,
        fragmentShader: `
          varying vec3 vW;
          uniform float uCam;
          void main(){
            vec2 c = vW.xz / 2.0;
            vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c);
            float line = 1.0 - min(min(g.x, g.y), 1.0);
            float d = abs(vW.z - uCam);
            float fade = exp(-d * 0.02);
            float center = smoothstep(6.0, 0.0, abs(vW.x));
            vec3 col = mix(vec3(0.86, 0.71, 0.34), vec3(0.18, 0.61, 0.38), center);
            float a = (line * 0.6 + center * 0.09) * fade;
            gl_FragColor = vec4(col, a);
          }`,
      }),
    );
    const floorGeo = track(new THREE.PlaneGeometry(W * 2, LEN * 2));
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, yBot, -LEN / 2);
    scene.add(floor);

    // Polvo dorado en suspensión
    const N = 900;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * W * 2;
      pos[i * 3 + 1] = yBot + Math.random() * (yTop - yBot);
      pos[i * 3 + 2] = -Math.random() * LEN;
    }
    const pGeo = track(new THREE.BufferGeometry());
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pMat = track(
      new THREE.PointsMaterial({ color: 0xf2dc9b, size: 0.14, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    const dust = new THREE.Points(pGeo, pMat);
    scene.add(dust);

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    let raf = 0;
    let t0 = performance.now();
    let cx = 0;
    let cy = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const dt = Math.min((now - t0) / 1000, 0.05);
      t0 = now;
      const s = state.current;
      const travel = Math.min(Math.max((s.p - 0.2) / 0.8, 0), 1);
      const z = -(travel * TRAVEL) - s.p * 6;
      cx += (s.mx * 1.6 - cx) * 0.05;
      cy += (s.my * 0.9 - cy) * 0.05;
      camera.position.set(cx, 0.6 + cy, z);
      camera.lookAt(cx * 0.4, 0.5, z - 24);
      floorMat.uniforms.uCam.value = z;

      const arr = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < N; i++) {
        arr[i * 3 + 1] += Math.sin(now * 0.0004 + i) * dt * 0.25;
      }
      pGeo.attributes.position.needsUpdate = true;
      dust.rotation.z = Math.sin(now * 0.0002) * 0.02;

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      disposables.forEach((d) => d.dispose());
      bars.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [state]);

  return <div ref={mount} className="absolute inset-0" aria-hidden />;
}
