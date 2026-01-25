"use client"

import * as React from "react"
import { Moon, Palette, RotateCcw, Settings, Sun, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useThemeManager } from "@/lib/hooks/useThemeManager"
import { colorThemes, radiusOptions, fontOptions, fontSizeOptions } from "@/config/theme-presets"

interface ThemeCustomizerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ThemeCustomizer({ open, onOpenChange }: ThemeCustomizerProps) {
  const { isDarkMode, applyTheme, applyRadius, applyFont, applyFontSize, resetTheme, setTheme } = useThemeManager()
  const [selectedTheme, setSelectedTheme] = React.useState("default")
  const [selectedRadius, setSelectedRadius] = React.useState("0.5rem")
  const [selectedFont, setSelectedFont] = React.useState("inter")
  const [selectedFontSize, setSelectedFontSize] = React.useState("16px")

  // Load saved selections on mount
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const savedTheme = localStorage.getItem('saas-color-theme') || 'default'
    const savedRadius = localStorage.getItem('saas-border-radius') || '0.5rem'
    const savedFontFamily = localStorage.getItem('saas-font-family')
    const savedFontSize = localStorage.getItem('saas-font-size') || '16px'
    
    setSelectedTheme(savedTheme)
    setSelectedRadius(savedRadius)
    setSelectedFontSize(savedFontSize)

    // Find font by matching family string
    if (savedFontFamily) {
      const font = fontOptions.find(f => f.fontFamily === savedFontFamily)
      if (font) {
        setSelectedFont(font.value)
      }
    }
  }, [])

  const handleThemeSelect = (value: string) => {
    setSelectedTheme(value)
    applyTheme(value, isDarkMode)
  }

  const handleRadiusSelect = (value: string) => {
    setSelectedRadius(value)
    applyRadius(value)
  }

  const handleFontSelect = (value: string) => {
    setSelectedFont(value)
    const font = fontOptions.find(f => f.value === value)
    if (font) {
      applyFont(font.fontFamily)
    }
  }

  const handleFontSizeSelect = (value: string) => {
    setSelectedFontSize(value)
    applyFontSize(value)
  }

  const handleModeToggle = (darkMode: boolean) => {
    setTheme(darkMode ? 'dark' : 'light')
  }

  const handleReset = () => {
    setSelectedTheme('default')
    setSelectedRadius('0.5rem')
    setSelectedFont('inter')
    setSelectedFontSize('16px')
    resetTheme()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              <DialogTitle>Theme Customizer</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={handleReset} title="Reset to defaults">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Customize the appearance of your dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mode Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Mode
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={!isDarkMode ? "default" : "outline"}
                size="sm"
                onClick={() => handleModeToggle(false)}
                className="w-full"
              >
                <Sun className="h-4 w-4 mr-2" />
                Light
              </Button>
              <Button
                variant={isDarkMode ? "default" : "outline"}
                size="sm"
                onClick={() => handleModeToggle(true)}
                className="w-full"
              >
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </Button>
            </div>
          </div>

          <Separator />

          {/* Color Theme Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Color Theme</Label>
            <RadioGroup value={selectedTheme} onValueChange={handleThemeSelect}>
              <div className="grid gap-3">
                {colorThemes.map((theme) => (
                  <div
                    key={theme.value}
                    className={`relative flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                      selectedTheme === theme.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleThemeSelect(theme.value)}
                  >
                    <RadioGroupItem value={theme.value} id={theme.value} />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex gap-1">
                        <div
                          className="w-6 h-6 rounded-full border border-border"
                          style={{
                            background: `hsl(${theme.preset.styles.light.primary})`,
                          }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border border-border"
                          style={{
                            background: `hsl(${theme.preset.styles.light.secondary})`,
                          }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border border-border"
                          style={{
                            background: `hsl(${theme.preset.styles.light.accent})`,
                          }}
                        />
                      </div>
                      <Label
                        htmlFor={theme.value}
                        className="font-medium cursor-pointer"
                      >
                        {theme.name}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Radius Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Border Radius</Label>
            <div className="grid grid-cols-5 gap-2">
              {radiusOptions.map((option) => (
                <button
                  key={option.value}
                  className={`relative rounded-md p-3 border transition-colors text-center ${
                    selectedRadius === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleRadiusSelect(option.value)}
                >
                  <div className="text-xs font-medium">{option.name}</div>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Font Family Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Type className="h-4 w-4" />
              Font Family
            </Label>
            <Select value={selectedFont} onValueChange={handleFontSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem 
                    key={font.value} 
                    value={font.value}
                    style={{ fontFamily: font.fontFamily }}
                  >
                    {font.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Font Size Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Font Size</Label>
            <Select value={selectedFontSize} onValueChange={handleFontSizeSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {fontSizeOptions.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{size.name}</span>
                      <span className="text-xs text-muted-foreground">{size.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Export a trigger button for easy integration
export function ThemeCustomizerTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      title="Customize theme"
    >
      <Settings className="h-4 w-4" />
    </Button>
  )
}
