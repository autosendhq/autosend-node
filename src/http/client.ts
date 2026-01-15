import type { AutosendConfig, AutosendApiError } from "../core/types.js";

const DEFAULT_BASE_URL =
  process.env.AUTOSEND_BASE_URL ?? "https://api.autosend.com/v1";
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_MAX_RETRIES = 3;

export class HttpClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly debug: boolean;
  private readonly maxRetries: number;

  constructor(config: AutosendConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
    this.debug = config.debug ?? false;
    this.maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
  }

  private log(message: string, data?: unknown): void {
    if (this.debug) {
      console.log(`[Autosend] ${message}`, data ?? "");
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private isRetryableError(status: number): boolean {
    return status === 429 || status >= 500;
  }

  async request<T>(
    method: "GET" | "POST" | "DELETE",
    path: string,
    body?: unknown
  ): Promise<{ success: boolean; data?: T; error?: string; statusCode?: number }> {
    const url = `${this.baseUrl}${path}`;

    this.log(`${method} ${path}`, body ? { body: "..." } : undefined);

    let lastError: Error | null = null;
    let lastStatusCode = 0;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        lastStatusCode = response.status;

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage: string;

          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message ?? errorJson.error ?? errorText;
          } catch {
            errorMessage = errorText || `HTTP ${response.status}`;
          }

          if (this.isRetryableError(response.status) && attempt < this.maxRetries) {
            const delay = 1000 * Math.pow(2, attempt - 1);
            this.log(`Retryable error (${response.status}), retrying in ${delay}ms...`);
            await this.sleep(delay);
            continue;
          }

          return {
            success: false,
            error: errorMessage,
            statusCode: response.status,
          };
        }

        const data = (await response.json()) as T;
        this.log(`Response:`, { status: response.status });

        return { success: true, data };
      } catch (err) {
        lastError = err as Error;

        if (lastError.name === "AbortError") {
          return {
            success: false,
            error: "Request timeout",
            statusCode: 0,
          };
        }

        if (attempt < this.maxRetries) {
          const delay = 1000 * Math.pow(2, attempt - 1);
          this.log(`Network error, retrying in ${delay}ms...`);
          await this.sleep(delay);
          continue;
        }
      }
    }

    return {
      success: false,
      error: lastError?.message ?? "Unknown error",
      statusCode: lastStatusCode,
    };
  }

  async get<T>(path: string): Promise<{ success: boolean; data?: T; error?: string; statusCode?: number }> {
    return this.request<T>("GET", path);
  }

  async post<T>(
    path: string,
    body: unknown
  ): Promise<{ success: boolean; data?: T; error?: string; statusCode?: number }> {
    return this.request<T>("POST", path, body);
  }

  async delete<T>(path: string): Promise<{ success: boolean; data?: T; error?: string; statusCode?: number }> {
    return this.request<T>("DELETE", path);
  }
}
