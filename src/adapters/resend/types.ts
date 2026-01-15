export interface SendEmailOptions {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string | string[];
  headers?: Record<string, string>;
  attachments?: Attachment[];
  tags?: Tag[];
  scheduledAt?: string;
}

export interface Attachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
}

export interface Tag {
  name: string;
  value: string;
}

export interface CreateEmailResponse {
  id: string;
}

export interface ErrorResponse {
  name: string;
  message: string;
  statusCode?: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ErrorResponse | null;
}

export interface CreateContactOptions {
  email: string;
  firstName?: string;
  lastName?: string;
  unsubscribed?: boolean;
  audienceId: string;
}

export interface Contact {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  unsubscribed: boolean;
}

export interface UpdateContactOptions {
  email?: string;
  firstName?: string;
  lastName?: string;
  unsubscribed?: boolean;
  audienceId: string;
}

export interface DeleteContactResponse {
  deleted: boolean;
}

export type ResendErrorName =
  | "validation_error"
  | "missing_api_key"
  | "invalid_api_key"
  | "not_found"
  | "rate_limit_exceeded"
  | "internal_server_error"
  | "application_error";
