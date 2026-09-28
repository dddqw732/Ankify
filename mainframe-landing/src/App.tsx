import { useEffect, useRef, useState } from 'react'
import { useTypewriter } from './hooks/useTypewriter'
import { AnkifyFeatureSection } from './components/AnkifyFeatureSection'
import { SynthesizeCardsCTA } from './components/SynthesizeCardsCTA'
import { Footer } from './components/Footer'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const BG_IMAGE_SRC = '/video/bg-image.png'
const CHARACTER_SRC = '/video/character.webm'

const NAV_LINKS = ['Features', 'How It Works', 'Pricing', 'Blog']

const TYPEWRITER_TEXT =
  "Turn any YouTube video or text into smart flashcards — instantly, with AI."

const PILL_BUTTONS = [
  'Generate from YouTube',
  'Paste any text',
  'Try for free',
  'See how it works',
]

// ─────────────────────────────────────────────────────────────────────────────
// Copy Icon SVG
// ─────────────────────────────────────────────────────────────────────────────
function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M3 8H2C1.44772 8 1 7.55228 1 7V2C1 1.44772 1.44772 1 2 1H7C7.55228 1 8 1.44772 8 2V3"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Hamburger Button
// ─────────────────────────────────────────────────────────────────────────────
interface HamburgerProps {
  isOpen: boolean
  onClick: () => void
}

function Hamburger({ isOpen, onClick }: HamburgerProps) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      className="flex flex-col gap-[5px] cursor-pointer md:hidden z-50 relative"
    >
      <span
        className="w-6 h-[2px] bg-white block transition-all duration-300"
        style={{
          transform: isOpen ? 'rotate(45deg) translateY(7px)' : 'none',
        }}
      />
      <span
        className="w-6 h-[2px] bg-white block transition-all duration-300"
        style={{
          opacity: isOpen ? 0 : 1,
        }}
      />
      <span
        className="w-6 h-[2px] bg-white block transition-all duration-300"
        style={{
          transform: isOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
        }}
      />
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Overlay Menu
// ─────────────────────────────────────────────────────────────────────────────
interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col justify-center px-8 gap-8 md:hidden"
      style={{
        zIndex: 49,
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
      }}
    >
      {NAV_LINKS.map((link) => (
        <a
          key={link}
          href="#"
          onClick={onClose}
          className="text-white text-[32px] font-medium hover:opacity-60 transition-opacity"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {link}
        </a>
      ))}
      <a
        href="#ai-flashcards"
        onClick={onClose}
        className="text-white text-[32px] font-medium hover:opacity-60 transition-opacity"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        AI Flashcards
      </a>
      <a
        href="#synthesize-cta"
        onClick={onClose}
        className="text-white text-[32px] font-medium underline underline-offset-2 hover:opacity-60 transition-opacity"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        Get Started Free
      </a>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Navbar
// ─────────────────────────────────────────────────────────────────────────────
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 flex flex-row justify-between items-center px-5 sm:px-8 py-4 sm:py-5"
        style={{ zIndex: 40 }}
      >
        {/* Logo (left) */}
        <div className="flex flex-row items-center gap-2">
          <span
            className="text-white text-[22px] sm:text-[26px] tracking-tight leading-none"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Ankify
          </span>
          <span
            className="text-white/70 text-[13px] sm:text-[14px] px-2 py-0.5 rounded-full border border-white/20 leading-none"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            AI
          </span>
        </div>

        {/* Desktop center nav links */}
        <div className="hidden md:flex flex-row items-center text-[16px] text-white gap-7">
          {NAV_LINKS.map((link) => (
            <a key={link} href="#" className="hover:opacity-60 transition-opacity">
              {link}
            </a>
          ))}
        </div>

        {/* Desktop CTA & Right side */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="#ai-flashcards"
            className="text-white text-[15px] hover:opacity-60 transition-opacity"
          >
            Sign In
          </a>
          <a
            href="#synthesize-cta"
            className="text-black bg-white text-[14px] px-4 py-2 rounded-full font-medium hover:bg-white/90 transition-colors"
          >
            Get Started Free
          </a>
        </div>

        {/* Mobile hamburger */}
        <Hamburger isOpen={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
      </nav>

      {/* Mobile overlay */}
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Mouse-Tracking Character (WebM video in bottom-right corner)
// ─────────────────────────────────────────────────────────────────────────────
function MouseTrackingCharacter() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Compute normalized mouse position (-1 to 1)
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      // Subtle parallax movement: max ±18px horizontal, ±12px vertical
      targetRef.current = { x: nx * 18, y: ny * 12 }
    }

    const animate = () => {
      // Smooth lerp
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.06
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.06
      setOffset({ x: currentRef.current.x, y: currentRef.current.y })
      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute bottom-0 right-0 pointer-events-none select-none"
      style={{ zIndex: 5 }}
    >
      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          transition: 'none',
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="block"
          style={{
            width: 'clamp(200px, 22vw, 320px)',
            height: 'auto',
            objectFit: 'contain',
            // slight drop shadow for depth
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))',
          }}
        >
          <source src={CHARACTER_SRC} type="video/webm" />
        </video>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero Section
