import { assertDefined } from "complete-common";
import type { Client } from "discord.js";
import { Events, ForumChannel } from "discord.js";
import { getChannelIDByName } from "../discordUtils.js";
import { QueueType } from "../enums/QueueType.js";
import { env } from "../env.js";
import { logger } from "../logger.js";
import { deleteEmptyVoiceChannels } from "../queueActions/deleteEmptyVoiceChannels.js";
import { onInteractionCreate } from "./onInteractionCreate.js";
import { onMessageCreate } from "./onMessageCreate.js";
import { onThreadCreate } from "./onThreadCreate.js";
import { onVoiceStateUpdate } from "./onVoiceStatusUpdate.js";

/** @see https://github.com/discordjs/discord.js/issues/10279 */
export async function onClientReady(client: Client<true>): Promise<void> {
  logger.info(
    `Connected to Discord with a username of: ${client.user.username}`,
  );

  const guild = await client.guilds.fetch(env.DISCORD_SERVER_ID);
  logger.info(`Connected to Discord server: ${guild.name}`);

  // ----------------
  // Gather variables
  // ----------------

  const voiceCategoryID = getChannelIDByName(guild, env.VOICE_CATEGORY_NAME);
  assertDefined(
    voiceCategoryID,
    `Failed to find the channel ID of: ${env.VOICE_CATEGORY_NAME}`,
  );

  const adminIDs = env.ADMIN_IDS.split(",");
  if (adminIDs.length === 0) {
    throw new Error(
      'Failed to find at least one admin in the "ADMIN_IDS" environment variable.',
    );
  }

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
  client.on(Events.InteractionCreate, async (interaction) => {
    await onInteractionCreate(interaction, adminIDs);
  });

  client.on(Events.MessageCreate, (message) => {
    onMessageCreate(message);
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  client.on(Events.ThreadCreate, async (threadChannel) => {
    await onThreadCreate(
      threadChannel,
      questionForumID,
      proposalForumID,
      openForDiscussionTag.id,
    );
  });

  client.on(Events.VoiceStateUpdate, (oldState, newState) => {
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
