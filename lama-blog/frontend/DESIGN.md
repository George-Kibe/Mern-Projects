---
name: Realhive Blog
description: Practical engineering writing, browsed like a card catalog.
colors:
  ground: "#e6e6ff"
  ground-deep: "#d9d9fa"
  card: "#ffffff"
  tint: "#f4f4ff"
  ink: "#14163a"
  ink-soft: "#3f4370"
  ink-faint: "#5b5f8c"
  line: "#c9caf2"
  line-soft: "#e3e3fa"
  accent: "#1e40af"
  accent-hover: "#1a3796"
  accent-soft: "#dce3fa"
  danger: "#b42318"
  danger-soft: "#fdecea"
typography:
  display:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  article:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: "24px"
  call-label:
    fontFamily: "Geist Mono Variable, ui-monospace, SFMono-Regular, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
    letterSpacing: "0.02em"
    fontFeature: "tnum"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.card}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
    height: "40px"
  button-secondary-hover:
    textColor: "{colors.accent}"
  button-ghost:
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  button-ghost-hover:
    backgroundColor: "{colors.ground-deep}"
    textColor: "{colors.ink}"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.card}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  field:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
    height: "44px"
  chip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    padding: "4px 16px"
    height: "36px"
  chip-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.card}"
  nav-link:
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  nav-link-active:
    backgroundColor: "{colors.card}"
    textColor: "{colors.accent}"
  guide-tab:
    backgroundColor: "{colors.ground-deep}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  guide-tab-active:
    backgroundColor: "{colors.ground-deep}"
    textColor: "{colors.ink}"
    padding: "12px 16px"
  drawer:
    backgroundColor: "{colors.ground-deep}"
    rounded: "{rounded.lg}"
    padding: "24px"
  index-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  page-number:
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    size: "40px"
  page-number-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.card}"
---

# Design System: Realhive Blog

## Overview

**Creative North Star: "The Card Catalog"**

Realhive Blog browses like a library card catalog. Subjects are drawers with guide tabs standing above them; posts are white index cards filed into those drawers; sort and filter are filing rules; pages are numbered card runs. The page itself is a calm lavender ground, the cards are bright white stock lifted off it by soft blue-tinted shadow, and a single blue-800 ink does every job that needs emphasis: the ruled line under each card title, the active tab's top edge, the selected chip, the current page, the primary action.

Density is moderate and reading-first. Lists are scannable in one pass (title, ruled line, two- or three-line summary, a foot with byline and a mono call label), and the article itself drops into a quiet 68ch column at 17-18px with generous 1.75 leading. Geist carries every role; Geist Mono appears only as catalog metadata. Motion is nearly absent: cards settle into the drawer when results change, and nothing else is choreographed.

The world rejects the default blog template of a hero banner over an equal card grid with a sidebar. Browsing happens inside a drawer, not on an open page.

**Key Characteristics:**
- Lavender ground, white card stock, one blue ink accent.
- Guide tabs above a tinted drawer; the active tab joins the drawer.
- Every index card title sits on a 1px blue ruled line.
- Mono call labels (subject code / filing date / reading time) as the only metadata voice.
- Two shapes only: 12px for surfaces, full pill for controls.
- One 8px module (with a 4px half-step).
- Saved posts carry a folded blue corner flag.

## Colors

A cool, low-chroma violet family for ground, ink and hairlines, punctuated by one saturated blue.

### Primary
- **Catalog Blue** (accent): the single accent. Primary buttons, the ruled line under card titles, the 2px top edge of the active guide tab, selected chips, the current page number, subject codes inside call labels, list markers and links in articles, focus rings, text selection and the saved flag.
- **Catalog Blue Pressed** (accent-hover): hover state of primary buttons only.
- **Blue Wash** (accent-soft): avatar initial discs; a pale blue backing for accent text.

