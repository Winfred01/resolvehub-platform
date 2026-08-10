import type { RouteObject } from "react-router";
import { useRoutes } from "react-router";
import { AppLayout } from "../layouts/AppLayout";
import { HomePage } from "../pages/HomePage";
import { LoginPlaceholderPage } from "../pages/LoginPlaceholderPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { TicketsPage } from "../pages/TicketsPage";

const appRoutes: RouteObject[] = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPlaceholderPage /> },
      { path: "tickets", element: <TicketsPage /> },
      { path: "*", element: <NotFoundPage /> }
    ]
  }
];

export function AppRoutes() {
  return useRoutes(appRoutes);
}
