export function error(...args: unknown[]): never {
  console.error(...args);
  process.exit(1);
}

export function getEnvironmentVariables(variableNames: string[]): string[] {
  const variables: string[] = [];

  for (const variableName of variableNames) {
    const variable = process.env[variableName];
    if (variable === undefined || variable === "") {
      error(
        `Failed to read the "${variableName}" environment variable from the ".env" file.`,
      );
    }
    variables.push(variable);
  }

  return variables;
}

/**
 * parseIntSafe is a more reliable version of parseInt. By default, "parseInt('1a')" will return
 * "1", which is unexpected. This returns either an integer or NaN.
 */
export function parseIntSafe(input: string): number {
  if (typeof input !== "string") {
    return NaN;
  }

  // Remove all leading and trailing whitespace
  let trimmedInput = input.trim();

  const isNegativeNumber = trimmedInput.startsWith("-");
  if (isNegativeNumber) {
    // Remove the leading minus sign before we match the regular expression
    trimmedInput = trimmedInput.substring(1);
  }

  if (/^\d+$/.exec(trimmedInput) === null) {
    // "\d" matches any digit (same as "[0-9]")
    return NaN;
  }

  if (isNegativeNumber) {
    // Add the leading minus sign back
    trimmedInput = `-${trimmedInput}`;
  }

  return parseInt(trimmedInput, 10);
}
