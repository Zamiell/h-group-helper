import { Guild } from "discord.js";
import { MAX_NUM_VOICE_CHANNELS, VOICE_CHANNEL_PREFIX } from "./constants";
import {
  createNewVoiceChannel,
  getChannelNamesInCategory,
  moveUserToVoiceChannel,
} from "./discordUtilChannels";
import { parseIntSafe } from "./util";

export async function autoCreateVoiceChannels(
  guild: Guild,
  userID: string,
  channelID: string,
  categoryID: string,
  joinChannelID: string,
) {
  if (channelID !== joinChannelID) {
    return;
  }

  const channelNamesInCategory = await getChannelNamesInCategory(
    guild,
    categoryID,
  );
  if (channelNamesInCategory === null) {
    console.error(
      `Failed to get the channel names for category: ${categoryID}`,
    );
    return;
  }

  const channelName = getNewChannelName(channelNamesInCategory);
  if (channelName === null) {
    return;
  }

  const newChannel = await createNewVoiceChannel(
    guild,
    channelName,
    categoryID,
  );

  await moveUserToVoiceChannel(guild, userID, newChannel.id);
}

function getNewChannelName(channelNames: string[]): string | null {
  const number = getLowestAvailableNumber(channelNames);
  if (number === null) {
    return null;
  }

  return `${VOICE_CHANNEL_PREFIX}${number}`;
}

function getLowestAvailableNumber(channelNames: string[]): number | null {
  const numberSet = getChannelNumbers(channelNames);
  for (let i = 1; i <= MAX_NUM_VOICE_CHANNELS; i++) {
    if (!numberSet.has(i)) {
      return i;
    }
  }

  return null;
}

function getChannelNumbers(channelNames: string[]): Set<number> {
  const numbers = new Set<number>();
  for (const channelName of channelNames) {
    if (channelName.startsWith(VOICE_CHANNEL_PREFIX)) {
      const numberString = channelName.slice(VOICE_CHANNEL_PREFIX.length);
      const number = parseIntSafe(numberString);
      if (!Number.isNaN(number)) {
        numbers.add(number);
      }
    }
  }

  return numbers;
}
