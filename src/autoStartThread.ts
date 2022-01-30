import { Message } from "discord.js";

export async function autoStartThread(
  message: Message,
  questionChannelID: string,
) {
  // Ignore all messages that are not in the question channel
  if (message.channelId !== questionChannelID) {
    return;
  }

  // Perform necessary type narrowing
  if (message.channel.type !== "GUILD_TEXT") {
    return;
  }

  const suffix = message.author.username.endsWith("s") ? "" : "s";
  const threadName = `${message.author.username}'${suffix} question`;

  await message.channel.threads.create({
    name: threadName,
    startMessage: message,
  });
}
