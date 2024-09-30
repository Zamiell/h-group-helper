import { getEnv } from "complete-node";
import { z } from "zod";

const envSchema = z.object({
  /**
   * The token from a Discord account used for the bot:
   * https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token
   */
  DISCORD_TOKEN: z.string().min(1),

  /**
   * The application ID from: https://discord.com/developers/applications/[app_id]/information
   * (This is also known as the client ID.)
   */
  DISCORD_APPLICATION_ID: z.string().min(1),

  /**
   * The numerical ID of the Discord server to operate in. To get it, right click on the server and
   * select "Copy Server ID". (This is also known as the guild ID.)
   */
  DISCORD_SERVER_ID: z.string().min(1),

  /**
   * The name of the Discord voice channel category that all of the bot-managed voice channels will
   * reside in. e.g. "H-Group Pickup Games"
   */
  VOICE_CATEGORY_NAME: z.string().min(1),

  /** A comma separated list of Discord user IDs. */
  ADMIN_IDS: z.string().min(1),
});

export const env = getEnv(envSchema);
