import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import { PageWrapper } from "./styles/CommonStyles";

const HealthPage = lazy(() => import("./pages/HealthPage"));

const App = () => (
  <PageWrapper>
    <Routes>
      <Route path="/" element={<ChatPage />} />
      <Route
        path="/health"
        element={
          <Suspense fallback={null}>
            <HealthPage />
          </Suspense>
        }
      />
    </Routes>
  </PageWrapper>
);

export default App;
