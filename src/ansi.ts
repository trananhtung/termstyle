// ── ANSI escape helpers ───────────────────────────────────────────────────────

const ESC = "\x1b[";

export function ansi(...codes: number[]): string {
  return `${ESC}${codes.join(";")}m`;
}

export const RESET = ansi(0);

// ── Named colors (standard 16) ────────────────────────────────────────────────

export type NamedColor =
  | "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white"
  | "brightBlack" | "brightRed" | "brightGreen" | "brightYellow"
  | "brightBlue" | "brightMagenta" | "brightCyan" | "brightWhite";

const FG_CODES: Record<NamedColor, number> = {
  black: 30, red: 31, green: 32, yellow: 33, blue: 34, magenta: 35, cyan: 36, white: 37,
  brightBlack: 90, brightRed: 91, brightGreen: 92, brightYellow: 93,
  brightBlue: 94, brightMagenta: 95, brightCyan: 96, brightWhite: 97,
};

const BG_CODES: Record<NamedColor, number> = {
  black: 40, red: 41, green: 42, yellow: 43, blue: 44, magenta: 45, cyan: 46, white: 47,
  brightBlack: 100, brightRed: 101, brightGreen: 102, brightYellow: 103,
  brightBlue: 104, brightMagenta: 105, brightCyan: 106, brightWhite: 107,
};

// ── Color type ────────────────────────────────────────────────────────────────

export type Color = NamedColor | `#${string}` | `rgb(${string})` | number;

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ];
  }
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function parseRgb(s: string): [number, number, number] {
  const m = s.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (!m) throw new Error(`Invalid rgb color: ${s}`);
  return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
}

export function fgCode(color: Color): string {
  if (typeof color === "number") return ansi(38, 5, color);
  if (color in FG_CODES) return ansi(FG_CODES[color as NamedColor]);
  if ((color as string).startsWith("#")) {
    const [r, g, b] = parseHex(color as string);
    return ansi(38, 2, r, g, b);
  }
  const [r, g, b] = parseRgb(color as string);
  return ansi(38, 2, r, g, b);
}

export function bgCode(color: Color): string {
  if (typeof color === "number") return ansi(48, 5, color);
  if (color in BG_CODES) return ansi(BG_CODES[color as NamedColor]);
  if ((color as string).startsWith("#")) {
    const [r, g, b] = parseHex(color as string);
    return ansi(48, 2, r, g, b);
  }
  const [r, g, b] = parseRgb(color as string);
  return ansi(48, 2, r, g, b);
}

// ── Visual width helpers ──────────────────────────────────────────────────────

// Strip ANSI escape sequences for width measurement
const ANSI_STRIP_RE = /\x1b\[[0-9;]*m/g;

export function stripAnsi(s: string): string {
  return s.replace(ANSI_STRIP_RE, "");
}

// Approximate CJK double-width character detection
function isWide(cp: number): boolean {
  return (
    (cp >= 0x1100 && cp <= 0x115f) ||  // Hangul Jamo
    (cp >= 0x2e80 && cp <= 0x303f) ||  // CJK Radicals
    (cp >= 0x3040 && cp <= 0x33ff) ||  // CJK misc
    (cp >= 0x3400 && cp <= 0x4dbf) ||  // CJK Extension A
    (cp >= 0x4e00 && cp <= 0x9fff) ||  // CJK Unified
    (cp >= 0xa000 && cp <= 0xa4cf) ||  // Yi
    (cp >= 0xac00 && cp <= 0xd7af) ||  // Hangul Syllables
    (cp >= 0xf900 && cp <= 0xfaff) ||  // CJK Compatibility
    (cp >= 0xfe10 && cp <= 0xfe1f) ||  // Vertical forms
    (cp >= 0xfe30 && cp <= 0xfe4f) ||  // CJK Compatibility Forms
    (cp >= 0xfe50 && cp <= 0xfe6f) ||  // Small Form Variants
    (cp >= 0xff00 && cp <= 0xff60) ||  // Fullwidth
    (cp >= 0xffe0 && cp <= 0xffe6) ||  // Fullwidth
    (cp >= 0x1f300 && cp <= 0x1f9ff)   // Emoji
  );
}

export function visibleWidth(s: string): number {
  const plain = stripAnsi(s);
  let w = 0;
  for (const char of plain) {
    const cp = char.codePointAt(0) ?? 0;
    w += isWide(cp) ? 2 : 1;
  }
  return w;
}

export function padRight(s: string, width: number, fill = " "): string {
  const vw = visibleWidth(s);
  if (vw >= width) return s;
  return s + fill.repeat(width - vw);
}

export function padLeft(s: string, width: number, fill = " "): string {
  const vw = visibleWidth(s);
  if (vw >= width) return s;
  return fill.repeat(width - vw) + s;
}

export function padCenter(s: string, width: number, fill = " "): string {
  const vw = visibleWidth(s);
  if (vw >= width) return s;
  const total = width - vw;
  const left = Math.floor(total / 2);
  const right = total - left;
  return fill.repeat(left) + s + fill.repeat(right);
}
