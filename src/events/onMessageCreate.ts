import { Message } from "discord.js";
import { autoStartThread } from "../autoStartThread";
import { checkCommand } from "../command";
import g from "../globals";

export async function onMessageCreate(message: Message) {
  if (!g.ready) {
    return;
  }

  logDiscordTextMessage(message);

  // Ignore anything not in a text channel
  if (message.channel.type !== "GUILD_TEXT") {
    return;
  }

  // Ignore our own messages
  if (message.author.id === g.botID) {
    return;
  }

  await checkCommand(message, g.adminIDs);
  await autoStartThread(message, g.questionChannelID);
}

function logDiscordTextMessage(message: Message) {
  const channelName =
    message.channel.type === "DM" ? "DM" : `#${message.channel.name}`;

  console.log(
    `[${channelName}] <${message.author.username}#${message.author.discriminator}> ${message.content}`,
  );
}
