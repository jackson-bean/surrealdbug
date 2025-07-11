import { Spotlight } from "@mantine/spotlight";
import { useRouterSpotlight } from "../spotlight/context";

export function Home() {
    const { query, navigate } = useRouterSpotlight();
    
    const actions = [
        {
            id: "query",
            label: "Execute query",
            onClick: () => navigate("/execute")
        },
        {
            id: "history",
            label: "View query history",
            onClick: () => navigate("/history")
        }
    ];

    const filtered = actions.filter(action => (
        action.label.toLowerCase().includes(query.toLowerCase())
    ));

    return (
        <Spotlight.ActionsList>
            {(filtered.length === 0) ? (
                <Spotlight.Empty>No results found</Spotlight.Empty>
            ) : (
                filtered.map(action => (
                    <Spotlight.Action
                        key={`action-${action.id}`}
                        variant="gradient"
                        label={action.label}
                        onClick={action.onClick}
                    />
                ))
            )}
        </Spotlight.ActionsList>
    );
};