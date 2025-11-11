import type { BunMessageEvent, ReadableStreamController, ServerWebSocket, WebSocketHandler } from "bun";
import { join } from "path";
import { decodeCbor, encodeCbor, type RpcRequest, type RpcResponse } from "surrealdb";
import * as uuid from "uuid";

interface ClientState {
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

interface State {
    clients: ClientState[];
};

type RpcRequestWithId = RpcRequest & { id: string };
type RpcResponseWithId = RpcResponse & { id: string };

interface Client {
    messages: Map<string, RpcRequestWithId>;
    pending: Set<string>;
    socket?: ServerWebSocket<Client>;
    tunnel?: WebSocket;
    state: ClientState;
}

export function serve(context: {
    config: {
        port: number;
        endpoint: string;
        publicDir: string;
    },

    dependencies: {
        log: (message: any) => void
    }
}) {
    const { config, dependencies } = context;

    const stateSubscriptionControllers: ReadableStreamController<string>[] = [];
    const clients = new Map<string, Client>;

    const createClient = (): Client => {
        const client: Client = {
            messages: new Map(),
            pending: new Set(),
            state: {
                id: uuid.v7(),
                queries: []
            }
        };

        clients.set(client.state.id, client);

        return client;
    };

    const getState = (): State => ({
        clients: [...clients.values()].map(client => client.state)
    });

    const broadcastState = () => {
        stateSubscriptionControllers.forEach(controller => {
            controller.enqueue(`data: ${JSON.stringify(getState())}\n\n`);
        });
    };

    const sendAsClient = (client: Client, request: RpcRequestWithId) => {
        return new Promise<RpcResponseWithId>((resolve, reject) => {
            const responseListener = (e: BunMessageEvent) => {
                const response = decodeCbor(e.data) as RpcResponseWithId;

                if (response.id === request.id) {
                    client.tunnel?.removeEventListener("message", responseListener);
                    resolve(response);
                }
            };

            client.tunnel?.addEventListener("message", responseListener);
            client.tunnel?.send(encodeCbor(request));
        });
    };

    // Start the HTTP server.
    Bun.serve({
        port: config.port,
        routes: {

            // Serves the web UI files.
            "/*": async request => {
                const url = new URL(request.url);
                const filePath = join(config.publicDir, (
                    url.pathname === "/" ? "/index.html" : url.pathname
                ));

                const file = Bun.file(filePath);

                if (await file.exists()) {
                    return new Response(file);
                }

                return new Response("Not found", { status: 404 });
            },

            // Returns the current state.
            "/state": () => new Response(JSON.stringify(getState()), {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            }),

            // Provides live state updates using SSE.
            "/state/events": request => {
                const stream = new ReadableStream<string>({
                    start: controller => {
                        stateSubscriptionControllers.push(controller);

                        const pingInterval = setInterval(() => {
                            controller.enqueue("data: ping\n\n");
                        }, 5000);

                        controller.enqueue("data: ping\n\n");

                        request.signal.onabort = () => {
                            controller.close();
                            clearInterval(pingInterval);
                            stateSubscriptionControllers.splice(stateSubscriptionControllers.indexOf(controller));
                        }
                    }
                });

                return new Response(stream, {
                    headers: {
                        "Content-Type": "text/event-stream",
                        "Cache-Control": "no-cache",
                        "Connection": "keep-alive",
                        "Access-Control-Allow-Origin": "*"
                    }
                });
            },

            // Sends a query as the specified client and returns the response.
            "/client/:id/query": {
                POST: async request => {
                    const client = clients.get(request.params.id);

                    if (client === undefined) {
                        return new Response("Client not found", { status: 404 });
                    }

                    const query = await request.body?.text();
                    const requestId = uuid.v7();

                    const response = await sendAsClient(client, {
                        id: requestId,
                        method: "query",
                        params: [query, undefined]
                    });

                    return new Response(JSON.stringify(response.result), {
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*"
                        }
                    });
                }
            },

            // Database proxy.
            "/proxy/*": async (request, server) => {
                const body = await request.arrayBuffer();
                const url = new URL(request.url);
                const [_, path] = url.pathname.split("/proxy");

                if (path === "/rpc") {
                    const protocol = request.headers.get("sec-websocket-protocol");

                    if (protocol === "cbor") {
                        const client = createClient();

                        // Attempt to upgrade request, delete the client if unsuccessful.
                        if (!server.upgrade(request, { data: client })) {
                            clients.delete(client.state.id);
                        }

                        return;
                    }
                }

                return fetch(config.endpoint + path, {
                    method: request.method,
                    headers: request.headers,
                    body: (body.byteLength === 0) ? undefined : body
                });
            }
        },

        websocket: {
            open: socket => {
                const client = socket.data;

                client.socket = socket;

                // Open a tunnel to the database.
                const endpoint = new URL(config.endpoint);
                const tunnelEndpoint = (endpoint.protocol === "https:") ? "wss:" : "ws:";

                endpoint.protocol = tunnelEndpoint;
                endpoint.pathname = "/rpc";

                const tunnel = new WebSocket(endpoint, {
                    protocol: "cbor"
                });

                // Send any pending messages when the tunnel opens.
                tunnel.onopen = () => {
                    for (const requestId of client.pending) {
                        const request = client.messages.get(requestId);

                        if (request === undefined) return;

                        tunnel.send(encodeCbor(request));
                        client.pending.delete(requestId);
                    }
                };

                // Listen for responses from database, handle and forward them.
                tunnel.onmessage = e => {
                    const response = decodeCbor(e.data) as RpcResponseWithId;
                    const request = client.messages.get(response.id);

                    // Some requests might have been sent and are being handled by the proxy itself, so ignore if a cached request is not found.
                    if (request === undefined) return;

                    client.socket!.send(e.data);

                    // Handle request based on method.
                    if (request.method === "signin") {
                        const params = request.params as [{ user: string, pass: string }];
                        const { user } = params[0];

                        client.state.user = user;

                        return broadcastState();
                    }

                    if (request.method === "use") {
                        const params = request.params as (string | undefined | null)[];
                        const [ns, db] = params;

                        if (ns !== undefined) client.state.ns = ns ?? undefined;
                        if (db !== undefined) client.state.db = db ?? undefined;

                        return broadcastState();
                    }

                    if (request.method === "query") {
                        const params = request.params as [string, Record<string, any>];
                        const [query, bindings] = params;

                        client.state.queries.push({
                            id: request.id,
                            query: query,
                            bindings: bindings,
                            time: new Date(),
                            result: response.result as any,
                            error: response.error
                        });

                        return broadcastState();
                    }
                };

                client.tunnel = tunnel;
            },

            message: (socket, message) => {
                if (typeof message === "string") return;

                const client = socket.data;
                const request = decodeCbor(message as any) as RpcRequestWithId;

                // Handle meta queries if present.
                if (request.method === "query" && request.params !== undefined) {
                    const [query, bindings] = request.params as [string, Record<string, any>];
                    const trimmed = query.trim();
                    const match = trimmed.match(/^(?:#|\/\/)\s*__sdbug:(\w+)\s*([\s\S]*)/);

                    if (match !== null) {
                        const [_, command, params] = match;

                        if (command === "nickname") {
                            client.state.nickname = params;
                            client.socket!.send(encodeCbor({
                                id: request.id,
                                result: [{ result: "ok", status: "OK", time: "0µs" }]
                            }));

                            return broadcastState();
                        }

                        if (command === "runas" && params) {
                            const [target, ...query] = params.split(/\n/);

                            // Find target client.
                            const targetClient = [...clients.values()].find(client => (
                                client.state.nickname === target || client.state.id === target
                            ));

                            if (targetClient === undefined) {
                                return client.socket?.send(encodeCbor({
                                    id: request.id,
                                    result: [{ result: `Client ${target} not found`, time: "0µs" }]
                                }));
                            }

                            // Send request to target tunnel and forward back the response.
                            sendAsClient(targetClient, {
                                id: uuid.v7(),
                                method: "query",
                                params: [query.join("\n"), bindings]
                            }).then((response) => {
                                client.socket?.send(encodeCbor({
                                    ...response,
                                    id: request.id
                                }));
                            });

                            return;
                        }
                    }
                }

                client.messages.set(request.id, request);

                // Only send the message if the tunnel is open.
                if (client.tunnel!.readyState === WebSocket.OPEN) {
                    client.tunnel!.send(message);
                } else {
                    client.pending.add(request.id);
                }
            },

            close: (socket, code, reason) => {
                const client = socket.data;

                client.tunnel?.close(code, reason);
                clients.delete(client.state.id);

                broadcastState();
            }
        } as WebSocketHandler<Client>
    });

    dependencies.log("Listening on port " + config.port);
};