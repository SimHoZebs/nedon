describe("basic", () => {

  it("user is created automatically", () => {
    cy.intercept("/api/trpc/user.getAll*").as("userGetAll");

    cy.visit("http://localhost:3000");
    cy.wait("@userGetAll");
    cy.get('.p-2 > .gap-x-2 > .hidden').should("not.be.empty");
  });

  it("transcations for the month is not empty", () => {
    cy.intercept("/api/trpc/transaction.getAll*").as("transactionGetAll");
    cy.visit("http://localhost:3000/transactions");
    cy.wait("@transactionGetAll");
    cy.get('div.max-w-sm').should("not.contain", " No transaction this month! That's a good thing, right?  ");
  });

});
