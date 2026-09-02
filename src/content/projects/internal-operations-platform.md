---
title: Internal operations platform
summary: Six-role platform with four-stage approvals, request routing, and bottleneck visibility for around 20 staff.
layers:
  store: SQL Server · schema · procs
  read: admin dashboard · exports
  write: Next.js · React · Tailwind
stack: [SQL Server, T-SQL, Next.js, React, Tailwind CSS]
order: 1
---

## Context

Pentazone operates seven indoor-playground branches across Tashkent, Samarkand,
Andijan and Kokand. Technical operations, warehouse, finance, and branch teams all
needed to move requests through the company, but the process crossed several roles and
systems.

## Analysis

Before building, I ran a company-wide systems analysis. I interviewed technical
operations, warehouse, finance, and every branch manager; classified 1,327 maintenance
requests into 26 categories and 747 audit comments by problem type; and traced 11
systemic failures to three root causes.

That work defined what the platform needed to make visible: the owner of a request, its
current approval stage, the next responsible role, and the time spent waiting.

## What I built

I shipped the platform as the sole developer, from SQL Server schema to interface. It
supports six roles and a four-stage approval chain, routes warehouse and finance
requests, and gives administrators a dashboard showing which stage a task is stuck at
and for how long.

Around 20 people across all seven branches use it in their daily work.

## What changed

Operational requests now move through an explicit workflow instead of being reconstructed
from separate conversations. Managers can see where work is waiting and which role needs
to act next.
