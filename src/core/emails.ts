import type { HttpClient } from "../http/client.js";
import type {
  SendEmailOptions,
  SendEmailResponse,
  BulkSendEmailOptions,
  BulkSendEmailResponse,
} from "./types.js";
import { renderReact } from "./render-react.js";
import { ERROR_MESSAGES } from "./constants.js";

interface ApiSendResponse {
  emailId: string;
}

interface ApiBulkSendResponse {
  batchId: string;
  totalRecipients: number;
  successCount: number;
  failedCount: number;
}

const MAX_BULK_RECIPIENTS = 100;

// Render the `react` field to `html` (once) and drop `react` from the request
// body. An explicit `html` always takes precedence over `react`.
async function withRenderedReact<T extends { react?: unknown; html?: string }>(
  options: T
): Promise<Omit<T, "react">> {
  const { react, ...rest } = options;
  if (react != null && rest.html == null) {
    (rest as { html?: string }).html = await renderReact(react);
  }
  return rest;
}

export class Emails {
  constructor(private readonly http: HttpClient) {}

  async send(options: SendEmailOptions): Promise<SendEmailResponse> {
    let body;
    try {
      body = await withRenderedReact(options);
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : ERROR_MESSAGES.reactRenderError,
      };
    }

    const response = await this.http.post<ApiSendResponse>("/mails/send", body);

    if (response.success && response.data) {
      return {
        success: true,
        data: {
          emailId: response.data.emailId,
        },
      };
    }

    return {
      success: false,
      error: response.error,
      statusCode: response.statusCode,
    };
  }

  async bulk(options: BulkSendEmailOptions): Promise<BulkSendEmailResponse> {
    if (options.recipients.length === 0) {
      return { success: false, error: ERROR_MESSAGES.atLeastOneRecipient };
    }

    if (options.recipients.length > MAX_BULK_RECIPIENTS) {
      return {
        success: false,
        error: ERROR_MESSAGES.recipientLimitExceeded(
          options.recipients.length,
          MAX_BULK_RECIPIENTS
        ),
      };
    }

    let body;
    try {
      body = await withRenderedReact(options);
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : ERROR_MESSAGES.reactRenderError,
      };
    }

    const response = await this.http.post<ApiBulkSendResponse>("/mails/bulk", body);

    if (response.success && response.data) {
      return {
        success: true,
        data: {
          batchId: response.data.batchId,
          totalRecipients: response.data.totalRecipients,
          successCount: response.data.successCount,
          failedCount: response.data.failedCount,
        },
      };
    }

    return {
      success: false,
      error: response.error,
      statusCode: response.statusCode,
    };
  }
}
