import { Guild, VoiceState } from "discord.js";
import { client } from "../client";
import g from "../globals";
import { log } from "../log";
import { QueueFunction, addQueue } from "../queue";

export function onVoiceStateUpdate(
  oldState: VoiceState,
  newState: VoiceState,
): void {
  if (!g.ready) {
    return;
  }

  const { guild } = newState;
  const userID = newState.id;
  const oldChannelID = oldState.channelId;
  const newChannelID = newState.channelId;

  if (newChannelID !== null && newChannelID !== oldChannelID) {
    onJoinedVoiceChannel(guild, userID, newChannelID);
  } else if (newChannelID === null && oldChannelID !== null) {
    onLeftVoiceChannel(guild, userID, oldChannelID);
  }
}

function onJoinedVoiceChannel(guild: Guild, userID: string, channelID: string) {
  logVoiceStatusUpdate(userID, channelID, "Joined");
  addQueue(QueueFunction.AutoCreateVoiceChannels, guild, userID, channelID);
}

function onLeftVoiceChannel(guild: Guild, userID: string, channelID: string) {
  logVoiceStatusUpdate(userID, channelID, "Left");
  addQueue(
    QueueFunction.AutoDeleteEmptyVoiceChannels,
    guild,
    userID,
    channelID,
  );
}

function logVoiceStatusUpdate(userID: string, channelID: string, verb: string) {
  if (client === null) {
    return;
  }

  const user = client.users.cache.get(userID);
  if (user === undefined) {
    return;
  }

  const channel = client.channels.cache.get(channelID);
  if (channel === undefined || !channel.isVoiceBased()) {
    return;
  }

  log.info(
    `${verb} voice channel: ${user.username}#${user.discriminator} (${userID}) --> ${channel.name}`,
  );
}
