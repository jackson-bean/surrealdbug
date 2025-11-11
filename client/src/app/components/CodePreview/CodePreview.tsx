import {
    ActionIcon,
    Box,
    CopyButton,
    type MantineSize,
    type MantineSpacing,
    Paper,
    type PaperProps,
    ScrollArea,
    Text,
} from "@mantine/core";
import clsx from "clsx";
import { type ReactNode, useMemo } from "react";
import classes from "./CodePreview.module.css";
import { useColorScheme } from "@mantine/hooks";
import { renderHighlighting } from "../../util/highlighting";
import { dedent } from "../../util/dedent";

export interface CodeProps extends CodePreviewOptions {
    value: string;
}

export interface CodePreviewOptions extends PaperProps {
    label?: string;
    language?: string;
    bg?: string;
    leftSection?: ReactNode;
    rightSection?: ReactNode;
    withCopy?: boolean;
    copyOffset?: number;
    copySize?: MantineSize;
    withDedent?: boolean;
    withWrapping?: boolean;
    padding?: MantineSpacing;
}

export function CodePreview({
    value,
    label,
    language,
    bg,
    withCopy,
    copyOffset,
    copySize,
    rightSection,
    withDedent,
    padding,
    className,
    withWrapping,
    ...rest
}: CodeProps) {
    const colorScheme = useColorScheme();
    const syntaxTheme = "default"

    const snippet = useMemo(() => {
        return renderHighlighting(
            withDedent ? dedent(value) : value,
            language,
            colorScheme,
            syntaxTheme,
        );
    }, [value, withDedent, language, colorScheme, syntaxTheme]);

    const rightPadding = withCopy && !rightSection;

    return (
        <>
            {label && (
                <Text
                    ff="mono"
                    tt="uppercase"
                    fw={600}
                    mb="sm"
                    c="bright"
                >
                    {label}
                </Text>
            )}
            <Paper
                pos="relative"
                className={clsx(classes.root, className)}
                data-wrapping={withWrapping ? "true" : undefined}
                shadow="none"
                bg={bg ?? ((colorScheme === "light") ? "slate.0" : "slate.9")}
                fz="lg"
                {...rest}
            >
                <ScrollArea.Autosize>
                    <Box
                        p={padding ?? "lg"}
                        pr={rightPadding ? 64 : 0}
                        dangerouslySetInnerHTML={{ __html: snippet }}
                    />
                </ScrollArea.Autosize>

                {!rightSection && withCopy && value ? (
                    <CopyButton value={value}>
                        {({
                            // copied,
                            copy
                        }) => (
                            <ActionIcon
                                variant="gradient"
                                pos="absolute"
                                size={copySize ?? "lg"}
                                top={copyOffset ?? 9}
                                right={copyOffset ?? 9}
                                onClick={copy}
                                className={classes.copy}
                                aria-label="Copy code to clipboard"
                            >
                                {/* <Icon path={copied ? iconCheck : iconCopy} /> */}
                            </ActionIcon>
                        )}
                    </CopyButton>
                ) : (
                    rightSection && (
                        <Box
                            pos="absolute"
                            top={6}
                            right={6}
                        >
                            {rightSection}
                        </Box>
                    )
                )}
            </Paper>
        </>
    );
}