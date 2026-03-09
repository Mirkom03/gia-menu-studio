import { notFound } from 'next/navigation'
import { getMenuById } from '@/lib/actions/menu-actions'
import { getStyles } from '@/lib/actions/style-actions'
import { getUserPreferences } from '@/lib/actions/preference-actions'
import { GenerateFlow } from './generate-flow'
import type { Language } from '@/lib/types'

const VALID_LANGUAGES = new Set<Language>(['es', 'en', 'fr'])

export default async function GeneratePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ lang?: string }>
}) {
  const { id } = await params
  const { lang } = await searchParams

  let menu, items
  try {
    const result = await getMenuById(id)
    menu = result.menu
    items = result.items
  } catch {
    notFound()
  }

  const [styles, preferences] = await Promise.all([
    getStyles(),
    getUserPreferences(),
  ])

  // URL param takes priority over saved preferences
  const defaultLanguage: Language =
    lang && VALID_LANGUAGES.has(lang as Language)
      ? (lang as Language)
      : preferences.defaultLanguage

  return (
    <GenerateFlow
      menu={menu}
      items={items}
      styles={styles}
      defaultLanguage={defaultLanguage}
      defaultPreferences={preferences}
    />
  )
}
