---
title: Build a Requester
description: Implement the requester role — submit access requests, handle callbacks, and consume scoped tokens.
---

A **requester** asks Permyt for access to user data or to authorize an action.
When the user approves, the requester receives single-use tokens and calls the
providers directly. Permyt is not in that exchange.

## Methods a requester implements

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
        ...  # see "Replay protection" below

    def _prepare_data_for_endpoint(self, request_id: str, endpoint: dict) -> dict:
        # Return only the inputs this endpoint needs.
        return {"query": "employment history", "years": 5}

    # A pure requester stubs the provider methods.
    def resolve_user(self, permyt_user_id): ...
    def store_token(self, token, user, data, expires_at): ...
    def get_token_metadata(self, token): ...
    def get_endpoints_for_scope(self, scope): ...
    def process_request(self, metadata, data): ...
```

## Submitting a request

```python
result = service.request_access({
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "description": (
        "Eligibility check — I need the user's employment and income "
        "information to evaluate their loan application."
    ),
    "callback_url": "https://my-service.io/permyt/callback",
})
```

| Field          | Required | Purpose                                                  |
| -------------- | -------- | -------------------------------------------------------- |
| `user_id`      | yes      | The Permyt user the request is addressed to.             |
| `description`  | yes      | Plain-English statement of the job. Shown to the user.   |
| `callback_url` | no       | Where Permyt posts status updates for this request.      |
| `request_id`   | no       | A parent request, when this one follows on from another. |

### Writing a good description

The `description` is shown to the user word for word when they decide. It is
the contract you are offering them.

- Say what the job is and why, the way you would say it to the person: *"Grant
  eligibility check — I need your employment history to evaluate loan
  eligibility."*
- Include concrete values you already hold — amounts, recipients, identifiers
  — so Permyt can extract them and lock the issued token to those exact
  parameters. See [Force inputs](/concepts/force-inputs/).
- Be honest and specific. A vague or misleading description erodes the trust
  the user places in the prompt.

## Handling the result

The request moves through several states. You learn the outcome either from
your `callback_url` or by polling.

### Via callback

Your callback endpoint must pass the raw request body straight to
`handle_request_status`. The SDK verifies Permyt's signature internally — do
not parse or act on the body before that call.

```python
def permyt_callback(request):
    return service.handle_request_status(request.body)
```

### Via polling

```python
status = service.check_access(request_id=request_id)

if status["status"] == "approved":
    responses = service.handle_approved_access(status)
elif status["status"] == "denied":
    ...  # the user declined
```

`handle_approved_access` decrypts the issued tokens, calls
`_prepare_data_for_endpoint` for each provider endpoint, calls the providers
directly, and returns their responses.

Handle a `denied` outcome gracefully. Do not retry automatically and do not
re-prompt the user without a real change in context.

## Replay protection

`_validate_nonce_and_timestamp` is yours to implement. It must reject a stale
timestamp and a nonce that has been seen before, so a captured response from
Permyt cannot be replayed against you.

```python
import redis
from datetime import datetime, timedelta, timezone
from permyt.exceptions import ExpiredRequestError

redis_client = redis.Redis(host="localhost", port=6379, db=0)


def _validate_nonce_and_timestamp(self, nonce: str, timestamp: str) -> None:
    request_time = datetime.fromisoformat(timestamp)
    now = datetime.now(timezone.utc)
    if abs((now - request_time).total_seconds()) > 30:
        raise ExpiredRequestError("Timestamp outside valid window")

    key = f"nonce:{nonce}"
    if redis_client.exists(key):
        raise ExpiredRequestError("Nonce already used")
    redis_client.setex(key, timedelta(seconds=60), "1")
```

## Passing identity to another service

A completed request can be used to introduce the user to a third service
without a fresh approval. Mint a short-lived exchange token and hand it over;
the receiving service redeems it for its own service-scoped user ID:

```python
token = service.request_token(request_id=request_id, restricted_to="other-service-id")
# the other service:
user_id = service.redeem_token(token)
```

`restricted_to` binds the token to a single target. The token is single-use
and expires quickly.

## Asking for more later

If a job turns out to need data beyond what was approved, submit another
request. Pass the original `request_id` as the parent. The user is prompted
again only if the new request reaches beyond what they already allowed.

## Practices to hold to

- Pass the raw callback body to the SDK before doing anything else with it.
- In `_prepare_data_for_endpoint`, send only the inputs that endpoint needs —
  never forward arbitrary user data.
- Do not cache or persist decrypted provider responses beyond the immediate
  request.

## Next

- [Build a Provider](/build/provider/) — the other side of the exchange.
- [Connect users](/build/connect/) — let a user link their account to yours.
- [AI agents as requesters](/patterns/ai-agents/) — exposing the requester
  role to an agent.
