import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
  },

  watchForFileChanges: false,

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});
