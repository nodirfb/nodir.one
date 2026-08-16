---
# pubDate and readingMinutes are deliberately absent until this post is dated.
# A placeholder date ships a fabricated timeline. `order` drives the index.
title: Why the semantic layer belongs in SQL Server
description: Putting measure definitions in the database instead of the report file, and what that costs.
order: 1
---

The argument for defining measures inside Power BI is that it is faster. It is. You open
the model, write the DAX, and the number appears. Nothing has to be deployed and nobody
else has to agree.

That speed is borrowed against a specific cost: the definition now lives in a file. Not
in a database that several things read, but in a file that one report opens.

## What goes wrong is not what people expect

The failure is rarely a wrong number. It is two right numbers.

A branch manager opens their report and sees revenue for the month. The office opens a
different report and sees revenue for the month. The figures differ by four percent.
Both were built by competent people from the same warehouse. Neither is lying.

The difference turns out to be refunds. One model subtracts them at the point of sale,
the other subtracts them on the date the refund cleared. Both are defensible. Nobody ever
decided which one the company uses, because the decision was never a decision — it was a
line of DAX written on a Tuesday by whoever was building that model.

Once that has happened twice, the meetings change character. People stop discussing the
business and start discussing whose file is correct. That is the real cost, and it does
not show up as a bug.

## Moving the definition down

Putting the semantic layer in SQL Server means the measure is a view or a stored
procedure. Refunds are subtracted in one place, in SQL, and every model that wants
revenue reads that object. The DAX that survives is the DAX that genuinely belongs at the
presentation level — things that depend on what the user has selected, which the database
cannot know.

The test I use is: does this calculation need to know what the reader clicked? Ratios
across a filtered selection do. A running total across a chosen date range does. The
definition of revenue does not. Anything that does not need to know goes down into the
database.

This gives you three things that are hard to get any other way.

The definition is diffable. A change to how revenue is calculated is a change to a file
in source control, with an author and a date, rather than a change inside a binary that
someone uploaded.

The definition is reusable outside the reporting tool. The Python job that renders the
monthly PDF reads the same view as the dashboard. When the two disagree it is a bug, not
a philosophical difference, because there is only one definition and both are reading it.

And the definition is testable. You can write a query that asserts the sum of the parts
equals the whole, and run it on a schedule. You cannot easily assert anything about a
measure that only exists inside a model.

## What it actually costs

I want to be honest about the trade, because the people who resist this are not being
irrational.

Iteration gets slower. Changing a measure stops being a two-minute edit and becomes a
change to a database object, which means a deployment, which means the change is visible
to people who did not ask for it. When someone wants a variant of a metric for one
meeting tomorrow, the correct answer is often to write it in DAX and not promote it. Not
everything deserves to be a company definition.

You also need somewhere to put it. If you have no schema discipline, no naming
convention, and no separation between raw tables and reporting objects, moving the
semantic layer into SQL Server just relocates the mess. The database has to be a place
where a person can find the object that defines revenue without asking you. If it is not
that yet, make it that first.

And it concentrates risk. When the view is wrong, everything is wrong at once. That is
usually better than being quietly wrong in different directions, but it is not free — it
means the view needs tests in a way a single report never did.

## Where I draw the line

Raw tables stay raw. A reporting schema sits on top of them containing views and
procedures that mean something to the business — a row per transaction with refunds
already handled, a row per branch per day. Power BI consumes that schema and adds
measures that depend on selection. Row-level security decides which branch a person sees,
so there is one model rather than one file per branch.

The result is not more elegant. It is more boring. Somebody asks what revenue means and
you send them a view definition instead of an opinion, and the conversation ends there.

That is the whole benefit. The disagreement moves from arithmetic back to the business,
which is where it was useful in the first place.
