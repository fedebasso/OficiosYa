# Visual Unification — OficiosYa
**Date:** 2026-06-09  
**Scope:** Unify all screens/components with old Tailwind theme classes to the established dark design system.

## Palette
- Background: `#0f0f0f` / cards: `#141414` / borders: `#1e1e1e` / `#2a2a2a`
- Text main: `#f5f0e8` / secondary: `#888` / muted: `#555`
- Accent: `#e8683a`

## Components (in order)
1. `RequestCard` — dark card, status dot+label from STATUS_META colors
2. `ReviewForm` — dark modal, orange stars, dark textarea/buttons
3. `ProProfile` — dark sections, dark inputs, orange category chips
4. `ProWorkHistory` — dark list, empty state, status badges
5. `ProOnboarding` — multi-step dark flow with progress indicator

## Constraints
- No changes to Header or Button components
- All styles inline (no Tailwind theme classes like bg-bg-card)
- Must pass TypeScript check after each component
