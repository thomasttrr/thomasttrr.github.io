# Decisions log — `opus/improvements`

This file records what changed on this branch and why. The plan was written
first (below), then each section was filled in as the work landed.

## What I found before changing anything

Measured on the live code at 382×800 and 1280×900:

- **Phones did not actually flow.** The phone CSS asks for a flowing page,
  but `lockHeights` in `app.js` writes `height` and `overflow-y: auto` as
  inline styles on the card body, which beat the stylesheet. At 382×800 the
  About tab was a 621px box with its own inner scrollbar inside a page that
  could not scroll — the "inner scroll trap" the CSS comment says it avoids.
- **Desktop showed a phone.** A 400px card centred in a 1280px window, with
  the About text and skills cut off behind an inner scrollbar. Recruiters
  arriving from LinkedIn on a laptop see the least of the page.
- **The tab bar moves under the pointer.** The card is centred vertically
  and its height changes per tab, so the bar you just clicked jumps.
- **Keyboard order is backwards for tabs.** The tab bar comes after the panel
  in the DOM, so Tab from the active tab leaves the card instead of entering
  the panel (the ARIA tabs pattern expects tab → panel).
- **Rows that look alike behave differently.** The location row looks like
  the clickable rows; cert rows are links with no sign that they are links.
- **The link preview is stale.** `assets/og-image.jpg` shows an old
  four-tab card with a monogram and "Open to AI operations roles"; the meta
  description still describes the older "AI operations" pitch.
- **Small things:** a 90 KB, 689×919 portrait shown at 92px; an unused
  `copyText` function; the typed placeholders keep ticking while the form is
  closed; short or zoomed windows (200% zoom on a laptop) got a tiny inner
  scroll box.

## Plan

1. **Three layouts, one card.**
   - *Split* (wide and tall enough): the card widens into two columns — a
     sidebar with the portrait, name, title, status, location and a vertical
     numbered nav (01 About … 05 Contact), and a content pane on the right.
     The card is anchored to the top so the nav never moves when the content
     height changes.
   - *Card* (tablet-ish widths): the owner's existing card, kept as is.
   - *Flow* (phones, and short/zoomed windows): a real flowing page with the
     floating bottom tab bar — fixing the inner-scroll bug.
   - The layout mode is defined once in CSS (`--layout`) and read by JS, so
     the media queries and the script cannot drift apart.
2. **Motion with direction.** A tab indicator that glides between tabs (bar
   and sidebar), panels that slide in from the side you navigated toward, a
   short stagger on list items, a soft entrance on first load, and a slow
   pulse on the "open to work" dot. All of it off under reduced motion.
3. **Content presentation (no new facts).** About opens with a larger lede
   paragraph and ends with clear next steps (send a message / GitHub);
   skills sit in a label + chips grid on wide screens; the current job is
   marked as current; links show an arrow so they read as links; the
   location stops pretending to be a button; the GitHub row shows the handle
   from its URL.
4. **Contact form.** Same Web3Forms payload and the owner's details (slim
   bar, 450ms unfold, card grows in step, typed hints that pause on focus,
   inner focus ring). Add a sending state, clear success / error states, a
   timeout, no double submits, hints that only run while the form is open,
   and room so the Send button's focus ring is not clipped.
5. **Accessibility.** DOM order header → tabs → panel (visual order kept
   with CSS), arrow keys in both orientations, focusable panels, visible
   focus everywhere, forced-colors and reduced-transparency support,
   label-in-name for the Email bar.
6. **Performance & sharing.** A small square portrait (~20 KB instead of
   90 KB), a fresh link-preview image built from the new design, an updated
   meta description using only facts from the repo, structured data
   generated from `settings.js` (no email), and remove dead code.
7. **Print.** The owner is a print specialist; printing the page (or saving
   it as PDF) now gives a clean one-column résumé-style sheet with all five
   sections, instead of a dark card.

## Log

### Layout

- **Split layout (≥ 800px wide and ≥ 600px tall).** Two columns, 940px max.
  Left: portrait (96px), name, title, status, location, and the nav as a
  numbered list (`01 About` … `05 Contact`) — the same number-and-name
  motif the owner uses for the kickers. Right: the open section. At
  1280×900 the whole About tab fits with no inner scrolling.
  The card hangs from a fixed top edge instead of being centred, so the
  nav does not move when the right side changes height. The right side is
  never shorter than the left column.
- **Card layout (481–799px).** The owner's original card is kept as it was
  (big centred header on About, compact on other tabs, tab bar along the
  bottom). Only shared polish reaches it.
- **Flow layout (≤ 480px wide, or ≤ 540px tall).** Fixed the bug where
  `lockHeights` wrote inline `height`/`overflow` that beat the phone CSS.
  The page now really scrolls. I also send short windows here — a phone
  on its side, or a laptop at 200% zoom (1280×900 → 640×450) — because the
  card there was a tiny scroll box. On wide-but-short screens the column
  and the floating bar are capped at 640px so lines stay readable.
- **One source for breakpoints.** Each `@media` block sets `--layout`;
  `app.js` reads it with `getComputedStyle`. No media query is duplicated
  in JS.
