// This is the configuration file for Knip:
// https://knip.dev/overview/configuration

// @ts-check

/** @type {import("knip").KnipConfig} */
const config = {
  eslint: {},
  prettier: {},

  ignoreDependencies: [
    "complete-lint", // This is a linting meta-package.
    "eslint", // Provided by "complete-lint".
    "eslint-config-complete", // Provided by "complete-lint".
    "prettier", // Provided by "complete-lint".
    "prettier-plugin-organize-imports", // Provided by "complete-lint".
    "prettier-plugin-packagejson", // Provided by "complete-lint".

    // @template-customization-start

    // Optional discord.js peer dependencies:
    // https://discord.js.org/docs/packages/discord.js/main
    "@discordjs/voice",

    // @template-customization-end
  ],
};

export default config;
