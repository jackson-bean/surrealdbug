import "./index.css";
import type Surreal from "surrealdb";
import appIndexContent from "app/index.html";
import { SurrealDBug, type SurrealDBugOptions } from "./surrealdbug";

export default function surrealdbug(surreal: Surreal, options?: SurrealDBugOptions) {
    const iframe = document.createElement("iframe");

    iframe.id = "surrealdbug";
    iframe.srcdoc = appIndexContent;

    return new SurrealDBug(surreal, iframe, options);
};