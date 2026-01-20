import type { HttpClient } from "../http/client.js";
import type {
  Contact,
  CreateContactOptions,
  CreateContactResponse,
  GetContactResponse,
  DeleteContactResponse,
} from "./types.js";

export class Contacts {
  constructor(private readonly http: HttpClient) {}

  async create(options: CreateContactOptions): Promise<CreateContactResponse> {
    const response = await this.http.post<Contact>("/contacts", options);

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      error: response.error,
    };
  }

  async get(id: string): Promise<GetContactResponse> {
    const response = await this.http.get<Contact>(`/contacts/${id}`);

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      error: response.error,
    };
  }

  async delete(id: string): Promise<DeleteContactResponse> {
    const response = await this.http.delete(`/contacts/${id}`);

    if (response.success) {
      return { success: true };
    }

    return {
      success: false,
      error: response.error,
    };
  }

  async upsert(options: CreateContactOptions): Promise<CreateContactResponse> {
    const response = await this.http.post<Contact>("/contacts/email", options);

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      error: response.error,
    };
  }
}
