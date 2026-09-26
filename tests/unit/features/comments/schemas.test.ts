import { describe, expect, it } from "vitest";
import { commentSchema } from "@/features/comments/schemas";
import { failedFields } from "@/tests/setup/zod";

describe("commentSchema", () => {
  it("accepts a one-character comment (no arbitrary minimum, unlike articles)", () => {
    expect(commentSchema.safeParse({ content: "a" }).success).toBe(true);
  });

  it.each([
    { case: "an empty string", content: "" },
    { case: "only spaces", content: "     " },
    { case: "only whitespace characters", content: " \n\t " },
  ])("rejects $case", ({ content }) => {
    const result = commentSchema.safeParse({ content });

    expect(failedFields(result)).toEqual(["content"]);
  });

  it("rejects a missing content", () => {
    expect(failedFields(commentSchema.safeParse({}))).toEqual(["content"]);
  });

  it("trims the content it returns", () => {
    const result = commentSchema.safeParse({ content: "  hello  " });

    expect(result.success && result.data.content).toBe("hello");
  });
});
