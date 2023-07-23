import { User, Group } from "@prisma/client";
import { CounterpartyType, Transaction } from "plaid";
import { CategoryModel, SplitModel, TransactionModel } from "prisma/zod";
import { z } from "zod";

export type UserClientSide = Omit<User, "ACCESS_TOKEN"> & {
  hasAccessToken: boolean;
  groupArray?: Group[]; //user loaded from groups
};

export type GroupClientSide = Group & {
  userArray?: UserClientSide[];
};

export type UnsavedCategoryInUnsavedSplit = z.infer<
  typeof unsavedCategoryInUnsavedSplit
>;
export const unsavedCategoryInUnsavedSplit = CategoryModel.extend({
  id: z.null(),
  splitId: z.null(),
});

export type UnsavedCategoryInSplitInDB = z.infer<
  typeof unsavedCategoryInSplitInDB
>;
export const unsavedCategoryInSplitInDB = CategoryModel.extend({
  id: z.null(),
  splitId: z.string(),
});

export type UnsavedCategory = z.infer<typeof unsavedCategory>;
const unsavedCategory = z.union([
  unsavedCategoryInUnsavedSplit,
  unsavedCategoryInSplitInDB,
]);

export type CategoryInSplitInDB = z.infer<typeof categoryInSplitInDB>;
export const categoryInSplitInDB = CategoryModel.extend({
  id: z.string().nullable(),
  splitId: z.string(),
});

export type CategoryClientside = z.infer<typeof categoryClientside>;
export const categoryClientside = z.union([
  unsavedCategoryInUnsavedSplit,
  categoryInSplitInDB,
]);

export type UnsavedSplit = z.infer<typeof unsavedSplit>;
export const unsavedSplit = SplitModel.extend({
  id: z.null(),
  categoryArray: z.array(unsavedCategoryInUnsavedSplit),
});

export type SplitInDB = z.infer<typeof splitInDB>;
export const splitInDB = SplitModel.extend({
  categoryArray: z.array(categoryInSplitInDB),
});

export type SplitClientSide = z.infer<typeof SplitClientSide>;
export const SplitClientSide = z.union([splitInDB, unsavedSplit]);

export type MergedCategory = Omit<CategoryClientside, "splitId">;

export type TransactionInDB = z.infer<typeof transactionInDB>;
const transactionInDB = TransactionModel.extend({
  splitArray: z.array(z.union([splitInDB, unsavedSplit])),
  inDB: z.literal(true),
});

export type UnsavedTransaction = z.infer<typeof unsavedTransaction>;
const unsavedTransaction = TransactionModel.extend({
  splitArray: z.array(unsavedSplit),
  inDB: z.literal(false),
});

const transactionClientside = z.union([transactionInDB, unsavedTransaction]);

export type FullTransaction<T = z.infer<typeof transactionClientside>> = Omit<
  PlaidTransaction,
  "category"
> &
  T;

export type HierarchicalCategoryWithTransaction = {
  name: string;
  spending: number;
  received: number;
  transactionArray: FullTransaction[];
  subCategoryArray: HierarchicalCategoryWithTransaction[];
};

export type HierarchicalCategory = {
  name: string;
  subCategoryArray: HierarchicalCategory[];
};

//temporary workaround for failing trpc queries
interface PlaidTransaction extends Transaction {
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
