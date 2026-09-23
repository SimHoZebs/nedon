#!/bin/sh
# financial-verify.sh [--dry-run|--help]
# Single pass: biome + tsc + vitest server/financial + git diff --check,
# plus the provider contract check (mappers/types/credentials).
# Prefixes match package.json scripts (tsc="tsc", test="vitest"): corepack pnpm.
set -eu
cd "$(dirname "$0")/.."

DRY=0
for a in "$@"; do
  case "$a" in
    --dry-run) DRY=1 ;;
    -h|--help) echo "usage: scripts/financial-verify.sh [--dry-run]"; exit 0 ;;
    *) echo "usage: scripts/financial-verify.sh [--dry-run]" >&2; exit 2 ;;
  esac
done

FAIL=0
run() {
  if [ "$DRY" -eq 1 ]; then echo "[dry-run] $*"; else echo "## $*"; "$@"; fi
}
step() { # step <name> <cmd...>: never aborts the suite, records failure
  _name="$1"; shift
  echo "## $_name"
  if [ "$DRY" -eq 1 ]; then echo "[dry-run] $*"; return 0; fi
  if "$@"; then echo "PASS: $_name"; else echo "FAIL: $_name"; FAIL=$((FAIL + 1)); fi
}

FIN="server/financial server/routers/financial.ts server/mappers/prismaToDto.ts lib/types/financial.ts"
# shellcheck disable=SC2086
step "biome check (no writes)" corepack pnpm exec biome check $FIN
step "tsc (package.json tsc script)" corepack pnpm tsc
step "vitest server/financial (package.json test runner)" corepack pnpm vitest run server/financial
step "git diff --check" git diff --check

echo "## provider contract check (mappers/types/credentials)"
if [ "$DRY" -eq 1 ]; then
  echo "[dry-run] grep parity checks (provider enum, string amounts, credential hygiene)"
else
  echo "--- provider enum parity (schema / lib types / server types / registry ids)"
  grep -h -A3 "enum FinancialProvider" prisma/schema.prisma
  grep -h 'z.enum(\["PLAID"' lib/types/financial.ts server/financial/types.ts
  grep -rn "readonly id.*FinancialProvider\|id: FinancialProvider\|id = \"" server/financial/providers --include='*.ts' | grep -v test
  echo "--- ExternalTransaction.amount is string money; mappers use normalizeMoneyValue"
  grep -n "amount: string" server/financial/types.ts
  grep -rn "normalizeMoneyValue" server/financial/providers/*/[a-z]*appers.ts
  echo "--- credential hygiene: never logged, never in DTO schemas"
  if grep -rn "console\.log.*credential\|credential.*console\.log" server lib | grep -vi test; then
    echo "FAIL: credential hits a log line"; FAIL=$((FAIL + 1))
  else echo "PASS: no credential logging"; fi
  if grep -n "credential" lib/types/financial.ts; then
    echo "FAIL: credential leaks into client DTO types"; FAIL=$((FAIL + 1))
  else echo "PASS: credential absent from client DTO types"; fi
fi

if [ "$DRY" -eq 1 ]; then exit 0; fi
echo "== financial-verify: $FAIL failing step(s) =="
[ "$FAIL" -eq 0 ]
