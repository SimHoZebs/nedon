import { Group, User } from "@prisma/client";
import { Tx } from "@prisma/client";
import { CounterpartyType, Transaction as PTx } from "plaid";
import { CatModel, SplitModel } from "prisma/zod";
import { z } from "zod";

export type UserClientSide = Omit<User, "ACCESS_TOKEN"> & {
  hasAccessToken: boolean;
  groupArray?: Group[]; //user loaded from groups
};

export type GroupClientSide = Group & {
  userArray?: UserClientSide[];
};

export type TreedCat = {
  name: string;
  subCatArray: TreedCat[];
};

export type TreedCatWithTx = {
  name: string;
  spending: number;
  received: number;
  txArray: FullTx[];
  subCatArray: TreedCatWithTx[];
};

export type MergedCat = Omit<CatClientSide, "splitId">;

export type CatClientSide = z.infer<typeof CatClientSideModel>;
export const CatClientSideModel = CatModel.extend({
  id: z.string().nullable(),
  splitId: z.string().nullable(),
});

export function isCatInSplitInDB(
  cat: CatClientSide,
): cat is z.infer<typeof CatModel> {
  return !!cat.splitId;
}

export function isSplitInDB(split: SplitClientSide): split is SplitInDB {
  return !!split.id;
}
export type SplitInDB = z.infer<typeof SplitInDBModel>;
const SplitInDBModel = SplitModel.extend({
  txId: z.string(),
  catArray: z.array(CatModel),
});

export type SplitClientSide = z.infer<typeof SplitClientSideModel>;
export const SplitClientSideModel = SplitModel.extend({
  txId: z.string().nullable(),
  id: z.string().nullable(),
  catArray: z.array(CatClientSideModel),
});

export function isFullTxInDB(
  tx: FullTx,
): tx is FullTxInDB {
  return !!tx.id;
}
export type FullTxInDB = Tx &
  PlaidTx & {
    id: string;
    splitArray: SplitClientSide[];
  };

export type FullTx = Omit<Tx, "id"> &
  PlaidTx & {
    id: string | null;
    splitArray: SplitClientSide[];
  };

export type TxInDB = Tx & {
  splitArray: SplitInDB[];
};

export function isPlaidTx(
  plaidTx: unknown,
): plaidTx is FullTx {
  return (plaidTx as FullTx).id !== undefined;
}
//temporary workaround for failing trpc queries
export interface PlaidTx extends PTx {
  location: {
    /**
     * The street address where the tx occurred.
     * @type {string}
     * @memberof Location
     */
    address: string | null;
    /**
     * The city where the tx occurred.
     * @type {string}
     * @memberof Location
     */
    city: string | null;
    /**
     * The region or state where the tx occurred. In API versions 2018-05-22 and earlier, this field is called `state`.
     * @type {string}
     * @memberof Location
     */
    region: string | null;
    /**
     * The postal code where the tx occurred. In API versions 2018-05-22 and earlier, this field is called `zip`.
     * @type {string}
     * @memberof Location
     */
    postal_code: string | null;
    /**
     * The ISO 3166-1 alpha-2 country code where the tx occurred.
     * @type {string}
     * @memberof Location
     */
    country: string | null;
    /**
     * The latitude where the tx occurred.
     * @type {number}
     * @memberof Location
     */
    lat: number | null;
    /**
     * The longitude where the tx occurred.
     * @type {number}
     * @memberof Location
     */
    lon: number | null;
    /**
     * The merchant defined store number where the tx occurred.
     * @type {string}
     * @memberof Location
     */
    store_number: string | null;
  };
  payment_meta: {
    /**
     * The tx reference number supplied by the financial institution.
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
     * For transfers, the party that is receiving the tx.
     * @type {string}
     * @memberof PaymentMeta
     */
    payee: string | null;
    /**
     * The party initiating a wire transfer. Will be `null` if the tx is not a wire transfer.
     * @type {string}
     * @memberof PaymentMeta
     */
    by_order_of: string | null;
    /**
     * For transfers, the party that is paying the tx.
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

  personal_finance_cat?: {
    /**
     * A high level cat that communicates the broad cat of the tx.
     * @type {string}
     * @memberof PersonalFinanceCat
     */
    primary: string;
    /**
     * A granular cat conveying the tx\'s intent. This field can also be used as a unique identifier for the cat.
     * @type {string}
     * @memberof PersonalFinanceCat
     */
    detailed: string;
  } | null;

  counterparties?: {
    /**
     * The name of the counterparty, such as the merchant or the financial institution, as extracted by Plaid from the raw description.
     * @type {string}
     * @memberof TxCounterparty
     */
    name: string;
    /**
     *
     * @type {CounterpartyType}
     * @memberof TxCounterparty
     */
    type: CounterpartyType;
    /**
     * The website associated with the counterparty.
     * @type {string}
     * @memberof TxCounterparty
     */
    website: string | null;
    /**
     * The URL of a logo associated with the counterparty, if available. The logo is formatted as a 100x100 pixel PNG filepath.
     * @type {string}
     * @memberof TxCounterparty
     */
    logo_url: string | null;
  }[];
}
