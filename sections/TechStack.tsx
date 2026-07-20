'use client'

import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { gsap, ScrollTrigger, useIsomorphicLayoutEffect } from '@/lib/gsap'
import { getLenis } from '@/lib/lenis-instance'

interface Tech {
  name: string
  years: string
  desc: string
}

interface Orbit {
  domain: string
  radius: number
  color: string
  techs: Tech[]
}

const ORBITS: Orbit[] = [
  {
    domain: 'Frontend',
    radius: 2.2,
    color: '#C6F24E',
    techs: [
      { name: 'React', years: '5y', desc: 'Component architecture, RSC, hooks' },
      { name: 'Next.js', years: '4y', desc: 'App Router, SSR/ISR, edge' },
      { name: 'TypeScript', years: '5y', desc: 'Type-safe systems end-to-end' },
      { name: 'GSAP', years: '3y', desc: 'Scroll-driven animations' },
    ],
  },
  {
    domain: 'Backend',
    radius: 3.2,
    color: '#F4F1EA',
    techs: [
      { name: 'Node.js', years: '6y', desc: 'APIs, streaming, workers' },
      { name: 'PostgreSQL', years: '5y', desc: 'Schema design, query tuning' },
      { name: 'Redis', years: '4y', desc: 'Caching, queues, pub/sub' },
      { name: 'GraphQL', years: '3y', desc: 'Federated schemas, subscriptions' },
    ],
  },
  {
    domain: 'Cloud',
    radius: 4.2,
    color: '#8C8A82',
    techs: [
      { name: 'AWS', years: '4y', desc: 'Lambda, ECS, S3, CloudFront' },
      { name: 'Docker', years: '5y', desc: 'Multi-stage builds, compose' },
      { name: 'Terraform', years: '3y', desc: 'IaC, modules, state' },
      { name: 'Vercel', years: '4y', desc: 'Edge functions, preview deploys' },
    ],
  },
]

function OrbitRing({
  orbit,
  activeIndex,
  index,
}: {
  orbit: Orbit
  activeIndex: { current: number }
  index: number
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState<Tech | null>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const isActive = activeIndex.current === index
    const baseSpeed = 0.15 + index * 0.05
    groupRef.current.rotation.z = clock.elapsedTime * baseSpeed
    const targetScale = isActive ? 1.35 : 0.85
    const current = groupRef.current.scale.x
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(current, targetScale, 0.03))
  })

  const techs = orbit.techs

  const trailDots = 24
  const trailPositions = Array.from({ length: trailDots }, (_, i) => {
    const angle = (i / trailDots) * Math.PI * 2
    const x = Math.cos(angle) * orbit.radius
    const y = Math.sin(angle) * orbit.radius
    return [x, y, 0]
  })

  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbit.radius - 0.015, orbit.radius + 0.015, 128]} />
        <meshBasicMaterial color={orbit.color} transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbit.radius - 0.08, orbit.radius + 0.08, 64]} />
        <meshBasicMaterial color={orbit.color} transparent opacity={0.03} side={THREE.DoubleSide} />
      </mesh>
      {trailPositions.map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <circleGeometry args={[0.015, 8]} />
          <meshBasicMaterial color={orbit.color} transparent opacity={0.15 + 0.25 * (i / trailDots)} />
        </mesh>
      ))}
      {techs.map((tech, i) => {
        const angle = (i / techs.length) * Math.PI * 2
        const x = Math.cos(angle) * orbit.radius
        const y = Math.sin(angle) * orbit.radius
        const subdivision = 1 + (i % 2)

        return (
          <group key={tech.name} position={[x, y, 0]}>
            <TechPlanet
              tech={tech}
              orbitColor={orbit.color}
              subdivision={subdivision}
              isHovered={hovered === tech}
              onPointerOver={() => setHovered(tech)}
              onPointerOut={() => setHovered(null)}
            />
          </group>
        )
      })}
    </group>
  )
}