### Neutral
- **Lavender Ground** (ground): the page background everywhere, the masthead (at 85-95% with backdrop blur), the mobile menu and the bottom sheet.
- **Drawer Lavender** (ground-deep): the open drawer under the guide tabs, the active tab, inactive tabs at 45% (75% on hover), ghost button hover.
- **Card Stock** (card): index cards, buttons (secondary), fields, chips, the active nav pill. White never fills the page.
- **Pale Tint** (tint): blockquotes and inline code in articles, skeleton shimmer highlight, clear-search hover.
- **Catalog Ink** (ink): body text and headings; the background of code blocks (with lavender text).
- **Soft Ink** (ink-soft): summaries, secondary text, inactive nav and tab labels.
- **Faint Ink** (ink-faint): call labels, counts, placeholders, field hover stroke.
- **Hairline** (line): 1px inset strokes on fields, secondary buttons and chips; masthead and section dividers; dashed empty-state borders.
- **Soft Hairline** (line-soft): dividers inside a card (Most read list rows, editor toolbar), skeleton base.

### Tertiary
- **Withdrawal Red** (danger) / **Red Wash** (danger-soft): destructive actions (delete post/comment) and their confirmation backing only.

### Named Rules
**The One Ink Rule.** Catalog Blue is the only hue that marks anything. Red exists solely for destructive actions; no other accent, gradient or category color is introduced.

**The Card Stock Rule.** White is the material of cards and controls resting on lavender. It is never a page or section background.

## Typography

**Display Font:** Geist Variable (with ui-sans-serif, system-ui)
**Body Font:** Geist Variable
**Label/Mono Font:** Geist Mono Variable (with ui-monospace, SFMono-Regular)

**Character:** One neutral grotesk does all the talking at semibold for headings and regular for reading; the mono is the catalog's typewriter, used only for filing data.

### Hierarchy
- **Display** (600, 36px / 48px md / 60px lg, 1.15, -0.025em): the homepage statement. Article titles use the same role at up to 56px with 1.08 leading. Capped around 18ch; balanced wrapping.
- **Headline** (600, 24px / 30px md, 1.15, -0.02em): section headings (Latest posts, Most read, Related) and the browse page title (30px / 36px md).
- **Title** (600, 20px, 1.375): index card titles. Feature cards step up to 24/30px; filed cards 20/24px; row cards 16px. Titles turn blue on card hover.
- **Body** (400, 16px, 1.6): UI text and card summaries (summaries in Soft Ink, 15px on grid cards).
- **Article** (400, 17px / 18px md, 1.75): the reading column, max 68ch, 24px between blocks; h2 1.5em/650 and h3 1.25em/600 inside it.
- **Label** (500, 15px, 24px): buttons, nav links, tabs; form labels at 14px/500.
- **Call label** (400 mono, 12px, 16px, 0.02em, tabular figures): subject code in blue, then ` / date / reading time / reads` in Faint Ink.

### Named Rules
**The Call Label Rule.** Mono is reserved for catalog data: subject codes, filing dates, reading time, counts, ranks and the run counter. It never sets a heading, a summary or a button.

## Layout

A single page container (max 1200px, gutter 16px / 24px at 640px / 32px at 1024px) holds every surface. All spacing steps on an 8px module (4, 8, 16, 24, 32, 48, 64px); the only half-step is 4px, plus the 10px vertical inside fields and 12px on the raised active tab.

The masthead is sticky (64px, 72px at md) with a hairline bottom border; anchors offset by 88px. The homepage intro is a two-column split at lg (statement left, a 400px search column right). Below it, a full-width guide-tab row opens into the drawer; on the homepage the drawer holds a 12-column split with the feature card at 7 columns and three compact row cards stacked in 5. The browse page puts the filing-rules bar (search, sort select, Filters button) at the top of the drawer and the results as a single column of horizontal filed cards, ending in the pagination bar with the run counter.

Guide tabs scroll horizontally with snap on narrow screens and fade out at the right edge below lg. Drawer padding steps 8px / 16px / 24px. On mobile, navigation collapses to a full-height menu under the masthead and filters move into a bottom sheet (centered dialog from 640px up). Pagination shows numbers from 640px up and "Page n of m" below.

