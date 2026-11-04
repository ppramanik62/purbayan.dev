---
title: "When is your data actually saved ??"
tags: ["storage", "fsync", "databases", "systems"]
summary: "A write that returns without an error hasn't necessarily reached the disk. What I learned about write and fsync while building the storage layer of onyxdb."
readingTime: "8 min read"
---

Quick question before we start. You write a few bytes to a file, the call comes back with no error, and a second later the power goes out. Are your bytes still there ??

Not long ago I'd have said yes, obviously, the write worked. I'd have been wrong.

I ran into this while starting [onyxdb](https://github.com/ppramanik62/onyxdb), a database I'm building in Rust to learn how databases work inside. Before that I'd been reading SQLite's file format and writing a small parser for it (which is a lot of fun, you get to open a real database file and find every row by hand), so I figured the database would start there too, with pages. But I wanted to get the fundamentals right this time, and when I went looking for what sits under the pages, this question was waiting for me. So the first thing I built wasn't a page format at all. It was the plain-looking layer that writes bytes to files, and so far it's the one that taught me the most.

Let's start with where your bytes actually go.

![You call write; write returns with the bytes in kernel memory; you call fsync; fsync returns with the bytes on the disk](/blog/when-is-your-data-saved/write-then-fsync.svg)

When you call `write`, they don't go to the disk. They go into the kernel's memory, into something called the _page cache_, and `write` returns the moment they land there. That's why writing feels so fast. The kernel copies them out to the disk later whenever it gets around to it. So if the power goes out in between, they're just gone, and your program never hears about it. It was told the write worked, and it did, in memory.

If you want them on the disk now, you call `fsync`. It waits until the disk has them.

Okay, so that's the simple answer to the quick question: no, not unless you called `fsync`. You might have known that already. I honestly didn't. But it's also the easy part. The questions right after it are where things get weird.

- What's left of a write that was only half done when the power went ??
- Where does a file's name live ??
- And what happens when `fsync` fails ??

## Crashing things on purpose

I could read about all of that, and I did. But the way I learn is to read about something and then build it, and you can't really build your way through crashes by pulling the plug on your laptop. You can't pick the moment, and you can't make the same crash happen twice.

So I wrote a fake file system that lives in memory. Every file operation in onyxdb goes through one interface (SQLite does the same thing with its VFS), so the real database runs on the real disk, and the tests run on the fake one without knowing the difference.

The fake keeps two things for every file: what's been synced, and what's only been written. When I tell it to crash, it keeps everything that was synced. For everything else it goes piece by piece and decides whether to keep it, drop it, or keep half. A seed number drives those choices, so the same seed gives the same crash every time. That sounds like a small detail, but it's what makes the whole thing useful. When a crash breaks something, I can run it again and watch it break in exactly the same way, which is about the only way I know to debug a crash.

![Before the crash: synced bytes and three unsynced pieces. The seed picks what happens to each unsynced piece. After the crash: the synced bytes are always kept, piece 1 is kept, piece 2 is lost, and piece 3 is torn, half old and half new](/blog/when-is-your-data-saved/simulated-crash.svg)

Then I can take any bit of code, cut the power after its first change to a file, then after its second, and so on to the end, and look at what's left each time.

## The file that came back as neither

So what does a crash actually do to a file ?? Let's try it on something tiny: a file with a few keys and values, saved the way you'd probably write it without thinking too hard. Open the file, write the new text over the old, set the length, sync.

```rust
let mut file = OpenOptions::new().write(true).open("store")?;
file.write_all(text.as_bytes())?;
file.set_len(text.len() as u64)?;
file.sync_all()?;
```

The file holds `apple=1`. Now we save a new version that changes apple to `5` and adds `banana=2`, and let's have the fake cut the power right after the write, before the sync gets to run. Here's what's in the file afterwards:

```text
apple=5
ban
```

![The last save on the disk is apple=1. The new write, apple=5 and banana=2, is in memory and not synced yet. The power goes off, and the disk holds apple=5 and ban](/blog/when-is-your-data-saved/torn-write.svg)

It's not the old file and it's not the new one. It's a bit of both, cut off in the middle of a word. And nothing about the code looks wrong.

Now, you could say this is fine. The save never returned, so nobody was promised the new version, right ?? Not quite. Somebody was promised the _old_ one. The save before this one did return, and it said `apple=1` was safe on the disk. Now it's gone, overwritten by `apple=5`. By writing over the file, we threw away the only good copy, before the new one was safe.

(This gets worse for a real database, by the way. A database keeps its data in pages of 4 or 8 KiB and overwrites them in place all day long, and each page covers several sectors on the disk. A crash in the middle can leave a page that's half new and half old. That's called a _torn page_, and every database needs some answer for it.)

For a small file like ours, there's a well-known fix: don't write over the only good copy. Write the new version into a separate file, sync it, and rename it over the old one. A rename switches which file a name points to in one step, so anyone who opens `store` gets either the old file or the new one, never a mix of both.

```rust
use std::fs::{self, File};
use std::io::Write;

fn save(text: &str) -> std::io::Result<()> {
    let mut tmp = File::create("store.tmp")?;
    tmp.write_all(text.as_bytes())?;
    tmp.sync_all()?; // the new bytes are on the disk
    fs::rename("store.tmp", "store")?; // the name points to them
    File::open(".")?.sync_all()?; // the rename is on the disk
    Ok(())
}
```

I ran this through the same crash test, and every crash left a whole version of the file.

The last line in the code snippet is another interesting part. Why do I have to sync a directory ??

Because a file's name isn't in the file. It's in the directory, which is really just a small file of its own holding a list of names and what they point to. Creating, renaming or deleting a file changes that list and doesn't touch the file at all. So `fsync` on the file saves the file's bytes and says nothing about its name.

You can imagine the consequences. You told the user "saved", and after a crash `store` still has the old version. With a brand new file it's even worse, because the crash can lose the name completely. The bytes are sitting safely on the disk, but nothing points to them anymore.

Taking out the first sync breaks things a different way. Without it, the rename can reach the disk before the bytes do, so after a crash `store` points to a file that's empty or half written.

![Saving by rename: write store.tmp, sync store.tmp, rename store.tmp to store, sync the directory, saved. Skipping the first sync and then crashing leaves store empty or torn; skipping the directory sync and then crashing leaves store as the old version](/blog/when-is-your-data-saved/save-by-rename.svg)

If that sounds like a mistake only a beginner would make, it isn't. In 2014 a group at the University of Wisconsin crashed well-known programs at every step and checked what was left. LevelDB didn't make sure the directory entries for its table files reached the disk, so a crash could make those files vanish. ZooKeeper had the same gap with its log files, and it could lose data.

## When fsync says no

Okay, the last one.

`fsync` can fail too. The disk hits an error and `fsync` hands it back to you. So what do you do ?? Take a second and think about what you'd write there.

If you said "try again", same here. That's exactly what I'd have done.

On Linux, that retry can lose your data without a word. When `fsync` fails, the kernel marks the pages it couldn't write as _clean_. (The 2020 paper I mention below found that ext4, XFS and Btrfs all do this.) On ext4 and XFS the new bytes are still sitting in memory, so reading the file gives them right back to you, while Btrfs quietly goes back to the old ones. Either way, the kernel has stopped planning to write them anywhere. So the next `fsync` has nothing left to do, and it happily succeeds.

I made my fake disk copy this so I could watch it, which was a strange bit of code to write. I was building a disk that loses your writes on purpose, then tells you everything's fine.

Here's a run: write `100` and sync it, then write `250`, make the next sync fail, and try again.

```text
synced:         100
written:        250
sync:           injected fault: sync error
read again:     250
sync again:     ok
after a crash:  100
```

Read it top to bottom. The read says `250`. The retry says `ok`. From inside the program everything looks perfect, and then the crash shows the disk never got `250` _at all_.

![A failed fsync, step by step. 1: write 250, kernel memory holds 250, the disk holds 100. 2: fsync fails, and the kernel marks the 250 clean anyway. 3: fsync again returns ok, with nothing left to write. 4: the power goes off, kernel memory is empty, and the disk still holds 100](/blog/when-is-your-data-saved/fsync-retry.svg)

This one isn't a beginner's mistake either. PostgreSQL ran into it in 2018. It did exactly what I said I'd do: retry a failed `fsync` and believe the second answer. So it could tell you your data was saved when it never made it to the disk. The fix was to stop retrying: now when `fsync` fails, PostgreSQL shuts itself down and recovers from its log. Then in 2020 a paper at USENIX ATC tested PostgreSQL, LMDB, LevelDB, SQLite and Redis against a failed `fsync`, and none of them handled it safely in every case. These are some of the most careful projects around, so I don't think anyone was being sloppy. The behavior is just strange, and almost nobody expects it.

So in onyxdb, a failed sync never gets retried. Once it fails you don't really know what's on the disk anymore, and the only honest thing left to do is stop and work out the state again from what's actually there.

---

You might have noticed that none of this tells you how a real database saves things. A database can't rename a multi-gigabyte file every time you update a row. It has to write its pages in place, torn pages and all. What it does instead, as far as I understand it so far, is write down what it's about to change in a separate log first, sync that, and only then touch the pages. After a crash it reads the log and repairs whatever got torn. That's the _write-ahead log_, and it's coming later in onyxdb. After all this crashing, I finally see why it has to exist.

There's one thing I still can't figure out, though. My fake disk believes `fsync`: when it says the bytes are safe, they're safe. I've read that some real drives keep writes in a cache of their own and report them as saved before they really are, and my fake can't show that at all. So how does a database protect itself from a disk that says yes too early ?? I honestly don't know yet. If you do, I'd really like to hear about it.

---

## References

- If you want to go deeper, Dan Luu's [Files are hard](https://danluu.com/file-consistency/) is where I'd start. It's short, and it covers a lot more than I did here.
- The two papers I mentioned are [All File Systems Are Not Created Equal](https://www.usenix.org/system/files/conference/osdi14/osdi14-paper-pillai.pdf) (OSDI '14) and [Can Applications Recover from fsync Failures?](https://www.usenix.org/system/files/atc20-rebello.pdf) (ATC '20).
- SQLite's page on [its VFS](https://www.sqlite.org/vfs.html) shows how a real database puts all its file access behind one interface.
- And if you want to crash some files yourself, my fake disk and every example from this post are in [onyxdb's vfs crate](https://github.com/ppramanik62/onyxdb/tree/main/crates/vfs).
