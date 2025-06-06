import { Cell } from "retend";
import { Errors, RecoinError } from "./error.ts";

const BASE_URL = Cell.source<string | null>(null);

/**
 * Gets the configured API URL from the cell source.
 * @throws {RecoinError} If the API URL has not been configured
 * @returns The configured API URL
 */
export function getBaseUrl(): string {
   const baseUrl = BASE_URL.get();
   if (!baseUrl) {
      throw new RecoinError(Errors.CONFIG_NOT_DEFINED);
   }
   return baseUrl;
}

interface ApiConfig {
   baseUrl: string;
}

export function defineConfig(config: ApiConfig) {
   BASE_URL.set(config.baseUrl);
}
