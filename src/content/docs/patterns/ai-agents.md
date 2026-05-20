---
title: AI agents as requesters
description: How an AI agent becomes a Permyt requester — through an MCP server or a REST API — so a user stays in control of what the agent can reach.
---

An AI agent that acts for a user needs access to the user's data and services.
Permyt is the layer that decides what the agent can reach: the agent acts as a
[requester](/build/requester/), the user approves each request on their phone,
and the agent receives only scoped, single-use tokens.

## The agent is a requester

Nothing in the requester role is specific to agents. An agent submits an
access request with a plain-English description, the broker resolves it to
scopes, the user approves, and the agent receives tokens it redeems against
providers directly. The plain-English description is a natural fit — an agent
already works in language, so stating the job it wants to do is exactly what
it produces anyway.

What an agent integration adds is a surface the agent's runtime can call. Two
surfaces cover the common cases.

## An MCP server

The Model Context Protocol is how agent runtimes such as Claude Code and Claude
Desktop discover and call tools. A Permyt MCP server exposes the requester role
as a small set of MCP tools — request access to user data, check a request's
status, collect the result — so the agent can ask for data the same way it
calls any other tool.

The server is the requester. It holds the service key, submits requests to the
broker on the user's behalf, and returns results to the agent. The agent never
holds a Permyt key and never sees a provider's raw token; it sees the tools and
their results.

## A REST API

Not every agent runtime speaks MCP. A token-authenticated REST API exposes the
same requester capability over plain HTTP, so an agent platform or any HTTP
client can drive it. The endpoints mirror the MCP tools: submit a request,
poll its status, collect the result.

One service can offer both surfaces — MCP for runtimes that support it, REST
for everything else — over the same requester underneath.

## Linking the user

Before an agent can request anything for a user, that user must be linked to
the service. The [Connect](/build/connect/) flow handles it: the user scans a
QR code with their Permyt app, the service binds their `permyt_user_id`, and
from then on the agent's requests are addressed to that user. No credentials
are handed to the agent.

## Multi-user

An agent service is typically multi-user — many people, each with their own
Permyt identity, sharing one requester service. Authenticate each user to the
service (a per-user token is the usual choice) and address each access request
to that user's `permyt_user_id`. The broker keeps every user's connections,
consent, and activity log separate.

## What the user keeps

Routing an agent's access through Permyt keeps three things with the user:

- **The decision.** Every request the agent makes surfaces on the user's
  phone. Sensitive actions stop for an explicit tap; routine ones can be
  marked auto-approved.
- **The scope.** The agent receives only what the job needs, never the full
  reach of a connection — see [Scopes](/concepts/scopes/).
- **The kill switch.** Revoking the agent from the Permyt app stops every
  provider from answering it, in one action — see
  [Consent, grants, and revocation](/concepts/consent/).

## Next

- [Build a Requester](/build/requester/) — the role an agent service
  implements.
- [Connect users](/build/connect/) — linking a user before the agent can act.
- [How it works](/concepts/how-it-works/) — the request walkthrough the agent
  is driving.
