---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: milestone
status: in-progress
stopped_at: Completed 08-02-PLAN.md
last_updated: "2026-03-10T09:14:44Z"
last_activity: 2026-03-10 — Completed 08-02-PLAN.md (Style Replacement Migration)
progress:
  total_phases: 2
  completed_phases: 1
  total_plans: 3
  completed_plans: 3
---

# State

## Current Position

Phase: 8 of 8 (Prompt and Style Overhaul)
Plan: 2 of 3 in current phase (COMPLETE)
Status: Phase 8 in progress, plan 02 complete
Last activity: 2026-03-10 — Completed 08-02-PLAN.md (Style Replacement Migration)

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
- buildMenuPrompt() in lib/prompts.ts — modular four-section structure: [STYLE DIRECTIVE], [LAYOUT], [CONTENT], [CONSTRAINTS]
- generateMenuImage() and generateMenuImageWithReference() in lib/gemini.ts — logo inline part added, accept logoBase64 param
- API route at app/api/generate/route.ts orchestrates: auth → data fetch → logo load → prompt build → Gemini call → storage → response
- 5 current styles replaced by 8 archetypes + Personalizado (9 total)
- Migration 006_replace_styles.sql applied: 8 archetypes with 800-1053 char prompt_templates + colors JSONB
- Colors JSONB schema: {background, primary, accent, secondary} — drives buildGradient() in StyleGallery

### Decisions

- Logo sent as inline image part (not composited programmatically) — Gemini handles placement
- Per-request fs.readFileSync for 52KB logo (safe for serverless)
- Logo instructions in CONSTRAINTS section: top-center, ~15% width, color preservation (#D4B49A)
- Prompt has 8 negative constraints, 5-layer typography hierarchy, aspect ratio descriptions
- Enhanced EN/FR language instructions in CONSTRAINTS (culinary terms, accent preservation)
- No DB schema changes needed — prompt_template is TEXT (unlimited), colors is JSONB
- 8 styles replace 5 (net +3 presets)
- Personalizado preserved as 9th option
- Migration numbered 006 (003-005 already existed) — no functional impact

### Blockers/Concerns

- Gemini may alter logo details (simplify shapes, shift colors) — validated OK in checkpoint
- Multi-paragraph prompt_templates may hit token limits — test with longest style + largest menu

## Session Continuity

Last session: 2026-03-10
Stopped at: Completed 08-02-PLAN.md
Resume file: None
