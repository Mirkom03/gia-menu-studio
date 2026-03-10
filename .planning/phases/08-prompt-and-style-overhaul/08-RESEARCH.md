# Phase 8: Prompt & Style Overhaul - Research

**Researched:** 2026-03-10
**Domain:** Gemini image generation prompt engineering + restaurant menu design + Supabase seed data
**Confidence:** HIGH

---

## Summary

Phase 8 transforms the GIÀ Menu Studio from producing generic AI-looking menus into generating images that visually resemble professionally designed restaurant menus. The work splits into two parallel tracks: (1) restructure `buildMenuPrompt()` in `lib/prompts.ts` to use a modular four-section prompt format with explicit negative prompting, text hierarchy, and aspect ratio declaration, and (2) replace the five one-liner style presets in `supabase/migrations/002_seed_styles.sql` with eight research-backed archetypes that each carry a multi-paragraph `prompt_template` and accurate `colors` JSONB for gradient preview cards.

The current `buildMenuPrompt()` function prepends `input.stylePrompt` (whatever single-line string the chosen style's `prompt_template` contains) to a flat block of menu content, then appends a single OUTPUT INSTRUCTIONS block. Research confirms that Gemini responds much better to a structured [STYLE] → [LAYOUT] → [CONTENT] → [CONSTRAINTS] pattern, with style and negative constraints providing the most leverage over output quality. The current logo instructions (added in Phase 7 to the OUTPUT INSTRUCTIONS block) must be preserved verbatim and moved into the new CONSTRAINTS section.

Style seed data lives entirely in `supabase/migrations/002_seed_styles.sql`. The `prompt_template` column is TEXT (unlimited), so multi-paragraph prompts require no schema migration. The `colors` column is JSONB and already drives gradient previews in `StyleGallery` via `buildGradient()`. No TypeScript type changes are needed, no new packages are needed, and no UI changes are in scope.

**Primary recommendation:** Restructure `buildMenuPrompt()` first (Plan 08-01), then write and apply the new seed migration (Plan 08-02) — in that order, because the new prompt structure must accommodate multi-paragraph style templates before they are inserted.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PRMT-01 | `buildMenuPrompt()` restructured with modular sections: [STYLE] → [LAYOUT] → [CONTENT] → [CONSTRAINTS] | Research section "Prompt Architecture" — exact section names and ordering confirmed |
| PRMT-02 | Explicit negative prompting in every generation (no food photos, no clipart, no extra text, no blurry text, no watermarks) | Research section "Negative Prompting" — exact list of negatives documented |
| PRMT-03 | Text hierarchy instructions define 5 layers (restaurant name > section headers > dish names > descriptions > prices) with sizing/weight guidance | Research section "Text Hierarchy" — all 5 layers documented with Gemini-specific language |
| PRMT-04 | Aspect ratio and orientation explicitly stated in prompt (not just passed as API parameter) | Research section "Aspect Ratio in Prompt" — confirmed as Gemini best practice |
| PRMT-05 | Language-specific instructions enhanced for EN/FR (culinary terminology, accent handling) | Research section "Language Instructions" — specific improvements documented |
| STYL-01 | Replace 5 current one-liner presets with 8 research-based archetypes | Research section "8 Style Archetypes" — all 8 documented with full details |
| STYL-02 | Each style has a multi-paragraph `prompt_template` with specific colors (hex), typography, decorative elements, and mood | Research section "Style Prompt Templates" — template structure and per-archetype content |
| STYL-03 | Each style has accurate `colors` JSONB metadata for gradient preview cards in StyleGallery | Research section "Colors JSONB" — exact hex values and key names per archetype |
| STYL-04 | Personalizado style preserved with empty `prompt_template` | Research section "Personalizado Handling" — confirmed approach |
</phase_requirements>

---

## Standard Stack

### Core (no changes from current)

| Library/Tool | Version | Purpose | Notes |
|---|---|---|---|
| `@google/genai` | Current (already installed) | Gemini API client | `gemini-3.1-flash-image-preview` model |
| Supabase | Current | Style storage via `styles` table | `prompt_template` TEXT, `colors` JSONB |
| Next.js | 16 | Server Actions, API routes | No changes |
| TypeScript | Current | Type safety | No new types needed |

### No New Packages

All changes are prompt text, seed data, and pure TypeScript logic. Confirmed in `PROJECT.md` constraints: "No new packages — all changes are prompt/data/logic only."

---

## Architecture Patterns

### Recommended Project Structure (no changes)

```
lib/
├── prompts.ts          # buildMenuPrompt() — PRIMARY CHANGE in Plan 08-01
├── gemini.ts           # No changes needed (Phase 7 already wired)
├── types.ts            # No changes needed (Style interface already correct)
└── actions/
    └── style-actions.ts  # No changes needed

supabase/migrations/
└── 003_replace_styles.sql  # NEW migration in Plan 08-02

components/
└── style-gallery.tsx   # No changes needed (buildGradient already works)
```

### Pattern 1: Modular Prompt Structure (PRMT-01)

**What:** Split `buildMenuPrompt()` into four named sections with clear separators. The current flat structure (stylePrompt + content block + OUTPUT INSTRUCTIONS) becomes [STYLE DIRECTIVE] → [LAYOUT] → [CONTENT] → [CONSTRAINTS].

**When to use:** Every single generation call — this is the new baseline.

**Implementation approach:**

```typescript
// lib/prompts.ts — new buildMenuPrompt() structure
export function buildMenuPrompt(input: PromptInput): string {
  // ...

  return [
    buildStyleSection(input.stylePrompt),
    buildLayoutSection(input.aspectRatio),
    buildContentSection(input, labels),
    buildConstraintsSection(input),
  ].join('\n\n')
}
```

The four helper functions (or inline sections) compose the final prompt string. Each section is separated by a blank line. The section header labels (`[STYLE DIRECTIVE]`, `[LAYOUT]`, `[CONTENT]`, `[CONSTRAINTS]`) signal structure to Gemini and improve instruction following.

**Section responsibility breakdown:**

| Section | Content | Source |
|---|---|---|
| `[STYLE DIRECTIVE]` | `input.stylePrompt` verbatim — the full multi-paragraph style template | Style preset's `prompt_template` |
| `[LAYOUT]` | Aspect ratio + orientation text, single-column centered, margin guidance, text hierarchy (5 layers) | Always the same structure, parameterized by `input.aspectRatio` |
| `[CONTENT]` | Restaurant name, menu type label, date range, dish sections with quoted names, price | Same data as today, reformatted with quoted dish names |
| `[CONSTRAINTS]` | Negative prompts (8 items), logo instructions (verbatim from Phase 7), language instructions (if EN/FR) | Assembled per-generation |

### Pattern 2: Negative Prompting (PRMT-02)

**What:** A fixed negative block in the CONSTRAINTS section on every generation.

**Required negatives (exact list for PRMT-02):**

```
- No food photographs or images of food
- No clipart or cartoon illustrations
- No extra text beyond what is listed in the CONTENT section above
- No blurry, garbled, or illegible text
- No watermarks or extra branding
- No busy or cluttered background texture that overlaps text
- No more than two typefaces
- No thick heavy borders or ornate frames that crowd the text area
```

### Pattern 3: Text Hierarchy (PRMT-03)

**What:** Explicit five-layer typography instruction in the LAYOUT section.

**Five layers for Gemini (research-validated):**

```
TYPOGRAPHY HIERARCHY:
- Layer 1 — Restaurant name "Gia": largest element, decorative display serif or bold display font,
  top of image, centered
- Layer 2 — Section headers (Primeros, Segundos, Postre): medium size, uppercase with wide
  letter-spacing, clearly distinct from dish names
- Layer 3 — Dish names: clearly readable, medium-weight serif or sans-serif, left-aligned or
  centered within their section
- Layer 4 — Dish descriptions (if any): smaller, lighter weight, italic or muted color
- Layer 5 — Price: right-aligned or inline, same size as dish names or smaller, never bolder
  than dish names
```

Key constraints to include: "maximum two typefaces," "body text minimum medium weight (not thin/hairline)," "letter-spacing on all uppercase text."

### Pattern 4: Aspect Ratio in Prompt (PRMT-04)

**What:** The aspect ratio value from `input.aspectRatio` must appear as text in the prompt, not just as the `imageConfig.aspectRatio` API parameter.

**Implementation:**

```typescript
// Map aspect ratio codes to human-readable descriptions for the prompt
const aspectRatioDescriptions: Record<string, string> = {
  '3:4':  'portrait orientation, 3:4 aspect ratio (standard menu card)',
  '2:3':  'portrait orientation, 2:3 aspect ratio (tall menu card)',
  '4:3':  'landscape orientation, 4:3 aspect ratio',
  '9:16': 'portrait orientation, 9:16 aspect ratio (vertical social media story)',
  '16:9': 'landscape orientation, 16:9 aspect ratio (horizontal banner)',
  '1:1':  'square format, 1:1 aspect ratio',
}
```

The LAYOUT section opens with: `"Restaurant menu card in [description]. Print-quality design."`

### Pattern 5: Language Instructions Enhancement (PRMT-05)

**Current state (lib/prompts.ts lines 49-52):** Simple two-line instruction — "all text in English/French, maintain same layout."

**Enhanced approach for EN:**

```typescript
const languageInstructionsEN = `
- All text on the menu image must be in English
- Use proper culinary English terminology: "Starters" (not "Entrées"), "Main Courses" (not "Mains"),
  "Desserts" (not "Sweets")
- Preserve correct spelling and capitalization of all dish names exactly as listed in CONTENT
- Maintain the exact same visual layout, colors, typography, and decorative elements`
```

**Enhanced approach for FR:**

```typescript
const languageInstructionsFR = `
- All text on the menu image must be in French
- Use proper French culinary terminology: "Entrées", "Plats", "Desserts"
- Preserve all French accents exactly: é, è, ê, à, â, ô, û, ü, ç, î, ï — do NOT simplify
  or omit accent marks
- Maintain the exact same visual layout, colors, typography, and decorative elements`
```

### Pattern 6: Style Prompt Template Structure (STYL-02)

**What:** Each style's `prompt_template` is a multi-paragraph string that populates the [STYLE DIRECTIVE] section verbatim. It must be self-contained — style, layout preference, typography direction, decorative elements, and mood — so that when placed first in the prompt, it fully primes Gemini's visual direction before layout and content details follow.

**Template structure per archetype:**

```
[STYLE DIRECTIVE]
[1-2 sentences: overall visual concept and material feel]
Background: [color hex + texture description]
Typography: [font style direction + color + weight guidance]
[Border/frame description OR "No border"]
[Decorative elements or "Minimal decoration"]
[1 sentence: mood/atmosphere]
```

Total length per template: approximately 8-12 lines. This is short enough to not crowd the CONTENT section but specific enough to override Gemini's defaults.

### Anti-Patterns to Avoid

- **Vague style prompts:** "Elegant restaurant menu" → Gemini produces generic results. Every style prompt must name specific hex colors, typography styles, and decorative elements.
- **Conflicting instructions across sections:** If [STYLE DIRECTIVE] says "no illustrations" but [LAYOUT] references "botanical corner art," Gemini ignores one. Keep all decoration instructions in [STYLE DIRECTIVE] only.
- **Repeating content instructions in CONSTRAINTS:** CONSTRAINTS section is for negatives and logo only. Do not re-state what should appear — state only what must NOT appear.
- **Over-specifying layout in [STYLE DIRECTIVE]:** Layout decisions (column count, margins, alignment) belong in [LAYOUT], not [STYLE DIRECTIVE]. Mixing them creates conflicts.
- **Dropping Phase 7 logo instructions:** The logo block from `buildMenuPrompt()` lines 76-81 must be copied verbatim into the new CONSTRAINTS section. These are tested and validated.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---|---|---|
| Color gradient previews | Custom CSS gradient generator | The existing `buildGradient()` in `style-gallery.tsx` already handles any number of hex values from the `colors` JSONB |
| Aspect ratio text descriptions | New data structure | A simple `Record<string, string>` lookup in `prompts.ts` is sufficient |
| Style template storage | New table or file system | `prompt_template TEXT` column already exists; just write longer strings |
| Negative prompt list | Dynamic/configurable system | A hardcoded constant in `prompts.ts` is correct — negatives should never vary per style |

---

## 8 Style Archetypes (STYL-01, STYL-02, STYL-03)

All color values are taken directly from `MENU-DESIGNS.md` research, cross-referenced against design research findings. Confidence: HIGH.

### 1. Classic Trattoria

**Archetype personality:** Warm, familial Italian — the neighborhood trattoria that has been there for 40 years.

**Prompt template (multi-paragraph):**

```
A restaurant menu card with the warm, inviting feel of a classic Italian trattoria.
High-quality print design on thick cream-white card stock with subtle parchment texture.
Background: Warm cream (#F5F0E1) with very faint aged paper texture — barely visible.
Typography: Deep dark brown (#2C1810) for all text. Restaurant name in a decorative display
serif with Italian character (similar to Playfair Display or a bold calligraphic serif),
centered at top. Section headers in uppercase burgundy (#722F37) with letter-spacing.
Dish names in warm classic serif, medium weight. Prices in same font, right-aligned or
inline with a dot leader.
Decorative: A single small hand-drawn olive branch or grape vine illustration in one
corner only. Thin hairline rules (burgundy or gold #C8A96E) between sections.
No heavy borders. Single consistent illustration style.
Mood: Warm, authentic, unpretentious but cared-for.
```

**Colors JSONB:**
```json
{"background": "#F5F0E1", "primary": "#722F37", "accent": "#C8A96E", "secondary": "#5C6B3C"}
```

---

### 2. Elegant Fine Dining

**Archetype personality:** Michelin-starred restraint — the menu that lets the food do the talking.

**Prompt template:**

```
A high-end restaurant menu card in the style of a Michelin-starred fine dining establishment.
Luxury print design, matte finish, extreme elegance through restraint.
Background: Near-black charcoal (#1A1A1A) with absolutely no visible texture — pure matte.
Typography: All text in warm ivory (#F2EDE4). Restaurant name in a refined high-contrast
display serif (similar to Didot or Playfair Display), centered, large. Section headers in
small uppercase with generous letter-spacing, gold (#C5A55A). Dish names in elegant serif,
medium size. Prices right-aligned, same font as dish names.
Decorative: Thin single gold line dividers between sections only. No illustrations.
No borders except one ultra-thin rectangular frame set 5% inward from edges.
Mood: Luxurious, exclusive, quiet confidence, understated.
```

**Colors JSONB:**
```json
{"background": "#1A1A1A", "primary": "#F2EDE4", "accent": "#C5A55A", "secondary": "#8A8580"}
```

---

### 3. Rustic Mediterranean

**Archetype personality:** Farm-to-table coastal — herbs, olive oil, sun-baked earth.

**Prompt template:**

```
A restaurant menu card with rustic Mediterranean character — farm-to-table, honest, earthy.
Artisanal print feel on kraft-paper or aged parchment stock.
Background: Warm kraft parchment (#E8D5B5) with subtle organic texture, slightly uneven.
No heavy distressing.
Typography: Charcoal (#2C2C2C) for all text. Restaurant name in a bold hand-lettered
or painted serif style (rustic but not sloppy). Section headers in uppercase terra cotta
(#C4694A) with wide letter-spacing. Dish names in sturdy serif, regular weight. Descriptions
in lighter italic. Prices inline or right-aligned.
Decorative: Simple hand-drawn line-art botanical illustrations (olive branch, rosemary, lemon
slice) — one small motif between sections OR in one corner only. Single illustration style
throughout — all line art, not filled. Thin terra cotta rule below each section header.
Mood: Sun-washed, honest, coastal, farm-to-table authenticity.
```

**Colors JSONB:**
```json
{"background": "#E8D5B5", "primary": "#C4694A", "accent": "#8A9A5B", "secondary": "#2C2C2C"}
```

---

### 4. Modern Minimalist

**Archetype personality:** Nordic/contemporary — design-forward, zero decoration, typography as the only art.

**Prompt template:**

```
A contemporary minimalist restaurant menu card. Modern graphic design — clean, confident,
bold through restraint.
Background: Pure matte white (#FFFFFF). No texture, no border, no decoration.
Typography: All text in near-black charcoal (#111111). Restaurant name in bold geometric
sans-serif (similar to Montserrat or Futura), uppercase, extra-bold, centered or left-aligned.
Section headers in medium-weight uppercase sans-serif with a thin single underline rule in
a muted accent color — terracotta (#B86B4A) or steel blue (#5B7B8A). Dish names in regular
weight sans-serif. Prices right-aligned, consistent.
Decorative: None. Only the thin accent-color rule under section headers is permitted.
Maximum whitespace — 40-50% of the image area should be empty white space.
Layout preference: Left-aligned text with wide left margin creates a modern asymmetric feel.
Mood: Contemporary, design-forward, Nordic-influenced, confident.
```

**Colors JSONB:**
```json
{"background": "#FFFFFF", "primary": "#111111", "accent": "#B86B4A", "secondary": "#E0E0E0"}
```

---

### 5. Vintage Osteria

**Archetype personality:** Old-world Italian wine bar — history, heritage, ornament.

**Prompt template:**

```
A restaurant menu card in the style of a historic Italian osteria or enoteca —
old-world charm, nostalgic, time-honored.
Background: Aged cream (#EDE5D0) with subtle distressed parchment texture — visible but
not overwhelming.
Typography: Dark brown (#3E2723) for body text. Restaurant name in ornamental display serif
with flourishes (Edwardian Script-style or heavily decorative). Section headers in wine red
(#5B1A2A), old-style serif (Baskerville or Caslon style), uppercase or small-caps.
Dish names in elegant italic serif. Prices in matching serif, right-aligned.
Decorative: Thin Victorian-style ornamental border with corner flourishes. Small centered
decorative divider between sections (a fleur-de-lis, small diamond, or engraving-style ornament).
Antique gold (#B8860B) used for border and divider accents only. Engraving-style illustration
feel if decorations are included.
Mood: Old-world charm, nostalgic, established, literary.
```

**Colors JSONB:**
```json
{"background": "#EDE5D0", "primary": "#5B1A2A", "accent": "#B8860B", "secondary": "#3E2723"}
```

---

### 6. Coastal Mediterranean

**Archetype personality:** Amalfi coast dining — light, breezy, blue water, fresh citrus.

**Prompt template:**

```
A restaurant menu card with the breezy, sun-drenched feel of coastal Mediterranean dining —
light, airy, and fresh.
Background: Clean white (#FFFFFF) with the faintest suggestion of linen or whitewashed
texture. Very airy and open.
Typography: Deep navy (#1B2838) for all body text. Restaurant name in a light elegant
serif (similar to Cormorant Garamond), styled with an airy, refined feel. Section headers
in Mediterranean blue (#2E6B8A), uppercase with letter-spacing. Dish names in clean light
serif. Prices right-aligned or inline.
Decorative: One small watercolor-style illustration — a lemon branch, a ceramic tile motif,
or a simple fish — in a single corner or at the top below the restaurant name. Watercolor
style only (no line art, no photographs). Sandy beige (#E8DCC8) as a subtle rule or
divider accent.
Mood: Breezy, vacation-like, fresh, coastal, approachable elegance.
```

**Colors JSONB:**
```json
{"background": "#FFFFFF", "primary": "#2E6B8A", "accent": "#C67C4E", "secondary": "#E8DCC8"}
```

---

### 7. Luxe Bistro

**Archetype personality:** Parisian upscale bistro — jewel tones, art deco geometry, theatrical glamour.

**Prompt template:**

```
A high-end restaurant menu card in the style of a glamorous Parisian or European luxe bistro.
Rich, theatrical, art-deco influenced design with deep jewel tones.
Background: Deep emerald green (#1B4332). Solid matte — no visible texture, perfectly rich
and saturated.
Typography: All text in champagne gold (#D4AF37). Restaurant name in an art-deco influenced
display serif, large and commanding, centered. Section headers in uppercase with generous
letter-spacing, same gold. Dish names in elegant serif, medium size. Prices right-aligned.
Decorative: Thin geometric gold border — art-deco double-line style with small corner
ornaments. Small gold geometric dividers (diamond or chevron motif) between sections.
Controlled, symmetrical, architectural. Blush accent (#F2D7D9) used very sparingly if at all.
Mood: Glamorous, theatrical, celebratory, Parisian-inflected, refined luxury.
```

**Colors JSONB:**
```json
{"background": "#1B4332", "primary": "#D4AF37", "accent": "#FFFDD0", "secondary": "#F2D7D9"}
```

---

### 8. Contemporary Italian

**Archetype personality:** Modern Italian chef's restaurant — warm minimalism, curated, roots-respecting but forward-looking.

**Prompt template:**

```
A restaurant menu card for a contemporary Italian chef's restaurant — refined but approachable,
modern with strong roots. Bridges Italian tradition and contemporary design.
Background: Warm white (#F8F4EE) — not pure white, a gentle cream tone. High-quality
uncoated matte paper feel.
Typography: Charcoal (#333333) for all text. Restaurant name in a modern serif
(similar to Playfair Display or Libre Baskerville), elegant but not fussy. Section headers
in muted terracotta (#B86B4A), title-case or small-caps. Dish names in the same modern
serif, medium weight. Descriptions in a clean humanist sans-serif (Lato style), lighter
weight. Maximum two typefaces. Prices right-aligned or inline, de-emphasized.
Decorative: One signature design element only — either a single minimalist custom illustration
(a hand-drawn pasta shape, an olive branch in a contemporary style), OR a refined monogram/
initial at the top. Not both. No borders. Generous whitespace throughout.
Mood: Refined but approachable, curated, modern Italian — polish without pretension.
```

**Colors JSONB:**
```json
{"background": "#F8F4EE", "primary": "#333333", "accent": "#B86B4A", "secondary": "#C9A9A6"}
```

---

### Personalizado Handling (STYL-04)

The Personalizado style must be preserved as the 9th entry with:
- `prompt_template`: empty string `''`
- `colors`: empty object `{}`
- `sort_order`: 9 (last position)

When `input.stylePrompt` is empty (Personalizado with no custom text), `buildMenuPrompt()` must skip the [STYLE DIRECTIVE] section entirely rather than inserting an empty block. The [LAYOUT], [CONTENT], and [CONSTRAINTS] sections still appear.

```typescript
// In buildMenuPrompt()
const styleSection = input.stylePrompt
  ? `[STYLE DIRECTIVE]\n${input.stylePrompt}`
  : null

const sections = [
  styleSection,
  layoutSection,
  contentSection,
  constraintsSection,
].filter(Boolean)

return sections.join('\n\n')
```

---

## Migration Strategy (STYL-01)

**Approach:** Write a new migration file `supabase/migrations/003_replace_styles.sql` that:
1. Deletes all existing styles (`DELETE FROM styles`)
2. Inserts the 8 new archetypes + Personalizado with sort_orders 1-9

**Do not:** Write an UPDATE-based migration that patches individual rows. A clean DELETE + INSERT is simpler, more readable, and produces a deterministic final state. The migration is applied once — this is seed replacement, not a patch.

**Migration file name convention:** Follow the existing pattern. Current files are `001_...` and `002_...`, so this becomes `003_replace_styles.sql`.

**Applying the migration:** Apply via Supabase Dashboard SQL Editor (consistent with project patterns noted in project memory for pgmq removal). Do not rely on Supabase CLI migration push unless already set up for the project.

---

## Common Pitfalls

### Pitfall 1: Logo Instructions Lost in Restructure

**What goes wrong:** When restructuring `buildMenuPrompt()`, the six logo instruction lines (Phase 7, lines 76-81 of current `lib/prompts.ts`) get dropped or accidentally moved outside the CONSTRAINTS section, causing generated images to lose the logo.

**Why it happens:** The restructure is a full rewrite — easy to miss specific lines from the old flat structure.

**How to avoid:** Copy the logo instruction block first, place it explicitly in the CONSTRAINTS section, and test with a mock generation before anything else. These lines are tested and validated — do not paraphrase.

**Warning signs:** Generated menu has no GIÀ logo visible, or logo has wrong color.

---

### Pitfall 2: Style Prompt Length Causing Token Crowding

**What goes wrong:** Multi-paragraph style templates (~10-12 lines each) combined with large menus (many dishes across many categories) may produce a very long prompt. The concern noted in `STATE.md`: "Multi-paragraph prompt_templates may hit token limits — test with longest style + largest menu."

**Why it happens:** Gemini `gemini-3.1-flash-image-preview` has a context window, and very long prompts with excessive detail can cause the model to skip later instructions.

**How to avoid:** Keep each style template under 15 lines. Keep [CONTENT] and [CONSTRAINTS] sections concise. Gemini follows structured prompts better when each section is direct rather than exhaustive. Test the worst-case scenario: Vintage Osteria template (most verbose) + maximum number of dishes.

**Warning signs:** Constraints ignored (wrong aspect ratio, wrong language, missing logo), style elements missing or blended incorrectly.

---

### Pitfall 3: Colors JSONB Not Matching Prompt Hex Values

**What goes wrong:** The hex values in the `colors` JSONB column (used by StyleGallery for gradient previews) differ from the hex values named in `prompt_template`. The preview card looks like one thing but generates another.

**Why it happens:** Authored separately — `prompt_template` is written as a string, `colors` is a JSONB object — easy to use slightly different hex values.

**How to avoid:** For each archetype, define the color values once in research/documentation, then copy consistently to both the `prompt_template` string and the `colors` JSON object. The values in this document are the canonical source.

---

### Pitfall 4: Empty stylePrompt in Non-Personalizado Styles

**What goes wrong:** If the migration doesn't insert `prompt_template` for a style (SQL INSERT error, null vs empty string), `buildMenuPrompt()` emits `[STYLE DIRECTIVE]\n` (empty section header), which confuses Gemini.

**Why it happens:** SQL INSERT omits the column or uses NULL.

**How to avoid:** Make the NULL guard explicit in `buildMenuPrompt()` — `input.stylePrompt && input.stylePrompt.trim()` — and test with Personalizado (empty) to confirm the section is omitted cleanly.

---

### Pitfall 5: Conflicting Section Instructions

**What goes wrong:** Style template says "dark background" but the LAYOUT section says something that contradicts it, or CONSTRAINTS negatives conflict with style decoration instructions. Gemini starts ignoring one section.

**How to avoid:** The [STYLE DIRECTIVE] section owns: background, typography, decorative elements, mood. The [LAYOUT] section owns: aspect ratio, column structure, margin sizes, text hierarchy layers. The [CONSTRAINTS] section owns: negatives and logo. These are distinct domains — do not duplicate across sections.

---

## Code Examples

Verified from current codebase + research documents:

### Current buildMenuPrompt() Structure (to understand what changes)

```typescript
// lib/prompts.ts — CURRENT (to be replaced)
return `${input.stylePrompt}           // ← style prompt prepended directly

Create a restaurant menu image with the following content:
Restaurant: Gia Restaurante
...

OUTPUT INSTRUCTIONS:
- Aspect ratio: ${input.aspectRatio}   // ← ratio as API-format string, not descriptive text
- All text must be perfectly legible...
- [Logo instructions from Phase 7]`
```

### Target buildMenuPrompt() Structure

```typescript
// lib/prompts.ts — TARGET (Phase 8)
export function buildMenuPrompt(input: PromptInput): string {
  const lang = input.language ?? 'es'
  const labels = categoryLabelsByLang[lang] ?? categoryLabelsByLang.es
  const styleSection = buildStyleSection(input.stylePrompt)
  const layoutSection = buildLayoutSection(input.aspectRatio)
  const contentSection = buildContentSection(input, labels)
  const constraintsSection = buildConstraintsSection(input)

  return [styleSection, layoutSection, contentSection, constraintsSection]
    .filter(Boolean)
    .join('\n\n')
}
```

### Content Section with Quoted Dish Names

```typescript
// Better: dish names in quotes for Gemini text rendering accuracy
const dishLines = sections
  .map(([cat, items]) =>
    `${labels[cat] ?? cat}:\n${items!.map((d) => `  - "${d.name}"`).join('\n')}`
  )
  .join('\n\n')
```

Quoting dish names (wrapping in `"..."` in the prompt string) improves spelling accuracy for Gemini text rendering. This is recommended in `PROMPT-ENGINEERING.md` section 2.2.

### Migration SQL Pattern

```sql
-- supabase/migrations/003_replace_styles.sql
-- Replaces all style presets with 8 research-backed archetypes + Personalizado

DELETE FROM styles;

INSERT INTO styles (name, description, prompt_template, colors, sort_order) VALUES
('Classic Trattoria',
 'Fondo crema cálido, tipografía serif, acentos burdeos y dorado. Ambiente de trattoria italiana familiar.',
 'A restaurant menu card with the warm, inviting feel of a classic Italian trattoria...',
 '{"background": "#F5F0E1", "primary": "#722F37", "accent": "#C8A96E", "secondary": "#5C6B3C"}',
 1),
-- ... 7 more archetypes ...
('Personalizado',
 'Describe tu estilo y lo creamos para ti.',
 '',
 '{}',
 9);
```

### buildGradient() Compatibility Check

The existing `buildGradient()` function in `style-gallery.tsx` already handles any number of colors correctly:

```typescript
// From style-gallery.tsx lines 18-29 — no changes needed
function buildGradient(colors: Record<string, string>): string {
  const values = Object.values(colors)       // reads all values from JSONB
  if (values.length === 0) { ... fallback }  // handles Personalizado {} correctly
  // ... builds gradient from hex stops
}
```

The new `colors` objects (4 entries each) will produce 4-stop gradients, which look visually richer than the current presets.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|---|---|---|
| One-liner style prompts (7-12 words) | Multi-paragraph style directives (8-12 lines) | Dramatically more specific visual output from Gemini |
| Flat monolithic prompt string | Four-section modular structure [STYLE→LAYOUT→CONTENT→CONSTRAINTS] | Cleaner instruction hierarchy, fewer conflicting directives |
| No negative prompts | Explicit 8-item negative block every generation | Prevents the most common AI-generation artifacts |
| Aspect ratio in API param only | Aspect ratio in both API param AND prompt text | More reliable orientation compliance |
| Generic `${input.stylePrompt}` injection | Structured STYLE DIRECTIVE section with full design spec | Style templates become self-contained generation briefs |
| Unquoted dish names in prompt | Quoted dish names (`"Paella Valenciana"`) | Higher text rendering accuracy per Gemini docs |
| 5 presets (all light/generic aesthetics) | 8 archetypes spanning full tonal range (dark/light/jewel/neutral) | Meaningful visual differentiation between style choices |

---

## Open Questions

1. **Gemini token limit with longest style + largest menu**
   - What we know: `STATE.md` flagged this as a concern. `gemini-3.1-flash-image-preview` supports long contexts but no official limit published for image generation prompts.
   - What's unclear: Whether the worst-case Vintage Osteria + full menu (all categories, many dishes) hits a limit that degrades output.
   - Recommendation: Include a manual checkpoint task in Plan 08-01 to test worst-case prompt length before finalizing.

2. **Whether to rename styles in Spanish or English**
   - What we know: Current presets are in Spanish ("Clasico Elegante"), requirements name the archetypes in English ("Classic Trattoria"). The `name` column is the display label in StyleGallery.
   - What's unclear: No explicit decision in CONTEXT.md about the language of preset names. The project UI is in Spanish.
   - Recommendation: Use Spanish names that map to the archetypes (e.g., "Trattoria Clásica", "Alta Cocina Elegante"). Planner can confirm final names.

3. **Whether to update the `is_active` flag in the migration**
   - What we know: The styles table has `is_active`. Current migration inserts without specifying it (defaults to whatever the column default is).
   - What's unclear: The column default — likely `true`.
   - Recommendation: Explicitly include `is_active = true` in all INSERT rows for determinism.

---

## Validation Architecture

`workflow.nyquist_validation` is not set in `.planning/config.json` — treating as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual checkpoint (no automated test suite detected) |
| Config file | None |
| Quick run command | Build: `npm run build` — TypeScript compile check |
| Full suite command | Manual visual generation test (see Phase Gate below) |

No Jest/Vitest/Playwright config files were found. This project validates through visual inspection of generated images and TypeScript compilation checks.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PRMT-01 | `buildMenuPrompt()` outputs four labeled sections | unit (manual review) | `npm run build` (TypeScript) | ❌ Wave 0 |
| PRMT-02 | Negatives appear in every generated prompt string | unit (manual review) | `npm run build` | ❌ Wave 0 |
| PRMT-03 | Typography hierarchy block present in LAYOUT section | unit (manual review) | `npm run build` | ❌ Wave 0 |
| PRMT-04 | Aspect ratio described in text in LAYOUT section | unit (manual review) | `npm run build` | ❌ Wave 0 |
| PRMT-05 | EN/FR prompts include enhanced culinary/accent instructions | unit (manual review) | `npm run build` | ❌ Wave 0 |
| STYL-01 | 8 new style rows present in database after migration | smoke (manual DB check) | Supabase Dashboard query | N/A |
| STYL-02 | Multi-paragraph `prompt_template` present for each archetype | smoke (manual DB check) | Supabase Dashboard query | N/A |
| STYL-03 | `colors` JSONB matches archetype hex values | smoke (manual DB check) | Supabase Dashboard query | N/A |
| STYL-04 | Personalizado preserved with empty prompt and `{}` colors | smoke (manual DB check) | Supabase Dashboard query | N/A |

### Sampling Rate

- **Per task commit:** `npm run build` — TypeScript must compile clean
- **Per wave merge:** Build + manual `console.log` of `buildMenuPrompt()` output to verify four sections present
- **Phase gate:** Full visual generation test across all 8 styles before `/gsd:verify-work` — generate one menu image per style, confirm visual distinctiveness and logo presence

### Wave 0 Gaps

- [ ] No automated unit tests exist for `buildMenuPrompt()` — acceptable for this project (visual output not unit-testable), TypeScript compilation is the proxy
- [ ] `npm run build` is the required compile check before each commit

---

## Sources

### Primary (HIGH confidence)

- `lib/prompts.ts` — Current `buildMenuPrompt()` implementation (read directly)
- `supabase/migrations/002_seed_styles.sql` — Current style seed data (read directly)
- `lib/types.ts` — Style interface (read directly)
- `components/style-gallery.tsx` — `buildGradient()` implementation (read directly)
- `lib/gemini.ts` — Gemini function signatures post-Phase 7 (read directly)
- `.planning/research/MENU-DESIGNS.md` — All 8 archetype color palettes and typography (project research doc, HIGH confidence)
- `.planning/research/PROMPT-ENGINEERING.md` — Gemini prompt structure, negative prompting, text hierarchy (project research doc, HIGH confidence)
- `.planning/STATE.md` — Accumulated decisions including "prompt_template is TEXT, no migration needed" and logo instruction decisions
- `.planning/phases/07-logo-integration/07-01-SUMMARY.md` — Exact logo instruction lines that must be preserved

### Secondary (MEDIUM confidence)

- `.planning/PROJECT.md` — Constraint "No new packages" confirmed; Supabase migration application via Dashboard
- `.planning/ROADMAP.md` — Two-plan structure for Phase 8 confirmed (08-01 prompt restructure, 08-02 style migration)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries, all existing infrastructure read directly
- Architecture (prompt structure): HIGH — both research docs and current code read; target structure from PROMPT-ENGINEERING.md is specific and verified
- Style templates: HIGH — color values and design direction from MENU-DESIGNS.md research which was compiled for this exact purpose
- Migration approach: HIGH — existing migration files read, column types confirmed
- Pitfalls: HIGH — sourced from project STATE.md concerns, PROMPT-ENGINEERING.md documented failure modes, and MENU-DESIGNS.md design anti-patterns

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable domain — prompt engineering techniques and design patterns do not change quickly)
