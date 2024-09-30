import type { Message } from "discord.js";
import { ChannelType } from "discord.js";
import { logger } from "../logger.js";

export function onMessageCreate(message: Message): void {
  logDiscordTextMessage(message);
}

function logDiscordTextMessage(message: Message) {
  const channelName =
    message.channel.type === ChannelType.DM ? "DM" : `#${message.channel.name}`;

  logger.info(
    `[${channelName}] <${message.author.username}#${message.author.discriminator}> ${message.content}`,
  );
}
