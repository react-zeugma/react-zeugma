import { createRootRoute, createRoute } from '@tanstack/react-router';
import App from './app';
import { Home } from './pages/home';
import { Demo } from './pages/demo';
import { Docs } from './pages/docs';
import { NotFound } from './pages/not-found';

const rootRoute = createRootRoute({
  component: App,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const demoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/demo',
  component: Demo,
});

const docsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/docs',
  component: Docs,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFound,
});

const routeTree = rootRoute.addChildren([indexRoute, demoRoute, docsRoute, notFoundRoute]);

import { createRouter } from '@tanstack/react-router';

export const router = createRouter({
  routeTree,
  basepath: import.meta.env.BASE_URL.slice(0, -1) || '/',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
