import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check email restriction
      const { data: { user } } = await supabase.auth.getUser()

      if (user?.email !== process.env.ALLOWED_EMAIL) {
        // Unauthorized email: sign out and redirect with error
        await supabase.auth.signOut()
        return NextResponse.redirect(
          `${origin}/login?error=unauthorized`
        )
      }

      return NextResponse.redirect(`${origin}/`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
