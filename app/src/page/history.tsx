import { Spotlight } from "@mantine/spotlight";
import type { Query } from "../App";
import { useRouterSpotlight } from "../spotlight/context";

interface HistoryProps {
    queries: Query[];
}

export function History(props: HistoryProps) {
    const context = useRouterSpotlight();

    return (
        <Spotlight.ActionsList>
            {props.queries.length === 0 ? (
                <Spotlight.Empty>No queries have been executed</Spotlight.Empty>
            ) : (
                [...props.queries].reverse().map(query => (
                    <Spotlight.Action
                        key={`query-${query.id}`}
                        label={query.query}
                        onClick={() => {
                            context.navigate("/results", {
                                id: query.id
                            });
                        }}
                    />
                ))
            )}
        </Spotlight.ActionsList>
    );
};