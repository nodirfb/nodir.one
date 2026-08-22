---
title: Internal operations platform
summary: Warehouse, finance, treasury and multi-step approvals across branches. Sole developer.
layers:
  store: SQL Server · schema · procs
  move: Python · scheduled jobs
  read: dashboards · exports
  write: Next.js · React · Tailwind
stack: [SQL Server, T-SQL, Python, Next.js, React, Tailwind CSS]
order: 1
---

## Context

Pentazone operates indoor playgrounds across several branches, and each branch buys stock,
approves spending and moves cash on its own account. Those requests and approvals went
through spreadsheets and chat messages, and every branch kept its own file.

## Problem

The thing that was missing was not a database. It was an audit trail.

A request existed as a message someone remembered sending. Approvals happened verbally in
the corridor and were written down afterwards, if at all. Two branches could be using
different versions of the same stock sheet for a week before anyone noticed, because
there was nothing that could notice.

Reconciling a month meant asking people what they had done, and the answer depended on
who was asked and how long ago it was. Nobody was being careless. There was simply no
object in the system that represented a decision.

## What I built

A web platform covering warehouse stock requests, finance approvals, treasury movement
and a branch task module, on a SQL Server schema where every state change is a row with
an author and a timestamp.

The core decision was to model approvals as explicit multi-step routes rather than as a
status column. A status column tells you where something is. A route tells you where it
has been, who moved it, and what it is allowed to do next — so a request sitting in step
two cannot jump to paid, and a rejection at step three is a fact with a name attached
rather than a value that was overwritten.

Branch tasks came later and reuse the same spine, because a task and a request are the
same shape: something assigned, moved through states, and closed by somebody.

Sole developer, from schema to interface.

## What changed

Requests stopped being messages and became records. The reconciliation question — who
approved this, and when — is now a query rather than a conversation, and it returns the
same answer regardless of who runs it or how much time has passed.
