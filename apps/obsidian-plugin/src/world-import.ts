import { parseWorldExchange } from "@simulation-external/world-io";
import {
  syncWorldMarkdown,
  type MarkdownVaultAdapter,
} from "@simulation-external/world-markdown";

/** Validate a local portable artifact before it enters the existing vault sync path. */
export async function syncWorldExchangeFile(
  source: string | Uint8Array | ArrayBuffer,
  vault: MarkdownVaultAdapter,
) {
  const exchange = parseWorldExchange(source);
  return syncWorldMarkdown(exchange, vault);
}
