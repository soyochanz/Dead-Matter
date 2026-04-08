# SEO Optimization Plan - Dead Matter Wiki

The analysis of the code and Google Search Console data revealed several critical SEO issues that are preventing the site from ranking for the main keyword "Dead Matter" despite having high-quality content.

## Identified Issues & Fixes

### 1. The "Canonical Suicide" Fix
**Issue**: Hundreds of pages (categories, weapons, guides) were being excluded because the static `index.html` file had a hardcoded `<link rel="canonical" href="https://deadmatterwiki.com/" />`.
**Impact**: Google saw this directive on every page and thought they were all just mirrors of the home page, hence "Página alternativa con etiqueta canónica adecuada (206 páginas)".
**Fix**: Removed the static canonical and hreflang tags from `index.html`. They are now handled dynamically by the `Layout` component using `react-helmet`.

### 2. Branding & Keyword Authority
**Issue**: The site ranks for long-tail keywords (Dead Matter Wiki, Dead Matter Map) but isn't establishing enough authority for the "Dead Matter" core keyword.
**Fix**: Optimized the homepage title to **"Dead Matter Wiki | #1 Community Map, Wiki & Survival Guides"**. Starting the title with the primary keyword and adding "Wiki" + "#1 Community" signals stronger authority.

### 3. "Soft 404" & Index Bloat Handling
**Issue**: Non-existent pages were returning a 200 status (due to the SPA nature) without a `noindex` tag, leading to "Soft 404" errors in GSC.
**Fix**:
- Updated `App.jsx` to explicitly add `<meta name="robots" content="noindex" />` to the 404 component.
- Updated `robots.txt` to block administrative and private routes (`/admin`, `/profile`, `/tutucucu`) to focus Google's crawl budget on content pages.

### 4. Duplicate Language Signals
**Issue**: The static `hreflang` tags were all pointing to the root URL for every language, which is incorrect and confuses Google's international targeting.
**Fix**: Removed the static `hreflang` tags. For a SPA, it's better to let Google detect the language or implement dynamic `hreflang` tags only if you have unique URLs for each language.

## Next Steps for the User

> [!IMPORTANT]
> **1. Re-build and Deploy**: Run `npm run build` and deploy the project. The changes in `index.html` and `robots.txt` are only effective once deployed.
> **2. Request Re-indexing**: Go to Google Search Console and "Request Indexing" for the homepage. The 813 "noindex" errors should start to clear as Google re-crawls the site and sees the updated clean headers.
> **3. Expand Sitemap**: The current `sitemap.xml` only has 14 pages. You should add all your Wiki items (weapons, guides, etc.) to it. If you have many, consider creating a script that fetches slugs from Supabase and writes them to the XML.

---

### File Changes Summary

| File | Change | Purpose |
| :--- | :--- | :--- |
| `index.html` | Removed static canonical/hreflang | Stop "Duplicate content" false positives |
| `src/pages/Home.jsx` | Optimized Title/Description | Better ranking for "Dead Matter" |
| `src/App.jsx` | Added `noindex` to 404 Route | Fix Soft 404 errors |
| `public/robots.txt` | Optimized block list | Focus crawl budget on Wiki content |
