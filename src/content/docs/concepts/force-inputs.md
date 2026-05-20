---
title: Force inputs
description: How Permyt locks the concrete values a user approved into the issued token so they cannot be changed before execution.
---

Some scopes need permission *and* a set of concrete values. `payments.send` is
meaningless without an amount, a currency, and a recipient. **Force inputs**
are how Permyt locks those values into the issued token, so the action that
runs is exactly the action the user saw and approved.

## The problem they solve

Picture an approval without force inputs. A user taps Accept on *"send a
payment"*. The requester — or the agent behind it — now holds a token for
`payments.send` and chooses the amount and recipient at execution time. A €10
approval could become a €10,000 transfer to a different account, and nothing
in the token would say otherwise.

Force inputs close that gap. The values are fixed at approval time and
travel with the token.

## How they flow

1. **Declared.** A provider declares a scope's inputs when it registers its
   catalogue — `payments.send` declares `amount`, `currency`, `receiver`.

2. **Extracted.** When resolving a request, Permyt extracts the values for
   those inputs from the plain-English description. *"Pay João €25 for lunch"*
   yields `amount: 2500`, `currency: "EUR"`, `receiver: "João"`. If a required
   value cannot be resolved, the request ends as `incomplete` and the user is
   never prompted.

3. **Shown.** The user sees the resolved values on the Access Request screen.
   They approve *"Send €25 to João"*, not a blank *"Send payment"*.

4. **Locked into the token.** On approval, Permyt sends the values to the
   provider as part of the token request. The provider stores them alongside
   the token it issues.

5. **Enforced.** When the requester redeems the token, the provider checks the
   incoming call against the locked values and rejects any mismatch. A token
   approved for `{amount: 2500, currency: "EUR", receiver: "João"}` cannot be
   honoured for a different amount or a different recipient.

## What the provider receives

The approved scope reaches the provider as a map from each scope reference to
its locked values:

```python
scope = {
    "payments.send": {
        "amount": 2500,
        "currency": "EUR",
        "receiver": "João",
    },
    "identity.basic": {},  # a scope with no declared inputs
}
```

A scope with no inputs maps to an empty object, so a plain membership test —
`if "identity.basic" in scope` — works the same for every scope.

## Locked and free fields

Not every field of an action needs to be locked. A payment has a *recipient
account* (must be locked — this is where the money goes) and a *description*
(free — a label the requester fills in at call time). A provider locks the
fields that change the meaning of the action and leaves cosmetic fields free,
so the requester does not have to re-prompt the user just to set a label.

The Revolut connector, for example, locks the recipient, amount, and currency
of a payment and enforces an exact match on each, while leaving the
beneficiary display name free. See [Connectors](/patterns/connectors/).

## The provider's responsibility

The SDK does not enforce force inputs automatically — the right comparison is
scope-specific. An exact match suits a payment; a cap suits a withdrawal
limit; a range suits a date filter. Only the provider knows which. A provider
must:

1. Persist the full set of locked values when it issues the token.
2. Return them unchanged when it looks the token up.
3. Compare incoming calls against them and reject any mismatch.

This is the security boundary that stops an action from being rewritten
between the user's approval and its execution. The enforcement pattern is
shown in [Build a Provider](/build/provider/).

## Next

- [Build a Provider](/build/provider/) — implement force-input enforcement.
- [Scopes and intent-driven scoping](/concepts/scopes/) — where input values
  come from.
- [The zero-knowledge broker](/concepts/security/) — the cryptography around
  the token.
