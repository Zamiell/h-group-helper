import type { Guild, GuildBasedChannel, VoiceBasedChannel } from "discord.js";
import { DiscordAPIError, RESTJSONErrorCodes } from "discord.js";
import { logger } from "./logger.js";

export function getChannelIDByName(
  guild: Guild,
  channelName: string,
): string | undefined {
  const channels = [...guild.channels.cache.values()];
  const matchingChannel = channels.find(
    (channel) => channel.name === channelName,
  );
  const firstMatchingChannel = matchingChannel;
  return firstMatchingChannel === undefined
    ? undefined
    : firstMatchingChannel.id;
}

export function getVoiceChannelsInCategory(
  guild: Guild,
  categoryID: string,
): readonly VoiceBasedChannel[] {
  const channelMap = guild.channels.cache;
  const allChannels = [...channelMap.values()];
  const channels = allChannels.filter(isNotNullUndefined);
  const voiceChannels = channels.filter(isVoiceChannel);

  const voiceChannelsInCategory = voiceChannels.filter(
    (channel) => channel.parentId === categoryID,
  );

  return voiceChannelsInCategory;
}

function isNotNullUndefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function isVoiceChannel(
  channel: GuildBasedChannel,
): channel is VoiceBasedChannel {
  return channel.isVoiceBased();
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
