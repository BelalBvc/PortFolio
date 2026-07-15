'use client'

import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { gsap, ScrollTrigger, useIsomorphicLayoutEffect } from '@/lib/gsap'

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
    color: '#00FF88',
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
    color: '#00E5FF',
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
    color: '#FF2D95',
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
  scrollProgress,
  activeIndex,
  index,
}: {
  orbit: Orbit
  scrollProgress: { current: number }
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

  // Orbit trail dots
  const trailDots = 24
  const trailPositions = Array.from({ length: trailDots }, (_, i) => {
    const angle = (i / trailDots) * Math.PI * 2
    const x = Math.cos(angle) * orbit.radius
    const y = Math.sin(angle) * orbit.radius
    return [x, y, 0]
  })

  return (
    <group ref={groupRef}>
      {/* Orbit ring — thin luminous line */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbit.radius - 0.015, orbit.radius + 0.015, 128]} />
        <meshBasicMaterial color={orbit.color} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      {/* Outer glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbit.radius - 0.08, orbit.radius + 0.08, 64]} />
        <meshBasicMaterial color={orbit.color} transparent opacity={0.04} side={THREE.DoubleSide} />
      </mesh>
      {/* Trail dots on orbit */}
      {trailPositions.map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <circleGeometry args={[0.015, 8]} />
          <meshBasicMaterial color={orbit.color} transparent opacity={0.2 + 0.3 * (i / trailDots)} />
        </mesh>
      ))}
      {/* Tech planets */}
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
      auraOpacity: isHovered ? 0.35 : 0.1,
      coreEmissive: isHovered ? 1.0 : 0.3,
      wireEmissive: isHovered ? 0.8 : 0.3,
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
      // Gentle rotation on hover
      if (isHovered) {
        wireRef.current.rotation.x += (0.3 - wireRef.current.rotation.x) * 0.05
        wireRef.current.rotation.z += (0.2 - wireRef.current.rotation.z) * 0.05
      }
    }
    if (auraMatRef.current) {
      const currentOpacity = auraMatRef.current.opacity
      auraMatRef.current.opacity = THREE.MathUtils.lerp(currentOpacity, targets.auraOpacity, lerpFactor)
    }
    if (coreMatRef.current) {
      coreMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        coreMatRef.current.emissiveIntensity,
        targets.coreEmissive,
        lerpFactor
      )
    }
    if (wireMatRef.current) {
      wireMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        wireMatRef.current.emissiveIntensity,
        targets.wireEmissive,
        lerpFactor
      )
    }
  })

  return (
    <group>
      {/* Glow aura behind planet */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshBasicMaterial
          ref={auraMatRef}
          color={orbitColor}
          transparent
          opacity={0.1}
        />
      </mesh>
      {/* Inner solid core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial
          ref={coreMatRef}
          color={orbitColor}
          emissive={orbitColor}
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Planet wireframe icosahedron */}
      <mesh
        ref={wireRef}
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver() }}
        onPointerOut={() => onPointerOut()}
      >
        <icosahedronGeometry args={[0.14, subdivision]} />
        <meshStandardMaterial
          ref={wireMatRef}
          color="#0A0A0B"
          emissive={orbitColor}
          emissiveIntensity={0.3}
          wireframe
        />
      </mesh>
      {/* Tech label below planet */}
      <Html center distanceFactor={10} className="pointer-events-none">
        <div
          className="font-mono text-[10px] whitespace-nowrap"
          style={{
            color: orbitColor,
            transform: 'translateY(22px)',
            opacity: isHovered ? 1 : 0.6,
            transition: 'opacity 0.4s ease, text-shadow 0.4s ease',
            textShadow: isHovered ? `0 0 8px ${orbitColor}` : 'none',
          }}
        >
          {tech.name}
        </div>
      </Html>
      {/* Hover card */}
      {isHovered && (
        <Html center distanceFactor={5} className="pointer-events-none">
          <div
            className="rounded-xl p-4 text-white text-xs backdrop-blur-xl border min-w-[180px]"
            style={{
              background: `rgba(10,10,11,0.85)`,
              borderColor: `${orbitColor}50`,
              borderWidth: '1px',
              boxShadow: `0 0 30px ${orbitColor}20, inset 0 0 60px ${orbitColor}08`,
              transform: 'translateY(-60px)',
            }}
          >
            {/* Accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
              style={{
                background: `linear-gradient(90deg, transparent, ${orbitColor}, transparent)`,
              }}
            />
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: orbitColor, boxShadow: `0 0 8px ${orbitColor}` }}
              />
              <span
                className="font-mono font-bold text-[11px] tracking-wider"
                style={{ color: orbitColor }}
              >
                {tech.name}
              </span>
              <span className="font-mono text-[10px] text-muted ml-auto">
                {tech.years}
              </span>
            </div>
            {/* Description */}
            <p className="font-mono text-[10px] text-text/70 leading-relaxed">
              {tech.desc}
            </p>
            {/* Decorative dots */}
            <div className="flex gap-1 mt-2">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="w-1 h-1 rounded-full"
                  style={{
                    backgroundColor: orbitColor,
                    opacity: 0.5 + d * 0.2,
                  }}
                />
              ))}
            </div>
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
      meshRef.current.rotation.y = clock.elapsedTime * 0.3
      meshRef.current.rotation.x = clock.elapsedTime * 0.15
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = clock.elapsedTime * -0.6
      innerRef.current.rotation.x = clock.elapsedTime * -0.3
    }
  })
  return (
    <group>
      {/* Outer glow sphere */}
      <mesh>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshBasicMaterial color="#00FF88" transparent opacity={0.06} />
      </mesh>
      {/* Wireframe icosahedron — the original signature look */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.65, 2]} />
        <meshStandardMaterial
          color="#0A0A0B"
          emissive="#00FF88"
          emissiveIntensity={0.5}
          wireframe
        />
      </mesh>
      {/* Inner solid core — rotates opposite direction */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial
          color="#00FF88"
          emissive="#00FF88"
          emissiveIntensity={0.9}
        />
      </mesh>
    </group>
  )
}

