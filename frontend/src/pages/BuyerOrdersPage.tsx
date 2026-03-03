import DashboardShell from "../components/DashboardShell";
import OrdersWorkspace from "../components/OrdersWorkspace";

const BuyerOrdersPage = () => {
  return (
    <DashboardShell>
      <OrdersWorkspace mode="buyer" />
    </DashboardShell>
  );
};

export default BuyerOrdersPage;
