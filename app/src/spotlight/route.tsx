import { useRouterSpotlight } from "./context";
import { useEffect, type ReactNode } from "react";

interface RouterSpotlightRouteProps {
    path: string;
    placeholder?: string;
    hideQuery?: boolean;
    children?: ReactNode;
}

export function RouterSpotlightRoute(props: RouterSpotlightRouteProps) {
    const context = useRouterSpotlight();
    const active = context.path.split("?")[0] === props.path;

    useEffect(() => {
        if (active && context.placeholder !== props.placeholder) {
            context.setPlaceholder(props.placeholder ?? "");
        }

        if (active && context.queryHidden !== (props.hideQuery ?? false)) {
            context.setQueryHidden(props.hideQuery ?? false);
        }
    }, [active, context, props.placeholder]);

    return active ? props.children : null;
};