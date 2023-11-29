import dotenv from "dotenv";
import { isFile } from "isaacscript-common-node";
import path from "node:path";
import { z } from "zod";
import { REPO_ROOT } from "./constants.js";

const ENV_PATH = path.join(REPO_ROOT, ".env");

if (!isFile(ENV_PATH)) {
  throw new Error(
    `The "${ENV_PATH}" file does not exist. Copy the ".env.example" file to a ".env" file at the root of the repository.`,
  );
}

dotenv.config({
  path: ENV_PATH,
});

const envSchema = z.object({
  DISCORD_TOKEN: z.string(),
  DISCORD_SERVER_NAME: z.string(),
  VOICE_CATEGORY_NAME: z.string(),
  VOICE_JOIN_CHANNEL_NAME: z.string(),
  QUESTION_CHANNEL_NAME: z.string(),
  ADMIN_IDS: z.string(),
});

export const env = envSchema.parse(process.env);
