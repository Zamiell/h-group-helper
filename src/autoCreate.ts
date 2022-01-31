import { Guild } from "discord.js";
import { VOICE_CHANNEL_PREFIX } from "./constants";
import {
  createNewVoiceChannel,
  getChannelsInCategory,
  moveUserToVoiceChannel,
} from "./discordUtilChannels";

export async function autoCreateVoiceChannels(
  guild: Guild,
  userID: string,
  channelID: string,
  categoryID: string,
  joinChannelID: string,
): Promise<void> {
  if (channelID !== joinChannelID) {
    return;
  }

  const channelName = `${VOICE_CHANNEL_PREFIX}#`; // It will be renamed post-creation
  const newChannel = await createNewVoiceChannel(
    guild,
    channelName,
    categoryID,
  );

  await moveUserToVoiceChannel(guild, userID, newChannel.id);
  await renameAllChannelsAccordingToOrder(guild, categoryID, joinChannelID);
}

export async function renameAllChannelsAccordingToOrder(
  guild: Guild,
  categoryID: string,
  voiceJoinChannelID: string,
): Promise<void> {
  const channelsInCategory = await getChannelsInCategory(guild, categoryID);
  if (channelsInCategory === null) {
    console.error(`Failed to get the channels for category: ${categoryID}`);
    return;
  }

  const promises = [];
  for (const channel of channelsInCategory) {
    // Don't rename the "Create New Voice Channel" channel
    if (channel.id === voiceJoinChannelID) {
      continue;
    }

    const name = `${VOICE_CHANNEL_PREFIX}${channel.position}`;
    const promise = channel.setName(name);
    promises.push(promise);
  }

  await Promise.all(promises);
}
