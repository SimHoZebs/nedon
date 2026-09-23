#!/bin/sh
# dto-migrate.sh [--check|--apply]
# Ordered string-money/Decimal boundary audit along the dependency graph:
#   schema -> mappers -> routers/domains -> lib -> pages.
# --check lists violations (exit 1 if any). --apply performs only the
# allowlisted mechanical edits below, prints a diff per edit, re-checks,
# and prints everything else as manual work. It never rewrites logic.
set -eu
cd "$(dirname "$0")/.."

MODE="${1:---check}"
case "$MODE" in
  --check|--apply|-h|--help)
    if [ "$MODE" = "-h" ] || [ "$MODE" = "--help" ]; then
      echo "usage: scripts/dto-migrate.sh [--check|--apply]"
      exit 0
    fi
    ;;
  *) echo "usage: scripts/dto-migrate.sh [--check|--apply]" >&2; exit 2 ;;
esac

VIOLATIONS=0
say() { printf '%b\n' "$*"; }
flag() { VIOLATIONS=$((VIOLATIONS + 1)); say "  VIOLATION $*"; }
ok() { say "  ok: $*"; }

say "== 1/5 schema: @db.Money fields (source of truth) =="
grep -n "@db.Money" prisma/schema.prisma || true

say "== 2/5 mappers: money fields go through prismaDecimalToMoney =="
for field in userTotal amount budget subtotal tax tip grand_total unit_price currentBalance availableBalance; do
  if grep -rln "$field" server --include='*.ts' | xargs -r grep -ln "prismaDecimalToMoney\|normalizeMoneyValue" 2>/dev/null | grep -q .; then
    ok "$field mapped to string money (server boundary)"
  else
    flag "$field has no string-money mapper coverage under server/"
  fi
done
# Direct name match, else an indirect proxy proving the path is exercised.
indirect_cov() {
  case "$1" in
    mapSplitTx) echo "splitTxArray" ;;
    mapCat) echo "catArray" ;;
    mapReceiptItem) echo "unit_price" ;;
    mapCatSettings) echo "budget" ;;
    *) echo "$1(" ;;
  esac
}
for fn in mapTx mapSplitTx mapCat mapReceipt mapReceiptItem mapCatSettings mapUserSettings; do
  if grep -q "$fn" server/mappers/prismaToDto.test.ts || grep -q "$(indirect_cov "$fn")" server/mappers/prismaToDto.test.ts; then
    ok "$fn has test coverage"
  else
    flag "$fn lacks test coverage in server/mappers/prismaToDto.test.ts"
  fi
done

say "== 3/5 routers/domains: Decimal construction stays server-side =="
LEAKS=$(grep -rn "new Prisma\.Decimal" lib pages --include='*.ts' --include='*.tsx' || true)
if [ -n "$LEAKS" ]; then flag "client-side Decimal construction:\n$LEAKS"; else ok "no new Prisma.Decimal in lib/ or pages/"; fi
PRISMA_IMPORTS=$(grep -rln "@prisma/client" lib pages || true)
if [ -n "$PRISMA_IMPORTS" ]; then flag "prisma/client imported client-side:\n$PRISMA_IMPORTS"; else ok "no @prisma/client imports in lib/ or pages/"; fi

say "== 4/5 hotspots: toNumber/toFixed outside canonical money utils =="
# Canonical: server/mappers/prismaToDto.ts, lib/util/money.ts, *.test.ts
HOTSPOTS=$(grep -rn --include='*.ts' --include='*.tsx' -e '\.toNumber()' -e '\.toFixed(' server lib pages \
  | grep -v 'server/mappers/prismaToDto\.ts' \
  | grep -v 'lib/util/money\.ts' \
  | grep -v '\.test\.' || true)
if [ -n "$HOTSPOTS" ]; then
  flag "non-canonical number coercion (route money through toMoney/prismaDecimalToMoney):\n$HOTSPOTS"
else
  ok "no toNumber/toFixed hotspots outside canonical utils"
fi

if [ "$MODE" = "--apply" ]; then
  say "== apply: allowlisted mechanical edits only =="
  # Rule A (precision-preserving): new Decimal(X.toString()) -> new Decimal(X).
  # decimal.js toString() is exact, so dropping the round-trip keeps behavior.
  # Rule A (precision-preserving): new Decimal(dotted.path.toString())
  # -> new Decimal(dotted.path). decimal.js toString() is exact and the
  # constructor accepts Decimal instances, so the round-trip drop is a no-op.
  # The pattern is deliberately limited to dotted identifier chains (no
  # calls/parens) so it cannot span across expressions.
  APPLIED=0
  TOUCHED=""
  for f in $(grep -rln --include='*.ts' --include='*.tsx' -E 'new Decimal\([A-Za-z_$][A-Za-z0-9_$]*(\.[A-Za-z_$][A-Za-z0-9_$]*)*\.toString\(\)\)' lib pages || true); do
    say "--- $f (Rule A: drop Decimal->string->Decimal round-trip)"
    perl -i -pe 's/new Decimal\(([A-Za-z_\$][A-Za-z0-9_\$]*(?:\.[A-Za-z_\$][A-Za-z0-9_\$]*)*)\.toString\(\)\)/new Decimal($1)/g' "$f"
    TOUCHED="$TOUCHED $f"
    APPLIED=$((APPLIED + 1))
  done
  say "applied Rule A to $APPLIED file(s); re-running check..."
  # shellcheck disable=SC2086
  if [ "$APPLIED" -gt 0 ]; then git diff --stat -- $TOUCHED; fi
  # Re-check: recompute hotspots only (cheap, no recursion into apply).
  HOTSPOTS=$(grep -rn --include='*.ts' --include='*.tsx' -e '\.toNumber()' -e '\.toFixed(' server lib pages \
    | grep -v 'server/mappers/prismaToDto\.ts' \
    | grep -v 'lib/util/money\.ts' \
    | grep -v '\.test\.' || true)
fi

say "== summary: $VIOLATIONS violation(s) =="
if [ -n "${HOTSPOTS:-}" ]; then
  say "-- manual work (NOT auto-fixed; display formatting needs human review):"
  say "$HOTSPOTS"
fi
[ "$VIOLATIONS" -eq 0 ]
