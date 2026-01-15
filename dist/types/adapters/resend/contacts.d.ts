import type { Autosend } from "../../core/client.js";
import type { CreateContactOptions, UpdateContactOptions, Contact, ApiResponse, DeleteContactResponse } from "./types.js";
export declare class ContactsAdapter {
    private readonly client;
    constructor(client: Autosend);
    create(options: CreateContactOptions): Promise<ApiResponse<Contact>>;
    get(_audienceId: string, id: string): Promise<ApiResponse<Contact>>;
    update(_audienceId: string, _id: string, options: Omit<UpdateContactOptions, "audienceId">): Promise<ApiResponse<Contact>>;
    remove(_audienceId: string, id: string): Promise<ApiResponse<DeleteContactResponse>>;
}
//# sourceMappingURL=contacts.d.ts.map