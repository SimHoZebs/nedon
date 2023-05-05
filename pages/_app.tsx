import "../styles/globals.css";
import type { AppType } from "next/app";
import { trpc } from "../lib/util/trpc";
import store from "../lib/util/store";
import { StoreProvider } from "easy-peasy";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Layout from "../lib/comp/Layout";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <StoreProvider store={store}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </StoreProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

export default trpc.withTRPC(MyApp);
