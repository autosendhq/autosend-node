import type { HttpClient } from "../http/client.js";
import type { CreateContactOptions, CreateContactResponse, GetContactResponse, DeleteContactResponse } from "./types.js";
export declare class Contacts {
    private readonly http;
    constructor(http: HttpClient);
    create(options: CreateContactOptions): Promise<CreateContactResponse>;
    get(id: string): Promise<GetContactResponse>;
    delete(id: string): Promise<DeleteContactResponse>;
    upsert(options: CreateContactOptions): Promise<CreateContactResponse>;
}
//# sourceMappingURL=contacts.d.ts.map