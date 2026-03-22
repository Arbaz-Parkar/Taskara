import { useParams } from "react-router-dom";
import MessagesWorkspace from "../components/MessagesWorkspace";

const SellerMessageThreadPage = () => {
  const { orderId } = useParams();

  return <MessagesWorkspace mode="seller" selectedOrderId={orderId} />;
};

export default SellerMessageThreadPage;
