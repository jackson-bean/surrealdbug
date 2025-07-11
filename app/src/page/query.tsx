import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Code, Loader, Modal, ScrollArea, Textarea } from "@mantine/core";
import { Spotlight } from "@mantine/spotlight";

export function Query() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<unknown[]>([]);
    const [error, setError] = useState<Error>();

    const queryRef = useRef<HTMLTextAreaElement>(null);

    const onExecute = () => {
        setResults([]);
        setError(undefined);
        setLoading(true);

        window.parent.postMessage({
            type: "execute",
            query
        }, "*");

        const responseListener = (e: MessageEvent) => {
            if (e.data.type !== "execute-results" && e.data.type !== "execute-error") return;

            if (e.data.type === "execute-results") {
                setResults(JSON.parse(e.data.results));
            }

            if (e.data.type === "execute-error") {
                setError(e.data.error);
            }

            setLoading(false);

            window.removeEventListener("message", responseListener);
        };

        window.addEventListener("message", responseListener);
    };

    const onKeyDown = (ev: KeyboardEvent) => {
        if (ev.key === "Enter") {
            if (ev.metaKey || ev.ctrlKey) {
                onExecute();
            }
        }
    };

    useEffect(() => {
        queryRef.current?.focus();
    }, []);

    return (
        <>
            <Textarea
                ref={queryRef}
                value={query}
                variant="unstyled"
                size="lg"
                px="sm"
                w="100%"
                placeholder="Enter query..."
                autosize
                minRows={1}
                onChange={ev => {
                    setQuery(ev.target.value);
                }}
                onKeyDown={onKeyDown}
            />

            {loading ? (
                <Spotlight.ActionsList>
                    <Spotlight.Empty>
                        <Loader />
                    </Spotlight.Empty>
                </Spotlight.ActionsList>
            ) : (
                (results.length > 0 || error !== undefined) && (
                    <Spotlight.ActionsList>
                        <ScrollArea>
                            {error !== undefined ? (
                                error.toString()
                            ) : (
                                <Code block>
                                    {JSON.stringify(results, null, 2)}
                                </Code>
                            )}
                        </ScrollArea>
                    </Spotlight.ActionsList>
                )
            )}
        </>
    );
};