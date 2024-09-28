import { ChannelType } from "discord.js";
import { VOICE_CHANNEL_PREFIX } from "../constants.js";
import { moveUserToVoiceChannel } from "../discordUtilChannels.js";
import type { QueueElementCreateNewVoiceChannels } from "../enums/QueueType.js";
import { QueueType } from "../enums/QueueType.js";
import { deleteEmptyVoiceChannels } from "./deleteEmptyVoiceChannels.js";

export async function createNewVoiceChannel(
  queueElement: QueueElementCreateNewVoiceChannels,
): Promise<void> {
  const { guild, userID, voiceCategoryID, createNewVoiceChannelID } =
    queueElement;

  // First, ensure that the existing channels are organized.
  const numChannels = await deleteEmptyVoiceChannels({
    type: QueueType.DeleteEmptyVoiceChannels,
    guild,
    voiceCategoryID,
    createNewVoiceChannelID,
  });

  const newChannel = await guild.channels.create({
    name: `${VOICE_CHANNEL_PREFIX}${numChannels + 1}`,
    type: ChannelType.GuildVoice,
    parent: voiceCategoryID,
  });

  await moveUserToVoiceChannel(guild, userID, newChannel.id);
}
