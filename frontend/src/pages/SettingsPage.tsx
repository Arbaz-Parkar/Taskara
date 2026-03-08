import { useEffect, useState } from "react";
import {
  createDispute,
  deactivateMyAccount,
  fetchDisputeById,
  fetchEligibleDisputeOrders,
  fetchMyDisputes,
  deleteMyAccount,
  sendDisputeMessage,
  exportMyAccountData,
  fetchMySettings,
  resolveMediaUrl,
  updateMyAvatarSettings,
  updateMyPasswordSettings,
  updateMyPreferencesSettings,
  updateMyProfileSettings,
  updateMyProviderProfileSettings,
  type DisputeMessage,
  type DisputeRecord,
  type EligibleDisputeOrder,
  type MySettings,
} from "../utils/api";
import { logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";

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

const SettingsPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<MySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [profileState, setProfileState] = useState(initialSaveState);
  const [avatarState, setAvatarState] = useState(initialSaveState);
  const [sellerState, setSellerState] = useState(initialSaveState);
  const [prefsState, setPrefsState] = useState(initialSaveState);
  const [securityState, setSecurityState] = useState(initialSaveState);
  const [accountState, setAccountState] = useState(initialSaveState);
  const [disputeState, setDisputeState] = useState(initialSaveState);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");

  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [baseHourlyRate, setBaseHourlyRate] = useState("");
  const [serviceRadiusKm, setServiceRadiusKm] = useState("");

  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [language, setLanguage] = useState("English");
  const [currency, setCurrency] = useState("INR");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [marketingNotifications, setMarketingNotifications] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState("PUBLIC");
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

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

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const data = await fetchMySettings();
        setSettings(data);

        setName(data.name ?? "");
        setPhone(data.phone ?? "");
        setAvatarUrl(data.avatarUrl ?? "");
        setAvatarPreviewUrl(data.avatarUrl ?? "");
        setTitle(data.title ?? "");
        setCountry(data.country ?? "");

        setBio(data.providerProfile?.bio ?? "");
        setExperienceYears(
          data.providerProfile?.experienceYears != null
            ? String(data.providerProfile.experienceYears)
            : ""
        );
        setBaseHourlyRate(
          data.providerProfile?.baseHourlyRate != null
            ? String(data.providerProfile.baseHourlyRate)
            : ""
        );
        setServiceRadiusKm(
          data.providerProfile?.serviceRadiusKm != null
            ? String(data.providerProfile.serviceRadiusKm)
            : ""
        );

        setTimezone(data.timezone ?? "Asia/Kolkata");
        setLanguage(data.language ?? "English");
        setCurrency(data.currency ?? "INR");
        setEmailNotifications(Boolean(data.emailNotifications));
        setOrderNotifications(Boolean(data.orderNotifications));
        setMessageNotifications(Boolean(data.messageNotifications));
        setMarketingNotifications(Boolean(data.marketingNotifications));
        setProfileVisibility(data.profileVisibility ?? "PUBLIC");
        setShowOnlineStatus(Boolean(data.showOnlineStatus));
      } catch (err) {
        if (err instanceof Error) {
          setLoadError(err.message);
        } else {
          setLoadError("Failed to load settings");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const loadDisputeWorkspace = async (preferredDisputeId?: number) => {
    try {
      const [ordersData, disputesData] = await Promise.all([
        fetchEligibleDisputeOrders(),
        fetchMyDisputes(),
      ]);

      setEligibleOrders(ordersData);
      setDisputes(disputesData);

      const targetDisputeId =
        preferredDisputeId ??
        selectedDisputeId ??
        (disputesData.length ? disputesData[0].id : null);

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
    void loadDisputeWorkspace();
  }, []);

  const handleProfileSave = async () => {
    try {
      setProfileState({ loading: true, message: "", error: "" });
      await updateMyProfileSettings({
        name: name.trim(),
        phone: phone.trim() || null,
        title: title.trim() || null,
        country: country.trim() || null,
      });
      window.dispatchEvent(new Event("taskara:user-updated"));
      setProfileState({
        loading: false,
        message: "Profile settings updated successfully.",
        error: "",
      });
    } catch (err) {
      setProfileState({
        loading: false,
        message: "",
        error: err instanceof Error ? err.message : "Failed to update profile settings",
      });
    }
  };

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setAvatarState({
        loading: false,
        message: "",
        error: "Please select an image file.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarState({
        loading: false,
        message: "",
        error: "Avatar must be 5 MB or less.",
      });
      return;
    }

    setSelectedAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
    setAvatarState(initialSaveState);
  };

  const handleAvatarUpload = async () => {
    if (!selectedAvatarFile) {
      setAvatarState({
        loading: false,
        message: "",
        error: "Please choose an image first.",
      });
      return;
    }

    try {
      setAvatarState({ loading: true, message: "", error: "" });
      const dataBase64 = await fileToBase64(selectedAvatarFile);
      const updated = await updateMyAvatarSettings({
        fileName: selectedAvatarFile.name,
        mimeType: selectedAvatarFile.type,
        dataBase64,
      });

      setAvatarUrl(updated.avatarUrl ?? "");
      setAvatarPreviewUrl(resolveMediaUrl(updated.avatarUrl) ?? avatarPreviewUrl);
      setSelectedAvatarFile(null);
      window.dispatchEvent(new Event("taskara:user-updated"));

      setAvatarState({
        loading: false,
        message: "Avatar updated successfully.",
        error: "",
      });
    } catch (err) {
      setAvatarState({
        loading: false,
        message: "",
        error: err instanceof Error ? err.message : "Failed to upload avatar",
      });
    }
  };

  const handleSellerProfileSave = async () => {
    try {
      setSellerState({ loading: true, message: "", error: "" });
      await updateMyProviderProfileSettings({
        bio: bio.trim() || null,
        experienceYears: experienceYears ? Number(experienceYears) : null,
        baseHourlyRate: baseHourlyRate ? Number(baseHourlyRate) : null,
        serviceRadiusKm: serviceRadiusKm ? Number(serviceRadiusKm) : null,
      });
      setSellerState({
        loading: false,
        message: "Seller profile updated successfully.",
        error: "",
      });
    } catch (err) {
      setSellerState({
        loading: false,
        message: "",
        error: err instanceof Error ? err.message : "Failed to update seller profile",
      });
    }
  };

  const handlePreferencesSave = async () => {
    try {
      setPrefsState({ loading: true, message: "", error: "" });
      await updateMyPreferencesSettings({
        timezone,
        language,
        currency,
        emailNotifications,
        orderNotifications,
        messageNotifications,
        marketingNotifications,
        profileVisibility,
        showOnlineStatus,
      });
      setPrefsState({
        loading: false,
        message: "Preferences updated successfully.",
        error: "",
      });
    } catch (err) {
      setPrefsState({
        loading: false,
        message: "",
        error: err instanceof Error ? err.message : "Failed to update preferences",
      });
    }
  };

  const handlePasswordSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityState({
        loading: false,
        message: "",
        error: "Please fill current, new, and confirm password fields.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityState({
        loading: false,
        message: "",
        error: "New password and confirm password do not match.",
      });
      return;
    }

    try {
      setSecurityState({ loading: true, message: "", error: "" });
      await updateMyPasswordSettings({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSecurityState({
        loading: false,
        message: "Password updated successfully.",
        error: "",
      });
    } catch (err) {
      setSecurityState({
        loading: false,
        message: "",
        error: err instanceof Error ? err.message : "Failed to update password",
      });
    }
  };

  const handleExportData = async () => {
    try {
      setAccountState({ loading: true, message: "", error: "" });
      const data = await exportMyAccountData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `taskara-account-export-${new Date().toISOString()}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      setAccountState({
        loading: false,
        message: "Account data exported successfully.",
        error: "",
      });
    } catch (err) {
      setAccountState({
        loading: false,
        message: "",
        error: err instanceof Error ? err.message : "Failed to export data",
      });
    }
  };

  const handleDeactivateAccount = async () => {
    if (!deactivatePassword) {
      setAccountState({
        loading: false,
        message: "",
        error: "Enter your current password to deactivate account.",
      });
      return;
    }

    try {
      setAccountState({ loading: true, message: "", error: "" });
      await deactivateMyAccount(deactivatePassword);
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setAccountState({
        loading: false,
        message: "",
        error: err instanceof Error ? err.message : "Failed to deactivate account",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setAccountState({
        loading: false,
        message: "",
        error: "Enter your current password to delete account.",
      });
      return;
    }

    if (deleteConfirmText !== "DELETE") {
      setAccountState({
        loading: false,
        message: "",
        error: 'Type "DELETE" to confirm permanent deletion.',
      });
      return;
    }

    try {
      setAccountState({ loading: true, message: "", error: "" });
      await deleteMyAccount(deletePassword, deleteConfirmText);
      logout();
      navigate("/register", { replace: true });
    } catch (err) {
      setAccountState({
        loading: false,
        message: "",
        error: err instanceof Error ? err.message : "Failed to delete account",
      });
    }
  };

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

  if (loading) {
    return <div className="dashboard-placeholder">Loading settings...</div>;
  }

  if (loadError || !settings) {
    return (
      <div className="dashboard-placeholder">
        <h2>Could not load settings</h2>
        <p>{loadError || "Unknown error occurred"}</p>
      </div>
    );
  }

  return (
    <div className="settings-shell">
      <section className="settings-hero-card">
        <div>
          <p className="overview-kicker">Account Settings</p>
          <h2>Control your account, seller profile, and privacy preferences.</h2>
          <p>All changes save directly to your Taskara account.</p>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card-head">
          <h3>Profile and Identity</h3>
          <p>Update your public identity used across marketplace and dashboard.</p>
        </div>

        <div className="settings-grid">
          <div className="settings-avatar-block settings-full-width">
            <div className="settings-avatar-preview">
              {avatarPreviewUrl ? (
                <img src={avatarPreviewUrl} alt="Avatar preview" />
              ) : (
                <span aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4.2 3.6-7 8-7s8 2.8 8 7" />
                  </svg>
                </span>
              )}
            </div>
            <div className="settings-avatar-actions">
              <label className="btn-outline settings-file-btn">
                Choose Avatar
                <input type="file" accept="image/*" onChange={handleAvatarSelect} />
              </label>
              <button
                type="button"
                className="btn-primary"
                onClick={handleAvatarUpload}
                disabled={avatarState.loading}
              >
                {avatarState.loading ? "Uploading..." : "Upload Avatar"}
              </button>
              {avatarUrl && <p className="service-seller">Current avatar is active.</p>}
            </div>
          </div>

          <label className="create-field">
            <span>Full Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>

          <label className="create-field">
            <span>Phone</span>
            <input value={phone} onChange={(event) => setPhone(event.target.value)} />
          </label>

          <label className="create-field">
            <span>Professional Title</span>
            <input
              placeholder="e.g. Full Stack Developer"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <label className="create-field">
            <span>Country</span>
            <input value={country} onChange={(event) => setCountry(event.target.value)} />
          </label>
        </div>

        {avatarState.error && <p className="form-status form-status-error">{avatarState.error}</p>}
        {avatarState.message && <p className="form-status form-status-success">{avatarState.message}</p>}
        {profileState.error && <p className="form-status form-status-error">{profileState.error}</p>}
        {profileState.message && (
          <p className="form-status form-status-success">{profileState.message}</p>
        )}

        <button className="btn-primary" onClick={handleProfileSave} disabled={profileState.loading}>
          {profileState.loading ? "Saving..." : "Save Profile"}
        </button>
      </section>

      <section className="settings-card">
        <div className="settings-card-head">
          <h3>Seller Profile</h3>
          <p>Configure your marketplace-facing seller details and work capacity.</p>
        </div>

        <div className="settings-grid">
          <label className="create-field settings-full-width">
            <span>Bio</span>
            <textarea value={bio} rows={4} onChange={(event) => setBio(event.target.value)} />
          </label>

          <label className="create-field">
            <span>Experience (Years)</span>
            <input
              type="number"
              min="0"
              value={experienceYears}
              onChange={(event) => setExperienceYears(event.target.value)}
            />
          </label>

          <label className="create-field">
            <span>Base Hourly Rate (INR)</span>
            <input
              type="number"
              min="0"
              value={baseHourlyRate}
              onChange={(event) => setBaseHourlyRate(event.target.value)}
            />
          </label>

          <label className="create-field">
            <span>Service Radius (Km)</span>
            <input
              type="number"
              min="0"
              value={serviceRadiusKm}
              onChange={(event) => setServiceRadiusKm(event.target.value)}
            />
          </label>
        </div>

        {sellerState.error && <p className="form-status form-status-error">{sellerState.error}</p>}
        {sellerState.message && <p className="form-status form-status-success">{sellerState.message}</p>}

        <button className="btn-primary" onClick={handleSellerProfileSave} disabled={sellerState.loading}>
          {sellerState.loading ? "Saving..." : "Save Seller Profile"}
        </button>
      </section>

      <section className="settings-card">
        <div className="settings-card-head">
          <h3>Notifications, Privacy, and Preferences</h3>
          <p>Control communication channels, visibility, and locale defaults.</p>
        </div>

        <div className="settings-grid">
          <label className="create-field">
            <span>Timezone</span>
            <input value={timezone} onChange={(event) => setTimezone(event.target.value)} />
          </label>

          <label className="create-field">
            <span>Language</span>
            <input value={language} onChange={(event) => setLanguage(event.target.value)} />
          </label>

          <label className="create-field">
            <span>Currency</span>
            <input value={currency} onChange={(event) => setCurrency(event.target.value)} />
          </label>

          <label className="create-field">
            <span>Profile Visibility</span>
            <select
              value={profileVisibility}
              onChange={(event) => setProfileVisibility(event.target.value)}
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </label>

          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(event) => setEmailNotifications(event.target.checked)}
            />
            <span>Email notifications</span>
          </label>

          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={orderNotifications}
              onChange={(event) => setOrderNotifications(event.target.checked)}
            />
            <span>Order notifications</span>
          </label>

          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={messageNotifications}
              onChange={(event) => setMessageNotifications(event.target.checked)}
            />
            <span>Message notifications</span>
          </label>

          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={marketingNotifications}
              onChange={(event) => setMarketingNotifications(event.target.checked)}
            />
            <span>Marketing notifications</span>
          </label>

          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={showOnlineStatus}
              onChange={(event) => setShowOnlineStatus(event.target.checked)}
            />
            <span>Show online status</span>
          </label>
        </div>

        {prefsState.error && <p className="form-status form-status-error">{prefsState.error}</p>}
        {prefsState.message && <p className="form-status form-status-success">{prefsState.message}</p>}

        <button className="btn-primary" onClick={handlePreferencesSave} disabled={prefsState.loading}>
          {prefsState.loading ? "Saving..." : "Save Preferences"}
        </button>
      </section>

      <section className="settings-card">
        <div className="settings-card-head">
          <h3>Security</h3>
          <p>Change your password and harden account access.</p>
        </div>

        <div className="settings-grid">
          <label className="create-field">
            <span>Current Password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </label>

          <label className="create-field">
            <span>New Password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </label>

          <label className="create-field">
            <span>Confirm New Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
        </div>

        {securityState.error && <p className="form-status form-status-error">{securityState.error}</p>}
        {securityState.message && (
          <p className="form-status form-status-success">{securityState.message}</p>
        )}

        <button className="btn-primary" onClick={handlePasswordSave} disabled={securityState.loading}>
          {securityState.loading ? "Updating..." : "Update Password"}
        </button>
      </section>

      <section className="settings-card">
        <div className="settings-card-head">
          <h3>Assistance and Dispute Center</h3>
          <p>Raise disputes on delivered/completed orders and chat with admin for resolution.</p>
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
                    setSelectedOrderIdForDispute(
                      event.target.value ? Number(event.target.value) : null
                    )
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
              className="btn-primary"
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
                        className={`message-thread-btn ${
                          selectedDisputeId === dispute.id ? "active" : ""
                        }`}
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
                        Order #{selectedDispute.orderId} | Status:{" "}
                        {selectedDispute.status.replace(/_/g, " ")}
                      </p>
                    </div>
                    <p className="service-seller">{selectedDispute.reason}</p>

                    <div className="order-chat-box">
                      <div className="order-chat-list">
                        {disputeMessages.map((message) => (
                          <article
                            key={message.id}
                            className={`order-chat-item ${
                              message.senderId === settings.id ? "outgoing" : "incoming"
                            }`}
                          >
                              <strong>
                                {message.sender.name}{" "}
                                {message.sender.role?.name?.toLowerCase() === "admin"
                                  ? "(Admin)"
                                  : ""}
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
        {disputeState.message && (
          <p className="form-status form-status-success">{disputeState.message}</p>
        )}
      </section>

      <section className="settings-card danger-settings-card">
        <div className="settings-card-head">
          <h3>Account Controls</h3>
        </div>
        <ul className="settings-actions-list">
          <li>
            <strong>Download account data</strong>
            <span>Export profile, services, orders, and messages.</span>
            <button
              type="button"
              className="btn-outline"
              onClick={handleExportData}
              disabled={accountState.loading}
            >
              {accountState.loading ? "Exporting..." : "Download JSON Export"}
            </button>
          </li>
          <li>
            <strong>Deactivate account</strong>
            <span>Temporarily disable your account and hide listings.</span>
            <label className="create-field">
              <span>Current Password</span>
              <input
                type="password"
                value={deactivatePassword}
                onChange={(event) => setDeactivatePassword(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="btn-outline"
              onClick={handleDeactivateAccount}
              disabled={accountState.loading}
            >
              Deactivate Account
            </button>
          </li>
          <li>
            <strong>Delete account</strong>
            <span>Delete your account permanently.</span>
            <label className="create-field">
              <span>Current Password</span>
              <input
                type="password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
              />
            </label>
            <label className="create-field">
              <span>Type DELETE to confirm</span>
              <input
                value={deleteConfirmText}
                onChange={(event) => setDeleteConfirmText(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="btn-outline danger-button"
              onClick={handleDeleteAccount}
              disabled={accountState.loading}
            >
              Permanently Delete Account
            </button>
          </li>
        </ul>

        {accountState.error && <p className="form-status form-status-error">{accountState.error}</p>}
        {accountState.message && (
          <p className="form-status form-status-success">{accountState.message}</p>
        )}
      </section>
    </div>
  );
};

export default SettingsPage;
