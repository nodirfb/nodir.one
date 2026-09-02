---
title: Automated audit reporting
summary: Google Forms become scored bilingual PDFs through a scheduled SQL Server and Python pipeline.
layers:
  store: SQL Server · audit data
  move: Python · scoring · ReportLab
  read: UZ/RU PDF · distribution
stack: [Google Forms, SQL Server, Python, pandas, ReportLab, Scheduled jobs]
order: 4
---

## Context

Pentazone audits its branches against a recurring checklist. The useful output is not
the form response itself, but a consistently scored report that can be read by the
people responsible for the result.

## What I built

I automated the reporting chain end to end. Google Forms responses flow into SQL Server,
a scheduled Python process applies the scoring logic, and ReportLab renders the result
as a bilingual PDF.

Distribution is part of the same process, so nobody has to assemble, format, or forward
the report manually.

## What changed

Every response now goes through the same scoring and document-generation path. Reports
arrive in a consistent Uzbek and Russian format without a separate manual reporting
cycle.
