// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";

afterEach(cleanup);

describe("World Explorer navigation", () => {
  it("opens a person and follows a related entity into its details", () => {
    render(<App />);

    const entityNav = within(
      screen.getByRole("navigation", { name: "World entities" }),
    );
    fireEvent.click(entityNav.getByRole("button", { name: /People/ }));
    fireEvent.click(
      within(screen.getByRole("main")).getByRole("button", {
        name: /Lyra Venn/,
      }),
    );
    expect(
      screen.getByRole("heading", { name: "Lyra Venn", level: 2 }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Aurora Quay/ }));
    expect(
      screen.getByRole("heading", { name: "Aurora Quay", level: 2 }),
    ).toBeTruthy();
  });
});
