import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <section className="dashboard-route-layout">
      <Outlet />
    </section>
  );
};

export default DashboardLayout;
