import { mount } from "cypress/react";
import "styles/globals.css";

import { trpc } from "@/util/trpc";

import Cat from "./Cat";

describe("<Cat />", () => {
  it("renders", () => {
    // see: https://on.cypress.io/mounting-react
    //
    const Test = trpc.withTRPC(Cat);

    mount(<Test />);
  });
});
