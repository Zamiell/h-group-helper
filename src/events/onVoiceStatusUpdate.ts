import type { Client, Guild, VoiceState } from "discord.js";
import { QueueType } from "../enums/QueueType.js";
import { logger } from "../logger.js";
import { addQueue } from "../queue.js";

export function onVoiceStateUpdate(
  oldState: VoiceState,
  newState: VoiceState,
  client: Client<true>,
  voiceCategoryID: string,
  createNewVoiceChannelID: string,
): void {
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
    onJoinedVoiceChannel(
      client,
      guild,
      userID,
      newChannelID,
      voiceCategoryID,
      createNewVoiceChannelID,
    );
  } else if (oldChannelID !== null && newChannelID === null) {
    // something --> null
    onLeftVoiceChannel(
      client,
      guild,
      userID,
      oldChannelID,
      voiceCategoryID,
      createNewVoiceChannelID,
    );
  } else if (oldChannelID !== null && newChannelID !== null) {
    // something --> something
    onLeftVoiceChannel(
      client,
      guild,
      userID,
      oldChannelID,
      voiceCategoryID,
      createNewVoiceChannelID,
    );
    onJoinedVoiceChannel(
      client,
      guild,
      userID,
      newChannelID,
      voiceCategoryID,
      createNewVoiceChannelID,
    );
  }
}

function onJoinedVoiceChannel(
  client: Client<true>,
  guild: Guild,
  userID: string,
  channelID: string,
  voiceCategoryID: string,
  createNewVoiceChannelID: string,
) {
  logVoiceStatusUpdate(client, userID, channelID, "Joined");

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

function onLeftVoiceChannel(
  client: Client<true>,
  guild: Guild,
  userID: string,
  channelID: string,
  voiceCategoryID: string,
  createNewVoiceChannelID: string,
) {
  logVoiceStatusUpdate(client, userID, channelID, "Left");

  if (channelID !== createNewVoiceChannelID) {
    addQueue({
      type: QueueType.DeleteEmptyVoiceChannels,
      guild,
      voiceCategoryID,
      createNewVoiceChannelID,
    });
  }
}

function logVoiceStatusUpdate(
  client: Client<true>,
  userID: string,
  channelID: string,
  verb: string,
) {
  const user = client.users.cache.get(userID);
  if (user === undefined) {
    return;
  }

  const channel = client.channels.cache.get(channelID);
  if (channel === undefined || !channel.isVoiceBased()) {
    return;
  }

  logger.info(
    `${verb} voice channel: ${user.username}#${user.discriminator} (${userID}) --> ${channel.name}`,
  );
}
