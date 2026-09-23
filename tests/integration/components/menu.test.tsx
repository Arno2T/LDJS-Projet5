import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// `logout` is a Server Action (imports Prisma, next/headers...): never load it
// in jsdom.
vi.mock("@/features/auth/actions", () => ({ logout: vi.fn() }));

import { logout } from "@/features/auth/actions";
import Menu from "@/components/Menu";
import MobileMenuToggle from "@/components/MobileMenuToggle";

describe("MobileMenuToggle", () => {
  it("hides its children by default, shows them on click, hides them on a second click", async () => {
    const user = userEvent.setup();
    render(
      <MobileMenuToggle>
        <p>Menu content</p>
      </MobileMenuToggle>,
    );
    expect(screen.queryByText("Menu content")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ouvrir le menu" }));
    expect(screen.getByText("Menu content")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Fermer le menu" }));
    expect(screen.queryByText("Menu content")).not.toBeInTheDocument();
  });
});

describe("Menu", () => {
  it("exposes the main navigation with links to articles, themes and the profile (accessible names)", () => {
    render(<Menu />);

    const nav = screen.getByRole("navigation", {
      name: "Navigation principale",
    });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Articles" })).toHaveAttribute(
      "href",
      "/articles",
    );
    expect(screen.getByRole("link", { name: "Thèmes" })).toHaveAttribute(
      "href",
      "/themes",
    );
    expect(
      screen.getByRole("link", { name: "Profil utilisateur" }),
    ).toHaveAttribute("href", "/profile");
  });

  it("submits the logout Server Action from the 'Se déconnecter' button", async () => {
    render(<Menu />);

    await userEvent.click(
      screen.getByRole("button", { name: "Se déconnecter" }),
    );

    expect(logout).toHaveBeenCalledOnce();
  });

  it("also offers the links (with the same accessible names) in the opened mobile menu", async () => {
    const user = userEvent.setup();
    render(<Menu />);

    await user.click(screen.getByRole("button", { name: "Ouvrir le menu" }));

    // jsdom applies no Tailwind CSS: desktop AND mobile copies are in the DOM.
    expect(
      screen.getAllByRole("link", { name: "Profil utilisateur" }),
    ).toHaveLength(2);
    expect(
      screen.getAllByRole("button", { name: "Se déconnecter" }),
    ).toHaveLength(2);
  });
});
