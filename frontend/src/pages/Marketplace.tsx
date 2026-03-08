import "../index.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { fetchServices, resolveMediaUrl, type ServiceSearchParams } from "../utils/api";

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

type SortMode = NonNullable<ServiceSearchParams["sort"]>;

const formatResponseTier = (tier?: string) => {
  if (tier === "FAST") return "Fast response";
  if (tier === "DAY") return "Responds within 24h";
  if (tier === "SLOW") return "Slower response";
  return "Response time unknown";
};

type MarketplaceProps = {
  initialQuery?: string;
};

const Marketplace = ({ initialQuery = "" }: MarketplaceProps) => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [responseSpeed, setResponseSpeed] = useState<"" | "FAST" | "DAY" | "SLOW">("");
  const [sort, setSort] = useState<SortMode>("BEST_MATCH");

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(services.map((service) => service.category))).sort();
    return categories;
  }, [services]);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchServices({
          q: query.trim() || undefined,
          category: category || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          minRating: minRating ? Number(minRating) : undefined,
          responseSpeed: responseSpeed || undefined,
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
  }, [query, category, minPrice, maxPrice, minRating, responseSpeed, sort]);

  if (loading) {
    return <div className="dashboard-content">Loading services...</div>;
  }

  return (
    <div className="marketplace-container">
      <h2 className="marketplace-title">Explore Services</h2>

      <section className="orders-section-card">
        <div className="orders-section-head">
          <h3>Smart Search and Ranking</h3>
          <p>Filter by category, rating, price, and response speed. Ranked by best match.</p>
        </div>
        <div className="settings-grid">
          <label className="create-field">
            <span>Search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Title, skill, seller, or keyword"
            />
          </label>
          <label className="create-field">
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">All categories</option>
              {categoryOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="create-field">
            <span>Min Price (INR)</span>
            <input
              type="number"
              min={0}
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="0"
            />
          </label>
          <label className="create-field">
            <span>Max Price (INR)</span>
            <input
              type="number"
              min={0}
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Any"
            />
          </label>
          <label className="create-field">
            <span>Min Rating</span>
            <select value={minRating} onChange={(event) => setMinRating(event.target.value)}>
              <option value="">Any rating</option>
              <option value="4.5">4.5+</option>
              <option value="4">4.0+</option>
              <option value="3.5">3.5+</option>
              <option value="3">3.0+</option>
            </select>
          </label>
          <label className="create-field">
            <span>Response Speed</span>
            <select
              value={responseSpeed}
              onChange={(event) =>
                setResponseSpeed(event.target.value as "" | "FAST" | "DAY" | "SLOW")
              }
            >
              <option value="">Any speed</option>
              <option value="FAST">Fast (up to 4h)</option>
              <option value="DAY">Within 24h</option>
              <option value="SLOW">Above 24h</option>
            </select>
          </label>
          <label className="create-field">
            <span>Sort By</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
              <option value="BEST_MATCH">Best Match</option>
              <option value="PRICE_LOW_HIGH">Price: Low to High</option>
              <option value="PRICE_HIGH_LOW">Price: High to Low</option>
              <option value="RATING_HIGH_LOW">Highest Rated</option>
              <option value="RESPONSE_FAST">Fastest Response</option>
            </select>
          </label>
        </div>
      </section>

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
              {sort === "BEST_MATCH" ? (
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
