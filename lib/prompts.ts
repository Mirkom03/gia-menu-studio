import type { Language } from '@/lib/types'

export interface PromptInput {
  stylePrompt: string
  dishes: { category: string; name: string }[]
  price: string
  dateRange: string
  aspectRatio: string
  menuType: 'weekly' | 'event'
  eventTitle?: string
  language?: Language
}

const categoryLabelsByLang: Record<string, Record<string, string>> = {
  es: { starter: 'Primeros', main: 'Segundos', dessert: 'Postre', drink: 'Bebida', other: 'Otro' },
  en: { starter: 'Starters', main: 'Main Courses', dessert: 'Dessert', drink: 'Beverage', other: 'Other' },
  fr: { starter: 'Entrees', main: 'Plats', dessert: 'Dessert', drink: 'Boisson', other: 'Autre' },
}

const menuTypeLabelByLang: Record<string, string> = {
  es: 'Menu del Dia',
  en: 'Daily Menu',
  fr: 'Menu du Jour',
}

const textLangName: Record<string, string> = {
  es: 'Spanish',
  en: 'English',
  fr: 'French',
}

export function buildMenuPrompt(input: PromptInput): string {
  const lang = input.language ?? 'es'
  const labels = categoryLabelsByLang[lang] ?? categoryLabelsByLang.es

  const dishLines = Object.entries(
    Object.groupBy(input.dishes, (d) => d.category)
  )
    .map(
      ([cat, items]) =>
        `${labels[cat] ?? cat}:\n${items!.map((d) => `  - ${d.name}`).join('\n')}`
    )
    .join('\n\n')

  const menuTypeLabel = input.menuType === 'event'
    ? `Special Event: ${input.eventTitle}`
    : menuTypeLabelByLang[lang] ?? menuTypeLabelByLang.es

  const languageInstructions = lang !== 'es'
    ? `\n- All text on the menu image must be in ${textLangName[lang]}.
- Maintain the EXACT same visual layout, colors, and typography as the Spanish version. Only translate the text content.`
    : ''

  return `${input.stylePrompt}

Create a restaurant menu image with the following content:

Restaurant: Gia Restaurante
Location: Alfaz del Pi, Alicante

${menuTypeLabel}
Valid: ${input.dateRange}

${dishLines}

Price: ${input.price} EUR

OUTPUT INSTRUCTIONS:
- Aspect ratio: ${input.aspectRatio}
- All text must be perfectly legible and correctly spelled
- Include the restaurant name "Gia" prominently
- Include "${input.dateRange}" in a subtle, small, elegant line near the top below the restaurant name or at the bottom
- The following dish names must appear EXACTLY as written with correct accents and special characters:
${input.dishes.map((d) => `  "${d.name}"`).join('\n')}
- Do NOT add any dishes or text not listed above
- Do NOT include any watermarks or logos other than the restaurant name${languageInstructions}`
}
