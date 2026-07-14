export interface AutosendConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  debug?: boolean;
  maxRetries?: number;
}

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface BulkRecipient {
  email: string;
  name?: string;
  dynamicData?: Record<string, string | number>;
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
}

export interface SendEmailOptions {
  from: EmailAddress;
  to: EmailAddress | EmailAddress[];
  subject: string;
  html?: string;
  text?: string;
  react?: unknown;
  templateId?: string;
  dynamicData?: Record<string, string | number>;
  cc?: EmailAddress | EmailAddress[];
  bcc?: EmailAddress | EmailAddress[];
  replyTo?: EmailAddress;
  bypassSuppressions?: boolean;
}

export type SendEmailRequest = SendEmailOptions;

export interface SendEmailResponse {
  success: boolean;
  data?: {
    emailId: string;
  };
  error?: string;
  statusCode?: number;
}

export interface BulkSendEmailOptions {
  from: EmailAddress;
  subject?: string;
  html?: string;
  text?: string;
  react?: unknown;
  dynamicData?: Record<string, string | number>;
  templateId?: string;
  replyTo?: EmailAddress;
  unsubscribeGroupId?: string;
  bypassSuppressions?: boolean;
  recipients: BulkRecipient[];
}

export interface BulkSendEmailResponse {
  success: boolean;
  data?: {
    batchId: string;
    totalRecipients: number;
    successCount: number;
    failedCount: number;
  };
  error?: string;
  statusCode?: number;
}

export interface Contact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
  listIds?: string[];
  customFields?: Record<string, string | number>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactOptions {
  email: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
  listIds?: string[];
  customFields?: Record<string, string | number | null>;
}

export interface CreateContactResponse {
  success: boolean;
  data?: Contact;
  error?: string;
}

export interface GetContactResponse {
  success: boolean;
  data?: Contact;
  error?: string;
}

export interface DeleteContactResponse {
  success: boolean;
  error?: string;
}

export interface AutosendApiError {
  statusCode: number;
  message: string;
}

// --- Inbound emails ---

// The inbound API returns addresses with an explicit `name` that may be null,
// distinct from the outbound `EmailAddress` where `name` is optional.
export interface InboundEmailAddress {
  email: string;
  name: string | null;
}

// String enum: values match the raw status strings returned by the API, so
// data cast from responses compares correctly (e.g. `msg.status === InboundMessageStatus.Processed`).
export enum InboundMessageStatus {
  Processed = "PROCESSED",
  Processing = "PROCESSING",
  Failed = "FAILED",
  BlockedUnverified = "BLOCKED_UNVERIFIED",
  BlockedUnrouted = "BLOCKED_UNROUTED",
}

export interface InboundAttachmentMeta {
  attachmentId: string;
  filename: string;
  contentType: string;
  size: number;
  index: number;
}

export interface InboundMessageSummary {
  id: string;
  messageId: string;
  domainName: string;
  from: InboundEmailAddress;
  to: InboundEmailAddress[];
  cc: InboundEmailAddress[];
  subject: string;
  status: InboundMessageStatus;
  attachmentCount: number;
  receivedAt: string;
}

export interface InboundMessage {
  id: string;
  messageId: string;
  domainName: string;
  from: InboundEmailAddress;
  to: InboundEmailAddress[];
  cc: InboundEmailAddress[];
  bcc: InboundEmailAddress[];
  replyTo: InboundEmailAddress[];
  subject: string;
  text: string;
  html: string;
  attachments: InboundAttachmentMeta[];
  headers: Record<string, string>;
  spamVerdict: string;
  virusVerdict: string;
  spfVerdict: string;
  dkimVerdict: string;
  dmarcVerdict: string;
  status: InboundMessageStatus;
  threadId: string;
  inReplyTo: string | null;
  inReplyToEmailActivityId: string | null;
  inReplyToInboundEmailId: string | null;
  receivedAt: string;
}

export interface InboundPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ListInboundMessagesOptions {
  from?: string;
  to?: string;
  threadId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ListInboundMessagesResponse {
  success: boolean;
  data?: {
    items: InboundMessageSummary[];
    pagination: InboundPagination;
  };
  error?: string;
  statusCode?: number;
}

export interface GetInboundMessageResponse {
  success: boolean;
  data?: InboundMessage;
  error?: string;
  statusCode?: number;
}

export interface ReplyAttachment {
  fileName: string;
  content?: string;
  fileUrl?: string;
  contentType?: string;
  fileSize?: number;
  contentId?: string;
  description?: string;
}

export interface ReplyToMessageOptions {
  from: EmailAddress;
  subject?: string;
  html?: string;
  text?: string;
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  attachments?: ReplyAttachment[];
}

export interface ReplyToMessageResponse {
  success: boolean;
  data?: {
    emailId: string;
    status: string;
    totalRecipients: number;
    message: string;
  };
  error?: string;
  statusCode?: number;
}

// Signed, short-lived URL for downloading a single inbound attachment.
export interface InboundAttachmentDownload {
  attachmentId: string;
  filename: string;
  contentType: string;
  size: number;
  downloadUrl: string;
  // Seconds until `downloadUrl` expires.
  expiresIn: number;
}

export interface GetInboundAttachmentResponse {
  success: boolean;
  data?: InboundAttachmentDownload;
  error?: string;
  statusCode?: number;
}
