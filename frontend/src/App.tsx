import { BrowserRouter } from "react-router";
import { AppRoutes } from "./routes/appRoutes";

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
