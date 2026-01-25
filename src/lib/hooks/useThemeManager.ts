"use client"

import React from 'react'
import { useTheme } from '@/contexts/theme-context'
import { colorThemes } from '@/config/theme-presets'

export function useThemeManager() {
  const { theme, setTheme } = useTheme()
  const [isDarkMode, setIsDarkMode] = React.useState(false)

  // Detect and update dark mode state
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const updateDarkMode = () => {
      if (theme === "dark") {
        setIsDarkMode(true)
      } else if (theme === "light") {
        setIsDarkMode(false)
      } else {
        // For system theme, check the actual applied class
        const isDark = document.documentElement.classList.contains('dark')
        setIsDarkMode(isDark)
      }
    }

    // Update immediately
    updateDarkMode()

    // Listen for system theme changes when using system theme
    if (theme === 'system') {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = () => updateDarkMode()
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  // Apply a theme preset
  const applyTheme = React.useCallback((themeValue: string, darkMode: boolean) => {
    const themePreset = colorThemes.find(t => t.value === themeValue)
    if (!themePreset) return

    const styles = darkMode ? themePreset.preset.styles.dark : themePreset.preset.styles.light
    const root = document.documentElement

    // Apply theme variables
    // Our theme values are in HSL format like "240 10% 3.9%"
    // Tailwind 4 can work with both HSL and OKLCH, so we just need to set them correctly
    Object.entries(styles).forEach(([key, value]) => {
      // Check if the value looks like HSL format (has %)
      if (value.includes('%')) {
        // It's HSL - convert to proper hsl() format
        root.style.setProperty(`--${key}`, `hsl(${value})`)
      } else {
        // Use as-is (might be oklch or other format)
        root.style.setProperty(`--${key}`, value)
      }
    })

    // Store selected theme in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('saas-color-theme', themeValue)
    }
  }, [])

  // Apply border radius
  const applyRadius = React.useCallback((radius: string) => {
    document.documentElement.style.setProperty('--radius', radius)
    if (typeof window !== 'undefined') {
      localStorage.setItem('saas-border-radius', radius)
    }
  }, [])

  // Apply font family
  const applyFont = React.useCallback((fontFamily: string) => {
    document.documentElement.style.setProperty('--font-sans', fontFamily)
    document.body.style.fontFamily = fontFamily
    if (typeof window !== 'undefined') {
      localStorage.setItem('saas-font-family', fontFamily)
    }
  }, [])

  // Apply font size
  const applyFontSize = React.useCallback((fontSize: string) => {
    document.documentElement.style.fontSize = fontSize
    if (typeof window !== 'undefined') {
      localStorage.setItem('saas-font-size', fontSize)
    }
  }, [])

  // Reset to default theme
  const resetTheme = React.useCallback(() => {
    const root = document.documentElement
    
    // Remove all custom CSS variables
    const cssVars = [
      'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
      'primary', 'primary-foreground', 'secondary', 'secondary-foreground',
      'muted', 'muted-foreground', 'accent', 'accent-foreground',
      'destructive', 'destructive-foreground', 'border', 'input', 'ring'
    ]
    
    cssVars.forEach(varName => {
      root.style.removeProperty(`--${varName}`)
    })

    // Reset font settings
    root.style.removeProperty('--font-sans')
    root.style.removeProperty('font-size')
    document.body.style.removeProperty('font-family')

    // Reset to system theme
    setTheme('system')
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('saas-color-theme')
      localStorage.removeItem('saas-border-radius')
      localStorage.removeItem('saas-font-family')
      localStorage.removeItem('saas-font-size')
    }
  }, [setTheme])

  // Load saved theme on mount
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const savedTheme = localStorage.getItem('saas-color-theme')
    const savedRadius = localStorage.getItem('saas-border-radius')
    const savedFont = localStorage.getItem('saas-font-family')
    const savedFontSize = localStorage.getItem('saas-font-size')

    if (savedTheme) {
      applyTheme(savedTheme, isDarkMode)
    }

    if (savedRadius) {
      applyRadius(savedRadius)
    }

    if (savedFont) {
      applyFont(savedFont)
    }

    if (savedFontSize) {
      applyFontSize(savedFontSize)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-apply theme when dark mode changes
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const savedTheme = localStorage.getItem('saas-color-theme')
    if (savedTheme) {
      applyTheme(savedTheme, isDarkMode)
    }
  }, [isDarkMode, applyTheme])

  return {
    theme,
    setTheme,
    isDarkMode,
    applyTheme,
    applyRadius,
    applyFont,
    applyFontSize,
    resetTheme,
  }
}
