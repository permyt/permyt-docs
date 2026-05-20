---
title: The Permyt app
description: The consumer app where a user connects services, approves or denies access requests, and revokes access.
---

The Permyt app is the user's side of the protocol. It runs on iOS and Android.
It is where a user connects services, sees every request, decides, and revokes
— the human-in-the-loop that every access request passes through.

## What the user does with it

- **Connect services.** Scan a QR code or an NFC tag to link a service to a
  Permyt identity.
- **Approve or deny access requests.** Review what a requester is asking for
  and decide, scope by scope.
- **Set how each scope is handled.** Choose auto-grant, prompt-once, or
  prompt-always per scope.
- **See connected services.** Review which services are linked and what they
  hold.
- **Manage granted permissions.** Review and revoke grants, grouped by
  requester and provider.
- **Block services.** Stop an unwanted service from making future requests.
- **Read the activity log.** See every access, approval, denial, and
  revocation.

## The home screen

The home screen carries the user's personal QR code. A service scans it to
start requesting from that user — it is the entry point to the connect flow
from the user's side.

## The Access Request screen

The Access Request screen is the moment the protocol is built around. When a
requester asks for something that needs approval, the app shows:

- A plain-English summary of what is being asked and why — the requester's
  description, word for word.
- A *View more details* section that expands into the underlying scopes and
  fields, and the concrete values behind the request — the exact amount, the
  exact recipient.
- Two choices: Deny, Accept.

When the request carries [force inputs](/concepts/force-inputs/), the user sees
the real values — *"Send €25 to João"*, not a blank *"Send payment"* — and
those are the values locked into the issued token.

## Answer once, or answer always

When the app prompts, the user picks one of four answers — allow once, allow
always, deny once, deny always. An *always* answer is remembered for matching
requests; a *once* answer is not. This is set against the consent mode each
scope carries, so routine requests can pass without interruption while
sensitive ones always stop for a tap. The full model is in
[Consent, grants, and revocation](/concepts/consent/).

## The kill switch

From the app a user can revoke a connected service. The effect cascades:
pending requests are rejected, remembered grants are cleared, the service is
notified to drop its own link, and the connection is deleted. One action stops
every provider connected through Permyt from answering that service. The user
does not have to visit each provider one by one.

## A thin client

The app is deliberately thin. It does not run cryptography, resolve scopes, or
exchange tokens — all of that happens on the broker. The app makes API calls
and renders the result. It receives a push notification when a service
requests access, and it is localized into several languages.

## Next

- [Consent, grants, and revocation](/concepts/consent/) — the model behind the
  decisions the app presents.
- [How it works](/concepts/how-it-works/) — where the app sits in a full
  request.
- [Connect users](/build/connect/) — the developer side of the connect flow.
