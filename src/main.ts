import { Client, GatewayIntentBits } from "discord.js";
import sourceMapSupport from "source-map-support";
import { PROJECT_NAME } from "./constants.js";
import { env } from "./env.js";
import { onReady } from "./events/onReady.js";
import { logger } from "./logger.js";

await main();

async function main() {
  sourceMapSupport.install();
  logger.info(`${PROJECT_NAME} started.`);

  await discordInit();
}

async function discordInit(): Promise<void> {
  const disconnectedClient = new Client({
    // An intent is needed for each type of data that we need Discord to send to us.
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.MessageContent,
    ],
  });

  // Other events are only attached once the client is connected.
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  disconnectedClient.on("ready", onReady);

  logger.info("Logging in to Discord...");
  await disconnectedClient.login(env.DISCORD_TOKEN);
}
