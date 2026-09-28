import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  className?: string
  onClick?: () => void
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children = 'Try Ankify for free',
  className,
  onClick,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative inline-flex items-center justify-center overflow-hidden rounded-full',
        'bg-white/90 hover:bg-white text-black font-medium text-sm sm:text-base',
        'px-6 sm:px-8 py-3.5 sm:py-4 transition-all duration-300 shadow-[0_0_24px_rgba(255,255,255,0.18)] cursor-pointer',
        className
      )}
      {...props}
    >
      <span className="relative flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-0.5">
        <span>{children}</span>
        <motion.span
          className="inline-block"
          initial={{ x: 0 }}
          whileHover={{ x: 3 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          →
        </motion.span>
      </span>
    </button>
  )
}
