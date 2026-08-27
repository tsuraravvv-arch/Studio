# incoming/

Drop a new expression pack here as `incoming/<pack-name>/manifest.json` plus
its PNGs, then run:

```
npm run import:pack -- <pack-name>
```

(omit `<pack-name>` if there's exactly one pack folder here). Add `--dry-run`
to validate and preview without copying or editing anything.

The script validates the manifest and PNGs, copies the PNGs into
`public/assets/tsurara/expressions/` and `directions/`, and registers the new
expression in the app's source files. It never overwrites an existing
destination file, and never touches an existing PNG's pixels — copy only.
After a successful import, run `npm run verify:assets:json && npm run check`.

## manifest.json

Only `type: "expression"` (adding a brand-new expression) is supported so far.

```json
{
  "type": "expression",
  "id": "sleepyTalk",
  "label": "眠そう(トーク)",
  "base": {
    "front": "base_front.png",
    "left15": "base_left15.png",
    "right15": "base_right15.png"
  },
  "blink": {
    "front": "blink_front.png",
    "left15": "blink_left15.png",
    "right15": "blink_right15.png"
  },
  "mouthPolicy": "generic"
}
```

- `id`: must match `^[a-z][a-zA-Z0-9]*$` and not already exist.
- `label`: display name shown in the viewer's expression picker.
- `base`: required, all three directions.
- `blink`: optional; each direction within it is independently optional too.
  Directions left out fall back to the shared default blink art at runtime.
  Omit `blink` entirely to disable blinking for this expression.
- `mouthPolicy`: `"generic"` uses the shared mouth-shape overlay for talk
  animation; `"disabled"` opts the expression out of it (e.g. its base art
  already has a fixed mouth).
- Filenames are plain `*.png` basenames (no paths) resolved relative to the
  pack folder, and every referenced PNG must be exactly 1086x1448.
