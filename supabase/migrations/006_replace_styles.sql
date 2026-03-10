-- Replace 5 one-liner style presets with 8 research-backed archetypes + Personalizado

DELETE FROM styles;

INSERT INTO styles (name, description, prompt_template, colors, is_active, sort_order) VALUES

-- 1. Classic Trattoria
('Trattoria Clasica',
 'Fondo crema calido, tipografia serif, acentos burdeos y dorado. Ambiente de trattoria italiana familiar.',
 'A restaurant menu card with the warm, inviting feel of a classic Italian trattoria.
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
Mood: Warm, authentic, unpretentious but cared-for.',
 '{"background": "#F5F0E1", "primary": "#722F37", "accent": "#C8A96E", "secondary": "#5C6B3C"}'::jsonb,
 true,
 1),

-- 2. Elegant Fine Dining
('Alta Cocina Elegante',
 'Fondo oscuro con acentos dorados, tipografia refinada. Estilo Michelin, lujo discreto.',
 'A high-end restaurant menu card in the style of a Michelin-starred fine dining establishment.
Luxury print design, matte finish, extreme elegance through restraint.
Background: Near-black charcoal (#1A1A1A) with absolutely no visible texture — pure matte.
Typography: All text in warm ivory (#F2EDE4). Restaurant name in a refined high-contrast
display serif (similar to Didot or Playfair Display), centered, large. Section headers in
small uppercase with generous letter-spacing, gold (#C5A55A). Dish names in elegant serif,
medium size. Prices right-aligned, same font as dish names.
Decorative: Thin single gold line dividers between sections only. No illustrations.
No borders except one ultra-thin rectangular frame set 5% inward from edges.
Mood: Luxurious, exclusive, quiet confidence, understated.',
 '{"background": "#1A1A1A", "primary": "#F2EDE4", "accent": "#C5A55A", "secondary": "#8A8580"}'::jsonb,
 true,
 2),

-- 3. Rustic Mediterranean
('Mediterraneo Rustico',
 'Papel kraft con tonos terrosos, ilustraciones botanicas. Cocina de la tierra y el mar.',
 'A restaurant menu card with rustic Mediterranean character — farm-to-table, honest, earthy.
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
Mood: Sun-washed, honest, coastal, farm-to-table authenticity.',
 '{"background": "#E8D5B5", "primary": "#C4694A", "accent": "#8A9A5B", "secondary": "#2C2C2C"}'::jsonb,
 true,
 3),

-- 4. Modern Minimalist
('Minimalista Moderno',
 'Fondo blanco puro, tipografia geometrica sans-serif. Diseno contemporaneo nordico.',
 'A contemporary minimalist restaurant menu card. Modern graphic design — clean, confident,
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
Mood: Contemporary, design-forward, Nordic-influenced, confident.',
 '{"background": "#FFFFFF", "primary": "#111111", "accent": "#B86B4A", "secondary": "#E0E0E0"}'::jsonb,
 true,
 4),

-- 5. Vintage Osteria
('Osteria Vintage',
 'Papel envejecido con bordes ornamentales victorianos. Encanto del viejo mundo italiano.',
 'A restaurant menu card in the style of a historic Italian osteria or enoteca —
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
Mood: Old-world charm, nostalgic, established, literary.',
 '{"background": "#EDE5D0", "primary": "#5B1A2A", "accent": "#B8860B", "secondary": "#3E2723"}'::jsonb,
 true,
 5),

-- 6. Coastal Mediterranean
('Costa Mediterranea',
 'Fondo blanco luminoso con azul mediterraneo. Brisa costera, fresco y elegante.',
 'A restaurant menu card with the breezy, sun-drenched feel of coastal Mediterranean dining —
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
Mood: Breezy, vacation-like, fresh, coastal, approachable elegance.',
 '{"background": "#FFFFFF", "primary": "#2E6B8A", "accent": "#C67C4E", "secondary": "#E8DCC8"}'::jsonb,
 true,
 6),

-- 7. Luxe Bistro
('Bistro de Lujo',
 'Fondo esmeralda profundo con dorado champan. Glamour art deco parisino.',
 'A high-end restaurant menu card in the style of a glamorous Parisian or European luxe bistro.
Rich, theatrical, art-deco influenced design with deep jewel tones.
Background: Deep emerald green (#1B4332). Solid matte — no visible texture, perfectly rich
and saturated.
Typography: All text in champagne gold (#D4AF37). Restaurant name in an art-deco influenced
display serif, large and commanding, centered. Section headers in uppercase with generous
letter-spacing, same gold. Dish names in elegant serif, medium size. Prices right-aligned.
Decorative: Thin geometric gold border — art-deco double-line style with small corner
ornaments. Small gold geometric dividers (diamond or chevron motif) between sections.
Controlled, symmetrical, architectural. Blush accent (#F2D7D9) used very sparingly if at all.
Mood: Glamorous, theatrical, celebratory, Parisian-inflected, refined luxury.',
 '{"background": "#1B4332", "primary": "#D4AF37", "accent": "#FFFDD0", "secondary": "#F2D7D9"}'::jsonb,
 true,
 7),

-- 8. Contemporary Italian
('Italiano Contemporaneo',
 'Blanco calido con serif moderno, terracota suave. Cocina italiana actual y refinada.',
 'A restaurant menu card for a contemporary Italian chef''s restaurant — refined but approachable,
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
Mood: Refined but approachable, curated, modern Italian — polish without pretension.',
 '{"background": "#F8F4EE", "primary": "#333333", "accent": "#B86B4A", "secondary": "#C9A9A6"}'::jsonb,
 true,
 8),

-- 9. Personalizado
('Personalizado',
 'Describe tu estilo y lo creamos para ti.',
 '',
 '{}'::jsonb,
 true,
 9);
