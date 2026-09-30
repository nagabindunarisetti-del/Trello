import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ==========================================
// PUBLIC PAGES
// ==========================================

import Login from "./pages/Login";
import Register from "./pages/Register";

// ==========================================
// APPLICATION PAGES
// ==========================================

import Dashboard from "./pages/Dashboard";
import BoardsPage from "./pages/BoardsPage";
import TemplatesPage from "./pages/TemplatesPage";
import MembersPage from "./pages/MembersPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SettingsPage from "./pages/SettingsPage";
import BoardPage from "./pages/BoardPage";

// ==========================================
// LAYOUT
// ==========================================

import MainLayout from "./components/MainLayout";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================
            PUBLIC ROUTES
        ====================================== */}

        {/* LOGIN */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* REGISTER */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =====================================
            APPLICATION ROUTES
        ====================================== */}

        <Route element={<MainLayout />}>

          {/* =================================
              HOME
          ================================== */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/home"
            element={<Dashboard />}
          />


          {/* =================================
              BOARDS
          ================================== */}

          <Route
            path="/boards"
            element={<BoardsPage />}
          />


          {/* =================================
              TEMPLATES
          ================================== */}

          <Route
            path="/templates"
            element={<TemplatesPage />}
          />


          {/* =================================
              MEMBERS
          ================================== */}

          <Route
            path="/members"
            element={<MembersPage />}
          />


          {/* =================================
              SUBSCRIPTION
          ================================== */}

          <Route
            path="/subscription"
            element={<SubscriptionPage />}
          />


          {/* =================================
              SETTINGS
          ================================== */}

          <Route
            path="/settings"
            element={<SettingsPage />}
          />


          {/* =================================
              INDIVIDUAL BOARD
          ================================== */}

          <Route
            path="/board/:id"
            element={<BoardPage />}
          />

        </Route>


        {/* =====================================
            FALLBACK
        ====================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;