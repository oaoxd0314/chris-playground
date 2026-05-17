'use client'

import theme from 'tailwindcss/defaultTheme'
import { useMediaQuery } from '../use-media-query'

const BREAK_POINTS = {
  sm: theme.screens.sm,
  md: theme.screens.md,
  lg: theme.screens.lg,
  xl: theme.screens.xl,
  '2xl': theme.screens['2xl'],
} as const

export type Breakpoint = keyof typeof BREAK_POINTS

export const useBreakPointDown = (key: Breakpoint) => {
  const matched = useMediaQuery(`(max-width: calc(${BREAK_POINTS[key]} - 1px))`)
  return matched
}

export const useBreakPointUp = (key: Breakpoint) => {
  const matched = useMediaQuery(`(min-width: ${BREAK_POINTS[key]})`)
  return matched
}

export const useBreakPointBetween = (start: Breakpoint, end: Breakpoint) => {
  const matched = useMediaQuery(
    `(min-width: ${BREAK_POINTS[start]}) and (max-width: calc(${BREAK_POINTS[end]} - 1px))`
  )
  return matched
}

export const useBreakPointOnly = (key: Breakpoint) => {
  const matched = useMediaQuery(
    `(min-width: ${BREAK_POINTS[key]}) and (max-width: calc(${BREAK_POINTS[key]} - 1px))`
  )
  return matched
}

export const useBreakPointNot = (key: Breakpoint) => {
  const matched = useMediaQuery(
    `(not all and (min-width: ${BREAK_POINTS[key]}) and (max-width: calc(${BREAK_POINTS[key]} - 1px)))`
  )
  return matched
}
