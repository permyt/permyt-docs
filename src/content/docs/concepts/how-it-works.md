---
title: How it works
description: Follow an access request from a plain-English description through to a scoped token.
---

Every access request walks the same path. A requester describes what it needs,
Permyt works out which of the user's connected services can answer, the user
decides, and — if they approve — the requester receives a scoped token it
redeems against the source service directly.

## The steps

1. **A requester describes what it needs.** An agent, an app, or a service
   sends Permyt a plain-English description: *"I need the user's income,
   employment, and outstanding debts to evaluate eligibility."* It addresses
   the request to a specific user and, optionally, gives a callback URL for
   the result.

2. **Permyt resolves the request.** Permyt looks at the services the user has
   connected, works out which of them can answer, and picks the minimum set of
   scopes needed for the job. For a scope that needs concrete values — an
   amount, a recipient — it extracts those from the description.

3. **The user sees the request on their phone.** The Permyt app shows a
   plain-English summary, with a *View more details* option to drill into the
   underlying scopes and fields. Two buttons: Deny, Accept.

4. **The user decides.** They can answer once or answer always. Routine
   requests can be marked auto-approved so they never interrupt; sensitive
   moments — payments, irreversible actions, identity-level data — always
   require an explicit tap.

5. **Permyt issues scoped tokens.** On approval, Permyt asks each relevant
   provider to mint a single-use token, scoped to exactly what was approved,
   and encrypted for the requester. Permyt relays the token but cannot read
   it.

6. **The requester calls the source directly.** It decrypts the token and
   calls each provider's endpoint. The provider validates the token, enforces
   the approved scope, and returns only what was approved. Permyt is not in
   this exchange.

## The Access Request screen

The moment that defines the experience is the Access Request screen in the
Permyt app: a plain-English description of what is being asked, an expandable
*View more details* section, and the choice to Deny or Accept.

A request reads the way a person would say it — *"Send €25 to João"*, not
*"Send payment"*. The user approves the action they understand, and Permyt
locks the issued token to the exact values behind it. See
[Force inputs](/concepts/force-inputs/) for how that lock works.

## What Permyt never touches

Permyt coordinates the authorization and routes encrypted tokens between
services. It does not see user data, it does not store it, and it does not
proxy the data exchange. Tokens are encrypted for the requester's public key,
so even while a token passes through Permyt, Permyt cannot decrypt it. See
[The zero-knowledge broker](/concepts/security/).

## A worked example: a mortgage application

Today a mortgage customer uploads payslips, bank statements, ID, proof of
address, and an employment letter. Operations chase the missing documents,
fraud teams try to spot AI-generated PDFs, and underwriting waits on the pile.

With Permyt, the lender's system declares its intent in plain English. Permyt
surfaces the request to the customer, who taps Accept once. Income comes from
their bank. Employment comes from the HR system. Debts come from the credit
bureau. Address comes from a utility. Identity comes from the passport
authority. Every field arrives from the service that is the authoritative
source for it, and underwriting starts the same hour. Consent is logged per
field.

## Next

- [The three roles](/concepts/roles/) — who asks, who answers, who decides.
- [Scopes and intent-driven scoping](/concepts/scopes/) — how a job becomes a
  set of scopes.
- [Build with Permyt](/build/overview/) — add Permyt to your own service.
