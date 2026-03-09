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
    <header className="sticky top-0 z-50 hidden border-b bg-background/80 backdrop-blur lg:block">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold text-primary">
          Gia
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'font-medium text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}

          <div className="ml-2 border-l pl-2">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  )
}
