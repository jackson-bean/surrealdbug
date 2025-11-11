import { highlightCode } from "@lezer/highlight";;
// import { parser as jsonParser } from "@lezer/json";
import { parser as surqlParser } from "@surrealdb/lezer";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t, tagHighlighter } from "@lezer/highlight";

type Parser = { parse: (code: string) => any };
type ColorScheme = "light" | "dark";
type SyntaxTheme = "default" | "vivid";
type ThemeConfig = { light: HighlightStyle; dark: HighlightStyle };

/**
 * Default theme
 */
const DEFAULT_THEME: ThemeConfig = {
    light: HighlightStyle.define(
        [
            { tag: t.string, color: "#00a547" },
            { tag: t.comment, color: "#737e98" },
            { tag: t.number, color: "#00b3d0" },
            { tag: t.variableName, color: "#b82e2e" },
            { tag: t.className, color: "#0084FF" },
            { tag: [t.keyword, t.operator], color: "#ff009e" },
            { tag: [t.punctuation, t.name], color: "#000000" },
            { tag: [t.typeName, t.null, t.bool, t.literal], color: "#9D2FFF" },
            { tag: t.function(t.name), color: "#e36d00" },
        ],
        { themeType: "light" },
    ),
    dark: HighlightStyle.define(
        [
            { tag: t.string, color: "#00ff6e" },
            { tag: t.comment, color: "#737e98" },
            { tag: t.number, color: "#00DBFF" },
            { tag: t.variableName, color: "#ffd000" },
            { tag: t.className, color: "#0084FF" },
            { tag: [t.keyword, t.operator], color: "#ff009e" },
            { tag: [t.punctuation, t.name], color: "#ffffff" },
            { tag: [t.typeName, t.null, t.bool, t.literal], color: "#9D2FFF" },
            { tag: t.function(t.name), color: "#ff9b67" },
        ],
        { themeType: "dark" },
    ),
};

/**
 * Vivid theme
 */
const VIVID_THEME: ThemeConfig = {
    light: HighlightStyle.define(
        [
            { tag: t.operator, color: "#7f73ff" },
            { tag: t.string, color: "#00a547" },
            { tag: t.comment, color: "#737e98" },
            { tag: t.propertyName, color: "#b80000" },
            { tag: t.className, color: "#0097ff" },
            { tag: t.variableName, color: "#6c00a7" },
            { tag: [t.keyword, t.operator], color: "#ff009e" },
            { tag: [t.punctuation, t.name], color: "#000000" },
            { tag: [t.typeName, t.null, t.bool, t.literal], color: "#8d6bff" },
            { tag: [t.function(t.name), t.number], color: "#e36d00" },
        ],
        { themeType: "light" },
    ),
    dark: HighlightStyle.define(
        [
            { tag: t.string, color: "#00ff6e" },
            { tag: t.comment, color: "#737e98" },
            { tag: t.propertyName, color: "#e06c75" },
            { tag: t.className, color: "#00d1ff" },
            { tag: t.variableName, color: "#ffd000" },
            { tag: [t.keyword, t.operator], color: "#ff009e" },
            { tag: [t.punctuation, t.name], color: "#ffffff" },
            { tag: [t.typeName, t.null, t.bool, t.literal], color: "#a79fff" },
            { tag: [t.function(t.name), t.number], color: "#ff9b67" },
        ],
        { themeType: "dark" },
    ),
};

const THEME_CONFIGS: Record<SyntaxTheme, ThemeConfig> = {
    default: DEFAULT_THEME,
    vivid: VIVID_THEME
};

/**
 * Use a specific syntax theme with the given color scheme
 */
export const editorTheme = (colorScheme: ColorScheme, syntaxTheme: SyntaxTheme) =>
    syntaxHighlighting(THEME_CONFIGS[syntaxTheme][colorScheme], { fallback: true });

/**
 * Create a style highlighter for the given color scheme and syntax theme
 */
function createStyleHighlighter(colorScheme: ColorScheme, syntaxTheme: SyntaxTheme) {
    return tagHighlighter(
        THEME_CONFIGS[syntaxTheme][colorScheme].specs.map((a) => ({ ...a, class: a.color })),
    );
}

const PARSER_MAP = new Map<string, Parser>([
    ["sql", surqlParser],
    ["surql", surqlParser],
    ["surrealql", surqlParser],
    // ["json", jsonParser],
    ["cli", surqlParser],
    ["syntax", surqlParser.configure({ top: "Syntax" })],
]);

/**
 * Render a query with syntax highlighting
 *
 * @param code The query to render
 * @param language The language of the query
 * @param colorScheme The color scheme to use
 * @param syntaxTheme The syntax theme to use
 * @returns Highlighted HTML
 */
export function renderHighlighting(
    code: string,
    language: string | undefined,
    colorScheme: ColorScheme,
    syntaxTheme: SyntaxTheme,
) {
    const parser = PARSER_MAP.get(language as any);

    if (!parser) {
        return `<pre>${code}</pre>`;
    }

    const rendered = document.createElement("pre");
    const textColor = colorScheme === "dark" ? "#c9c9c9" : "#000000";

    function emit(text: string, classes?: string) {
        const textNode = document.createTextNode(text);
        const span = document.createElement("span");

        if (classes) {
            span.style.color = classes;
        } else {
            span.style.color = textColor;
        }

        span.append(textNode);
        rendered.append(span);
    }

    function emitBreak() {
        emit("\n");
    }

    highlightCode(
        code,
        parser.parse(code),
        createStyleHighlighter(colorScheme, syntaxTheme),
        emit,
        emitBreak,
    );

    return rendered.outerHTML;
};