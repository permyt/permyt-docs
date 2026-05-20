---
title: Connectors
description: How a connector bridges a third-party service into the Permyt network as a provider, before that service integrates the protocol natively.
---

A **connector** is a provider that stands in front of a third-party service.
When a vendor — a bank, a productivity suite — has not yet integrated Permyt
itself, a connector built against that vendor's existing API makes its data
and actions available to the Permyt network in the meantime.

The protocol is open: a connector can be built by anyone, for any service
Permyt does not yet cover. Adding one grows the network on the provider side
without the underlying vendor changing anything.

## A connector is a provider

A connector is not a separate kind of actor. It is a [provider](/build/provider/)
— it subclasses `PermytClient`, declares scopes, issues single-use tokens, and
serves scoped data. What makes it a connector is where the data comes from:
instead of its own database, it reads and writes through a third party's API.

Everything in [Build a Provider](/build/provider/) and
[Provider patterns](/patterns/provider-patterns/) applies. A connector has two
extra concerns: holding the vendor credential, and translating between the
two APIs.

## Holding the vendor credential

A connector needs a way to act on the vendor's API for a given user — usually
an OAuth token or an API key obtained when the user linked their account.

This is what the connector's [Connect](/build/connect/) flow is for. When a
user connects, the connector runs the vendor's own authorization flow, obtains
the vendor credential, and stores it keyed by `permyt_user_id`. From then on,
`resolve_user` maps a Permyt user to the right vendor credential, and
`process_request` uses that credential to call the vendor.

When the user disconnects, `process_user_disconnect` drops the stored vendor
credential — the link to the vendor is torn down along with the Permyt
connection.

## Translating scopes onto a vendor API

The connector defines Permyt scopes that mirror the vendor capability it
exposes, and `process_request` translates an approved scope into the vendor's
own API calls.

A connector for a banking vendor, for example, can expose scopes for listing
accounts, reading a balance, reading transaction history, and sending a
payment. Read scopes carry no force inputs and map straight onto vendor read
endpoints. The payment scope is where the force-input discipline from
[Provider patterns](/patterns/provider-patterns/) matters most.

## Force inputs at production scale

A payment connector locks the inputs that decide where money goes and how
much — the recipient or beneficiary account, the amount, the currency, and,
where the vendor has multiple accounts, the source account. The connector
persists those locked values with the token, and `process_request` enforces an
exact match before it ever calls the vendor's payment endpoint. A mismatch is
rejected; the vendor is never called.

This is the security boundary in a connector. Between the user approving a
payment on their phone and the connector calling the vendor, an agent or a
requester has no opportunity to change the amount or the destination. Get the
force-input enforcement right and the connector is safe; get it wrong and a
connector becomes a payment-tampering hole. Review it the way
[Build a Provider](/build/provider/) describes:

1. Persist the full scope grant when the token is issued.
2. Return it unchanged when the token is looked up.
3. Compare the incoming call against the locked values and reject any
   mismatch — before touching the vendor API.

## A maturing connector

A connector is constrained by the vendor API behind it. A connector may start
by covering one product line — a business banking API, say — with personal
or open-banking coverage on the roadmap. A connector may also be a work in
progress and not yet implement the full provider contract; treat an early
connector as an example to learn from, not a template to copy without review.
The contract a finished connector must meet is the provider contract in
[Build a Provider](/build/provider/).

## When the vendor integrates natively

A connector is a bridge, not a permanent fixture. When a vendor adopts Permyt
directly, it becomes its own provider and the connector is no longer needed.
Until then, a connector is how that vendor's users get to take part in the
network.

## Next

- [Build a Provider](/build/provider/) — the contract every connector meets.
- [Provider patterns](/patterns/provider-patterns/) — catalogue design and the
  force-input line.
- [Connect users](/build/connect/) — the flow a connector uses to obtain a
  vendor credential.
