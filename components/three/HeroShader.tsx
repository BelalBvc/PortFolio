'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { ScrollTrigger } from '@/lib/gsap'

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uAmp;
  varying vec3 vNormal;
  varying float vDisp;

  vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
  vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
  vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1./6.,1./3.); const vec4 D=vec4(0.,.5,1.,2.);
    vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
    float n_=.142857142857; vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.*x_);
    vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.+1.; vec4 s1=floor(b1)*2.+1.; vec4 sh=-step(h,vec4(0.));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
    m=m*m;
    return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }

  void main(){
    vNormal = normal;
    float n = snoise(position * 1.5 + uTime * 0.2);
    float disp = n * uAmp * (0.4 + uScroll * 1.6);
    vDisp = disp;
    vec3 transformed = position + normal * disp;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec3 vNormal;
  varying float vDisp;
  void main(){
    float fres = pow(1.0 - max(dot(normalize(vNormal), vec3(0.,0.,1.)), 0.0), 2.0);
    vec3 col = mix(uColorA, uColorB, vDisp * 2.0 + 0.5);
    col += fres * 0.6;
    gl_FragColor = vec4(col, 1.0);
  }
`

function DeformableKnot() {
  const mat = useRef<THREE.ShaderMaterial>(null!)
  const mesh = useRef<THREE.Mesh>(null!)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uAmp: { value: 0.15 },
      uColorA: { value: new THREE.Color('#00E5FF') },
      uColorB: { value: new THREE.Color('#FF2D95') },
    }),
    []
  )

  useFrame(({ clock }) => {
    mat.current.uniforms.uTime.value = clock.elapsedTime
    mesh.current.rotation.y = clock.elapsedTime * 0.1
    mesh.current.rotation.x = clock.elapsedTime * 0.05
  })

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        mat.current.uniforms.uScroll.value = self.progress
      },
    })
    return () => st.kill()
  }, [])

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.4, 64]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
      />
    </mesh>
  )
}

export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.5} />
      <DeformableKnot />
    </Canvas>
  )
}