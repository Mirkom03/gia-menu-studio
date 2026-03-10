# Prompt Engineering for AI Menu Image Generation

> Research document for improving Gemini-based restaurant menu image generation.
> Model: `gemini-3.1-flash-image-preview`

---

## 1. Gemini Image Generation Best Practices

### Prompt Structure

Gemini parses **style tokens** and **subject tokens** separately, enabling fine-grained control over each component. Effective prompts follow a consistent, composable structure:

1. **Subject** — Who or what is in the image (e.g., "an elegant restaurant menu card")
2. **Composition** — Layout, framing, aspect ratio (e.g., "portrait orientation, centered layout")
3. **Lighting / Camera** — Photographic language (e.g., "soft studio lighting, top-down flat lay")
4. **Style / References** — Artistic direction (e.g., "luxury print design, matte paper texture")

### Length and Specificity

- **Short, direct prompts** work better than long rambling ones. Gemini follows concise instructions more reliably than walls of text.
- **Be specific, not vague.** "Elegant menu" produces generic results. "Dark navy linen-textured background with warm gold foil serif typography, thin ornamental art-deco border" produces targeted results.
- **Avoid conflicting instructions.** When prompts contain too many competing directives, Gemini starts ignoring parts of the prompt. Change one variable per iteration.
- **Use photographic/cinematic language** for composition control: "flat lay shot", "top-down perspective", "centered composition with symmetrical margins."

### Aspect Ratio

Gemini defaults to square or slightly rectangular images. **Always specify the aspect ratio explicitly.** For menus, portrait orientation (3:4 or 2:3) is standard. If prompting alone does not produce the correct ratio, provide a reference image with the correct dimensions.

---

## 2. Menu-Specific Prompting

### The Core Challenge

Restaurant menus are **text-heavy documents** with structured hierarchies (restaurant name, section headers, dish names, descriptions, prices). AI image generators struggle with:

- Rendering many lines of small text accurately
- Maintaining consistent spacing and alignment
- Spelling accuracy across multiple text blocks
- Balancing decorative elements with readability

### Text Legibility Strategies

1. **Put critical text in quotes** within the prompt: `Title text "LA MAISON" in large serif font at the top center`
2. **Specify font characteristics explicitly:** serif, sans-serif, script, monospace, weight (bold, light), size (large, medium, small)
3. **Constrain where text appears:** "top-left", "centered header", "two-column body layout"
4. **Limit decorative interference:** "clean background behind text areas, no texture overlapping text"
5. **Use off-white or soft cream text** instead of pure white for better visual comfort
6. **Avoid thin fonts** — specify "medium weight" or "bold" for body text
7. **Increase perceived line height** by describing "generous spacing between menu items"

### Text Hierarchy Instructions

Structure your prompt to define each text layer separately:

- **Layer 1 — Restaurant name:** largest, most decorative, top of image
- **Layer 2 — Section headers:** medium size, distinct style (e.g., uppercase, letterspaced)
- **Layer 3 — Dish names:** smaller but clearly readable, left-aligned or centered
- **Layer 4 — Descriptions:** smallest text, lighter weight or muted color
- **Layer 5 — Prices:** right-aligned, consistent with dish name size

### Realistic Expectations

Gemini (and all current image generation models) have **limited accuracy for rendering long passages of text.** For menus with many items, expect:

- Some misspellings or garbled text in smaller lines
- The model captures the **visual impression** of a menu more than pixel-perfect text
- Best results come from **fewer text items** (5-8 dishes) rather than a full 30-item menu
- Consider generating the **decorative frame/background** separately and compositing real text on top

---

## 3. Style Transfer Prompting

### Reference Image Usage

Gemini supports multi-image input (up to 14 reference images). For style transfer in menu generation:

- **Upload a reference menu image** + a text prompt describing what to change
- The model can transfer **color palette, texture, border style, and typography feel** from one image to another
- Provide a reference image at the **correct aspect ratio** to lock in dimensions

### Effective Style Transfer Instructions

```
"Generate a new restaurant menu in the exact same visual style as this reference image.
Match the background color, border design, font style, and overall layout.
Replace all text content with the following menu items: [...]
Keep the same color palette and decorative elements."
```

### Key Principles

- **Be explicit about what to keep vs. what to change:** "Same border style and background texture, but replace all text with..."
- **Name the style attributes:** "Match the gold foil effect, the thin double-line border, and the serif font family"
- **Avoid ambiguity:** "In the style of" is weaker than "Match the dark green marble background, the centered gold text layout, and the minimalist botanical corner decorations from this reference"

---

## 4. Multi-Part Prompt Structure

### Recommended Separator Pattern

For complex menu generation prompts, use a **layered structure** with clear section breaks:

