# PORTY Design System

## 1. Direction

**PORTY Conversation** is a friendly campus assistant built around Knung-i,
Kongju National University's official mascot. The interface keeps the clarity
of a messenger while using soft shapes, warm whitespace, and small pastel
green accents that feel friendly without making the interface visually busy.

Design principles:

- **Conversational:** the first screen starts with Knung-i's greeting, not a
  generic dashboard headline.
- **Soft:** rounded speech bubbles and low-contrast pastel surfaces keep the
  interface approachable.
- **Practical:** common campus tasks remain visible without competing with the
  chat input.
- **Trustworthy:** official links and data status remain visually distinct from
  answers.

## 2. Brand

PORTY uses the official 2024 renewed Knung-i artwork distributed by Kongju
National University. Do not redraw the mascot or change its colors, proportions,
or details. Layout containers and backgrounds may change without altering the
artwork itself.

- Primary: `#79C991`
- Primary hover: `#347B4F`
- Primary soft: `#EAF7EE`
- Canvas: `#F7FBF8`
- Surface: `#FFFFFF`
- Surface soft: `#F1F8F3`
- Text: `#203329`
- Secondary text: `#6E7E74`
- Border: `#DFECE3`
- Error: `#E5484D`

Dark mode:

- Canvas: `#111513`
- Surface: `#1B211E`
- Elevated surface: `#242B27`
- Text: `#F5F7F6`
- Secondary text: `#AEB8B3`
- Border: `#303934`

## 3. Typography

Use Pretendard Variable as the primary webfont:

`"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`

- Display: 24px / 700
- Section heading: 17px / 700
- Component heading: 14px / 700
- Body: 14–16px / 400–500
- Caption: 12px / 500
- Never render functional text below 12px.

## 4. Shape and Elevation

- Message bubble: 20px, with the speaker-side corner reduced to 7px.
- Shortcut card: 20px.
- Input: 22px with a circular send button.
- Modal: 28px desktop, 24px top corners on mobile.
- Prefer tonal surfaces over visible borders.
- Default shadow: `0 16px 38px rgba(72, 91, 81, 0.08)`.

## 5. Conversation Patterns

- Assistant messages use a white surface and the Knung-i avatar.
- User messages use the primary green with near-black text for contrast.
- The welcome screen pairs a Knung-i greeting scene with white shortcut cards
  and tonal green icons.
- The composer sits on a soft green tray inspired by the original PORTY layout.
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
