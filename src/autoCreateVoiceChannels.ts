import { Guild } from "discord.js";
import { VOICE_CHANNEL_PREFIX } from "./constants";
import {
  createNewVoiceChannel,
  getChannelsInCategory,
  moveUserToVoiceChannel,
} from "./discordUtilChannels";
import g from "./globals";

export async function autoCreateVoiceChannels(
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
  const channelsInCategory = await getChannelsInCategory(
    guild,
    g.voiceCategoryID,
  );
  if (channelsInCategory === undefined) {
    console.error(
      `Failed to get the channels for category: ${g.voiceCategoryID}`,
    );
    return;
  }

  const promises: Array<Promise<unknown>> = [];
  for (const channel of channelsInCategory) {
    // Don't rename the "Create New Voice Channel" channel.
    if (channel.id === g.voiceJoinChannelID) {
      continue;
    }

    const name = `${VOICE_CHANNEL_PREFIX}${channel.position}`;
    const promise = channel.setName(name);
    promises.push(promise);
  }

  await Promise.all(promises);
}
