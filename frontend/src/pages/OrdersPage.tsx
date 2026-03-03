import DashboardShell from "../components/DashboardShell";
import OrdersWorkspace from "../components/OrdersWorkspace";

const OrdersPage = () => {
  return (
    <DashboardShell>
      <OrdersWorkspace mode="all" />
    </DashboardShell>
  );
};

export default OrdersPage;
