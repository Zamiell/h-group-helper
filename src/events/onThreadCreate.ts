import type { Message, ThreadChannel } from "discord.js";
import {
  memberHasRole,
  sendDMWithDeletedMessage,
  sendNotHGroupDM,
} from "../discordUtils.js";
import { logger } from "../logger.js";

export const ADDING_MEMBER_TO_THREAD_TEXT = "Adding member to thread.";

const CONVENTION_QUESTIONS_MESSAGE = `Please make sure that your question satisfies all of the rules here:
<https://github.com/hanabi/hanabi.github.io/blob/main/misc/convention-questions.md>
If it doesn't, please edit your question accordingly.`;

const CONVENTION_PROPOSALS_MESSAGE =
  "If you are not already familiar with how this forum works, please review [the convention changes document](<https://github.com/hanabi/hanabi.github.io/blob/main/misc/convention-changes.md>) and [the goals for our conventions](<https://github.com/hanabi/hanabi.github.io/blob/main/misc/convention-goals.md>).";

const MAX_STARTER_MESSAGE_FETCH_ATTEMPTS = 10;

const URL_REGEX = /https?:\/\/[^\s<>]+/g;

export async function onThreadCreate(
  threadChannel: ThreadChannel,
  conventionQuestionsForumID: string,
  conventionProposalsForumID: string,
  hGroupRoleID: string,
  openTagID: string,
): Promise<void> {
  // First, ensure that race conditions do not happen.
  const starterMessage = await getStarterMessage(threadChannel);
  if (starterMessage === undefined) {
    return;
  }

  const deleted1 = await checkConventionQuestions(
    threadChannel,
    conventionQuestionsForumID,
    starterMessage,
  );
  const deleted2 = await checkConventionProposals(
    threadChannel,
    conventionProposalsForumID,
    hGroupRoleID,
    openTagID,
    starterMessage,
  );

  const deletingThread = deleted1 || deleted2;
  if (!deletingThread) {
    await autoJoinAdminsToAllThreads(threadChannel);
  }
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

/**
 * It is possible to join an admin to a thread with the `threadChannel.members.add` method. However,
 * this displays a notification of the person being added, which is unnecessary spam. It is also
 * possible to join an admin to a thread by mentioning/pinging them with a message and then deleting
 * that message. However, this is undesirable because it causes a ping instead of a normal message
 * notification. Instead, we can create an arbitrary message, edit the message with a mention, and
 * then delete the message, which will actually add the user without pinging them.
 */
async function autoJoinAdminsToAllThreads(threadChannel: ThreadChannel) {
  await threadChannel.send(ADDING_MEMBER_TO_THREAD_TEXT);
  // (The message is edited and deleted later once it is received by the client.)
}

/** @returns True if the thread will be deleted. */
async function checkConventionQuestions(
  threadChannel: ThreadChannel,
  conventionQuestionsForumID: string,
  starterMessage: Message,
): Promise<boolean> {
  if (threadChannel.parentId !== conventionQuestionsForumID) {
    return false;
  }

  if (starterMessage.attachments.size > 0) {
    const dmChannel = await starterMessage.author.createDM();
    const dmMessage =
      "Your post in the convention-questions forum has been deleted because it contains a screenshot, which explicitly violates rule #2. Before you post in this forum, please make sure that your question satisfies all of the rules here: <https://github.com/hanabi/hanabi.github.io/blob/main/misc/convention-questions.md>";
    await sendDMWithDeletedMessage(
      dmChannel,
      dmMessage,
      starterMessage.content,
    );
    await threadChannel.delete();
    return true;
  }

  if (!isAllLinksEnclosed(starterMessage.content)) {
    const dmChannel = await starterMessage.author.createDM();
    const dmMessage =
      "Your post in the convention-questions forum has been deleted because it contains a link with the preview enabled. Please enclose your link(s) with the `<` and `>` characters to disable the link preview. In other words, convert this:\n```\nhttps://hanab.live/replay/123\n```\nTo this:\n```\n<https://hanab.live/replay/123>\n```";
    await sendDMWithDeletedMessage(
      dmChannel,
      dmMessage,
      starterMessage.content,
    );
    await threadChannel.delete();
    return true;
  }

  await threadChannel.send(CONVENTION_QUESTIONS_MESSAGE);
  return false;
}

/**
 * In Discord, you can disable the automatic link preview by enclosing a link in < and > characters.
 * This is usually preferable because it reduces spam.
 */
function isAllLinksEnclosed(messageContent: string): boolean {
  const urls = messageContent.match(URL_REGEX);
  if (urls === null) {
    return true;
  }

  for (const url of urls) {
    if (!messageContent.includes(`<${url}>`)) {
      return false;
    }
  }

  return true;
}

/** @returns True if the thread will be deleted. */
async function checkConventionProposals(
  threadChannel: ThreadChannel,
  conventionProposalsForumID: string,
  hGroupRoleID: string,
  openTagID: string,
  starterMessage: Message,
): Promise<boolean> {
  if (threadChannel.parentId !== conventionProposalsForumID) {
    return false;
  }

  const isHGroup = await memberHasRole(
    threadChannel.guild,
    starterMessage.author.id,
    hGroupRoleID,
  );
  if (!isHGroup) {
    await sendNotHGroupDM(starterMessage);
    await threadChannel.delete();
    return true;
  }

  await threadChannel.send(CONVENTION_PROPOSALS_MESSAGE);
  await threadChannel.setAppliedTags([openTagID]);
  return false;
}
