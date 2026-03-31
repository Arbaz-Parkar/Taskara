import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  buildDisputeMessagesStreamUrl,
  createDispute,
  fetchDisputeById,
  fetchEligibleDisputeOrders,
  fetchMyDisputes,
  getCurrentUser,
  resolveMediaUrl,
  sendDisputeMessage,
  updateDisputeTyping,
  type DisputeMessage,
  type DisputeRecord,
  type EligibleDisputeOrder,
} from "../utils/api";

type DisputesMode = "all" | "new" | "cases";

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

type PendingAttachment = {
  id: string;
  file: File;
};

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const formatBytes = (value: number) => {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDisputeStatus = (status: string) => status.replace(/_/g, " ");

const AvatarCircle = ({ avatarUrl, name }: { avatarUrl?: string | null; name: string }) => {
  const [broken, setBroken] = useState(false);
  const src = resolveMediaUrl(avatarUrl);

  return (
    <span className="message-avatar-circle" aria-hidden="true">
      {src && !broken ? (
        <img src={src} alt={`${name} avatar`} onError={() => setBroken(true)} />
      ) : (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4.2 3.6-7 8-7s8 2.8 8 7" />
        </svg>
      )}
    </span>
  );
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

const DisputesPage = ({ mode = "all" }: { mode?: DisputesMode }) => {
  const [disputeState, setDisputeState] = useState(initialSaveState);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [eligibleOrders, setEligibleOrders] = useState<EligibleDisputeOrder[]>([]);
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [selectedOrderIdForDispute, setSelectedOrderIdForDispute] = useState<number | null>(null);
  const [selectedDisputeId, setSelectedDisputeId] = useState<number | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<DisputeRecord | null>(null);
  const [disputeQuery, setDisputeQuery] = useState("");
  const [disputeMessages, setDisputeMessages] = useState<DisputeMessage[]>([]);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeInitialMessage, setDisputeInitialMessage] = useState("");
  const [disputeReplyText, setDisputeReplyText] = useState("");
  const [newDisputeFiles, setNewDisputeFiles] = useState<File[]>([]);
  const [replyDisputeFiles, setReplyDisputeFiles] = useState<PendingAttachment[]>([]);
  const [typingUserIdByDispute, setTypingUserIdByDispute] = useState<Record<number, number | null>>({});
  const typingStateRef = useRef<{ disputeId: number | null; isTyping: boolean }>({
    disputeId: null,
    isTyping: false,
  });

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

  const filteredDisputes = useMemo(() => {
    const q = disputeQuery.trim().toLowerCase();
    if (!q) {
      return disputes;
    }

    return disputes.filter((dispute) =>
      String(dispute.id).includes(q) ||
      String(dispute.orderId).includes(q) ||
      dispute.order.service.title.toLowerCase().includes(q)
    );
  }, [disputeQuery, disputes]);

  const handleDisputeFileSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "new" | "reply"
  ) => {
    const selected = Array.from(event.target.files ?? []);
    if (!selected.length) {
      return;
    }

    const valid = selected.filter((file) => file.size <= MAX_ATTACHMENT_BYTES).slice(0, 5);

    if (type === "new") {
      setNewDisputeFiles(valid);
    } else {
      setReplyDisputeFiles((current) => {
        const existing = new Set(current.map((item) => item.id));
        const merged = [...current];
        valid.forEach((file) => {
          const id = `${file.name}-${file.size}-${file.lastModified}`;
          if (!existing.has(id)) {
            merged.push({ id, file });
          }
        });
        return merged.slice(0, 5);
      });
    }

    event.target.value = "";
  };

  const handleRemoveReplyAttachment = (id: string) => {
    setReplyDisputeFiles((current) => current.filter((item) => item.id !== id));
  };

  const handleCreateDispute = async () => {
    if (!selectedOrderIdForDispute) {
      setDisputeState({ loading: false, message: "", error: "Select a completed or delivered order to raise a dispute." });
      return;
    }

    if (!disputeReason.trim()) {
      setDisputeState({ loading: false, message: "", error: "Dispute reason is required." });
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
      setDisputeState({ loading: false, message: "", error: "Enter a message or attach at least one file." });
      return;
    }

    try {
      setDisputeState({ loading: true, message: "", error: "" });
      const attachments = await Promise.all(
        replyDisputeFiles.map(async ({ file }) => ({
          fileName: file.name,
          mimeType: file.type,
          dataBase64: await fileToBase64(file),
        }))
      );

      const created = await sendDisputeMessage(selectedDisputeId, {
        content: disputeReplyText.trim(),
        attachments,
      });

      setDisputeMessages((previous) =>
        previous.some((message) => message.id === created.id)
          ? previous
          : [...previous, created]
      );
      setDisputeReplyText("");
      setReplyDisputeFiles([]);
      setTypingUserIdByDispute((current) => ({ ...current, [selectedDisputeId]: null }));
      typingStateRef.current = { disputeId: selectedDisputeId, isTyping: false };
      void updateDisputeTyping(selectedDisputeId, false).catch(() => {
        // Ignore typing reset failures after send.
      });
      setDisputeState({ loading: false, message: "Message sent to dispute thread.", error: "" });
    } catch (err) {
      setDisputeState({
        loading: false,
        message: "",
        error: err instanceof Error ? err.message : "Failed to send dispute message",
      });
    }
  };

  useEffect(() => {
    if (!selectedDisputeId) {
      return;
    }

    let stream: EventSource | null = null;

    try {
      stream = new EventSource(buildDisputeMessagesStreamUrl(selectedDisputeId));
      stream.addEventListener("message", (event) => {
        try {
          const nextMessage = JSON.parse(event.data) as DisputeMessage;
          setDisputeMessages((current) => {
            if (current.some((message) => message.id === nextMessage.id)) {
              return current;
            }

            return [
              ...current,
              {
                ...nextMessage,
                sender: {
                  ...nextMessage.sender,
                  avatarUrl: resolveMediaUrl(nextMessage.sender.avatarUrl),
                },
                attachments: (nextMessage.attachments ?? []).map((attachment) => ({
                  ...attachment,
                  fileUrl: resolveMediaUrl(attachment.fileUrl) ?? attachment.fileUrl,
                })),
              },
            ].sort(
              (left, right) =>
                new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
            );
          });
        } catch {
          // Ignore malformed stream messages and keep the dispute thread usable.
        }
      });

      stream.addEventListener("typing", (event) => {
        try {
          const payload = JSON.parse(event.data) as {
            disputeId: number;
            userId: number;
            isTyping: boolean;
          };

          if (payload.userId === currentUserId) {
            return;
          }

          setTypingUserIdByDispute((current) => ({
            ...current,
            [selectedDisputeId]: payload.isTyping ? payload.userId : null,
          }));
        } catch {
          // Ignore malformed typing events and keep dispute chat usable.
        }
      });

      stream.onerror = () => {
        // Let EventSource retry automatically if the connection drops.
      };
    } catch {
      // If the stream cannot be opened, the thread still works with normal fetch/send.
    }

    return () => {
      stream?.close();
    };
  }, [currentUserId, selectedDisputeId]);

  useEffect(() => {
    if (!selectedDisputeId) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const hasContent = disputeReplyText.trim().length > 0;

    const sendTypingState = async (isTyping: boolean) => {
      if (
        typingStateRef.current.disputeId === selectedDisputeId &&
        typingStateRef.current.isTyping === isTyping
      ) {
        return;
      }

      typingStateRef.current = { disputeId: selectedDisputeId, isTyping };

      try {
        await updateDisputeTyping(selectedDisputeId, isTyping);
      } catch {
        // Ignore typing errors to keep dispute compose smooth.
      }
    };

    if (hasContent) {
      void sendTypingState(true);
      timeoutId = setTimeout(() => {
        void sendTypingState(false);
      }, 1800);
    } else {
      void sendTypingState(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [disputeReplyText, selectedDisputeId]);

  const summary = {
    eligible: eligibleOrders.length,
    disputes: disputes.length,
    open: disputes.filter((dispute) => dispute.status === "OPEN").length,
    resolved: disputes.filter((dispute) => dispute.status === "RESOLVED").length,
  };

  const typingUserName =
    selectedDispute && selectedDisputeId && typingUserIdByDispute[selectedDisputeId]
      ? selectedDispute.buyer.id === typingUserIdByDispute[selectedDisputeId]
        ? selectedDispute.buyer.name
        : selectedDispute.seller.id === typingUserIdByDispute[selectedDisputeId]
          ? selectedDispute.seller.name
          : "Admin"
      : null;

  return (
    <div className="reviews-shell">
      <section className="reviews-hero-card reviews-center-hero">
        <div>
          <p className="overview-kicker">Dispute Center</p>
          <h2>{mode === "new" ? "Raise New Dispute" : mode === "cases" ? "My Cases" : "Disputes Overview"}</h2>
          <p>
            {mode === "new"
              ? "Raise a dispute from eligible completed work and attach evidence from one dedicated intake page."
              : mode === "cases"
                ? "Track case updates, message admin, and monitor timeline events from a dedicated case view."
                : "Keep dispute intake separate from case tracking so support flows stay clearer and easier to understand."}
          </p>
        </div>
        <div className="reviews-summary-grid">
          <article>
            <strong>{summary.eligible}</strong>
            <span>Eligible Orders</span>
          </article>
          <article>
            <strong>{summary.disputes}</strong>
            <span>Total Cases</span>
          </article>
        </div>
        <div className="orders-role-switcher reviews-route-switcher">
          <NavLink to="/dashboard/disputes" end className={({ isActive }) => `orders-role-tab ${isActive ? "active" : ""}`}>
            <span>Overview</span>
            <strong>Summary</strong>
          </NavLink>
          <NavLink to="/dashboard/disputes/new" className={({ isActive }) => `orders-role-tab ${isActive ? "active" : ""}`}>
            <span>Intake</span>
            <strong>Raise Dispute</strong>
          </NavLink>
          <NavLink to="/dashboard/disputes/cases" className={({ isActive }) => `orders-role-tab ${isActive ? "active" : ""}`}>
            <span>Tracking</span>
            <strong>My Cases</strong>
          </NavLink>
        </div>
      </section>

      {disputeState.error && <p className="form-status form-status-error">{disputeState.error}</p>}
      {disputeState.message && <p className="form-status form-status-success">{disputeState.message}</p>}

      {mode === "all" && (
        <section className="orders-overview-grid">
          <article className="orders-overview-card orders-overview-card-buyer">
            <div className="orders-overview-head">
              <div>
                <p className="overview-kicker">Raise Dispute</p>
                <h3>Start a new case</h3>
                <p>Choose an eligible order, explain the issue, and upload evidence without mixing the intake form into the case thread view.</p>
              </div>
            </div>
            <div className="orders-overview-stats">
              <article><strong>{summary.eligible}</strong><span>Eligible Orders</span></article>
              <article><strong>{eligibleOrders.filter((order) => !order.dispute).length}</strong><span>Available to Raise</span></article>
              <article><strong>{eligibleOrders.filter((order) => !!order.dispute).length}</strong><span>Already Raised</span></article>
              <article><strong>{summary.open}</strong><span>Open Cases</span></article>
            </div>
          </article>

          <article className="orders-overview-card orders-overview-card-seller">
            <div className="orders-overview-head">
              <div>
                <p className="overview-kicker">My Cases</p>
                <h3>Track dispute threads</h3>
                <p>Keep admin messages, evidence follow-up, and timeline activity in one separate view that is easier to scan.</p>
              </div>
            </div>
            <div className="orders-overview-stats">
              <article><strong>{summary.disputes}</strong><span>Total Cases</span></article>
              <article><strong>{summary.open}</strong><span>Open</span></article>
              <article><strong>{summary.resolved}</strong><span>Resolved</span></article>
              <article><strong>{disputes.filter((dispute) => dispute.status === "UNDER_REVIEW").length}</strong><span>Under Review</span></article>
            </div>
          </article>
        </section>
      )}

      {mode === "new" && (
        <section className="overview-market-section">
          <div className="overview-market-head">
            <h3>Raise New Dispute</h3>
            <p>Select an eligible order, explain the issue clearly, and attach evidence for admin review.</p>
          </div>

          <div className="orders-overview-card orders-overview-card-buyer">
            <div className="settings-grid">
              <label className="create-field">
                <span>Select Order</span>
                <select
                  value={selectedOrderIdForDispute ?? ""}
                  onChange={(event) => setSelectedOrderIdForDispute(event.target.value ? Number(event.target.value) : null)}
                >
                  <option value="">Choose delivered/completed order</option>
                  {eligibleOrders.filter((order) => !order.dispute).map((order) => (
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
                <input type="file" multiple onChange={(event) => handleDisputeFileSelection(event, "new")} />
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
        </section>
      )}

      {mode === "cases" && (
        <section className="messages-shell">
          <section className="messages-list-panel">
            <div className="overview-market-head">
              <h3>My Cases</h3>
              <p>Open a case to view messages, attachments, and status history.</p>
            </div>
            <input
              className="manage-search"
              placeholder="Search disputes by id or service"
              value={disputeQuery}
              onChange={(event) => setDisputeQuery(event.target.value)}
            />
            <div className="messages-list">
              {filteredDisputes.length ? (
                filteredDisputes.map((dispute) => (
                  <button
                    key={dispute.id}
                    type="button"
                    className={`message-thread-btn ${selectedDisputeId === dispute.id ? "active" : ""}`}
                    onClick={() => handleSelectDispute(dispute.id)}
                  >
                    <div className="message-thread-inner">
                      <AvatarCircle
                        name={dispute.buyer.id === currentUserId ? dispute.seller.name : dispute.buyer.name}
                        avatarUrl={dispute.buyer.id === currentUserId ? dispute.seller.avatarUrl : dispute.buyer.avatarUrl}
                      />
                      <div className="message-thread-content">
                        <strong>Dispute #{dispute.id}</strong>
                        <span>{dispute.order.service.title}</span>
                        <small>{formatDisputeStatus(dispute.status)}</small>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="dashboard-placeholder compact-placeholder">
                  <h2>No disputes yet</h2>
                  <p>Your dispute cases will appear here after they are submitted.</p>
                </div>
              )}
            </div>
          </section>

          <section className="messages-chat-panel">
            {selectedDispute ? (
              <>
                <div className="messages-chat-head">
                  <h3>Dispute #{selectedDispute.id}</h3>
                  <p>Order #{selectedDispute.orderId} | Status: {formatDisputeStatus(selectedDispute.status)}</p>
                  <p className="service-seller">{selectedDispute.reason}</p>
                </div>

                <div className="messages-chat-list">
                  {disputeMessages.length === 0 ? (
                    <p className="service-seller">No dispute messages yet.</p>
                  ) : (
                    disputeMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`message-chat-row ${message.senderId === currentUserId ? "outgoing" : "incoming"}`}
                      >
                        <AvatarCircle name={message.sender.name} avatarUrl={message.sender.avatarUrl} />
                        <div className={`order-chat-item ${message.senderId === currentUserId ? "outgoing" : "incoming"}`}>
                          <strong>
                            {message.sender.name} {message.sender.role?.name?.toLowerCase() === "admin" ? "(Admin)" : ""}
                          </strong>
                          <p>{message.content}</p>
                          {(message.attachments ?? []).length > 0 && (
                            <div className="sent-attachment-grid">
                              {(message.attachments ?? []).map((attachment) => (
                                <a
                                  key={attachment.id}
                                  href={resolveMediaUrl(attachment.fileUrl) ?? attachment.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="sent-attachment-card"
                                >
                                  <strong>{attachment.fileName}</strong>
                                  <span>{formatBytes(attachment.size)}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="order-chat-compose">
                  {typingUserName ? (
                    <div className="messages-typing-indicator">
                      <span>{typingUserName} is typing</span>
                      <span className="messages-typing-dot" />
                      <span className="messages-typing-dot" />
                      <span className="messages-typing-dot" />
                    </div>
                  ) : null}
                  <input
                    value={disputeReplyText}
                    onChange={(event) => setDisputeReplyText(event.target.value)}
                    placeholder="Reply to admin in this dispute..."
                  />
                  <label className="message-attach-btn" aria-label="Attach files">
                    Attach
                    <input type="file" multiple onChange={(event) => handleDisputeFileSelection(event, "reply")} />
                  </label>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleSendDisputeReply}
                    disabled={disputeState.loading}
                  >
                    Send
                  </button>
                </div>

                {replyDisputeFiles.length > 0 && (
                  <div className="message-attachment-list">
                    {replyDisputeFiles.map(({ id, file }) => (
                      <div key={id} className="message-attachment-chip">
                        <span>{`${file.name} (${formatBytes(file.size)})`}</span>
                        <button type="button" onClick={() => handleRemoveReplyAttachment(id)}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="messages-upnext-note">
                  Uploaded files are attached to this dispute message and visible to both parties.
                </p>

                {selectedDispute.timeline?.length ? (
                  <div className="orders-section-card">
                    <div className="orders-section-head">
                      <h3>Status Timeline</h3>
                    </div>
                    <div className="order-chat-list">
                      {selectedDispute.timeline.map((event) => (
                        <article key={event.key} className="order-chat-item incoming">
                          <strong>{event.label}</strong>
                          <p>{new Date(event.at).toLocaleString()} by {event.actor.name}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="dashboard-placeholder compact-placeholder">
                <h2>Select a dispute</h2>
                <p>Open a case from the left list to view messages and timeline.</p>
              </div>
            )}
          </section>
        </section>
      )}
    </div>
  );
};

export default DisputesPage;
