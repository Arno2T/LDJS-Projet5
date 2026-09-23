/**
 * List of validation messages for one form field, linked to it through
 * `id` (referenced by the field's `aria-describedby`). Renders nothing
 * when there are no errors.
 *
 * Shared by every form that displays per-field Zod validation errors
 * (article creation, registration, comment creation).
 *
 * @param props - `id`: id of the list, matching the field's
 * `aria-describedby`. `errors`: validation messages to display.
 */
export function FieldErrors({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return (
    <ul id={id} className="text-sm text-destructive">
      {errors.map((msg) => (
        <li key={msg}>{msg}</li>
      ))}
    </ul>
  );
}
