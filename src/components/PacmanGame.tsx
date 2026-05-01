'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const CELL = 20
const ROWS = 22
const COLS = 28
const SPEED = 0.12
const POWER_UP_DURATION = 300

class Vector2D {
  constructor(public x: number, public y: number) {}

  add(other: Vector2D): Vector2D {
    return new Vector2D(this.x + other.x, this.y + other.y)
  }

  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar)
  }

  distanceTo(other: Vector2D): number {
    const dx = this.x - other.x
    const dy = this.y - other.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  normalize(): Vector2D {
    const mag = Math.sqrt(this.x * this.x + this.y * this.y)
    if (mag === 0) return new Vector2D(0, 0)
    return new Vector2D(this.x / mag, this.y / mag)
  }

  clone(): Vector2D {
    return new Vector2D(this.x, this.y)
  }

  equals(other: Vector2D): boolean {
    return this.x === other.x && this.y === other.y
  }

  static zero(): Vector2D { return new Vector2D(0, 0) }
  static up(): Vector2D { return new Vector2D(0, -1) }
  static down(): Vector2D { return new Vector2D(0, 1) }
  static left(): Vector2D { return new Vector2D(-1, 0) }
  static right(): Vector2D { return new Vector2D(1, 0) }
}

export default function PacmanGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [cherries, setCherries] = useState(0)
  const [powerUpActive, setPowerUpActive] = useState(false)
  const router = useRouter()

  const map = [
    "############################",
    "#............##............#",
    "#.####.#####.##.#####.####.#",
    "#.####.#####.##.#####.####.#",
    "#..........................#",
    "#.####.##.########.##.####.#",
    "#......##....##....##......#",
    "######.##### ## #####.######",
    "     #.##### ## #####.#     ",
    "     #.##          ##.#     ",
    "######.## ###  ### ##.######",
    "      .   #      #   .      ",
    "######.## ######## ##.######",
    "     #.##          ##.#     ",
    "     #.## ######## ##.#     ",
    "######.## ######## ##.######",
    "#............##............#",
    "#.####.#####.##.#####.####.#",
    "#...##................##...#",
    "###.##.##.########.##.##.###",
    "#............##............#",
    "############################"
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let pacman = {
      position: new Vector2D(14, 14),
      velocity: Vector2D.right(),
      nextVelocity: Vector2D.right(),
      mouth: 0,
      mouthOpening: true,
    }

    type GhostType = 'blinky' | 'pinky' | 'inky' | 'clyde'
    type Ghost = {
      position: Vector2D
      velocity: Vector2D
      color: string
      startPosition: Vector2D
      eaten: boolean
      respawnTimer: number
      type: GhostType
      cornerTarget: Vector2D
    }

    const ghosts: Ghost[] = [
      { position: new Vector2D(13, 10), velocity: Vector2D.left(), color: '#FF0000', startPosition: new Vector2D(13, 10), eaten: false, respawnTimer: 0, type: 'blinky', cornerTarget: new Vector2D(COLS - 2, 1) },
      { position: new Vector2D(14, 10), velocity: Vector2D.right(), color: '#FFB8FF', startPosition: new Vector2D(14, 10), eaten: false, respawnTimer: 0, type: 'pinky', cornerTarget: new Vector2D(1, 1) },
      { position: new Vector2D(12, 10), velocity: Vector2D.down(), color: '#00FFFF', startPosition: new Vector2D(12, 10), eaten: false, respawnTimer: 0, type: 'inky', cornerTarget: new Vector2D(COLS - 2, ROWS - 2) },
      { position: new Vector2D(15, 10), velocity: Vector2D.up(), color: '#FFB851', startPosition: new Vector2D(15, 10), eaten: false, respawnTimer: 0, type: 'clyde', cornerTarget: new Vector2D(1, ROWS - 2) },
    ]

    let pellets = new Set<string>()
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (map[r][c] === '.') pellets.add(`${r},${c}`)
      }
    }

    const cherryPositions = new Set<string>(['1,1', '1,26', '9,14'])
    let powerUpTimer = 0
    let isFlashing = false
    const initialPelletCount = pellets.size

    const canMove = (position: Vector2D): boolean => {
      const row = Math.floor(position.y)
      const col = Math.floor(position.x)
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false
      const tile = map[row]?.[col]
      return tile !== '#' && tile !== '-' && tile !== undefined
    }

    const getPossibleDirections = (): Vector2D[] => [
      Vector2D.right(), Vector2D.left(), Vector2D.down(), Vector2D.up()
    ]

    const getGhostTarget = (ghost: Ghost, isPowerUpActive: boolean): Vector2D => {
      if (isPowerUpActive) {
        return ghost.position.add(new Vector2D(ghost.position.x - pacman.position.x, ghost.position.y - pacman.position.y))
      }
      switch (ghost.type) {
        case 'blinky': return pacman.position.clone()
        case 'pinky': {
          const ahead = 4
          let t = pacman.position.clone()
          if (pacman.velocity.x > 0) t.x += ahead
          else if (pacman.velocity.x < 0) t.x -= ahead
          else if (pacman.velocity.y > 0) t.y += ahead
          else if (pacman.velocity.y < 0) { t.y -= ahead; t.x -= ahead }
          return t
        }
        case 'inky': {
          const blinky = ghosts.find(g => g.type === 'blinky')
          if (!blinky) return pacman.position.clone()
          const ahead = 2
          let inter = pacman.position.clone()
          if (pacman.velocity.x > 0) inter.x += ahead
          else if (pacman.velocity.x < 0) inter.x -= ahead
          else if (pacman.velocity.y > 0) inter.y += ahead
          else if (pacman.velocity.y < 0) inter.y -= ahead
          return new Vector2D(blinky.position.x + (inter.x - blinky.position.x) * 2, blinky.position.y + (inter.y - blinky.position.y) * 2)
        }
        case 'clyde':
          return ghost.position.distanceTo(pacman.position) > 8 ? pacman.position.clone() : ghost.cornerTarget.clone()
        default:
          return pacman.position.clone()
      }
    }

    const moveGhost = (ghost: Ghost, isPowerUpActive: boolean) => {
      type DS = { direction: Vector2D; score: number }
      const target = getGhostTarget(ghost, isPowerUpActive)
      const valid: DS[] = []
      for (const direction of getPossibleDirections()) {
        const testPos = ghost.position.add(direction.multiply(SPEED * 2))
        if (canMove(testPos)) {
          const isBackward = direction.x === -ghost.velocity.x && direction.y === -ghost.velocity.y
          let score = -testPos.distanceTo(target)
          if (!isPowerUpActive) {
            score += ghost.type === 'blinky' ? Math.random() * 5 : Math.random() * 15
            if (ghost.type === 'blinky' && pellets.size / initialPelletCount < 0.5) score *= 1.5
          } else {
            score += Math.random() * 20
          }
          if (isBackward) score -= 20
          valid.push({ direction, score })
        }
      }
      if (valid.length > 0) {
        valid.sort((a, b) => b.score - a.score)
        ghost.velocity = valid[0].direction.clone()
      }
    }

    const resetPositionsAfterHit = () => {
      pacman.position = new Vector2D(14, 14)
      pacman.velocity = Vector2D.right()
      pacman.nextVelocity = Vector2D.right()
      ghosts.forEach(ghost => {
        if (!ghost.eaten) {
          ghost.position = ghost.startPosition.clone()
          ghost.velocity = Vector2D.up()
        }
      })
    }

    const respawnGhost = (ghost: Ghost) => {
      ghost.position = ghost.startPosition.clone()
      ghost.velocity = Vector2D.up()
      ghost.eaten = false
      ghost.respawnTimer = 0
    }

    let pausedTicks = 0

    const update = () => {
      if (pausedTicks > 0) { pausedTicks--; return }

      const testNextPosition = pacman.position.add(pacman.nextVelocity.multiply(SPEED))
      if (canMove(testNextPosition)) pacman.velocity = pacman.nextVelocity.clone()

      const newPosition = pacman.position.add(pacman.velocity.multiply(SPEED))
      if (canMove(newPosition)) pacman.position = newPosition

      const cellRow = Math.floor(pacman.position.y)
      const cellCol = Math.floor(pacman.position.x)
      const key = `${cellRow},${cellCol}`

      if (pellets.has(key)) { pellets.delete(key); setScore(prev => prev + 10) }

      if (cherryPositions.has(key)) {
        cherryPositions.delete(key)
        setCherries(prev => prev + 1)
        setScore(prev => prev + 50)
        powerUpTimer = POWER_UP_DURATION
        setPowerUpActive(true)
      }

      if (powerUpTimer > 0) {
        powerUpTimer--
        isFlashing = powerUpTimer < 120 && Math.floor(powerUpTimer / 10) % 2 === 0
        if (powerUpTimer === 0) { setPowerUpActive(false); isFlashing = false }
      }

      pacman.mouth += pacman.mouthOpening ? 0.05 : -0.05
      if (pacman.mouth > 0.3) pacman.mouthOpening = false
      if (pacman.mouth < 0) pacman.mouthOpening = true

      const isPowerUpActive = powerUpTimer > 0
      ghosts.forEach(ghost => {
        if (ghost.eaten) {
          ghost.respawnTimer--
          if (ghost.respawnTimer <= 0) respawnGhost(ghost)
          return
        }
        let ghostSpeed = SPEED * 0.9
        if (ghost.type === 'blinky') {
          const pct = pellets.size / initialPelletCount
          if (pct < 0.5) ghostSpeed = SPEED * 1.0
          if (pct < 0.25) ghostSpeed = SPEED * 1.05
        }
        let changeChance = 0.02
        if (ghost.type === 'blinky') changeChance = 0.025
        if (ghost.type === 'inky') changeChance = 0.015
        if (ghost.type === 'clyde') changeChance = 0.03
        if (Math.random() < changeChance) moveGhost(ghost, isPowerUpActive)
        const attemptPos = ghost.position.add(ghost.velocity.multiply(ghostSpeed))
        if (canMove(attemptPos)) ghost.position = attemptPos
        else moveGhost(ghost, isPowerUpActive)
      })

      for (const ghost of ghosts) {
        if (ghost.eaten) continue
        if (ghost.position.distanceTo(pacman.position) < 0.7) {
          if (powerUpTimer > 0) {
            ghost.eaten = true
            ghost.respawnTimer = 180
            setScore(prev => prev + 200)
          } else {
            setLives(prev => {
              const next = prev - 1
              if (next <= 0) setGameOver(true)
              else { resetPositionsAfterHit(); pausedTicks = 20 }
              return next
            })
            break
          }
        }
      }

      if (pellets.size === 0) { setWon(true); setGameOver(true) }
    }

    const draw = () => {
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const tile = map[r]?.[c] ?? '#'
          if (tile === '#') {
            ctx.strokeStyle = '#00f6ff'
            ctx.lineWidth = 2
            ctx.strokeRect(c * CELL, r * CELL, CELL, CELL)
          } else if (tile === '-') {
            ctx.fillStyle = '#1a1a2e'
            ctx.fillRect(c * CELL, r * CELL, CELL, CELL)
          } else if (pellets.has(`${r},${c}`)) {
            ctx.fillStyle = '#FFD700'
            ctx.beginPath()
            ctx.arc(c * CELL + CELL / 2, r * CELL + CELL / 2, 3, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      cherryPositions.forEach(pos => {
        const [r, c] = pos.split(',').map(Number)
        ctx.font = 'bold 18px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🍒', c * CELL + CELL / 2, r * CELL + CELL / 2)
      })

      for (const ghost of ghosts) {
        if (ghost.eaten) continue
        const sx = ghost.position.x * CELL
        const sy = ghost.position.y * CELL
        let ghostColor = ghost.color
        if (powerUpTimer > 0) ghostColor = isFlashing ? 'white' : '#0066FF'
        ctx.fillStyle = ghostColor
        ctx.beginPath()
        ctx.arc(sx, sy - 3, CELL / 2 - 2, Math.PI, 0)
        ctx.lineTo(sx + CELL / 2 - 2, sy + CELL / 2 - 2)
        ctx.lineTo(sx + CELL / 4, sy + CELL / 4)
        ctx.lineTo(sx, sy + CELL / 2 - 2)
        ctx.lineTo(sx - CELL / 4, sy + CELL / 4)
        ctx.lineTo(sx - CELL / 2 + 2, sy + CELL / 2 - 2)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = 'white'
        ctx.beginPath()
        ctx.arc(sx - 4, sy - 3, 3.5, 0, Math.PI * 2)
        ctx.arc(sx + 4, sy - 3, 3.5, 0, Math.PI * 2)
        ctx.fill()
        if (powerUpTimer > 0 && !isFlashing) {
          ctx.fillStyle = '#FF0000'
          ctx.beginPath()
          ctx.arc(sx - 4, sy - 5, 2, 0, Math.PI * 2)
          ctx.arc(sx + 4, sy - 5, 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillStyle = '#000080'
          ctx.beginPath()
          ctx.arc(sx - 4 + ghost.velocity.x * 1.5, sy - 3 + ghost.velocity.y * 1.5, 2, 0, Math.PI * 2)
          ctx.arc(sx + 4 + ghost.velocity.x * 1.5, sy - 3 + ghost.velocity.y * 1.5, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.fillStyle = '#FFFF00'
      let rotation = 0
      if (pacman.velocity.x > 0) rotation = 0
      else if (pacman.velocity.x < 0) rotation = Math.PI
      else if (pacman.velocity.y < 0) rotation = -Math.PI / 2
      else if (pacman.velocity.y > 0) rotation = Math.PI / 2

      const centerX = pacman.position.x * CELL
      const centerY = pacman.position.y * CELL
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, CELL / 2 - 2, rotation + pacman.mouth * Math.PI, rotation + 2 * Math.PI - pacman.mouth * Math.PI)
      ctx.closePath()
      ctx.fill()

      if (!pacman.velocity.equals(Vector2D.zero())) {
        ctx.fillStyle = 'black'
        let eyeOffsetX = 0, eyeOffsetY = -5
        if (pacman.velocity.x > 0) eyeOffsetX += 3
        else if (pacman.velocity.x < 0) eyeOffsetX -= 3
        if (pacman.velocity.y > 0) eyeOffsetY += 8
        else if (pacman.velocity.y < 0) eyeOffsetY -= 3
        ctx.beginPath()
        ctx.arc(centerX + eyeOffsetX, centerY + eyeOffsetY, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    let rafId: number | null = null
    const loop = () => {
      update()
      draw()
      if (!gameOver) rafId = requestAnimationFrame(loop)
    }

    const handleKey = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault()
      const directionMap: Record<string, Vector2D> = {
        ArrowUp: Vector2D.up(),
        ArrowDown: Vector2D.down(),
        ArrowLeft: Vector2D.left(),
        ArrowRight: Vector2D.right(),
      }
      const newDir = directionMap[e.key]
      if (newDir) pacman.nextVelocity = newDir.clone()
    }

    window.addEventListener('keydown', handleKey)
    loop()

    return () => {
      window.removeEventListener('keydown', handleKey)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [gameOver, won])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen select-none overflow-hidden bg-black text-white">
      <h1 className="text-3xl font-bold mb-2 tracking-widest text-yellow-400">
        👻 GHOST-MAN
      </h1>
      <div className="flex gap-6 mb-2">
        <p className="text-gray-300">Puntaje: {score}</p>
        <p className="text-gray-300">Vidas: {lives}</p>
        <p className="font-bold text-red-400">Cerezas: {cherries}/3 🍒</p>
        {powerUpActive && <p className="font-bold text-blue-400 animate-pulse">⚡ POWER-UP ACTIVO ⚡</p>}
      </div>

      <canvas
        ref={canvasRef}
        width={COLS * CELL}
        height={ROWS * CELL}
        className="border-4 border-blue-500 rounded-lg shadow-[0_0_30px_#00f6ff]"
      />

      <p className="mt-4 text-sm animate-pulse text-gray-400">
        Usa las flechas ⬆️⬇️⬅️➡️ para moverte
      </p>
      <div className="mt-2 text-xs text-gray-500">
        <p>🍒 Come las cerezas para poder comer a los fantasmas</p>
        <p className="mt-1">
          <span className="text-red-500">●</span> Blinky (Rojo) - Persigue directamente |
          <span className="text-pink-400"> ●</span> Pinky (Rosa) - Emboscador |
          <span className="text-cyan-400"> ●</span> Inky (Cian) - Impredecible |
          <span className="text-orange-400"> ●</span> Clyde (Naranja) - Errático
        </p>
      </div>

      {won && (
        <div className="mt-6 text-center">
          <p className="text-green-400 text-2xl mb-4 animate-bounce">¡GANASTE! 🎉</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition transform hover:scale-105">
              Jugar de nuevo
            </button>
            <button onClick={() => router.push('/arcade')} className="px-6 py-3 bg-yellow-400 text-black rounded-lg hover:scale-105 transition transform">
              Volver al menú
            </button>
          </div>
        </div>
      )}

      {gameOver && !won && (
        <div className="mt-6 text-center">
          <p className="text-red-400 text-2xl mb-4">GAME OVER 👻</p>
          <p className="text-gray-400 mb-4">Cerezas: {cherries}/3 🍒</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition transform hover:scale-105">
              Reintentar
            </button>
            <button onClick={() => router.push('/arcade')} className="px-6 py-3 bg-yellow-400 text-black rounded-lg hover:scale-105 transition transform">
              Volver al menú
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
