---
title: Quickstart
description: Install the SDK, register a service, and submit your first access request.
---

This walks through a minimal **requester** — a service that asks for data and
receives scoped tokens. By the end you will have submitted a request and
collected its result.

## 1. Install the SDK

```bash
pip install permyt
```

Requires Python 3.10 or newer.

## 2. Generate keys and register

Generate an ES256 key pair:

```bash
openssl ecparam -genkey -name prime256v1 -noout -out private.pem
openssl ec -in private.pem -pubout -out public.pem
```

In your Permyt dashboard, create a service, set its callback URL, and upload
`public.pem`. Note the service ID, and download Permyt's public key to
`permyt_public.pem`.

## 3. Subclass `PermytClient`

```python
from permyt.api import PermytClient


class MyService(PermytClient):
    def get_service_id(self) -> str:
        return "my-service-id"

    def get_private_key(self) -> str:
        return "./private.pem"

    def get_permyt_public_key(self) -> str:
        return open("permyt_public.pem").read()

    def _validate_nonce_and_timestamp(self, nonce: str, timestamp: str) -> None:
        # Reject replayed or stale messages — see Build a Requester.
        ...

    def _prepare_data_for_endpoint(self, request_id: str, endpoint: dict) -> dict:
        # Build the payload for a provider endpoint.
        return {"query": "employment history", "years": 5}

    # Provider methods are unused by a pure requester — stub them.
    def resolve_user(self, permyt_user_id): ...
    def store_token(self, token, user, data, expires_at): ...
    def get_token_metadata(self, token): ...
    def get_endpoints_for_scope(self, scope): ...
    def process_request(self, metadata, data): ...
```

## 4. Submit an access request

The `description` is shown to the user word for word. Write what you would say
to the person, and include any concrete values you already hold — amounts,
recipients, identifiers — so Permyt can lock them into the token.

```python
service = MyService()

result = service.request_access({
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "description": (
        "Eligibility check — I need the user's employment and income "
        "information to evaluate their application."
    ),
    "callback_url": "https://my-service.io/permyt/callback",
})

request_id = result["request_id"]
```

## 5. Collect the result

Permyt calls your `callback_url` as the request changes state, or you can
poll:

```python
status = service.check_access(request_id=request_id)

if status["status"] == "approved":
    responses = service.handle_approved_access(status)
    # `responses` holds the data each provider returned.
elif status["status"] == "denied":
    # The user said no. Do not retry automatically.
    ...
```

The request moves through `queued`, `analyzing`, `awaiting` (while the user
decides), `processing`, and finally `completed` or a terminal state such as
`denied`. The lifecycle is detailed in
[Protocol cycles](/protocol/cycles/).

## What happened

You described a job in plain English. Permyt resolved it to scopes across the
user's connected providers, the user approved it on their phone, and each
provider issued a single-use token encrypted for your service. Your call to
`handle_approved_access` decrypted those tokens and called the providers
directly — Permyt was not in that exchange.

## Next

- [Build a Requester](/build/requester/) — the requester role in full,
  including replay protection and callbacks.
- [Build a Provider](/build/provider/) — the other side: issuing tokens and
  serving scoped data.
- [Connect users](/build/connect/) — let users link their account by scanning
  a QR code.
