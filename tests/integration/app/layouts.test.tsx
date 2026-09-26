import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// The menu itself is tested in components/menu.test.tsx: isolated here.
vi.mock("@/components/Menu", () => ({
  default: () => <nav data-testid="menu" />,
}));

import AppLayout from "@/app/(app)/layout";
import PublicLayout from "@/app/(public)/layout";
import Home from "@/app/(public)/page";

describe("AppLayout", () => {
  it("renders the menu above the page content", () => {
    render(
      <AppLayout>
        <p>Page content</p>
      </AppLayout>,
    );

    expect(screen.getByTestId("menu")).toBeInTheDocument();
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });
});

describe("PublicLayout", () => {
  it("renders only its children (no menu)", () => {
    render(
      <PublicLayout>
        <p>Public content</p>
      </PublicLayout>,
    );

    expect(screen.getByText("Public content")).toBeInTheDocument();
    expect(screen.queryByTestId("menu")).not.toBeInTheDocument();
  });
});

describe("Home", () => {
  it("shows the logo and the login / register links", () => {
    render(<Home />);

    expect(screen.getByRole("img", { name: "Logo MDD" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Se connecter" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("link", { name: "S'inscrire" })).toHaveAttribute(
      "href",
      "/register",
    );
  });
});
