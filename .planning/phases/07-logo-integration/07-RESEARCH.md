# Phase 7: Logo Integration - Research

**Researched:** 2026-03-10
**Domain:** @google/genai multi-part image input, Node.js file loading in Next.js API routes
**Confidence:** HIGH

---

## Summary

Phase 7 is a focused, low-risk change: the GIÀ logo must be sent as an inline image part to Gemini on every menu image generation call. The project already has a working pattern for this — `generateMenuImageWithReference()` already sends `inlineData` parts alongside a text prompt. Logo integration reuses this exact pattern for a second inline image input.

The key technical concern is where and how to load the logo file at server runtime. The logo (`logo gia-01.png`) lives outside the Next.js app directory at `C:/Users/Lenovo/gia/logo gia-01.png`. It must be copied into the project (either `public/` for Vercel deployment or a dedicated `assets/` directory loaded via `fs.readFileSync` in the API route). The `/public` directory is the standard approach for Next.js static files accessible server-side via `path.join(process.cwd(), 'public', ...)`.

The prompt must gain a dedicated logo instruction block with explicit placement (top-center), size (~15% image width), and color preservation (do not recolor or tint). The existing `buildMenuPrompt()` function needs a new logo instruction section appended or prepended to its output. No schema changes are needed. No new npm packages are needed.

