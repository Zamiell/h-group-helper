import type { Client, Guild } from "discord.js";
import { getGuildByName } from "../discordUtil.js";
import { getChannelIDByName } from "../discordUtilChannels.js";
import { QueueType } from "../enums/QueueType.js";
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
  await deleteEmptyVoiceChannels({
    type: QueueType.DeleteEmptyVoiceChannels,
    guild,
  });
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
      `Failed to find the channel ID of: ${env.VOICE_CATEGORY_NAME}`,
    );
  }
  g.voiceCategoryID = categoryID;

  const voiceChannelID = getChannelIDByName(guild, env.VOICE_JOIN_CHANNEL_NAME);
  if (voiceChannelID === undefined) {
    throw new Error(
      `Failed to find the channel ID of: ${env.VOICE_JOIN_CHANNEL_NAME}`,
    );
  }
  g.voiceJoinChannelID = voiceChannelID;

  const questionForumID = getChannelIDByName(guild, env.QUESTION_FORUM_NAME);
  if (questionForumID === undefined) {
    throw new Error(
      `Failed to find the channel ID of: ${env.QUESTION_FORUM_NAME}`,
    );
  }
  g.questionForumID = questionForumID;

  const proposalForumID = getChannelIDByName(guild, env.PROPOSAL_FORUM_NAME);
  if (proposalForumID === undefined) {
    throw new Error(
      `Failed to find the channel ID of: ${env.PROPOSAL_FORUM_NAME}`,
    );
  }
  g.proposalForumID = proposalForumID;

  g.adminIDs = env.ADMIN_IDS.split(",");

  // Store our user ID for later.
  g.botID = client.user.id;

  return guild;
}
