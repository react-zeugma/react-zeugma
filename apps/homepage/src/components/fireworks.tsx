'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  color: string
  size: number
  decay: number
}

interface Rocket {
  x: number
  y: number
  targetY: number
  speed: number
  color: string
}

const PALETTES = [
  ['#FFD700', '#FFA500', '#FFE066'],
  ['#FF6B6B', '#FF85A2', '#E8A87C'],
  ['#7EC8E3', '#5BFFB0', '#D4A5FF'],
  ['#C29B47', '#D8BA8E', '#FFD700'],
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function createBurst(x: number, y: number): Particle[] {
  const palette = pick(PALETTES)
  const out: Particle[] = []
  const n = 50 + Math.floor(Math.random() * 30)
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.4
    const speed = 2 + Math.random() * 5
    out.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      color: pick(palette),
      size: 1.5 + Math.random() * 2,
      decay: 0.018 + Math.random() * 0.014,
    })
  }
  // bright center flash
  for (let i = 0; i < 5; i++) {
    const a = Math.random() * Math.PI * 2
    out.push({
      x,
      y,
      vx: Math.cos(a) * (0.5 + Math.random()),
      vy: Math.sin(a) * (0.5 + Math.random()),
      alpha: 1,
      color: '#FFF',
      size: 3,
      decay: 0.06,
    })
  }
  return out
}

interface Props {
  active: boolean
  duration?: number
  onComplete?: () => void
}

function Canvas({ duration = 3500, onComplete }: Omit<Props, 'active'>) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    if (!ctx) return

    // Handle high-DPI
    const dpr = window.devicePixelRatio || 1
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.scale(dpr, dpr)

    const particles: Particle[] = []
    const rockets: Rocket[] = []
    const start = Date.now()
    let nextLaunch = 0
    let raf = 0

    function launchRocket() {
      const x = w * 0.12 + Math.random() * w * 0.76
      rockets.push({
        x,
        y: h + 5,
        targetY: h * 0.08 + Math.random() * h * 0.42,
        speed: 16 + Math.random() * 10,
        color: pick(PALETTES.flat()),
      })
    }

    function frame() {
      const now = Date.now()
      const elapsed = now - start
      const spawning = elapsed < duration - 1000

      ctx.clearRect(0, 0, w, h)

      // Launch rockets
      if (spawning && now >= nextLaunch) {
        launchRocket()
        nextLaunch = now + 180 + Math.random() * 300
      }

      // Update rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i]
        r.y -= r.speed
        r.speed *= 0.99

        // Trail line
        ctx.save()
        ctx.globalAlpha = 0.5
        ctx.strokeStyle = r.color
        ctx.lineWidth = 2
        ctx.shadowBlur = 8
        ctx.shadowColor = r.color
        ctx.beginPath()
        ctx.moveTo(r.x, r.y)
        ctx.lineTo(r.x, r.y + Math.min(r.speed * 3, 40))
        ctx.stroke()
        ctx.restore()

        // Head glow
        ctx.save()
        ctx.globalAlpha = 1
        ctx.shadowBlur = 12
        ctx.shadowColor = '#FFF'
        ctx.fillStyle = '#FFF'
        ctx.beginPath()
        ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        if (r.y <= r.targetY) {
          particles.push(...createBurst(r.x, r.y))
          rockets.splice(i, 1)
        }
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.045
        p.vx *= 0.985
        p.alpha -= p.decay

        if (p.alpha <= 0) {
          particles.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.shadowBlur = 8
        ctx.shadowColor = p.color
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      if (elapsed < duration || particles.length > 0 || rockets.length > 0) {
        raf = requestAnimationFrame(frame)
      } else {
        ctx.clearRect(0, 0, w, h)
        onComplete?.()
      }
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [duration, onComplete])

  return createPortal(
    <canvas
      ref={ref}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />,
    document.body,
  )
}

export function Fireworks({ active, duration, onComplete }: Props) {
  if (!active) return null
  return <Canvas duration={duration} onComplete={onComplete} />
}
