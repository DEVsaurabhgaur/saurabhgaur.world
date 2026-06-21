'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export default function CyberCursor() {
  const [visible, setVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isMobile, setIsMobile] = useState(true)
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([])

  const posRef = useRef({ x: -100, y: -100 })
  const displayRef = useRef({ x: -100, y: -100 })
  const rafRef = useRef<number>(0)
  const trailRef = useRef<{ x: number; y: number; id: number }[]>([])
  const trailCounterRef = useRef(0)
  const lastTrailPos = useRef({ x: -100, y: -100 })

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t

  const animate = useCallback(() => {
    displayRef.current.x = lerp(displayRef.current.x, posRef.current.x, 0.18)
    displayRef.current.y = lerp(displayRef.current.y, posRef.current.y, 0.18)

    const el = document.getElementById('cyber-cursor-root')
    if (el) {
      el.style.transform = `translate(${displayRef.current.x}px, ${displayRef.current.y}px) translate(-50%, -50%)`
    }
    rafRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(pointer: fine)')
    setIsMobile(!mq.matches)
    if (!mq.matches) return

    const handleMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY }
      if (!visible) setVisible(true)

      // Trail: add a dot every ~18px of movement
      const dx = e.clientX - lastTrailPos.current.x
      const dy = e.clientY - lastTrailPos.current.y
      if (Math.sqrt(dx * dx + dy * dy) > 18) {
        lastTrailPos.current = { x: e.clientX, y: e.clientY }
        const id = ++trailCounterRef.current
        const newDot = { x: e.clientX, y: e.clientY, id }
        trailRef.current = [newDot, ...trailRef.current].slice(0, 5)
        setTrail([...trailRef.current])
        setTimeout(() => {
          trailRef.current = trailRef.current.filter((d) => d.id !== id)
          setTrail([...trailRef.current])
        }, 400)
      }
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const interactive =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]')
      setIsHovering(!!interactive)
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)
    const handleMouseLeave = () => setVisible(false)

    document.body.classList.add('custom-cursor-active')
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseover', handleMouseOver)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseLeave)

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      document.body.classList.remove('custom-cursor-active')
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseover', handleMouseOver)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [animate, visible])

  if (isMobile) return null

  const ringColor = isClicking ? '#FF6B00' : isHovering ? '#FF6B00' : '#00F5FF'
  const coreColor = isClicking ? '#FF6B00' : isHovering ? '#FF6B00' : '#9DFF00'
  const ringScale = isClicking ? 'scale(1.6)' : isHovering ? 'scale(1.35)' : 'scale(1)'

  return (
    <>
      {/* Trail dots */}
      {visible && trail.map((dot, i) => (
        <div
          key={dot.id}
          className="fixed pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: dot.x,
            top: dot.y,
            width: `${Math.max(2, 5 - i)}px`,
            height: `${Math.max(2, 5 - i)}px`,
            backgroundColor: '#9DFF00',
            opacity: 0.4 - i * 0.07,
            boxShadow: `0 0 4px #9DFF00`,
            transition: 'opacity 0.4s ease',
          }}
        />
      ))}

      {/* Main cursor */}
      <div
        id="cyber-cursor-root"
        className="fixed pointer-events-none z-[9999] select-none"
        style={{ top: 0, left: 0, willChange: 'transform' }}
      >
        {/* Click pulse ring */}
        {isClicking && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-400/60"
            style={{
              width: '48px',
              height: '48px',
              animation: 'cursorClickPulse 0.3s ease-out forwards',
            }}
          />
        )}

        {/* Outer spinning dashed ring */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed"
          style={{
            width: '28px',
            height: '28px',
            borderColor: `${ringColor}60`,
            transform: `translate(-50%, -50%) ${ringScale}`,
            animation: 'spin 6s linear infinite',
            transition: 'border-color 0.2s, transform 0.15s ease',
          }}
        />

        {/* Inner solid ring */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{
            width: '10px',
            height: '10px',
            borderColor: `${ringColor}40`,
            transition: 'border-color 0.2s',
          }}
        />

        {/* Center glowing core */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: isHovering || isClicking ? '6px' : '4px',
            height: isHovering || isClicking ? '6px' : '4px',
            backgroundColor: coreColor,
            boxShadow: `0 0 8px ${coreColor}, 0 0 16px ${coreColor}60`,
            transition: 'all 0.15s ease',
          }}
        />

        {/* Coordinate label */}
        <div
          className="absolute font-mono whitespace-nowrap"
          style={{
            top: '14px',
            left: '14px',
            fontSize: '7px',
            color: '#9DFF00cc',
            letterSpacing: '0.1em',
            background: 'rgba(7,11,15,0.85)',
            padding: '1px 5px',
            borderRadius: '2px',
            border: '1px solid rgba(157,255,0,0.2)',
            opacity: visible ? 1 : 0,
          }}
        >
          [{Math.round(posRef.current.x)}, {Math.round(posRef.current.y)}]
        </div>
      </div>
    </>
  )
}
