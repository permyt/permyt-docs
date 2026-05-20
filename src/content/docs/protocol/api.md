---
title: Broker API and data shapes
description: The Permyt protocol endpoints, the encryption envelope, and the data types exchanged between services and the broker.
---

This page lists the protocol endpoints the broker exposes and the shape of the
payloads exchanged with them. Most services never call these endpoints
directly — the [Permyt SDK](/build/overview/) wraps them — but the contract is
documented here for reference and for implementing the protocol in another
language.

## The encryption envelope

Every protocol endpoint takes the same envelope. The broker verifies it before
the per-endpoint payload is read:

- The data payload is JWE, encrypted for the recipient's public key
  (`ECDH-ES+A256KW`, `A256GCM`).
- A `proof` JWT, signed with the sender's private key (ES256), carries claims
  that include a SHA-256 hash of the JWE payload. The broker recomputes the
  hash and rejects a proof that does not bind to the exact payload.
- A unique `nonce` and an ISO `timestamp`. A reused nonce is rejected; a
  timestamp outside roughly a five-minute window is rejected.

## Protocol endpoints

These are the endpoints that carry the protocol itself. All are `POST`.

| Endpoint                              | Purpose                                                                 |
| ------------------------------------- | ----------------------------------------------------------------------- |
| `/requests/access`                    | Submit a new access request. Returns a request ID; resolution runs in the background. |
| `/requests/status`                    | Poll a request's status. Returns the status, plus the encrypted token bundle once `completed`. |
| `/requests/token`                     | Mint a short-lived exchange token for the user behind a completed request. |
| `/requests/token/redeem`              | Redeem an exchange token for a service-scoped user ID.                  |
| `/requests/scopes/view`               | List the scopes available to a profile across the other connected providers. |
| `/requests/scopes/update`             | Push the calling service's complete scope list; the broker diffs by `reference`. |

A connection's "view scopes" permission gates `/requests/scopes/view` — a
requester can enumerate other providers in a profile only when that connection
allows it.

### Disconnect

When a user revokes a connection from the Permyt app, the broker rejects that
service's pending requests, writes revocation entries to the activity log,
fires an `action="user_disconnect"` webhook to the service, and deletes the
connection. The webhook is best-effort — a `5xx` from the service does not
block the teardown.

## Management API

Alongside the protocol endpoints, the broker exposes a management API for
CRUD on Permyt-internal resources — developer accounts and their team members,
services, connections, users, profiles, and per-profile permission records.
These are used by the dashboard and the Permyt app rather than by the protocol
itself.

## Data shapes

The payload types below are the contract carried inside the encryption
envelope. They are defined in the SDK's `permyt/typing.py`.

### Scope grant

The granted scope, as it reaches a provider — a map from each approved scope
reference to its locked force-input values. A scope with no inputs maps to an
empty object.

```python
ScopeGrant = dict[str, dict[str, Any]]

# example
{
    "payments.send": {"amount": 2500, "currency": "EUR", "receiver": "João"},
    "identity.basic": {},
}
```

### Access request

What a requester submits.

```python
AccessRequest = {
    "user_id": str,         # the Permyt user
    "description": str,     # the plain-English job, shown to the user
    "callback_url": str,    # optional — where status updates are posted
    "request_id": str,      # optional — a parent request
}
```

### Token request

What the broker sends a provider to have a token minted.

```python
TokenRequestData = {
    "request_id": str,
    "permyt_user_id": str,
    "service_id": str,
    "service_public_key": str,   # the requester's key — the token is encrypted for it
    "scope": ScopeGrant,
    "ttl_minutes": int,
}
```

### Service credential

One entry in the encrypted token bundle delivered to a requester.

```python
ServiceCredential = {
    "request_id": str,
    "encrypted_token": str,      # encrypted for the requester
    "endpoints": list,
    "expires_at": str,
    "public_key": str,
}
```

### Token metadata

What a provider returns from `get_token_metadata` for a redeemed token.

```python
TokenMetadata = {
    "user": Any,                 # the resolved local user
    "scope": ScopeGrant,
    "service_public_key": str,
    "expires_at": str,
}
```

### Disconnect request

The payload the broker sends a service when a user revokes the connection.

```python
DisconnectRequest = {"permyt_user_id": str}
```

### View-scopes response

The broker's reply to `/requests/scopes/view` — one entry per other provider
in the profile.

```python
ServiceScopes = {
    "service_name": str,
    "service_description": str,
    "scopes": list,              # the provider's scope definitions
}

ViewScopesResponse = {"scopes": list[ServiceScopes]}
```

## Next

- [Protocol cycles](/protocol/cycles/) — how these endpoints fit together.
- [Build a Requester](/build/requester/) and [Build a Provider](/build/provider/)
  — the SDK methods that wrap these endpoints.
