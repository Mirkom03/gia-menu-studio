# State

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-10 — Milestone v1.2 started

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-10)

**Core value:** Generate beautiful, professional restaurant menu images that look like they were designed by a graphic designer — not by AI.
**Current focus:** Logo integration, style overhaul, prompt engineering

## Accumulated Context

- Gemini 3.1 Flash Image Preview supports inline image parts for logo injection
- Vercel 4.5MB payload limit — reference images resized to 1500px client-side
- Logo is ~transparent PNG, warm beige serif "GIÀ"
- Current style prompt_templates are single-line descriptions — need multi-paragraph expert prompts
- Style seed data lives in supabase/migrations/002_seed_styles.sql
