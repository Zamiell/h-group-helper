import { Guild } from "discord.js";
import { VOICE_CHANNEL_PREFIX } from "./constants";
import {
  getChannel,
  getChannelsInCategory,
  isVoiceChannelEmpty,
} from "./discordUtilChannels";

export async function autoDeleteEmptyVoiceChannels(
  guild: Guild,
  channelID: string,
) {
  const channel = await getChannel(guild, channelID);
  if (channel === null) {
    return;
  }

  if (!channel.name.startsWith(VOICE_CHANNEL_PREFIX)) {
    return;
  }

  if (!isVoiceChannelEmpty(channel)) {
    return;
  }

  await channel.delete();
}

export async function checkEmptyVoiceChannels(
  guild: Guild,
  categoryID: string,
) {
  const channels = await getChannelsInCategory(guild, categoryID);
  if (channels === null) {
    console.error(`Failed to get the channels for category: ${categoryID}`);
    return;
  }

  for (const channel of channels) {
    if (!channel.name.startsWith(VOICE_CHANNEL_PREFIX)) {
      continue;
    }

    if (isVoiceChannelEmpty(channel)) {
      channel.delete().catch((err) => {
        console.error(`Failed to delete channel "${channel.name}":`, err);
      });
    }
  }
}
