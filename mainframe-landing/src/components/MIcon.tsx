import React from 'react'

interface MIconProps {
  name: string
  size?: number | string
  fill?: 0 | 1
  weight?: number
  grade?: number
  opticalSize?: number
  className?: string
}

export const MIcon: React.FC<MIconProps> = ({
  name,
  size = 20,
  fill = 0,
  weight = 400,
  grade = 0,
  opticalSize = 24,
  className = '',
}) => {
  return (
    <span
      className={`material-symbols-outlined select-none inline-flex items-center justify-center ${className}`}
      style={{
        fontSize: typeof size === 'number' ? `${size}px` : size,
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
      }}
    >
      {name}
    </span>
  )
}