function TechPlanet({
  tech,
  orbitColor,
  subdivision,
  isHovered,
  onPointerOver,
  onPointerOut,
}: {
  tech: Tech
  orbitColor: string
  subdivision: number
  isHovered: boolean
  onPointerOver: () => void
  onPointerOut: () => void
}) {
  const coreRef = useRef<THREE.Mesh>(null!)
  const wireRef = useRef<THREE.Mesh>(null!)
  const auraRef = useRef<THREE.Mesh>(null!)
  const coreMatRef = useRef<THREE.MeshStandardMaterial>(null!)
  const wireMatRef = useRef<THREE.MeshStandardMaterial>(null!)
  const auraMatRef = useRef<THREE.MeshBasicMaterial>(null!)

  const targets = useMemo(() => {
    return {
      coreScale: isHovered ? 1.6 : 1,
      wireScale: isHovered ? 1.8 : 1.1,
      auraOpacity: isHovered ? 0.3 : 0.08,
      coreEmissive: isHovered ? 1.0 : 0.25,
      wireEmissive: isHovered ? 0.8 : 0.25,
    }
  }, [isHovered])

  useFrame(() => {
    const lerpFactor = 0.08
    if (coreRef.current) {
      const cs = coreRef.current.scale.x
      coreRef.current.scale.setScalar(THREE.MathUtils.lerp(cs, targets.coreScale, lerpFactor))
    }
    if (wireRef.current) {
      const ws = wireRef.current.scale.x
      wireRef.current.scale.setScalar(THREE.MathUtils.lerp(ws, targets.wireScale, lerpFactor))
      if (isHovered) {
        wireRef.current.rotation.x += (0.3 - wireRef.current.rotation.x) * 0.05
        wireRef.current.rotation.z += (0.2 - wireRef.current.rotation.z) * 0.05
      }
    }
    if (auraMatRef.current) {
      auraMatRef.current.opacity = THREE.MathUtils.lerp(auraMatRef.current.opacity, targets.auraOpacity, lerpFactor)
    }
    if (coreMatRef.current) {
      coreMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(coreMatRef.current.emissiveIntensity, targets.coreEmissive, lerpFactor)
    }
    if (wireMatRef.current) {
      wireMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(wireMatRef.current.emissiveIntensity, targets.wireEmissive, lerpFactor)
    }
  })

  return (
    <group>
      <mesh ref={auraRef}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial ref={auraMatRef} color={orbitColor} transparent opacity={0.08} />
      </mesh>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.07, 0]} />
        <meshStandardMaterial ref={coreMatRef} color={orbitColor} emissive={orbitColor} emissiveIntensity={0.25} />
      </mesh>
      <mesh
        ref={wireRef}
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver() }}
        onPointerOut={() => onPointerOut()}
      >
        <icosahedronGeometry args={[0.13, subdivision]} />
        <meshStandardMaterial ref={wireMatRef} color="#0B0B0C" emissive={orbitColor} emissiveIntensity={0.25} wireframe />
      </mesh>
      <Html center distanceFactor={10} className="pointer-events-none">
        <div
          className="font-mono text-[10px] whitespace-nowrap"
          style={{
            color: orbitColor,
            transform: 'translateY(20px)',
            opacity: isHovered ? 1 : 0.55,
            transition: 'opacity 0.4s ease',
          }}
        >
          {tech.name}
        </div>
      </Html>
      {isHovered && (
        <Html center distanceFactor={5} className="pointer-events-none">
          <div
            className="rounded-xl p-4 text-ink text-xs border min-w-[180px]"
            style={{
              background: 'rgba(11,11,12,0.92)',
              borderColor: `${orbitColor}40`,
              borderWidth: '1px',
              boxShadow: `0 0 40px ${orbitColor}15`,
              transform: 'translateY(-60px)',
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
              style={{ background: `linear-gradient(90deg, transparent, ${orbitColor}, transparent)` }}
            />
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ backgroundColor: orbitColor }}
              />
              <span className="font-mono font-bold text-[11px] tracking-wider" style={{ color: orbitColor }}>
                {tech.name}
              </span>
              <span className="font-mono text-[10px] text-muted ml-auto">{tech.years}</span>
            </div>
            <p className="font-mono text-[10px] text-ink/60 leading-relaxed">{tech.desc}</p>
          </div>
        </Html>
      )}
    </group>
  )
}

