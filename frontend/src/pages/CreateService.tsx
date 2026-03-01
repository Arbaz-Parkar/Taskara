import { useMemo, useState } from "react";
import { createService } from "../utils/api";

type FormState = {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  listingType: string;
  tags: string;
  deliveryDays: string;
  revisions: string;
  price: string;
};

const categoryCatalog: Record<string, string[]> = {
  "Graphics & Design": [
    "Logo Design",
    "Brand Style Guides",
    "UI/UX Design",
    "Social Media Design",
    "Video Editing",
    "Presentation Design",
  ],
  "Programming & Tech": [
    "Website Development",
    "Mobile App Development",
    "E-commerce Development",
    "AI Integrations",
    "QA & Testing",
    "API Development",
  ],
  "Digital Marketing": [
    "Search Engine Optimization",
    "Social Media Marketing",
    "Performance Ads",
    "Email Marketing",
    "Influencer Marketing",
    "Marketing Strategy",
  ],
  "Writing & Translation": [
    "Website Copywriting",
    "Blog & Article Writing",
    "Technical Writing",
    "Translation",
    "Proofreading & Editing",
    "Script Writing",
  ],
  "Video & Animation": [
    "Explainer Videos",
    "Short-form Video Ads",
    "Animation",
    "Video Post Production",
    "UGC Video Creation",
  ],
  "Music & Audio": [
    "Podcast Editing",
    "Voice Over",
    "Music Production",
    "Audio Mixing",
    "Sound Design",
  ],
  Business: [
    "Virtual Assistant",
    "Market Research",
    "Business Plans",
    "Customer Support",
    "Data Entry",
  ],
  "AI Services": [
    "Prompt Engineering",
    "Workflow Automation",
    "Model Fine-Tuning",
    "AI Chatbot Setup",
    "AI Content Workflows",
  ],
};

const initialForm: FormState = {
  title: "",
  description: "",
  category: "",
  subcategory: "",
  listingType: "Fixed Price",
  tags: "",
  deliveryDays: "3",
  revisions: "2",
  price: "",
};

const CreateService = () => {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const subcategoryOptions = useMemo(() => {
    if (!form.category) {
      return [];
    }

    return categoryCatalog[form.category] ?? [];
  }, [form.category]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "category") {
      setForm((prev) => ({
        ...prev,
        category: value,
        subcategory: "",
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      setSubmitting(true);

      const categoryLabel = form.subcategory
        ? `${form.category} / ${form.subcategory}`
        : form.category;

      await createService({
        title: form.title,
        description: form.description,
        category: categoryLabel,
        price: Number(form.price),
      });

      setMessage("Service published successfully.");
      setForm(initialForm);
    } catch (err) {
      const apiError =
        err instanceof Error ? err.message : "Failed to publish service";
      setError(apiError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="create-service-shell">
      <div className="create-service-hero">
        <p className="create-service-kicker">Seller Studio</p>
        <h2>Create a high-converting service listing</h2>
        <p>
          Structure your gig like top sellers on leading marketplaces: clear
          niche, specific outcomes, and transparent delivery expectations.
        </p>

        <ul className="create-service-points">
          <li>Pick a focused category and subcategory for better discoverability.</li>
          <li>Use strong search tags so buyers can find your listing quickly.</li>
          <li>Set a realistic delivery SLA and revision policy.</li>
        </ul>

        <div className="create-service-metrics">
          <article>
            <strong>Top sellers</strong>
            <span>list 6+ niche tags per service</span>
          </article>
          <article>
            <strong>Fast response</strong>
            <span>improves conversion by up to 2x</span>
          </article>
        </div>
      </div>

      <form className="create-service-form" onSubmit={handleSubmit}>
        <div className="create-service-form-head">
          <h3>Service Details</h3>
          <p>Build trust with a complete and professional listing.</p>
        </div>

        <label className="create-field">
          <span>Service Title</span>
          <input
            name="title"
            placeholder="I will build a high-converting Shopify product page"
            value={form.title}
            onChange={handleChange}
            required
          />
        </label>

        <div className="create-grid-two">
          <label className="create-field">
            <span>Category</span>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select primary category
              </option>
              {Object.keys(categoryCatalog).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="create-field">
            <span>Subcategory</span>
            <select
              name="subcategory"
              value={form.subcategory}
              onChange={handleChange}
              disabled={!form.category}
              required
            >
              <option value="" disabled>
                Select subcategory
              </option>
              {subcategoryOptions.map((subCategory) => (
                <option key={subCategory} value={subCategory}>
                  {subCategory}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="create-grid-three">
          <label className="create-field">
            <span>Pricing Model</span>
            <select
              name="listingType"
              value={form.listingType}
              onChange={handleChange}
            >
              <option value="Fixed Price">Fixed Price</option>
              <option value="Package Based">Package Based</option>
              <option value="Hourly">Hourly</option>
            </select>
          </label>

          <label className="create-field">
            <span>Delivery (days)</span>
            <select
              name="deliveryDays"
              value={form.deliveryDays}
              onChange={handleChange}
            >
              <option value="1">1 day</option>
              <option value="2">2 days</option>
              <option value="3">3 days</option>
              <option value="5">5 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
            </select>
          </label>

          <label className="create-field">
            <span>Revisions</span>
            <select
              name="revisions"
              value={form.revisions}
              onChange={handleChange}
            >
              <option value="0">No revisions</option>
              <option value="1">1 revision</option>
              <option value="2">2 revisions</option>
              <option value="3">3 revisions</option>
              <option value="Unlimited">Unlimited</option>
            </select>
          </label>
        </div>

        <label className="create-field">
          <span>Search Tags</span>
          <input
            name="tags"
            placeholder="shopify, product page, conversion rate, ecommerce"
            value={form.tags}
            onChange={handleChange}
          />
          <small>Comma-separated tags help your gig rank in search.</small>
        </label>

        <label className="create-field">
          <span>Description</span>
          <textarea
            name="description"
            placeholder="Describe scope, deliverables, revisions, and what buyers should provide."
            value={form.description}
            onChange={handleChange}
            rows={6}
            required
          />
        </label>

        <label className="create-field create-price-field">
          <span>Starting Price (INR)</span>
          <input
            name="price"
            type="number"
            min="1"
            step="1"
            placeholder="1500"
            value={form.price}
            onChange={handleChange}
            required
          />
        </label>

        {error && <p className="form-status form-status-error">{error}</p>}
        {message && <p className="form-status form-status-success">{message}</p>}

        <button className="btn-primary create-submit-btn" disabled={submitting}>
          {submitting ? "Publishing..." : "Publish Service"}
        </button>
      </form>
    </section>
  );
};

export default CreateService;
