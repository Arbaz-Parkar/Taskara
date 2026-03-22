import { useParams } from "react-router-dom";
import MessagesWorkspace from "../components/MessagesWorkspace";

const BuyerMessageThreadPage = () => {
  const { orderId } = useParams();

  return <MessagesWorkspace mode="buyer" selectedOrderId={orderId} />;
};

export default BuyerMessageThreadPage;
