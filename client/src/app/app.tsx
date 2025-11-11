import { useEffect, useState } from "react";
import classes from "./app.module.css";
import { Accordion, Center, Loader, MantineProvider, Paper, SimpleGrid, Text, UnstyledButton } from "@mantine/core";
import { MANTINE_THEME } from "./theme/theme";
import { PrimaryTitle } from "./components/PrimaryTitle/PrimaryTitle";
import { CodePreview } from "./components/CodePreview/CodePreview";
import "@mantine/core/styles.css";

const API_BASE = import.meta.env["VITE_API_BASE"];

export type ClientState = {
    id: string;
    nickname?: string;
    user?: string;
    ns?: string;
    db?: string;
    queries: {
        id: string;
        query: string;
        time: Date;
        bindings?: Record<string, any>;
        result?: { result: any; status: "OK"; time: string; }[];
        error?: { message: string };
    }[];
};

export function App() {
    const [connected, setConnected] = useState(false);
    const [clients, setClients] = useState<ClientState[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>();
    const selectedClient = clients.find(client => client.id === selectedClientId);

    useEffect(() => {
        const stateStream = new EventSource(API_BASE + "/state/events");

        stateStream.onmessage = ev => {
            if (ev.data === "ping") return;

            const parsed = JSON.parse(ev.data);

            setClients(parsed.clients);
        };

        stateStream.onopen = () => {
            setConnected(true);

            // Get initial state.
            fetch(API_BASE + "/state").then(response => {
                response.json().then(parsed => {
                    setClients(parsed.clients);
                });
            });
        };

        return () => {
            stateStream.close();
        };
    }, []);

    return (
        <MantineProvider
            theme={MANTINE_THEME}
            forceColorScheme="dark"
        >
            {!connected ? (
                <Center h="100%">
                    <Loader />
                </Center>
            ) : (
                <div className={classes.root}>
                    <PrimaryTitle fz={22}>
                        Connected Clients ({clients.length})
                    </PrimaryTitle>

                    <SimpleGrid
                        mt={"xl"}
                        cols={{
                            xs: 1,
                            sm: 2,
                            lg: 3,
                        }}
                    >
                        {clients.map(client => (
                            <UnstyledButton
                                key={client.id}
                                onClick={() => {
                                    setSelectedClientId(client.id);
                                }}
                            >
                                <Paper
                                    p="lg"
                                    variant={(selectedClientId === client.id) ? "selected" : "interactive"}
                                    withBorder
                                >
                                    <Text
                                        c="bright"
                                        fw={600}
                                        fz="xl"
                                    >
                                        {client.nickname ?? client.id}
                                    </Text>

                                    <Text>Namespace: {client.ns}</Text>
                                    <Text>Database: {client.db}</Text>
                                    <Text>User: {client.user}</Text>
                                </Paper>
                            </UnstyledButton>
                        ))}
                    </SimpleGrid>

                    {selectedClient && (
                        <>
                            <PrimaryTitle
                                fz={18}
                                lh="h1"
                                fw={600}
                                mt="xl"
                            >
                                History
                            </PrimaryTitle>

                            <Accordion
                                mt="md"
                                mb="100%"
                            >
                                {[...selectedClient.queries]
                                    .reverse()
                                    .map(query => (
                                        <Accordion.Item
                                            key={`query-${query.id}`}
                                            value={`query-${query.id}`}
                                        >
                                            <Accordion.Control>
                                                {query.query}
                                            </Accordion.Control>

                                            <Accordion.Panel>
                                                <Paper>
                                                    <CodePreview
                                                        bg="transparent"
                                                        language="surql"
                                                        value={(
                                                            query.error?.message ? (
                                                                `'${query.error.message}'`
                                                            ) : (
                                                                JSON.stringify(query.result, null, 2)
                                                            )
                                                        )}
                                                    />
                                                </Paper>
                                            </Accordion.Panel>
                                        </Accordion.Item>
                                    ))}
                            </Accordion>
                        </>
                    )}
                </div>
            )}
        </MantineProvider>
    );
};