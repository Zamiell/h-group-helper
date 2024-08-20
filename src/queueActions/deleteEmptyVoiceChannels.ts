import { VOICE_CHANNEL_PREFIX } from "../constants.js";
import {
  getVoiceChannelsInCategory,
  isVoiceChannelEmpty,
} from "../discordUtilChannels.js";
import type { QueueElementDeleteEmptyVoidChannels } from "../enums/QueueType.js";
import { g } from "../globals.js";
import { renameAllChannelsAccordingToOrder } from "./createVoiceChannels.js";

/**
 * Normally, the bot will delete empty voice channels. So, when the bot first starts, we want to
 * check for any existing empty voice channels and delete them in case they transitioned to being
 * empty when the bot was offline.
 */
export async function deleteEmptyVoiceChannels(
  queueElement: QueueElementDeleteEmptyVoidChannels,
): Promise<void> {
  const { guild } = queueElement;

  const voiceChannels = await getVoiceChannelsInCategory(
    guild,
    g.voiceCategoryID,
  );
  if (voiceChannels === undefined) {
    console.error(
      `Failed to get the channels for category: ${g.voiceCategoryID}`,
    );
    return;
  }

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
  await renameAllChannelsAccordingToOrder(guild);
}
