"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const DEFAULT_BASE_URL = "http://localhost:6001/v1";
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_MAX_RETRIES = 3;
class HttpClient {
    apiKey;
    baseUrl;
    timeout;
    debug;
    maxRetries;
    constructor(config) {
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
        this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
        this.debug = config.debug ?? false;
        this.maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
    }
    log(message, data) {
        if (this.debug) {
            console.log(`[Autosend] ${message}`, data ?? "");
        }
    }
    async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    isRetryableError(status) {
        return status === 429 || status >= 500;
    }
    async request(method, path, body) {
        const url = `${this.baseUrl}${path}`;
        this.log(`${method} ${path}`, body ? { body: "..." } : undefined);
        let lastError = null;
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
                    let errorMessage;
                    try {
                        const errorJson = JSON.parse(errorText);
                        errorMessage = errorJson.message ?? errorJson.error ?? errorText;
                    }
                    catch {
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
                const data = (await response.json());
                this.log(`Response:`, { status: response.status });
                return { success: true, data };
            }
            catch (err) {
                lastError = err;
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
    async get(path) {
        return this.request("GET", path);
    }
    async post(path, body) {
        return this.request("POST", path, body);
    }
    async delete(path) {
        return this.request("DELETE", path);
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=client.js.map