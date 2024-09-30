import type { ChatInputCommandInteraction } from "discord.js";
import { ForumChannel, SlashCommandBuilder } from "discord.js";

interface Command {
  data: SlashCommandBuilder;
  execute:
    | ((
        interaction: ChatInputCommandInteraction,
        adminIDs: readonly string[],
      ) => void)
    | ((
        interaction: ChatInputCommandInteraction,
        adminIDs: readonly string[],
      ) => Promise<void>);
}

const accept: Command = {
  data: new SlashCommandBuilder()
    .setName("accept")
    .setDescription("Accepts a convention proposal.")
    .setDefaultMemberPermissions(0), // Hide the command from everyone except the server owner.
  execute: conventionProposalCommand,
};

const deny: Command = {
  data: new SlashCommandBuilder()
    .setName("deny")
    .setDescription("Denies a convention proposal.")
    .setDefaultMemberPermissions(0), // Hide the command from everyone except the server owner.
  execute: conventionProposalCommand,
};

const stale: Command = {
  data: new SlashCommandBuilder()
    .setName("stale")
    .setDescription("Closes a convention proposal due to being stale.")
    .setDefaultMemberPermissions(0), // Hide the command from everyone except the server owner.
  execute: conventionProposalCommand,
};

async function conventionProposalCommand(
  interaction: ChatInputCommandInteraction,
  adminIDs: readonly string[],
) {
  if (adminIDs.includes(interaction.user.id)) {
    await interaction.reply("You are not authorized to perform this command.");
    return;
  }

  const { channel } = interaction;

  if (channel === null) {
    return;
  }

  console.log(channel instanceof ForumChannel);

  if (channel instanceof ForumChannel) {
    console.log("YES");
  } else {
    console.log("NO");
  }

  /*
  if (interaction.channel === null || !interaction.channel.isSendable()) {
    return;
  }

  interaction.commandName

  await interaction.channel.send("hello");
  */
}

export const commandMap = new Map<string, Command>([
  ["accept", accept],
  ["deny", deny],
  ["stale", stale],
]);
