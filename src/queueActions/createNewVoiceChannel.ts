import type { Guild } from "discord.js";
import { ChannelType } from "discord.js";
import { VOICE_CHANNEL_PREFIX } from "../constants.js";
import {
  getVoiceChannelsInCategory,
  moveUserToVoiceChannel,
} from "../discordUtilChannels.js";
import type { QueueElementCreateVoidChannels } from "../enums/QueueType.js";

export async function createNewVoiceChannel(
  queueElement: QueueElementCreateVoidChannels,
): Promise<void> {
  const { guild, userID, voiceCategoryID, createNewVoiceChannelID } =
    queueElement;

  // First, ensure that the existing channels are organized.
  const numChannels = await renameAllChannelsAccordingToOrder(
    guild,
    voiceCategoryID,
    createNewVoiceChannelID,
  );

  const newChannel = await guild.channels.create({
    name: `${VOICE_CHANNEL_PREFIX}${numChannels + 1}`,
    type: ChannelType.GuildVoice,
    parent: voiceCategoryID,
  });

  await moveUserToVoiceChannel(guild, userID, newChannel.id);
}

export async function renameAllChannelsAccordingToOrder(
  guild: Guild,
  voiceCategoryID: string,
  createNewVoiceChannelID: string,
): Promise<number> {
  const voiceChannelsInCategory = await getVoiceChannelsInCategory(
    guild,
    voiceCategoryID,
  );

  const promises: Array<Promise<unknown>> = [];
  for (const voiceChannel of voiceChannelsInCategory) {
    // Don't rename the "Create New Voice Channel" channel.
    if (voiceChannel.id === createNewVoiceChannelID) {
      continue;
    }

    const name = `${VOICE_CHANNEL_PREFIX}${voiceChannel.position}`;
    const promise = voiceChannel.setName(name);
    promises.push(promise);
  }

  await Promise.all(promises);

  return voiceChannelsInCategory.length - 1;
}
