# Simulation External World Plugin

This plugin writes World Exchange data to Markdown notes through the shared `world-markdown` package. It supports the bundled `worldFixture` and manually selected portable `*.world.json` files. It has no connection to the Simulation runtime and does not read or modify Simulation save files.

## Build

From the repository root, build dependencies and the plugin:

```sh
pnpm build
```

The build creates `main.js` beside `manifest.json`. Copy `manifest.json` and `main.js` into a folder under `<vault>/.obsidian/plugins/simulation-external-world/` and enable the plugin. Run **Sync bundled world fixture to Markdown notes** for the demo, or **Import World Exchange file to Markdown notes** to select a local `*.world.json` artifact. The selected file is parsed and validated in the plugin, then passed to the shared Markdown sync path; it is not uploaded or written back to Simulation.

The generated `main.js` is a local build artifact. Mapping and synchronization tests live in `packages/world-markdown`; portable-file import tests live in `apps/obsidian-plugin/test/`. Both test suites run independently of Obsidian.
