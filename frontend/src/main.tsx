import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import { AboutPage } from "./pages/AboutPage";
import { LandingPage } from "./pages/LandingPage";
import { RepositoryDoctorPage } from "./pages/RepositoryDoctorPage";
import { ScreenshotExplainerPage } from "./pages/ScreenshotExplainerPage";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/doctor" element={<RepositoryDoctorPage />} />
          <Route path="/screenshot" element={<ScreenshotExplainerPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);

