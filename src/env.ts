import { getEnv } from "complete-node";
import { z } from "zod";

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_SERVER_NAME: z.string().min(1),
  VOICE_CATEGORY_NAME: z.string().min(1),
  VOICE_JOIN_CHANNEL_NAME: z.string().min(1),
  QUESTION_CHANNEL_NAME: z.string().min(1),
  ADMIN_IDS: z.string().min(1),
});

export const env = getEnv(envSchema);
