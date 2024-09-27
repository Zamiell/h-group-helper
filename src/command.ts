import type { Message } from "discord.js";

const COMMAND_PREFIX = "/";

export async function checkCommand(
  message: Message,
  adminIDs: readonly string[],
): Promise<void> {
  const args = message.content.split(" ");
  let command = args.shift();
  if (command === undefined) {
    return;
  }
  if (!command.startsWith(COMMAND_PREFIX)) {
    return;
  }
  command = command.slice(COMMAND_PREFIX.length); // Remove the command prefix.
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
    args: readonly string[],
    message: Message,
    adminIDs: readonly string[],
  ) => Promise<void>
>();
