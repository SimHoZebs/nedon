#!/bin/sh
# tx-trace.sh [--help]
# One call: Plaid -> DB -> router -> store -> SplitList, plus the
# userModified flag and migration state. Read-only (grep/git/ls only).
set -eu
cd "$(dirname "$0")/.."

for a in "$@"; do
  case "$a" in -h|--help) echo "usage: scripts/tx-trace.sh"; exit 0;;
  *) echo "usage: scripts/tx-trace.sh" >&2; exit 2;; esac
done

h() { printf '\n== %s ==\n' "$*"; }
h "1. PLAID INGRESS (provider -> ExternalTransaction, string money)"
grep -n "normalizeMoneyValue\|amount" server/financial/providers/plaid/plaidMappers.ts | head -12
grep -n "syncConnection\|completeConnection\|beginConnection" server/financial/FinancialDataService.ts | head -8
h "2. DB PERSIST (ORIGINAL snapshot + editable USER copy)"
grep -n "TxKind\.\|editableCopyData\|transactionData\|userModified" server/financial/FinancialSyncService.ts | head -25
grep -n "userModified\|kind \|ORIGINAL\|USER" prisma/schema.prisma | head -8
h "3. ROUTER (tRPC boundary, mapTx on every read)"
grep -n "procedure\|mapTx\|\\.query\|\\.mutation" server/routers/tx.ts | head -30
echo "--- split router (stub status):"; cat server/routers/split.ts
h "4. STORE (DTO string -> form state via toMoney)"
grep -n "mapTxToFormState\|toMoney\|useTxGetAll\|txGetAllResult\|getAll.useQuery" lib/domain/tx.ts lib/store/txStore.ts lib/store/store.ts | head -20
h "5. SPLITLIST (store -> SplitList -> SplitUser -> tx.update)"
grep -n "import\|useTxStore\|splitTxArray\|mutateAsync\|new Decimal\|toMoney" lib/comp/tx/TxModal/SplitList/SplitList.tsx | head -25
grep -n "props.onAmountChange\|splitAmount\|Decimal\|toMoney" lib/comp/tx/TxModal/SplitList/SplitUser.tsx | head -12
h "6. MODIFIED FLAG (sync never overwrites user edits)"
grep -rn --include='*.ts' "userModified" server | head -15
h "7. MIGRATION STATE"
ls prisma/migrations | tail -5
grep -c "userModified" prisma/migrations/20260822000000_tx_user_modified_sync_invariants/migration.sql
git log --oneline -3 -- prisma/migrations server/financial
git status --short -- prisma server lib | head -10 || true
