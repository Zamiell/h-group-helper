import type { CompositionTypeSatisfiesEnum } from "complete-common";
import { interfaceSatisfiesEnum } from "complete-common";
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

export interface QueueElementCreateVoidChannels {
  type: QueueType.CreateNewVoiceChannel;
  guild: Guild;
  userID: string;
  voiceCategoryID: string;
  createNewVoiceChannelID: string;
}

export interface QueueElementDeleteEmptyVoidChannels {
  type: QueueType.DeleteEmptyVoiceChannels;
  guild: Guild;
  voiceCategoryID: string;
  createNewVoiceChannelID: string;
}

// ---------
// Combining
// ---------

export type QueueElement =
  | QueueElementCreateVoidChannels
  | QueueElementDeleteEmptyVoidChannels;

type _Test = CompositionTypeSatisfiesEnum<QueueElement, QueueType>;

export interface QueueTypeToElement {
  [QueueType.CreateNewVoiceChannel]: QueueElementCreateVoidChannels;
  [QueueType.DeleteEmptyVoiceChannels]: QueueElementDeleteEmptyVoidChannels;
}

interfaceSatisfiesEnum<QueueTypeToElement, QueueType>();
