import {
  ChannelType,
  Guild,
  NonThreadGuildBasedChannel,
  VoiceChannel,
} from "discord.js";
import { getMember } from "./discordUtil";

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

export async function getChannel(
  guild: Guild,
  channelID: string,
): Promise<NonThreadGuildBasedChannel | undefined> {
  const channel = await guild.channels.fetch(channelID);
  return channel === null ? undefined : channel;
}

export function getChannelIDByName(
  guild: Guild,
  channelName: string,
): string | undefined {
  const channels = Array.from(guild.channels.cache.values());
  const matchingChannels = channels.filter(
    (channel) => channel.name === channelName,
  );
  const firstMatchingChannel = matchingChannels[0];
  return firstMatchingChannel === undefined
    ? undefined
    : firstMatchingChannel.id;
}

export async function getChannelsInCategory(
  guild: Guild,
  categoryID: string,
): Promise<NonThreadGuildBasedChannel[] | undefined> {
  const channelMap = await guild.channels.fetch();
  const channels = Array.from(channelMap.values());
  return channels.filter(
    // The discord.js typings are wrong; the channel can be null here.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (channel) => channel !== null && channel.parentId === categoryID,
  );
}

export function isVoiceChannelEmpty(
  channel: NonThreadGuildBasedChannel,
): boolean {
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
