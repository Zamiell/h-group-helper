import type { VoiceBasedChannel } from "discord.js";
import { VOICE_CHANNEL_PREFIX } from "../constants.js";
import {
  getVoiceChannelsInCategory,
  isVoiceChannelEmpty,
} from "../discordUtilChannels.js";
import type { QueueElementDeleteEmptyVoiceChannels } from "../enums/QueueType.js";

/**
 * Normally, the bot will delete empty voice channels. So, when the bot first starts, we want to
 * check for any existing empty voice channels and delete them in case they transitioned to being
 * empty when the bot was offline.
 *
 * @returns The number of channels remaining after the empty channels were deleted.
 */
export async function deleteEmptyVoiceChannels(
  queueElement: QueueElementDeleteEmptyVoiceChannels,
): Promise<number> {
  const { guild, voiceCategoryID, createNewVoiceChannelID } = queueElement;

  const voiceChannels = getVoiceChannelsInCategory(guild, voiceCategoryID);

  const emptyVoiceChannels = voiceChannels.filter(
    (voiceChannel) =>
      voiceChannel.name.startsWith(VOICE_CHANNEL_PREFIX) &&
      isVoiceChannelEmpty(voiceChannel),
  );

  if (emptyVoiceChannels.length > 0) {
    const promises = emptyVoiceChannels.map(async (voiceChannel) =>
      voiceChannel.delete(),
    );
    await Promise.allSettled(promises);
  }

  return renameAllChannelsAccordingToOrder(
    voiceChannels,
    createNewVoiceChannelID,
  );
}

async function renameAllChannelsAccordingToOrder(
  voiceChannels: readonly VoiceBasedChannel[],
  createNewVoiceChannelID: string,
): Promise<number> {
  const promises: Array<Promise<unknown>> = [];

  for (const voiceChannel of voiceChannels) {
    // Don't rename the "Create New Voice Channel" channel.
    if (voiceChannel.id === createNewVoiceChannelID) {
      continue;
    }

    const correctName = `${VOICE_CHANNEL_PREFIX}${voiceChannel.position}`;
    if (voiceChannel.name !== correctName) {
      const promise = voiceChannel.setName(correctName);
      promises.push(promise);
    }
  }

  await Promise.allSettled(promises);

  return voiceChannels.length - 1;
}
