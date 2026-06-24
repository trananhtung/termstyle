# termstyle

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

CSS-like declarative terminal styling: colors, borders, padding, alignment. Zero dependencies, MIT license.

[![npm](https://img.shields.io/npm/v/termstyle)](https://www.npmjs.com/package/termstyle)
[![npm downloads](https://img.shields.io/npm/dw/termstyle)](https://www.npmjs.com/package/termstyle)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Why termstyle?

| Project | Problem |
|---------|---------|
| Go's [lipgloss](https://github.com/charmbracelet/lipgloss) (11k★) | Only for Go |
| `@charmland/lipgloss` (official JS port) | 15 downloads/week, beta, blocked on Charm infra |
| `chalk`, `kleur`, `ansi-colors` | Colors only — no layout, no borders, no alignment |
| `termstyle` | Full CSS-like layout in pure TypeScript, zero deps |

## Install

```bash
npm install termstyle
```

## Quick start

```ts
import { style } from "termstyle";

console.log(
  style()
    .bold()
    .fg("green")
    .border("rounded")
    .padding(0, 2)
    .render("Hello, World!")
);
// ╭─────────────────╮
// │ Hello, World!   │
// ╰─────────────────╯
```

## Styles are immutable — chain to compose

```ts
const header = style().bold().fg("white").bg("blue").padding(0, 1);
const error  = style().bold().fg("red").border("rounded");

console.log(header.render("Welcome"));
console.log(error.render("Something went wrong"));
```

## Colors

```ts
// Named colors (standard 16)
style().fg("red")           // black red green yellow blue magenta cyan white
style().fg("brightGreen")   // bright variants too

// Hex colors
style().fg("#ff6600")
style().fg("#f60")           // shorthand 3-digit

// rgb() syntax
style().fg("rgb(255, 102, 0)")

// 256-color index (terminal-dependent)
style().fg(196)

// Background color
style().bg("#1a1a2e").fg("brightWhite")
```

## Text decorations

```ts
style().bold()
style().italic()
style().underline()
style().strikethrough()
style().dim()
style().blink()
```

## Borders

```ts
// 5 built-in border styles
style().border("none")     // (default)
style().border("normal")   // ┌─┐ │ │ └─┘
style().border("rounded")  // ╭─╮ │ │ ╰─╯
style().border("double")   // ╔═╗ ║ ║ ╚═╝
style().border("heavy")    // ┏━┓ ┃ ┃ ┗━┛
style().border("ascii")    // +-+ | | +-+

// Colored border
style().border("rounded", "cyan")
style().border("heavy", "#ff6600")
```

## Padding

```ts
style().padding(1)          // all sides
style().padding(1, 2)       // vertical, horizontal
style().padding(1, 2, 3, 4) // top, right, bottom, left
style().paddingX(2)         // left + right
style().paddingY(1)         // top + bottom
```

## Margin

```ts
style().margin(1)           // all sides
style().margin(0, 2)        // vertical, horizontal
style().margin(1, 2, 3, 4)  // top, right, bottom, left
style().marginX(2)
style().marginY(1)
```

## Width and alignment

```ts
style().width(40)            // fixed total width (including padding/border)
style().maxWidth(80)         // cap at max width

style().width(40).align("left")    // default
style().width(40).align("center")
style().width(40).align("right")
```

## Full example: dashboard card

```ts
import { style } from "termstyle";

const title = style().bold().fg("brightWhite").bg("#2d2d2d").padding(0, 1);
const card  = style().border("rounded", "#888").padding(1, 2);
const ok    = style().fg("green").bold();
const warn  = style().fg("yellow");

const content = [
  title.render(" System Status "),
  "",
  `  CPU: ${ok.render("▮▮▮▮▮▮▮▯▯▯")} ${warn.render("62%")}`,
  `  RAM: ${ok.render("▮▮▮▮▮▮▮▮▯▯")} ${warn.render("8.1 / 10 GB")}`,
  `  Disk: ${ok.render("▮▮▮▮▯▯▯▯▯▯")} ${ok.render("42%")}`,
].join("\n");

console.log(card.render(content));
```

## API

### `style()` → `Style`

Creates a new Style builder. All methods return a new `Style` instance (immutable).

| Method | Description |
|--------|-------------|
| `.bold(v?)` | Bold text (v defaults to true) |
| `.dim(v?)` | Dim/faint text |
| `.italic(v?)` | Italic text |
| `.underline(v?)` | Underline |
| `.strikethrough(v?)` | Strikethrough |
| `.blink(v?)` | Blinking |
| `.fg(color)` | Foreground color |
| `.bg(color)` | Background color |
| `.padding(top, right?, bottom?, left?)` | Inner spacing |
| `.paddingX(n)` | Left + right padding |
| `.paddingY(n)` | Top + bottom padding |
| `.margin(top, right?, bottom?, left?)` | Outer spacing |
| `.marginX(n)` | Left + right margin |
| `.marginY(n)` | Top + bottom margin |
| `.width(n)` | Fixed total width |
| `.maxWidth(n)` | Maximum total width |
| `.align(a)` | `"left"` &#124; `"center"` &#124; `"right"` |
| `.border(style, color?)` | Border style + optional color |
| `.render(text)` | Apply style and return string |

### `Color` type

```ts
type Color =
  | "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white"
  | "brightBlack" | "brightRed" | "brightGreen" | "brightYellow"
  | "brightBlue" | "brightMagenta" | "brightCyan" | "brightWhite"
  | `#${string}`        // hex: #rgb or #rrggbb
  | `rgb(${string})`    // rgb(r, g, b)
  | number;             // 256-color terminal index
```

### `BorderStyle` type

```ts
type BorderStyle = "none" | "normal" | "rounded" | "double" | "heavy" | "ascii";
```

### Utility exports

```ts
import { stripAnsi, visibleWidth, BORDERS } from "termstyle";

stripAnsi("\x1b[31mhello\x1b[0m"); // "hello"
visibleWidth("你好");               // 4 (CJK = 2 columns each)
BORDERS.rounded.topLeft;            // "╭"
```

## CJK and Unicode

`visibleWidth` correctly measures CJK double-width characters and emoji, so borders and alignment work with non-ASCII content:

```ts
style().border("rounded").align("center").width(10).render("你好");
// ╭────────╮
// │  你好  │
// ╰────────╯
```

## Contributors ✨

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome — code, docs, bug reports, ideas, reviews! See the [emoji key](https://allcontributors.org/docs/en/emoji-key) for how each contribution is recognized, and open a PR or issue to get involved.

Thanks goes to these wonderful people:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/trananhtung"><img src="https://avatars.githubusercontent.com/u/30992229?v=4?s=100" width="100px;" alt="Tung Tran"/><br /><sub><b>Tung Tran</b></sub></a><br /><a href="https://github.com/trananhtung/termstyle/commits?author=trananhtung" title="Code">💻</a> <a href="#maintenance-trananhtung" title="Maintenance">🚧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

MIT
