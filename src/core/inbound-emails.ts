import type { HttpClient } from "../http/client.js";
import type {
  InboundMessage,
  InboundMessageSummary,
  InboundPagination,
  ListInboundMessagesOptions,
  ListInboundMessagesResponse,
  GetInboundMessageResponse,
  ReplyToMessageOptions,
  ReplyToMessageResponse,
  InboundAttachmentDownload,
  GetInboundAttachmentResponse,
} from "./types.js";

// Raw server payload shapes (after the HTTP client strips the { success, data }
// envelope and returns the inner `data`).
interface ApiInboundMessageList {
  items: InboundMessageSummary[];
  pagination: InboundPagination;
}

interface ApiReplyResult {
  emailId: string;
  status: string;
  totalRecipients: number;
  message: string;
}

export class InboundEmails {
  constructor(private readonly http: HttpClient) {}

  async list(
    options: ListInboundMessagesOptions = {}
  ): Promise<ListInboundMessagesResponse> {
    const response = await this.http.get<ApiInboundMessageList>(
      "/inbound/messages",
      options as Record<string, string | number | undefined>
    );

    if (response.success && response.data) {
      return {
        success: true,
        data: {
          items: response.data.items,
          pagination: response.data.pagination,
        },
      };
    }

    return {
      success: false,
      error: response.error,
      statusCode: response.statusCode,
    };
  }

  async get(id: string): Promise<GetInboundMessageResponse> {
    const response = await this.http.get<InboundMessage>(
      `/inbound/messages/${id}`
    );

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      error: response.error,
      statusCode: response.statusCode,
    };
  }

  // Fetch a short-lived signed download URL for a single attachment. The ref
  // may be the attachment's numeric index within the message or its stable
  // attachmentId — the server resolves both.
  async getAttachmentDownloadUrl(
    id: string,
    attachmentRef: string | number
  ): Promise<GetInboundAttachmentResponse> {
    const response = await this.http.get<InboundAttachmentDownload>(
      `/inbound/messages/${id}/attachments/${attachmentRef}`
    );

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      error: response.error,
      statusCode: response.statusCode,
    };
  }

  async reply(
    id: string,
    options: ReplyToMessageOptions
  ): Promise<ReplyToMessageResponse> {
    const response = await this.http.post<ApiReplyResult>(
      `/inbound/messages/${id}/reply`,
      options
    );

    if (response.success && response.data) {
      return {
        success: true,
        data: {
          emailId: response.data.emailId,
          status: response.data.status,
          totalRecipients: response.data.totalRecipients,
          message: response.data.message,
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
