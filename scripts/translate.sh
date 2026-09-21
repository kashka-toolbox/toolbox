#!/usr/bin/env bash
set -euo pipefail

# Usage: scripts/translate.sh [lang]
#   lang      target language, defaults to "de"
# Set TRANSLATE_MODEL to override the opencode model (default: your opencode default).

lang="${1:-de}"
model="${TRANSLATE_MODEL:-}"

cd "$(git rev-parse --show-toplevel)"

MARKER="FROM en.json REPLACE: "

# 1. Copy missing keys from the English source.
#    sync-i18n.mjs writes i18n/<lang>.json and prints the added key paths to stdout.
added="$(node scripts/sync-i18n.mjs "$lang" 2>/dev/null)" || {
  echo "error: sync-i18n.mjs failed for ${lang}" >&2
  exit 1
}

# Trigger on any marker present (covers both newly added keys and leftovers from an interrupted run).
pending="$(grep -cF -- "$MARKER" "i18n/${lang}.json" || true)"
pending="${pending:-0}"
if [ "$pending" -eq 0 ]; then
  echo "i18n/${lang}.json is already in sync with en.json. Nothing to do."
  exit 0
fi

echo "Found ${pending} placeholder value(s) to translate."
if [ -n "$added" ]; then
  echo "Newly added keys:"
  echo "$added"
fi

# 2. Have opencode translate the placeholder values. Edit-only: no git, no commit.
prompt=$(cat <<EOF
The translation file i18n/${lang}.json already contains every key from the English source. A static sync step copied every missing key and prefixed its value with the marker "${MARKER}" followed by the English text. Every value carrying that marker is a placeholder that still needs a German translation.

Your task:
- Read i18n/${lang}.json. You do not need to read any other file.
- Find every string value that starts with "${MARKER}".
- Replace each such value with a natural German translation of the English text that follows the marker. Do not keep the marker in the result.
- If the English text after the marker is empty, set the value to an empty string.
- Match the existing style of the file (informal "du" form).
- Leave every other key and its translation completely untouched.
- Do not add, remove, or rename any keys.
- Keep i18n/${lang}.json valid JSON with 2-space indentation and a trailing newline.
- Do not modify any other file.

The keys added by the sync step (for reference, full key paths):
$added

After editing, verify that no value in i18n/${lang}.json still contains the marker "${MARKER}".

Only edit i18n/${lang}.json in the working tree. Do not run any git commands, do not create branches, do not commit, do not push, and do not open pull requests.
EOF
)

if [ -n "$model" ]; then
  opencode run --auto -m "$model" "$prompt"
else
  opencode run --auto "$prompt"
fi

# 3. Verify no marker remains before the user commits.
remaining="$(grep -cF -- "$MARKER" "i18n/${lang}.json" || true)"
remaining="${remaining:-0}"
if [ "$remaining" -gt 0 ]; then
  echo "error: ${remaining} value(s) in i18n/${lang}.json still contain '${MARKER}'. Do not commit yet." >&2
  exit 1
fi

echo "Done. i18n/${lang}.json is ready."
echo "Review with: git diff i18n/${lang}.json"
