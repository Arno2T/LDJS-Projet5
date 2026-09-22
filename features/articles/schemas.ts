import * as z from "zod";

/**
 * Zod schema of the article creation form.
 *
 * - `themeId`: required (an existing theme is checked later by the database).
 * - `title`: trimmed, 10 to 100 characters.
 * - `content`: trimmed, at least 300 characters.
 *
 * The length limits are a product decision, not imposed by the specs.
 */
export const createArticleSchema = z.object({
  themeId: z
    .string({ required_error: "Veuillez sélectionner un thème" })
    .min(1, "Veuillez sélectionner un thème"),

  title: z
    .string({ required_error: "Le titre est obligatoire" })
    .trim()
    .min(
      10,
      "Le titre est obligatoire, 10 caractères minimum, 100 caractères maximum",
    )
    .max(100, "Maximum 100 caractères"),

  content: z
    .string({ required_error: "Le contenu est obligatoire" })
    .trim()
    .min(300, "Le contenu est obligatoire, 300 caractères minimum"),
});
