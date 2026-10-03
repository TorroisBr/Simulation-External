// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  collectionCoverageFixture,
  legacyWorldFixture,
  worldFixture,
} from "@simulation-external/world-fixtures";
import { serializeWorldExchange } from "@simulation-external/world-io";
import App from "./App";

afterEach(cleanup);

function createFile(name: string, contents: string): File {
  const bytes = new TextEncoder().encode(contents);
  return {
    name,
    arrayBuffer: async () =>
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  } as File;
}

async function chooseFile(file: File): Promise<void> {
  const input = screen.getByLabelText("World Exchange file");
  Object.defineProperty(input, "files", {
    configurable: true,
    value: [file],
  });
  await act(async () => {
    fireEvent.change(input);
    await Promise.resolve();
  });
}

describe("World Explorer navigation", () => {
  it("opens a person and follows a related entity into its details", () => {
    render(<App />);
    expect(screen.getByText("FIXTURE")).toBeTruthy();

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

  it("loads a portable exchange into the same navigable entity path", async () => {
    const portable = structuredClone(worldFixture);
    portable.world.name = "Portable Lyran Reach";
    render(<App />);

    await chooseFile(
      createFile("portable.world.json", serializeWorldExchange(portable)),
    );

    expect(
      screen.getByRole("heading", { name: /Welcome to Portable Lyran Reach/ }),
    ).toBeTruthy();
    expect(screen.getByText("PORTABLE FILE")).toBeTruthy();
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

    fireEvent.click(screen.getByRole("button", { name: "Use demo fixture" }));
    expect(
      screen.getByRole("heading", { name: /Welcome to The Lyran Reach/ }),
    ).toBeTruthy();
    expect(screen.getByText("FIXTURE")).toBeTruthy();
  });

  it("reports invalid files and keeps the current exchange active", async () => {
    render(<App />);
    await chooseFile(createFile("broken.world.json", "{broken"));

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Invalid World Exchange JSON");
    expect(
      screen.getByRole("heading", { name: /Welcome to The Lyran Reach/ }),
    ).toBeTruthy();
    expect(screen.getByText("FIXTURE")).toBeTruthy();
  });

  it("shows unsupported and deliberately omitted v2 collections without zero claims", async () => {
    render(<App />);
    await chooseFile(
      createFile(
        "coverage.world.json",
        serializeWorldExchange(collectionCoverageFixture),
      ),
    );

    const entityNav = within(
      screen.getByRole("navigation", { name: "World entities" }),
    );
    expect(
      entityNav.getByRole("button", { name: /Locations/ }).textContent,
    ).toContain("—");
    fireEvent.click(entityNav.getByRole("button", { name: /Locations/ }));
    expect(
      screen.getByText(
        "This producer cannot provide the collection; its absence does not mean the World has none.",
      ),
    ).toBeTruthy();

    fireEvent.click(entityNav.getByRole("button", { name: /Organizations/ }));
    expect(
      screen.getByText(
        "This artifact deliberately omits the collection; its absence does not mean the World has none.",
      ),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Timeline/ }));
    expect(
      screen.getByText(
        "This artifact deliberately omits the collection; its absence does not mean the World has none.",
      ),
    ).toBeTruthy();
  });

  it("keeps empty v1 collections explicitly unknown", async () => {
    const legacy = structuredClone(legacyWorldFixture);
    legacy.people = [];
    legacy.cities = [];
    legacy.locations = [];
    legacy.organizations = [];
    legacy.institutions = [];
    legacy.factions = [];
    legacy.items = [];
    legacy.historicalEvents = [];
    legacy.relationships = [];
    render(<App />);
    await chooseFile(
      createFile("legacy.world.json", serializeWorldExchange(legacy)),
    );

    expect(document.querySelector(".coverage-notice")?.textContent).toContain(
      "does not declare collection coverage",
    );
    const entityNav = within(
      screen.getByRole("navigation", { name: "World entities" }),
    );
    expect(
      entityNav.getByRole("button", { name: /People/ }).textContent,
    ).toContain("—");
    fireEvent.click(entityNav.getByRole("button", { name: /People/ }));
    expect(
      screen.getByText(
        /an empty list does not confirm that the World has none/,
      ),
    ).toBeTruthy();
  });
});
