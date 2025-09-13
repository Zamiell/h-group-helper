import { ReadonlyMap } from "complete-common";
import type {
  ChatInputCommandInteraction,
  PublicThreadChannel,
  TextBasedChannel,
} from "discord.js";
import { ChannelType, SlashCommandBuilder } from "discord.js";
import { memberHasRole } from "../discordUtils.js";
import type { Command } from "../interfaces/Command.js";

const MESSAGES = new ReadonlyMap([
  [
    "accept",
    `- Some time has passed since this issue was opened and the group appears to have reached a consensus.
- ✅ This change will be integrated into the official reference document.`,
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
- For more information on how consensus is determined, please read the [Convention Changes document](<https://github.com/hanabi/hanabi.github.io/blob/main/misc/convention-changes.md>).`;

export const acceptCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("accept")
    .setDescription("Accepts a convention proposal.")
    .setDefaultMemberPermissions(0), // Hide the command from everyone except the server owner.
  execute: conventionProposalCommand,
};

export const denyCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("deny")
    .setDescription("Denies a convention proposal.")
    .setDefaultMemberPermissions(0), // Hide the command from everyone except the server owner.
  execute: conventionProposalCommand,
};

export const staleCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("stale")
    .setDescription("Closes a convention proposal due to being stale.")
    .setDefaultMemberPermissions(0), // Hide the command from everyone except the server owner.
  execute: conventionProposalCommand,
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
async function conventionProposalCommand(
  interaction: ChatInputCommandInteraction,
  conventionAdminRoleID: string,
  conventionProposalsID: string,
  closedTagID: string,
) {
  if (interaction.guild === null) {
    return;
  }

  const isConventionAdmin = await memberHasRole(
    interaction.guild,
    interaction.user.id,
    conventionAdminRoleID,
  );
  if (!isConventionAdmin) {
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

  await channel.setAppliedTags([closedTagID]);
  await channel.setLocked();

  // Setting to "archived" is the same as clicking on "Close Post" in the GUI, which makes the
  // thread go to the bottom of the list.
  await channel.setArchived();
}

function inConventionProposalsForum(
  channel: TextBasedChannel | null,
  conventionProposalsID: string,
): channel is PublicThreadChannel<true> {
  return (
    channel !== null
    && channel.type === ChannelType.PublicThread
    && channel.parent !== null
    && channel.parent.type === ChannelType.GuildForum
    && channel.parent.id === conventionProposalsID
  );
}
