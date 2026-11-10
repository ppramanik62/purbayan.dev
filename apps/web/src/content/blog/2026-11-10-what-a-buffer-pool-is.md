---
title: "What a Buffer Pool Is ??"
tags: ["databases", "storage", "onyxdb"]
summary: "Why databases manage their own page cache instead of trusting the OS, what's inside it, and how I built one for onyxdb."
readingTime: "10 min read"
series: "Buffer Managers 101"
part: 1
---

These are my notes on buffer managers: what I understood from reading about them, and from building one (`bufpool`) for [onyxdb](https://github.com/ppramanik62/onyxdb), the small SQL database I'm writing to learn how databases work inside. I'm still learning this myself, so this is the version that made sense to me, written for someone at the same stage.

It's in three parts:

1. **What a buffer pool is** (this one): why databases cache their own pages, and what's inside the cache.
2. **Choosing what to evict** (coming soon): which page to give up when memory is full.
3. **Getting pages to disk safely** (coming soon): when a changed page may be written, and why to be careful about the order.

---

## Why a database needs one ??

A database stores its data in a file, cut into fixed-size **pages**. Everything above (B-trees, tables, the log) thinks in pages: "give me page 42", "I changed page 42".

Reading a page from disk every time would be far too slow, so the database keeps the pages it's using in memory. The **buffer manager** (also called the buffer pool or page cache) is the part that owns that memory. It's a fixed chunk of RAM split into page-sized slots called **frames**, and every page access goes through it.

![The engine asks for page 5. RAM holds a few frames, some dirty; a miss reads the page in from disk, and dirty pages are written back.](/blog/what-a-buffer-pool-is/ram-and-disk.svg)

When someone asks for a page, one of three things happens:

- **Hit:** the page is already in a frame, so it's handed back with no disk access.
- **Miss with a free frame:** the page is read from disk into it.
- **Miss with no free frame:** some page has to be thrown out (**evicted**). If it was changed in memory (**dirty**), it's written to disk first, and then its frame is reused.

The data is almost always much bigger than the pool, so it fills up quickly, and after that nearly every miss means evicting something.

Now the whole topic comes down to two questions:

1. **Which page do I give up** when I need room? That's the eviction policy (Part 2).
2. **When is a changed page allowed to reach disk?** That's about crash safety and the log (Part 3).

Get the first wrong and the database is slow. Get the second wrong and it loses data.

All of this assumes changes only flow one way, from memory to disk. Nothing else is allowed to change the file behind the pool's back. If something did, the copies in memory would silently go stale.

### Three copies of a page

At any moment a page can exist in three places:

- the **data file** is behind: it holds older versions of pages
- the **log** is ahead: it holds changes that may not be in the file yet
- the **buffer pool** is the present: the current version of every page in memory

Crash recovery works because there are fixed rules about the order in which things move between these three. Part 3 goes through those rules.

---

## Why not just let the OS cache pages ??

The OS already caches file pages, and `mmap` lets you treat a whole file as memory. Why build all this?

The answer I got from the mmap paper (Crotty, Leis, Pavlo) and from Petrov: **control**. Speed matters too, but control is the main reason.

|                              | OS cache / mmap                                                                    | Own buffer pool                     |
| ---------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------- |
| what stays in memory         | the OS decides                                                                     | the database decides                |
| when a dirty page is written | whenever the OS wants                                                              | only when the database writes it    |
| where code can block on I/O  | any memory access can page-fault                                                   | only when fetching a page           |
| a failed read                | a signal, in the middle of unrelated code                                          | an error for that page              |
| checksums                    | the OS can drop and reload a page silently, so you'd have to check on every access | check once, when the page is loaded |

The second row settles it. Recovery depends on the **write-ahead rule**: a changed page may only reach disk after the log record describing the change is already on disk. With mmap, the OS can write a dirty page whenever it likes, so the rule can't be kept. After a crash, the file might hold a change the log has no record of.

The paper also shows the performance side: page faults, one kernel thread doing eviction, TLB shootdowns when pages are unmapped. Several databases started on mmap and later moved off it. A well-known example: **MongoDB**.

Most databases go the other way and use direct I/O (`O_DIRECT`): skip the kernel's cache and manage their own buffers.

---

## What's inside

### Frames

A frame holds a page's bytes, plus some bookkeeping that never goes to disk:

- **page number:** which page is in this frame right now
- **pin count:** how many users have the page right now. Above zero, it can't be evicted
- **dirty flag:** whether the bytes differ from what's on disk
- **latch:** a reader-writer lock on the bytes
- **policy data:** whatever the eviction policy keeps per frame (a counter, some timestamps)

![Disk pages sit in order; frames hold whichever pages landed in them. One frame holds page 4: its bytes (kind and flags, LSN, cells, checksum) go to disk; the bookkeeping beside them (pins 2, dirty yes, latch exclusive, policy counter 3) stays only in memory.](/blog/what-a-buffer-pool-is/frame.svg)

The **LSN** (log sequence number) inside the page is the position in the log of the last change made to this page. The buffer manager reads it to enforce the write-ahead rule.

Pages go into whatever frame is free, so page 5 can be in frame 0 and page 2 in frame 1. The order on disk and the order in memory have nothing to do with each other. The only way to find a page is the page table.

### The Page Table

The **page table** maps page numbers to frames. Every fetch starts with a lookup here. It's just a hash table, but a buffer pool uses it in a slightly unusual way:

- it never holds more entries than there are frames, so it never has to grow
- every eviction is a delete, so deletes happen all the time

I built mine with **open addressing and linear probing**. The table is one flat array of slots: no linked lists, and no memory allocated after startup. Each slot is either empty or holds one entry, a page number and the frame it's in.

**How the home slot is picked.** Every page number has one slot it would like to be in, its **home slot**. To find it, divide the page number by the number of slots and keep the remainder (`page mod slots`). With 4 slots:

```
 page 1:  1 mod 4 = 1   ->  home slot 1
 page 2:  2 mod 4 = 2   ->  home slot 2
 page 5:  5 mod 4 = 1   ->  home slot 1   (5 = 4 + 1)
 page 9:  9 mod 4 = 1   ->  home slot 1   (9 = 8 + 1)
```

The remainder is always between 0 and 3, so every page number gets a slot. But different pages can get the same one, like 1, 5 and 9 here. That's a **collision**, which is handled by linear probing:

- **insert:** go to the home slot. If it's taken, step to the next slot, and keep stepping until you find an empty one. After the last slot, wrap around to slot 0.
- **lookup:** start at the home slot and walk forward the same way. Stop when you find the page, or when you reach an empty slot.

My table keeps the number of slots a power of two, so `mod` is just keeping the low bits of the page number, which is about as cheap as an operation gets.

![Three inserts into a 4-slot table. Page 1 goes to its home slot 1. Page 5 also has home slot 1, finds it taken, and moves forward to slot 2. Page 2 has home slot 2, finds page 5 there, and moves forward to slot 3.](/blog/what-a-buffer-pool-is/page-table.svg)

Entries that sit next to each other with no empty slot in between form a **run**, and a lookup may have to walk through a whole run.

Two lookups on that table:

```
 lookup page 2   home 2:  slot 2 = page 5, no  ->  slot 3 = page 2, yes
                                               ->  frame 2

 lookup page 9   home 1:  slot 1 = page 1, no  ->  slot 2 = page 5, no
                                               ->  slot 3 = page 2, no
                                 (wrap around) ->  slot 0 = empty
                                               ->  not in the pool
```

A real table is much bigger than 4 slots. Since mine never grows, I gave it about twice as many slots as there are frames. It's never more than half full, so runs stay short, usually one or two slots.

**Now the tricky part: deletion.** You can't just empty a slot. Take the table above and remove page 1 by emptying slot 1. Now a lookup for page 5 starts at its home, slot 1, finds it empty, and says "not here", even though page 5 is sitting in slot 2.

There are two ways around this:

- **Tombstones:** mark the slot "deleted" instead of empty. Lookups walk past it, and inserts can reuse it. This is what most textbooks show (CMU does too). The problem is that tombstones pile up, and with a delete on every eviction and no resizing, they'd never go away.
- **Shift back:** empty the slot, then walk forward through the rest of the run and pull entries back into the hole, so the run has no gap.

Shift back, removing page 1 from the same table:

![Removing page 1 leaves a hole in slot 1. Page 5 in slot 2 has home 1, at or before the hole, so it moves back into slot 1. Page 2 in slot 3 has home 2, so it moves back into slot 2. Slot 0 is empty, so the run is over and the last hole, slot 3, stays empty.](/blog/what-a-buffer-pool-is/shift-back.svg)

The rule for each entry is one question: **is its home slot at or before the hole?** If yes, it moves back into the hole. If no, it stays, because moving it would put it before its home, where its lookups never start.

I went with shift back. Tbh, it was the fiddliest code in the whole pool :)