## Elevation & Depth

Depth is ambient and blue-tinted. Cards sit on the lavender with a two-layer shadow: a tight neutral contact shadow and a long, soft drop tinted Catalog Blue. Hover lifts the card 2px and deepens the drop. Controls are flat and drawn with 1px inset hairlines rather than borders or shadows. Overlays (toasts, sheet) use the one pop shadow; the sheet's backdrop is Catalog Ink at 40%.

### Shadow Vocabulary
- **Card** (`box-shadow: 0 1px 2px rgb(20 22 58 / 0.06), 0 12px 32px -16px rgb(30 64 175 / 0.28)`): every index card and the Most read panel at rest.
- **Lift** (`box-shadow: 0 2px 4px rgb(20 22 58 / 0.06), 0 20px 40px -18px rgb(30 64 175 / 0.4)`): card hover, paired with `translateY(-2px)`.
- **Pop** (`box-shadow: 0 8px 24px -8px rgb(20 22 58 / 0.25)`): toasts and floating overlays.
- **Hairline** (`box-shadow: inset 0 0 0 1px var(--color-line)`): fields, secondary buttons, chips, active nav pill; becomes 2px accent on field focus.

### Named Rules
**The Tinted Shadow Rule.** Shadows carry the accent's hue, never neutral grey or hard offsets. Only cards and overlays cast them; controls are stroked, not lifted.

## Shapes

Two shapes. Surfaces (cards, fields, the drawer, blockquotes, code blocks, article images, toasts) use 12px corners; controls (buttons, chips, nav links, page numbers, the sort select, toggles) are full pills. Guide tabs round only their top corners at 12px and the drawer squares its top-left corner beneath the first tab, so tab and drawer read as one die-cut piece. Images inside compact row cards use 8px; focus rings and inline code use 6px. The saved flag is a 32px triangle folded into the card's top-right corner, clipped to the same 12px radius.

### Named Rules
**The Two-Shape Rule.** 12px for things you read, pill for things you press.

## Components

### Buttons
Quiet, tactile pills.
- **Shape:** full pill, min height 40px, 8px x 16px padding, 8px icon gap, 15px/500 label.
- **Primary:** Catalog Blue with white text; hover darkens to Catalog Blue Pressed. Used for Write, Publish and form submits.
- **Secondary:** Card Stock with a 1px hairline inset; hover swaps the stroke and text to Catalog Blue. Used for Sign in, Previous/Next, Filters, Try again, post actions (saved/featured state turns the stroke and text blue).
- **Ghost:** Soft Ink text, no fill; hover fills with Drawer Lavender. Icon-only ghost buttons are 40px circles (menu, sheet close).
- **Danger:** Withdrawal Red with white text.
- **States:** 150ms color/shadow transitions; press nudges down 1px; disabled at 55% opacity.

### Chips
- **Style:** pill, min height 36px, 16px side padding, 14px text, Card Stock with hairline inset, Soft Ink text; the count rides inside in 12px mono.
- **State:** selected chips fill Catalog Blue with white text and a bold check; hover darkens the stroke to Faint Ink.

### Cards / Containers
The index card is the system's core object.
- **Corner Style:** 12px.
- **Background:** Card Stock.
- **Shadow Strategy:** Card at rest, Lift on hover (see Elevation & Depth); keyboard focus within draws a 2px Catalog Blue ring as a shadow.
- **Border:** none; the title block carries a 1px Catalog Blue bottom rule (16px below the title, 8px on row cards).
- **Internal Padding:** 24px (32px on the feature card at md, 16px on row cards).
- **Variants:** card (image 16:10 on top, for grids), feature (16:9, larger title, reads count), filed (horizontal, image 224-288px wide, for the browse run), row (compact horizontal with a 4:3 thumbnail, for the featured stack). The whole card is clickable via a stretched title link; the byline sits above it.
- **Saved flag:** folded Catalog Blue triangle in the top-right corner.

