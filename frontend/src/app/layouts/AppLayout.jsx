import { Separator } from '@heroui/react'
import { Link, Outlet } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function AppLayout() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 bg-surface">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="SecondMind: home" className="rounded-lg">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
        <Separator />
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
