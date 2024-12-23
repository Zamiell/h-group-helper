import type { Message } from "discord.js";
import { ChannelType } from "discord.js";
import { REPLAY_REGEX, SHARED_REPLAY_REGEX } from "../constants.js";
import { memberHasRole, sendDMWithDeletedMessage } from "../discordUtils.js";
import { sendNotHGroupDM } from "../hGroup.js";
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

  const sharedReplayLinks = message.content.match(SHARED_REPLAY_REGEX);
  if (sharedReplayLinks !== null) {
    const sharedReplayLink = sharedReplayLinks[0];
    const replayLink = sharedReplayLink.replace("shared-replay", "replay");
    const dmMessage = `Your post in the [#replays](<https://discord.com/channels/140016142600241152/465962599851491340>) channel has been deleted because it contains a shared replay link instead of a normal replay link. Please get rid of the "shared-" part. In other words, convert this:
  \`\`\`
  <${sharedReplayLink}>
  \`\`\`
  To this:
  \`\`\`
  <${replayLink}>
  \`\`\``;
    await sendDMWithDeletedMessage(message.author, dmMessage, message.content);
    await message.delete();
    return;
  }

  const replayLinks = message.content.match(REPLAY_REGEX);
  if (replayLinks === null) {
    const dmMessage =
      "Your post in the [#replays](<https://discord.com/channels/140016142600241152/465962599851491340>) channel has been deleted because it does not contain a valid replay link. If you are trying to discuss an existing replay, please use the corresponding thread.";
    await sendDMWithDeletedMessage(message.author, dmMessage, message.content);
    await message.delete();
    return;
  }

  // Ensure that replay's are surrounded by "<" and ">" to prevent the link preview.
  const replayLink = replayLinks[0];
  if (!message.content.includes(`<${replayLink}>`)) {
    const dmMessage = `Your post in the [#replays](<https://discord.com/channels/140016142600241152/465962599851491340>) channel has been deleted because it contains a link with the preview enabled. Please enclose your link(s) with the \`<\` and \`>\` characters to disable the link preview. In other words, convert this:
\`\`\`
${replayLink}
\`\`\`
To this:
\`\`\`
<${replayLink}>
\`\`\``;
    await sendDMWithDeletedMessage(message.author, dmMessage, message.content);
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
    const dmMessage =
      "Your post in the [#screenshots](<https://discord.com/channels/140016142600241152/225437979085242369>) channel has been deleted because it does not contain a screenshot. Please use threads to discuss a specific screenshot.";
    await sendDMWithDeletedMessage(message.author, dmMessage, message.content);
    await message.delete();
    return;
  }

  await message.startThread({
    name: getThreadName(message, "screenshot"),
  });
}

/** There is no validation logic for this channel because detecting a video is non-trivial. */
async function checkVideosChannel(message: Message, videosChannelID: string) {
  if (message.channelId !== videosChannelID) {
    return;
  }

  await message.startThread({
    name: getThreadName(message, "video"),
  });
}

/** There is no validation logic for this channel because detecting a puzzle is non-trivial. */
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
