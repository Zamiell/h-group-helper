import type { CompositionTypeSatisfiesEnum } from "complete-common";
import type { Guild } from "discord.js";

// ----
// Enum
// ----

export enum QueueType {
  CreateNewVoiceChannel = "CreateNewVoiceChannel",
  DeleteEmptyVoiceChannels = "DeleteEmptyVoiceChannels",
}

// --------
// Elements
// --------

// Queue entries retain the live, mutable Discord.js guild.
// eslint-disable-next-line complete/type-declaration-immutability
export interface QueueElementCreateNewVoiceChannel {
  readonly type: QueueType.CreateNewVoiceChannel;
  readonly guild: Guild;
  readonly userID: string;
  readonly voiceCategoryID: string;
  readonly voiceCreationChannelID: string;
}

// Queue entries retain the live, mutable Discord.js guild.
// eslint-disable-next-line complete/type-declaration-immutability
export interface QueueElementDeleteEmptyVoiceChannels {
  readonly type: QueueType.DeleteEmptyVoiceChannels;
  readonly guild: Guild;
  readonly voiceCategoryID: string;
  readonly voiceCreationChannelID: string;
}

// ---------
// Combining
// ---------

export type QueueElement =
  QueueElementCreateNewVoiceChannel | QueueElementDeleteEmptyVoiceChannels;

type _Test = CompositionTypeSatisfiesEnum<QueueElement, QueueType>;
