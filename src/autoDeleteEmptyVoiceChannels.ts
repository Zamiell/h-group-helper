import { Guild } from "discord.js";
import { renameAllChannelsAccordingToOrder } from "./autoCreateVoiceChannels";
import { VOICE_CHANNEL_PREFIX } from "./constants";
import { getVoiceChannel, isVoiceChannelEmpty } from "./discordUtilChannels";

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
