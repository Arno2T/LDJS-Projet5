import * as z from "zod";

export const registerSchema = z.object({
  username: z
    .string({
      required_error: "Le nom d'utilisateur est obligatoire",
      invalid_type_error:
        "Le nom d'utilisateur doit être une chaine de caractère",
    })
    .min(3)
    .max(20),
  email: z
    .string({
      required_error: "L'email est obligatoire",
    })
    .email({ message: "Adresse email invalide" }),
  password: z
    .string()
    .min(8, "le mot de passe doit faire au moins 8 caractères")
    .regex(
      /^(?=.*[A-Z])(?=.*\d).+$/,
      "Le mot de passe doit contenir au moins une majuscule et un chiffre",
    ),
});

export const loginSchema = z.object({
  login: z
    .string()
    .min(1, "Veuillez renseigner votre e-mail ou nom d'utilisateur"),
  password: z.string().min(1, "Le mot de passe est requis"),
});
