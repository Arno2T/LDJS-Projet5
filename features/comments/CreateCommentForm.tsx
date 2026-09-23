"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
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
      <div className="flex items-center gap-2 md:justify-end">
        <textarea
          id="content"
          name="content"
          placeholder="Écrivez ici votre commentaire"
          aria-label="Écrivez ici votre commentaire"
          aria-invalid={!!state?.errors?.content}
          aria-describedby={
            state?.errors?.content ? "content-error" : undefined
          }
          defaultValue={state?.values?.content}
          rows={1}
          className="h-[120px] w-full resize-none rounded-lg border border-input bg-background p-2 aria-invalid:border-destructive md:w-[570px]"
        />
        <Button
          type="submit"
          variant="outline"
          disabled={pending}
          aria-label="Envoyer le commentaire"
          className="h-[48px] w-[48px] shrink-0 rounded-lg border-white bg-background p-0 text-primary"
        >
          <Send strokeWidth={2.5} className="size-9" />
        </Button>
      </div>

      <FieldErrors id="content-error" errors={state?.errors?.content} />
      {state?.message && <p className="text-sm">{state.message}</p>}
    </form>
  );
}
