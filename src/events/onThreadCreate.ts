import type { Message, ThreadChannel } from "discord.js";
import { SHARED_REPLAY_REGEX } from "../constants.js";
import {
  getNonEnclosedLinks,
  memberHasRole,
  sendDMWithDeletedMessage,
} from "../discordUtils.js";
import { sendNotHGroupDM } from "../hGroup.js";
import { logger } from "../logger.js";

export const ADDING_MEMBER_TO_THREAD_TEXT = "Adding member to thread.";

const CONVENTION_QUESTIONS_MESSAGE = `Please make sure that your question satisfies all of the rules here:
<https://github.com/hanabi/hanabi.github.io/blob/main/misc/convention-questions.md>
If it doesn't, please edit your question accordingly.`;

const CONVENTION_PROPOSALS_MESSAGE =
  "If you are not already familiar with how this forum works, please review [the convention changes document](<https://github.com/hanabi/hanabi.github.io/blob/main/misc/convention-changes.md>) and [the goals for our conventions](<https://github.com/hanabi/hanabi.github.io/blob/main/misc/convention-goals.md>).";

const MAX_STARTER_MESSAGE_FETCH_ATTEMPTS = 10;

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
    const dmMessage =
      "Your post in the [convention-questions](https://discord.com/channels/140016142600241152/1200785057057611896) forum has been deleted because it contains a screenshot, which explicitly violates rule #2. Before you post in this forum, please make sure that your question satisfies all of the rules here: <https://github.com/hanabi/hanabi.github.io/blob/main/misc/convention-questions.md>";
    await sendDMWithDeletedMessage(
      starterMessage.author,
      dmMessage,
      starterMessage.content,
    );
    await threadChannel.delete();
    return true;
  }

  const replayCommandMatch = starterMessage.content.match(/\/replay \d+\s*\d*/);
  if (replayCommandMatch !== null) {
    const replayText = replayCommandMatch[0].trim();
    const dmMessage = `Your post in the [convention-questions](https://discord.com/channels/140016142600241152/1200785057057611896) forum has been deleted because it contains the text of "${replayText}". Unfortunately, the "/replay" command cannot be combined with other text. If you want to generate a replay URL, please do it in the [#general-lobby channel](<https://discord.com/channels/140016142600241152/140016142600241152>) first, and then copy the resulting URL into your question.`;
    await sendDMWithDeletedMessage(
      starterMessage.author,
      dmMessage,
      starterMessage.content,
    );
    await threadChannel.delete();
    return true;
  }

  const links = getNonEnclosedLinks(starterMessage.content);
  const link = links[0];
  if (link !== undefined) {
    const numLinksText =
      links.length === 1 ? "a link" : `${links.length} links`;
    const dmMessage = `Your post in the [convention-questions](https://discord.com/channels/140016142600241152/1200785057057611896) forum has been deleted because it contains ${numLinksText} with the preview enabled. Please enclose your link(s) with the \`<\` and \`>\` characters to disable the link preview. In other words, convert this:
\`\`\`
${link}
\`\`\`
To this:
\`\`\`
<${link}>
\`\`\``;
    await sendDMWithDeletedMessage(
      starterMessage.author,
      dmMessage,
      starterMessage.content,
    );
    await threadChannel.delete();
    return true;
  }

  const sharedReplayLinks = starterMessage.content.match(SHARED_REPLAY_REGEX);
  if (sharedReplayLinks !== null) {
    const sharedReplayLink = sharedReplayLinks[0];
    const replayLink = sharedReplayLink.replace("shared-replay", "replay");
    const dmMessage = `Your post in the [convention-questions](https://discord.com/channels/140016142600241152/1200785057057611896) forum has been deleted because it contains a shared replay link instead of a normal replay link. Please get rid of the "shared-" part. In other words, convert this:
  \`\`\`
  <${sharedReplayLink}>
  \`\`\`
  To this:
  \`\`\`
  <${replayLink}>
  \`\`\``;
    await sendDMWithDeletedMessage(
      starterMessage.author,
      dmMessage,
      starterMessage.content,
    );
    await threadChannel.delete();
    return true;
  }

  await threadChannel.send(CONVENTION_QUESTIONS_MESSAGE);
  return false;
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
