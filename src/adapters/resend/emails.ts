import type { Autosend } from "../../core/client.js";
import type {
  SendEmailOptions,
  ApiResponse,
  CreateEmailResponse,
} from "./types.js";
import {
  toAutosendRequest,
  toAutosendBulkRequest,
  mapHttpStatusToResendError,
} from "./transforms.js";
import { ERROR_MESSAGES } from "../../core/constants.js";

export class EmailsAdapter {
  constructor(private readonly client: Autosend) {}

  private getRecipientCount(to: string | string[]): number {
    return Array.isArray(to) ? to.length : 1;
  }

  async send(options: SendEmailOptions): Promise<ApiResponse<CreateEmailResponse>> {
    // Warn about unsupported features
    if (options.tags?.length) {
      console.warn(ERROR_MESSAGES.unsupportedTags);
    }

    if (options.attachments?.length) {
      console.warn(ERROR_MESSAGES.unsupportedAttachments);
    }

    if (options.headers && Object.keys(options.headers).length > 0) {
      console.warn(ERROR_MESSAGES.unsupportedHeaders);
    }

    if (options.scheduledAt) {
      console.warn(ERROR_MESSAGES.unsupportedScheduledAt);
    }

    try {
      // If multiple recipients, use bulk API. The `react` field (if any) is
      // forwarded through the transforms and rendered once by the core client.
      if (this.getRecipientCount(options.to) > 1) {
        return this.sendBulk(options);
      }

      const autosendRequest = toAutosendRequest(options);
      const response = await this.client.emails.send(autosendRequest);

      if (response.success && response.data) {
        return {
          data: { id: response.data.emailId },
          error: null,
        };
      }

      return {
        data: null,
        error: mapHttpStatusToResendError(
          response.statusCode || 500,
          response.error ?? ERROR_MESSAGES.unknownError
        ),
      };
    } catch (err) {
      return {
        data: null,
        error: {
          name: "api_error",
          message: err instanceof Error ? err.message : ERROR_MESSAGES.unknownError,
        },
      };
    }
  }

  private async sendBulk(options: SendEmailOptions): Promise<ApiResponse<CreateEmailResponse>> {
    const bulkRequest = toAutosendBulkRequest(options);
    const response = await this.client.emails.bulk(bulkRequest);

    if (response.success && response.data) {
      // Return the batch ID for compatibility with Resend's single response format
      return {
        data: { id: response.data.batchId },
        error: null,
      };
    }

    return {
      data: null,
      error: mapHttpStatusToResendError(
        response.statusCode || 500,
        response.error ?? ERROR_MESSAGES.unknownError
      ),
    };
  }
}
