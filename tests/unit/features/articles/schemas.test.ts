import { describe, expect, it } from "vitest";
import { createArticleSchema } from "@/features/articles/schemas";
import { failedFields } from "@/tests/setup/zod";

describe("createArticleSchema", () => {
  // Reference input: each test changes ONE field only.
  const validInput = {
    themeId: "some-theme-id",
    title: "A valid article title",
    content: "x".repeat(300),
  };

  it("accepts a valid input", () => {
    expect(createArticleSchema.safeParse(validInput).success).toBe(true);
  });

  describe("title (10 to 100 characters, trimmed)", () => {
    it.each([
      { length: 9, title: "a".repeat(9), accepted: false },
      { length: 10, title: "a".repeat(10), accepted: true },
      { length: 100, title: "a".repeat(100), accepted: true },
      { length: 101, title: "a".repeat(101), accepted: false },
    ])("$length characters -> accepted: $accepted", ({ title, accepted }) => {
      const result = createArticleSchema.safeParse({ ...validInput, title });

      expect(result.success).toBe(accepted);
      if (!accepted) expect(failedFields(result)).toEqual(["title"]);
    });

    it("counts characters AFTER trim (surrounding spaces do not help)", () => {
      const result = createArticleSchema.safeParse({
        ...validInput,
        title: `   ${"a".repeat(9)}   `,
      });

      expect(failedFields(result)).toEqual(["title"]);
    });
  });

  describe("content (300 characters minimum, trimmed)", () => {
    it("accepts exactly 300 characters", () => {
      const result = createArticleSchema.safeParse({
        ...validInput,
        content: "x".repeat(300),
      });

      expect(result.success).toBe(true);
    });

    it("rejects 299 characters", () => {
      const result = createArticleSchema.safeParse({
        ...validInput,
        content: "x".repeat(299),
      });

      expect(failedFields(result)).toEqual(["content"]);
    });

    it("counts characters AFTER trim", () => {
      const result = createArticleSchema.safeParse({
        ...validInput,
        content: `${"x".repeat(299)}          `,
      });

      expect(failedFields(result)).toEqual(["content"]);
    });
  });

  describe("themeId (required)", () => {
    it("rejects an empty themeId", () => {
      const result = createArticleSchema.safeParse({
        ...validInput,
        themeId: "",
      });

      expect(failedFields(result)).toEqual(["themeId"]);
    });

    it("rejects a missing themeId", () => {
      expect(
        failedFields(
          createArticleSchema.safeParse({ ...validInput, themeId: undefined }),
        ),
      ).toEqual(["themeId"]);
    });
  });
});
