---
version: 1
slug: "src"
primary_target: "src"
related_targets: []
---

# Realhive Blog: whole frontend (home, browse, post, write, auth)

Mode: Read. Readers find a practical engineering post fast, then read it comfortably; members write, comment, save.

## Direction contract

THESIS: Browsing is a card catalog. Subjects are drawers with guide tabs, posts are filed index cards, sort/filter are filing rules and pages are card runs. Refuses the default hero + equal card grid + sidebar blog.

OWN-WORLD: Lavender #E6E6FF ground, white card stock, blue-800 #1E40AF single accent as the ruled header line and active marks, ink #14163A text, hairlines #C7C8F0. Guide tabs stand above the card row; active tab raised and joined to its drawer. Call labels in small mono (category code + date). One 8px module. Radius 12px cards, full pill controls. Saved = folded corner flag.

STORY: Reader sees what Realhive Blog is, picks a subject drawer or searches, scans filed cards, opens one, reads in a calm 68ch column, moves to related cards or the next page.

FIRST VIEWPORT: Sticky masthead (logo, Browse, Write, auth). Left: one-line statement + subtext; right: search field (deviation from a Write CTA: PRODUCT.md principle 1 'finding the right post fast', and Write already lives in the masthead, so a second Write would duplicate CTA intent). Full-width guide-tab row with a Featured tab active, opening into a tinted drawer that holds the featured lead card (7 cols) and three filed rows (5 cols). Browse: filing-rules bar (search, sort, Filters) inside the drawer, results as a single filed run of horizontal index cards, numbered run counter.

FORM: Card catalog, candidate 4 of 7, seed b4e577bb.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
