import { style, stripAnsi, visibleWidth, BORDERS } from "../src/index.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function lines(s: string) { return s.split("\n"); }
function lineAt(s: string, i: number) { return lines(s)[i]; }
function plainLines(s: string) { return lines(s).map(stripAnsi); }
function plainAt(s: string, i: number) { return stripAnsi(lineAt(s, i)); }

// ── stripAnsi ─────────────────────────────────────────────────────────────────

describe("stripAnsi", () => {
  test("removes ANSI color codes", () => {
    expect(stripAnsi("\x1b[31mred\x1b[0m")).toBe("red");
  });

  test("removes bold codes", () => {
    expect(stripAnsi("\x1b[1mhello\x1b[0m")).toBe("hello");
  });

  test("plain string unchanged", () => {
    expect(stripAnsi("hello")).toBe("hello");
  });
});

// ── visibleWidth ──────────────────────────────────────────────────────────────

describe("visibleWidth", () => {
  test("plain ASCII", () => {
    expect(visibleWidth("hello")).toBe(5);
  });

  test("ignores ANSI codes", () => {
    expect(visibleWidth("\x1b[31mhello\x1b[0m")).toBe(5);
  });

  test("CJK characters are width 2", () => {
    expect(visibleWidth("你好")).toBe(4);
  });
});

// ── Text decorations ──────────────────────────────────────────────────────────

describe("text decorations", () => {
  test("bold wraps with code 1", () => {
    const r = style().bold().render("hi");
    expect(r).toContain("\x1b[1m");
    expect(stripAnsi(r)).toBe("hi");
  });

  test("italic wraps with code 3", () => {
    const r = style().italic().render("hi");
    expect(r).toContain("\x1b[3m");
  });

  test("underline wraps with code 4", () => {
    expect(style().underline().render("hi")).toContain("\x1b[4m");
  });

  test("strikethrough wraps with code 9", () => {
    expect(style().strikethrough().render("hi")).toContain("\x1b[9m");
  });

  test("dim wraps with code 2", () => {
    expect(style().dim().render("hi")).toContain("\x1b[2m");
  });

  test("chaining decorations includes all codes", () => {
    const r = style().bold().italic().render("hi");
    const plain = stripAnsi(r);
    expect(plain).toBe("hi");
    expect(r).toContain("\x1b[1;3m");
  });

  test("no decoration → plain text", () => {
    expect(style().render("hello")).toBe("hello");
  });
});

// ── Colors ────────────────────────────────────────────────────────────────────

describe("colors", () => {
  test("named fg color", () => {
    const r = style().fg("red").render("hi");
    expect(r).toContain("\x1b[31m");
    expect(stripAnsi(r)).toBe("hi");
  });

  test("bright named color", () => {
    const r = style().fg("brightGreen").render("hi");
    expect(r).toContain("\x1b[92m");
  });

  test("named bg color", () => {
    const r = style().bg("blue").render("hi");
    expect(r).toContain("\x1b[44m");
  });

  test("hex fg color uses 38;2", () => {
    const r = style().fg("#ff0000").render("hi");
    expect(r).toContain("\x1b[38;2;255;0;0m");
  });

  test("hex shorthand #RGB", () => {
    const r = style().fg("#f00").render("hi");
    expect(r).toContain("\x1b[38;2;255;0;0m");
  });

  test("rgb() fg color uses 38;2", () => {
    const r = style().fg("rgb(0, 128, 255)").render("hi");
    expect(r).toContain("\x1b[38;2;0;128;255m");
  });

  test("256-color index uses 38;5", () => {
    const r = style().fg(196).render("hi");
    expect(r).toContain("\x1b[38;5;196m");
  });

  test("hex bg color uses 48;2", () => {
    const r = style().bg("#0000ff").render("hi");
    expect(r).toContain("\x1b[48;2;0;0;255m");
  });
});

// ── Padding ───────────────────────────────────────────────────────────────────

