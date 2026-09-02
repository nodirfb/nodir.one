---
title: Pharmaceutical distribution reporting
summary: A two-click desktop pipeline that turns messy 1C exports into finished Excel reports in about two minutes.
layers:
  store: SQL Server · star schema
  move: Python · 1C normalization
  read: Excel pivots · openpyxl
  write: PySide6 · Windows app
stack: [SQL Server, Python, pandas, openpyxl, PySide6, PyInstaller]
order: 2
---

## Context

This MAAB Academy project was built for Shayana Farm&rsquo;s pharmaceutical distribution
reporting. Regional distributors supplied messy, multi-sheet 1C exports, and five people
spent 15 to 30 days per reporting cycle turning them into monthly deliverables.

## What I built

I built a desktop application backed by a SQL Server star schema: optovik, customer,
product, and time dimensions around a sales fact table. SHA-256 row hashes make reloads
idempotent, while foreign keys and indexes protect and support the model.

The ingestion pipeline normalises region and territory names through Unicode
normalisation, regular expressions, and a variant dictionary, with database-backed
matching as a fallback.

openpyxl generates the finished Excel deliverables, including pivots by product group,
region, and territory. I packaged the PySide6 application as a single Windows executable
with error messages written for non-technical users.

## What changed

The monthly reporting cycle moved from 15 to 30 days of work by five people to a
two-click run that completes in about two minutes.
