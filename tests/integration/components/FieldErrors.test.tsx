import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FieldErrors } from "@/components/FieldErrors";

describe("FieldErrors", () => {
  it.each([
    { case: "undefined", errors: undefined },
    { case: "an empty array", errors: [] },
  ])("renders nothing when errors is $case", ({ errors }) => {
    const { container } = render(<FieldErrors id="x-error" errors={errors} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders one list item per message, in a list carrying the given id", () => {
    render(
      <FieldErrors id="x-error" errors={["First error", "Second error"]} />,
    );

    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("id", "x-error");
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(
      ["First error", "Second error"],
    );
  });
});
