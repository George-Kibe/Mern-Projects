# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Developers and tech learners (working engineers and students) who arrive from search or shared links looking for a practical article on AI, programming, databases or web development. They scan lists to find the one useful post, then read it end to end. A smaller group of signed-in members write and publish posts, comment, and save posts for later.

## Product Purpose
Realhive Blog is the publication of Realhive Consultants, a software/tech consultancy. It publishes practical engineering writing. Success means readers quickly find a relevant post, read it comfortably on any device, and come back; members can publish without friction.

## Positioning
Practical, hands-on engineering writing from a working consultancy rather than generic tech news. Do not invent clients, statistics or testimonials to support this.

## Operating Context
- Readers browse by category (General, Web Design, Development, Databases, AI & ML, Search Engines, Marketing), search titles, sort (newest, oldest, popular, trending) and filter by author.
- Members sign in with Clerk, write posts in a rich-text editor with Cloudinary-hosted cover images, inline images and video, comment, and save posts.
- Admins (Clerk public metadata `role: admin`) can feature and delete any post.
- Reading happens on phones, tablets and desktops in roughly equal measure.

## Capabilities and Constraints
- Stack: React 19 + Vite + Tailwind CSS 4 frontend, Express 5 + MongoDB backend, Clerk auth, Cloudinary media with URL transformations.
- Routes and URL structure (`/`, `/posts`, `/posts/:slug`, `/write`, `/login`, `/register`) stay stable.
- Post lists use numbered pagination with the page kept in the URL so lists are shareable and back-button safe.
- The API is rate limited; the UI must handle 429 responses gracefully.

## Brand Commitments
- Name: Realhive Blog (Realhive Consultants). Existing logo at `public/logo.png`.
- Colors are binding: lavender page background `#E6E6FF`, blue-800 (`#1e40af`) as the single accent, white surfaces.

## Evidence on Hand
- 13 seeded demo posts with real cover photography on Cloudinary (`backend/seed/`).
- No real testimonials, client logos, metrics or author bios exist. Do not fabricate them.

## Product Principles
1. Finding the right post fast beats showing everything at once.
2. The article is the product: reading comfort comes first on every screen size.
3. Plain, honest copy; no invented proof.
4. One accent color, one spacing scale, applied everywhere.
