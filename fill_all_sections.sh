#!/bin/bash
echo "🚀 Naplňuji všechny sekce Bondsky webu..."

# Funkce pro escape HTML
escape_html() {
  cat "$1" | jq -Rs . | sed 's/^"//;s/"$//'
}

# 1. Blends sekce
echo "📝 Naplňuji Blends sekci..."
BLENDS_HTML=$(escape_html projects/bondsky/blends_simple.html)
mcporter call mstranka.edit_section \
  websiteId="0bb29aa8-00e5-4d54-ae29-83f9c9343032" \
  sectionId="3f5d729e-7420-4a8e-8d8e-87ff434e2c6e" \
  name="Blends" \
  htmlContent="$BLENDS_HTML" \
  title="Blends" \
  showOnPage=true

# 2. News sekce  
echo "📝 Naplňuji News sekci..."
NEWS_HTML=$(escape_html projects/bondsky/news_simple.html)
mcporter call mstranka.edit_section \
  websiteId="0bb29aa8-00e5-4d54-ae29-83f9c9343032" \
  sectionId="2bd91bb2-437a-46c9-a53c-7918d6c16228" \
  name="News" \
  htmlContent="$NEWS_HTML" \
  title="News" \
  showOnPage=true

# 3. Tips sekce
echo "📝 Naplňuji Tips sekci..."
TIPS_HTML=$(escape_html projects/bondsky/tips_simple.html)
mcporter call mstranka.edit_section \
  websiteId="0bb29aa8-00e5-4d54-ae29-83f9c9343032" \
  sectionId="9f9bfcdd-4c77-47be-88ce-a6ab670b9d0f" \
  name="Tips & Guides" \
  htmlContent="$TIPS_HTML" \
  title="Tips & Guides" \
  showOnPage=true

# 4. CTA sekce
echo "📝 Naplňuji CTA sekci..."
CTA_HTML=$(escape_html projects/bondsky/cta_simple.html)
mcporter call mstranka.edit_section \
  websiteId="0bb29aa8-00e5-4d54-ae29-83f9c9343032" \
  sectionId="413d0a1f-51ef-4848-be54-3d8195d28642" \
  name="CTA" \
  htmlContent="$CTA_HTML" \
  title="CTA" \
  showOnPage=true

echo "✅ Všechny sekce naplněny!"