```
[STYLE DIRECTIVE]
A high-end restaurant menu card in portrait orientation (2:3 aspect ratio).
Dark navy linen-textured background. Warm gold (#C9A84C) text throughout.
Thin art-deco geometric border with corner ornaments. Luxury print feel, matte finish.
No photographs of food. No clipart. Clean, typographic design only.

[LAYOUT]
Centered single-column layout with generous margins.
Restaurant name at top, large decorative serif.
Horizontal ornamental divider below restaurant name.
Menu sections separated by subtle line dividers.
Prices right-aligned on the same line as dish names.

[CONTENT]
Restaurant: "MAISON DORÉE"
Section: "ENTRANTES"
- "Carpaccio de Ternera" ... "18€"
- "Burrata con Tomate" ... "15€"
Section: "PRINCIPALES"
- "Risotto de Setas" ... "24€"
- "Lomo de Bacalao" ... "26€"

[CONSTRAINTS]
No extra text beyond what is listed above.
All text must be clearly legible.
No food photographs or illustrations.
Consistent font sizes within each hierarchy level.
```

### Priority Ordering

1. **Style/mood first** — Sets the overall visual direction
2. **Layout/composition second** — Defines spatial structure
3. **Content third** — The actual text to render
4. **Constraints/negatives last** — What to avoid

### Negative Prompting

Always include explicit negatives to prevent common AI image pitfalls:

- "No food photographs"
- "No clipart or cartoon illustrations"
- "No extra text or watermarks"
- "No blurry or illegible text"
- "No busy or cluttered background"

---

## 5. Common Pitfalls

### What Makes AI Menus Look Bad

| Problem | Cause | Solution |
|---------|-------|----------|
| **Generic/Pinterest look** | Vague prompts like "elegant menu" | Specify exact colors, textures, border styles, font types |
| **Garbled text** | Too many text items, small font | Reduce item count to 5-8, specify "large, legible text" |
| **Wrong spellings** | Inherent model limitation | Put each text string in quotes, retry on failure |
| **Too-busy backgrounds** | Overly descriptive decoration prompts | Add "clean background", "minimal decoration", "text areas unobstructed" |
| **Inconsistent spacing** | No layout instructions | Describe exact layout: "centered", "equal spacing between items", "generous margins" |
| **Clipart feel** | Default AI image tendencies | Add "professional print design", "no illustrations", "typographic only" |
| **Wrong aspect ratio** | Not specifying dimensions | Always include "portrait 2:3" or provide reference image at correct size |
| **Color mismatch** | Vague color descriptions | Use specific color names or hex values: "warm gold (#C9A84C)" |
| **Thin/unreadable fonts** | No font weight specified | Specify "medium weight serif font", avoid "thin" or "light" |
| **Decorative overflow** | Borders/ornaments invading text space | "Border contained within outer 10% of image, text area clear" |

### The Iteration Loop

Expect to iterate. The most effective workflow is:

1. Write the modular prompt
2. Generate 1-2 candidates
3. Evaluate against the brief, noting specific failures
4. Change **one variable per iteration**
5. Consider cropping or zooming for partial improvements

---

## 6. Logo Integration via Prompt

### Sending a Logo as Inline Image

When including a restaurant's logo as a reference image alongside the prompt:

1. **State the intent explicitly:** "Place this logo at the top center of the menu"
2. **Specify size relative to the image:** "Logo should occupy approximately 15% of the image width"
3. **Describe position precisely:** "Centered horizontally, positioned in the top 20% of the image"
4. **Protect colors:** "Preserve the exact colors of the logo — do not recolor or tint"
5. **Describe integration style:** "The logo is perfectly integrated into the header area of the menu design"

### Example Logo Integration Prompt

```
Generate a restaurant menu card. Place this logo [inline image] at the top center
of the menu, sized at roughly 15% of the image width. Preserve the logo's original
colors exactly — do not recolor, tint, or alter it. Position the logo above the
restaurant name, with a small ornamental divider between the logo and the menu
content below.
```

### Known Limitations

- The model may **alter logo details** (simplify shapes, shift colors)
- **Simple, high-contrast logos** reproduce most reliably
- Very detailed or photographic logos may be distorted
- Consider generating the menu background/frame separately and compositing the logo programmatically for pixel-perfect results

---

## 7. Prompt Template Structure

### Recommended Template for Menu Generation

