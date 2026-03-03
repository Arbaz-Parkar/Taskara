import { useParams } from "react-router-dom";
import MessagesWorkspace from "../components/MessagesWorkspace";

const MessageThreadPage = () => {
  const { orderId } = useParams();

  return <MessagesWorkspace selectedOrderId={orderId} />;
};

export default MessageThreadPage;