**Primary recommendation:** Copy logo to `public/logo-gia.png`. Load it once per request with `fs.readFileSync` in the API route (or lazy-loaded singleton in `lib/gemini.ts`). Pass logo base64 to both generation functions as a dedicated `inlineData` part, separate from any reference image. Add logo instructions to `buildMenuPrompt()` output.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LOGO-01 | Generated menu images always include the GIÀ logo (sent as inline image part to Gemini) | `@google/genai` v1.44.0 `inlineData` part confirmed. Existing `generateMenuImageWithReference()` already uses this pattern with `{ inlineData: { mimeType: 'image/png', data: base64 } }` in the parts array. Both generation functions need the logo part added to their `contents`. |
| LOGO-02 | Logo positioned top-center by default, ~15% of image width, with prompt instructions for placement | Prompt text confirmed sufficient. Research shows explicit instruction: "Place this logo at the top center, sized at roughly 15% of the image width, centered horizontally, positioned in the top 20% of the image." Added to `buildMenuPrompt()` output. |
| LOGO-03 | Logo original colors preserved (warm beige/gold on transparent) — prompt instructs Gemini not to recolor | Confirmed color: warm sandy beige (visually approximates #D4B49A). Prompt instruction: "Preserve the logo's original warm beige colors exactly — do not recolor, tint, or alter the logo in any way." |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@google/genai` | 1.44.0 (installed) | Multi-part content including inline image parts | Already used in project; `inlineData` part type confirmed in type definitions |
| `fs` (Node built-in) | — | Read logo PNG from filesystem at server runtime | Standard Node.js; no new dependency needed |
| `path` (Node built-in) | — | Resolve logo path relative to `process.cwd()` | Standard Next.js pattern for reading files in API routes |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `Buffer` (Node built-in) | — | Convert PNG file bytes to base64 string | Used everywhere in this codebase already (`Buffer.from(...).toString('base64')`) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `fs.readFileSync` per-request | Module-level singleton (read once at module load) | Singleton is faster but may cause issues in serverless cold starts; per-request is safe and the file is small (52 KB) |
| Copy to `public/` | Store in Supabase Storage | `public/` is simpler, zero latency, Vercel deploys it automatically; Supabase adds async fetch overhead |
| `public/logo-gia.png` | `assets/logo-gia.png` (not in public) | Both work for server-side reads; `public/` is conventional and allows browser access too |

**Installation:** No new packages needed.

---

## Architecture Patterns

### Logo File Location

The logo must be in the Next.js project for Vercel deployment. Copy from `C:/Users/Lenovo/gia/logo gia-01.png` to:

```
public/
└── logo-gia.png     # Renamed (no spaces), served statically + readable server-side
```

Reading in Next.js API route:
```typescript
// Source: Next.js docs — process.cwd() resolves to project root in API routes
import fs from 'fs'
import path from 'path'

const logoPath = path.join(process.cwd(), 'public', 'logo-gia.png')
const logoBase64 = fs.readFileSync(logoPath).toString('base64')
```

### Pattern 1: Logo as Third Inline Part (alongside reference image)

The `generateMenuImageWithReference()` function currently sends:
- Part 1: `inlineData` — user's reference style image
- Part 2: `text` — the prompt

After this phase it sends:
- Part 1: `inlineData` — user's reference style image
- Part 2: `inlineData` — GIÀ logo
- Part 3: `text` — the prompt

```typescript
// Source: existing lib/gemini.ts pattern, extended
contents: [
  {
    role: 'user',
    parts: [
      { inlineData: { mimeType: 'image/png', data: referenceBase64 } },
      { inlineData: { mimeType: 'image/png', data: logoBase64 } },
      { text: promptWithLogoInstructions },
    ],
  },
],
```

### Pattern 2: Logo as Sole Inline Part (no reference image)

The `generateMenuImage()` function currently sends `contents: prompt` (a bare string). After this phase it sends a structured `contents` array with two parts:

```typescript
// Source: @google/genai v1.44.0 type definitions confirm Part[] is valid for contents
contents: [
  {
    role: 'user',
    parts: [
      { inlineData: { mimeType: 'image/png', data: logoBase64 } },
      { text: prompt },
    ],
  },
],
```

### Pattern 3: Logo Instructions in buildMenuPrompt()

The existing `buildMenuPrompt()` appends output instructions at the end. Logo instructions belong in that block because they are spatial/compositional directives:

```typescript
// Append to the OUTPUT INSTRUCTIONS block in buildMenuPrompt()
`- The first inline image is the GIÀ restaurant logo. Place it at the top center of the menu, sized at approximately 15% of the image width, centered horizontally, positioned in the top 20% of the image.
- Preserve the logo's original warm beige/sandy colors exactly — do not recolor, tint, or alter the logo in any way.
- The logo should appear naturally integrated into the header area of the menu design.`
```

### Pattern 4: Loading Logo in the API Route

The API route at `app/api/generate/route.ts` is the right place to load the logo (server-side only, no browser). Load it once before the generation call:

```typescript
// In route.ts, before the generateMenuImage / generateMenuImageWithReference call
import fs from 'fs'
import path from 'path'

const logoBuffer = fs.readFileSync(path.join(process.cwd(), 'public', 'logo-gia.png'))
const logoBase64 = logoBuffer.toString('base64')
```

Then pass `logoBase64` into both generation functions (update their signatures to accept `logoBase64: string`).

### Recommended Project Structure Changes

```
public/
└── logo-gia.png        # NEW: copy from C:/Users/Lenovo/gia/logo gia-01.png

lib/
├── gemini.ts           # MODIFIED: both functions accept logoBase64 param, build parts array
└── prompts.ts          # MODIFIED: buildMenuPrompt() adds logo placement instructions

app/api/generate/
└── route.ts            # MODIFIED: load logo, pass to generation functions
```

### Anti-Patterns to Avoid

- **Importing logo as a Next.js static import at module level:** `import logo from '@/public/logo-gia.png'` returns an object with `src`, not a Buffer — unusable for base64.
- **Storing logo base64 as a hardcoded string in source code:** 68 KB base64 string in source is unmaintainable. Read from file.
- **Passing logo through the client:** The client never needs the logo binary. Load entirely server-side in the API route.
- **Using `fetch('/logo-gia.png')` inside the API route:** Circular HTTP request within the same server. Use `fs.readFileSync` instead.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-image input to Gemini | Custom image encoding | `inlineData` part in `@google/genai` contents array | Already in the SDK; `generateMenuImageWithReference` already uses it |
| Logo color preservation | Programmatic color locking / post-processing | Prompt instruction "do not recolor" | Prompt-based is sufficient; compositing adds complexity and defeats the purpose of AI generation |
| Logo resizing before send | Sharp / canvas resize of logo | Send as-is (52 KB, high resolution) | Gemini handles scaling instructions via prompt; logo is small enough to send raw |

**Key insight:** The project already has the correct multi-part pattern in `generateMenuImageWithReference`. Logo integration is an extension of that pattern, not a new capability.

---

## Common Pitfalls

### Pitfall 1: Gemini Altering Logo Colors

**What goes wrong:** Gemini may shift the logo's warm beige to match the menu's dominant color palette (e.g., gold on dark backgrounds, white on light backgrounds).
**Why it happens:** The model treats logo colors as stylistic suggestions rather than hard constraints when the palette conflicts.
**How to avoid:** Use explicit, emphatic color preservation language in the prompt: "Preserve the logo's original warm beige/sandy color (#D4B49A approximately) EXACTLY — do not recolor, tint, adjust brightness, or alter in any way."
**Warning signs:** Generated images show white, gold, or dark-colored "GIÀ" text instead of sandy beige.

### Pitfall 2: Logo Omitted Entirely

**What goes wrong:** Gemini ignores the logo inline image and generates the menu without it.
**Why it happens:** When the model has strong style directives from the style prompt, it may prioritize those and treat the logo as optional decorative input.
**How to avoid:** Make logo instructions mandatory in tone: "The first inline image is the restaurant logo and MUST appear in the generated image." Reference it explicitly as "the first image provided."
**Warning signs:** Generated image shows "Gia" as text only (rendered by the model) but no actual logo image.

### Pitfall 3: Logo Positioned Incorrectly

**What goes wrong:** Logo appears at bottom, overlapping content, or outside image bounds.
**Why it happens:** "Top center" is ambiguous when the model also sees "Include the restaurant name prominently" in the existing prompt.
**How to avoid:** Specify position twice — in both spatial and proportional terms: "top-center, in the top 20% of the image, above all menu text content."
**Warning signs:** Logo overlaps dish names or date range text.

### Pitfall 4: Logo Simplified / Stylized by Gemini

**What goes wrong:** Gemini reinterprets the logo into its own illustration, losing the specific letterforms.
**Why it happens:** Known Gemini behavior — it may "draw" a logo rather than reproduce it faithfully.
**How to avoid:** Prompt: "Reproduce the logo as provided — do not redraw, stylize, or interpret it." Accept that high-contrast, simple logos (like GIÀ's large serif letterforms) reproduce more reliably than complex marks.
**Warning signs:** GIÀ letters have different proportions, extra serifs added, or look drawn rather than typographic.

### Pitfall 5: Conflict with Existing "Do NOT include any logos" Instruction

**What goes wrong:** The current `buildMenuPrompt()` ends with "Do NOT include any watermarks or logos other than the restaurant name" — this directly contradicts adding the logo.
**Why it happens:** The existing constraint was written before logo integration was planned.
**How to avoid:** Update that line to "Do NOT include any watermarks, other logos, or extra branding — only the GIÀ logo provided as an inline image."

### Pitfall 6: `contents: prompt` String vs. Parts Array

**What goes wrong:** `generateMenuImage()` currently passes `contents: prompt` as a bare string. Changing it to a parts array is a different call shape.
**Why it happens:** The `@google/genai` SDK accepts both forms, but inline images require the structured parts array.
**How to avoid:** When adding the logo, convert `contents: prompt` to `contents: [{ role: 'user', parts: [...] }]` — the SDK handles both.

---

## Code Examples

### Complete Updated generateMenuImage()

```typescript
// Source: @google/genai v1.44.0 type definitions (genai.d.ts) + existing project pattern
export async function generateMenuImage(
  prompt: string,
  logoBase64: string,
  aspectRatio: string = '3:4'
): Promise<Buffer> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/png', data: logoBase64 } },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: { aspectRatio },
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
    },
  })

  for (const part of response.candidates![0].content!.parts!) {
    if (part.inlineData) {
      return Buffer.from(part.inlineData.data!, 'base64')
    }
  }

  throw new Error('No se generó imagen. Intenta de nuevo.')
}
```

### Complete Updated generateMenuImageWithReference()

```typescript
// Source: @google/genai v1.44.0 — multiple inlineData parts confirmed supported
export async function generateMenuImageWithReference(
  prompt: string,
  referenceBase64: string,
  logoBase64: string,
  aspectRatio: string = '3:4'
): Promise<Buffer> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/png', data: referenceBase64 } },
          { inlineData: { mimeType: 'image/png', data: logoBase64 } },
          {
            text: `Generate a restaurant menu image following the EXACT same visual style, layout, colors, typography, and decorative elements as the first reference image above. Do NOT copy the content — only replicate the style. The second image is the GIÀ restaurant logo — it MUST appear in the generated image as specified in the prompt instructions. Use this new content:\n\n${prompt}`,
          },
        ],
      },
    ],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: { aspectRatio },
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
    },
  })

  for (const part of response.candidates![0].content!.parts!) {
    if (part.inlineData) {
      return Buffer.from(part.inlineData.data!, 'base64')
    }
  }

  throw new Error('No se generó imagen. Intenta de nuevo.')
}
```

### Logo Instructions for buildMenuPrompt()

```typescript
// Add to the OUTPUT INSTRUCTIONS block, replacing the existing logos line
const logoInstructions = `- The first inline image provided is the GIÀ restaurant logo — it MUST appear in the generated image.
- Place the logo at the top center of the menu, centered horizontally, within the top 20% of the image.
- The logo should occupy approximately 15% of the image width.
- Preserve the logo's original warm beige/sandy color EXACTLY — do not recolor, tint, adjust brightness, or alter the logo in any way.
- The logo should appear naturally integrated into the header area, above all menu text content.
- Do NOT include any watermarks, other logos, or extra branding — only the GIÀ logo provided.`
```

### Logo Loading in route.ts

```typescript
// Source: Next.js API routes — process.cwd() is project root in both dev and production
import fs from 'fs'
import path from 'path'

// Inside the POST handler, before generateMenuImage call:
const logoBuffer = fs.readFileSync(path.join(process.cwd(), 'public', 'logo-gia.png'))
const logoBase64 = logoBuffer.toString('base64')
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Composite logo post-generation (Sharp) | Inline image part to Gemini | @google/genai added multi-part support | Logo is semantically integrated by the model, not pasted on top |
| Text-only logo reference ("Include restaurant name GIÀ") | Actual logo PNG as `inlineData` part | This phase | Actual visual logo appears rather than model-generated text interpretation |

**Deprecated/outdated:**
- `contents: prompt` string form in `generateMenuImage()`: Still valid but must be converted to parts array to include the logo inline image.

---

## Open Questions

1. **Does Gemini faithfully reproduce the warm beige logo color across all style backgrounds?**
   - What we know: Official docs warn logo colors may shift; the STATE.md acknowledges this risk. The logo is simple large serif letterforms (high contrast, simple shape — good for reproduction).
   - What's unclear: Whether the sandy beige (#D4B49A approx.) survives on dark-background styles (dark navy, chalkboard).
   - Recommendation: Include hex color in the prompt ("original warm sandy beige, approximately #D4B49A") as an anchor. Empirical testing is needed post-implementation. If colors consistently distort, the fallback is programmatic compositing with Sharp (not in scope for this phase).

2. **Should logo loading be cached (module-level singleton) or per-request?**
   - What we know: The logo file is 52 KB (68 KB base64). `fs.readFileSync` is synchronous and very fast for this size.
   - What's unclear: Whether Vercel's serverless function warm/cold start behavior makes a module-level read risky.
   - Recommendation: Per-request `fs.readFileSync` inside the POST handler. Safe, simple, no edge cases. Optimize to singleton only if benchmarks show it matters.

---

## Validation Architecture

No automated test framework detected in the project (no jest.config, vitest.config, or test scripts in package.json).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected |
| Config file | None — Wave 0 would need to create one |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LOGO-01 | Both generation functions send logo inlineData part | Manual — invoke generate API, inspect request payload | N/A | ❌ No test framework |
| LOGO-02 | Prompt contains logo placement instructions | Manual — call `buildMenuPrompt()`, inspect output string | N/A | ❌ No test framework |
| LOGO-03 | Generated images show undistorted beige logo | Manual visual inspection of generated images | N/A — visual quality check | Manual only |

### Wave 0 Gaps

All testing for this phase is manual/visual. No test infrastructure exists. A Wave 0 task to set up a test framework is out of scope for Phase 7 given the project's current state. Verification is:

1. Call the generate API with a known menu and inspect that the logo appears in the generated image.
2. Verify logo is beige-colored (not white, gold, or dark) in the output.
3. Verify logo is positioned at top-center.

---

## Sources

### Primary (HIGH confidence)

- `node_modules/@google/genai/dist/genai.d.ts` — `inlineData` part type definition (`Blob_2` with `data: string` base64 + `mimeType: string`) confirmed in installed v1.44.0
- `lib/gemini.ts` (project source) — Existing `generateMenuImageWithReference()` pattern confirms multi-part `inlineData` works with this SDK version in this project
- `.planning/research/PROMPT-ENGINEERING.md` — Section 6 "Logo Integration via Prompt" documents exact prompt instructions for placement, sizing, and color preservation
- `.planning/STATE.md` — Confirms decisions: logo sent as inline image part (not composited programmatically), no DB schema changes needed
- Logo file `C:/Users/Lenovo/gia/logo gia-01.png` — Visually confirmed: large serif "GIÀ" in warm sandy beige on transparent background, 52 KB PNG

### Secondary (MEDIUM confidence)

- Next.js API route convention: `process.cwd()` resolves to project root at runtime (both dev and Vercel production) — standard pattern documented across Next.js ecosystem

### Tertiary (LOW confidence)

- Gemini color preservation reliability — not formally tested. Based on known model behavior documented in PROMPT-ENGINEERING.md section 6 ("model may alter logo details, simplify shapes, shift colors"). Empirical validation required post-implementation.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — SDK installed, types confirmed, existing pattern in codebase
- Architecture: HIGH — All changes are to existing files with known patterns; no new infrastructure
- Pitfalls: MEDIUM — Logo color drift and omission risks are documented in project research but not empirically validated for this specific logo

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable SDK, no fast-moving dependencies)
