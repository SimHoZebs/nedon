describe("basic", () => {
  beforeEach(() => {
    cy.intercept("/api/trpc/*").as("trpc");
  });

  it("delete user", () => {
    cy.get('.p-2 > .gap-x-2 > .hidden').should("not.be.empty").click();
    cy.contains("DELETE").click();
    cy.wait("@trpc");
  });

  it("user is created automatically", () => {
    cy.visit("http://localhost:3000");
    cy.wait("@trpc");
    cy.get('.p-2 > .gap-x-2 > .hidden').should("not.be.empty");
  });

  it("transcations for the month is not empty", () => {
    cy.visit("http://localhost:3000/transactions");
    cy.wait("@trpc");
    cy.get('div.max-w-sm').should("not.contain", " No transaction this month! That's a good thing, right?  ");
  });

  it("add a friend", () => {
    cy.visit("http://localhost:3000/transactions");
    cy.wait("@trpc");
    cy.contains('Add friend').click();
    cy.contains('create user').click();
    cy.wait("@trpc");
    //should have just ONE user show up in the list of selection
    cy.get(".justify-between").should("have.length", 1);
    //should have a blue 'add user' icon show up
    //click on it
    //user data should update to include the new user in their group and the new user should also have the current user in their group
  });

});
