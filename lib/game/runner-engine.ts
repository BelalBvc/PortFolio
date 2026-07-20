import * as THREE from 'three'

export type GameStatus = 'idle' | 'playing' | 'over'
export type PowerupKind = 'magnet' | 'shield' | 'double' | 'slow'

export interface EngineCallbacks {
  onScore?: (score: number) => void
  onGameOver?: (score: number) => void
  onStart?: () => void
  onPowerup?: (kind: PowerupKind | null) => void
  onCombo?: (combo: number, multiplier: number) => void
  onBoss?: (hp: number, maxHp: number, active: boolean) => void
}

// ---------- palette ----------
const INK = 0xf4f1ea
const ACCENT = 0xc6f24e
const MUTED = 0x3a3a36
const TRAIN = 0x181816
const BG = 0x0b0b0c
const CYAN = 0x4ee5f2 // magnet
const MAGENTA = 0xf24ee5 // shield
const ORANGE = 0xf2914e // double
const PURPLE = 0x9b4ef2 // slow
const RED = 0xf24e4e // boss
const TRAIN_COLORS = [0x4ee5f2, 0xf24ee5, 0xf2914e, 0x9b4ef2, 0xc6f24e]

const LANES = [-2.4, 0, 2.4]
const DESPAWN_Z = 18
const JUMP_VY = 15
const GRAVITY = -26
const ROLL_TIME = 0.65
const TRAIN_TOP = 2.3
const BEAM_BOTTOM = 1.15
const POWERUP_DURATION: Record<PowerupKind, number> = {
  magnet: 6,
  shield: 0,
  double: 8,
  slow: 5,
}
const BOSS_SCORE_INTERVAL = 2000
const BOSS_MAX_HP = 3
const COMBO_DECAY = 2.5
const POWERUP_COLOR: Record<PowerupKind, number> = {
  magnet: CYAN,
  shield: MAGENTA,
  double: ORANGE,
  slow: PURPLE,
}

type ObstacleKind = 'train' | 'barrier' | 'low'

interface Obstacle {
  kind: ObstacleKind
  lane: number
  mesh: THREE.Mesh
  z: number
  passed: boolean
}

interface Coin {
  mesh: THREE.Mesh
  lane: number
  z: number
  y: number
  taken: boolean
}

interface Powerup {
  mesh: THREE.Group
  kind: PowerupKind
  z: number
  lane: number
  y: number
  taken: boolean
}

interface Boss {
  group: THREE.Group
  z: number
  x: number
  y: number
  // damped targets for smooth motion
  targetX: number
  targetY: number
  targetZ: number
  // smoothed render values
  renderX: number
  renderY: number
  renderZ: number
  // animation state
  spawnT: number // 0→1 entrance progress
  spinPhase: number
  hp: number
  maxHp: number
  fireTimer: number
  alive: boolean
  hitFlash: number
  scale: number
}

interface Projectile {
  mesh: THREE.Mesh
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
}

interface FloatBit {
  mesh: THREE.Mesh
  vel: THREE.Vector3
  life: number
}

interface Particle {
  mesh: THREE.Mesh
  vel: THREE.Vector3
  life: number
}

function buildTrainGeo(): THREE.BoxGeometry {
  return new THREE.BoxGeometry(1.9, 2.3, 7.5)
}

