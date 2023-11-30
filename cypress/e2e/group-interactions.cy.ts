describe("basic", () => {
  beforeEach(() => {
    cy.intercept("/api/trpc/*").as("trpc");
    cy.intercept("/api/trpc/group*").as("group");
  });

  it("delete user", () => {
    cy.visit("http://localhost:3000/transactions");
    cy.get('.p-2 > .gap-x-2 > .hidden').should("not.be.empty").click();
    cy.contains("DELETE").click();
    cy.wait("@trpc");
  });

  it("add a friend", () => {
    cy.visit("http://localhost:3000/transactions");
    cy.wait("@trpc");
    cy.contains('Add friend').click();
    cy.contains('create user').click();
    cy.wait("@trpc");
    cy.wait("@group");

    //should have just ONE user show up in the list of selection
    //should have a blue 'add user' icon show up
    //click on it
    cy.get(".justify-between").should("have.length", 1).find('[class*="icon-[mdi--user-add-outline]"]').should("exist").click();

    //user data should update to include the new user in their group and the new user should also have the current user in their group
  });

});
