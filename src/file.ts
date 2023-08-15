import fs from "node:fs";

export function exists(filePath: string): boolean {
  let pathExists: boolean;
  try {
    pathExists = fs.existsSync(filePath);
  } catch (error) {
    throw new Error(`Failed to check to see if "${filePath}" exists: ${error}`);
  }

  return pathExists;
}
