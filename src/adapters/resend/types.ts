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

// Match Resend SDK types exactly

export interface CreateContactOptions {
  audienceId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  unsubscribed?: boolean;
  properties?: Record<string, string | number | null>;
  listIds?: string[];
}

// Resend uses this for get/update/remove - identify by id OR email
export type GetContactOptions = string | { id?: string; email?: string; audienceId?: string };
export type RemoveContactOptions = string | { id?: string; email?: string; audienceId?: string };

export interface UpdateContactOptions {
  id?: string;
  email?: string;
  audienceId?: string;
  firstName?: string | null;
  lastName?: string | null;
  unsubscribed?: boolean;
  properties?: Record<string, string | number | null>;
  listIds?: string[];
}

export interface Contact {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  unsubscribed: boolean;
  properties?: Record<string, string | number>;
  listIds?: string[];
}

export interface CreateContactResponse {
  id: string;
}

export interface UpdateContactResponse {
  id: string;
}

export interface RemoveContactResponse {
  deleted: boolean;
  contact: string;
}

export type ResendErrorName =
  | "validation_error"
  | "missing_api_key"
  | "invalid_api_key"
  | "not_found"
  | "rate_limit_exceeded"
  | "internal_server_error"
  | "application_error";
