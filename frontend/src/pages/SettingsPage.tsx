import { useEffect, useState } from "react";
import {
  fetchMySettings,
  resolveMediaUrl,
  updateMyAvatarSettings,
  updateMyPasswordSettings,
  updateMyPreferencesSettings,
  updateMyProfileSettings,
  updateMyProviderProfileSettings,
  type MySettings,
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

const SettingsPage = () => {
  const [settings, setSettings] = useState<MySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [profileState, setProfileState] = useState(initialSaveState);
  const [avatarState, setAvatarState] = useState(initialSaveState);
  const [sellerState, setSellerState] = useState(initialSaveState);
  const [prefsState, setPrefsState] = useState(initialSaveState);
  const [securityState, setSecurityState] = useState(initialSaveState);

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

      <section className="settings-card danger-settings-card">
        <div className="settings-card-head">
          <h3>Account Controls</h3>
          <p>Operational controls commonly available on production marketplaces.</p>
        </div>
        <ul className="settings-actions-list">
          <li>
            <strong>Download account data</strong>
            <span>Export profile, services, orders, and messages.</span>
            <button type="button" className="btn-outline" disabled>
              Coming Soon
            </button>
          </li>
          <li>
            <strong>Deactivate account</strong>
            <span>Temporarily disable your account and hide listings.</span>
            <button type="button" className="btn-outline" disabled>
              Coming Soon
            </button>
          </li>
          <li>
            <strong>Delete account</strong>
            <span>Permanent deletion workflow with verification checks.</span>
            <button type="button" className="btn-outline" disabled>
              Coming Soon
            </button>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default SettingsPage;
