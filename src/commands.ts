import type { ChatInputCommandInteraction } from "discord.js";
import { ChannelType, SlashCommandBuilder } from "discord.js";

interface Command {
  data: SlashCommandBuilder;
  execute:
    | ((
        interaction: ChatInputCommandInteraction,
        conventionAdminRoleID: string,
        conventionProposalsID: string,
      ) => void)
    | ((
        interaction: ChatInputCommandInteraction,
        conventionAdminRoleID: string,
        conventionProposalsID: string,
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
  conventionAdminRoleID: string,
  conventionProposalsID: string,
) {
  if (interaction.guild === null) {
    await interaction.reply({
      content:
        "Failed to find the Discord server corresponding to the interaction.",
      ephemeral: true,
    });
    return;
  }

  const member = interaction.guild.members.cache.get(interaction.user.id);
  if (member === undefined) {
    await interaction.reply({
      content: "Failed to find your user in the Discord server.",
      ephemeral: true,
    });
    return;
  }

  if (!member.roles.cache.has(conventionAdminRoleID)) {
    await interaction.reply({
      content: "You are not authorized to perform this command.",
      ephemeral: true,
    });
    return;
  }

  const { channel } = interaction;

  if (channel === null) {
    await interaction.reply({
      content: 'You must use this command in the "convention-proposals" forum.',
      ephemeral: true,
    });
    return;
  }

  if (!channel.isSendable()) {
    await interaction.reply({
      content: 'You must use this command in the "convention-proposals" forum.',
      ephemeral: true,
    });
    return;
  }

  if (!("parent" in channel)) {
    await interaction.reply({
      content: 'You must use this command in the "convention-proposals" forum.',
      ephemeral: true,
    });
    return;
  }

  if (channel.parent === null) {
    await interaction.reply({
      content: 'You must use this command in the "convention-proposals" forum.',
      ephemeral: true,
    });
    return;
  }

  if (channel.parent.type !== ChannelType.GuildForum) {
    await interaction.reply({
      content: 'You must use this command in the "convention-proposals" forum.',
      ephemeral: true,
    });
    return;
  }

  if (channel.parent.id !== conventionProposalsID) {
    await interaction.reply({
      content: 'You must use this command in the "convention-proposals" forum.',
      ephemeral: true,
    });
    return;
  }

  await interaction.reply({
    content: "test",
    ephemeral: true,
  });
}

export const commandMap = new Map<string, Command>([
  ["accept", accept],
  ["deny", deny],
  ["stale", stale],
]);
