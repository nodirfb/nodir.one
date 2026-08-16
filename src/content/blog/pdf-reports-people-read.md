---
# pubDate and readingMinutes are deliberately absent until this post is dated.
# A placeholder date ships a fabricated timeline. `order` drives the index.
title: Generating PDF reports in Python that people will actually read
description: Layout decisions in ReportLab that determine whether a report gets opened twice.
order: 3
---

A generated report competes with every other document in an inbox, and it loses by
default, because it looks generated.

Most of what makes a report readable is decided before any data is fetched: what goes on
the first page, what is allowed to break across a page, and what the reader is supposed to
do after reading it. None of that is a ReportLab question. But ReportLab is where the
decisions become real, so it is worth saying how they land in code.

## Decide who is reading, and how long they have

The reports I generate go to two kinds of reader. A branch manager who is in the document
because something concerns them, and a director who will look at it for about fifteen
seconds unless something is wrong.

Those two readers want opposite documents. The manager wants every line item. The
director wants to know whether to open it at all.

So the first page is written for the director and the rest is written for the manager. The
first page carries the period, the scope, the score or headline outcome, and the two or
three things that changed. If the director reads only that page, they have not missed
anything they would have acted on. Everything else is the evidence, and it is allowed to
be long.

This is the decision that matters most, and it costs nothing technically. It is just
knowing which page is which.

## Use the flowable model instead of drawing

ReportLab gives you two ways to work. You can draw onto a canvas at coordinates, or you
can build a list of flowables and let a document template lay them out.

Coordinates are tempting because the first version looks right. Then a branch name runs
long, or a table gains four rows, and text lands on top of other text. Every layout bug I
have had to fix at short notice came from something absolutely positioned.

Build flowables. `Paragraph`, `Table`, `Spacer`, `KeepTogether`. Let the frame decide
where the page breaks. You give up precise control over exactly where things sit and you
get a document that cannot overlap itself, which is a good trade for anything generated
from variable data.

Keep the canvas for two jobs: the page furniture that must appear on every page — header,
page number, a generated-on timestamp — and anything that has to sit at a fixed position
regardless of content. Do that in `onPage` callbacks on the template, not inline.

## Tables are where reports become unreadable

A table with a border on every cell is a spreadsheet, and people read spreadsheets by
hunting. A table with horizontal separation only, generous cell padding, and numbers
right-aligned is read in rows, which is how the reader is thinking.

Three rules I do not break. Numbers right-align, always, so digits line up in a column and
the eye can compare magnitudes without reading. Units go in the header, not repeated in
every cell. And the column that identifies the row is left-aligned and is the only text
column that is allowed to be wide.

Set `repeatRows=1` so the header reappears after a page break. A table that continues onto
page four with no header is a table nobody reads to the end.

For long tables, banding beats gridlines — a very light fill on alternate rows, subtle
enough that you notice it only if you look for it. Gridlines add ink everywhere. Banding
adds it in a way that guides the row.

## Say what changed, not just what is

A report that states values is a record. A report that states differences is useful.

Wherever there is a previous period, print the comparison next to the value, and print it
in words the reader does not have to compute — the change, the direction, and the period
it is measured against. The alternative is that every reader does the subtraction in their
head, and half of them do it against the wrong baseline.

This is also where restraint pays. If everything is highlighted, nothing is. I mark the
lines that crossed a threshold somebody agreed on beforehand, and leave the rest plain.

## Make the document explain its own provenance

Every report I generate carries, in small type at the bottom of the first page: what
period it covers, when it was generated, and what it was generated from.

This sounds like a footnote and it is the reason the reports get trusted. When somebody
says the number looks wrong, that line answers the first three questions before anyone
opens a database — whether they are looking at an old copy, whether the source had
finished loading, and what window it covers.

## Render it and look at it

Print one. On paper if the report will ever be printed, on a phone screen if it will be
forwarded, which it will.

You will find things no test catches. A column that wraps to two lines only when a branch
has a long name. A page break that separates a heading from the table it introduces — use
`KeepTogether` for that pair, always. A footer that collides with the last row.

The gap between a report that works and a report people read is mostly these small
physical facts, and the only way to find them is to look at the artefact rather than the
code that produced it.
