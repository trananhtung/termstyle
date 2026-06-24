import {
  Color, ansi, fgCode, bgCode, RESET, stripAnsi, visibleWidth,
  padLeft, padRight, padCenter,
} from "./ansi.js";
import { BorderStyle, BORDERS } from "./borders.js";

// ── Types ──────────────────────────────────────────────────────────────────────

export type Align = "left" | "center" | "right";

interface StyleProps {
  // Text decorations
  bold: boolean;
  dim: boolean;
  italic: boolean;
  underline: boolean;
  blink: boolean;
  strikethrough: boolean;
  // Colors
  fgColor: Color | null;
  bgColor: Color | null;
  borderColor: Color | null;
  // Layout
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  // Box
  width: number | null;
  maxWidth: number | null;
  align: Align;
  borderStyle: BorderStyle;
  // Tab width
  tabWidth: number;
}

const DEFAULTS: StyleProps = {
  bold: false, dim: false, italic: false, underline: false, blink: false, strikethrough: false,
  fgColor: null, bgColor: null, borderColor: null,
  paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0,
  marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
  width: null, maxWidth: null,
  align: "left",
  borderStyle: "none",
  tabWidth: 4,
};

// ── Style class ────────────────────────────────────────────────────────────────

export class Style {
  private _p: StyleProps;

  constructor(props?: Partial<StyleProps>) {
    this._p = { ...DEFAULTS, ...props };
  }

  private _clone(patch: Partial<StyleProps>): Style {
    return new Style({ ...this._p, ...patch });
  }

  // ── Text decorations ─────────────────────────────────────────────────────────

  bold(v = true): Style    { return this._clone({ bold: v }); }
  dim(v = true): Style     { return this._clone({ dim: v }); }
  italic(v = true): Style  { return this._clone({ italic: v }); }
  underline(v = true): Style { return this._clone({ underline: v }); }
  blink(v = true): Style   { return this._clone({ blink: v }); }
  strikethrough(v = true): Style { return this._clone({ strikethrough: v }); }

  // ── Colors ───────────────────────────────────────────────────────────────────

  fg(color: Color): Style { return this._clone({ fgColor: color }); }
  bg(color: Color): Style { return this._clone({ bgColor: color }); }

  // ── Padding ──────────────────────────────────────────────────────────────────

  /** padding(all) | padding(vertical, horizontal) | padding(top, right, bottom, left) */
  padding(top: number, right?: number, bottom?: number, left?: number): Style {
    if (right === undefined) {
      return this._clone({ paddingTop: top, paddingRight: top, paddingBottom: top, paddingLeft: top });
    }
    if (bottom === undefined) {
      return this._clone({ paddingTop: top, paddingRight: right, paddingBottom: top, paddingLeft: right });
    }
    return this._clone({ paddingTop: top, paddingRight: right, paddingBottom: bottom ?? 0, paddingLeft: left ?? 0 });
  }

  paddingX(n: number): Style { return this._clone({ paddingLeft: n, paddingRight: n }); }
  paddingY(n: number): Style { return this._clone({ paddingTop: n, paddingBottom: n }); }

  // ── Margin ───────────────────────────────────────────────────────────────────

  /** margin(all) | margin(vertical, horizontal) | margin(top, right, bottom, left) */
  margin(top: number, right?: number, bottom?: number, left?: number): Style {
    if (right === undefined) {
      return this._clone({ marginTop: top, marginRight: top, marginBottom: top, marginLeft: top });
    }
    if (bottom === undefined) {
      return this._clone({ marginTop: top, marginRight: right, marginBottom: top, marginLeft: right });
    }
    return this._clone({ marginTop: top, marginRight: right, marginBottom: bottom ?? 0, marginLeft: left ?? 0 });
  }

  marginX(n: number): Style { return this._clone({ marginLeft: n, marginRight: n }); }
  marginY(n: number): Style { return this._clone({ marginTop: n, marginBottom: n }); }

  // ── Box ──────────────────────────────────────────────────────────────────────

  width(n: number): Style    { return this._clone({ width: n }); }
  maxWidth(n: number): Style { return this._clone({ maxWidth: n }); }
  align(a: Align): Style     { return this._clone({ align: a }); }

