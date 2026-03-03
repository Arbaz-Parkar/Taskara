import DashboardShell from "../components/DashboardShell";
import OrdersWorkspace from "../components/OrdersWorkspace";

const SellerOrdersPage = () => {
  return (
    <DashboardShell>
      <OrdersWorkspace mode="seller" />
    </DashboardShell>
  );
};

export default SellerOrdersPage;
