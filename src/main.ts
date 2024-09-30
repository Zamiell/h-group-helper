import { Client, Events, GatewayIntentBits } from "discord.js";
import sourceMapSupport from "source-map-support";
import { PROJECT_NAME } from "./constants.js";
import { env } from "./env.js";
import { onClientReady } from "./events/onClientReady.js";
import { logger } from "./logger.js";

await main();

async function main() {
  sourceMapSupport.install();
  logger.info(`${PROJECT_NAME} started.`);

  process.on("unhandledRejection", (error) => {
    logger.error("Unhandled promise rejection:", error);
  });

  await discordInit();
}

async function discordInit(): Promise<void> {
  const disconnectedClient = new Client({
    // An intent is needed for each type of data that we need Discord to send to us.
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers, // Needs "Server Members Intent" checked in the "Bot" menu.
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.MessageContent, // Needs "Message Content Intent" checked in the "Bot" menu.
    ],
  });

  disconnectedClient.on(Events.ShardError, (error) => {
    logger.error("Websocket connection encountered an error:", error);
  });

  // Other events are only attached once the client is connected.
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  disconnectedClient.on(Events.ClientReady, onClientReady);

  logger.info("Logging in to Discord...");
  await disconnectedClient.login(env.DISCORD_TOKEN);
}
