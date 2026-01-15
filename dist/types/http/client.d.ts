import type { AutosendConfig } from "../core/types.js";
export declare class HttpClient {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly timeout;
    private readonly debug;
    private readonly maxRetries;
    constructor(config: AutosendConfig);
    private log;
    private sleep;
    private isRetryableError;
    request<T>(method: "GET" | "POST" | "DELETE", path: string, body?: unknown): Promise<{
        success: boolean;
        data?: T;
        error?: string;
        statusCode?: number;
    }>;
    get<T>(path: string): Promise<{
        success: boolean;
        data?: T;
        error?: string;
        statusCode?: number;
    }>;
    post<T>(path: string, body: unknown): Promise<{
        success: boolean;
        data?: T;
        error?: string;
        statusCode?: number;
    }>;
    delete<T>(path: string): Promise<{
        success: boolean;
        data?: T;
        error?: string;
        statusCode?: number;
    }>;
}
//# sourceMappingURL=client.d.ts.map