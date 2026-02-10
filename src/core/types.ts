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
  templateId?: string;
  dynamicData?: Record<string, string | number>;
  cc?: EmailAddress | EmailAddress[];
  bcc?: EmailAddress | EmailAddress[];
  replyTo?: EmailAddress;
}

export type SendEmailRequest = SendEmailOptions;

export interface SendEmailResponse {
  success: boolean;
  data?: {
    emailId: string;
  };
  error?: string;
}

export interface BulkSendEmailOptions {
  from: EmailAddress;
  subject?: string;
  html?: string;
  text?: string;
  dynamicData?: Record<string, string | number>;
  templateId?: string;
  replyTo?: EmailAddress;
  unsubscribeGroupId?: string;
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
