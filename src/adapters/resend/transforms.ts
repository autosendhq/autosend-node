import type { EmailAddress, SendEmailOptions as AutosendSendOptions } from "../../core/types.js";
import type {
  SendEmailOptions as ResendSendOptions,
  ErrorResponse,
  ResendErrorName,
} from "./types.js";

export function parseEmailAddress(input: string): EmailAddress {
  const match = input.match(/^(.+?)\s*<(.+)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { email: input.trim() };
}

export function parseEmailAddresses(input: string | string[]): EmailAddress[] {
  const addresses = Array.isArray(input) ? input : [input];
  return addresses.map(parseEmailAddress);
}

export function toAutosendRequest(resendOptions: ResendSendOptions): AutosendSendOptions {
  const to = parseEmailAddresses(resendOptions.to);

  const request: AutosendSendOptions = {
    from: parseEmailAddress(resendOptions.from),
    to: to.length === 1 ? to[0] : to,
    subject: resendOptions.subject,
  };

  if (resendOptions.html) {
    request.html = resendOptions.html;
  }

  if (resendOptions.text) {
    request.text = resendOptions.text;
  }

  if (resendOptions.cc) {
    request.cc = parseEmailAddresses(resendOptions.cc);
  }

  if (resendOptions.bcc) {
    request.bcc = parseEmailAddresses(resendOptions.bcc);
  }

  if (resendOptions.replyTo) {
    const replyTos = parseEmailAddresses(resendOptions.replyTo);
    request.replyTo = replyTos[0];
  }

  if (resendOptions.variables) {
    request.dynamicData = resendOptions.variables;
  }

  return request;
}

export function toResendResponse(autosendResponse: {
  success: boolean;
  data?: { emailId: string };
  error?: string;
}): {
  data: { id: string } | null;
  error: ErrorResponse | null;
} {
  if (autosendResponse.success && autosendResponse.data) {
    return {
      data: { id: autosendResponse.data.emailId },
      error: null,
    };
  }

  return {
    data: null,
    error: {
      message: autosendResponse.error ?? "Unknown error",
      name: "api_error",
    },
  };
}

export function mapHttpStatusToResendError(
  status: number,
  message: string
): ErrorResponse {
  const errorMap: Record<number, ResendErrorName> = {
    400: "validation_error",
    401: "missing_api_key",
    403: "invalid_api_key",
    404: "not_found",
    422: "validation_error",
    429: "rate_limit_exceeded",
    500: "internal_server_error",
  };

  return {
    name: errorMap[status] ?? "application_error",
    message,
    statusCode: status,
  };
}

export interface BulkSendRequest {
  from: EmailAddress;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: EmailAddress;
  recipients: EmailAddress[];
  dynamicData?: Record<string, string | number>;
}

export function toAutosendBulkRequest(resendOptions: ResendSendOptions): BulkSendRequest {
  const recipients = parseEmailAddresses(resendOptions.to);

  const request: BulkSendRequest = {
    from: parseEmailAddress(resendOptions.from),
    subject: resendOptions.subject,
    recipients,
  };

  if (resendOptions.html) {
    request.html = resendOptions.html;
  }

  if (resendOptions.text) {
    request.text = resendOptions.text;
  }

  if (resendOptions.replyTo) {
    const replyTos = parseEmailAddresses(resendOptions.replyTo);
    request.replyTo = replyTos[0];
  }

  if (resendOptions.variables) {
    request.dynamicData = resendOptions.variables;
  }

  return request;
}
