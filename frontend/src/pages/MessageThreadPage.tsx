import { useParams } from "react-router-dom";
import DashboardShell from "../components/DashboardShell";
import MessagesWorkspace from "../components/MessagesWorkspace";

const MessageThreadPage = () => {
  const { orderId } = useParams();

  return (
    <DashboardShell>
      <MessagesWorkspace selectedOrderId={orderId} />
    </DashboardShell>
  );
};

export default MessageThreadPage;
