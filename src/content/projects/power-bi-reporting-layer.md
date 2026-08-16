---
title: Power BI reporting layer
summary: A semantic layer of views and procedures, so branch managers and the founder read one number.
layers:
  store: SQL Server · views · procs
  read: Power BI · DAX · RLS
stack: [SQL Server, T-SQL, Views, Stored procedures, Power BI, DAX]
order: 3
---

## Context

Reporting at Pentazone was per-branch and assembled by hand. Each branch produced its own
numbers, and the office produced a different set from the same source.

## Problem

The failure mode was not a wrong number. It was two right numbers.

A branch manager and the office would arrive at a meeting with figures that differed by a
few percent, both built by competent people from the same data. The difference always
turned out to be a definition — whether refunds were subtracted at the point of sale or
when they cleared, whether a period ran to the last day or the last full week.

Both choices were defensible. Neither had ever been decided, because the decision was
never made as a decision; it was a formula written once inside somebody's file.

Once that has happened twice, meetings stop being about the business and start being
about whose file is correct.

## What I built

The semantic layer sits in SQL Server as views and stored procedures, not in the
reporting tool. Refunds are netted in one place. A period means one thing. Power BI models
consume that layer and add DAX measures only for what genuinely belongs at the
presentation level — the calculations that need to know what the reader has selected.

Row-level security decides which branch a person sees, so there is one model rather than
one file per branch. The Python job that renders the monthly PDF reads the same views as
the dashboards, which means the report and the dashboard cannot quietly disagree.

## What changed

The definition of a measure has one home. When it changes, it changes once, and the branch
view and the founder's view move together because they are reading the same object.

Someone asking what revenue means now gets a view definition instead of an opinion, and
the argument goes back to being about the business.