---

## Pins and Latches

When the pool hands out a page, there are two separate questions:

1. **Can this page be evicted while I'm using it?** No, because it's **pinned**.
2. **Can its bytes change while I'm reading them?** No, because I hold its **latch**.

|                      | Pin                                         | Latch                       |
| -------------------- | ------------------------------------------- | --------------------------- |
| protects against     | the frame being reused for a different page | the bytes changing under me |
| what it is           | a counter                                   | a reader-writer lock        |
| how many can hold it | any number                                  | many readers, or one writer |
| while I hold it      | the page stays in memory                    | the bytes stay the same     |

It kind of seems like they can replace each other. But they can't. A pin alone keeps the page in memory, but another thread could still be halfway through changing it. A latch alone keeps the bytes still, but says nothing about the frame being reused after you let go.

In my pool the caller gets both together as a **guard**, either a read guard or a write guard. Dropping the guard releases the **latch first, then the pin**. Why the order ??

- A latch is only ever held inside a guard, and every guard holds a pin. So an unpinned frame's latch is always free. The evictor can take it without waiting.
- A thread waiting for a latch already holds the pin, so the page can't be evicted while it waits.

### When does a page become dirty ??

The pool has to know which pages are dirty, because a dirty page must be written back before it's evicted, or the change is lost. There are three moments it could set the flag:

