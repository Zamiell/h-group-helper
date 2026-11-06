import type { Channel, Client, Guild, VoiceState } from "discord.js";
import { QueueType } from "../enums/QueueType.js";
import { logger } from "../logger.js";
import { addQueue } from "../queue.js";

export async function onVoiceStateUpdate(
  oldState: VoiceState,
  newState: VoiceState,
  client: Client<true>,
  voiceCategoryID: string,
  voiceCreationChannelID: string,
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
      voiceCreationChannelID,
    );
  } else if (oldChannelID !== null && newChannelID === null) {
    // something --> null
    await onLeftVoiceChannel(
      client,
      guild,
      userID,
      oldChannelID,
      voiceCategoryID,
      voiceCreationChannelID,
    );
  } else if (oldChannelID !== null && newChannelID !== null) {
    // something --> something
    await onLeftVoiceChannel(
      client,
      guild,
      userID,
      oldChannelID,
      voiceCategoryID,
      voiceCreationChannelID,
    );
    await onJoinedVoiceChannel(
      client,
      guild,
      userID,
      newChannelID,
      voiceCategoryID,
      voiceCreationChannelID,
    );
  }
}

async function onJoinedVoiceChannel(
  client: Client<true>,
  guild: Guild,
  userID: string,
  channelID: string,
  voiceCategoryID: string,
  voiceCreationChannelID: string,
) {
  await logVoiceStatusUpdate(client, userID, channelID, "Joined");

  if (channelID === voiceCreationChannelID) {
    addQueue({
      type: QueueType.CreateNewVoiceChannel,
      guild,
      userID,
      voiceCategoryID,
      voiceCreationChannelID,
    });
  }
}

async function onLeftVoiceChannel(
  client: Client<true>,
  guild: Guild,
  userID: string,
  channelID: string,
  voiceCategoryID: string,
  voiceCreationChannelID: string,
) {
  await logVoiceStatusUpdate(client, userID, channelID, "Left");

  if (channelID !== voiceCreationChannelID) {
    addQueue({
      type: QueueType.DeleteEmptyVoiceChannels,
      guild,
      voiceCategoryID,
      voiceCreationChannelID,
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
  let channel: Channel | null;
  try {
    channel = await client.channels.fetch(channelID);
  } catch {
    // Do nothing if the channel has already been deleted.
    return;
  }

  if (channel !== null && channel.isVoiceBased()) {
    logger.info(`${verb} voice channel: ${user.username} --> ${channel.name}`);
  }
}
