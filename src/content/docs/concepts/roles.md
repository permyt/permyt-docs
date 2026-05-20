---
title: The three roles
description: Requester, Provider, and User — the three roles every Permyt interaction is built from.
---

Every Permyt interaction involves three roles. A single service can play more
than one of them, but each role has a distinct job.

## Requester

A **Requester** asks for data or wants to authorize an action. Agents, apps,
and services are requesters. A loan application that needs employment history,
a personal-finance agent that needs ninety days of transactions, a checkout
that needs to send a payment — each of these is acting as a requester.

A requester describes what it needs in plain English, submits that to Permyt,
and waits for the result. When access is approved it receives scoped tokens
and calls the source services directly.

## Provider

A **Provider** is the source of truth for some data, or the system that can
carry out an action. A bank, a passport authority, an HR platform, a
productivity suite — each is a provider for the data it holds.

A provider declares the scopes it exposes, responds to approved token requests
by minting single-use tokens, and serves scoped data when a requester redeems
one. A provider never hands data to Permyt; it hands a token to the requester
and answers the requester directly.

## User

The **User** is the human at the centre. They approve, deny, and revoke. They
connect services to their Permyt identity, see every request on their phone,
and decide what runs and what stops to ask. The kill switch is theirs: revoke
an agent or a service and every connected provider stops answering it.

## How services adopt the roles

A service integrates with Permyt through the [Permyt SDK](/build/overview/).
Building a requester and building a provider use the same client class — a
service implements the methods for the role it plays:

| Role      | What the service does                                              |
| --------- | ------------------------------------------------------------------ |
| Requester | Submits access requests; consumes scoped tokens.                   |
| Provider  | Declares scopes; issues tokens; serves scoped data.                |
| Connect   | Links a user's account to their Permyt identity via QR, NFC, or a redirect. |

A service can be a requester, a provider, or both. Any service can also
implement Connect, the flow that links a user's account so they can approve
requests without re-entering credentials.

## A note on connectors

Some providers integrate Permyt natively. For services that have not yet — a
bank, a productivity suite — a **connector** is a standalone provider built
against a third-party API that makes that service available to the Permyt
network in the meantime. A connector is a provider; it is just operated by
someone other than the underlying vendor. See [Connectors](/patterns/connectors/).

## Next

- [How it works](/concepts/how-it-works/) — the full request walkthrough.
- [Scopes and intent-driven scoping](/concepts/scopes/) — how Permyt turns a
  job into the right set of scopes.
- [Where your service fits](/build/overview/) — pick a role and start building.
