import type { Transaction } from "plaid";

declare global {
  namespace PrismaJson {
    type PlaidTx = Transaction;
  }
}
