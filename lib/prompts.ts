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
  showLocation?: boolean
}

const categoryLabelsByLang: Record<string, Record<string, string>> = {
  es: { starter: 'Primeros (a elegir)', main: 'Segundos (a elegir)', dessert: 'Postre o Cafe (incluido, a elegir)', drink: 'Bebida (a elegir)', other: 'Otro' },
  en: { starter: 'Starters (choose one)', main: 'Main Courses (choose one)', dessert: 'Dessert or Coffee (included, choose one)', drink: 'Beverage (choose one)', other: 'Other' },
  fr: { starter: 'Entrees (au choix)', main: 'Plats (au choix)', dessert: 'Dessert ou Cafe (inclus, au choix)', drink: 'Boisson (au choix)', other: 'Autre' },
}

const menuTypeLabelByLang: Record<string, string> = {
  es: 'Menu del Mediodia',
  en: 'Lunch Menu',
  fr: 'Menu du Midi',
}

const textLangName: Record<string, string> = {
  es: 'Spanish',
  en: 'English',
  fr: 'French',
}

const aspectRatioDescriptions: Record<string, string> = {
  '3:4': 'portrait orientation, 3:4 aspect ratio (standard menu card)',
  '2:3': 'portrait orientation, 2:3 aspect ratio (tall menu card)',
  '4:3': 'landscape orientation, 4:3 aspect ratio',
  '9:16': 'portrait orientation, 9:16 aspect ratio (vertical social media story)',
  '16:9': 'landscape orientation, 16:9 aspect ratio (horizontal banner)',
  '1:1': 'square format, 1:1 aspect ratio',
}

function buildStyleSection(stylePrompt: string | undefined): string | null {
  if (!stylePrompt || !stylePrompt.trim()) return null
  return `[STYLE DIRECTIVE]\n${stylePrompt.trim()}`
}

function buildLayoutSection(aspectRatio: string): string {
  const description = aspectRatioDescriptions[aspectRatio] ?? `${aspectRatio} aspect ratio`

  return `[LAYOUT]
Restaurant menu card in ${description}. Print-quality design.

Layout: single-column centered layout with generous margins (15-20% on each side).

TYPOGRAPHY HIERARCHY:
- Layer 1 — Restaurant name "Gia": largest element, decorative display serif or bold display font, top of image, centered
- Layer 2 — Section headers (Primeros, Segundos, Postre): medium size, uppercase with wide letter-spacing, clearly distinct from dish names
- Layer 3 — Dish names: clearly readable, medium-weight serif or sans-serif, left-aligned or centered within their section
- Layer 4 — Dish descriptions (if any): smaller, lighter weight, italic or muted color
- Layer 5 — Price: right-aligned or inline, same size as dish names or smaller, never bolder than dish names

Typography constraints: maximum two typefaces, body text minimum medium weight (not thin/hairline), letter-spacing on all uppercase text.`
}

function buildContentSection(input: PromptInput, labels: Record<string, string>): string {
  const lang = input.language ?? 'es'

  const dishLines = Object.entries(
    Object.groupBy(input.dishes, (d) => d.category)
  )
    .map(([cat, items]) => {
      const sectionLabel = labels[cat] ?? cat
      // Skip listing items that are redundant with the section label
      // e.g. "Postre o Café" under the "Postre o Cafe (incluido, a elegir)" header
      const filteredItems = items!.filter((d) => {
        const normName = d.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
        const normLabel = sectionLabel.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split('(')[0].trim()
        return normName !== normLabel
      })
      if (filteredItems.length === 0) {
        // Section label alone is enough — no items to list
        return `${sectionLabel} (included)`
      }
      return `${sectionLabel}:\n${filteredItems.map((d) => `  - "${d.name}"`).join('\n')}`
    })
    .join('\n\n')

  const menuTypeLabel = input.menuType === 'event'
    ? `Special Event: ${input.eventTitle}`
    : menuTypeLabelByLang[lang] ?? menuTypeLabelByLang.es

  // Filter out items redundant with their section label (same as above)
  const allFilteredDishes = input.dishes.filter((d) => {
    const sectionLabel = labels[d.category] ?? d.category
    const normName = d.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
    const normLabel = sectionLabel.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split('(')[0].trim()
    return normName !== normLabel
  })
  const dishNameList = allFilteredDishes.map((d) => `  "${d.name}"`).join('\n')
  const locationLine = input.showLocation ? '\nLocation: Alfaz del Pi, Alicante' : ''

  return `[CONTENT]
Restaurant: Gia Restaurante${locationLine}

${menuTypeLabel}
Valid: ${input.dateRange}

${dishLines}

Price: ${input.price} EUR

The following dish names must appear EXACTLY as written with correct accents and special characters:
${dishNameList}`
}

function buildConstraintsSection(input: PromptInput): string {
  const lang = input.language ?? 'es'

  const negativePrompts = `NEGATIVE CONSTRAINTS:
- No food photographs or images of food
- No clipart or cartoon illustrations
- No extra text beyond what is listed in the CONTENT section above
- No blurry, garbled, or illegible text
- No watermarks or extra branding beyond the GIA logo
- No busy or cluttered background texture that overlaps text
- No more than two typefaces
- No thick heavy borders or ornate frames that crowd the text area`

  const logoInstructions = `LOGO INSTRUCTIONS:
- The first inline image provided is the GIA restaurant logo — it MUST appear in the generated image.
- Place the logo at the top center of the menu, centered horizontally, within the top 20% of the image.
- The logo should occupy approximately 15% of the image width.
- Preserve the logo's original warm beige/sandy color (approximately #D4B49A) EXACTLY — do not recolor, tint, adjust brightness, or alter the logo in any way.
- The logo should appear naturally integrated into the header area, above all menu text content.
- Do NOT include any watermarks, other logos, or extra branding — only the GIA logo provided.`

  let languageInstructions = ''
  if (lang === 'en') {
    languageInstructions = `\n\nLANGUAGE INSTRUCTIONS:
- All text must be in English
- Use proper culinary English: Starters, Main Courses, Desserts
- Preserve correct spelling and capitalization exactly as listed in CONTENT
- Maintain exact same visual layout, colors, typography`
  } else if (lang === 'fr') {
    languageInstructions = `\n\nLANGUAGE INSTRUCTIONS:
- All text must be in French
- Use proper French culinary terminology: Entrees, Plats, Desserts
- Preserve all French accents exactly: e, e, e, a, a, o, u, u, c, i, i — do NOT simplify or omit
- Maintain exact same visual layout, colors, typography`
  }

  return `[CONSTRAINTS]
${negativePrompts}

${logoInstructions}${languageInstructions}`
}

export function buildMenuPrompt(input: PromptInput): string {
  const lang = input.language ?? 'es'
  const labels = categoryLabelsByLang[lang] ?? categoryLabelsByLang.es

  const sections = [
    buildStyleSection(input.stylePrompt),
    buildLayoutSection(input.aspectRatio),
    buildContentSection(input, labels),
    buildConstraintsSection(input),
  ].filter((s): s is string => s !== null)

  return sections.join('\n\n')
}
