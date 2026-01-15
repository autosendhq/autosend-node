"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailsAdapter = void 0;
const transforms_js_1 = require("./transforms.cjs");
class EmailsAdapter {
    client;
    constructor(client) {
        this.client = client;
    }
    getRecipientCount(to) {
        return Array.isArray(to) ? to.length : 1;
    }
    async send(options) {
        // Warn about unsupported features
        if (options.tags?.length) {
            console.warn("Autosend: tags are not supported and will be ignored");
        }
        if (options.attachments?.length) {
            console.warn("Autosend: attachments are not currently supported");
        }
        if (options.headers && Object.keys(options.headers).length > 0) {
            console.warn("Autosend: custom headers are not supported and will be ignored");
        }
        if (options.scheduledAt) {
            console.warn("Autosend: scheduledAt is not supported and will be ignored");
        }
        try {
            // If multiple recipients, use bulk API
            if (this.getRecipientCount(options.to) > 1) {
                return this.sendBulk(options);
            }
            const autosendRequest = (0, transforms_js_1.toAutosendRequest)(options);
            const response = await this.client.emails.send(autosendRequest);
            if (response.success && response.data) {
                return {
                    data: { id: response.data.emailId },
                    error: null,
                };
            }
            return {
                data: null,
                error: (0, transforms_js_1.mapHttpStatusToResendError)(500, response.error ?? "Unknown error"),
            };
        }
        catch (err) {
            return {
                data: null,
                error: {
                    name: "api_error",
                    message: err instanceof Error ? err.message : "Unknown error",
                },
            };
        }
    }
    async sendBulk(options) {
        const bulkRequest = (0, transforms_js_1.toAutosendBulkRequest)(options);
        const response = await this.client.http.post("/mails/bulk", bulkRequest);
        if (response.success && response.data?.data?.batchId) {
            // Return the batch ID for compatibility with Resend's single response format
            return {
                data: { id: response.data.data.batchId },
                error: null,
            };
        }
        const errorMessage = response.data?.error?.message ?? response.error ?? "Unknown error";
        return {
            data: null,
            error: (0, transforms_js_1.mapHttpStatusToResendError)(500, errorMessage),
        };
    }
}
exports.EmailsAdapter = EmailsAdapter;
//# sourceMappingURL=emails.js.map