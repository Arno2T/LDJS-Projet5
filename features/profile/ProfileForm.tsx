"use client";

import { updateUserInformation } from "@/features/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";

type Props = {
  userInfo: { email: string; username: string } | null;
};

export function ProfileForm({ userInfo }: Props) {
  const [state, formAction, pending] = useActionState(
    updateUserInformation,
    undefined,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col items-center gap-4 bg-background pt-6 pb-6"
    >
      <Input
        id="username"
        name="username"
        defaultValue={userInfo?.username}
        type="text"
        className="h-[48px] w-[250px] md:w-[281px]"
      />
      <Input
        id="email"
        name="email"
        defaultValue={userInfo?.email}
        type="email"
        className="h-[48px] w-[250px] md:w-[281px]"
      />
      <div className="flex w-[250px] flex-col gap-1 md:w-[281px]">
        <Input
          id="password"
          name="password"
          placeholder="*******"
          type="password"
          className="h-[48px] w-[250px] md:w-[281px]"
        />
        {state?.errors?.password && (
          <ul className="text-sm text-destructive">
            {state.errors.password.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        )}
      </div>
      {state?.message && <p className="text-sm">{state.message}</p>}
      <Button type="submit" disabled={pending} className="h-[40px] w-[139px]">
        Sauvegarder
      </Button>
      <hr className="mt-2 w-[250px] max-w-full border-black md:w-[713px]" />
    </form>
  );
}