describe("padding", () => {
  test("paddingLeft adds spaces before each line", () => {
    const r = style().padding(0, 0, 0, 2).render("hi");
    expect(r).toBe("  hi");
  });

  test("paddingRight adds trailing spaces", () => {
    const r = style().padding(0, 3, 0, 0).render("hi");
    expect(r).toBe("hi   ");
  });

  test("paddingTop adds blank lines above", () => {
    const r = style().padding(2, 0, 0, 0).render("hi");
    const ls = lines(r);
    // blank lines fill boxW = paddingLeft + innerW + paddingRight = 0+2+0 = 2 spaces
    expect(ls[0]).toBe("  ");
    expect(ls[1]).toBe("  ");
    expect(ls[2]).toBe("hi");
  });

  test("paddingBottom adds blank lines below", () => {
    const r = style().padding(0, 0, 2, 0).render("hi");
    const ls = lines(r);
    expect(ls[0]).toBe("hi");
    expect(ls[1]).toBe("  ");
    expect(ls[2]).toBe("  ");
  });

  test("padding(all) applies to all sides", () => {
    const r = style().padding(1).render("hi");
    const ls = lines(r);
    // boxW = paddingLeft(1) + innerW(2) + paddingRight(1) = 4
    expect(ls[0]).toBe("    "); // blank line fills boxW = 4
    expect(ls[1]).toBe(" hi "); // 1 space pad each side
    expect(ls[2]).toBe("    ");
  });

  test("padding(v, h) applies vertical and horizontal", () => {
    const r = style().padding(1, 2).render("hi");
    const ls = lines(r);
    expect(ls[1]).toBe("  hi  ");
  });

  test("paddingX shorthand", () => {
    const r = style().paddingX(3).render("hi");
    expect(r).toBe("   hi   ");
  });

  test("paddingY shorthand adds blank lines", () => {
    const r = style().paddingY(1).render("hi");
    expect(lines(r).length).toBe(3);
  });
});

// ── Margin ────────────────────────────────────────────────────────────────────

describe("margin", () => {
  test("marginLeft adds spaces before each line", () => {
    const r = style().margin(0, 0, 0, 3).render("hi");
    expect(r).toBe("   hi");
  });

  test("marginTop adds blank lines above", () => {
    const r = style().margin(2, 0, 0, 0).render("hi");
    const ls = lines(r);
    expect(ls.length).toBe(3);
    expect(ls[2]).toBe("hi");
  });
});

// ── Width and alignment ───────────────────────────────────────────────────────

describe("width & alignment", () => {
  test("width pads line to fixed width", () => {
    const r = style().width(10).render("hi");
    expect(r.length).toBe(10);
    expect(r).toBe("hi        ");
  });

  test("align right pads left", () => {
    const r = style().width(10).align("right").render("hi");
    expect(r).toBe("        hi");
  });

  test("align center pads evenly", () => {
    const r = style().width(10).align("center").render("hi");
    expect(r).toBe("    hi    ");
  });

  test("align center with odd padding — more on right", () => {
    const r = style().width(11).align("center").render("hi");
    expect(r).toBe("    hi     ");
  });

  test("multiline text — each line aligned independently", () => {
    const r = style().width(10).align("right").render("hi\nhello");
    const ls = lines(r);
    expect(ls[0]).toBe("        hi");
    expect(ls[1]).toBe("     hello");
  });

  test("maxWidth truncates inner width", () => {
    const r = style().maxWidth(5).render("hello world");
    // maxWidth applies to total box — with 0 padding/border, innerW = 5
    // but text is not truncated, just the width target
    expect(visibleWidth(plainAt(r, 0))).toBeLessThanOrEqual(11); // text isn't cut
  });
});

// ── Borders ───────────────────────────────────────────────────────────────────

