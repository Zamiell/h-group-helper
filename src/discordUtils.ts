import type {
  DMChannel,
  Guild,
  GuildBasedChannel,
  Role,
  VoiceBasedChannel,
} from "discord.js";
import { DiscordAPIError, RESTJSONErrorCodes } from "discord.js";
import { logger } from "./logger.js";
import { isNotNullUndefined } from "./utils.js";

const MAX_DISCORD_MESSAGE_LENGTH = 2000;

export async function memberHasRole(
  guild: Guild,
  userID: string,
  roleID: string,
): Promise<boolean> {
  const member = await guild.members.fetch(userID);
  return member.roles.cache.has(roleID);
}

/** This works for both channels and forums. */
export function getChannelByName(
  guild: Guild,
  channelName: string,
): GuildBasedChannel | undefined {
  return guild.channels.cache.find((channel) => channel.name === channelName);
}

export function getRoleByName(
  guild: Guild,
  roleName: string,
): Role | undefined {
  return guild.roles.cache.find((role) => role.name === roleName);
}

export function getVoiceChannelsInCategory(
  guild: Guild,
  categoryID: string,
): readonly VoiceBasedChannel[] {
  const allChannels = [...guild.channels.cache.values()];
  const channels = allChannels.filter(isNotNullUndefined);
  const voiceChannels = channels.filter((channel) => channel.isVoiceBased());

  const voiceChannelsInCategory = voiceChannels.filter(
    (channel) => channel.parentId === categoryID,
  );

  return voiceChannelsInCategory;
}

export function isVoiceChannelEmpty(channel: VoiceBasedChannel): boolean {
  return channel.members.size === 0;
}

export async function moveUserToVoiceChannel(
  guild: Guild,
  userID: string,
  newChannelID: string,
): Promise<void> {
  const member = await guild.members.fetch(userID);
  try {
    await member.voice.setChannel(newChannelID);
  } catch (error) {
    if (
      error instanceof DiscordAPIError &&
      error.code === RESTJSONErrorCodes.TargetUserIsNotConnectedToVoice
    ) {
      logger.info(
        `Failed to move user "${userID}" to channel "${newChannelID}" since they are no longer connected to voice.`,
      );
    } else {
      logger.error(
        `Failed to move user "${userID}" to channel "${newChannelID}": ${error}`,
      );
    }
  }
}

export async function sendDMWithDeletedMessage(
  dmChannel: DMChannel,
  dmMessage: string,
  deletedMessage: string,
): Promise<void> {
  const messageWithSuffix = `${dmMessage}\n\nFor reference, your post was:\n> `;
  const maxLengthForDeletedMessage =
    MAX_DISCORD_MESSAGE_LENGTH - messageWithSuffix.length;
  const trimmedDeletedMessage = deletedMessage.slice(
    maxLengthForDeletedMessage,
  );
  const fullMessage = messageWithSuffix + trimmedDeletedMessage;
  await dmChannel.send(fullMessage);
}
