---
title: "Reusable Application Questions"
---

# Reusable Application Questions and Answers

Company-neutral answers for job applications. Review the details and adjust the length or
emphasis for each role before using them.

## Tell us about a project where you had to think carefully about how to structure your data. What did you decide and why?

On seroost, a local search engine I built in Rust, I needed queries to avoid scanning every
document. I kept document metadata keyed by ID and built an inverted index mapping each
normalized term to postings containing the document ID and term frequency.

That structure made TF-IDF scoring touch only documents containing the query terms. I
considered storing only a word-frequency map per document, which was simpler, but it would
make every query scan the whole corpus. The inverted index costs extra memory and an indexing
step, but gives much faster lookups and keeps the ranking logic clear.

## Have you used AI tools as part of a development workflow? How, and what did you get out of it?

I use AI tools regularly for exploring unfamiliar APIs, drafting boilerplate and repetitive
refactors, generating edge-case ideas, and challenging an approach before I commit to it.

I keep architecture, security, and complex state decisions under my control: I review every
diff, check primary documentation, run tests and linters, and do not keep code I cannot
explain. In practice, I get a faster feedback loop and spend less time on mechanical work. The
most useful result is a second pair of eyes for alternatives and missed cases, not a
replacement for understanding or debugging the system.

## What is the last piece of code you wrote that you were not happy with? What would you do differently?

My first version of the Markdown rendering pipeline in mdt, my Rust terminal editor, grew into
a flow that mixed parsing, terminal-width layout, text wrapping, and styling. It worked, but
each new Markdown feature increased the coupling and made edge cases harder to test.

I would redesign it as three explicit stages: parse into a small block/span representation,
lay that representation out for the current terminal width, then render styled cells. I would
keep each stage mostly pure and add golden tests for narrow terminals, nested lists, tables,
and blockquotes. That would make correctness easier to reason about before doing any
performance optimization.

## What is something technical you taught yourself recently purely because you were curious?

I recently taught myself how terminal user interfaces actually render while building mdt in
Rust. I explored raw-mode terminal lifecycle, alternate screens, event loops, width-aware
wrapping, incremental redraws, file watching, and syntax highlighting.

I started because I wanted a Markdown viewer and editor that lived entirely in my terminal,
then kept going to understand the machinery beneath TUI libraries. The detail I found most
interesting was that visual width is not the same as byte or character count, especially with
Unicode, and that a polished TUI also has to restore the terminal safely after errors or
panics.

## Do you have a GitHub profile or personal website?

- GitHub: <https://github.com/ppramanik62>
- Website: <https://purbayan.me>

## What are your must-haves and nice-to-haves in a company?

### Must-haves

- Honest, respectful communication and useful code review.
- Ownership of meaningful product problems, with room to ask questions and propose solutions.
- An engineering culture that values reliability, testing, and maintainable code.

### Nice-to-haves

- A collaborative international team with remote-friendly habits.
- Mentorship and regular technical knowledge-sharing.
- Time or support for open-source work and continued learning.
