'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, Clock, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'

const navItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/create', label: 'Crear', icon: PlusCircle },
  { href: '/history', label: 'Historial', icon: Clock },
  { href: '/settings', label: 'Ajustes', icon: Settings },
] as const

export function TopNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 hidden lg:block border-b border-border/60 bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-primary transition-opacity hover:opacity-80">
          Già
        </Link>

        <nav className="flex items-center gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}

          <div className="ml-3 border-l border-border/60 pl-3">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  )
}
