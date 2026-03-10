# GIÀ Menu Studio

## What This Is

A Next.js app that generates restaurant menu images for Restaurante GIÀ (Alfaz del Pi, Alicante) using Gemini AI. The owner enters menu data (dishes, dates, prices), picks a style, and gets a professional menu image ready to print or post on social media. Supports ES/EN/FR, multiple aspect ratios, and style reference uploads.

## Core Value

Generate beautiful, professional restaurant menu images that look like they were designed by a graphic designer — not by AI.

## Requirements

### Validated

- ✓ Menu creation form (weekly + event types) — v1.0
- ✓ Multi-language support (ES/EN/FR) with auto-translation — v1.0
- ✓ Gemini image generation with style presets — v1.0
- ✓ Aspect ratio selection (Instagram, Stories, A4, etc.) — v1.0
- ✓ Download PNG/PDF with resolution options — v1.0
- ✓ Menu history with gallery and filters — v1.0
- ✓ Style reference image upload — v1.1
- ✓ Post-generation image editing — v1.1

### Active

- [ ] Logo GIÀ always included in generated menu images
- [ ] Replace all style presets with high-quality designs based on real Mediterranean/Italian restaurant menus
- [ ] Complete prompt engineering overhaul for all generation modes

### Out of Scope

- UI layout changes — only prompt/style/logo changes this milestone
- New generation features (new aspect ratios, new languages, etc.)
- Database schema changes beyond style seed data

## Context

- **Stack:** Next.js 16, Supabase, Vercel (fra1), TypeScript
- **AI Model:** Gemini 3.1 Flash Image Preview (gemini-3.1-flash-image-preview)
- **Logo:** `logo gia-01.png` — serif "GIÀ" in warm beige/gold (#C4A882 approx), transparent background
- **Current prompts:** Single-line style descriptions, generic output instructions
- **Current styles:** 5 presets + Personalizado, all with basic one-liner prompt_templates
- **Problem:** Generated menus look AI-generic, not like real high-quality restaurant menus

## Constraints

- **Gemini inline data:** Logo must be sent as base64 inline image part (max 20MB)
- **Vercel payload:** Request body max 4.5MB — logo PNG is small enough
- **Style storage:** prompt_template is TEXT column, no migration needed for longer prompts
- **No new packages:** All changes are prompt/data/logic only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Send logo as inline image to Gemini | Only reliable way to include exact logo in generated image | — Pending |
| Replace all 5 style presets | Current ones produce generic results, need complete overhaul | — Pending |
| Research real menu designs first | Need to understand what makes quality menus look professional | — Pending |

---
*Last updated: 2026-03-10 after milestone v1.2 initialization*
