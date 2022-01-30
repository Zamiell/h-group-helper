import * as dotenv from "dotenv";
import path from "path";
import sourceMapSupport from "source-map-support";
import { CWD, PROJECT_NAME } from "./constants";
import { discordInit, discordShutdown } from "./discord";
import { error } from "./util";

main().catch((err) => {
  error(`${PROJECT_NAME} failed:`, err);
});

async function main() {
  sourceMapSupport.install();
  loadEnvironmentVariables();
  printWelcomeMessage();
  await discordInit();
}

function loadEnvironmentVariables() {
  const envFile = path.join(CWD, ".env");
  dotenv.config({ path: envFile });
}

function printWelcomeMessage() {
  console.log(`${PROJECT_NAME} started.`);
}

process.on("SIGINT", () => {
  console.log("SIGINT detect; shutting down.");
  discordShutdown();
  process.exit();
});
