import * as dotenv from "dotenv";
import path from "path";
import sourceMapSupport from "source-map-support";
import { CWD, PROJECT_NAME } from "./constants";
import { discordInit, discordShutdown } from "./discord";
import * as file from "./file";
import { log } from "./log";
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

  error('Failed to find the ".env" file.');
}

function printWelcomeMessage() {
  log.info(`${PROJECT_NAME} started.`);
}

process.on("SIGINT", () => {
  log.info("SIGINT detected; shutting down.");
  discordShutdown();
  process.exit();
});