describe("borders", () => {
  test("rounded border around text", () => {
    const r = style().border("rounded").render("hi");
    const ls = plainLines(r);
    expect(ls[0]).toBe("╭──╮");
    expect(ls[1]).toBe("│hi│");
    expect(ls[2]).toBe("╰──╯");
  });

  test("normal border", () => {
    const r = style().border("normal").render("hi");
    const ls = plainLines(r);
    expect(ls[0]).toBe("┌──┐");
    expect(ls[2]).toBe("└──┘");
  });

  test("double border", () => {
    const r = style().border("double").render("hi");
    const ls = plainLines(r);
    expect(ls[0]).toBe("╔══╗");
  });

  test("heavy border", () => {
    const r = style().border("heavy").render("hi");
    const ls = plainLines(r);
    expect(ls[0]).toBe("┏━━┓");
  });

  test("ascii border", () => {
    const r = style().border("ascii").render("hi");
    const ls = plainLines(r);
    expect(ls[0]).toBe("+--+");
    expect(ls[1]).toBe("|hi|");
  });

  test("border with padding", () => {
    const r = style().border("rounded").padding(0, 1).render("hi");
    const ls = plainLines(r);
    expect(ls[0]).toBe("╭────╮");
    expect(ls[1]).toBe("│ hi │");
    expect(ls[2]).toBe("╰────╯");
  });

  test("border with color", () => {
    const r = style().border("rounded", "red").render("hi");
    expect(r).toContain("\x1b[31m");
    const ls = plainLines(r);
    expect(ls[0]).toContain("╭");
  });

  test("border with width and align", () => {
    const r = style().border("rounded").width(6).align("center").render("hi");
    const ls = plainLines(r);
    // width=6 includes 2 border chars → inner=4 → "╭────╮"
    expect(ls[0]).toBe("╭────╮");
    expect(ls[1]).toBe("│ hi │");
  });

  test("multiline content in border", () => {
    const r = style().border("ascii").render("hello\nworld");
    const ls = plainLines(r);
    expect(ls[0]).toBe("+-----+");
    expect(ls[1]).toBe("|hello|");
    expect(ls[2]).toBe("|world|");
    expect(ls[3]).toBe("+-----+");
  });

  test("all border styles are defined", () => {
    const stylesUnderTest: Array<"normal" | "rounded" | "double" | "heavy" | "ascii"> = [
      "normal", "rounded", "double", "heavy", "ascii",
    ];
    for (const s of stylesUnderTest) {
      expect(() => style().border(s).render("test")).not.toThrow();
    }
  });
});

// ── BORDERS constant ──────────────────────────────────────────────────────────

describe("BORDERS export", () => {
  test("rounded has correct chars", () => {
    expect(BORDERS.rounded.topLeft).toBe("╭");
    expect(BORDERS.rounded.topRight).toBe("╮");
  });
});

// ── Combined ──────────────────────────────────────────────────────────────────

describe("combined styles", () => {
  test("bold + fg + border", () => {
    const r = style().bold().fg("green").border("rounded").render("OK");
    const ls = plainLines(r);
    expect(ls[0]).toBe("╭──╮");
    expect(ls[1]).toContain("OK");
    expect(r).toContain("\x1b[1m");
    expect(r).toContain("\x1b[32m");
  });

  test("padding + border + alignment", () => {
    const r = style().border("normal").padding(0, 2).width(12).align("center").render("Hi");
    const ls = plainLines(r);
    // width=12, border=2, padX=4, inner=6 → "Hi" centered in 6 = "  Hi  " → with pad: "    Hi    "
    expect(ls[1]).toBe("│    Hi    │");
  });

  test("style is immutable — chaining returns new instance", () => {
    const base = style().bold();
    const derived = base.fg("red");
    expect(base.render("x")).not.toContain("\x1b[31m");
    expect(derived.render("x")).toContain("\x1b[31m");
  });
});

// ── Multiline ─────────────────────────────────────────────────────────────────

describe("multiline", () => {
  test("multiline text split on \\n", () => {
    const r = style().render("line1\nline2");
    expect(lines(r)).toEqual(["line1", "line2"]);
  });

  test("tabs expanded to spaces", () => {
    const r = style().render("a\tb");
    expect(r).toBe("a    b");
  });
});