function OrbitalScene({
  scrollProgress,
  activeIndex,
}: {
  scrollProgress: { current: number }
  activeIndex: { current: number }
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 3]} intensity={0.6} color="#00FF88" />
      <pointLight position={[0, 0, -3]} intensity={0.3} color="#00E5FF" />
      <directionalLight position={[0, 2, 4]} intensity={0.8} color="#ffffff" />
      <CoreSphere />
      {ORBITS.map((orbit, i) => (
        <OrbitRing
          key={orbit.domain}
          orbit={orbit}
          scrollProgress={scrollProgress}
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
    // Lenis intercepts window.scrollTo for smooth scrolling
    window.scrollTo(0, target)
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
            // Direct DOM update — no React re-render
            dotRefs.current.forEach((el, i) => {
              if (!el) return
              const isActive = i === idx
              gsap.to(el, {
                opacity: isActive ? 1 : 0.4,
                borderColor: isActive ? 'currentcolor' : 'rgba(138,138,147,0.3)',
                backgroundColor: isActive ? `${ORBITS[i].color}15` : 'transparent',
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
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <OrbitalScene scrollProgress={scrollProgress} activeIndex={activeIndex} />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-between p-8 pointer-events-none">
        <div className="text-center pt-8">
          <p className="font-mono text-xs tracking-widest2 uppercase text-muted mb-2">
            // tech ecosystem
          </p>
          <h2 className="font-display font-bold tracking-tightest text-section">
            THE STACK
          </h2>
        </div>

        <div className="text-center pb-8 relative z-20 pointer-events-auto">
          <div className="inline-flex gap-2 font-mono text-xs">
            {ORBITS.map((o, i) => (
              <button
                key={o.domain}
                ref={(el) => { dotRefs.current[i] = el }}
                onClick={() => scrollToOrbit(i)}
                className="px-3 py-1 rounded-full border opacity-40 cursor-pointer transition-colors hover:opacity-80"
                style={{
                  color: o.color,
                  borderColor: 'rgba(138,138,147,0.3)',
                  background: 'transparent',
                }}
              >
                {o.domain}
              </button>
            ))}
          </div>
          <p className="font-mono text-xs text-muted mt-4">
            hover the planets · scroll to orbit
          </p>
        </div>
      </div>
    </section>
  )
}