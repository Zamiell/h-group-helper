import type { Message, ThreadChannel } from "discord.js";
import { g } from "../globals.js";
import { logger } from "../logger.js";

const NEW_THREAD_AUTO_MESSAGE = `Please make sure that your question satisfies all of the rules here:
<https://github.com/hanabi/hanabi.github.io/blob/main/misc/convention-questions.md>
If it doesn't, please edit your question accordingly.`;

const MAX_STARTER_MESSAGE_FETCH_ATTEMPTS = 10;

export async function onThreadCreate(
  threadChannel: ThreadChannel,
): Promise<void> {
  // Ignore all messages that are not in the #convention-questions forum.
  if (threadChannel.parentId !== g.questionChannelID) {
    return;
  }

  const starterMessage = await getStarterMessage(threadChannel);
  if (starterMessage === undefined) {
    return;
  }

  await threadChannel.send(NEW_THREAD_AUTO_MESSAGE);
}

/**
 * There is a race condition where the `onThreadCreate` event can fire before the initial message
 * has loaded.
 *
 * @see https://github.com/discord/discord-api-docs/issues/6340
 */
async function getStarterMessage(
  threadChannel: ThreadChannel,
): Promise<Message | undefined> {
  for (let i = 0; i < MAX_STARTER_MESSAGE_FETCH_ATTEMPTS; i++) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const starterMessage = await threadChannel.fetchStarterMessage();
      if (starterMessage !== null) {
        return starterMessage;
      }
    } catch {
      // Do nothing and try again.
      logger.info(
        `Failed to fetch starter message for thread ${threadChannel.id}. (On attempt ${i + 1} / ${MAX_STARTER_MESSAGE_FETCH_ATTEMPTS}.)`,
      );
    }
  }

  return undefined;
}
