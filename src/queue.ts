// In order to avoid race conditions, we only want to process one voice event at a time. (Otherwise,
// we observe bugs like channels not being properly cleaned up.) Thus, any async voice event
// callbacks will put work onto this queue.

import type { Guild } from "discord.js";
import type { queueAsPromised } from "fastq";
import fastq from "fastq";
import type { QueueElement, QueueTypeToElement } from "./enums/QueueType.js";
import { QueueType } from "./enums/QueueType.js";
import { createVoiceChannels } from "./queueActions/createVoiceChannels.js";
import { deleteEmptyVoiceChannels } from "./queueActions/deleteEmptyVoiceChannels.js";

type QueueFunctions = {
  [Value in QueueType]: (
    queueElement: QueueTypeToElement[Value],
  ) => Promise<void>;
};

const QUEUE_FUNCTIONS = {
  [QueueType.CreateVoiceChannels]: createVoiceChannels,
  [QueueType.DeleteEmptyVoiceChannels]: deleteEmptyVoiceChannels,
} as const satisfies QueueFunctions;

const queue: queueAsPromised<QueueElement, void> = fastq.promise(
  processQueue,
  1,
);

async function processQueue(queueElement: QueueElement) {
  const func = QUEUE_FUNCTIONS[queueElement.type];

  // The compiler is not smart enough to know that the data matches.
  await func(queueElement as never);
}

export function addQueue(
  type: QueueType,
  guild: Guild,
  userID: string,
  channelID: string,
): void {
  const queueElement: QueueElement = {
    type,
    guild,
    userID,
    channelID,
  };

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  queue.push(queueElement);
}
