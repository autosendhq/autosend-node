# Autosend Node.js SDK

![nodejs-og](https://github.com/user-attachments/assets/1b66c98a-e5ce-48b8-9a05-0ed701f7e7e4)

[![npm version](https://img.shields.io/npm/v/autosendjs.svg)](https://www.npmjs.com/package/autosendjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The official Node.js SDK for the [Autosend](https://autosend.com) API.

## Installation

```bash
npm install autosendjs
```

or

```bash
yarn add autosendjs
```

## Setup

First, get your API key from the [Autosend Dashboard](https://autosend.com/dashboard).

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
  emails: [
    {
      from: { email: "you@example.com" },
      to: { email: "user1@gmail.com" },
      subject: "Hello User 1",
      html: "<p>Welcome!</p>",
    },
    {
      from: { email: "you@example.com" },
      to: { email: "user2@gmail.com" },
      subject: "Hello User 2",
      html: "<p>Welcome!</p>",
    },
  ],
});
```

### Manage contacts

```typescript
import { Autosend } from "autosendjs";

const autosend = new Autosend("as_xxxxxxxxxxxx");

// Create a contact
await autosend.contacts.create({
  email: "user@gmail.com",
  firstName: "John",
  lastName: "Doe",
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

## Resend Compatibility

Autosend provides a drop-in replacement adapter for the Resend API:

```typescript
import { Resend } from "autosendjs/resend";

const resend = new Resend("re_xxxxxxxxxxxx");

await resend.emails.send({
  from: "you@example.com",
  to: "user@gmail.com",
  subject: "Hello World",
  html: "<strong>It works!</strong>",
});
```

You can also use the `RESEND_API_KEY` environment variable:

```typescript
import { Resend } from "autosendjs/resend";

const resend = new Resend(); // Uses RESEND_API_KEY env var
```

## License

MIT License
