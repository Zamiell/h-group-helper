import { Guild } from "discord.js";
import { renameAllChannelsAccordingToOrder } from "./autoCreateVoiceChannels";
import { VOICE_CHANNEL_PREFIX } from "./constants";
import { getChannel, isVoiceChannelEmpty } from "./discordUtilChannels";

export async function autoDeleteEmptyVoiceChannels(
  guild: Guild,
  channelID: string,
  categoryID: string,
  voiceJoinChannelID: string,
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
  await renameAllChannelsAccordingToOrder(
    guild,
    categoryID,
    voiceJoinChannelID,
  );
}
