# Phase 2 Knowledge Source Inventory

## Approved sources

- Repository static routes from `src/routes/publicRoutes.ts` `SITEMAP_ROUTES` after applying the central route policy.
- Existing sitemap generators `api/sitemap.ts` and `api/sitemap-blogs.ts` for public sitemap parity.
- Public deployed/prerendered HTML from `KNOWLEDGE_SITE_BASE_URL`, fetched only for approved internal routes and approved domains.
- Published blog rows from `blog_posts` where `status = published`, `deleted_at IS NULL`, and `slug` is present. Public adapters use title, excerpt/content/body, publish/update dates and canonical URL when present.
- Public case-study rows from `case_studies` with a valid slug, plus public fallback data in `src/data/caseStudies.ts` when Supabase is unavailable.
- Public pricing rows from `pricing_plans` only when active/public and rendered on public pages.
- Public terms, privacy, contact and book-demo page content rendered on approved routes.

## Excluded sources

Never index `/admin`, `/admin/*`, `/api`, `/api/*`, login routes, drafts, scheduled/archived/deleted posts, trashed records, revisions, activity logs, redirects management, form submissions, Supabase auth/session data, environment values, analytics payloads, build output, `node_modules`, virtual environments, assistant conversation history, chatbot UI boilerplate, microphone/voice code, and arbitrary external websites.

## Publication and deletion fields

- Blogs: `status` must be `published`; `deleted_at` must be null; `slug` must be valid.
- Case studies: repository types expose public fields such as `slug`, `title`, `client_name`, `industry`, `challenge`, `solution`, `results`, `published_date`.
- Pricing: public indexing is limited to active/public rows when available; inactive rows are excluded by application filtering.

## Canonical route rules

Routes are normalized by stripping fragments, removing irrelevant query parameters, trimming trailing slashes except `/`, rejecting external/unsafe schemes, rejecting encoded traversal, rejecting `/admin` and `/api`, and allowing only static public routes plus dynamic `/blog/:slug` and `/case-studies/:slug` routes.

## Source priority and fallback

1. Repository allowlisted static routes.
2. Sitemap-derived public routes.
3. Deployed/prerendered public HTML for approved routes.
4. Published Supabase blogs and case studies.
5. Public fallback case-study/static data when Supabase is not configured.

Unavailable external sources are isolated as failures and must not block unchanged safe content from being used.
