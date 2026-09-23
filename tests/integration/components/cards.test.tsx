import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Theme } from "@prisma/client";
import ArticleCard from "@/components/ArticleCard";
import ProfileIcon from "@/components/ProfileIcon";
import ThemeCard from "@/components/ThemeCard";

describe("ProfileIcon", () => {
  it("renders", () => {
    const { container } = render(<ProfileIcon />);

    expect(container.firstChild).toBeInTheDocument();
  });
});

describe("ArticleCard", () => {
  const article = {
    id: "article-1",
    title: "Learning TypeScript",
    content: "A long content about TypeScript generics.",
    authorId: "u1",
    themeId: "t1",
    createdAt: new Date("2026-03-15T10:00:00Z"),
    updatedAt: new Date("2026-03-15T10:00:00Z"),
    author: { username: "bobby" },
  };

  it("shows the title as a link to the article, the French date, the author and an excerpt", () => {
    render(<ArticleCard article={article} />);

    expect(
      screen.getByRole("link", { name: "Learning TypeScript" }),
    ).toHaveAttribute("href", "/articles/article-1");
    expect(screen.getByText(/15\/03\/2026 · bobby/)).toBeInTheDocument();
    expect(
      screen.getByText("A long content about TypeScript generics."),
    ).toBeInTheDocument();
  });
});

describe("ThemeCard", () => {
  const theme = {
    id: "t1",
    name: "TypeScript",
    description: "Typed JavaScript",
  } as Theme;

  it("shows the theme name, description and the button label", () => {
    render(
      <ThemeCard
        theme={theme}
        buttonLabel="S'abonner"
        buttonAction={vi.fn()}
      />,
    );

    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Typed JavaScript")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "S'abonner" })).toBeEnabled();
  });

  it("calls the action with the form data when the button is clicked", async () => {
    const action = vi.fn();
    render(
      <ThemeCard theme={theme} buttonLabel="S'abonner" buttonAction={action} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "S'abonner" }));

    expect(action).toHaveBeenCalledOnce();
    expect(action.mock.calls[0][0]).toBeInstanceOf(FormData);
  });

  it("disables the button (and does not call the action) when buttonDisabled is set", async () => {
    const action = vi.fn();
    render(
      <ThemeCard
        theme={theme}
        buttonLabel="Déjà abonné"
        buttonAction={action}
        buttonDisabled
      />,
    );

    const button = screen.getByRole("button", { name: "Déjà abonné" });
    await userEvent.click(button);

    expect(button).toBeDisabled();
    expect(action).not.toHaveBeenCalled();
  });
});
