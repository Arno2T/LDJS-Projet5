import * as z from "zod";

/**
 * Parses a `FormData` object against a Zod schema.
 *
 * Centralizes the `Object.fromEntries(formData)` + `schema.safeParse(...)`
 * pattern repeated across every Server Action that validates a submitted
 * form (`registerUser`, `login`, `updateUserInformation`, ...).
 *
 * @param schema - The Zod schema to validate the form data against.
 * @param formData - The raw `FormData` received by the Server Action.
 * @returns The same `SafeParseReturnType` `schema.safeParse(...)` would
 * produce — callers still decide how to shape their own return value on
 * failure, since the expected form state differs from one action to another.
 */
export function parseFormData<Schema extends z.ZodType>(
  schema: Schema,
  formData: FormData,
): z.SafeParseReturnType<z.input<Schema>, z.output<Schema>> {
  return schema.safeParse(Object.fromEntries(formData));
}
