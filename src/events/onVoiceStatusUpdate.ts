import type { Client, Guild, VoiceState } from "discord.js";
import { QueueType } from "../enums/QueueType.js";
import { logger } from "../logger.js";
import { addQueue } from "../queue.js";

export async function onVoiceStateUpdate(
  oldState: VoiceState,
  newState: VoiceState,
  client: Client<true>,
  voiceCategoryID: string,
  createNewVoiceChannelID: string,
): Promise<void> {
  const { guild } = newState;
  const userID = newState.id;
  const oldChannelID = oldState.channelId;
  const newChannelID = newState.channelId;

  if (oldChannelID === null && newChannelID === null) {
    throw new Error(
      'The "onVoiceStateUpdate" event fired with both channels being null.',
    );
  }

  if (oldChannelID === null && newChannelID !== null) {
    // null --> something
    await onJoinedVoiceChannel(
      client,
      guild,
      userID,
      newChannelID,
      voiceCategoryID,
      createNewVoiceChannelID,
    );
  } else if (oldChannelID !== null && newChannelID === null) {
    // something --> null
    await onLeftVoiceChannel(
      client,
      guild,
      userID,
      oldChannelID,
      voiceCategoryID,
      createNewVoiceChannelID,
    );
  } else if (oldChannelID !== null && newChannelID !== null) {
    // something --> something
    await onLeftVoiceChannel(
      client,
      guild,
      userID,
      oldChannelID,
      voiceCategoryID,
      createNewVoiceChannelID,
    );
    await onJoinedVoiceChannel(
      client,
      guild,
      userID,
      newChannelID,
      voiceCategoryID,
      createNewVoiceChannelID,
    );
  }
}

async function onJoinedVoiceChannel(
  client: Client<true>,
  guild: Guild,
  userID: string,
  channelID: string,
  voiceCategoryID: string,
  createNewVoiceChannelID: string,
) {
  await logVoiceStatusUpdate(client, userID, channelID, "Joined");

  if (channelID === createNewVoiceChannelID) {
    addQueue({
      type: QueueType.CreateNewVoiceChannel,
      guild,
      userID,
      voiceCategoryID,
      createNewVoiceChannelID,
    });
  }
}

async function onLeftVoiceChannel(
  client: Client<true>,
  guild: Guild,
  userID: string,
  channelID: string,
  voiceCategoryID: string,
  createNewVoiceChannelID: string,
) {
  await logVoiceStatusUpdate(client, userID, channelID, "Left");

  if (channelID !== createNewVoiceChannelID) {
    addQueue({
      type: QueueType.DeleteEmptyVoiceChannels,
      guild,
      voiceCategoryID,
      createNewVoiceChannelID,
    });
  }
}

async function logVoiceStatusUpdate(
  client: Client<true>,
  userID: string,
  channelID: string,
  verb: string,
) {
  const user = await client.users.fetch(userID);

  // There is a race condition where a channel can be deleted by the time we get here.
  try {
    const channel = await client.channels.fetch(channelID);
    if (channel !== null && channel.isVoiceBased()) {
      logger.info(
        `${verb} voice channel: ${user.username} --> ${channel.name}`,
      );
    }
  } catch {
    // Do nothing if the channel has already been deleted.
  }
}
