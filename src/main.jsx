import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import "rsuite/dist/rsuite.min.css";
import { CustomProvider } from "rsuite";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <CustomProvider>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </CustomProvider>
    </BrowserRouter>
  </React.StrictMode>
);
