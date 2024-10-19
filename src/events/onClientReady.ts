import { assertDefined } from "complete-common";
import type { Client } from "discord.js";
import { Events, ForumChannel } from "discord.js";
import { getChannelIDByName, getRoleIDByName } from "../discordUtils.js";
import { QueueType } from "../enums/QueueType.js";
import { env } from "../env.js";
import { logger } from "../logger.js";
import { deleteEmptyVoiceChannels } from "../queueActions/deleteEmptyVoiceChannels.js";
import { onInteractionCreate } from "./onInteractionCreate.js";
import { onMessageCreate } from "./onMessageCreate.js";
import { onThreadCreate } from "./onThreadCreate.js";
import { onVoiceStateUpdate } from "./onVoiceStatusUpdate.js";

const VOICE_CATEGORY_NAME = "H-Group Pickup Games";
const CREATE_NEW_VOICE_CHANNEL_NAME = "Create New Voice Channel";
const CONVENTION_QUESTIONS_FORUM_NAME = "convention-questions";
const CONVENTION_PROPOSALS_FORUM_NAME = "convention-proposals";
const CONVENTION_ADMIN_ROLE_NAME = "Convention Admin";

export async function onClientReady(client: Client<true>): Promise<void> {
  logger.info(
    `Connected to Discord with a username of: ${client.user.username}`,
  );

  const guild = await client.guilds.fetch(env.DISCORD_SERVER_ID);
  logger.info(`Connected to Discord server: ${guild.name}`);

  // ----------------
  // Gather variables
  // ----------------

  // Refresh the role and channel caches.
  await guild.roles.fetch();
  await guild.channels.fetch();

  const voiceCategoryID = getChannelIDByName(guild, VOICE_CATEGORY_NAME);
  assertDefined(
    voiceCategoryID,
    `Failed to find the channel ID of: ${VOICE_CATEGORY_NAME}`,
  );

  const createNewVoiceChannelID = getChannelIDByName(
    guild,
    CREATE_NEW_VOICE_CHANNEL_NAME,
  );
  assertDefined(
    createNewVoiceChannelID,
    `Failed to find the channel ID of: ${CREATE_NEW_VOICE_CHANNEL_NAME}`,
  );

  const conventionQuestionsForumID = getChannelIDByName(
    guild,
    CONVENTION_QUESTIONS_FORUM_NAME,
  );
  assertDefined(
    conventionQuestionsForumID,
    `Failed to find the channel ID of: ${CONVENTION_QUESTIONS_FORUM_NAME}`,
  );

  const conventionProposals = client.channels.cache.find(
    (channel) =>
      channel instanceof ForumChannel &&
      channel.name === CONVENTION_PROPOSALS_FORUM_NAME,
  ) as ForumChannel | undefined;
  assertDefined(
    conventionProposals,
    `Failed to find the forum: ${CONVENTION_PROPOSALS_FORUM_NAME}`,
  );

  const openTag = conventionProposals.availableTags.find(
    (tag) => tag.name.includes("open"), // The tag also has an emoji in it.
  );
  assertDefined(openTag, "Failed to find the forum tag: open");

  const closedTag = conventionProposals.availableTags.find(
    (tag) => tag.name.includes("closed"), // The tag also has an emoji in it.
  );
  assertDefined(closedTag, "Failed to find the forum tag: closed");

  const conventionAdminRoleID = getRoleIDByName(
    guild,
    CONVENTION_ADMIN_ROLE_NAME,
  );
  assertDefined(
    conventionAdminRoleID,
    `Failed to find the role: ${CONVENTION_ADMIN_ROLE_NAME}`,
  );

  const replaysChannelID = getChannelIDByName(guild, "replays");
  assertDefined(replaysChannelID, "Failed to find the channel: replays");

  const screenshotsChannelID = getChannelIDByName(guild, "screenshots");
  assertDefined(
    screenshotsChannelID,
    "Failed to find the channel: screenshots",
  );

  const videosChannelID = getChannelIDByName(guild, "videos");
  assertDefined(videosChannelID, "Failed to find the channel: videos");

  const puzzlesChannelID = getChannelIDByName(guild, "puzzles");
  assertDefined(puzzlesChannelID, "Failed to find the channel: puzzles");

  // ---------------------
  // Attach event handlers
  // https://github.com/discordjs/discord.js/issues/10279
  // ---------------------

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  client.on(Events.InteractionCreate, async (interaction) => {
    await onInteractionCreate(
      interaction,
      conventionAdminRoleID,
      conventionProposals.id,
      closedTag.id,
    );
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  client.on(Events.MessageCreate, async (message) => {
    await onMessageCreate(
      message,
      replaysChannelID,
      screenshotsChannelID,
      videosChannelID,
      puzzlesChannelID,
    );
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  client.on(Events.ThreadCreate, async (threadChannel) => {
    await onThreadCreate(
      threadChannel,
      conventionQuestionsForumID,
      conventionProposals.id,
      openTag.id,
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
