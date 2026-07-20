'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createRunnerEngine, type RunnerEngine, type PowerupKind } from '@/lib/game/runner-engine'

const BEST_KEY = 'bn-runner-best'

const POWERUP_META: Record<PowerupKind, { label: string; color: string }> = {
  magnet: { label: 'MAGNET', color: '#4ee5f2' },
  shield: { label: 'SHIELD', color: '#f24ee5' },
  double: { label: '2× SCORE', color: '#f2914e' },
  slow: { label: 'SLOW-MO', color: '#9b4ef2' },
}

export default function SubwayRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<RunnerEngine | null>(null)
  const [status, setStatus] = useState<'idle' | 'playing' | 'over'>('idle')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [combo, setCombo] = useState(0)
  const [multiplier, setMultiplier] = useState(1)
  const [activePowerup, setActivePowerup] = useState<PowerupKind | null>(null)
  const [boss, setBoss] = useState<{ hp: number; maxHp: number } | null>(null)

  useEffect(() => {
    const stored = Number(localStorage.getItem(BEST_KEY) || 0)
    setBest(stored)
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    const engine = createRunnerEngine(canvasRef.current, {
      onScore: (s) => setScore(s),
      onStart: () => {
        setScore(0)
        setCombo(0)
        setMultiplier(1)
        setActivePowerup(null)
        setBoss(null)
        setStatus('playing')
      },
      onGameOver: (final) => {
        setStatus('over')
        setScore(final)
        setBoss(null)
        setActivePowerup(null)
        setBest((prev) => {
          const next = Math.max(prev, final)
          localStorage.setItem(BEST_KEY, String(next))
          return next
        })
      },
      onPowerup: (kind) => setActivePowerup(kind),
      onCombo: (c, m) => {
        setCombo(c)
        setMultiplier(m)
      },
      onBoss: (hp, maxHp, active) => {
        setBoss(active ? { hp, maxHp } : null)
      },
    })
    engineRef.current = engine

    return () => {
      engine.destroy()
      engineRef.current = null
    }
  }, [])

  const start = useCallback(() => engineRef.current?.start(), [])
  const jump = useCallback(() => engineRef.current?.jump(), [])
  const roll = useCallback(() => engineRef.current?.roll(), [])
  const left = useCallback(() => engineRef.current?.moveLeft(), [])
  const right = useCallback(() => engineRef.current?.moveRight(), [])

  // touch swipe
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    touchStart.current = null

    if (status !== 'playing') {
      start()
      return
    }
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 24) dx > 0 ? right() : left()
    } else {
      if (dy < -24) jump()
      else if (dy > 24) roll()
      else jump()
    }
  }

  return (
    <div
      className="relative w-full aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-sm border border-line bg-black select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-4 md:p-6 pointer-events-none font-mono">
        <div className="text-[10px] tracking-widest2 text-accent leading-relaxed">
          <div>$ ./neon-runner --play</div>
          <div className="text-muted">dodge · jump · roll · repeat</div>
          {combo > 0 && (
            <div className="mt-2 text-ink">
              combo <span className="text-accent">{combo}</span>
              {multiplier > 1 && (
                <span className="ml-2 text-accent">×{multiplier.toFixed(1)}</span>
              )}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl md:text-4xl text-ink tabular-nums leading-none">
            {String(score).padStart(6, '0')}
          </div>
          <div className="text-[10px] tracking-widest2 text-muted mt-1">
            BEST {String(best).padStart(6, '0')}
          </div>
        </div>
      </div>

      {/* active powerup badge */}
      {activePowerup && (
        <div
          className="absolute top-16 md:top-20 left-4 md:left-6 px-3 py-1.5 border font-mono text-[10px] tracking-widest2 pointer-events-none"
          style={{
            borderColor: POWERUP_META[activePowerup].color,
            color: POWERUP_META[activePowerup].color,
            background: `${POWERUP_META[activePowerup].color}11`,
          }}
        >
          ▸ {POWERUP_META[activePowerup].label}
        </div>
      )}

      {/* boss HP bar */}
      {boss && (
        <div className="absolute top-16 md:top-20 left-1/2 -translate-x-1/2 w-48 md:w-64 pointer-events-none">
          <div className="font-mono text-[9px] tracking-widest2 text-center mb-1" style={{ color: '#f24e4e' }}>
            ⚠ BOSS
          </div>
          <div className="h-1.5 bg-line overflow-hidden">
            <div
              className="h-full transition-all duration-200"
              style={{
                width: `${(boss.hp / boss.maxHp) * 100}%`,
                background: '#f24e4e',
              }}
            />
          </div>
        </div>
      )}

      {/* corner brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-accent/50 pointer-events-none" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-accent/50 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-accent/50 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-accent/50 pointer-events-none" />

      {/* IDLE overlay */}
      {status === 'idle' && (
        <button
          onClick={start}
          data-cursor="hover"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-bg/60 backdrop-blur-sm group"
        >
          <span className="font-mono text-[10px] tracking-widest2 text-accent animate-pulse">
            [ INSERT COIN ]
          </span>
          <span className="font-display italic font-bold tracking-tightest text-[clamp(2rem,6vw,4.5rem)] leading-none text-ink group-hover:text-accent transition-colors duration-300">
            Press to Run
          </span>
          <span className="font-mono text-[10px] tracking-widest2 text-muted">
            SPACE / TAP to start
          </span>
        </button>
      )}

      {/* GAME OVER overlay */}
      {status === 'over' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-bg/70 backdrop-blur-sm">
          <span className="font-mono text-[10px] tracking-widest2 text-accent">
            [ CONNECTION LOST ]
          </span>
          <span className="font-display italic font-bold tracking-tightest text-[clamp(2rem,6vw,4.5rem)] leading-none text-ink">
            Wiped Out
          </span>
          <div className="font-mono text-xs text-muted">
            score <span className="text-accent">{score}</span>
            {score >= best && score > 0 && (
              <span className="ml-2 text-accent">· new record</span>
            )}
          </div>
          <button
            onClick={start}
            data-cursor="hover"
            className="mt-2 px-8 py-3 border border-accent text-accent font-mono text-xs tracking-widest2 uppercase hover:bg-accent hover:text-bg transition-colors duration-300"
          >
            ↻ Run Again
          </button>
        </div>
      )}

      {/* mobile controls */}
      {status === 'playing' && (
        <div className="absolute bottom-3 left-0 right-0 z-10 flex md:hidden items-center justify-center gap-3 px-4">
          {[
            { label: '←', fn: left },
            { label: '↓', fn: roll },
            { label: '↑', fn: jump },
            { label: '→', fn: right },
          ].map((b) => (
            <button
              key={b.label}
              onPointerDown={(e) => {
                e.preventDefault()
                b.fn()
              }}
              className="w-12 h-12 border border-line text-ink font-mono text-lg bg-bg/40 backdrop-blur-sm active:bg-accent active:text-bg transition-colors"
            >
              {b.label}
            </button>
          ))}
        </div>
      )}

      {/* key hints desktop */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-4 font-mono text-[9px] tracking-widest2 text-muted pointer-events-none">
        <span><span className="text-ink">←→</span> lanes</span>
        <span><span className="text-ink">↑</span> jump</span>
        <span><span className="text-ink">↓</span> roll</span>
      </div>
    </div>
  )
}
