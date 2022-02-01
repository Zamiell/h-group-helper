import { Client, Intents } from "discord.js";
import { onMessageCreate } from "./events/onMessageCreate";
import { onReady } from "./events/onReady";
import { onVoiceStateUpdate } from "./events/onVoiceStatusUpdate";
import g from "./globals";
import { getEnvironmentVariables } from "./util";

let client: Client | null = null;

export async function discordInit() {
  const [
    discordToken,
    discordServerName,
    voiceCategoryName,
    voiceJoinChannelName,
    questionChannelName,
    adminIDsString,
  ] = getEnvironmentVariables([
    "DISCORD_TOKEN",
    "DISCORD_SERVER_NAME",
    "VOICE_CATEGORY_NAME",
    "VOICE_JOIN_CHANNEL_NAME",
    "QUESTION_CHANNEL_NAME",
    "ADMIN_IDS",
  ]);
  g.discordServerName = discordServerName;
  g.voiceCategoryName = voiceCategoryName;
  g.voiceJoinChannelName = voiceJoinChannelName;
  g.questionChannelName = questionChannelName;
  g.adminIDs = adminIDsString.split(",");

  client = new Client({
    // An intent is needed for each type of data that we need Discord to send to us
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_VOICE_STATES,
    ],
  });

  client.on("ready", onReady);
  client.on("messageCreate", onMessageCreate);
  client.on("voiceStateUpdate", onVoiceStateUpdate);

  console.log("Logging in to Discord...");
  await client.login(discordToken);
}

export function discordShutdown() {
  if (client === null) {
    return;
  }

  client.destroy();
}
