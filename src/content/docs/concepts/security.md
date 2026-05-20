---
title: The zero-knowledge broker
description: Why Permyt can broker authorization without ever seeing user data — encryption, signing, and single-use tokens.
---

Permyt coordinates who may access what, and routes the tokens that grant it.
It is not in the path of the data. A token that passes through Permyt is
encrypted for the requester that will use it, so Permyt relays it without
being able to read it.

## Permyt brokers, it does not proxy

When a requester redeems a token, it calls the provider directly. That
exchange — the request, the data, the response — does not go through Permyt.
Permyt's job ends once the encrypted token has been delivered.

```text
┌───────────┐       ┌──────────────┐       ┌──────────┐
│ Requester │       │    Permyt    │       │ Provider │
│ (wants    │──────▶│   (broker)   │──────▶│ (has     │
│  data)    │◀──────│  never sees  │◀──────│  data)   │
└─────┬─────┘       │     data     │       └────▲─────┘
      │             └──────┬───────┘            │
      │                    │ approvals          │
      │               ┌────▼─────┐              │
      │               │   User   │              │
      │               └──────────┘              │
      └────────── calls provider directly ───────┘
```

Permyt never sees user data, never sees a decrypted token, never sees a
provider's response, and does not learn what data was actually accessed.

## Encryption for the recipient

Every sensitive payload in the protocol is encrypted for the *recipient's*
public key, using ECDH-ES key agreement with AES-256-GCM (JWE). The sender can
encrypt; only the intended recipient can decrypt.

| Exchange                              | Encrypted for          |
| ------------------------------------- | ---------------------- |
| Permyt → Provider (token request)     | the provider           |
| Provider → Requester (issued token)   | the requester          |
| Permyt → Requester (approved access)  | the requester          |
| Requester → Provider (service call)   | the provider           |

When a provider mints a token, it encrypts it for the requester's public key.
Permyt carries that token to the requester but holds no key that could open
it.

## Proof of possession

Every protocol message carries a signature. The sender signs a SHA-256 hash of
the encrypted payload with its private key (ES256 — ECDSA on the P-256 curve).
The recipient recomputes the hash and verifies the signature against the
sender's registered public key. A message whose signature does not bind to its
exact payload is rejected. Each service holds an ES256 key pair; the public
half is registered with Permyt.

## Replay protection

Every message includes a unique nonce and a timestamp. A nonce that has been
seen before is rejected, and a message whose timestamp falls outside a short
window is rejected. A captured message cannot be replayed later.

## Single-use, short-lived tokens

A token issued by a provider is single-use and short-lived. The provider marks
it used the first time it is redeemed — atomically, so two concurrent calls
cannot both consume it — and a redeemed or expired token is refused. A token
also carries its [force inputs](/concepts/force-inputs/): the concrete values
the user approved, which the provider enforces on the call.

## Scope is the contract

A provider returns only the fields the approved scope covers — no more, even
if the requester's call asks for more. The scope is the contract the user
agreed to, and the provider holds to it regardless of what the requester
sends.

## What this adds up to

- A token in transit through Permyt cannot be read by Permyt.
- A message cannot be forged, tampered with, or replayed.
- A token cannot be used twice, used late, or used for a different action than
  the user approved.
- A provider returns only what was approved.

The full message format, the endpoint list, and the data shapes are in the
[Protocol reference](/protocol/overview/).

## Next

- [Protocol overview](/protocol/overview/) — the actors and cycles in full.
- [Force inputs](/concepts/force-inputs/) — the values locked into a token.
- [Build a Provider](/build/provider/) — implementing single-use tokens and
  scope enforcement.
