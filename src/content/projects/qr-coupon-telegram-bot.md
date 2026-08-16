---
title: QR coupons with a Telegram bot
summary: Group-restricted redemption. One scan, one row, and a coupon cannot be spent twice.
layers:
  store: SQL Server · redemption log
  move: Python · QR generation
  write: python-telegram-bot
stack: [Python, python-telegram-bot, SQL Server, QR generation]
order: 4
---

## Context

Pentazone issues promotional coupons for campaigns and school-holiday events. Once issued,
they left the system entirely — a printed code with no record of what happened to it.

## Problem

Two things followed from that, and the second is the expensive one.

There was no redemption tracking, so a campaign could not be evaluated. Whether a
promotion brought anyone in was a matter of impression, and impressions tend to favour
whoever ran the promotion.

And because nothing recorded a redemption, nothing prevented one. A code could be used
twice, or used after the campaign ended, and there was no way to find out afterwards. The
staff doing the redeeming were standing at a counter with a phone, not sitting in front of
an admin panel, so any solution that required opening a laptop was not going to be used.

## What I built

Codes are generated and logged in SQL Server, and issued as QR. Redemption happens through
a Telegram bot, because Telegram is already open on the phone of the person doing it —
the tool met the staff where they were rather than asking them to move.

Access is restricted by group membership, so only authorised staff can redeem, and
authorisation is a property of the group rather than a password that circulates. Each scan
writes exactly one row: which code, by whom, when. A second attempt on a spent code is
refused and still recorded, because an attempted double-redemption is itself information.

## What changed

A coupon now has a life cycle that can be queried. Whether a campaign worked is a question
the redemption log answers, rather than a question people answer from memory.
