import { createRoot } from "react-dom/client";
import "./global.css";
import { createElement } from "react";
import { App } from "./app/app";
import "./app/theme/theme.css";

createRoot(document.querySelector("#root")!).render(createElement(App));