import { spotlight, Spotlight, type SpotlightRootProps } from "@mantine/spotlight";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStack } from "../utils";
import { RouterSpotlightContext } from "./context";
import { RouterSpotlightRoute } from "./route";

interface RouterSpotlightProps extends SpotlightRootProps {}

export function RouterSpotlight(props: RouterSpotlightProps) {
    const [query, setQuery] = useState("");
    const [placeholder, setPlaceholder] = useState("");
    const [queryHidden, setQueryHidden] = useState(false);
    const history = useStack<string>(["/"]);

    const searchRef = useRef<HTMLInputElement>(null);

    const clearQuery = useCallback(() => {
        setQuery("");

        if (searchRef.current !== null) {
            searchRef.current.value = "";
        }
    }, []);

    const onClose = useCallback(() => {
        history.reset();
        clearQuery();
        spotlight.close();
    }, [props.onSpotlightClose, clearQuery, history]);

    const onNavigate = useCallback((path: string, query?: Record<string, string>) => {
        let fullPath = path;

        if (query !== undefined && Object.keys(query).length > 0) {
            const params = new URLSearchParams(query).toString();

            fullPath += `?${params}`;
        }

        history.push(fullPath);
        clearQuery();
    }, [clearQuery, history]);

    const onBack = useCallback(() => {
        if (history.stack.length === 1) {
            return onClose();
        }

        history.pop();
        clearQuery();

        requestAnimationFrame(() => {
            searchRef.current?.focus();
        });
    }, [clearQuery, onClose, history.stack]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onBack();
        };

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
        }
    }, [onBack]);

    return (
        <RouterSpotlightContext.Provider value={{
            path: history.current,
            query,
            placeholder,
            queryHidden,
            setPlaceholder,
            back: onBack,
            navigate: onNavigate,
            setQueryHidden
        }}>
            <Spotlight.Root
                query={query}
                closeOnEscape={false}
                closeOnActionTrigger={false}
                onQueryChange={setQuery}
                {...props}
            >
                {!queryHidden && (
                    <Spotlight.Search ref={searchRef} placeholder={placeholder} />
                )}

                {props.children}
            </Spotlight.Root>
        </RouterSpotlightContext.Provider>
    );
};

RouterSpotlight.Route = RouterSpotlightRoute;