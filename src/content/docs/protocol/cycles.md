---
title: Protocol cycles
description: The connect, request-access, and disconnect cycles of the Permyt protocol, step by step.
---

The protocol has three cycles. Each is shown here as a sequence of steps with
a diagram.

## Connect cycle

Connect links a service to a user's profile. It creates the connection and
materializes one consent record per scope.

```text
  Service                Permyt app              Broker                  Service
    │                        │                      │                       │
    │ 1. generate_connect_token()                   │                       │
    │───────────────────────▶│                      │                       │
    │   QR payload (signed JWT + encrypted data)     │                       │
    │                        │                      │                       │
    │              2. User scans QR                 │                       │
    │                        │  3. connect request  │                       │
    │                        │─────────────────────▶│                       │
    │                        │                      │                       │
    │                        │      4. Verify proof, nonce, timestamp        │
    │                        │         Decrypt payload                       │
    │                        │         Create connection                    │
    │                        │         Materialize consent records           │
    │                        │                      │                       │
    │                        │                      │ 5. webhook user_connect│
    │                        │                      │──────────────────────▶│
    │                        │                      │   6. process_user_connect()
    │                        │                      │◀──────────────────────│
    │                        │ 7. result            │                       │
    │                        │◀─────────────────────│                       │
```

1. The service generates a connect token and renders it as a QR code, NFC tag,
   or redirect.
2. The user scans it with the Permyt app.
3. The app sends the connect request to the broker.
4. The broker verifies the proof, nonce, and timestamp, decrypts the payload,
   creates the connection, and materializes a consent record per scope —
   each copying that scope's default consent mode.
5. The broker calls the service with `action="user_connect"`.
6. The service's `process_user_connect` links, creates, or logs in the local
   account.
7. The broker returns the result to the app.

The developer side is in [Connect users](/build/connect/).

## Request-access cycle

A requester asks for data. The broker resolves scopes, routes the user's
approval, and brokers encrypted tokens between requester and providers.

```text
  Requester              Broker                Permyt app            Provider
    │                      │                       │                    │
    │ 1. access request    │                       │                    │
    │─────────────────────▶│                       │                    │
    │ ◀── {request_id, queued}                      │                    │
    │                      │                       │                    │
    │        2. Resolve scopes (analyzing)          │                    │
    │           Extract force-input values          │                    │
    │           ↓ missing input  → incomplete (end) │                    │
    │           ↓ no provider    → unavailable (end)│                    │
    │                      │                       │                    │
    │        3. Categorize scopes via consent modes │                    │
    │           auto_grant / existing grant → pre-approved               │
    │           otherwise → needs approval          │                    │
    │                      │                       │                    │
    │                      │ 4. If approval needed: │                    │
    │                      │    awaiting + push     │                    │
    │                      │──────────────────────▶│                    │
    │                      │ 5. User decides        │                    │
    │                      │◀───────────────────────│                    │
    │                      │                       │                    │
    │        6. If approved (processing):           │                    │
    │           token request, scope + force inputs │                    │
    │                      │────────────────────────────────────────────▶│
    │                      │           7. Provider issues single-use token│
    │                      │              encrypted for the requester     │
    │                      │◀────────────────────────────────────────────│
    │ 8. completed         │                       │                    │
    │ ◀── encrypted token bundle                    │                    │
    │                      │                       │                    │
    │ 9. Requester decrypts the token, calls the provider directly        │
    │────────────────────────────────────────────────────────────────────▶│
    │           10. Provider validates the token, enforces force inputs,  │
    │ ◀──────────────────── returns only the approved data ───────────────│
```

1. The requester submits an access request. The broker returns a request ID
   with status `queued`.
2. The broker resolves the job into the minimum set of scopes and extracts
   force-input values. A missing required input ends the request as
   `incomplete`; no capable provider ends it as `unavailable`.
3. The broker sorts the scopes using each scope's consent mode and any
   existing grant — into pre-approved and needs-approval sets.
4. If anything needs approval, the broker sets `awaiting` and pushes a
   notification to the user's app.
5. The user approves or denies. An `always` answer persists a grant.
6. On approval the broker moves to `processing` and sends each provider a
   token request carrying the approved scope and its locked force inputs.
7. Each provider mints a single-use token, encrypted for the requester.
8. The broker delivers the encrypted token bundle — via the callback URL or in
   a status poll — with status `completed`.
9. The requester decrypts the tokens and calls each provider directly. The
   broker is not in this exchange.
10. The provider validates the token, enforces the force inputs, and returns
    only the approved data.

The developer side is in [Build a Requester](/build/requester/) and
[Build a Provider](/build/provider/).

## Disconnect cycle

A user revokes a connection. The broker tears down its own state and notifies
the service so it can drop its local link.

```text
  Permyt app                Broker                       Service
      │                       │                            │
      │ 1. disconnect request │                            │
      │──────────────────────▶│                            │
      │                       │                            │
      │       2. Reject pending requests for this service   │
      │          Write revocation entries to the log        │
      │                       │ 3. webhook user_disconnect  │
      │                       │───────────────────────────▶│
      │                       │   4. process_user_disconnect()
      │                       │      Drop local credentials │
      │                       │◀───────────────────────────│
      │       5. Delete the connection and its grants       │
      │ 6. ok                 │                            │
      │◀──────────────────────│                            │
```

1. The user revokes the connection from the Permyt app.
2. The broker rejects any of that service's requests still waiting for an
   answer, sending each requester a rejection, and writes revocation entries
   to the activity log.
3. The broker calls the service with `action="user_disconnect"`.
4. The service's `process_user_disconnect` drops its OAuth tokens, sessions,
   and the local link.
5. The broker deletes the connection, which clears the grants and consent
   records tied to it.
6. The broker confirms to the app.

Disconnect is best-effort toward the service: a `5xx` from the service is
logged but does not block the teardown. The user side is in
[Consent, grants, and revocation](/concepts/consent/); the developer side is
in [Connect users](/build/connect/).

## Next

- [Broker API and data shapes](/protocol/api/) — the endpoints and payloads
  behind these cycles.
- [The zero-knowledge broker](/concepts/security/) — the security model.
