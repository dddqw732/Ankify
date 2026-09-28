import React from 'react'
import ariaHeadImg from '../assets/aria-head.png'
import { MIcon } from './MIcon'

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-black border-t border-white/10 py-12 px-6 sm:px-10 text-white/60">
      <div className="max-w-[1080px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <img
            src={ariaHeadImg}
            alt="Ankify ARIA character"
            className="w-7 h-7 object-contain rounded-full border border-white/10"
          />
          <span
            className="text-white text-lg tracking-tight font-medium"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Ankify®
          </span>
          <span className="text-white/40 text-xs font-mono">AI Learning Platform</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-xs text-white/60">
          <a href="#ai-flashcards" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#synthesize-cta" className="hover:text-white transition-colors">
            Synthesize
          </a>
          <a href="mailto:hello@ankify.ai" className="hover:text-white transition-colors">
            Contact
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Privacy
          </a>
        </div>

        {/* Copyright */}
        <div className="text-[11px] text-white/40 font-mono">
          © {new Date().getFullYear()} Ankify Inc. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
