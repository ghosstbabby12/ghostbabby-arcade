'use client'

import { useEffect, useRef, useState } from 'react'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const GRAVITY = 0.7
const JUMP_FORCE = -13
const MOVE_SPEED = 4.5
const WORLD_WIDTH = 3500

interface Player {
  x: number
  y: number
  vx: number
  vy: number
  direction: number
  animFrame: number
  onGround: boolean
}

interface Boo {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  hiding: boolean
  size: number
  speed: number
}

interface Turtle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  direction: number
  dead: boolean
  animFrame: number
}

interface Mushroom {
  id: number
  x: number
  y: number
  vy: number
  vx: number
  collected: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

interface Block {
  id: number
  x: number
  y: number
  width: number
  height: number
  hit: boolean
  bouncing: boolean
  bounceOffset: number
  testimonial: Testimonial | null
}

interface Testimonial {
  id: number
  name: string
  role: string
  text: string
  avatar: string
  stars: number
  x: number
  y: number
  vy: number
  collected: boolean
  floating: boolean
}

interface TestimonialData {
  id: number
  name: string
  role: string
  text: string
  avatar: string
  stars: number
}

interface Platform {
  x: number
  y: number
  width: number
  height: number
}

type CharacterType = 'mario' | 'luigi' | 'peach'

export default function MarioGhostHouseClassic() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [victory, setVictory] = useState(false)
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(200)
  const [lives, setLives] = useState(3)
  const [player, setPlayer] = useState<Player>({
    x: 100, y: 400, vx: 0, vy: 0, direction: 1, animFrame: 0, onGround: false
  })
  const [boos, setBoos] = useState<Boo[]>([{
    id: 0, x: 800, y: 300, vx: 0, vy: 0, hiding: false, size: 80, speed: 3.5
  }])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [turtles, setTurtles] = useState<Turtle[]>([])
  const [mushrooms, setMushrooms] = useState<Mushroom[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [keys, setKeys] = useState({ left: false, right: false, jump: false })
  const [cameraX, setCameraX] = useState(0)
  const [invincible, setInvincible] = useState(false)
  const [collectedTestimonials, setCollectedTestimonials] = useState<TestimonialData[]>([])
  const [hitEffect, setHitEffect] = useState<{x: number, y: number, show: boolean}>({x: 0, y: 0, show: false})
  const animationFrame = useRef<number>()

  const GOAL_X = WORLD_WIDTH - 300

  const testimonialData: TestimonialData[] = [
    { id: 0, name: 'Jesus Villota', role: 'CEO de Tech Solutions', text: '¡Excelente trabajo! Superó todas nuestras expectativas.', avatar: '👩‍💼', stars: 5 },
    { id: 1, name: 'Carlos Ruiz', role: 'CTO de StartupXYZ', text: 'Código limpio y bien documentado. Muy profesional.', avatar: '👨‍💻', stars: 5 },
    { id: 2, name: 'María López', role: 'Product Manager', text: 'Entrega a tiempo y comunicación impecable.', avatar: '👩‍🎨', stars: 5 },
    { id: 3, name: 'Diego Torres', role: 'Lead Developer', text: 'Gran habilidad técnica y trabajo en equipo.', avatar: '👨‍🔧', stars: 5 },
    { id: 4, name: 'Sofía Martínez', role: 'UX Designer', text: 'Atención al detalle y diseño excepcional.', avatar: '👩‍🎨', stars: 5 },
    { id: 5, name: 'Luis Fernández', role: 'Founder de AppCo', text: 'Soluciones innovadoras y creativas.', avatar: '👨‍💼', stars: 5 },
    { id: 6, name: 'Carmen Díaz', role: 'HR Manager', text: 'Profesional, puntual y confiable.', avatar: '👩‍💼', stars: 5 },
    { id: 7, name: 'Pablo Sánchez', role: 'Senior Engineer', text: 'Arquitectura sólida y escalable.', avatar: '👨‍🔬', stars: 5 },
  ]

  const generateCV = () => {
    // Descargar el PDF real del CV
    // Añadimos timestamp para evitar problemas de caché
    const timestamp = new Date().getTime()
    const a = document.createElement('a')
    a.href = `/CV_CAMILA_BASTIDAS.pdf?v=${timestamp}`
    a.download = 'CV_CAMILA_BASTIDAS.pdf'
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  useEffect(() => {
    // Mapa simplificado y más limpio
    const initialPlatforms: Platform[] = [
      // Piso principal continuo con menos huecos
      { x: 0, y: 520, width: 800, height: 80 },
      { x: 950, y: 520, width: 800, height: 80 },
      { x: 1900, y: 520, width: 800, height: 80 },
      { x: 2850, y: 520, width: 850, height: 80 },

      // Plataformas intermedias para alcanzar bloques
      { x: 280, y: 420, width: 120, height: 20 },
      { x: 680, y: 420, width: 120, height: 20 },
      { x: 1080, y: 420, width: 120, height: 20 },
      { x: 1480, y: 420, width: 120, height: 20 },
      { x: 1880, y: 420, width: 120, height: 20 },
      { x: 2280, y: 420, width: 120, height: 20 },
      { x: 2680, y: 420, width: 120, height: 20 },
      { x: 3080, y: 420, width: 120, height: 20 },
    ]
    setPlatforms(initialPlatforms)

    // Bloques perfectamente alineados sobre las plataformas
    const initialBlocks: Block[] = testimonialData.map((t, i) => ({
      id: i,
      x: 330 + (i * 400), // Centrados sobre las plataformas
      y: 330, // Altura perfecta para golpear desde las plataformas
      width: 40,
      height: 40,
      hit: false,
      bouncing: false,
      bounceOffset: 0,
      testimonial: null
    }))
    setBlocks(initialBlocks)

    // Tortugas enemigas - reducidas para menos dificultad
    const initialTurtles: Turtle[] = [
      { id: 0, x: 1200, y: 496, vx: 1.5, vy: 0, direction: 1, dead: false, animFrame: 0 },
      { id: 1, x: 2400, y: 496, vx: -1.5, vy: 0, direction: -1, dead: false, animFrame: 0 },
    ]
    setTurtles(initialTurtles)

    // Hongos de vida - reducidos
    const initialMushrooms: Mushroom[] = [
      { id: 0, x: 1500, y: 480, vy: 0, vx: 1, collected: false },
      { id: 1, x: 2800, y: 480, vy: 0, vx: 1, collected: false },
    ]
    setMushrooms(initialMushrooms)
  }, [])

  useEffect(() => {
    if (!gameStarted || gameOver || victory) return
    const timer = setInterval(() => {
      setTime(t => {
        if (t <= 1) {
          setGameOver(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [gameStarted, gameOver, victory])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setKeys(k => ({ ...k, left: true }))
      if (e.key === 'ArrowRight') setKeys(k => ({ ...k, right: true }))
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault()
        setKeys(k => ({ ...k, jump: true }))
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setKeys(k => ({ ...k, left: false }))
      if (e.key === 'ArrowRight') setKeys(k => ({ ...k, right: false }))
      if (e.key === ' ' || e.key === 'ArrowUp') setKeys(k => ({ ...k, jump: false }))
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useEffect(() => {
    if (!gameStarted || gameOver || victory) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let animTime = 0

    const drawPeach = (x: number, y: number, dir: number, frame: number, vy: number = 0) => {
      const screenX = x - cameraX

      ctx.save()

      // Squash & Stretch effect
      const squashStretch = vy > 5 ? 1.15 : vy < -5 ? 0.85 : 1
      const squashWidth = vy > 5 ? 0.9 : vy < -5 ? 1.1 : 1

      ctx.translate(screenX + 16, y + 23)
      ctx.scale(squashWidth, squashStretch)
      ctx.translate(-(screenX + 16), -(y + 23))

      // Sombra dinámica
      const shadowScale = Math.max(0.5, 1 - Math.abs(vy) * 0.02)
      ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * shadowScale})`
      ctx.fillRect(screenX + 8, y + 40, 16 * shadowScale, 4)

      const walkCycle = Math.floor(frame / 6) % 2

      // Pequeño rebote al caminar
      const bounceOffset = frame > 0 && player.onGround ? Math.sin(frame * 0.3) * 1 : 0
      const yPos = y - bounceOffset

      // Vestido (estilo pixel art)
      ctx.fillStyle = '#FF69B4'
      ctx.fillRect(screenX + 6, yPos + 18, 20, 4)
      ctx.fillRect(screenX + 4, yPos + 22, 24, 18)
      
      // Detalles vestido
      ctx.fillStyle = '#FF1493'
      ctx.fillRect(screenX + 4, yPos + 22, 24, 2)
      ctx.fillRect(screenX + 4, yPos + 30, 24, 2)

      // Brazos (con movimiento)
      const armSwing = walkCycle === 0 ? -1 : 1
      ctx.fillStyle = '#FDBCB4'
      ctx.fillRect(screenX + 2, yPos + 20 + armSwing, 4, 10)
      ctx.fillRect(screenX + 26, yPos + 20 - armSwing, 4, 10)

      // Guantes
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(screenX + 2, yPos + 28 + armSwing, 4, 4)
      ctx.fillRect(screenX + 26, yPos + 28 - armSwing, 4, 4)

      // Cabeza
      ctx.fillStyle = '#FDBCB4'
      ctx.fillRect(screenX + 8, yPos + 4, 16, 16)

      // Cabello
      ctx.fillStyle = '#FFD700'
      ctx.fillRect(screenX + 6, yPos + 2, 20, 10)

      // Corona
      ctx.fillStyle = '#FFD700'
      ctx.fillRect(screenX + 10, yPos, 12, 4)
      ctx.fillRect(screenX + 12, yPos - 2, 2, 2)
      ctx.fillRect(screenX + 18, yPos - 2, 2, 2)

      // Joya corona
      ctx.fillStyle = '#FF1493'
      ctx.fillRect(screenX + 15, yPos, 2, 2)

      // Ojos
      ctx.fillStyle = '#000000'
      ctx.fillRect(screenX + 10 + dir, yPos + 10, 2, 2)
      ctx.fillRect(screenX + 18 + dir, yPos + 10, 2, 2)

      // Boca
      ctx.fillStyle = '#FF69B4'
      ctx.fillRect(screenX + 14, yPos + 14, 4, 2)

      // Piernas (animadas con más movimiento)
      ctx.fillStyle = '#FDBCB4'
      if (walkCycle === 0) {
        ctx.fillRect(screenX + 10, yPos + 38, 4, 6)
        ctx.fillRect(screenX + 18, yPos + 38, 4, 6)
      } else {
        ctx.fillRect(screenX + 12, yPos + 38, 4, 6)
        ctx.fillRect(screenX + 16, yPos + 38, 4, 6)
      }

      // Zapatos
      ctx.fillStyle = '#FF1493'
      ctx.fillRect(screenX + 8, yPos + 42, 6, 4)
      ctx.fillRect(screenX + 18, yPos + 42, 6, 4)
      
      ctx.restore()
    }

    const drawMario = (x: number, y: number, dir: number, frame: number, vy: number = 0) => {
      const screenX = x - cameraX

      ctx.save()

      // Squash & Stretch effect
      const squashStretch = vy > 5 ? 1.15 : vy < -5 ? 0.85 : 1
      const squashWidth = vy > 5 ? 0.9 : vy < -5 ? 1.1 : 1

      ctx.translate(screenX + 16, y + 23)
      ctx.scale(squashWidth, squashStretch)
      ctx.translate(-(screenX + 16), -(y + 23))

      // Sombra dinámica
      const shadowScale = Math.max(0.5, 1 - Math.abs(vy) * 0.02)
      ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * shadowScale})`
      ctx.fillRect(screenX + 8, y + 40, 16 * shadowScale, 4)

      const walkCycle = Math.floor(frame / 6) % 2

      // Pequeño rebote al caminar
      const bounceOffset = frame > 0 && player.onGround ? Math.sin(frame * 0.3) * 1 : 0
      const yPos = y - bounceOffset

      // Overol (rojo)
      ctx.fillStyle = '#FF0000'
      ctx.fillRect(screenX + 6, yPos + 18, 20, 4)
      ctx.fillRect(screenX + 4, yPos + 22, 24, 18)

      // Botones
      ctx.fillStyle = '#FFFF00'
      ctx.fillRect(screenX + 8, yPos + 24, 3, 3)
      ctx.fillRect(screenX + 21, yPos + 24, 3, 3)

      // Brazos
      const armSwing = walkCycle === 0 ? -1 : 1
      ctx.fillStyle = '#FDBCB4'
      ctx.fillRect(screenX + 2, yPos + 20 + armSwing, 4, 10)
      ctx.fillRect(screenX + 26, yPos + 20 - armSwing, 4, 10)

      // Guantes blancos
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(screenX + 2, yPos + 28 + armSwing, 4, 4)
      ctx.fillRect(screenX + 26, yPos + 28 - armSwing, 4, 4)

      // Cabeza
      ctx.fillStyle = '#FDBCB4'
      ctx.fillRect(screenX + 8, yPos + 4, 16, 16)

      // Gorra (roja)
      ctx.fillStyle = '#FF0000'
      ctx.fillRect(screenX + 6, yPos + 2, 20, 8)
      ctx.fillRect(screenX + 8, yPos, 16, 4)

      // Logo M
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(screenX + 13, yPos + 2, 6, 4)
      ctx.fillStyle = '#FF0000'
      ctx.fillRect(screenX + 14, yPos + 3, 1, 2)
      ctx.fillRect(screenX + 16, yPos + 3, 1, 2)
      ctx.fillRect(screenX + 18, yPos + 3, 1, 2)

      // Cabello (marrón oscuro)
      ctx.fillStyle = '#5C4033'
      ctx.fillRect(screenX + 6, yPos + 8, 4, 4)
      ctx.fillRect(screenX + 22, yPos + 8, 4, 4)

      // Bigote
      ctx.fillStyle = '#5C4033'
      ctx.fillRect(screenX + 8, yPos + 12, 16, 4)

      // Ojos
      ctx.fillStyle = '#000000'
      ctx.fillRect(screenX + 10 + dir, yPos + 10, 2, 2)
      ctx.fillRect(screenX + 18 + dir, yPos + 10, 2, 2)

      // Nariz
      ctx.fillStyle = '#FDBCB4'
      ctx.fillRect(screenX + 14, yPos + 12, 4, 4)

      // Piernas (azules)
      ctx.fillStyle = '#0000FF'
      if (walkCycle === 0) {
        ctx.fillRect(screenX + 10, yPos + 38, 4, 6)
        ctx.fillRect(screenX + 18, yPos + 38, 4, 6)
      } else {
        ctx.fillRect(screenX + 12, yPos + 38, 4, 6)
        ctx.fillRect(screenX + 16, yPos + 38, 4, 6)
      }

      // Zapatos (marrones)
      ctx.fillStyle = '#8B4513'
      ctx.fillRect(screenX + 8, yPos + 42, 6, 4)
      ctx.fillRect(screenX + 18, yPos + 42, 6, 4)

      ctx.restore()
    }

    const drawLuigi = (x: number, y: number, dir: number, frame: number, vy: number = 0) => {
      const screenX = x - cameraX

      ctx.save()

      // Squash & Stretch effect
      const squashStretch = vy > 5 ? 1.15 : vy < -5 ? 0.85 : 1
      const squashWidth = vy > 5 ? 0.9 : vy < -5 ? 1.1 : 1

      ctx.translate(screenX + 16, y + 23)
      ctx.scale(squashWidth, squashStretch)
      ctx.translate(-(screenX + 16), -(y + 23))

      // Sombra dinámica
      const shadowScale = Math.max(0.5, 1 - Math.abs(vy) * 0.02)
      ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * shadowScale})`
      ctx.fillRect(screenX + 8, y + 40, 16 * shadowScale, 4)

      const walkCycle = Math.floor(frame / 6) % 2

      // Pequeño rebote al caminar (Luigi salta más alto)
      const bounceOffset = frame > 0 && player.onGround ? Math.sin(frame * 0.3) * 1.5 : 0
      const yPos = y - bounceOffset

      // Overol (verde)
      ctx.fillStyle = '#00AA00'
      ctx.fillRect(screenX + 6, yPos + 18, 20, 4)
      ctx.fillRect(screenX + 4, yPos + 22, 24, 18)

      // Botones
      ctx.fillStyle = '#FFFF00'
      ctx.fillRect(screenX + 8, yPos + 24, 3, 3)
      ctx.fillRect(screenX + 21, yPos + 24, 3, 3)

      // Brazos
      const armSwing = walkCycle === 0 ? -1 : 1
      ctx.fillStyle = '#FDBCB4'
      ctx.fillRect(screenX + 2, yPos + 20 + armSwing, 4, 10)
      ctx.fillRect(screenX + 26, yPos + 20 - armSwing, 4, 10)

      // Guantes blancos
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(screenX + 2, yPos + 28 + armSwing, 4, 4)
      ctx.fillRect(screenX + 26, yPos + 28 - armSwing, 4, 4)

      // Cabeza
      ctx.fillStyle = '#FDBCB4'
      ctx.fillRect(screenX + 8, yPos + 4, 16, 16)

      // Gorra (verde)
      ctx.fillStyle = '#00AA00'
      ctx.fillRect(screenX + 6, yPos + 2, 20, 8)
      ctx.fillRect(screenX + 8, yPos, 16, 4)

      // Logo L
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(screenX + 13, yPos + 2, 6, 4)
      ctx.fillStyle = '#00AA00'
      ctx.fillRect(screenX + 14, yPos + 3, 1, 2)
      ctx.fillRect(screenX + 17, yPos + 3, 2, 2)

      // Cabello (marrón)
      ctx.fillStyle = '#5C4033'
      ctx.fillRect(screenX + 6, yPos + 8, 4, 4)
      ctx.fillRect(screenX + 22, yPos + 8, 4, 4)

      // Bigote (más largo que Mario)
      ctx.fillStyle = '#5C4033'
      ctx.fillRect(screenX + 6, yPos + 12, 20, 4)

      // Ojos
      ctx.fillStyle = '#000000'
      ctx.fillRect(screenX + 10 + dir, yPos + 10, 2, 2)
      ctx.fillRect(screenX + 18 + dir, yPos + 10, 2, 2)

      // Nariz
      ctx.fillStyle = '#FDBCB4'
      ctx.fillRect(screenX + 14, yPos + 12, 4, 4)

      // Piernas (azul oscuro)
      ctx.fillStyle = '#000080'
      if (walkCycle === 0) {
        ctx.fillRect(screenX + 10, yPos + 38, 4, 6)
        ctx.fillRect(screenX + 18, yPos + 38, 4, 6)
      } else {
        ctx.fillRect(screenX + 12, yPos + 38, 4, 6)
        ctx.fillRect(screenX + 16, yPos + 38, 4, 6)
      }

      // Zapatos (marrones)
      ctx.fillStyle = '#8B4513'
      ctx.fillRect(screenX + 8, yPos + 42, 6, 4)
      ctx.fillRect(screenX + 18, yPos + 42, 6, 4)

      ctx.restore()
    }

    const drawBigBoo = (x: number, y: number, hiding: boolean, animTime: number, booSize: number = 80) => {
      const screenX = x - cameraX
      const size = booSize
      const floatY = y + Math.sin(animTime * 2) * 8 // Flotación más suave

      ctx.save()

      // Sombra simple debajo del Boo
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(screenX - 20, floatY + 45, 40, 6)

      // CUERPO BLANCO SIMPLE (estilo SMB3 clásico)
      ctx.fillStyle = '#FFFFFF'

      // Forma redondeada del cuerpo (pixel art)
      // Centro
      ctx.fillRect(screenX - 32, floatY - 24, 64, 48)

      // Lados redondeados
      ctx.fillRect(screenX - 36, floatY - 20, 4, 40)
      ctx.fillRect(screenX + 32, floatY - 20, 4, 40)
      ctx.fillRect(screenX - 40, floatY - 12, 4, 24)
      ctx.fillRect(screenX + 36, floatY - 12, 4, 24)

      // Parte superior redondeada
      ctx.fillRect(screenX - 28, floatY - 28, 56, 4)
      ctx.fillRect(screenX - 24, floatY - 32, 48, 4)
      ctx.fillRect(screenX - 16, floatY - 36, 32, 4)
      ctx.fillRect(screenX - 8, floatY - 38, 16, 2)

      // COLA ONDULADA (3 picos como SMB3)
      const wave1 = Math.sin(animTime * 2.5) * 2
      const wave2 = Math.sin(animTime * 2.5 + 1.2) * 2
      const wave3 = Math.sin(animTime * 2.5 + 2.4) * 2

      // Pico izquierdo
      ctx.fillRect(screenX - 24 + wave1, floatY + 24, 16, 8)
      ctx.fillRect(screenX - 20 + wave1, floatY + 32, 8, 6)
      ctx.fillRect(screenX - 16 + wave1, floatY + 38, 4, 3)

      // Pico central
      ctx.fillRect(screenX - 8 + wave2, floatY + 24, 16, 10)
      ctx.fillRect(screenX - 4 + wave2, floatY + 34, 8, 6)
      ctx.fillRect(screenX + wave2, floatY + 40, 4, 3)

      // Pico derecho
      ctx.fillRect(screenX + 8 + wave3, floatY + 24, 16, 8)
      ctx.fillRect(screenX + 12 + wave3, floatY + 32, 8, 6)
      ctx.fillRect(screenX + 16 + wave3, floatY + 38, 4, 3)

      // Contorno negro suave para definir la forma
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.lineWidth = 1
      ctx.strokeRect(screenX - 32, floatY - 24, 64, 48)

      // Ya no necesitamos glow ni sombras complejas - todo está en el cuerpo principal arriba

      if (hiding) {
        // BOO TÍMIDO (estilo SMB3 simple)

        // Rubor rosado
        ctx.fillStyle = 'rgba(255, 150, 200, 0.5)'
        ctx.fillRect(screenX - 8, floatY - 8, 4, 4)
        ctx.fillRect(screenX + 4, floatY - 8, 4, 4)

        // Brazos/manos simples cubriendo la cara
        ctx.fillStyle = '#FFFFFF'

        // Brazo izquierdo
        ctx.fillRect(screenX - 28, floatY - 12, 12, 24)
        ctx.fillRect(screenX - 32, floatY - 8, 4, 16)

        // Brazo derecho
        ctx.fillRect(screenX + 16, floatY - 12, 12, 24)
        ctx.fillRect(screenX + 28, floatY - 8, 4, 16)

        // Ojos tímidos pequeños asomándose
        ctx.fillStyle = '#000000'
        ctx.fillRect(screenX - 12, floatY - 2, 4, 4)
        ctx.fillRect(screenX + 8, floatY - 2, 4, 4)

        // Brillo en ojos tímidos
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(screenX - 11, floatY - 1, 2, 2)
        ctx.fillRect(screenX + 9, floatY - 1, 2, 2)

      } else {
        // BOO ENOJADO (estilo SMB3 clásico - simple y efectivo)

        // Ojos ovales grandes negros (estilo clásico)
        ctx.fillStyle = '#000000'

        // Ojo izquierdo
        ctx.fillRect(screenX - 24, floatY - 16, 12, 20)
        ctx.fillRect(screenX - 26, floatY - 12, 2, 12)
        ctx.fillRect(screenX - 22, floatY - 18, 8, 2)
        ctx.fillRect(screenX - 22, floatY + 4, 8, 2)

        // Ojo derecho
        ctx.fillRect(screenX + 12, floatY - 16, 12, 20)
        ctx.fillRect(screenX + 24, floatY - 12, 2, 12)
        ctx.fillRect(screenX + 14, floatY - 18, 8, 2)
        ctx.fillRect(screenX + 14, floatY + 4, 8, 2)

        // Brillo blanco en los ojos
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(screenX - 22, floatY - 14, 4, 6)
        ctx.fillRect(screenX + 14, floatY - 14, 4, 6)

        // Boca en "O" (sorpresa/susto)
        ctx.fillStyle = '#000000'

        // Contorno de la boca
        ctx.fillRect(screenX - 8, floatY + 8, 16, 16)
        ctx.fillRect(screenX - 10, floatY + 10, 2, 12)
        ctx.fillRect(screenX + 8, floatY + 10, 2, 12)
        ctx.fillRect(screenX - 6, floatY + 6, 12, 2)
        ctx.fillRect(screenX - 6, floatY + 24, 12, 2)

        // Interior oscuro de la boca
        ctx.fillStyle = '#660000'
        ctx.fillRect(screenX - 6, floatY + 10, 12, 12)

        // Lengua simple
        ctx.fillStyle = '#FF1493'
        ctx.fillRect(screenX - 4, floatY + 16, 8, 4)
      }

      ctx.restore()
    }

    const drawBlock = (block: Block) => {
      const screenX = block.x - cameraX
      const y = block.y - block.bounceOffset

      if (block.hit) {
        // Bloque usado (marrón oscuro)
        ctx.fillStyle = '#8B4513'
        ctx.fillRect(screenX, y, block.width, block.height)

        ctx.fillStyle = '#654321'
        ctx.fillRect(screenX, y, block.width, 4)
        ctx.fillRect(screenX, y, 4, block.height)

        ctx.fillStyle = '#5D4E37'
        ctx.fillRect(screenX + 4, y + 4, 32, 32)

        // Grietas
        ctx.fillStyle = '#3D2E17'
        ctx.fillRect(screenX + 10, y + 8, 2, 24)
        ctx.fillRect(screenX + 28, y + 8, 2, 24)
      } else {
        // Bloque activo (dorado brillante)
        const pulse = Math.sin(animTime * 5) * 2

        ctx.fillStyle = '#FFD700'
        ctx.shadowBlur = 15 + pulse
        ctx.shadowColor = '#FFD700'
        ctx.fillRect(screenX, y, block.width, block.height)
        ctx.shadowBlur = 0

        // Bordes 3D
        ctx.fillStyle = '#FFED4E'
        ctx.fillRect(screenX, y, block.width, 4)
        ctx.fillRect(screenX, y, 4, block.height)

        ctx.fillStyle = '#B8860B'
        ctx.fillRect(screenX, y + 36, block.width, 4)
        ctx.fillRect(screenX + 36, y, 4, block.height)

        // Símbolo ?
        ctx.fillStyle = '#FFFFFF'
        ctx.shadowBlur = 5
        ctx.shadowColor = '#FFFFFF'
        ctx.font = 'bold 28px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('?', screenX + 20, y + 20 + pulse)
        ctx.shadowBlur = 0
      }
    }

    const drawTestimonial = (t: Testimonial) => {
      const screenX = t.x - cameraX
      
      if (t.floating) {
        // Testimonial flotante con glow
        ctx.save()
        ctx.translate(screenX, t.y)
        
        // Glow dorado
        ctx.shadowBlur = 25
        ctx.shadowColor = '#FFD700'
        
        // Carta de testimonial (pixel art)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(-22, -22, 44, 44)
        
        // Borde
        ctx.strokeStyle = '#FFD700'
        ctx.lineWidth = 3
        ctx.strokeRect(-22, -22, 44, 44)
        
        ctx.shadowBlur = 0
        
        // Barra superior
        ctx.fillStyle = '#FFD700'
        ctx.fillRect(-20, -20, 40, 6)
        
        // Avatar grande
        ctx.font = '28px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(t.avatar, 0, 4)
        
        // Estrellas
        ctx.font = '14px Arial'
        ctx.fillStyle = '#FFD700'
        ctx.fillText('⭐'.repeat(t.stars), 0, 18)
        
        // Efecto de brillo giratorio
        const sparkles = 8
        for (let i = 0; i < sparkles; i++) {
          const angle = (Date.now() * 0.003 + i * Math.PI * 2 / sparkles)
          const dist = 35 + Math.sin(Date.now() * 0.005) * 5
          const sx = Math.cos(angle) * dist
          const sy = Math.sin(angle) * dist
          
          ctx.fillStyle = '#FFD700'
          ctx.beginPath()
          ctx.arc(sx, sy, 2, 0, Math.PI * 2)
          ctx.fill()
        }
        
        ctx.restore()
      }
    }

    const drawFlag = (animTime: number) => {
      const screenX = GOAL_X - cameraX
      const y = 200

      // Asta (pixel art)
      ctx.fillStyle = '#FFD700'
      ctx.fillRect(screenX, y, 8, 320)

      // Anillos
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#FFA500' : '#FFD700'
        ctx.fillRect(screenX - 2, y + i * 50, 12, 8)
      }

      // Bandera ondeante (pixel style)
      const wave = Math.floor(Math.sin(animTime * 3) * 3)
      ctx.fillStyle = victory ? '#FFD700' : '#FF69B4'
      ctx.fillRect(screenX + 8, y + 20, 60 + wave, 50)

      // Borde bandera
      ctx.strokeStyle = victory ? '#FFA500' : '#C71585'
      ctx.lineWidth = 2
      ctx.strokeRect(screenX + 8, y + 20, 60 + wave, 50)

      // Estrella
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 32px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('★', screenX + 38, y + 52)
    }

    const drawTurtle = (turtle: Turtle, animTime: number) => {
      const screenX = turtle.x - cameraX
      const walkCycle = Math.floor(turtle.animFrame / 8) % 2

      ctx.save()

      if (turtle.dead) {
        // Tortuga muerta (caparazón volteado)
        ctx.fillStyle = '#228B22'
        ctx.fillRect(screenX + 4, turtle.y + 8, 24, 16)

        // Patrón del caparazón
        ctx.fillStyle = '#FFFF00'
        ctx.fillRect(screenX + 8, turtle.y + 10, 4, 4)
        ctx.fillRect(screenX + 16, turtle.y + 10, 4, 4)
        ctx.fillRect(screenX + 12, turtle.y + 16, 4, 4)

        // Borde
        ctx.strokeStyle = '#006400'
        ctx.lineWidth = 2
        ctx.strokeRect(screenX + 4, turtle.y + 8, 24, 16)
      } else {
        // Caparazón
        ctx.fillStyle = '#228B22'
        ctx.fillRect(screenX + 4, turtle.y, 24, 20)

        // Patrón hexagonal del caparazón
        ctx.fillStyle = '#FFFF00'
        ctx.fillRect(screenX + 8, turtle.y + 4, 4, 4)
        ctx.fillRect(screenX + 16, turtle.y + 4, 4, 4)
        ctx.fillRect(screenX + 12, turtle.y + 8, 4, 4)
        ctx.fillRect(screenX + 8, turtle.y + 12, 4, 4)
        ctx.fillRect(screenX + 16, turtle.y + 12, 4, 4)

        // Borde del caparazón
        ctx.strokeStyle = '#006400'
        ctx.lineWidth = 2
        ctx.strokeRect(screenX + 4, turtle.y, 24, 20)

        // Cabeza
        ctx.fillStyle = '#90EE90'
        const headX = turtle.direction > 0 ? screenX + 26 : screenX + 2
        ctx.fillRect(headX, turtle.y + 8, 6, 8)

        // Ojo
        ctx.fillStyle = '#000000'
        ctx.fillRect(headX + (turtle.direction > 0 ? 3 : 1), turtle.y + 10, 2, 2)

        // Patas (animadas)
        ctx.fillStyle = '#90EE90'
        if (walkCycle === 0) {
          // Patas delanteras
          ctx.fillRect(screenX + 2, turtle.y + 18, 4, 6)
          ctx.fillRect(screenX + 26, turtle.y + 18, 4, 6)
          // Patas traseras
          ctx.fillRect(screenX + 8, turtle.y + 20, 4, 4)
          ctx.fillRect(screenX + 20, turtle.y + 20, 4, 4)
        } else {
          // Patas delanteras
          ctx.fillRect(screenX + 2, turtle.y + 20, 4, 4)
          ctx.fillRect(screenX + 26, turtle.y + 20, 4, 4)
          // Patas traseras
          ctx.fillRect(screenX + 8, turtle.y + 18, 4, 6)
          ctx.fillRect(screenX + 20, turtle.y + 18, 4, 6)
        }
      }

      ctx.restore()
    }

    const drawMushroom = (mushroom: Mushroom, animTime: number) => {
      const screenX = mushroom.x - cameraX
      const bounce = Math.sin(animTime * 5) * 2

      ctx.save()

      // Sombra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(screenX + 4, mushroom.y + 22, 16, 4)

      // Tallo
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(screenX + 8, mushroom.y + 12 + bounce, 8, 12)

      // Borde del tallo
      ctx.strokeStyle = '#E0E0E0'
      ctx.lineWidth = 1
      ctx.strokeRect(screenX + 8, mushroom.y + 12 + bounce, 8, 12)

      // Sombrero (rojo con puntos blancos)
      ctx.fillStyle = '#FF0000'
      ctx.fillRect(screenX + 4, mushroom.y + 8 + bounce, 16, 8)
      ctx.fillRect(screenX + 2, mushroom.y + 10 + bounce, 20, 4)

      // Parte superior redondeada
      ctx.fillRect(screenX + 6, mushroom.y + 6 + bounce, 12, 2)
      ctx.fillRect(screenX + 8, mushroom.y + 4 + bounce, 8, 2)

      // Puntos blancos
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(screenX + 6, mushroom.y + 8 + bounce, 3, 3)
      ctx.fillRect(screenX + 15, mushroom.y + 8 + bounce, 3, 3)
      ctx.fillRect(screenX + 10, mushroom.y + 11 + bounce, 4, 4)

      // Brillo en el sombrero
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.fillRect(screenX + 8, mushroom.y + 6 + bounce, 4, 4)

      // Glow de vida
      ctx.shadowBlur = 10
      ctx.shadowColor = '#FF0000'
      ctx.strokeStyle = '#FF0000'
      ctx.lineWidth = 1
      ctx.strokeRect(screenX + 4, mushroom.y + 8 + bounce, 16, 8)
      ctx.shadowBlur = 0

      ctx.restore()
    }

    const animate = () => {
      animTime += 0.016

      // Fondo oscuro estilo Ghost House
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Patrón de fondo (arquitectura fantasmal)
      ctx.fillStyle = 'rgba(40, 40, 80, 0.3)'
      for (let i = 0; i < 20; i++) {
        const x = (i * 80 - (cameraX * 0.3)) % CANVAS_WIDTH
        ctx.fillRect(x, 0, 60, CANVAS_HEIGHT)
      }

      // Ventanas fantasmales
      ctx.fillStyle = 'rgba(100, 100, 150, 0.2)'
      for (let i = 0; i < 10; i++) {
        const x = (i * 150 - (cameraX * 0.2)) % CANVAS_WIDTH
        for (let j = 0; j < 3; j++) {
          ctx.fillRect(x + 20, 50 + j * 150, 40, 60)
        }
      }

      // CASTILLO al final del nivel (estilo Mario Bros)
      const castleX = 3300
      const castleScreenX = castleX - cameraX

      // Dibujar solo si está visible
      if (castleScreenX > -300 && castleScreenX < CANVAS_WIDTH + 100) {
        // Color gris del castillo
        const castleGray = '#A0A0A0'
        const castleDark = '#606060'
        const castleLight = '#C0C0C0'

        // Base del castillo
        ctx.fillStyle = castleGray
        ctx.fillRect(castleScreenX, 360, 200, 160)

        // Sombras laterales
        ctx.fillStyle = castleDark
        ctx.fillRect(castleScreenX + 190, 360, 10, 160)

        // Highlights
        ctx.fillStyle = castleLight
        ctx.fillRect(castleScreenX, 360, 10, 160)

        // Torres laterales
        ctx.fillStyle = castleGray
        ctx.fillRect(castleScreenX - 20, 280, 60, 240) // Torre izquierda
        ctx.fillRect(castleScreenX + 160, 280, 60, 240) // Torre derecha

        // Almenas de las torres
        for (let i = 0; i < 3; i++) {
          // Torre izquierda
          ctx.fillRect(castleScreenX - 20 + (i * 20), 270, 15, 20)
          // Torre derecha
          ctx.fillRect(castleScreenX + 160 + (i * 20), 270, 15, 20)
        }

        // Almenas superiores del castillo principal
        for (let i = 0; i < 8; i++) {
          ctx.fillRect(castleScreenX + (i * 25), 350, 20, 20)
        }

        // Puerta del castillo (arco)
        ctx.fillStyle = '#000000'
        ctx.fillRect(castleScreenX + 75, 440, 50, 80)

        // Arco superior de la puerta
        ctx.beginPath()
        ctx.arc(castleScreenX + 100, 440, 25, Math.PI, 0, true)
        ctx.fill()

        // Ventanas
        ctx.fillStyle = '#4A4A4A'
        ctx.fillRect(castleScreenX + 40, 400, 30, 40)
        ctx.fillRect(castleScreenX + 130, 400, 30, 40)

        // Ventanas de las torres
        ctx.fillRect(castleScreenX - 5, 320, 20, 25)
        ctx.fillRect(castleScreenX + 175, 320, 20, 25)

        // Bandera en la torre izquierda
        ctx.fillStyle = '#8B4513'
        ctx.fillRect(castleScreenX + 5, 250, 4, 30)

        // Bandera ondulante
        const flagWave = Math.sin(animTime * 3) * 2
        ctx.fillStyle = '#FF0000'
        ctx.beginPath()
        ctx.moveTo(castleScreenX + 9, 250)
        ctx.lineTo(castleScreenX + 30 + flagWave, 255)
        ctx.lineTo(castleScreenX + 9, 260)
        ctx.closePath()
        ctx.fill()
      }

      // Dibujar huecos/abismos MUY VISIBLES (antes de las plataformas)
      const mainFloorY = 520
      const sortedPlatforms = [...platforms].filter(p => p.y === mainFloorY).sort((a, b) => a.x - b.x)

      sortedPlatforms.forEach((platform, i) => {
        if (i < sortedPlatforms.length - 1) {
          const nextPlatform = sortedPlatforms[i + 1]
          const gapStart = platform.x + platform.width
          const gapEnd = nextPlatform.x
          const gapWidth = gapEnd - gapStart

          if (gapWidth > 50) { // Si hay un hueco significativo
            const screenX = gapStart - cameraX

            // FONDO DEL ABISMO - MUY OSCURO Y CONTRASTANTE
            const gradient = ctx.createLinearGradient(screenX, mainFloorY, screenX, CANVAS_HEIGHT)
            gradient.addColorStop(0, '#000000')
            gradient.addColorStop(0.3, '#1a0033')
            gradient.addColorStop(0.6, '#0d0015')
            gradient.addColorStop(1, '#000000')
            ctx.fillStyle = gradient
            ctx.fillRect(screenX, mainFloorY, gapWidth, CANVAS_HEIGHT - mainFloorY)

            // BORDE BRILLANTE DEL ABISMO (efecto de profundidad)
            ctx.strokeStyle = '#ff0000'
            ctx.lineWidth = 6
            ctx.strokeRect(screenX, mainFloorY, gapWidth, CANVAS_HEIGHT - mainFloorY)

            // LÍNEAS DE PROFUNDIDAD BRILLANTES
            ctx.strokeStyle = '#ff4444'
            ctx.lineWidth = 3
            for (let j = 0; j < 8; j++) {
              const y = mainFloorY + 80 + j * 30
              ctx.beginPath()
              ctx.moveTo(screenX + 5, y)
              ctx.lineTo(screenX + gapWidth - 5, y)
              ctx.stroke()
            }

            // BARRAS DE ADVERTENCIA IZQUIERDA (muy visibles)
            ctx.fillStyle = '#ff0000'
            ctx.fillRect(screenX - 20, mainFloorY, 20, 100)
            ctx.fillStyle = '#ffff00'
            for (let k = 0; k < 4; k++) {
              ctx.fillRect(screenX - 20, mainFloorY + k * 25, 20, 10)
            }

            // BARRAS DE ADVERTENCIA DERECHA (muy visibles)
            ctx.fillStyle = '#ff0000'
            ctx.fillRect(screenX + gapWidth, mainFloorY, 20, 100)
            ctx.fillStyle = '#ffff00'
            for (let k = 0; k < 4; k++) {
              ctx.fillRect(screenX + gapWidth, mainFloorY + k * 25, 20, 10)
            }

            // LÍNEAS DIAGONALES DE ADVERTENCIA (patrón de peligro)
            ctx.strokeStyle = '#ffff00'
            ctx.lineWidth = 5
            for (let d = 0; d < gapWidth / 40; d++) {
              ctx.beginPath()
              ctx.moveTo(screenX + d * 40, mainFloorY)
              ctx.lineTo(screenX + d * 40 + 30, mainFloorY + 30)
              ctx.stroke()

              ctx.beginPath()
              ctx.moveTo(screenX + d * 40 + 30, mainFloorY)
              ctx.lineTo(screenX + d * 40, mainFloorY + 30)
              ctx.stroke()
            }

            // TEXTO DE ADVERTENCIA
            ctx.fillStyle = '#ff0000'
            ctx.font = 'bold 24px Arial'
            ctx.textAlign = 'center'
            ctx.fillText('⚠ DANGER ⚠', screenX + gapWidth / 2, mainFloorY + 50)

            // EFECTO DE PULSACIÓN (animación)
            const pulseIntensity = Math.abs(Math.sin(Date.now() * 0.005)) * 0.5 + 0.5
            ctx.fillStyle = `rgba(255, 0, 0, ${pulseIntensity * 0.3})`
            ctx.fillRect(screenX, mainFloorY, gapWidth, 100)
          }
        }
      })

      // Plataformas estilo Super Mario Bros (ladrillos blancos/grises)
      platforms.forEach(platform => {
        const screenX = platform.x - cameraX
        const brickWidth = 32
        const brickHeight = 16

        // Calcular cuántos ladrillos caben
        const bricksX = Math.ceil(platform.width / brickWidth)
        const bricksY = Math.ceil(platform.height / brickHeight)

        for (let row = 0; row < bricksY; row++) {
          for (let col = 0; col < bricksX; col++) {
            const brickX = screenX + (col * brickWidth)
            const brickY = platform.y + (row * brickHeight)

            // Fondo del ladrillo (gris claro/blanco)
            ctx.fillStyle = '#D0D0D0'
            ctx.fillRect(brickX, brickY, brickWidth, brickHeight)

            // Highlight superior (blanco)
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(brickX, brickY, brickWidth, 2)
            ctx.fillRect(brickX, brickY, 2, brickHeight)

            // Sombra inferior (gris oscuro)
            ctx.fillStyle = '#808080'
            ctx.fillRect(brickX, brickY + brickHeight - 2, brickWidth, 2)
            ctx.fillRect(brickX + brickWidth - 2, brickY, 2, brickHeight)

            // División central del ladrillo
            ctx.fillStyle = '#A0A0A0'
            ctx.fillRect(brickX + brickWidth / 2 - 1, brickY + 2, 2, brickHeight - 4)

            // Detalles internos (puntos grises)
            ctx.fillStyle = '#A0A0A0'
            ctx.fillRect(brickX + 4, brickY + 4, 2, 2)
            ctx.fillRect(brickX + brickWidth - 6, brickY + 4, 2, 2)
            ctx.fillRect(brickX + 4, brickY + brickHeight - 6, 2, 2)
            ctx.fillRect(brickX + brickWidth - 6, brickY + brickHeight - 6, 2, 2)
          }
        }
      })

      // Bloques
      blocks.forEach(block => drawBlock(block))

      // Testimonials flotantes (efecto visual)
      testimonials.forEach(t => drawTestimonial(t))

      // Bandera
      drawFlag(animTime)

      // Efecto HIT cuando se golpea un bloque
      if (hitEffect.show) {
        const screenX = hitEffect.x - cameraX
        ctx.save()
        ctx.translate(screenX, hitEffect.y)
        
        ctx.shadowBlur = 20
        ctx.shadowColor = '#FFD700'
        
        ctx.fillStyle = '#FFD700'
        ctx.font = 'bold 24px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('HIT!', 0, 0)
        
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 20px monospace'
        ctx.fillText('+100', 0, 25)
        
        ctx.shadowBlur = 0
        ctx.restore()
      }

      // Tortugas
      turtles.forEach(turtle => {
        if (!turtle.dead || turtle.vy !== 0) {
          drawTurtle(turtle, animTime)
        }
      })

      // Hongos
      mushrooms.forEach(mushroom => {
        if (!mushroom.collected) {
          drawMushroom(mushroom, animTime)
        }
      })

      // Boos
      boos.forEach(boo => {
        drawBigBoo(boo.x, boo.y, boo.hiding, animTime)
      })

      // Dibujar personaje seleccionado
      if (invincible && Math.floor(animTime * 10) % 2 === 0) {
        ctx.globalAlpha = 0.5
      }
      if (selectedCharacter === 'mario') {
        drawMario(player.x, player.y, player.direction, player.animFrame, player.vy)
      } else if (selectedCharacter === 'luigi') {
        drawLuigi(player.x, player.y, player.direction, player.animFrame, player.vy)
      } else {
        drawPeach(player.x, player.y, player.direction, player.animFrame, player.vy)
      }
      ctx.globalAlpha = 1

      // Partículas
      particles.forEach(particle => {
        const screenX = particle.x - cameraX
        const alpha = particle.life / particle.maxLife
        ctx.fillStyle = particle.color.replace('1)', `${alpha})`)
        ctx.fillRect(screenX, particle.y, particle.size, particle.size)
      })

      // HUD (estilo SMB)
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, CANVAS_WIDTH, 50)

      ctx.fillStyle = '#FFFFFF'
      ctx.font = '20px monospace'
      ctx.textAlign = 'left'
      const characterName = selectedCharacter === 'mario' ? 'MARIO' : selectedCharacter === 'luigi' ? 'LUIGI' : 'PEACH'
      ctx.fillText(characterName, 20, 30)
      
      ctx.fillStyle = '#FFD700'
      ctx.fillText('★' + score.toString().padStart(6, '0'), 150, 30)
      
      ctx.fillStyle = '#FFFFFF'
      ctx.textAlign = 'center'
      ctx.fillText('TIME', CANVAS_WIDTH / 2, 20)
      ctx.fillText(time.toString().padStart(3, '0'), CANVAS_WIDTH / 2, 40)
      
      ctx.fillStyle = '#FF1493'
      ctx.textAlign = 'right'
      ctx.fillText('x' + lives, CANVAS_WIDTH - 20, 30)
      ctx.fillText('👑', CANVAS_WIDTH - 60, 30)
      
      // Barra inferior de testimonios recolectados
      const bottomBarHeight = 80
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, CANVAS_HEIGHT - bottomBarHeight, CANVAS_WIDTH, bottomBarHeight)
      
      // Borde superior de la barra
      ctx.fillStyle = '#FFD700'
      ctx.fillRect(0, CANVAS_HEIGHT - bottomBarHeight, CANVAS_WIDTH, 3)
      
      // Título de la barra
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 16px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`TESTIMONIOS: ${collectedTestimonials.length}/${testimonialData.length}`, 10, CANVAS_HEIGHT - bottomBarHeight + 20)
      
      // Mostrar testimonios recolectados
      collectedTestimonials.forEach((testimonial, index) => {
        const x = 10 + (index * 90)
        const y = CANVAS_HEIGHT - bottomBarHeight + 30
        
        // Fondo del testimonial
        ctx.fillStyle = '#1a1a1a'
        ctx.fillRect(x, y, 85, 45)
        
        // Borde
        ctx.strokeStyle = '#FFD700'
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, 85, 45)
        
        // Avatar
        ctx.font = '24px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(testimonial.avatar, x + 20, y + 25)
        
        // Nombre (truncado)
        ctx.font = '10px monospace'
        ctx.fillStyle = '#FFFFFF'
        const firstName = testimonial.name.split(' ')[0]
        ctx.fillText(firstName.substring(0, 8), x + 55, y + 18)
        
        // Estrellas
        ctx.font = '10px Arial'
        ctx.fillStyle = '#FFD700'
        ctx.fillText('⭐'.repeat(testimonial.stars), x + 55, y + 32)
        
        // Role (truncado)
        ctx.font = '8px monospace'
        ctx.fillStyle = '#AAAAAA'
        const roleText = testimonial.role.substring(0, 9)
        ctx.fillText(roleText, x + 55, y + 42)
      })

      animationFrame.current = requestAnimationFrame(animate)
    }

    animate()
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current)
    }
  }, [gameStarted, gameOver, victory, player, boos, blocks, testimonials, platforms, turtles, mushrooms, particles, cameraX, score, time, lives, invincible, collectedTestimonials])

  useEffect(() => {
    if (!gameStarted || gameOver || victory) return

    const gameLoop = setInterval(() => {
      // Actualizar partículas
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.3, // Gravedad
          life: p.life - 1
        }))
        .filter(p => p.life > 0)
      )

      // Actualizar bloques que rebotan
      setBlocks(prev => prev.map(block => {
        if (block.bouncing) {
          const newOffset = block.bounceOffset + 3
          if (newOffset >= 20) {
            return { ...block, bouncing: false, bounceOffset: 0 }
          }
          return { ...block, bounceOffset: newOffset }
        }
        return block
      }))

      // Actualizar testimonials flotantes (solo animación, ya están recolectados)
      setTestimonials(prev => prev.map(t => {
        if (t.floating && !t.collected) {
          let newY = t.y + t.vy
          let newVy = t.vy + 0.5
          
          // Eliminar si cae fuera
          if (newY > CANVAS_HEIGHT) {
            return { ...t, floating: false }
          }
          
          return { ...t, y: newY, vy: newVy }
        }
        return t
      }))

      setPlayer(prev => {
        let { x, y, vx, vy, direction, animFrame, onGround } = prev

        if (keys.left) {
          vx = -MOVE_SPEED
          direction = -1
          animFrame++
        } else if (keys.right) {
          vx = MOVE_SPEED
          direction = 1
          animFrame++
        } else {
          vx = 0
          animFrame = 0
        }

        if (keys.jump && onGround) {
          vy = JUMP_FORCE
          onGround = false
        }

        if (!onGround) {
          vy += GRAVITY
        }

        x += vx
        y += vy

        // Colisiones con plataformas
        const wasOnGround = onGround
        onGround = false
        platforms.forEach(platform => {
          if (
            x + 32 > platform.x &&
            x < platform.x + platform.width &&
            y + 46 >= platform.y &&
            y + 46 <= platform.y + 25 &&
            vy >= 0
          ) {
            y = platform.y - 46
            vy = 0
            onGround = true

            // Partículas al aterrizar (solo si venía cayendo)
            if (!wasOnGround && vy > 5) {
              const newParticles: Particle[] = []
              for (let i = 0; i < 4; i++) {
                newParticles.push({
                  x: x + 16 + (Math.random() - 0.5) * 20,
                  y: platform.y,
                  vx: (Math.random() - 0.5) * 2,
                  vy: -Math.random() * 2,
                  life: 20,
                  maxLife: 20,
                  color: 'rgba(139, 115, 85, 1)',
                  size: 2
                })
              }
              setParticles(prev => [...prev, ...newParticles])
            }
          }
          
          // Golpear desde abajo
          if (
            x + 32 > platform.x &&
            x < platform.x + platform.width &&
            y <= platform.y + platform.height &&
            y + 15 >= platform.y + platform.height &&
            vy < 0
          ) {
            y = platform.y + platform.height
            vy = 0
          }
        })

        // Golpear bloques desde abajo (física mejorada)
        blocks.forEach(block => {
          if (
            !block.hit &&
            x + 32 > block.x &&
            x < block.x + block.width &&
            y < block.y + block.height &&
            y + 10 > block.y &&
            vy < 0
          ) {
            setBlocks(prev => prev.map(b => {
              if (b.id === block.id) {
                // Crear testimonial flotante
                const testimonialData_item = testimonialData[b.id]
                setTestimonials(t => [...t, {
                  ...testimonialData_item,
                  x: b.x + 20,
                  y: b.y - 50,
                  vy: -8,
                  collected: false,
                  floating: true
                }])
                
                // Añadir a testimonios recolectados inmediatamente
                setCollectedTestimonials(prev => [...prev, testimonialData_item])

                // Sistema de combo: más puntos por golpes consecutivos
                const comboBonus = collectedTestimonials.length * 50
                setScore(s => s + 100 + comboBonus)

                // Bonificación de tiempo al golpear bloques
                setTime(t => Math.min(200, t + 10))

                // Mostrar efecto HIT
                setHitEffect({x: b.x + 20, y: b.y - 30, show: true})
                setTimeout(() => setHitEffect(prev => ({...prev, show: false})), 500)

                // Partículas doradas del bloque
                const newParticles: Particle[] = []
                for (let i = 0; i < 10; i++) {
                  newParticles.push({
                    x: b.x + 20,
                    y: b.y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: -Math.random() * 5 - 3,
                    life: 35,
                    maxLife: 35,
                    color: 'rgba(255, 215, 0, 1)',
                    size: 3
                  })
                }
                setParticles(prev => [...prev, ...newParticles])

                return { ...b, hit: true, bouncing: true }
              }
              return b
            }))
            vy = 1 // Rebote hacia abajo
          }
        })

        // Victoria
        if (x >= GOAL_X && !victory) {
          setVictory(true)
          // Guardar en localStorage que se completó el juego
          localStorage.setItem('booGameCompleted', 'true')
        }

        if (y > CANVAS_HEIGHT) {
          setLives(l => {
            const newLives = l - 1
            if (newLives <= 0) setGameOver(true)
            return newLives
          })
          return { x: 100, y: 400, vx: 0, vy: 0, direction: 1, animFrame: 0, onGround: false }
        }

        return { x, y, vx, vy, direction, animFrame, onGround }
      })

      setCameraX(prev => {
        const targetX = Math.max(0, player.x - CANVAS_WIDTH / 3)
        const maxCameraX = WORLD_WIDTH - CANVAS_WIDTH
        return Math.min(maxCameraX, prev + (targetX - prev) * 0.1)
      })

      // IA de los Boos mejorada (más agresiva y persistente)
      setBoos(prevBoos => prevBoos.map(boo => {
        const dx = player.x + 16 - boo.x
        const dy = player.y + 23 - boo.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        const playerLookingAtBoo =
          (player.direction > 0 && dx > 0) ||
          (player.direction < 0 && dx < 0)

        // Boo se esconde solo si el jugador está MUY cerca y mirando
        const hiding = playerLookingAtBoo && dist < 250

        let { x, y, vx, vy, speed } = boo

        // Velocidad aumenta dramáticamente con el tiempo y la cercanía
        const timeMultiplier = 1 + (200 - time) * 0.005
        const proximityMultiplier = dist < 300 ? 1.5 : 1.0
        const difficultyMultiplier = timeMultiplier * proximityMultiplier

        if (!hiding) {
          // Persecución activa (rango extendido)
          if (dist < 800) {
            const adjustedSpeed = speed * difficultyMultiplier
            const targetVx = (dx / dist) * adjustedSpeed
            const targetVy = (dy / dist) * adjustedSpeed

            // Aceleración más rápida para respuesta inmediata
            vx += (targetVx - vx) * 0.2
            vy += (targetVy - vy) * 0.2
          } else {
            // Patrullar y acercarse lentamente si está lejos
            const patrolSpeed = speed * 0.5
            vx += (dx / dist) * patrolSpeed * 0.05
            vy += (dy / dist) * patrolSpeed * 0.05
          }
        } else {
          // Al esconderse, retrocede un poco
          vx += (dx / dist) * -1
          vy += (dy / dist) * -1
          vx *= 0.9
          vy *= 0.9
        }

        x += vx
        y += vy

        // Limitar velocidad máxima
        const maxSpeed = speed * difficultyMultiplier * 1.2
        const currentSpeed = Math.sqrt(vx * vx + vy * vy)
        if (currentSpeed > maxSpeed) {
          vx = (vx / currentSpeed) * maxSpeed
          vy = (vy / currentSpeed) * maxSpeed
        }

        return { ...boo, x, y, vx, vy, hiding }
      }))

      // Añadir nuevos Boos según testimonios recolectados (más rápido y más agresivo)
      if (collectedTestimonials.length === 2 && boos.length === 1) {
        setBoos(prev => [...prev, {
          id: 1,
          x: WORLD_WIDTH - 400,
          y: 300,
          vx: 0,
          vy: 0,
          hiding: false,
          size: 70,
          speed: 3.8
        }])
      } else if (collectedTestimonials.length === 4 && boos.length === 2) {
        setBoos(prev => [...prev, {
          id: 2,
          x: 1500,
          y: 250,
          vx: 0,
          vy: 0,
          hiding: false,
          size: 65,
          speed: 4.2
        }])
      } else if (collectedTestimonials.length === 6 && boos.length === 3) {
        setBoos(prev => [...prev, {
          id: 3,
          x: 2500,
          y: 280,
          vx: 0,
          vy: 0,
          hiding: false,
          size: 75,
          speed: 4.5
        }])
      }

      // Actualizar tortugas
      setTurtles(prevTurtles => prevTurtles.map(turtle => {
        if (turtle.dead) {
          // Tortugas muertas desaparecen después de un tiempo
          return turtle
        }

        let { x, y, vx, vy, direction, animFrame } = turtle

        // Movimiento horizontal
        x += vx
        animFrame++

        // Cambiar dirección en los bordes o obstáculos
        if (x < 50 || x > WORLD_WIDTH - 50) {
          vx = -vx
          direction = -direction
        }

        // Gravedad simple (las tortugas caminan sobre el piso)
        const onFloor = y >= 496
        if (!onFloor) {
          vy += GRAVITY
          y += vy
        } else {
          y = 496
          vy = 0
        }

        return { ...turtle, x, y, vx, vy, direction, animFrame }
      }))

      // Actualizar hongos
      setMushrooms(prevMushrooms => prevMushrooms.map(mushroom => {
        if (mushroom.collected) return mushroom

        let { x, y, vx, vy } = mushroom

        // Movimiento suave izquierda-derecha
        x += vx

        // Rebotar en los bordes
        if (x < mushroom.id * 50 || x > mushroom.id * 50 + 100) {
          vx = -vx
        }

        return { ...mushroom, x, y, vx, vy }
      }))

      // Colisión jugador con tortugas
      turtles.forEach((turtle, index) => {
        if (turtle.dead) return

        const dx = player.x + 16 - (turtle.x + 16)
        const dy = player.y + 23 - (turtle.y + 12)
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 30) {
          // Si el jugador salta sobre la tortuga
          if (player.vy > 0 && player.y < turtle.y) {
            setTurtles(prev => prev.map((t, i) =>
              i === index ? { ...t, dead: true } : t
            ))
            setScore(s => s + 200)
            setPlayer(p => ({ ...p, vy: JUMP_FORCE * 0.6 })) // Pequeño rebote

            // Generar partículas
            const newParticles: Particle[] = []
            for (let i = 0; i < 8; i++) {
              newParticles.push({
                x: turtle.x + 16,
                y: turtle.y + 12,
                vx: (Math.random() - 0.5) * 6,
                vy: -Math.random() * 4 - 2,
                life: 30,
                maxLife: 30,
                color: 'rgba(34, 139, 34, 1)',
                size: 3
              })
            }
            setParticles(prev => [...prev, ...newParticles])
          } else if (!invincible) {
            // La tortuga daña al jugador
            setLives(l => {
              const newLives = l - 1
              if (newLives <= 0) setGameOver(true)
              return newLives
            })
            setTime(t => Math.max(0, t - 10))
            setInvincible(true)
            setTimeout(() => setInvincible(false), 2000)
            setPlayer(p => ({ ...p, x: Math.max(100, p.x - 50), vx: 0, vy: JUMP_FORCE * 0.5 }))
          }
        }
      })

      // Colisión jugador con hongos (vida extra)
      mushrooms.forEach((mushroom, index) => {
        if (mushroom.collected) return

        const dx = player.x + 16 - (mushroom.x + 12)
        const dy = player.y + 23 - (mushroom.y + 12)
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 25) {
          setMushrooms(prev => prev.map((m, i) =>
            i === index ? { ...m, collected: true } : m
          ))
          setLives(l => Math.min(5, l + 1)) // Máximo 5 vidas
          setScore(s => s + 500)
          setTime(t => Math.min(200, t + 20)) // Bonus de tiempo

          // Partículas de hongo recolectado
          const newParticles: Particle[] = []
          for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12
            newParticles.push({
              x: mushroom.x + 12,
              y: mushroom.y + 12,
              vx: Math.cos(angle) * 3,
              vy: Math.sin(angle) * 3,
              life: 40,
              maxLife: 40,
              color: 'rgba(255, 0, 0, 1)',
              size: 4
            })
          }
          setParticles(prev => [...prev, ...newParticles])
        }
      })

      // Colisión con Boos
      if (!invincible) {
        for (const boo of boos) {
          const dx = player.x + 16 - boo.x
          const dy = player.y + 23 - boo.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (!boo.hiding && dist < 85) {
            setLives(l => {
              const newLives = l - 1
              if (newLives <= 0) setGameOver(true)
              return newLives
            })
            // Penalización de tiempo al recibir daño
            setTime(t => Math.max(0, t - 15))
            setInvincible(true)
            setTimeout(() => setInvincible(false), 2000)
            setPlayer(p => ({ ...p, x: 100, y: 400, vx: 0, vy: 0 }))
            break
          }
        }
      }

    }, 16)

    return () => clearInterval(gameLoop)
  }, [gameStarted, gameOver, victory, keys, player, boos, blocks, platforms, turtles, mushrooms, invincible, testimonialData, collectedTestimonials, time])

  const startGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setVictory(false)
    setScore(0)
    setTime(200)
    setLives(3)
    setPlayer({ x: 100, y: 400, vx: 0, vy: 0, direction: 1, animFrame: 0, onGround: false })
    setInvincible(false)
    setBlocks(prev => prev.map(b => ({ ...b, hit: false, bouncing: false, bounceOffset: 0 })))
    setTestimonials([])
    setCollectedTestimonials([])
    setBoos([{ id: 0, x: 800, y: 300, vx: 0, vy: 0, hiding: false, size: 80, speed: 3.5 }])

    // Resetear tortugas
    setTurtles([
      { id: 0, x: 600, y: 496, vx: -1.5, vy: 0, direction: -1, dead: false, animFrame: 0 },
      { id: 1, x: 1200, y: 496, vx: 1.5, vy: 0, direction: 1, dead: false, animFrame: 0 },
      { id: 2, x: 1800, y: 496, vx: -1.5, vy: 0, direction: -1, dead: false, animFrame: 0 },
      { id: 3, x: 2400, y: 496, vx: 1.5, vy: 0, direction: 1, dead: false, animFrame: 0 },
      { id: 4, x: 3000, y: 496, vx: -1.5, vy: 0, direction: -1, dead: false, animFrame: 0 },
    ])

    // Resetear hongos
    setMushrooms([
      { id: 0, x: 1000, y: 480, vy: 0, vx: 1, collected: false },
      { id: 1, x: 2000, y: 480, vy: 0, vx: 1, collected: false },
      { id: 2, x: 2800, y: 480, vy: 0, vx: 1, collected: false },
    ])

    // Resetear partículas
    setParticles([])
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-2 sm:p-4">
      <div className="mb-3 sm:mb-4 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-pink-400 mb-1 sm:mb-2" style={{ fontFamily: 'monospace' }}>
          SUPER PEACH BROS.
        </h1>
        <p className="text-green-400 text-sm sm:text-base md:text-lg" style={{ fontFamily: 'monospace' }}>WORLD 1-1 GHOST HOUSE</p>
      </div>

      <div className="relative shadow-2xl w-full max-w-[800px]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-gray-800 bg-black w-full"
          style={{ imageRendering: 'pixelated' }}
        />

        {!gameStarted && !gameOver && !victory && !selectedCharacter && (
          <div className="absolute inset-0 flex items-center justify-center bg-black p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.98)' }}>
            <div className="text-center space-y-6 px-4 sm:px-6 w-full max-w-[95%] sm:max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-4" style={{ fontFamily: 'monospace' }}>
                SELECCIONA TU PERSONAJE
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {/* MARIO */}
                <button
                  onClick={() => setSelectedCharacter('mario')}
                  className="group p-6 rounded-lg border-4 transition-all hover:scale-105 active:scale-95 hover:border-yellow-400"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#FF0000' }}
                >
                  <div className="mb-3 flex justify-center">
                    <img
                      src="https://media.tenor.com/C1_KkudKHM8AAAAi/mario-dance.gif"
                      alt="Mario"
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-red-500 mb-2" style={{ fontFamily: 'monospace' }}>MARIO</h3>
                  <div className="text-sm text-gray-300 space-y-1" style={{ fontFamily: 'monospace' }}>
                    <p>⭐ Equilibrado</p>
                    <p>💪 Fuerza: Media</p>
                    <p>⚡ Velocidad: Media</p>
                  </div>
                </button>

                {/* LUIGI */}
                <button
                  onClick={() => setSelectedCharacter('luigi')}
                  className="group p-6 rounded-lg border-4 transition-all hover:scale-105 active:scale-95 hover:border-yellow-400"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#00AA00' }}
                >
                  <div className="mb-3 flex justify-center">
                    <img
                      src="https://media.tenor.com/rBKhw5BhSHcAAAAi/luigi-smw.gif"
                      alt="Luigi"
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-green-500 mb-2" style={{ fontFamily: 'monospace' }}>LUIGI</h3>
                  <div className="text-sm text-gray-300 space-y-1" style={{ fontFamily: 'monospace' }}>
                    <p>⭐ Saltarín</p>
                    <p>💪 Fuerza: Media</p>
                    <p>⚡ Velocidad: Rápida</p>
                  </div>
                </button>

                {/* PEACH */}
                <button
                  onClick={() => setSelectedCharacter('peach')}
                  className="group p-6 rounded-lg border-4 transition-all hover:scale-105 active:scale-95 hover:border-yellow-400"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#FF69B4' }}
                >
                  <div className="mb-3 flex justify-center">
                    <img
                      src="https://i.pinimg.com/originals/d1/3a/0c/d13a0cd665cb1e203a9b529a446347ba.gif"
                      alt="Peach"
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-pink-400 mb-2" style={{ fontFamily: 'monospace' }}>PEACH</h3>
                  <div className="text-sm text-gray-300 space-y-1" style={{ fontFamily: 'monospace' }}>
                    <p>⭐ Elegante</p>
                    <p>💪 Fuerza: Baja</p>
                    <p>⚡ Velocidad: Media</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {!gameStarted && !gameOver && !victory && selectedCharacter && (
          <div className="absolute inset-0 flex items-center justify-center bg-black p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.98)' }}>
            <div className="text-center space-y-4 sm:space-y-5 md:space-y-6 px-4 sm:px-6 w-full max-w-[95%] sm:max-w-md md:max-w-lg">
              <h2 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-2 sm:mb-4" style={{ fontFamily: 'monospace' }}>
                INSTRUCCIONES
              </h2>
              <div className="p-4 sm:p-5 md:p-6 rounded border-2" style={{ backgroundColor: '#1a1a1a', borderColor: '#4a4a4a' }}>
                <p className="text-white text-base sm:text-lg mb-2 sm:mb-3" style={{ fontFamily: 'monospace' }}>
                  ⬅️ ➡️ MOVER
                </p>
                <p className="text-white text-base sm:text-lg mb-2 sm:mb-3" style={{ fontFamily: 'monospace' }}>
                  ESPACIO / ⬆️ SALTAR
                </p>
                <p className="text-base sm:text-lg mb-2 sm:mb-3" style={{ fontFamily: 'monospace', color: '#ffd700' }}>
                  GOLPEA BLOQUES ? DESDE ABAJO
                </p>
                <p className="text-base sm:text-lg mb-2 sm:mb-3" style={{ fontFamily: 'monospace', color: '#4ade80' }}>
                  RECOLECTA TESTIMONIOS 📜
                </p>
                <p className="text-base sm:text-lg mb-2 sm:mb-3" style={{ fontFamily: 'monospace', color: '#90EE90' }}>
                  SALTA SOBRE TORTUGAS 🐢
                </p>
                <p className="text-base sm:text-lg mb-2 sm:mb-3" style={{ fontFamily: 'monospace', color: '#FF0000' }}>
                  COME HONGOS = +1 VIDA 🍄
                </p>
                <p className="text-base sm:text-lg" style={{ fontFamily: 'monospace', color: '#22d3ee' }}>
                  EVITA AL BOO 👻
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedCharacter(null)}
                  className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-500 active:bg-gray-700 text-white font-bold text-lg rounded border-2 border-gray-400 transition-all hover:scale-105 active:scale-95"
                  style={{ fontFamily: 'monospace' }}
                >
                  ← VOLVER
                </button>
                <button
                  onClick={startGame}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold text-lg rounded border-2 border-green-400 transition-all hover:scale-105 active:scale-95"
                  style={{ fontFamily: 'monospace' }}
                >
                  🎮 START
                </button>
              </div>
            </div>
          </div>
        )}

        {victory && (
          <div className="absolute inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.98)' }}>
            <div className="p-4 sm:p-6 md:p-8 lg:p-10 rounded border-2 sm:border-4 text-center space-y-4 sm:space-y-5 md:space-y-6 w-full max-w-[95%] sm:max-w-md md:max-w-lg" style={{ backgroundColor: '#1a1a1a', borderColor: '#ffd700' }}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-400" style={{ fontFamily: 'monospace' }}>
                STAGE CLEAR!
              </h2>
              <div className="p-3 sm:p-4 rounded" style={{ backgroundColor: '#000000' }}>
                <p className="text-white text-xl sm:text-2xl md:text-3xl mb-2" style={{ fontFamily: 'monospace' }}>
                  SCORE: {score}
                </p>
                <p className="text-base sm:text-lg md:text-xl" style={{ fontFamily: 'monospace', color: '#4ade80' }}>
                  TESTIMONIOS: {collectedTestimonials.length}/{testimonialData.length}
                </p>
              </div>
              <button
                onClick={generateCV}
                className="w-full px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-base sm:text-lg md:text-xl rounded border-2 sm:border-4 border-blue-400 transition-all hover:scale-105 active:scale-95"
                style={{ fontFamily: 'monospace' }}
              >
                📄 DOWNLOAD CV
              </button>
              <button
                onClick={startGame}
                className="w-full px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3 bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold text-sm sm:text-base md:text-lg rounded border-2 sm:border-4 border-green-400 transition-all hover:scale-105 active:scale-95"
                style={{ fontFamily: 'monospace' }}
              >
                🔄 RETRY
              </button>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.98)' }}>
            <div className="p-4 sm:p-6 md:p-8 lg:p-10 rounded border-2 sm:border-4 text-center space-y-4 sm:space-y-5 md:space-y-6 w-full max-w-[95%] sm:max-w-md" style={{ backgroundColor: '#1a1a1a', borderColor: '#ef4444' }}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ fontFamily: 'monospace', color: '#ef4444' }}>
                GAME OVER
              </h2>
              <div className="p-3 sm:p-4 rounded" style={{ backgroundColor: '#000000' }}>
                <p className="text-white text-xl sm:text-2xl md:text-3xl" style={{ fontFamily: 'monospace' }}>
                  SCORE: {score}
                </p>
              </div>
              <button
                onClick={startGame}
                className="w-full px-6 sm:px-8 md:px-12 py-3 sm:py-3.5 md:py-4 bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold text-lg sm:text-xl md:text-2xl rounded border-2 sm:border-4 border-green-400 transition-all hover:scale-105 active:scale-95"
                style={{ fontFamily: 'monospace' }}
              >
                🔄 CONTINUE
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 sm:mt-6 text-center text-gray-400 px-4" style={{ fontFamily: 'monospace' }}>
        <p className="text-xs sm:text-sm md:text-base">© 2024 SUPER PEACH BROS.</p>
      </div>
    </div>
  )
}