function CoreSphere() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const innerRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.25
      meshRef.current.rotation.x = clock.elapsedTime * 0.12
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = clock.elapsedTime * -0.5
      innerRef.current.rotation.x = clock.elapsedTime * -0.25
    }
  })
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.85, 16, 16]} />
        <meshBasicMaterial color="#C6F24E" transparent opacity={0.04} />
      </mesh>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.6, 2]} />
        <meshStandardMaterial color="#0B0B0C" emissive="#C6F24E" emissiveIntensity={0.4} wireframe />
      </mesh>
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial color="#C6F24E" emissive="#C6F24E" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

function OrbitalScene({
  activeIndex,
}: {
  activeIndex: { current: number }
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 3]} intensity={0.5} color="#C6F24E" />
      <pointLight position={[0, 0, -3]} intensity={0.25} color="#F4F1EA" />
      <directionalLight position={[0, 2, 4]} intensity={0.7} color="#ffffff" />
      <CoreSphere />
      {ORBITS.map((orbit, i) => (
        <OrbitRing
          key={orbit.domain}
          orbit={orbit}
          activeIndex={activeIndex}
          index={i}
        />
      ))}
    </Canvas>
  )
}

export default function TechStack() {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollProgress = useRef(0)
  const activeIndex = useRef(0)
  const stRef = useRef<ScrollTrigger | null>(null)
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([])

  const scrollToOrbit = (index: number) => {
    const st = stRef.current
    if (!st) return
    const progress = (index + 0.5) / ORBITS.length
    const target = st.start + progress * (st.end - st.start)
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(target, { offset: 0, duration: 1, easing: (t: number) => 1 - Math.pow(1 - t, 3) })
    } else {
      window.scrollTo(0, target)
    }
  }

  useIsomorphicLayoutEffect(() => {
    if (!sectionRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      stRef.current = ScrollTrigger.create({
        trigger: sectionRef.current!,
        start: 'top top',
        end: () => '+=' + window.innerHeight * 0.8,
        pin: true,
        pinSpacing: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          scrollProgress.current = self.progress
          const idx = Math.min(
            ORBITS.length - 1,
            Math.floor(self.progress * ORBITS.length)
          )
          if (idx !== activeIndex.current) {
            activeIndex.current = idx
            dotRefs.current.forEach((el, i) => {
              if (!el) return
              const isActive = i === idx
              gsap.to(el, {
                opacity: isActive ? 1 : 0.35,
                borderColor: isActive ? ORBITS[i].color : 'rgba(140,138,130,0.25)',
                backgroundColor: isActive ? `${ORBITS[i].color}10` : 'transparent',
                duration: 0.4,
                ease: 'power2.out',
              })
            })
          }
        },
      })
    }, sectionRef)

    return () => {
      stRef.current = null
      ctx.revert()
    }
  }, [])

  return (
    <section
      id="stack"
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <OrbitalScene activeIndex={activeIndex} />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-between p-8 pointer-events-none">
        <div className="text-center pt-8">
          <div className="flex items-baseline justify-center gap-3 mb-2">
            <span className="font-mono text-[10px] tracking-widest2 text-accent">§02</span>
            <span className="font-mono text-[11px] tracking-widest2 uppercase text-muted">
              / Tech
            </span>
          </div>
          <h2 className="font-display italic font-bold tracking-tightest text-section text-ink">
            The Stack
          </h2>
        </div>

        <div className="text-center pb-8 relative z-20 pointer-events-auto">
          <div className="inline-flex gap-2 font-mono text-xs">
            {ORBITS.map((o, i) => (
              <button
                key={o.domain}
                ref={(el) => { dotRefs.current[i] = el }}
                onClick={() => scrollToOrbit(i)}
                className="px-4 py-1.5 rounded-full border opacity-40 cursor-pointer transition-all hover:opacity-80"
                style={{
                  color: o.color,
                  borderColor: 'rgba(140,138,130,0.25)',
                  background: 'transparent',
                }}
              >
                {o.domain}
              </button>
            ))}
          </div>
          <p className="font-mono text-[10px] text-muted mt-4">
            hover the planets · scroll to orbit
          </p>
        </div>
      </div>
    </section>
  )
}