```
[IMAGE TYPE AND FORMAT]
{Professional restaurant menu card | menu board | digital menu display}
{Portrait 2:3 | landscape 3:2 | square 1:1} aspect ratio.
{Print-ready | digital display | social media} quality.

[VISUAL STYLE]
Background: {color, texture, material description}
Typography: {font family style} in {color/finish}
Border/Frame: {style description or "none"}
Decorative elements: {specific ornaments or "minimal/none"}
Overall mood: {1-3 adjectives}

[LAYOUT STRUCTURE]
{Single column centered | two columns | asymmetric}
Header area: {restaurant name placement, logo position}
Body area: {how sections and items are arranged}
Footer area: {contact info, tagline, or empty}

[MENU CONTENT]
Restaurant name: "{NAME}"
{Tagline: "{tagline}" — optional}

Section: "{SECTION NAME}"
- "{Dish Name}" ... "{Price}"
- "{Dish Name}" ... "{Price}"

{Repeat sections as needed, max 3 sections / 8 items total}

[CONSTRAINTS — WHAT TO AVOID]
- No {food photos | clipart | illustrations | watermarks}
- No extra text beyond listed content
- All text clearly legible, no blurring
- {Any other negatives}
```

### Section Importance Ranking

1. **Visual Style** — Most impact on output quality. Be very specific here.
2. **Constraints** — Critical for avoiding the "AI look." Never skip negatives.
3. **Menu Content** — Quoted text with clear hierarchy markers.
4. **Layout Structure** — Important but the model handles basic centering well by default.
5. **Image Type/Format** — Brief but sets the foundation.

---

## 8. Example Prompts

### Example 1: Luxury Fine Dining (Dark + Gold)

```
Professional restaurant menu card in portrait orientation (2:3 aspect ratio).
High-end print design, matte finish.

Background: Deep navy blue (#1B2A4A) with subtle linen paper texture.
Typography: All text in warm antique gold (#C9A84C). Restaurant name in large
elegant serif font (similar to Didot or Playfair Display). Section headers in
small uppercase letterspaced serif. Dish names in medium serif. Prices in
matching serif, right-aligned.
Border: Thin double-line border with small art-deco geometric corner ornaments
in gold, set 5% inward from edges.
Decorative elements: A single thin horizontal ornamental divider between the
restaurant name and the menu body. Small decorative flourish between sections.

Layout: Single column, centered. Generous margins (15% on each side).
Restaurant name at top, followed by divider, then menu sections.

Restaurant name: "MAISON DORÉE"
Tagline: "Haute Cuisine Française"

Section: "ENTRÉES"
- "Tartare de Saumon" ... "22€"
- "Velouté de Champignons" ... "18€"
- "Foie Gras Maison" ... "28€"

Section: "PLATS"
- "Filet de Boeuf Rossini" ... "42€"
- "Bar en Croûte de Sel" ... "38€"
- "Risotto aux Truffes" ... "34€"

No food photographs. No clipart or illustrations. Typographic design only.
No extra text. All text must be sharp and legible. No busy patterns behind text.
```

### Example 2: Rustic Italian Trattoria (Warm + Earthy)

```
Restaurant menu card in portrait format (2:3 ratio). Artisanal print feel,
warm and inviting.

Background: Warm cream parchment (#F5E6C8) with subtle aged paper texture,
slightly uneven edges. No heavy distressing.
Typography: Deep burgundy brown (#5C2018) for all text. Restaurant name in a
bold hand-drawn serif style (like a painted Italian sign). Section headers in
uppercase sans-serif with wide letter spacing. Dish names in warm italic serif.
Descriptions in smaller regular weight, muted tone.
Border: Simple hand-drawn style single line border with small olive branch
illustrations in the top-left and bottom-right corners only.
Decorative: Small rustic divider (a simple grape vine or wheat motif) between
sections.

Layout: Single column centered. Restaurant name large at top. Generous spacing
between each dish.

Restaurant name: "TRATTORIA BELLA VITA"
Tagline: "Dal 1987"

Section: "ANTIPASTI"
- "Bruschetta Classica" ... "10€"
- "Carpaccio di Manzo" ... "14€"

Section: "PRIMI"
- "Tagliatelle al Ragù" ... "16€"
- "Risotto ai Funghi Porcini" ... "18€"

Section: "SECONDI"
- "Ossobuco alla Milanese" ... "24€"
- "Branzino al Forno" ... "22€"

No photographs. No modern clipart. Hand-crafted artisanal feel.
All text clearly legible. No text overlapping decorative elements.
```

### Example 3: Modern Minimalist (Clean + Bold)

