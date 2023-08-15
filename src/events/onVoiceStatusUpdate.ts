import type { Guild, VoiceState } from "discord.js";
import { client } from "../client.js";
import { logger } from "../logger.js";
import { QueueType, addQueue } from "../queue.js";

export function onVoiceStateUpdate(
  oldState: VoiceState,
  newState: VoiceState,
): void {
  const { guild } = newState;
  const userID = newState.id;
  const oldChannelID = oldState.channelId;
  const newChannelID = newState.channelId;

  if (newChannelID !== null && newChannelID !== oldChannelID) {
    onJoinedVoiceChannel(guild, userID, newChannelID);
  } else if (newChannelID === null && oldChannelID !== null) {
    onLeftVoiceChannel(userID, oldChannelID);
  }

  addQueue(QueueType.DeleteEmptyVoiceChannels, guild, "", "");
}

function onJoinedVoiceChannel(guild: Guild, userID: string, channelID: string) {
  logVoiceStatusUpdate(userID, channelID, "Joined");
  addQueue(QueueType.CreateVoiceChannels, guild, userID, channelID);
}

function onLeftVoiceChannel(userID: string, channelID: string) {
  logVoiceStatusUpdate(userID, channelID, "Left");
}

function logVoiceStatusUpdate(userID: string, channelID: string, verb: string) {
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
