import type { Autosend } from "../../core/client.js";
import type {
  CreateContactOptions,
  UpdateContactOptions,
  GetContactOptions,
  RemoveContactOptions,
  Contact,
  ApiResponse,
  CreateContactResponse,
  UpdateContactResponse,
  RemoveContactResponse,
} from "./types.js";
import { mapHttpStatusToResendError } from "./transforms.js";

export class ContactsAdapter {
  constructor(private readonly client: Autosend) {}

  // Resend: create(payload) → { data: { id }, error }
  async create(options: CreateContactOptions): Promise<ApiResponse<CreateContactResponse>> {
    try {
      const response = await this.client.contacts.create({
        email: options.email,
        firstName: options.firstName,
        lastName: options.lastName,
        customFields: options.properties,
        listIds: options.listIds,
      });

      if (response.success && response.data) {
        return {
          data: { id: response.data.id },
          error: null,
        };
      }

      return {
        data: null,
        error: mapHttpStatusToResendError(500, response.error ?? "Unknown error"),
      };
    } catch (err) {
      return {
        data: null,
        error: {
          name: "api_error",
          message: err instanceof Error ? err.message : "Unknown error",
        },
      };
    }
  }

  // Resend: get(idOrOptions) → { data: Contact, error }
  // Accepts: string | { id } | { email }
  async get(options: GetContactOptions): Promise<ApiResponse<Contact>> {
    try {
      const id = typeof options === "string" ? options : options.id;

      if (!id) {
        // Email-based lookup not supported by Autosend API
        return {
          data: null,
          error: {
            name: "validation_error",
            message: "Contact ID is required. Email-based lookup is not supported.",
          },
        };
      }

      const response = await this.client.contacts.get(id);

      if (response.success && response.data) {
        return {
          data: {
            id: response.data.id,
            email: response.data.email,
            firstName: response.data.firstName ?? null,
            lastName: response.data.lastName ?? null,
            createdAt: response.data.createdAt,
            unsubscribed: false,
            properties: response.data.customFields,
            listIds: response.data.listIds,
          },
          error: null,
        };
      }

      return {
        data: null,
        error: mapHttpStatusToResendError(404, response.error ?? "Contact not found"),
      };
    } catch (err) {
      return {
        data: null,
        error: {
          name: "api_error",
          message: err instanceof Error ? err.message : "Unknown error",
        },
      };
    }
  }

  // Resend: update(options) → { data: { id }, error }
  // Uses upsert via email
  async update(options: UpdateContactOptions): Promise<ApiResponse<UpdateContactResponse>> {
    try {
      const email = options.email;

      if (!email) {
        return {
          data: null,
          error: {
            name: "validation_error",
            message: "Email is required for update",
          },
        };
      }

      const response = await this.client.contacts.upsert({
        email,
        firstName: options.firstName ?? undefined,
        lastName: options.lastName ?? undefined,
        customFields: options.properties,
        listIds: options.listIds,
      });

      if (response.success && response.data) {
        return {
          data: { id: response.data.id },
          error: null,
        };
      }

      return {
        data: null,
        error: mapHttpStatusToResendError(500, response.error ?? "Unknown error"),
      };
    } catch (err) {
      return {
        data: null,
        error: {
          name: "api_error",
          message: err instanceof Error ? err.message : "Unknown error",
        },
      };
    }
  }

  // Resend: remove(idOrOptions) → { data: { deleted, contact }, error }
  async remove(options: RemoveContactOptions): Promise<ApiResponse<RemoveContactResponse>> {
    try {
      const id = typeof options === "string" ? options : options.id;

      if (!id) {
        return {
          data: null,
          error: {
            name: "validation_error",
            message: "Contact ID is required. Email-based removal is not supported.",
          },
        };
      }

      const response = await this.client.contacts.delete(id);

      if (response.success) {
        return {
          data: { deleted: true, contact: id },
          error: null,
        };
      }

      return {
        data: null,
        error: mapHttpStatusToResendError(500, response.error ?? "Unknown error"),
      };
    } catch (err) {
      return {
        data: null,
        error: {
          name: "api_error",
          message: err instanceof Error ? err.message : "Unknown error",
        },
      };
    }
  }
}
