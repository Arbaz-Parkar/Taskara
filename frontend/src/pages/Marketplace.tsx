import "../index.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchServices, resolveMediaUrl, type ServiceSearchParams } from "../utils/api";
import { useSearchParams } from "react-router-dom";

type Service = {
  id: number;
  title: string;
  category: string;
  price: number;
  averageRating?: number;
  totalReviews?: number;
  responseTier?: "FAST" | "DAY" | "SLOW" | "UNKNOWN";
  bestMatchScore?: number;
  seller: {
    id: number;
    name: string;
  };
  images?: {
    id: number;
    fileUrl: string;
    sortOrder: number;
  }[];
};

const formatResponseTier = (tier?: string) => {
  if (tier === "FAST") return "Fast response";
  if (tier === "DAY") return "Responds within 24h";
  if (tier === "SLOW") return "Slower response";
  return "Response time unknown";
};

const Marketplace = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const parseNumber = (value: string | null) => {
      if (!value?.trim()) {
        return undefined;
      }
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const sortParam = searchParams.get("sort");
    const sort: ServiceSearchParams["sort"] =
      sortParam === "BEST_MATCH" ||
      sortParam === "PRICE_LOW_HIGH" ||
      sortParam === "PRICE_HIGH_LOW" ||
      sortParam === "RATING_HIGH_LOW" ||
      sortParam === "RESPONSE_FAST"
        ? sortParam
        : "BEST_MATCH";

    const responseSpeedParam = searchParams.get("responseSpeed");
    const responseSpeed: ServiceSearchParams["responseSpeed"] =
      responseSpeedParam === "FAST" ||
      responseSpeedParam === "DAY" ||
      responseSpeedParam === "SLOW"
        ? responseSpeedParam
        : undefined;

    const loadServices = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchServices({
          q: searchParams.get("q")?.trim() || undefined,
          category: searchParams.get("category")?.trim() || undefined,
          minPrice: parseNumber(searchParams.get("minPrice")),
          maxPrice: parseNumber(searchParams.get("maxPrice")),
          minRating: parseNumber(searchParams.get("minRating")),
          responseSpeed,
          sort,
        });
        setServices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load services");
      } finally {
        setLoading(false);
      }
    };

    void loadServices();
  }, [searchParams]);

  if (loading) {
    return <div className="dashboard-content">Loading services...</div>;
  }

  return (
    <div className="marketplace-container">
      <h2 className="marketplace-title">Explore Services</h2>

      {error ? <p className="form-status form-status-error">{error}</p> : null}

      <div className="marketplace-grid">
        {services.map((service) => (
          <div
            key={service.id}
            className="service-market-card"
            onClick={() => navigate(`/service/${service.id}`)}
          >
            {service.images?.[0]?.fileUrl ? (
              <img
                src={resolveMediaUrl(service.images[0].fileUrl) ?? service.images[0].fileUrl}
                alt={service.title}
                className="service-image-cover"
              />
            ) : (
              <div className="service-image-placeholder" />
            )}

            <div className="service-info">
              <p className="service-category">{service.category}</p>

              <h3>{service.title}</h3>

              <p className="service-seller">
                by{" "}
                <Link
                  to={`/profile/${service.seller.id}`}
                  className="profile-inline-link"
                  onClick={(event) => event.stopPropagation()}
                >
                  <strong>{service.seller.name}</strong>
                </Link>
              </p>

              <p className="service-seller">
                Rating: {(service.averageRating ?? 0).toFixed(1)} ({service.totalReviews ?? 0} reviews)
              </p>
              <p className="service-seller">{formatResponseTier(service.responseTier)}</p>
              {searchParams.get("sort") !== "PRICE_LOW_HIGH" &&
              searchParams.get("sort") !== "PRICE_HIGH_LOW" &&
              searchParams.get("sort") !== "RATING_HIGH_LOW" &&
              searchParams.get("sort") !== "RESPONSE_FAST" ? (
                <p className="service-seller">Best match score: {service.bestMatchScore ?? 0}</p>
              ) : null}

              <div className="service-footer">
                <span>Starting at</span>
                <strong>{`\u20B9${service.price}`}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
