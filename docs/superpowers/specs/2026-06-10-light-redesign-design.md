# Light Redesign — Sub-proyecto 1: Design Tokens + Componentes Base

## Design Tokens

| Token | Valor |
|---|---|
| bg-app | #F5F0E8 |
| bg-card | #FFFFFF |
| bg-input | #EDE8DE |
| text-primary | #111111 |
| text-secondary | #555555 |
| text-muted | #999999 |
| accent | #E8683A |
| accent-light | #FEF0EA |
| success | #16A34A |
| success-light | #DCFCE7 |
| border | #E8E0D4 |
| shadow-card | 0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.06) |

## Tipografía

- Card name: 16px/700
- Rating number: 18px/900 color #111
- Meta (zona, trabajos): 13px/500 color #555
- Labels: 11px/700 uppercase
- Body: 14px/400

## Componentes a actualizar

1. **PageShell** — bg #F5F0E8
2. **Header** — bg white + shadow, logo negro+naranja
3. **BottomNav** — bg white + border-top #E8E0D4, activo naranja
4. **SearchBar** — bg white, borde #E8E0D4, focus naranja
5. **ProfessionalCard** — bg white, rating 18px bold, zona visible, badges simplificados
6. **Home** — quitar hero section, ajustar section labels
7. **CategoryGrid** — aspect-ratio 4/3
8. **UrgenciasBanner** — bg #FFF5F5, border #FECACA, texto #991B1B
9. **StatsBar** — bg white con border
10. **Badge** — variantes light
11. **LoadingSpinner** — color naranja mantenido

## Reglas

- Todos los estilos inline (no Tailwind theme classes)
- TypeScript check debe pasar en cada commit
- Max 2 badges por card
