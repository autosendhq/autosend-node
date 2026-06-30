import { Autosend as AutosendCore } from "../../core/client.js";
import { EmailsAdapter } from "./emails.js";
import { ContactsAdapter } from "./contacts.js";
import { ERROR_MESSAGES } from "../../core/constants.js";

export interface ResendOptions {
  baseUrl?: string;
  timeout?: number;
  debug?: boolean;
  maxRetries?: number;
}

export class Resend {
  public readonly emails: EmailsAdapter;
  public readonly contacts: ContactsAdapter;

  constructor(apiKey?: string, options: ResendOptions = {}) {
    const key = apiKey ?? process.env.RESEND_API_KEY;

    if (!key) {
      throw new Error(ERROR_MESSAGES.missingApiKey);
    }

    const autosendClient = new AutosendCore(key, {
      baseUrl: options.baseUrl,
      timeout: options.timeout,
      debug: options.debug,
      maxRetries: options.maxRetries,
    });

    this.emails = new EmailsAdapter(autosendClient);
    this.contacts = new ContactsAdapter(autosendClient);
  }
}

export * from "./types.js";
export { parseEmailAddress, parseEmailAddresses, mapHttpStatusToResendError, toAutosendBulkRequest } from "./transforms.js";
