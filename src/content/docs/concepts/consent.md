---
title: Consent, grants, and revocation
description: How a user's decision is captured, remembered, and undone — consent modes, grant decisions, and the kill switch.
---

A user answers an access request once or always, and they can revoke at any
time. Three mechanisms carry that: the **consent mode** a provider sets per
scope, the **grant decision** a user makes when prompted, and the
**disconnect** that tears a connection down.

## Consent modes

Each scope a provider declares carries a default **consent mode** — how Permyt
should handle requests for it. The mode is materialized per connection when a
user connects the service, so a user could later tune it for their own
connection.

| Mode             | Behaviour                                                            |
| ---------------- | -------------------------------------------------------------------- |
| `auto_grant`     | Approve automatically for any requester. The user is not interrupted. |
| `prompt_once`    | Ask the first time a given requester asks; remember the answer after. |
| `prompt_always`  | Ask every time. An approval is never remembered.                     |

`auto_grant` suits routine, low-sensitivity reads. `prompt_always` suits
sensitive moments — payments, irreversible actions, identity-level data — that
should always stop for an explicit tap. `prompt_once` is the middle ground for
everything else.

## Grant decisions

When Permyt does prompt, the user picks one of four answers:

| Decision        | Effect                                                              |
| --------------- | ------------------------------------------------------------------- |
| `always_allow`  | Approve, and remember it so future matching requests are auto-approved. |
| `once_allow`    | Approve this one request. Nothing is remembered.                    |
| `once_deny`     | Deny this one request. Nothing is remembered.                       |
| `always_deny`   | Deny, and remember it so future matching requests are auto-rejected. |

This is the "answer once, or answer always" experience. `always_allow` and
`always_deny` persist a record for that combination of connection, requester,
and scope; the `once_` answers leave no trace beyond the request itself.

A scope set to `prompt_always` never persists an *approval* — `always_allow`
is not offered for it — but `always_deny` is always honoured. A user can
permanently shut something off even if they can never permanently wave it
through.

## Pre-approval bundles

A user can pre-approve a named bundle of scopes so any service that requests
one of them is answered without a prompt. This is the "answer always, ahead of
time" case — useful for scopes a user is comfortable sharing broadly.

## Blocking a service

A user can block a service outright. Once blocked, that service's requests for
the user's profile are rejected before scope resolution even runs — the user
is not prompted, and the requester receives a rejection.

## Revocation and the kill switch

Every grant is undoable. From the Permyt app a user can revoke a connected
service, and the effect cascades:

- Any request from that service still waiting for an answer is rejected.
- Every remembered grant for the connection is wiped, and the revocation is
  written to the activity log.
- Permyt notifies the service so it can drop its own tokens and sessions.
- The connection is deleted. The service can no longer answer for that user.

This is the kill switch. Revoke an agent or a service and every provider
connected through Permyt stops answering it. The user does not have to visit
each provider one by one — one action at Permyt reaches all of them.

## The activity log

Every access, approval, denial, and revocation is recorded. The user has one
place to see what was asked, what they decided, and what data moved — per
request, per field.

## Next

- [Force inputs](/concepts/force-inputs/) — what a user is actually approving
  when a request carries concrete values.
- [The zero-knowledge broker](/concepts/security/) — why a grant can be
  trusted.
- [Connect users](/build/connect/) and the disconnect flow — the developer
  side of revocation.
