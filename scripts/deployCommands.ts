// In Discord, slash commands must be registered a separate script. See:
// https://discordjs.guide/creating-your-bot/command-deployment.html#command-registration

/* eslint-disable @typescript-eslint/no-restricted-imports */

import { REST, Routes } from "discord.js";
import { commandMap } from "../src/commands.js";
import { env } from "../src/env.js";

const rest = new REST().setToken(env.DISCORD_TOKEN);

const commands = [...commandMap.values()];
const body = commands.map((command) => command.data.toJSON());

await rest.put(
  Routes.applicationGuildCommands(
    env.DISCORD_APPLICATION_ID,
    env.DISCORD_SERVER_ID,
  ),
  { body },
);
