import sourceMapSupport from "source-map-support";
import { PROJECT_NAME } from "./constants.js";
import { discordInit } from "./discord.js";
import { logger } from "./logger.js";

await main();

async function main() {
  sourceMapSupport.install();
  logger.info(`${PROJECT_NAME} started.`);
  await discordInit();
}
