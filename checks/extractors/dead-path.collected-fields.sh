#!/bin/sh
# Purpose: dead-path census — every field the product collects AND stores, joined to a read site beyond validation and display.
# The page collects inputs (index.html) and stores nothing (NG-002); a stored field is one written to storage or kept in a collection.
set -eu
fields=$(grep -o '<input[^>]*id="[^"]*"' index.html 2>/dev/null | sed 's/.*id="\([^"]*\)".*/\1/' || true)
[ -n "$fields" ] || { echo "inactive no input field in index.html"; exit 0; }
stored=0
for f in $fields; do
  if grep -Eq "(localStorage|sessionStorage|indexedDB|document\.cookie)[^;]*$f|$f[^;]*(localStorage|sessionStorage|indexedDB|document\.cookie)" app/*.js 2>/dev/null; then
    stored=$((stored + 1)); echo "orphan $f stored by the page, which NG-002 forbids — no read site may justify it"
  fi
done
[ "$stored" -gt 0 ] || echo "inactive the product stores no field it collects (NG-002)"