```
Contemporary restaurant menu card. Portrait orientation, 2:3 aspect ratio.
Modern graphic design, clean and bold.

Background: Pure matte white (#FFFFFF).
Typography: All text in charcoal black (#2D2D2D). Restaurant name in bold
geometric sans-serif (similar to Futura or Montserrat), all uppercase,
extra-bold weight. Section headers in medium weight uppercase sans-serif with
a thin underline accent in coral (#E85D4A). Dish names in regular weight
sans-serif. Prices in the same font, right-aligned.
Border: None. Clean edge-to-edge white.
Decorative elements: None except thin coral-colored horizontal rules under
section headers. Extreme minimalism.

Layout: Left-aligned text with wide left margin (20%). Asymmetric modern layout.
Restaurant name at top-left. Sections stacked with generous white space between.

Restaurant name: "NŌMA"
Tagline: "plant / ocean / forest"

Section: "TO START"
- "Celeriac Shawarma" ... "28"
- "Dried Fruits and Shrimp" ... "32"

Section: "MAIN"
- "Wild Duck and Plum" ... "48"
- "Langoustine and Seaweed" ... "52"

Section: "SWEET"
- "Cloudberry and Pine" ... "22"

No decorative borders. No illustrations. No food images. Pure typography.
Ultra-clean, Scandinavian design aesthetic. Maximum white space.
All text crisp and perfectly legible.
```

### Example 4: Tapas Bar Chalkboard Style

```
Restaurant menu designed as a chalkboard menu board. Landscape orientation
(3:2 aspect ratio). Casual hand-drawn aesthetic.

Background: Dark matte chalkboard green-black (#2C3E2D) with realistic chalk
dust texture and subtle smudges.
Typography: All text in chalk white (#E8E4D4) with slightly rough edges as if
hand-drawn with chalk. Restaurant name in large playful hand-lettered style.
Section headers in medium chalk block letters. Dish names in casual handwritten
chalk script. Prices circled or enclosed in small chalk brackets.
Border: Simple chalk-drawn double-line rectangular border with rounded corners.
Decorative: Small chalk-drawn icons next to section headers — a tiny wine glass
for drinks, a small plate for food. Hand-drawn stars and small decorative swirls
in corners.

Layout: Two-column layout. Restaurant name centered at top spanning both columns.
Left column for food, right column for drinks.

Restaurant name: "EL RINCÓN"
Tagline: "tapas y vinos"

Left column — "TAPAS"
- "Patatas Bravas" ... "6€"
- "Croquetas de Jamón" ... "8€"
- "Gambas al Ajillo" ... "12€"
- "Tortilla Española" ... "7€"

Right column — "VINOS"
- "Rioja Crianza" ... "5€"
- "Albariño" ... "6€"
- "Cava Brut" ... "5€"
- "Sangría Jarra" ... "14€"

Hand-drawn chalkboard feel. No digital perfection — slightly imperfect lines.
No photographs. All text legible despite hand-drawn style. Warm, inviting
atmosphere of a real Spanish bar.
```

---

## Key Takeaways

1. **Be specific with colors, textures, and font styles** — vague prompts produce generic results
2. **Always specify aspect ratio** — menus need portrait orientation
3. **Limit text items to 5-8 dishes** — more text means more rendering errors
4. **Use quoted strings** for all text you want rendered accurately
5. **Include explicit negatives** — "no food photos, no clipart, no extra text"
6. **Describe layout spatially** — "centered", "left-aligned", "top 20%", "right-aligned prices"
7. **Iterate one variable at a time** — do not rewrite the entire prompt on each attempt
8. **Consider hybrid approaches** — generate the decorative frame/background with AI, composite real text programmatically for pixel-perfect results

---

## Sources

- [How to prompt Gemini 2.5 Flash Image Generation for the best results — Google Developers Blog](https://developers.googleblog.com/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/)
- [Tips for getting the best image generation and editing in the Gemini app — Google Blog](https://blog.google/products-and-platforms/products/gemini/image-generation-prompting-tips/)
- [How to create effective image prompts with Nano Banana — Google DeepMind](https://deepmind.google/models/gemini-image/prompt-guide/)
- [Nano Banana Pro image generation in Gemini: Prompt tips — Google Blog](https://blog.google/products/gemini/prompting-tips-nano-banana-pro/)
- [Gemini image generation best practices — Google Cloud Documentation](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/multimodal/gemini-image-generation-best-practices)
- [Prompt and image attribute guide — Vertex AI Documentation](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/img-gen-prompt-guide)
- [Nano Banana Prompt Engineering Best Practices 2025 — Skywork](https://skywork.ai/blog/nano-banana-gemini-prompt-engineering-best-practices-2025/)
- [5 Gemini Image Generation Mistakes Killing Art — Banana Thumbnail](https://blog.bananathumbnail.com/gemini-image-generation/)
- [Best Typography and Text Art Prompts for AI Image Generation — Promptomania](https://promptomania.com/prompts/typography-prompts)
- [Gemini-Powered Prompt Engineering: From Quick Prompts to Production-Ready Image Generation — Medium](https://iamdgarcia.medium.com/gemini-powered-prompt-engineering-from-quick-prompts-to-production-ready-image-generation-633c6de5f047)
