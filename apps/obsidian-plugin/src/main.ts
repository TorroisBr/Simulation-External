import { Notice, Plugin } from "obsidian";
import { worldFixture } from "@simulation-external/world-fixtures";
import {
  syncWorldMarkdown,
  type MarkdownVaultAdapter,
} from "@simulation-external/world-markdown";
import { syncWorldExchangeFile } from "./world-import.js";

export default class SimulationExternalWorldMarkdownPlugin extends Plugin {
  onload(): void {
    this.addCommand({
      id: "sync-demo-world-markdown",
      name: "Sync bundled world fixture to Markdown notes",
      callback: () => void this.syncFixture(),
    });
    this.addCommand({
      id: "import-world-exchange-file",
      name: "Import World Exchange file to Markdown notes",
      callback: () => this.chooseWorldExchangeFile(),
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

  private chooseWorldExchangeFile(): void {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".world.json,application/json";
    input.setAttribute("aria-label", "World Exchange file");
    input.style.display = "none";
    input.addEventListener("cancel", () => input.remove(), { once: true });
    input.addEventListener(
      "change",
      () => {
        const file = input.files?.[0];
        input.remove();
        if (file) void this.syncPortableFile(file);
      },
      { once: true },
    );
    document.body.appendChild(input);
    input.click();
  }

  private async syncPortableFile(file: File): Promise<void> {
    try {
      const result = await syncWorldExchangeFile(
        await file.arrayBuffer(),
        this.createVaultAdapter(),
      );
      new Notice(
        `${file.name}: ${result.created.length} created, ${result.updated.length} updated, ${result.unchanged.length} unchanged.`,
      );
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      new Notice(`World Exchange import failed: ${detail}`);
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
