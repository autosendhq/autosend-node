import type { HttpClient } from "../http/client.js";
import type {
  SendEmailOptions,
  SendEmailResponse,
  BulkSendEmailOptions,
  BulkSendEmailResponse,
} from "./types.js";

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

export class Emails {
  constructor(private readonly http: HttpClient) {}

  async send(options: SendEmailOptions): Promise<SendEmailResponse> {
    const response = await this.http.post<ApiSendResponse>("/mails/send", options);

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
    };
  }

  async bulk(options: BulkSendEmailOptions): Promise<BulkSendEmailResponse> {
    if (options.recipients.length === 0) {
      return { success: false, error: "At least one recipient is required" };
    }

    if (options.recipients.length > MAX_BULK_RECIPIENTS) {
      return {
        success: false,
        error: `Recipient count ${options.recipients.length} exceeds maximum of ${MAX_BULK_RECIPIENTS}. Split into multiple bulk() calls.`,
      };
    }

    const response = await this.http.post<ApiBulkSendResponse>("/mails/bulk", options);

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
    };
  }
}
