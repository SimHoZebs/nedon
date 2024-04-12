import React from "react";

import { trpc } from "@/util/trpc";

import "../../../../../styles/globals.css";
import Cat from "./Cat";

describe("<Cat />", () => {
  it("renders", () => {
    // see: https://on.cypress.io/mounting-react
    //
    const Test = trpc.withTRPC(Cat);

    cy.mount(<Test />);
  });
});
