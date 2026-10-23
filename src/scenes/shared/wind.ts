// Wind for instanced vegetation: a vertex-shader patch on standard materials.
// Sway grows with local height (uSwayStart..uSwayRange) so trunks stay planted and crowns move.
import * as THREE from 'three';

export interface WindUniforms {
  uTime: { value: number };
  uWind: { value: number };
  uSwayStart: { value: number };
  uSwayRange: { value: number };
  uFlutter: { value: number };
}

export function makeWindUniforms(wind = 0.25, swayStart = 0, swayRange = 8, flutter = 0): WindUniforms {
  return { uTime: { value: 0 }, uWind: { value: wind }, uSwayStart: { value: swayStart }, uSwayRange: { value: swayRange }, uFlutter: { value: flutter } };
}

export function applyWind(material: THREE.Material, uniforms: WindUniforms) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
        uniform float uTime; uniform float uWind; uniform float uSwayStart; uniform float uSwayRange; uniform float uFlutter;`)
      .replace('#include <begin_vertex>', `
        vec3 transformed = vec3(position);
        #ifdef USE_INSTANCING
          vec4 wp4 = modelMatrix * instanceMatrix * vec4(position, 1.0);
        #else
          vec4 wp4 = modelMatrix * vec4(position, 1.0);
        #endif
        float wWeight = clamp((position.y - uSwayStart) / max(uSwayRange, 0.001), 0.0, 1.0);
        float ph = uTime * 0.85 + wp4.x * 0.17 + wp4.z * 0.12;
        float sw = (sin(ph) * 0.7 + sin(ph * 2.31 + 1.3) * 0.3) * uWind * wWeight;
        transformed.x += sw;
        transformed.z += sw * 0.45;
        transformed.y -= abs(sw) * 0.08;
        transformed += normal * sin(uTime * 3.1 + wp4.x * 2.3 + wp4.y * 1.7) * uFlutter * wWeight;
      `);
  };
  // force a unique program per uniform set
  material.customProgramCacheKey = () => 'wind' + uniforms.uSwayStart.value + '-' + uniforms.uSwayRange.value + '-' + uniforms.uFlutter.value;
}

/** Deterministic RNG (mulberry32) so the forest is the same for every visitor. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
