import {
  Guild,
  Message,
  NonThreadGuildBasedChannel,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { ChannelTypes } from "discord.js/typings/enums";
import { getMember } from "./discordUtil";

export async function createNewVoiceChannel(
  guild: Guild,
  channelName: string,
  categoryID: string,
): Promise<VoiceChannel> {
  return guild.channels.create(channelName, {
    type: ChannelTypes.GUILD_VOICE,
    parent: categoryID,
  });
}

export async function getChannel(
  guild: Guild,
  channelID: string,
): Promise<NonThreadGuildBasedChannel | null> {
  return guild.channels.fetch(channelID);
}

export function getChannelIDByName(
  guild: Guild,
  channelName: string,
): string | null {
  const channels = Array.from(guild.channels.cache.values());
  const matchingChannels = channels.filter(
    (channel) => channel.name === channelName,
  );
  return matchingChannels.length === 0 ? null : matchingChannels[0].id;
}

export async function getChannelsInCategory(
  guild: Guild,
  categoryID: string,
): Promise<NonThreadGuildBasedChannel[] | null> {
  const channelMap = await guild.channels.fetch();
  if (channelMap === null) {
    return null;
  }

  const channels = Array.from(channelMap.values());
  return channels.filter((channel) => channel.parentId === categoryID);
}

export async function getChannelNamesInCategory(
  guild: Guild,
  categoryID: string,
): Promise<string[] | null> {
  const channelsInCategory = await getChannelsInCategory(guild, categoryID);
  if (channelsInCategory === null) {
    return null;
  }

  return channelsInCategory.map((channel) => channel.name);
}

export async function getLastMessage(
  channel: TextChannel,
): Promise<Message<boolean> | undefined> {
  const messages = await channel.messages.fetch({ limit: 1 });
  return messages.first();
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
