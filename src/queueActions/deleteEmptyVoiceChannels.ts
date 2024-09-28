import { VOICE_CHANNEL_PREFIX } from "../constants.js";
import {
  getVoiceChannelsInCategory,
  isVoiceChannelEmpty,
} from "../discordUtilChannels.js";
import type { QueueElementDeleteEmptyVoidChannels } from "../enums/QueueType.js";
import { renameAllChannelsAccordingToOrder } from "./createNewVoiceChannel.js";

/**
 * Normally, the bot will delete empty voice channels. So, when the bot first starts, we want to
 * check for any existing empty voice channels and delete them in case they transitioned to being
 * empty when the bot was offline.
 */
export async function deleteEmptyVoiceChannels(
  queueElement: QueueElementDeleteEmptyVoidChannels,
): Promise<void> {
  const { guild, voiceCategoryID, createNewVoiceChannelID } = queueElement;

  const voiceChannels = await getVoiceChannelsInCategory(
    guild,
    voiceCategoryID,
  );

  const emptyVoiceChannels = voiceChannels.filter(
    (voiceChannel) =>
      voiceChannel.name.startsWith(VOICE_CHANNEL_PREFIX) &&
      isVoiceChannelEmpty(voiceChannel),
  );

  if (emptyVoiceChannels.length === 0) {
    return;
  }

  const promises = emptyVoiceChannels.map(async (voiceChannel) =>
    voiceChannel.delete(),
  );

  await Promise.allSettled(promises);
  await renameAllChannelsAccordingToOrder(
    guild,
    voiceCategoryID,
    createNewVoiceChannelID,
  );
}
