import type { ChatInputCommandInteraction, TextBasedChannel } from "discord.js";
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
  if (!isConventionAdmin(interaction, conventionAdminRoleID)) {
    await interaction.reply({
      content: "You are not authorized to perform this command.",
      ephemeral: true,
    });
    return;
  }

  const { channel } = interaction;

  if (!inConventionProposalsForum(channel, conventionProposalsID)) {
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

function isConventionAdmin(
  interaction: ChatInputCommandInteraction,
  conventionAdminRoleID: string,
): boolean {
  if (interaction.guild === null) {
    return false;
  }

  const member = interaction.guild.members.cache.get(interaction.user.id);
  if (member === undefined) {
    return false;
  }

  return member.roles.cache.has(conventionAdminRoleID);
}

function inConventionProposalsForum(
  channel: TextBasedChannel | null,
  conventionProposalsID: string,
): boolean {
  return (
    channel !== null &&
    "parent" in channel &&
    channel.parent !== null &&
    channel.parent.type === ChannelType.GuildForum &&
    channel.parent.id === conventionProposalsID
  );
}

export const commandMap = new Map<string, Command>([
  ["accept", accept],
  ["deny", deny],
  ["stale", stale],
]);
