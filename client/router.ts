import { Router } from "@vaadin/router";

const root = document.querySelector(".root") as HTMLElement;

const router = new Router(root);
router.setRoutes([
  { path: "/", component: "main-page" },
  { path: "/main", component: "main-page" },
  { path: "/enter-room", component: "enter-room-page" },
  { path: "/sign-in", component: "sign-in-page" },
  { path: "/error", component: "error-page" },
  { path: "/share-code", component: "share-code-page" },
  { path: "/waiting", component: "waiting-page" },
  { path: "/start", component: "start-page" },
  { path: "/countdown", component: "countdown-page" },
  { path: "/moves", component: "moves-page" },
  { path: "/results", component: "results-page" },
  { path: "(.*)", redirect: "/main" },
]);
