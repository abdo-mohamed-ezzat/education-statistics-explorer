---
trigger: always_on
---

## Tailwind v4 @apply rule

Tailwind CSS v4 does not support using `@apply` with custom classes like `.ds-btn`.

### Required

- Only use `@apply` with native Tailwind utilities
- Do not write patterns like `@apply ds-btn`
- Define semantic `.ds-*` classes directly with:
  - Tailwind utilities via `@apply`
  - CSS variables from `tokens.css`
  - normal CSS properties when needed

### Allowed

- `@apply flex items-center gap-2 px-4 py-2`
- `background: var(--color-surface-container-lowest)`
- `border-radius: var(--radius-pill)`

### Forbidden

- `@apply ds-btn`
- `@apply ds-card`
- `@apply ds-section`

### Preferred pattern

Each semantic design-system class should be self-contained.

Bad:

```css
.ds-btn {
  @apply inline-flex px-4 py-2 rounded-full;
}
.ds-btn-primary {
  @apply ds-btn text-white;
}
```

Good:

```css
.ds-btn-primary {
  @apply inline-flex px-4 py-2 text-white;
  border-radius: var(--radius-pill);
  background: var(--color-primary);
}
```

Good:

```css
.ds-btn-primary {
  @apply inline-flex px-4 py-2 text-white;
  border-radius: var(--radius-pill);
  background: var(--color-primary);
}
```

Optional
If reusable custom utilities are needed, use Tailwind v4 @utility, not custom class chaining through @apply.

---

## Practical migration rule for all your style files

Use this checklist:

- `tokens.css` → only tokens
- `components.css` → self-contained semantic classes
- `utilities.css` → token-backed helpers or `@utility`
- never build semantic classes on top of other semantic classes with `@apply`

---

## Best choice for your design system

For your setup, I recommend:

- keep `.ds-card`, `.ds-btn-primary`, `.ds-input`, `.ds-section`
- make each one **self-contained**
- use CSS variables for tokens
- use `@apply` only for Tailwind utilities
- use `@utility` only for very small low-level reusable utility patterns
