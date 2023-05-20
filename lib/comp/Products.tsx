import React from "react";

import Endpoint from "./Endpoint";
import {
  authCategories,
  identityCategories,
  balanceCategories,
  investmentsCategories,
  investmentsTransactionsCategories,
  liabilitiesCategories,
  paymentCategories,
  assetsCategories,
  incomePaystubsCategories,
  transferCategories,
  transformBalanceData,
  transformInvestmentsData,
  transformInvestmentTransactionsData,
  transformLiabilitiesData,
  transformIdentityData,
  transformPaymentData,
  transformAssetsData,
  transformTransferData,
  transformIncomePaystubsData,
} from "../util/dataUtil";
import { useStoreState } from "../util/store";
import { trpc } from "../util/trpc";
import NewEndpoint from "./NewEndpoint";

const Products = () => {
  const { products, user } = useStoreState((state) => state);

  const auth = trpc.auth.useQuery(
    { id: user.id },
    { staleTime: 3600000, enabled: false }
  );
  const getAllTransaction = trpc.transaction.getAll.useQuery(
    { id: user.id },
    { staleTime: 3600000, enabled: false }
  );

  return (
    <section className="flex flex-col gap-y-3">
      {products.includes("payment_initiation") && (
        <Endpoint
          endpoint="payment"
          name="Payment"
          categories={paymentCategories}
          schema="/payment/get/"
          description="Retrieve information about your latest payment."
          transformData={transformPaymentData}
        />
      )}

      {products.includes("auth") && (
        <NewEndpoint
          desc="Retrieve account and routing numbers for checking and savings accounts."
          getData={async () => (await auth.refetch()).data}
        >
          Auth
        </NewEndpoint>
      )}

      {products.includes("transactions") && (
        <NewEndpoint
          desc="Retrieve transactions or incremental updates for credit and depository accounts."
          getData={async () => (await getAllTransaction.refetch()).data}
        >
          Transaction
        </NewEndpoint>
      )}

      {products.includes("identity") && (
        <Endpoint
          endpoint="identity"
          name="Identity"
          categories={identityCategories}
          schema="/identity/get/"
          description="Retrieve Identity information on file with the bank. Reduce
              fraud by comparing user-submitted data to validate identity."
          transformData={transformIdentityData}
        />
      )}

      {products.includes("assets") && (
        <Endpoint
          endpoint="assets"
          name="Assets"
          categories={assetsCategories}
          schema="/assets_report/get/"
          description="Create and retrieve assets information an asset report"
          transformData={transformAssetsData}
        />
      )}
      {!products.includes("payment_initiation") && (
        <Endpoint
          endpoint="balance"
          name="Balance"
          categories={balanceCategories}
          schema="/accounts/balance/get/"
          description="Check balances in real time to prevent non-sufficient funds
        fees."
          transformData={transformBalanceData}
        />
      )}
      {products.includes("investments") && (
        <>
          <Endpoint
            endpoint="holdings"
            name="Investments"
            categories={investmentsCategories}
            schema="/investments/holdings/get/"
            description="Retrieve investment holdings on file with the bank,
        brokerage, or investment institution. Analyze over-exposure
        to market segments."
            transformData={transformInvestmentsData}
          />
          <Endpoint
            endpoint="investments_transactions"
            name="Investments Transactions"
            categories={investmentsTransactionsCategories}
            schema="/investments/transactions/get"
            description="Retrieve investment transactions on file with the bank,
        brokerage, or investments institution."
            transformData={transformInvestmentTransactionsData}
          />
          <Endpoint
            endpoint="liabilities"
            name="Liabilities"
            categories={liabilitiesCategories}
            schema="/liabilities/get"
            description="Retrieve liabilities and various details about an Item with loan or credit accounts."
            transformData={transformLiabilitiesData}
          />
        </>
      )}
      {products.includes("transfer") && (
        <Endpoint
          endpoint="transfer"
          name="Transfer"
          categories={transferCategories}
          schema="/transfer/get/"
          description="Retrieve information about your latest ACH Transfer."
          transformData={transformTransferData}
        />
      )}
      {products.includes("income_verification") && (
        <Endpoint
          endpoint="/income/verification/paystubs"
          name="Income Paystubs"
          categories={incomePaystubsCategories}
          schema="/income/verification/paystubs"
          description="(Deprecated) Retrieve information from the paystubs used for income verification"
          transformData={transformIncomePaystubsData}
        />
      )}
    </section>
  );
};

Products.displayName = "Products";

export default Products;
