---
title: Where your service fits
description: How a service adopts Permyt — the roles, the SDK, and what you implement for each.
---

A service adopts Permyt by playing one or more of three roles. You pick the
roles your service needs and implement the matching methods on a single client
class.

## The roles

- **Requester** — your service needs data or wants to authorize an action.
  Example: a loan application that needs employment history from an HR
  platform.
- **Provider** — your service holds data other services may request, or can
  carry out actions on a user's behalf. Example: a bank that verifies income,
  an HR platform that confirms employment.
- **Connect** — your service links a user's account to their Permyt identity,
  so they can approve requests without re-entering credentials and so you can
  resolve a Permyt user back to one of your own accounts.

A service can be a requester, a provider, or both, and either can also
implement Connect.

## The SDK

The Python SDK gives you one class, `PermytClient`. You subclass it and
implement the abstract methods for the roles you play. The SDK handles the
cryptography — ES256 signing, JWE encryption, signature verification, nonce
checks — and the protocol routing. You implement the parts only your service
can: who your users are, where you keep tokens, and what a scope does when it
runs.

```bash
pip install permyt
```

Requires Python 3.10 or newer.

## What each role implements

`PermytClient` declares every abstract method. The role you play decides which
are exercised at runtime — the rest you stub. The SDK requires them all to
exist.

| Method                       | Role      | Purpose                                          |
| ---------------------------- | --------- | ------------------------------------------------ |
| `get_service_id`             | all       | Your service's registered ID.                    |
| `get_private_key`            | all       | Your ES256 private key (PEM or path).             |
| `get_permyt_public_key`      | all       | Permyt's public key, for verifying its signatures.|
| `_validate_nonce_and_timestamp` | all    | Reject replayed or stale messages.               |
| `_prepare_data_for_endpoint` | requester | Build the payload for a provider endpoint.        |
| `resolve_user`               | provider  | Map a Permyt user ID to one of your accounts.     |
| `store_token`                | provider  | Persist an issued single-use token and its scope. |
| `get_token_metadata`         | provider  | Verify and consume a presented token.             |
| `get_endpoints_for_scope`    | provider  | List the endpoints a granted scope unlocks.       |
| `process_request`            | provider  | Run the actual data access or action.             |
| `process_user_connect`       | connect   | Link or create a local account after a connect.   |
| `process_user_disconnect`    | connect   | Tear down the local link when a user revokes.     |

## Registering your service

Before your code can call Permyt, register the service:

1. Generate an ES256 (ECDSA P-256) key pair:

   ```bash
   openssl ecparam -genkey -name prime256v1 -noout -out private.pem
   openssl ec -in private.pem -pubout -out public.pem
   ```

2. Create the service in your Permyt dashboard, set a callback URL, and upload
   `public.pem`.

3. Note the service ID, and download Permyt's public key.

Keep `private.pem` out of version control. Load it from a file path or a
secret manager, and rotate it periodically.

## One inbound endpoint

Permyt calls your service for several actions — issuing a token, a service
call, a user connecting, a user disconnecting. You can expose one URL and let
the SDK route by the message's `action` field:

```python
def handle_permyt_inbound(request):
    return service.handle_inbound(request.json())
```

`handle_inbound` dispatches to the right method internally. One route, no
protocol logic in your view.

## Next

- [Quickstart](/build/quickstart/) — a runnable requester in a few minutes.
- [Build a Requester](/build/requester/) — request and consume data.
- [Build a Provider](/build/provider/) — declare scopes and issue tokens.
- [Connect users](/build/connect/) — link accounts to Permyt identities.
