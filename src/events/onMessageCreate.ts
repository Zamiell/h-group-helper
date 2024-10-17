import type { Message } from "discord.js";
import { ChannelType } from "discord.js";
import { logger } from "../logger.js";

export async function onMessageCreate(
  message: Message,
  replaysChannelID: string,
): Promise<void> {
  logDiscordTextMessage(message);

  await checkReplaysChannel(message, replaysChannelID);
  /// checkScreenshotsChannel(message, replaysChannelID);
  /// checkVideosChannel(message, replaysChannelID);
  /// checkPuzzlesChannel(message, replaysChannelID);
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

  let possessive = `${message.author.username}'`;
  if (!message.author.username.endsWith("s")) {
    possessive += "s";
  }
  const name = `${possessive} replay`;

  await message.startThread({
    name,
  });
}
