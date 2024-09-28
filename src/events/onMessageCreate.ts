import type { Message } from "discord.js";
import { ChannelType } from "discord.js";
import { checkCommand } from "../command.js";
import { logger } from "../logger.js";

export async function onMessageCreate(
  message: Message,
  botID: string,
  adminIDs: readonly string[],
): Promise<void> {
  logDiscordTextMessage(message);

  // Ignore anything not in a text channel.
  if (message.channel.type !== ChannelType.GuildText) {
    return;
  }

  // Ignore our own messages.
  if (message.author.id === botID) {
    return;
  }

  await checkCommand(message, adminIDs);
}

function logDiscordTextMessage(message: Message) {
  const channelName =
    message.channel.type === ChannelType.DM ? "DM" : `#${message.channel.name}`;

  logger.info(
    `[${channelName}] <${message.author.username}#${message.author.discriminator}> ${message.content}`,
  );
}
