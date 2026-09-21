import * as z from "zod";

export const createArticleSchema = z.object({
  themeId: z
    .string({ required_error: "Veuillez sélectionner un thème" })
    .min(1, "Veuillez sélectionner un thème"),

  title: z
    .string({ required_error: "Le titre est obligatoire" })
    .trim()
    .min(1, "Le titre est obligatoire")
    .max(100, "Maximum 100 caractères"),

  content: z
    .string({ required_error: "Le contenu est obligatoire" })
    .trim()
    .min(1, "Le contenu est obligatoire"),
});