export function createRunnerEngine(
  canvas: HTMLCanvasElement,
  callbacks: EngineCallbacks = {}
) {
  // ---------- renderer / scene ----------
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(BG)
  scene.fog = new THREE.Fog(BG, 25, 110)

  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 300)
  const camBase = new THREE.Vector3(0, 4.6, 7.8)
  camera.position.copy(camBase)
  camera.lookAt(0, 1.4, -14)

  // ---------- lights ----------
  const hemi = new THREE.HemisphereLight(0xffffff, BG, 0.35)
  scene.add(hemi)
  const key = new THREE.DirectionalLight(0xffffff, 1.1)
  key.position.set(4, 10, 6)
  scene.add(key)
  const rim = new THREE.DirectionalLight(ACCENT, 0.9)
  rim.position.set(-3, 4, -10)
  scene.add(rim)
  const dynLight = new THREE.PointLight(ACCENT, 0, 30)
  dynLight.position.set(0, 4, -10)
  scene.add(dynLight)

  // ---------- materials ----------
  const matInk = new THREE.MeshStandardMaterial({ color: INK, roughness: 0.35, metalness: 0.1 })
  const matAccent = new THREE.MeshStandardMaterial({
    color: ACCENT,
    emissive: ACCENT,
    emissiveIntensity: 0.7,
    roughness: 0.3,
  })
  const matMuted = new THREE.MeshStandardMaterial({ color: MUTED, roughness: 0.9 })
  const matTrain = new THREE.MeshStandardMaterial({ color: TRAIN, roughness: 0.45, metalness: 0.35 })
  const matGlass = new THREE.MeshStandardMaterial({
    color: ACCENT,
    emissive: ACCENT,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.85,
  })
  const trainMatCache = new Map<number, THREE.MeshStandardMaterial>()
  function getTrainMat(color: number) {
    let m = trainMatCache.get(color)
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color: TRAIN,
        emissive: color,
        emissiveIntensity: 0.35,
        roughness: 0.4,
        metalness: 0.4,
      })
      trainMatCache.set(color, m)
    }
    return m
  }
  const powerupMatCache = new Map<number, THREE.MeshStandardMaterial>()
  function getPowerupMat(color: number) {
    let m = powerupMatCache.get(color)
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.3,
      })
      powerupMatCache.set(color, m)
    }
    return m
  }

  // ---------- ground ----------
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 400),
    new THREE.MeshStandardMaterial({ color: 0x0e0e0f, roughness: 1 })
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.z = -150
  scene.add(ground)

  // lane separators
  const dashGeo = new THREE.BoxGeometry(0.08, 0.02, 1.4)
  const dashCount = 2 * 40
  const dashes = new THREE.InstancedMesh(dashGeo, matMuted, dashCount)
  const dummy = new THREE.Object3D()
  let di = 0
  for (const x of [-1.2, 1.2]) {
    for (let i = 0; i < 40; i++) {
      dummy.position.set(x, 0.011, 10 - i * 4)
      dummy.updateMatrix()
      dashes.setMatrixAt(di++, dummy.matrix)
    }
  }
  dashes.instanceMatrix.needsUpdate = true
  scene.add(dashes)

  // side monoliths
  const monolithGeo = new THREE.BoxGeometry(1, 1, 1)
  const monolithCount = 36
  const monoliths = new THREE.InstancedMesh(monolithGeo, matMuted, monolithCount)
  const monolithData: { x: number; y: number; z: number; s: THREE.Vector3 }[] = []
  for (let i = 0; i < monolithCount; i++) {
    const side = i % 2 === 0 ? -1 : 1
    const h = 2 + Math.random() * 7
    const entry = {
      x: side * (6.5 + Math.random() * 5),
      y: h / 2,
      z: 12 - i * 6 - Math.random() * 4,
      s: new THREE.Vector3(0.8 + Math.random() * 1.6, h, 0.8 + Math.random() * 1.6),
    }
    monolithData.push(entry)
    dummy.position.set(entry.x, entry.y, entry.z)
    dummy.scale.copy(entry.s)
    dummy.rotation.set(0, 0, 0)
    dummy.updateMatrix()
    monoliths.setMatrixAt(i, dummy.matrix)
  }
  monoliths.instanceMatrix.needsUpdate = true
  scene.add(monoliths)

  const gridHelper = new THREE.GridHelper(200, 60, ACCENT, 0x222220)
  ;(gridHelper.material as THREE.Material).transparent = true
  ;(gridHelper.material as THREE.Material).opacity = 0.14
  gridHelper.position.y = 6.5
  scene.add(gridHelper)

  // ---------- player ----------
  const player = new THREE.Group()
  const matPlayer = matInk

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.5, 4, 10), matPlayer)
  torso.position.y = 1.05
  player.add(torso)

  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), matPlayer)
  head.position.y = 1.62
  player.add(head)

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.2), matAccent)
  visor.position.set(0, 1.64, 0.16)
  player.add(visor)

  const limbGeo = new THREE.CapsuleGeometry(0.09, 0.42, 3, 8)
  const armL = new THREE.Mesh(limbGeo, matPlayer)
  const armR = new THREE.Mesh(limbGeo, matPlayer)
  armL.position.set(-0.42, 1.15, 0)
  armR.position.set(0.42, 1.15, 0)
  player.add(armL, armR)

  const legL = new THREE.Mesh(limbGeo, matPlayer)
  const legR = new THREE.Mesh(limbGeo, matPlayer)
  legL.position.set(-0.16, 0.42, 0)
  legR.position.set(0.16, 0.42, 0)
  player.add(legL, legR)

  const board = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 1.15), matAccent)
  board.position.y = 0.06
  player.add(board)

  // shield bubble
  const shieldMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 16, 12),
    new THREE.MeshBasicMaterial({
      color: MAGENTA,
      transparent: true,
      opacity: 0,
      wireframe: true,
    })
  )
  shieldMesh.position.y = 0.9
  player.add(shieldMesh)

  scene.add(player)

  // shadow
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 24),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 })
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.012
  scene.add(shadow)

  // ---------- pools / geometries ----------
  const trainGeo = buildTrainGeo()
  const trainWinGeo = new THREE.BoxGeometry(1.94, 0.35, 1.2)
  const barrierGeo = new THREE.BoxGeometry(1.9, 0.55, 0.35)
  const barrierLegGeo = new THREE.BoxGeometry(0.12, 0.75, 0.3)
  const lowGeo = new THREE.BoxGeometry(1.9, TRAIN_TOP - BEAM_BOTTOM, 0.4)
  const lowPostGeo = new THREE.BoxGeometry(0.1, BEAM_BOTTOM, 0.35)
  const coinGeo = new THREE.TorusGeometry(0.28, 0.09, 8, 20)
  const bitGeo = new THREE.TetrahedronGeometry(0.22)
  const particleGeo = new THREE.BoxGeometry(0.07, 0.07, 0.07)
  const projGeo = new THREE.IcosahedronGeometry(0.22, 0)

  const obstacles: Obstacle[] = []
  const coins: Coin[] = []
  const powerups: Powerup[] = []
  const bits: FloatBit[] = []
  const particles: Particle[] = []
  const projectiles: Projectile[] = []
  let boss: Boss | null = null

  function spawnObstacle(kind: ObstacleKind, lane: number, z: number) {
    let mesh: THREE.Mesh
    if (kind === 'train') {
      const color = TRAIN_COLORS[Math.floor(Math.random() * TRAIN_COLORS.length)]
      mesh = new THREE.Mesh(trainGeo, getTrainMat(color))
      mesh.position.set(LANES[lane], 1.15, z)
      const win = new THREE.Mesh(trainWinGeo, matGlass)
      win.position.set(0, 0.55, 2.2)
      mesh.add(win)
      const headlight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.06), matAccent)
      headlight.position.set(0, -0.6, 3.78)
      mesh.add(headlight)
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(1.94, 0.08, 7.4),
        getPowerupMat(color)
      )
      stripe.position.set(0, -0.7, 0)
      mesh.add(stripe)
    } else if (kind === 'barrier') {
      mesh = new THREE.Mesh(barrierGeo, matAccent)
      mesh.position.set(LANES[lane], 0.85, z)
      const legLm = new THREE.Mesh(barrierLegGeo, matMuted)
      const legRm = new THREE.Mesh(barrierLegGeo, matMuted)
      legLm.position.set(-0.85, -0.45, 0)
      legRm.position.set(0.85, -0.45, 0)
      mesh.add(legLm, legRm)
    } else {
      mesh = new THREE.Mesh(lowGeo, matTrain)
      mesh.position.set(LANES[lane], (TRAIN_TOP + BEAM_BOTTOM) / 2, z)
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(1.94, 0.18, 0.42),
        matAccent
      )
      stripe.position.set(0, -(TRAIN_TOP - BEAM_BOTTOM) / 2 + 0.1, 0)
      mesh.add(stripe)
      const postL = new THREE.Mesh(lowPostGeo, matMuted)
      const postR = new THREE.Mesh(lowPostGeo, matMuted)
      postL.position.set(-1.05, -(TRAIN_TOP - BEAM_BOTTOM) / 2, 0)
      postR.position.set(1.05, -(TRAIN_TOP - BEAM_BOTTOM) / 2, 0)
      mesh.add(postL, postR)
    }
    scene.add(mesh)
    obstacles.push({ kind, lane, mesh, z, passed: false })
  }

  function spawnCoinRow(lane: number, z: number, count = 5, arc = false) {
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(coinGeo, matAccent)
      const y = arc ? 0.8 + Math.sin((i / (count - 1)) * Math.PI) * 1.1 : 0.8
      mesh.position.set(LANES[lane], y, z - i * 2)
      scene.add(mesh)
      coins.push({ mesh, lane, z: z - i * 2, y, taken: false })
    }
  }

  function spawnPowerup(lane: number, z: number) {
    const kinds: PowerupKind[] = ['magnet', 'shield', 'double', 'slow']
    const kind = kinds[Math.floor(Math.random() * kinds.length)]
    const color = POWERUP_COLOR[kind]
    const group = new THREE.Group()
    const shell = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.45, 0),
      getPowerupMat(color)
    )
    group.add(shell)
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.05, 8, 16),
      getPowerupMat(color)
    )
    group.add(ring)
    group.position.set(LANES[lane], 1.5, z)
    scene.add(group)
    powerups.push({ mesh: group, kind, z, lane, y: 1.5, taken: false })
  }

  function spawnBoss() {
    const group = new THREE.Group()
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.2, 1),
      new THREE.MeshStandardMaterial({
        color: RED,
        emissive: RED,
        emissiveIntensity: 0.8,
        roughness: 0.3,
      })
    )
    group.add(core)
    for (let i = 0; i < 6; i++) {
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 1.2, 6),
        new THREE.MeshStandardMaterial({
          color: 0x8a1a1a,
          emissive: RED,
          emissiveIntensity: 0.4,
        })
      )
      const a = (i / 6) * Math.PI * 2
      spike.position.set(Math.cos(a) * 1.4, Math.sin(a) * 1.4, 0)
      spike.lookAt(0, 0, 0)
      spike.rotateX(Math.PI / 2)
      group.add(spike)
    }
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 12, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    )
    eye.position.z = 1.1
    group.add(eye)
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 6),
      new THREE.MeshBasicMaterial({ color: RED })
    )
    pupil.position.set(0, 0, 1.25)
    group.add(pupil)

    group.position.set(0, 5, -30)
    group.scale.setScalar(0.01)
    scene.add(group)
    boss = {
      group,
      z: -30,
      x: 0,
      y: 5,
      targetX: 0,
      targetY: 5,
      targetZ: -22,
      renderX: 0,
      renderY: 5,
      renderZ: -30,
      spawnT: 0,
      spinPhase: 0,
      hp: BOSS_MAX_HP,
      maxHp: BOSS_MAX_HP,
      fireTimer: 2.5, // grace period during entrance
      alive: true,
      hitFlash: 0,
      scale: 0.01,
    }
    callbacks.onBoss?.(boss.hp, boss.maxHp, true)
    shake = 1.2
    flashDynLight(RED, 2, 8)
  }

  function fireProjectile() {
    if (!boss) return
    const mesh = new THREE.Mesh(
      projGeo,
      new THREE.MeshStandardMaterial({
        color: RED,
        emissive: RED,
        emissiveIntensity: 0.9,
      })
    )
    mesh.position.set(boss.x, boss.y, boss.z)
    scene.add(mesh)
    const dx = playerState.x - boss.x
    const dy = playerState.y + 0.9 - boss.y
    const dz = 0 - boss.z
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
    const sp = 14
    projectiles.push({
      mesh,
      x: boss.x,
      y: boss.y,
      z: boss.z,
      vx: (dx / len) * sp,
      vy: (dy / len) * sp,
      vz: (dz / len) * sp,
    })
  }

  function spawnPattern(baseZ: number) {
    const roll = Math.random()
    const lane = Math.floor(Math.random() * 3)

    if (roll < 0.22) {
      spawnObstacle('train', lane, baseZ)
      spawnCoinRow((lane + 2) % 3, baseZ - 6, 4)
    } else if (roll < 0.4) {
      const l2 = (lane + 1 + Math.floor(Math.random() * 2)) % 3
      spawnObstacle('train', lane, baseZ)
      spawnObstacle('train', l2, baseZ - 8)
      const free = [0, 1, 2].find((l) => l !== lane && l !== l2)!
      spawnCoinRow(free, baseZ, 5, true)
    } else if (roll < 0.62) {
      spawnObstacle('barrier', lane, baseZ)
      spawnCoinRow(lane, baseZ - 2, 5, true)
      if (Math.random() < 0.35) spawnObstacle('barrier', (lane + 1) % 3, baseZ - 7)
    } else if (roll < 0.82) {
      spawnObstacle('low', lane, baseZ)
      spawnCoinRow((lane + 2) % 3, baseZ - 4, 4, true)
    } else {
      // rare: powerup
      const obsLane = lane
      spawnObstacle(Math.random() < 0.5 ? 'barrier' : 'train', obsLane, baseZ)
      spawnPowerup((obsLane + 1) % 3, baseZ - 4)
    }
  }

  // ---------- state ----------
  let status: GameStatus = 'idle'
  let raf = 0
  let last = 0
  let speed = 0
  let baseSpeed = 14
  let score = 0
  let nextSpawnZ = -60
  let furthestZ = 0
  let shake = 0
  let elapsed = 0
  let prevY = 0
  let combo = 0
  let comboTimer = 0
  let multiplier = 1
  let nextBossScore = BOSS_SCORE_INTERVAL
  let coinsSinceBossHit = 0
  let colorShift = 0
  let flashTimer = 0

  const effects: Partial<Record<PowerupKind, number>> = {}

  const playerState = {
    lane: 1,
    targetLane: 1,
    x: 0,
    y: 0,
    vy: 0,
    grounded: true,
    rolling: 0,
    dead: false,
  }

  function resetWorld() {
    for (const o of obstacles) scene.remove(o.mesh)
    for (const c of coins) scene.remove(c.mesh)
    for (const p of powerups) scene.remove(p.mesh)
    for (const b of bits) scene.remove(b.mesh)
    for (const p of particles) scene.remove(p.mesh)
    for (const p of projectiles) scene.remove(p.mesh)
    if (boss) {
      scene.remove(boss.group)
      boss = null
    }
    obstacles.length = 0
    coins.length = 0
    powerups.length = 0
    bits.length = 0
    particles.length = 0
    projectiles.length = 0
    playerState.lane = 1
    playerState.targetLane = 1
    playerState.x = 0
    playerState.y = 0
    playerState.vy = 0
    playerState.grounded = true
    playerState.rolling = 0
    playerState.dead = false
    player.rotation.set(0, 0, 0)
    player.position.set(0, 0, 0)
    nextSpawnZ = -60
    furthestZ = 0
    speed = baseSpeed
    shake = 0
    combo = 0
    comboTimer = 0
    multiplier = 1
    nextBossScore = BOSS_SCORE_INTERVAL
    coinsSinceBossHit = 0
    colorShift = 0
    flashTimer = 0
    for (const k of Object.keys(effects) as PowerupKind[]) delete effects[k]
    ;(shieldMesh.material as THREE.MeshBasicMaterial).opacity = 0
    callbacks.onBoss?.(0, 0, false)
    callbacks.onPowerup?.(null)
    callbacks.onCombo?.(0, 1)
  }

  // ---------- helpers ----------
  function flashDynLight(color: number, intensity: number, duration: number) {
    dynLight.color.setHex(color)
    dynLight.intensity = intensity
    flashTimer = duration
  }

  function burstParticles(pos: THREE.Vector3, color: number, count: number, spread: number) {
    for (let i = 0; i < count; i++) {
      const m = new THREE.Mesh(particleGeo, getPowerupMat(color))
      m.position.copy(pos)
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * spread,
        Math.random() * spread * 0.6 + 1,
        (Math.random() - 0.5) * spread
      )
      scene.add(m)
      particles.push({ mesh: m, vel, life: 0.6 })
    }
  }

  function addCombo() {
    combo++
    comboTimer = COMBO_DECAY
    const newMult = Math.min(5, 1 + Math.floor(combo / 5) * 0.5)
    if (newMult !== multiplier) {
      multiplier = newMult
      if (combo % 10 === 0 && combo > 0) {
        shake = Math.max(shake, 0.4)
        flashDynLight(ACCENT, 3, 0.3)
      }
    }
    callbacks.onCombo?.(combo, multiplier)
  }

  function activatePowerup(kind: PowerupKind) {
    if (kind === 'shield') {
      effects.shield = -1
      ;(shieldMesh.material as THREE.MeshBasicMaterial).opacity = 0.4
    } else {
      effects[kind] = POWERUP_DURATION[kind]
    }
    flashDynLight(POWERUP_COLOR[kind], 4, 0.5)
    callbacks.onPowerup?.(kind)
  }

  function deactivatePowerup(kind: PowerupKind) {
    delete effects[kind]
    if (kind === 'shield') {
      ;(shieldMesh.material as THREE.MeshBasicMaterial).opacity = 0
    }
    callbacks.onPowerup?.(null)
  }

  // ---------- input ----------
  function jump() {
    if (status !== 'playing' || playerState.dead) return
    if (playerState.grounded) {
      playerState.vy = JUMP_VY
      playerState.grounded = false
      playerState.rolling = 0
    }
  }
  function roll() {
    if (status !== 'playing' || playerState.dead) return
    if (!playerState.grounded) {
      playerState.vy = Math.min(playerState.vy, -18)
    }
    playerState.rolling = ROLL_TIME
  }
  function move(dir: -1 | 1) {
    if (status !== 'playing' || playerState.dead) return
    playerState.targetLane = THREE.MathUtils.clamp(playerState.targetLane + dir, 0, 2)
    playerState.lane = playerState.targetLane
  }

  function start() {
    resetWorld()
    score = 0
    status = 'playing'
    callbacks.onScore?.(0)
    callbacks.onStart?.()
  }

  function gameOver() {
    status = 'over'
    playerState.dead = true
    shake = 0.7
    flashDynLight(RED, 5, 0.8)
    for (let i = 0; i < 22; i++) {
      const m = new THREE.Mesh(bitGeo, Math.random() < 0.5 ? matAccent : matInk)
      m.position.copy(player.position).add(new THREE.Vector3(0, 1, 0))
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 9,
        Math.random() * 8 + 2,
        (Math.random() - 0.5) * 9
      )
      scene.add(m)
      bits.push({ mesh: m, vel, life: 1 })
    }
    callbacks.onGameOver?.(Math.floor(score))
  }

  // ---------- collisions ----------
  function checkCollisions() {
    const h = playerState.rolling > 0 ? 0.7 : 1.85
    const pBottom = playerState.y
    const pTop = playerState.y + h

    for (const o of obstacles) {
      const dx = Math.abs(playerState.x - LANES[o.lane])
      const dz = Math.abs(o.z)

      if (o.kind === 'train') {
        if (dx > 1.3 || dz > 4.1) continue
        if (playerState.vy <= 0 && prevY >= TRAIN_TOP - 0.05 && pBottom <= TRAIN_TOP) {
          playerState.y = TRAIN_TOP
          playerState.vy = 0
          playerState.grounded = true
          continue
        }
        if (playerState.grounded && Math.abs(playerState.y - TRAIN_TOP) < 0.5) continue
        if (pBottom < TRAIN_TOP && pTop > 0) {
          if (effects.shield !== undefined) {
            deactivatePowerup('shield')
            shake = 0.5
            flashDynLight(MAGENTA, 4, 0.4)
          } else {
            gameOver()
            return
          }
        }
      } else if (o.kind === 'barrier') {
        if (dx > 1.3 || dz > 0.6) continue
        if (pBottom < 1.175 && pTop > 0.525) {
          if (effects.shield !== undefined) {
            deactivatePowerup('shield')
            shake = 0.5
            flashDynLight(MAGENTA, 4, 0.4)
          } else {
            gameOver()
            return
          }
        }
      } else {
        if (dx > 1.3 || dz > 0.65) continue
        if (pTop > BEAM_BOTTOM && pBottom < TRAIN_TOP) {
          if (effects.shield !== undefined) {
            deactivatePowerup('shield')
            shake = 0.5
            flashDynLight(MAGENTA, 4, 0.4)
          } else {
            gameOver()
            return
          }
        }
      }
    }

    // coins
    for (const c of coins) {
      if (c.taken || Math.abs(c.z) > 1.4) continue
      const dx = Math.abs(LANES[c.lane] - playerState.x)
      const dy = Math.abs(c.y - (playerState.y + 0.9))
      if (dx < 1 && dy < 1.2) {
        c.taken = true
        c.mesh.visible = false
        const gain = 25 * multiplier
        score += gain
        addCombo()
        burstParticles(c.mesh.position, ACCENT, 6, 4)
        if (boss && boss.alive) {
          coinsSinceBossHit++
          if (coinsSinceBossHit >= 10) {
            coinsSinceBossHit = 0
            boss.hp--
            boss.hitFlash = 0.3
            shake = Math.max(shake, 0.3)
            flashDynLight(RED, 3, 0.3)
            callbacks.onBoss?.(boss.hp, boss.maxHp, true)
            if (boss.hp <= 0) {
              score += 500
              burstParticles(boss.group.position, RED, 30, 10)
              scene.remove(boss.group)
              boss.alive = false
              boss = null
              callbacks.onBoss?.(0, 0, false)
              spawnPowerup(Math.floor(Math.random() * 3), -20)
              shake = 0.8
            }
          }
        }
      }
    }

    // powerups
    for (const p of powerups) {
      if (p.taken || Math.abs(p.z) > 1.4) continue
      const dx = Math.abs(LANES[p.lane] - playerState.x)
      const dy = Math.abs(p.y - (playerState.y + 0.9))
      if (dx < 1.2 && dy < 1.5) {
        p.taken = true
        p.mesh.visible = false
        activatePowerup(p.kind)
        burstParticles(p.mesh.position, POWERUP_COLOR[p.kind], 14, 6)
      }
    }

    // projectiles
    for (const pr of projectiles) {
      const dx = Math.abs(pr.x - playerState.x)
      const dy = Math.abs(pr.y - (playerState.y + 0.9))
      const dz = Math.abs(pr.z)
      if (dz < 0.8 && dx < 0.7 && dy < 1) {
        if (effects.shield !== undefined) {
          deactivatePowerup('shield')
          shake = 0.5
          flashDynLight(MAGENTA, 4, 0.4)
          pr.mesh.visible = false
        } else {
          gameOver()
          return
        }
      }
    }
  }

  // ---------- main loop ----------
  function tick(t: number) {
    raf = requestAnimationFrame(tick)
    const dt = Math.min((t - last) / 1000, 0.05)
    last = t
    if (dt <= 0) return
    elapsed += dt

    const playing = status === 'playing' && !playerState.dead

    if (flashTimer > 0) {
      flashTimer = Math.max(flashTimer - dt, 0)
      if (flashTimer === 0) dynLight.intensity = 0
    }

    if (playing) {
      const speedMul = effects.slow !== undefined ? 0.5 : 1
      speed = (baseSpeed + Math.min(elapsed * 0.45, 18)) * speedMul
      const scoreMul = (effects.double !== undefined ? 2 : 1) * multiplier
      score += dt * speed * scoreMul
      callbacks.onScore?.(Math.floor(score))

      if (combo > 0) {
        comboTimer -= dt
        if (comboTimer <= 0) {
          combo = 0
          multiplier = 1
          callbacks.onCombo?.(0, 1)
        }
      }

      colorShift = Math.min(combo / 50, 1)

      if (!boss && score >= nextBossScore) {
        spawnBoss()
        nextBossScore += BOSS_SCORE_INTERVAL
      }

      furthestZ -= speed * dt
      while (furthestZ < nextSpawnZ) {
        const z = furthestZ - 60
        spawnPattern(z)
        nextSpawnZ = furthestZ - (24 + Math.random() * 12 - Math.min(elapsed * 0.2, 8))
      }

      for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i]
        o.z += speed * dt
        o.mesh.position.z = o.z
        if (o.z > DESPAWN_Z) {
          scene.remove(o.mesh)
          obstacles.splice(i, 1)
        }
      }
      for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i]
        c.z += speed * dt
        if (effects.magnet !== undefined && !c.taken) {
          const tx = playerState.x
          const ty = playerState.y + 0.9
          const dx = tx - LANES[c.lane]
          const dy = ty - c.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 6 && Math.abs(c.z) < 8) {
            c.lane = playerState.lane
            c.mesh.position.x += dx * Math.min(dt * 6, 1)
            c.mesh.position.y += dy * Math.min(dt * 6, 1)
            c.y = c.mesh.position.y
          }
        }
        c.mesh.position.z = c.z
        c.mesh.rotation.y += dt * 4
        c.mesh.rotation.x += dt * 2
        if (c.z > DESPAWN_Z || c.taken) {
          scene.remove(c.mesh)
          coins.splice(i, 1)
        }
      }
      for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i]
        p.z += speed * dt
        p.mesh.position.z = p.z
        p.mesh.rotation.y += dt * 2
        p.mesh.rotation.x += dt * 1.5
        p.mesh.position.y = 1.5 + Math.sin(elapsed * 3 + p.z) * 0.2
        if (p.z > DESPAWN_Z || p.taken) {
          scene.remove(p.mesh)
          powerups.splice(i, 1)
        }
      }

      for (let i = projectiles.length - 1; i >= 0; i--) {
        const pr = projectiles[i]
        pr.x += pr.vx * dt
        pr.y += pr.vy * dt
        pr.z += pr.vz * dt
        pr.mesh.position.set(pr.x, pr.y, pr.z)
        pr.mesh.rotation.x += dt * 5
        pr.mesh.rotation.y += dt * 7
        if (pr.z > DESPAWN_Z || pr.y < -2 || pr.y > 10) {
          scene.remove(pr.mesh)
          projectiles.splice(i, 1)
        }
      }

      if (boss && boss.alive) {
        // entrance animation (ease-out over ~1s)
        if (boss.spawnT < 1) {
          boss.spawnT = Math.min(boss.spawnT + dt * 1.2, 1)
          const e = 1 - Math.pow(1 - boss.spawnT, 3) // easeOutCubic
          boss.scale = e
        }

        // smooth Lissajous movement targets (no hard teleports)
        const t = elapsed
        boss.targetX = Math.sin(t * 0.7) * 2.6 + Math.sin(t * 1.3) * 0.6
        boss.targetY = 5 + Math.sin(t * 0.9) * 0.8
        // z breathes gently between -26 and -18, synced to a slow sine
        boss.targetZ = -22 + Math.sin(t * 0.5) * 4

        // damp render position toward targets (frame-rate independent)
        boss.renderX = THREE.MathUtils.damp(boss.renderX, boss.targetX, 4, dt)
        boss.renderY = THREE.MathUtils.damp(boss.renderY, boss.targetY, 4, dt)
        boss.renderZ = THREE.MathUtils.damp(boss.renderZ, boss.targetZ, 3, dt)
        boss.x = boss.renderX
        boss.y = boss.renderY
        boss.z = boss.renderZ

        boss.group.position.set(boss.x, boss.y, boss.z)

        // smooth spin (accumulated phase, not raw dt add to avoid hitching)
        boss.spinPhase += dt * 1.2
        boss.group.rotation.y = boss.spinPhase
        boss.group.rotation.z = Math.sin(t * 1.1) * 0.18
        boss.group.rotation.x = Math.sin(t * 0.6) * 0.12

        // smooth scale: base (entrance) + hit flash + idle pulse
        const idlePulse = 1 + Math.sin(t * 3) * 0.04
        let targetScale = boss.scale * idlePulse
        if (boss.hitFlash > 0) {
          boss.hitFlash = Math.max(boss.hitFlash - dt, 0)
          targetScale *= 1 + boss.hitFlash * 0.35
        }
        const cur = boss.group.scale.x
        const smoothed = THREE.MathUtils.damp(cur, targetScale, 12, dt)
        boss.group.scale.setScalar(smoothed)

        // fire only after entrance complete
        if (boss.spawnT >= 1) {
          boss.fireTimer -= dt
          if (boss.fireTimer <= 0) {
            fireProjectile()
            // fire rate quickens slightly as HP drops
            boss.fireTimer = 1.6 - (BOSS_MAX_HP - boss.hp) * 0.15
          }
        }
      }

      const scroll = speed * dt
      for (let i = 0; i < dashCount; i++) {
        dashes.getMatrixAt(i, dummy.matrix)
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)
        dummy.position.z += scroll
        if (dummy.position.z > 12) dummy.position.z -= 160
        dummy.updateMatrix()
        dashes.setMatrixAt(i, dummy.matrix)
      }
      dashes.instanceMatrix.needsUpdate = true
      for (let i = 0; i < monolithCount; i++) {
        const d = monolithData[i]
        d.z += scroll * 0.9
        if (d.z > 14) d.z -= monolithCount * 6
        dummy.position.set(d.x, d.y, d.z)
        dummy.scale.copy(d.s)
        dummy.rotation.set(0, 0, 0)
        dummy.updateMatrix()
        monoliths.setMatrixAt(i, dummy.matrix)
      }
      monoliths.instanceMatrix.needsUpdate = true
      gridHelper.position.z = (gridHelper.position.z + scroll) % 6.66

      const targetX = LANES[playerState.targetLane]
      playerState.x = THREE.MathUtils.damp(playerState.x, targetX, 12, dt)

      prevY = playerState.y

      if (playerState.grounded && playerState.y > 0) {
        const supported = obstacles.some(
          (o) =>
            o.kind === 'train' &&
            Math.abs(playerState.x - LANES[o.lane]) < 1.3 &&
            Math.abs(o.z) < 4.1 &&
            Math.abs(playerState.y - TRAIN_TOP) < 0.5
        )
        if (!supported) playerState.grounded = false
      }

      if (!playerState.grounded) {
        playerState.vy += GRAVITY * dt
        playerState.y += playerState.vy * dt
        if (playerState.y <= 0) {
          playerState.y = 0
          playerState.vy = 0
          playerState.grounded = true
        }
      }
      if (playerState.rolling > 0) playerState.rolling -= dt

      for (const k of ['magnet', 'double', 'slow'] as PowerupKind[]) {
        if (effects[k] !== undefined) {
          effects[k] = (effects[k] as number) - dt
          if ((effects[k] as number) <= 0) deactivatePowerup(k)
        }
      }

      checkCollisions()
    }

    // ---- animate player pose ----
    const runPhase = elapsed * (playing ? speed : 4) * 0.55
    if (!playerState.dead) {
      const targetScaleY = playerState.rolling > 0 ? 0.55 : 1
      player.scale.y = THREE.MathUtils.damp(player.scale.y, targetScaleY, 14, dt)
      player.position.x = playerState.x
      player.position.y =
        playerState.y + (playerState.grounded && playing ? Math.abs(Math.sin(runPhase)) * 0.08 : 0)
      player.rotation.z = THREE.MathUtils.damp(
        player.rotation.z,
        (LANES[playerState.targetLane] - playerState.x) * -0.25,
        10,
        dt
      )
      player.rotation.x = THREE.MathUtils.damp(
        player.rotation.x,
        playerState.grounded ? 0 : -0.25,
        8,
        dt
      )
      const swing = playerState.grounded && playing ? Math.sin(runPhase) * 0.9 : 0.4
      legL.rotation.x = swing
      legR.rotation.x = -swing
      armL.rotation.x = -swing * 0.8
      armR.rotation.x = swing * 0.8
      board.rotation.z = Math.sin(elapsed * 3) * 0.06
      if (effects.shield !== undefined) {
        shieldMesh.rotation.y += dt * 2
        shieldMesh.rotation.x += dt * 1.3
        const pulse = 0.35 + Math.sin(elapsed * 6) * 0.1
        ;(shieldMesh.material as THREE.MeshBasicMaterial).opacity = pulse
      }
      shadow.position.x = playerState.x
      shadow.position.z = 0
      shadow.position.y = playerState.y + 0.012
      const sh = playerState.grounded ? 1 : Math.max(0.25, 1 - playerState.y * 0.35)
      shadow.scale.setScalar(sh)
    } else {
      player.rotation.x += dt * 6
      player.position.y = Math.max(player.position.y - dt * 1.5, -3)
    }

    for (let i = bits.length - 1; i >= 0; i--) {
      const b = bits[i]
      b.life -= dt
      b.vel.y += GRAVITY * 0.6 * dt
      b.mesh.position.addScaledVector(b.vel, dt)
      b.mesh.rotation.x += dt * 7
      b.mesh.rotation.y += dt * 5
      if (b.life <= 0 || b.mesh.position.y < -2) {
        scene.remove(b.mesh)
        bits.splice(i, 1)
      }
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.life -= dt
      p.vel.y += GRAVITY * 0.4 * dt
      p.mesh.position.addScaledVector(p.vel, dt)
      if (p.life <= 0) {
        scene.remove(p.mesh)
        particles.splice(i, 1)
      }
    }

    const camTargetX = playerState.x * 0.45
    camera.position.x = THREE.MathUtils.damp(camera.position.x, camTargetX, 6, dt)
    camera.position.y = camBase.y + playerState.y * 0.25
    if (shake > 0) {
      shake = Math.max(shake - dt * 1.4, 0)
      camera.position.x += (Math.random() - 0.5) * shake * 0.5
      camera.position.y += (Math.random() - 0.5) * shake * 0.5
    }
    const targetFov = playing ? 62 + (speed - baseSpeed) * 0.7 + combo * 0.15 : 62
    camera.fov = THREE.MathUtils.damp(camera.fov, Math.min(targetFov, 92), 3, dt)
    camera.updateProjectionMatrix()
    camera.lookAt(playerState.x * 0.6, 1.4 + playerState.y * 0.2, -14)

    // dynamic skybox color shift based on combo
    const bgColor = new THREE.Color(BG)
    if (colorShift > 0) {
      const hue = (0.25 + colorShift * 0.5) % 1
      const shifted = new THREE.Color().setHSL(hue, 0.4, 0.06 + colorShift * 0.04)
      bgColor.lerp(shifted, colorShift * 0.6)
    }
    ;(scene.background as THREE.Color).copy(bgColor)
    ;(scene.fog as THREE.Fog).color.copy(bgColor)

    renderer.render(scene, camera)
  }

  // ---------- resize ----------
  function resize() {
    const parent = canvas.parentElement
    if (!parent) return
    const w = parent.clientWidth
    const h = parent.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  if (canvas.parentElement) ro.observe(canvas.parentElement)
  resize()

  // keyboard
  function onKey(e: KeyboardEvent) {
    if (e.repeat) return
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
        e.preventDefault()
        move(-1)
        break
      case 'ArrowRight':
      case 'd':
        e.preventDefault()
        move(1)
        break
      case 'ArrowUp':
      case 'w':
      case ' ':
        e.preventDefault()
        if (status === 'idle' || status === 'over') start()
        else jump()
        break
      case 'ArrowDown':
      case 's':
        e.preventDefault()
        roll()
        break
    }
  }
  window.addEventListener('keydown', onKey)

  raf = requestAnimationFrame((t) => {
    last = t
    tick(t)
  })

  return {
    start,
    jump,
    roll,
    moveLeft: () => move(-1),
    moveRight: () => move(1),
    getStatus: () => status,
    destroy() {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      ro.disconnect()
      resetWorld()
      trainMatCache.forEach((m) => m.dispose())
      powerupMatCache.forEach((m) => m.dispose())
      renderer.dispose()
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          const m = obj.material
          if (Array.isArray(m)) m.forEach((mm) => mm.dispose())
          else m.dispose()
        }
      })
    },
  }
}

export type RunnerEngine = ReturnType<typeof createRunnerEngine>
