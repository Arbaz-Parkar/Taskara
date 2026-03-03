import { Outlet } from "react-router-dom";
import DashboardShell from "../components/DashboardShell";

const DashboardLayout = () => {
  return (
    <DashboardShell>
      <section className="dashboard-route-layout">
        <Outlet />
      </section>
    </DashboardShell>
  );
};

export default DashboardLayout;
