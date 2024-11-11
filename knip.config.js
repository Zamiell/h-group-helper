// This is the configuration file for Knip:
// https://knip.dev/overview/configuration

// @ts-check

/** @type {import("knip").KnipConfig} */
const config = {
  ignore: [
    "eslint.config.mjs", // ESLint is provided by "complete-lint".
    "prettier.config.mjs", // Prettier is provided by "complete-lint".
  ],
  ignoreBinaries: [
    "tsx", // This is provided by "complete-lint".
  ],
  ignoreDependencies: [
    "complete-lint", // This is a linting meta-package.

    // @template-customization-start

    // Optional discord.js peer dependencies:
    // https://discord.js.org/docs/packages/discord.js/main
    "@discordjs/voice",
    "bufferutil",

    // @template-customization-end
  ],
};

export default config;
