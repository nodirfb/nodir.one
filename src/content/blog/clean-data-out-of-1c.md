---
# pubDate and readingMinutes are deliberately absent until this post is dated.
# A placeholder date ships a fabricated timeline. `order` drives the index.
title: Getting clean data out of 1C when there is no documentation
description: Reading an ERP you cannot change, without pretending you understand it yet.
order: 2
---

1C will give you the data. What it will not give you is a description of what any of it
means, and the table names are not going to help.

The instinct is to go looking for documentation. There usually is not any that matches
the configuration you actually have, because the configuration has been modified — that
is the point of 1C. Time spent hunting for a data dictionary is better spent establishing
which tables move when a real transaction happens.

## Start from an event you can cause

Do not start from the schema. Start from something you can make happen on purpose.

Ring up a sale in a test database, or find a transaction from yesterday that somebody can
describe to you in plain language. Then find its footprint. Snapshot the row counts of
every candidate table, perform the action, snapshot again, and diff. You are not trying
to understand the model. You are trying to find the four tables out of nine hundred that
responded.

This is unglamorous and it is the fastest route I know. An hour of this teaches you more
than a day of reading metadata, because it tells you what is actually used rather than
what exists. Plenty of tables exist and are never written to.

Do it three or four times with different kinds of transaction — a sale, a refund, a stock
movement, a correction. The overlap between those footprints is the core of the model.
The parts that only appear in one are where the interesting edge cases live.

## Expect the register, not the table

The thing that catches people coming from a normal relational background is that the
number you want often is not stored anywhere. 1C keeps accumulation registers, and the
balance you are after is a fold over movements rather than a column you can select.

This is not a quirk to work around. It is the model, and if you fight it you will build
something that agrees with 1C on Monday and disagrees on Friday, when a document gets
posted late and changes a balance you have already copied.

Two consequences follow. Your extract has to be movement-based, not snapshot-based, if
you want it to survive backdated documents. And "as of" has to be a parameter you carry
everywhere, because a balance without a date is not a fact.

## Posted is not the same as entered

The single most expensive assumption I have seen is that a document exists means a
document counts.

In 1C a document can be entered, saved, unposted, reposted, or marked for deletion, and
several of those states leave rows visible to a naive query. Marked for deletion is
especially dangerous, because the row is still there and looks complete. If your extract
does not filter on posting state, your numbers will drift upward from the ERP's own
reports, and you will find out when somebody in finance asks why your figure is higher
than theirs.

Get the posting flags right before you get anything else right. A slow correct extract
beats a fast one you have to apologise for.

## Copy first, understand later

I do not transform inside 1C, and I try not to transform on the way out.

The extract lands in SQL Server in a staging schema, shaped as close to the source as is
practical, with a column recording when it was pulled. Every interpretation — what counts
as revenue, which document types are sales, how refunds net off — happens in views on top
of that staging layer.

The reason is simple: my understanding of the ERP is wrong in ways I do not know yet.
When I discover that a document type I ignored actually matters, I want to fix a view and
re-run it over data I already have. If I had filtered that document type out at the
extract, the data would be gone and I would be waiting on another export.

Storage is cheap. Re-extraction is expensive, and re-extraction of history that has since
been edited is sometimes impossible.

## Reconcile against something a human already trusts

The last step is the one that decides whether anyone uses what you built.

Pick a report the business already runs inside 1C and already believes — usually
something finance prints monthly. Reproduce it from your extract and match it to the
figure, for several periods, before you build anything else on top.

When it does not match, the gap is a specification. Chasing it teaches you the document
type you missed, or the posting-state filter you got wrong, or the fact that one branch
enters returns differently. Each of those is knowledge you cannot get by reading the
schema, and none of it would have surfaced from a query that merely ran without error.

Matching that report is also the only argument that works. Nobody is persuaded by a
description of your pipeline. They are persuaded when your number equals the number they
already trust, three months running.
