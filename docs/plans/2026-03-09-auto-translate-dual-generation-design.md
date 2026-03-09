# Auto-traducción EN + Generación Dual ES/EN

**Date:** 2026-03-09
**Status:** Approved

## Overview

When the chef types a dish name in Spanish, the English translation auto-fills via Gemini Flash with 800ms debounce. When generating menu images, Spanish generates first; upon approval, English generates automatically with the same style/ratio. Both images display side-by-side and save as separate `menu_images` entries.

## 1. Auto-translation in Form

- StepDishesPrice: show `nameEn` field below each dish, read-only by default
- On `nameEs` change (800ms debounce): call `/api/translate` for single dish translation
- Show "Traduciendo..." indicator while loading
- Chef can manually edit the translation if needed (field becomes editable on focus)
- Translate API extended to accept `{ text: string, targetLanguage: 'en' }` mode (single dish, not full menu)

## 2. Generation Flow (3 phases)

1. **Selection phase** (existing): style + ratio picker, "Generar Imagen" button
2. **ES result phase**: shows generated Spanish image with two buttons:
   - "Aprobar y generar en inglés" → triggers EN generation with same style/ratio
   - "Regenerar" → regenerates ES image
3. **Dual result phase**: both ES and EN images displayed side-by-side (desktop) or stacked (mobile), each with individual download buttons. Both saved as separate `menu_images` rows (language: 'es' / 'en')

## 3. Technical Changes

### Modified files:
- `components/menu-form/step-dishes-price.tsx` — add nameEn field + debounce translate
- `app/api/translate/route.ts` — add single-dish translation mode
- `app/(dashboard)/menu/[id]/generate/generate-flow.tsx` — 3-phase state machine
- `components/generate-button.tsx` — add "Aprobar y generar en inglés" variant

### What stays the same:
- FR remains optional (existing LanguagePicker flow)
- Gallery/history already shows images by language
- Download dialog works per-image (no changes)
- menu_images table schema unchanged
