# Design Brief

## Direction
Brutalist Monochrome — clean, minimal tool interface prioritizing functional clarity and data readability.

## Tone
Utilitarian minimalism with geometric precision; no decoration, only functionality and contrast.

## Differentiation
Type-distinct JSON values (strings/numbers/booleans/null) rendered in semantic colors for instant visual parsing of data structure.

## Color Palette

| Token      | OKLCH          | Role                              |
| ---------- | -------------- | --------------------------------- |
| background | 0.98 0 0       | Light surface (light); 0.12 0 0 (dark) |
| foreground | 0.20 0 0       | Primary text                      |
| card       | 0.95 0 0       | Elevated sections, tree items     |
| primary    | 0.55 0.08 265  | Accent color (cool blue-purple)   |
| muted      | 0.92 0 0       | Disabled, secondary states        |
| accent     | 0.65 0.14 220  | Interactive elements, copy buttons |

## Typography

- Display: Space Grotesk — app headers, section titles
- Body: DM Sans — input labels, tree labels, body copy
- Scale: h1 `text-2xl font-bold`, h2 `text-lg font-semibold`, label `text-sm font-medium`, body `text-base`

## Elevation & Depth

Minimal depth via card background shifts and subtle 1px borders; no shadows or blur. Tree items render as very subtle bg-card on bg-background.

## Structural Zones

| Zone            | Background       | Border               | Notes                                |
| --------------- | ---------------- | -------------------- | ------------------------------------ |
| Header          | bg-card          | border-b border      | Title + controls bar                 |
| Input Panel     | bg-background    | border-r border      | Textarea + format button + error box |
| Tree Panel      | bg-background    | —                    | Scrollable list of tree items        |
| Tree Items      | hover:bg-card    | —                    | Subtle card on hover                 |
| Footer          | bg-card          | border-t border      | Quiet, minimal controls              |

## Spacing & Rhythm

Section gaps 2rem, content grouping 1rem, micro-spacing 0.5rem. Dense tree items (compact row height) balanced by generous section padding.

## Component Patterns

- Buttons: `rounded-md` dark-mode-aware, primary accent on copy, secondary muted on format
- Cards/tree items: `rounded-sm` minimal, bg-card only on hover or active
- Input textarea: `border-border` outline, `focus:ring-1 focus:ring-accent`, monospace font
- Badges (type indicators): text color only, no background

## Motion

- Entrance: None (tool focus)
- Hover: `transition-smooth` on tree items (bg-card fade in), copy button opacity fade
- Decorative: None

## Constraints

- No gradients, no drop shadows, no blur effects
- Monospace only for JSON values and textarea
- Type colors (green/orange/blue) must maintain contrast in both light and dark modes
- Copy button always visible but subtle (opacity-60)

## Signature Detail

Semantic color coding of JSON value types (strings green, numbers orange, booleans blue, null gray) for instant visual data parsing in dark-focused developer workflow.
