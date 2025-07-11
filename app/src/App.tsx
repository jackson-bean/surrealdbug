import "@mantine/core/styles.css";
import "@mantine/spotlight/styles.css";
import { MantineProvider } from "@mantine/core";
import { spotlight } from "@mantine/spotlight";
import { useEffect, useState } from "react";
import { THEME } from "./theme";
import { RouterSpotlight } from "./spotlight/spotlight";
import { Home } from "./page/home";
import { Query } from "./page/query";
import { History } from "./page/history";
import { Results } from "./page/results";

export interface Query {
    id: string;
    query: string;
    results?: unknown[];
    error?: any;
}

export function App() {
    const [queries, setQueries] = useState<Query[]>([]);

    useEffect(() => {
        const onMessage = (e: MessageEvent) => {
            if (e.data.type === "opened") {
                spotlight.open();
            }

            if (e.data.type === "query") {
                setQueries(queries => [
                    ...queries,
                    { id: e.data.id, query: e.data.query }
                ]);
            }

            if (e.data.type === "results") {
                setQueries(queries => queries.map(query => {
                    if (query.id !== e.data.id) return query;

                    return {
                        ...query,
                        results: e.data.results
                    };
                }));
            }

            if (e.data.type === "query-error") {
                setQueries(queries => queries.map(query => {
                    if (query.id !== e.data.id) return query;

                    return {
                        ...query,
                        error: e.data.error
                    };
                }));
            }
        };

        window.addEventListener("message", onMessage);

        return () => {
            window.removeEventListener("message", onMessage);
        };
    }, []);

    const onOpen = () => {
        window.parent.postMessage({ type: "opened" }, { targetOrigin: "*" });
    };

    const onClose = () => {
        setTimeout(() => {
            window.parent.postMessage({ type: "closed" }, { targetOrigin: "*" });
        }, 200);
    };

    return (
        <MantineProvider theme={THEME} forceColorScheme="light">
            <RouterSpotlight
                onSpotlightOpen={onOpen}
                onSpotlightClose={onClose}
                styles={{
                    inner: {
                        overflowY: "auto"
                    }
                }}
            >
                <RouterSpotlight.Route path="/" placeholder="Enter command...">
                    <Home />
                </RouterSpotlight.Route>

                <RouterSpotlight.Route path="/execute" hideQuery>
                    <Query />
                </RouterSpotlight.Route>

                <RouterSpotlight.Route path="/history" placeholder="Search query history">
                    <History queries={queries} />
                </RouterSpotlight.Route>

                <RouterSpotlight.Route path="/results" hideQuery>
                    <Results queries={queries} />
                </RouterSpotlight.Route>
            </RouterSpotlight>
        </MantineProvider>
    );
}