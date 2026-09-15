"use client";

import { useActionState } from "react";
import { login } from "@/features/auth/actions";

export default function Page() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div>
      <h1> Connexion </h1>
      <form action={formAction}>
        <div>
          <label htmlFor="login"> E-mail ou nom d'utilisateur</label>
          <input id="login" name="login" type="text" />
        </div>
        <div>
          <label htmlFor="password"> Mot de passe</label>
          <input id="password" name="password" type="password" />
        </div>
        {state?.message && <p>{state.message}</p>}
        <button type="submit" disabled={pending}>
          Se connecter
        </button>
      </form>
    </div>
  );
}
