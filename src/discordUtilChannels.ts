import type {
  Guild,
  NonThreadGuildBasedChannel,
  VoiceBasedChannel,
  VoiceChannel,
} from "discord.js";
import { ChannelType } from "discord.js";
import { getMember } from "./discordUtil.js";
import { notEmpty } from "./utils.js";

export async function createNewVoiceChannel(
  guild: Guild,
  channelName: string,
  categoryID: string,
): Promise<VoiceChannel> {
  return guild.channels.create({
    name: channelName,
    type: ChannelType.GuildVoice,
    parent: categoryID,
  });
}

export async function getVoiceChannel(
  guild: Guild,
  channelID: string,
): Promise<VoiceBasedChannel | undefined> {
  const channel = await guild.channels.fetch(channelID);
  if (channel === null) {
    return undefined;
  }

  return channel.isVoiceBased() ? channel : undefined;
}

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
  await member.voice.setChannel(newChannelID);
}
