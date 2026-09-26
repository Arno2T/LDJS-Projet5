import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Theme } from "@prisma/client";
import { createDeferred } from "@/tests/setup/deferred";

vi.mock("@/features/articles/actions", () => ({ createArticle: vi.fn() }));

import { createArticle } from "@/features/articles/actions";
import { CreateArticleForm } from "@/features/articles/CreateArticleForm";

const mockedAction = vi.mocked(createArticle);
const themes = [
  { id: "t1", name: "JavaScript" },
  { id: "t2", name: "TypeScript" },
] as Theme[];

const select = () => screen.getByLabelText("Thème de l'article");
const title = () => screen.getByLabelText("Titre de l'article");
const content = () => screen.getByLabelText("Contenu de l'article");
const createButton = () => screen.getByRole("button", { name: "Créer" });

describe("CreateArticleForm", () => {
  it("lists the themes after a disabled placeholder option, nothing selected by default", () => {
    render(<CreateArticleForm themes={themes} />);

    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["Sélectionner un thème", "JavaScript", "TypeScript"]);
    expect(
      screen.getByRole("option", { name: "Sélectionner un thème" }),
    ).toBeDisabled();
    expect(select()).toHaveValue("");
    expect(title()).toHaveAttribute("maxlength", "100");
    for (const field of [select(), title(), content()]) {
      expect(field).toHaveAttribute("aria-invalid", "false");
    }
  });

  it("submits the chosen theme, title and content", async () => {
    const user = userEvent.setup();
    mockedAction.mockResolvedValue(undefined);
    render(<CreateArticleForm themes={themes} />);

    await user.selectOptions(select(), "TypeScript");
    await user.type(title(), "My article title");
    await user.type(content(), "Some content");
    await user.click(createButton());

    const formData = mockedAction.mock.calls[0][1] as FormData;
    expect(formData.get("themeId")).toBe("t2");
    expect(formData.get("title")).toBe("My article title");
    expect(formData.get("content")).toBe("Some content");
  });

  it("shows each field's errors, linked to the field, and restores the submitted values", async () => {
    mockedAction.mockResolvedValue({
      errors: {
        themeId: ["Veuillez sélectionner un thème"],
        title: ["Le titre est obligatoire"],
        content: ["Le contenu est obligatoire"],
      },
      message: "",
      values: { themeId: "t2", title: "short", content: "too short" },
    });
    render(<CreateArticleForm themes={themes} />);

    await userEvent.click(createButton());

    expect(
      await screen.findByText("Le titre est obligatoire"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Veuillez sélectionner un thème"),
    ).toBeInTheDocument();
    expect(screen.getByText("Le contenu est obligatoire")).toBeInTheDocument();
    expect(select()).toHaveAttribute("aria-invalid", "true");
    expect(select()).toHaveAttribute("aria-describedby", "themeId-error");
    expect(title()).toHaveAttribute("aria-invalid", "true");
    expect(title()).toHaveAttribute("aria-describedby", "title-error");
    expect(content()).toHaveAttribute("aria-invalid", "true");
    expect(content()).toHaveAttribute("aria-describedby", "content-error");
    // Restored (React resets uncontrolled fields after each submission).
    expect(select()).toHaveValue("t2");
    expect(title()).toHaveValue("short");
    expect(content()).toHaveValue("too short");
  });

  it("shows the general message (e.g. unknown theme) with no field error", async () => {
    mockedAction.mockResolvedValue({
      message: "Ce thème n'existe pas",
      values: { themeId: "t1", title: "A valid title", content: "x" },
    });
    render(<CreateArticleForm themes={themes} />);

    await userEvent.click(createButton());

    expect(
      await screen.findByText("Ce thème n'existe pas"),
    ).toBeInTheDocument();
    expect(title()).toHaveAttribute("aria-invalid", "false");
    expect(title()).toHaveValue("A valid title");
  });

  it("disables the create button while the action is in flight", async () => {
    const deferred = createDeferred<undefined>();
    mockedAction.mockReturnValue(deferred.promise);
    render(<CreateArticleForm themes={themes} />);

    await userEvent.click(createButton());
    expect(createButton()).toBeDisabled();

    await act(async () => deferred.resolve(undefined));
    expect(createButton()).toBeEnabled();
  });
});
