import { Link, useParams } from "react-router-dom";
import logo from "../assets/logo.png";

type FooterNavItem = {
  label: string;
  slug: string;
};

type FooterNavGroup = {
  title: string;
  items: FooterNavItem[];
};

const footerNavGroups: FooterNavGroup[] = [
  {
    title: "For Clients",
    items: [
      { label: "How Taskara Works", slug: "how-taskara-works" },
      { label: "Quality Guide", slug: "quality-guide" },
      { label: "Project Briefs", slug: "project-briefs" },
      { label: "Hiring Support", slug: "hiring-support" },
      { label: "Enterprise Solutions", slug: "enterprise-solutions" },
      { label: "Trust & Safety", slug: "trust-and-safety" },
    ],
  },
  {
    title: "For Sellers",
    items: [
      { label: "Become a Seller", slug: "become-a-seller" },
      { label: "Seller Handbook", slug: "seller-handbook" },
      { label: "Community Hub", slug: "community-hub" },
      { label: "Seller Success Stories", slug: "seller-success-stories" },
      { label: "Service Catalog Tips", slug: "service-catalog-tips" },
      { label: "Affiliate Program", slug: "affiliate-program" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", slug: "about" },
      { label: "Careers", slug: "careers" },
      { label: "Terms of Service", slug: "terms-of-service" },
      { label: "Privacy Policy", slug: "privacy-policy" },
      { label: "Press & News", slug: "press-and-news" },
      { label: "Contact", slug: "contact" },
    ],
  },
];

const defaultItem = footerNavGroups[0].items[0];

const howTaskaraWorksSteps = [
  {
    title: "1. Explore services",
    description:
      "Browse the marketplace, compare listings, open dedicated service pages, and review pricing, seller details, and ratings before making a decision.",
  },
  {
    title: "2. Place an order",
    description:
      "Once you find the right service, continue to order and create a proper marketplace transaction tied to that listing.",
  },
  {
    title: "3. Work happens inside the platform",
    description:
      "Buyers and sellers stay connected through order-linked messaging, updates, attachments, and delivery flow so communication stays organized.",
  },
  {
    title: "4. Complete, review, and build trust",
    description:
      "After the work is finished, the buyer can complete the order, leave a rating and review, and help strengthen marketplace trust for future users.",
  },
];

const howTaskaraWorksSignals = [
  "Dedicated service pages for every listing",
  "Buyer and seller order workspaces",
  "Messaging tied directly to each order",
  "Ratings, reviews, and public profiles",
  "Dispute support when an order needs help",
];

const findItemBySlug = (slug?: string) => {
  if (!slug) {
    return defaultItem;
  }

  for (const group of footerNavGroups) {
    const item = group.items.find((entry) => entry.slug === slug);
    if (item) {
      return item;
    }
  }

  return defaultItem;
};

const FooterContentPage = () => {
  const { slug } = useParams();
  const activeItem = findItemBySlug(slug);
  const isHowTaskaraWorks = activeItem.slug === "how-taskara-works";

  return (
    <div className="footer-page-shell">
      <div className="footer-page-header">
        <Link to="/" className="footer-page-brand" aria-label="Go to home">
          <img src={logo} alt="Taskara" className="footer-page-logo" />
        </Link>
      </div>

      <div className="footer-page-layout">
        <aside className="footer-page-sidebar">
          <p className="footer-page-kicker">TASKARA GUIDE</p>
          <h1>Information Center</h1>
          <p className="footer-page-intro">
            This page will hold the content linked from the footer across client, seller, and
            company sections.
          </p>

          <nav className="footer-page-nav" aria-label="Footer navigation">
            {footerNavGroups.map((group) => (
              <div key={group.title} className="footer-page-nav-group">
                <h2>{group.title}</h2>
                <ul>
                  {group.items.map((item) => {
                    const isActive = item.slug === activeItem.slug;

                    return (
                      <li key={item.slug}>
                        <Link
                          to={`/abouts/${item.slug}`}
                          className={isActive ? "active" : undefined}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <section className="footer-page-content">
          <div className="footer-page-card">
            <p className="footer-page-section-label">Selected Section</p>
            <h2>{activeItem.label}</h2>
            {isHowTaskaraWorks ? (
              <p>
                Taskara is built around a complete marketplace flow where clients can discover the
                right service, place orders, communicate clearly, receive delivery, and review the
                experience in one connected system.
              </p>
            ) : (
              <p>
                This is the shell for the <strong>{activeItem.label}</strong> section. We can now
                build each footer topic one by one and load its actual content into this page.
              </p>
            )}
          </div>

          {isHowTaskaraWorks ? (
            <>
              <div className="footer-info-grid">
                <article className="footer-page-placeholder-card footer-info-card">
                  <h3>For clients</h3>
                  <p>
                    Clients can search for local and digital services, compare listings, review
                    seller profiles, and order the service that best matches their needs.
                  </p>
                </article>

                <article className="footer-page-placeholder-card footer-info-card">
                  <h3>For sellers</h3>
                  <p>
                    Sellers can create service listings, manage their own storefront, receive
                    buyer orders, communicate inside the platform, and grow their reputation over
                    time.
                  </p>
                </article>
              </div>

              <div className="footer-page-placeholder-card footer-journey-card">
                <div className="footer-journey-head">
                  <div>
                    <p className="footer-page-section-label">Marketplace Journey</p>
                    <h3>How the Taskara flow works from start to finish</h3>
                  </div>
                  <p>
                    The platform is designed to feel structured, transparent, and reliable for
                    both sides of a service transaction.
                  </p>
                </div>

                <div className="footer-journey-grid">
                  {howTaskaraWorksSteps.map((step) => (
                    <article key={step.title} className="footer-journey-step">
                      <h4>{step.title}</h4>
                      <p>{step.description}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="footer-info-grid footer-info-grid-wide">
                <article className="footer-page-placeholder-card footer-info-card">
                  <p className="footer-page-section-label">Why It Matters</p>
                  <h3>A marketplace is more than listings</h3>
                  <p>
                    Taskara is built so that services, orders, messaging, reviews, notifications,
                    and disputes all connect together. That makes the platform feel like a real
                    service marketplace rather than a simple directory.
                  </p>
                </article>

                <article className="footer-page-placeholder-card footer-info-card">
                  <p className="footer-page-section-label">Core Signals</p>
                  <h3>What supports trust on Taskara</h3>
                  <ul className="footer-signal-list">
                    {howTaskaraWorksSignals.map((signal) => (
                      <li key={signal}>{signal}</li>
                    ))}
                  </ul>
                </article>
              </div>
            </>
          ) : (
            <div className="footer-page-placeholder-grid">
              <article className="footer-page-placeholder-card">
                <h3>Overview Block</h3>
                <p>Reserved for the main introduction and top-level explanation for this section.</p>
              </article>

              <article className="footer-page-placeholder-card">
                <h3>Details Block</h3>
                <p>
                  Reserved for policies, guidance, FAQs, resources, or long-form marketplace copy.
                </p>
              </article>

              <article className="footer-page-placeholder-card">
                <h3>Action Block</h3>
                <p>Reserved for links, calls to action, contact methods, or follow-up navigation.</p>
              </article>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FooterContentPage;
