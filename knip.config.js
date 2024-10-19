// This is the configuration file for Knip:
// https://knip.dev/overview/configuration

// @ts-check

/** @type {import("knip").KnipConfig} */
const config = {
  ignore: ["eslint.config.mjs", "prettier.config.mjs"],
  ignoreBinaries: [
    "tsx", // This is provided by "complete-lint".
  ],
  ignoreDependencies: [
    "complete-lint", // This is a linting meta-package.
    "complete-tsconfig", // This is provided by "complete-lint".

    // @template-customization-start

    // Optional discord.js peer dependencies:
    // https://discord.js.org/docs/packages/discord.js/main
    "@discordjs/voice",
    "bufferutil",
    "zlib-sync",

    "husky", // Bug in Knip?

    // @template-customization-end
  ],
};

export default config;
