import type { ChatInputCommandInteraction, Interaction } from "discord.js";
import { commandMap } from "../commands.js";

export async function onInteractionCreate(
  interaction: Interaction,
  conventionAdminRoleID: string,
): Promise<void> {
  if (interaction.isChatInputCommand()) {
    await onChatInputCommand(interaction, conventionAdminRoleID);
  }
}

async function onChatInputCommand(
  interaction: ChatInputCommandInteraction,
  conventionAdminRoleID: string,
) {
  const command = commandMap.get(interaction.commandName);
  if (command === undefined) {
    throw new Error(`Unknown command: ${interaction.commandName}`);
  }

  await command.execute(interaction, conventionAdminRoleID);
}
