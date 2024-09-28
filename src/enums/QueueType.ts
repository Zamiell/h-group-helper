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

export interface QueueElementCreateNewVoiceChannel {
  type: QueueType.CreateNewVoiceChannel;
  guild: Guild;
  userID: string;
  voiceCategoryID: string;
  createNewVoiceChannelID: string;
}

export interface QueueElementDeleteEmptyVoiceChannels {
  type: QueueType.DeleteEmptyVoiceChannels;
  guild: Guild;
  voiceCategoryID: string;
  createNewVoiceChannelID: string;
}

// ---------
// Combining
// ---------

export type QueueElement =
  | QueueElementCreateNewVoiceChannel
  | QueueElementDeleteEmptyVoiceChannels;

type _Test = CompositionTypeSatisfiesEnum<QueueElement, QueueType>;
