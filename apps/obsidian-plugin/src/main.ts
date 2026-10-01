import { Notice, Plugin } from "obsidian";
import { worldFixture } from "@simulation-external/world-fixtures";
import {
  syncWorldMarkdown,
  type MarkdownVaultAdapter,
} from "@simulation-external/world-markdown";

export default class SimulationExternalWorldMarkdownPlugin extends Plugin {
  onload(): void {
    this.addCommand({
      id: "sync-demo-world-markdown",
      name: "Sync bundled world fixture to Markdown notes",
      callback: () => void this.syncFixture(),
    });
  }

  private async syncFixture(): Promise<void> {
    const vault = this.createVaultAdapter();
    try {
      const result = await syncWorldMarkdown(worldFixture, vault);
      new Notice(
        `World Markdown sync complete: ${result.created.length} created, ${result.updated.length} updated, ${result.unchanged.length} unchanged.`,
      );
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      new Notice(`World Markdown sync failed: ${detail}`);
    }
  }

  private createVaultAdapter(): MarkdownVaultAdapter {
    return {
      read: async (path) => {
        if (!(await this.app.vault.adapter.exists(path))) return null;
        return this.app.vault.adapter.read(path);
      },
      write: async (path, content) => {
        const segments = path.split("/");
        let folder = "";
        for (const segment of segments.slice(0, -1)) {
          folder = folder === "" ? segment : `${folder}/${segment}`;
          if (!(await this.app.vault.adapter.exists(folder))) {
            await this.app.vault.createFolder(folder);
          }
        }
        await this.app.vault.adapter.write(path, content);
      },
    };
  }
}
