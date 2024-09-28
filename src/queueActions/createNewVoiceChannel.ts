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

  // This is a temporary name; it will be renamed post-creation, based on its position in the list.
  const channelName = `${VOICE_CHANNEL_PREFIX}#`;

  const newChannel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildVoice,
    parent: voiceCategoryID,
  });

  await moveUserToVoiceChannel(guild, userID, newChannel.id);
  await renameAllChannelsAccordingToOrder(
    guild,
    voiceCategoryID,
    createNewVoiceChannelID,
  );
}

export async function renameAllChannelsAccordingToOrder(
  guild: Guild,
  voiceCategoryID: string,
  createNewVoiceChannelID: string,
): Promise<void> {
  const voiceChannelsInCategory = await getVoiceChannelsInCategory(
    guild,
    voiceCategoryID,
  );
  if (voiceChannelsInCategory === undefined) {
    console.error(
      `Failed to get the voice channels for category: ${voiceCategoryID}`,
    );
    return;
  }

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
}
