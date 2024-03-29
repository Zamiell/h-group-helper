import type { Message } from "discord.js";
import { ChannelType } from "discord.js";
import { checkCommand } from "../command.js";
import { g } from "../globals.js";
import { logger } from "../logger.js";

export async function onMessageCreate(message: Message): Promise<void> {
  logDiscordTextMessage(message);

  // Ignore anything not in a text channel.
  if (message.channel.type !== ChannelType.GuildText) {
    return;
  }

  // Ignore our own messages.
  if (message.author.id === g.botID) {
    return;
  }

  await checkCommand(message, g.adminIDs);
}

function logDiscordTextMessage(message: Message) {
  const channelName =
    message.channel.type === ChannelType.DM ? "DM" : `#${message.channel.name}`;

  logger.info(
    `[${channelName}] <${message.author.username}#${message.author.discriminator}> ${message.content}`,
  );
}
