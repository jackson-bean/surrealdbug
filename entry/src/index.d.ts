import type Surreal from "surrealdb";

export class SurrealDBug {
    frame: HTMLIFrameElement;
}

export interface SurrealDBugOptions {
    container?: string;
    key?: string;
}

export default function surrealdbug(surreal: Surreal, options?: SurrealDBugOptions): SurrealDBug;