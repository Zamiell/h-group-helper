import type { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../interfaces/Command.js";

const BASE_URL = "https://hanab.live/replay";

const DATABASE_ID_OPTION = "database-id";
const TURN_OPTION = "turn";

export const replayCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("replay")
    .setDescription("Generate a link to a replay on Hanab Live.")
    .addIntegerOption((option) =>
      option
        .setName(DATABASE_ID_OPTION)
        .setDescription("The database ID that appears on the top of the deck.")
        .setRequired(true)
        .setMinValue(1),
    )
    .addIntegerOption(
      (option) =>
        option
          .setName(TURN_OPTION)
          .setDescription(
            "Optional. The specific turn number to link to, if any.",
          )
          .setRequired(false)
          .setMinValue(2), // Linking to the first turn would be superfluous.
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const databaseID = interaction.options.getNumber(DATABASE_ID_OPTION);
    if (databaseID === null) {
      await interaction.reply({
        content: "The database ID is required as the first argument.",
        ephemeral: true,
      });
      return;
    }

    const turn = interaction.options.getNumber(TURN_OPTION) ?? undefined;
    const url = getReplayURL(databaseID, turn);

    // Enclose the URL in "<" and ">" to prevent Discord from generating a link preview.
    await interaction.reply(`<${url}>`);
  },
};

function getReplayURL(databaseID: number, turn?: number) {
  let url = `${BASE_URL}/${databaseID}`;

  if (turn !== undefined) {
    url += `/${turn}`;
  }

  return url;
}
