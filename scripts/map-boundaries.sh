#!/bin/sh
# map-boundaries.sh [--refresh|--help]
# Concise server<->lib<->pages graph + Prisma/Decimal leaks + DTO edge cases.
# Cached at .cache/map-boundaries.txt; regenerated on --refresh, missing
# cache, or any *.ts/*.tsx newer than the cache.
set -eu
cd "$(dirname "$0")/.."

CACHE=".cache/map-boundaries.txt"
REFRESH=0
for a in "$@"; do
  case "$a" in
    --refresh) REFRESH=1 ;;
    -h|--help) echo "usage: scripts/map-boundaries.sh [--refresh]"; exit 0 ;;
    *) echo "usage: scripts/map-boundaries.sh [--refresh]" >&2; exit 2 ;;
  esac
done

STALE="$(find server lib pages prisma -name '*.ts*' -newer "$CACHE" 2>/dev/null | head -1 || true)"
if [ "$REFRESH" -eq 0 ] && [ -f "$CACHE" ] && [ -z "$STALE" ]; then
  cat "$CACHE"
  exit 0
fi

mkdir -p .cache
{
echo "# map-boundaries report ($(date -u +%FT%TZ))"
echo "## 1. module graph (who imports whom)"
echo "### server imports (should only point at @/, relative, packages)"
grep -rhn --include='*.ts' '^import .* from' server/routers server/mappers server/domains server/financial 2>/dev/null \
  | grep -o "from ['\"][^'\"]*['\"]" | sort | uniq -c | sort -rn | head -20
echo "### client files importing server/ directly (boundary violations; import type is exempt)"
grep -rn --include='*.ts' --include='*.tsx' -e "from ['\"]server/" -e "from ['\"]\.\./\.\./server" lib pages 2>/dev/null | grep -v "import type" || echo "(none)"
echo "### existing audit: test/frontend-boundary.test.ts (no Prisma/plaid in lib+pages)"
echo "## 2. Prisma/Decimal leak list (mirrors the audit: lib+pages, excl. pages/api)"
echo "### @prisma/client outside server/ + prisma/"
grep -rln --include='*.ts' --include='*.tsx' "@prisma/client" lib $(find pages -path pages/api -prune -o -print 2>/dev/null) 2>/dev/null || echo "(none)"
echo "### new Prisma.Decimal outside server/"
grep -rn --include='*.ts' --include='*.tsx' "new Prisma\.Decimal" lib pages 2>/dev/null || echo "(none)"
echo "### decimal.js/toMoney usage in client (legit string-money path)"
grep -rln --include='*.ts' --include='*.tsx' -e "decimal\.js" -e "util/money" lib pages | head -20
echo "## 3. DTO edge cases"
echo "### router include: sites (each needs mapper coverage)"
grep -rn --include='*.ts' -e "include:" -e "include :" server/routers server/domains | head -20
echo "### nullable money handling (null ternaries at the boundary)"
grep -rn --include='*.ts' -e "? prismaDecimalToMoney" -e "? normalizeMoneyValue" -e "?? null" -e ": null" server/mappers server/routers/financial.ts | head -20
echo "### Result envelopes (discriminated unions cross the wire)"
grep -rn --include='*.ts' -e 'discriminatedUnion("ok"' -e '{ ok: true' -e 'ok: z\.literal' server/routers | head
echo "### client-side Result unwrapping"
grep -rn --include='*.ts' --include='*.tsx' -e '\.ok\b' -e 'result\.ok' -e 'isSuccess' lib/pages pages 2>/dev/null | head -10 || true
} | tee "$CACHE"
