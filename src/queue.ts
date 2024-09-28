// In order to avoid race conditions, we only want to process one voice event at a time. (Otherwise,
// we observe bugs like channels not being properly cleaned up.) Thus, any work that involves async
// voice events is put onto a queue.

import type { queueAsPromised } from "fastq";
import fastq from "fastq";
import type { QueueElement } from "./enums/QueueType.js";
import { QueueType } from "./enums/QueueType.js";
import { logger } from "./logger.js";
import { createNewVoiceChannel } from "./queueActions/createNewVoiceChannel.js";
import { deleteEmptyVoiceChannels } from "./queueActions/deleteEmptyVoiceChannels.js";

const queue: queueAsPromised<QueueElement, void> = fastq.promise(
  processQueue,
  1,
);

async function processQueue(queueElement: QueueElement) {
  logger.debug(
    `Starting to process a queue element of type "${queueElement.type}". (There are ${queue.length()} elements left in the queue.)`,
  );

  switch (queueElement.type) {
    case QueueType.CreateNewVoiceChannel: {
      await createNewVoiceChannel(queueElement);
      break;
    }

    case QueueType.DeleteEmptyVoiceChannels: {
      await deleteEmptyVoiceChannels(queueElement);
      break;
    }
  }

  logger.debug(
    `Finished processing a queue element of type "${queueElement.type}". (There are ${queue.length()} elements left in the queue.)`,
  );
}

export function addQueue(queueElement: QueueElement): void {
  queue.push(queueElement); // eslint-disable-line @typescript-eslint/no-floating-promises
}
