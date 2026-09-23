import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Adds the jest-dom matchers (toBeInTheDocument, toHaveTextContent, ...) to
// Vitest's `expect`, for the "integration" project (Client Components +
// React Testing Library, environment "jsdom").

// React Testing Library only unmounts rendered components between tests
// automatically when the test runner exposes `afterEach` globally
// (`globals: true`), which is not the case here: do it explicitly, and reset
// mock call history so tests stay independent.
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
