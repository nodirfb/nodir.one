---
title: Power BI operations wall board
summary: Daily branch reporting for retention, sales, attendance, audit scores, and plan versus actual.
layers:
  store: SQL Server · staging · star
  read: Power BI · DAX · RLS
stack: [1C ERP, SQL Server, T-SQL, Dimensional modelling, Power BI, DAX]
order: 3
---

## Context

Pentazone&rsquo;s founder and department heads need one daily view of performance across
seven branches. The source is 1C ERP, but its operational tables are not a useful
reporting interface on their own.

## What I built

I designed an analytical layer over 1C: a staging layer that makes the ERP tables
legible and a dimensional layer that Power BI can consume. Reporting logic therefore
has a defined home instead of depending on somebody&rsquo;s knowledge of 1C internals.

On top of that layer, I built the operations wall board in Power BI. It reports
retention, daily plan versus actual, sales dynamics, cashier registration rate, Face ID
attendance, and audit scores by branch.

The dashboard is mounted in the head office and read daily by the founder and department
heads.

## What changed

Branch performance is now read from one shared analytical layer. The display gives
decision-makers a consistent operational view without requiring them to navigate the
ERP or assemble separate files.
