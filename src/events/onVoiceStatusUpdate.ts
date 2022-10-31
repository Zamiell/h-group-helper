import { Guild, VoiceState } from "discord.js";
import { client } from "../client";
import g from "../globals";
import { addQueue, QueueFunction } from "../queue";

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
  logVoiceStatusUpdate(userID, "Joined");
  addQueue(QueueFunction.AutoCreateVoiceChannels, guild, userID, channelID);
}

function onLeftVoiceChannel(guild: Guild, userID: string, channelID: string) {
  logVoiceStatusUpdate(userID, "Left");
  addQueue(
    QueueFunction.AutoDeleteEmptyVoiceChannels,
    guild,
    userID,
    channelID,
  );
}

function logVoiceStatusUpdate(userID: string, verb: string) {
  if (client === null) {
    return;
  }

  const user = client.users.cache.get(userID);
  if (user !== undefined) {
    console.log(
      `${verb} voice channel: ${user.username}#${user.discriminator} (${userID})`,
    );
  }
}
