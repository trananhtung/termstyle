// ── Border styles ─────────────────────────────────────────────────────────────

export type BorderStyle = "none" | "normal" | "rounded" | "double" | "heavy" | "ascii";

export interface BorderChars {
  topLeft: string;
  top: string;
  topRight: string;
  left: string;
  right: string;
  bottomLeft: string;
  bottom: string;
  bottomRight: string;
}

export const BORDERS: Record<BorderStyle, BorderChars> = {
  none: { topLeft: "", top: "", topRight: "", left: "", right: "", bottomLeft: "", bottom: "", bottomRight: "" },
  normal: { topLeft: "┌", top: "─", topRight: "┐", left: "│", right: "│", bottomLeft: "└", bottom: "─", bottomRight: "┘" },
  rounded: { topLeft: "╭", top: "─", topRight: "╮", left: "│", right: "│", bottomLeft: "╰", bottom: "─", bottomRight: "╯" },
  double:  { topLeft: "╔", top: "═", topRight: "╗", left: "║", right: "║", bottomLeft: "╚", bottom: "═", bottomRight: "╝" },
  heavy:   { topLeft: "┏", top: "━", topRight: "┓", left: "┃", right: "┃", bottomLeft: "┗", bottom: "━", bottomRight: "┛" },
  ascii:   { topLeft: "+", top: "-", topRight: "+", left: "|", right: "|", bottomLeft: "+", bottom: "-", bottomRight: "+" },
};
