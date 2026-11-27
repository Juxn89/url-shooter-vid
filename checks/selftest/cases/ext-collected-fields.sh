#!/bin/sh
# Purpose: selftest case — dead-path.collected-fields flags a collected field the page stores, in two storage vocabularies. Env: CHECKS.
set -eu
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
cd "$T"
fail() { echo "ext-collected-fields: $*" >&2; exit 1; }
mkdir app; printf '<input id="url-input">\n<input id="note">\n' > index.html
echo 'var a = 1;' > app/page.js
sh "$CHECKS/extractors/dead-path.collected-fields.sh" | grep -q '^inactive ' || fail 'nothing stored, but not inactive'
echo 'localStorage.setItem("k", document.getElementById("url-input").value);' > app/page.js
echo 'sessionStorage["n"] = note;' >> app/page.js
o=$(sh "$CHECKS/extractors/dead-path.collected-fields.sh")
echo "$o" | grep -q '^orphan url-input ' || fail "stored field not flagged: $o"
echo "$o" | grep -q '^orphan note ' || fail "second vocabulary not flagged: $o"
