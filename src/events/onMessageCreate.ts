import type { Message } from "discord.js";
import { ChannelType } from "discord.js";
import {
  memberHasRole,
  sendDMWithDeletedMessage,
  sendNotHGroupDM,
} from "../discordUtils.js";
import { logger } from "../logger.js";
import { ADDING_MEMBER_TO_THREAD_TEXT } from "./onThreadCreate.js";

export async function onMessageCreate(
  message: Message,
  botID: string,
  adminIDs: readonly string[],
  replaysChannelID: string,
  screenshotsChannelID: string,
  videosChannelID: string,
  puzzlesChannelID: string,
  conventionProposalsForumID: string,
  hGroupRoleID: string,
): Promise<void> {
  logDiscordTextMessage(message);

  await checkBotMessages(message, botID, adminIDs);
  await checkReplaysChannel(message, replaysChannelID);
  await checkScreenshotsChannel(message, screenshotsChannelID);
  await checkVideosChannel(message, videosChannelID);
  await checkPuzzlesChannel(message, puzzlesChannelID);
  await checkConventionProposalsForum(
    message,
    conventionProposalsForumID,
    hGroupRoleID,
    botID,
  );
}

function logDiscordTextMessage(message: Message) {
  const channelName =
    message.channel.type === ChannelType.DM ? "DM" : `#${message.channel.name}`;

  logger.info(
    `[${channelName}] <${message.author.username}> ${message.content}`,
  );
}

/** See the description of the `autoJoinAdminsToAllThreads` function. */
async function checkBotMessages(
  message: Message,
  botID: string,
  adminIDs: readonly string[],
) {
  if (
    message.author.id === botID &&
    message.content === ADDING_MEMBER_TO_THREAD_TEXT
  ) {
    const mentions = adminIDs.map((adminID) => `<@${adminID}>`);
    const mentionsMsg = mentions.join(" ");
    await message.edit(mentionsMsg);
    await message.delete();
  }
}

async function checkReplaysChannel(message: Message, replaysChannelID: string) {
  if (message.channelId !== replaysChannelID) {
    return;
  }

  if (message.content.includes("https://hanab.live/shared-replay/")) {
    const dmChannel = await message.author.createDM();
    const dmMessage =
      "Your post in the #replays channel has been deleted since it links to a shared replay instead of a normal replay. Please fix your link and then re-post.";
    await sendDMWithDeletedMessage(dmChannel, dmMessage, message.content);
    await message.delete();
    return;
  }

  if (!message.content.includes("https://hanab.live/replay/")) {
    const dmChannel = await message.author.createDM();
    const dmMessage =
      "Your post in the #replays channel has been deleted since it does not contain a replay. Please use threads to discuss a specific replay.";
    await sendDMWithDeletedMessage(dmChannel, dmMessage, message.content);
    await message.delete();
    return;
  }

  // Ensure that replay's are surrounded by "<" and ">" to prevent the link preview.
  if (!message.content.includes("<https://hanab.live/replay/")) {
    const dmChannel = await message.author.createDM();
    const dmMessage =
      "Your post in the #replays channel has been deleted since you have not disabled the link preview. Please enclose your link in `<` and `>`, like the following: `<https://hanab.live/replay/123>`";
    await sendDMWithDeletedMessage(dmChannel, dmMessage, message.content);
    await message.delete();
    return;
  }

  await message.startThread({
    name: getThreadName(message, "replay"),
  });
}

async function checkScreenshotsChannel(
  message: Message,
  replaysChannelID: string,
) {
  if (message.channelId !== replaysChannelID) {
    return;
  }

  if (message.attachments.size === 0) {
    const dmChannel = await message.author.createDM();
    const dmMessage =
      "Your post in the #screenshots channel has been deleted because it does not contain a screenshot. Please use threads to discuss a specific screenshot.";
    await sendDMWithDeletedMessage(dmChannel, dmMessage, message.content);
    await message.delete();
    return;
  }

  await message.startThread({
    name: getThreadName(message, "screenshot"),
  });
}

/** There is no validation logic for this channel, since detecting a video is non-trivial. */
async function checkVideosChannel(message: Message, videosChannelID: string) {
  if (message.channelId !== videosChannelID) {
    return;
  }

  await message.startThread({
    name: getThreadName(message, "video"),
  });
}

/** There is no validation logic for this channel, since detecting a puzzle is non-trivial. */
async function checkPuzzlesChannel(message: Message, puzzlesChannelID: string) {
  if (message.channelId !== puzzlesChannelID) {
    return;
  }

  await message.startThread({
    name: getThreadName(message, "puzzle"),
  });
}

function getThreadName(message: Message, noun: string): string {
  let possessive = `${message.author.username}'`;
  if (!message.author.username.endsWith("s")) {
    possessive += "s";
  }

  return `${possessive} ${noun}`;
}

async function checkConventionProposalsForum(
  message: Message,
  conventionProposalsForumID: string,
  hGroupRoleID: string,
  botID: string,
) {
  if (
    message.channel.type !== ChannelType.PublicThread ||
    message.channel.parentId !== conventionProposalsForumID ||
    message.guild === null
  ) {
    return;
  }

  const isHGroup = await memberHasRole(
    message.guild,
    message.author.id,
    hGroupRoleID,
  );
  if (!isHGroup && message.author.id !== botID) {
    await sendNotHGroupDM(message);
    await message.delete();
  }
}
