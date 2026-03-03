import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Marketplace from "./Marketplace";

const LEGACY_TAB_ROUTES: Record<string, string> = {
  create: "/dashboard/services/new",
  services: "/dashboard/services",
  orders: "/dashboard/orders",
  messages: "/dashboard/messages",
  settings: "/dashboard/settings",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (!tab) {
      return;
    }

    const targetRoute = LEGACY_TAB_ROUTES[tab];
    if (targetRoute) {
      navigate(targetRoute, { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div className="overview-shell">
      <section className="overview-hero-card">
        <div>
          <p className="overview-kicker">Taskara Workspace</p>
          <h2>Run your marketplace activity from a clean route-based dashboard.</h2>
          <p>
            Create services, manage listings, process orders, and chat with buyers/sellers in
            dedicated pages.
          </p>
        </div>

        <div className="overview-actions">
          <Link className="btn-primary" to="/dashboard/services/new">
            Create Service
          </Link>
          <Link className="btn-outline" to="/dashboard/orders">
            Open Orders
          </Link>
        </div>
      </section>

      <section className="overview-panels">
        <article className="overview-panel-card">
          <h3>Seller Operations</h3>
          <p>Manage your offerings with dedicated listing pages and controls.</p>
          <ul>
            <li>
              <strong>My Listings</strong>
              <span>Edit, pause, activate, or delete your services.</span>
            </li>
            <li>
              <strong>Create Service</strong>
              <span>Publish a new service with title, category, and pricing.</span>
            </li>
          </ul>
          <div className="overview-actions">
            <Link className="btn-outline" to="/dashboard/services">
              Go to Listings
            </Link>
          </div>
        </article>

        <article className="overview-panel-card">
          <h3>Buyer and Delivery Flow</h3>
          <p>Track every order stage and keep communication tied to each order.</p>
          <ul>
            <li>
              <strong>Orders Workspace</strong>
              <span>Review buyer and seller queues by status.</span>
            </li>
            <li>
              <strong>Order Messaging</strong>
              <span>Discuss requirements and updates per order thread.</span>
            </li>
          </ul>
          <div className="overview-actions">
            <Link className="btn-outline" to="/dashboard/messages">
              Open Messages
            </Link>
          </div>
        </article>
      </section>

      <section className="overview-market-section">
        <div className="overview-market-head">
          <h3>Live Marketplace</h3>
          <p>Browse currently active services from other users.</p>
        </div>
        <Marketplace />
      </section>
    </div>
  );
};

export default Dashboard;
