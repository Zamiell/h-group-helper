import type { Message, ThreadChannel } from "discord.js";
import { logger } from "../logger.js";

const CONVENTION_QUESTIONS_MESSAGE = `Please make sure that your question satisfies all of the rules here:
<https://github.com/hanabi/hanabi.github.io/blob/main/misc/convention-questions.md>
If it doesn't, please edit your question accordingly.`;

const CONVENTION_PROPOSALS_MESSAGE =
  "If you are not already familiar with how this forum works, please review [the convention changes document](<https://github.com/hanabi/hanabi.github.io/blob/main/misc/convention-changes.md>) and [the goals for our conventions](<https://github.com/hanabi/hanabi.github.io/blob/main/misc/convention-goals.md>).";

const MAX_STARTER_MESSAGE_FETCH_ATTEMPTS = 10;

/**
 * @see https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
 */
const URL_REGEX =
  /https?:\/\/(www\.)?[\w#%+.:=@~-]{1,256}\.[\d()A-Za-z]{1,6}\b([\w#%&()+./:=?@~-]*)/;

export async function onThreadCreate(
  threadChannel: ThreadChannel,
  questionForumID: string,
  proposalForumID: string,
  openTagID: string,
): Promise<void> {
  await checkConventionQuestions(threadChannel, questionForumID);
  await checkConventionProposals(threadChannel, proposalForumID, openTagID);
}

async function checkConventionQuestions(
  threadChannel: ThreadChannel,
  questionForumID: string,
) {
  if (threadChannel.parentId !== questionForumID) {
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
      `Your post in the convention-questions forum has been deleted because it contains a link with the preview enabled. Please enclose your links in \`<\` and \`>\` characters, which will disable the link preview and make your question easier to read.\n\nFor reference, your post was:\n> ${message.content}`,
    );
    await threadChannel.delete();
  }

  await threadChannel.send(CONVENTION_QUESTIONS_MESSAGE);
}

/**
 * In Discord, you can disable the automatic link preview by enclosing a link in < and > characters.
 * This is usually preferable since it reduces spam.
 */
function isAllLinksEnclosed(message: string): boolean {
  const urls = message.match(URL_REGEX);
  if (urls === null) {
    return true;
  }

  for (const url of urls) {
    if (!message.includes(`<${url}>`)) {
      return false;
    }
  }

  return true;
}

async function checkConventionProposals(
  threadChannel: ThreadChannel,
  proposalForumID: string,
  openTagID: string,
) {
  if (threadChannel.parentId !== proposalForumID) {
    return;
  }

  const starterMessage = await getStarterMessage(threadChannel);
  if (starterMessage === undefined) {
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
