import { Message } from "discord.js";
import { getLastMessage } from "../discordUtil";
import { parseIntSafe } from "../util";

export async function deleteCommand(
  command: string,
  args: string[],
  message: Message,
  adminIDs: string[],
) {
  if (message.channel.type !== "GUILD_TEXT") {
    return;
  }

  if (!adminIDs.includes(message.author.id)) {
    return;
  }

  // Delete the "/d" message
  await message.delete();

  // Delete the message that is a bad question
  const lastMessage = await getLastMessage(message.channel);
  if (lastMessage !== undefined) {
    await lastMessage.delete();
  }

  const ruleNum = getRuleNum(command, args);
  await sendExplanationPM(message, ruleNum);
}

// The rule number is provided in the command (e.g. "/d1") or as an argument (e.g. "/d 1")
function getRuleNum(command: string, args: string[]): number | null {
  const finalCharacter = command.charAt(command.length - 1);
  const finalCharacterNumber = parseIntSafe(finalCharacter);
  if (!Number.isNaN(finalCharacterNumber)) {
    return finalCharacterNumber;
  }

  if (args.length > 0) {
    const firstArg = args[0];
    const firstArgNumber = parseIntSafe(firstArg);
    if (!Number.isNaN(firstArgNumber)) {
      return firstArgNumber;
    }
  }

  // By default, assume no rule in particular
  return null;
}

async function sendExplanationPM(message: Message, ruleNum: number | null) {
  const ruleText = ruleNum === null ? "one of the 5 rules" : `rule #${ruleNum}`;
  let msg =
    "You asked the following question in the `#convention-questions` channel:\n";
  msg += "```\n";
  msg += message.content;
  msg += "```\n";
  msg += `An administrator thinks that this message might have broken ${ruleText}, so it has been deleted.\n`;
  msg +=
    "Please make sure that your message follows the rules: <https://github.com/hanabi/hanabi.github.io/blob/main/misc/convention-questions.md>";

  await message.author.send(msg);
}
