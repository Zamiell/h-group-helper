import sourceMapSupport from "source-map-support";
import { PROJECT_NAME } from "./constants.js";
import { discordInit } from "./discord.js";
import { log } from "./log.js";

await main();

async function main() {
  sourceMapSupport.install();
  log.info(`${PROJECT_NAME} started.`);
  await discordInit();
}
