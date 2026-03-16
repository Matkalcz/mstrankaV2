#!/bin/bash
# escape_html.sh - Escapuje HTML speciální znaky pro JSON

INPUT_FILE="$1"
OUTPUT_FILE="${INPUT_FILE%.html}_escaped.html"

if [ ! -f "$INPUT_FILE" ]; then
  echo "Chyba: Soubor $INPUT_FILE neexistuje"
  exit 1
fi

# Escape speciálních znaků pro JSON
sed -e 's/&/\&amp;/g' \
    -e 's/</\&lt;/g' \
    -e 's/>/\&gt;/g' \
    -e 's/"/\&quot;/g' \
    -e "s/'/\&#39;/g" \
    "$INPUT_FILE" > "$OUTPUT_FILE"

echo "✅ Escaped: $INPUT_FILE → $OUTPUT_FILE"
echo "📋 Použij: mcporter call ... htmlContent=\"\$(cat $OUTPUT_FILE)\""
