export interface ThemePreset {
  label: string
  styles: {
    light: Record<string, string>
    dark: Record<string, string>
  }
}

export interface ColorTheme {
  name: string
  value: string
  preset: ThemePreset
}

export interface RadiusOption {
  name: string
  value: string
}

export interface FontOption {
  name: string
  value: string
  fontFamily: string
}

export interface FontSizeOption {
  name: string
  value: string
  description: string
}
