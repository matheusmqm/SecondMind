import { ToggleButton, useTheme } from '@heroui/react'
import { Moon, Sun } from 'lucide-react'

// Single theme controller of the app (HeroUI stores the choice and sets the class on <html>).
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme('system')
  const dark = resolvedTheme === 'dark'
  return (
    <ToggleButton
      isIconOnly
      variant="ghost"
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      isSelected={dark}
      onChange={(selected) => setTheme(selected ? 'dark' : 'light')}
    >
      {dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </ToggleButton>
  )
}