  border(style: BorderStyle, color?: Color): Style {
    return this._clone({ borderStyle: style, ...(color !== undefined ? { borderColor: color } : {}) });
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  render(text: string): string {
    const p = this._p;

    // Normalize tabs
    const normalized = text.replace(/\t/g, " ".repeat(p.tabWidth));

    // Split into lines
    const lines = normalized.split("\n");

    // Determine inner width
    const hasActualBorder = p.borderStyle !== "none";
    const borderW = hasActualBorder ? 2 : 0; // left + right border chars

    // Compute max content width
    const maxContent = lines.reduce((m, l) => Math.max(m, visibleWidth(l)), 0);
    const targetInner = p.width !== null
      ? p.width - p.paddingLeft - p.paddingRight - borderW
      : p.maxWidth !== null
      ? Math.min(maxContent, p.maxWidth - p.paddingLeft - p.paddingRight - borderW)
      : maxContent;

    const innerW = Math.max(0, targetInner);
    const boxW = innerW + p.paddingLeft + p.paddingRight;
    const fullW = boxW + borderW;

    // Apply text decorations to each content line
    const decoratedLines = lines.map(l => this._decorate(l));

    // Align and pad each line to innerW
    const alignedLines = decoratedLines.map(l => {
      const padded = p.align === "right"
        ? padLeft(l, innerW)
        : p.align === "center"
        ? padCenter(l, innerW)
        : padRight(l, innerW);
      return padded;
    });

    // Build padded content lines (with left/right padding)
    const contentLines = alignedLines.map(l =>
      " ".repeat(p.paddingLeft) + l + " ".repeat(p.paddingRight)
    );

    // Vertical padding
    const blankContent = " ".repeat(boxW);
    const topPadLines = Array<string>(p.paddingTop).fill(blankContent);
    const bottomPadLines = Array<string>(p.paddingBottom).fill(blankContent);

    const bodyLines = [...topPadLines, ...contentLines, ...bottomPadLines];

    // Border
    let output: string;
    if (hasActualBorder) {
      const bc = BORDERS[p.borderStyle];
      const borderANSI = p.borderColor ? fgCode(p.borderColor) : "";
      const borderEnd = p.borderColor ? RESET : "";

      const horiz = bc.top.repeat(boxW);
      const topLine = `${borderANSI}${bc.topLeft}${horiz}${bc.topRight}${borderEnd}`;
      const botLine = `${borderANSI}${bc.bottomLeft}${horiz}${bc.bottomRight}${borderEnd}`;

      const bordered = bodyLines.map(l =>
        `${borderANSI}${bc.left}${borderEnd}${l}${borderANSI}${bc.right}${borderEnd}`
      );
      output = [topLine, ...bordered, botLine].join("\n");
    } else {
      output = bodyLines.join("\n");
    }

    // Background color fills full box width
    if (p.bgColor) {
      const bg = bgCode(p.bgColor);
      output = output.split("\n").map(line => {
        const stripped = stripAnsi(line);
        const vw = stripped.length; // approximate; bg fill matches visible content
        return bg + line + RESET;
      }).join("\n");
    }

    // Margin
    const marginLeftStr = " ".repeat(p.marginLeft);
    const marginRightStr = " ".repeat(p.marginRight);

    const withMarginX = output.split("\n").map(l => marginLeftStr + l + marginRightStr).join("\n");

    const emptyLine = " ".repeat(fullW + p.marginLeft + p.marginRight);
    const topMargin = Array<string>(p.marginTop).fill(emptyLine).join("\n");
    const botMargin = Array<string>(p.marginBottom).fill(emptyLine).join("\n");

    const parts: string[] = [];
    if (topMargin) parts.push(topMargin);
    parts.push(withMarginX);
    if (botMargin) parts.push(botMargin);

    return parts.join("\n");
  }

  private _decorate(text: string): string {
    const p = this._p;
    const codes: number[] = [];
    if (p.bold)          codes.push(1);
    if (p.dim)           codes.push(2);
    if (p.italic)        codes.push(3);
    if (p.underline)     codes.push(4);
    if (p.blink)         codes.push(5);
    if (p.strikethrough) codes.push(9);

    let out = text;
    if (p.fgColor) out = fgCode(p.fgColor) + out + RESET;
    if (codes.length) out = ansi(...codes) + out + RESET;
    return out;
  }
}

// ── Convenience factory ────────────────────────────────────────────────────────

export function style(): Style {
  return new Style();
}
