import { confusingCommand } from "./commands/confusing.js";
import {
  acceptCommand,
  denyCommand,
  staleCommand,
} from "./commands/conventionProposals.js";
import { replayCommand } from "./commands/replay.js";
import { undefinedCommand } from "./commands/undefined.js";
import type { Command } from "./interfaces/Command.js";

export const commandMap = new Map<string, Command>([
  ["accept", acceptCommand],
  ["confusing", confusingCommand],
  ["deny", denyCommand],
  ["replay", replayCommand],
  ["stale", staleCommand],
  ["undefined", undefinedCommand],
]);
