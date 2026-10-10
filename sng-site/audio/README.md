# Audio

Put mp3 files here. The build copies this folder into `dist/audio/` untouched.

Reference a file from `content/works.json`:

```json
"audio": [
  { "file": "/audio/daiva-dasakam-choir.mp3",
    "label": "Choir, 2026",
    "credit": "Sung by <names>, recorded at <place>, 2026. CC BY-SA 4.0." }
]
```

## The rights question

This is the hard part of the project, and it is worth being clear about it.

Sree Narayana Guru died in September 1928. Under the Indian Copyright Act the
term for a literary work runs sixty years from the beginning of the year after
the author's death, so **his verses have been in the public domain in India
since 1 January 1989**. You can publish the texts freely.

**A recording is a separate work with its own copyright**, held by whoever made
it. That is true however old the underlying verse is. So nearly every recording
you can find online — on YouTube, on devotional music sites, on any album — is
still protected, and copying it here would be infringement. Age is not a defence
and neither is the fact that the words are ancient.

Three legitimate routes:

**Commission new recordings.** The cleanest option and the only one that scales
to sixty works. Ask choirs, schools or individual singers to chant, and have them
sign a short release putting the recording under a licence you choose (CC BY-SA
4.0 works well: anyone may use it, and derivatives stay open). Budget for this.

**Ask for permission.** Write to the Sivagiri Mutt, the Narayana Gurukula, SNDP
institutions and music publishers. Some will say yes for a non-commercial
educational site. Keep every permission in writing and record its terms in the
`credit` field.

**Check the archives.** Some early material may be out of copyright, but each
item must be checked individually. For sound recordings in India the term runs
sixty years from publication, so anything published before roughly 1966 is worth
investigating — with evidence, not assumption.

## Recording guidance for contributors

- A quiet room and a phone held still is enough. Avoid rooms with a hard floor
  and bare walls, which echo.
- One take per work if possible. Say the work's name at the start.
- Send the original file, not a WhatsApp copy, which is heavily compressed.
- Record who sang, where, and in which month and year.
- Get written confirmation that it may be published under an open licence.

## File naming

`<work-id>-<description>.mp3`, for example `daiva-dasakam-choir.mp3` or
`atmopadesa-satakam-slow.mp3`. The work id is the `id` field in `works.json`.

Keep files under about 10 MB. For long works, 96 kbps mono is plenty for
chanting and loads quickly on a slow connection.
