---
title: QR coupons with a Telegram bot
summary: Telegram-based coupon issuing and validation, with single-use redemption enforced in SQL Server.
layers:
  store: SQL Server · coupon state
  move: Python · QR generation
  write: Telegram bot · validation
stack: [Python, python-telegram-bot, SQL Server, QR generation]
order: 5
---

## Context

Promotional coupons need two things after they are issued: a quick way for staff to
validate them and a reliable way to prevent the same coupon from being redeemed twice.

## What I built

I added a QR coupon system with a Telegram bot for issuing and validating codes. The bot
gives staff a simple phone-based interface, while SQL Server holds the coupon state and
enforces single-use redemption.

## What changed

Coupon validation is now part of a recorded workflow. A code can be checked at the point
of use, and the database prevents a completed redemption from being accepted again.
