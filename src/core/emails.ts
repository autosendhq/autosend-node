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
  emailIds: string[];
}

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
    const response = await this.http.post<ApiBulkSendResponse>("/mails/bulk", options);

    if (response.success && response.data) {
      return {
        success: true,
        data: {
          emailIds: response.data.emailIds,
        },
      };
    }

    return {
      success: false,
      error: response.error,
    };
  }
}
