import React from 'react'
import { motion } from 'framer-motion'

interface FadeUpProps {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
}

export const FadeUp: React.FC<FadeUpProps> = ({
  children,
  delay = 0,
  y = 24,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
