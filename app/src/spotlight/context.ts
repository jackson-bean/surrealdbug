import { createContext, useContext } from "react";

export const RouterSpotlightContext = createContext<{
    query: string;
    placeholder: string;
    path: string;
    queryHidden: boolean;
    navigate: (path: string, query?: Record<string, string>) => void;
    back: () => void;
    setPlaceholder: (placeholder: string) => void;
    setQueryHidden: (value: boolean) => void;
} | undefined>(undefined);

export function useRouterSpotlight() {
    const context = useContext(RouterSpotlightContext);

    if (context === undefined) {
        throw Error("useRouterSpotlight can only be used within a RouterSpotlightContext");
    }

    return context;
};