// ─────────────────────────────────────────────────────────────────────────────
function HeroSection() {
  const { displayed, done } = useTypewriter({ text: TYPEWRITER_TEXT })
  const [pillsVisible, setPillsVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setPillsVisible(true), 400)
    return () => clearTimeout(t)
  }, [])

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('hello@ankify.app')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <section
      className="relative w-full h-screen min-h-[600px] flex flex-col justify-end md:justify-center pb-12 md:pb-0 px-5 sm:px-8 md:px-10 overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {/* Static background image */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 0,
          backgroundImage: `url(${BG_IMAGE_SRC})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Dark overlay for text readability — gradient left-to-right so right stays lighter */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.15) 100%)',
          zIndex: 1,
        }}
      />

      {/* Mouse-tracking character — bottom right */}
      <MouseTrackingCharacter />

      {/* Text content */}
      <div className="max-w-xl relative" style={{ zIndex: 10 }}>
        {/* 1. Blurred intro label */}
        <p
          className="pointer-events-none select-none mb-5 sm:mb-6 text-white"
          style={{
            fontSize: 'clamp(16px, 3.5vw, 22px)',
            lineHeight: 1.3,
            fontWeight: 400,
            filter: 'blur(4px)',
          }}
        >
          Hey there, meet your AI study partner —
          <br />
          Ankify turns any content into flashcards
        </p>

        {/* 2. Typewriter text */}
        <p
          className="text-white mb-5 sm:mb-6"
          style={{
            fontSize: 'clamp(18px, 4vw, 26px)',
            lineHeight: 1.35,
            fontWeight: 400,
            minHeight: '54px',
          }}
        >
          {displayed}
          {!done && (
            <span
              className="cursor-blink inline-block bg-white align-middle"
              style={{
                width: '2px',
                height: '1.1em',
                marginLeft: '2px',
              }}
            />
          )}
        </p>

        {/* 3. Action pill buttons */}
        <div
          className="flex flex-wrap gap-y-1"
          style={{
            opacity: pillsVisible ? 1 : 0,
            transform: pillsVisible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          {PILL_BUTTONS.map((label) => (
            <button
              key={label}
              onClick={() => {
                const el = document.getElementById('ai-flashcards')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="
                inline-flex items-center justify-center
                bg-white text-black
                border border-black/10
                rounded-full
                text-[13px] sm:text-[15px]
                px-4 sm:px-5 py-[0.3em]
                mx-[0.2em] mb-[0.4em]
                whitespace-nowrap
                cursor-pointer
                hover:bg-black hover:text-white
                transition-colors duration-200
              "
            >
              {label}
            </button>
          ))}

          {/* Outline email pill */}
          <button
            onClick={handleCopyEmail}
            className="
              inline-flex items-center justify-center
              text-white bg-transparent
              border border-white
              rounded-full
              text-[13px] sm:text-[15px]
              px-4 sm:px-5 py-[0.3em]
              mx-[0.2em] mb-[0.4em]
              gap-2 sm:gap-3
              whitespace-nowrap
              cursor-pointer
              hover:bg-white hover:text-black
              transition-colors duration-200
            "
            title="Copy email address"
          >
            <span>
              Contact us:{' '}
              <span className="underline underline-offset-1">
                {copied ? 'Copied!' : 'hello@ankify.app'}
              </span>
            </span>
            <CopyIcon />
          </button>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div className="relative w-full min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <AnkifyFeatureSection />
      <SynthesizeCardsCTA />
      <Footer />
    </div>
  )
}
