import { client } from "./client.js";
import { env } from "./env.js";
import { onMessageCreate } from "./events/onMessageCreate.js";
import { onReady } from "./events/onReady.js";
import { onVoiceStateUpdate } from "./events/onVoiceStatusUpdate.js";
import { logger } from "./logger.js";

export async function discordInit(): Promise<void> {
  client.on("ready", onReady);
  client.on("messageCreate", onMessageCreate);
  client.on("voiceStateUpdate", onVoiceStateUpdate);

  logger.info("Logging in to Discord...");
  await client.login(env.DISCORD_TOKEN);
}
