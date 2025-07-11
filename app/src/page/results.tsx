import { Spotlight } from "@mantine/spotlight";
import { useRouterSpotlight } from "../spotlight/context";
import type { Query } from "../App";
import { Code } from "@mantine/core";

interface ResultsProps {
    queries: Query[];
}

export function Results(props: ResultsProps) {
    const context = useRouterSpotlight();
    const params = new URLSearchParams(context.path.split("?")[1]);
    const id = params.get("id");
    const query = props.queries.find(query => query.id === id)!;

    return (
        <Spotlight.ActionsList>
            <Code block>
                {JSON.stringify(query.results, null, 2)}
            </Code>
        </Spotlight.ActionsList>
    );
}