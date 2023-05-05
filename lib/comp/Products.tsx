import React, { useState } from "react";

import Endpoint from "./Endpoint";
import {
  transactionsCategories,
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
  transformAuthData,
  transformTransactionsData,
  transformBalanceData,
  transformInvestmentsData,
  transformInvestmentTransactionsData,
  transformLiabilitiesData,
  transformIdentityData,
  transformPaymentData,
  transformAssetsData,
  transformTransferData,
  transformIncomePaystubsData,
  Data,
} from "../util/dataUtil";
import { useStoreState } from "../util/store";
import { trpc } from "../util/trpc";
import Button from "./Button";
import { Transaction } from "plaid";

const Products = () => {
  const { products, user } = useStoreState((state) => state);
  const server = trpc.useContext();
  const [data, setData] = useState<Transaction[]>([]);
  const [transformedData, setTransformedData] = useState<Data>([]);

  return (
    <div>
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
        <Endpoint
          endpoint="auth"
          name="Auth"
          categories={authCategories}
          schema="/auth/get/"
          description="Retrieve account and routing numbers for checking and savings accounts."
          transformData={transformAuthData}
        />
      )}

      {products.includes("transactions") && (
        <>
          <div className="flex w-full justify-between">
            <div>
              <p>
                Retrieve transactions or incremental updates for credit and
                depository accounts.
              </p>

              <Button
                onClick={async () => {
                  const transactions = (await server.transactions.fetch({
                    id: user.id,
                  })) as Transaction[] | null;
                  if (!transactions) return;
                  setData(transactions);
                  const transformedTranasctionData =
                    transformTransactionsData(transactions);
                  setTransformedData(transformedTranasctionData);
                }}
              >
                Transactions
              </Button>
            </div>

            <div>
              <div>Response</div>
              {transformedData.map((transaction, index) => (
                <div key={index}>{JSON.stringify(transaction, null, 2)}</div>
              ))}
            </div>
          </div>
        </>
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
    </div>
  );
};

Products.displayName = "Products";

export default Products;
