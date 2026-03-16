# 2026-03-16 — Bondsky Web Fix Progress

## Current Status
**Project:** Bondsky website migration from Macaly to mStrankaV2
**Target URL:** https://bondsky.v2.mstranka.cz/
**Source URL:** https://v2ouyb0w9aaw3v3o3ktl3mg8.macaly.dev/

## Problem Analysis
1. **Missing sections on target site:**
   - ✅ Hero section (present)
   - ✅ Why Bonds section (present)  
   - ❌ ROUNDHEAT Technology section (completely missing)
   - ❌ Blends section (completely missing)
   - ❌ News/Novinky section (completely missing)
   - ❌ Tips & Guides section (completely missing)
   - ❌ CTA section (completely missing)

2. **MCP Server Issues:**
   - API key: `msk_822251dd65802f82b1e57cb2e2dcd8ba9ec453e22ec5d129bfc812280fd391aa`
   - Getting "Unauthorized" errors despite correct credentials
   - Cannot use `add_section`, `get_context`, or other MCP tools
   - Session initialization works, but tool calls fail

## Work Done Today
1. **Analyzed HTML structure** of both source and target sites
2. **Confirmed missing sections** via curl analysis
3. **Created complete HTML for ROUNDHEAT section** from source
4. **Created simplified HTML for other missing sections** based on screenshots:
   - Blends section (4 blend cards)
   - News section (2 news cards)
   - Tips section (3 tips)
   - CTA section (call to action)
5. **Built two complete page versions:**
   - `page_with_roundheat_only.html` - Just Hero + ROUNDHEAT + Why Bonds
   - `completed_page.html` - All sections included

## Technical Details
- **Source site:** Next.js application (dynamic content loading)
- **Target site:** mStrankaV2 CMS with section-based structure
- **CSS:** Using `bondsky_complete.css` with Tailwind-like utility classes
- **Workspace:** `/home/openclaw/.openclaw/workspace-mstrankaV2/projects/bondsky/`

## Files Created
1. `roundheat_complete.html` - Complete ROUNDHEAT section HTML
2. `missing_sections.html` - Partial sections from source (incomplete)
3. `current_page.html` - Current target site HTML (248 lines)
4. `original_page.html` - Source site HTML (68 lines, Next.js shell)
5. `completed_page.html` - Full page with all sections (254 lines)
6. `page_with_roundheat_only.html` - Minimal fix with just ROUNDHEAT (250 lines)
7. `manual_merge.js` - Script to merge sections into page

## Blockers
1. **MCP Authorization failure** - Cannot programmatically add sections
2. **Source site dynamic content** - Cannot easily scrape complete HTML
3. **Need manual intervention** to upload fixed HTML to mStrankaV2

## Next Actions Required
1. **Manual upload** of fixed HTML to mStrankaV2 (bypassing MCP)
2. **CSS verification** - Ensure all classes are defined in `bondsky_complete.css`
3. **Testing** - Preview and publish after fixes
4. **MCP troubleshooting** - Fix API authorization issue for future work

## Critical Notes
- User provided screenshots showing complete source site
- Target site is missing majority of content sections  
- Workaround created: Complete HTML pages ready for manual upload
- Priority: Get ROUNDHEAT section added first (most critical missing piece)