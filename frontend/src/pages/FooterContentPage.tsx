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
            <p>
              This is the shell for the <strong>{activeItem.label}</strong> section. We can now build
              each footer topic one by one and load its actual content into this page.
            </p>
          </div>

          <div className="footer-page-placeholder-grid">
            <article className="footer-page-placeholder-card">
              <h3>Overview Block</h3>
              <p>Reserved for the main introduction and top-level explanation for this section.</p>
            </article>

            <article className="footer-page-placeholder-card">
              <h3>Details Block</h3>
              <p>Reserved for policies, guidance, FAQs, resources, or long-form marketplace copy.</p>
            </article>

            <article className="footer-page-placeholder-card">
              <h3>Action Block</h3>
              <p>Reserved for links, calls to action, contact methods, or follow-up navigation.</p>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FooterContentPage;
