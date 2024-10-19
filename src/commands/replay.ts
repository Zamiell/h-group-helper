import type { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../interfaces/Command.js";

const BASE_URL = "https://hanab.live/replay/";

const DATABASE_ID_NAME = "database ID";
const TURN_NUMBER_NAME = "turn number";

export const replayCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("replay")
    .setDescription("Generate a link to a replay on Hanab Live.")
    .addNumberOption((option) =>
      option.setName(DATABASE_ID_NAME).setRequired(true),
    )
    .addNumberOption((option) =>
      option.setName(TURN_NUMBER_NAME).setRequired(false),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const databaseID = interaction.options.getNumber(DATABASE_ID_NAME);
    if (databaseID === null) {
      await interaction.reply({
        content: "The database ID is required as the first argument.",
        ephemeral: true,
      });
      return;
    }

    const turn = interaction.options.getNumber(TURN_NUMBER_NAME) ?? undefined;
    const url = getReplayURL(databaseID, turn);
    await interaction.reply(url);
  },
};

function getReplayURL(databaseID: number, turn?: number) {
  let url = `${BASE_URL}/${databaseID}`;

  if (turn !== undefined) {
    url += `/${turn}`;
  }

  return url;
}
