import Layout from "@/comp/global/Layout";

import { trpc } from "@/util/trpc";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppType } from "next/app";

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
