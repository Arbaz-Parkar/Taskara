import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Marketplace from "./Marketplace";

const LEGACY_TAB_ROUTES: Record<string, string> = {
  create: "/dashboard/services/new",
  services: "/dashboard/services",
  orders: "/dashboard/orders",
  messages: "/dashboard/messages",
  disputes: "/dashboard/disputes",
  reviews: "/dashboard/reviews",
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
      <section className="overview-market-section">
        <div className="overview-market-head">
          <h3>Marketplace Listings</h3>
          <p>Browse active services from the marketplace.</p>
        </div>
        <Marketplace />
      </section>
    </div>
  );
};

export default Dashboard;
