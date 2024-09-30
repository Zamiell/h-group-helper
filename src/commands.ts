import { ReadonlyMap } from "complete-common";
import type {
  ChatInputCommandInteraction,
  SendableChannels,
  TextBasedChannel,
} from "discord.js";
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

const MESSAGES = new ReadonlyMap([
  [
    "accept",
    `- Some time has passed since this issue was opened and the group appears to have reached a consensus.
- ✔️ This change will be integrated into the official reference document.`,
  ],
  [
    "deny",
    `- Some time has passed since this thread was opened and the group appears to have reached a consensus.
- ❌ This change will **not** be integrated into the official reference document.`,
  ],
  [
    "stale",
    `- Some time has passed since this issue was opened and the discussion appears to have died down.
- 💤 Either the document has already been updated or no additional changes need to be made.`,
  ],
]);

const FOOTER = `- This thread will now be closed. If you feel this was an error, contact a convention admin to re-open the thread.
- For more information on how consensus is determined, please read the [Convention Changes document](https://github.com/hanabi/hanabi.github.io/blob/main/misc/convention-changes.md).`;

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

  const baseMessage = MESSAGES.get(interaction.commandName);
  if (baseMessage === undefined) {
    await interaction.reply({
      content: `Failed to find a message for the command of: ${interaction.commandName}`,
      ephemeral: true,
    });
    return;
  }

  const message = `${baseMessage}\n${FOOTER}`;
  await interaction.reply(message);

  // Remove tag
  // TODO

  // Add tag
  // TODO

  // Lock thread
  // TODO
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
): channel is SendableChannels {
  return (
    channel !== null &&
    channel.isSendable() &&
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
