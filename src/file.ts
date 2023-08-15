import fs from "node:fs";
import { error } from "./util.js";

export function exists(filePath: string): boolean {
  let pathExists: boolean;
  try {
    pathExists = fs.existsSync(filePath);
  } catch (error_) {
    error(`Failed to check to see if "${filePath}" exists:`, error_);
  }

  return pathExists;
}
