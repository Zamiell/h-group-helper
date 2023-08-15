import { client, initDiscordClient } from "./client.js";
import { onMessageCreate } from "./events/onMessageCreate.js";
import { onReady } from "./events/onReady.js";
import { onVoiceStateUpdate } from "./events/onVoiceStatusUpdate.js";
import g from "./globals.js";
import { log } from "./log.js";
import { getEnvironmentVariable } from "./utils.js";

export async function discordInit(): Promise<void> {
  const discordToken = getEnvironmentVariable("DISCORD_TOKEN");
  const discordServerName = getEnvironmentVariable("DISCORD_SERVER_NAME");
  const voiceCategoryName = getEnvironmentVariable("VOICE_CATEGORY_NAME");
  const voiceJoinChannelName = getEnvironmentVariable(
    "VOICE_JOIN_CHANNEL_NAME",
  );
  const questionChannelName = getEnvironmentVariable("QUESTION_CHANNEL_NAME");
  const adminIDsString = getEnvironmentVariable("ADMIN_IDS");

  g.discordServerName = discordServerName;
  g.voiceCategoryName = voiceCategoryName;
  g.voiceJoinChannelName = voiceJoinChannelName;
  g.questionChannelName = questionChannelName;
  g.adminIDs = adminIDsString.split(",");

  initDiscordClient();
  if (client === null) {
    return;
  }

  client.on("ready", onReady);
  client.on("messageCreate", onMessageCreate);
  client.on("voiceStateUpdate", onVoiceStateUpdate);

  log.info("Logging in to Discord...");
  await client.login(discordToken);
}

export function discordShutdown(): void {
  if (client === null) {
    return;
  }

  client.destroy();
}
