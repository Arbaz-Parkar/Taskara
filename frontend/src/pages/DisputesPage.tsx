import { useEffect, useState } from "react";
import {
  createDispute,
  fetchDisputeById,
  fetchEligibleDisputeOrders,
  fetchMyDisputes,
  getCurrentUser,
  sendDisputeMessage,
  type DisputeMessage,
  type DisputeRecord,
  type EligibleDisputeOrder,
} from "../utils/api";

type SaveState = {
  loading: boolean;
  message: string;
  error: string;
};

const initialSaveState: SaveState = {
  loading: false,
  message: "",
  error: "",
};

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      if (!base64) {
        reject(new Error("Failed to read file"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

const DisputesPage = () => {
  const [disputeState, setDisputeState] = useState(initialSaveState);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [eligibleOrders, setEligibleOrders] = useState<EligibleDisputeOrder[]>([]);
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [selectedOrderIdForDispute, setSelectedOrderIdForDispute] = useState<number | null>(null);
  const [selectedDisputeId, setSelectedDisputeId] = useState<number | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<DisputeRecord | null>(null);
  const [disputeMessages, setDisputeMessages] = useState<DisputeMessage[]>([]);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeInitialMessage, setDisputeInitialMessage] = useState("");
  const [disputeReplyText, setDisputeReplyText] = useState("");
  const [newDisputeFiles, setNewDisputeFiles] = useState<File[]>([]);
  const [replyDisputeFiles, setReplyDisputeFiles] = useState<File[]>([]);

  const loadDisputeWorkspace = async (preferredDisputeId?: number) => {
    try {
      const [ordersData, disputesData] = await Promise.all([
        fetchEligibleDisputeOrders(),
        fetchMyDisputes(),
      ]);

      setEligibleOrders(ordersData);
      setDisputes(disputesData);

      const targetDisputeId =
        preferredDisputeId ?? selectedDisputeId ?? (disputesData.length ? disputesData[0].id : null);

      if (targetDisputeId) {
        const detail = await fetchDisputeById(targetDisputeId);
        setSelectedDisputeId(targetDisputeId);
        setSelectedDispute(detail);
        setDisputeMessages((detail.messages ?? []) as DisputeMessage[]);
      } else {
        setSelectedDisputeId(null);
        setSelectedDispute(null);
        setDisputeMessages([]);
      }
    } catch (err) {
      setDisputeState({
        loading: false,
        message: "",
        error: err instanceof Error ? err.message : "Failed to load dispute workspace",
      });
    }
  };

  useEffect(() => {
    const boot = async () => {
      try {
        const me = await getCurrentUser();
        setCurrentUserId(me.user?.userId ?? null);
      } catch {
        setCurrentUserId(null);
      }
      await loadDisputeWorkspace();
    };

    void boot();
  }, []);

  const handleDisputeFileSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
    mode: "new" | "reply"
  ) => {
    const selected = Array.from(event.target.files ?? []);
    if (!selected.length) {
      return;
    }

    const imageOrDocument = selected.filter((file) => file.size <= 10 * 1024 * 1024);
    const capped = imageOrDocument.slice(0, 5);

    if (mode === "new") {
      setNewDisputeFiles(capped);
    } else {
      setReplyDisputeFiles(capped);
    }
  };

  const handleCreateDispute = async () => {
    if (!selectedOrderIdForDispute) {
      setDisputeState({
        loading: false,
        message: "",
        error: "Select a completed or delivered order to raise a dispute.",
      });
      return;
    }

    if (!disputeReason.trim()) {
      setDisputeState({
        loading: false,
        message: "",
        error: "Dispute reason is required.",
      });
      return;
    }

    try {
      setDisputeState({ loading: true, message: "", error: "" });
      const attachments = await Promise.all(
        newDisputeFiles.map(async (file) => ({
          fileName: file.name,
          mimeType: file.type,
          dataBase64: await fileToBase64(file),
        }))
      );

      const created = await createDispute({
        orderId: selectedOrderIdForDispute,
        reason: disputeReason.trim(),
        message: disputeInitialMessage.trim(),
        attachments,
      });

      setDisputeReason("");
      setDisputeInitialMessage("");
      setNewDisputeFiles([]);
      setSelectedOrderIdForDispute(null);

      await loadDisputeWorkspace(created.id);

      setDisputeState({
        loading: false,
        message: "Dispute submitted successfully. Admin has been notified.",
        error: "",
      });
    } catch (err) {
      setDisputeState({
        loading: false,
        message: "",
        error: err instanceof Error ? err.message : "Failed to create dispute",
      });
    }
  };

  const handleSelectDispute = async (disputeId: number) => {
    try {
      setDisputeState({ loading: true, message: "", error: "" });
      const detail = await fetchDisputeById(disputeId);
      setSelectedDisputeId(disputeId);
      setSelectedDispute(detail);
      setDisputeMessages((detail.messages ?? []) as DisputeMessage[]);
      setDisputeState({ loading: false, message: "", error: "" });
    } catch (err) {
      setDisputeState({
        loading: false,
        message: "",
        error: err instanceof Error ? err.message : "Failed to load dispute thread",
      });
    }
  };

  const handleSendDisputeReply = async () => {
    if (!selectedDisputeId) {
      return;
    }

    const hasText = Boolean(disputeReplyText.trim());
    const hasFiles = replyDisputeFiles.length > 0;

    if (!hasText && !hasFiles) {
      setDisputeState({
        loading: false,
        message: "",
        error: "Enter a message or attach at least one file.",
      });
      return;
    }

    try {
      setDisputeState({ loading: true, message: "", error: "" });
      const attachments = await Promise.all(
        replyDisputeFiles.map(async (file) => ({
          fileName: file.name,
          mimeType: file.type,
          dataBase64: await fileToBase64(file),
        }))
      );

      const created = await sendDisputeMessage(selectedDisputeId, {
        content: disputeReplyText.trim(),
        attachments,
      });

      setDisputeMessages((previous) => [...previous, created]);
      setDisputeReplyText("");
      setReplyDisputeFiles([]);
      setDisputeState({
        loading: false,
        message: "Message sent to dispute thread.",
        error: "",
      });
    } catch (err) {
      setDisputeState({
        loading: false,
        message: "",
        error: err instanceof Error ? err.message : "Failed to send dispute message",
      });
    }
  };

  return (
    <div className="settings-shell">
      <section className="settings-hero-card">
        <div>
          <p className="overview-kicker">Dispute Center</p>
          <h2>Raise, track, and resolve delivery disputes with admin assistance.</h2>
          <p>All dispute communication is tied directly to order records and evidence files.</p>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card-head">
          <h3>Assistance Workspace</h3>
          <p>Use this page for order disputes and admin communication.</p>
        </div>

        <div className="orders-count-grid">
          <article>
            <strong>{eligibleOrders.length}</strong>
            <span>Delivered/Completed Orders</span>
          </article>
          <article>
            <strong>{disputes.length}</strong>
            <span>My Disputes</span>
          </article>
          <article>
            <strong>{disputes.filter((dispute) => dispute.status === "OPEN").length}</strong>
            <span>Open Cases</span>
          </article>
        </div>

        <div className="settings-grid">
          <div className="settings-full-width">
            <h4>Eligible Orders</h4>
            <div className="order-chat-box">
              {eligibleOrders.length ? (
                <div className="order-chat-list">
                  {eligibleOrders.map((order) => (
                    <article key={order.id} className="order-card">
                      <div className="order-card-head">
                        <h4>{order.service.title}</h4>
                        <span className={`order-status-chip ${order.status.toLowerCase()}`}>
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="service-seller">Order #{order.id}</p>
                      {order.dispute ? (
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={() => handleSelectDispute(order.dispute!.id)}
                        >
                          Open Dispute #{order.dispute.id}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={() => setSelectedOrderIdForDispute(order.id)}
                        >
                          Raise Dispute
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="service-seller">No eligible orders for disputes yet.</p>
              )}
            </div>
          </div>

          <div className="settings-full-width">
            <h4>Raise New Dispute</h4>
            <div className="settings-grid">
              <label className="create-field">
                <span>Select Order</span>
                <select
                  value={selectedOrderIdForDispute ?? ""}
                  onChange={(event) =>
                    setSelectedOrderIdForDispute(event.target.value ? Number(event.target.value) : null)
                  }
                >
                  <option value="">Choose delivered/completed order</option>
                  {eligibleOrders
                    .filter((order) => !order.dispute)
                    .map((order) => (
                      <option key={order.id} value={order.id}>
                        #{order.id} - {order.service.title}
                      </option>
                    ))}
                </select>
              </label>

              <label className="create-field settings-full-width">
                <span>Dispute Reason</span>
                <textarea
                  rows={3}
                  value={disputeReason}
                  onChange={(event) => setDisputeReason(event.target.value)}
                  placeholder="Describe the issue in detail for admin review."
                />
              </label>

              <label className="create-field settings-full-width">
                <span>Evidence Notes (Optional)</span>
                <textarea
                  rows={2}
                  value={disputeInitialMessage}
                  onChange={(event) => setDisputeInitialMessage(event.target.value)}
                  placeholder="Add supporting context, timeline, and expected resolution."
                />
              </label>

              <label className="create-field settings-full-width">
                <span>Attach Evidence (Up to 5 files, 10 MB each)</span>
                <input
                  type="file"
                  multiple
                  onChange={(event) => handleDisputeFileSelection(event, "new")}
                />
              </label>
            </div>

            <button
              type="button"
              className="btn-primary dispute-submit-btn"
              onClick={handleCreateDispute}
              disabled={disputeState.loading}
            >
              {disputeState.loading ? "Submitting..." : "Submit Dispute"}
            </button>
          </div>

          <div className="settings-full-width">
            <h4>Dispute Threads</h4>
            <div className="messages-shell">
              <section className="messages-list-panel">
                <h3>My Cases</h3>
                <div className="messages-list">
                  {disputes.length ? (
                    disputes.map((dispute) => (
                      <button
                        key={dispute.id}
                        type="button"
                        className={`message-thread-btn ${selectedDisputeId === dispute.id ? "active" : ""}`}
                        onClick={() => handleSelectDispute(dispute.id)}
                      >
                        <strong>Dispute #{dispute.id}</strong>
                        <span>{dispute.order.service.title}</span>
                        <small>{dispute.status.replace(/_/g, " ")}</small>
                      </button>
                    ))
                  ) : (
                    <p className="service-seller">No disputes created yet.</p>
                  )}
                </div>
              </section>

              <section className="messages-chat-panel">
                {selectedDispute ? (
                  <>
                    <div className="messages-chat-head">
                      <h3>Dispute #{selectedDispute.id}</h3>
                      <p>
                        Order #{selectedDispute.orderId} | Status: {selectedDispute.status.replace(/_/g, " ")}
                      </p>
                    </div>
                    <p className="service-seller">{selectedDispute.reason}</p>

                    <div className="order-chat-box">
                      <div className="order-chat-list">
                        {disputeMessages.map((message) => (
                          <article
                            key={message.id}
                            className={`order-chat-item ${message.senderId === currentUserId ? "outgoing" : "incoming"}`}
                          >
                            <strong>
                              {message.sender.name}{" "}
                              {message.sender.role?.name?.toLowerCase() === "admin" ? "(Admin)" : ""}
                            </strong>
                            <p>{message.content}</p>
                            {(message.attachments ?? []).length > 0 && (
                              <div className="sent-attachment-grid">
                                {(message.attachments ?? []).map((attachment) => (
                                  <a
                                    key={attachment.id}
                                    href={attachment.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="sent-attachment-card"
                                  >
                                    {attachment.fileName}
                                  </a>
                                ))}
                              </div>
                            )}
                          </article>
                        ))}
                      </div>
                    </div>

                    <div className="order-chat-compose">
                      <input
                        value={disputeReplyText}
                        onChange={(event) => setDisputeReplyText(event.target.value)}
                        placeholder="Reply to admin in this dispute..."
                      />
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={handleSendDisputeReply}
                        disabled={disputeState.loading}
                      >
                        Send
                      </button>
                    </div>

                    <label className="create-field settings-full-width">
                      <span>Attach files for this reply</span>
                      <input
                        type="file"
                        multiple
                        onChange={(event) => handleDisputeFileSelection(event, "reply")}
                      />
                    </label>

                    {selectedDispute.timeline?.length ? (
                      <div className="orders-section-card">
                        <div className="orders-section-head">
                          <h3>Status Timeline</h3>
                        </div>
                        <div className="order-chat-list">
                          {selectedDispute.timeline.map((event) => (
                            <article key={event.key} className="order-chat-item incoming">
                              <strong>{event.label}</strong>
                              <p>
                                {new Date(event.at).toLocaleString()} by {event.actor.name}
                              </p>
                            </article>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="dashboard-placeholder">
                    <h2>Select a dispute</h2>
                    <p>Open a case from the left list to view messages and timeline.</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>

        {disputeState.error && <p className="form-status form-status-error">{disputeState.error}</p>}
        {disputeState.message && <p className="form-status form-status-success">{disputeState.message}</p>}
      </section>
    </div>
  );
};

export default DisputesPage;
