import { Client, GatewayIntentBits } from "discord.js";
import { onMessageCreate } from "./events/onMessageCreate";
import { onReady } from "./events/onReady";
import { onVoiceStateUpdate } from "./events/onVoiceStatusUpdate";
import g from "./globals";
import { getEnvironmentVariable } from "./util";

let client: Client | null = null;

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

  client = new Client({
    // An intent is needed for each type of data that we need Discord to send to us.
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

  client.on("ready", onReady);
  client.on("messageCreate", onMessageCreate);
  client.on("voiceStateUpdate", onVoiceStateUpdate);

  console.log("Logging in to Discord...");
  await client.login(discordToken);
}

export function discordShutdown(): void {
  if (client === null) {
    return;
  }

  client.destroy();
}
