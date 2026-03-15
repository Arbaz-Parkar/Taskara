import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ServiceDetails from "./pages/ServiceDetails";
import ServicesManagementPage from "./pages/ServicesManagementPage";
import CreateServiceDashboardPage from "./pages/CreateServiceDashboardPage";
import ServiceDetailsDashboardPage from "./pages/ServiceDetailsDashboardPage";
import ServiceEditDashboardPage from "./pages/ServiceEditDashboardPage";
import OrdersPage from "./pages/OrdersPage";
import BuyerOrdersPage from "./pages/BuyerOrdersPage";
import SellerOrdersPage from "./pages/SellerOrdersPage";
import MessagesPage from "./pages/MessagesPage";
import MessageThreadPage from "./pages/MessageThreadPage";
import ReviewsPage from "./pages/ReviewsPage";
import DisputesPage from "./pages/DisputesPage";
import SettingsPage from "./pages/SettingsPage";
import PublicProfile from "./pages/PublicProfile";
import AdminDashboard from "./pages/AdminDashboard";
import FooterContentPage from "./pages/FooterContentPage";
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
          <Route path="/profile/:userId" element={<PublicProfile />} />
          <Route path="/abouts" element={<FooterContentPage />} />
          <Route path="/abouts/:slug" element={<FooterContentPage />} />

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
            <Route path="services/new" element={<CreateServiceDashboardPage />} />
            <Route path="services" element={<ServicesManagementPage />} />
            <Route path="services/:serviceId" element={<ServiceDetailsDashboardPage />} />
            <Route path="services/:serviceId/edit" element={<ServiceEditDashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/buyer" element={<BuyerOrdersPage />} />
            <Route path="orders/seller" element={<SellerOrdersPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="messages/:orderId" element={<MessageThreadPage />} />
            <Route path="disputes" element={<DisputesPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