- **when the caller says so,** with something like `mark_dirty()` after changing the page. Easy to forget, and a forgotten call means a change silently lost on eviction.
- **when the guard is dropped,** if the bytes changed. The pool would have to find out, by comparing against a copy or tracking every write. Extra work on every drop.
- **when the write guard is taken.** Asking for a write guard already means "I'm going to change this page", so mark it dirty right then.

I prefer the last one. The cost: if someone takes a write guard and then changes nothing (say they check something and decide not to update), the page still gets written back later, even though the disk copy was already the same. That's one wasted write. In return, dropping a guard is purely mechanical: release the latch, then unpin. It never has to decide whether the page changed.

### Latches aren't locks

|           | Latch                                           | Lock                                        |
| --------- | ----------------------------------------------- | ------------------------------------------- |
| protects  | in-memory things: page bytes, the page table    | logical things: a row, a key range, a table |
| held for  | a few instructions                              | a whole transaction                         |
| held by   | a thread                                        | a transaction                               |
| deadlocks | avoided by always taking them in the same order | detected, and then a transaction is aborted |

The buffer manager only uses latches. Locks belong to transactions, which sit higher up and come later.

### What can be evicted

| Pinned? | Dirty? | Evict?                        |
| ------- | ------ | ----------------------------- |
| no      | no     | yes, right away               |
| no      | yes    | yes, after writing it to disk |
| yes     | either | no                            |

**A pin can't be overruled.** The eviction policy can't, a flush can't, and a thread that badly needs a frame can't either.

In my implementation, the eviction policy never sees pins at all. The pool only offers it unpinned frames to choose from. So a bug in the policy can make the pool slower, but it can't throw out a page someone is using.

### When every frame is pinned

Then there's nothing to evict. You could wait for someone to unpin, but the thread that would unpin might be the one waiting, which is a deadlock. So my fetch returns an error instead (CMU's version calls it "out of memory").

That means a caller can never hold more pages at once than there are frames, so the pool has to be sized for the biggest batch anyone holds. There's another catch: holding a read guard on a page and then asking for a write guard on the same page means waiting on yourself.

### What the B-tree gives away

A B-tree is narrow at the top and wide at the bottom, and almost every lookup goes through the root and the levels under it. Those pages are in the cache. If they stay in memory, a lookup only goes to disk for the lower levels.

The shape of the tree itself tells you what to keep in cache.

---

## What I read for this part

- [**Database Internals**, chapter 5](https://www.oreilly.com/library/view/database-internals/9781492040330/) (Alex Petrov): buffer management and pinning. Where most of my vocabulary came from.
- **CMU 15-445, Spring 2026:** the [memory management](https://15445.courses.cs.cmu.edu/spring2026/notes/04-bufferpool.pdf) and [hash table](https://15445.courses.cs.cmu.edu/spring2026/notes/07-hashtables.pdf) lecture notes. Frames, the page table, pins, latches vs locks.
- [**Are You Sure You Want to Use MMAP in Your DBMS?**](https://db.cs.cmu.edu/papers/2022/cidr2022-p13-crotty.pdf) (Crotty, Leis, Pavlo, CIDR 2022): why databases manage their own pages.
- [**The Internals of PostgreSQL**, chapter 8](https://www.interdb.jp/pg/pgsql08.html) (Hironobu Suzuki): how a real buffer manager is put together.
