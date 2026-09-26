import type { SafeParseReturnType } from "zod";

/**
 * Returns the names of the fields that failed validation, so each schema
 * test can assert *which* rule rejected the input (not just "something
 * failed"). Empty array when the parse succeeded.
 */
export const failedFields = (
  result: SafeParseReturnType<unknown, unknown>,
): string[] =>
  result.success
    ? []
    : result.error.issues.map((issue) => String(issue.path[0]));
