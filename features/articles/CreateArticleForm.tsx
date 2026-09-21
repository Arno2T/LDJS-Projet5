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
 * Article creation form (Client Component).
 *
 * Submits to the `createArticle` Server Action through `useActionState`,
 * which provides the last returned state (errors/message) and a pending flag.
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
          defaultValue=""
          aria-label="Thème de l'article"
          className="w-full rounded-lg border border-primary bg-background p-2"
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
      </div>

      <div className="flex flex-col gap-2">
        <Input
          id="title"
          name="title"
          type="text"
          placeholder="Titre de l'article"
          aria-label="Titre de l'article"
          maxLength={100}
          className="rounded-lg border-primary"
        />
      </div>

      <div className="flex flex-col gap-2">
        <textarea
          id="content"
          name="content"
          placeholder="Contenu de l'article"
          aria-label="Contenu de l'article"
          rows={8}
          className="w-full rounded-lg border border-primary bg-background p-2"
        />
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
