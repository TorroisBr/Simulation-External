# Simulation External World Plugin

This initial plugin exports the bundled `worldFixture` to Markdown notes through the shared `world-markdown` package. It has no connection to the Simulation runtime and does not read or modify Simulation save files.

## Build

From the repository root, build dependencies and the plugin:

```sh
pnpm build
```

The build creates `main.js` beside `manifest.json`. Copy `manifest.json` and `main.js` into a folder under `<vault>/.obsidian/plugins/simulation-external-world/`, enable the plugin, then run **Sync bundled world fixture to Markdown notes** from the command palette.

The generated `main.js` is a local build artifact. Plugin tests for mapping and synchronization live in `packages/world-markdown` and run independently of Obsidian.
