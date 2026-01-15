import { HttpClient } from "../http/client.js";
import { Emails } from "./emails.js";
import { Contacts } from "./contacts.js";
import type { AutosendConfig } from "./types.js";

export interface AutosendOptions {
  baseUrl?: string;
  timeout?: number;
  debug?: boolean;
  maxRetries?: number;
}

export class Autosend {
  public readonly emails: Emails;
  public readonly contacts: Contacts;
  public readonly http: HttpClient;

  constructor(apiKey: string, options: AutosendOptions = {}) {
    const config: AutosendConfig = {
      apiKey,
      ...options,
    };

    this.http = new HttpClient(config);

    this.emails = new Emails(this.http);
    this.contacts = new Contacts(this.http);
  }
}
