# SurrealDBug
SurrealDBug is a proxy used to analyze/debug traffic sent between [SurrealDB](https://github.com/surrealdb/surrealdb) and its clients.

## Motivation
Debugging queries within the context of an application that uses SurrealDB isn't incredibly straightforward without utilizing some form of wrapper. SurrealDBug is a drop-in solution to use rather than creating such a wrapper manually.

## Features
- **Web UI** - A web interface is served alongside the proxy for convenience.
- **Query history** - All queries and their responses from connected clients are logged and can be inspected.
- **Client impersonation** - Connected clients can execute queries on behalf of other clients. For example, you can use Surrealist's robust interface to execute queries as if it were your running application. This is especially useful for debugging clients that authenticate as record users. See [Meta Queries](#meta-queries) for more details.
- **Language-agnostic** - Any application (frontend, server-side, etc.) written in any language is able to connect with no extra configuration.

## Prerequisites
- **NOTE: This tool is early in development.** I started this project for myself, so minimal testing has only been done using SurrealDB version **2.3.x**. Proper testing and adapters for varying database versions will be implemented as the project matures.
- **NOTE: This tool is for development use only.** Exposing this proxy to the public would deem your database insecure.
- **Your client application must be using the WebSocket RPC implementation** (ws:// | ws://). HTTP connections are not currently supported, however the client should still function if connected to the proxy.

## Quick Start
- Ensure a SurrealDB instance is running.
- Run a SurrealDBug container providing your database url:
```
docker run -p 3000:3000 -e ENDPOINT="http://host.docker.internal:8000" jacksonbeandocker/surrealdbug
```
**NOTE:** The url you provide to the ENDPOINT variable must be an HTTP/HTTPS url. This is not to be confused with the ws/wss url your client usually connects with.
- Change your application's SurrealDB endpoint to the newly-created proxy endpoint:
```typescript
const surreal = new Surreal();

// Old
surreal.connect("ws://localhost:8000");

// New
surreal.connect("ws://localhost:3000/proxy"); // <-- Make sure you connect to the "/proxy" endpoint.
```
- Access the web interface by navigating to the root of the server (http://localhost:3000 in my example), where you will see your client's queries being logged.

## Meta Queries
Connected clients can interact with the proxy via queries using a set of "meta queries" provided by the proxy. Meta queries take the form of comments, and are prefixed with "__sdbug:"

For example:
```
# __sdbug:nickname Frontend
```
Executing this query from a connected client would change its display name in the web ui.

Below is a list of all current meta queries:
- **__sdbug:nickname \<name>** - Changes the display name of the client. This makes it easier to distinguish between each client in the web ui, as by default their randomly-generated id's are displayed.
- **__sdbug:runas \<id | nickname> \<query>** - Executes the provided query as another connected client as opposed to the current client. This is particularly useful for, for example, using Surrealist's editor to run queries on behalf of a frontend application. Example:
```
# __sdbug:runas Frontend
select * from $auth;
```