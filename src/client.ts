import { Client, GatewayIntentBits } from "discord.js";

// eslint-disable-next-line import/no-mutable-exports
export let client: Client | null = null;

export function initDiscordClient(): void {
  client = new Client({
    // An intent is needed for each type of data that we need Discord to send to us.
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.MessageContent,
    ],
  });
}
