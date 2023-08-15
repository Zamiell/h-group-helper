import type { Guild } from "discord.js";
import { VOICE_CHANNEL_PREFIX } from "../constants.js";
import {
  createNewVoiceChannel,
  getVoiceChannelsInCategory,
  moveUserToVoiceChannel,
} from "../discordUtilChannels.js";
import { g } from "../globals.js";

export async function createVoiceChannels(
  guild: Guild,
  userID: string,
  channelID: string,
): Promise<void> {
  if (channelID !== g.voiceJoinChannelID) {
    return;
  }

  // This is a temporary name; it will be renamed post-creation, based on its position in the list.
  const channelName = `${VOICE_CHANNEL_PREFIX}#`;

  const newChannel = await createNewVoiceChannel(
    guild,
    channelName,
    g.voiceCategoryID,
  );

  await moveUserToVoiceChannel(guild, userID, newChannel.id);
  await renameAllChannelsAccordingToOrder(guild);
}

export async function renameAllChannelsAccordingToOrder(
  guild: Guild,
): Promise<void> {
  const voiceChannelsInCategory = await getVoiceChannelsInCategory(
    guild,
    g.voiceCategoryID,
  );
  if (voiceChannelsInCategory === undefined) {
    console.error(
      `Failed to get the voice channels for category: ${g.voiceCategoryID}`,
    );
    return;
  }

  const promises: Array<Promise<unknown>> = [];
  for (const voiceChannel of voiceChannelsInCategory) {
    // Don't rename the "Create New Voice Channel" channel.
    if (voiceChannel.id === g.voiceJoinChannelID) {
      continue;
    }

    const name = `${VOICE_CHANNEL_PREFIX}${voiceChannel.position}`;
    const promise = voiceChannel.setName(name);
    promises.push(promise);
  }

  await Promise.all(promises);
}
