# Roadmap: v1.2 — Logo, Styles & Prompt Overhaul

## Overview

v1.2 transforms menu image quality from "AI-generated" to "professionally designed." Three areas: the GIÀ logo is always present, the prompt builder produces rich modular prompts with proper constraints, and all style presets are replaced with research-backed designs that produce menus resembling real high-end Mediterranean restaurants. No UI changes, no schema changes beyond style seed data — pure prompt/style/generation logic.

## Phases

**Phase Numbering:**
- Continues from v1.1 (Phase 6). v1.2 starts at Phase 7.

- [x] **Phase 7: Logo Integration** - GIÀ logo always included in every generated menu image via Gemini inline image
- [x] **Phase 8: Prompt & Style Overhaul** - Modular prompt structure + 8 research-based style presets replacing current one-liners (completed 2026-03-10)

## Phase Details

### Phase 7: Logo Integration
**Goal**: Every generated menu image includes the GIÀ logo, correctly positioned and with original colors preserved
**Depends on**: Nothing (independent of prompt/style changes)
**Requirements**: LOGO-01, LOGO-02, LOGO-03
**Success Criteria** (what must be TRUE):
  1. generateMenuImage() and generateMenuImageWithReference() both send the logo as an inline image part to Gemini
  2. The prompt includes explicit instructions for logo placement (top-center, ~15% width) and color preservation
  3. Generated images show the GIÀ logo without color distortion or omission
**Plans**: 1 plan

Plans:
- [x] 07-01-PLAN.md — Load logo as base64, update Gemini functions and API route, add logo instructions to prompt builder

### Phase 8: Prompt & Style Overhaul
**Goal**: Prompt builder produces modular, high-quality prompts and all style presets generate menus that look professionally designed
**Depends on**: Phase 7 (logo instructions must be integrated into the new prompt structure)
**Requirements**: PRMT-01, PRMT-02, PRMT-03, PRMT-04, PRMT-05, STYL-01, STYL-02, STYL-03, STYL-04
**Success Criteria** (what must be TRUE):
  1. buildMenuPrompt() outputs a modular prompt with [STYLE], [LAYOUT], [CONTENT], [CONSTRAINTS] sections including negative prompting and text hierarchy
  2. All 8 new style presets have multi-paragraph prompt_templates with specific colors, typography, decorative elements
  3. StyleGallery shows gradient preview cards using each style's colors JSONB metadata
  4. Personalizado style still works with user-written custom prompts
  5. Generated images across all 8 styles look distinctly different and professional (not generic AI)
**Plans**: 2 plans

Plans:
- [ ] 08-01-PLAN.md — Restructure buildMenuPrompt() with modular sections, negative prompting, text hierarchy, aspect ratio in prompt
- [ ] 08-02-PLAN.md — New seed migration replacing 5 styles with 8 archetypes, multi-paragraph prompt_templates, colors metadata

## Progress

**Execution Order:**
Phases execute in numeric order: 7 -> 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 7. Logo Integration | 1/1 | Complete | 2026-03-10 |
| 8. Prompt & Style Overhaul | 2/2 | Complete   | 2026-03-10 |
