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

(Filled in as each step lands.)
