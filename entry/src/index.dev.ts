import "./index.css";
import type Surreal from "surrealdb";
import { SurrealDBug, type SurrealDBugOptions } from "./surrealdbug";

export default function surrealdbug(surreal: Surreal, options?: SurrealDBugOptions) {
    const iframe = document.createElement("iframe");

    iframe.id = "surrealdbug";
    iframe.src = "http://localhost:5174";

    return new SurrealDBug(surreal, iframe, options);
};