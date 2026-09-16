"use client";

import { useActionState } from "react";
import { registerUser } from "@/features/auth/actions";

export default function Page() {
  const [state, formAction, pending] = useActionState(registerUser, undefined);

  return (
    <div>
      <h1>Inscription</h1>
      <form action={formAction}>
        <div>
          <label htmlFor="username">Nom d'utilisateur</label>
          <input id="username" name="username" type="text" />
          {state?.errors?.username && <p>{state.errors.username[0]}</p>}
        </div>
        <div>
          <label htmlFor="email">Adresse e-mail</label>
          <input id="email" name="email" type="email" />
          {state?.errors?.email && <p>{state.errors.email[0]}</p>}
        </div>
        <div>
          <label htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" />
          {state?.errors?.password && (
            <ul>
              {state.errors.password.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          )}
        </div>
        {state?.message && <p>{state.message}</p>}
        <button type="submit" disabled={pending}>
          S'inscrire
        </button>
      </form>
    </div>
  );
}
