import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppType } from "next/app";

import Layout from "@/comp/Layout";

import { trpc } from "@/util/trpc";

import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

export default trpc.withTRPC(MyApp);
