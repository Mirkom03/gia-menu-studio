import { TopNav } from '@/components/top-nav'
import { BottomNav } from '@/components/bottom-nav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-6 lg:px-6 lg:pb-6">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
