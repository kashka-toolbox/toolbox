#!/usr/bin/env bash
set -euo pipefail

# Usage: scripts/translate.sh [lang|all]
#   lang      target language (2-letter code), defaults to "de"
#   all       translate every enabled language with pending work
#
# Translation runs through a direct OpenAI-compatible API call
# (scripts/translate-api.mjs, configured via the TRANSLATE_API_* variables).

MARKER="FROM en.json REPLACE: "
REGISTRY="src/i18n/languages.json"
LOG_DIR="logs/translate"

cd "$(git rev-parse --show-toplevel)"

lang="${1:-de}"

translate_one() {
  local target="$1"

  # 1. Copy missing keys from the English source.
  #    sync-i18n.mjs writes i18n/<lang>.json and prints the added key paths to stdout.
  local added
  added="$(node scripts/sync-i18n.mjs "$target" 2>/dev/null)" || {
    echo "error: sync-i18n.mjs failed for ${target}" >&2
    return 1
  }

  # Trigger on any marker present (covers both newly added keys and leftovers from an interrupted run).
  local pending
  pending="$(grep -cF -- "$MARKER" "i18n/${target}.json" || true)"
  pending="${pending:-0}"
  if [ "$pending" -eq 0 ]; then
    echo "i18n/${target}.json is already in sync with en.json. Nothing to do."
    return 0
  fi

  echo "[$target] Found ${pending} placeholder value(s) to translate."
  if [ -n "$added" ]; then
    echo "Newly added keys:"
    echo "$added"
  fi

  # 2. Translate the placeholder values via the OpenAI-compatible API,
  #    including token/TPS stats. Teed to a per-language log file for review.
  mkdir -p "$LOG_DIR"
  local log_file
  log_file="$LOG_DIR/${target}-$(date +%Y%m%d-%H%M%S).log"
  echo "[$target] Logging to ${log_file}"

  if ! node scripts/translate-api.mjs "$target" 2>&1 | tee -a "$log_file"; then
    echo "error: API translation failed for ${target}. See ${log_file}" >&2
    return 1
  fi

  # 3. Verify no marker remains and the file is valid JSON before the user commits.
  local remaining
  remaining="$(grep -cF -- "$MARKER" "i18n/${target}.json" || true)"
  remaining="${remaining:-0}"
  if [ "$remaining" -gt 0 ]; then
    echo "error: ${remaining} value(s) in i18n/${target}.json still contain '${MARKER}'. Do not commit yet." >&2
    return 1
  fi
  node -e "JSON.parse(require('fs').readFileSync('i18n/${target}.json', 'utf8'))" || {
    echo "error: i18n/${target}.json is not valid JSON." >&2
    return 1
  }
  echo "[$target] Done. i18n/${target}.json is ready."
}

if [ "$lang" = "all" ]; then
  parallel="${TRANSLATE_JOBS:-3}"
  langs="$(node -e '
    const r = require(require("node:path").resolve(process.argv[1]));
    for (const l of r) if (l.enabled && l.code !== "en") console.log(l.code);
  ' "$REGISTRY")"
  echo "Translating all enabled languages (up to ${parallel} in parallel; override with TRANSLATE_JOBS)."
  echo "Per-language logs: ${LOG_DIR}/"
  if ! printf '%s\n' "$langs" | xargs -P "$parallel" -I{} scripts/translate.sh {}; then
    echo "error: one or more languages failed or are incomplete. Check ${LOG_DIR}/ for details." >&2
    exit 1
  fi
  echo "All enabled languages are in sync."
else
  translate_one "$lang"
  echo "Review with: git diff i18n/${lang}.json"
fi
