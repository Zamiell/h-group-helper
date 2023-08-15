import type { Client, Guild } from "discord.js";
import { getGuildByName } from "../discordUtil.js";
import { getChannelIDByName } from "../discordUtilChannels.js";
import { env } from "../env.js";
import { g } from "../globals.js";
import { logger } from "../logger.js";
import { deleteEmptyVoiceChannels } from "../queueActions/deleteEmptyVoiceChannels.js";

export async function onReady(client: Client): Promise<void> {
  if (client.user === null) {
    throw new Error("Failed to connect to Discord.");
  }

  logger.info(
    `Connected to Discord with a username of: ${client.user.username}`,
  );

  const guild = initDiscordVariables(client);
  await deleteEmptyVoiceChannels(guild);
}

function initDiscordVariables(client: Client): Guild {
  if (client.user === null) {
    throw new Error("Failed to connect to Discord.");
  }

  const guild = getGuildByName(client, env.DISCORD_SERVER_NAME);
  if (guild === undefined) {
    throw new Error(
      `Failed to find Discord server: ${env.DISCORD_SERVER_NAME}`,
    );
  }
  logger.info(`Connected to Discord server: ${guild.name}`);

  const categoryID = getChannelIDByName(guild, env.VOICE_CATEGORY_NAME);
  if (categoryID === undefined) {
    throw new Error(
      `Failed to find the voice category of: ${env.VOICE_CATEGORY_NAME}`,
    );
  }
  g.voiceCategoryID = categoryID;

  const voiceChannelID = getChannelIDByName(guild, env.VOICE_JOIN_CHANNEL_NAME);
  if (voiceChannelID === undefined) {
    throw new Error(
      `Failed to find the voice channel of: ${env.VOICE_JOIN_CHANNEL_NAME}`,
    );
  }
  g.voiceJoinChannelID = voiceChannelID;

  const textChannelID = getChannelIDByName(guild, env.QUESTION_CHANNEL_NAME);
  if (textChannelID === undefined) {
    throw new Error(
      `Failed to find the text channel of: ${env.QUESTION_CHANNEL_NAME}`,
    );
  }
  g.questionChannelID = textChannelID;

  g.adminIDs = env.ADMIN_IDS.split(",");

  // Store our user ID for later.
  g.botID = client.user.id;

  return guild;
}
