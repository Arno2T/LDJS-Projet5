import * as z from "zod";

/**
 * Zod schema of the comment creation form.
 *
 * - `content`: trimmed, non-empty.
 *
 * No arbitrary minimum length is imposed (unlike article content): a short
 * comment must stay possible.
 */
export const commentSchema = z.object({
  content: z
    .string({ required_error: "Le commentaire ne peut pas être vide" })
    .trim()
    .min(1, "Le commentaire ne peut pas être vide"),
});