- **Tab order.** The DOM is now header → tabs → panels (the ARIA tabs
  pattern: Tab from the selected tab goes into its panel). CSS `order`
  still draws the bar under the panel in the card layout.

### Motion (all of it off under `prefers-reduced-motion`)

- One tab highlight that glides to the selected tab — under it in the bar,
  beside it in the side nav.
- A new section slides in from the side you moved toward (later tab →
  from the right), and its items fade up in a 45ms stagger.
- First paint: the card fades in and the header settles. Opacity only on
  the card itself — a transform there would trap the phone tab bar, which
  is `position: fixed` (the owner's existing comment about blur warns of
  the same trap).
- The "open to work" dot and the current job's dot breathe slowly.
- A soft light follows the mouse across clickable rows (mouse only).
- Kept: the owner's 280ms height animation between tabs, the avatar move
  between big and compact headers, and the 450ms form unfold with the card
  growing on the same clock.

### Content presentation (no new facts)

- About: the first paragraph is a lede (one size up, full brightness).
  After Education, two next steps: **Send a message** (switches to
  Contact, opens the form, and puts the cursor in Name when used from the
  keyboard) and **GitHub**.
- Skills: label + chips table in the split layout.
- Work: the job whose dates say "Now" is marked current (brighter date,
  breathing dot). Detected from the dates text, not hard-coded.
- Certs: rows that are links now show an arrow; "In progress" gets a
  half-filled circle; "Completed" (when the owner fills in a date) gets a
  check.
- Projects: "View project ↗" moved to the card's top-right so it is seen
  first; screen readers hear "View project: PrintOpti". HQ Board and AI
  Deal Tray have no links in the repo, so they get none.
- Contact: the location is drawn as a plain line, not a box, so it no
  longer looks clickable. The GitHub row shows the handle from its URL.
- Removed `text-wrap: pretty` from long paragraphs (owner had it): in
  Chrome it broke the About text early ("I catch errors before / they
  reach…") and left ragged edges.

### Contact form

Same Web3Forms request as before — endpoint, POST, and the fields
`access_key`, `subject`, `botcheck`, `name`, `email`, `message`.
Owner details kept: slim bar as the last Contact row, 450ms unfold, card
grows in step, typed hints that pause on focus, focus ring inside fields.

- Added: "Sending…" with a spinner, success and error lines with icons,
  a 15s timeout, no double submit (the button uses `aria-disabled` so
  focus is not lost), the form keeps the message on error and clears it on
  success.
- Typed hints now only run while the form is open.
- The Send button's focus ring was clipped by the collapsing wrap; the
  form now has a few px of inner room for it.
- **Changed an owner detail:** the bar says "Tap to send" on touch screens
  and "Click to send" with a mouse. Same idea, accurate wording.
- **Changed:** the bar's screen-reader name is "Email: open the contact
  form" (it opens a form; the old "Send me an email" did not match).
- Removed the separate `#live` region; the status line is already
  `role="status"`, so success was announced twice.

### Accessibility

- Arrow keys work in both orientations (Up/Down in the side nav), and the
  tablist's `aria-orientation` follows the layout.
- The selected panel is focusable (`tabindex="0"`) so keyboard users can
  scroll About and Work, which have no links of their own.
- Windows high contrast: the gliding highlight is a background, which
  forced colors removes, so the selected tab is underlined instead.
- `prefers-reduced-transparency`: solid card, no grain.
- Phones: `scroll-padding-bottom` keeps focused fields clear of the
  floating tab bar.

### Performance and sharing

- Portrait: `assets/portrait.jpg`, 320px square, 16 KB (the 90 KB
  original stays in `assets/`). Whole page ≈ 128 KB before gzip, down from
  ≈ 178 KB.
- Link preview: `assets/og-image.jpg` rebuilt from the site's own font,
  colours and portrait (the old one showed a four-tab card, a monogram,
  and "Open to AI operations roles").
- Meta description and titles now match the AI trainer / data quality
  pitch, using sentences already on the page. Added a canonical link.
- Structured data (`schema.org/Person`) is generated at runtime from
  `settings.js`: name, title, location, GitHub, skills. No email.
- Removed the unused `copyText` function.

### Print

The owner is a print specialist, so printing the page (or "Save as PDF")
gives a one-column, black-on-white sheet: header with photo, then all
five sections in order, links spelled out, and a line pointing to the
contact form instead of an email address. Timeline dots are drawn with
borders so they print even with background graphics off.

### Considered and not done

- **A light theme.** The dark glass look is the owner's established
  identity and `index.html` declares `color-scheme: dark`; a second theme
  would double the design surface for little gain.
- **`viewport-fit=cover`** for iPhone safe areas. It changes how the page
  meets the notch and home indicator, and I could not test it on a real
  iPhone, so I left the owner's setting alone.
- **A self-hosted mono font.** It would mean downloading a new font file;
  the system mono stack (Cascadia / SF Mono / Menlo / Consolas) is fine.
- **Lighthouse.** Not run (no CLI available offline); page weight and
  behaviour were checked by hand instead.
