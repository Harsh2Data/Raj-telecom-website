# Raj Telecom Website — Phase 1 Documentation

This document explains what the website is, how it's built, and everything that
was done in Phase 1 (the frontend/design phase). It's written for a non-technical
read — if you hand this project to someone else, this is what they need to know.

## 1. What this is

A 6-page marketing + booking website for Raj Telecom, a mobile phone repair shop
in Nalasopara. Visitors can browse services, see how repairs work, and go through
a step-by-step booking flow to request a repair.

**Important:** Phase 1 is frontend-only. There is no real backend yet — the
booking form and contact form don't actually send anything anywhere. See
[Section 6](#6-what-is-not-real-yet-important-for-phase-2) for details.

## 2. The 6 pages

| File | Page | What it's for |
|---|---|---|
| `index.html` | Home | Hero banner, brand picker, "what we repair" grid, "why choose us", process steps, CTA |
| `services.html` | Services | Full list of everything the shop repairs, plus the 3 ways to get it done (walk-in / pickup / at-home) |
| `how-we-work.html` | How it works | Step-by-step repair timeline + FAQ |
| `about.html` | About | Shop story, values, and the founder |
| `contact.html` | Contact | Contact form + shop address/phone/hours |
| `booking.html` | Book a repair | The multi-step booking wizard (see [Section 4](#4-the-booking-wizard)) |

Every page shares the same navigation bar and footer, so they all feel like one
site rather than separate pages.

## 3. How the code is organized

```
style.css       → the original design system (colors, fonts, spacing, every
                   component's base look — cards, buttons, forms, tickets, etc.)
premium.css     → a newer visual layer on top of style.css (the current "look"
                   of the site — nav, hero, brand rail, booking wizard styling)
dark-mode.css   → everything needed for dark mode (see Section 5)

main.js         → mobile menu, scroll effects, dark/light toggle, scroll-in
                   animations, the contact form's "sent" animation
site.js         → small homepage/sitewide extras (adds the floating "?" help
                   button, injects a couple of dynamic repair cards)
booking.js      → all the logic for the booking wizard (Section 4)

assets/brands/  → phone brand logos
assets/repairs/ → photos used for each repair type (screen, battery, etc.)
assets/why/     → icons for the "why choose us" section
```

Why two CSS files (`style.css` and `premium.css`) instead of one? `style.css` is
the original component library — every button, card, and form still gets its
basic shape and behavior from it. `premium.css` is a visual refresh layered on
top (nicer nav, hero, cards) without having to rewrite everything from scratch.
`dark-mode.css` is separate again so dark mode can be reviewed/changed on its
own without touching the light-mode styling at all.

## 4. The booking wizard

`booking.html` walks the visitor through 5 steps, tracked at the top of the page:

1. **Device** — pick a brand (22 brands available, with logos), then a model
2. **Service** — search and multi-select everything that's wrong (you can pick
   more than one issue — e.g. "Battery" *and* "Charging Port")
3. **Contact** — name and phone number
4. **Visit & time** — visit the shop / doorstep pickup / repair at home, then a
   time slot
5. **Confirm** — review everything, then a "ticket" is generated showing a
   booking number

Landing on `booking.html?brand=Samsung&issue=battery` (used by links elsewhere
on the site, like "Book a repair" on a specific brand or problem card) will
pre-fill that brand and service automatically.

**Note:** step 5 generates a fake ticket number in the browser — nothing is
saved anywhere or sent to the shop. That's the Phase 2 work.

## 5. Dark mode

There's a sun/moon button in the navigation bar (both desktop and mobile) that
switches the whole site between light and dark. The visitor's choice is
remembered (so it stays dark next time they visit), and it's applied instantly
on page load with no flash of the wrong theme.

A few things were deliberately left the same in both themes because they
already work well on their own: the footer, the homepage's dark hero banner,
and the blue "book a repair" call-to-action boxes. Brand logos and repair-type
photos also keep their light backgrounds in both themes, since several of them
are photos/logos that need a light background to stay readable.

## 6. What is NOT real yet (important for Phase 2)

- **Booking form**: doesn't save or send anything. Needs a backend (or a
  service like a form-to-WhatsApp/email connector) to actually notify the shop.
- **Contact form**: same — currently just shows a fake "Message sent" animation.
- **Phone numbers / email**: the site still uses a placeholder number
  (`+91 00000 00000`) and email (`hello@rajtelecom.example`) in most places —
  the floating "?" help button is the one place with a real number. These
  placeholders need to be swapped for the real shop number before launch.
- **Map**: the contact page has a placeholder box where a real embedded Google
  Map should go.
- **Some brand/model lists** are reasonable guesses (e.g. which phone series
  each brand sells) — worth a quick real-world check before launch.

## 7. Notable fixes made during Phase 1

A running list of real bugs found and fixed along the way, in case they're
useful context later:

- Navigation bar was invisible on every page except the homepage until you
  scrolled (white text on a white background).
- The mobile "hamburger" menu didn't actually work as a menu — it left page
  content visible underneath, didn't stop the page from scrolling, and had no
  reliable way to close it. Rebuilt as a proper fullscreen menu.
- The blue "book a repair" boxes had nearly-invisible white-on-white text on
  most pages.
- A decorative line on the homepage's "how it works" section (mobile view) was
  drawn directly through the text instead of beside it.
- Several phone brand logos were missing or mismatched to the wrong image file.

## 8. Previewing the site locally

This is a static site — no build step, no server required. Open any `.html`
file directly in a browser, or serve the folder with any simple local server
(e.g. VS Code's "Live Server" extension) so links between pages work correctly.