#!/bin/sh
# frontier-check.sh --owner=tx|analytics|transport [--help]
# Scoped lint/typecheck + Prisma-import + string-money invariant for owned
# files. Out-of-scope errors appear as summary counts only.
set -eu
cd "$(dirname "$0")/.."

OWNER=""
for a in "$@"; do
  case "$a" in
    --owner=tx|--owner=analytics|--owner=transport) OWNER="${a#--owner=}" ;;
    -h|--help)
      echo "usage: scripts/frontier-check.sh --owner=tx|analytics|transport"
      echo "  tx:        tx/split/cat/receipt routers, domains, mappers, tx store, TxModal"
      echo "  analytics: pages/analytics.tsx, analysis comps, nested-cat domain"
      echo "  transport: financial providers/sync, connection router, CSV import"
      exit 0 ;;
    *) echo "usage: scripts/frontier-check.sh --owner=tx|analytics|transport" >&2; exit 2 ;;
  esac
done
[ -n "$OWNER" ] || { echo "missing --owner=tx|analytics|transport" >&2; exit 2; }

owned() { # print owned files, one per line; missing globs are skipped
  case "$OWNER" in
    tx) for p in server/routers/tx.ts server/routers/split.ts server/routers/cat.ts \
          server/routers/receipt.ts server/domains/tx.ts server/domains/cat.ts \
          server/mappers/prismaToDto.ts lib/types/tx.ts lib/types/cat.ts \
          lib/types/money.ts lib/types/receipt.ts lib/types/receiptItem.ts \
          lib/store/txStore.ts lib/domain/tx.ts lib/util/money.ts; do
          [ -e "$p" ] && echo "$p"
        done
        find lib/comp/tx -name '*.ts*' 2>/dev/null ;;
    analytics) for p in pages/analytics.tsx lib/domain/tx.ts; do [ -e "$p" ] && echo "$p"; done
        find lib/comp/analysis -name '*.ts*' 2>/dev/null ;;
    transport) for p in server/routers/financial.ts server/routers/connection.ts \
          lib/types/financial.ts scripts/convertPlaidCsv.js; do
          [ -e "$p" ] && echo "$p"
        done
        find server/financial server/services -name '*.ts' 2>/dev/null | grep -v '\.test\.' ;;
  esac
}

FILES=$(owned)
[ -n "$FILES" ] || { echo "no files resolve for owner=$OWNER" >&2; exit 2; }
echo "== owner=$OWNER: $(echo "$FILES" | wc -l) file(s) =="

echo "--- 1. scoped biome"
# shellcheck disable=SC2086
corepack pnpm exec biome check $FILES || true

echo "--- 2. tsc: owned errors full, out-of-scope as counts"
TMP=$(mktemp)
corepack pnpm tsc >"$TMP" 2>&1 || true
TOTAL=$(grep -c "error TS" "$TMP" || true)
PATTERN=$(echo "$FILES" | sed 's/^/^/;s/$//' | paste -sd'|' -)
OWNED_N=$(grep -cE "$PATTERN" "$TMP" || true)
echo "tsc total errors: $TOTAL; owned by $OWNER: ${OWNED_N:-0}; out-of-scope: $((TOTAL - ${OWNED_N:-0}))"
if [ "${OWNED_N:-0}" -gt 0 ]; then grep -E "$PATTERN" "$TMP"; fi
rm -f "$TMP"

echo "--- 3. Prisma-import invariant (no @prisma/client in owned client files)"
echo "$FILES" | grep -e '^lib/' -e '^pages/' | while read -r f; do
  case "$f" in *.js) continue;; esac
  grep -Hn "@prisma/client" "$f" || true
done

echo "--- 4. string-money invariant (owned files)"
# Canonical exception: lib/util/money.ts + server mappers own the coercion.
echo "$FILES" | while read -r f; do
  case "$f" in lib/util/money.ts|server/mappers/*|*.test.*) continue;; esac
  case "$f" in
    lib/*|pages/*) grep -Hn -e 'new Prisma\.Decimal' "$f" || true ;;
  esac
  grep -Hn -e '\.toNumber()' "$f" || true
  case "$f" in *.test.*) ;; *) grep -Hn -e '\.toFixed(' "$f" || true;; esac
done
echo "== frontier-check owner=$OWNER done (tsc out-of-scope: $((TOTAL - ${OWNED_N:-0})) of $TOTAL) =="
