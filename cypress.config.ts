import { defineConfig } from "cypress";
import * as dotenv from "dotenv";
const {
  beforeRunHook,
  afterRunHook,
} = require("cypress-mochawesome-reporter/lib");

dotenv.config();

export default defineConfig({
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "cypress/reports",
    charts: true,
    reportPageTitle: "Report for SauceDemo",
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
    html: true,
    json: false,
    overwrite: false,
  },
  e2e: {
    env: {
      token: process.env.token,
    },
    baseUrl: "https://gorest.co.in/public/v2",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.ts",
    setupNodeEvents(on, config) {
      return config;
      on("before:run", async (details) => {
        console.log("override before:run");
        await beforeRunHook(details);
      });

      on("after:run", async () => {
        console.log("override after:run");
        await afterRunHook();
      });
    },
  },
});
