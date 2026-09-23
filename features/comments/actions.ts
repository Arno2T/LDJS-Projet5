"use server";

import { requireAuth } from "@/lib/auth/session";
import { parseFormData } from "@/lib/forms";
import { prisma } from "@/lib/prisma";
import { isForeignKeyError } from "@/lib/prisma-errors";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { commentSchema } from "./schemas";

/**
 * State returned by `createComment` to the comment form (`useActionState`).
 *
 * - `errors`: validation messages per field.
 * - `message`: general error message (empty when there is none).
 * - `values`: the submitted values, sent back so the form can restore them
 *   (React resets uncontrolled fields after each submission).
 *
 * `undefined` before the first submission.
 */
export type CreateCommentFormState =
  | {
      errors?: { content?: string[] };
      message: string;
      values?: { content: string };
    }
  | undefined;

export type CommentWithAuthor = Prisma.CommentGetPayload<{
  include: { author: { select: { username: true } } };
}>;

/**
 * Creates a comment for the current user on a given article.
 *
 * `articleId` is not part of the submitted form — `useActionState` only
 * passes `(prevState, formData)` to the action it calls, so the article
 * the comment belongs to must be bound in beforehand from the Client
 * Component, e.g.:
 *
 * ```tsx
 * useActionState(createComment.bind(null, articleId), undefined)
 * ```
 *
 * This turns `createComment` into a function of `(prevState, formData)`
 * for React, with `articleId` already fixed to the current article.
 *
 * @param articleId - Id of the article being commented, bound ahead of time.
 * @param _prevState - Previous form state (unused, required by `useActionState`).
 * @param formData - The submitted comment form.
 * @returns The form state to display when the comment was not created.
 */
const createComment = async (
  articleId: string,
  _prevState: CreateCommentFormState,
  formData: FormData,
): Promise<CreateCommentFormState> => {
  const userId = await requireAuth();
  const validatedFields = parseFormData(commentSchema, formData);
  const values = {
    content: String(formData.get("content") ?? ""),
  };

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "",
      values,
    };
  }

  const { content } = validatedFields.data;

  try {
    await prisma.comment.create({
      data: { content, authorId: userId, articleId },
    });
  } catch (error) {
    if (isForeignKeyError(error)) {
      return { message: "Cet article n'existe plus", values };
    }
    throw error;
  }

  revalidatePath(`/articles/${articleId}`);
};

/**
 * Returns the comments posted on a given article, most recent first, with
 * each comment's author username.
 *
 * @param articleId - Id of the article whose comments are fetched.
 */
const getCommentsByArticle = async (
  articleId: string,
): Promise<CommentWithAuthor[]> => {
  await requireAuth();

  return await prisma.comment.findMany({
    where: { articleId },
    include: { author: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export { createComment, getCommentsByArticle };
