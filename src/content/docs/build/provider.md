---
title: Build a Provider
description: Implement the provider role — declare scopes, issue single-use tokens, and serve scoped data with force-input enforcement.
---

A **provider** holds user data, or can carry out actions on a user's behalf.
When a user approves a request, Permyt asks the provider to mint a single-use
token. The requester then redeems that token against the provider directly.

## Methods a provider implements

```python
from permyt.api import PermytClient
from permyt.typing import TokenMetadata


class MyService(PermytClient):
    def get_service_id(self) -> str:
        return "my-service-id"

    def get_private_key(self) -> str:
        return "./private.pem"

    def get_permyt_public_key(self) -> str:
        return open("permyt_public.pem").read()

    def _validate_nonce_and_timestamp(self, nonce: str, timestamp: str) -> None:
        ...  # reject replayed or stale messages — see Build a Requester

    def resolve_user(self, permyt_user_id: str):
        user = User.objects.filter(permyt_id=permyt_user_id).first()
        if not user:
            from permyt.exceptions import InvalidUserError
            raise InvalidUserError()
        return user

    def store_token(self, token: str, user, data: dict, expires_at):
        # `data` is a TokenRequestData. Persist the full scope — including
        # locked force inputs — and the requester's public key.
        TokenStorage.objects.create(
            token=token,
            user=user,
            scope=data["scope"],
            service_public_key=data["service_public_key"],
            expires_at=expires_at,
            used=False,
        )
```

## Issuing a token

`get_token_metadata` verifies a presented token and marks it used. The
single-use property depends on that mark being **atomic** — two concurrent
calls must not both consume the same token. Use `SELECT ... FOR UPDATE` in
SQL, or an atomic set-if-absent in Redis.

```python
def get_token_metadata(self, token: str) -> TokenMetadata:
    from joserfc import jwt
    from permyt.exceptions import (
        InvalidTokenError, TokenAlreadyUsedError, TokenExpiredError,
    )

    try:
        claims = jwt.decode(token, self.private_key).claims
    except Exception:
        raise InvalidTokenError()

    record = TokenStorage.objects.filter(jti=claims["jti"]).first()
    if not record:
        raise InvalidTokenError()
    if record.used:
        raise TokenAlreadyUsedError()
    if record.is_expired():
        raise TokenExpiredError()

    record.used = True
    record.save()

    return {
        "user": record.user,
        "scope": record.scope,
        "service_public_key": claims["issued_to"],
        "expires_at": record.expires_at.isoformat(),
    }
```

## Exposing endpoints

`get_endpoints_for_scope` lists the endpoints a granted scope unlocks. The
`scope` argument is the granted scope map; its keys are the approved scope
references.

```python
def get_endpoints_for_scope(self, scope: dict) -> list:
    endpoints = []
    if "professional" in scope:
        endpoints.append({
            "url": "https://my-service.com/api/employment",
            "description": "Employment history",
            "input_fields": {"years": "Years of history"},
        })
    return endpoints
```

Return only endpoints that match the approved scope. Do not expose unscoped
endpoints.

## Serving data, and enforcing force inputs

`process_request` runs the actual access. It receives the token metadata —
including the approved scope and its locked force inputs — and the requester's
incoming data.

Two rules hold here. Return **only** the fields the scope covers, whatever the
requester asks for. And for any scope that carries force inputs, compare the
incoming call against the locked values and reject a mismatch. This is the
boundary that stops an action from being rewritten between approval and
execution.

```python
def process_request(self, metadata: TokenMetadata, data: dict) -> dict:
    from permyt.exceptions import InvalidInputError

    scope = metadata["scope"]
    response = {}

    # A read scope with no force inputs.
    if "professional" in scope:
        response["employment"] = {
            "company": metadata["user"].current_company,
            "title": metadata["user"].job_title,
        }

    # A scope with locked force inputs — the user approved an exact payment.
    if "payments.send" in scope:
        locked = scope["payments.send"]
        if (
            data.get("amount") != locked["amount"]
            or data.get("currency") != locked["currency"]
            or data.get("receiver") != locked["receiver"]
        ):
            raise InvalidInputError()
        response["payment"] = self.send_payment(
            user=metadata["user"],
            amount=locked["amount"],
            currency=locked["currency"],
            receiver=locked["receiver"],
        )

    return response
```

The SDK does not enforce force inputs for you — the right comparison is
scope-specific (exact match for a payment, a cap for a limit, a range for a
date filter). Persist the full scope in `store_token`, return it from
`get_token_metadata`, and check it here. See
[Force inputs](/concepts/force-inputs/).

## Declaring your scopes

A provider registers its scope catalogue with Permyt. Submit the complete
list; Permyt diffs it by `reference` to create, update, and remove scopes.

```python
result = service.update_scopes([
    {
        "reference": "payments.send",
        "name": "Send payment",
        "description": "Initiate a payment transfer",
        "inputs": [
            {"name": "amount", "description": "Amount in the smallest currency unit"},
            {"name": "currency", "description": "ISO 4217 currency code"},
            {"name": "receiver", "description": "Recipient identifier"},
        ],
        "default_consent_mode": "prompt_always",
        "high_sensitivity": True,
    },
    {"reference": "identity.basic", "name": "Basic identity"},
])
# {"created": 2, "updated": 0, "deleted": 0}
```

| Field                  | Required | Purpose                                                       |
| ---------------------- | -------- | ------------------------------------------------------------- |
| `reference`            | yes      | Machine-readable ID, unique within your service.              |
| `name`                 | yes      | Human-readable name shown to users.                           |
| `description`          | no       | A longer description of the scope.                            |
| `inputs`               | no       | `{name, description}` values needed to issue a token.         |
| `default_consent_mode` | no       | `auto_grant`, `prompt_once`, or `prompt_always`.              |
| `high_sensitivity`     | no       | Flags a scope that warrants extra attention in the app.       |

A submitted list is the desired final state. Omitting a scope deletes it, and
removes the consent and grant records tied to it. Approaches to organising a
catalogue — static versus runtime-defined, raw fields versus predicate scopes
— are in [Provider patterns](/patterns/provider-patterns/).

## Wiring it up

Expose one inbound endpoint and let the SDK route by action:

```python
def handle_permyt_inbound(request):
    return service.handle_inbound(request.json())
```

## Practices to hold to

- Mark a token used atomically, so a single-use token is genuinely single-use.
- Return only the fields the approved scope covers.
- Treat `permyt_user_id` as the only trusted identifier — never identify a
  user from other fields in the request data.
- Expire and clean up used tokens regularly.

## Next

- [Connect users](/build/connect/) — link a user's account so you can resolve
  `permyt_user_id`.
- [Provider patterns](/patterns/provider-patterns/) — catalogue design and
  privacy-preserving scopes.
- [Force inputs](/concepts/force-inputs/) — the concept behind the
  enforcement above.
