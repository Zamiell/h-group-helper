import { assertDefined } from "complete-common";
import type { Client } from "discord.js";
import { ChannelType, Events, ForumChannel } from "discord.js";
import { inspect } from "node:util";
import { getChannelByName, getRoleByName } from "../discordUtils.js";
import { QueueType } from "../enums/QueueType.js";
import { env } from "../env.js";
import { logger } from "../logger.js";
import { deleteEmptyVoiceChannels } from "../queueActions/deleteEmptyVoiceChannels.js";
import { onInteractionCreate } from "./onInteractionCreate.js";
import { onMessageCreate } from "./onMessageCreate.js";
import { onThreadCreate } from "./onThreadCreate.js";
import { onVoiceStateUpdate } from "./onVoiceStatusUpdate.js";

const BOT_ERRORS_CHANNEL_NAME = "bot-errors";
const VOICE_CATEGORY_NAME = "H-Group Pickup Games";
const CREATE_NEW_VOICE_CHANNEL_NAME = "Create New Voice Channel";
const CONVENTION_QUESTIONS_FORUM_NAME = "convention-questions";
const CONVENTION_PROPOSALS_FORUM_NAME = "convention-proposals";
const H_GROUP_ROLE_NAME = "H-Group";
const CONVENTION_ADMIN_ROLE_NAME = "Convention Admin";

export async function onClientReady(client: Client<true>): Promise<void> {
  logger.info(
    `Connected to Discord with a username of "${client.user.username}" and an ID of "${client.user.id}".`,
  );

  const guild = await client.guilds.fetch(env.DISCORD_SERVER_ID);
  logger.info(`Connected to Discord server: ${guild.name}`);

  // ----------------
  // Gather variables
  // ----------------

  // Refresh the various caches so that gathering the variables below works properly.
  await Promise.all([
    guild.channels.fetch(),
    guild.members.fetch(),
    guild.roles.fetch(),
  ]);

  const botErrorsChannel = getChannelByName(guild, BOT_ERRORS_CHANNEL_NAME);
  assertDefined(
    botErrorsChannel,
    `Failed to find the channel of: ${BOT_ERRORS_CHANNEL_NAME}`,
  );

  if (botErrorsChannel.type !== ChannelType.GuildText) {
    throw new Error(
      `The channel of "${BOT_ERRORS_CHANNEL_NAME}" is not a text channel.`,
    );
  }

  const voiceCategory = getChannelByName(guild, VOICE_CATEGORY_NAME);
  assertDefined(
    voiceCategory,
    `Failed to find the channel of: ${VOICE_CATEGORY_NAME}`,
  );

  const createNewVoiceChannel = getChannelByName(
    guild,
    CREATE_NEW_VOICE_CHANNEL_NAME,
  );
  assertDefined(
    createNewVoiceChannel,
    `Failed to find the channel of: ${CREATE_NEW_VOICE_CHANNEL_NAME}`,
  );

  const conventionQuestionsForum = getChannelByName(
    guild,
    CONVENTION_QUESTIONS_FORUM_NAME,
  );
  assertDefined(
    conventionQuestionsForum,
    `Failed to find the channel of: ${CONVENTION_QUESTIONS_FORUM_NAME}`,
  );

  const conventionProposals = getChannelByName(
    guild,
    CONVENTION_PROPOSALS_FORUM_NAME,
  );
  assertDefined(
    conventionProposals,
    `Failed to find the channel of: ${CONVENTION_PROPOSALS_FORUM_NAME}`,
  );

  if (!(conventionProposals instanceof ForumChannel)) {
    throw new TypeError(
      `The channel of "${CONVENTION_PROPOSALS_FORUM_NAME}" is not a ForumChannel.`,
    );
  }

  const openTag = conventionProposals.availableTags.find(
    (tag) => tag.name.includes("open"), // The tag also has an emoji in it.
  );
  assertDefined(openTag, "Failed to find the forum tag: open");

  const closedTag = conventionProposals.availableTags.find(
    (tag) => tag.name.includes("closed"), // The tag also has an emoji in it.
  );
  assertDefined(closedTag, "Failed to find the forum tag: closed");

  const hGroupRole = getRoleByName(guild, H_GROUP_ROLE_NAME);
  assertDefined(hGroupRole, `Failed to find the role: ${H_GROUP_ROLE_NAME}`);

  const conventionAdminRole = getRoleByName(guild, CONVENTION_ADMIN_ROLE_NAME);
  assertDefined(
    conventionAdminRole,
    `Failed to find the role: ${CONVENTION_ADMIN_ROLE_NAME}`,
  );

  /**
   * Represents admins of the Discord server who's job it is to read every message (for possible
   * rule violations). This should technically be equal to all of the members in the "Moderator"
   * role, but instead we re-use the "Convention Admins" role, since not all of the official
   * moderators want to be pinged for every single thread.
   */
  const adminIDs = [...conventionAdminRole.members.keys()];
  if (adminIDs.length === 0) {
    throw new Error(
      `Failed to find any members in the "${CONVENTION_ADMIN_ROLE_NAME}" role.`,
    );
  }

  const replaysChannel = getChannelByName(guild, "replays");
  assertDefined(replaysChannel, "Failed to find the channel: replays");

  const screenshotsChannel = getChannelByName(guild, "screenshots");
  assertDefined(screenshotsChannel, "Failed to find the channel: screenshots");

  const videosChannel = getChannelByName(guild, "videos");
  assertDefined(videosChannel, "Failed to find the channel: videos");

  const puzzlesChannel = getChannelByName(guild, "puzzles");
  assertDefined(puzzlesChannel, "Failed to find the channel: puzzles");

  // ---------------------
  // Attach event handlers
  // https://github.com/discordjs/discord.js/issues/10279
  // ---------------------

  // Log all errors to Discord for better visibility.
  process.on("uncaughtException", (error) => {
    logger.error("uncaughtException:", error);

    // `JSON.stringify` will not work properly with errors, so we have to use `inspect`.
    // eslint-disable-next-line unicorn/no-null
    const errorMessage = inspect(error, { depth: null });

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    botErrorsChannel.send(`\`\`\`\n${errorMessage}\n\`\`\``);
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  client.on(Events.InteractionCreate, async (interaction) => {
    await onInteractionCreate(
      interaction,
      conventionAdminRole.id,
      conventionProposals.id,
      closedTag.id,
    );
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  client.on(Events.MessageCreate, async (message) => {
    await onMessageCreate(
      message,
      client.user.id,
      adminIDs,
      replaysChannel.id,
      screenshotsChannel.id,
      videosChannel.id,
      puzzlesChannel.id,
      conventionProposals.id,
      hGroupRole.id,
    );
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  client.on(Events.ThreadCreate, async (threadChannel) => {
    await onThreadCreate(
      threadChannel,
      conventionQuestionsForum.id,
      conventionProposals.id,
      hGroupRole.id,
      openTag.id,
    );
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    await onVoiceStateUpdate(
      oldState,
      newState,
      client,
      voiceCategory.id,
      createNewVoiceChannel.id,
    );
  });

  // ---------------------------
  // Perform initialization work
  // ---------------------------

  await deleteEmptyVoiceChannels({
    type: QueueType.DeleteEmptyVoiceChannels,
    guild,
    voiceCategoryID: voiceCategory.id,
    createNewVoiceChannelID: createNewVoiceChannel.id,
  });
}
