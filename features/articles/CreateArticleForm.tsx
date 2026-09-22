"use client";

import { useActionState } from "react";
import type { Theme } from "@prisma/client";
import { createArticle } from "@/features/articles/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  themes: Theme[];
};

/**
 * List of validation messages for one field, linked to it through `id`
 * (see `aria-describedby` on the field).
 */
function FieldErrors({ id, errors }: { id: string; errors?: string[] }) {
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

/**
 * Article creation form (Client Component).
 *
 * Submits to the `createArticle` Server Action through `useActionState`,
 * which provides the last returned state (errors/message/values) and a
 * pending flag. React resets uncontrolled fields after each submission, so
 * the submitted values come back in the state and are restored through
 * `defaultValue`.
 *
 * @param props - `themes`: the themes the author can choose from.
 */
export function CreateArticleForm({ themes }: Props) {
  const [state, formAction, pending] = useActionState(createArticle, undefined);

  return (
    <form
      action={formAction}
      className="mx-auto flex w-full max-w-[900px] flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <select
          id="themeId"
          name="themeId"
          defaultValue={state?.values?.themeId ?? ""}
          aria-label="Thème de l'article"
          aria-invalid={!!state?.errors?.themeId}
          aria-describedby={
            state?.errors?.themeId ? "themeId-error" : undefined
          }
          className="w-full rounded-lg border border-primary bg-background p-2 aria-invalid:border-destructive"
        >
          <option value="" disabled>
            Sélectionner un thème
          </option>
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
        <FieldErrors id="themeId-error" errors={state?.errors?.themeId} />
      </div>

      <div className="flex flex-col gap-2">
        <Input
          id="title"
          name="title"
          type="text"
          placeholder="Titre de l'article"
          aria-label="Titre de l'article"
          aria-invalid={!!state?.errors?.title}
          aria-describedby={state?.errors?.title ? "title-error" : undefined}
          defaultValue={state?.values?.title}
          maxLength={100}
          className="rounded-lg border-primary"
        />
        <FieldErrors id="title-error" errors={state?.errors?.title} />
      </div>

      <div className="flex flex-col gap-2">
        <textarea
          id="content"
          name="content"
          placeholder="Contenu de l'article"
          aria-label="Contenu de l'article"
          aria-invalid={!!state?.errors?.content}
          aria-describedby={
            state?.errors?.content ? "content-error" : undefined
          }
          defaultValue={state?.values?.content}
          rows={8}
          className="w-full rounded-lg border border-primary bg-background p-2 aria-invalid:border-destructive"
        />
        <FieldErrors id="content-error" errors={state?.errors?.content} />
      </div>

      {state?.message && <p className="text-sm">{state.message}</p>}

      <Button
        type="submit"
        disabled={pending}
        className="w-[139px] self-center"
      >
        Créer
      </Button>
    </form>
  );
}
