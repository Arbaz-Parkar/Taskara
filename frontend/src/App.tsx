import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ServiceDetails from "./pages/ServiceDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";
import DashboardLayout from "./layouts/DashboardLayout";

export default function App() {
  return (
    <div className="app-shell">
      <main className="app-main">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/service/:id" element={<ServiceDetails />} />

          {/* Protected dashboard route tree */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="services/new" element={<Navigate to="/dashboard?tab=create" replace />} />
            <Route path="services" element={<Navigate to="/dashboard?tab=services" replace />} />
            <Route path="orders" element={<Navigate to="/dashboard?tab=orders" replace />} />
            <Route path="orders/buyer" element={<Navigate to="/dashboard?tab=orders" replace />} />
            <Route path="orders/seller" element={<Navigate to="/dashboard?tab=orders" replace />} />
            <Route path="messages" element={<Navigate to="/dashboard?tab=messages" replace />} />
            <Route path="settings" element={<Navigate to="/dashboard?tab=settings" replace />} />
          </Route>
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
