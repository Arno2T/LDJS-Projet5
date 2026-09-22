"use server";

import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getSubscriptionsByUser } from "../subscriptions/actions";

import { parseFormData } from "@/lib/forms";
import { isForeignKeyError } from "@/lib/prisma-errors";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createArticleSchema } from "./schemas";

export type ArticleWithAuthor = Prisma.ArticleGetPayload<{
  include: { author: { select: { username: true } } };
}>;

export type ArticleWithAuthorAndTheme = Prisma.ArticleGetPayload<{
  include: { author: { select: { username: true } }; theme: true };
}>;

/**
 * State returned by `createArticle` to the creation form (`useActionState`).
 *
 * - `errors`: validation messages per field.
 * - `message`: general error message (empty when there is none).
 * - `values`: the submitted values, sent back so the form can restore them
 *   (React resets uncontrolled fields after each submission).
 *
 * `undefined` before the first submission.
 */
export type CreateArticleFormState =
  | {
      errors?: { themeId?: string[]; title?: string[]; content?: string[] };
      message: string;
      values?: { themeId: string; title: string; content: string };
    }
  | undefined;

/**
 * Returns the articles of the themes the current user is subscribed to.
 *
 * @param sortParam - Order on `createdAt`. `"asc"` = oldest first. Any other
 * value (or none) falls back to `"desc"` (newest first).
 */
const getArticles = async (
  sortParam?: string,
): Promise<ArticleWithAuthor[]> => {
  await requireAuth();
  const subscriptions = await getSubscriptionsByUser();

  const themeIds = subscriptions.map((sub) => sub.themeId);
  const order: Prisma.SortOrder = sortParam === "asc" ? "asc" : "desc";

  return prisma.article.findMany({
    where: { themeId: { in: themeIds } },
    include: { author: { select: { username: true } } },
    orderBy: {
      createdAt: order,
    },
  });
};

const getArticleById = async (
  id: string,
): Promise<ArticleWithAuthorAndTheme | null> => {
  await requireAuth();

  return await prisma.article.findUnique({
    where: { id },
    include: { author: { select: { username: true } }, theme: true },
  });
};

/**
 * Creates an article for the current user from a submitted form.
 * The author always comes from the session, never from the form.
 * Redirects to the new article on success. On a validation error (or an
 * unknown theme) it returns the errors together with the submitted values,
 * so the form can restore what the user typed.
 *
 * @param _prevState - Previous form state (unused, required by `useActionState`).
 * @param formData - The submitted creation form.
 * @returns The form state to display when the article was not created.
 */
const createArticle = async (
  _prevState: CreateArticleFormState,
  formData: FormData,
): Promise<CreateArticleFormState> => {
  const userId = await requireAuth();
  const validatedFields = parseFormData(createArticleSchema, formData);
  const values = {
    themeId: String(formData.get("themeId") ?? ""),
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
  };

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "",
      values,
    };
  }

  const { themeId, title, content } = validatedFields.data;
  let articleId: string;

  try {
    const article = await prisma.article.create({
      data: { title, content, themeId, authorId: userId },
      select: { id: true },
    });
    articleId = article.id;
  } catch (error) {
    if (isForeignKeyError(error)) {
      return { message: "Ce thème n'existe pas", values };
    }
    throw error;
  }

  revalidatePath("/articles");
  redirect(`/articles/${articleId}`);
};

export { getArticles, getArticleById, createArticle };
