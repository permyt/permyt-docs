---
title: Connect users
description: Link a user's account to their Permyt identity with a QR code, an NFC tag, or a redirect — and tear the link down when they revoke it.
---

**Connect** links a user's account on your service to their Permyt identity.
Once linked, the user can approve requests without re-entering credentials,
and your service can resolve a `permyt_user_id` back to one of your own
accounts. Any service can implement Connect, whether it acts as a requester, a
provider, or both.

## The connect flow

1. Your service generates a connect token — a signed, encrypted payload.
2. The user receives it as a QR code, an NFC tag, or a redirect, and completes
   the flow in their Permyt app.
3. Permyt creates the connection and calls your service back with
   `action="user_connect"`.
4. Your `process_user_connect` links, creates, or logs in the local account.

## Generating a connect token

```python
result = service.generate_connect_token()
# Store result["token"] server-side, keyed by its JTI, for later validation.
payload = result["data"]  # encrypted for Permyt — safe to carry over any channel
```

Deliver `payload` however suits your product:

```python
# QR code
import qrcode
qr = qrcode.make(payload)

# NFC tag
import json
nfc_tag.write(json.dumps(payload))

# Redirect button
import urllib.parse, json
redirect_url = f"https://permyt.io/connect?payload={urllib.parse.quote(json.dumps(payload))}"
```

For a user who is already signed in to your service, pass their ID so the
connect links to that existing account instead of creating a new one:

```python
result = service.generate_connect_token(system_user_id="user-42")
```

## Handling the connect callback

`process_user_connect` runs when the user completes the flow. Validate the
token against your server-side record, then apply one of three cases.

```python
from permyt.typing import ConnectRequest
from permyt.exceptions import InvalidTokenError


def process_user_connect(self, data: ConnectRequest) -> dict:
    from joserfc import jwt

    try:
        claims = jwt.decode(data["token"], self.private_key).claims
    except Exception:
        raise InvalidTokenError()

    system_user_id = claims.get("system_user_id")
    permyt_user_id = data["permyt_user_id"]

    if system_user_id:
        # Account link: attach Permyt identity to an existing account.
        User.objects.filter(id=system_user_id).update(permyt_id=permyt_user_id)
    else:
        user = User.objects.filter(permyt_id=permyt_user_id).first()
        if not user:
            # New user: create an account.
            User.objects.create(permyt_id=permyt_user_id)
        # else: a returning user — log them in.

    return {"status": "ok"}
```

| Case          | Condition                                | Action               |
| ------------- | ----------------------------------------- | -------------------- |
| New user      | Token unlinked, `permyt_user_id` unknown | Create an account.   |
| Returning user| Token unlinked, `permyt_user_id` known   | Log the user in.     |
| Account link  | Token carries a `system_user_id`         | Link to that account.|

## Handling disconnect

When a user revokes the connection from their Permyt app, Permyt fires a mirror
webhook with `action="user_disconnect"` so your service can drop whatever the
connect flow established — OAuth tokens, sessions, the local link.

```python
from permyt.typing import DisconnectRequest


def process_user_disconnect(self, data: DisconnectRequest) -> dict:
    permyt_user_id = data["permyt_user_id"]

    user = User.objects.filter(permyt_id=permyt_user_id).first()
    if not user:
        return {"disconnected": True}  # already gone — idempotent

    OAuthToken.objects.filter(user=user).delete()
    user.permyt_id = None
    user.save()
    return {"disconnected": True}
```

Make this idempotent — a repeat call for an already-disconnected user is a
no-op. Permyt treats disconnect as best-effort: a `5xx` from your handler does
not block Permyt's own teardown, so surface real errors in your logs to catch
any drift.

## Wiring it up

If you expose a single inbound endpoint, `handle_inbound` routes both
`user_connect` and `user_disconnect` for you:

```python
def handle_permyt_inbound(request):
    return service.handle_inbound(request.json())
```

## Next

- [Build a Requester](/build/requester/) and [Build a Provider](/build/provider/)
  — the two roles a connected service can play.
- [Consent, grants, and revocation](/concepts/consent/) — what disconnect
  means for the user.
- [The Permyt app](/app/permyt-app/) — where the user scans and revokes.
