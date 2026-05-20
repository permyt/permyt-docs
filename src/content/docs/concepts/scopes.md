---
title: Scopes and intent-driven scoping
description: How Permyt turns a plain-English job into the minimum set of scopes across the right services.
---

A **scope** is a named thing a provider can answer or do — a field it can
return, a check it can run, an action it can take. `balance.read`,
`is_older.check`, `payments.send` are scopes. A provider declares the scopes
it exposes; a requester never writes scopes at all.

## Intent-driven scoping

A requester describes the **job** it wants to do, in plain English. It does
not list scopes or name services. Permyt resolves the description into the
minimum set of scopes, drawn from the authoritative providers the user has
connected.

```text
Requester says:  "I need the user's income, employment, and outstanding
                  debts to evaluate eligibility."
                         │
                         ▼
Permyt resolves:  bank      → income.read
                  hr-system → employment.read
                  bureau    → debts.read
```

The job defines the access. The requester does not need to know which bank
the user is with, what that bank calls its income endpoint, or how to phrase a
scope — it describes the outcome it needs and Permyt maps it onto whatever the
user has connected.

This is what makes one integration reach everything. A requester that
integrates Permyt once can serve any user, regardless of which providers that
user has connected, because the mapping from intent to scope happens per
request.

## Minimum scope, per request

When a user approves a connection they grant a *maximum* — the set of scopes
that connection could ever cover. Permyt issues far less than that. It
evaluates each request on its own and issues only the scopes that specific job
needs.

```text
User has connected:  a bank, with income, assets, debts, transactions

Request: "Check if the user qualifies for a loan"
  → Permyt issues:  income.read

Request: "Generate a full financial report"
  → Permyt issues:  income.read, assets.read, debts.read, transactions.read
```

A requester never receives more than the job in front of it requires, even
inside a connection the user has already approved. If a later request needs
more, the requester simply asks again, and the user is prompted again if the
new request reaches beyond what they have already allowed.

## Authoritative providers

Permyt prefers the provider that is the source of truth for a field. Income is
answered by the bank that holds the account, employment by the HR system that
runs payroll, identity by the authority that issues the document. Data arrives
from the service that actually knows it, not from a copy.

## Predicate scopes: answer the question, not the field

A scope does not have to return raw data. A **predicate scope** takes an input
and returns a single boolean, without revealing the underlying field.

A passport authority can expose `is_older.check(min_age)` alongside
`birthdate.read`. A requester that only needs to confirm someone is 18 or over
asks for the job — *"confirm the user is at least 18"* — and Permyt resolves it
to `is_older.check` with `min_age` locked to `18`. The provider returns
`{ is_older: true }`. The date of birth never leaves the provider.

Both Permyt's scope resolution and the consent screen in the Permyt app prefer
the predicate when one exists, because it shares one bit instead of a full
field. Designing predicate scopes is covered in
[Provider patterns](/patterns/provider-patterns/).

## Scope inputs

Some scopes need values to be meaningful. `payments.send` needs an amount, a
currency, and a recipient. A scope declares these as **inputs**, and Permyt
extracts their values from the request description during resolution. Those
values are then locked into the issued token — see
[Force inputs](/concepts/force-inputs/).

If a required input cannot be resolved from the description, the request ends
as `incomplete` and the user is never prompted for a request that could not
have been carried out anyway.

## Next

- [Force inputs](/concepts/force-inputs/) — locking concrete values into a token.
- [Consent, grants, and revocation](/concepts/consent/) — how a user's
  decision is remembered.
- [Provider patterns](/patterns/provider-patterns/) — designing a scope
  catalogue, including predicate scopes.
