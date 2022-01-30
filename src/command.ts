import { Message } from "discord.js";
import { deleteCommand } from "./commands/delete";

const COMMAND_PREFIX = "/";

export async function checkCommand(
  message: Message,
  ourID: string,
  adminIDs: string[],
) {
  if (message.channel.type !== "GUILD_TEXT") {
    return;
  }

  if (message.author.id === ourID) {
    return;
  }

  const args = message.content.split(" ");
  let command = args.shift();
  if (command === undefined) {
    return;
  }
  if (!command.startsWith(COMMAND_PREFIX)) {
    return;
  }
  command = command.substring(COMMAND_PREFIX.length); // Remove the command prefix
  command = command.toLowerCase();

  const commandFunction = commandFunctions.get(command);
  if (commandFunction === undefined) {
    return;
  }

  await commandFunction(command, args, message, adminIDs);
}

const commandFunctions = new Map<
  string,
  (
    command: string,
    args: string[],
    message: Message,
    adminIDs: string[],
  ) => Promise<void>
>();

commandFunctions.set("d", deleteCommand);
commandFunctions.set("d1", deleteCommand);
commandFunctions.set("d2", deleteCommand);
commandFunctions.set("d3", deleteCommand);
commandFunctions.set("d4", deleteCommand);
commandFunctions.set("d5", deleteCommand);
commandFunctions.set("d6", deleteCommand);
