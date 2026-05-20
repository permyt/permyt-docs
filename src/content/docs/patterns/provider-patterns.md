---
title: Provider patterns
description: Ways to design a provider's scope catalogue — static versus runtime-defined, raw fields versus privacy-preserving predicates, and where to draw the force-input line.
---

Two providers can both follow [Build a Provider](/build/provider/) and still
make very different design choices. This page covers the choices that matter,
drawn from the Permyt demo providers and connectors, so you can pick the
shape that fits your service.

## A static catalogue

The simplest catalogue is fixed in code. A provider defines its scopes in one
place and pushes them to the broker with a single `update_scopes` call. Adding
a scope is a one-line change followed by a redeploy.

This suits a provider whose data shape is stable. A government identity
provider — fixed citizen fields like name, birthdate, address, tax ID — has
nothing that changes at runtime, so a static catalogue is the natural fit. A
bank with a fixed set of account operations is the same.

Reach for a static catalogue when the set of scopes is known at build time and
changes rarely. It is the easiest to reason about and to review.

## A runtime-defined catalogue

Some providers need scopes that change while the service runs. A provider that
lets its operators add or remove data fields on the fly cannot hard-code its
catalogue.

The pattern: when a field is added or removed, the provider rebuilds its scope
list and calls `update_scopes` again. Because the broker diffs the submitted
list by `reference`, one call creates the new scopes, updates changed ones, and
deletes the ones now missing. New scopes become available to every user and
every requester immediately — no code change anywhere else in the network, and
no redeploy of the broker or of any requester.

Reach for a runtime catalogue when the data fields a provider exposes are
themselves data — defined by operators or by configuration rather than by the
codebase.

## Raw fields versus predicate scopes

A scope does not have to return raw data. For any field where a requester
usually only needs a yes-or-no answer, consider exposing a **predicate scope**
alongside — or instead of — the raw read.

A government identity provider can expose both:

- `birthdate.read` — returns the date of birth.
- `is_older.check(min_age)` — takes an age and returns `{ is_older: bool }`.

A requester that needs to confirm someone is 18 or over describes that job,
and the broker resolves it to `is_older.check` with `min_age` locked to `18`.
The provider answers with a single boolean. The date of birth never leaves the
provider. Both the broker's scope resolution and the consent screen in the
Permyt app prefer the predicate when one exists, because it shares one bit
instead of a whole field.

Other predicates follow the same shape — `is_resident_of.check(country_code)`,
`vat_matches.check(value)`. Each takes an input, returns a boolean, and reveals
nothing else.

Expose a predicate whenever a requester's real question is narrower than the
field that would answer it. It is the difference between a verification that
shares a fact and one that hands over an identity document.

## Where to draw the force-input line

For a scope that carries out an action, decide field by field which inputs are
**locked** and which are **free**.

A bank's `payment.send` scope is the clear case:

- **Locked** — the beneficiary account, the amount, the currency. These define
  where the money goes and how much. The user approves exact values on their
  phone, and the provider enforces an exact match at execution time. Tampering
  between approval and execution is rejected.
- **Free** — the beneficiary display name, the payment description. These are
  labels. They do not change what the action does, so the requester can fill
  them in at call time without re-prompting the user.

The rule: lock every input that changes the meaning or the effect of the
action; leave cosmetic inputs free. Locking too little is a security gap;
locking labels is a needless extra prompt. See
[Force inputs](/concepts/force-inputs/) for the enforcement code.

## Connect, or provider-only

A provider has to map a `permyt_user_id` to one of its own accounts, which
means the user's account must be linked. A provider can implement
[Connect](/build/connect/) itself — letting users link by scanning a QR code —
or rely on the user having connected through another flow. Most demo providers
implement Connect so the whole path, from linking an account to serving data,
works in one service.

## Choosing a shape

| Question                                            | Points toward                          |
| --------------------------------------------------- | --------------------------------------- |
| Is the set of scopes known at build time?           | A static catalogue.                     |
| Do operators define data fields at runtime?         | A runtime catalogue with `update_scopes`. |
| Does a requester usually just need a yes/no?        | A predicate scope.                      |
| Does a scope carry out an action?                   | Locked force inputs on the inputs that matter. |
| Do users need to link their account through you?    | Implement Connect.                      |

## Next

- [Build a Provider](/build/provider/) — the implementation these patterns
  build on.
- [Connectors](/patterns/connectors/) — providers that bridge a third-party
  service into the network.
- [Scopes and intent-driven scoping](/concepts/scopes/) — the concepts behind
  catalogue design.
