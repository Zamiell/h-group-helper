// In order to avoid race conditions, we only want to process one voice event at a time. (Otherwise,
// we observe bugs like channels not being properly cleaned up.) Thus, any async voice event
// callbacks will put work onto this queue.

import type { Guild } from "discord.js";
import { autoCreateVoiceChannels } from "./autoCreateVoiceChannels.js";
import { autoDeleteEmptyVoiceChannels } from "./autoDeleteEmptyVoiceChannels.js";

export enum QueueFunction {
  AutoCreateVoiceChannels,
  AutoDeleteEmptyVoiceChannels,
}

type QueueTuple = [
  queueFunction: QueueFunction,
  guild: Guild,
  userID: string,
  channelID: string,
];

const queue: QueueTuple[] = [];

export function addQueue(
  queueFunction: QueueFunction,
  guild: Guild,
  userID: string,
  channelID: string,
): void {
  const queueTuple: QueueTuple = [queueFunction, guild, userID, channelID];
  queue.push(queueTuple);

  // If the queue was previously empty, asynchronously schedule work to begin.
  if (queue.length === 1) {
    setTimeout(() => {
      processQueue().catch((error) => {
        console.error("Failed to process the queue:", error);
      });
    }, 0);
  }
}

async function processQueue() {
  let queueEmpty: boolean;
  do {
    queueEmpty = await processQueueElement(); // eslint-disable-line no-await-in-loop
  } while (!queueEmpty);
}

/** Returns whether or not the queue is currently empty. */
async function processQueueElement() {
  const queueTuple = queue.shift();
  if (queueTuple === undefined) {
    return true;
  }

  const [queueFunction, guild, userID, channelID] = queueTuple;

  switch (queueFunction) {
    case QueueFunction.AutoCreateVoiceChannels: {
      await autoCreateVoiceChannels(guild, userID, channelID);
      break;
    }

    case QueueFunction.AutoDeleteEmptyVoiceChannels: {
      await autoDeleteEmptyVoiceChannels(guild, channelID);
      break;
    }
  }

  return false;
}
