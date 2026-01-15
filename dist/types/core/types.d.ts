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
export interface SendEmailOptions {
    from: EmailAddress;
    to: EmailAddress | EmailAddress[];
    subject: string;
    html?: string;
    text?: string;
    templateId?: string;
    variables?: Record<string, string | number>;
    cc?: EmailAddress | EmailAddress[];
    bcc?: EmailAddress | EmailAddress[];
    replyTo?: EmailAddress;
}
export interface SendEmailResponse {
    success: boolean;
    data?: {
        emailId: string;
    };
    error?: string;
}
export interface BulkSendEmailOptions {
    emails: SendEmailOptions[];
}
export interface BulkSendEmailResponse {
    success: boolean;
    data?: {
        emailIds: string[];
    };
    error?: string;
}
export interface Contact {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    userId?: string;
    createdAt: string;
    updatedAt: string;
}
export interface CreateContactOptions {
    email: string;
    firstName?: string;
    lastName?: string;
    userId?: string;
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
//# sourceMappingURL=types.d.ts.map