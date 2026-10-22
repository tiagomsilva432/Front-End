import AppRoutes from "./routes/approutes";
import ThemeProvider from "./theme/ThemeProvider";

export default function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}
