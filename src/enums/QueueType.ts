import type { CompositionTypeSatisfiesEnum } from "complete-common";
import { interfaceSatisfiesEnum } from "complete-common";
import type { Guild } from "discord.js";

// ----
// Enum
// ----

export enum QueueType {
  CreateVoiceChannels = "CreateVoiceChannels",
  DeleteEmptyVoiceChannels = "DeleteEmptyVoiceChannels",
}

// --------
// Elements
// --------

export interface QueueElementCreateVoidChannels {
  type: QueueType.CreateVoiceChannels;
  guild: Guild;
  userID: string;
  channelID: string;
}

export interface QueueElementDeleteEmptyVoidChannels {
  type: QueueType.DeleteEmptyVoiceChannels;
  guild: Guild;
}

// ---------
// Combining
// ---------

export type QueueElement =
  | QueueElementCreateVoidChannels
  | QueueElementDeleteEmptyVoidChannels;

type _Test = CompositionTypeSatisfiesEnum<QueueElement, QueueType>;

export interface QueueTypeToElement {
  [QueueType.CreateVoiceChannels]: QueueElementCreateVoidChannels;
  [QueueType.DeleteEmptyVoiceChannels]: QueueElementDeleteEmptyVoidChannels;
}

interfaceSatisfiesEnum<QueueTypeToElement, QueueType>();
