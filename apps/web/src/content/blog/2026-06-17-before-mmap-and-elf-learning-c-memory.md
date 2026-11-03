---
title: "Before mmap and ELF: learning C memory by building tiny utilities"
tags: ["c", "memory", "systems", "learning"]
summary: "Before jumping into mmap, ELF files, and OS internals, I wanted to know whether I understood how my own C data structures own and grow memory."
readingTime: "6 min read"
---

Low-level programming pulls you toward the dramatic stuff.

ELF files. Assembly. `mmap`. File descriptors. System calls. Debuggers. Memory sanitizers.

All of it is exciting, and I've been trying to slow down and ask a smaller question first. Do I actually understand how my own C data structures own memory?

So I started a small personal C utility library. Nothing fancy. No arena allocator yet, no hash map, no logger. Just tools small enough that I can't hide from the basics.

The first two were a dynamic array and a string builder. Boring on paper. Writing them made C memory a lot less abstract.

## The heap is where growable storage lives

A local variable has a fixed size.

```c
int x;
```

A struct does too.

```c
typedef struct {
    char *data;
    size_t length;
    size_t capacity;
} StringBuilder;
```

That struct will never grow. It's a small control object. The growable part is the memory `data` points at.

```text
StringBuilder
  data --------> heap buffer
```

That distinction mattered more than I expected. A dynamic array isn't magic. A string builder isn't magic. They're small structs that keep track of heap memory.

When it needs more room, it resizes the buffer.

```c
char *new_data = realloc(sb->data, new_capacity);
```

The struct stays the same size. The buffer it points at moves. That's the whole pattern.

## realloc has teeth

The tempting version:

```c
sb->data = realloc(sb->data, new_capacity);
```

Clean, and wrong.

If `realloc` fails it returns `NULL`. Assign that straight into `sb->data` and the original pointer is gone. The old block is still allocated, and now nothing can free it.

So:

```c
char *new_data = realloc(sb->data, new_capacity);

if (new_data == NULL)
    return 0;

sb->data = new_data;
```

A small detail that changed how I read C. Every memory operation is also an ownership transition, and the question to ask each time is what happens on failure. Do I still own the old block? Can I still free it? Did I just drop the only pointer to it?

One temporary variable carries all of that.

## A string builder has one rule

A dynamic array can hold arbitrary bytes. A string builder owes you something extra: it has to stay a valid C string.

After every append, this has to hold.

```c
sb->data[sb->length] = '\0';
```

The null terminator isn't decoration. It's how every C string function knows where to stop.

Forget it and the buffer still holds your characters, but handing it to `printf` or `strlen` is no longer safe.

A C string is characters plus a stopping rule. A string builder is a growable buffer that re-establishes that rule after every change.

## APIs decide who owns what

My dynamic array's API:

```c
DynArray *da_create(size_t item_size);
void da_free(DynArray *array);
```

`da_create` allocates the `DynArray` struct itself. The caller gets a pointer and later hands it back to `da_free`.

The string builder's is different:

```c
StringBuilder sb_create(void);
void sb_free(StringBuilder *sb);
```

The struct comes back by value.

```c
StringBuilder sb = sb_create();

sb_append(&sb, "hello");
sb_free(&sb);
```

The `StringBuilder` can live on the stack while its `char *data` still points into the heap.

Two structures, two ownership models, and the signatures are the only place either one is written down. When a function returns a pointer, I ask who allocated it and who frees it. When it takes one, I ask whether it borrows, mutates, or takes ownership. C answers neither question for you. The API has to.

## Tests are memory questions written down

The tests are simple. Append a string. Append a character. Clear the builder. Reuse it. Append enough text to force a growth.

Underneath, each one checks a rule.

- Does appending preserve the string?
- Does clearing leave the builder reusable?
- Does growth preserve the old data?
- Does invalid input fail safely?

I'm not proving the code is correct. I'm catching the obvious ways I break ownership, growth, or null termination.

## What I understand better now

Growable data lives behind pointers. `realloc` needs a temporary. A C string is only a string while its terminator is intact. An API picks an ownership model whether or not you thought about it.

None of that is separate from the low-level work I actually want to do. Before `mmap`, file descriptors, binary formats, or a memory debugger make much sense, I need to be comfortable with the smaller memory decisions inside my own code.

So this is where I'm starting. Not a kernel. Not an allocator. A dynamic array, a string builder, and a lot more respect for `malloc`.
