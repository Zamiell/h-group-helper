import type { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../interfaces/Command.js";

const UNDEFINED_MESSAGE = `Newer players to the H-Group are used to having every situation be completely fleshed out by the doc/website. This feels good, as everything has a "right" answer. But as newer players get more experience, they inevitably discover a situation that is undefined. This feels shocking, so they often post a message to the #convention-questions forum with the title of:

**Why isn't situation X defined in the convention docs?**

The same type of thing happens with the #convention-proposals forum: after playing a game in which an intermediate player discovers an undefined situation, they realize that this is "uncharted territory", and that they can "help" the group by "charting it" via adding a brand new move/convention. So they post something like:

**Situation X is undefined. Can I propose a new convention to define it?**

The answer to "why isn't situation X defined" and "can I propose a convention for situation X" is the same: **not everything has to have a meaning.** We **intentionally** want to have situations be undefined so that players have wiggle room to handle a wide variety of game states. The [convention goals document](https://github.com/hanabi/hanabi.github.io/blob/main/misc/convention-goals.md) goes over why it is actually detrimental to the group to add new conventions and is a very important read for intermediate players who are starting to think about the meta-game of creating and managing conventions.`;

export const undefinedCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("undefined")
    .setDescription(
      "Generate a reminder about why situations do not have to be undefined.",
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply(UNDEFINED_MESSAGE);
  },
};
