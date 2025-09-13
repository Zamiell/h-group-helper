import { getEnv } from "complete-node";
import { z } from "zod";

const envSchema = z.object({
  /**
   * The application ID from: https://discord.com/developers/applications/[app_id]/information
   * (This is also known as the client ID.) If needed, use this tutorial to set up a new
   * application:
   * https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token
   * Here is an example of an invite link:
   * https://discord.com/oauth2/authorize?scope=bot&permissions=8&client_id=336606503182008321
   */
  DISCORD_APPLICATION_ID: z.string().min(1),

  /**
   * The token from a Discord account used for the bot:
   * https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token
   */
  DISCORD_TOKEN: z.string().min(1),

  /**
   * The numerical ID of the Discord server to operate in. To get it, right click on the server and
   * select "Copy Server ID". (This is also known as the guild ID.)
   */
  DISCORD_SERVER_ID: z.string().min(1),
});

await getEnv(import.meta.dirname);
export const env = envSchema.parse(process.env);
