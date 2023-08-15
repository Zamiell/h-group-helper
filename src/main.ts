import * as dotenv from "dotenv";
import path from "node:path";
import sourceMapSupport from "source-map-support";
import { CWD, PROJECT_NAME } from "./constants.js";
import { discordInit, discordShutdown } from "./discord.js";
import * as file from "./file.js";
import { log } from "./log.js";

main().catch((error) => {
  throw new Error(`${PROJECT_NAME} failed: ${error}`);
});

async function main() {
  sourceMapSupport.install();
  loadEnvironmentVariables();
  printWelcomeMessage();
  await discordInit();
}

function loadEnvironmentVariables() {
  const envFilePath = getEnvFilePath();
  dotenv.config({ path: envFilePath });
}

function getEnvFilePath(): string {
  const developmentEnvFilePath = path.join(CWD, ".env");
  if (file.exists(developmentEnvFilePath)) {
    return developmentEnvFilePath;
  }

  const productionEnvFilePath = path.join(__dirname, "..", ".env");
  if (file.exists(productionEnvFilePath)) {
    return productionEnvFilePath;
  }

  throw new Error('Failed to find the ".env" file.');
}

function printWelcomeMessage() {
  log.info(`${PROJECT_NAME} started.`);
}

process.on("SIGINT", () => {
  log.info("SIGINT detected; shutting down.");
  discordShutdown();
  process.exit();
});
