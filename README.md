# Angelica Dornton — portfolio

The source for [dornton.vercel.app](dornton.vercel.app)
No build step, no dependencies, no framework. Open the files with any static server and they run.

## The terminal

Navigation is a real (if tiny) command layer. `cd` switches sections, `cat` opens a file, and the
sidebar's `$ help` is the hint. Clicking a command runs it, so the site works without typing.

| Command | Does |
| --- | --- |
| `help` | Lists the available commands. |
| `ls [path]` | Lists a directory from the fake filesystem. |
| `cd /projects` | Jumps to a section (`/`, `/projects`, `/about_me.txt`, `/contact.txt`). |
| `cat about_me.txt` | Prints a file to the log and shows its section. |
| `pwd`, `whoami` | Print the working directory / user. |
| `clear` | Empties the log. |
| `clean` | Crossfades into `classic.html`. |
| `fx on\|off` | Toggles the background effects. |

Input is treated as untrusted: it's stripped to a small character set and matched against a fixed
command map, never evaluated.

## Effects

Four layers stack behind the content: a WebGL grain/noise shader, a Three.js grid that bends toward
the cursors, blobtracking, and an ASCII portrait sampled from a
canvas at runtime.

- If the frame rate stays under 28fps for three seconds, all effects switch off and stay off.
- Touch devices skip the 3D grid and run the 2D layers at a reduced frame rate.
- `prefers-reduced-motion` skips the boot sequence and disables the animations.
- `fx off` turns the effects off by hand; `classic.html` is the no-effects build.

## Running it locally

Serve the directory over HTTP, don't open the files directly. The Content Security Policy in
`index.html` allows scripts from `'self'`, and browsers don't treat a `file://` page as `'self'`, so
`app.js` gets blocked.

```bash
npx serve .
# or
python -m http.server 8000
```

Then visit `http://localhost:3000` (serve) or `http://localhost:8000`.

## Deploying

The site is plain static files in the repository root, served by GitHub Pages. Commit the changed
files to the Pages repo and the site updates on the next Pages build — there's nothing to compile.

## Notes

- The page ships a strict CSP: no inline scripts, no third-party analytics, no cookies. The only
  external requests are Google Fonts, Three.js (cdnjs) and devicon icons (jsDelivr); the sticker is
  hosted in `assets/` so it loads under `img-src 'self'`.
- Layout is a single column under 800px, with tap targets sized for touch and a larger command input
  so mobile browsers don't zoom the page on focus.
- Content lives in `index.html`; the same sections exist in `classic.html`, so edit both when
  something changes.

## Contact

- Email: [aj-dornton@proton.me](mailto:aj-dornton@proton.me)
- GitHub: [github.com/eliutot](https://github.com/eliutot)
- Behance: [behance.net/angelicadornton](https://www.behance.net/angelicadornton)
- Figma: [figma.com/@dornton](https://www.figma.com/@dornton)
- Passportdex: [passportdex.com/angelicaa](https://passportdex.com/angelicaa)
