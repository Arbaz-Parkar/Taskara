import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchPublicUserProfile,
  fetchPublicUserServices,
  type PublicUserProfile,
  type PublicUserService,
} from "../utils/api";

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const PublicProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [services, setServices] = useState<PublicUserService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!userId) {
        setError("Invalid profile link");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const [profileData, servicesData] = await Promise.all([
          fetchPublicUserProfile(userId),
          fetchPublicUserServices(userId),
        ]);
        setProfile(profileData);
        setServices(servicesData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="public-profile-shell">
        <div className="dashboard-placeholder">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="public-profile-shell">
        <div className="dashboard-placeholder">
          <h2>Could not load profile</h2>
          <p>{error || "Profile not found"}</p>
          <Link to="/" className="btn-outline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="public-profile-shell">
      <section className="public-profile-hero">
        <p className="overview-kicker">Taskara Profile</p>
        <h1>{profile.name}</h1>
        <p className="public-profile-meta">
          Joined {formatDate(profile.createdAt)} | Active services: {profile.activeServicesCount}
        </p>
        <p className="public-profile-meta">{profile.email}</p>

        <div className="public-profile-badges">
          <span>{profile.providerProfile?.verified ? "Verified Seller" : "Unverified Seller"}</span>
          <span>Rating: {profile.providerProfile?.averageRating ?? 0}</span>
          <span>Reviews: {profile.providerProfile?.totalReviews ?? 0}</span>
        </div>

        {profile.providerProfile?.bio && <p className="public-profile-bio">{profile.providerProfile.bio}</p>}
      </section>

      <section className="overview-market-section">
        <div className="overview-market-head">
          <h3>{profile.name}'s Active Services</h3>
          <p>Browse currently listed services by this seller.</p>
        </div>

        {services.length === 0 ? (
          <div className="dashboard-placeholder compact-placeholder">
            <h2>No active services</h2>
            <p>This seller does not have active services right now.</p>
          </div>
        ) : (
          <div className="manage-list-grid">
            {services.map((service) => (
              <article key={service.id} className="manage-service-card">
                <p className="service-category">{service.category}</p>
                <h3>{service.title}</h3>
                <p className="service-seller">{service.description}</p>
                <div className="service-footer">
                  <span>Starting at</span>
                  <strong>{`\u20B9${service.price}`}</strong>
                </div>
                <Link to={`/service/${service.id}`} className="btn-outline">
                  View Service
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PublicProfile;
