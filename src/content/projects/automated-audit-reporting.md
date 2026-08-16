---
title: Automated audit reporting
summary: Forms go in, a scored bilingual PDF comes out, and nobody opens a laptop to make it.
layers:
  store: SQL Server · audit schema
  move: Python · pandas · ReportLab
  read: UZ/RU PDF · distribution
stack: [Google Forms, SQL Server, Python, pandas, ReportLab, Scheduled jobs]
order: 2
---

## Context

Pentazone audits every branch against the same checklist on the same schedule. The audits
were collected on paper: an auditor visited a site, filled in a form by hand, drove back,
and typed it up.

## Problem

The write-up was the bottleneck, and it was also where consistency drifted.

Reports arrived days after the visit, which is long enough that the finding has stopped
being actionable — by the time the office reads that a checklist item failed, the shift
that failed it has turned over twice. And because each report was typed by hand, no two
were laid out the same way. Comparing this month against last month meant reading two
differently shaped documents and holding the difference in your head.

Scoring was done manually as well, so the score depended slightly on who was adding up.

## What I built

The form moved to Google Forms, and responses land in SQL Server. A scheduled Python job
picks up new responses, applies the scoring rules, and renders a formatted PDF with
ReportLab. Distribution is part of the job, not a step someone remembers to do.

Two details did most of the work. The scoring rules live in one place and are applied by
the job rather than by a person, so the same answers always produce the same score. And
the report carries a bilingual Uzbek and Russian cover letter, because the auditors and
the office do not read the same language — before, that translation was informal and
happened in conversation, which meant it did not happen at all for anyone who was not in
the conversation.

The first page is written for the director and the rest for the branch manager.

## What changed

The report is generated from the response rather than written from it. It arrives before
the auditor is back at the office, every month has the same shape, and the score means
the same thing in March as it did in January.
