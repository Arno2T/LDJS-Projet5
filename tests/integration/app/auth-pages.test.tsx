import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createDeferred } from "@/tests/setup/deferred";

vi.mock("@/features/auth/actions", () => ({
  login: vi.fn(),
  registerUser: vi.fn(),
}));

import { login, registerUser } from "@/features/auth/actions";
import LoginPage from "@/app/(public)/login/page";
import RegisterPage from "@/app/(public)/register/page";

describe("login page (Client Component)", () => {
  const mockedLogin = vi.mocked(login);
  const submit = () => screen.getByRole("button", { name: "Se connecter" });

  it("renders the labelled fields and a link back to the home page", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("heading", { name: "Se connecter" }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("E-mail ou nom d'utilisateur"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Mot de passe")).toHaveAttribute(
      "type",
      "password",
    );
    expect(
      screen.getByRole("link", { name: "Retour à l'accueil" }),
    ).toHaveAttribute("href", "/");
  });

  it("submits the identifier and password to the login action", async () => {
    const user = userEvent.setup();
    mockedLogin.mockResolvedValue(undefined);
    render(<LoginPage />);

    await user.type(
      screen.getByLabelText("E-mail ou nom d'utilisateur"),
      "bobby",
    );
    await user.type(screen.getByLabelText("Mot de passe"), "Abcdef12");
    await user.click(submit());

    const formData = mockedLogin.mock.calls[0][1] as FormData;
    expect(formData.get("login")).toBe("bobby");
    expect(formData.get("password")).toBe("Abcdef12");
  });

  it("shows the generic error message returned by the action", async () => {
    mockedLogin.mockResolvedValue({
      message: "Email ou mot de passe non valide",
    });
    render(<LoginPage />);

    await userEvent.click(submit());

    expect(
      await screen.findByText("Email ou mot de passe non valide"),
    ).toBeInTheDocument();
  });

  it("disables the button while the action is in flight", async () => {
    const deferred = createDeferred<undefined>();
    mockedLogin.mockReturnValue(deferred.promise);
    render(<LoginPage />);

    await userEvent.click(submit());
    expect(submit()).toBeDisabled();

    await act(async () => deferred.resolve(undefined));
    expect(submit()).toBeEnabled();
  });
});

describe("register page (Client Component)", () => {
  const mockedRegister = vi.mocked(registerUser);
  const submit = () => screen.getByRole("button", { name: "S'inscrire" });

  it("renders the three labelled fields, valid by default", () => {
    render(<RegisterPage />);

    for (const label of [
      "Nom d'utilisateur",
      "Adresse e-mail",
      "Mot de passe",
    ]) {
      expect(screen.getByLabelText(label)).toHaveAttribute(
        "aria-invalid",
        "false",
      );
    }
    expect(screen.getByLabelText("Mot de passe")).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("submits username, email and password to the register action", async () => {
    const user = userEvent.setup();
    mockedRegister.mockResolvedValue(undefined);
    render(<RegisterPage />);

    await user.type(screen.getByLabelText("Nom d'utilisateur"), "bobby");
    await user.type(
      screen.getByLabelText("Adresse e-mail"),
      "bobby@mdd-test.local",
    );
    await user.type(screen.getByLabelText("Mot de passe"), "Abcdef12");
    await user.click(submit());

    const formData = mockedRegister.mock.calls[0][1] as FormData;
    expect(formData.get("username")).toBe("bobby");
    expect(formData.get("email")).toBe("bobby@mdd-test.local");
    expect(formData.get("password")).toBe("Abcdef12");
  });

  it("shows each field's errors, linked to the field", async () => {
    mockedRegister.mockResolvedValue({
      errors: {
        username: ["Nom trop court"],
        email: ["Adresse email invalide"],
        password: ["Mot de passe trop faible"],
      },
      message: "",
    });
    render(<RegisterPage />);

    await userEvent.click(submit());

    expect(await screen.findByText("Nom trop court")).toBeInTheDocument();
    expect(screen.getByText("Adresse email invalide")).toBeInTheDocument();
    expect(screen.getByText("Mot de passe trop faible")).toBeInTheDocument();
    for (const [label, id] of [
      ["Nom d'utilisateur", "username-error"],
      ["Adresse e-mail", "email-error"],
      ["Mot de passe", "password-error"],
    ]) {
      expect(screen.getByLabelText(label)).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      expect(screen.getByLabelText(label)).toHaveAttribute(
        "aria-describedby",
        id,
      );
    }
  });

  it("shows the general message (e.g. e-mail or username already used)", async () => {
    mockedRegister.mockResolvedValue({
      message: "Cet e-mail ou ce nom d'utilisateur est déjà utilisé",
    });
    render(<RegisterPage />);

    await userEvent.click(submit());

    expect(
      await screen.findByText(
        "Cet e-mail ou ce nom d'utilisateur est déjà utilisé",
      ),
    ).toBeInTheDocument();
  });

  it("disables the button while the action is in flight", async () => {
    const deferred = createDeferred<undefined>();
    mockedRegister.mockReturnValue(deferred.promise);
    render(<RegisterPage />);

    await userEvent.click(submit());
    expect(submit()).toBeDisabled();

    await act(async () => deferred.resolve(undefined));
    expect(submit()).toBeEnabled();
  });
});
