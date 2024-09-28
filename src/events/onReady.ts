import { assertDefined } from "complete-common";
import type { Client } from "discord.js";
import { ForumChannel } from "discord.js";
import { getGuildByName } from "../discordUtil.js";
import { getChannelIDByName } from "../discordUtilChannels.js";
import { QueueType } from "../enums/QueueType.js";
import { env } from "../env.js";
import { logger } from "../logger.js";
import { deleteEmptyVoiceChannels } from "../queueActions/deleteEmptyVoiceChannels.js";
import { onMessageCreate } from "./onMessageCreate.js";
import { onThreadCreate } from "./onThreadCreate.js";
import { onVoiceStateUpdate } from "./onVoiceStatusUpdate.js";

/** @see https://github.com/discordjs/discord.js/issues/10279 */
export async function onReady(client: Client<true>): Promise<void> {
  logger.info(
    `Connected to Discord with a username of: ${client.user.username}`,
  );

  const guild = getGuildByName(client, env.DISCORD_SERVER_NAME);
  if (guild === undefined) {
    throw new Error(
      `Failed to find Discord server: ${env.DISCORD_SERVER_NAME}`,
    );
  }
  logger.info(`Connected to Discord server: ${guild.name}`);

  // ----------------
  // Gather variables
  // ----------------

  const botID = client.user.id;
  const adminIDs = env.ADMIN_IDS.split(",");

  const questionForumID = getChannelIDByName(guild, "convention-questions");
  assertDefined(
    questionForumID,
    "Failed to find the channel ID of: convention-questions",
  );

  const proposalForumID = getChannelIDByName(guild, "convention-proposals");
  assertDefined(
    proposalForumID,
    "Failed to find the channel ID of: convention-proposals",
  );

  const voiceCategoryID = getChannelIDByName(guild, env.VOICE_CATEGORY_NAME);
  assertDefined(
    voiceCategoryID,
    `Failed to find the channel ID of: ${env.VOICE_CATEGORY_NAME}`,
  );

  const createNewVoiceChannelID = getChannelIDByName(
    guild,
    "Create New Voice Channel",
  );
  assertDefined(
    createNewVoiceChannelID,
    "Failed to find the channel ID of: Create New Voice Channel",
  );

  const conventionProposals = client.channels.cache.find(
    (channel) =>
      channel instanceof ForumChannel &&
      channel.name === "convention-proposals",
  ) as ForumChannel | undefined;
  assertDefined(
    conventionProposals,
    "Failed to find the channel: convention-proposals",
  );

  const openForDiscussionTag = conventionProposals.availableTags.find(
    (tag) => tag.name === "open-for-discussion",
  );
  assertDefined(
    openForDiscussionTag,
    "Failed to find the forum tag: open-for-discussion",
  );

  // Refresh the channel cache.
  await guild.channels.fetch();

  // ---------------------
  // Attach event handlers
  // ---------------------

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  client.on("messageCreate", async (message) => {
    await onMessageCreate(message, botID, adminIDs);
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  client.on("threadCreate", async (threadChannel) => {
    await onThreadCreate(
      threadChannel,
      questionForumID,
      proposalForumID,
      openForDiscussionTag.id,
    );
  });

  client.on("voiceStateUpdate", (oldState, newState) => {
    onVoiceStateUpdate(
      oldState,
      newState,
      client,
      voiceCategoryID,
      createNewVoiceChannelID,
    );
  });

  // ---------------------------
  // Perform initialization work
  // ---------------------------

  await deleteEmptyVoiceChannels({
    type: QueueType.DeleteEmptyVoiceChannels,
    guild,
    voiceCategoryID,
    createNewVoiceChannelID,
  });
}
