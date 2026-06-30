# AutoSend Node.js SDK

![nodejs-og](https://github.com/user-attachments/assets/1b66c98a-e5ce-48b8-9a05-0ed701f7e7e4)

[![npm version](https://img.shields.io/npm/v/autosendjs.svg)](https://www.npmjs.com/package/autosendjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The official Node.js SDK for the [AutoSend](https://autosend.com) API.

## Installation

```bash
npm install autosendjs
```

or

```bash
yarn add autosendjs
```

## Setup

First, get your API key from the [AutoSend Dashboard](https://autosend.com/dashboard).

```typescript
import { Autosend } from "autosendjs";

const autosend = new Autosend("as_xxxxxxxxxxxx");
```

## Usage

### Send an email with plain text

```typescript
import { Autosend } from "autosendjs";

const autosend = new Autosend("as_xxxxxxxxxxxx");

await autosend.emails.send({
  from: { email: "you@example.com" },
  to: { email: "user@gmail.com" },
  subject: "Hello World",
  text: "Welcome to Autosend!",
});
```

### Send an email with HTML

```typescript
import { Autosend } from "autosendjs";

const autosend = new Autosend("as_xxxxxxxxxxxx");

await autosend.emails.send({
  from: { email: "you@example.com" },
  to: { email: "user@gmail.com" },
  subject: "Hello World",
  html: "<strong>Welcome to Autosend!</strong>",
});
```

### Send bulk emails

```typescript
import { Autosend } from "autosendjs";

const autosend = new Autosend("as_xxxxxxxxxxxx");

await autosend.emails.bulk({
  from: { email: "you@example.com" },
  subject: "Hello",
  html: "<p>Welcome!</p>",
  recipients: [
    { email: "user1@gmail.com" },
    { email: "user2@gmail.com" },
  ],
});
```

### Personalize with dynamic data

The email body is rendered **once** with `{{variable}}` placeholders (double curly
braces). The server substitutes them per request from the `dynamicData` you pass —
this works in a raw `html` body (no stored template required) and in `templateId`
templates alike, for both `emails.send` and `emails.bulk`. Placeholders also work
inside HTML attributes, e.g. `href="{{unsubscribeURL}}"`.

For `emails.bulk`, give each recipient its own `dynamicData` so a single rendered
template is personalized per recipient:

```typescript
await autosend.emails.bulk({
  from: { email: "you@example.com" },
  subject: "Your weekly report",
  // Rendered once; the server fills {{...}} per recipient.
  html: '<p>Hi {{name}}!</p><a href="{{unsubscribeURL}}">Unsubscribe</a>',
  recipients: [
    {
      email: "user1@gmail.com",
      dynamicData: { name: "Ada", unsubscribeURL: "https://app.example.com/u/abc" },
    },
    {
      email: "user2@gmail.com",
      dynamicData: { name: "Linus", unsubscribeURL: "https://app.example.com/u/def" },
    },
  ],
});
```

### Send a React email

Pass a [React Email](https://react.email) element as `react` and the SDK renders it
to `html` for you. This requires the optional `@react-email/render` peer dependency:

```bash
npm install @react-email/render
```

```tsx
import { Autosend } from "autosendjs";
import { WelcomeEmail } from "./emails/welcome";

const autosend = new Autosend("as_xxxxxxxxxxxx");

await autosend.emails.send({
  from: { email: "you@example.com" },
  to: { email: "user@gmail.com" },
  subject: "Welcome",
  react: <WelcomeEmail name="Ada" />,
});
```

`react` is also supported on `emails.bulk` — the element is rendered **once**, and
per-recipient values still flow through each recipient's `dynamicData` (so keep
`{{...}}` placeholders in the component for the per-recipient bits). If both `html`
and `react` are provided, `html` wins. The `react` field is available on the Resend
adapter too.

### Manage contacts

```typescript
import { Autosend } from "autosendjs";

const autosend = new Autosend("as_xxxxxxxxxxxx");

// Create a contact
await autosend.contacts.create({
  email: "user@gmail.com",
  firstName: "John",
  lastName: "Doe",
  listIds: ["list_abc123"],
  customFields: { company: "Acme", plan: "pro" },
});

// Get a contact
await autosend.contacts.get("contact_id");

// Update or create a contact
await autosend.contacts.upsert({
  email: "user@gmail.com",
  firstName: "Jane",
});

// Delete a contact
await autosend.contacts.delete("contact_id");
```

## Configuration Options

```typescript
const autosend = new Autosend("as_xxxxxxxxxxxx", {
  baseUrl: "https://api.autosend.com/v1", // Custom API endpoint
  timeout: 30000, // Request timeout in ms
  maxRetries: 3, // Number of retry attempts
  debug: false, // Enable debug logging
});
```

Retryable errors (HTTP `429` and `5xx`) are retried up to `maxRetries` times with
exponential backoff. If you want a rate-limit (`429`) to surface **immediately** —
e.g. a cron that halts on throttling rather than retrying — set `maxRetries: 1`.
On failure, `emails.send`/`emails.bulk` responses include the HTTP `statusCode`
(e.g. `429`) so you can branch on it. (`maxRetries` is also accepted by the Resend
adapter.)

## Resend Adapter

AutoSend provides a drop-in replacement adapter for the Resend API:

```typescript
import { Resend } from "autosendjs/resend";

const resend = new Resend("as_xxxxxxxxxxxx");

await resend.emails.send({
  from: "you@example.com",
  to: "user@gmail.com",
  subject: "Hello World",
  html: "<strong>It works!</strong>",
});

// Or render a React Email element (requires @react-email/render):
await resend.emails.send({
  from: "you@example.com",
  to: "user@gmail.com",
  subject: "Welcome",
  react: <WelcomeEmail name="Ada" />,
});

// Rate-limited responses map to error.name === "rate_limit_exceeded":
const { data, error } = await resend.emails.send({ /* ... */ });
if (error?.name === "rate_limit_exceeded") {
  // back off / halt
}

// Create a contact
await resend.contacts.create({
  email: "user@gmail.com",
  firstName: "John",
  properties: { company: "Acme" },
});

// Get a contact
await resend.contacts.get("contact_id");

// Update a contact (by email)
await resend.contacts.update({
  email: "user@gmail.com",
  firstName: "Jane",
});

// Remove a contact
await resend.contacts.remove("contact_id");
```

You can also use the `RESEND_API_KEY` environment variable:

```typescript
import { Resend } from "autosendjs/resend";

const resend = new Resend(); // Uses RESEND_API_KEY env var
```

## License

MIT License