### Inputs / Fields
- **Style:** Card Stock, 1px hairline inset, 12px radius, min height 44px, 10px x 16px padding. Search adds a leading magnifier in Faint Ink and a 32px round clear button. Selects draw their own chevron.
- **Focus:** stroke thickens to a 2px Catalog Blue inset; hover darkens the stroke to Faint Ink.
- **Labels:** 14px/500 Catalog Ink, 8px above the field.

### Navigation
- **Masthead:** sticky, translucent Lavender Ground with backdrop blur and a hairline bottom border; logo plus "Realhive Blog" at 18px/600 left, pill nav links center, Write (primary) and Sign in (secondary) right.
- **Nav links:** 15px/500 pills in Soft Ink; hover fills Drawer Lavender; active becomes a Card Stock pill with hairline inset and Catalog Blue text.
- **Mobile:** a ghost menu button opens a full-height Lavender Ground panel (200ms fade) with stacked pill links and the actions below a hairline.

### Guide Tabs and Drawer (signature)
The subject switcher. A horizontal row of tabs (All posts and each subject, with an optional Featured lead tab) stands above a Drawer Lavender panel.
- **Inactive tab:** Drawer Lavender at 45%, Soft Ink, 8px x 16px, sitting 4px lower than the active tab; hover to 75% and Catalog Ink.
- **Active tab:** full Drawer Lavender, semibold Catalog Ink, 12px vertical padding, and a 2px Catalog Blue inset along its top edge. It has no bottom edge and merges into the drawer.
- **Counts:** 12px mono tabular figures in Faint Ink after each label; empty subjects are hidden unless selected.
- **Drawer:** 12px corners except top-left; holds the featured layout or the filing-rules bar and results.

### Pagination (card run)
A hairline-topped bar: the run counter as a call label ("1-12 of 40 posts", numbers in Catalog Ink) on the left; secondary Previous/Next pills flanking 40px round page numbers on the right. The current page fills Catalog Blue with white text; others hover to Card Stock with a hairline. Gaps of more than one page collapse to an ellipsis.

### Bottom Sheet
Native dialog on Lavender Ground: slides up from the bottom (320ms, expo-out) at up to 85% viewport height on mobile, centered at max 512px from 640px. Header and footer are separated by hairlines; 24px padding.

### State Message
Empty, error and rate-limited panels share one form: a dashed hairline 12px box, 64px vertical padding, a 32px icon (Faint Ink for empty, Catalog Blue for problems), an 18px/600 title and Soft Ink body capped at 48ch, with an optional secondary "Try again" button.

### Motion
One authored motion: when results change, cards file into the drawer, settling 12px upward over 480ms on `cubic-bezier(0.16, 1, 0.3, 1)` with a 40ms stagger per card. Content is never hidden by it (transform only). Skeletons shimmer at 1.4s. Reduced motion collapses all animation and transitions to 1ms.

## Do's and Don'ts

### Do:
- **Do** set every page on Lavender Ground and let white appear only as cards and controls.
- **Do** put a 1px Catalog Blue rule under every index card title.
- **Do** mark selection with Catalog Blue: the active tab's top edge, selected chips, the current page, the primary button.
- **Do** write catalog metadata as a mono call label: blue subject code, then date, reading time and reads separated by " / ".
- **Do** keep surfaces at 12px corners and controls as full pills.
- **Do** draw control edges with 1px inset hairlines and keep shadows blue-tinted and ambient.
- **Do** keep article text in a 68ch column at 17-18px with 1.75 leading.
- **Do** step spacing on the 8px module.

### Don't:
- **Don't** introduce a second accent color, category colors or gradients; red is for destructive actions only.
- **Don't** set headings, summaries or buttons in Geist Mono.
- **Don't** use neutral grey or hard offset shadows; don't add shadows to controls.
- **Don't** mix radii outside 6 / 8 / 12px and pill.
- **Don't** open a page with a hero banner over an equal card grid; subject browsing and results live inside the guide-tab drawer.
- **Don't** add choreographed motion beyond the file-in settle and state transitions.
