import { Group, User } from "@prisma/client";
import { Transaction } from "@prisma/client";
import { CounterpartyType, Transaction as PTransaction } from "plaid";
import { CategoryModel, SplitModel } from "prisma/zod";
import { z } from "zod";

export type UserClientSide = Omit<User, "ACCESS_TOKEN"> & {
  hasAccessToken: boolean;
  groupArray?: Group[]; //user loaded from groups
};

export type GroupClientSide = Group & {
  userArray?: UserClientSide[];
};

export type TreedCategory = {
  name: string;
  subCategoryArray: TreedCategory[];
};

export type TreedCategoryWithTransaction = {
  name: string;
  spending: number;
  received: number;
  transactionArray: FullTransaction[];
  subCategoryArray: TreedCategoryWithTransaction[];
};

export type MergedCategory = Omit<CategoryClientSide, "splitId">;

export type CategoryClientSide = z.infer<typeof CategoryClientSideModel>;
export const CategoryClientSideModel = CategoryModel.extend({
  id: z.string().nullable(),
  splitId: z.string().nullable(),
});

export function isCategoryInSplitInDB(
  category: CategoryClientSide,
): category is z.infer<typeof CategoryModel> {
  return !!category.splitId;
}

export function isSplitInDB(split: SplitClientSide): split is SplitInDB {
  return !!split.id;
}
export type SplitInDB = z.infer<typeof SplitInDBModel>;
const SplitInDBModel = SplitModel.extend({
  transactionId: z.string(),
  categoryArray: z.array(CategoryModel),
});

export type SplitClientSide = z.infer<typeof SplitClientSideModel>;
export const SplitClientSideModel = SplitModel.extend({
  transactionId: z.string().nullable(),
  id: z.string().nullable(),
  categoryArray: z.array(CategoryClientSideModel),
});

export function isFullTransactionInDB(
  transaction: FullTransaction,
): transaction is FullTransactionInDB {
  return !!transaction.id;
}
export type FullTransactionInDB = Transaction &
  PlaidTransaction & {
    id: string;
    splitArray: SplitClientSide[];
  };

export type FullTransaction = Omit<Transaction, "id"> &
  PlaidTransaction & {
    id: string | null;
    splitArray: SplitClientSide[];
  };

export type TransactionInDB = Transaction & {
  splitArray: SplitInDB[];
};

export function isPlaidTransaction(
  plaidTransaction: unknown,
): plaidTransaction is FullTransaction {
  return (plaidTransaction as FullTransaction).id !== undefined;
}
//temporary workaround for failing trpc queries
export interface PlaidTransaction extends PTransaction {
  location: {
    /**
     * The street address where the transaction occurred.
     * @type {string}
     * @memberof Location
     */
    address: string | null;
    /**
     * The city where the transaction occurred.
     * @type {string}
     * @memberof Location
     */
    city: string | null;
    /**
     * The region or state where the transaction occurred. In API versions 2018-05-22 and earlier, this field is called `state`.
     * @type {string}
     * @memberof Location
     */
    region: string | null;
    /**
     * The postal code where the transaction occurred. In API versions 2018-05-22 and earlier, this field is called `zip`.
     * @type {string}
     * @memberof Location
     */
    postal_code: string | null;
    /**
     * The ISO 3166-1 alpha-2 country code where the transaction occurred.
     * @type {string}
     * @memberof Location
     */
    country: string | null;
    /**
     * The latitude where the transaction occurred.
     * @type {number}
     * @memberof Location
     */
    lat: number | null;
    /**
     * The longitude where the transaction occurred.
     * @type {number}
     * @memberof Location
     */
    lon: number | null;
    /**
     * The merchant defined store number where the transaction occurred.
     * @type {string}
     * @memberof Location
     */
    store_number: string | null;
  };
  payment_meta: {
    /**
     * The transaction reference number supplied by the financial institution.
     * @type {string}
     * @memberof PaymentMeta
     */
    reference_number: string | null;
    /**
     * The ACH PPD ID for the payer.
     * @type {string}
     * @memberof PaymentMeta
     */
    ppd_id: string | null;
    /**
     * For transfers, the party that is receiving the transaction.
     * @type {string}
     * @memberof PaymentMeta
     */
    payee: string | null;
    /**
     * The party initiating a wire transfer. Will be `null` if the transaction is not a wire transfer.
     * @type {string}
     * @memberof PaymentMeta
     */
    by_order_of: string | null;
    /**
     * For transfers, the party that is paying the transaction.
     * @type {string}
     * @memberof PaymentMeta
     */
    payer: string | null;
    /**
     * The type of transfer, e.g. \'ACH\'
     * @type {string}
     * @memberof PaymentMeta
     */
    payment_method: string | null;
    /**
     * The name of the payment processor
     * @type {string}
     * @memberof PaymentMeta
     */
    payment_processor: string | null;
    /**
     * The payer-supplied description of the transfer.
     * @type {string}
     * @memberof PaymentMeta
     */
    reason: string | null;
  };

  personal_finance_category?: {
    /**
     * A high level category that communicates the broad category of the transaction.
     * @type {string}
     * @memberof PersonalFinanceCategory
     */
    primary: string;
    /**
     * A granular category conveying the transaction\'s intent. This field can also be used as a unique identifier for the category.
     * @type {string}
     * @memberof PersonalFinanceCategory
     */
    detailed: string;
  } | null;

  counterparties?: {
    /**
     * The name of the counterparty, such as the merchant or the financial institution, as extracted by Plaid from the raw description.
     * @type {string}
     * @memberof TransactionCounterparty
     */
    name: string;
    /**
     *
     * @type {CounterpartyType}
     * @memberof TransactionCounterparty
     */
    type: CounterpartyType;
    /**
     * The website associated with the counterparty.
     * @type {string}
     * @memberof TransactionCounterparty
     */
    website: string | null;
    /**
     * The URL of a logo associated with the counterparty, if available. The logo is formatted as a 100x100 pixel PNG filepath.
     * @type {string}
     * @memberof TransactionCounterparty
     */
    logo_url: string | null;
  }[];
}
