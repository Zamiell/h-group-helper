import type { ChatInputCommandInteraction, Interaction } from "discord.js";
import { commandMap } from "../commands.js";

export async function onInteractionCreate(
  interaction: Interaction,
  adminIDs: readonly string[],
): Promise<void> {
  if (interaction.isChatInputCommand()) {
    await onChatInputCommand(interaction, adminIDs);
  }
}

async function onChatInputCommand(
  interaction: ChatInputCommandInteraction,
  adminIDs: readonly string[],
) {
  const command = commandMap.get(interaction.commandName);
  if (command === undefined) {
    throw new Error(`Unknown command: ${interaction.commandName}`);
  }

  await command.execute(interaction, adminIDs);
}
