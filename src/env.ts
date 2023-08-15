import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { REPO_ROOT } from "./constants.js";

const ENV_PATH = path.join(REPO_ROOT, ".env");

if (!fs.existsSync(ENV_PATH)) {
  throw new Error(
    `The "${ENV_PATH}" file does not exist. Copy the ".env.example" file to a ".env" file at the root of the repository.`,
  );
}

dotenv.config({
  path: ENV_PATH,
});

// TODO: https://github.com/t3-oss/t3-env/issues/109
for (const [key, value] of Object.entries(process.env)) {
  if (value === "") {
    delete process.env[key]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
  }
}

export const env = createEnv({
  server: {
    DISCORD_TOKEN: z.string(),
    DISCORD_SERVER_NAME: z.string(),
    VOICE_CATEGORY_NAME: z.string(),
    VOICE_JOIN_CHANNEL_NAME: z.string(),
    QUESTION_CHANNEL_NAME: z.string(),
    ADMIN_IDS: z.string(),
  },

  runtimeEnv: process.env,
});
