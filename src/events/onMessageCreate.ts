import type { Message } from "discord.js";
import { ChannelType } from "discord.js";
import { logger } from "../logger.js";
import { ADDING_MEMBER_TO_THREAD_TEXT } from "./onThreadCreate.js";

export async function onMessageCreate(
  message: Message,
  botID: string,
  replaysChannelID: string,
  screenshotsChannelID: string,
  videosChannelID: string,
  puzzlesChannelID: string,
): Promise<void> {
  logDiscordTextMessage(message);

  await checkBotMessages(message, botID);
  await checkReplaysChannel(message, replaysChannelID);
  await checkScreenshotsChannel(message, screenshotsChannelID);
  await checkVideosChannel(message, videosChannelID);
  await checkPuzzlesChannel(message, puzzlesChannelID);
}

function logDiscordTextMessage(message: Message) {
  const channelName =
    message.channel.type === ChannelType.DM ? "DM" : `#${message.channel.name}`;

  logger.info(
    `[${channelName}] <${message.author.username}> ${message.content}`,
  );
}

async function checkBotMessages(message: Message, botID: string) {
  if (
    message.author.id === botID &&
    message.content.startsWith(ADDING_MEMBER_TO_THREAD_TEXT)
  ) {
    await message.delete();
  }
}

async function checkReplaysChannel(message: Message, replaysChannelID: string) {
  if (message.channelId !== replaysChannelID) {
    return;
  }

  if (!message.content.includes("https://hanab.live/replay/")) {
    const dmChannel = await message.author.createDM();
    await dmChannel.send(
      `Your post in the #replays channel has been deleted since it does not contain a replay. Please use threads to discuss a specific replay.\n\nFor reference, your post was:\n> ${message.content}`,
    );
    await message.delete();
    return;
  }

  // Ensure that replay's are surrounded by "<" and ">" to prevent the link preview.
  if (!message.content.includes("<https://hanab.live/replay/")) {
    const dmChannel = await message.author.createDM();
    await dmChannel.send(
      `Your post in the #replays channel has been deleted since you have not disabled the link preview. Please enclose your link in \`<\` and \`>\`, like the following: \`<https://hanab.live/replay/123>\`\n\nFor reference, your post was:\n> ${message.content}`,
    );
    await message.delete();
    return;
  }

  const thread = await message.startThread({
    name: getThreadName(message, "replay"),
  });

  // By default, the thread is not visible unless a message is sent. Thus, we arbitrarily send a
  // message and then delete it.
  const threadMessage = await thread.send("Starting a thread.");
  await threadMessage.delete();
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
    await dmChannel.send(
      `Your post in the #screenshots channel has been deleted because it does not contain a screenshot. Please use threads to discuss a specific screenshot.\n\nFor reference, your post was:\n> ${message.content}`,
    );
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
