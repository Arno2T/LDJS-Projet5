import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createDeferred } from "@/tests/setup/deferred";

vi.mock("@/features/profile/actions", () => ({
  updateUserInformation: vi.fn(),
}));

import { updateUserInformation } from "@/features/profile/actions";
import { ProfileForm } from "@/features/profile/ProfileForm";

const mockedAction = vi.mocked(updateUserInformation);
const saveButton = () => screen.getByRole("button", { name: "Sauvegarder" });

describe("ProfileForm", () => {
  it("pre-fills username and email, with accessible names on both fields", () => {
    render(
      <ProfileForm
        userInfo={{ username: "bobby", email: "bobby@mdd-test.local" }}
      />,
    );

    expect(
      screen.getByRole("textbox", { name: "Nom d'utilisateur" }),
    ).toHaveValue("bobby");
    expect(screen.getByRole("textbox", { name: "Adresse e-mail" })).toHaveValue(
      "bobby@mdd-test.local",
    );
    expect(screen.getByPlaceholderText("*******")).toHaveValue("");
  });

  it("renders empty fields when there is no user information", () => {
    render(<ProfileForm userInfo={null} />);

    expect(
      screen.getByRole("textbox", { name: "Nom d'utilisateur" }),
    ).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Adresse e-mail" })).toHaveValue(
      "",
    );
  });

  it("submits the three fields to the action", async () => {
    const user = userEvent.setup();
    mockedAction.mockResolvedValue({
      message: "Profil mis à jour avec succès",
    });
    render(
      <ProfileForm
        userInfo={{ username: "bobby", email: "b@mdd-test.local" }}
      />,
    );

    await user.type(screen.getByPlaceholderText("*******"), "Abcdef12");
    await user.click(saveButton());

    const formData = mockedAction.mock.calls[0][1] as FormData;
    expect(formData.get("username")).toBe("bobby");
    expect(formData.get("email")).toBe("b@mdd-test.local");
    expect(formData.get("password")).toBe("Abcdef12");
  });

  it("shows the success message", async () => {
    mockedAction.mockResolvedValue({
      message: "Profil mis à jour avec succès",
    });
    render(<ProfileForm userInfo={null} />);

    await userEvent.click(saveButton());

    expect(
      await screen.findByText("Profil mis à jour avec succès"),
    ).toBeInTheDocument();
  });

  it("shows the password validation errors", async () => {
    mockedAction.mockResolvedValue({
      errors: {
        password: ["le mot de passe doit faire au moins 8 caractères"],
      },
      message: "",
    });
    render(<ProfileForm userInfo={null} />);

    await userEvent.click(saveButton());

    expect(
      await screen.findByText(
        "le mot de passe doit faire au moins 8 caractères",
      ),
    ).toBeInTheDocument();
  });

  it("disables the save button while the action is in flight", async () => {
    const deferred = createDeferred<{ message: string }>();
    mockedAction.mockReturnValue(deferred.promise);
    render(<ProfileForm userInfo={null} />);

    await userEvent.click(saveButton());
    expect(saveButton()).toBeDisabled();

    await act(async () => deferred.resolve({ message: "" }));
    expect(saveButton()).toBeEnabled();
  });
});
