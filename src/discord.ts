import { client } from "./client.js";
import { env } from "./env.js";
import { onMessageCreate } from "./events/onMessageCreate.js";
import { onReady } from "./events/onReady.js";
import { onThreadCreate } from "./events/onThreadCreate.js";
import { onVoiceStateUpdate } from "./events/onVoiceStatusUpdate.js";
import { logger } from "./logger.js";

/** @see https://github.com/discordjs/discord.js/issues/10279 */
export async function discordInit(): Promise<void> {
  client.on("ready", onReady); // eslint-disable-line @typescript-eslint/no-misused-promises
  client.on("messageCreate", onMessageCreate); // eslint-disable-line @typescript-eslint/no-misused-promises
  client.on("threadCreate", onThreadCreate); // eslint-disable-line @typescript-eslint/no-misused-promises
  client.on("voiceStateUpdate", onVoiceStateUpdate);

  logger.info("Logging in to Discord...");
  await client.login(env.DISCORD_TOKEN);
}
