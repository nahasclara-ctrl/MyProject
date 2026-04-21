import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import "./globals.css";
import AuthProvider from './context/AuthContext';
import QueryProvider from './lib/react-query/QueryProvider';
import { ThemeProvider } from './context/ThemeProvider';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  </BrowserRouter>
);

