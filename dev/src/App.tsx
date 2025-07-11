import surrealdbug from "entry/dev";
import { useEffect, useRef } from "react";
import Surreal from "surrealdb";

export function App() {
    const surreal = useRef(new Surreal());

    useEffect(() => {
        surreal.current.connect("ws://localhost:8000", {
            namespace: "surrealdbug",
            database: "surrealdbug",
            auth: {
                username: "root",
                password: "root",
            },
        });

        surrealdbug(surreal.current);
    }, []);

    return (
        <div>
            <p>This is my development app</p>

            <button
                onClick={() => {
                    surreal.current.query("select * from tag;");
                }}
            >
                Run query
            </button>
        </div>
    );
}
