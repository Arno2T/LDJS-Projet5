"use client";

import { useActionState } from "react";
import { createComment } from "@/features/comments/actions";
import { Button } from "@/components/ui/button";
import { FieldErrors } from "@/components/FieldErrors";

type Props = {
  articleId: string;
};

/**
 * Comment creation form (Client Component).
 *
 * Submits to the `createComment` Server Action through `useActionState`,
 * which provides the last returned state (errors/message/values) and a
 * pending flag. `articleId` is bound ahead of time with
 * `createComment.bind(null, articleId)`: `useActionState` only ever calls
 * the action with `(prevState, formData)`, and the submitted form has no
 * field to carry which article is being commented.
 *
 * @param props - `articleId`: id of the article this comment belongs to.
 */
export function CreateCommentForm({ articleId }: Props) {
  const [state, formAction, pending] = useActionState(
    createComment.bind(null, articleId),
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <textarea
          id="content"
          name="content"
          placeholder="Ajouter un commentaire"
          aria-label="Ajouter un commentaire"
          aria-invalid={!!state?.errors?.content}
          aria-describedby={
            state?.errors?.content ? "content-error" : undefined
          }
          defaultValue={state?.values?.content}
          rows={3}
          className="w-full rounded-lg border border-primary bg-background p-2 aria-invalid:border-destructive"
        />
        <FieldErrors id="content-error" errors={state?.errors?.content} />
      </div>

      {state?.message && <p className="text-sm">{state.message}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        Envoyer
      </Button>
    </form>
  );
}
