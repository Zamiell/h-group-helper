import type { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../interfaces/Command.js";

const CONFUSING_MESSAGE =
  'A surprising number of convention questions boil down to some form of: "Is my complicated clue technically legal?" These kind of questions can be interesting, but the person asking the question is often [missing the forest for the trees](<https://www.merriam-webster.com/dictionary/miss%20the%20forest%20for%20the%20trees>): just because a clue is "technically legal" does **not** mean that you should give it. The **most important section of the doc** is the section on [_Clarity Principle_](<https://hanabi.github.io/level-6/#clarity-principle>).';

export const confusingCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("confusing")
    .setDescription("Generate a reminder about _Clarity Principle_."),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply(CONFUSING_MESSAGE);
  },
};
