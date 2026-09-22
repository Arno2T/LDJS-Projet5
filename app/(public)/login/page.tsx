"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MoveLeft } from "lucide-react";
import { login } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Login page (`/login`).
 *
 * Client Component: submits to the `login` Server Action through
 * `useActionState`, which returns the last error message (if any) and a
 * pending flag while the request is in flight.
 *
 * Two distinct layouts, matched to their own mockup:
 * - Desktop (`md:` and up): the small-logo header bar (mirrors `Menu.tsx`)
 *   plus a back arrow, reusing the pattern already used on `/articles/new`
 *   and `/articles/[id]`, even though this page has no `Menu` (outside the
 *   authenticated `(app)` route group).
 * - Mobile: no header bar — a bigger logo (same 225x130 size as the mobile
 *   hero logo on `/`) sits centered under the back arrow instead.
 *
 * The back arrow lives outside the centered column on purpose, so the
 * title/form block can be centered on its own (`mx-auto max-w-[250px]`)
 * without the arrow's width throwing that centering off.
 */
export default function Page() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="hidden h-[84px] items-center border-b border-border pl-[45px] md:flex">
        <Link href="/" className="shrink-0">
          <Image
            src="/logo_mdd.png"
            alt="Logo du site MDD"
            width={140}
            height={81}
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
              priority
            />
          </Link>

          <h1 className="text-center text-xl font-bold">Se connecter</h1>

          <form
            action={formAction}
            className="flex w-full flex-col items-center gap-4"
          >
            <div className="flex w-full flex-col gap-1">
              <Label htmlFor="login">E-mail ou nom d&apos;utilisateur</Label>
              <Input
                id="login"
                name="login"
                type="text"
                className="h-[50px] w-[250px]"
              />
            </div>

            <div className="flex w-full flex-col gap-1">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                className="h-[50px] w-[250px]"
              />
            </div>

            {state?.message && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}

            <Button type="submit" disabled={pending} className="h-10 w-[139px]">
              Se connecter
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
