import { TopNav } from '@/components/top-nav'
import { BottomNav } from '@/components/bottom-nav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-8 lg:px-8 lg:pb-8 lg:pt-10">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
