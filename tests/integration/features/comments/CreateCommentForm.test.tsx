import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createDeferred } from "@/tests/setup/deferred";

// Server Action mocked: Prisma / next/cache must never load in jsdom.
vi.mock("@/features/comments/actions", () => ({ createComment: vi.fn() }));

import { createComment } from "@/features/comments/actions";
import { CreateCommentForm } from "@/features/comments/CreateCommentForm";

const mockedAction = vi.mocked(createComment);
const textarea = () => screen.getByLabelText("Écrivez ici votre commentaire");
const submitButton = () =>
  screen.getByRole("button", { name: "Envoyer le commentaire" });

describe("CreateCommentForm", () => {
  it("renders an accessible, valid-by-default field and submit button", () => {
    render(<CreateCommentForm articleId="article-1" />);

    expect(textarea()).toHaveValue("");
    expect(textarea()).toHaveAttribute("aria-invalid", "false");
    expect(submitButton()).toBeEnabled();
  });

  it("submits the typed content with the article id bound as first argument", async () => {
    const user = userEvent.setup();
    mockedAction.mockResolvedValue(undefined);
    render(<CreateCommentForm articleId="article-1" />);

    await user.type(textarea(), "Nice article");
    await user.click(submitButton());

    expect(mockedAction).toHaveBeenCalledOnce();
    const [articleId, , formData] = mockedAction.mock.calls[0];
    expect(articleId).toBe("article-1");
    expect((formData as FormData).get("content")).toBe("Nice article");
  });

  it("shows the validation error linked to the field, and restores the submitted value", async () => {
    mockedAction.mockResolvedValue({
      errors: { content: ["Le commentaire ne peut pas être vide"] },
      message: "",
      values: { content: "   " },
    });
    render(<CreateCommentForm articleId="article-1" />);

    await userEvent.click(submitButton());

    expect(
      await screen.findByText("Le commentaire ne peut pas être vide"),
    ).toBeInTheDocument();
    expect(textarea()).toHaveAttribute("aria-invalid", "true");
    expect(textarea()).toHaveAttribute("aria-describedby", "content-error");
    expect(textarea()).toHaveValue("   ");
  });

  it("shows the general message (e.g. article deleted meanwhile)", async () => {
    mockedAction.mockResolvedValue({
      message: "Cet article n'existe plus",
      values: { content: "hello" },
    });
    render(<CreateCommentForm articleId="article-1" />);

    await userEvent.click(submitButton());

    expect(
      await screen.findByText("Cet article n'existe plus"),
    ).toBeInTheDocument();
    expect(textarea()).toHaveValue("hello");
  });

  it("disables the submit button while the action is in flight", async () => {
    const deferred = createDeferred<undefined>();
    mockedAction.mockReturnValue(deferred.promise);
    render(<CreateCommentForm articleId="article-1" />);

    await userEvent.click(submitButton());
    expect(submitButton()).toBeDisabled();

    await act(async () => deferred.resolve(undefined));
    expect(submitButton()).toBeEnabled();
  });
});
