// In order to avoid race conditions, we only want to process one voice event at a time. (Otherwise,
// we observe bugs like channels not being properly cleaned up.) Thus, any async voice event
// callbacks will put work onto this queue.

import type { Guild } from "discord.js";
import { createVoiceChannels } from "./queueActions/createVoiceChannels.js";
import { deleteEmptyVoiceChannels } from "./queueActions/deleteEmptyVoiceChannels.js";

export enum QueueType {
  CreateVoiceChannels = "CreateVoiceChannels",
  DeleteEmptyVoiceChannels = "DeleteEmptyVoiceChannels",
}

interface QueueElement {
  queueType: QueueType;
  guild: Guild;
  userID: string;
  channelID: string;
}

const queue: QueueElement[] = [];

export function addQueue(
  queueType: QueueType,
  guild: Guild,
  userID: string,
  channelID: string,
): void {
  const queueElement: QueueElement = {
    queueType,
    guild,
    userID,
    channelID,
  };
  queue.push(queueElement);

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

/** @returns Whether the queue is currently empty. */
async function processQueueElement() {
  const queueElement = queue.shift();
  if (queueElement === undefined) {
    return true;
  }

  const { queueType, guild, userID, channelID } = queueElement;

  switch (queueType) {
    case QueueType.CreateVoiceChannels: {
      await createVoiceChannels(guild, userID, channelID);
      break;
    }

    case QueueType.DeleteEmptyVoiceChannels: {
      await deleteEmptyVoiceChannels(guild);
      break;
    }
  }

  return false;
}
