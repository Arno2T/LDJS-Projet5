"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MoveLeft } from "lucide-react";
import { registerUser } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * List of validation messages for one field, linked to it through `id`
 * (see `aria-describedby` on the field). Mirrors the helper already used
 * in `CreateArticleForm`.
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
 * Registration page (`/register`).
 *
 * Client Component: submits to the `registerUser` Server Action through
 * `useActionState`, which returns per-field validation errors, a generic
 * message (e.g. duplicate email/username) and a pending flag while the
 * request is in flight.
 *
 * Same layout as `/login` (desktop header bar vs. mobile centered logo,
 * back arrow outside the centered column, shared `mx-auto max-w-[250px]`
 * container) — see that page's doc comment for the reasoning. Duplicated
 * rather than extracted into a shared component for now: only two pages
 * use this pattern, consistent with the "extract at the 3rd occurrence"
 * rule already applied elsewhere in this codebase (the `/articles` grid
 * wrapper).
 */
export default function Page() {
  const [state, formAction, pending] = useActionState(registerUser, undefined);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="hidden h-[84px] items-center border-b border-border pl-[45px] md:flex">
        <Link href="/" className="shrink-0">
          <Image
            src="/logo_mdd.png"
            alt="Logo du site MDD"
            width={140}
            height={81}
            preload={true}
          />
        </Link>
      </header>

      <div className="flex flex-col gap-6 px-6 py-6">
        {/* pl-[21px] + px-6 (24px) = 45px, same left offset as the header logo */}
        <Link
          href="/"
          aria-label="Retour à l'accueil"
          className="flex h-8 items-center pl-[21px]"
        >
          <MoveLeft size={47} absoluteStrokeWidth />
        </Link>

        <div className="mx-auto flex w-full max-w-[250px] flex-col items-center gap-6">
          <Link href="/" className="md:hidden">
            <Image
              src="/logo_mdd.png"
              alt="Logo du site MDD"
              width={225}
              height={130}
              preload={true}
            />
          </Link>

          <h1 className="text-center text-xl font-bold">Inscription</h1>

          <form
            action={formAction}
            className="flex w-full flex-col items-center gap-4"
          >
            <div className="flex w-full flex-col gap-1">
              <Label htmlFor="username">Nom d&apos;utilisateur</Label>
              <Input
                id="username"
                name="username"
                type="text"
                aria-invalid={!!state?.errors?.username}
                aria-describedby={
                  state?.errors?.username ? "username-error" : undefined
                }
                className="h-[50px] w-[250px]"
              />
              <FieldErrors
                id="username-error"
                errors={state?.errors?.username}
              />
            </div>

            <div className="flex w-full flex-col gap-1">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                aria-invalid={!!state?.errors?.email}
                aria-describedby={
                  state?.errors?.email ? "email-error" : undefined
                }
                className="h-[50px] w-[250px]"
              />
              <FieldErrors id="email-error" errors={state?.errors?.email} />
            </div>

            <div className="flex w-full flex-col gap-1">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                aria-invalid={!!state?.errors?.password}
                aria-describedby={
                  state?.errors?.password ? "password-error" : undefined
                }
                className="h-[50px] w-[250px]"
              />
              <FieldErrors
                id="password-error"
                errors={state?.errors?.password}
              />
            </div>

            {state?.message && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}

            <Button type="submit" disabled={pending} className="h-10 w-[139px]">
              S&apos;inscrire
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
