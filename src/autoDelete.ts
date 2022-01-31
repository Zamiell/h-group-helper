import { Guild, GuildChannel } from "discord.js";
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

/**
 * Normally, the bot will delete empty voice channels. So, when the bot first starts, we want to
 * check for any existing empty voice channels and delete them in case they transitioned to being
 * empty when the bot was offline.
 */
export async function checkEmptyVoiceChannels(
  guild: Guild,
  categoryID: string,
) {
  const channels = await getChannelsInCategory(guild, categoryID);
  if (channels === null) {
    console.error(`Failed to get the channels for category: ${categoryID}`);
    return;
  }

  const promises: Array<Promise<GuildChannel>> = [];
  for (const channel of channels) {
    if (!channel.name.startsWith(VOICE_CHANNEL_PREFIX)) {
      continue;
    }

    if (isVoiceChannelEmpty(channel)) {
      const promise = channel.delete();
      promises.push(promise);
    }
  }

  await Promise.all(promises);
}
