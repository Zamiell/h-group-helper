import type { Message, ThreadChannel } from "discord.js";
import { memberHasRole } from "../discordUtils.js";
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
  await autoJoinAdminsToAllThreads(threadChannel);
  await checkConventionQuestions(threadChannel, conventionQuestionsForumID);
  await checkConventionProposals(
    threadChannel,
    conventionProposalsForumID,
    hGroupRoleID,
    openTagID,
  );
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

async function checkConventionQuestions(
  threadChannel: ThreadChannel,
  conventionQuestionsForumID: string,
) {
  if (threadChannel.parentId !== conventionQuestionsForumID) {
    return;
  }

  const message = await getStarterMessage(threadChannel);
  if (message === undefined) {
    return;
  }

  if (message.attachments.size > 0) {
    const dmChannel = await message.author.createDM();
    await dmChannel.send(
      `Your post in the convention-questions forum has been deleted because it contains a screenshot, which explicitly violates rule #2. Before you post in this forum, please make sure that your question satisfies all of the rules here: <https://github.com/hanabi/hanabi.github.io/blob/main/misc/convention-questions.md>\n\nFor reference, your post was:\n> ${message.content}`,
    );
    await threadChannel.delete();
    return;
  }

  if (!isAllLinksEnclosed(message.content)) {
    const dmChannel = await message.author.createDM();
    await dmChannel.send(
      `Your post in the convention-questions forum has been deleted because it contains a link with the preview enabled. Please enclose your links in \`<\` and \`>\` characters, like the following: \`<https://hanab.live/replay/123>\`\n\nFor reference, your post was:\n> ${message.content}`,
    );
    await threadChannel.delete();
    return;
  }

  await threadChannel.send(CONVENTION_QUESTIONS_MESSAGE);
}

/**
 * In Discord, you can disable the automatic link preview by enclosing a link in < and > characters.
 * This is usually preferable since it reduces spam.
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

async function checkConventionProposals(
  threadChannel: ThreadChannel,
  conventionProposalsForumID: string,
  hGroupRoleID: string,
  openTagID: string,
) {
  if (threadChannel.parentId !== conventionProposalsForumID) {
    return;
  }

  const message = await getStarterMessage(threadChannel);
  if (message === undefined) {
    return;
  }

  const isHGroup = await memberHasRole(
    threadChannel.guild,
    message.author.id,
    hGroupRoleID,
  );
  if (!isHGroup) {
    const dmChannel = await message.author.createDM();
    await dmChannel.send(
      `Your post in the convention-proposals forum has been deleted because you do not have the "H-Group" role. Do you regularly play pick-up games in this Discord server using the voice channels? If so, please request the "H-Group" role from a Discord moderator. You can find the current list of moderators in the #role-explanations channel.\n\nFor reference, your post was:\n> ${message.content}`,
    );
    await threadChannel.delete();
    return;
  }

  await threadChannel.send(CONVENTION_PROPOSALS_MESSAGE);
  await threadChannel.setAppliedTags([openTagID]);
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
