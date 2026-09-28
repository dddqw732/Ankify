import { useEffect, useState, useRef } from 'react'

interface UseTypewriterOptions {
  text: string
  speed?: number
  startDelay?: number
}

interface UseTypewriterResult {
  displayed: string
  done: boolean
}

export function useTypewriter({
  text,
  speed = 38,
  startDelay = 600,
}: UseTypewriterOptions): UseTypewriterResult {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    indexRef.current = 0

    const delayTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        indexRef.current += 1
        setDisplayed(text.slice(0, indexRef.current))
        if (indexRef.current >= text.length) {
          clearInterval(interval)
          setDone(true)
        }
      }, speed)

      return () => clearInterval(interval)
    }, startDelay)

    return () => clearTimeout(delayTimeout)
  }, [text, speed, startDelay])

  return { displayed, done }
}
