// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import Application from "./App.jsx";
import "./index.css"; // Tailwind v4 entra aqui

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Application />
  </React.StrictMode>
);