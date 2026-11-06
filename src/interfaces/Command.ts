import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";

export interface Command {
  readonly data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  readonly execute: (
    interaction: ChatInputCommandInteraction,
    conventionAdminRoleID: string,
    conventionProposalsID: string,
    closedTagID: string,
  ) => Promise<void>;
}
