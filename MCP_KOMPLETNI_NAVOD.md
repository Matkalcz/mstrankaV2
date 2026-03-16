g' \
    -e 's/"/\&quot;/g' \
    -e "s/'/\&#39;/g" \
    muj_clanek.html > escaped.html

# Metoda 3: Python skript pro escape
python3 -c "import html, json; print(json.dumps(open('muj_clanek.html').read()))" > escaped_json.html
```

**Testovací postup:**
```bash
# 1. Test s minimálním HTML (funguje)
echo "<p>Test</p>" > test_minimal.html
mcporter call mstranka.create_post ... htmlContent="$(cat test_minimal.html)"

# 2. Test s problematickým HTML (selže!)
echo "<p>Test & special < > \" '</p>" > test_problem.html
# mcporter call ... htmlContent="$(cat test_problem.html)"  # SELŽE

# 3. Test s escapovaným HTML (funguje!)
echo "<p>Test &amp; special &lt; &gt; &quot; &#39;</p>" > test_escaped.html
mcporter call mstranka.create_post ... htmlContent="$(cat test_escaped.html)"
```

**Automatizační skript pro escape:**
```bash
#!/bin/bash
# escape_html.sh

INPUT_FILE="$1"
OUTPUT_FILE="${INPUT_FILE%.html}_escaped.html"

# Escape speciálních znaků
sed -e 's/&/\&amp;/g' \
    -e 's/</\&lt;/g' \
    -e 's/>/\&gt;/g' \
    -e 's/"/\&quot;/g' \
    -e "s/'/\&#39;/g" \
    "$INPUT_FILE" > "$OUTPUT_FILE"

echo "Escaped: $INPUT_FILE → $OUTPUT_FILE"
echo "Použij: mcporter call ... htmlContent=\"\$(cat $OUTPUT_FILE)\""
```

**Klíčové pravidlo:** Před odesláním HTML přes MCP vždy escapuj speciální znaky!