import fs from "fs";
import { error } from "./util";

export function exists(filePath: string): boolean {
  let pathExists: boolean;
  try {
    pathExists = fs.existsSync(filePath);
  } catch (err) {
    error(`Failed to check to see if "${filePath}" exists:`, err);
  }

  return pathExists;
}
