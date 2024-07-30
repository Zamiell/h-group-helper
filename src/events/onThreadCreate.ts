import type { ThreadChannel } from "discord.js";
import { g } from "../globals.js";

const NEW_THREAD_AUTO_MESSAGE = `Please make sure that your question satisfies all of the rules here:
<https://github.com/hanabi/hanabi.github.io/blob/main/misc/convention-questions.md>
If it doesn't, please edit your question accordingly.`;

export async function onThreadCreate(
  threadChannel: ThreadChannel,
): Promise<void> {
  // Ignore all messages that are not in the #convention-questions forum.
  if (threadChannel.parentId !== g.questionChannelID) {
    return;
  }

  // There is a race condition where this event can fire before the initial message has loaded.
  // https://github.com/discord/discord-api-docs/issues/6340
  const starterMessage = await threadChannel.fetchStarterMessage();
  if (starterMessage === null) {
    await onThreadCreate(threadChannel);
    return;
  }

  await threadChannel.send(NEW_THREAD_AUTO_MESSAGE);
}
