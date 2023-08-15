import path from "node:path";
import url from "node:url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export const REPO_ROOT = path.join(__dirname, "..");
export const PROJECT_NAME = "H-Group Helper";
export const VOICE_CHANNEL_PREFIX = "H-Group ";
