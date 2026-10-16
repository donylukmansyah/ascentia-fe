# Social Dock Icons Design

## Scope

Correct the contact icons in the floating social dock without changing links,
animation, placement, or the trigger button.

## Changes

- Replace the generic `MessageCircle` icon for WhatsApp with an inline
  WhatsApp SVG mark.
- Keep the existing phone, mail, and Instagram icons.
- Add a compact tooltip beside each contact button on hover and keyboard
  focus. Tooltips use short labels: Email, Telepon, WhatsApp, and Instagram.
- Preserve each current detailed `aria-label`, URL, external-link behavior,
  and reduced-motion behavior.

## Constraints

- Do not add an icon dependency.
- Keep the icon color controlled by `currentColor`.
- Keep the dock usable with keyboard focus and touch.

## Verification

- Run TypeScript, scoped ESLint, and Prettier checks.
- Verify the WhatsApp icon and tooltip at desktop hover and keyboard focus.
