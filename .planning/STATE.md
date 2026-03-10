# State

## Current Position

Phase: 7 of 8 (Logo Integration)
Plan: 0 of 1 in current phase
Status: Roadmap created, ready to plan Phase 7
Last activity: 2026-03-10 — Roadmap v1.2 created

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-10)

**Core value:** Generate beautiful, professional restaurant menu images that look like they were designed by a graphic designer — not by AI.
**Current focus:** Logo integration, prompt overhaul, style presets replacement

## Accumulated Context

- Gemini 3.1 Flash Image Preview supports inline image parts for logo injection
- Vercel 4.5MB payload limit — reference images resized to 1500px client-side
- Logo is transparent PNG, warm beige serif "GIÀ"
- Current style prompt_templates are single-line descriptions — need multi-paragraph expert prompts
- Style seed data lives in supabase/migrations/002_seed_styles.sql
- buildMenuPrompt() in lib/prompts.ts — current template is basic with [stylePrompt] + menu data + output instructions
- generateMenuImage() and generateMenuImageWithReference() in lib/gemini.ts — need logo inline part added
- API route at app/api/generate/route.ts orchestrates: auth → data fetch → prompt build → Gemini call → storage → response
- 5 current styles: Clasico Elegante, Mediterraneo Fresco, Minimal Moderno, Rustico Italiano, Pizarra + Personalizado
- 8 target archetypes from research: Classic Trattoria, Elegant Fine Dining, Rustic Mediterranean, Modern Minimalist, Vintage Osteria, Coastal Mediterranean, Luxe Bistro, Contemporary Italian

### Decisions

- Logo sent as inline image part (not composited programmatically) — Gemini handles placement
- No DB schema changes needed — prompt_template is TEXT (unlimited), colors is JSONB
- 8 styles replace 5 (net +3 presets)
- Personalizado preserved as 9th option

### Blockers/Concerns

- Gemini may alter logo details (simplify shapes, shift colors) — need empirical validation
- Multi-paragraph prompt_templates may hit token limits — test with longest style + largest menu

## Session Continuity

Last session: 2026-03-10
Stopped at: Roadmap created
Resume file: None
