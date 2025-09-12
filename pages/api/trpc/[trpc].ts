import { baseRouter } from "../../../server/routers/_app";

import * as trpcNext from "@trpc/server/adapters/next";

// export API handler
// @see https://trpc.io/docs/api-handler
export default trpcNext.createNextApiHandler({
  router: baseRouter,
  createContext: () => ({}),
});
