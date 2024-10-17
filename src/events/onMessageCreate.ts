import type { Message } from "discord.js";
import { ChannelType } from "discord.js";
import { logger } from "../logger.js";

export async function onMessageCreate(
  message: Message,
  replaysChannelID: string,
  screenshotsChannelID: string,
): Promise<void> {
  logDiscordTextMessage(message);

  await checkReplaysChannel(message, replaysChannelID);
  await checkScreenshotsChannel(message, screenshotsChannelID);
  /// await checkVideosChannel(message, replaysChannelID);
  /// await checkPuzzlesChannel(message, replaysChannelID);
}

function logDiscordTextMessage(message: Message) {
  const channelName =
    message.channel.type === ChannelType.DM ? "DM" : `#${message.channel.name}`;

  logger.info(
    `[${channelName}] <${message.author.username}> ${message.content}`,
  );
}

async function checkReplaysChannel(message: Message, replaysChannelID: string) {
  if (message.channelId !== replaysChannelID) {
    return;
  }

  if (!message.content.includes("https://hanab.live/replay/")) {
    const dmChannel = await message.author.createDM();
    await dmChannel.send(
      "Your post in the #replays channel has been deleted since it does not contain a replay. Please use threads to discuss a specific replay.",
    );
    await message.delete();
    return;
  }

  // Ensure that replay's are surrounded by "<" and ">" to prevent the link preview.
  if (!message.content.includes("<https://hanab.live/replay/")) {
    const dmChannel = await message.author.createDM();
    await dmChannel.send(
      "Your post in the #replays channel has been deleted since you have not disabled the link preview. Please enclose your link in `<` and `>`, like the following: `<https://hanab.live/replay/123>`",
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
      "Your post in the #screenshots channel has been deleted because it does not contain a screenshot. Please use threads to discuss a specific screenshot.`",
    );
    await message.delete();
    return;
  }

  await message.startThread({
    name: getThreadName(message, "screenshot"),
  });
}

function getThreadName(message: Message, noun: string): string {
  let possessive = `${message.author.username}'`;
  if (!message.author.username.endsWith("s")) {
    possessive += "s";
  }

  return `${possessive} ${noun}`;
}
