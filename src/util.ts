export function error(...args: unknown[]): never {
  console.error(...args);
  process.exit(1);
}

export function getEnvironmentVariable(variableName: string): string {
  const variable = process.env[variableName];
  if (variable === undefined || variable === "") {
    error(
      `Failed to read the "${variableName}" environment variable from the ".env" file.`,
    );
  }

  return variable;
}
