export interface PromptInput {
  stylePrompt: string
  dishes: { category: string; name: string }[]
  price: string
  dateRange: string
  aspectRatio: string
  menuType: 'weekly' | 'event'
  eventTitle?: string
}

const categoryLabels: Record<string, string> = {
  starter: 'Primeros',
  main: 'Segundos',
  dessert: 'Postre',
  drink: 'Bebida',
  other: 'Otro',
}

export function buildMenuPrompt(input: PromptInput): string {
  const dishLines = Object.entries(
    Object.groupBy(input.dishes, (d) => d.category)
  )
    .map(
      ([cat, items]) =>
        `${categoryLabels[cat] ?? cat}:\n${items!.map((d) => `  - ${d.name}`).join('\n')}`
    )
    .join('\n\n')

  return `${input.stylePrompt}

Create a restaurant menu image with the following content:

Restaurant: Gia Restaurante
Location: Alfaz del Pi, Alicante

${input.menuType === 'event' ? `Special Event: ${input.eventTitle}` : 'Menu del Dia'}
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
- Do NOT include any watermarks or logos other than the restaurant name`
}
