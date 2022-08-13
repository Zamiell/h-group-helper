import { ChannelType, Message } from "discord.js";

const NEW_THREAD_AUTO_MESSAGE = `Please make sure that your question satisfies all of the rules here:
<https://github.com/hanabi/hanabi.github.io/blob/main/misc/convention-questions.md>
If it doesn't, please edit your question now to fix any rule violations.`;

export async function autoStartThread(
  message: Message,
  questionChannelID: string,
): Promise<void> {
  // Ignore all messages that are not in the question channel.
  if (message.channelId !== questionChannelID) {
    return;
  }

  // Perform necessary type narrowing.
  if (message.channel.type !== ChannelType.GuildText) {
    return;
  }

  // cspell:ignore Alices
  // Discord does not allow quotes in thread names, so this will appear as: "Alices question"
  const suffix = message.author.username.endsWith("s") ? "" : "s";
  const threadName = `${message.author.username}${suffix} question`;

  const threadChannel = await message.channel.threads.create({
    name: threadName,
    startMessage: message,
  });

  await threadChannel.send(NEW_THREAD_AUTO_MESSAGE);
}
