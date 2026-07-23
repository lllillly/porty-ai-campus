# PORTY Design System

## 1. Direction

**PORTY Conversation** is a calm, practical campus assistant interface. It borrows
the clarity of modern messenger products—bright surfaces, generous spacing,
immediate actions, and readable conversations—without copying another service's
logo, layout, or identity.

Design principles:

- **Simple:** one primary task per screen and no decorative UI without purpose.
- **Wide:** comfortable breathing room, 44px minimum touch targets, and an
  820px readable conversation column.
- **Bright:** white surfaces, a soft mint conversation canvas, and a single
  green brand color.
- **Trustworthy:** official links and data status are visually distinct from
  generated answers.

## 2. Brand

The PORTY mark is an original rounded speech bubble containing a `P` monogram
and a small campus sparkle. It must not be replaced with the LINE logo or a
lookalike.

- Primary: `#08B86A`
- Primary hover: `#079D5B`
- Primary soft: `#DDF7EA`
- Canvas: `#EEF5F2`
- Surface: `#FFFFFF`
- Text: `#171C1A`
- Secondary text: `#65706B`
- Border: `#DFE7E3`
- Error: `#E5484D`
- Warning surface: `#FFF5D6`

Dark mode:

- Canvas: `#111513`
- Surface: `#1B211E`
- Elevated surface: `#242B27`
- Text: `#F5F7F6`
- Secondary text: `#AEB8B3`
- Border: `#303934`

## 3. Typography

Use the system Korean sans-serif stack:

`Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", sans-serif`

- Display: 24px / 700
- Section heading: 17px / 700
- Component heading: 14px / 700
- Body: 14–16px / 400–500
- Caption: 12px / 500
- Never render functional text below 12px.

## 4. Shape and Elevation

- Message bubble: 18px, with the speaker-side corner reduced to 6px.
- Card: 18px.
- Input and pill: full radius (`999px`).
- Modal: 24px desktop, 24px top corners on mobile.
- Use a 1px border before adding shadow.
- Default shadow: `0 12px 32px rgba(28, 54, 42, 0.08)`.

## 5. Conversation Patterns

- Assistant messages use a white surface and the PORTY avatar.
- User messages use the primary green with near-black text for contrast.
- Quick actions appear below the assistant message as outlined pills.
- The composer stays visually separate from the transcript and has a clear,
  filled send action.
- Loading states use plain language and a rotating icon; they do not imitate a
  completed response.

## 6. Cards and Modals

- Cards align with assistant content and use the same surface, border, type, and
  radius rules.
- Primary actions are filled green. Secondary actions are white with a border.
- Status badges use semantic soft backgrounds; green is reserved for active or
  confirmed states.
- Mobile modals are bottom sheets. Desktop modals are centered dialogs.

## 7. Accessibility and Motion

- Interactive controls are at least 44×44px.
- All icon-only buttons have an accessible name.
- Keyboard focus uses a 3px translucent green ring.
- Motion lasts 120–240ms and communicates state change only.
- Respect `prefers-reduced-motion`.

## 8. Responsive Behavior

- Under 768px, the app fills the viewport edge to edge.
- On wider screens, the conversation remains centered and readable while the
  canvas fills the remaining space.
- Horizontal action lists may scroll; important actions must not shrink below
  their readable width.

