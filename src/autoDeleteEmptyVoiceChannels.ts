import type { Guild } from "discord.js";
import { renameAllChannelsAccordingToOrder } from "./autoCreateVoiceChannels.js";
import { VOICE_CHANNEL_PREFIX } from "./constants.js";
import { getVoiceChannel, isVoiceChannelEmpty } from "./discordUtilChannels.js";

export async function autoDeleteEmptyVoiceChannels(
  guild: Guild,
  channelID: string,
): Promise<void> {
  const channel = await getVoiceChannel(guild, channelID);
  if (channel === undefined) {
    return;
  }

  if (!channel.name.startsWith(VOICE_CHANNEL_PREFIX)) {
    return;
  }

  if (!isVoiceChannelEmpty(channel)) {
    return;
  }

  await channel.delete();
  await renameAllChannelsAccordingToOrder(guild);
}
