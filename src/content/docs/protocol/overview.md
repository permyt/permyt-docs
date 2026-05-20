---
title: Protocol overview
description: The actors, the message format, and the cycles of the Permyt authorization protocol.
---

The Permyt protocol governs how a requester, a provider, the broker, and a
user's app exchange authorization without the broker ever touching user data.
This page is the map; the pages under it give the detail.

## Actors

| Actor      | Role                                                                       |
| ---------- | -------------------------------------------------------------------------- |
| **Broker** | The Permyt server. Resolves scopes, routes consent, brokers tokens. Never sees user data. |
| **Requester** | A service that wants data or wants to authorize an action.              |
| **Provider**  | A service that holds data and issues tokens. Connectors are providers.  |
| **User app**  | The Permyt mobile app. Connects services and approves or denies requests. |

A single service can be both a requester and a provider.

## Message format

Every protocol message between a service and the broker is signed and
encrypted:

- **Encrypted** — the payload is JWE, encrypted for the recipient's public key
  (ECDH-ES key agreement, AES-256-GCM).
- **Signed** — the message carries an ES256 proof-of-possession: a JWT whose
  claims include a SHA-256 hash of the encrypted payload. The recipient
  recomputes the hash and rejects any message whose proof does not bind to its
  exact payload.
- **Fresh** — every message carries a unique nonce and a timestamp. A reused
  nonce is rejected, and a message outside a short time window is rejected.

The reasoning behind this is in [The zero-knowledge broker](/concepts/security/);
the exchange-by-exchange detail is in
[Broker API and data shapes](/protocol/api/).

## The three cycles

The protocol has three cycles. Each is laid out step by step, with diagrams,
in [Protocol cycles](/protocol/cycles/).

- **Connect** — links a service to a user's profile. The user scans a QR code,
  the broker creates the connection and materializes the per-scope consent
  records, and the service is notified.
- **Request access** — a requester asks for data. The broker resolves scopes,
  routes the user's approval, and brokers encrypted tokens between requester
  and providers.
- **Disconnect** — a user revokes a connection. The broker rejects pending
  requests, clears its state, and notifies the service.

## Request lifecycle

An access request moves through a fixed set of states:

| Status        | Meaning                                                          |
| ------------- | ---------------------------------------------------------------- |
| `queued`      | Received; waiting for the background worker.                     |
| `analyzing`   | Scopes are being resolved.                                       |
| `awaiting`    | New scopes need approval; the user has been prompted.            |
| `processing`  | Approved; tokens are being issued by providers.                  |
| `completed`   | Tokens issued and encrypted for the requester; ready to collect. |
| `incomplete`  | A required scope input could not be resolved from the request.   |
| `unavailable` | No connected provider can satisfy the job.                       |
| `rejected`    | The user denied the request, or the requester is blocked.        |

## Core records

The broker keeps a small set of records behind the protocol:

| Record              | What it is                                                          |
| ------------------- | ------------------------------------------------------------------- |
| **Service**         | A registered requester or provider, with its key pair.              |
| **Scope**           | A field or action a provider exposes; may declare inputs.           |
| **Profile**         | A user's named identity context. A user can have several.           |
| **Connection**      | The link between a service and a profile.                           |
| **Request**         | An access request, from submission to token delivery.               |
| **Consent record**  | The consent mode for one scope on one connection.                   |
| **Grant**           | A remembered "always allow" or "always deny" for a scope.            |
| **Exchange token**  | A short-lived token for passing user identity between services.     |

## Next

- [Protocol cycles](/protocol/cycles/) — connect, request, and disconnect, step by step.
- [Broker API and data shapes](/protocol/api/) — endpoints and payload types.
- [The zero-knowledge broker](/concepts/security/) — the security model in full.
