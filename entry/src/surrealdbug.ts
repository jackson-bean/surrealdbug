import type Surreal from "surrealdb";

export interface SurrealDBugOptions {
    container?: HTMLElement;
    key?: string;
}

export class SurrealDBug {
    constructor(
        private surreal: Surreal,
        public frame: HTMLIFrameElement,
        private options?: SurrealDBugOptions
    ) {
        this.patchInstance();
        this.registerEvents();

        frame.style.height = "0px";
        (options?.container ?? document.body).appendChild(frame);
    }

    /**
     * Patches the Surreal instance to intercept queries.
     * TODO This is hacky. Need to find a better way in the future.
     */
    private patchInstance() {
        const original = this.surreal.query;

        this.surreal.query = ((...args) => {
            const value = original.call(this.surreal, ...args);

            if (typeof args[0] !== "string") return value;

            const id = `${args[0]}-${Date.now()}`;

            this.frame.contentWindow?.postMessage({
                type: "query",
                id,
                query: args[0]
            }, "*");

            value
                .then(results => {
                    this.frame.contentWindow?.postMessage({
                        type: "results",
                        id,
                        results
                    }, "*");
                })
                .catch(error => {
                    this.frame.contentWindow?.postMessage({
                        type: "query-error",
                        id,
                        error
                    }, "*");
                });

            return value;
        }) as typeof original;
    }

    private registerEvents() {
        window.addEventListener("keydown", e => {
            if (e.key === (this.options?.key ?? "k") && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();

                this.frame.style.height = "100vh";
                this.frame.contentWindow?.postMessage({ type: "opened" }, "*");
            }
        });

        window.addEventListener("message", async (e) => {
            if (e.data.type === "closed") {
                this.frame.style.height = "0px";
            }

            if (e.data.type === "opened") {
                this.frame.style.height = "100vh";
            }

            if (e.data.type === "execute") {
                this.surreal.query(e.data.query)
                    .then(results => {
                        this.frame.contentWindow?.postMessage({
                            type: "execute-results",
                            results: JSON.stringify(results)
                        }, "*");
                    })
                    .catch(error => {
                        this.frame.contentWindow?.postMessage({
                            type: "execute-error",
                            error
                        }, "*");
                    });
            }
        });
    }
};