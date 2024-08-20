import type { Guild } from "discord.js";
import type { CompositionTypeSatisfiesEnum } from "isaacscript-common-ts";
import { interfaceSatisfiesEnum } from "isaacscript-common-ts";

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
