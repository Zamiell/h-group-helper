import type {
  Guild,
  NonThreadGuildBasedChannel,
  VoiceBasedChannel,
} from "discord.js";
import { getMember } from "./discordUtil.js";
import { logger } from "./logger.js";
import { notEmpty } from "./utils.js";

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

export async function getVoiceChannelsInCategory(
  guild: Guild,
  categoryID: string,
): Promise<VoiceBasedChannel[] | undefined> {
  const channelMap = await guild.channels.fetch();
  const allChannels = [...channelMap.values()];
  const channels = allChannels.filter(notEmpty);
  const voiceChannels = channels.filter(isVoiceChannel);
  return voiceChannels.filter((channel) => channel.parentId === categoryID);
}

function isVoiceChannel(
  channel: NonThreadGuildBasedChannel,
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
  const member = await getMember(guild, userID);
  try {
    await member.voice.setChannel(newChannelID);
  } catch (error) {
    logger.error(
      `Failed to move user "${userID}" to channel "${newChannelID}": ${error}`,
    );
  }
}
